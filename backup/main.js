/**
 * main.js — Electron Main Process
 * Power Sense Desktop App
 */

const electron = require('electron');
const { ipcMain } = electron;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        frame: false,           // Frameless – we use a custom title bar
        titleBarStyle: 'hidden',
        backgroundColor: '#111916',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        show: false,            // Don't show until ready-to-show
    });

    if (isDev) {
        // In dev mode: load the Vite dev server
        mainWindow.loadURL('http://localhost:3030');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        // In production: load built files
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});

// IPC: Window Controls (from TitleBar component)
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
    if (mainWindow?.isMaximized()) mainWindow.unmaximize();
    else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());
