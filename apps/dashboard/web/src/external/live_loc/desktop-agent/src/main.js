const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const si = require('systeminformation');
const log = require('electron-log');

let mainWindow = null;
let tray = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900, height: 600, show: false,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
    icon: path.join(__dirname, '../assets/icon.png'),
  });
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  mainWindow.on('close', (event) => { if (!app.isQuiting) { event.preventDefault(); mainWindow.hide(); } });
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Dashboard', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit(); } },
  ]);
  tray.setToolTip('LiveGuard Agent');
  tray.setContextMenu(contextMenu);
};

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {});
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
