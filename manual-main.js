const electron = require('electron');
const { app, BrowserWindow } = electron;

console.log('require("electron") type:', typeof electron);
console.log('require("electron") value:', electron);
console.log('app type:', typeof app);
console.log('process.versions:', process.versions);
console.log('process keys:', Object.keys(process));
console.log('process.env.ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE);
console.log('process.type:', process.type);
// Access internal binding if possible?
// const _electron = process.electronBinding('electron'); 
// console.log('_electron binding:', _electron);

if (app) {
    app.whenReady().then(() => {
        console.log('Electron is ready');
        const win = new BrowserWindow({ width: 800, height: 600 });
        win.loadURL('about:blank');
        setTimeout(() => app.quit(), 2000);
    });
} else {
    console.error('CRITICAL: app is undefined!');
}
