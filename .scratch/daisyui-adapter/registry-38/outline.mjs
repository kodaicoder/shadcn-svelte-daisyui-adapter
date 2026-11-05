// Ticket 38 evidence: the text tone painted on the tone-tinted outline surface, in both schemes.
// Reuses the package's own token resolution and colour math, so the numbers are the matrix's numbers
// with one surface swapped: the page becomes `tone/alpha` composited over the page.
import { readFileSync } from 'node:fs';

import {
	contrastRatio,
	mixOklch,
	oklchToSrgb,
	over,
	parseOklch,
	TONES
} from '../../../packages/daisyui-adapter/dist/contrast.mjs';
import { parseTheme } from '../../../packages/daisyui-adapter/dist/index.mjs';
import { SINGLE, TEXT_TONE, TOKEN_FALLBACKS } from '../../../packages/daisyui-adapter/dist/map.mjs';

const THEME = 'src/daisyui-theme.css';
const byte = ({ r, g, b }) => ({ r: Math.round(r), g: Math.round(g), b: Math.round(b), a: 255 });
const round = (value) => Math.round(value * 100) / 100;

const themeOklch = (key, scheme) => {
	const row = SINGLE[key];
	if (!row) throw new Error(`no token row for "${key}"`);
	const value = scheme[`--color-${row.source}`] ?? TOKEN_FALLBACKS[key];
	const parsed = parseOklch(value);
	if (!parsed) throw new Error(`--color-${row.source} for "${key}" is not oklch(): ${value}`);
	return parsed;
};

const tokenOklch = (key, scheme) => {
	const row = TEXT_TONE[key];
	if (!row) return themeOklch(key, scheme);
	const [tone, toneWeight, base, baseWeight] = row;
	return mixOklch(
		themeOklch(tone, scheme),
		toneWeight / 100,
		themeOklch(base, scheme),
		baseWeight / 100
	);
};

const colour = (key, scheme) => byte(oklchToSrgb(tokenOklch(key, scheme)));

const tinted = (tone, alpha, scheme, page) =>
	over({ ...colour(tone, scheme), a: Math.round((alpha / 100) * 255) }, page);

const themes = parseTheme(readFileSync(THEME, 'utf8'), THEME);
const report = {};

for (const name of ['light', 'dark']) {
	const scheme = themes[name];
	const page = colour('background', scheme);
	report[name] = {
		page: `rgb(${page.r}, ${page.g}, ${page.b})`,
		tones: TONES.map((tone) => {
			const text = colour(`${tone}-text`, scheme);
			const row = { tone };
			for (const alpha of [0, 10, 20, 30]) {
				const fill = alpha === 0 ? page : tinted(tone, alpha, scheme, page);
				row[`textOn_${alpha}`] = round(contrastRatio(text, fill));
				row[`fillOnPage_${alpha}`] = round(contrastRatio(fill, page));
			}
			return row;
		})
	};
}

console.log(JSON.stringify(report, null, 2));
