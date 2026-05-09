# 🔧 WorkSphere: Backend & Reporting Engine

This directory contains the standalone reporting scripts and internal API documentation for the WorkSphere platform.

## 📂 Contents

- `report_engine.js`: The core logic for processing raw telemetry logs into structured markdown and HTML reports.
- `simulate_data.js`: A utility script for generating mock telemetry data for testing the dashboard and reporting engine.
- `API.md`: Documentation for the internal telemetry endpoints used by the monitoring agent.

## 🚀 Usage

### Generating a Daily Report
To manually trigger the report engine:
```bash
node report_engine.js
```

### Simulating Telemetry Data
To populate the dashboard with mock data for demonstration:
```bash
node simulate_data.js
```

## 📊 Scoring Logic
The reporting engine uses a weighted scoring system based on:
1. **Dwell Time**: Duration spent in a single window.
2. **Category Weight**: Pre-defined weights for different application types (e.g., Coding > Browsing).
3. **Inactivity Detection**: Filters out idle time where no keyboard/mouse input was detected.
