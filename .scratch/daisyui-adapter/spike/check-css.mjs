// Usage: node check-css.mjs <app-after.css> <other.css> [<compiled.css> ...]
import { readFileSync } from 'node:fs';

let failures = 0;

function check(label, ok, detail = '') {
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` :: ${detail}` : ''}`);
	if (!ok) failures++;
}

function parseTopLevel(css) {
	const nodes = [];
	let depth = 0;
	let buf = '';
	let body = '';
	for (const ch of css) {
		if (depth === 0) {
			if (ch === '{') {
				nodes.push({ header: buf.trim(), body: '' });
				body = '';
				buf = '';
				depth = 1;
				continue;
			}
			if (ch === ';') {
				nodes.push({ header: buf.trim(), body: null });
				buf = '';
				continue;
			}
			buf += ch;
			continue;
		}
		if (ch === '{') depth++;
		if (ch === '}') {
			depth--;
			if (depth === 0) {
				nodes.at(-1).body = body;
				body = '';
				continue;
			}
		}
		body += ch;
	}
	return nodes.filter((n) => n.header);
}

const count = (text, needle) => text.split(needle).length - 1;

const [afterPath, ...rest] = process.argv.slice(2);
const after = readFileSync(afterPath, 'utf8');
const nodes = parseTopLevel(after);

const imports = nodes.filter((n) => n.header.startsWith('@import'));
const plugins = nodes.filter((n) => n.header.startsWith('@plugin'));
const rootRules = nodes.filter((n) => n.header === ':root');
const darkRules = nodes.filter((n) => n.header === '.dark');

check('one @plugin line installed', plugins.length === 1, JSON.stringify(plugins.map((p) => p.header)));
check(
	'@plugin is top level and after the last @import',
	plugins.length === 1 && nodes.indexOf(plugins[0]) > nodes.lastIndexOf(imports.at(-1)),
	`plugin index ${nodes.indexOf(plugins[0])}, last import index ${nodes.lastIndexOf(imports.at(-1))}`
);
check('one :root block, not a new one appended', rootRules.length === 1, String(rootRules.length));
check('one .dark block, not a new one appended', darkRules.length === 1, String(darkRules.length));

const root = rootRules[0]?.body ?? '';
const dark = darkRules[0]?.body ?? '';
check('light sentinel written inside :root', root.includes('--spike-light: spike-light'));
check('dark sentinel written inside .dark', dark.includes('--spike-dark: spike-dark'));
check('cssVars.light replaced --primary in place', root.includes('--primary: oklch(0.55 0.21 250)'));
check('cssVars.dark replaced --primary in place', dark.includes('--primary: oklch(0.72 0.19 250)'));
for (const [name, value] of [
	['color-popover', 'var(--popover)'],
	['color-popover-foreground', 'var(--popover-foreground)'],
	['color-border', 'var(--border)']
]) {
	check(`cssVars wrote --${name} into :root`, root.includes(`--${name}: ${value};`));
	check(`cssVars wrote --${name} into .dark`, dark.includes(`--${name}: ${value};`));
}

for (const path of rest) {
	const css = readFileSync(path, 'utf8');
	const label = path.split(/[\\/]/).slice(-2).join('/');
	const compiled = css.includes('@layer theme{');

	if (!compiled) {
		check(`one shadcn tailwind import (${label})`, count(css, 'shadcn-svelte/tailwind.css') === 1);
		check(`one @plugin marker (${label})`, count(css, '@plugin') === 1);
		continue;
	}

	check(`compiled CSS carries the plugin base rule (${label})`, css.includes(':root{--spike-loaded:1}'));
	const start = css.indexOf('@layer theme{');
	const open = css.indexOf('{', start);
	let depth = 0;
	let end = -1;
	for (let i = open; i < css.length; i++) {
		if (css[i] === '{') depth++;
		if (css[i] === '}') {
			depth--;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}
	const theme = css.slice(start, end + 1);
	console.log(`INFO  @layer theme emits --color-popover (${label}): ${theme.includes('--color-popover:')}`);
}

console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
