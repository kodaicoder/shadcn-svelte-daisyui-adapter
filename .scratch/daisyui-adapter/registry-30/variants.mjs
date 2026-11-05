import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { uiDirectory } from '../../../packages/daisyui-adapter/component-fix.mjs';
import {
	BUTTON_VARIANTS,
	TARGETS,
	VARIANTS,
	VARIANT_COMPONENTS
} from '../../../packages/daisyui-adapter/targets.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const STOCK_DIR = join(REPO, 'src', 'lib', 'components', 'ui');
const THEME = resolve(HERE, '..', 'registry-12', 'probe-theme.css');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-30-variants');
const FILENAME = 'button/button.svelte';

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const scaffold = (dir, { components = ['button'], style = 'mira', shadcn = '1.8.0' } = {}) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));

	const json = { tailwind: { css: 'src/routes/layout.css' }, style };
	writeFileSync(join(dir, 'components.json'), JSON.stringify(json, null, '\t'));
	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify(
			{ name: 'adapter-30-fixture', type: 'module', imports: { '#lib/*': './src/lib/*' } },
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
const lineWith = (out, id) => out.split(/\r?\n/).find((line) => line.includes(id)) ?? out.trim();

const headerLines = (css) =>
	css.split(/\r?\n/).filter((line) => line.startsWith('/* ') && line.endsWith('*/'));
const headerFor = (n) => `/* ${NAME} ${VERSION} | components ${n} fixed | re-run `;

const TONES = ['destructive', 'success', 'warning', 'info'];
const PRESENTATIONS = ['solid', 'outline', 'ghost', 'link'];
const TICKET_KEYS = [
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

const site = VARIANTS[0];
const pinText = readFileSync(join(STOCK_DIR, ...FILENAME.split('/')), 'utf8');
const pinnedClass = (key) =>
	new RegExp(`^\\t\\t\\t\\t${key}: "([^"]*)",$`, 'm').exec(pinText)?.[1] ?? null;
const byKey = (key) => BUTTON_VARIANTS.find((row) => row.key === key);

check(
	'TARGETS.variants is the VARIANTS table',
	TARGETS.variants === VARIANTS,
	`${VARIANTS.length}`
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
	'VARIANTS[0] is the pinned button site',
	VARIANTS.length === 4 &&
		site.id === 'button-variants' &&
		site.component === 'button' &&
		site.file === FILENAME,
	`${VARIANTS.length}`
);
check(
	'BUTTON_VARIANTS holds twenty-six rows',
	BUTTON_VARIANTS.length === 26,
	`${BUTTON_VARIANTS.length}`
);

const keys = BUTTON_VARIANTS.map((row) => row.key);
check(
	'the keys are the four tones times the four presentations, with no duplicate',
	keys.length === TICKET_KEYS.length &&
		new Set(keys).size === TICKET_KEYS.length &&
		TICKET_KEYS.every((key) => keys.includes(key)),
	keys.join(', ')
);

const wrongKey = BUTTON_VARIANTS.filter((row) =>
	row.presentation === 'solid'
		? row.key !== row.tone
		: row.key !== `${row.presentation}-${row.tone}`
).map((row) => row.key);
check(
	'a solid key is its tone and every other key is presentation-tone',
	wrongKey.length === 0,
	wrongKey.join(', ')
);

const cells = TONES.flatMap((tone) =>
	PRESENTATIONS.map((presentation) => ({
		tone,
		presentation,
		count: BUTTON_VARIANTS.filter((row) => row.tone === tone && row.presentation === presentation)
			.length
	}))
);
check(
	'each tone x presentation cell holds exactly one row',
	cells.every((cell) => cell.count === 1),
	cells
		.filter((cell) => cell.count !== 1)
		.map((cell) => `${cell.tone}/${cell.presentation}:${cell.count}`)
		.join(', ')
);

const notLiteral = BUTTON_VARIANTS.filter(
	(row) => typeof row.class !== 'string' || row.class.length === 0 || /[$`{]/.test(row.class)
).map((row) => row.key);
check('every class is a non-empty literal string', notLiteral.length === 0, notLiteral.join(', '));

const rounded = BUTTON_VARIANTS.filter((row) => row.class.includes('rounded-')).map(
	(row) => row.key
);
check('no variant class writes a radius', rounded.length === 0, rounded.join(', '));

const RAW_TEXT = /(?:^|\s)text-(destructive|success|warning|info)(?![-\w])/;
const rawText = BUTTON_VARIANTS.filter(
	(row) => row.presentation === 'solid' && RAW_TEXT.test(row.class)
).map((row) => row.key);
check('no solid row writes the raw tone as text', rawText.length === 0, rawText.join(', '));

const solidPairs = TONES.filter((tone) => {
	const row = byKey(tone);
	const tokens = row.class.split(/\s+/);
	return !(
		row.class.includes(`bg-${tone} `) &&
		row.class.includes(`text-${tone}-foreground`) &&
		!tokens.includes(`border-${tone}-text`)
	);
});
check(
	'each solid row is filled, with the tone foreground and no resting border',
	solidPairs.length === 0,
	solidPairs.join(', ')
);

const outlinePairs = TONES.filter((tone) => {
	const row = byKey(`outline-${tone}`);
	const tokens = row.class.split(/\s+/);
	return !(
		tokens.includes(`border-${tone}`) &&
		tokens.includes(`text-${tone}`) &&
		tokens.includes('bg-transparent') &&
		tokens.includes(`hover:bg-${tone}`) &&
		tokens.includes(`hover:text-${tone}-foreground`)
	);
});
check(
	'each outline row is a transparent chip with the raw tone, filled on hover',
	outlinePairs.length === 0,
	outlinePairs.join(', ')
);

const quietPairs = TONES.filter((tone) => {
	const ghost = byKey(`ghost-${tone}`);
	const link = byKey(`link-${tone}`);
	return !(
		ghost.class.split(/\s+/).includes(`text-${tone}`) &&
		link.class.split(/\s+/).includes(`text-${tone}`) &&
		!ghost.class.includes('border-') &&
		!link.class.includes('border-')
	);
});
check(
	'ghost and link use the raw tone text and carry no border',
	quietPairs.length === 0,
	quietPairs.join(', ')
);

const wrongBorder = BUTTON_VARIANTS.filter(
	(row) =>
		row.presentation !== 'outline' &&
		TONES.some((tone) => new RegExp(`(?:^|\\s)border-${tone}(?!-text)`).test(row.class))
).map((row) => row.key);
check(
	'no resting border outside the outline rows uses a tone',
	wrongBorder.length === 0,
	wrongBorder.join(', ')
);

const mixedText = BUTTON_VARIANTS.filter((row) =>
	TONES.some(
		(tone) =>
			row.class.includes(`text-${tone}-text`) &&
			row.class.includes(`text-${tone}-foreground`) &&
			!row.class.includes(`hover:text-${tone}-foreground`)
	)
).map((row) => row.key);
check(
	'no row mixes the text tone with the tone foreground at rest',
	mixedText.length === 0,
	mixedText.join(', ')
);

const stockCount = countOf(pinText, site.stock);
check(
	'the stock block occurs exactly once in the pinned button',
	stockCount === 1,
	`${stockCount}`
);
check('the stock block is not contained in the fixed block', !site.fixed.includes(site.stock));
check('the stock and fixed blocks differ', site.stock !== site.fixed);

const writtenKey = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : `"${key}"`);

const missingRows = BUTTON_VARIANTS.filter(
	(row) => countOf(site.fixed, `${writtenKey(row.key)}: "${row.class}",`) !== 1
).map((row) => row.key);
check(
	'every row appears exactly once in the fixed block',
	missingRows.length === 0,
	missingRows.join(', ')
);

const mismatchedPin = ['default', 'outline', 'secondary', 'ghost', 'link'].filter((key) => {
	const pinned = pinnedClass(key);
	return typeof pinned !== 'string' || !site.fixed.includes(`${key}: "${pinned}",`);
});
check(
	'the fixed block keeps the five pinned keys byte for byte',
	mismatchedPin.length === 0,
	mismatchedPin.join(', ')
);

// The destructive base row is the one that must stop being the stock tint; the outline rows keep the
// 10 percent tone surface on purpose, so a block-wide string search would read them as a regression.
const destructiveRow = (text) => /(?:^|\n)\s*"?destructive"?: "([^"]*)"/.exec(text)?.[1] ?? '';
const baseIsFilled = (text) => {
	const row = destructiveRow(text);
	return (
		row.includes('bg-destructive ') &&
		!row.includes('bg-destructive/10') &&
		!/(?:^|\s)text-destructive(?:\s|$)/.test(row)
	);
};
check(
	'the fixed destructive base drops the tint',
	baseIsFilled(site.fixed),
	destructiveRow(site.fixed)
);
check(
	'the destructive row keeps the pinned focus ring',
	[
		'focus-visible:ring-destructive/20',
		'dark:focus-visible:ring-destructive/40',
		'focus-visible:border-destructive/40'
	].every((token) => byKey('destructive').class.includes(token))
);

const declaredKeys = [...site.fixed.matchAll(/^\t\t\t\t"?([\w-]+)"?: "/gm)].map(
	(match) => match[1]
);
check(
	'the fixed block declares thirty-one keys',
	declaredKeys.length === 31 &&
		new Set(declaredKeys).size === 31 &&
		[...['default', 'outline', 'secondary', 'ghost', 'link'], ...keys].every((key) =>
			declaredKeys.includes(key)
		),
	declaredKeys.join(', ')
);

const applied = join(WORK, 'applied');
scaffold(applied);
const appliedRun = cliResult(applied);
check('init over the button fixture exits 0', appliedRun.code === 0, `exit ${appliedRun.code}`);
check(
	'init reports the variant site stock -> fixed',
	appliedRun.out.includes(`button button-variants (${FILENAME}): stock -> fixed`),
	lineWith(appliedRun.out, 'button-variants')
);

const appliedText = textOf(applied, FILENAME);
check('the applied file holds the fixed block', appliedText.includes(site.fixed));
check('the applied file drops the destructive tint', baseIsFilled(appliedText));
check(
	'the radius table still applies in the same file',
	!appliedText.includes('rounded-none') &&
		appliedText.includes('rounded-md border border-transparent')
);

const newKeys = TICKET_KEYS.filter((key) => key !== 'destructive');
const newKeyLines = (text) => newKeys.filter((key) => !text.includes(`${writtenKey(key)}: "`));
check(
	'the file carries every new key',
	newKeyLines(appliedText).length === 0,
	newKeyLines(appliedText).join(', ')
);

const appliedHeader = headerLines(readFileSync(cssPathOf(applied), 'utf8'));
check(
	'the header records one fully fixed component',
	appliedHeader.length === 1 && appliedHeader[0].startsWith(headerFor(1)),
	appliedHeader[0]
);

const appliedCheck = cliResult(applied, 'fix', '--check');
check('--check exits 0 after init', appliedCheck.code === 0, `exit ${appliedCheck.code}`);
const appliedStrict = cliResult(applied, 'fix', '--strict');
check('--strict exits 0 after init', appliedStrict.code === 0, `exit ${appliedStrict.code}`);

const buttonBefore = digest(pathOf(applied, FILENAME));
const second = cliResult(applied, 'fix');
check(
	'a second fix exits 0 and reports every site fixed',
	second.code === 0 && second.out.includes('fix: 0 stock'),
	`exit ${second.code}`
);
check(
	'a second fix leaves the button file byte-identical',
	digest(pathOf(applied, FILENAME)) === buttonBefore
);

const states = join(WORK, 'states');
scaffold(states);
cli(states);
const success = byKey('success');
replaceIn(
	pathOf(states, FILENAME),
	`${success.key}: "${success.class}",`,
	'success: "bg-success/50",'
);
const statesRun = cliResult(states, 'fix', 'button');
const statesText = textOf(states, FILENAME);
check(
	'a hand-edited variant row reports customized',
	statesRun.out.includes(`button button-variants (${FILENAME}): customized`),
	lineWith(statesRun.out, 'button-variants')
);
check('the hand edit survives the run', statesText.includes('success: "bg-success/50",'));

const added = join(WORK, 'added');
scaffold(added);
const addedPath = pathOf(added, FILENAME);
const linkLine = `\t\t\t\tlink: "${pinnedClass('link')}",`;
const closing = '\t\t\t},';
const addedText = readFileSync(addedPath, 'utf8');
const anchor = `${linkLine}\n${closing}`;
writeFileSync(
	addedPath,
	addedText.replace(
		anchor,
		`${linkLine}\n\t\t\t\tbrand: "bg-brand text-brand-foreground",\n${closing}`
	)
);
const addedRun = cliResult(added, 'fix', 'button');
const addedAfter = textOf(added, FILENAME);
check(
	'a user-added key reports customized',
	addedRun.out.includes(`button button-variants (${FILENAME}): customized`),
	lineWith(addedRun.out, 'button-variants')
);
check(
	'a user-added key is kept and the fixer inserts nothing',
	addedAfter.includes('brand: "bg-brand text-brand-foreground",') &&
		!addedAfter.includes('success: "')
);

const restored = join(WORK, 'restored');
scaffold(restored);
cli(restored);
replaceIn(pathOf(restored, FILENAME), site.fixed, site.stock);
const restoredCheck = cliResult(restored, 'fix', '--check');
check(
	'--check with a stock variant site exits 1 and writes nothing',
	restoredCheck.code === 1 && textOf(restored, FILENAME).includes(site.stock),
	`exit ${restoredCheck.code}`
);
const restoredRun = cliResult(restored, 'fix', 'button');
check(
	'a restored stock block reports stock -> fixed and is written',
	restoredRun.out.includes(`button button-variants (${FILENAME}): stock -> fixed`) &&
		textOf(restored, FILENAME).includes(site.fixed),
	lineWith(restoredRun.out, 'button-variants')
);

const missing = join(WORK, 'missing');
scaffold(missing);
cli(missing);
rmSync(pathOf(missing, FILENAME), { force: true });
const missingRun = cliResult(missing, 'fix', 'button');
check(
	'a deleted button file reports missing and is not recreated',
	missingRun.code === 0 &&
		missingRun.out.includes(`button button-variants (${FILENAME}): missing`) &&
		!existsSync(pathOf(missing, FILENAME)),
	`exit ${missingRun.code}`
);

const customizedStrict = cliResult(states, 'fix', '--strict');
check(
	'--strict exits 1 on the customized fixture',
	customizedStrict.code === 1,
	`exit ${customizedStrict.code}`
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? `all ${results.length} variants checks passed` : `${failed.length} of ${results.length} variants check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
