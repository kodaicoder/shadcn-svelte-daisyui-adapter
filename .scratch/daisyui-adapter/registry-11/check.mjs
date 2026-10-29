// Reads the committed evidence in evidence/11-non-colour-tokens/, so every number comes from the
// harness render rather than from re-reading the mapping table. Two runs: the main one with the
// theme's 2px border, and no-border/ with `--border` removed from the theme so the fallback carries.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const HERE = import.meta.dirname;
const EVIDENCE = join(HERE, '..', 'evidence', '11-non-colour-tokens');
const FALLBACK = join(EVIDENCE, 'no-border');
const read = (dir, name) => readFileSync(join(dir, name), 'utf8');
const json = (dir, name) => JSON.parse(read(dir, name));

const results = [];
const check = (group, claim, ok, measured) => {
	results.push({ group, claim, ok, measured });
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${group}: ${claim} :: ${measured}`);
};

const px = (value) => Number.parseFloat(value);
const close = (value, expected) => Math.abs(px(value) - expected) < 0.06;
const fmt = (n) => n.toFixed(2);
// The harness renders in a headless browser at its default root size, so rem values land as 16px.
const ROOT_PX = 16;

// The theme is the input of record: the emitted tokens have to come from these values.
const theme = Object.fromEntries(
	[...read(HERE, 'probe-theme.css').matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);\s*$/gm)].map((m) => [
		m[1],
		m[2].trim()
	])
);
const fallbackTheme = Object.fromEntries(
	[...read(HERE, 'probe-theme-no-border.css').matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);\s*$/gm)].map(
		(m) => [m[1], m[2].trim()]
	)
);

const run = json(EVIDENCE, 'run.json');
const render = json(EVIDENCE, 'render.json');
const cssBefore = read(EVIDENCE, 'css-before.css');
// The last --then is apply.mjs, so this is the stylesheet the build compiled: the item's bindings
// plus the @theme inline entry.
const cssAfter = read(EVIDENCE, 'css-after-then-2.css');
const sentinel = read(EVIDENCE, 'compiled-sentinel.txt');
// The compiled CSS is minified, so `0.75rem` arrives as `.75rem`; compare the number and the unit.
const emitted = (name) => sentinel.match(new RegExp(`${name}:([^;}\\n]*)`))?.[1]?.trim() ?? '';
const sameLength = (value, expected) =>
	Number.parseFloat(value) === Number.parseFloat(expected) &&
	value.trim().replace(/^[-.\d]+/, '') === expected.trim().replace(/^[-.\d]+/, '');
const [lightBlock, darkBlock] = cssAfter.split(/\n\.dark\s*\{/);
const themeBlock = /@theme inline\s*\{([\s\S]*?)\n\}/.exec(cssAfter)?.[1] ?? '';

const element = (render, scheme, selector) => {
	const hit = render[scheme].elements.find((entry) => entry.selector === selector);
	if (!hit?.found) throw new Error(`${selector} was not found in ${scheme}`);
	return hit;
};
const prop = (render, scheme, name) => render[scheme].props[name];

check('install', 'the run built, added and rendered', run.ok === true && render.status === 200, `${run.ok} / ${render.status}`);
check('install', 'no console errors in either scheme', render.consoleErrors.length === 0, render.consoleErrors.length);
for (const name of ['light.png', 'dark.png']) {
	check('install', `${name} was captured`, existsSync(join(EVIDENCE, name)), name);
}
check(
	'install',
	'the plugin reached the compiled CSS with the box rung and the border width',
	sameLength(emitted('daisy-radius'), theme['--radius-box']) && sameLength(emitted('daisy-border'), theme['--border']),
	`${emitted('daisy-radius')} / ${emitted('daisy-border')}`
);

check(
	'radius',
	'the emitted radius is the theme box rung, not the field or selector rung',
	sameLength(emitted('daisy-radius'), theme['--radius-box']) &&
		!sameLength(emitted('daisy-radius'), theme['--radius-field']) &&
		!sameLength(emitted('daisy-radius'), theme['--radius-selector']),
	`${emitted('daisy-radius')} vs ${theme['--radius-box']} / ${theme['--radius-field']} / ${theme['--radius-selector']}`
);

for (const [scheme, block] of [
	['light', lightBlock],
	['dark', darkBlock]
]) {
	const declared = block.split('--radius: var(--daisy-radius);').length - 1;
	check('radius', `${scheme} --radius is one binding to --daisy-radius`, declared === 1, declared);
}

const stockSteps = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'].map((step) => {
	const line = `--radius-${step}: `;
	const pick = (css) => css.split('\n').find((entry) => entry.trim().startsWith(line))?.trim();
	return { step, before: pick(cssBefore), after: pick(cssAfter) };
});
for (const step of stockSteps) {
	check(
		'radius',
		`the template --radius-${step.step} line is byte-identical`,
		step.before !== undefined && step.before === step.after,
		`${step.before} -> ${step.after}`
	);
}
check('radius', 'the @theme inline block stayed one block', cssAfter.split('@theme inline').length - 1 === 1, cssAfter.split('@theme inline').length - 1);
check(
	'border',
	'the @theme inline block carries the default width from the source token',
	themeBlock.includes('--default-border-width: var(--daisy-border, 1px);'),
	themeBlock.trim().split('\n').pop()
);

for (const scheme of ['light', 'dark']) {
	const radius = prop(render, scheme, '--radius');
	check(
		'radius',
		`${scheme} --radius resolves to the box rung`,
		radius === theme['--radius-box'],
		`${radius} vs ${theme['--radius-box']}`
	);
	check(
		'radius',
		`${scheme} --daisy-radius is the box rung`,
		prop(render, scheme, '--daisy-radius') === theme['--radius-box'],
		prop(render, scheme, '--daisy-radius')
	);

	const box = px(theme['--radius-box']) * ROOT_PX;
	const steps = [
		['sm', 0.6],
		['md', 0.8],
		['lg', 1],
		['xl', 1.4],
		['2xl', 1.8],
		['3xl', 2.2],
		['4xl', 2.6]
	];
	for (const [step, ratio] of steps) {
		const swatch = element(render, scheme, `#r-${step}`);
		check(
			'radius',
			`${scheme} rounded-${step} is ${ratio}x the box rung`,
			close(swatch.borderRadius, box * ratio),
			`${swatch.borderRadius} vs ${fmt(box * ratio)}px`
		);
	}

	const button = element(render, scheme, '#button');
	const card = element(render, scheme, '[data-slot=card]');
	const input = element(render, scheme, '#input');
	const checkbox = element(render, scheme, '#checkbox');
	check('radius', `${scheme} the button takes md, 0.8x the box rung`, close(button.borderRadius, box * 0.8), button.borderRadius);
	check('radius', `${scheme} the card takes lg, the box rung itself`, close(card.borderRadius, box), card.borderRadius);
	check('radius', `${scheme} the input takes md, 0.8x the box rung`, close(input.borderRadius, box * 0.8), input.borderRadius);
	check(
		'radius',
		`${scheme} the checkbox keeps its literal radius, so the selector rung is unused`,
		close(checkbox.borderRadius, 4),
		`${checkbox.borderRadius} vs selector ${theme['--radius-selector']}`
	);
}

for (const scheme of ['light', 'dark']) {
	const button = element(render, scheme, '#button');
	const input = element(render, scheme, '#input');
	const divided = element(render, scheme, '#div-1');
	const bordered = element(render, scheme, '#border-b');
	check('border', `${scheme} the button border follows the theme width`, button.borderWidth.top === theme['--border'], button.borderWidth.top);
	check('border', `${scheme} the input border follows the theme width`, input.borderWidth.top === theme['--border'], input.borderWidth.top);
	check('border', `${scheme} divide-y follows the theme width`, divided.borderWidth.bottom === theme['--border'], divided.borderWidth.bottom);
	check('border', `${scheme} border-b follows the theme width`, bordered.borderWidth.bottom === theme['--border'], bordered.borderWidth.bottom);

	check(
		'depth',
		`${scheme} the button gains no shadow from --depth`,
		button.boxShadow === 'none',
		button.boxShadow
	);
	check(
		'noise',
		`${scheme} the button gains no texture from --noise`,
		button.backgroundImage === 'none',
		button.backgroundImage
	);
	check(
		'depth',
		`${scheme} a shadow-md element keeps its shadow`,
		element(render, scheme, '#shadow').boxShadow !== 'none',
		element(render, scheme, '#shadow').boxShadow.slice(0, 40)
	);

	const buttonHeight = px(button.height);
	const checkboxHeight = px(element(render, scheme, '#checkbox').height);
	check(
		'size',
		`${scheme} the button height is not size-field x 10`,
		buttonHeight !== px(theme['--size-field']) * ROOT_PX * 10,
		`${button.height} vs ${fmt(px(theme['--size-field']) * ROOT_PX * 10)}px`
	);
	check(
		'size',
		`${scheme} the checkbox height is not size-selector x 6`,
		checkboxHeight !== px(theme['--size-selector']) * ROOT_PX * 6,
		`${element(render, scheme, '#checkbox').height} vs ${fmt(px(theme['--size-selector']) * ROOT_PX * 6)}px`
	);
}

for (const name of [
	'--daisy-radius-field',
	'--daisy-radius-selector',
	'--daisy-size-field',
	'--daisy-size-selector',
	'--daisy-depth',
	'--daisy-noise'
]) {
	const bare = name.replace(/^--/, '');
	check(
		'ignored',
		`${name} has no output in the stylesheet or the compiled CSS`,
		!cssAfter.includes(bare) && !sentinel.includes(bare),
		bare
	);
}

const fallbackRun = json(FALLBACK, 'run.json');
const fallbackRender = json(FALLBACK, 'render.json');
const fallbackCss = read(FALLBACK, 'css-after-then-2.css');
const fallbackSentinel = read(FALLBACK, 'compiled-sentinel.txt');

check('fallback', 'the run without --border built and rendered', fallbackRun.ok === true && fallbackRender.status === 200, `${fallbackRun.ok} / ${fallbackRender.status}`);
check(
	'fallback',
	'the theme without --border emits no --daisy-border',
	!fallbackSentinel.includes('daisy-border:'),
	fallbackSentinel.split('\n').slice(0, 2).join(' | ')
);
check(
	'fallback',
	'the fallback line is still written to @theme inline',
	/--default-border-width: var\(--daisy-border, 1px\);/.test(fallbackCss),
	fallbackTheme['--border'] === undefined ? 'theme has no --border' : fallbackTheme['--border']
);
for (const scheme of ['light', 'dark']) {
	check(
		'fallback',
		`${scheme} borders fall back to 1px`,
		element(fallbackRender, scheme, '#button').borderWidth.top === '1px' &&
			element(fallbackRender, scheme, '#input').borderWidth.top === '1px',
		`${element(fallbackRender, scheme, '#button').borderWidth.top} / ${element(fallbackRender, scheme, '#input').borderWidth.top}`
	);
	check(
		'fallback',
		`${scheme} the radius is unaffected by the missing border`,
		close(element(fallbackRender, scheme, '[data-slot=card]').borderRadius, px(theme['--radius-box']) * ROOT_PX),
		element(fallbackRender, scheme, '[data-slot=card]').borderRadius
	);
}

const failed = results.filter((entry) => !entry.ok);
console.log(`\n${failed.length === 0 ? 'ALL CHECKS PASSED' : `${failed.length} FAILED`}`);
process.exitCode = failed.length === 0 ? 0 : 1;
