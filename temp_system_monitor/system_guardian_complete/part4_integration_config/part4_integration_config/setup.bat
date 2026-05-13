@echo off
REM ============================================================
REM SYSTEM GUARDIAN - WINDOWS SETUP
REM ============================================================

echo ============================================
echo   System Guardian - Windows Setup
echo ============================================

REM Check Python
python --version

REM Create virtual environment
echo [1/4] Creating virtual environment...
python -m venv venv

REM Activate
call venv\Scripts\activate

REM Upgrade pip
echo [2/4] Upgrading pip...
pip install --upgrade pip

REM Install requirements
echo [3/4] Installing dependencies...
pip install -r part4_integration_config\requirements.txt

REM Verify
echo [4/4] Verifying installation...
python -c "import flask; import flask_socketio; import psutil; print('All dependencies installed successfully')"

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo To start the system:
echo   venv\Scripts\activate
echo   python part4_integration_config\main.py
echo.
echo Then open: http://localhost:5000
echo ============================================
pause
