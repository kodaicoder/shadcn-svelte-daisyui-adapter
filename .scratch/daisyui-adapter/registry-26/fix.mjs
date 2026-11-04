// The REFERENCE theme values are copied from registry-12/probe-theme.css instead of read from it, so
// a wrong token in the fixer table cannot pass by agreeing with itself.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
	COMPONENTS,
	PAIRS,
	SITES,
	uiDirectory
} from '../../../packages/daisyui-adapter/component-fix.mjs';
import { SURFACES, VARIANTS } from '../../../packages/daisyui-adapter/targets.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const CLI = join(PKG_DIR, 'cli', 'init.mjs');
const STOCK = join(REPO, 'src', 'lib', 'components', 'ui');
const THEME = resolve(HERE, '..', 'registry-12', 'probe-theme.css');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-26-fix');

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const scaffold = (dir, { components = COMPONENTS, aliases } = {}) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));
	const json = { tailwind: { css: 'src/routes/layout.css' }, style: 'mira' };
	if (aliases) json.aliases = aliases;
	writeFileSync(join(dir, 'components.json'), JSON.stringify(json, null, '\t'));
	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify(
			{ name: 'adapter-26-fixture', type: 'module', imports: { '#lib/*': './src/lib/*' } },
			null,
			'\t'
		)
	);
	// The CLI installs its own version when node_modules holds nothing, so this stub keeps the seam
	// off the registry.
	const stub = join(dir, 'node_modules', ...NAME.split('/'), 'package.json');
	mkdirSync(dirname(stub), { recursive: true });
	writeFileSync(stub, JSON.stringify({ name: NAME, version: VERSION }, null, '\t'));
	// The fixer's guard reads the installed shadcn-svelte, so the fixture names the supported pin.
	const shadcn = join(dir, 'node_modules', 'shadcn-svelte', 'package.json');
	mkdirSync(dirname(shadcn), { recursive: true });
	writeFileSync(shadcn, JSON.stringify({ name: 'shadcn-svelte', version: '1.8.0' }, null, '\t'));
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
const readSiteFile = (dir, site) => readFileSync(pathOf(dir, site), 'utf8');

const FILES = [...new Set([...SITES, ...SURFACES].map((site) => site.file))];
const digest = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const snapshot = (dir) =>
	FILES.map((file) => {
		const path = join(uiOf(dir), ...file.split('/'));
		return `${file}:${existsSync(path) ? digest(path) : 'absent'}`;
	});

const cli = (dir, ...args) =>
	execFileSync(process.execPath, [CLI, ...args], { cwd: dir, encoding: 'utf8', stdio: 'pipe' });

const cliResult = (dir, ...args) => {
	try {
		return { code: 0, out: cli(dir, ...args) };
	} catch (error) {
		return { code: error.status ?? 1, out: `${error.stdout ?? ''}${error.stderr ?? ''}` };
	}
};

const SITE_LINE =
	/^\[daisyui-adapter\] (\S+) (\S+) \(([^)]+)\): (missing|stock|fixed|customized)( -> fixed| \(dry run\))?$/gm;
const TOTALS =
	/^\[daisyui-adapter\] fix: (\d+) stock, (\d+) fixed, (\d+) customized, (\d+) missing(; dry run, nothing written)?$/m;

const parseSites = (out) =>
	[...out.matchAll(SITE_LINE)].map((match) => ({
		component: match[1],
		id: match[2],
		file: match[3],
		state: match[4],
		written: match[5] === ' -> fixed',
		dryRun: match[5] === ' (dry run)'
	}));

const siteOf = (sites, id) => sites.find((site) => site.id === id);

check('the manifest names nine components', COMPONENTS.length === 9, `${COMPONENTS.length}`);
check('the manifest holds eleven replacement sites', SITES.length === 11, `${SITES.length}`);
check('the manifest holds ten contrast pairs', PAIRS.length === 10, `${PAIRS.length}`);
const siteIds = new Set(SITES.map((site) => site.id));
check(
	'every pair site id exists',
	PAIRS.every((pair) => pair.sites.every((id) => siteIds.has(id)))
);
check(
	'every pair threshold is 4.5',
	PAIRS.every((pair) => pair.threshold === 4.5)
);
check(
	'every site belongs to a named component',
	SITES.every((site) => COMPONENTS.includes(site.component))
);
check(
	'no fixed string is contained in its own stock string, so a stock file cannot report fixed',
	SITES.every((site) => !site.stock.includes(site.fixed)),
	SITES.filter((site) => site.stock.includes(site.fixed))
		.map((site) => site.id)
		.join(', ')
);

// The alias rules, pinned to concrete paths so a wrong default cannot agree with the scaffold.
const aliasRoot = join(WORK, 'alias-root');
check(
	'no alias resolves to src/lib/components/ui',
	uiDirectory({}, aliasRoot) === join(aliasRoot, 'src', 'lib', 'components', 'ui'),
	uiDirectory({}, aliasRoot)
);
check(
	'aliases.components falls back to its ui child',
	uiDirectory({ aliases: { components: '#lib/components' } }, aliasRoot) ===
		join(aliasRoot, 'src', 'lib', 'components', 'ui'),
	uiDirectory({ aliases: { components: '#lib/components' } }, aliasRoot)
);
check(
	'$lib resolves under src/lib',
	uiDirectory({ aliases: { ui: '$lib/custom-ui' } }, aliasRoot) ===
		join(aliasRoot, 'src', 'lib', 'custom-ui'),
	uiDirectory({ aliases: { ui: '$lib/custom-ui' } }, aliasRoot)
);
check(
	'@/ resolves under src',
	uiDirectory({ aliases: { ui: '@/lib/ui' } }, aliasRoot) === join(aliasRoot, 'src', 'lib', 'ui'),
	uiDirectory({ aliases: { ui: '@/lib/ui' } }, aliasRoot)
);
const importRoot = join(WORK, 'alias-imports');
mkdirSync(importRoot, { recursive: true });
writeFileSync(
	join(importRoot, 'package.json'),
	JSON.stringify({ imports: { '#app/*': './src/design/*' } }, null, '\t')
);
check(
	'a subpath import remapped in package.json wins over the #lib convention',
	uiDirectory({ aliases: { ui: '#app/ui' } }, importRoot) ===
		join(importRoot, 'src', 'design', 'ui'),
	uiDirectory({ aliases: { ui: '#app/ui' } }, importRoot)
);

const fresh = join(WORK, 'fresh');
// The fixture installs COMPONENTS only, so its report covers the sites whose files those
// components hold. A site whose 1.8 stock already holds the target step is reported fixed
// without a write, so the expected split comes from the manifest rather than a copied total.
const FIXTURE_SITES = [...SITES, ...SURFACES, ...VARIANTS].filter((site) =>
	COMPONENTS.includes(site.component)
);
const ASSERTED = FIXTURE_SITES.filter((site) => site.stock === site.fixed).length;
const CHANGED = FIXTURE_SITES.length - ASSERTED;
scaffold(fresh);
check(
	'the scaffold copies into src/lib/components/ui',
	existsSync(join(fresh, 'src', 'lib', 'components', 'ui', 'dialog'))
);
const freshRun = cliResult(fresh);
const freshSites = parseSites(freshRun.out);
check('init with components present exits 0', freshRun.code === 0, `exit ${freshRun.code}`);
check('init still writes 43 declarations per block', freshRun.out.includes('43 light, 43 dark'));
check(
	'init reports every site',
	freshSites.length === FIXTURE_SITES.length,
	`${freshSites.length}`
);
check(
	'init finds every site stock or already at its step, and writes the stock ones',
	freshSites.every((site) =>
		site.state === 'fixed' ? !site.written : site.state === 'stock' && site.written
	)
);
check(
	'init totals the changed stock and the already-fixed sites',
	TOTALS.test(freshRun.out) &&
		freshRun.out.includes(`fix: ${CHANGED} stock, ${ASSERTED} fixed, 0 customized, 0 missing`),
	freshRun.out.trim().split('\n').at(-1)
);
check(
	'the report path is forward-slash relative',
	siteOf(freshSites, 'dialog-close').file === 'dialog/dialog-content.svelte',
	siteOf(freshSites, 'dialog-close').file
);

for (const site of SITES) {
	const content = readSiteFile(fresh, site);
	check(`${site.id}: the stock string is gone`, !content.includes(site.stock));
	check(`${site.id}: the fixed string is present`, content.includes(site.fixed));
}

const dialog = readSiteFile(fresh, SITES[0]);
check(
	'dialog close holds bg-muted and no bg-secondary',
	dialog.includes('bg-muted') && !dialog.includes('bg-secondary')
);
const tooltip = readSiteFile(fresh, SITES[9]);
check(
	'chart tooltip label holds class="text-foreground"',
	tooltip.includes('<span class="text-foreground">')
);
const bubble = readSiteFile(fresh, SITES[10]);
check(
	'bubble muted holds the explicit text token',
	bubble.includes('*:data-[slot=bubble-content]:text-foreground')
);

const fixedSnapshot = snapshot(fresh);
const secondRun = cliResult(fresh, 'fix');
const secondSites = parseSites(secondRun.out);
check('a second fix exits 0', secondRun.code === 0, `exit ${secondRun.code}`);
check(
	'a second fix finds every site fixed and writes nothing',
	secondSites.length === FIXTURE_SITES.length &&
		secondSites.every((site) => site.state === 'fixed' && !site.written)
);
check(
	'a second fix totals thirty-nine fixed',
	TOTALS.test(secondRun.out) &&
		secondRun.out.includes('fix: 0 stock, 39 fixed, 0 customized, 0 missing')
);
check('a second fix is byte-identical', snapshot(fresh).join('\n') === fixedSnapshot.join('\n'));

const middle = SITES.find((site) => site.id === 'range-middle');
const middleHover = SITES.find((site) => site.id === 'range-middle-hover');
const perSite = join(WORK, 'per-site');
scaffold(perSite);
cli(perSite);
const cellPath = pathOf(perSite, middle);
writeFileSync(
	cellPath,
	readFileSync(cellPath, 'utf8')
		.replace(middle.fixed, middle.fixed.replace('text-accent-foreground', 'text-red-500'))
		.replace(middleHover.fixed, middleHover.stock)
);
const perSiteRun = cliResult(perSite, 'fix', 'range-calendar');
const perSiteSites = parseSites(perSiteRun.out);
const middleAfter = siteOf(perSiteSites, 'range-middle');
const hoverAfter = siteOf(perSiteSites, 'range-middle-hover');
check(
	'a hand-edited site reports customized',
	middleAfter.state === 'customized' && !middleAfter.written,
	middleAfter.state
);
check(
	'the other site in the same file still applies',
	hoverAfter.state === 'stock' && hoverAfter.written,
	`${hoverAfter.state}${hoverAfter.written ? ' -> fixed' : ''}`
);
const cellAfter = readFileSync(cellPath, 'utf8');
check('the hand edit survives the run', cellAfter.includes('text-red-500'));
check('the stock hover string is gone', !cellAfter.includes(middleHover.stock));

const dry = join(WORK, 'dry');
scaffold(dry);
const drySnapshot = snapshot(dry);
const dryRun = cliResult(dry, 'fix', '--dry-run');
const drySites = parseSites(dryRun.out);
check('a dry run exits 0', dryRun.code === 0, `exit ${dryRun.code}`);
check(
	'a dry run reports every site stock or already fixed, and unwritten',
	drySites.length === FIXTURE_SITES.length &&
		drySites.every(
			(site) => !site.written && (site.state === 'fixed' || (site.state === 'stock' && site.dryRun))
		)
);
check(
	'a dry run totals with the dry-run note',
	TOTALS.test(dryRun.out) &&
		dryRun.out.includes(
			`fix: ${CHANGED} stock, ${ASSERTED} fixed, 0 customized, 0 missing; dry run, nothing written`
		),
	dryRun.out.trim().split('\n').at(-1)
);
check(
	'a dry run leaves every file byte-identical',
	snapshot(dry).join('\n') === drySnapshot.join('\n')
);

const one = join(WORK, 'one');
scaffold(one);
const oneBefore = snapshot(one);
const oneRun = cliResult(one, 'fix', 'dialog');
const oneSites = parseSites(oneRun.out);
check(
	'fix dialog runs two sites',
	oneSites.length === 2 && oneSites[0].id === 'dialog-close' && oneSites[0].written,
	oneSites.map((site) => site.id).join(', ')
);
const oneAfter = snapshot(one);
const moved = oneBefore.filter((entry, i) => entry !== oneAfter[i]);
check(
	'fix dialog changes only the dialog file',
	moved.length === 1 && moved[0].startsWith('dialog/dialog-content.svelte:'),
	moved.map((entry) => entry.split(':')[0]).join(', ')
);
check(
	'fix dialog leaves the other stock strings in place',
	SITES.filter((site) => site.component !== 'dialog').every((site) =>
		readSiteFile(one, site).includes(site.stock)
	) &&
		SURFACES.filter(
			(site) => site.component !== 'dialog' && COMPONENTS.includes(site.component)
		).every((site) => readSiteFile(one, site).includes(site.stock))
);
check(
	'fix dialog patches the close button',
	readSiteFile(one, SITES[0]).includes('bg-muted') &&
		!readSiteFile(one, SITES[0]).includes('bg-secondary')
);

const gone = join(WORK, 'missing');
const goneUi = scaffold(gone);
rmSync(join(goneUi, 'dialog'), { recursive: true, force: true });
const goneRun = cliResult(gone, 'fix');
const goneSites = parseSites(goneRun.out);
const goneSite = siteOf(goneSites, 'dialog-close');
check('a deleted component reports missing', goneSite.state === 'missing' && !goneSite.written);
check('a missing component is not created', !existsSync(pathOf(gone, SITES[0])));
check('a missing component is not an error', goneRun.code === 0, `exit ${goneRun.code}`);
const namedGone = cliResult(gone, 'fix', 'dialog');
const namedGoneSites = parseSites(namedGone.out);
check(
	'a missing component named on the command line still prints its row',
	namedGone.code === 0 &&
		siteOf(namedGoneSites, 'dialog-close')?.state === 'missing' &&
		!namedGone.out.includes('no target components found'),
	namedGone.out.trim().split('\n')[0]
);

const add = join(WORK, 'add');
const addUi = scaffold(add, { components: ['dialog'] });
const addRun = cliResult(add);
check(
	'init fixes the components present at init',
	readSiteFile(add, SITES[0]).includes('bg-muted')
);
check(
	'init maps the stylesheet with one component present',
	addRun.out.includes('43 light, 43 dark')
);
cpSync(join(STOCK, 'bubble'), join(addUi, 'bubble'), { recursive: true });
cliResult(add, 'fix');
check(
	'fix picks up a component added after init',
	readSiteFile(add, SITES[10]).includes(SITES[10].fixed)
);
check('fix keeps the component fixed at init', readSiteFile(add, SITES[0]).includes('bg-muted'));

const over = join(WORK, 'overwrite');
scaffold(over);
cli(over);
cpSync(join(STOCK, 'dialog', 'dialog-content.svelte'), pathOf(over, SITES[0]));
check(
	'the stock file is back after an overwrite',
	readSiteFile(over, SITES[0]).includes(SITES[0].stock)
);
cliResult(over, 'fix', 'dialog');
check(
	'fix restores an overwritten file',
	readSiteFile(over, SITES[0]).includes('bg-muted') &&
		!readSiteFile(over, SITES[0]).includes('bg-secondary')
);

const none = join(WORK, 'none');
scaffold(none, { components: [] });
const noneRun = cliResult(none);
check('init with no components exits 0', noneRun.code === 0, `exit ${noneRun.code}`);
check(
	'init with no components says nothing to fix',
	noneRun.out.includes('[daisyui-adapter] no target components found; nothing to fix')
);
check(
	'init with no components still maps 43 declarations per block',
	noneRun.out.includes('43 light, 43 dark')
);
check('init with no components creates no ui directory', !existsSync(join(none, 'src', 'lib')));

const commands = join(WORK, 'commands');
scaffold(commands, { components: [] });
const bogusCommand = cliResult(commands, 'bogus');
check(
	'an unknown command exits 1 and names both commands',
	bogusCommand.code === 1 &&
		bogusCommand.out.includes('unknown command "bogus"') &&
		bogusCommand.out.includes('init') &&
		bogusCommand.out.includes('fix [component...]'),
	`exit ${bogusCommand.code}`
);
const bogusFlag = cliResult(commands, 'fix', '--nope');
check(
	'an unknown flag exits 1 and names the flag',
	bogusFlag.code === 1 && bogusFlag.out.includes('unknown flag "--nope"'),
	`exit ${bogusFlag.code}`
);
const unknownTarget = cliResult(commands, 'fix', 'nope');
check(
	'an unknown fix target exits 1 and lists the known targets',
	unknownTarget.code === 1 &&
		unknownTarget.out.includes('unknown fix target "nope"') &&
		unknownTarget.out.includes('dialog, sheet'),
	`exit ${unknownTarget.code}`
);
const initArgs = cliResult(commands, 'init', 'dialog');
check(
	'init refuses arguments',
	initArgs.code === 1 && initArgs.out.includes('init takes no arguments'),
	`exit ${initArgs.code}`
);

const custom = join(WORK, 'custom-alias');
const customUi = scaffold(custom, { aliases: { ui: '$lib/custom-ui' } });
check(
	'the $lib alias resolves under src/lib',
	customUi === join(custom, 'src', 'lib', 'custom-ui'),
	customUi
);
const customRun = cliResult(custom, 'fix');
const customSites = parseSites(customRun.out);
check(
	'every site is fixed under a custom alias',
	customSites.length === FIXTURE_SITES.length &&
		customSites.every((site) =>
			site.state === 'fixed' ? !site.written : site.state === 'stock' && site.written
		)
);
check(
	'the custom alias is patched',
	readFileSync(
		join(custom, 'src', 'lib', 'custom-ui', 'dialog', 'dialog-content.svelte'),
		'utf8'
	).includes('bg-muted')
);
check(
	'the custom alias is reported with the site path',
	siteOf(customSites, 'dialog-close').file === 'dialog/dialog-content.svelte'
);

const crlf = join(WORK, 'crlf');
scaffold(crlf);
const sheetSite = SITES[1];
const sheetPath = pathOf(crlf, sheetSite);
const sheetLf = readFileSync(sheetPath, 'utf8');
check('the sheet fixture starts with LF', !sheetLf.includes('\r\n'));
writeFileSync(sheetPath, sheetLf.replace(/\r?\n/g, '\r\n'));
const crlfRun = cliResult(crlf, 'fix', 'sheet');
const sheetAfter = readFileSync(sheetPath, 'utf8');
check('a CRLF file exits 0', crlfRun.code === 0, `exit ${crlfRun.code}`);
check('a CRLF file is fixed', sheetAfter.includes(sheetSite.fixed));
check(
	'a CRLF file stays CRLF throughout',
	sheetAfter.includes('\r\n') && !sheetAfter.replace(/\r\n/g, '').includes('\n')
);

const twice = join(WORK, 'twice');
scaffold(twice);
cli(twice);
const cssPath = join(twice, 'src', 'routes', 'layout.css');
const cssOnce = readFileSync(cssPath, 'utf8');
const twiceSnapshot = snapshot(twice);
const twiceRun = cliResult(twice);
const twiceSites = parseSites(twiceRun.out);
check('a second init exits 0', twiceRun.code === 0, `exit ${twiceRun.code}`);
check('a second init is byte-identical', readFileSync(cssPath, 'utf8') === cssOnce);
check(
	'a second init leaves every component byte-identical',
	snapshot(twice).join('\n') === twiceSnapshot.join('\n')
);
check(
	'a second init reports every site fixed',
	twiceSites.length === FIXTURE_SITES.length &&
		twiceSites.every((site) => site.state === 'fixed' && !site.written)
);

// WCAG 2.x relative luminance and sRGB transfer.
const encode = (value) => (value <= 0.0031308 ? 12.92 * value : 1.055 * value ** (1 / 2.4) - 0.055);
const decode = (value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);

const toSrgb = ([L, C, H]) => {
	const h = (H * Math.PI) / 180;
	const a = C * Math.cos(h);
	const b = C * Math.sin(h);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const linear = [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	];
	return linear.map((value) => Math.min(1, Math.max(0, encode(value))));
};

const luminance = ([r, g, b]) => 0.2126 * decode(r) + 0.7152 * decode(g) + 0.0722 * decode(b);
const contrast = (foreground, background) => {
	const a = luminance(foreground);
	const b = luminance(background);
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};
const composite = (foreground, alpha, background) =>
	foreground.map((value, i) => value * alpha + background[i] * (1 - alpha));
const mixOklch = ([L1, C1, H1], w1, [L2, C2, H2], w2) => {
	let delta = H2 - H1;
	if (delta > 180) delta -= 360;
	if (delta < -180) delta += 360;
	return [L1 * w1 + L2 * w2, C1 * w1 + C2 * w2, (((H1 + delta * w2) % 360) + 360) % 360];
};

const REFERENCE = {
	light: {
		'base-100': [1, 0, 0],
		'base-200': [0.98, 0, 0],
		'base-content': [0.21, 0.006, 285.885],
		accent: [0.77, 0.152, 181.912],
		'accent-content': [0.38, 0.063, 188.416],
		error: [0.71, 0.194, 13.428]
	},
	dark: {
		'base-100': [0.2533, 0.016, 252.42],
		'base-200': [0.2326, 0.014, 253.1],
		'base-content': [0.97807, 0.029, 256.847],
		accent: [0.77, 0.152, 181.912],
		'accent-content': [0.38, 0.063, 188.416],
		error: [0.71, 0.194, 13.428]
	}
};

const token = (name, theme) => {
	const direct = {
		foreground: () => theme['base-content'],
		background: () => theme['base-100'],
		muted: () => theme['base-200'],
		accent: () => theme.accent,
		'accent-foreground': () => theme['accent-content'],
		'destructive-text': () => mixOklch(theme.error, 0.4, theme['base-content'], 0.6)
	};
	if (direct[name]) return toSrgb(direct[name]());
	const alpha = /^destructive\/(\d+)$/.exec(name);
	if (alpha) {
		return composite(toSrgb(theme.error), Number(alpha[1]) / 100, toSrgb(theme['base-100']));
	}
	throw new Error(`unknown contrast token "${name}"`);
};

for (const pair of PAIRS) {
	const lightBackground = pair.background;
	const darkBackground = pair.backgroundDark ?? pair.background;
	const lightRatio = contrast(
		token(pair.foreground, REFERENCE.light),
		token(lightBackground, REFERENCE.light)
	);
	const darkRatio = contrast(
		token(pair.foreground, REFERENCE.dark),
		token(darkBackground, REFERENCE.dark)
	);
	check(
		`contrast ${pair.name}: ${pair.foreground} on ${lightBackground} meets ${pair.threshold}`,
		lightRatio >= pair.threshold && darkRatio >= pair.threshold,
		`light ${lightRatio.toFixed(2)}, dark ${darkRatio.toFixed(2)}`
	);
}

const failed = results.filter((result) => !result.ok);
console.log(
	`\n${failed.length === 0 ? 'all fix checks passed' : `${failed.length} fix check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
