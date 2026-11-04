// The add-then-fix prerequisite, proved on a freshly packed project.
//
// Usage: node prove.mjs <evidence dir>
// Runs with cwd = the app root the harness just built, so `components.json`, the stylesheet and
// `src/lib/components/ui` are the app's own copies.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

if (!process.argv[2]) throw new Error('usage: node prove.mjs <evidence dir>');
const APP = process.cwd();
const EVIDENCE = resolve(process.argv[2]);
const HARNESS = import.meta.dirname;
const CLI = resolve(HARNESS, '..', '..', '..', 'packages', 'daisyui-adapter', 'cli', 'init.mjs');
const PNPM = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const report = { ok: false };

const assert = (condition, message) => {
	if (!condition) throw new Error(message);
};

const write = (name, text) => writeFileSync(join(EVIDENCE, name), text);

const execute = (command, args, env) =>
	spawnSync(command, args, {
		cwd: APP,
		encoding: 'utf8',
		timeout: 600_000,
		env,
		shell: command === PNPM && process.platform === 'win32'
	});

const cli = (args) => {
	const result = execute(process.execPath, [CLI, ...args], {
		...process.env,
		DAISYUI_ADAPTER_INSTALL_SPEC: SPEC
	});
	return {
		code: result.status ?? 1,
		output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
	};
};

const readComponents = () => JSON.parse(readFileSync(join(APP, 'components.json'), 'utf8'));

const tarballs = readdirSync(APP).filter((file) => file.endsWith('.tgz'));
if (tarballs.length !== 1) {
	throw new Error(`expected one *.tgz in ${APP}, found ${tarballs.length}: ${tarballs.join(', ')}`);
}
const SPEC = `./${tarballs[0]}`;
if (!process.env.COMPONENTS_REGISTRY_URL) {
	throw new Error('prove.mjs needs COMPONENTS_REGISTRY_URL pointing at the pin registry');
}

const components = readComponents();
if (!components.tailwind?.css) throw new Error('components.json has no tailwind.css path');
const STYLESHEET = resolve(APP, components.tailwind.css);
const SHEET = join(APP, 'src', 'lib', 'components', 'ui', 'sheet', 'sheet-content.svelte');
const STOCK_SHEET = 'class="absolute top-4 right-4 bg-secondary"';
const FIXED_SHEET = 'class="absolute top-4 right-4 bg-muted"';

const walk = (dir) =>
	readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		return entry.isDirectory() ? walk(path) : [path];
	});

const treeSha = () => {
	const files = [STYLESHEET, ...walk(join(APP, 'src', 'lib', 'components', 'ui'))]
		.map((path) => ({
			rel: relative(APP, path).replaceAll('\\', '/'),
			bytes: readFileSync(path)
		}))
		.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
	const hash = createHash('sha256');
	for (const file of files) {
		hash.update(file.rel);
		hash.update('\0');
		hash.update(file.bytes);
	}
	return hash.digest('hex');
};

const counts = (log) => {
	const match = /fix: (\d+) stock, (\d+) fixed, (\d+) customized, (\d+) missing/.exec(log);
	if (!match) throw new Error(`fix counts not found in:\n${log.slice(-2000)}`);
	return {
		stock: Number(match[1]),
		fixed: Number(match[2]),
		customized: Number(match[3]),
		missing: Number(match[4])
	};
};

const header = () => readFileSync(STYLESHEET, 'utf8').split(/\r?\n/)[0];

try {
	const init1 = cli(['init']);
	write('01-init-1.log', init1.output);
	assert(init1.code === 0, `init 1 exited ${init1.code}:\n${init1.output.slice(-4000)}`);
	assert(
		init1.output.includes('sheet sheet-close (sheet/sheet-content.svelte): missing'),
		'init 1 did not report the sheet site as missing'
	);
	assert(!existsSync(SHEET), `init 1 fixed a component that was never added: ${SHEET}`);
	const sheetMissing = !existsSync(join(APP, 'src', 'lib', 'components', 'ui', 'sheet'));
	const sha1 = treeSha();
	write('02-init-1.sha', `${sha1}\n`);

	const init2 = cli(['init']);
	write('03-init-2.log', init2.output);
	assert(init2.code === 0, `init 2 exited ${init2.code}:\n${init2.output.slice(-4000)}`);
	const sha2 = treeSha();
	write('04-init-2.sha', `${sha2}\n`);
	assert(sha1 === sha2, 'init is not idempotent: the stylesheet or component tree moved');
	report.init = {
		runs: 2,
		identical: sha1 === sha2,
		sha: sha1,
		sheetMissing,
		header: header(),
		counts: counts(init1.output)
	};

	const add = execute(PNPM, ['dlx', 'shadcn-svelte@latest', 'add', 'sheet', '-y', '-o'], {
		...process.env
	});
	write('05-late-add.log', `${add.stdout ?? ''}${add.stderr ?? ''}`.trim());
	assert(add.status === 0, `late add of sheet exited ${add.status}`);
	assert(existsSync(SHEET), `late add left no ${SHEET}`);

	copyFileSync(SHEET, join(EVIDENCE, 'sheet-before.svelte'));
	const before = readFileSync(SHEET, 'utf8');
	report.lateAdd = {
		component: 'sheet',
		file: 'src/lib/components/ui/sheet/sheet-content.svelte',
		stockBefore: before.includes(STOCK_SHEET),
		fixedAfter: false
	};
	assert(
		before.includes(STOCK_SHEET),
		`the late-added sheet is not the pinned stock: ${STOCK_SHEET}`
	);
	assert(!before.includes(FIXED_SHEET), 'the late-added sheet was already fixed');

	const fix1 = cli(['fix']);
	write('06-fix-1.log', fix1.output);
	assert(fix1.code === 0, `fix 1 exited ${fix1.code}:\n${fix1.output.slice(-4000)}`);
	assert(
		fix1.output.includes('sheet sheet-close (sheet/sheet-content.svelte): stock -> fixed'),
		'fix 1 did not report the sheet site as stock -> fixed'
	);
	const fixSha1 = treeSha();
	write('07-fix-1.sha', `${fixSha1}\n`);
	copyFileSync(SHEET, join(EVIDENCE, 'sheet-after.svelte'));
	const after = readFileSync(SHEET, 'utf8');
	assert(after.includes(FIXED_SHEET), `fix 1 did not write ${FIXED_SHEET}`);
	report.lateAdd.fixedAfter = after.includes(FIXED_SHEET);
	const headerLine = header();
	write('08-header.txt', `${headerLine}\n`);
	report.init.header = headerLine;

	const fix2 = cli(['fix']);
	write('09-fix-2.log', fix2.output);
	assert(fix2.code === 0, `fix 2 exited ${fix2.code}:\n${fix2.output.slice(-4000)}`);
	const fixSha2 = treeSha();
	write('10-fix-2.sha', `${fixSha2}\n`);
	assert(fixSha1 === fixSha2, 'fix is not idempotent: the stylesheet or component tree moved');
	report.fix = { runs: 2, identical: fixSha1 === fixSha2, sha: fixSha1 };

	const check = cli(['fix', '--check']);
	write('11-check.log', check.output);
	assert(check.code === 0, `fix --check exited ${check.code}:\n${check.output.slice(-4000)}`);
	report.fix.checkExit = check.code;

	report.ok = true;
} catch (error) {
	report.error = String(error.message ?? error);
}

write('prove.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.ok ? 0 : 1;
