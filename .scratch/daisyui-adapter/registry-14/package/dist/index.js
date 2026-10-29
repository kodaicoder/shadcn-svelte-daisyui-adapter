// Probe plugin for ticket 14. It stands in for the real adapter's plugin (16 owns that) and
// answers one question: which user override beats the bindings the item's css map installed?
// A second question rides on the same run: whether a run that skips the override keeps the
// generated values. The values are probe values, not the adapter's mapping table.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SOURCES = [
	'base-100',
	'base-200',
	'base-300',
	'base-content',
	'primary',
	'primary-content',
	'secondary',
	'secondary-content',
	'accent',
	'accent-content',
	'neutral',
	'neutral-content',
	'info',
	'info-content',
	'success',
	'success-content',
	'warning',
	'warning-content',
	'error',
	'error-content'
];

function readThemes(text) {
	const themes = {};
	for (const block of text.matchAll(/@plugin\s+["']daisyui\/theme["']\s*\{([\s\S]*?)\}/g)) {
		const body = block[1];
		const scheme = /color-scheme\s*:\s*["']?(light|dark)["']?\s*;/.exec(body)?.[1];
		if (!scheme) continue;
		const vars = Object.fromEntries(
			[...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
		);
		themes[scheme] = vars;
	}
	if (!themes.light || !themes.dark) {
		throw new Error('[probe-14] theme needs one light and one dark block');
	}
	return themes;
}

function bindings(vars) {
	const out = {};
	for (const source of SOURCES) {
		const value = vars[`--color-${source}`];
		if (value) out[`--daisy-color-${source}`] = value;
	}
	if (vars['--radius-box']) out['--daisy-radius'] = vars['--radius-box'];
	return out;
}

export default {
	handler({ addBase }) {
		const themeFile = resolve(process.cwd(), 'src/daisyui-theme.css');
		if (!existsSync(themeFile)) {
			throw new Error(`[probe-14] cannot read the theme file at ${themeFile}`);
		}
		const source = readFileSync(themeFile);
		const themes = readThemes(source.toString('utf8'));
		console.log(
			`[probe-14] cwd=${process.cwd()} module=${import.meta.url} theme=${themeFile} bytes=${source.length}`
		);
		addBase({
			':root': { ...bindings(themes.light), '--probe-14-loaded': '1' },
			'.dark': { ...bindings(themes.dark), '--probe-14-loaded': '1' }
		});
	}
};
