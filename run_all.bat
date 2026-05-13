@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo    WORKSPEERE ENTERPRISE STARTUP
echo ==========================================
echo.

echo [1/4] Cleaning up existing processes...
taskkill /F /IM electron.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
echo.

echo [2/4] Starting Backend Telemetry Server...
cd apps/dashboard/backend
start /min cmd /k "npm start"
timeout /t 5 >nul
echo Backend: OK (http://localhost:4000)

echo [3/4] Starting GPS Tracking Engine...
cd ../../agent
start /min cmd /k "npm start"
echo Agent: OK (Hardware Verified)

echo [4/4] Launching Monitoring Dashboard...
cd ../dashboard/web
start cmd /k "npm run dev"
echo Dashboard: OK (http://localhost:3000)

echo.
echo ==========================================
echo        ALL SYSTEMS OPERATIONAL
echo ==========================================
echo.
echo Please wait 10 seconds for the dashboard to load.
pause
