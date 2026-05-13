#!/bin/bash
# ============================================================
# SYSTEM GUARDIAN - SETUP SCRIPT
# ============================================================
# Run this script to install all dependencies
# chmod +x setup.sh && ./setup.sh

echo "============================================"
echo "  System Guardian - Setup"
echo "============================================"

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "Python version: $PYTHON_VERSION"

# Create virtual environment
echo "[1/4] Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
echo "[2/4] Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "[3/4] Installing dependencies..."
pip install -r part4_integration_config/requirements.txt

# Verify installation
echo "[4/4] Verifying installation..."
python3 -c "import flask; import flask_socketio; import psutil; print('All dependencies installed successfully')"

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "============================================"
echo "To start the system:"
echo "  source venv/bin/activate"
echo "  python part4_integration_config/main.py"
echo ""
echo "Then open: http://localhost:5000"
echo "============================================"
