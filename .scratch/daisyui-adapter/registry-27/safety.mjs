// The safety seam: the guard, the two read-only flags and the marker count, driven through the real
// CLI against copies of the pinned stock components. Each fixture starts from the repo's own
// stylesheet and theme, so a passing check means the artifact moved, not a fixture.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
	COMPONENTS as FIX_COMPONENTS,
	PAIRS as FIX_PAIRS,
	SITES as FIX_SITES,
	SUPPORTED as FIX_SUPPORTED,
	uiDirectory
} from '../../../packages/daisyui-adapter/component-fix.mjs';
import {
	COMPONENTS,
	PAIRS,
	SITES,
	SUPPORTED,
	TARGETS
} from '../../../packages/daisyui-adapter/targets.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const STOCK = join(REPO, 'src', 'lib', 'components', 'ui');
const THEME = resolve(HERE, '..', 'registry-12', 'probe-theme.css');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-27-safety');

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const scaffold = (
	dir,
	{ components = COMPONENTS, style = 'mira', shadcn = '1.7.1', stub = true, dependency } = {}
) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));

	const json = { tailwind: { css: 'src/routes/layout.css' } };
	if (style) json.style = style;
	writeFileSync(join(dir, 'components.json'), JSON.stringify(json, null, '\t'));

	const project = {
		name: 'adapter-27-fixture',
		type: 'module',
		imports: { '#lib/*': './src/lib/*' }
	};
	if (dependency) project.devDependencies = { 'shadcn-svelte': dependency };
	writeFileSync(join(dir, 'package.json'), JSON.stringify(project, null, '\t'));

	// The CLI installs its own version when node_modules holds nothing, so this stub keeps the seam
	// off the registry.
	const adapter = join(dir, 'node_modules', ...NAME.split('/'), 'package.json');
	mkdirSync(dirname(adapter), { recursive: true });
	writeFileSync(adapter, JSON.stringify({ name: NAME, version: VERSION }, null, '\t'));

	if (stub) {
		const shadcnStub = join(dir, 'node_modules', 'shadcn-svelte', 'package.json');
		mkdirSync(dirname(shadcnStub), { recursive: true });
		writeFileSync(
			shadcnStub,
			JSON.stringify({ name: 'shadcn-svelte', version: shadcn }, null, '\t')
		);
	}

	const ui = uiDirectory(json, dir);
	if (components.length > 0) {
		mkdirSync(ui, { recursive: true });
		for (const component of components) {
			cpSync(join(STOCK, component), join(ui, component), { recursive: true });
		}
	}
	return ui;
};

const uiOf = (dir) =>
	uiDirectory(JSON.parse(readFileSync(join(dir, 'components.json'), 'utf8')), dir);
const pathOf = (dir, site) => join(uiOf(dir), ...site.file.split('/'));
const cssPathOf = (dir) => join(dir, 'src', 'routes', 'layout.css');
const readSiteFile = (dir, site) => readFileSync(pathOf(dir, site), 'utf8');
const replaceIn = (path, from, to) =>
	writeFileSync(path, readFileSync(path, 'utf8').replace(from, to));

const FILES = [...new Set(SITES.map((site) => site.file))];
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const snapshot = (dir) => [
	...FILES.map((file) => {
		const path = join(uiOf(dir), ...file.split('/'));
		return `${file}:${existsSync(path) ? digest(path) : 'absent'}`;
	}),
	`layout.css:${digest(cssPathOf(dir))}`
];

const cli = (dir, ...args) =>
	execFileSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
// A successful run can still warn on stderr, so both streams are kept.
const cliResult = (dir, ...args) => {
	const result = spawnSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8' });
	return { code: result.status ?? 1, out: `${result.stdout ?? ''}${result.stderr ?? ''}` };
};

const headerLines = (css) =>
	css.split(/\r?\n/).filter((line) => line.startsWith('/* ') && line.endsWith('*/'));
const headerFor = (n) => `/* ${NAME} ${VERSION} | components ${n} fixed | re-run `;

const middle = SITES.find((site) => site.id === 'range-middle');
const cellPathOf = (dir) => pathOf(dir, middle);
const customizeMiddle = (dir) =>
	replaceIn(
		cellPathOf(dir),
		middle.fixed,
		middle.fixed.replace('text-accent-foreground', 'text-red-500')
	);

check(
	'TARGETS.components holds the same nine names',
	TARGETS.components === COMPONENTS && COMPONENTS.length === 9,
	`${TARGETS.components.length}`
);
check(
	'TARGETS.sites holds the same eleven sites',
	TARGETS.sites === SITES && SITES.length === 11,
	`${TARGETS.sites.length}`
);
check(
	'TARGETS.pairs holds the same ten pairs',
	TARGETS.pairs === PAIRS && PAIRS.length === 10,
	`${TARGETS.pairs.length}`
);
check(
	'TARGETS.supported is the same object and holds no style gate',
	TARGETS.supported === SUPPORTED && !('style' in SUPPORTED),
	JSON.stringify(Object.keys(SUPPORTED))
);
check(
	'TARGETS.supported pins major 1 minor 7',
	SUPPORTED.version.major === 1 && SUPPORTED.version.minor === 7,
	`${SUPPORTED.version.major}.${SUPPORTED.version.minor}`
);
check(
	'component-fix re-exports the same arrays and supported object',
	FIX_COMPONENTS === COMPONENTS &&
		FIX_SITES === SITES &&
		FIX_PAIRS === PAIRS &&
		FIX_SUPPORTED === SUPPORTED
);

for (const style of ['vega', 'default', null]) {
	const label = style ?? 'missing';
	const anyStyle = join(WORK, `style-${label}`);
	scaffold(anyStyle, { style });
	const anyStyleRun = cliResult(anyStyle);
	check(`init accepts the ${label} style`, anyStyleRun.code === 0, `exit ${anyStyleRun.code}`);
	check(
		`init fixes every site under the ${label} style`,
		SITES.every((site) => readSiteFile(anyStyle, site).includes(site.fixed))
	);
}

const future = join(WORK, 'future-version');
scaffold(future, { shadcn: '1.8.0' });
const futureBefore = snapshot(future);
const futureRun = cliResult(future, 'fix');
check(
	'an unsupported version exits 1 and names it',
	futureRun.code === 1 &&
		futureRun.out.includes('unsupported shadcn-svelte version 1.8.0') &&
		futureRun.out.includes('1.7.x'),
	`exit ${futureRun.code}`
);
check(
	'an unsupported version writes nothing',
	snapshot(future).join('\n') === futureBefore.join('\n')
);

const unknownVersion = join(WORK, 'unknown-version');
scaffold(unknownVersion, { stub: false });
const unknownVersionRun = cliResult(unknownVersion, 'fix');
check(
	'an unreadable version warns and exits 0',
	unknownVersionRun.code === 0 &&
		unknownVersionRun.out.includes('cannot read the installed shadcn-svelte version'),
	`exit ${unknownVersionRun.code}`
);
check(
	'an unreadable version still fixes the files',
	readSiteFile(unknownVersion, SITES[0]).includes(SITES[0].fixed)
);

const rangeVersion = join(WORK, 'range-version');
scaffold(rangeVersion, { stub: false, dependency: '^1.7.1' });
const rangeVersionRun = cliResult(rangeVersion, 'fix');
check(
	'a supported dependency range with no node_modules entry exits 0',
	rangeVersionRun.code === 0,
	`exit ${rangeVersionRun.code}`
);

const mapOnly = join(WORK, 'map-only');
scaffold(mapOnly, { components: [], style: 'default' });
const mapOnlyRun = cliResult(mapOnly);
check(
	'init with no component present exits 0 even with another style',
	mapOnlyRun.code === 0,
	`exit ${mapOnlyRun.code}`
);
check(
	'a map-only init still maps 43 declarations per block',
	mapOnlyRun.out.includes('43 light, 43 dark')
);
check(
	'a map-only init prints nothing to fix',
	mapOnlyRun.out.includes('[daisyui-adapter] no target components found; nothing to fix')
);

const checkStock = join(WORK, 'check-stock');
scaffold(checkStock);
const checkStockBefore = snapshot(checkStock);
const checkStockRun = cliResult(checkStock, 'fix', '--check');
check('--check with stock sites exits 1', checkStockRun.code === 1, `exit ${checkStockRun.code}`);
check(
	'--check names the flag and the stock sites',
	checkStockRun.out.includes('--check:') && checkStockRun.out.includes('stock site(s) remain')
);
check(
	'--check with stock sites writes nothing',
	snapshot(checkStock).join('\n') === checkStockBefore.join('\n')
);

const checkFixed = join(WORK, 'check-fixed');
scaffold(checkFixed);
cli(checkFixed);
const checkFixedRun = cliResult(checkFixed, 'fix', '--check');
check('--check after init exits 0', checkFixedRun.code === 0, `exit ${checkFixedRun.code}`);

const checkCustom = join(WORK, 'check-customized');
scaffold(checkCustom);
cli(checkCustom);
customizeMiddle(checkCustom);
const checkCustomRun = cliResult(checkCustom, 'fix', '--check');
check(
	'--check accepts a customized site',
	checkCustomRun.code === 0,
	`exit ${checkCustomRun.code}`
);

const checkGone = join(WORK, 'check-gone');
scaffold(checkGone);
cli(checkGone);
rmSync(join(uiOf(checkGone), 'dialog'), { recursive: true, force: true });
const checkGoneRun = cliResult(checkGone, 'fix', '--check');
check(
	'--check accepts a deleted component directory',
	checkGoneRun.code === 0,
	`exit ${checkGoneRun.code}`
);

const checkDry = join(WORK, 'check-dry');
scaffold(checkDry);
const checkDryBefore = snapshot(checkDry);
const checkDryRun = cliResult(checkDry, 'fix', '--check', '--dry-run');
check(
	'--check with --dry-run still exits 1 on stock sites',
	checkDryRun.code === 1,
	`exit ${checkDryRun.code}`
);
check(
	'--check with --dry-run writes nothing',
	snapshot(checkDry).join('\n') === checkDryBefore.join('\n')
);

const strictCustom = join(WORK, 'strict-customized');
scaffold(strictCustom);
cli(strictCustom);
customizeMiddle(strictCustom);
const strictCustomBefore = snapshot(strictCustom);
const strictCustomRun = cliResult(strictCustom, 'fix', '--strict');
check(
	'--strict with a customized site exits 1',
	strictCustomRun.code === 1,
	`exit ${strictCustomRun.code}`
);
check('--strict names the flag on a customized site', strictCustomRun.out.includes('--strict:'));
check(
	'--strict with a customized site writes nothing',
	snapshot(strictCustom).join('\n') === strictCustomBefore.join('\n')
);

const strictDry = join(WORK, 'strict-dry');
scaffold(strictDry);
cli(strictDry);
customizeMiddle(strictDry);
const strictDryBefore = snapshot(strictDry);
const strictDryRun = cliResult(strictDry, 'fix', '--strict', '--dry-run');
check(
	'--strict with --dry-run still exits 1 on a customized site',
	strictDryRun.code === 1 && strictDryRun.out.includes('--strict:'),
	`exit ${strictDryRun.code}`
);
check(
	'--strict with --dry-run writes nothing',
	snapshot(strictDry).join('\n') === strictDryBefore.join('\n')
);

const strictDialog = join(WORK, 'strict-dialog');
scaffold(strictDialog);
cli(strictDialog);
rmSync(join(uiOf(strictDialog), 'dialog'), { recursive: true, force: true });
const strictDialogRun = cliResult(strictDialog, 'fix', '--strict', 'dialog');
check(
	'--strict dialog exits 1 when the named component is gone',
	strictDialogRun.code === 1 && strictDialogRun.out.includes('--strict:'),
	`exit ${strictDialogRun.code}`
);
check(
	'--strict dialog names the component in the error',
	strictDialogRun.out.includes('--strict: "dialog" has no target files'),
	strictDialogRun.out.trim().split('\n').at(-1)
);

const strictUnnamed = join(WORK, 'strict-unnamed');
scaffold(strictUnnamed);
cli(strictUnnamed);
rmSync(join(uiOf(strictUnnamed), 'dialog'), { recursive: true, force: true });
const strictUnnamedRun = cliResult(strictUnnamed, 'fix', '--strict');
check(
	'--strict accepts an unnamed deleted target',
	strictUnnamedRun.code === 0,
	`exit ${strictUnnamedRun.code}`
);

const strictNone = join(WORK, 'strict-none');
scaffold(strictNone, { components: [] });
const strictNoneRun = cliResult(strictNone, 'fix', '--strict');
check(
	'--strict with no components at all exits 0',
	strictNoneRun.code === 0,
	`exit ${strictNoneRun.code}`
);

const strictBoth = join(WORK, 'strict-both');
scaffold(strictBoth);
replaceIn(cellPathOf(strictBoth), middle.stock, 'class="hand-edited"');
const strictBothRun = cliResult(strictBoth, 'fix', '--check', '--strict');
check(
	'--check --strict exits 1 with stock and customized sites present',
	strictBothRun.code === 1,
	`exit ${strictBothRun.code}`
);

const fresh = join(WORK, 'header-fresh');
scaffold(fresh);
cli(fresh);
const freshCss = readFileSync(cssPathOf(fresh), 'utf8');
const freshHeaders = headerLines(freshCss);
check(
	'a fresh init writes exactly one header line',
	freshHeaders.length === 1,
	`${freshHeaders.length}`
);
check(
	'a fresh init counts the ten fully fixed files',
	freshHeaders[0]?.startsWith(headerFor(10)) && freshHeaders[0].endsWith('*/'),
	freshHeaders[0]
);

const mixed = join(WORK, 'header-mixed');
scaffold(mixed);
cli(mixed);
customizeMiddle(mixed);
const mixedBefore = readFileSync(cssPathOf(mixed), 'utf8');
const mixedRun = cliResult(mixed, 'fix');
const mixedCss = readFileSync(cssPathOf(mixed), 'utf8');
const mixedHeaders = headerLines(mixedCss);
check(
	'a write-mode fix counts nine fully fixed files after one site is customized',
	mixedRun.code === 0 && mixedHeaders.length === 1 && mixedHeaders[0].startsWith(headerFor(9)),
	`exit ${mixedRun.code} :: ${mixedHeaders[0]}`
);
check(
	'a header update leaves every other stylesheet byte intact',
	mixedCss.slice(mixedCss.indexOf('\n')) === mixedBefore.slice(mixedBefore.indexOf('\n'))
);
check(
	'a customized site stays customized through a write-mode fix',
	readFileSync(cellPathOf(mixed), 'utf8').includes('text-red-500')
);

const noop = join(WORK, 'header-noop');
scaffold(noop);
cli(noop);
const noopCss = readFileSync(cssPathOf(noop), 'utf8');
const noopBefore = snapshot(noop);
const noopFirst = cliResult(noop, 'fix');
const noopSecond = cliResult(noop, 'fix');
const noopHeaders = headerLines(readFileSync(cssPathOf(noop), 'utf8'));
check(
	'a no-op fix keeps the header byte-identical',
	noopFirst.code === 0 && noopSecond.code === 0 && readFileSync(cssPathOf(noop), 'utf8') === noopCss
);
check(
	'a no-op fix keeps every target file byte-identical',
	snapshot(noop).join('\n') === noopBefore.join('\n')
);
check(
	'a no-op fix keeps the count unchanged',
	noopHeaders.length === 1 && noopHeaders[0].startsWith(headerFor(10)),
	noopHeaders[0]
);

const oldHeader = join(WORK, 'header-old');
scaffold(oldHeader);
cli(oldHeader);
const oldHeaderCss = readFileSync(cssPathOf(oldHeader), 'utf8');
const oldHeaderText = `/* ${NAME} 0.0.9 | re-run \`pnpm dlx ${NAME}@0.0.9 init\` after \`shadcn-svelte init\` */`;
writeFileSync(
	cssPathOf(oldHeader),
	oldHeaderCss.replace(headerLines(oldHeaderCss)[0], oldHeaderText)
);
const oldHeaderRun = cliResult(oldHeader, 'fix');
const oldHeaderAfter = headerLines(readFileSync(cssPathOf(oldHeader), 'utf8'));
check(
	'an old-format header is replaced, not stacked',
	oldHeaderRun.code === 0 && oldHeaderAfter.length === 1,
	`exit ${oldHeaderRun.code} :: ${oldHeaderAfter.length} header line(s)`
);
check(
	'the replaced header is the current count',
	oldHeaderAfter[0]?.startsWith(headerFor(10)),
	oldHeaderAfter[0]
);

const late = join(WORK, 'header-late');
const lateUi = scaffold(late, { components: [] });
cli(late);
const lateInitHeader = headerLines(readFileSync(cssPathOf(late), 'utf8'));
check(
	'an init with no components records zero fully fixed files',
	lateInitHeader.length === 1 && lateInitHeader[0].startsWith(headerFor(0)),
	lateInitHeader[0]
);
mkdirSync(lateUi, { recursive: true });
for (const component of COMPONENTS)
	cpSync(join(STOCK, component), join(lateUi, component), { recursive: true });
const lateRun = cliResult(late, 'fix');
const lateHeader = headerLines(readFileSync(cssPathOf(late), 'utf8'));
check(
	'a write-mode fix after components arrive counts ten',
	lateRun.code === 0 && lateHeader.length === 1 && lateHeader[0].startsWith(headerFor(10)),
	`exit ${lateRun.code} :: ${lateHeader[0]}`
);

const checkHeader = join(WORK, 'check-header');
const checkHeaderUi = scaffold(checkHeader, { components: [] });
cli(checkHeader);
mkdirSync(checkHeaderUi, { recursive: true });
for (const component of COMPONENTS)
	cpSync(join(STOCK, component), join(checkHeaderUi, component), { recursive: true });
const checkHeaderBefore = readFileSync(cssPathOf(checkHeader), 'utf8');
const checkHeaderRun = cliResult(checkHeader, 'fix', '--check');
const checkHeaderAfter = headerLines(readFileSync(cssPathOf(checkHeader), 'utf8'));
check('--check still exits 1 here', checkHeaderRun.code === 1, `exit ${checkHeaderRun.code}`);
check(
	'--check never rewrites the header',
	readFileSync(cssPathOf(checkHeader), 'utf8') === checkHeaderBefore &&
		checkHeaderAfter.length === 1 &&
		checkHeaderAfter[0].startsWith(headerFor(0)),
	checkHeaderAfter[0]
);

const dryHeader = join(WORK, 'header-dry-run');
scaffold(dryHeader);
cli(dryHeader);
cpSync(join(STOCK, 'dialog', 'dialog-content.svelte'), pathOf(dryHeader, SITES[0]));
const dryHeaderBefore = snapshot(dryHeader);
const dryHeaderRun = cliResult(dryHeader, 'fix', '--dry-run');
const dryHeaderAfter = headerLines(readFileSync(cssPathOf(dryHeader), 'utf8'));
check(
	'a dry run exits 0 with a stock site back',
	dryHeaderRun.code === 0,
	`exit ${dryHeaderRun.code}`
);
check(
	'a dry run never rewrites a stale header',
	dryHeaderAfter.length === 1 &&
		dryHeaderAfter[0].startsWith(headerFor(10)) &&
		snapshot(dryHeader).join('\n') === dryHeaderBefore.join('\n'),
	dryHeaderAfter[0]
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? 'all safety checks passed' : `${failed.length} safety check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
