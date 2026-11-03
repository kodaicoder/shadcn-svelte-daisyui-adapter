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
// --layout <l>    where the global stylesheet lives: app (src/app.css, default) or
//                 routes (src/routes/layout.css, the SvelteKit 3 default)
// --package <d>   pack this package into the app root, so a registry item can install
//                 it through a `file:` dependency spec while it is unpublished
// --theme <f>     copy this file to src/daisyui-theme.css before the add, so a plugin
//                 that reads the theme has something to read
// --sentinel <p>  custom property prefix to look for in the built client CSS
// --then "<args>" pnpm arguments to run in the app after the add (repeatable). Split on
//                 whitespace, so one argument cannot contain a space. Each run snapshots
//                 the stylesheet, so a later init or add -a is measured.
// --props <list>  comma-separated custom properties to read at runtime, light and dark
// --page <f>      copy this file over src/routes/+page.svelte, so a component other than the
//                 baseline buttons is what gets rendered
// --selectors <l> element selectors to sample, because a component's painted fill is a utility result
//                 (bg-sidebar, bg-background) that no root custom property names

import { execFile, execFileSync, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import {
	cpSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
	existsSync
} from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { startRegistry, stopRegistry, REGISTRY_PORT } from './registry.mjs';

const execFileAsync = promisify(execFile);

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
	const i = args.indexOf(name);
	return i === -1 ? fallback : args[i + 1];
};
const options = (name) => {
	const found = [];
	for (let i = 0; i < args.length; i++) {
		if (args[i] !== name) continue;
		const value = args[i + 1];
		if (!value || value.startsWith('--')) throw new Error(`${name} needs a value`);
		found.push(value);
	}
	return found;
};

const KEEP = flag('--keep');
const ADD_URL = option('--add', null);
const REGISTRY_DIR = option('--registry', null);
const DEV_PORT = Number(option('--port', '5209'));
const LAYOUT = option('--layout', 'app');
const PKG_DIR = option('--package', null);
const THEME_FILE = option('--theme', null);
const SENTINEL = option('--sentinel', null);
const PROPS = option('--props', '');
const PAGE_FILE = option('--page', null);
const SELECTORS = option('--selectors', '');
const THEN = options('--then');

if (LAYOUT !== 'app' && LAYOUT !== 'routes') {
	throw new Error(`--layout must be app or routes, got ${LAYOUT}`);
}
if (THEN.length > 0 && !ADD_URL) {
	throw new Error('--then only makes sense after --add');
}

const HARNESS = import.meta.dirname;
const REPO = resolve(HARNESS, '..', '..', '..');
const STAMP = new Date().toISOString().replace(/[:.]/g, '-');
const WORK = join(tmpdir(), 'adapter-harness', `run-${STAMP}`);
const APP = join(WORK, 'app');
const EVIDENCE = join(REPO, '.scratch', 'daisyui-adapter', 'harness', 'runs', STAMP);
const PNPM = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const NODE = process.execPath;

const log = (msg) => console.log(`[harness] ${msg}`);
const execOptions = (cmd, cwd) => ({
	cwd,
	encoding: 'utf8',
	timeout: 600_000,
	shell: cmd === PNPM && process.platform === 'win32'
});
const run = (cmd, cmdArgs, cwd, { allowFail = false } = {}) => {
	if (server) throw new Error('run() would block the registry server, use runCapture');
	log(`${cmd} ${cmdArgs.join(' ')}`);
	try {
		return execFileSync(cmd, cmdArgs, { stdio: 'pipe', ...execOptions(cmd, cwd) });
	} catch (error) {
		const out = `${error.stdout ?? ''}\n${error.stderr ?? ''}`.trim();
		if (allowFail) return out;
		throw new Error(`${cmd} ${cmdArgs.join(' ')} failed:\n${out.slice(-4000)}`);
	}
};

// The exit code is the result: the add transcript is evidence, so the caller writes it
// before failing on a non-zero code.
const runCapture = async (cmd, cmdArgs, cwd) => {
	log(`${cmd} ${cmdArgs.join(' ')}`);
	try {
		const { stdout, stderr } = await execFileAsync(cmd, cmdArgs, execOptions(cmd, cwd));
		return { code: 0, output: `${stdout}\n${stderr}`.trim() };
	} catch (error) {
		// Only a real non-zero exit is a captured result; a timeout or a missing
		// binary has no numeric code and must surface as a harness fault.
		if (typeof error.code !== 'number') throw error;
		return { code: error.code, output: `${error.stdout ?? ''}\n${error.stderr ?? ''}`.trim() };
	}
};

// Directories are listed with a trailing slash: the CLI prints an install target even
// for an item with no files, so "nothing was created" has to be visible, not inferred.
const listPaths = (dir, base = dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		const rel = relative(base, path).replaceAll('\\', '/');
		return entry.isDirectory() ? [`${rel}/`, ...listPaths(path, base)] : [rel];
	});

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
	const cssFile = LAYOUT === 'routes' ? 'src/routes/layout.css' : 'src/app.css';
	const cssImport = LAYOUT === 'routes' ? './layout.css' : '../app.css';
	write(join(APP, cssFile), css);
	const layoutPath = join(APP, 'src', 'routes', '+layout.svelte');
	const layout = readFileSync(layoutPath, 'utf8').replace(
		'<script lang="ts">',
		`<script lang="ts">\n\timport '${cssImport}';`
	);
	write(layoutPath, layout);
	cpSync(join(REPO, 'src', 'lib', 'utils.ts'), join(APP, 'src', 'lib', 'utils.ts'));

	const componentsJson = JSON.parse(
		readFileSync(join(REPO, 'components.json'), 'utf8')
	);
	componentsJson.tailwind.css = cssFile;
	write(join(APP, 'components.json'), JSON.stringify(componentsJson, null, '\t'));
	report.layout = LAYOUT;
	report.cssPath = cssFile;
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

	if (PAGE_FILE) {
		cpSync(resolve(PAGE_FILE), join(APP, 'src', 'routes', '+page.svelte'));
		report.page = PAGE_FILE;
		report.steps.push('page');
	}

	if (THEME_FILE) {
		cpSync(resolve(THEME_FILE), join(APP, 'src', 'daisyui-theme.css'));
		report.theme = THEME_FILE;
		report.steps.push('theme-file');
	}

	// 6. optional package tarball + registry server + adapter install
	if (PKG_DIR) {
		const tarballs = () => readdirSync(APP).filter((file) => file.endsWith('.tgz'));
		const before = new Set(tarballs());
		run(PNPM, ['pack', '--pack-destination', APP], resolve(PKG_DIR));
		// A scoped package's tarball drops the `@` and turns the slash into a dash, so the name
		// cannot be composed from package.json. Take the one file the pack added.
		const added = tarballs().filter((file) => !before.has(file));
		if (added.length !== 1) {
			throw new Error(`pnpm pack produced ${added.length} new *.tgz in ${APP}: ${added.join(', ')}`);
		}
		report.tarball = added[0];
		report.steps.push('package-tarball');
	}

	if (REGISTRY_DIR) {
		server = await startRegistry(REGISTRY_DIR);
		log(`registry on http://127.0.0.1:${REGISTRY_PORT}`);
		report.steps.push('registry-server');
	}

	if (ADD_URL) {
		const cssPath = join(APP, cssFile);
		const cssBefore = readFileSync(cssPath, 'utf8');
		const pkgBefore = readFileSync(join(APP, 'package.json'), 'utf8');
		// -o is required: an item carrying css/cssVars prompts to overwrite the
		// stylesheet, and -y alone leaves that prompt waiting with piped stdio.
		const added = await runCapture(PNPM, ['dlx', 'shadcn-svelte@latest', 'add', ADD_URL, '-y', '-o'], APP);
		write(join(EVIDENCE, 'add-install.log'), added.output);
		report.addExitCode = added.code;
		if (added.code !== 0) throw new Error(`add failed, see ${join(EVIDENCE, 'add-install.log')}`);
		const cssAfter = readFileSync(cssPath, 'utf8');
		write(join(EVIDENCE, 'css-before.css'), cssBefore);
		write(join(EVIDENCE, 'css-after.css'), cssAfter);
		write(join(EVIDENCE, 'package-json-before.json'), pkgBefore);
		write(join(EVIDENCE, 'package-json-after.json'), readFileSync(join(APP, 'package.json'), 'utf8'));
		write(join(EVIDENCE, 'src-listing.txt'), `${listPaths(join(APP, 'src')).join('\n')}\n`);
		report.cssChanged = cssBefore !== cssAfter;
		report.steps.push('adapter-add');
	}

	// 6b. commands that re-apply CSS after the adapter, snapshotting what each left behind
	for (const [index, command] of THEN.entries()) {
		const n = index + 1;
		const result = await runCapture(PNPM, command.split(/\s+/), APP);
		write(
			join(EVIDENCE, `then-${n}.log`),
			`$ pnpm ${command}\nexit ${result.code}\n${result.output}\n`
		);
		write(
			join(EVIDENCE, `css-after-then-${n}.css`),
			readFileSync(join(APP, cssFile), 'utf8')
		);
		report.then ??= [];
		report.then.push({ command, code: result.code });
		if (result.code !== 0) throw new Error(`--then ${n} failed, see then-${n}.log`);
	}
	if (THEN.length > 0) {
		// The manifest after the step, not before it: the CLI's self-install is the thing under test.
		write(join(EVIDENCE, 'package-json-after-then.json'), readFileSync(join(APP, 'package.json'), 'utf8'));
		report.steps.push('then');
	}

	server = stopRegistry(server);

	// 7. build
	log('building');
	const buildOut = run(PNPM, ['build'], APP, { allowFail: true });
	write(join(EVIDENCE, 'build.log'), buildOut);
	const built = existsSync(join(APP, 'build'));
	report.build = built;
	if (!built) throw new Error(`build failed, see ${join(EVIDENCE, 'build.log')}`);
	report.steps.push('build');

	// did the plugin reach the compiled CSS?
	if (SENTINEL) {
		const clientDir = join(APP, '.svelte-kit', 'output', 'client');
		const found = existsSync(clientDir)
			? listPaths(clientDir)
					.filter((file) => file.endsWith('.css'))
					.flatMap((file) => {
						const css = readFileSync(join(clientDir, file), 'utf8');
						return [...css.matchAll(new RegExp(`${SENTINEL}[a-z0-9-]*:[^;}]*`, 'g'))].map(
							(hit) => `${file}: ${hit[0]}`
						);
					})
			: [`no ${clientDir}`];
		write(join(EVIDENCE, 'compiled-sentinel.txt'), `${found.join('\n')}\n`);
		report.pluginSentinel = found;
	}

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
	const shot = run(NODE, [join(HARNESS, 'shot.mjs'), url, EVIDENCE, PROPS, SELECTORS], REPO);
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
	stopRegistry(server);
	if (!KEEP) rmSync(WORK, { recursive: true, force: true });
}

console.log(JSON.stringify(report, null, 2));
process.exitCode = report.ok ? 0 : 1;
