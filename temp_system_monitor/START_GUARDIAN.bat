@echo off
title SYSTEM GUARDIAN - AI LAUNCHER
color 0A
mode con: cols=80 lines=25

echo ============================================================
echo           SYSTEM GUARDIAN - ARTIFICIAL INTELLIGENCE
echo ============================================================
echo.
echo [1/3] Initializing System Environment...
cd /d "%~dp0system_guardian"

echo [2/3] Cleaning Legacy Processes...
taskkill /f /im python.exe >nul 2>&1

echo [3/3] Launching Deep Intelligence Core...
echo.
echo ------------------------------------------------------------
echo Dashboard will be available at: http://localhost:5006
echo ------------------------------------------------------------
echo.

start "" "http://localhost:5006"
python main.py

pause
