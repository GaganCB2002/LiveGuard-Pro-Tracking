# PART 2: AI AGENT ENGINE

## What This Contains
- System metrics collector (CPU, RAM, Disk, Network, Processes)
- AI anomaly detection with trend analysis
- Predictive failure forecasting
- Security threat scanner (malware, intrusion, file integrity)
- Health report generator with resolutions

## Files
- `agent.py` - Complete AI agent (ONLY FILE YOU NEED)

## How to Run (Standalone Test)
```bash
cd part2_ai_agent
pip install psutil
python agent.py
```

## How to Connect to Other Parts

### Connect to Part 1 (Backend):
The backend imports and uses this agent:
```python
# In Part 1's app.py or integration file
from part2_ai_agent.agent import get_guardian

agent = get_guardian()
metrics = agent.collect_metrics()
analysis = agent.analyze_anomalies(metrics)
threats = agent.security_scan()
report = agent.generate_report()
```

### Connect to Part 4 (Config):
```python
from part4_config.settings import CustomConfig
from part2_ai_agent.agent import SystemGuardianAgent

agent = SystemGuardianAgent(config=CustomConfig())
```

## API Methods
| Method | Returns | Description |
|--------|---------|-------------|
| `collect_metrics()` | dict | All system metrics |
| `analyze_anomalies(metrics)` | dict | Alerts + predictions |
| `security_scan()` | list | Security threats |
| `generate_report()` | dict | Full health report |

## AI Features
- **Trend Analysis**: Linear regression on 60-sample windows
- **Failure Prediction**: Estimates minutes until critical threshold
- **Memory Leak Detection**: Identifies steady memory growth
- **Anomaly Scoring**: Confidence scores for all predictions

## Security Detection
- Cryptominer process identification
- C2 (Command & Control) communication detection
- Suspicious temp directory execution
- Critical file integrity monitoring
- Mass network connection detection
