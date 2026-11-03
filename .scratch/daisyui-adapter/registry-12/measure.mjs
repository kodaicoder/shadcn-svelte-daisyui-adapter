// Measures a ticket 12 harness run from the rendered bytes, so every number comes from what the
// browser painted rather than from the theme file. Usage:
//   node registry-12/measure.mjs <run-dir>
// Separation is OKLab ΔE and contrast is WCAG 2.x, both computed from the sampled sRGB bytes.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
if (!dir) throw new Error('usage: measure.mjs <run-dir>');
const render = JSON.parse(readFileSync(join(dir, 'render.json'), 'utf8'));

const parse = (rgb) => {
	const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(rgb ?? '');
	if (!m) return null;
	if (m[4] !== undefined && Number(m[4]) < 1) return null;
	return [+m[1], +m[2], +m[3]].map((v) => v / 255);
};
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toOklab = (srgb) => {
	const [r, g, b] = srgb.map(toLinear);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	];
};
const luminance = (srgb) => {
	const [r, g, b] = srgb.map(toLinear);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};
const deltaE = (a, b) => {
	const A = toOklab(a), B = toOklab(b);
	return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};

const ordered = (elements, prefix) =>
	[1, 2, 3, 4, 5]
		.map((n) => elements.find((e) => e.selector === `#swatch-${prefix}${n}`))
		.filter((e) => e && e.found)
		.map((e) => ({ selector: e.selector, rgb: parse(e.backgroundRgb), bytes: e.backgroundRgb }));

const minSeparation = (ramp) => {
	let min = Infinity, where = null;
	for (let i = 0; i < ramp.length; i++)
		for (let j = i + 1; j < ramp.length; j++) {
			const d = deltaE(ramp[i].rgb, ramp[j].rgb);
			if (d < min) { min = d; where = [ramp[i].selector, ramp[j].selector]; }
		}
	return { value: +min.toFixed(3), where };
};

const constructions = [
	['stock --chart-*', 'stock-'],
	['g1 fixed L, capped C', 'g1-'],
	['g2 fixed L, relative C', 'g2-'],
	['g3 lifted band', 'g3-']
];

const report = { run: dir, schemes: {} };
for (const mode of ['light', 'dark']) {
	const page = parse(render[mode].backgroundRgb);
	const rows = [];
	for (const [label, prefix] of constructions) {
		const ramp = ordered(render[mode].elements, prefix);
		if (ramp.length !== 5) { rows.push({ construction: label, missing: ramp.length }); continue; }
		const contrasts = ramp.map((c) => contrast(c.rgb, page));
		const sep = minSeparation(ramp);
		rows.push({
			construction: label,
			bytes: ramp.map((c) => c.bytes),
			contrast: contrasts.map((c) => +c.toFixed(2)),
			belowThree: contrasts.map((c, i) => (c < 3 ? i + 1 : null)).filter((v) => v !== null),
			minPairSeparation: sep.value,
			minPairWhere: sep.where,
			adjacentSeparation: ramp.slice(1).map((c, i) => +deltaE(c.rgb, ramp[i].rgb).toFixed(3))
		});
	}
	const assigned = ['primary', 'secondary', 'accent', 'warning', 'info']
		.map((id) => render[mode].elements.find((e) => e.selector === `#swatch-assign-${id}`))
		.filter((e) => e && e.found)
		.map((e) => ({ name: e.selector.replace('#swatch-assign-', ''), rgb: parse(e.backgroundRgb), bytes: e.backgroundRgb }));
	const assignedContrast = assigned.map((a) => +contrast(a.rgb, page).toFixed(2));
	report.schemes[mode] = {
		page: render[mode].backgroundRgb,
		rows,
		assignments: {
			names: assigned.map((a) => a.name),
			contrast: assignedContrast,
			belowThree: assignedContrast.map((c, i) => (c < 3 ? assigned[i].name : null)).filter(Boolean),
			minPairSeparation: minSeparation(assigned).value
		},
		spread: {
			hue: render[mode].elements.find((e) => e.selector === '#swatch-spread-hue')?.backgroundRgb,
			mix: render[mode].elements.find((e) => e.selector === '#swatch-spread-mix')?.backgroundRgb
		}
	};
}

console.log(JSON.stringify(report, null, 2));
