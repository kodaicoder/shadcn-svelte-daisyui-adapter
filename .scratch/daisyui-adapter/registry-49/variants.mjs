import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { uiDirectory } from '../../../packages/daisyui-adapter/component-fix.mjs';
import {
	BINARY_COMPONENTS,
	BINARY_SITES,
	TARGETS
} from '../../../packages/daisyui-adapter/targets.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const STOCK_DIR = join(REPO, 'src', 'lib', 'components', 'ui');
const FIXED_DIR = join(REPO, 'src', 'lib', 'components');
const THEME = resolve(HERE, '..', 'registry-12', 'probe-theme.css');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-49-tones');

const FILES = {
	checkbox: 'checkbox/checkbox.svelte',
	switch: 'switch/switch.svelte',
	'radio-group': 'radio-group/radio-group-item.svelte',
	toggle: 'toggle/toggle.svelte'
};
const TONES = ['default', 'secondary', 'success', 'warning', 'info', 'destructive', 'blackwhite'];
const STATUS = ['success', 'warning', 'info', 'destructive'];
const OUTLINE = [
	'outline-secondary',
	'outline-success',
	'outline-warning',
	'outline-info',
	'outline-destructive',
	'outline-blackwhite'
];

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const scaffold = (dir, { components = BINARY_COMPONENTS, shadcn = '1.8.0' } = {}) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));

	const json = { tailwind: { css: 'src/routes/layout.css' }, style: 'mira' };
	writeFileSync(join(dir, 'components.json'), JSON.stringify(json, null, '\t'));
	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify(
			{ name: 'adapter-49-fixture', type: 'module', imports: { '#lib/*': './src/lib/*' } },
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
	mkdirSync(ui, { recursive: true });
	for (const component of components) {
		cpSync(join(STOCK_DIR, component), join(ui, component), { recursive: true });
	}
	return ui;
};

const uiOf = (dir) =>
	uiDirectory(JSON.parse(readFileSync(join(dir, 'components.json'), 'utf8')), dir);
const pathOf = (dir, file) => join(uiOf(dir), ...file.split('/'));
const textOf = (path) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const digest = (path) => createHash('sha256').update(textOf(path)).digest('hex');

const cli = (dir, ...args) =>
	execFileSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });
const cliResult = (dir, ...args) => {
	const result = spawnSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8' });
	return { code: result.status ?? 1, out: `${result.stdout ?? ''}${result.stderr ?? ''}` };
};

const lineWith = (out, id) => out.split(/\r?\n/).find((line) => line.includes(id)) ?? out.trim();
const countOf = (text, needle) => text.split(needle).length - 1;
const writtenKey = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : `"${key}"`);
const mapOf = (text) => {
	const rows = [...text.matchAll(/^\t+"?([\w-]+)"?: "([^"]*)",$/gm)].map((match) => ({
		key: match[1],
		class: match[2]
	}));
	return Object.fromEntries(rows.map((row) => [row.key, row.class]));
};

check('TARGETS.binarySites is BINARY_SITES', TARGETS.binarySites === BINARY_SITES);
check('TARGETS.binaryComponents is BINARY_COMPONENTS', TARGETS.binaryComponents === BINARY_COMPONENTS);
check(
	'the manifest holds eighteen binary sites',
	BINARY_SITES.length === 18,
	`${BINARY_SITES.length}`
);
check(
	'each control declares the expected site count',
	BINARY_COMPONENTS.every(
		(component) =>
			BINARY_SITES.filter((site) => site.component === component).length ===
			({ checkbox: 5, switch: 5, 'radio-group': 5, toggle: 3 })[component]
	),
	BINARY_COMPONENTS.map(
		(component) => `${component}:${BINARY_SITES.filter((site) => site.component === component).length}`
	).join(', ')
);
check(
	'every site file is one of the four controls',
	BINARY_SITES.every((site) => site.file === FILES[site.component]),
	BINARY_SITES.map((site) => site.file).join(', ')
);

const pinned = Object.fromEntries(
	Object.entries(FILES).map(([component, file]) => [component, textOf(join(STOCK_DIR, ...file.split('/')))])
);
const pinnedStock = BINARY_SITES.filter(
	(site) => countOf(pinned[site.component], site.stock) !== 1
).map((site) => site.id);
check('every stock anchor occurs once in the pinned file', pinnedStock.length === 0, pinnedStock.join(', '));
check(
	'every fixed anchor differs from its stock anchor',
	BINARY_SITES.every((site) => site.fixed !== site.stock),
	BINARY_SITES.filter((site) => site.fixed === site.stock)
		.map((site) => site.id)
		.join(', ')
);
const insertSiteIds = new Set([
	'toggle-tones',
	'checkbox-insert',
	'radio-group-insert',
	'switch-insert'
]);
check(
	'no replacement anchor contains its stock anchor',
	BINARY_SITES.filter((site) => !insertSiteIds.has(site.id)).every(
		(site) => !site.fixed.includes(site.stock)
	),
	BINARY_SITES.filter((site) => !insertSiteIds.has(site.id) && site.fixed.includes(site.stock))
		.map((site) => site.id)
		.join(', ')
);

const mapSite = (component) => BINARY_SITES.find((site) => site.id === `${component}-tones`);
const maps = Object.fromEntries(Object.keys(FILES).filter((c) => c !== 'toggle').map((c) => [c, mapOf(mapSite(c).fixed)]));

check(
	'each control map holds the seven tones in order',
	Object.values(maps).every(
		(map) => Object.keys(map).join(',') === TONES.join(',') && TONES.every((tone) => map[tone])
	),
	Object.values(maps)
		.map((map) => Object.keys(map).join(','))
		.join(' | ')
);
check(
	'each map row is a non-empty literal',
	Object.values(maps).every((map) =>
		Object.values(map).every((value) => typeof value === 'string' && value.length > 0 && !/[$`{]/.test(value))
	)
);
check(
	'each map uses primary for the default key',
	Object.entries(maps).every(([component, map]) => {
		if (component === 'switch') {
			return (
				map.default.includes('data-checked:bg-primary/10') &&
				map.default.includes('[&_[data-slot=switch-thumb]]:bg-primary')
			);
		}
		if (component === 'radio-group') {
			return (
				map.default.includes('data-checked:bg-primary/10') &&
				map.default.includes('[&_[data-slot=radio-group-indicator]>svg]:bg-primary')
			);
		}
		return map.default.includes('bg-primary') && map.default.includes('text-primary-foreground');
	}),
	Object.values(maps).map((map) => map.default).join(' | ')
);

const missingPair = [];
for (const [component, map] of Object.entries(maps)) {
	for (const tone of TONES) {
		const token = tone === 'default' ? 'primary' : tone;
		const border =
			STATUS.includes(tone)
				? `data-checked:border-${tone}-text`
				: tone === 'secondary'
					? 'data-checked:border-secondary-foreground dark:data-checked:border-secondary'
					: `data-checked:border-${token}`;
		const row = map[tone];
		const child =
			component === 'switch'
				? `[&_[data-slot=switch-thumb]]:bg-${token}`
				: component === 'radio-group'
					? `[&_[data-slot=radio-group-indicator]>svg]:bg-${token}`
					: null;
		const ok = child
			? row.includes(`data-checked:bg-${token}/10`) && row.includes(border) && row.includes(child)
			: row.includes(`data-checked:bg-${token} `) &&
				row.includes(`data-checked:text-${token}-foreground`) &&
				row.includes(border);
		if (!ok) missingPair.push(`${component}:${tone}`);
	}
}
check('every map row is the tone fill, foreground and border pair', missingPair.length === 0, missingPair.join(', '));
check(
	'each radio row paints its checked text with the tone',
	TONES.every((tone) => {
		const token = tone === 'default' ? 'primary' : tone;
		return maps['radio-group'][tone].includes(`data-checked:text-${token}`);
	})
);

const missingRing = [];
for (const [component, map] of Object.entries(maps)) {
	for (const tone of TONES) {
		const token = tone === 'default' ? 'primary' : tone;
		const border =
			STATUS.includes(tone) ? `${tone}-text` : tone === 'secondary' ? 'secondary-foreground' : token;
		if (!map[tone].includes(`focus-visible:ring-${token}/30`)) missingRing.push(`${component}:${tone}`);
	}
}
check('every map row carries its tone focus ring', missingRing.length === 0, missingRing.join(', '));
check(
	'every focus ring is the raw tone, not a text token',
	Object.values(maps).every((map) =>
		TONES.every((tone) => {
			const token = tone === 'default' ? 'primary' : tone;
			return (
				map[tone].includes(`focus-visible:ring-${token}/30`) &&
				!map[tone].includes(`focus-visible:ring-${token}-text`)
			);
		})
	)
);

const focusSites = ['checkbox-focus', 'switch-focus', 'radio-group-focus'].map((id) =>
	BINARY_SITES.find((site) => site.id === id)
);
check(
	'the focus sites drop the primary focus border',
	focusSites.every((site) => Boolean(site)) &&
		focusSites.every(
			(site) => site.stock.includes('focus-visible:border-ring') && !site.fixed.includes('focus-visible:border-ring')
		) &&
		!BINARY_SITES.find((site) => site.id === 'toggle-pressed').fixed.includes('focus-visible:border-ring'),
	focusSites.map((site) => site?.id).join(', ')
);

const childRules = BINARY_SITES.filter(
	(site) => site.id === 'switch-tones' || site.id === 'radio-group-tones'
).map((site) => site.fixed);
check(
	'the switch thumb and the radio dot take the tone',
	childRules[0].includes('[&_[data-slot=switch-thumb]]:bg-primary') &&
		childRules[0].includes('[&_[data-slot=switch-thumb]]:bg-blackwhite') &&
		childRules[1].includes(
			'data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-primary'
		) &&
		childRules[1].includes(
			'data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-blackwhite'
		),
	`${childRules.length} maps`
);

const colorSites = {
	checkbox: BINARY_SITES.find((site) => site.id === 'checkbox-colors').fixed,
	'radio-group': BINARY_SITES.find((site) => site.id === 'radio-group-colors').fixed
};
check(
	'the dark unchecked surface is scoped to not-data-checked',
	colorSites.checkbox.includes('dark:not-data-checked:bg-input/30') &&
		colorSites['radio-group'].includes('dark:not-data-checked:bg-input/30') &&
		pinned.switch.includes('dark:data-unchecked:bg-input/80') &&
		BINARY_SITES.every((site) => !site.fixed.includes(' dark:bg-input/30')),
	'checkbox and radio-group colors, pinned switch root'
);
check(
	'the dark checked primary twin is gone',
	BINARY_SITES.every((site) => !site.fixed.includes('dark:data-checked:bg-primary'))
);
check(
	'no fixed anchor forces a class with !',
	BINARY_SITES.every((site) => !site.fixed.includes('!'))
);
check(
	'the tone row follows the base class through cn',
	['checkbox-insert', 'radio-group-insert', 'switch-insert'].every((id) =>
		BINARY_SITES.find((site) => site.id === id).fixed.includes('\t\tTONES[variant],\n\t\tclassName')
	)
);

const toggleVariantSite = BINARY_SITES.find((site) => site.id === 'toggle-tones');
const toggleOutlineSite = BINARY_SITES.find((site) => site.id === 'toggle-outline-tones');
const toggleRows = { ...mapOf(toggleVariantSite.fixed), ...mapOf(toggleOutlineSite.fixed) };
check(
	'toggle holds the seven filled tones and the seven outline keys',
	TONES.every((tone) => toggleRows[tone]) &&
		toggleRows.outline &&
		OUTLINE.every((key) => toggleRows[key]) &&
		Object.keys(toggleRows).length === 14,
	Object.keys(toggleRows).join(', ')
);
check(
	'every toggle outline pair carries the tone border and the pressed fill',
	OUTLINE.every((key) => {
		const tone = key.replace('outline-', '');
		const token = tone === 'default' ? 'primary' : tone;
		const border =
			STATUS.includes(tone)
				? `border-${tone}-text`
				: tone === 'secondary'
					? 'border-secondary-foreground dark:border-secondary'
					: `border-${token}`;
		const row = toggleRows[key];
		return row.includes(border) && row.includes(`aria-pressed:bg-${token}`);
	})
);
check(
	'toggle scopes the unpressed hover to the tone at 20 percent and keeps the pressed paint in the base',
	toggleRows.outline.includes('enabled:aria-[pressed=false]:hover:bg-primary/20') &&
		TONES.every((tone) =>
			toggleRows[tone].includes(
				`enabled:aria-[pressed=false]:hover:bg-${tone === 'default' ? 'primary' : tone}/20`
			)
		) &&
		!BINARY_SITES.find((site) => site.id === 'toggle-pressed').fixed.includes('hover:bg-muted ') &&
		BINARY_SITES.find((site) => site.id === 'toggle-pressed').fixed.includes('aria-pressed:bg-primary') &&
		BINARY_SITES.find((site) => site.id === 'toggle-pressed').fixed.includes('cursor-pointer') &&
		BINARY_SITES.find((site) => site.id === 'toggle-pressed').fixed.includes(
			'disabled:cursor-not-allowed'
		)
);
check(
	'every toggle key carries its focus ring',
	TONES.every((tone) => {
		const token = tone === 'default' ? 'primary' : tone;
		return toggleRows[tone].includes(`focus-visible:ring-${token}/30`);
	}) && toggleRows.outline.includes('focus-visible:ring-primary/30')
);
check(
	'no tone row carries a radius utility',
	[
		...Object.values(maps).flatMap((map) => Object.values(map)),
		...Object.values(toggleRows)
	].every((row) => !/\brounded-/.test(row))
);
check(
	'the secondary border follows the foreground in light and the tone in dark',
	Object.values(maps).every((map) =>
		map.secondary.includes('data-checked:border-secondary-foreground dark:data-checked:border-secondary')
	) &&
		toggleRows['outline-secondary'].includes(
			'border-secondary-foreground dark:border-secondary'
		) &&
		toggleRows['outline-secondary'].includes('aria-pressed:text-secondary-foreground')
);

const applied = join(WORK, 'applied');
scaffold(applied);
const appliedRun = cliResult(applied);
check('init over the four-control fixture exits 0', appliedRun.code === 0, `exit ${appliedRun.code}`);
for (const site of BINARY_SITES) {
	check(
		`${site.id} reports stock -> fixed`,
		appliedRun.out.includes(`${site.component} ${site.id} (${site.file}): stock -> fixed`),
		lineWith(appliedRun.out, site.id)
	);
}

const mismatchedCopy = [];
for (const [component, file] of Object.entries(FILES)) {
	const generated = textOf(pathOf(applied, file));
	const committed = textOf(join(FIXED_DIR, `${component}-fixed`, ...file.split('/').slice(1)));
	if (generated !== committed) mismatchedCopy.push(component);
}
check(
	'the fixer reproduces each committed reviewer copy byte for byte',
	mismatchedCopy.length === 0,
	mismatchedCopy.join(', ')
);

const header = textOf(join(applied, 'src', 'routes', 'layout.css'))
	.split('\n')
	.find((line) => line.startsWith('/* '));
check(
	'the header records four fully fixed components',
	header?.startsWith(`/* ${NAME} ${VERSION} | components 4 fixed | re-run `),
	header
);

const appliedCheck = cliResult(applied, 'fix', '--check');
check('--check exits 0 after init', appliedCheck.code === 0, `exit ${appliedCheck.code}`);
const appliedStrict = cliResult(applied, 'fix', '--strict');
check('--strict exits 0 after init', appliedStrict.code === 0, `exit ${appliedStrict.code}`);

const before = Object.fromEntries(
	Object.entries(FILES).map(([component, file]) => [component, digest(pathOf(applied, file))])
);
const second = cliResult(applied, 'fix');
check(
	'a second fix exits 0 and reports every site fixed',
	second.code === 0 && second.out.includes('fix: 0 stock'),
	`exit ${second.code}`
);
check(
	'a second fix leaves every control byte-identical',
	Object.entries(FILES).every(([component, file]) => digest(pathOf(applied, file)) === before[component])
);

const states = join(WORK, 'states');
scaffold(states);
cli(states);
const statesPath = pathOf(states, FILES.checkbox);
writeFileSync(
	statesPath,
	textOf(statesPath).replace(
		/success: "data-checked:bg-success[^"]*"/,
		'success: "data-checked:bg-success/50"'
	)
);
const statesRun = cliResult(states, 'fix', 'checkbox');
const statesText = textOf(statesPath);
check(
	'a hand-edited tone row reports customized',
	statesRun.out.includes('checkbox checkbox-tones (checkbox/checkbox.svelte): customized'),
	lineWith(statesRun.out, 'checkbox-tones')
);
check('the hand edit survives the run', statesText.includes('success: "data-checked:bg-success/50",'));

const restored = join(WORK, 'restored');
scaffold(restored);
cli(restored);
const restoredPath = pathOf(restored, FILES.toggle);
const propsSite = BINARY_SITES.find((site) => site.id === 'toggle-tones');
writeFileSync(restoredPath, textOf(restoredPath).replace(propsSite.fixed, propsSite.stock));
const restoredCheck = cliResult(restored, 'fix', '--check');
check(
	'--check with a stock tone row exits 1 and writes nothing',
	restoredCheck.code === 1 && textOf(restoredPath).includes(propsSite.stock),
	`exit ${restoredCheck.code}`
);
const restoredRun = cliResult(restored, 'fix', 'toggle');
check(
	'a restored stock tone row reports stock -> fixed and is written',
	restoredRun.out.includes('toggle toggle-tones (toggle/toggle.svelte): stock -> fixed') &&
		textOf(restoredPath).includes(propsSite.fixed),
	lineWith(restoredRun.out, 'toggle-tones')
);

const partial = join(WORK, 'partial');
scaffold(partial);
cli(partial);
const partialPath = pathOf(partial, FILES.checkbox);
const colorsSite = BINARY_SITES.find((site) => site.id === 'checkbox-colors');
writeFileSync(partialPath, textOf(partialPath).replace(colorsSite.fixed, colorsSite.stock));
const partialRun = cliResult(partial, 'fix', 'checkbox');
check(
	'a fixed radius step does not hide a stock tone site',
	partialRun.out.includes('checkbox checkbox-colors (checkbox/checkbox.svelte): stock -> fixed') &&
		partialRun.out.includes('checkbox checkbox-selector (checkbox/checkbox.svelte): fixed') &&
		textOf(partialPath) === textOf(join(FIXED_DIR, 'checkbox-fixed', 'checkbox.svelte')),
	lineWith(partialRun.out, 'checkbox-colors')
);

const missing = join(WORK, 'missing');
scaffold(missing);
cli(missing);
rmSync(pathOf(missing, FILES.switch), { force: true });
const missingRun = cliResult(missing, 'fix', 'switch');
check(
	'a deleted switch reports missing and is not recreated',
	missingRun.code === 0 &&
		missingRun.out.includes('switch switch-tones (switch/switch.svelte): missing') &&
		!existsSync(pathOf(missing, FILES.switch)),
	`exit ${missingRun.code}`
);

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? `all ${results.length} binary tone checks passed` : `${failed.length} of ${results.length} binary tone check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
