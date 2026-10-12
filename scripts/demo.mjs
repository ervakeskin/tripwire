// One command for the demo video: build the extension bundle, serve the web harness, run the Cypress spec, stop the server.
import { spawn, spawnSync } from 'node:child_process';

const sh = process.platform === 'win32';
const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: sh });

if (run('npx', ['wxt', 'build']).status !== 0) process.exit(1);
const server = spawn('node', ['scripts/serve.mjs'], { stdio: 'inherit' });
await new Promise((r) => setTimeout(r, 1500));
const code = run('npx', ['cypress', 'run']).status ?? 1;
server.kill();
console.log(code === 0 ? '\nVideo: cypress/videos/demo.cy.ts.mp4' : '\nCypress failed');
process.exit(code);
