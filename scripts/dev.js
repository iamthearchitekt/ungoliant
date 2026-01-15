const { spawn } = require('child_process');

console.log('Starting dev server with cleaner environment...');

// Explicitly delete the variable that forces Electron to run as Node
if (process.env.ELECTRON_RUN_AS_NODE) {
    console.log('Unsetting ELECTRON_RUN_AS_NODE (was: ' + process.env.ELECTRON_RUN_AS_NODE + ')');
    delete process.env.ELECTRON_RUN_AS_NODE;
}

// Spawn vite
const vite = spawn('npm', ['exec', 'vite'], {
    stdio: 'inherit',
    shell: true,
    env: process.env // Passed modified env
});

vite.on('close', (code) => {
    process.exit(code);
});
