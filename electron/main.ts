import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.DIST = path.join(__dirname, '../dist')
const isPackaged = app ? app.isPackaged : false;
process.env.VITE_PUBLIC = isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    })
}

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
        return;
    }

    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC || '', 'icon.png'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#09090b',
            symbolColor: '#22c55e',
            height: 35
        },
        backgroundColor: '#09090b',
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600
    })

    // win.webContents.openDevTools()

    if (VITE_DEV_SERVER_URL) {
        console.log('Loading URL:', VITE_DEV_SERVER_URL);
        win.loadURL(VITE_DEV_SERVER_URL).catch(e => console.error('Failed to load URL:', e));
    } else {
        win.loadFile(path.join(process.env.DIST, 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    createWindow();

    // Check for updates on startup
    autoUpdater.checkForUpdatesAndNotify();

    // Update Lifecycle Events
    autoUpdater.on('update-available', () => {
        console.log('Update available.');
    });

    autoUpdater.on('update-downloaded', () => {
        console.log('Update downloaded; will install on quit.');
    });

    autoUpdater.on('error', (err) => {
        console.error('Error in auto-updater:', err);
    });
});
