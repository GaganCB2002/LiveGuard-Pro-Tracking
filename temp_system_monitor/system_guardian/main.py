"""
============================================================
SYSTEM GUARDIAN - MAIN ENTRY POINT
============================================================
This file connects the AI Agent and the Backend Server.
"""

import os
import sys

# Add current directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

print("=" * 60)
print("SYSTEM GUARDIAN - CONSOLIDATED VERSION")
print("=" * 60)

try:
    from backend import initialize_backend
    print("[OK] Backend Module - LOADED")
except ImportError as e:
    print(f"[FAIL] Backend Module - FAILED: {e}")
    sys.exit(1)

try:
    from guardian_agent import get_guardian
    print("[OK] AI Agent Module - LOADED")
except ImportError as e:
    print(f"[FAIL] AI Agent Module - FAILED: {e}")
    sys.exit(1)

try:
    from config import Config
    print("[OK] Configuration - LOADED")
    config = Config()
except ImportError:
    print("[INFO]  Using default configuration")
    config = None

# Initialize AI Agent
print("\n[Initializing AI Agent...]")
agent = get_guardian(config=config)
print("[OK] AI Agent initialized")

# Initialize Backend
print("\n[Initializing Backend Server...]")
app, socketio = initialize_backend(agent_module=agent)

print("\n" + "=" * 60)
print("[LAUNCH] SYSTEM GUARDIAN IS LIVE")
print("=" * 60)
print(f"[STATS] Dashboard: http://localhost:5006")
print("=" * 60)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5006, debug=False, allow_unsafe_werkzeug=True)
