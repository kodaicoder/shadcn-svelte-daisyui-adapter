// Verifies a ticket 12 harness run from the painted sRGB bytes, against the floors in ramp.mjs.
// This deliberately recomputes contrast and separation rather than reading `--probe-check-*`, so a
// bug in the plugin cannot certify itself.
//
// Usage: node registry-12/check.mjs <run-dir>
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CAP, MIN_ADJACENT_DELTA_E, MIN_COMPLIANT_DELTA_E } from './package/dist/ramp.mjs';

const MIN_CONTRAST = 3;
const MIN_ADJACENT = MIN_ADJACENT_DELTA_E;
const MIN_ADJACENT_CVD = MIN_COMPLIANT_DELTA_E;

const dir = process.argv[2];
if (!dir) throw new Error('usage: check.mjs <run-dir>');
const render = JSON.parse(readFileSync(join(dir, 'render.json'), 'utf8'));

const parse = (rgb) => {
	const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(rgb ?? '');
	if (!m) return null;
	if (m[4] !== undefined && Number(m[4]) < 1) return null;
	return [+m[1], +m[2], +m[3]].map((v) => v / 255);
};
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearise = (srgb) => srgb.map(toLinear);
const luminance = (srgb) => {
	const [r, g, b] = linearise(srgb);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};
const toOklab = (srgb) => {
	const [r, g, b] = linearise(srgb);
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	];
};
// Same transform, for values already in linear RGB, so a CVD-simulated sample is not decoded twice.
const toOklabLinear = (lin) => {
	const [r, g, b] = lin;
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
	];
};
const deltaE = (a, b) => {
	const A = toOklab(a), B = toOklab(b);
	return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};
const deltaELinear = (a, b) => {
	const A = toOklabLinear(a), B = toOklabLinear(b);
	return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};
const hue = (srgb) => {
	const [, a, b] = toOklab(srgb);
	return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
};
const chroma = (srgb) => {
	const [, a, b] = toOklab(srgb);
	return Math.hypot(a, b);
};

const CVD = {
	protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
	deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
	tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]]
};
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const simulate = (srgb, kind) => {
	const lin = linearise(srgb);
	return CVD[kind].map((row) => clamp01(row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]));
};

const lines = [];
const failures = [];
const check = (ok, message) => {
	lines.push(`${ok ? 'ok  ' : 'FAIL'}  ${message}`);
	if (!ok) failures.push(message);
};

for (const mode of ['light', 'dark']) {
	const elements = render[mode].elements;
	const pageEl = elements.find((e) => e.selector === '#swatch-page');
	const page = parse(pageEl?.backgroundRgb);
	if (!page) {
		check(false, `${mode}: no #swatch-page sample`);
		continue;
	}

	const ramp = [1, 2, 3, 4, 5]
		.map((n) => elements.find((e) => e.selector === `#swatch-chart-${n}`))
		.map((e) => (e && e.found ? parse(e.backgroundRgb) : null));
	if (ramp.some((c) => c === null)) {
		check(false, `${mode}: a chart swatch did not render`);
		continue;
	}

	lines.push(`\n[${mode}] page ${pageEl.backgroundRgb}`);
	const contrasts = ramp.map((c) => contrast(c, page));
	lines.push(`  contrast  ${contrasts.map((v) => v.toFixed(2)).join(' / ')}`);
	check(
		contrasts.every((v) => v >= MIN_CONTRAST),
		`${mode}: every step is at or above ${MIN_CONTRAST}:1 against the page`
	);

	const adjacent = ramp.slice(1).map((c, i) => deltaE(c, ramp[i]));
	lines.push(`  adjacent  ${adjacent.map((v) => v.toFixed(3)).join(' / ')}`);
	check(
		Math.min(...adjacent) >= MIN_ADJACENT,
		`${mode}: adjacent OKLab dE >= ${MIN_ADJACENT} (worst ${Math.min(...adjacent).toFixed(3)})`
	);

	const lightness = ramp.map((c) => toOklab(c)[0]);
	const deltas = lightness.slice(1).map((l, i) => l - lightness[i]);
	const monotone =
		deltas.every((d) => Math.abs(d) > 0.01) && (deltas.every((d) => d > 0) || deltas.every((d) => d < 0));
	check(monotone, `${mode}: lightness moves one direction with no flat step`);

	for (const kind of Object.keys(CVD)) {
		const sim = ramp.map((c) => simulate(c, kind));
		const worst = Math.min(...sim.slice(1).map((c, i) => deltaELinear(c, sim[i])));
		lines.push(`  ${kind}  ${sim.slice(1).map((c, i) => deltaELinear(c, sim[i]).toFixed(3)).join(' / ')}`);
		check(worst >= MIN_ADJACENT_CVD, `${mode}: under ${kind} adjacent dE >= ${MIN_ADJACENT_CVD} (worst ${worst.toFixed(3)})`);
	}
}

// The ramp must be one hue, and no step may exceed the chroma cap. Chroma itself is allowed to
// fall: sRGB cannot carry chroma 0.08 at every lightness, so the rule fits each step to the gamut
// rather than clipping it. Clipping would move the hue, which is the invariant that matters.
for (const mode of ['light', 'dark']) {
	const ramp = [1, 2, 3, 4, 5]
		.map((n) => render[mode].elements.find((e) => e.selector === `#swatch-chart-${n}`))
		.filter((e) => e && e.found)
		.map((e) => parse(e.backgroundRgb));
	if (ramp.length !== 5) continue;
	const chromas = ramp.map(chroma);
	const hues = ramp.map(hue);
	let drift = 0;
	for (let i = 0; i < hues.length; i++) {
		for (let j = i + 1; j < hues.length; j++) {
			const d = Math.abs(hues[i] - hues[j]) % 360;
			drift = Math.max(drift, Math.min(d, 360 - d));
		}
	}
	lines.push(`\n[${mode}] hue ${hues.map((h) => h.toFixed(2)).join(' / ')} (drift ${drift.toFixed(2)} deg)`);
	lines.push(`       chroma ${chromas.map((c) => c.toFixed(3)).join(' / ')}`);
	check(drift <= 2, `${mode}: hue holds within 2 degrees, so the ramp is one hue (drift ${drift.toFixed(2)})`);
	check(Math.max(...chromas) <= CAP + 0.005, `${mode}: painted chroma within 0.005 of the ${CAP} cap (max ${Math.max(...chromas).toFixed(3)})`);
}

console.log(lines.join('\n'));
console.log('');
if (failures.length > 0) {
	console.error(`${failures.length} check(s) failed`);
	process.exitCode = 1;
} else {
	console.log('all checks passed');
}
