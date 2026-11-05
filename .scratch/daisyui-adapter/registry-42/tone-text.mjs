// Ticket 42 evidence: the raw tone as text and border against the page, per scheme.
import { readFileSync } from 'node:fs';

import {
	contrastRatio,
	oklchToSrgb,
	parseOklch
} from '../../../packages/daisyui-adapter/dist/contrast.mjs';
import { parseTheme } from '../../../packages/daisyui-adapter/dist/index.mjs';

const path = 'src/daisyui-theme.css';
const themes = parseTheme(readFileSync(path, 'utf8'), path);
const byte = ({ r, g, b }) => ({ r: Math.round(r), g: Math.round(g), b: Math.round(b), a: 255 });
const round = (value) => Math.round(value * 100) / 100;
const rows = [];

for (const scheme of ['light', 'dark']) {
	const vars = themes[scheme];
	const page = byte(oklchToSrgb(parseOklch(vars['--color-base-100'])));
	for (const [name, source] of [
		['success', '--color-success'],
		['warning', '--color-warning'],
		['info', '--color-info'],
		['destructive', '--color-error'],
		['primary', '--color-primary'],
		['secondary', '--color-secondary']
	]) {
		const tone = byte(oklchToSrgb(parseOklch(vars[source])));
		rows.push({ scheme, tone: name, ratio: round(contrastRatio(tone, page)) });
	}
}

console.log(JSON.stringify(rows, null, 2));
