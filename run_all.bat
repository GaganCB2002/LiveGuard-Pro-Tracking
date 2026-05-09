@echo off
echo Starting WorkSphere Platform...

start "" "apps/marketing/index.html"
echo Marketing Website opened in browser.

cd apps/dashboard/web
start cmd /k "npm run dev"
echo Dashboard server starting at http://localhost:3000

cd ../../agent
echo Initializing Zero-Latency Tracking Agent...
start /min cmd /k "npm start"

echo.
echo ==========================================
echo WORKSPEERE PLATFORM READY
echo Dashboard: http://localhost:3000
echo Agent: Tracking Live (Minimized)
echo ==========================================
echo.
pause
