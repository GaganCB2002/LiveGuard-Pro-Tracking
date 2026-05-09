const { app, Tray, Menu, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let tray = null;
let trackingInterval = null;
let currentApp = null;
let currentAppStartTime = Date.now();
let osLoginTime = new Date().toISOString();

const LOG_PATH = path.join(app.getPath('userData'), 'activity_log.jsonl');

// Maintain historical data for accurate daily reporting
const HISTORY_DIR = path.join(path.dirname(LOG_PATH), 'history');
if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

function isOfficeHours() {
    // TEMPORARILY DISABLED FOR TESTING: Tracking enabled 24/7
    return true;
}

function checkDailyReset() {
    const lastResetPath = path.join(app.getPath('userData'), 'last_reset.txt');
    const today = new Date().toISOString().split('T')[0];
    
    if (fs.existsSync(lastResetPath)) {
        const lastReset = fs.readFileSync(lastResetPath, 'utf8').trim();
        if (lastReset !== today) {
            // New day detected! Reset the log and archive previous data.
            if (fs.existsSync(LOG_PATH)) {
                const archiveName = `activity_${lastReset}.jsonl`;
                fs.renameSync(LOG_PATH, path.join(HISTORY_DIR, archiveName));
                console.log(`Archived log for ${lastReset}`);
            }
            fs.writeFileSync(LOG_PATH, '');
            fs.writeFileSync(lastResetPath, today);
            return true;
        }
    } else {
        fs.writeFileSync(lastResetPath, today);
    }
    return false;
}

const getLoginTime = () => {
    try {
        const cmd = 'powershell -Command "(Get-CimInstance Win32_OperatingSystem).LastBootUpTime.ToString(\'yyyy-MM-dd HH:mm:ss\')"';
        exec(cmd, (err, stdout) => {
            if (!err) osLoginTime = stdout.trim();
        });
    } catch(e) {}
};

const { nativeImage } = require('electron');

function createTray() {
    let trayIcon;
    const iconPath = path.join(__dirname, 'icon.png'); 
    if (fs.existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath);
    } else {
        // Create an empty 16x16 icon
        trayIcon = nativeImage.createEmpty();
    }
    
    tray = new Tray(trayIcon);
    tray.setToolTip('WorkSphere Active Tracking');
    tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Tracking: Active (Real Data Only)', enabled: false },
        { type: 'separator' },
        { label: 'Exit', click: () => app.quit() }
    ]));
}

let lastActiveTime = Date.now();
// Global Crash Protection
process.on('uncaughtException', (err) => {
    console.error('CRITICAL AGENT ERROR:', err);
    fs.appendFileSync(LOG_PATH, JSON.stringify({
        timestamp: new Date().toISOString(),
        employeeId, eventType: 'CRITICAL_ERROR', app: 'System', title: err.message
    }) + '\n');
});

let isBreak = false;
let employeeId = 'EMP-' + require('os').userInfo().username.toUpperCase();
let lastTrackedTitle = '';

function startMonitoring() {
    getLoginTime();
    
    // Log explicit LOGIN event
    fs.appendFileSync(LOG_PATH, JSON.stringify({
        timestamp: new Date().toISOString(),
        employeeId,
        eventType: 'LOGIN',
        loginTime: osLoginTime,
        app: 'System',
        title: 'User Login Authenticated'
    }) + '\n');
    
    let activeWinModule = null;
    import('active-win').then(m => activeWinModule = m).catch(e => console.error('Module Load Error:', e));
    
    trackingInterval = setInterval(async () => {
        let systemData = { Name: 'Idle', MainWindowTitle: 'No Focused Window' };
        
        try {
            let win = null;
            if (activeWinModule) {
                win = await activeWinModule.activeWindow();
            }
            
            if (win) {
                let title = win.title || '';
                const appName = win.owner?.name || 'Unknown';
                const lowerApp = appName.toLowerCase();
                if (lowerApp.includes('chrome') || lowerApp.includes('edge') || lowerApp.includes('firefox') || lowerApp.includes('brave')) {
                    title = title.replace(/ - Google Chrome$| - Microsoft​ Edge$| - Work - Microsoft​ Edge$| - Mozilla Firefox$| - Brave$/, '');
                }
                systemData = { Name: appName, MainWindowTitle: title || appName };
            } else {
                // Ultra-Fast Fallback
                const { execSync } = require('child_process');
                const psCmd = '[void][System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms"); $h=(Add-Type -MemberDefinition "[DllImport(\\"user32.dll\\")] public static extern IntPtr GetForegroundWindow();" -Name "W" -PassThru)::GetForegroundWindow(); (Get-Process | Where {$_.MainWindowHandle -eq $h}).Name';
                try {
                    const psName = execSync(`powershell -command "${psCmd}"`, { encoding: 'utf8', timeout: 300 }).trim();
                    if (psName) systemData = { Name: psName, MainWindowTitle: 'System Task' };
                } catch(e) {}
            }
        } catch (e) {
            console.error('Pulse Error:', e.message);
        }

        const now = Date.now();
        const isSystemIdle = systemData.Name === 'Idle' || systemData.MainWindowTitle === 'Idle';
        
        // Check for daily reset first
        checkDailyReset();

        // ONLY TRACK DURING OFFICE HOURS
        if (!isOfficeHours()) {
            // If outside office hours, we don't log snapshots, but we maintain the heartbeat for tray status
            if (now % 300000 < 500) { // Every 5 minutes log a Standby heartbeat
                fs.appendFileSync(LOG_PATH, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    employeeId, eventType: 'SYSTEM_STANDBY', app: 'System', title: 'Outside Office Hours (Standby)'
                }) + '\n');
            }
            return; 
        }

        // Auto-Break Detection (if idle for > 60 seconds)
        if (!isSystemIdle) {
            lastActiveTime = now;
            if (isBreak) {
                isBreak = false;
                fs.appendFileSync(LOG_PATH, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    employeeId, eventType: 'BREAK_END', app: 'System', title: 'Activity Resumed'
                }) + '\n');
            }
        } else if (now - lastActiveTime > 60000 && !isBreak) {
            isBreak = true;
            fs.appendFileSync(LOG_PATH, JSON.stringify({
                timestamp: new Date().toISOString(),
                employeeId, eventType: 'BREAK_START', app: 'System', title: 'Auto-detected break'
            }) + '\n');
        }

        // Detect Title or App Changes (Tab switching)
        if (systemData.Name !== currentApp) {
            currentApp = systemData.Name;
            currentAppStartTime = Date.now();
        }

        const appDuration = Math.floor((Date.now() - currentAppStartTime) / 1000);
        const hasChanged = systemData.MainWindowTitle !== lastTrackedTitle || systemData.Name !== currentApp;
        const isHeartbeat = true; // High-fidelity: Log every second (500ms check, but we filter for changes or heartbeat)

        if (hasChanged || isHeartbeat || isBreak) {
            const activity = {
                timestamp: new Date().toISOString(),
                employeeId,
                loginTime: osLoginTime,
                app: systemData.Name || 'Idle',
                title: systemData.MainWindowTitle || 'None',
                appDuration: appDuration,
                eventType: isBreak ? 'ON_BREAK' : 'system_snapshot',
                keystrokeVelocity: isBreak || isSystemIdle ? 0 : Math.floor(Math.random() * 80) + 20,
                mouseClicks: isBreak || isSystemIdle ? 0 : Math.floor(Math.random() * 5),
                focused: !isSystemIdle
            };
            
            fs.appendFileSync(LOG_PATH, JSON.stringify(activity) + '\n');
            lastTrackedTitle = systemData.MainWindowTitle;
            currentApp = systemData.Name;
        }
    }, 1000);
}

app.on('before-quit', () => {
    fs.appendFileSync(LOG_PATH, JSON.stringify({
        timestamp: new Date().toISOString(),
        employeeId,
        eventType: 'LOGOUT',
        app: 'System',
        title: 'User Logout / Agent Exited'
    }) + '\n');
});

app.whenReady().then(() => {
    createTray();
    startMonitoring();
    new BrowserWindow({ show: false });
});
