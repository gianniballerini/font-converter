import { execSync, spawn } from 'child_process';
import waitOn from 'wait-on';

console.log('Starting Vite dev server...');
// Start Vite dev server in non-blocking mode
const vite = spawn('yarn', ['vite'], {
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit',
  shell: true
});

console.log('Waiting for Vite server to be ready...');
await waitOn({
  resources: ['http://localhost:1234'],
  timeout: 30000, // 30 second timeout
});
console.log('Vite server is ready!');

console.log('Starting Electron app...');
execSync('electron .', { env: { ...process.env, NODE_ENV: 'development' }, stdio: 'inherit' });

// Handle process termination
process.on('SIGINT', () => {
  vite.kill();
  process.exit();
});
