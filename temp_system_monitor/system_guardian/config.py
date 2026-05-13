"""
============================================================
CONFIGURATION - System Guardian Settings
============================================================
"""

import os
import platform

class Config:
    # --- Employee Details ---
    EMPLOYEE_NAME = os.getlogin() if hasattr(os, 'getlogin') else "System User"
    EMPLOYEE_EMAIL = f"{EMPLOYEE_NAME.lower().replace(' ', '.')}@local"
    EMPLOYEE_ID = platform.node()
    DEPARTMENT = "System Usage"
    
    # --- System Settings ---
    PORT = 5006
    SCAN_INTERVAL_DAYS = 6  # Automatic scan every 6 days
    
    # --- Thresholds ---
    CPU_CRITICAL = 90
    RAM_CRITICAL = 92
    DISK_CRITICAL = 90
    
    # --- Persistence ---
    BASELINE_FILE = "ai_baseline.json"
    LOG_FILE = "system_guardian.log"
