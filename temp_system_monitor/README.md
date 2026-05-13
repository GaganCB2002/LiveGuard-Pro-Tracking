# 🛡️ System Guardian: Enterprise AI Security & Health Platform

System Guardian is an advanced, self-learning AI monitoring system designed for enterprise-grade security auditing and real-time system health telemetry. It provides deep insights into hardware performance, battery health, and potential malware injections, culminating in a professional PDF security audit.

## 🚀 Key Features

- **📊 Real-time Telemetry Dashboard**: Monitor CPU, RAM, and Battery levels with millisecond-accurate stream charts.
- **🔋 Advanced Battery Analytics**: Tracking of live battery levels and **Battery Health** (Capacity degradation) using Windows WMI.
- **🛡️ Security Threat Hunter**: Heuristic scanning for malware injections and system anomalies with automated 6-day scan cycles.
- **🕒 Comprehensive Usage History**: Persistence-layered tracking of system uptime and session history.
- **📑 Professional PDF Audits**: Generate high-fidelity security reports featuring:
    - **Resource Distribution Pie Charts** (Matplotlib integration).
    - **System Boot/Shutdown History** (Windows Event Log extraction).
    - **Malware Injection Details** (Path, Threat Name, Action Taken).
    - **Aggregate Health Scores**.

## 🛠️ Technology Stack

- **Backend**: Python 3.13+, Flask (API), Flask-SocketIO (Real-time events).
- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism UI), Javascript (ES6+), Chart.js (Telemetry visualization).
- **Agent Intelligence**: Psutil (Hardware metrics), WMI/PowerShell (System deep-query), FPDF (Report generation).
- **Data Visualization**: Matplotlib (Server-side charting).
- **Communication**: WebSockets (Bi-directional telemetry stream).

## 📂 Project Structure

```text
d:/New folder (17)/
├── system_guardian/            # Core Application Logic
│   ├── main.py                 # Entry point (Initializes Agent & Backend)
│   ├── guardian_agent.py       # AI Intelligence & Data Collection Logic
│   ├── backend.py              # Flask-SocketIO Server & API Routes
│   ├── config.py               # System & Employee Configuration
│   ├── requirements.txt        # Project Dependencies
│   ├── templates/              # Dashboard UI (dashboard.html)
│   ├── static/                 # CSS/JS Assets
│   └── system_history.json     # Persistent Usage Database
├── START_GUARDIAN.bat          # One-click Windows Launcher
└── README.md                   # Project Documentation
```

## 🏁 Getting Started

### 1. Prerequisites
- Python 3.13 or higher.
- Windows OS (for full WMI/Event Log features).

### 2. Installation
Install the required enterprise libraries:
```bash
pip install -r system_guardian/requirements.txt
```

### 3. Launching the Platform
You can launch the system using the provided batch script or manually:

**Via Launcher:**
Double-click `START_GUARDIAN.bat`.

**Via Terminal:**
```bash
cd system_guardian
python main.py
```

### 4. Access the Dashboard
Once live, navigate to:
**[http://localhost:5006](http://localhost:5006)**

## 🛡️ Security Audit & Reporting
To generate a professional health audit:
1. Navigate to the **System Settings** tab on the dashboard.
2. Click **Download Health Audit (PDF)**.
3. The system will perform a deep scan and generate a report named `System_Guardian_Security_Report.pdf` with all historical data.

---
**Confidential & Proprietary** | Developed for Advanced AI Security Auditing.
