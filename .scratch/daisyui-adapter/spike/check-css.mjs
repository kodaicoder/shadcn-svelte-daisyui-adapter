// Re-runnable checks for claims 1 to 3 against the installed stylesheet and the
// compiled build CSS. Nodes are found textually, so it needs no CSS dependency.
// Usage: node check-css.mjs <app-after.css> <compiled.css> [<compiled2.css> ...]
import { readFileSync } from 'node:fs';

let failures = 0;

function check(label, ok, detail = '') {
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` :: ${detail}` : ''}`);
	if (!ok) failures++;
}

// Top-level nodes only: statements end in `;`, rules open a block.
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

const [afterPath, ...compiledPaths] = process.argv.slice(2);
const nodes = parseTopLevel(readFileSync(afterPath, 'utf8'));

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
	check(`--${name} declared in :root`, root.includes(`--${name}: ${value};`));
	check(`--${name} declared in .dark`, dark.includes(`--${name}: ${value};`));
}

for (const path of compiledPaths) {
	const compiled = readFileSync(path, 'utf8');
	const spikeHits = compiled.split('--spike-loaded').length - 1;
	if (compiled.includes('--spike-loaded')) {
		check(`compiled CSS carries the plugin base rule (${path.split(/[\\/]/).pop()})`, spikeHits === 1, `hits ${spikeHits}`);
		check(
			`plugin base rule is a plain :root declaration (${path.split(/[\\/]/).pop()})`,
			compiled.includes(':root{--spike-loaded:1}')
		);
		check(
			`plain --color-popover emitted (${path.split(/[\\/]/).pop()})`,
			compiled.includes('--color-popover:var(--popover)')
		);
		check(
			`plain --color-border emitted (${path.split(/[\\/]/).pop()})`,
			compiled.includes('--color-border:var(--border)')
		);
		check(
			`inline theme vars stay pruned, no --color-primary (${path.split(/[\\/]/).pop()})`,
			!compiled.includes('--color-primary:')
		);
	}
}

console.log(failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`);
process.exitCode = failures === 0 ? 0 : 1;
