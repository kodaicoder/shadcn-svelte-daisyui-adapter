// The reference rows the harness pins, recomputed for the tinted page.
import { readFileSync } from 'node:fs';

import {
	contrastRatio,
	mixOklch,
	oklchToSrgb,
	parseOklch
} from '../../../packages/daisyui-adapter/dist/contrast.mjs';
import { TOKEN_FALLBACKS } from '../../../packages/daisyui-adapter/dist/map.mjs';
import { parseTheme } from '../../../packages/daisyui-adapter/dist/index.mjs';

const path = 'src/daisyui-theme.css';
const theme = parseTheme(readFileSync(path, 'utf8'), path);
const round = (value) => Math.round(value * 100) / 100;
const out = {};

for (const scheme of ['light', 'dark']) {
	const vars = theme[scheme];
	const page = oklchToSrgb(parseOklch(vars['--color-base-100']));
	const base = parseOklch(vars['--color-base-content']);
	out[scheme] = {};
	for (const tone of ['success', 'warning', 'info']) {
		const fill = parseOklch(TOKEN_FALLBACKS[tone]);
		const textTone = mixOklch(fill, 0.4, base, 0.6);
		out[scheme][tone] = {
			text: round(contrastRatio(oklchToSrgb(textTone), page)),
			fill: round(contrastRatio(oklchToSrgb(fill), page))
		};
	}
}

console.log(JSON.stringify(out, null, 2));
