# System Guardian Core

This directory contains the primary intelligence and backend services for the System Guardian platform.

## Modules
- `main.py`: The orchestrator that binds the AI Agent to the Flask Backend.
- `guardian_agent.py`: The "Brain" of the system. Handles metric collection, security scanning, and PDF generation.
- `backend.py`: High-performance SocketIO server for real-time telemetry streaming.
- `config.py`: Centralized configuration for hardware thresholds and employee identity metadata.

## Recent Updates
- Added **Battery Health** monitoring via WMI.
- Integrated **Windows Event Log** analysis for boot history.
- Implemented **Matplotlib** pie charts for resource distribution in PDF reports.
- Added persistent usage logging in `system_history.json`.
