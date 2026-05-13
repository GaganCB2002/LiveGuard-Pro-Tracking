# LiveGuard Pro

Full-Stack AI-Powered Live GPS Tracking and Device Monitoring System.

## Quick Start

```bash
# 1. Start all services
docker-compose up -d

# 2. Access dashboard at http://localhost
# 3. API available at http://localhost/api
# 4. AI Service at http://localhost/ai
```

## Architecture

- **Backend**: Spring Boot 3.2 + PostgreSQL/PostGIS + Redis + Kafka
- **Frontend**: React 18 + Tailwind CSS + Leaflet Maps + WebSocket
- **Mobile**: Flutter + GPS foreground service + Firebase
- **Desktop**: Electron + system monitoring agent
- **AI**: Python FastAPI + scikit-learn anomaly detection

## Features

- Real-time GPS tracking (3-5 second updates)
- Multi-user concurrent tracking with WebSocket
- Windows laptop monitoring (screenshots, activity, system stats)
- Android mobile tracking with SOS alerts
- AI-powered anomaly detection and productivity analytics
- Geofence alerts and route playback
- Role-based access control (Admin/Manager/User)
- JWT authentication with refresh tokens
