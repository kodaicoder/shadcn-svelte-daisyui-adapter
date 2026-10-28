// Verification harness for the daisyUI adapter.
// Builds a disposable SvelteKit 3 project at shadcn-svelte "step 4" state,
// installs a registry item into it, builds, renders light and dark, and keeps evidence.
//
// Usage:
//   node .scratch/daisyui-adapter/harness/run.mjs [--keep] [--add <url>] [--registry <dir>] [--port <n>]
//
// --keep          leave the temp project in place for inspection
// --add <url>     registry item URL to install after the baseline button
// --registry <d>  directory to serve on the harness port at /r/<name>.json
// --port <n>      dev server port (default 5209) and registry port (default 5199)

import { execFile, execFileSync, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, resolve, extname } from 'node:path';
import { tmpdir } from 'node:os';
import { registryFile } from './registry-path.mjs';

const execFileAsync = promisify(execFile);

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
	const i = args.indexOf(name);
	return i === -1 ? fallback : args[i + 1];
};

const KEEP = flag('--keep');
const ADD_URL = option('--add', null);
const REGISTRY_DIR = option('--registry', null);
const DEV_PORT = Number(option('--port', '5209'));
const REGISTRY_PORT = 5199;

const HARNESS = import.meta.dirname;
const REPO = resolve(HARNESS, '..', '..', '..');
const STAMP = new Date().toISOString().replace(/[:.]/g, '-');
const WORK = join(tmpdir(), 'adapter-harness', `run-${STAMP}`);
const APP = join(WORK, 'app');
const EVIDENCE = join(REPO, '.scratch', 'daisyui-adapter', 'harness', 'runs', STAMP);
const PNPM = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const NODE = process.execPath;

const log = (msg) => console.log(`[harness] ${msg}`);
const run = (cmd, cmdArgs, cwd, { allowFail = false } = {}) => {
	if (server) throw new Error('run() would block the registry server, use runAsync');
	log(`${cmd} ${cmdArgs.join(' ')}`);
	try {
		return execFileSync(cmd, cmdArgs, {
			cwd,
			encoding: 'utf8',
			stdio: 'pipe',
			timeout: 600_000,
			shell: cmd === PNPM && process.platform === 'win32'
		});
	} catch (error) {
		const out = `${error.stdout ?? ''}\n${error.stderr ?? ''}`.trim();
		if (allowFail) return out;
		throw new Error(`${cmd} ${cmdArgs.join(' ')} failed:\n${out.slice(-4000)}`);
	}
};

const runAsync = async (cmd, cmdArgs, cwd, { allowFail = false } = {}) => {
	log(`${cmd} ${cmdArgs.join(' ')}`);
	try {
		const { stdout } = await execFileAsync(cmd, cmdArgs, {
			cwd,
			encoding: 'utf8',
			timeout: 600_000,
			shell: cmd === PNPM && process.platform === 'win32'
		});
		return stdout;
	} catch (error) {
		const out = `${error.stdout ?? ''}\n${error.stderr ?? ''}`.trim();
		if (allowFail) return out;
		throw new Error(`${cmd} ${cmdArgs.join(' ')} failed:\n${out.slice(-4000)}`);
	}
};

const write = (path, text) =>
	writeFileSync(path, text, { encoding: 'utf8' }); // Node writes no BOM

mkdirSync(EVIDENCE, { recursive: true });
mkdirSync(WORK, { recursive: true });

const report = { stamp: STAMP, app: APP, evidence: EVIDENCE, steps: [], addUrl: ADD_URL };

let server = null;

try {
	// 1. scaffold
	log('scaffolding SvelteKit 3 project');
	run(PNPM, ['dlx', 'sv@1.1.1', 'create', APP, '--template', 'minimal', '--types', 'ts', '--no-add-ons', '--no-install', '--no-dir-check'], WORK);
	report.steps.push('scaffold');

	// 2. dependencies
	log('installing dependencies');
	run(PNPM, ['install'], APP);
	const css = readFileSync(join(REPO, 'src', 'routes', 'layout.css'), 'utf8');
	const fonts = [...css.matchAll(/@import\s+"(@fontsource[^"]+)"/g)].map((m) => m[1]);
	run(
		PNPM,
		[
			'add',
			'-D',
			'tailwindcss',
			'@tailwindcss/vite',
			'@sveltejs/adapter-node',
			'tw-animate-css',
			'shadcn-svelte',
			'cn',
			...fonts
		],
		APP
	);
	report.steps.push('dependencies');

	// 3. SvelteKit 3 config: adapter in vite.config.ts, no svelte.config.js
	write(
		join(APP, 'vite.config.ts'),
		`import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		})
	]
});
`
	);

	// 4. reproduce step 4 exactly: global CSS, its import, the cn util
	write(join(APP, 'src', 'app.css'), css);
	const layoutPath = join(APP, 'src', 'routes', '+layout.svelte');
	const layout = readFileSync(layoutPath, 'utf8').replace(
		'<script lang="ts">',
		'<script lang="ts">\n\timport \'../app.css\';'
	);
	write(layoutPath, layout);
	cpSync(join(REPO, 'src', 'lib', 'utils.ts'), join(APP, 'src', 'lib', 'utils.ts'));

	const componentsJson = JSON.parse(
		readFileSync(join(REPO, 'components.json'), 'utf8')
	);
	componentsJson.tailwind.css = 'src/app.css';
	write(join(APP, 'components.json'), JSON.stringify(componentsJson, null, '\t'));
	report.steps.push('step-4-state');

	// 5. baseline component, proving `add` works before the adapter is involved
	run(PNPM, ['dlx', 'shadcn-svelte@latest', 'add', 'button', '-y'], APP);
	write(
		join(APP, 'src', 'routes', '+page.svelte'),
		`<script lang="ts">
	import { Button } from "#lib/components/ui/button/index.js";
</script>

<h1 class="text-2xl font-bold p-6">adapter harness</h1>
<div class="p-6 flex gap-3">
	<Button>Default</Button>
	<Button variant="secondary">Secondary</Button>
	<Button variant="destructive">Destructive</Button>
</div>
`
	);
	report.steps.push('baseline-add');

	// 6. optional registry server + adapter install
	if (REGISTRY_DIR) {
		server = createServer((req, res) => {
			const file = registryFile(REGISTRY_DIR, req.url);
			if (!existsSync(file) || extname(file) !== '.json') {
				res.writeHead(404).end('not found');
				return;
			}
			res.writeHead(200, { 'content-type': 'application/json' }).end(readFileSync(file));
		});
		await new Promise((r) => server.listen(REGISTRY_PORT, '127.0.0.1', r));
		log(`registry on http://127.0.0.1:${REGISTRY_PORT}`);
		report.steps.push('registry-server');
	}

	if (ADD_URL) {
		const cssBefore = readFileSync(join(APP, 'src', 'app.css'), 'utf8');
		// -o is required: an item carrying css/cssVars prompts to overwrite the
		// stylesheet, and -y alone leaves that prompt waiting with piped stdio.
		await runAsync(PNPM, ['dlx', 'shadcn-svelte@latest', 'add', ADD_URL, '-y', '-o'], APP);
		const cssAfter = readFileSync(join(APP, 'src', 'app.css'), 'utf8');
		write(join(EVIDENCE, 'app-before.css'), cssBefore);
		write(join(EVIDENCE, 'app-after.css'), cssAfter);
		report.cssChanged = cssBefore !== cssAfter;
		report.steps.push('adapter-add');
	}

	if (server) {
		server.closeAllConnections();
		server.close();
		server = null;
	}

	// 7. build
	log('building');
	const buildOut = run(PNPM, ['build'], APP, { allowFail: true });
	write(join(EVIDENCE, 'build.log'), buildOut);
	const built = existsSync(join(APP, 'build'));
	report.build = built;
	if (!built) throw new Error(`build failed, see ${join(EVIDENCE, 'build.log')}`);
	report.steps.push('build');

	// 8. render, light and dark
	const dev = spawn(PNPM, ['dev', '--port', String(DEV_PORT), '--strictPort', '--host', '127.0.0.1'], {
		cwd: APP,
		stdio: 'ignore',
		shell: process.platform === 'win32'
	});
	const url = `http://127.0.0.1:${DEV_PORT}/`;
	let ready = false;
	for (let i = 0; i < 60 && !ready; i++) {
		await new Promise((r) => setTimeout(r, 500));
		try {
			const res = await fetch(url);
			ready = res.ok;
		} catch {}
	}
	if (!ready) throw new Error('dev server never answered');
	const shot = run(NODE, [join(HARNESS, 'shot.mjs'), url, EVIDENCE], REPO);
	write(join(EVIDENCE, 'render.json'), shot);
	report.render = JSON.parse(shot);
	report.steps.push('render');
	// kill the whole tree: spawn used a shell on Windows, so the child holds the port
	if (process.platform === 'win32') {
		try {
			execFileSync('taskkill', ['/PID', String(dev.pid), '/T', '/F'], { stdio: 'ignore' });
		} catch {}
	} else {
		dev.kill();
	}

	report.ok = true;
} catch (error) {
	report.ok = false;
	report.error = String(error.message ?? error);
} finally {
	write(join(EVIDENCE, 'run.json'), JSON.stringify(report, null, 2));
	if (server) {
		server.closeAllConnections();
		server.close();
	}
	if (!KEEP) rmSync(WORK, { recursive: true, force: true });
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.ok ? 0 : 1;
