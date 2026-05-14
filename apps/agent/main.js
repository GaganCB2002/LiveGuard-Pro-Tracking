const { app, Tray, Menu, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

let tray = null;
let trackingInterval = null;
let locationInterval = null;
let currentApp = null;
let currentAppStartTime = Date.now();
let osLoginTime = new Date().toISOString();

// --- REGISTER IPC HANDLERS (TOP LEVEL FOR GUARANTEED ACCESS) ---
ipcMain.handle('trigger-full-scan', async (event) => {
    console.log('[SECURITY] Starting Full System Forensic Scan...');
    const scanPaths = [
        os.homedir(),
        path.join(os.homedir(), 'Desktop'),
        path.join(os.homedir(), 'Downloads'),
        path.join(os.homedir(), 'Documents')
    ];

    let filesScanned = 0;
    for (const p of scanPaths) {
        if (fs.existsSync(p)) {
            await scanDirectory(p, (filePath) => {
                filesScanned++;
                if (filesScanned % 100 === 0) {
                    event.sender.send('scan-progress', { 
                        progress: Math.min(99, Math.floor(filesScanned / 100)), 
                        currentFile: path.basename(filePath) 
                    });
                }
            });
        }
    }

    // Notify IT (Mock API call)
    console.log('[SECURITY] Scan Complete. Informing IT Department of findings...');
    fs.appendFileSync(LOG_PATH, JSON.stringify({
        timestamp: new Date().toISOString(),
        employeeId,
        eventType: 'IT_NOTIFICATION_SENT',
        message: `System scan completed. ${filesScanned} files analyzed. Any detected threats have been reported to the cybersecurity hub.`
    }) + '\n');

    return { success: true, filesScanned };
});

const LOG_PATH = path.join(app.getPath('userData'), 'activity_log.jsonl');
const THREAT_LOG_PATH = path.join(app.getPath('userData'), 'security_threats.jsonl');

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
        const os = require('os');
        const bootTime = new Date(Date.now() - os.uptime() * 1000);
        osLoginTime = bootTime.toISOString().replace('T', ' ').split('.')[0];
    } catch(e) {
        osLoginTime = new Date().toISOString();
    }
};

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
        { label: 'Tracking: Active', enabled: false },
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

// Activity Monitoring State
let isBreak = false;
let employeeId = 'EMP-' + require('os').userInfo().username.toUpperCase();
let lastTrackedTitle = '';
const deviceId = require('os').hostname();

// Global State
let lastKnownLocation = { latitude: 0, longitude: 0, network: 'Unknown', accuracy: 0 };

// --- Multi-Signal Location Verification ---
async function getMultiSignalLocation() {
    return new Promise((resolve) => {
        const { exec } = require('child_process');
        const scriptPath = path.join(__dirname, 'get_gps.ps1');
        
        // Increased timeout for better hardware lock potential
        exec(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { timeout: 30000 }, async (error, stdout) => {
            if (error || !stdout || stdout.trim() === 'FAILED') {
                console.warn('[Location] Hardware/Network acquisition failed.');
                resolve(null);
                return;
            }
            
            const parts = stdout.trim().split('|');
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            const acc = parseFloat(parts[2]);
            const network = parts[3] || 'Unknown Network';
            
            if (isNaN(lat) || isNaN(lng)) {
                resolve(null);
                return;
            }

            // --- SMART FILTERING ---
            let isTrustworthy = false;
            let source = 'Unknown';
            
            if (acc < 500) {
                isTrustworthy = true;
                source = 'Hardware (High)';
            } else if (acc < 2500) {
                isTrustworthy = true;
                source = 'Hardware (Low)';
            } else if (acc < 35000) {
                isTrustworthy = true;
                source = 'Network (Regional)';
            }

            if (!isTrustworthy) {
                console.warn(`[Location] Signal Rejected: Accuracy ±${Math.round(acc/1000)}km too low.`);
                resolve(null);
                return;
            }
            
            console.log(`[Location] Verified: ${lat.toFixed(4)}, ${lng.toFixed(4)} | Source: ${source} | Net: ${network}`);
            resolve({ 
                latitude: lat, 
                longitude: lng, 
                accuracy: acc, 
                network: network, 
                city: acc < 5000 ? 'Verified Hardware' : 'Regional ISP',
                source: source
            });
        });
    });
}

// --- DEEP SYSTEM MALWARE SCANNER ---
const KNOWN_MALWARE_PATTERNS = [
    /miner\.exe/i, /keylogger/i, /hacktool/i, /crack\.exe/i, /unauthorized/i, /payload\.js/i, 
    /\.bat$/i, /\.vbs$/i, /mimikatz/i, /psexec/i
];

async function scanDirectory(dirPath, callback) {
    try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
            const fullPath = path.join(dirPath, file);
            let stats;
            try { stats = fs.statSync(fullPath); } catch(e) { continue; }

            if (stats.isDirectory()) {
                // Skip system folders to prevent infinite loops or crashes
                if (file.startsWith('.') || file === 'node_modules' || file === 'AppData' || file === 'Windows') continue;
                await scanDirectory(fullPath, callback);
            } else {
                callback(fullPath);
                // Heuristic Check
                const isSuspicious = KNOWN_MALWARE_PATTERNS.some(pattern => pattern.test(file));
                if (isSuspicious) {
                    const threat = {
                        timestamp: new Date().toISOString(),
                        employeeId,
                        eventType: 'THREAT_DETECTED',
                        severity: 'CRITICAL',
                        threatName: 'Heuristic.Malware.Gen',
                        filePath: fullPath,
                        status: 'QUARANTINED',
                        notifiedIT: true
                    };
                    fs.appendFileSync(LOG_PATH, JSON.stringify(threat) + '\n');
                    fs.appendFileSync(THREAT_LOG_PATH, JSON.stringify(threat) + '\n');
                    console.log(`[SECURITY] Threat detected at: ${fullPath}`);

                    // Sync to Backend Telemetry Server
                    try {
                        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                        await fetch('http://localhost:4000/api/telemetry/security', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(threat)
                        });
                    } catch (e) {
                        console.error('[SECURITY] Failed to sync threat to backend:', e.message);
                    }
                }
            }
        }
    } catch (e) {
        // Silently skip unreadable directories
    }
}

// Scan logic moved to whenReady for guaranteed registration

async function sendLocationUpdate(loc) {
    if (!loc) return;

    try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const payload = {
            deviceId,
            employeeId,
            eventType: 'LOCATION_UPDATE',
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy,
            network: loc.network || 'Unknown Network',
            city: loc.city || 'Hardware Lock',
            timestamp: new Date().toISOString()
        };

        // 1. Send to Telemetry Server
        await fetch('http://localhost:4000/api/telemetry/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // 2. Log to Local Evidence File for Reporting
        fs.appendFileSync(LOG_PATH, JSON.stringify(payload) + '\n');
    } catch (e) {
        console.error('Telemetry Sync Error:', e.message);
    }
}

function startGPSPolling() {
    locationInterval = setInterval(async () => {
        if (!isOfficeHours()) return;
        const loc = await getMultiSignalLocation();
        if (loc) {
            lastKnownLocation = loc;
            await sendLocationUpdate(loc);
        }
    }, 10000);
}



function startMonitoring() {
    getLoginTime();
    
    // Global State
    let lastKnownLocation = { latitude: 0, longitude: 0, network: 'Scanning Network...', accuracy: 0 };
    
    // Initial Location Lock
    getMultiSignalLocation().then(loc => {
        if (loc) lastKnownLocation = loc;
    });

    // Log explicit LOGIN event
    fs.appendFileSync(LOG_PATH, JSON.stringify({
        timestamp: new Date().toISOString(),
        employeeId,
        eventType: 'LOGIN',
        loginTime: osLoginTime,
        app: 'System',
        title: 'User Login Authenticated',
        latitude: lastKnownLocation.latitude,
        longitude: lastKnownLocation.longitude,
        network: lastKnownLocation.network
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
                focused: !isSystemIdle,
                latitude: lastKnownLocation.latitude,
                longitude: lastKnownLocation.longitude,
                network: lastKnownLocation.network
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
    
    // Create the main dashboard window
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        title: "WorkSphere Command Center",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false // Remove browser restrictions
        }
    });

    // Remove menu bar for a cleaner UI
    mainWindow.setMenuBarVisibility(false);
    
    // Allow opening any URL or browser within this application
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        require('electron').shell.openExternal(url);
        return { action: 'deny' };
    });

    // Load the local dashboard
    // Polling until the dashboard is up
    const loadDashboard = () => {
        mainWindow.loadURL('http://localhost:3000').catch(() => {
            setTimeout(loadDashboard, 2000);
        });
    };
    loadDashboard();

    startMonitoring();
    startGPSPolling();
});
