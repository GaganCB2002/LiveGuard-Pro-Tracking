# PART 3: FRONTEND DASHBOARD

## What This Contains
- Complete HTML/CSS/JS dashboard (single file)
- Real-time WebSocket connection to backend
- Interactive charts (Chart.js)
- Alert management UI
- Threat response buttons
- Responsive design (works on mobile)

## Files
- `templates/dashboard.html` - Complete dashboard (ONLY FILE YOU NEED)

## How to Use

### Option A: With Part 1 Backend (Recommended)
Place this folder as sibling to Part 1:
```
project/
├── part1_backend_core/
└── part3_frontend_dashboard/
    └── templates/
        └── dashboard.html
```
The backend auto-serves this file at `http://localhost:5000`

### Option B: Standalone (for development)
Open `templates/dashboard.html` directly in browser.
It will show "Waiting for connection..." until backend is running.

## Features
| Feature | Description |
|---------|-------------|
| Real-time Metrics | Updates every 2 seconds via WebSocket |
| Health Score | 0-100 score with color coding |
| Performance Charts | 5-minute rolling history |
| Alert System | CRITICAL/WARNING/PREDICTIVE levels |
| Threat Response | One-click quarantine buttons |
| Toast Notifications | Popup alerts for new events |
| Responsive | Works on desktop, tablet, mobile |

## WebSocket Events Used
| Event | Direction | Purpose |
|-------|-----------|---------|
| `system_update` | Server → Client | Full metrics package |
| `new_alert` | Server → Client | Individual alert |
| `new_threat` | Server → Client | Security threat |
| `start_monitoring` | Client → Server | Start monitoring |
| `run_security_scan` | Client → Server | Trigger scan |
| `request_report` | Client → Server | Get full report |

## Customization
Edit the CSS variables at the top of the `<style>` section:
```css
:root {
    --accent-blue: #3b82f6;    /* Change colors */
    --bg-primary: #0a0e1a;      /* Change background */
}
```
