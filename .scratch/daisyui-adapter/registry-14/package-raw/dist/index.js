// Probe plugin for the "use daisyUI's own --color-* names" variant of ticket 14. It emits the
// prefixed namespace ticket 13 settled AND one raw daisyUI name, so one run answers whose
// declaration the runtime keeps and whether a utility follows it.
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
		throw new Error('[probe-14-raw] theme needs one light and one dark block');
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
			throw new Error(`[probe-14-raw] cannot read the theme file at ${themeFile}`);
		}
		const themes = readThemes(readFileSync(themeFile).toString('utf8'));
		addBase({
			':root': {
				...bindings(themes.light),
				'--probe-14-raw': '1',
				'--color-primary': 'rgb(200 0 0)',
				'--color-base-100': 'rgb(210 210 210)'
			},
			'.dark': {
				...bindings(themes.dark),
				'--probe-14-raw': '1',
				'--color-primary': 'rgb(201 0 0)',
				'--color-base-100': 'rgb(211 211 211)'
			}
		});
	}
};
