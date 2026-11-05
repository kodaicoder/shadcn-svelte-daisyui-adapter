import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { uiDirectory } from '../../../packages/daisyui-adapter/component-fix.mjs';
import {
	ALERT_VARIANTS,
	BADGE_VARIANTS,
	BUBBLE_VARIANTS,
	BUTTON_VARIANTS,
	TARGETS,
	VARIANTS,
	VARIANT_COMPONENTS,
	VARIANT_ROWS
} from '../../../packages/daisyui-adapter/targets.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const STOCK_DIR = join(REPO, 'src', 'lib', 'components', 'ui');
const THEME = resolve(HERE, '..', 'registry-12', 'probe-theme.css');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-31-variants');

const FILES = {
	button: 'button/button.svelte',
	badge: 'badge/badge.svelte',
	alert: 'alert/alert.svelte',
	bubble: 'bubble/bubble.svelte'
};
const INSTALLED = ['badge', 'alert', 'bubble'];

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const scaffold = (dir, { components = INSTALLED, style = 'mira', shadcn = '1.8.0' } = {}) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));

	const json = { tailwind: { css: 'src/routes/layout.css' }, style };
	writeFileSync(join(dir, 'components.json'), JSON.stringify(json, null, '\t'));
	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify(
			{ name: 'adapter-31-fixture', type: 'module', imports: { '#lib/*': './src/lib/*' } },
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
			cpSync(join(STOCK_DIR, component), join(ui, component), { recursive: true });
		}
	}
	return ui;
};

const uiOf = (dir) =>
	uiDirectory(JSON.parse(readFileSync(join(dir, 'components.json'), 'utf8')), dir);
const pathOf = (dir, file) => join(uiOf(dir), ...file.split('/'));
const textOf = (dir, file) => readFileSync(pathOf(dir, file), 'utf8');
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
const countOf = (text, needle) => text.split(needle).length - 1;
const writtenKey = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : `"${key}"`);
const lineWith = (out, id) => out.split(/\r?\n/).find((line) => line.includes(id)) ?? out.trim();

const headerLines = (css) =>
	css.split(/\r?\n/).filter((line) => line.startsWith('/* ') && line.endsWith('*/'));
const headerFor = (n) => `/* ${NAME} ${VERSION} | components ${n} fixed | re-run `;

const TONES = ['destructive', 'success', 'warning', 'info'];
const PRESENTATIONS = {
	button: ['solid', 'outline', 'ghost', 'link'],
	badge: ['solid', 'outline', 'ghost', 'link'],
	alert: ['solid'],
	bubble: ['solid', 'outline', 'ghost']
};

const BUTTON_KEYS = [
	'destructive',
	'success',
	'warning',
	'info',
	'outline-destructive',
	'outline-success',
	'outline-warning',
	'outline-info',
	'ghost-destructive',
	'ghost-success',
	'ghost-warning',
	'ghost-info',
	'link-destructive',
	'link-success',
	'link-warning',
	'link-info',
	'outline-primary',
	'ghost-primary',
	'link-primary',
	'outline-secondary',
	'ghost-secondary',
	'link-secondary',
	'blackwhite',
	'outline-blackwhite',
	'ghost-blackwhite',
	'link-blackwhite'
];
const BADGE_KEYS = [
	'destructive',
	'success',
	'warning',
	'info',
	'outline-destructive',
	'outline-success',
	'outline-warning',
	'outline-info',
	'ghost-destructive',
	'ghost-success',
	'ghost-warning',
	'ghost-info',
	'link-destructive',
	'link-success',
	'link-warning',
	'link-info',
	'blackwhite',
	'outline-blackwhite',
	'ghost-blackwhite',
	'link-blackwhite'
];
const ALERT_KEYS = ['destructive', 'success', 'warning', 'info', 'blackwhite'];
const BUBBLE_KEYS = [
	'destructive',
	'success',
	'warning',
	'info',
	'outline-destructive',
	'outline-success',
	'outline-warning',
	'outline-info',
	'ghost-destructive',
	'ghost-success',
	'ghost-warning',
	'ghost-info',
	'blackwhite',
	'outline-blackwhite',
	'ghost-blackwhite'
];

const siteOf = (component) => VARIANTS.find((site) => site.id === `${component}-variants`);
const rowsOf = (component) => VARIANT_ROWS.filter((row) => row.component === component);
const pinOf = (component) => readFileSync(join(STOCK_DIR, ...FILES[component].split('/')), 'utf8');
const pinnedClass = (component, key) =>
	new RegExp(`^\\t\\t\\t\\t${key}: "([^"]*)",$`, 'm').exec(pinOf(component))?.[1] ?? null;
const keysOf = (rows) => rows.map((row) => row.key);
const keyList = (rows) => keysOf(rows).join(', ');

const keySet = (rows, expected) => {
	const keys = keysOf(rows);
	return (
		keys.length === expected.length &&
		new Set(keys).size === expected.length &&
		expected.every((key) => keys.includes(key))
	);
};

const cellsOf = (rows, presentations) =>
	TONES.flatMap((tone) =>
		presentations.map((presentation) => ({
			tone,
			presentation,
			count: rows.filter((row) => row.tone === tone && row.presentation === presentation).length
		}))
	);
const badCells = (cells) =>
	cells
		.filter((cell) => cell.count !== 1)
		.map((cell) => `${cell.tone}/${cell.presentation}:${cell.count}`)
		.join(', ');

const buttonSite = siteOf('button');
const badgeSite = siteOf('badge');
const alertSite = siteOf('alert');
const bubbleSite = siteOf('bubble');
const buttonPin = pinOf('button');
const badgePin = pinOf('badge');
const alertPin = pinOf('alert');
const bubblePin = pinOf('bubble');

const rowLinesMissing = (site, rows) =>
	rows
		.filter((row) => countOf(site.fixed, `${writtenKey(row.key)}: "${row.class}",`) !== 1)
		.map((row) => row.key)
		.join(', ');

const pinnedInside = (component, site, keys) => {
	const pin = pinOf(component);
	const beforeStock = pin.slice(0, pin.indexOf(site.stock));
	return keys
		.filter((key) => {
			const pinned = pinnedClass(component, key);
			if (typeof pinned !== 'string') return true;
			const line = `${key}: "${pinned}",`;
			return !site.fixed.includes(line) && !beforeStock.includes(line);
		})
		.join(', ');
};

check(
	'TARGETS.variants is the VARIANTS table',
	TARGETS.variants === VARIANTS,
	`${VARIANTS.length}`
);
check(
	'TARGETS.variantRows is VARIANT_ROWS',
	TARGETS.variantRows === VARIANT_ROWS,
	`${VARIANT_ROWS.length}`
);
check(
	'TARGETS.variantComponents is VARIANT_COMPONENTS',
	TARGETS.variantComponents === VARIANT_COMPONENTS,
	VARIANT_COMPONENTS.join(', ')
);
check(
	'TARGETS.buttonVariants is BUTTON_VARIANTS',
	TARGETS.buttonVariants === BUTTON_VARIANTS,
	`${BUTTON_VARIANTS.length}`
);
check(
	'TARGETS.badgeVariants is BADGE_VARIANTS',
	TARGETS.badgeVariants === BADGE_VARIANTS,
	`${BADGE_VARIANTS.length}`
);
check(
	'TARGETS.alertVariants is ALERT_VARIANTS',
	TARGETS.alertVariants === ALERT_VARIANTS,
	`${ALERT_VARIANTS.length}`
);
check(
	'TARGETS.bubbleVariants is BUBBLE_VARIANTS',
	TARGETS.bubbleVariants === BUBBLE_VARIANTS,
	`${BUBBLE_VARIANTS.length}`
);

check(
	'VARIANTS holds four sites in component order',
	VARIANTS.length === 4 &&
		VARIANTS[0].id === 'button-variants' &&
		VARIANTS[1].id === 'badge-variants' &&
		VARIANTS[2].id === 'alert-variants' &&
		VARIANTS[3].id === 'bubble-variants',
	VARIANTS.map((site) => site.id).join(', ')
);
check(
	'each site names its own component and file',
	VARIANTS.every(
		(site) => site.id === `${site.component}-variants` && site.file === FILES[site.component]
	),
	VARIANTS.map((site) => site.file).join(', ')
);
check(
	'VARIANTS[0] is the pinned button site',
	VARIANTS[0].component === 'button' && VARIANTS[0].file === FILES.button,
	VARIANTS[0].file
);

check('VARIANT_ROWS holds sixty-six rows', VARIANT_ROWS.length === 66, `${VARIANT_ROWS.length}`);
check('button holds twenty-six rows', BUTTON_VARIANTS.length === 26, `${BUTTON_VARIANTS.length}`);
check('badge holds twenty rows', BADGE_VARIANTS.length === 20, `${BADGE_VARIANTS.length}`);
check('alert holds five rows', ALERT_VARIANTS.length === 5, `${ALERT_VARIANTS.length}`);
check('bubble holds fifteen rows', BUBBLE_VARIANTS.length === 15, `${BUBBLE_VARIANTS.length}`);

check(
	'the button keys are the literal twenty-six, with no duplicate',
	keySet(BUTTON_VARIANTS, BUTTON_KEYS),
	keyList(BUTTON_VARIANTS)
);
check(
	'the badge keys are the literal twenty, with no duplicate',
	keySet(BADGE_VARIANTS, BADGE_KEYS),
	keyList(BADGE_VARIANTS)
);
check(
	'the alert keys are the literal five, with no duplicate',
	keySet(ALERT_VARIANTS, ALERT_KEYS),
	keyList(ALERT_VARIANTS)
);
check(
	'the bubble keys are the literal fifteen, with no duplicate',
	keySet(BUBBLE_VARIANTS, BUBBLE_KEYS),
	keyList(BUBBLE_VARIANTS)
);

check(
	'each button tone x presentation cell holds one row',
	badCells(cellsOf(BUTTON_VARIANTS, PRESENTATIONS.button)) === '',
	badCells(cellsOf(BUTTON_VARIANTS, PRESENTATIONS.button))
);
check(
	'each badge tone x presentation cell holds one row',
	badCells(cellsOf(BADGE_VARIANTS, PRESENTATIONS.badge)) === '',
	badCells(cellsOf(BADGE_VARIANTS, PRESENTATIONS.badge))
);
check(
	'each alert tone x solid cell holds one row',
	badCells(cellsOf(ALERT_VARIANTS, PRESENTATIONS.alert)) === '',
	badCells(cellsOf(ALERT_VARIANTS, PRESENTATIONS.alert))
);
check(
	'each bubble tone x presentation cell holds one row',
	badCells(cellsOf(BUBBLE_VARIANTS, PRESENTATIONS.bubble)) === '',
	badCells(cellsOf(BUBBLE_VARIANTS, PRESENTATIONS.bubble))
);

const notLiteral = VARIANT_ROWS.filter(
	(row) => typeof row.class !== 'string' || row.class.length === 0 || /[$`{]/.test(row.class)
).map((row) => `${row.component}:${row.key}`);
check('every class is a non-empty literal string', notLiteral.length === 0, notLiteral.join(', '));

const strayRounded = VARIANT_ROWS.filter(
	(row) =>
		row.class.includes('rounded-') &&
		!(
			row.component === 'bubble' &&
			countOf(row.class, 'rounded-') === 1 &&
			(row.class.includes('*:data-[slot=bubble-content]:rounded-full') ||
				(row.key.startsWith('ghost-') &&
					row.class.includes('*:data-[slot=bubble-content]:rounded-none')))
		)
).map((row) => `${row.component}:${row.key}`);
check(
	'no row writes rounded- except the bubble rows',
	strayRounded.length === 0,
	strayRounded.join(', ')
);
const ghostRounded = VARIANT_ROWS.filter((row) =>
	row.class.includes('*:data-[slot=bubble-content]:rounded-none')
);
check(
	'the rounded-none reset sits on exactly the five bubble ghost rows',
	ghostRounded.length === 5 &&
		ghostRounded.every((row) => row.component === 'bubble' && row.key.startsWith('ghost-')),
	ghostRounded.map((row) => row.key).join(', ')
);

const RAW_TEXT = /(?<![-\w])text-(destructive|success|warning|info)(?![-\w])/;
const rawText = VARIANT_ROWS.filter(
	(row) =>
		row.presentation === 'solid' &&
		RAW_TEXT.test(row.class) &&
		`${row.component}:${row.key}` !== 'bubble:destructive'
).map((row) => `${row.component}:${row.key}`);
check(
	'no solid row writes the raw tone as text except the bubble destructive tint',
	rawText.length === 0,
	rawText.join(', ')
);

const mixedText = VARIANT_ROWS.filter((row) =>
	TONES.some(
		(tone) =>
			row.class.includes(`text-${tone}-text`) &&
			row.class.includes(`text-${tone}-foreground`) &&
			!row.class.includes(`hover:text-${tone}-foreground`)
	)
).map((row) => `${row.component}:${row.key}`);
check(
	'no row mixes the text tone with the tone foreground at rest',
	mixedText.length === 0,
	mixedText.join(', ')
);

const wrongBorder = VARIANT_ROWS.filter(
	(row) =>
		row.presentation !== 'outline' &&
		TONES.some((tone) => new RegExp(`(?:^|\\s)border-${tone}(?!-text)`).test(row.class))
).map((row) => `${row.component}:${row.key}`);
check(
	'no resting border outside the outline rows uses a tone',
	wrongBorder.length === 0,
	wrongBorder.join(', ')
);

const wrongTone = VARIANT_ROWS.filter(
	(row) =>
		!row.class.includes(row.tone) ||
		TONES.some((tone) => tone !== row.tone && row.class.includes(tone))
).map((row) => `${row.component}:${row.key}`);
check('every row names its own tone and no other', wrongTone.length === 0, wrongTone.join(', '));

const borderedFilled = VARIANT_ROWS.filter(
	(row) =>
		['button', 'bubble'].includes(row.component) &&
		row.presentation === 'solid' &&
		row.class.split(/\s+/).includes(`border-${row.tone}-text`)
).map((row) => `${row.component}:${row.key}`);
check(
	'no filled status row on button or bubble carries a resting border',
	borderedFilled.length === 0,
	borderedFilled.join(', ')
);

const badgeOutline = BADGE_VARIANTS.filter((row) => row.key.startsWith('outline-'));
const tokensOf = (row) => row.class.split(/\s+/);
const baseOf = (token) => token.split(':').pop();
const CHIP_PADDING = ['px-1.5', 'py-0.5'];
const hasPadding = (tokens) => CHIP_PADDING.every((token) => tokens.includes(token));
const outlineBroken = badgeOutline
	.filter((row) => {
		const tokens = tokensOf(row);
		const status = ['success', 'warning', 'info', 'destructive'].includes(row.tone);
		return (
			!tokens.includes('border') ||
			!tokens.includes(`border-${row.tone}${status ? '-text' : ''}`) ||
			!(status ? tokens.includes(`bg-${row.tone}/10`) : tokens.includes('bg-transparent')) ||
			!hasPadding(tokens)
		);
	})
	.map((row) => row.key);
check(
	'every badge outline row carries its surface',
	badgeOutline.length === 5 && outlineBroken.length === 0,
	outlineBroken.join(', ')
);

const badgeFilled = BADGE_VARIANTS.filter((row) =>
	['success', 'warning', 'info'].includes(row.key)
);
const filledBroken = badgeFilled
	.filter((row) => {
		const tokens = tokensOf(row);
		const fills = tokens.filter((token) => baseOf(token).startsWith('bg-'));
		return (
			fills.filter((token) => token === `bg-${row.tone}`).length !== 1 ||
			fills.some(
				(token) =>
					token !== `bg-${row.tone}` &&
					!(token.startsWith('[a]:hover:') && baseOf(token).startsWith(`bg-${row.tone}`))
			) ||
			!tokens.includes(`text-${row.tone}-foreground`) ||
			!hasPadding(tokens)
		);
	})
	.map((row) => row.key);
check(
	'every badge filled status row is a filled chip with the tone foreground and no border',
	badgeFilled.length === 3 && filledBroken.length === 0,
	filledBroken.join(', ')
);

const badgeFlat = BADGE_VARIANTS.filter(
	(row) => row.key.startsWith('ghost-') || row.key.startsWith('link-')
);
const FLAT_CLASS = /(?:^|\s)(?:border|p[xytrblse]?-)/;
const flatBroken = badgeFlat.filter((row) => FLAT_CLASS.test(row.class)).map((row) => row.key);
check(
	'the badge ghost and link rows stay borderless and unpadded',
	badgeFlat.length === 10 && flatBroken.length === 0,
	flatBroken.join(', ')
);

const badgePinnedDestructive = BADGE_VARIANTS.find((row) => row.key === 'destructive');
const pinnedBadgeDestructive = pinnedClass('badge', 'destructive');
const destructiveChip =
	typeof pinnedBadgeDestructive === 'string' &&
	pinnedBadgeDestructive.includes('bg-destructive/10') &&
	badgePinnedDestructive !== undefined &&
	!badgePinnedDestructive.class.includes('border-') &&
	badgePinnedDestructive.class.includes('bg-destructive/10') &&
	badgePinnedDestructive.class.includes('text-destructive-text');
check(
	'the badge destructive row is the tinted chip with the text tone on the 1.8 fill and no border',
	destructiveChip,
	destructiveChip ? '' : `badge:destructive :: ${badgePinnedDestructive?.class ?? 'missing'}`
);

check(
	'button: the stock block occurs exactly once in the pin',
	countOf(buttonPin, buttonSite.stock) === 1,
	`${countOf(buttonPin, buttonSite.stock)}`
);
check(
	'button: the stock block is not contained in the fixed block',
	!buttonSite.fixed.includes(buttonSite.stock)
);
check('button: the stock and fixed blocks differ', buttonSite.stock !== buttonSite.fixed);
check(
	'button: every row appears exactly once in the fixed block',
	rowLinesMissing(buttonSite, BUTTON_VARIANTS) === '',
	rowLinesMissing(buttonSite, BUTTON_VARIANTS)
);
check(
	'button: the fixed block keeps the five pinned keys byte for byte',
	pinnedInside('button', buttonSite, ['default', 'outline', 'secondary', 'ghost', 'link']) === '',
	pinnedInside('button', buttonSite, ['default', 'outline', 'secondary', 'ghost', 'link'])
);

check(
	'badge: the stock block occurs exactly once in the pin',
	countOf(badgePin, badgeSite.stock) === 1,
	`${countOf(badgePin, badgeSite.stock)}`
);
check(
	'badge: the stock block is not contained in the fixed block',
	!badgeSite.fixed.includes(badgeSite.stock)
);
check('badge: the stock and fixed blocks differ', badgeSite.stock !== badgeSite.fixed);
check(
	'badge: every row appears exactly once in the fixed block',
	rowLinesMissing(badgeSite, BADGE_VARIANTS) === '',
	rowLinesMissing(badgeSite, BADGE_VARIANTS)
);
check(
	'badge: the fixed block keeps the five pinned keys byte for byte',
	pinnedInside('badge', badgeSite, ['default', 'secondary', 'outline', 'ghost', 'link']) === '',
	pinnedInside('badge', badgeSite, ['default', 'secondary', 'outline', 'ghost', 'link'])
);

check(
	'alert: the stock block occurs exactly once in the pin',
	countOf(alertPin, alertSite.stock) === 1,
	`${countOf(alertPin, alertSite.stock)}`
);
check(
	'alert: the stock block is not contained in the fixed block',
	!alertSite.fixed.includes(alertSite.stock)
);
check('alert: the stock and fixed blocks differ', alertSite.stock !== alertSite.fixed);
check(
	'alert: every row appears exactly once in the fixed block',
	rowLinesMissing(alertSite, ALERT_VARIANTS) === '',
	rowLinesMissing(alertSite, ALERT_VARIANTS)
);

check(
	'bubble: the stock block occurs exactly once in the pin',
	countOf(bubblePin, bubbleSite.stock) === 1,
	`${countOf(bubblePin, bubbleSite.stock)}`
);
check(
	'bubble: the stock block is not contained in the fixed block',
	!bubbleSite.fixed.includes(bubbleSite.stock)
);
check('bubble: the stock and fixed blocks differ', bubbleSite.stock !== bubbleSite.fixed);
check(
	'bubble: every row appears exactly once in the fixed block',
	rowLinesMissing(bubbleSite, BUBBLE_VARIANTS) === '',
	rowLinesMissing(bubbleSite, BUBBLE_VARIANTS)
);
check(
	'bubble: every pinned key line survives verbatim, inside or before the fixed block',
	pinnedInside('bubble', bubbleSite, [
		'default',
		'secondary',
		'muted',
		'tinted',
		'outline',
		'ghost'
	]) === '',
	pinnedInside('bubble', bubbleSite, [
		'default',
		'secondary',
		'muted',
		'tinted',
		'outline',
		'ghost'
	])
);

const declaredKeys = (site) =>
	[...site.fixed.matchAll(/^\t\t\t\t"?([\w-]+)"?: "/gm)].map((m) => m[1]);
const extraAlertKeys = declaredKeys(alertSite).filter((key) =>
	/^(?:outline|ghost|link)(?:-|$)/.test(key)
);
check(
	'alert: the fixed block adds no outline, ghost or link key',
	extraAlertKeys.length === 0,
	extraAlertKeys.join(', ')
);
const extraBubbleKeys = declaredKeys(bubbleSite).filter((key) => /^link(?:-|$)/.test(key));
check(
	'bubble: the fixed block adds no link key',
	extraBubbleKeys.length === 0,
	extraBubbleKeys.join(', ')
);

const applied = join(WORK, 'applied');
scaffold(applied);
const appliedRun = cliResult(applied);
check(
	'init over the badge, alert and bubble fixture exits 0',
	appliedRun.code === 0,
	`exit ${appliedRun.code}`
);
check(
	'init fixes the badge, alert and bubble variant sites',
	[
		`badge badge-variants (${FILES.badge}): stock -> fixed`,
		`alert alert-variants (${FILES.alert}): stock -> fixed`,
		`bubble bubble-variants (${FILES.bubble}): stock -> fixed`
	].every((line) => appliedRun.out.includes(line)),
	['badge-variants', 'alert-variants', 'bubble-variants']
		.map((id) => lineWith(appliedRun.out, id))
		.join(' | ')
);
check(
	'bubble-muted reports stock -> fixed in the same run',
	appliedRun.out.includes(`bubble bubble-muted (${FILES.bubble}): stock -> fixed`),
	lineWith(appliedRun.out, 'bubble-muted')
);
check(
	'alert-base is already at its step in the same run',
	appliedRun.out.includes(`alert alert-base (${FILES.alert}): fixed`),
	lineWith(appliedRun.out, 'alert-base')
);

const appliedBadge = textOf(applied, FILES.badge);
const appliedAlert = textOf(applied, FILES.alert);
const appliedBubble = textOf(applied, FILES.bubble);
check('the badge file holds its fixed block', appliedBadge.includes(badgeSite.fixed));
check('the alert file holds its fixed block', appliedAlert.includes(alertSite.fixed));
check('the bubble file holds its fixed block', appliedBubble.includes(bubbleSite.fixed));
check(
	'the applied badge holds the destructive row exactly once',
	badgePinnedDestructive !== undefined &&
		countOf(appliedBadge, `destructive: "${badgePinnedDestructive.class}",`) === 1,
	badgePinnedDestructive === undefined
		? 'missing'
		: `${countOf(appliedBadge, `destructive: "${badgePinnedDestructive.class}",`)}`
);
const bubbleGhostRows = BUBBLE_VARIANTS.filter((row) => row.key.startsWith('ghost-'));
check(
	'the bubble file keeps its five rounded-none ghost rows',
	bubbleGhostRows.length === 5 &&
		bubbleGhostRows.every(
			(row) => countOf(appliedBubble, `${writtenKey(row.key)}: "${row.class}",`) === 1
		),
	bubbleGhostRows.map((row) => row.key).join(', ')
);

const appliedHeader = headerLines(readFileSync(cssPathOf(applied), 'utf8'));
check(
	'the header records three fully fixed components',
	appliedHeader.length === 1 && appliedHeader[0].startsWith(headerFor(3)),
	appliedHeader[0]
);

const appliedCheck = cliResult(applied, 'fix', '--check');
check('--check exits 0 after init', appliedCheck.code === 0, `exit ${appliedCheck.code}`);
const appliedStrict = cliResult(applied, 'fix', '--strict');
check('--strict exits 0 after init', appliedStrict.code === 0, `exit ${appliedStrict.code}`);

const before = Object.fromEntries(
	INSTALLED.map((component) => [FILES[component], digest(pathOf(applied, FILES[component]))])
);
const second = cliResult(applied, 'fix');
check(
	'a second fix exits 0 and reports no stock site',
	second.code === 0 && second.out.includes('fix: 0 stock'),
	`exit ${second.code}`
);
check(
	'a second fix leaves the three files byte-identical',
	INSTALLED.every(
		(component) => digest(pathOf(applied, FILES[component])) === before[FILES[component]]
	)
);

const states = join(WORK, 'states-badge');
cpSync(applied, states, { recursive: true });
const badgeSuccess = BADGE_VARIANTS.find((row) => row.key === 'success');
replaceIn(
	pathOf(states, FILES.badge),
	`success: "${badgeSuccess.class}",`,
	'success: "bg-success/50",'
);
const statesRun = cliResult(states, 'fix', 'badge');
check(
	'a hand edit inside the badge block reports customized',
	statesRun.out.includes(`badge badge-variants (${FILES.badge}): customized`),
	lineWith(statesRun.out, 'badge-variants')
);
check(
	'the hand edit survives the run',
	textOf(states, FILES.badge).includes('success: "bg-success/50",')
);

const bubbleStates = join(WORK, 'states-bubble');
cpSync(applied, bubbleStates, { recursive: true });
const bubbleDestructive = BUBBLE_VARIANTS.find((row) => row.key === 'destructive');
const destructiveLine = `\t\t\t\tdestructive: "${bubbleDestructive.class}",`;
replaceIn(
	pathOf(bubbleStates, FILES.bubble),
	destructiveLine,
	`${destructiveLine}\n\t\t\t\tbrand: "bg-brand",`
);
const bubbleEdited = digest(pathOf(bubbleStates, FILES.bubble));
const bubbleRun = cliResult(bubbleStates, 'fix', 'bubble');
check(
	'a key appended inside the bubble anchor reports customized',
	bubbleRun.out.includes(`bubble bubble-variants (${FILES.bubble}): customized`),
	lineWith(bubbleRun.out, 'bubble-variants')
);
check(
	'nothing is inserted into the customized bubble block',
	digest(pathOf(bubbleStates, FILES.bubble)) === bubbleEdited &&
		textOf(bubbleStates, FILES.bubble).includes('brand: "bg-brand",')
);

const alertStates = join(WORK, 'states-alert');
cpSync(applied, alertStates, { recursive: true });
replaceIn(pathOf(alertStates, FILES.alert), alertSite.fixed, alertSite.stock);
const alertRun = cliResult(alertStates, 'fix', 'alert');
check(
	'a restored alert stock block reports stock -> fixed',
	alertRun.out.includes(`alert alert-variants (${FILES.alert}): stock -> fixed`),
	lineWith(alertRun.out, 'alert-variants')
);
check(
	'the restored alert block is written back to fixed',
	textOf(alertStates, FILES.alert).includes(alertSite.fixed)
);

const missing = join(WORK, 'missing');
cpSync(applied, missing, { recursive: true });
rmSync(pathOf(missing, FILES.badge), { force: true });
const missingRun = cliResult(missing, 'fix', 'badge');
check(
	'a deleted badge file reports missing and is not recreated',
	missingRun.code === 0 &&
		missingRun.out.includes(`badge badge-variants (${FILES.badge}): missing`) &&
		!existsSync(pathOf(missing, FILES.badge)),
	`exit ${missingRun.code}`
);

const customizedStrict = cliResult(states, 'fix', '--strict');
check(
	'--strict exits 1 on the customized fixture',
	customizedStrict.code === 1,
	`exit ${customizedStrict.code}`
);

const overlap = join(WORK, 'overlap');
scaffold(overlap, { components: ['bubble'] });
const bubbleMuted = TARGETS.sites.find((site) => site.id === 'bubble-muted');
const overlapRun = cliResult(overlap, 'fix', 'bubble');
check(
	'one run fixes both stock bubble sites',
	overlapRun.code === 0 &&
		overlapRun.out.includes(`bubble bubble-muted (${FILES.bubble}): stock -> fixed`) &&
		overlapRun.out.includes(`bubble bubble-variants (${FILES.bubble}): stock -> fixed`),
	[lineWith(overlapRun.out, 'bubble-muted'), lineWith(overlapRun.out, 'bubble-variants')].join(
		' | '
	)
);
const overlapText = textOf(overlap, FILES.bubble);
check(
	'the bubble file holds both fixed strings',
	overlapText.includes(bubbleMuted.fixed) && overlapText.includes(bubbleSite.fixed)
);
const overlapSecond = cliResult(overlap, 'fix', 'bubble');
check(
	'a second run reports both bubble sites fixed',
	overlapSecond.out.includes(`bubble bubble-muted (${FILES.bubble}): fixed`) &&
		overlapSecond.out.includes(`bubble bubble-variants (${FILES.bubble}): fixed`),
	[
		lineWith(overlapSecond.out, 'bubble-muted'),
		lineWith(overlapSecond.out, 'bubble-variants')
	].join(' | ')
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? `all ${results.length} variants checks passed` : `${failed.length} of ${results.length} variants check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
