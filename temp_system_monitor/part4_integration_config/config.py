"""
============================================================
CONFIGURATION FILE - Customize System Guardian Settings
============================================================
Edit this file to change thresholds, intervals, and behavior.
"""

class SystemConfig:
    """
    Custom configuration for System Guardian.
    Modify values below to adjust system behavior.
    """

    # ============================================================
    # ALERT THRESHOLDS (Percentage)
    # ============================================================
    CPU_CRITICAL = 90          # CPU % to trigger CRITICAL alert
    CPU_WARNING = 75           # CPU % to trigger WARNING alert
    RAM_CRITICAL = 92          # RAM % to trigger CRITICAL alert
    RAM_WARNING = 80           # RAM % to trigger WARNING alert
    DISK_CRITICAL = 90         # Disk % to trigger CRITICAL alert
    DISK_WARNING = 80          # Disk % to trigger WARNING alert
    TEMP_CRITICAL = 85         # Temperature °C to trigger alert

    # ============================================================
    # MONITORING SETTINGS
    # ============================================================
    HISTORY_SIZE = 300         # Number of samples to keep (5 min at 1/sec)
    TREND_WINDOW = 60          # Samples for trend calculation
    PREDICTION_HORIZON = 120   # Minutes ahead to predict
    MONITOR_INTERVAL = 2       # Seconds between updates

    # ============================================================
    # SECURITY SETTINGS
    # ============================================================
    SUSPICIOUS_PROCESS_NAMES = [
        'xmrig', 'minerd', 'cgminer', 'stratum', 'pool',
        'ncat', 'nc', 'meterpreter', 'mimikatz'
    ]

    CRITICAL_FILES = [
        'C:\\Windows\\System32\\drivers\\etc\\hosts',
        'C:\\Windows\\System32\\drivers\\etc\\networks',
        '/etc/passwd',
        '/etc/shadow',
        '/etc/hosts',
        '/etc/resolv.conf'
    ]

    TEMP_PATHS = [
        '/tmp/',
        '/var/tmp/',
        '\\Temp\\',
        '\\Windows\\Temp\\'
    ]

    CONNECTION_THRESHOLD = 50   # External connections to flag as suspicious

    # ============================================================
    # BACKEND SETTINGS
    # ============================================================
    HOST = '0.0.0.0'
    PORT = 5000
    DEBUG = False
    SECRET_KEY = 'system-guardian-secret-key-2026'
    MAX_ALERT_HISTORY = 1000

    # ============================================================
    # NOTIFICATION SETTINGS
    # ============================================================
    ENABLE_EMAIL_ALERTS = False
    EMAIL_SMTP = 'smtp.gmail.com'
    EMAIL_PORT = 587
    EMAIL_USER = ''
    EMAIL_PASS = ''
    IT_EMAIL = 'it@company.com'

    ENABLE_SMS_ALERTS = False
    SMS_API_KEY = ''
    SMS_TO_NUMBER = ''
