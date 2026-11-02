#!/usr/bin/env node
// The adapter CLI. It reads components.json and the stylesheet, validates the theme, then writes the
// header comment, the plugin line, the override import, the empty override file, the bindings for
// both blocks, and the five chart values. Re-running it is byte-identical.
//
// It never writes a raw `--color-*` name (ticket 14: that forms a cycle with `@theme inline`, and
// the fallback is then silently ignored), and it writes the chart ramp itself rather than leaving it
// to the plugin, because `addBase` lands in `@layer base` and the project's unlayered `:root` wins
// (ticket 13).
//
// Name, version and the bin come from package.json, so the header, the plugin specifier and the
// self-install spec cannot drift from each other. The header is replaced, not prepended: a project
// that ran an older CLI must end up with exactly one line naming its version.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

import { BINDING_KEYS, SINGLE, mixValue } from '../dist/map.mjs';
import { chartTokens, solveScheme } from '../dist/ramp.mjs';
import { parseTheme, themePath } from '../dist/index.mjs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const PKG = manifest.name;
const VERSION = manifest.version;
const BIN = Object.keys(manifest.bin)[0];
const HEADER = `/* ${PKG} ${VERSION} | re-run \`pnpm dlx ${PKG}@${VERSION} init\` after \`shadcn-svelte init\` */`;
const HEADER_PATTERN = /^\/\* (\S+) (\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?) \| re-run [^\n]*\*\/\r?\n?/;
const OVERRIDE = 'daisyui-adapter.overrides.css';
const OVERRIDE_IMPORT = `@import "./${OVERRIDE}";`;
const BORDER_ENTRY = '--default-border-width: var(--daisy-border, 1px);';
const PLUGIN = `@plugin "${PKG}";`;
const PNPM = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

const colorVar = (source) => `--daisy-color-${source}`;
const targetVar = (key) => (SINGLE[key].scalar ? '--daisy-radius' : colorVar(SINGLE[key].source));

const compareVersions = (a, b) => {
	const split = (value) => {
		const [core, pre = ''] = value.split('-');
		return { nums: core.split('.').map(Number), pre: pre ? pre.split('.') : [] };
	};
	const left = split(a);
	const right = split(b);
	for (let i = 0; i < 3; i++) {
		if (left.nums[i] !== right.nums[i]) return Math.sign(left.nums[i] - right.nums[i]);
	}
	if (left.pre.length === 0 || right.pre.length === 0) {
		return Math.sign(right.pre.length - left.pre.length);
	}
	for (let i = 0; i < Math.max(left.pre.length, right.pre.length); i++) {
		if (left.pre[i] === right.pre[i]) continue;
		if (left.pre[i] === undefined) return -1;
		if (right.pre[i] === undefined) return 1;
		const [x, y] = [Number(left.pre[i]), Number(right.pre[i])];
		if (Number.isNaN(x) || Number.isNaN(y)) return left.pre[i] < right.pre[i] ? -1 : 1;
		return Math.sign(x - y);
	}
	return 0;
};

// A value this CLI wrote on an earlier run keeps its fallback in the second var() argument. Reading
// it back out is what makes a re-run byte-identical instead of nesting var() inside var().
const unwrapFallback = (value) => {
	const match = /^var\(--[\w-]+,\s*([\s\S]*)\)$/.exec(value.trim());
	return match ? match[1].trim() : value.trim();
};

const blockBounds = (source, selector) => {
	const pattern = new RegExp(`^${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'm');
	const match = pattern.exec(source);
	if (!match) return null;
	const open = source.indexOf('{', match.index);
	let depth = 0;
	for (let i = open; i < source.length; i++) {
		if (source[i] === '{') depth++;
		else if (source[i] === '}') {
			depth--;
			if (depth === 0) return { open, close: i };
		}
	}
	return null;
};

const declarations = (body) =>
	[...body.matchAll(/^\s*(--[\w-]+)\s*:\s*([\s\S]*?);\s*$/gm)].map((m) => ({
		prop: m[1],
		value: m[2].trim()
	}));

const readBlock = (source, selector, where) => {
	const bounds = blockBounds(source, selector);
	if (!bounds) throw new Error(`[daisyui-adapter] ${where} has no ${selector} block`);
	return declarations(source.slice(bounds.open + 1, bounds.close));
};

// Foreign declarations stay where they are and in their order. Every key the map owns is rewritten
// from its fallback, so a key the plugin never emits still resolves. Derived keys are dropped and
// re-emitted rather than accumulated. Without a theme the chart rows are left as the project has
// them, because a ramp cannot be solved from a file that is not there.
//
// A chart row takes a mix key's shape: the project's own row in the fallback slot, the ramp behind a
// helper. A row that already holds a ramp is not a project value, and copying one into its own slot
// is the one thing that must never happen. That row is left alone, because the value it replaced is
// only in the project's history, and a second solve would hide that it was lost.
const isRamp = (value) => value.includes('oklch(from var(--daisy-color-primary)');

let rampWarned = false;
const warnBareRamp = (key) => {
	if (rampWarned) return;
	rampWarned = true;
	console.warn(
		`[daisyui-adapter] --${key} holds a ramp written by an older CLI with no fallback. Its original ` +
			`value is gone; restore the stylesheet from version control or set --daisyui-derived-${key} ` +
			`in ${OVERRIDE}.`
	);
};

const rebuild = (current, fallback, scheme) => {
	const lines = [];
	for (const { prop, value } of current) {
		if (prop.startsWith('--daisy-derived-')) continue;
		const key = prop.slice(2);
		if (BINDING_KEYS.includes(key) || key.startsWith('chart-')) continue;
		lines.push(`\t${prop}: ${value};`);
	}
	for (const key of BINDING_KEYS) {
		const old = unwrapFallback(current.find((d) => d.prop === `--${key}`)?.value ?? fallback[`--${key}`] ?? '');
		if (SINGLE[key]) {
			lines.push(`\t--${key}: var(${targetVar(key)}, ${old});`);
		} else {
			lines.push(`\t--${key}: var(--daisy-derived-${key}, ${old});`);
			lines.push(`\t--daisy-derived-${key}: ${mixValue(key, colorVar)};`);
		}
	}
	if (scheme) {
		for (const [i, value] of chartTokens(scheme).entries()) {
			const key = `chart-${i + 1}`;
			const old = unwrapFallback(current.find((d) => d.prop === `--${key}`)?.value ?? '');
			if (old && !isRamp(old)) {
				lines.push(`\t--${key}: var(--daisy-derived-${key}, ${old});`);
				lines.push(`\t--daisy-derived-${key}: ${value};`);
			} else if (old) {
				warnBareRamp(key);
				lines.push(`\t--${key}: ${old};`);
			} else {
				lines.push(`\t--${key}: ${value};`);
			}
		}
	} else {
		for (const { prop, value } of current) if (prop.startsWith('--chart-')) lines.push(`\t${prop}: ${value};`);
	}
	return lines.join('\n');
};

const replaceBlock = (source, selector, body) => {
	const bounds = blockBounds(source, selector);
	if (!bounds) return null;
	return `${source.slice(0, bounds.open + 1)}\n${body}\n${source.slice(bounds.close)}`;
};

const insertAfterLastImport = (source, line) => {
	if (source.includes(line)) return source;
	const lines = source.split('\n');
	const last = lines.reduce((found, text, i) => (text.startsWith('@import ') ? i : found), -1);
	if (last === -1) throw new Error('[daisyui-adapter] the stylesheet has no @import line');
	lines.splice(last + 1, 0, line);
	return lines.join('\n');
};

// The one entry the bindings cannot carry. Tailwind reads a bare border width from
// `--default-border-width`, and `--daisy-border` is emitted by the plugin from the theme's --border,
// so the 1px here is only the fallback for a project with no theme (ticket 11).
const insertThemeEntries = (source) => {
	if (source.includes('--default-border-width')) return source;
	const bounds = blockBounds(source, '@theme inline');
	if (!bounds) {
		console.warn('[daisyui-adapter] no @theme inline block, so --border will not reach border');
		return source;
	}
	return `${source.slice(0, bounds.close)}\t${BORDER_ENTRY}\n${source.slice(bounds.close)}`;
};

const installLine = (spec) => {
	const local = resolve('node_modules', ...PKG.split('/'), 'package.json');
	if (existsSync(local)) {
		try {
			if (JSON.parse(readFileSync(local, 'utf8')).version === VERSION) {
				return `already installed ${PKG} ${VERSION}`;
			}
		} catch {}
	}
	try {
		// One command string: an argument array with a shell makes Windows Node warn on every run
		// (DEP0190), and `pnpm.cmd` cannot be executed without a shell there.
		execSync(`${PNPM} add -D "${spec}"`, { stdio: 'inherit' });
	} catch {
		throw new Error(
			`[daisyui-adapter] could not install ${spec}. Run \`pnpm add -D ${spec}\` yourself, then \`pnpm exec ${BIN} init\`.`
		);
	}
	return `installed ${spec}`;
};

const main = () => {
	const componentsPath = resolve('components.json');
	if (!existsSync(componentsPath)) {
		throw new Error('[daisyui-adapter] no components.json. Run `shadcn-svelte init` first.');
	}
	const components = JSON.parse(readFileSync(componentsPath, 'utf8'));
	if (!components.tailwind?.css) {
		throw new Error('[daisyui-adapter] components.json has no tailwind.css path');
	}
	const cssPath = resolve(components.tailwind.css);
	const where = components.tailwind.css;
	let css = readFileSync(cssPath, 'utf8');

	// An older CLI cannot reproduce a newer version's bindings, so it would quietly undo them. The
	// stylesheet still names the version that wrote it, which is the only record a project keeps.
	const header = HEADER_PATTERN.exec(css);
	const headerVersion = header?.[2] ?? null;
	if (headerVersion && compareVersions(headerVersion, VERSION) > 0) {
		throw new Error(
			`[daisyui-adapter] E4 ${where} was written by ${PKG} ${headerVersion}, but this CLI is ${VERSION}. ` +
				`Run \`pnpm dlx ${PKG}@${headerVersion} init\` or upgrade the CLI.`
		);
	}
	if (headerVersion) css = css.replace(HEADER_PATTERN, '');
	if (headerVersion && compareVersions(headerVersion, VERSION) < 0) {
		console.log(`[daisyui-adapter] upgrading ${headerVersion} -> ${VERSION}`);
	}

	// E1: absence warns at init and continues, because a later paste fixes it. E2 and E3 throw,
	// because a malformed pair would render wrong colours silently.
	const path = themePath();
	let themes = null;
	if (!existsSync(path)) {
		console.warn(
			`[daisyui-adapter] E1 Cannot read the daisyUI theme file at ${path}. ` +
				`Put one light and one dark theme block from https://daisyui.com/theme-generator/ ` +
				`in that file, then re-run the build. The CLI-written fallbacks render until then.`
		);
	} else {
		themes = parseTheme(readFileSync(path, 'utf8'), path);
	}

	const stockLight = Object.fromEntries(readBlock(css, ':root', where).map((d) => [d.prop, d.value]));
	const chart = themes ? { light: solveScheme(themes.light), dark: solveScheme(themes.dark) } : null;

	css = replaceBlock(css, '.dark', rebuild(readBlock(css, '.dark', where), stockLight, chart?.dark ?? null));
	if (!css) throw new Error(`[daisyui-adapter] ${where} has no .dark block`);
	css = replaceBlock(css, ':root', rebuild(readBlock(css, ':root', where), stockLight, chart?.light ?? null));
	if (!css) throw new Error(`[daisyui-adapter] ${where} has no :root block`);

	css = insertAfterLastImport(css, OVERRIDE_IMPORT);
	if (themes) {
		css = insertAfterLastImport(css, PLUGIN);
		css = insertThemeEntries(css);
	}
	css = `${HEADER}\n${css}`;

	writeFileSync(cssPath, css);

	const overridePath = resolve(dirname(cssPath), OVERRIDE);
	const created = !existsSync(overridePath);
	if (created) writeFileSync(overridePath, '');

	// Read back what was written: a block the CLI matched but could not fill has to show a count
	// below 32 rather than a number from the data it meant to write.
	const written = readFileSync(cssPath, 'utf8');
	const count = (selector) =>
		readBlock(written, selector, where).filter((d) => !d.prop.startsWith('--daisy-derived-')).length;
	const lightCount = count(':root');
	const darkCount = count('.dark');

	const spec = process.env.DAISYUI_ADAPTER_INSTALL_SPEC ?? `${PKG}@${VERSION}`;
	const installed = installLine(spec);

	if (themes) console.log('[daisyui-adapter] theme ok: light + dark');
	console.log(`[daisyui-adapter] wrote ${where}`);
	console.log(`[daisyui-adapter] ${lightCount} light, ${darkCount} dark`);
	const overrideRel = relative(process.cwd(), overridePath).replaceAll('\\', '/');
	console.log(`[daisyui-adapter] ${created ? `created ${overrideRel}` : `left ${overrideRel} untouched`}`);
	console.log(`[daisyui-adapter] ${installed}`);

	if (chart) {
		for (const scheme of ['light', 'dark']) {
			const solved = chart[scheme];
			console.log(
				`[daisyui-adapter] ${scheme} chart L ${solved.lightness.map((l) => l.toFixed(4)).join(' ')} ` +
					`min adjacent ${solved.minAdjacent.toFixed(3)}`
			);
		}
	}
};

try {
	main();
} catch (error) {
	console.error(String(error.message ?? error));
	process.exitCode = 1;
}
