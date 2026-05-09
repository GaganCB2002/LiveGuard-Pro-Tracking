# WorkSphere API Documentation

## Authentication
OAuth 2.0 / JWT based.

## REST Endpoints

### 1. Activity Tracking
- **POST `/api/v1/agent/activity`**
  - Sends telemetry data from the agent every **1 second**.
  - All data points are persisted locally in `.jsonl` format before transmission.
  - Payload:
    ```json
    {
      "timestamp": "ISO-8601",
      "app": "VS Code",
      "title": "main.js - WorkSphere",
      "metrics": {
        "keystrokeVelocity": 120,
        "mouseDistance": 450
      },
      "tabs": [{ "url": "...", "title": "..." }]
    }
    ```

### 2. Analytics
- **GET `/api/v1/analytics/productivity`**
  - Query params: `range=weekly|monthly`, `teamId`, `employeeId`.
- **GET `/api/v1/analytics/anomalies`**
  - Returns detected productivity drops.

### 3. Reports
- **GET `/api/v1/reports/daily`**
  - Export format: PDF/CSV.

## WebSocket (Socket.io)
Namespace: `/realtime`

### Server Emits
- `activity_update`: Live feed events.
- `efficiency_alert`: Real-time anomaly detection.

### Client Emits
- `join_team`: Subscribe to team-level events.
