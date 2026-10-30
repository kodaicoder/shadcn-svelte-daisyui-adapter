// probe checks, updated for the per-step chroma ceiling and the hue invariant.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { solveScheme, readThemeBlock } from './ramp.mjs';

const SOURCES = [
	'base-100', 'base-200', 'base-300', 'base-content',
	'primary', 'primary-content', 'secondary', 'secondary-content',
	'accent', 'accent-content', 'neutral', 'neutral-content',
	'info', 'info-content', 'success', 'success-content',
	'warning', 'warning-content', 'error', 'error-content'
];

function readThemes(text) {
	const themes = {};
	for (const block of text.matchAll(/@plugin\s+["']daisyui\/theme["']\s*\{([\s\S]*?)\}/g)) {
		const body = block[1];
		const scheme = /color-scheme\s*:\s*["']?(light|dark)["']?\s*;/.exec(body)?.[1];
		if (!scheme) continue;
		themes[scheme] = readThemeBlock(body);
	}
	if (!themes.light || !themes.dark) throw new Error('[probe-12] theme needs one light and one dark block');
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

function checks(theme) {
	const scheme = solveScheme(theme);
	return {
		'--probe-check-anchor': scheme.anchor.toFixed(4),
		'--probe-check-direction': String(scheme.direction),
		'--probe-check-surface-lum': scheme.surfaceLum.toFixed(4),
		'--probe-check-lightness': scheme.lightness.map((l) => l.toFixed(4)).join(','),
		'--probe-check-chroma': scheme.chroma.map((c) => c.toFixed(4)).join(','),
		'--probe-check-contrast': scheme.contrast.map((v) => v.toFixed(2)).join(','),
		'--probe-check-adjacent': scheme.adjacent.map((v) => v.toFixed(3)).join(','),
		'--probe-check-min-adjacent': scheme.minAdjacent.toFixed(3),
		'--probe-check-hue-spread': scheme.hueSpread.toFixed(2)
	};
}

export default {
	handler({ addBase }) {
		const themeFile = resolve(process.cwd(), 'src/daisyui-theme.css');
		if (!existsSync(themeFile)) throw new Error(`[probe-12] cannot read ${themeFile}`);
		const themes = readThemes(readFileSync(themeFile, 'utf8'));
		const light = { ...bindings(themes.light), ...checks(themes.light) };
		const dark = { ...bindings(themes.dark), ...checks(themes.dark) };
		console.log(`[probe-12] light L ${light['--probe-check-lightness']} C ${light['--probe-check-chroma']} minAdj ${light['--probe-check-min-adjacent']}`);
		console.log(`[probe-12] dark  L ${dark['--probe-check-lightness']} C ${dark['--probe-check-chroma']} minAdj ${dark['--probe-check-min-adjacent']}`);
		addBase({
			':root': { ...light, '--probe-12-loaded': '1' },
			'.dark': { ...dark, '--probe-12-loaded': '1' }
		});
	}
};
