import { app, BrowserWindow } from 'electron';
// import * as electron from 'electron';

console.log('app type:', typeof app);
// console.log('electron default:', electron.default);

if (app) {
    app.whenReady().then(() => {
        console.log('Electron is ready (ESM)');
        const win = new BrowserWindow({ width: 800, height: 600 });
        win.loadURL('about:blank');
        setTimeout(() => app.quit(), 2000);
    });
} else {
    console.error('CRITICAL: app is undefined!');
}
