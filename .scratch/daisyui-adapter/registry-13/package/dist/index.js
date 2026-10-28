// Probe plugin for ticket 13. It stands in for the real adapter's plugin (16 owns that) and
// answers one runtime question: what wins when a plugin's addBase output meets the user's
// unlayered :root. The values are probe values, not the adapter's mapping table.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const TOKENS = {
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
	'muted-foreground': 'base-content',
	accent: 'base-200',
	'accent-foreground': 'base-content',
	destructive: 'error',
	border: 'base-300',
	input: 'base-300',
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
	'sidebar-border': 'base-300',
	'sidebar-ring': 'primary',
	radius: 'radius-box'
};

function readThemes(text) {
	const themes = {};
	for (const block of text.matchAll(/@plugin\s+["']daisyui\/theme["']\s*\{([\s\S]*?)\}/g)) {
		const body = block[1];
		const scheme = /color-scheme\s*:\s*(light|dark)\s*;/.exec(body)?.[1];
		if (!scheme) continue;
		const vars = Object.fromEntries(
			[...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
		);
		themes[scheme] = vars;
	}
	if (!themes.light || !themes.dark) {
		throw new Error('[probe-13] theme needs one light and one dark block');
	}
	return themes;
}

function bindings(vars) {
	const out = {};
	for (const [token, source] of Object.entries(TOKENS)) {
		const value = vars[`--color-${source}`] ?? vars[`--${source}`];
		// daisyUI has no --color-radius; its source token is --radius-box.
		if (value) out[token === 'radius' ? '--daisy-radius' : `--daisy-color-${token}`] = value;
	}
	return out;
}

export default {
	handler({ addBase }) {
		const themeFile = resolve(process.cwd(), 'src/daisyui-theme.css');
		if (!existsSync(themeFile)) {
			throw new Error(`[probe-13] cannot read the theme file at ${themeFile}`);
		}
		const source = readFileSync(themeFile);
		const themes = readThemes(source.toString('utf8'));
		console.log(
			`[probe-13] cwd=${process.cwd()} module=${import.meta.url} theme=${themeFile} bytes=${source.length}`
		);
		addBase({
			':root': {
				...bindings(themes.light),
				// Deliberate collision probe: an addBase declaration for a token the user owns.
				'--primary': 'rgb(255 0 0)',
				'--cascade-raw': 'base-light'
			},
			'.dark': {
				...bindings(themes.dark),
				'--primary': 'rgb(0 255 0)',
				'--cascade-raw': 'base-dark'
			}
		});
	}
};
