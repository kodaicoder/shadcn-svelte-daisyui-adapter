#!/usr/bin/env node
// The adapter CLI. It reads components.json and the stylesheet, validates the theme, then writes the
// header comment, the plugin line, the bindings for both blocks, the `@theme inline` aliases and the
// five chart values. Re-running it is byte-identical. The override file and its import are the
// project's to add; this CLI never creates, deletes or rewrites either one.
//
// It never writes a `--color-*` value into `:root` or `.dark` (ticket 14: that forms a cycle with
// `@theme inline`, and the fallback is then silently ignored); the `@theme inline` aliases are the
// only `--color-*` names it writes. It writes the chart ramp itself rather than leaving it to the
// plugin, because `addBase` lands in `@layer base` and the project's unlayered `:root` wins
// (ticket 13).
//
// Name, version and the bin come from package.json, so the header, the plugin specifier and the
// self-install spec cannot drift from each other. The header is replaced, not prepended: a project
// that ran an older CLI must end up with exactly one line naming its version.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
	BINDING_KEYS,
	SINGLE,
	TOKEN_FALLBACKS,
	isMix,
	mixValue,
	textToneValue
} from '../dist/map.mjs';
import { chartTokens, solveScheme } from '../dist/ramp.mjs';
import {
	BORDER_THRESHOLD,
	TEXT_THRESHOLD,
	WARNING_KIND,
	contrastKnownLimits,
	contrastMatrix,
	contrastWarnings
} from '../dist/contrast.mjs';
import { parseTheme, themePath } from '../dist/index.mjs';
import { fix, scan } from '../component-fix.mjs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const PKG = manifest.name;
const VERSION = manifest.version;
const BIN = Object.keys(manifest.bin)[0];
const headerFor = (n) =>
	`/* ${PKG} ${VERSION} | components ${n} fixed | re-run \`pnpm dlx ${PKG}@${VERSION} init\` after \`shadcn-svelte init\` */`;
const HEADER_PATTERN =
	/^\/\* (\S+) (\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?) \| (?:components \d+ fixed \| )?re-run [^\n]*\*\/\r?\n?/;
const headerVersionOf = (css) => HEADER_PATTERN.exec(css)?.[2] ?? null;

// An older CLI cannot reproduce a newer version's bindings or marker, so both `init` and a
// write-mode `fix` refuse to touch a stylesheet a newer CLI wrote. The stylesheet still names the
// version that wrote it, which is the only record a project keeps.
const refuseNewerHeader = (css, where) => {
	const version = headerVersionOf(css);
	if (!version || compareVersions(version, VERSION) <= 0) return;
	throw new Error(
		`[daisyui-adapter] E4 ${where} was written by ${PKG} ${version}, but this CLI is ${VERSION}. ` +
			`Run \`pnpm dlx ${PKG}@${version} init\` or upgrade the CLI.`
	);
};
const OVERRIDE = 'daisyui-adapter.overrides.css';
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

// Above 2rem the form controls are pill-like, which is nearly always a theme-generator mistake
// rather than a choice. Only px and rem can be compared; a calc() or an unknown unit is skipped,
// because a wrong warning is worse than none.
const toPx = (value) => {
	const text = String(value).trim();
	const match = /^(-?(?:\d+\.?\d*|\.\d+))(px|rem)$/.exec(text);
	if (match) return match[2] === 'px' ? Number(match[1]) : Number(match[1]) * 16;
	return text === '0' ? 0 : null;
};

const warnRadius = (raw) => {
	const px = toPx(raw);
	if (px === null || px <= 32) return;
	console.warn(
		`[daisyui-adapter] --radius ${raw} (${Number(px.toFixed(2))}px) is above 2rem (32px); ` +
			`the components become pill-like, so the theme's radius is likely wrong.`
	);
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
			`value is gone; restore the stylesheet from version control, or set --daisyui-derived-${key} ` +
			`in the optional ${OVERRIDE} file, which the README's Overrides section describes.`
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
		const old = unwrapFallback(
			current.find((d) => d.prop === `--${key}`)?.value ??
				fallback[`--${key}`] ??
				TOKEN_FALLBACKS[key] ??
				''
		);
		if (SINGLE[key]) {
			lines.push(`\t--${key}: var(${targetVar(key)}, ${old});`);
		} else {
			const helper = isMix(key) ? mixValue(key, colorVar) : textToneValue(key);
			lines.push(`\t--${key}: var(--daisy-derived-${key}, ${old});`);
			lines.push(`\t--daisy-derived-${key}: ${helper};`);
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
		for (const { prop, value } of current)
			if (prop.startsWith('--chart-')) lines.push(`\t${prop}: ${value};`);
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

// The entries the bindings cannot carry. Tailwind reads a bare border width from
// `--default-border-width`, and `--daisy-border` is emitted by the plugin from the theme's --border,
// so the 1px here is only the fallback for a project with no theme (ticket 11). The aliases are not
// theme-gated: an alias resolves the binding, and the binding carries the fallback without a theme.
//
// An entry whose property the block already declares is left alone, even when its value differs: a
// second declaration would silently override the project's own.
const propertyOf = (entry) => entry.slice(0, entry.indexOf(':'));
const insertThemeEntries = (source, entries) => {
	const bounds = blockBounds(source, '@theme inline');
	if (!bounds) {
		console.warn(
			`[daisyui-adapter] no @theme inline block, so these entries are not written: ${entries.join(' ')}`
		);
		return source;
	}
	const body = source.slice(bounds.open, bounds.close);
	const missing = entries.filter((entry) => !body.includes(`${propertyOf(entry)}:`));
	if (missing.length === 0) return source;
	return `${source.slice(0, bounds.close)}${missing.map((entry) => `\t${entry}\n`).join('')}${source.slice(bounds.close)}`;
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

const USAGE =
	`usage: ${BIN} init\n` +
	`       ${BIN} fix [component...] [--dry-run] [--check] [--strict]\n` +
	'  init maps the theme into the stylesheet, then fixes the components you added\n' +
	'  fix  patches the stock component classes; --dry-run reports without writing\n' +
	'       --check exits 1 while a stock site remains\n' +
	'       --strict exits 1 on a customized site or on a named component with no files';

const readComponents = () => {
	const componentsPath = resolve('components.json');
	if (!existsSync(componentsPath)) {
		throw new Error('[daisyui-adapter] no components.json. Run `shadcn-svelte init` first.');
	}
	return JSON.parse(readFileSync(componentsPath, 'utf8'));
};

// No target component is a normal state: the project maps its tokens first and adds components later.
// A component named on the command line still prints its `missing` row, because the user asked about it.
const printFix = (report, { dryRun = false, suffix = '', names = [] } = {}) => {
	if (report.sites.every((site) => site.state === 'missing') && names.length === 0) {
		console.log('[daisyui-adapter] no target components found; nothing to fix');
		return;
	}
	for (const site of report.sites) {
		const tail = site.written ? ' -> fixed' : dryRun && site.state === 'stock' ? ' (dry run)' : '';
		console.log(
			`[daisyui-adapter] ${site.component} ${site.id} (${site.file}): ${site.state}${tail}`
		);
	}
	const { stock, fixed, customized, missing } = report.counts;
	console.log(
		`[daisyui-adapter] fix: ${stock} stock, ${fixed} fixed, ${customized} customized, ${missing} missing` +
			suffix
	);
};

// The marker records the count of files whose every site is fixed, not the files this run changed, so
// a second run has nothing to rewrite. A stylesheet the adapter never wrote has no marker to update.
const updateHeader = (cssPath, report) => {
	if (!cssPath || !existsSync(cssPath)) return;
	const raw = readFileSync(cssPath, 'utf8');
	const match = HEADER_PATTERN.exec(raw);
	if (!match) return;
	const newline = match[0].endsWith('\r\n') ? '\r\n' : match[0].endsWith('\n') ? '\n' : '';
	const next = `${headerFor(report.fullyFixed)}${newline}${raw.slice(match[0].length)}`;
	if (next !== raw) writeFileSync(cssPath, next);
};

const warningSuffix = (warning) => {
	if (warning.kind === WARNING_KIND.fillText) {
		return `; the theme's own ${warning.tone}-content sets this pair`;
	}
	if (warning.kind === WARNING_KIND.border) {
		return '; the text-tone border is the component boundary';
	}
	return '';
};

const printContrast = (matrix) => {
	for (const scheme of ['light', 'dark']) {
		const rows = matrix[scheme];
		console.log(
			`[daisyui-adapter] contrast ${scheme} ` +
				`(text ${TEXT_THRESHOLD.toFixed(2)}, border ${BORDER_THRESHOLD.toFixed(2)})`
		);
		console.log(
			`[daisyui-adapter]   pairs: ${rows.pairs
				.map((row) => `${row.name} ${row.ratio.toFixed(2)}`)
				.join(', ')}`
		);
		console.log(
			`[daisyui-adapter]   text tones: ${rows.textTones
				.map((row) => `${row.tone} ${row.ratio.toFixed(2)}`)
				.join(', ')}`
		);
		console.log(
			`[daisyui-adapter]   filled: ${rows.filled
				.map(
					(row) =>
						`${row.tone} text ${row.text.toFixed(2)} border ${row.border.toFixed(2)} ` +
						`fill ${row.fill.toFixed(2)}${row.fillKnownLimit ? ' known limit' : ''}`
				)
				.join(', ')}`
		);
	}
	for (const limit of contrastKnownLimits(matrix)) {
		console.warn(
			`[daisyui-adapter] known limit: ${limit.scheme} ${limit.name} is ` +
				`${limit.ratio.toFixed(2)}:1 against the page, below ${BORDER_THRESHOLD.toFixed(2)}:1; ` +
				'the text-tone border is the component boundary'
		);
	}
	for (const warning of contrastWarnings(matrix)) {
		console.warn(
			`[daisyui-adapter] warning: ${warning.scheme} ${warning.name} is ` +
				`${warning.ratio.toFixed(2)}:1, below ${warning.threshold.toFixed(2)}:1${warningSuffix(warning)}`
		);
	}
};

const measureContrast = (themes) => {
	try {
		return { matrix: contrastMatrix(themes) };
	} catch (error) {
		const message = String(error.message ?? error);
		if (!message.includes('is not an oklch() colour')) throw error;
		return { error: message.replace(/^\[daisyui-adapter\]\s*/, '') };
	}
};

const init = () => {
	const components = readComponents();
	if (!components.tailwind?.css) {
		throw new Error('[daisyui-adapter] components.json has no tailwind.css path');
	}
	const cssPath = resolve(components.tailwind.css);
	const where = components.tailwind.css;
	let css = readFileSync(cssPath, 'utf8');

	refuseNewerHeader(css, where);
	const headerVersion = headerVersionOf(css);
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

	const stockLight = Object.fromEntries(
		readBlock(css, ':root', where).map((d) => [d.prop, d.value])
	);
	warnRadius(themes ? themes.light['--radius-box'] : unwrapFallback(stockLight['--radius'] ?? ''));
	const chart = themes
		? { light: solveScheme(themes.light), dark: solveScheme(themes.dark) }
		: null;
	// Measured before the write. A theme value the math cannot read is a warning, not a failure,
	// because the mapping still writes and the project still renders.
	const contrast = themes ? measureContrast(themes) : null;

	css = replaceBlock(
		css,
		'.dark',
		rebuild(readBlock(css, '.dark', where), stockLight, chart?.dark ?? null)
	);
	if (!css) throw new Error(`[daisyui-adapter] ${where} has no .dark block`);
	css = replaceBlock(
		css,
		':root',
		rebuild(readBlock(css, ':root', where), stockLight, chart?.light ?? null)
	);
	if (!css) throw new Error(`[daisyui-adapter] ${where} has no :root block`);

	const aliases = Object.keys(TOKEN_FALLBACKS).map((key) => `--color-${key}: var(--${key});`);
	if (themes) css = insertAfterLastImport(css, PLUGIN);
	css = insertThemeEntries(css, themes ? [...aliases, BORDER_ENTRY] : aliases);

	// The fixer runs before the stylesheet is written: a refused version must leave the
	// project untouched, so the map waits in memory until the guard has passed.
	const report = fix({ components });
	css = `${headerFor(report.fullyFixed)}\n${css}`;

	writeFileSync(cssPath, css);

	// Read back what was written: a block the CLI matched but could not fill has to show a count
	// below 43 rather than a number from the data it meant to write.
	const written = readFileSync(cssPath, 'utf8');
	const count = (selector) =>
		readBlock(written, selector, where).filter((d) => !d.prop.startsWith('--daisy-derived-'))
			.length;
	const lightCount = count(':root');
	const darkCount = count('.dark');

	if (themes) console.log('[daisyui-adapter] theme ok: light + dark');
	console.log(`[daisyui-adapter] wrote ${where}`);
	console.log(`[daisyui-adapter] ${lightCount} light, ${darkCount} dark`);
	printFix(report);

	// The install is last, after the lines that describe what was written, so a failed install
	// still tells the user the stylesheet is in place.
	const spec = process.env.DAISYUI_ADAPTER_INSTALL_SPEC ?? `${PKG}@${VERSION}`;
	console.log(`[daisyui-adapter] ${installLine(spec)}`);

	if (chart) {
		for (const scheme of ['light', 'dark']) {
			const solved = chart[scheme];
			console.log(
				`[daisyui-adapter] ${scheme} chart L ${solved.lightness.map((l) => l.toFixed(4)).join(' ')} ` +
					`min adjacent ${solved.minAdjacent.toFixed(3)}`
			);
		}
	}

	if (contrast?.matrix) printContrast(contrast.matrix);
	else if (contrast?.error) {
		console.warn(`[daisyui-adapter] warning: ${contrast.error}; matrix not measured`);
	} else console.log('[daisyui-adapter] contrast: no theme, matrix not measured');
};

const FLAGS = new Set(['--dry-run', '--check', '--strict']);

// A check or strict run prints its report first, then throws, so the user sees the sites before the
// exit code. Neither flag writes: not a component file, not the marker.
const fixCommand = (args) => {
	const unknown = args.find((arg) => arg.startsWith('-') && !FLAGS.has(arg));
	if (unknown) throw new Error(`[daisyui-adapter] unknown flag "${unknown}".\n${USAGE}`);
	const dryRun = args.includes('--dry-run');
	const check = args.includes('--check');
	const strict = args.includes('--strict');
	const names = args.filter((arg) => !FLAGS.has(arg));
	const components = readComponents();
	const write = !check && !strict && !dryRun;
	const where = components.tailwind?.css;
	if (write && where) {
		const cssPath = resolve(where);
		if (existsSync(cssPath)) refuseNewerHeader(readFileSync(cssPath, 'utf8'), where);
	}
	const report = write ? fix({ components, names }) : scan({ components, names });
	const suffix =
		check || strict ? '; check only, nothing written' : dryRun ? '; dry run, nothing written' : '';
	printFix(report, { dryRun, suffix, names });

	if (write) {
		if (components.tailwind?.css) updateHeader(resolve(components.tailwind.css), report);
		return;
	}

	if (check && report.counts.stock > 0) {
		throw new Error(`[daisyui-adapter] --check: ${report.counts.stock} stock site(s) remain`);
	}
	if (strict) {
		if (report.counts.customized > 0) {
			throw new Error(
				`[daisyui-adapter] --strict: ${report.counts.customized} customized site(s) found`
			);
		}
		for (const name of names) {
			const rows = report.sites.filter((site) => site.component === name);
			if (rows.length > 0 && rows.every((site) => site.state === 'missing')) {
				throw new Error(`[daisyui-adapter] --strict: "${name}" has no target files`);
			}
		}
	}
};

const [command = 'init', ...rest] = process.argv.slice(2);
try {
	if (command === 'init') {
		if (rest.length > 0) {
			throw new Error(`[daisyui-adapter] init takes no arguments, got "${rest[0]}".\n${USAGE}`);
		}
		init();
	} else if (command === 'fix') {
		fixCommand(rest);
	} else {
		throw new Error(`[daisyui-adapter] unknown command "${command}".\n${USAGE}`);
	}
} catch (error) {
	console.error(String(error.message ?? error));
	process.exitCode = 1;
}
