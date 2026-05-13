# PART 4: INTEGRATION & CONFIG

## What This Contains
- `main.py` - Main entry point that connects ALL parts
- `config.py` - Customizable settings and thresholds
- `requirements.txt` - All Python dependencies
- `docker-compose.yml` - Docker deployment configuration
- `Dockerfile` - Container build instructions
- `setup.sh` / `setup.bat` - One-click setup scripts

## Quick Start (3 Steps)

### Step 1: Arrange Files
Place all 4 parts in the same parent directory:
```
my_project/
├── part1_backend_core/
├── part2_ai_agent/
├── part3_frontend_dashboard/
└── part4_integration_config/   <-- RUN FROM HERE
```

### Step 2: Install Dependencies
```bash
cd part4_integration_config
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
pip install -r requirements.txt
```

### Step 3: Run the System
```bash
python main.py
```

Open browser: **http://localhost:5000**

## File Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `main.py` | Connects all parts | Never (auto-detects paths) |
| `config.py` | Settings & thresholds | To customize behavior |
| `requirements.txt` | Dependencies | To add new packages |
| `docker-compose.yml` | Docker orchestration | For production deploy |
| `Dockerfile` | Container image | For custom builds |
| `setup.sh` | Linux/Mac installer | To customize install |
| `setup.bat` | Windows installer | To customize install |

## Configuration Guide

Edit `config.py` to customize:

```python
# Make CPU alerts trigger at 80% instead of 90%
CPU_CRITICAL = 80

# Check every 5 seconds instead of 2
MONITOR_INTERVAL = 5

# Add your own suspicious process names
SUSPICIOUS_PROCESS_NAMES = ['xmrig', 'my_custom_malware']

# Enable email alerts
ENABLE_EMAIL_ALERTS = True
IT_EMAIL = 'security@company.com'
```

## Docker Deployment

```bash
cd part4_integration_config
docker-compose up --build
```

## Production Checklist

- [ ] Change `SECRET_KEY` in config.py
- [ ] Set `DEBUG = False`
- [ ] Configure email/SMS alerts
- [ ] Set up HTTPS reverse proxy (Nginx)
- [ ] Enable firewall rules
- [ ] Configure log rotation
- [ ] Set up monitoring for the monitor (!)

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Module not found" | Run from `part4_integration_config` directory |
| Port 5000 in use | Change `PORT` in config.py |
| Dashboard not loading | Check Part 3 is in correct location |
| No real-time updates | Check browser console for WebSocket errors |
| High CPU usage | Increase `MONITOR_INTERVAL` in config |
