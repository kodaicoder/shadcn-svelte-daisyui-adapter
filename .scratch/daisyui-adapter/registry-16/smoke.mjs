// Cheap unit check of the CLI and the plugin, before any harness run. It builds the exact input the
// CLI sees on a fresh project: a stylesheet at shadcn step 4, a components.json, and the theme.
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { readTheme, bindingsFor, parseTheme } from './package/dist/index.mjs';

const REPO = 'D:/Workspace/DesignSystem/New_Project';
const HERE = import.meta.dirname;
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-16-smoke');
const THEME = join(HERE, '..', 'registry-12', 'probe-theme.css');

const results = [];
const check = (name, ok, detail) => {
	results.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
};

const scaffold = (dir, { theme = true } = {}) => {
	rmSync(dir, { recursive: true, force: true });
	mkdirSync(join(dir, 'src', 'routes'), { recursive: true });
	cpSync(join(REPO, 'src', 'routes', 'layout.css'), join(dir, 'src', 'routes', 'layout.css'));
	if (theme) cpSync(THEME, join(dir, 'src', 'daisyui-theme.css'));
	writeFileSync(
		join(dir, 'components.json'),
		JSON.stringify({ tailwind: { css: 'src/routes/layout.css' } }, null, '\t')
	);
};

const cli = (dir) =>
	execFileSync(process.execPath, [join(HERE, 'package', 'cli', 'init.mjs')], {
		cwd: dir,
		encoding: 'utf8',
		stdio: 'pipe'
	});

// 1. The parser accepts the daisyUI built-in pair and emits the prefixed namespace.
const themes = parseTheme(readFileSync(THEME, 'utf8'), THEME);
const light = bindingsFor(themes.light);
check('parser reads one light and one dark block', Boolean(themes.light && themes.dark));
check(
	'bindings carry the daisy namespace',
	Object.keys(light).every((key) => key.startsWith('--daisy-')),
	`${Object.keys(light).length} keys`
);
check('bindings carry --daisy-radius', light['--daisy-radius'] === themes.light['--radius-box']);
check('bindings carry --daisy-border', light['--daisy-border'] === themes.light['--border']);

// 2. Absent theme is a null, not a throw, so the plugin can emit nothing.
rmSync(join(WORK, 'nocwd'), { recursive: true, force: true });
mkdirSync(join(WORK, 'nocwd'), { recursive: true });
check('an absent theme reads as null', readTheme(join(WORK, 'nocwd')) === null);

// 3. A malformed pair throws with ticket 02's E2 text.
const badPath = 'src/daisyui-theme.css';
const oneBlock = readFileSync(THEME, 'utf8').split('@plugin "daisyui/theme"')[1];
let e2 = '';
try {
	parseTheme(`@plugin "daisyui/theme"{${oneBlock}`, badPath);
} catch (error) {
	e2 = error.message;
}
check('one block throws E2', e2.includes('exactly two v5 theme blocks'), e2.slice(0, 80));

// 4. A block missing a colour throws E3 and names the missing key.
const missing = readFileSync(THEME, 'utf8').replace(/\t--color-info: [^;]+;\n/, '');
let e3 = '';
try {
	parseTheme(missing, badPath);
} catch (error) {
	e3 = error.message;
}
check('a missing colour throws E3 naming it', e3.includes('is missing --color-info'), e3.slice(0, 80));

// 5. The CLI writes bindings, the ramp, the plugin line and the override file.
const full = join(WORK, 'full');
scaffold(full);
const first = cli(full);
const css1 = readFileSync(join(full, 'src', 'routes', 'layout.css'), 'utf8');
check('CLI writes the plugin line', css1.includes('@plugin "daisyui-adapter";'));
check('CLI writes the override import', css1.includes('@import "./daisyui-adapter.overrides.css";'));
check('CLI creates the override file', existsSync(join(full, 'src', 'routes', 'daisyui-adapter.overrides.css')));
check('CLI writes the header comment', css1.startsWith('/* daisyui-adapter 0.1.0'));
check(
	'CLI writes no raw --color-* name into :root or .dark',
	!/(^|\n)[ \t]*--color-[\w-]+\s*:/m.test(
		css1.slice(css1.indexOf(':root'), css1.indexOf('@theme inline'))
	) &&
		!/(^|\n)[ \t]*--color-[\w-]+\s*:/m.test(
			css1.slice(css1.indexOf('.dark'), css1.indexOf('@theme inline'))
		),
	''
);
check(
	'all five chart tokens are written in both blocks',
	[1, 2, 3, 4, 5].every(
		(n) =>
			(css1.split(`--chart-${n}:`).length - 1) === 2
	),
	`${css1.split('--chart-1:').length - 1} chart-1 declarations`
);
check(
	'each chart row is the derived helper behind the project value',
	[1, 2, 3, 4, 5].every(
		(n) =>
			new RegExp(`--chart-${n}: var\\(--daisy-derived-chart-${n}, oklch\\([^)]*\\)\\);`).test(css1) &&
			new RegExp(`--daisy-derived-chart-${n}: oklch\\(from var\\(--daisy-color-primary\\)`).test(css1)
	),
	(css1.match(/--chart-1: [^;]+/) ?? ['none'])[0]
);
check('CLI writes --default-border-width once', (css1.split('--default-border-width').length - 1) === 1);
check('the override import sits before the plugin line', css1.indexOf('daisyui-adapter.overrides.css') < css1.indexOf('@plugin "daisyui-adapter"'));
check('sidebar follows base-200', css1.includes('--sidebar: var(--daisy-color-base-200'));
check('sidebar-accent follows base-300', css1.includes('--sidebar-accent: var(--daisy-color-base-300'));

// 6. Re-run is byte-identical.
cli(full);
const css2 = readFileSync(join(full, 'src', 'routes', 'layout.css'), 'utf8');
check('a re-run is byte-identical', css1 === css2, css1 === css2 ? '' : `${css1.length} vs ${css2.length} bytes`);
console.log(first.trim().split('\n').join('\n      '));

// 7. Without a theme the CLI warns with E1, exits 0, and leaves the project's own values.
const bare = join(WORK, 'bare');
scaffold(bare, { theme: false });
// A declaration the adapter does not own, so "foreign declarations survive" can actually fail. Every
// key in the stock :root is either a binding the CLI rewrites or a chart row it deliberately keeps.
const FOREIGN = '--project-accent: oklch(0.7 0.1 20);';
const barePath = join(bare, 'src', 'routes', 'layout.css');
writeFileSync(barePath, readFileSync(barePath, 'utf8').replace('\t--radius:', `\t${FOREIGN}\n\t--radius:`));
const stock = readFileSync(barePath, 'utf8');
let warned = '';
try {
	execFileSync(process.execPath, [join(HERE, 'package', 'cli', 'init.mjs')], {
		cwd: bare,
		encoding: 'utf8',
		stdio: 'pipe'
	});
} catch (error) {
	warned = `exit ${error.status}`;
}
const bareCss = readFileSync(join(bare, 'src', 'routes', 'layout.css'), 'utf8');
check('a missing theme exits 0', warned === '', warned);
check('a missing theme writes the bindings for the build', bareCss.includes('--sidebar: var(--daisy-color-base-200'));
check(
	'a missing theme keeps the project fallback',
	bareCss.includes('var(--daisy-color-base-100, oklch(1 0 0))'),
	bareCss.match(/--background: [^;]+/)?.[0] ?? 'none'
);
check('a missing theme writes no plugin line', !bareCss.includes('@plugin "daisyui-adapter"'));

// The real failing state: the CLI ran with the theme, so every chart row has a solved ramp behind it.
// The plugin then emits nothing, so the helper's source var is undefined and the row paints only if
// its own fallback slot holds the project's value. Both blocks are asserted, because a dark-only
// regression is exactly what a first-match read would miss.
const blockOf = (css, selector) => {
	const start = css.indexOf(`\n${selector} {`);
	if (start === -1) return '';
	const open = css.indexOf('{', start);
	let depth = 0;
	for (let i = open; i < css.length; i++) {
		if (css[i] === '{') depth++;
		else if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
	}
	return '';
};
const rowOf = (css, selector, n) =>
	(blockOf(css, selector).match(new RegExp(`--chart-${n}: ([^;]+);`)) ?? [])[1]?.trim();
const SLOTS = [':root', '.dark'];
const chartSlots = (css) => SLOTS.flatMap((s) => [1, 2, 3, 4, 5].map((n) => rowOf(css, s, n)));
const wrappedSlots = (css) =>
	SLOTS.flatMap((s) =>
		[1, 2, 3, 4, 5].map((n) => `var(--daisy-derived-chart-${n}, ${rowOf(css, s, n)})`)
	);
check(
	'the theme-present rows carry the project value behind the derived helper',
	JSON.stringify(chartSlots(css1)) === JSON.stringify(wrappedSlots(stock)),
	chartSlots(css1)[0] ?? 'none'
);
check(
	'a missing theme leaves the stock chart rows',
	JSON.stringify(chartSlots(bareCss)) === JSON.stringify(chartSlots(stock)),
	chartSlots(bareCss)[0] ?? 'none'
);
check(
	'the stock file keeps a declaration the adapter does not own',
	stock.includes(FOREIGN) && bareCss.includes(FOREIGN),
	bareCss.includes(FOREIGN) ? '' : 'the CLI dropped it'
);

// The theme comes back after a no-theme run. The row it finds is the project's own, so the second
// solve must land in the same slot, not wrap a ramp around the previous one.
cpSync(THEME, join(bare, 'src', 'daisyui-theme.css'));
cli(bare);
const backCss = readFileSync(barePath, 'utf8');
check(
	'the theme returning after an absence does not nest a ramp in its own slot',
	JSON.stringify(chartSlots(backCss)) === JSON.stringify(wrappedSlots(stock)),
	chartSlots(backCss)[0] ?? 'none'
);
cli(bare);
check(
	'the theme-returned run is byte-identical on a re-run',
	backCss === readFileSync(barePath, 'utf8')
);

const failed = results.filter((r) => !r.ok);
console.log(`\n${failed.length === 0 ? 'all smoke checks passed' : `${failed.length} smoke check(s) failed`}`);
process.exitCode = failed.length === 0 ? 0 : 1;
