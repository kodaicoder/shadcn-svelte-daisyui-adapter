// Ticket 40: the map-only entry points. `map` and `init --no-fix` must write the same stylesheet and
// touch no component file, while `init` keeps fixing and the version guard stays the fixer's.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const STOCK = join(REPO, 'src', 'lib', 'components', 'ui');
const THEME = resolve(HERE, '..', 'registry-12', 'probe-theme.css');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-40-map');
const COMPONENTS = ['button', 'alert'];

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const scaffold = (dir, { shadcn = '1.8.0' } = {}) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));
	writeFileSync(
		join(dir, 'components.json'),
		JSON.stringify({ tailwind: { css: 'src/routes/layout.css' }, style: 'mira' }, null, '\t')
	);
	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify(
			{ name: 'adapter-40-fixture', type: 'module', imports: { '#lib/*': './src/lib/*' } },
			null,
			'\t'
		)
	);
	const stub = join(dir, 'node_modules', ...NAME.split('/'), 'package.json');
	mkdirSync(dirname(stub), { recursive: true });
	writeFileSync(stub, JSON.stringify({ name: NAME, version: VERSION }, null, '\t'));
	const installed = join(dir, 'node_modules', 'shadcn-svelte', 'package.json');
	mkdirSync(dirname(installed), { recursive: true });
	writeFileSync(installed, JSON.stringify({ name: 'shadcn-svelte', version: shadcn }, null, '\t'));
	for (const component of COMPONENTS) {
		cpSync(join(STOCK, component), join(dir, 'src', 'lib', 'components', 'ui', component), {
			recursive: true
		});
	}
	return dir;
};

const cliResult = (dir, ...args) => {
	try {
		const output = execFileSync(process.execPath, [CLI, ...args], {
			cwd: dir,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'pipe']
		});
		return { code: 0, out: output };
	} catch (error) {
		return { code: error.status ?? 1, out: `${error.stdout ?? ''}${error.stderr ?? ''}`.trim() };
	}
};

const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

const treeDigest = (dir) => {
	const walk = (current) =>
		readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
			const path = join(current, entry.name);
			if (entry.isDirectory()) return walk(path);
			return [`${path.slice(dir.length)}:${digest(path)}`];
		});
	return createHash('sha256').update(walk(dir).sort().join('\n')).digest('hex');
};

const uiOf = (dir) => join(dir, 'src', 'lib', 'components', 'ui');

const stylesheetOf = (dir) => join(dir, 'src', 'routes', 'layout.css');
const headerOf = (dir) => readFileSync(stylesheetOf(dir), 'utf8').split(/\r?\n/)[0];

const mapDir = scaffold(join(WORK, 'map'));
const mapUiBefore = treeDigest(uiOf(mapDir));
const stockCss = digest(stylesheetOf(mapDir));
const mapRun = cliResult(mapDir, 'map');
const mapHeader = headerOf(mapDir);

check('map exits 0', mapRun.code === 0, `exit ${mapRun.code}`);
check('map writes the stylesheet', digest(stylesheetOf(mapDir)) !== stockCss);
check(
	'map records components 0 fixed',
	mapHeader.includes(`${NAME} ${VERSION} | components 0 fixed |`),
	mapHeader
);
check('map leaves every component file byte-identical', treeDigest(uiOf(mapDir)) === mapUiBefore);
check(
	'map says the components were untouched',
	mapRun.out.includes('map only: components untouched'),
	mapRun.out.trim().split('\n').slice(-1)[0]
);

const noFixDir = scaffold(join(WORK, 'no-fix'));
const noFixUiBefore = treeDigest(uiOf(noFixDir));
const noFixRun = cliResult(noFixDir, 'init', '--no-fix');

check('init --no-fix exits 0', noFixRun.code === 0, `exit ${noFixRun.code}`);
check(
	'init --no-fix writes the same stylesheet as map',
	digest(stylesheetOf(noFixDir)) === digest(stylesheetOf(mapDir))
);
check(
	'init --no-fix leaves every component file byte-identical',
	treeDigest(uiOf(noFixDir)) === noFixUiBefore
);
check(
	'init --no-fix records components 0 fixed',
	headerOf(noFixDir).includes(`${NAME} ${VERSION} | components 0 fixed |`),
	headerOf(noFixDir)
);

const initDir = scaffold(join(WORK, 'init'));
const initUiBefore = treeDigest(uiOf(initDir));
const initRun = cliResult(initDir, 'init');

check('init still exits 0', initRun.code === 0, `exit ${initRun.code}`);
check('init still fixes the components', treeDigest(uiOf(initDir)) !== initUiBefore);
check(
	'init still records a fixed count above zero',
	/components [1-9]\d* fixed/.test(headerOf(initDir)),
	headerOf(initDir)
);
check(
	'init writes a different stylesheet than map, because the header counts fixed files',
	digest(stylesheetOf(initDir)) !== digest(stylesheetOf(mapDir))
);

const guardDir = scaffold(join(WORK, 'guard'), { shadcn: '1.9.0' });
const guardCss = digest(stylesheetOf(guardDir));
const guardInit = cliResult(guardDir, 'init');
const guardAfterInit = digest(stylesheetOf(guardDir));
const guardMap = cliResult(guardDir, 'map');

check(
	'init still refuses an unsupported shadcn version',
	guardInit.code === 1 && guardInit.out.includes('unsupported shadcn-svelte version 1.9.0'),
	guardInit.out.trim().split('\n')[0]
);
check(
	'init leaves the stylesheet untouched when it refuses',
	guardAfterInit === guardCss,
	`${guardAfterInit.slice(0, 12)} vs ${guardCss.slice(0, 12)}`
);
check(
	'map does not read the shadcn version, so it maps on 1.9.0',
	guardMap.code === 0 && digest(stylesheetOf(guardDir)) !== guardCss,
	`exit ${guardMap.code}`
);

const badMap = cliResult(mapDir, 'map', 'extra');
check(
	'map refuses arguments',
	badMap.code === 1 && badMap.out.includes('map takes no arguments'),
	`exit ${badMap.code}`
);
const badInit = cliResult(mapDir, 'init', '--nope');
check(
	'init refuses an unknown flag',
	badInit.code === 1 && badInit.out.includes('init takes no arguments besides --no-fix'),
	`exit ${badInit.code}`
);
const usage = cliResult(mapDir, 'bogus');
check(
	'the usage names the three commands',
	['init [--no-fix]', 'map', 'fix [component...]'].every((line) => usage.out.includes(line)),
	`exit ${usage.code}`
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? `all ${results.length} map-only checks passed` : `${failed.length} of ${results.length} map-only check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
