# 🕵️ WorkSphere: Monitoring Agent

The WorkSphere Agent is a high-performance background process that captures real-time workstation telemetry.

## 🛠️ Tech Stack
- **Electron**: Main process wrapper.
- **active-win**: Native binding for active window tracking.
- **screenshot-desktop**: (Optional) Captures visual context for audit trails.
- **fs/promises**: Optimized JSONL streaming for data durability.

## ⚡ Core Features
- **Stealth Monitoring**: Runs as a background service with a minimal memory footprint.
- **Dual-Engine Fallback**: Uses native bindings primarily, with a secondary PowerShell fallback for robust tracking.
- **Transition Detection**: Records every application switch with microsecond-accurate timestamps.
- **Heartbeat System**: Regularly logs "Still Active" signals to confirm system uptime.

## 🚀 Running Independently
While typically launched via the root `run_all.bat`, the agent can be started manually:
```bash
npm start
```

## 💾 Data Storage
All telemetry is saved to `activity_log.jsonl` in this directory. This file uses the JSON Lines format for maximum compatibility with big-data processing tools and stream-based readers.
