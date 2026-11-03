// Cheap unit check of the CLI and the plugin, before any harness run. It builds the exact input the
// CLI sees on a fresh project: a stylesheet at shadcn step 4, a components.json, and the theme.
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import {
	readTheme,
	bindingsFor,
	parseTheme
} from '../../../packages/daisyui-adapter/dist/index.mjs';

const HERE = import.meta.dirname;
const REPO = resolve(HERE, '..', '..', '..');
const PKG_DIR = resolve(REPO, 'packages', 'daisyui-adapter');
const WORK = join(process.env.TEMP ?? '/tmp', 'adapter-16-smoke');
const THEME = join(HERE, '..', 'registry-12', 'probe-theme.css');

const manifest = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const NAME = manifest.name;
const VERSION = manifest.version;

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
	// The CLI installs its own version when node_modules holds nothing, so this stub is what keeps a
	// unit check off the registry. publish-test.mjs covers the other branch against a real tarball.
	const stub = join(dir, 'node_modules', ...NAME.split('/'), 'package.json');
	mkdirSync(dirname(stub), { recursive: true });
	writeFileSync(stub, JSON.stringify({ name: NAME, version: VERSION }, null, '\t'));
};

const cli = (dir) =>
	execFileSync(process.execPath, [join(PKG_DIR, 'cli', 'init.mjs')], {
		cwd: dir,
		encoding: 'utf8',
		stdio: 'pipe'
	});

const cliResult = (dir) => {
	try {
		return { code: 0, out: cli(dir) };
	} catch (error) {
		return { code: error.status ?? 1, out: `${error.stdout ?? ''}${error.stderr ?? ''}` };
	}
};

const headerLines = (css) => [
	...css.matchAll(/^\/\* \S+ \d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)? \| re-run [^\n]*\*\/$/gm)
];

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

const declarationOf = (css, selector, prop) =>
	(blockOf(css, selector).match(new RegExp(`(?:^|\\n)\\s*${prop}: ([^;]+);`)) ?? [])[1]?.trim();

const SLOTS = [':root', '.dark'];

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
const missing = readFileSync(THEME, 'utf8').replace(/\t--color-info: [^;]+;\r?\n/, '');
let e3 = '';
try {
	parseTheme(missing, badPath);
} catch (error) {
	e3 = error.message;
}
check(
	'a missing colour throws E3 naming it',
	e3.includes('is missing --color-info'),
	e3.slice(0, 80)
);

// 5. The CLI writes bindings, their aliases, the ramp and the plugin line, and leaves overrides to
// the project.
// Written out rather than imported from map.mjs, so a wrong fallback in the map cannot pass by
// agreeing with itself.
const STATUS = {
	success: { source: 'success', value: 'oklch(69% 0.17 162.48)' },
	'success-foreground': { source: 'success-content', value: 'oklch(26% 0.051 172.552)' },
	warning: { source: 'warning', value: 'oklch(79% 0.184 86.047)' },
	'warning-foreground': { source: 'warning-content', value: 'oklch(28% 0.066 53.813)' },
	info: { source: 'info', value: 'oklch(74% 0.16 232.661)' },
	'info-foreground': { source: 'info-content', value: 'oklch(29% 0.066 243.157)' },
	'destructive-foreground': { source: 'error-content', value: 'oklch(97% 0.013 17.38)' }
};
const STATUS_KEYS = Object.keys(STATUS);

const TEXT = {
	'success-text': 'color-mix(in oklch, var(--success) 40%, var(--foreground) 60%)',
	'warning-text': 'color-mix(in oklch, var(--warning) 40%, var(--foreground) 60%)',
	'info-text': 'color-mix(in oklch, var(--info) 40%, var(--foreground) 60%)',
	'destructive-text': 'color-mix(in oklch, var(--destructive) 40%, var(--foreground) 60%)'
};
const TEXT_KEYS = Object.keys(TEXT);
const TONES = ['success', 'warning', 'info', 'destructive'];

const checkStatusBindings = (css, run) => {
	for (const key of STATUS_KEYS) {
		const { source, value } = STATUS[key];
		const expected = `var(--daisy-color-${source}, ${value})`;
		for (const selector of SLOTS) {
			const actual = declarationOf(css, selector, `--${key}`);
			check(
				`${run}: the ${selector} --${key} binding reads --daisy-color-${source} with the fixed fallback`,
				actual === expected,
				actual ?? `no --${key} in ${selector}`
			);
		}
	}
};

const checkStatusAliases = (css, run) => {
	for (const key of STATUS_KEYS) {
		const alias = declarationOf(css, '@theme inline', `--color-${key}`);
		check(
			`${run}: the @theme inline --color-${key} alias points at --${key}`,
			alias === `var(--${key})`,
			alias ?? `no --color-${key} alias`
		);
	}
};

const checkTextTones = (css, run) => {
	for (const key of TEXT_KEYS) {
		for (const selector of SLOTS) {
			const binding = declarationOf(css, selector, `--${key}`);
			const helper = declarationOf(css, selector, `--daisy-derived-${key}`);
			check(
				`${run}: the ${selector} --${key} binding falls back to the 40/60 mix`,
				binding === `var(--daisy-derived-${key}, ${TEXT[key]})`,
				binding ?? `no --${key} in ${selector}`
			);
			check(
				`${run}: the ${selector} --daisy-derived-${key} helper is the 40/60 mix`,
				helper === TEXT[key],
				helper ?? `no --daisy-derived-${key} in ${selector}`
			);
		}
	}
};

const checkTextAliases = (css, run) => {
	for (const key of TEXT_KEYS) {
		const alias = declarationOf(css, '@theme inline', `--color-${key}`);
		check(
			`${run}: the @theme inline --color-${key} alias points at --${key}`,
			alias === `var(--${key})`,
			alias ?? `no --color-${key} alias`
		);
	}
};

const checkNoBorderTokens = (css, run) => {
	for (const tone of TONES) {
		check(
			`${run}: the text tones introduce no separate --${tone}-border token`,
			!new RegExp(`--${tone}-border\\s*:`).test(css) && !css.includes(`--color-${tone}-border:`),
			(css.match(new RegExp(`--(?:color-)?${tone}-border[^;]*`)) ?? ['none'])[0]
		);
	}
};

const derivedCount = (css, selector) =>
	(blockOf(css, selector).match(/(?:^|\n)\s*--daisy-derived-[\w-]+\s*:/g) ?? []).length;

const checkDerivedCount = (css, run, expected) => {
	for (const selector of SLOTS) {
		const count = derivedCount(css, selector);
		check(
			`${run}: ${selector} carries ${expected} derived helpers`,
			count === expected,
			`${count}`
		);
	}
};

const full = join(WORK, 'full');
scaffold(full);
const first = cli(full);
const css1 = readFileSync(join(full, 'src', 'routes', 'layout.css'), 'utf8');
check(
	'CLI writes the plugin line',
	css1.includes(`@plugin "${NAME}";`),
	(css1.match(/@plugin "[^"]+";/) ?? ['none'])[0]
);
check(
	'the plugin line is a bare specifier',
	css1.includes(`@plugin "${NAME}";`) && !css1.includes('@plugin "./'),
	(css1.match(/@plugin "[^"]+";/) ?? ['none'])[0]
);
check(
	'CLI writes no override import',
	!css1.includes('@import "./daisyui-adapter.overrides.css";')
);
check(
	'CLI creates no override file',
	!existsSync(join(full, 'src', 'routes', 'daisyui-adapter.overrides.css'))
);
check(
	'exactly one header line, naming the package and its version',
	headerLines(css1).length === 1 && css1.startsWith(`/* ${NAME} ${VERSION} `),
	`${headerLines(css1).length} header line(s)`
);
check(
	'CLI counts 43 declarations per block with a theme',
	first.includes('43 light, 43 dark'),
	(first.match(/\d+ light, \d+ dark/) ?? ['none'])[0]
);
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
	[1, 2, 3, 4, 5].every((n) => css1.split(`--chart-${n}:`).length - 1 === 2),
	`${css1.split('--chart-1:').length - 1} chart-1 declarations`
);
check(
	'each chart row is the derived helper behind the project value',
	[1, 2, 3, 4, 5].every(
		(n) =>
			new RegExp(`--chart-${n}: var\\(--daisy-derived-chart-${n}, oklch\\([^)]*\\)\\);`).test(
				css1
			) &&
			new RegExp(`--daisy-derived-chart-${n}: oklch\\(from var\\(--daisy-color-primary\\)`).test(
				css1
			)
	),
	(css1.match(/--chart-1: [^;]+/) ?? ['none'])[0]
);
check(
	'CLI writes --default-border-width once',
	css1.split('--default-border-width').length - 1 === 1
);
check(
	'the stylesheet names no override file at all',
	!css1.includes('daisyui-adapter.overrides.css')
);
check('sidebar follows base-200', css1.includes('--sidebar: var(--daisy-color-base-200'));
check(
	'sidebar-accent follows base-300',
	css1.includes('--sidebar-accent: var(--daisy-color-base-300')
);
check(
	'secondary follows the daisyUI brand',
	css1.includes('--secondary: var(--daisy-color-secondary,')
);
check(
	'secondary-foreground follows secondary-content',
	css1.includes('--secondary-foreground: var(--daisy-color-secondary-content,')
);
check('accent follows the daisyUI brand', css1.includes('--accent: var(--daisy-color-accent,'));
check('accent has no derived helper', !css1.includes('--daisy-derived-accent'));
check(
	'accent-foreground follows accent-content',
	css1.includes('--accent-foreground: var(--daisy-color-accent-content,')
);
checkStatusBindings(css1, 'themed');
checkStatusAliases(css1, 'themed');
checkTextTones(css1, 'themed');
checkTextAliases(css1, 'themed');
checkNoBorderTokens(css1, 'themed');
checkDerivedCount(css1, 'themed', 13);

// 6. Re-run is byte-identical.
cli(full);
const css2 = readFileSync(join(full, 'src', 'routes', 'layout.css'), 'utf8');
check(
	'a re-run is byte-identical',
	css1 === css2,
	css1 === css2 ? '' : `${css1.length} vs ${css2.length} bytes`
);
console.log(first.trim().split('\n').join('\n      '));

// 6b. A project that installed 0.1.0 already holds the import and the file. The CLI keeps both, so
// the opt-in change never removes a working override from an existing project.
const kept = join(WORK, 'kept');
scaffold(kept);
const keptPath = join(kept, 'src', 'routes', 'layout.css');
const IMPORT = '@import "./daisyui-adapter.overrides.css";';
writeFileSync(
	keptPath,
	readFileSync(keptPath, 'utf8').replace(
		'@import "shadcn-svelte/tailwind.css";',
		`@import "shadcn-svelte/tailwind.css";\n${IMPORT}`
	)
);
const keptOverride = join(kept, 'src', 'routes', 'daisyui-adapter.overrides.css');
const keptBody = 'html:not(.dark) {\n\t--daisy-derived-chart-1: oklch(0.62 0.08 250);\n}\n';
writeFileSync(keptOverride, keptBody);
cli(kept);
const keptCss = readFileSync(keptPath, 'utf8');
check('an existing override import is kept', keptCss.includes(IMPORT));
check(
	'an existing override file is left byte-identical',
	readFileSync(keptOverride, 'utf8') === keptBody
);

// 7. Without a theme the CLI warns with E1, exits 0, and leaves the project's own values.
const bare = join(WORK, 'bare');
scaffold(bare, { theme: false });
const barePath = join(bare, 'src', 'routes', 'layout.css');
const stock = readFileSync(barePath, 'utf8');
const bareRun = cliResult(bare);
const bareCss = readFileSync(barePath, 'utf8');
check('a missing theme exits 0', bareRun.code === 0, `exit ${bareRun.code}`);
check(
	'a missing theme counts 43 declarations per block',
	bareRun.out.includes('43 light, 43 dark'),
	(bareRun.out.match(/\d+ light, \d+ dark/) ?? ['none'])[0]
);
check(
	'a missing theme writes the bindings for the build',
	bareCss.includes('--sidebar: var(--daisy-color-base-200')
);
check(
	'a missing theme keeps the project fallback',
	bareCss.includes('var(--daisy-color-base-100, oklch(1 0 0))'),
	bareCss.match(/--background: [^;]+/)?.[0] ?? 'none'
);
check('a missing theme writes no plugin line', !bareCss.includes(`@plugin "${NAME}"`));
checkStatusBindings(bareCss, 'theme-less');
checkStatusAliases(bareCss, 'theme-less');
checkTextTones(bareCss, 'theme-less');
checkTextAliases(bareCss, 'theme-less');
checkNoBorderTokens(bareCss, 'theme-less');
checkDerivedCount(bareCss, 'theme-less', 8);

// A property the project already declares in @theme inline keeps its value and is not duplicated.
const owned = join(WORK, 'owned');
scaffold(owned);
const ownedPath = join(owned, 'src', 'routes', 'layout.css');
writeFileSync(
	ownedPath,
	readFileSync(ownedPath, 'utf8').replace(
		'@theme inline {',
		'@theme inline {\n\t--color-success: oklch(0.5 0.2 150);\n\t--default-border-width: 2px;'
	)
);
cli(owned);
const ownedCss = readFileSync(ownedPath, 'utf8');
check(
	'a project entry in @theme inline is neither duplicated nor overridden',
	ownedCss.split('--color-success:').length - 1 === 1 &&
		ownedCss.includes('--color-success: oklch(0.5 0.2 150);') &&
		ownedCss.split('--default-border-width:').length - 1 === 1 &&
		ownedCss.includes('--default-border-width: 2px;'),
	ownedCss.match(/--color-success: [^;]+/)?.[0] ?? 'none'
);

// The real failing state: the CLI ran with the theme, so every chart row has a solved ramp behind it.
// The plugin then emits nothing, so the helper's source var is undefined and the row paints only if
// its own fallback slot holds the project's value. Both blocks are asserted, because a dark-only
// regression is exactly what a first-match read would miss.
const rowOf = (css, selector, n) =>
	(blockOf(css, selector).match(new RegExp(`--chart-${n}: ([^;]+);`)) ?? [])[1]?.trim();
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

// A declaration the adapter does not own, so "foreign declarations survive" can actually fail. Every
// key in the stock :root is either a binding the CLI rewrites or a chart row it deliberately keeps.
const FOREIGN = '--project-accent: oklch(0.7 0.1 20);';
const withForeign = bareCss.replace('\t--radius:', `\t${FOREIGN}\n\t--radius:`);
writeFileSync(barePath, withForeign);
cli(bare);
check(
	'the stock file keeps a declaration the adapter does not own',
	withForeign.includes(FOREIGN) && readFileSync(barePath, 'utf8').includes(FOREIGN),
	readFileSync(barePath, 'utf8').includes(FOREIGN) ? '' : 'the CLI dropped it'
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

// 8. The header is the version marker, so an older one is replaced and a newer one is refused.
const older = join(WORK, 'older');
scaffold(older);
const olderPath = join(older, 'src', 'routes', 'layout.css');
writeFileSync(
	olderPath,
	`/* ${NAME} 0.0.9 | re-run \`pnpm dlx ${NAME}@0.0.9 init\` after \`shadcn-svelte init\` */\n` +
		readFileSync(olderPath, 'utf8')
);
const olderRun = cliResult(older);
const olderCss = readFileSync(olderPath, 'utf8');
check(
	'an older header is replaced, not stacked',
	headerLines(olderCss).length === 1 && olderCss.startsWith(`/* ${NAME} ${VERSION} `),
	`${headerLines(olderCss).length} header line(s)`
);
check(
	'an older header prints the upgrade',
	olderRun.out.includes(`upgrading 0.0.9 -> ${VERSION}`),
	olderRun.out.split('\n')[0]
);

const newer = join(WORK, 'newer');
scaffold(newer);
const newerPath = join(newer, 'src', 'routes', 'layout.css');
const newerBefore =
	`/* ${NAME} 9.9.9 | re-run \`pnpm dlx ${NAME}@9.9.9 init\` after \`shadcn-svelte init\` */\n` +
	readFileSync(newerPath, 'utf8');
writeFileSync(newerPath, newerBefore);
const newerRun = cliResult(newer);
check('a newer header exits 1', newerRun.code === 1, `exit ${newerRun.code}`);
check(
	'a newer header names E4 and writes nothing',
	newerRun.out.includes('E4') && readFileSync(newerPath, 'utf8') === newerBefore,
	newerRun.out.trim().slice(0, 100)
);

// 9. A bare ramp left by an older CLI has no saved original, so the row is left as it is and the
// loss is said once instead of being papered over with a fresh ramp.
const oldRamp = join(WORK, 'old-ramp');
scaffold(oldRamp);
const oldRampPath = join(oldRamp, 'src', 'routes', 'layout.css');
const RAMP_ROW = '--chart-1: oklch(from var(--daisy-color-primary) 0.6562 min(c, 0.08) h);';
writeFileSync(
	oldRampPath,
	readFileSync(oldRampPath, 'utf8').replace(/\t--chart-1: [^;]+;/, `\t${RAMP_ROW}`)
);
const oldRampRun = spawnSync(process.execPath, [join(PKG_DIR, 'cli', 'init.mjs')], {
	cwd: oldRamp,
	encoding: 'utf8'
});
const oldRampCss = readFileSync(oldRampPath, 'utf8');
check(
	'a bare ramp row from an older CLI is left as it is',
	oldRampRun.status === 0 && oldRampCss.includes(RAMP_ROW),
	oldRampCss.match(/--chart-1: [^;]+/)?.[0] ?? 'none'
);
check(
	'a bare ramp warns once in total',
	(oldRampRun.stderr.match(/holds a ramp written by an older CLI/g) ?? []).length === 1,
	`${(oldRampRun.stderr.match(/holds a ramp written by an older CLI/g) ?? []).length} warning(s)`
);

const failed = results.filter((r) => !r.ok);
console.log(
	`\n${failed.length === 0 ? 'all smoke checks passed' : `${failed.length} smoke check(s) failed`}`
);
process.exitCode = failed.length === 0 ? 0 : 1;
