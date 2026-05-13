"""
============================================================
PART 4: INTEGRATION & CONFIG
============================================================
This is the MAIN ENTRY POINT that connects all parts together.

HOW TO USE:
1. Place all 4 parts in the same parent directory
2. Run: python main.py
3. Open browser to http://localhost:5000

DIRECTORY STRUCTURE:
project/
├── main.py                          <- RUN THIS FILE
├── requirements.txt
├── config.py
├── docker-compose.yml
├── setup.sh
├── part1_backend_core/
│   ├── app.py
│   └── README_PART1.md
├── part2_ai_agent/
│   ├── agent.py
│   └── README_PART2.md
├── part3_frontend_dashboard/
│   └── templates/
│       └── dashboard.html
└── part4_integration_config/
    ├── main.py
    ├── config.py
    ├── requirements.txt
    ├── docker-compose.yml
    ├── setup.sh
    └── README_PART4.md
"""

import sys
import os

# ============================================================
# STEP 1: Add all parts to Python path
# ============================================================
# Get the directory where main.py is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)

# Add all part directories to path
sys.path.insert(0, os.path.join(PARENT_DIR, 'part1_backend_core'))
sys.path.insert(0, os.path.join(PARENT_DIR, 'part2_ai_agent'))
sys.path.insert(0, os.path.join(PARENT_DIR, 'part3_frontend_dashboard'))

print("=" * 60)
print("SYSTEM GUARDIAN - FULL INTEGRATION")
print("=" * 60)
print(f"Base Directory: {BASE_DIR}")
print(f"Parent Directory: {PARENT_DIR}")
print("=" * 60)

# ============================================================
# STEP 2: Import all parts
# ============================================================
try:
    from app import initialize_backend, Config as BackendConfig
    print("✅ Part 1 (Backend Core) - LOADED")
except ImportError as e:
    print(f"❌ Part 1 (Backend Core) - FAILED: {e}")
    sys.exit(1)

try:
    from agent import get_guardian, SystemGuardianAgent
    print("✅ Part 2 (AI Agent) - LOADED")
except ImportError as e:
    print(f"❌ Part 2 (AI Agent) - FAILED: {e}")
    sys.exit(1)

try:
    # Verify Part 3 exists
    template_path = os.path.join(PARENT_DIR, 'part3_frontend_dashboard', 'templates', 'dashboard.html')
    if os.path.exists(template_path):
        print("✅ Part 3 (Frontend Dashboard) - FOUND")
    else:
        print(f"⚠️  Part 3 (Frontend Dashboard) - NOT FOUND at {template_path}")
except Exception as e:
    print(f"⚠️  Part 3 (Frontend Dashboard) - CHECK FAILED: {e}")

# ============================================================
# STEP 3: Load custom configuration (optional)
# ============================================================
try:
    from config import SystemConfig
    print("✅ Custom Configuration - LOADED")
    config = SystemConfig()
except ImportError:
    print("ℹ️  Using default configuration (config.py not found)")
    config = None

# ============================================================
# STEP 4: Initialize AI Agent (Part 2)
# ============================================================
print("\n[Initializing AI Agent...]")
agent = get_guardian(config=config)
print("✅ AI Agent initialized and ready")

# ============================================================
# STEP 5: Initialize Backend (Part 1) with Agent
# ============================================================
print("\n[Initializing Backend Server...]")
app, socketio = initialize_backend(agent_module=agent)

# ============================================================
# STEP 6: Start the complete system
# ============================================================
print("\n" + "=" * 60)
print("🚀 SYSTEM GUARDIAN IS FULLY OPERATIONAL")
print("=" * 60)
print("📊 Dashboard: http://localhost:5000")
print("📡 API: http://localhost:5000/api/")
print("🔌 WebSocket: ws://localhost:5000")
print("=" * 60)
print("\nPress CTRL+C to stop\n")

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)
