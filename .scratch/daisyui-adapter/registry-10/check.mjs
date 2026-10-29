// Reads the committed evidence in evidence/10-sidebar/, so the numbers come from the harness render
// rather than from re-reading the mapping table.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const EVIDENCE = join(import.meta.dirname, '..', 'evidence', '10-sidebar');
const read = (name) => readFileSync(join(EVIDENCE, name), 'utf8');
const json = (name) => JSON.parse(read(name));

const run = json('run.json');
const render = json('render.json');
const css = read('css-after.css');

const DECIDED = {
	'--sidebar': 'var(--daisy-color-base-200)',
	'--sidebar-foreground': 'var(--daisy-color-base-content)',
	'--sidebar-primary': 'var(--daisy-color-primary)',
	'--sidebar-primary-foreground': 'var(--daisy-color-primary-content)',
	'--sidebar-accent': 'var(--daisy-color-base-300)',
	'--sidebar-accent-foreground': 'var(--daisy-color-base-content)',
	'--sidebar-border':
		'color-mix(in oklch, var(--daisy-color-base-content) 10%, var(--daisy-color-base-100))',
	'--sidebar-ring': 'var(--daisy-color-primary)'
};

const results = [];
// One rung of the built-in ladder is 2.0 to 2.1 OKLCH L points, so this floor fails a surface that
// collapses onto its neighbour instead of accepting a step too small to be the rung.
const RUNG = 0.02;
const HAIRLINE = 0.04;
const check = (group, claim, ok, measured) => {
	results.push({ group, claim, ok, measured });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${group}: ${claim} :: ${measured}`);
};

const parse = (value) => {
	const match = value.match(/^#([0-9a-f]{6})$/i) ?? value.match(/^rgba?\(([^)]+)\)$/i);
	if (!match) throw new Error(`cannot read ${value} as a resolved colour`);
	const parts =
		match[1].length === 6
			? [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16))
			: match[1].split(/[,\s/]+/).filter(Boolean).slice(0, 3).map(Number);
	return { rgb: parts.map((c) => c / 255) };
};
const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ({ rgb }) => {
	const [r, g, b] = rgb.map(linear);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};
const lightness = ({ rgb }) => {
	const [r, g, b] = rgb.map(linear);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
};
const deltaL = (a, b) => Math.abs(lightness(a) - lightness(b));
const same = (a, b) => a.rgb.every((channel, i) => Math.abs(channel - b.rgb[i]) < 1 / 255);
const fmt = (n) => n.toFixed(3);

const schemes = ['light', 'dark'];
const of = (scheme) => render[scheme];
const element = (scheme, selector) => {
	const hit = of(scheme).elements.find((entry) => entry.selector === selector);
	if (!hit?.found) throw new Error(`${selector} was not found in ${scheme}`);
	return hit;
};
const prop = (scheme, name) => of(scheme).propsRgb[name];
const pageBg = (scheme) => parse(of(scheme).backgroundRgb);
const panelBg = (scheme) => parse(element(scheme, '[data-slot=sidebar-inner]').backgroundRgb);

const [lightBlock, darkBlock] = css.split(/\n\.dark\s*\{/);
check('install', 'the run built, added and rendered', run.ok === true && run.render.status === 200, `${run.ok} / ${run.render.status}`);
check('install', 'no console errors in either scheme', run.render.consoleErrors.length === 0, run.render.consoleErrors.length);
for (const name of ['light.png', 'dark.png']) {
	check('install', `${name} was captured`, existsSync(join(EVIDENCE, name)), name);
}
const sentinel = read('compiled-sentinel.txt');
check(
	'install',
	'the plugin reached the compiled CSS with the prefixed namespace',
	sentinel.includes('daisy-color-base-200:') && sentinel.includes('daisy-color-primary:'),
	sentinel.split('\n')[0]
);

for (const [name, value] of Object.entries(DECIDED)) {
	const declaration = `${name}: ${value};`;
	const inLight = lightBlock.split(declaration).length - 1;
	const inDark = darkBlock.split(declaration).length - 1;
	check(
		'bindings',
		`${name} is written once in each block`,
		inLight === 1 && inDark === 1,
		`${inLight} / ${inDark}`
	);
}

for (const scheme of schemes) {
	for (const name of Object.keys(DECIDED)) {
		check(
			'opaque',
			`${scheme} ${name} resolves opaque`,
			/^rgb\(\d+, \d+, \d+\)$/.test(of(scheme).propsRgb[name]),
			of(scheme).propsRgb[name]
		);
	}
	check(
		'runtime',
		`${scheme} sidebar follows base-200`,
		same(parse(prop(scheme, '--sidebar')), parse(prop(scheme, '--daisy-color-base-200'))),
		`${of(scheme).props['--sidebar']} / ${of(scheme).props['--daisy-color-base-200']}`
	);
	check(
		'runtime',
		`${scheme} sidebar-accent follows base-300`,
		same(parse(prop(scheme, '--sidebar-accent')), parse(prop(scheme, '--daisy-color-base-300'))),
		`${of(scheme).props['--sidebar-accent']} / ${of(scheme).props['--daisy-color-base-300']}`
	);
	check(
		'runtime',
		`${scheme} sidebar-ring follows primary`,
		same(parse(prop(scheme, '--sidebar-ring')), parse(prop(scheme, '--daisy-color-primary'))),
		of(scheme).props['--sidebar-ring']
	);
}

for (const scheme of schemes) {
	const page = pageBg(scheme);
	const panel = panelBg(scheme);
	const accent = parse(element(scheme, '[data-slot=sidebar-menu-button][data-active=true]').backgroundRgb);
	const separator = parse(element(scheme, '[data-slot=sidebar-separator]').backgroundRgb);
	const border = parse(prop(scheme, '--sidebar-border'));

	check(
		'surface',
		`${scheme} the panel is a step off the page`,
		deltaL(page, panel) >= RUNG,
		`deltaL ${fmt(deltaL(page, panel))}`
	);
	check(
		'surface',
		`${scheme} the panel is one rung below the page`,
		deltaL(page, panel) >= RUNG && lightness(panel) < lightness(page),
		`L ${fmt(lightness(page))} -> ${fmt(lightness(panel))}`
	);
	check(
		'accent',
		`${scheme} the active row is visible on the panel`,
		deltaL(panel, accent) >= RUNG,
		`deltaL ${fmt(deltaL(panel, accent))}`
	);
	check(
		'accent',
		`${scheme} the active row is the next rung`,
		deltaL(panel, accent) >= RUNG && lightness(accent) < lightness(panel),
		`L ${fmt(lightness(panel))} -> ${fmt(lightness(accent))}`
	);
	check(
		'border',
		`${scheme} the separator is visible inside the panel`,
		deltaL(panel, separator) >= HAIRLINE,
		`deltaL ${fmt(deltaL(panel, separator))}`
	);
	check(
		'border',
		`${scheme} the border is visible against the page edge`,
		deltaL(page, border) >= HAIRLINE,
		`deltaL ${fmt(deltaL(page, border))}`
	);

	const outline = element(scheme, '#outline-row');
	check(
		'outline',
		`${scheme} the outline row fills with the page colour, not the panel`,
		same(parse(outline.backgroundRgb), page),
		`${outline.backgroundRgb} vs ${of(scheme).backgroundRgb}`
	);
	const ring = border;
	const drawsBorder = outline.boxShadowRgbs.some((colour) => same(parse(colour), ring));
	check(
		'outline',
		`${scheme} the outline row draws the sidebar border`,
		drawsBorder,
		`${outline.boxShadowRgbs.join(' | ')} vs ${border.rgb.map((c) => Math.round(c * 255)).join(' ')}`
	);
	check(
		'inset',
		`${scheme} the inset card fills with the page colour on the panel`,
		same(parse(element(scheme, '[data-slot=sidebar-inset]').backgroundRgb), page),
		element(scheme, '[data-slot=sidebar-inset]').backgroundRgb
	);
}

for (const scheme of schemes) {
	const panel = panelBg(scheme);
	const accent = parse(element(scheme, '[data-slot=sidebar-menu-button][data-active=true]').backgroundRgb);
	const primary = parse(element(scheme, '#primary-pair').backgroundRgb);
	const primaryText = parse(element(scheme, '#primary-pair').colorRgb);
	const foreground = parse(prop(scheme, '--sidebar-foreground'));
	const accentForeground = parse(prop(scheme, '--sidebar-accent-foreground'));
	const ring = parse(prop(scheme, '--sidebar-ring'));

	check(
		'text',
		`${scheme} sidebar-foreground clears 7:1 on the panel`,
		contrast(foreground, panel) >= 7,
		`${fmt(contrast(foreground, panel))}:1`
	);
	check(
		'text',
		`${scheme} accent-foreground clears 7:1 on the active row`,
		contrast(accentForeground, accent) >= 7,
		`${fmt(contrast(accentForeground, accent))}:1`
	);
	check(
		'text',
		`${scheme} the primary pair carries the author's content colour`,
		contrast(primaryText, primary) >= 3,
		`${fmt(contrast(primaryText, primary))}:1`
	);
	check(
		'ring',
		`${scheme} the focus ring clears 3:1 on the panel`,
		contrast(ring, panel) >= 3,
		`${fmt(contrast(ring, panel))}:1`
	);
}

const failed = results.filter((entry) => !entry.ok);
console.log(`\n${failed.length === 0 ? 'ALL CHECKS PASSED' : `${failed.length} FAILED`}`);
process.exitCode = failed.length === 0 ? 0 : 1;
