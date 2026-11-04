// The surface seam: the box table, the pinned stock, the excluded edge sites, the applied fixture,
// the four states, the header count and the scale. Every fixture starts from the repo's own
// stylesheet and theme, so a passing check means the artifact moved, not a fixture.
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { uiDirectory } from '../../../packages/daisyui-adapter/component-fix.mjs';
import {
	COMPONENTS,
	ROLE_STEPS,
	SITES,
	SURFACES,
	SURFACE_COMPONENTS,
	TARGETS
} from '../../../packages/daisyui-adapter/targets.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const STOCK = join(REPO, 'src', 'lib', 'components', 'ui');
const THEME = resolve(HERE, '..', 'registry-12', 'probe-theme.css');
const LAYOUT = join(REPO, 'src', 'routes', 'layout.css');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-29-surfaces');

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const SURFACE_FILES = [...new Set(SURFACES.map((site) => site.file))];
const FIXTURE = [...new Set([...SURFACE_COMPONENTS, ...COMPONENTS])];

const scaffold = (dir, { components = FIXTURE, style = 'mira', shadcn = '1.8.0' } = {}) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));

	const json = { tailwind: { css: 'src/routes/layout.css' }, style };
	writeFileSync(join(dir, 'components.json'), JSON.stringify(json, null, '\t'));
	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify(
			{ name: 'adapter-29-fixture', type: 'module', imports: { '#lib/*': './src/lib/*' } },
			null,
			'\t'
		)
	);

	const adapter = join(dir, 'node_modules', ...NAME.split('/'), 'package.json');
	mkdirSync(dirname(adapter), { recursive: true });
	writeFileSync(adapter, JSON.stringify({ name: NAME, version: VERSION }, null, '\t'));
	const shadcnStub = join(dir, 'node_modules', 'shadcn-svelte', 'package.json');
	mkdirSync(dirname(shadcnStub), { recursive: true });
	writeFileSync(shadcnStub, JSON.stringify({ name: 'shadcn-svelte', version: shadcn }, null, '\t'));

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
const textOf = (dir, file) => readFileSync(join(uiOf(dir), ...file.split('/')), 'utf8');
const pathOf = (dir, file) => join(uiOf(dir), ...file.split('/'));
const cssPathOf = (dir) => join(dir, 'src', 'routes', 'layout.css');
const replaceIn = (path, from, to) =>
	writeFileSync(path, readFileSync(path, 'utf8').replace(from, to));

const cli = (dir, ...args) =>
	execFileSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
const cliResult = (dir, ...args) => {
	const result = spawnSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8' });
	return { code: result.status ?? 1, out: `${result.stdout ?? ''}${result.stderr ?? ''}` };
};

const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const surfaceSnapshot = (dir) =>
	SURFACE_FILES.map((file) => `${file}:${digest(pathOf(dir, file))}`);
const countOf = (text, needle) => text.split(needle).length - 1;

const walk = (dir) => {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...walk(path));
		else out.push(path);
	}
	return out;
};

const byId = (id) => SURFACES.find((site) => site.id === id);

const headerLines = (css) =>
	css.split(/\r?\n/).filter((line) => line.startsWith('/* ') && line.endsWith('*/'));
const headerFor = (n) => `/* ${NAME} ${VERSION} | components ${n} fixed | re-run `;

const COEFFICIENTS = { sm: 0.6, md: 0.8, lg: 1, xl: 1.4, '2xl': 1.8, '3xl': 2.2, '4xl': 2.6 };
const scaleRows = (css) =>
	[...css.matchAll(/^\t--radius-(sm|md|lg|xl|2xl|3xl|4xl):[^\n]*$/gm)].map((match) => {
		const factor = /calc\(var\(--radius\) \* ([\d.]+)\)/.exec(match[0]);
		return { step: match[1], k: factor ? Number(factor[1]) : 1, text: match[0] };
	});
const calendarCounts = (ui) => {
	const out = new Map();
	for (const dir of ['calendar', 'range-calendar']) {
		for (const path of walk(join(ui, dir))) {
			out.set(path, countOf(readFileSync(path, 'utf8'), '--cell-radius'));
		}
	}
	return out;
};

check(
	'TARGETS.surfaces is the SURFACES table',
	TARGETS.surfaces === SURFACES,
	`${SURFACES.length}`
);
check(
	'TARGETS.surfaceComponents is SURFACE_COMPONENTS',
	TARGETS.surfaceComponents === SURFACE_COMPONENTS,
	`${SURFACE_COMPONENTS.length}`
);
// Copied from the ticket instead of derived from the manifest, so a wrong table cannot agree with
// itself.
const EXPECTED_COMPONENTS = [
	'card',
	'dialog',
	'alert',
	'popover',
	'dropdown-menu',
	'context-menu',
	'menubar',
	'sheet',
	'drawer',
	'navigation-menu',
	'command',
	'hover-card',
	'table',
	'calendar'
];
check(
	'SURFACE_COMPONENTS is the fourteen named components',
	SURFACE_COMPONENTS.length === EXPECTED_COMPONENTS.length &&
		EXPECTED_COMPONENTS.every((name, i) => SURFACE_COMPONENTS[i] === name),
	SURFACE_COMPONENTS.join(', ')
);
check('the box role maps to lg', ROLE_STEPS.box === 'lg', ROLE_STEPS.box);
const wrongStep = SURFACES.filter(
	(site) => site.role !== 'box' || site.step !== ROLE_STEPS[site.role]
).map((site) => site.id);
check('every surface entry is a box at the box step', wrongStep.length === 0, wrongStep.join(', '));
const wrongComponent = SURFACES.filter((site) => !SURFACE_COMPONENTS.includes(site.component)).map(
	(site) => site.id
);
check(
	'every surface component is in SURFACE_COMPONENTS',
	wrongComponent.length === 0,
	wrongComponent.join(', ')
);
const wrongDirectory = SURFACES.filter((site) => site.file.split('/')[0] !== site.component).map(
	(site) => site.id
);
check(
	'every surface file sits under its component directory',
	wrongDirectory.length === 0,
	wrongDirectory.join(', ')
);
const ranged = SURFACES.filter((site) => site.file.startsWith('range-calendar/')).map(
	(site) => site.id
);
check('no surface file is a range-calendar file', ranged.length === 0, ranged.join(', '));

const missingStock = SURFACES.filter((site) => {
	const path = join(STOCK, ...site.file.split('/'));
	if (!existsSync(path)) return true;
	return countOf(readFileSync(path, 'utf8'), site.stock) !== 1;
}).map((site) => site.id);
check(
	'every surface stock string occurs exactly once in the pinned file',
	missingStock.length === 0,
	missingStock.join(', ')
);
const noLg = SURFACES.filter((site) => !site.fixed.includes('rounded-lg')).map((site) => site.id);
check('every fixed string writes rounded-lg', noLg.length === 0, noLg.join(', '));
const none = SURFACES.filter((site) => site.fixed.includes('rounded-none')).map((site) => site.id);
check('no fixed string writes rounded-none', none.length === 0, none.join(', '));
const full = SURFACES.filter((site) => site.fixed.includes('rounded-full')).map((site) => site.id);
check('no fixed string writes rounded-full', full.length === 0, full.join(', '));
// A 1.8 stock that already holds the box step is an assertion: the fixer reports it fixed and
// writes nothing, so its stock and fixed are the same string on purpose.
const unchanged = SURFACES.filter((site) => site.stock === site.fixed);
check(
	'every entry changes its stock string or already holds the box step',
	unchanged.every((site) => site.fixed.includes('rounded-lg')),
	unchanged.map((site) => site.id).join(', ')
);
check(
	'no changed entry hides its fixed inside its own stock',
	SURFACES.every((site) => site.stock === site.fixed || !site.stock.includes(site.fixed)),
	SURFACES.filter((site) => site.stock !== site.fixed && site.stock.includes(site.fixed))
		.map((site) => site.id)
		.join(', ')
);

const pinnedTooltip = readFileSync(join(STOCK, 'chart', 'chart-tooltip.svelte'), 'utf8');
check('the chart tooltip already carries rounded-lg', pinnedTooltip.includes('rounded-lg'));
check(
	'the chart tooltip has no surface entry',
	!SURFACES.some((site) => site.file.startsWith('chart/')),
	SURFACES.filter((site) => site.file.startsWith('chart/'))
		.map((site) => site.id)
		.join(', ')
);
const pinnedIndicator = readFileSync(
	join(STOCK, 'navigation-menu', 'navigation-menu-indicator.svelte'),
	'utf8'
);
// 1.8 moved the pointer to rounded-tl-sm; the table still excludes it, so the adapter leaves the
// stock radius alone instead of forcing the box step onto the arrow.
check(
	'the navigation menu indicator keeps its own stock radius',
	pinnedIndicator.includes('rounded-tl-sm')
);
check(
	'the navigation menu indicator has no surface entry',
	!SURFACES.some((site) => site.file.endsWith('navigation-menu-indicator.svelte')),
	SURFACES.filter((site) => site.file.endsWith('navigation-menu-indicator.svelte'))
		.map((site) => site.id)
		.join(', ')
);

const applied = join(WORK, 'applied');
const appliedUi = scaffold(applied);
const cellBefore = calendarCounts(appliedUi);
const appliedRun = cliResult(applied);
check('init over the surface fixture exits 0', appliedRun.code === 0, `exit ${appliedRun.code}`);

const cellAfter = calendarCounts(appliedUi);
const drifted = [...cellBefore]
	.filter(([path, count]) => cellAfter.get(path) !== count)
	.map(([path]) => path.slice(path.indexOf('ui') + 3));
check(
	'every calendar file keeps its --cell-radius occurrences',
	drifted.length === 0,
	drifted.join(', ')
);

const notWritten = SURFACES.filter((site) => !textOf(applied, site.file).includes(site.fixed)).map(
	(site) => site.id
);
check(
	'every surface fixed string is present in its file',
	notWritten.length === 0,
	notWritten.join(', ')
);
const leftovers = SURFACE_FILES.filter((file) => textOf(applied, file).includes('rounded-none'));
check('no surface file keeps a rounded-none', leftovers.length === 0, leftovers.join(', '));

const CONTRAST = [
	'dialog-close',
	'sheet-close',
	'calendar-hover',
	'range-hover',
	'range-middle',
	'range-middle-hover',
	'dropdown-destructive',
	'context-destructive',
	'menubar-destructive',
	'chart-tooltip-label',
	'bubble-muted'
];
const lostContrast = CONTRAST.filter((id) => {
	const site = SITES.find((entry) => entry.id === id);
	return !textOf(applied, site.file).includes(site.fixed);
});
check(
	'every contrast site in a shared file still holds its fixed string',
	lostContrast.length === 0,
	lostContrast.join(', ')
);

const headCell = textOf(applied, 'calendar/calendar-head-cell.svelte');
const monthSelect = textOf(applied, 'calendar/calendar-month-select.svelte');
const yearSelect = textOf(applied, 'calendar/calendar-year-select.svelte');
check(
	'the calendar head cell, month and year selects carry their rounded-lg',
	headCell.includes(byId('calendar-head-cell').fixed) &&
		monthSelect.includes(byId('calendar-month-select').fixed) &&
		monthSelect.includes(byId('calendar-month-select-label').fixed) &&
		yearSelect.includes(byId('calendar-year-select').fixed) &&
		yearSelect.includes(byId('calendar-year-select-label').fixed)
);

const day = textOf(applied, 'calendar/calendar-day.svelte');
const rangeDay = textOf(applied, 'range-calendar/range-calendar-day.svelte');
check(
	'the rounded cell radius utility survives',
	day.includes('rounded-(--cell-radius)') && rangeDay.includes('rounded-(--cell-radius)')
);
const cell = textOf(applied, 'calendar/calendar-cell.svelte');
const rangeCell = textOf(applied, 'range-calendar/range-calendar-cell.svelte');
check(
	'the edge-joining cell radius utilities survive',
	cell.includes('rounded-s-(--cell-radius)') &&
		cell.includes('rounded-e-(--cell-radius)') &&
		rangeCell.includes('rounded-s-(--cell-radius)') &&
		rangeCell.includes('rounded-e-(--cell-radius)')
);

// 10 contrast files + 39 surface files - 5 shared = 44 fully fixed files.
const appliedHeader = headerLines(readFileSync(cssPathOf(applied), 'utf8'));
check(
	'the header records forty-four fully fixed files',
	appliedHeader.length === 1 && appliedHeader[0].startsWith(headerFor(44)),
	appliedHeader[0]
);

const appliedCheck = cliResult(applied, 'fix', '--check');
check('--check exits 0 after init', appliedCheck.code === 0, `exit ${appliedCheck.code}`);
const appliedStrict = cliResult(applied, 'fix', '--strict');
check('--strict exits 0 after init', appliedStrict.code === 0, `exit ${appliedStrict.code}`);

const surfaceBefore = surfaceSnapshot(applied);
const cssBefore = digest(cssPathOf(applied));
const second = cliResult(applied, 'fix');
check(
	'a second fix exits 0 and reports every site fixed',
	second.code === 0 && second.out.includes('fix: 0 stock'),
	`exit ${second.code}`
);
check(
	'a second fix leaves every surface file byte-identical',
	surfaceSnapshot(applied).join('\n') === surfaceBefore.join('\n')
);
check(
	'a second fix leaves the stylesheet byte-identical',
	digest(cssPathOf(applied)) === cssBefore
);

const checkStock = join(WORK, 'check-stock');
scaffold(checkStock);
cli(checkStock);
replaceIn(
	pathOf(checkStock, 'card/card-header.svelte'),
	byId('card-header').fixed,
	byId('card-header').stock
);
const checkStockBefore = surfaceSnapshot(checkStock);
const checkStockRun = cliResult(checkStock, 'fix', '--check');
check(
	'--check with a stock surface site exits 1',
	checkStockRun.code === 1,
	`exit ${checkStockRun.code}`
);
check(
	'--check with a stock surface site writes nothing',
	surfaceSnapshot(checkStock).join('\n') === checkStockBefore.join('\n')
);

const states = join(WORK, 'states');
scaffold(states, { components: ['calendar'] });
cli(states);
const statesMonth = pathOf(states, 'calendar/calendar-month-select.svelte');
replaceIn(
	statesMonth,
	byId('calendar-month-select').fixed,
	'relative flex rounded-xl border border-input shadow-xs'
);
replaceIn(
	pathOf(states, 'calendar/calendar-year-select.svelte'),
	byId('calendar-year-select-label').fixed,
	byId('calendar-year-select-label').stock
);
const statesRun = cliResult(states, 'fix', 'calendar');
const statesText = readFileSync(statesMonth, 'utf8');
check(
	'a hand-edited surface site reports customized',
	statesRun.out.includes(
		'calendar calendar-month-select (calendar/calendar-month-select.svelte): customized'
	),
	statesRun.out
		.trim()
		.split('\n')
		.find((line) => line.includes('calendar-month-select '))
);
check(
	'the hand edit survives the run',
	statesText.includes('relative flex rounded-xl border border-input shadow-xs')
);
check(
	'a restored stock surface site reports stock and is rewritten',
	statesRun.out.includes(
		'calendar calendar-year-select-label (calendar/calendar-year-select.svelte): stock -> fixed'
	) &&
		textOf(states, 'calendar/calendar-year-select.svelte').includes(
			byId('calendar-year-select-label').fixed
		),
	statesRun.out
		.trim()
		.split('\n')
		.find((line) => line.includes('calendar-year-select-label'))
);
check(
	'the sibling site in the first file stays fixed',
	statesText.includes(byId('calendar-month-select-label').fixed) &&
		!statesText.includes(byId('calendar-month-select-label').stock)
);

const missing = join(WORK, 'missing');
scaffold(missing);
cli(missing);
const missingFile = 'hover-card/hover-card-content.svelte';
rmSync(pathOf(missing, missingFile), { force: true });
const missingRun = cliResult(missing, 'fix');
check(
	'a surface file deleted while its directory remains reports missing and is not recreated',
	missingRun.code === 0 &&
		missingRun.out.includes(`hover-card hover-card-content (${missingFile}): missing`) &&
		!existsSync(pathOf(missing, missingFile)),
	`exit ${missingRun.code}`
);
check(
	'a missing surface file drops the header count by one',
	headerLines(readFileSync(cssPathOf(missing), 'utf8'))[0]?.startsWith(headerFor(43)),
	headerLines(readFileSync(cssPathOf(missing), 'utf8'))[0]
);

const rows = scaleRows(readFileSync(LAYOUT, 'utf8'));
const factors = Object.fromEntries(rows.map((row) => [row.step, row.k]));
check(
	'the scale rows carry the linear coefficients',
	rows.length === 7 && Object.entries(COEFFICIENTS).every(([step, k]) => factors[step] === k),
	JSON.stringify(factors)
);
check(
	'at --radius: 0 every step is 0',
	rows.length === 7 &&
		rows.every(
			(row) =>
				/^--radius-(sm|md|lg|xl|2xl|3xl|4xl): (?:calc\(var\(--radius\) \* [\d.]+\)|var\(--radius\));$/.test(
					row.text.trim()
				) && 0 * row.k === 0
		)
);
check(
	'at 10rem sm < md < lg, now that lg applies to the surfaces',
	factors.sm * 10 < factors.md * 10 && factors.md * 10 < factors.lg * 10,
	`${factors.sm * 10} < ${factors.md * 10} < ${factors.lg * 10}`
);
check(
	'no scale row uses clamp(), min() or max()',
	rows.every((row) => !/clamp\(|min\(|max\(/.test(row.text)),
	rows.find((row) => /clamp\(|min\(|max\(/.test(row.text))?.text
);
const binding = /\t--radius: ([^;]+);/.exec(readFileSync(cssPathOf(applied), 'utf8'))?.[1] ?? '';
check(
	'the written --radius binding has no clamp, min or max',
	binding.length > 0 && !/clamp\(|min\(|max\(/.test(binding),
	binding
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? `all ${results.length} surfaces checks passed` : `${failed.length} of ${results.length} surfaces check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
