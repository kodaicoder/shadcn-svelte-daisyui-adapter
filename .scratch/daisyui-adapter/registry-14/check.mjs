// Re-runs ticket 14's override and re-run claims against the committed evidence copies.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const base = resolve(process.argv[2] ?? '.scratch/daisyui-adapter/evidence/14-override-rerun');
const themeSource = readFileSync(resolve(import.meta.dirname, 'probe-theme.css'), 'utf8');
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
const sha = (source) => createHash('sha256').update(source).digest('hex');
const occurrences = (source, pattern) => (source.match(pattern) ?? []).length;

// The theme fixture's own values, so "the generated value won" is checked against the input.
const themeValue = (scheme, name) => {
	const blocks = [...themeSource.matchAll(/@plugin\s+"daisyui\/theme"\s*\{([\s\S]*?)\n\}/g)];
	const block = blocks.map((m) => m[1]).find((body) => body.includes(`color-scheme: ${scheme};`));
	return new RegExp(`--color-${name}:\\s*([^;]+);`).exec(block)[1].trim();
};
const generated = {
	primary: { light: themeValue('light', 'primary'), dark: themeValue('dark', 'primary') }
};

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

const decls = (body, prop) =>
	[...body.matchAll(new RegExp(`^\\s*${prop}\\s*:\\s*([^;]+);`, 'gm'))].map((m) => m[1].trim());

const carriers = report('carriers');
const carrierCss = text('carriers', 'css-after-then-1.css');
check('carriers: add, apply, build and render pass', carriers.ok && carriers.build && carriers.then?.[0]?.code === 0);
check(
	'carriers: one import line, last among the imports',
	occurrences(carrierCss, /@import "\.\/daisyui-adapter\.overrides\.css";/g) === 1 &&
		carrierCss.indexOf('@import "./daisyui-adapter.overrides.css";') >
			carrierCss.lastIndexOf('@import "@fontsource') &&
		carrierCss.indexOf('@import "./daisyui-adapter.overrides.css";') < carrierCss.indexOf('@plugin')
);
check(
	'carriers: imported plain :root loses to the binding',
	props('carriers', 'light')['--primary'] === generated.primary.light &&
		props('carriers', 'dark')['--primary'] === generated.primary.dark,
	`${props('carriers', 'light')['--primary']} / ${props('carriers', 'dark')['--primary']}`
);
check(
	'carriers: imported html:root / html.dark wins in both schemes',
	props('carriers', 'light')['--border'] === 'rgb(3 3 3)' &&
		props('carriers', 'dark')['--border'] === 'rgb(4 4 4)'
);
check(
	'carriers: imported :root:root / :root.dark wins in both schemes',
	props('carriers', 'light')['--input'] === 'rgb(5 5 5)' &&
		props('carriers', 'dark')['--input'] === 'rgb(6 6 6)'
);
check(
	'carriers: imported @layer overrides loses in both schemes',
	props('carriers', 'light')['--accent'].startsWith('color-mix(') &&
		props('carriers', 'dark')['--accent'].startsWith('color-mix(')
);
check(
	'carriers: an appended pair wins in both schemes',
	props('carriers', 'light')['--secondary'] === 'rgb(9 9 9)' &&
		props('carriers', 'dark')['--secondary'] === 'rgb(10 10 10)'
);
check(
	'carriers: an appended light-only :root leaks into dark',
	props('carriers', 'light')['--muted'] === 'rgb(11 11 11)' &&
		props('carriers', 'dark')['--muted'] === 'rgb(11 11 11)'
);
check(
	'carriers: an imported light-only html:root leaks into dark',
	props('carriers', 'light')['--chart-1'] === 'rgb(13 13 13)' &&
		props('carriers', 'dark')['--chart-1'] === 'rgb(13 13 13)'
);
check(
	'carriers: imported light-only html:not(.dark) wins in light and does not leak',
	props('carriers', 'light')['--ring'] === 'rgb(12 12 12)' &&
		props('carriers', 'dark')['--ring'] === generated.primary.dark
);
check(
	'carriers: the item installed 32 bindings per block',
	[...block(carrierCss, ':root').matchAll(/^\s*--[\w-]+:/gm)].length === 32 &&
		[...block(carrierCss, '.dark').matchAll(/^\s*--[\w-]+:/gm)].length === 32,
	`${[...block(carrierCss, ':root').matchAll(/^\s*--[\w-]+:/gm)].length} / ${[...block(carrierCss, '.dark').matchAll(/^\s*--[\w-]+:/gm)].length}`
);

const readd = report('re-add');
const readdBefore = text('re-add', 'css-after-then-1.css');
const readdAfter = text('re-add', 'css-after-then-2.css');
const changed = readdBefore
	.split(/\r?\n/)
	.filter((line, i) => line !== readdAfter.split(/\r?\n/)[i]);
check(
	're-add: apply and re-add exit 0, build and render pass',
	readd.ok && readd.build && readd.then?.[0]?.code === 0 && readd.then?.[1]?.code === 0
);
check('re-add: the import line survives, exactly once', occurrences(readdAfter, /daisyui-adapter\.overrides\.css/g) === 1);
check(
	're-add: a hand-edited declaration is reverted in both blocks',
	decl(block(readdAfter, ':root'), '--ring') === 'var(--daisy-color-primary)' &&
		decl(block(readdAfter, '.dark'), '--ring') === 'var(--daisy-color-primary)'
);
check(
	're-add: the only lines the re-add changed are the hand edit',
	changed.length === 2 && changed.every((line) => line.includes('--ring')),
	JSON.stringify(changed)
);
check(
	're-add: the override still wins after the re-add',
	props('re-add', 'light')['--primary'] === 'rgb(3 3 3)' &&
		props('re-add', 'dark')['--primary'] === 'rgb(4 4 4)' &&
		buttonBg('re-add', 'light') === 'rgb(3, 3, 3)'
);
check(
	're-add: the override file is byte-identical to what was written',
	text('re-add', 'then-1.log').includes(`sha256=${sha(text('re-add', 'overrides.css'))}`)
);

const init = report('init');
const initAfter = text('init', 'css-after-then-2.css');
check('init: init exits 0, build and render pass', init.ok && init.build && init.then?.[1]?.code === 0);
check('init: the import line survives', occurrences(initAfter, /daisyui-adapter\.overrides\.css/g) === 1);
check(
	'init: the override file is untouched',
	text('init', 'then-1.log').includes(`sha256=${sha(text('init', 'overrides.css'))}`)
);
check(
	'init: the bindings are wiped, one dark radius left',
	occurrences(initAfter, /var\(--daisy-/g) === 1 && decl(block(initAfter, '.dark'), '--radius') === 'var(--daisy-radius)'
);
check(
	'init: the preset values now hold for the tokens no override covers',
	render('init').light.background === 'oklch(1 0 0)' && render('init').dark.background === 'oklch(0.145 0 0)',
	`${render('init').light.background} / ${render('init').dark.background}`
);
check(
	'init: the override still wins over the preset literals',
	props('init', 'light')['--primary'] === 'rgb(3 3 3)' && props('init', 'dark')['--primary'] === 'rgb(4 4 4)'
);
check(
	'init: the plugin still loads and reads the theme',
	props('init', 'light')['--daisy-color-primary'] === generated.primary.light &&
		props('init', 'dark')['--daisy-color-primary'] === generated.primary.dark
);

const fenced = report('fenced');
const fencedAfter = text('fenced', 'css-after-then-2.css');
check('fenced: both commands exit 0, build and render pass', fenced.ok && fenced.build && fenced.then?.[1]?.code === 0);
check(
	'fenced: the re-add replaces the first declaration and leaves the duplicate',
	decls(block(fencedAfter, ':root'), '--primary').length === 2 &&
		decls(block(fencedAfter, ':root'), '--primary')[0] === 'var(--daisy-color-primary)' &&
		decls(block(fencedAfter, ':root'), '--primary')[1] === 'rgb(77 77 77)'
);
check(
	'fenced: the duplicate wins in light only',
	props('fenced', 'light')['--primary'] === 'rgb(77 77 77)' &&
		props('fenced', 'dark')['--primary'] === generated.primary.dark
);
check('fenced: a key the map does not own survives', props('fenced', 'light')['--info'] === 'rgb(88 88 88)');

const drift = report('theme-drift');
const driftCss = text('theme-drift', 'css-after.css');
check('drift: add, edit and build pass', drift.ok && drift.build && drift.then?.[0]?.code === 0);
check(
	'drift: the stylesheet still carries the reference, not the value',
	decl(block(driftCss, ':root'), '--primary') === 'var(--daisy-color-primary)' &&
		!driftCss.includes('rgb(12 34 56)')
);
check(
	'drift: the theme file no longer matches the fixture',
	text('theme-drift', 'theme-after.css') !== themeSource &&
		text('theme-drift', 'theme-after.css').includes('--color-primary: rgb(12 34 56);')
);
check(
	'drift: the build follows the edited theme with no add in between',
	props('theme-drift', 'light')['--primary'] === 'rgb(12 34 56)' &&
		props('theme-drift', 'dark')['--primary'] === 'rgb(65 43 21)'
);

const missing = report('missing-name');
check('missing-name: add, edit and build pass', missing.ok && missing.build && missing.then?.[0]?.code === 0);
check(
	'missing-name: the light binding points at a name nothing emits',
	decl(block(text('missing-name', 'css-after-then-1.css'), ':root'), '--primary') === 'var(--daisy-color-no-such-name)'
);
check(
	'missing-name: the token computes to nothing and the component loses its fill',
	props('missing-name', 'light')['--primary'] === '' && buttonBg('missing-name', 'light') === 'rgba(0, 0, 0, 0)'
);
check(
	'missing-name: the other scheme is unaffected',
	props('missing-name', 'dark')['--primary'] === generated.primary.dark
);

const emptyFile = report('empty-file');
check(
	'empty-file: the import line resolves against an empty file and the build passes',
	emptyFile.ok && emptyFile.build && emptyFile.then?.[0]?.code === 0 &&
		text('empty-file', 'overrides.css') === ''
);
check(
	'empty-file: nothing changes while the file is empty',
	props('empty-file', 'light')['--primary'] === generated.primary.light &&
		props('empty-file', 'dark')['--border'].startsWith('color-mix(')
);

const importOnly = report('import-only');
check(
	'import-only: the line without the file fails the build',
	importOnly.ok === false && importOnly.build === false,
	`ok=${importOnly.ok} build=${importOnly.build}`
);
check(
	'import-only: the failure names the missing file and the stylesheet',
	text('import-only', 'build.log').includes("Can't resolve './daisyui-adapter.overrides.css'") &&
		text('import-only', 'build.log').includes('@tailwindcss/vite:generate:build')
);

const themeRule = report('theme-rule');
check('theme-rule: add, theme edit and build pass', themeRule.ok && themeRule.build && themeRule.then?.[0]?.code === 0);
check(
	'theme-rule: the theme file carries both shapes',
	text('theme-rule', 'theme-after.css').includes('--daisy-color-primary: rgb(22 22 22);') &&
		text('theme-rule', 'theme-after.css').includes('html:not(.dark) { --primary: rgb(21 21 21); }')
);
check(
	'theme-rule: an extra --daisy-color-* key inside the block is dropped',
	props('theme-rule', 'light')['--daisy-color-primary'] === generated.primary.light
);
check(
	'theme-rule: a selector rule in the theme file has no effect',
	props('theme-rule', 'light')['--primary'] === generated.primary.light
);

const rawCollision = report('raw-collision');
check(
	'raw-collision: add, escape hatch, build and render pass',
	rawCollision.ok && rawCollision.build && rawCollision.then?.[0]?.code === 0
);
check(
	'raw-collision: the raw name takes the plugin value while the token takes the override',
	props('raw-collision', 'light')['--color-primary'] === 'rgb(200 0 0)' &&
		props('raw-collision', 'light')['--primary'] === 'rgb(3 3 3)'
);
check(
	'raw-collision: the utility follows the token, not the raw name',
	buttonBg('raw-collision', 'light') === 'rgb(3, 3, 3)'
);
check(
	'raw-collision: a fallback hides a missing source name',
	props('raw-collision', 'light')['--ring'] === 'rgb(33 33 33)'
);
check(
	'raw-collision: a raw daisyUI name lands in the --color-* namespace',
	props('raw-collision', 'light')['--color-base-100'] === 'rgb(210 210 210)'
);

// The counterpart: the settled map, same escape hatch, same token.
const prefixedWin = report('prefixed-win');
check(
	'prefixed-win: the token takes the override and the utility follows it',
	prefixedWin.ok && props('prefixed-win', 'light')['--primary'] === 'rgb(3 3 3)' &&
		buttonBg('prefixed-win', 'light') === 'rgb(3, 3, 3)'
);
check(
	'prefixed-win: Tailwind emits no --color-* alias in a button-only build',
	props('prefixed-win', 'light')['--color-primary'] === '',
	JSON.stringify(props('prefixed-win', 'light')['--color-primary'])
);

const rawMap = report('raw-map');
check('raw-map: add, raw map, escape hatch and build pass', rawMap.ok && rawMap.build && rawMap.then?.[0]?.code === 0);
check(
	'raw-map: a raw binding resolves and the hook moves to --color-*',
	props('raw-map', 'light')['--primary'] === 'rgb(3 3 3)' &&
		props('raw-map', 'light')['--color-primary'] === 'rgb(3 3 3)' &&
		buttonBg('raw-map', 'light') === 'rgb(3, 3, 3)'
);
check(
	'raw-map: the dark scheme is untouched because the hook was scoped to light',
	props('raw-map', 'dark')['--primary'] === generated.primary.dark
);

// and two self-referential fallbacks that ask whether a binding can keep the value already in
// the file.
const winProbe = report('win-probe');
check(
	'win-probe: sonner plus the escape hatch build and render',
	winProbe.ok && winProbe.build && winProbe.then?.[0]?.code === 0 && winProbe.then?.[1]?.code === 0
);
check(
	'win-probe: an emitted --color-* alias follows the token',
	props('win-probe', 'light')['--color-border'] === 'rgb(3 3 3)' &&
		props('win-probe', 'dark')['--color-border'] === 'rgb(4 4 4)'
);
check(
	'win-probe: --color-primary is still not emitted, even with sonner',
	props('win-probe', 'light')['--color-primary'] === '',
	JSON.stringify(props('win-probe', 'light')['--color-primary'])
);
check(
	'win-probe: a self-reference in the fallback slot resolves when the first name exists',
	props('win-probe', 'light')['--probe-self'] === generated.primary.light
);
check(
	'win-probe: a self-reference cannot recover a value the property never had',
	props('win-probe', 'light')['--probe-self-missing'] === '',
	JSON.stringify(props('win-probe', 'light')['--probe-self-missing'])
);

const cliInit = report('cli-init');
const cliFinal = text('cli-init', 'app.css-final');
check(
	'cli-init: a no-op add writes nothing and the CLI build passes',
	cliInit.ok && cliInit.build && cliInit.cssChanged === false && cliInit.then?.[0]?.code === 0
);
check(
	'cli-init: the CLI wrote the value the file already had as the fallback',
	cliFinal.includes('--primary: var(--color-primary, oklch(0.508 0.118 165.612));') &&
		cliFinal.includes('--primary-foreground: var(--color-primary-content, oklch(0.979 0.021 166.113));')
);
check(
	'cli-init: 32 bindings per block plus one derived helper each',
	[...block(cliFinal, ':root').matchAll(/^\s*--[\w-]+:/gm)].length === 32 + 5 &&
		[...block(cliFinal, '.dark').matchAll(/^\s*--[\w-]+:/gm)].length === 32 + 5
);
check(
	'cli-init: the plugin package is a devDependency',
	JSON.parse(text('cli-init', 'package-json-after.json')).devDependencies[
		'daisyui-adapter-14-raw-real'
	] !== undefined
);
check(
	'cli-init: the runtime follows the theme, not the fallback',
	props('cli-init', 'light')['--primary'] === generated.primary.light &&
		props('cli-init', 'dark')['--primary'] === generated.primary.dark
);
check('cli-init: radius comes from the theme, not the fallback', props('cli-init', 'light')['--radius'] === '0.5rem');

const cliRerun = report('cli-rerun');
check('cli-rerun: both runs exit 0 and the build passes', cliRerun.ok && cliRerun.build);
check(
	'cli-rerun: a second run is byte-identical, no nested fallback',
	text('cli-rerun', 'css-after-then-1.css') === text('cli-rerun', 'css-after-then-2.css')
);

const rawMissing = report('cli-missing-theme');
const rawCompiledFiles = readdirSync(join(base, 'cli-missing-theme')).filter(
	(file) => file.endsWith('.css') && file.startsWith('0.')
);
check('cli-missing-theme: exactly one compiled stylesheet was kept', rawCompiledFiles.length === 1);
const rawCompiled =
	rawCompiledFiles.length === 1 ? text('cli-missing-theme', rawCompiledFiles[0]) : '';
check(
	'cli-missing-theme: the build passes with no theme',
	rawMissing.ok && rawMissing.build && text('cli-missing-theme', 'compiled-sentinel.txt').trim() === ''
);
check(
	'cli-missing-theme: @theme inline still emits the alias as var(--primary)',
	rawCompiled.includes('--color-primary:var(--primary)')
);
check(
	'cli-missing-theme: the binding and the alias form a cycle, so the fallback is ignored',
	props('cli-missing-theme', 'light')['--primary'] === '' &&
		buttonBg('cli-missing-theme', 'light') === 'rgba(0, 0, 0, 0)'
);
check(
	'cli-missing-theme: a derived token still falls back',
	props('cli-missing-theme', 'light')['--border'] === 'oklch(0.93 0.007 106.5)'
);

const preMissing = report('cli-missing-theme-daisy');
check(
	'cli-missing-theme-daisy: the build passes with no theme',
	preMissing.ok && preMissing.build && text('cli-missing-theme-daisy', 'compiled-sentinel.txt').trim() === ''
);
check(
	'cli-missing-theme-daisy: every token falls back to the value the project had',
	props('cli-missing-theme-daisy', 'light')['--primary'] === 'oklch(0.508 0.118 165.612)' &&
		props('cli-missing-theme-daisy', 'dark')['--primary'] === 'oklch(0.432 0.095 166.913)' &&
		props('cli-missing-theme-daisy', 'light')['--border'] === 'oklch(0.93 0.007 106.5)' &&
		props('cli-missing-theme-daisy', 'dark')['--border'] === 'oklch(1 0 0 / 10%)' &&
		props('cli-missing-theme-daisy', 'light')['--radius'] === '0.625rem'
);
check(
	'cli-missing-theme-daisy: the page renders in the pre-adapter palette',
	buttonBg('cli-missing-theme-daisy', 'light') === 'oklch(0.508 0.118 165.612)'
);

const cliAfterInit = report('cli-after-init');
const initStep = text('cli-after-init', 'css-after-then-1.css');
const rebound = text('cli-after-init', 'css-after-then-2.css');
check(
	'cli-after-init: init then the CLI both exit 0 and the build passes',
	cliAfterInit.ok && cliAfterInit.build && cliAfterInit.then?.[0]?.code === 0 && cliAfterInit.then?.[1]?.code === 0
);
check(
	'cli-after-init: init left plain preset literals',
	decl(block(initStep, ':root'), '--primary') === 'oklch(0.205 0 0)' &&
		decl(block(initStep, '.dark'), '--primary') === 'oklch(0.922 0 0)'
);
check(
	'cli-after-init: the CLI re-bound with the post-init values as fallbacks',
	decl(block(rebound, ':root'), '--primary') === 'var(--daisy-color-primary, oklch(0.205 0 0))' &&
		decl(block(rebound, '.dark'), '--primary') === 'var(--daisy-color-primary, oklch(0.922 0 0))'
);
check(
	'cli-after-init: 32 bindings per block are back',
	[...block(rebound, ':root').matchAll(/^\s*--[\w-]+:/gm)].length === 32 + 5 &&
		[...block(rebound, '.dark').matchAll(/^\s*--[\w-]+:/gm)].length === 32 + 5
);
check(
	'cli-after-init: the runtime follows the theme again',
	props('cli-after-init', 'light')['--primary'] === generated.primary.light &&
		props('cli-after-init', 'dark')['--primary'] === generated.primary.dark
);

const lifecycle = report('cli-lifecycle');
const snap = (n) => text('cli-lifecycle', `css-after-then-${n}.css`);
check(
	'cli-lifecycle: all four commands exit 0 and the build passes',
	lifecycle.ok &&
		lifecycle.build &&
		[0, 1, 2, 3].every((i) => lifecycle.then?.[i]?.code === 0)
);
check(
	'cli-lifecycle: the header comment and the override import survive init and add',
	[1, 2, 3, 4].every(
		(n) =>
			snap(n).startsWith('/* daisyui-adapter 0.1.0') &&
			snap(n).includes('@import "./daisyui-adapter.overrides.css";')
	)
);
check('cli-lifecycle: a second CLI run is byte-identical', snap(1) === snap(2));
check(
	'cli-lifecycle: the run created the override file empty and never wrote it again',
	text('cli-lifecycle', 'overrides.css') === ''
);
check(
	'cli-lifecycle: shadcn init wipes the bindings and keeps the comment',
	!snap(3).includes('--primary: var(--daisy-color-primary') && snap(3).startsWith('/* daisyui-adapter')
);
check('cli-lifecycle: add button leaves the stylesheet byte-identical', snap(3) === snap(4));
check(
	'cli-lifecycle: the render after init shows the preset values, so a re-run is required',
	props('cli-lifecycle', 'light')['--primary'] === 'oklch(0.205 0 0)' &&
		props('cli-lifecycle', 'light')['--daisy-color-primary'] === generated.primary.light
);

const cliAddAll = report('cli-add-all');
check(
	'cli-add-all: the CLI then add -a exit 0 and the build passes',
	cliAddAll.ok && cliAddAll.build && cliAddAll.then?.[0]?.code === 0 && cliAddAll.then?.[1]?.code === 0
);
check(
	'cli-add-all: add -a leaves the stylesheet byte-identical',
	text('cli-add-all', 'css-after-then-1.css') === text('cli-add-all', 'css-after-then-2.css')
);

console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
