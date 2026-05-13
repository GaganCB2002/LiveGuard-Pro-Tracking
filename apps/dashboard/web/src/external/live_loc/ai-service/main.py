from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
import json
import redis
import psycopg2
from psycopg2.extras import RealDictCursor
import os

app = FastAPI(title="LiveGuard AI Service", version="1.0.0")

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

def get_db():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "liveguard"),
        user=os.getenv("DB_USER", "liveguard"),
        password=os.getenv("DB_PASS", "liveguard123"),
        cursor_factory=RealDictCursor
    )

class GpsPoint(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = 0
    recorded_at: datetime

class RouteAnalysisRequest(BaseModel):
    user_id: str
    points: List[GpsPoint]
    device_id: str

class AnomalyResult(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    anomaly_type: Optional[str]
    confidence: float
    details: Dict[str, Any]

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-service"}

@app.post("/analyze/route", response_model=AnomalyResult)
async def analyze_route(request: RouteAnalysisRequest):
    if len(request.points) < 3:
        return AnomalyResult(is_anomaly=False, anomaly_score=0.0, anomaly_type=None, confidence=0.0, details={"message": "Insufficient data"})

    speeds = [p.speed or 0 for p in request.points]
    latitudes = [p.latitude for p in request.points]
    longitudes = [p.longitude for p in request.points]

    avg_speed = np.mean(speeds)
    max_speed = np.max(speeds)
    speed_variance = np.var(speeds)

    total_distance = 0
    for i in range(1, len(request.points)):
        lat1, lon1 = np.radians(request.points[i-1].latitude), np.radians(request.points[i-1].longitude)
        lat2, lon2 = np.radians(request.points[i].latitude), np.radians(request.points[i].longitude)
        dlat, dlon = lat2 - lat1, lon2 - lon1
        a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
        c = 2 * np.arcsin(np.sqrt(a))
        total_distance += 6371 * c

    time_span = (request.points[-1].recorded_at - request.points[0].recorded_at).total_seconds() / 3600
    anomalies = []
    confidence = 0.0

    if max_speed > 200:
        anomalies.append("excessive_speed")
        confidence += 0.3
    if time_span > 0 and total_distance / time_span > 300:
        anomalies.append("impossible_movement")
        confidence += 0.4
    if max_speed == 0 and time_span > 2:
        anomalies.append("extended_stationary")
        confidence += 0.15

    coords = np.array([[p.latitude, p.longitude] for p in request.points])
    if len(coords) > 5:
        clustering = DBSCAN(eps=0.001, min_samples=3).fit(coords)
        n_clusters = len(set(clustering.labels_)) - (1 if -1 in clustering.labels_ else 0)
        if n_clusters > 5:
            anomalies.append("erratic_movement")
            confidence += 0.15

    return AnomalyResult(
        is_anomaly=len(anomalies) > 0,
        anomaly_score=min(confidence, 1.0),
        anomaly_type=anomalies[0] if anomalies else None,
        confidence=min(confidence, 1.0),
        details={
            "anomalies_detected": anomalies,
            "avg_speed_kmh": round(float(avg_speed), 2),
            "max_speed_kmh": round(float(max_speed), 2),
            "total_distance_km": round(float(total_distance), 2),
            "time_span_hours": round(float(time_span), 2),
            "num_points": len(request.points)
        }
    )

@app.post("/predict/route")
async def predict_frequent_route(user_id: str, days: int = 30):
    cache_key = f"route_prediction:{user_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    conn = get_db()
    try:
        with conn.cursor() as cur:
            sql = """
                SELECT latitude, longitude, EXTRACT(DOW FROM recorded_at) as dow,
                       EXTRACT(HOUR FROM recorded_at) as hour
                FROM gps_locations
                WHERE user_id = %s
                AND recorded_at >= NOW() - INTERVAL '%s days'
                ORDER BY recorded_at
            """
            cur.execute(sql, (user_id, days))
            points = cur.fetchall()
            if len(points) < 10:
                return {"predictions": [], "confidence": 0, "message": "Insufficient data"}

            coords = np.array([[p["latitude"], p["longitude"]] for p in points])
            clustering = DBSCAN(eps=0.005, min_samples=5).fit(coords)
            labels = clustering.labels_
            clusters = {}
            for i, label in enumerate(labels):
                if label == -1:
                    continue
                if label not in clusters:
                    clusters[label] = []
                clusters[label].append(points[i])

            frequent_locations = []
            for label, cluster_points in sorted(clusters.items(), key=lambda x: len(x[1]), reverse=True)[:5]:
                avg_lat = np.mean([p["latitude"] for p in cluster_points])
                avg_lng = np.mean([p["longitude"] for p in cluster_points])
                hours = [p["hour"] for p in cluster_points]
                common_hour = max(set(hours), key=hours.count) if hours else None
                frequent_locations.append({
                    "cluster_id": int(label),
                    "latitude": round(float(avg_lat), 6),
                    "longitude": round(float(avg_lng), 6),
                    "visit_count": len(cluster_points),
                    "common_hour": int(common_hour) if common_hour is not None else None,
                    "type": "work" if 9 <= (common_hour or 0) <= 18 else "home"
                })

            result = {"predictions": frequent_locations, "confidence": min(len(points) / 1000, 1.0), "analysis_period_days": days}
            redis_client.setex(cache_key, 3600, json.dumps(result))
            return result
    finally:
        conn.close()

@app.post("/detect/geofence-violation")
async def detect_geofence_violation(user_id: str, latitude: float, longitude: float):
    conn = get_db()
    try:
        with conn.cursor() as cur:
            sql = """
                SELECT g.id, g.name, g.radius_meters, g.center_lat, g.center_lng,
                       ST_Distance(
                           ST_SetSRID(ST_MakePoint(%s, %s), 4326)::geography,
                           ST_SetSRID(ST_MakePoint(g.center_lng, g.center_lat), 4326)::geography
                       ) as distance
                FROM geofences g
                JOIN user_geofences ug ON g.id = ug.geofence_id
                WHERE ug.user_id = %s AND g.is_active = true
            """
            cur.execute(sql, (longitude, latitude, user_id))
            geofences = cur.fetchall()
            violations = []
            for geo in geofences:
                distance = geo["distance"]
                radius = geo["radius_meters"]
                if distance > radius:
                    violations.append({
                        "geofence_id": str(geo["id"]),
                        "geofence_name": geo["name"],
                        "distance_outside_meters": round(float(distance - radius), 2),
                        "violation_time": datetime.now().isoformat()
                    })
            return {"user_id": user_id, "is_violation": len(violations) > 0, "violations": violations, "total_geofences": len(geofences)}
    finally:
        conn.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
