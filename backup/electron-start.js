/**
 * electron-start.js
 * Waits for Vite dev server to be ready, then spawns Electron.
 * Run with: node electron-start.js
 */

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const VITE_URL = 'http://localhost:3030';
const MAX_WAIT = 60000;
const POLL_INTERVAL = 500;

function waitForServer(url, timeout) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            http.get(url, res => {
                if (res.statusCode < 500) resolve();
                else retry();
            }).on('error', () => {
                if (Date.now() - start > timeout) reject(new Error('Vite timeout'));
                else setTimeout(check, POLL_INTERVAL);
            });
        };
        check();
    });
}

async function main() {
    console.log('⏳ Waiting for Vite dev server...');
    try {
        await waitForServer(VITE_URL, MAX_WAIT);
        console.log('✅ Vite ready. Launching Electron...');
    } catch (e) {
        console.error('❌', e.message);
        process.exit(1);
    }

    const electronBin = path.join(__dirname, 'node_modules', '.bin', 'electron');
    const child = spawn(electronBin, ['.'], {
        env: { ...process.env, NODE_ENV: 'development' },
        stdio: 'inherit',
        shell: true,
    });

    child.on('close', code => process.exit(code));
}

main();
