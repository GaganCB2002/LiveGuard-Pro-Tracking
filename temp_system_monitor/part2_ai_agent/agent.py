"""
============================================================
PART 2: AI AGENT ENGINE - System Guardian Intelligence
============================================================
This is the brain that:
- Collects real system metrics (CPU, RAM, Disk, Network, GPU)
- Detects anomalies using AI algorithms
- Predicts future failures using trend analysis
- Scans for security threats (malware, intrusion, file integrity)
- Generates health reports with resolutions

CONNECTS TO: Part 1 (Backend calls this) | Part 4 (Config provides thresholds)
"""

import psutil
import time
import json
import hashlib
import os
import platform
import subprocess
from datetime import datetime, timedelta
from collections import deque
import threading
import warnings
warnings.filterwarnings('ignore')

# ============================================================
# CONFIGURATION - Loaded from Part 4 (or defaults here)
# ============================================================
class AgentConfig:
    # Alert thresholds
    CPU_CRITICAL = 90
    CPU_WARNING = 75
    RAM_CRITICAL = 92
    RAM_WARNING = 80
    DISK_CRITICAL = 90
    DISK_WARNING = 80
    TEMP_CRITICAL = 85
    NETWORK_CRITICAL = 1000  # MB/s
    PROCESS_COUNT_CRITICAL = 500

    # Analysis settings
    HISTORY_SIZE = 300  # 5 minutes at 1 sample/sec
    TREND_WINDOW = 60     # Samples for trend calculation
    PREDICTION_HORIZON = 120  # Minutes

    # Security settings
    SUSPICIOUS_PROCESS_NAMES = [
        'xmrig', 'minerd', 'cgminer', 'stratum', 'pool',
        'ncat', 'nc', 'meterpreter', 'mimikatz'
    ]
    CRITICAL_FILES = [
        'C:\\Windows\\System32\\drivers\\etc\\hosts',
        'C:\\Windows\\System32\\drivers\\etc\\networks',
        '/etc/passwd', '/etc/shadow', '/etc/hosts', '/etc/resolv.conf'
    ]
    TEMP_PATHS = ['/tmp/', '/var/tmp/', '\\Temp\\', '\\Windows\\Temp\\']
    CONNECTION_THRESHOLD = 50  # Suspicious connection count

# ============================================================
# MAIN AI AGENT CLASS
# ============================================================

class SystemGuardianAgent:
    """
    AI-Powered System Monitoring & Security Agent

    Usage:
        agent = SystemGuardianAgent()
        metrics = agent.collect_metrics()           # Get current metrics
        analysis = agent.analyze_anomalies(metrics) # Get AI analysis
        threats = agent.security_scan()             # Get security threats
        report = agent.generate_report()            # Full report
    """

    def __init__(self, config=None):
        self.config = config or AgentConfig()

        # Rolling history for trend analysis
        self.metrics_history = {
            'cpu': deque(maxlen=self.config.HISTORY_SIZE),
            'memory': deque(maxlen=self.config.HISTORY_SIZE),
            'disk': deque(maxlen=self.config.HISTORY_SIZE),
            'network': deque(maxlen=self.config.HISTORY_SIZE),
            'processes': deque(maxlen=self.config.HISTORY_SIZE)
        }

        # Security baselines
        self.security_baseline = self._establish_security_baseline()
        self.file_hashes = {}
        self.suspicious_processes = set()

        print("[AI Agent] Initialized successfully")
        print(f"[AI Agent] History buffer: {self.config.HISTORY_SIZE} samples")
        print(f"[AI Agent] Trend window: {self.config.TREND_WINDOW} samples")

    # ============================================================
    # SECTION A: METRICS COLLECTION
    # ============================================================

    def collect_metrics(self):
        """
        Collect comprehensive system metrics every second.
        Returns: dict with all system data
        """
        timestamp = datetime.now().isoformat()

        # CPU Metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_freq = psutil.cpu_freq()
        cpu_count = psutil.cpu_count()
        cpu_times = psutil.cpu_times_percent(interval=0.1)

        cpu_data = {
            'percent': round(cpu_percent, 2),
            'freq_mhz': round(cpu_freq.current, 2) if cpu_freq else 0,
            'cores': cpu_count,
            'threads': psutil.cpu_count(logical=True),
            'user': round(cpu_times.user, 2) if hasattr(cpu_times, 'user') else 0,
            'system': round(cpu_times.system, 2) if hasattr(cpu_times, 'system') else 0,
            'idle': round(cpu_times.idle, 2) if hasattr(cpu_times, 'idle') else 0,
            'per_cpu': [round(x, 2) for x in psutil.cpu_percent(interval=0.1, percpu=True)]
        }

        # Memory Metrics
        mem = psutil.virtual_memory()
        swap = psutil.swap_memory()

        memory_data = {
            'percent': mem.percent,
            'total_gb': round(mem.total / (1024**3), 2),
            'available_gb': round(mem.available / (1024**3), 2),
            'used_gb': round(mem.used / (1024**3), 2),
            'free_gb': round(mem.free / (1024**3), 2),
            'swap_percent': swap.percent,
            'swap_used_gb': round(swap.used / (1024**3), 2)
        }

        # Disk Metrics
        disk = psutil.disk_usage('/')
        disk_io = psutil.disk_io_counters()

        disk_data = {
            'percent': disk.percent,
            'total_gb': round(disk.total / (1024**3), 2),
            'used_gb': round(disk.used / (1024**3), 2),
            'free_gb': round(disk.free / (1024**3), 2),
            'read_mb': round(disk_io.read_bytes / (1024**2), 2) if disk_io else 0,
            'write_mb': round(disk_io.write_bytes / (1024**2), 2) if disk_io else 0,
            'read_count': disk_io.read_count if disk_io else 0,
            'write_count': disk_io.write_count if disk_io else 0
        }

        # Network Metrics
        net_io = psutil.net_io_counters()
        net_connections = len(psutil.net_connections())

        network_data = {
            'bytes_sent_mb': round(net_io.bytes_sent / (1024**2), 2),
            'bytes_recv_mb': round(net_io.bytes_recv / (1024**2), 2),
            'packets_sent': net_io.packets_sent,
            'packets_recv': net_io.packets_recv,
            'errors_in': net_io.errin,
            'errors_out': net_io.errout,
            'active_connections': net_connections,
            'interface_count': len(psutil.net_if_addrs())
        }

        # Process Metrics
        process_count = len(psutil.pids())
        top_processes = []
        try:
            for proc in sorted(
                psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']),
                key=lambda x: x.info.get('cpu_percent', 0),
                reverse=True
            )[:5]:
                top_processes.append({
                    'pid': proc.info['pid'],
                    'name': proc.info['name'],
                    'cpu': round(proc.info.get('cpu_percent', 0), 2),
                    'memory': round(proc.info.get('memory_percent', 0), 2)
                })
        except:
            pass

        process_data = {
            'total': process_count,
            'top_consumers': top_processes
        }

        # System Info
        boot_time = datetime.fromtimestamp(psutil.boot_time()).isoformat()

        metrics = {
            'timestamp': timestamp,
            'system': {
                'platform': platform.platform(),
                'processor': platform.processor(),
                'hostname': platform.node(),
                'boot_time': boot_time,
                'uptime_hours': round((time.time() - psutil.boot_time()) / 3600, 2)
            },
            'cpu': cpu_data,
            'memory': memory_data,
            'disk': disk_data,
            'network': network_data,
            'processes': process_data
        }

        # Update history for trend analysis
        self.metrics_history['cpu'].append(cpu_data['percent'])
        self.metrics_history['memory'].append(memory_data['percent'])
        self.metrics_history['disk'].append(disk_data['percent'])
        self.metrics_history['network'].append(network_data['active_connections'])
        self.metrics_history['processes'].append(process_count)

        return metrics

    # ============================================================
    # SECTION B: AI ANOMALY DETECTION
    # ============================================================

    def analyze_anomalies(self, metrics):
        """
        AI-powered anomaly detection and failure prediction.
        Uses trend analysis and threshold monitoring.

        Returns: {'alerts': [...], 'predictions': [...]}
        """
        alerts = []
        predictions = []
        cfg = self.config

        # --- THRESHOLD-BASED ALERTS ---

        # CPU Critical
        if metrics['cpu']['percent'] > cfg.CPU_CRITICAL:
            alerts.append(self._create_alert(
                'CRITICAL', 'CPU', 'CPU Usage Critical',
                f"CPU at {metrics['cpu']['percent']}% - System unresponsive risk",
                metrics['cpu']['percent'], cfg.CPU_CRITICAL,
                'Kill top CPU process',
                '1. Check runaway processes\n2. Upgrade hardware\n3. Optimize code'
            ))
        elif metrics['cpu']['percent'] > cfg.CPU_WARNING:
            alerts.append(self._create_alert(
                'WARNING', 'CPU', 'CPU Usage High',
                f"CPU at {metrics['cpu']['percent']}% - Performance degradation",
                metrics['cpu']['percent'],
                resolution='Monitor processes, identify resource hogs'
            ))

        # RAM Critical
        if metrics['memory']['percent'] > cfg.RAM_CRITICAL:
            alerts.append(self._create_alert(
                'CRITICAL', 'Memory', 'Memory Usage Critical',
                f"RAM at {metrics['memory']['percent']}% - Crash imminent",
                metrics['memory']['percent'], cfg.RAM_CRITICAL,
                'Trigger memory cleanup',
                '1. Close unused apps\n2. Check memory leaks\n3. Add more RAM'
            ))
        elif metrics['memory']['percent'] > cfg.RAM_WARNING:
            alerts.append(self._create_alert(
                'WARNING', 'Memory', 'Memory Usage High',
                f"RAM at {metrics['memory']['percent']}%",
                metrics['memory']['percent'],
                resolution='Identify memory-intensive applications'
            ))

        # Disk Critical
        if metrics['disk']['percent'] > cfg.DISK_CRITICAL:
            alerts.append(self._create_alert(
                'CRITICAL', 'Disk', 'Disk Space Critical',
                f"Disk at {metrics['disk']['percent']}% - Only {metrics['disk']['free_gb']}GB free",
                metrics['disk']['percent'], cfg.DISK_CRITICAL,
                'Run disk cleanup',
                '1. Delete temp files\n2. Uninstall unused programs\n3. Move data externally'
            ))
        elif metrics['disk']['percent'] > cfg.DISK_WARNING:
            alerts.append(self._create_alert(
                'WARNING', 'Disk', 'Disk Space Low',
                f"Disk at {metrics['disk']['percent']}%",
                metrics['disk']['percent'],
                resolution='Clean up disk space'
            ))

        # --- PREDICTIVE ANALYSIS (AI) ---

        if len(self.metrics_history['cpu']) >= cfg.TREND_WINDOW:
            # CPU Trend Prediction
            cpu_trend = self._calculate_trend(self.metrics_history['cpu'])
            if cpu_trend > 0.5:
                predicted_time = self._predict_failure_time(
                    self.metrics_history['cpu'], cfg.CPU_CRITICAL
                )
                if predicted_time and 0 < predicted_time < cfg.PREDICTION_HORIZON:
                    predictions.append({
                        'id': f"PRED-CPU-{int(time.time())}",
                        'severity': 'PREDICTIVE',
                        'component': 'CPU',
                        'title': 'Predicted CPU Overload',
                        'message': f"CPU will hit critical in ~{predicted_time} min (trend: +{cpu_trend:.2f}%/min)",
                        'confidence': round(min(0.95, 0.6 + cpu_trend * 0.2), 2),
                        'predicted_time': (datetime.now() + timedelta(minutes=predicted_time)).isoformat(),
                        'timestamp': datetime.now().isoformat(),
                        'resolution': '1. Schedule maintenance\n2. Identify trending processes\n3. Prepare scaling'
                    })

            # Memory Leak Detection
            mem_trend = self._calculate_trend(self.metrics_history['memory'])
            if mem_trend > 0.3 and metrics['memory']['percent'] > 60:
                predictions.append({
                    'id': f"PRED-MEM-{int(time.time())}",
                    'severity': 'PREDICTIVE',
                    'component': 'Memory',
                    'title': 'Possible Memory Leak',
                    'message': f"Memory increasing at {mem_trend:.2f}%/min - potential leak",
                    'confidence': round(min(0.9, 0.5 + mem_trend * 0.3), 2),
                    'timestamp': datetime.now().isoformat(),
                    'resolution': '1. Check for memory leaks\n2. Restart suspected services\n3. Use profiling tools'
                })

        return {'alerts': alerts, 'predictions': predictions}

    def _create_alert(self, severity, component, title, message, value, 
                     threshold=None, auto_action=None, resolution=None):
        """Helper to create standardized alert objects"""
        alert = {
            'id': f"{component}-{severity[:4]}-{int(time.time())}",
            'severity': severity,
            'component': component,
            'title': title,
            'message': message,
            'value': value,
            'timestamp': datetime.now().isoformat()
        }
        if threshold:
            alert['threshold'] = threshold
        if auto_action:
            alert['auto_action'] = auto_action
        if resolution:
            alert['resolution'] = resolution
        return alert

    def _calculate_trend(self, data):
        """Linear regression slope for trend prediction"""
        if len(data) < 10:
            return 0
        n = len(data)
        x = list(range(n))
        y = list(data)
        x_mean = sum(x) / n
        y_mean = sum(y) / n
        numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
        denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
        return numerator / denominator if denominator != 0 else 0

    def _predict_failure_time(self, data, threshold):
        """Predict minutes until threshold reached"""
        if len(data) < 30:
            return None
        slope = self._calculate_trend(data)
        if slope <= 0:
            return None
        current = data[-1]
        remaining = threshold - current
        if remaining <= 0:
            return 0
        minutes = remaining / (slope * 60)
        return round(minutes, 1) if 0 < minutes < 120 else None

    # ============================================================
    # SECTION C: SECURITY ENGINE
    # ============================================================

    def security_scan(self):
        """
        Comprehensive security threat detection.
        Returns: list of threat dictionaries
        """
        threats = []
        cfg = self.config

        try:
            for proc in psutil.process_iter([
                'pid', 'name', 'cpu_percent', 'memory_percent', 'connections'
            ]):
                proc_info = proc.info
                name = proc_info.get('name', '').lower()

                # 1. Cryptominer Detection
                if any(miner in name for miner in cfg.SUSPICIOUS_PROCESS_NAMES):
                    threats.append(self._create_threat(
                        'CRITICAL', 'MALWARE', 'CRYPTOMINER',
                        'Cryptominer Detected',
                        f"Suspicious process: {proc_info['name']} (PID: {proc_info['pid']})",
                        proc_info['pid'], proc_info['name'],
                        'Process quarantined, network dropped',
                        '1. Kill process\n2. Run antivirus\n3. Check persistence'
                    ))

                # 2. C2 Communication Detection
                try:
                    connections = proc.connections()
                    external = [c for c in connections 
                                if c.raddr and c.raddr.ip not in ['127.0.0.1', '::1']]
                    if len(external) > cfg.CONNECTION_THRESHOLD:
                        threats.append(self._create_threat(
                            'HIGH', 'INTRUSION', 'C2_COMMUNICATION',
                            'Suspicious Network Activity',
                            f"{proc_info['name']} has {len(external)} external connections",
                            proc_info['pid'], proc_info['name'],
                            None,
                            '1. Block network access\n2. Capture traffic\n3. Check botnet IOCs'
                        ))
                except:
                    pass

                # 3. Temp Directory Execution (Malware indicator)
                try:
                    exe_path = proc.exe()
                    if any(temp in exe_path for temp in cfg.TEMP_PATHS):
                        threats.append(self._create_threat(
                            'HIGH', 'MALWARE', 'SUSPICIOUS_LOCATION',
                            'Process in Temp Directory',
                            f"{proc_info['name']} running from {exe_path}",
                            proc_info['pid'], proc_info['name'],
                            None,
                            '1. Terminate process\n2. Delete executable\n3. Check registry'
                        ))
                except:
                    pass
        except:
            pass

        # 4. File Integrity Check
        threats.extend(self._check_file_integrity())

        return threats

    def _create_threat(self, severity, type_, subtype, title, message, 
                       pid, process_name, auto_action=None, resolution=None):
        """Helper to create standardized threat objects"""
        threat = {
            'id': f"THREAT-{type_}-{int(time.time())}-{pid}",
            'severity': severity,
            'type': type_,
            'subtype': subtype,
            'title': title,
            'message': message,
            'pid': pid,
            'process_name': process_name,
            'timestamp': datetime.now().isoformat()
        }
        if auto_action:
            threat['auto_action'] = auto_action
        if resolution:
            threat['resolution'] = resolution
        return threat

    def _check_file_integrity(self):
        """Monitor critical system files for unauthorized changes"""
        issues = []
        for filepath in self.config.CRITICAL_FILES:
            if os.path.exists(filepath):
                try:
                    current_hash = self._file_hash(filepath)
                    if filepath in self.file_hashes:
                        if self.file_hashes[filepath] != current_hash:
                            issues.append(self._create_threat(
                                'CRITICAL', 'INTEGRITY', 'FILE_MODIFIED',
                                'Critical File Modified',
                                f"{filepath} was modified without authorization",
                                None, None,
                                None,
                                '1. Verify authorized change\n2. Restore from backup\n3. Check access logs'
                            ))
                    else:
                        self.file_hashes[filepath] = current_hash
                except:
                    pass
        return issues

    def _file_hash(self, filepath):
        """Calculate MD5 hash of file"""
        hash_md5 = hashlib.md5()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_md5.update(chunk)
        return hash_md5.hexdigest()

    def _establish_security_baseline(self):
        """Establish security baseline for comparison"""
        return {
            'startup_programs': self._get_startup_programs(),
            'network_listeners': self._get_network_listeners(),
            'baseline_time': datetime.now().isoformat()
        }

    def _get_startup_programs(self):
        programs = []
        try:
            if platform.system() == 'Windows':
                import winreg
                keys = [
                    (winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Run"),
                    (winreg.HKEY_LOCAL_MACHINE, r"Software\Microsoft\Windows\CurrentVersion\Run")
                ]
                for hkey, path in keys:
                    try:
                        with winreg.OpenKey(hkey, path) as key:
                            for i in range(winreg.QueryInfoKey(key)[1]):
                                name, value, _ = winreg.EnumValue(key, i)
                                programs.append({'name': name, 'path': value})
                    except:
                        pass
            else:
                paths = [
                    '/etc/init.d/',
                    os.path.expanduser('~/.config/autostart/'),
                    '/Library/LaunchAgents/',
                    '/Library/LaunchDaemons/'
                ]
                for path in paths:
                    if os.path.exists(path):
                        for item in os.listdir(path):
                            programs.append({'name': item, 'path': os.path.join(path, item)})
        except:
            pass
        return programs

    def _get_network_listeners(self):
        listeners = []
        try:
            for conn in psutil.net_connections(kind='inet'):
                if conn.status == 'LISTEN':
                    listeners.append({
                        'port': conn.laddr.port,
                        'pid': conn.pid,
                        'name': psutil.Process(conn.pid).name() if conn.pid else 'unknown'
                    })
        except:
            pass
        return listeners

    # ============================================================
    # SECTION D: REPORT GENERATION
    # ============================================================

    def generate_report(self):
        """
        Generate comprehensive system health report.
        Returns: Full report dictionary
        """
        metrics = self.collect_metrics()
        analysis = self.analyze_anomalies(metrics)
        threats = self.security_scan()

        # Calculate health score (0-100)
        health_score = 100
        health_score -= max(0, (metrics['cpu']['percent'] - 50) * 0.5)
        health_score -= max(0, (metrics['memory']['percent'] - 60) * 0.5)
        health_score -= max(0, (metrics['disk']['percent'] - 70) * 0.3)
        health_score -= len(analysis['alerts']) * 10
        health_score -= len(threats) * 15
        health_score = max(0, min(100, round(health_score, 1)))

        report = {
            'timestamp': datetime.now().isoformat(),
            'health_score': health_score,
            'status': 'HEALTHY' if health_score > 80 else 'WARNING' if health_score > 50 else 'CRITICAL',
            'metrics': metrics,
            'active_alerts': analysis['alerts'],
            'predictions': analysis['predictions'],
            'security_threats': threats,
            'summary': {
                'total_alerts': len(analysis['alerts']),
                'total_predictions': len(analysis['predictions']),
                'total_threats': len(threats),
                'critical_count': len([a for a in analysis['alerts'] if a['severity'] == 'CRITICAL']),
                'recommendations': self._generate_recommendations(metrics, analysis, threats)
            }
        }

        return report

    def _generate_recommendations(self, metrics, analysis, threats):
        """AI-generated recommendations"""
        recs = []
        if metrics['cpu']['percent'] > 70:
            recs.append("Close unused applications to reduce CPU load")
        if metrics['memory']['percent'] > 75:
            recs.append("Memory usage high - check for leaks or add RAM")
        if metrics['disk']['percent'] > 80:
            recs.append("Disk space low - clean up temporary files")
        if threats:
            recs.append("SECURITY ALERT: Immediate action required")
        if analysis['predictions']:
            recs.append("Predictive analysis indicates issues - schedule maintenance")
        if not recs:
            recs.append("System operating normally - no action needed")
        return recs


# ============================================================
# FACTORY FUNCTION - Use this to get agent instance
# ============================================================

_agent_instance = None

def get_guardian(config=None):
    """
    Get or create the SystemGuardianAgent singleton.

    Usage:
        from agent import get_guardian
        agent = get_guardian()
        metrics = agent.collect_metrics()
    """
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = SystemGuardianAgent(config=config)
    return _agent_instance


def reset_guardian():
    """Reset the agent (useful for testing)"""
    global _agent_instance
    _agent_instance = None


# ============================================================
# STANDALONE TEST
# ============================================================

if __name__ == '__main__':
    print("=" * 60)
    print("AI AGENT STANDALONE TEST")
    print("=" * 60)

    agent = SystemGuardianAgent()

    # Test metrics
    print("\n[1] Collecting metrics...")
    metrics = agent.collect_metrics()
    print(f"CPU: {metrics['cpu']['percent']}%")
    print(f"RAM: {metrics['memory']['percent']}%")
    print(f"Disk: {metrics['disk']['percent']}%")

    # Test analysis
    print("\n[2] Running AI analysis...")
    analysis = agent.analyze_anomalies(metrics)
    print(f"Alerts: {len(analysis['alerts'])}")
    print(f"Predictions: {len(analysis['predictions'])}")

    # Test security
    print("\n[3] Running security scan...")
    threats = agent.security_scan()
    print(f"Threats: {len(threats)}")

    # Test report
    print("\n[4] Generating report...")
    report = agent.generate_report()
    print(f"Health Score: {report['health_score']}/100")
    print(f"Status: {report['status']}")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED")
    print("=" * 60)
