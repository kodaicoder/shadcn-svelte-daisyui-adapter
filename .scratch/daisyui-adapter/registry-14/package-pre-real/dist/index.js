// Probe plugin for the prefixed pure-CLI variant of ticket 14. Same shape as package-raw-real but
// it emits the --daisy-color-* namespace ticket 13 settled, and emits nothing when the theme is
// absent so the CLI-written fallbacks decide what renders.
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
		throw new Error('[probe-14-pre-real] theme needs one light and one dark block');
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
			console.log(`[probe-14-pre-real] no theme at ${themeFile}, emitting nothing`);
			return;
		}
		const themes = readThemes(readFileSync(themeFile).toString('utf8'));
		addBase({
			':root': { ...bindings(themes.light), '--probe-14-pre-real': '1' },
			'.dark': { ...bindings(themes.dark), '--probe-14-pre-real': '1' }
		});
	}
};
