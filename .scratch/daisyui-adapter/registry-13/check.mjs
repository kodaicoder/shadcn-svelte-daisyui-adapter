// Re-runs ticket 13's cascade claims against the committed evidence copies.
// Usage, from the repo root: node .scratch/daisyui-adapter/registry-13/check.mjs [evidence base]
// Default base: .scratch/daisyui-adapter/evidence/13-cascade-policy
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const base = resolve(process.argv[2] ?? '.scratch/daisyui-adapter/evidence/13-cascade-policy');
const varsItem = JSON.parse(
	readFileSync(resolve(import.meta.dirname, 'r/cssvars-namespaced.json'), 'utf8')
);
const TOKEN_KEYS = Object.keys(varsItem.cssVars.light).length;
const BINDINGS = TOKEN_KEYS * 2;
const COLOR_KEYS = TOKEN_KEYS - 1;
let failures = 0;

function check(label, ok, detail = '') {
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` :: ${detail}` : ''}`);
	if (!ok) failures++;
}

const text = (arm, file) => readFileSync(join(base, arm, file), 'utf8');
const report = (arm) => JSON.parse(text(arm, 'run.json'));
const render = (arm) => JSON.parse(text(arm, 'render.json'));
const props = (arm, scheme) => render(arm)[scheme].props;
const buttonBg = (arm, scheme) => render(arm)[scheme].buttonBg;

function block(css, selector) {
	const lines = css.split(/\r?\n/);
	const start = lines.findIndex((line) => line.trim() === `${selector} {`);
	if (start === -1) return '';
	const body = [];
	for (const line of lines.slice(start + 1)) {
		if (line.trim() === '}') break;
		body.push(line);
	}
	return body.join('\n');
}

function decl(body, prop) {
	const match = new RegExp(`(?:^|\\n)\\s*${prop}\\s*:\\s*([^;]+);`).exec(body);
	return match ? match[1].trim() : null;
}

function topLevelBlock(css, header) {
	const start = css.indexOf(header);
	if (start === -1) return '';
	let depth = 0;
	for (let i = start; i < css.length; i++) {
		if (css[i] === '{') depth++;
		if (css[i] === '}') {
			depth--;
			if (depth === 0) return css.slice(start, i + 1);
		}
	}
	return '';
}

const selfRefs = (css) => [...topLevelBlock(css, '@theme inline').matchAll(/^\s*(--[\w-]+):\s*var\(\1\);/gm)].length;
const occurrences = (source, pattern) => (source.match(pattern) ?? []).length;

// Arm A: plugin addBase only, no cssVars.
const raw = report('cascade-raw');
const rawCompiled = text('cascade-raw', 'compiled-global.css');
const rawBase = topLevelBlock(rawCompiled, '@layer base{');
check('A add and build pass', raw.ok && raw.build, `ok=${raw.ok} build=${raw.build}`);
check('A compiled base layer carries the colliding --primary', rawBase.includes('--primary:red') && rawBase.includes('--primary:#0f0'));
check(
	'A runtime --primary keeps the step-4 value',
	props('cascade-raw', 'light')['--primary'] === decl(block(text('cascade-raw', 'css-before.css'), ':root'), '--primary') &&
		props('cascade-raw', 'dark')['--primary'] === decl(block(text('cascade-raw', 'css-before.css'), '.dark'), '--primary'),
	JSON.stringify(props('cascade-raw', 'light')['--primary'])
);
check(
	'A plugin base output was live',
	text('cascade-raw', 'compiled-sentinel.txt').includes('--cascade-raw:base-light') &&
		text('cascade-raw', 'compiled-sentinel.txt').includes('--cascade-raw:base-dark')
);

// Arm B: cssVars, same namespace as the chosen carrier.
const vars = report('cssvars');
const varsAfter = text('cssvars', 'css-after.css');
const varsTheme = topLevelBlock(varsAfter, '@theme inline');
check('B add and build pass', vars.ok && vars.build, `ok=${vars.ok} build=${vars.build}`);
check('B cssVars leaves the tokens bound', occurrences(varsAfter, /var\(--daisy-/g) === BINDINGS);
check('B cssVars adds a self-referential @theme entry per colour key', selfRefs(varsAfter) === COLOR_KEYS, String(selfRefs(varsAfter)));
check('B the stock block has no self-reference', selfRefs(text('cssvars', 'css-before.css')) === 0);
check(
	'B cssVars changes the @theme inline block',
	varsTheme !== '' && varsTheme !== topLevelBlock(text('cssvars', 'css-before.css'), '@theme inline')
);
check(
	'B runtime --primary follows the plugin namespace',
	props('cssvars', 'light')['--primary'] === props('cssvars', 'light')['--daisy-color-primary'] &&
		props('cssvars', 'dark')['--primary'] === props('cssvars', 'dark')['--daisy-color-primary']
);

// Arm C: chosen css carrier, replacing the stock declarations.
const readd = report('re-add');
const after = text('re-add', 'css-after.css');
const before = text('re-add', 'css-before.css');
const afterTheme = topLevelBlock(after, '@theme inline');
const beforeTheme = topLevelBlock(before, '@theme inline');
const reAddCompiled = text('re-add', 'compiled-global.css');
const reAddBase = topLevelBlock(reAddCompiled, '@layer base{');
check('C add and build pass', readd.ok && readd.build, `ok=${readd.ok} build=${readd.build}`);
check('C re-add is byte-identical', after === text('re-add', 'css-after-then-1.css'));
check('C one :root and one .dark', occurrences(after, /^:root\s*\{/gm) === 1 && occurrences(after, /^\.dark\s*\{/gm) === 1);
check('C one @plugin and one shadcn import', occurrences(after, /^@plugin /gm) === 1 && occurrences(after, /shadcn-svelte\/tailwind\.css/g) === 1);
check(
	'C @theme inline is untouched',
	afterTheme !== '' && afterTheme === beforeTheme
);
check('C css map replaces --primary in place', decl(block(after, ':root'), '--primary') === 'var(--daisy-color-primary)');
check(
	'C runtime --primary follows the plugin namespace',
	props('re-add', 'light')['--primary'] === props('cssvars', 'light')['--daisy-color-primary'] &&
		props('re-add', 'dark')['--primary'] === props('cssvars', 'dark')['--daisy-color-primary']
);
check('C plugin values live in @layer base', reAddBase.includes('--daisy-color-primary:oklch'));
check('C unlayered css binds the layered value', reAddCompiled.includes('--primary:var(--daisy-color-primary)'));
check('C unlayered selector beats a Tailwind utility', buttonBg('re-add', 'light') === 'rgb(255, 0, 0)' && buttonBg('re-add', 'dark') === 'rgb(255, 0, 0)');
check('C namespace is only --daisy-color-* and --daisy-radius', !/var\(--daisy-(?!color-|radius)/.test(after));

// Arm D: a later init against the chosen carrier.
const init = report('init');
const initAfter = text('init', 'css-after-then-1.css');
check('D init exits 0 and the build passes', init.ok && init.build && init.then?.[0]?.code === 0 && init.then?.[1]?.code === 0);
check('D one @plugin, after the last import', occurrences(initAfter, /^@plugin /gm) === 1 && initAfter.indexOf('@plugin') > initAfter.lastIndexOf('@import'));
check('D one :root and one .dark', occurrences(initAfter, /^:root\s*\{/gm) === 1 && occurrences(initAfter, /^\.dark\s*\{/gm) === 1);
const initRoot = decl(block(initAfter, ':root'), '--primary');
check(
	'D init wipes the bindings',
	initRoot !== decl(block(text('init', 'css-after.css'), ':root'), '--primary') && !initRoot.includes('var(--daisy-'),
	initRoot
);
check(
	'D only the dark radius survives',
	occurrences(initAfter, /var\(--daisy-/g) === 1 && decl(block(initAfter, '.dark'), '--radius') === 'var(--daisy-radius)'
);
check('D unlayered selector survives init', initAfter.includes('[data-slot="button"]'));

const initRecovered = text('init', 'css-after-then-2.css');
check(
	'D re-add after init restores the bindings',
	decl(block(initRecovered, ':root'), '--primary') === 'var(--daisy-color-primary)' &&
		occurrences(initRecovered, /var\(--daisy-/g) === BINDINGS
);
check(
	'D recovery keeps one @plugin and one block each',
	occurrences(initRecovered, /^@plugin /gm) === 1 &&
		occurrences(initRecovered, /^:root\s*\{/gm) === 1 &&
		occurrences(initRecovered, /^\.dark\s*\{/gm) === 1
);
check(
	'D runtime follows the theme again',
	props('init', 'light')['--primary'] === props('init', 'light')['--daisy-color-primary'] &&
		props('init', 'dark')['--primary'] === props('init', 'dark')['--daisy-color-primary']
);

// Arms E/F: add-all and add-one against the chosen carrier.
for (const [label, arm] of [
	['E add -a', 'add-all'],
	['F add card', 'add-component']
]) {
	const run = report(arm);
	check(`${label} passes`, run.ok && run.build && run.then?.[0]?.code === 0);
	check(`${label} leaves the stylesheet byte-identical`, text(arm, 'css-after.css') === text(arm, 'css-after-then-1.css'));
}

console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
