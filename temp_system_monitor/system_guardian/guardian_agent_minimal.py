    def __init__(self, config=None):
        self.config = config or AgentConfig()
        self.metrics_history = {
            'cpu': deque(maxlen=self.config.HISTORY_SIZE),
            'memory': deque(maxlen=self.config.HISTORY_SIZE),
            'disk': deque(maxlen=self.config.HISTORY_SIZE)
        }
        # Pre-cache platform info
        self.hostname = platform.node()
        self.platform_info = platform.platform()
        print("[AI Agent] Initialized")

    def collect_metrics(self):
        try:
            # ONLY PSUTIL CALLS
            cpu_pct = psutil.cpu_percent()
            mem = psutil.virtual_memory()
            disk = psutil.disk_usage('C:\\' if platform.system() == 'Windows' else '/')
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'system': {
                    'hostname': self.hostname,
                    'platform': self.platform_info
                },
                'cpu': {
                    'percent': round(cpu_pct, 2),
                    'cores': 0, # skip for speed
                    'threads': 0
                },
                'memory': {
                    'percent': mem.percent,
                    'used_gb': round(mem.used / (1024**3), 2),
                    'total_gb': round(mem.total / (1024**3), 2)
                },
                'disk': {
                    'percent': disk.percent,
                    'free_gb': round(disk.free / (1024**3), 2)
                },
                'battery': None, # skip for speed
                'processes': {'total': 0}
            }
            return metrics
        except Exception as e:
            return None
