// Manages the verification dev server for this repo.
//   node scripts/session.mjs start   - launch on port 5199 and wait until usable
//   node scripts/session.mjs status  - read-only doctor
//   node scripts/session.mjs stop    - kill the tree this script started
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}/`;
const RUN_DIR = path.join(ROOT, '.verify', 'run');
const RUN_FILE = path.join(RUN_DIR, 'dev.json');
const HANDLE = 'data-slot="button"';
const READY_TIMEOUT_MS = 60_000;
const IS_WINDOWS = process.platform === 'win32';

function alive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

async function readState() {
	try {
		return JSON.parse(await readFile(RUN_FILE, 'utf8'));
	} catch {
		return null;
	}
}

async function probe() {
	try {
		const response = await fetch(BASE, { signal: AbortSignal.timeout(5000) });
		const body = await response.text();
		return { up: true, status: response.status, hasHandle: body.includes(HANDLE) };
	} catch {
		return { up: false, status: 0, hasHandle: false };
	}
}

async function waitReady() {
	const deadline = Date.now() + READY_TIMEOUT_MS;
	while (Date.now() < deadline) {
		const result = await probe();
		if (result.up && result.status === 200 && result.hasHandle) return true;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	return false;
}

async function start() {
	const state = await readState();

	if (state && alive(state.pid)) {
		console.log(`already running: pid ${state.pid} on port ${PORT}`);
		if (await waitReady()) console.log(`ready: ${BASE}`);
		return 0;
	}

	const existing = await probe();
	if (existing.up) {
		console.error(`port ${PORT} already answers but is not ours. Stop whatever holds it first.`);
		return 1;
	}

	await mkdir(RUN_DIR, { recursive: true });

	// One command string with shell: true, because Node refuses to escape argument arrays for
	// shells (DEP0190). --host 127.0.0.1 keeps the probe below honest: without it Vite may bind
	// only ::1, and a fetch to 127.0.0.1 then hangs even though the server is up.
	const child = spawn(`pnpm dev --port ${PORT} --strictPort --host 127.0.0.1`, {
		cwd: ROOT,
		shell: true,
		detached: true,
		stdio: 'ignore',
		windowsHide: true
	});
	child.unref();

	await writeFile(
		RUN_FILE,
		JSON.stringify({ pid: child.pid, port: PORT, startedAt: new Date().toISOString() }, null, 2)
	);

	if (!(await waitReady())) {
		console.error(`dev server did not become usable within ${READY_TIMEOUT_MS / 1000}s`);
		console.error(`check the process yourself: pid ${child.pid}, then run: stop`);
		return 1;
	}

	console.log(`started: pid ${child.pid}`);
	console.log(`ready: ${BASE}`);
	return 0;
}

async function status() {
	const state = await readState();
	const running = Boolean(state && alive(state.pid));
	const page = await probe();
	const checks = [
		['pid file', Boolean(state), state ? `.verify/run/dev.json (pid ${state.pid})` : 'missing'],
		['process alive', running, running ? `pid ${state.pid}` : 'no'],
		['port answers 200', page.status === 200, page.up ? `http ${page.status}` : 'no response'],
		['page has buttons', page.hasHandle, page.hasHandle ? HANDLE : 'not found']
	];

	for (const [name, ok, detail] of checks) {
		console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${detail}`);
	}

	if (!checks.every(([, ok]) => ok)) {
		console.log('\nnot worth driving. run: start');
		return 1;
	}

	console.log(`\ndrivable: ${BASE}`);
	return 0;
}

async function stop() {
	const state = await readState();

	if (!state) {
		console.log('nothing recorded, nothing to stop');
		return 0;
	}

	if (!alive(state.pid)) {
		await rm(RUN_FILE, { force: true });
		console.log(`pid ${state.pid} already gone`);
		return 0;
	}

	if (IS_WINDOWS) {
		spawnSync('taskkill', ['/PID', String(state.pid), '/T', '/F'], { stdio: 'ignore' });
	} else {
		try {
			process.kill(-state.pid, 'SIGTERM');
		} catch {
			spawnSync('kill', ['-TERM', String(state.pid)], { stdio: 'ignore' });
		}
	}

	const deadline = Date.now() + 10_000;
	while (Date.now() < deadline) {
		if (!(await probe()).up) break;
		await new Promise((resolve) => setTimeout(resolve, 250));
	}

	await rm(RUN_FILE, { force: true });
	console.log(`stopped pid ${state.pid}`);
	console.log(`evidence kept under ${path.join(ROOT, '.verify', 'evidence')}`);
	return 0;
}

const command = process.argv[2];
const commands = { start, status, stop };

if (!commands[command]) {
	console.error('usage: node scripts/session.mjs <start|status|stop>');
	process.exit(2);
}

if (!existsSync(path.join(ROOT, 'package.json'))) {
	console.error(`not at the repo root: ${ROOT}`);
	process.exit(2);
}

process.exit(await commands[command]());
