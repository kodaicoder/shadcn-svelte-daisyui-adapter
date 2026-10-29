// Probe CLI for the pure-CLI variant of ticket 14. It stands in for `pnpm dlx <pkg> init`: it
// reads components.json, the stylesheet and the theme, then writes the @plugin line and every
// binding. The theme read is a precondition only; the values come from the plugin at build time,
// and each binding's fallback is the value the project had before the adapter ran, so a missing
// source still renders the project's own palette.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const NS = process.argv[2] === 'daisy' ? 'daisy' : 'raw';
const PLUGIN =
	NS === 'daisy' ? '@plugin "daisyui-adapter-14-pre-real";' : '@plugin "daisyui-adapter-14-raw-real";';
const HEADER = '/* daisyui-adapter 0.1.0 | re-run `shadcn-svelte-daisyui-adapter init` after `shadcn-svelte init` */';
const OVERRIDE = 'daisyui-adapter.overrides.css';
const OVERRIDE_IMPORT = `@import "./${OVERRIDE}";`;
const color = (source) => (NS === 'daisy' ? `--daisy-color-${source}` : `--color-${source}`);
const RADIUS = NS === 'daisy' ? '--daisy-radius' : '--radius-box';


const SINGLE = {
	background: 'base-100',
	foreground: 'base-content',
	card: 'base-100',
	'card-foreground': 'base-content',
	popover: 'base-100',
	'popover-foreground': 'base-content',
	primary: 'primary',
	'primary-foreground': 'primary-content',
	secondary: 'base-200',
	'secondary-foreground': 'base-content',
	muted: 'base-200',
	'accent-foreground': 'base-content',
	destructive: 'error',
	ring: 'primary',
	'chart-1': 'primary',
	'chart-2': 'accent',
	'chart-3': 'secondary',
	'chart-4': 'info',
	'chart-5': 'success',
	sidebar: 'base-100',
	'sidebar-foreground': 'base-content',
	'sidebar-primary': 'primary',
	'sidebar-primary-foreground': 'primary-content',
	'sidebar-accent': 'base-200',
	'sidebar-accent-foreground': 'base-content',
	'sidebar-ring': 'primary',
	radius: 'radius-box'
};

const MIX = {
	'muted-foreground': 'color-mix(in oklch, var(@base-content@) 62%, var(@base-100@))',
	accent: 'color-mix(in oklch, var(@base-200@) 85%, var(@base-300@))',
	border: 'color-mix(in oklch, var(@base-content@) 10%, var(@base-100@))',
	input: 'color-mix(in oklch, var(@base-content@) 15%, var(@base-100@))',
	'sidebar-border': 'color-mix(in oklch, var(@base-content@) 10%, var(@base-100@))'
};

const mixValue = (key) =>
	MIX[key].replace(/@([a-z0-9-]+)@/g, (_, source) => `var(${color(source)})`);

const components = JSON.parse(readFileSync('components.json', 'utf8'));
const cssPath = resolve(components.tailwind.css);
let css = readFileSync(cssPath, 'utf8');

const themePath = resolve('src/daisyui-theme.css');
if (!existsSync(themePath)) {
	console.log(`[cli-14] no theme at ${themePath}; bindings will carry only fallbacks`);
} else {
	const blocks = [...readFileSync(themePath, 'utf8').matchAll(/@plugin\s+["']daisyui\/theme["']\s*\{([\s\S]*?)\}/g)];
	const schemes = blocks
		.map((block) => /color-scheme\s*:\s*["']?(light|dark)["']?\s*;/.exec(block[1])?.[1])
		.filter(Boolean);
	if (schemes.length !== 2 || schemes[0] === schemes[1]) {
		throw new Error('[cli-14] theme needs one light and one dark block');
	}
	console.log(`[cli-14] theme ok: ${schemes.join(' + ')}`);
}

const blockBounds = (source, selector) => {
	const match = new RegExp(`^${selector.replace('.', '\\.')}\\s*\\{`, 'm').exec(source);
	if (!match) return null;
	const open = source.indexOf('{', match.index);
	const close = source.indexOf('\n}', open);
	if (close === -1) throw new Error(`[cli-14] unterminated ${selector} block`);
	return { open, close };
};

const declarations = (body) =>
	[...body.matchAll(/^\s*(--[\w-]+)\s*:\s*([\s\S]*?);\s*$/gm)].map((m) => ({
		prop: m[1],
		value: m[2].trim()
	}));

const readBlock = (source, selector) => {
	const bounds = blockBounds(source, selector);
	if (!bounds) throw new Error(`[cli-14] no ${selector} block in ${components.tailwind.css}`);
	return declarations(source.slice(bounds.open + 1, bounds.close));
};

// A value the CLI wrote on an earlier run keeps its fallback in the second var() argument.
const strip = (value) => {
	const match = /^var\(--[\w-]+,\s*([\s\S]*)\)$/.exec(value);
	return match ? match[1].trim() : value;
};

const light = Object.fromEntries(readBlock(css, ':root').map((d) => [d.prop, d.value]));
const rebuild = (current, fallback) => {
	const lines = [];
	const written = new Set();
	for (const { prop, value } of current) {
		if (prop.startsWith('--daisy-derived-')) continue;
		const key = prop.slice(2);
		if (!(key in SINGLE) && !(key in MIX)) {
			lines.push(`\t${prop}: ${value};`);
			continue;
		}
		const old = strip(value);
		if (key in SINGLE) {
			const target = key === 'radius' ? RADIUS : color(SINGLE[key]);
			lines.push(`\t--${key}: var(${target}, ${old});`);
		} else {
			lines.push(`\t--${key}: var(--daisy-derived-${key}, ${old});`);
			lines.push(`\t--daisy-derived-${key}: ${mixValue(key)};`);
		}
		written.add(key);
	}
	for (const [key, source] of Object.entries(SINGLE)) {
		if (written.has(key) || fallback[`--${key}`] === undefined) continue;
		const target = key === 'radius' ? RADIUS : color(source);
		lines.push(`\t--${key}: var(${target}, ${strip(fallback[`--${key}`])});`);
		written.add(key);
	}
	return lines.join('\n');
};

const replaceBlock = (source, selector, body) => {
	const bounds = blockBounds(source, selector);
	return `${source.slice(0, bounds.open + 1)}\n${body}\n${source.slice(bounds.close)}`;
};

const dark = Object.fromEntries(readBlock(css, '.dark').map((d) => [d.prop, d.value]));
css = replaceBlock(css, '.dark', rebuild(readBlock(css, '.dark'), light));
css = replaceBlock(css, ':root', rebuild(readBlock(css, ':root'), light));

if (!css.includes(PLUGIN)) {
	const lines = css.split('\n');
	const last = lines.reduce((found, line, i) => (line.startsWith('@import ') ? i : found), -1);
	if (last === -1) throw new Error('[cli-14] no @import line in the stylesheet');
	lines.splice(last + 1, 0, PLUGIN);
	css = lines.join('\n');
}

// The escape hatch: an empty file the user owns, plus the one import line, created once.
const overridePath = resolve(dirname(cssPath), OVERRIDE);
if (!existsSync(overridePath)) {
	writeFileSync(overridePath, '');
	console.log(`[cli-14] created ${overridePath}`);
}
if (!css.includes(OVERRIDE_IMPORT)) {
	const lines = css.split('\n');
	const last = lines.reduce((found, line, i) => (line.startsWith('@import ') ? i : found), -1);
	lines.splice(last + 1, 0, OVERRIDE_IMPORT);
	css = lines.join('\n');
}

if (!css.startsWith(HEADER)) {
	css = `${HEADER}\n${css}`;
}

writeFileSync(cssPath, css);

const tarballPrefix = NS === 'daisy' ? 'daisyui-adapter-14-pre-real-' : 'daisyui-adapter-14-raw-real-';
const tarball = readdirSync('.').find(
	(file) => file.startsWith(tarballPrefix) && file.endsWith('.tgz')
);
if (!tarball) throw new Error(`[cli-14] no ${tarballPrefix}*.tgz in ${process.cwd()}`);
execFileSync('pnpm', ['add', '-D', `./${tarball}`], {
	stdio: 'inherit',
	shell: process.platform === 'win32'
});
console.log(`[cli-14] installed ${tarball}`);

const rootCount = readBlock(css, ':root').filter((d) => !d.prop.startsWith('--daisy-derived-')).length;
const darkCount = readBlock(css, '.dark').filter((d) => !d.prop.startsWith('--daisy-derived-')).length;
console.log(`[cli-14] wrote ${components.tailwind.css}: ${rootCount} light, ${darkCount} dark, plugin line ${css.includes(PLUGIN)}`);
