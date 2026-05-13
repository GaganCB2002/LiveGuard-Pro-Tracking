    def collect_metrics(self):
        """Collect all system metrics with safety fallbacks"""
        try:
            timestamp = datetime.now().isoformat()
            
            # CPU
            cpu_pct = psutil.cpu_percent(interval=None)
            
            # Memory
            mem = psutil.virtual_memory()
            
            # Disk
            disk = psutil.disk_usage('/')
            
            # Battery
            bat = psutil.sensors_battery()
            bat_data = None
            if bat:
                bat_data = {
                    'percent': bat.percent,
                    'power_plugged': bat.power_plugged,
                    'status': "Charging" if bat.power_plugged else "Discharging"
                }

            metrics = {
                'timestamp': timestamp,
                'system': {
                    'hostname': platform.node(),
                    'platform': platform.platform()
                },
                'cpu': {
                    'percent': round(cpu_pct, 2),
                    'cores': psutil.cpu_count(logical=False),
                    'threads': psutil.cpu_count(logical=True)
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
                'battery': bat_data,
                'network': {'bytes_sent': 0, 'bytes_recv': 0},
                'processes': {'count': 0, 'top': []}
            }
            
            # Add to history
            self.metrics_history.append(metrics)
            if len(self.metrics_history) > self.history_limit:
                self.metrics_history.pop(0)
                
            return metrics
        except Exception as e:
            print(f"[Agent] Metrics collection failed: {e}")
            return None
