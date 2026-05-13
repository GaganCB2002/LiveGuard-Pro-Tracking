# PART 1: BACKEND CORE

## What This Contains
- Flask web server
- REST API endpoints
- WebSocket real-time communication
- Background monitoring thread
- Alert history management

## Files
- `app.py` - Main server file (ONLY FILE YOU NEED)

## How to Run (Standalone Test)
```bash
cd part1_backend_core
pip install flask flask-socketio
python app.py
```
Then open http://localhost:5000

## How to Connect to Other Parts

### Connect Part 2 (AI Agent):
In your main integration file:
```python
from part1_backend_core.app import initialize_backend
from part2_ai_agent.agent import get_guardian

agent = get_guardian()
app, socketio = initialize_backend(agent_module=agent)
socketio.run(app, host='0.0.0.0', port=5000)
```

### Connect Part 3 (Frontend):
The backend automatically serves files from:
- `../part3_frontend_dashboard/templates/dashboard.html`
- `../part3_frontend_dashboard/static/`

Just place Part 3 in the correct relative location.

## API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Dashboard |
| `/api/status` | GET | Server status |
| `/api/metrics` | GET | Current metrics |
| `/api/report` | GET | Full report |
| `/api/alerts` | GET | Alert history |
| `/api/threats` | GET | Security threats |
| `/api/predictions` | GET | Predictions |

## WebSocket Events
| Event | Direction | Data |
|-------|-----------|------|
| `system_update` | Server → Client | Full metrics + alerts |
| `new_alert` | Server → Client | Single alert |
| `new_threat` | Server → Client | Single threat |
| `start_monitoring` | Client → Server | Command |
| `run_security_scan` | Client → Server | Command |
