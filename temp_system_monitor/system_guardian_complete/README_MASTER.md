# 🛡️ SYSTEM GUARDIAN - Complete Modular Project

## Project Structure (4 Parts)

```
system_guardian/
├── 📦 PART 1: Backend Core
│   ├── app.py                  # Flask server + WebSocket
│   └── README_PART1.md
│
├── 🤖 PART 2: AI Agent Engine
│   ├── agent.py                # Monitoring + Security + AI
│   └── README_PART2.md
│
├── 📊 PART 3: Frontend Dashboard
│   └── templates/
│       └── dashboard.html      # Complete HTML/CSS/JS UI
│   └── README_PART3.md
│
└── 🔧 PART 4: Integration & Config
    ├── main.py                 # MAIN ENTRY POINT
    ├── config.py               # Customizable settings
    ├── requirements.txt        # All dependencies
    ├── docker-compose.yml      # Docker deployment
    ├── Dockerfile              # Container build
    ├── setup.sh                # Linux/Mac installer
    ├── setup.bat               # Windows installer
    └── README_PART4.md
```

## How to Use This Project

### Method 1: Quick Start (Easiest)
1. Download all 4 parts
2. Place them in the same parent directory
3. Go to `part4_integration_config/`
4. Run: `python main.py`
5. Open: http://localhost:5000

### Method 2: Step-by-Step Integration
1. **Start with Part 2** (AI Agent) - Test standalone: `python agent.py`
2. **Add Part 1** (Backend) - Connects to Part 2
3. **Add Part 3** (Frontend) - Served by Part 1
4. **Use Part 4** (Integration) - Ties everything together

### Method 3: Docker (Production)
```bash
cd part4_integration_config
docker-compose up --build
```

## What Each Part Does

| Part | Role | Can Run Alone? |
|------|------|----------------|
| **Part 1** | Web server, API, WebSocket hub | Yes (API-only mode) |
| **Part 2** | Collects metrics, detects threats, predicts failures | Yes (CLI output) |
| **Part 3** | Visual dashboard, charts, alerts UI | Yes (shows "waiting") |
| **Part 4** | Connects all parts, config, deployment | No (needs all parts) |

## Download Instructions

1. Download each part ZIP below
2. Extract all to same folder
3. Follow Part 4's README for setup

## System Requirements

- **OS**: Linux, macOS, Windows
- **Python**: 3.8+
- **RAM**: 512MB minimum
- **Disk**: 100MB for code + logs
- **Network**: Port 5000 (configurable)

## Features Summary

✅ Real-time CPU/RAM/Disk/Network monitoring
✅ AI-powered failure prediction (trend analysis)
✅ Memory leak detection
✅ Malware/cryptominer detection
✅ Intrusion detection (C2 communication)
✅ File integrity monitoring
✅ Auto-quarantine of threats
✅ Interactive WebSocket dashboard
✅ REST API for all data
✅ Docker deployment ready
