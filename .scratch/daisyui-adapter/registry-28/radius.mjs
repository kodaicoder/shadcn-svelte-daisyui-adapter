// The radius seam: the form-control table, the fixer's applied result, the excluded circles, the
// calendar custom property, the four states, the header, the two read-only flags and the scale and
// warning edges. Every fixture starts from the repo's own stylesheet and theme, so a passing check
// means the artifact moved, not a fixture.
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
	RADIUS,
	RADIUS_COMPONENTS,
	ROLE_STEPS,
	SIZE_STEPS,
	TARGETS
} from '../../../packages/daisyui-adapter/targets.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const STOCK = join(REPO, 'src', 'lib', 'components', 'ui');
const THEME = resolve(HERE, '..', 'registry-12', 'probe-theme.css');
const LAYOUT = join(REPO, 'src', 'routes', 'layout.css');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-28-radius');

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const RADIUS_DIRS = [...new Set(RADIUS.map((site) => site.file.split('/')[0]))];
const FIXTURE = [...RADIUS_DIRS, 'radio-group', 'calendar', 'range-calendar'];
const RADIUS_FILES = [...new Set(RADIUS.map((site) => site.file))];

const scaffold = (dir, { components = FIXTURE, style = 'mira', shadcn = '1.7.1' } = {}) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));

	const json = { tailwind: { css: 'src/routes/layout.css' }, style };
	writeFileSync(join(dir, 'components.json'), JSON.stringify(json, null, '\t'));
	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify(
			{ name: 'adapter-28-fixture', type: 'module', imports: { '#lib/*': './src/lib/*' } },
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
const formSnapshot = (dir) => RADIUS_FILES.map((file) => `${file}:${digest(pathOf(dir, file))}`);
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

const byId = (id) => RADIUS.find((site) => site.id === id);

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

check('TARGETS.radius is the RADIUS table', TARGETS.radius === RADIUS, `${RADIUS.length}`);
check(
	'TARGETS.radiusComponents is RADIUS_COMPONENTS',
	TARGETS.radiusComponents === RADIUS_COMPONENTS,
	`${RADIUS_COMPONENTS.length}`
);
// Copied from the ticket instead of derived from the manifest, so a wrong table cannot agree with
// itself.
const EXPECTED_COMPONENTS = [
	'button',
	'toggle',
	'input',
	'textarea',
	'native-select',
	'select',
	'input-group',
	'input-group-button',
	'checkbox',
	'radio-group',
	'switch'
];
check(
	'RADIUS_COMPONENTS is the eleven named components',
	RADIUS_COMPONENTS.length === EXPECTED_COMPONENTS.length &&
		EXPECTED_COMPONENTS.every((name, i) => RADIUS_COMPONENTS[i] === name),
	RADIUS_COMPONENTS.join(', ')
);
check(
	'every radius component is in RADIUS_COMPONENTS',
	RADIUS.every((site) => RADIUS_COMPONENTS.includes(site.component))
);
check(
	'every radius file sits under a named component directory',
	RADIUS.every((site) => RADIUS_COMPONENTS.includes(site.file.split('/')[0])),
	RADIUS.filter((site) => !RADIUS_COMPONENTS.includes(site.file.split('/')[0]))
		.map((site) => site.id)
		.join(', ')
);
const missingStock = RADIUS.filter((site) => {
	const path = join(STOCK, ...site.file.split('/'));
	return !existsSync(path) || !readFileSync(path, 'utf8').includes(site.stock);
}).map((site) => site.id);
check(
	'every radius stock string is present in the pinned file',
	missingStock.length === 0,
	missingStock.join(', ')
);
const circles = RADIUS.filter((site) => site.fixed.includes('rounded-full')).map((site) => site.id);
check('no fixed string contains rounded-full', circles.length === 0, circles.join(', '));
const wrongStep = RADIUS.filter((site) => {
	const step = site.role ? ROLE_STEPS[site.role] : SIZE_STEPS[site.size];
	return site.step !== step;
}).map((site) => site.id);
check('every step matches its role or size', wrongStep.length === 0, wrongStep.join(', '));
const bothOrNeither = RADIUS.filter((site) => Boolean(site.role) === Boolean(site.size)).map(
	(site) => site.id
);
check(
	'every entry carries exactly one of role or size',
	bothOrNeither.length === 0,
	bothOrNeither.join(', ')
);
const wrongClass = RADIUS.filter((site) => {
	const rungs = [...site.fixed.matchAll(/(?:(\S+):)?rounded-(sm|md|lg)(?![\w-])/g)].map(
		(match) => ({ modifier: match[1], rung: match[2] })
	);
	if (rungs.length === 0) return true;
	return rungs.some(
		({ modifier, rung }) =>
			rung !== site.step && !(modifier === 'data-[size=sm]' && rung === 'sm' && site.step === 'md')
	);
}).map((site) => site.id);
check(
	'every fixed string writes its step, with only the sm data-size as a smaller override',
	wrongClass.length === 0,
	wrongClass.join(', ')
);
check(
	'every step is sm, md or lg',
	RADIUS.every((site) => ['sm', 'md', 'lg'].includes(site.step))
);
check(
	'every entry changes its stock string',
	RADIUS.every((site) => site.stock !== site.fixed),
	RADIUS.filter((site) => site.stock === site.fixed)
		.map((site) => site.id)
		.join(', ')
);
check(
	'no fixed string is contained in its own stock string',
	RADIUS.every((site) => !site.stock.includes(site.fixed)),
	RADIUS.filter((site) => site.stock.includes(site.fixed))
		.map((site) => site.id)
		.join(', ')
);
check(
	'no radius file is a calendar or range-calendar file',
	RADIUS.every(
		(site) => !site.file.startsWith('calendar/') && !site.file.startsWith('range-calendar/')
	),
	RADIUS.filter(
		(site) => site.file.startsWith('calendar/') || site.file.startsWith('range-calendar/')
	)
		.map((site) => site.id)
		.join(', ')
);

const applied = join(WORK, 'applied');
const appliedUi = scaffold(applied);
const scaleBefore = scaleRows(readFileSync(cssPathOf(applied), 'utf8'));
const calendarBefore = calendarCounts(appliedUi);
const appliedRun = cliResult(applied);
check('init over the form fixture exits 0', appliedRun.code === 0, `exit ${appliedRun.code}`);

const calendarAfter = calendarCounts(appliedUi);
const drifted = [...calendarBefore]
	.filter(([path, count]) => calendarAfter.get(path) !== count)
	.map(([path]) => path.slice(path.indexOf('ui') + 3));
check(
	'every calendar file keeps its --cell-radius occurrences',
	drifted.length === 0,
	drifted.join(', ')
);

const button = textOf(applied, 'button/button.svelte');
check('button base keeps rounded-md', button.includes(byId('button-base').fixed));
check('button has no rounded-none left', !button.includes('rounded-none'));
check(
	'button xs, sm, icon-xs and icon-sm carry rounded-sm',
	['button-xs', 'button-sm', 'button-icon-xs', 'button-icon-sm'].every((id) =>
		button.includes(byId(id).fixed)
	)
);
check(
	'button lg and icon-lg carry rounded-lg',
	['button-lg', 'button-icon-lg'].every((id) => button.includes(byId(id).fixed))
);

const toggle = textOf(applied, 'toggle/toggle.svelte');
check(
	'toggle default, sm and lg carry md, sm and lg',
	['toggle-base', 'toggle-sm', 'toggle-lg'].every((id) => toggle.includes(byId(id).fixed))
);

const input = textOf(applied, 'input/input.svelte');
check(
	'input carries rounded-md in both branches',
	countOf(input, 'rounded-md') === 2,
	`${countOf(input, 'rounded-md')}`
);
check('input has no bare h-10 border px-0', !input.includes('h-10 border px-0'));
check(
	'textarea carries rounded-md',
	textOf(applied, 'textarea/textarea.svelte').includes(byId('textarea-field').fixed)
);

const nativeSelect = textOf(applied, 'native-select/native-select.svelte');
const trigger = textOf(applied, 'select/select-trigger.svelte');
check(
	'native-select and select trigger carry md plus the sm data size',
	[nativeSelect, trigger].every(
		(text) => text.includes('rounded-md') && text.includes('data-[size=sm]:rounded-sm')
	)
);
const content = textOf(applied, 'select/select-content.svelte');
const item = textOf(applied, 'select/select-item.svelte');
check(
	'select content is lg and the item is md',
	content.includes(byId('select-content-box').fixed) &&
		item.includes(byId('select-item-field').fixed)
);

const group = textOf(applied, 'input-group/input-group.svelte');
check('input-group has no rounded-none left', !group.includes('rounded-none'));
const groupButton = textOf(applied, 'input-group/input-group-button.svelte');
check(
	'input-group-button base and xs carry rounded-sm',
	groupButton.includes(byId('input-group-button-base').fixed) &&
		groupButton.includes(byId('input-group-button-xs').fixed)
);
const addon = textOf(applied, 'input-group/input-group-addon.svelte');
const checkbox = textOf(applied, 'checkbox/checkbox.svelte');
check(
	'addon keycap and checkbox carry rounded-sm',
	addon.includes('**:data-[slot=kbd]:rounded-sm') &&
		checkbox.includes(byId('checkbox-selector').fixed)
);
check(
	'switch carries md and the sm data size',
	textOf(applied, 'switch/switch.svelte').includes(byId('switch-base').fixed)
);

const radio = textOf(applied, 'radio-group/radio-group-item.svelte');
check(
	'radio-group item keeps exactly two rounded-full',
	countOf(radio, 'rounded-full') === 2,
	`${countOf(radio, 'rounded-full')}`
);
check('radio-group has no radius site', !RADIUS.some((site) => site.component === 'radio-group'));

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
check(
	'the range-middle contrast sites are still fixed',
	rangeCell.includes('[&:has([data-range-middle])]:text-accent-foreground') &&
		rangeCell.includes('dark:[&:has([data-range-middle])]:hover:bg-accent')
);
const scaleAfter = scaleRows(readFileSync(cssPathOf(applied), 'utf8'));
check(
	'a run leaves the seven scale rows byte-identical',
	scaleBefore.length === 7 &&
		scaleAfter.map((row) => row.text).join('\n') === scaleBefore.map((row) => row.text).join('\n'),
	`${scaleBefore.length} -> ${scaleAfter.length}`
);

const formBefore = formSnapshot(applied);
const cssBefore = digest(cssPathOf(applied));
const second = cliResult(applied, 'fix');
check(
	'a second fix exits 0 and reports every site fixed',
	second.code === 0 &&
		second.out.includes('fix: 0 stock') &&
		!/^\[daisyui-adapter\] \S+ \S+ \([^)]+\): (stock|customized)/m.test(second.out),
	`exit ${second.code}`
);
check(
	'a second fix leaves every form file byte-identical',
	formSnapshot(applied).join('\n') === formBefore.join('\n')
);
check(
	'a second fix leaves the stylesheet byte-identical',
	digest(cssPathOf(applied)) === cssBefore
);

const states = join(WORK, 'states');
scaffold(states);
cli(states);
const statesToggle = pathOf(states, 'toggle/toggle.svelte');
replaceIn(
	statesToggle,
	byId('toggle-base').fixed,
	'gap-1.5 rounded-xl text-xs font-semibold uppercase'
);
replaceIn(statesToggle, byId('toggle-sm').fixed, byId('toggle-sm').stock);
const statesRun = cliResult(states, 'fix');
const statesText = readFileSync(statesToggle, 'utf8');
check(
	'a hand-edited radius site reports customized',
	statesRun.out.includes('toggle toggle-base (toggle/toggle.svelte): customized'),
	statesRun.out
		.trim()
		.split('\n')
		.find((line) => line.includes('toggle-base'))
);
check(
	'the hand edit survives the run',
	statesText.includes('gap-1.5 rounded-xl text-xs font-semibold uppercase')
);
check(
	'a restored stock radius site reports stock and is rewritten',
	statesRun.out.includes('toggle toggle-sm (toggle/toggle.svelte): stock -> fixed') &&
		statesText.includes(byId('toggle-sm').fixed),
	statesRun.out
		.trim()
		.split('\n')
		.find((line) => line.includes('toggle-sm'))
);
check(
	'the other site in that file stays fixed',
	statesText.includes(byId('toggle-lg').fixed) && !statesText.includes(byId('toggle-lg').stock)
);

const missing = join(WORK, 'missing');
const missingUi = scaffold(missing);
cli(missing);
rmSync(join(missingUi, 'textarea', 'textarea.svelte'), { force: true });
const missingRun = cliResult(missing, 'fix');
const missingHeader = headerLines(readFileSync(cssPathOf(missing), 'utf8'));
check(
	'a radius file deleted while its directory remains reports missing and is not recreated',
	missingRun.code === 0 &&
		missingRun.out.includes('textarea textarea-field (textarea/textarea.svelte): missing') &&
		!existsSync(join(missingUi, 'textarea', 'textarea.svelte')),
	`exit ${missingRun.code}`
);
// This fixture also installs calendar and range-calendar for the excluded-class checks, so its three
// contrast files count too: 19 before the delete (13 radius, 3 contrast and 3 surface), 18 after.
check(
	'a missing radius file drops the count from nineteen to eighteen',
	missingHeader[0]?.startsWith(headerFor(18)),
	missingHeader[0]
);

const partial = join(WORK, 'partial');
scaffold(partial, { components: ['button'] });
const partialRun = cliResult(partial);
check(
	'a project with only button installed reports no rows for the absent radius components',
	partialRun.code === 0 &&
		partialRun.out.includes('button button-base') &&
		!partialRun.out.includes('textarea') &&
		!partialRun.out.includes('checkbox'),
	`exit ${partialRun.code}`
);

const radioFixture = join(WORK, 'radio-group');
scaffold(radioFixture);
cli(radioFixture);
const radioPath = pathOf(radioFixture, 'radio-group/radio-group-item.svelte');
const radioBefore = digest(radioPath);
const radioRun = cliResult(radioFixture, 'fix', 'radio-group');
check(
	'fix radio-group is a zero-row no-op that writes nothing',
	radioRun.code === 0 && radioRun.out.includes('fix: 0 stock') && digest(radioPath) === radioBefore,
	`exit ${radioRun.code}`
);

const named = join(WORK, 'named');
scaffold(named);
cli(named);
const namedButton = pathOf(named, 'button/button.svelte');
const namedToggle = pathOf(named, 'toggle/toggle.svelte');
replaceIn(namedButton, byId('button-xs').fixed, byId('button-xs').stock);
replaceIn(namedToggle, byId('toggle-sm').fixed, byId('toggle-sm').stock);
const namedToggleDigest = digest(namedToggle);
const namedRun = cliResult(named, 'fix', 'button');
check(
	'fix button exits 0 and fixes the named component',
	namedRun.code === 0 && readFileSync(namedButton, 'utf8').includes(byId('button-xs').fixed),
	`exit ${namedRun.code}`
);
check(
	'fix button leaves every other component byte-identical',
	digest(namedToggle) === namedToggleDigest && !namedRun.out.includes('toggle')
);

const header = join(WORK, 'header');
scaffold(header, { components: RADIUS_DIRS });
const headerRun = cliResult(header);
const headerCss = readFileSync(cssPathOf(header), 'utf8');
check(
	'init with the thirteen radius files records components 13 fixed',
	headerRun.code === 0 && headerLines(headerCss)[0]?.startsWith(headerFor(13)),
	headerLines(headerCss)[0]
);
const headerDigest = digest(cssPathOf(header));
const headerNoop = cliResult(header, 'fix');
check(
	'a no-op fix keeps the count and the bytes',
	headerNoop.code === 0 &&
		digest(cssPathOf(header)) === headerDigest &&
		headerLines(readFileSync(cssPathOf(header), 'utf8'))[0]?.startsWith(headerFor(13)),
	`exit ${headerNoop.code}`
);

const checkAfter = cliResult(header, 'fix', '--check');
check('--check exits 0 after init', checkAfter.code === 0, `exit ${checkAfter.code}`);

const checkStock = join(WORK, 'check-stock');
scaffold(checkStock);
cli(checkStock);
replaceIn(
	pathOf(checkStock, 'checkbox/checkbox.svelte'),
	byId('checkbox-selector').fixed,
	byId('checkbox-selector').stock
);
const checkStockBefore = formSnapshot(checkStock);
const checkStockRun = cliResult(checkStock, 'fix', '--check');
check(
	'--check with a stock radius site exits 1',
	checkStockRun.code === 1,
	`exit ${checkStockRun.code}`
);
check(
	'--check with a stock radius site writes nothing',
	formSnapshot(checkStock).join('\n') === checkStockBefore.join('\n')
);

const strictCustom = join(WORK, 'strict-customized');
scaffold(strictCustom);
cli(strictCustom);
replaceIn(
	pathOf(strictCustom, 'select/select-item.svelte'),
	byId('select-item-field').fixed,
	'gap-2.5 rounded-xl py-2 pr-8 pl-3 text-sm'
);
const strictCustomBefore = formSnapshot(strictCustom);
const strictCustomRun = cliResult(strictCustom, 'fix', '--strict');
check(
	'--strict with a customized radius site exits 1',
	strictCustomRun.code === 1 && strictCustomRun.out.includes('--strict:'),
	`exit ${strictCustomRun.code}`
);
check(
	'--strict with a customized radius site writes nothing',
	formSnapshot(strictCustom).join('\n') === strictCustomBefore.join('\n')
);

const rows = scaleRows(readFileSync(LAYOUT, 'utf8'));
const factors = Object.fromEntries(rows.map((row) => [row.step, row.k]));
check(
	'the scale rows carry the linear coefficients',
	Object.entries(COEFFICIENTS).every(([step, k]) => factors[step] === k),
	JSON.stringify(factors)
);
check('at --radius: 0 every step is 0', rows.every((row) => 0 * row.k === 0) && rows.length === 7);
check(
	'at 2rem sm < md < lg',
	factors.sm * 2 < factors.md * 2 && factors.md * 2 < factors.lg * 2,
	`${factors.sm * 2} < ${factors.md * 2} < ${factors.lg * 2}`
);
check(
	'at 10rem sm < md < lg',
	factors.sm * 10 < factors.md * 10 && factors.md * 10 < factors.lg * 10,
	`${factors.sm * 10} < ${factors.md * 10} < ${factors.lg * 10}`
);
check(
	'no scale row uses clamp(), min() or max()',
	rows.every((row) => !/clamp\(|min\(|max\(/.test(row.text)),
	rows.find((row) => /clamp\(|min\(|max\(/.test(row.text))?.text
);

const warnFixture = (label, radiusBox) => {
	const dir = join(WORK, `warn-${label}`);
	scaffold(dir, { components: [] });
	const themeFile = join(dir, 'src', 'daisyui-theme.css');
	writeFileSync(
		themeFile,
		readFileSync(themeFile, 'utf8').replaceAll(
			'--radius-box: 0.5rem;',
			`--radius-box: ${radiusBox};`
		)
	);
	return { dir, run: cliResult(dir) };
};

const zero = warnFixture('zero', '0');
check(
	'--radius-box: 0 exits 0 and does not warn',
	zero.run.code === 0 && !zero.run.out.includes('above 2rem'),
	`exit ${zero.run.code}`
);
const half = warnFixture('half', '0.5rem');
check(
	'--radius-box: 0.5rem exits 0 and does not warn',
	half.run.code === 0 && !half.run.out.includes('above 2rem'),
	`exit ${half.run.code}`
);
const edge = warnFixture('two-rem', '2rem');
check(
	'--radius-box: 2rem (32px) is not above the edge and does not warn',
	edge.run.code === 0 && !edge.run.out.includes('above 2rem'),
	`exit ${edge.run.code}`
);
const big = warnFixture('two-half', '2.5rem');
check(
	'--radius-box: 2.5rem warns with the raw and px values',
	big.run.code === 0 &&
		big.run.out.includes('--radius 2.5rem') &&
		big.run.out.includes('(40px)') &&
		big.run.out.includes('above 2rem'),
	big.run.out
		.trim()
		.split('\n')
		.find((line) => line.includes('above 2rem'))
);
const bigBinding = /\t--radius: ([^;]+);/.exec(readFileSync(cssPathOf(big.dir), 'utf8'))?.[1] ?? '';
check(
	'the written --radius binding has no clamp',
	bigBinding.length > 0 && !bigBinding.includes('clamp('),
	bigBinding
);
const px = warnFixture('px', '33px');
check(
	'--radius-box: 33px warns with the raw and px values',
	px.run.code === 0 && px.run.out.includes('--radius 33px') && px.run.out.includes('(33px)'),
	px.run.out
		.trim()
		.split('\n')
		.find((line) => line.includes('above 2rem'))
);

const calc = warnFixture('calc', 'calc(1rem + 1px)');
check(
	'a calc() radius is skipped rather than guessed',
	calc.run.code === 0 && !calc.run.out.includes('above 2rem'),
	`exit ${calc.run.code}`
);
const em = warnFixture('em', '2.5em');
check(
	'an unknown unit is skipped rather than guessed',
	em.run.code === 0 && !em.run.out.includes('above 2rem'),
	`exit ${em.run.code}`
);

// Without a theme the CLI fallback is the value that renders, so it is the value to warn about.
const fallback = join(WORK, 'warn-fallback');
scaffold(fallback, { components: [] });
rmSync(join(fallback, 'src', 'daisyui-theme.css'), { force: true });
const fallbackPath = cssPathOf(fallback);
writeFileSync(
	fallbackPath,
	readFileSync(fallbackPath, 'utf8').replace('--radius: 0.625rem;', '--radius: 3rem;')
);
const fallbackRun = cliResult(fallback);
check(
	'without a theme the --radius fallback above 2rem warns with raw and px',
	fallbackRun.code === 0 &&
		fallbackRun.out.includes('--radius 3rem') &&
		fallbackRun.out.includes('(48px)'),
	fallbackRun.out
		.trim()
		.split('\n')
		.find((line) => line.includes('above 2rem'))
);
check(
	'the binding still carries the fallback and no clamp after the warning',
	/\t--radius: var\(--daisy-radius, 3rem\);/.test(readFileSync(fallbackPath, 'utf8'))
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? `all ${results.length} radius checks passed` : `${failed.length} of ${results.length} radius check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
