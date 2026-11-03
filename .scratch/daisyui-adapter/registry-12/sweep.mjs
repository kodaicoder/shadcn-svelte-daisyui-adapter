// Re-derives the arithmetic in ticket 12 that is not a build: the CVD table, the per-step versus
// single-cap comparison, the 10-hue by 6-surface sweep with the rule's refusals, the light band on the
// dark page, and the five-plain-assignment contrast set. The rule comes from ramp.mjs, never
// restated; only the rejected clip variant and the CVD simulation are local, and a self-check refuses
// to report if this file and solveScheme disagree on the shipped pair.
//
// Usage:
//   node registry-12/sweep.mjs                 print to stdout
//   node registry-12/sweep.mjs --out <file>    also write the report as UTF-8
import { writeFileSync } from 'node:fs';
import {
	CAP,
	STEP,
	ANCHOR_RATIO,
	deltaE,
	gamutChroma,
	hueOf,
	hueSpread,
	luminance,
	contrastLum,
	parseOklch,
	solveScheme,
	toLinear
} from './package/dist/ramp.mjs';

const CVD = {
	protanopia: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
	deuteranopia: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
	tritanopia: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]]
};
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const simulate = (lin, kind) => CVD[kind].map((row) => clamp01(row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]));
const adjacentMin = (ramp) => Math.min(...ramp.slice(1).map((c, i) => deltaE(c, ramp[i])));
const pairMin = (ramp) => {
	let worst = Infinity;
	for (let i = 0; i < ramp.length; i++) for (let j = i + 1; j < ramp.length; j++) worst = Math.min(worst, deltaE(ramp[i], ramp[j]));
	return worst;
};
const cvdAdjacent = (ramp, kind) => adjacentMin(ramp.map((c) => simulate(c, kind)));
const cvdPair = (ramp, kind) => pairMin(ramp.map((c) => simulate(c, kind)));
const fixed = (v, n = 3) => v.toFixed(n);

const themes = {
	light: { '--color-primary': 'oklch(45% 0.24 277.023)', '--color-base-100': 'oklch(100% 0 0)' },
	dark: { '--color-primary': 'oklch(58% 0.233 277.117)', '--color-base-100': 'oklch(25.33% 0.016 252.42)' }
};

// The same anchor solve as ramp.mjs, minus the refusals, so a rejected construction can be measured
// instead of thrown on. `fit` is the settled rule; `clip` is one cap for the whole ramp, which sRGB
// then clips per channel.
const evaluate = (primary, surface, { fit }) => {
	const cappedBrand = Math.min(primary.C, CAP);
	const surfaceLum = luminance(toLinear(surface.L, surface.C, surface.h));
	const upward = 1.05 / (surfaceLum + 0.05) >= (surfaceLum + 0.05) / 0.05;
	const direction = upward ? 1 : -1;
	let lo = upward ? surface.L : 0;
	let hi = upward ? 1 : surface.L;
	let anchor = upward ? 0.97 : 0.03;
	for (let i = 0; i < 90; i++) {
		const mid = (lo + hi) / 2;
		if (contrastLum(luminance(toLinear(mid, cappedBrand, primary.h)), surfaceLum) >= ANCHOR_RATIO) {
			anchor = mid;
			if (upward) hi = mid;
			else lo = mid;
		} else {
			if (upward) lo = mid;
			else hi = mid;
		}
	}
	const lightness = [0, 1, 2, 3, 4].map((i) => anchor + direction * STEP * i);
	if (lightness.some((l) => l < 0.02 || l > 0.98)) return { ok: false, reason: 'no room' };
	const chroma = lightness.map((l) => (fit ? Math.min(cappedBrand, gamutChroma(l, primary.h)) : cappedBrand));
	const rgb = lightness.map((l, i) => toLinear(l, chroma[i], primary.h));
	const contrast = rgb.map((c) => contrastLum(luminance(c), surfaceLum));
	return {
		ok: true,
		lightness,
		chroma,
		rgb,
		contrast,
		adjacent: adjacentMin(rgb),
		drift: hueSpread(rgb)
	};
};

const hues = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324];
const surfaces = [
	{ L: 0.98, C: 0.005, h: 253 },
	{ L: 0.9, C: 0.01, h: 253 },
	{ L: 0.8, C: 0.012, h: 253 },
	{ L: 0.25, C: 0.016, h: 252 },
	{ L: 0.12, C: 0.01, h: 253 },
	{ L: 0.03, C: 0.005, h: 253 }
];
const brandC = 0.2;

const lines = [];
const say = (s = '') => lines.push(s);

// Self-check: where ramp.mjs accepts a scheme, this file must produce the same numbers.
for (const mode of ['light', 'dark']) {
	const mine = evaluate(parseOklch(themes[mode]['--color-primary']), parseOklch(themes[mode]['--color-base-100']), { fit: true });
	const theirs = solveScheme(themes[mode]);
	const same =
		fixed(mine.adjacent) === fixed(theirs.minAdjacent) &&
		fixed(mine.drift, 2) === fixed(theirs.hueSpread, 2) &&
		mine.lightness.every((l, i) => fixed(l, 6) === fixed(theirs.lightness[i], 6));
	if (!same) {
		console.error(`sweep disagrees with solveScheme on the ${mode} pair; refusing to report`);
		process.exitCode = 1;
	}
}

say('[1] one-hue ramp, daisyUI built-in pair');
for (const mode of ['light', 'dark']) {
	const s = solveScheme(themes[mode]);
	const rgb = s.lightness.map((l, i) => toLinear(l, s.chroma[i], s.primary.h));
	say(
		`${mode.padEnd(5)} adjacent ${fixed(adjacentMin(rgb))} ` +
			Object.keys(CVD).map((kind) => `${kind} ${fixed(cvdAdjacent(rgb, kind))}`).join(' ') +
			`  hue drift ${fixed(s.hueSpread, 2)} deg`
	);
}

say();
say('[2] per-step gamut fit vs one cap for the whole ramp, 10 hues x 6 surfaces');
for (const [label, fit] of [
	['fit ', true],
	['clip', false]
]) {
	let worstAdjacent = Infinity,
		worstDrift = 0,
		contrastFailures = 0,
		noRoom = 0,
		gamutLimited = 0,
		overHueGuard = 0;
	for (const h of hues) {
		for (const surface of surfaces) {
			const r = evaluate({ L: 0.5, C: brandC, h }, surface, { fit });
			if (!r.ok) {
				noRoom++;
				continue;
			}
			worstAdjacent = Math.min(worstAdjacent, r.adjacent);
			worstDrift = Math.max(worstDrift, r.drift);
			contrastFailures += r.contrast.filter((c) => c < 3).length;
			gamutLimited += r.gamutLimited;
			if (r.drift > 2) overHueGuard++;
		}
	}
	say(
		`${label} worst adjacent ${fixed(worstAdjacent)}  worst hue drift ${fixed(worstDrift, 2)} deg  ` +
			`over the 2 deg hue guard ${overHueGuard}/60  contrast failures ${contrastFailures}  no room ${noRoom}`
	);
}
{
	const primary = parseOklch(themes.dark['--color-primary']);
	const L = 0.9091;
	const fittedC = gamutChroma(L, primary.h);
	const fitted = toLinear(L, fittedC, primary.h);
	const clipped = toLinear(L, 0.08, primary.h);
	const drift = (a, b) => {
		const d = Math.abs(a - b) % 360;
		return Math.min(d, 360 - d);
	};
	say(
		`daisy dark step 5: fit C ${fittedC.toFixed(4)} drift ${drift(hueOf(fitted), primary.h).toFixed(2)} deg  ` +
			`| clip C 0.0800 drift ${drift(hueOf(clipped), primary.h).toFixed(2)} deg`
	);
}

say();
say('[3] the settled rule over the same 10 hues x 6 surfaces, refusals included');
{
	let solved = 0;
	const refused = [];
	let worstAdjacent = 0;
	let worstSimulated = 0;
	for (const h of hues) {
		for (const surface of surfaces) {
			try {
				const s = solveScheme({
					'--color-primary': `oklch(50% ${brandC} ${h})`,
					'--color-base-100': `oklch(${(surface.L * 100).toFixed(2)}% ${surface.C} ${surface.h})`
				});
				solved++;
				const rgb = s.lightness.map((l, i) => toLinear(l, s.chroma[i], s.primary.h));
				worstAdjacent = Math.max(worstAdjacent, adjacentMin(rgb));
				for (const kind of Object.keys(CVD)) worstSimulated = Math.max(worstSimulated, cvdAdjacent(rgb, kind));
			} catch (error) {
				refused.push(`hue ${String(h).padStart(3)} surface L ${surface.L.toFixed(2)}: ${error.message.replace('[chart-ramp] ', '')}`);
			}
		}
	}
	say(`solved ${solved}/60  worst adjacent ${fixed(worstAdjacent)} normal  worst simulated ${fixed(worstSimulated)}  refused ${refused.length}`);
	for (const r of refused.slice(0, 8)) say(`  ${r}`);
	if (refused.length > 8) say(`  ... ${refused.length - 8} more`);
}

say();
say('[4] the light scheme band laid on the dark page');
{
	const light = solveScheme(themes.light);
	const darkSurface = parseOklch(themes.dark['--color-base-100']);
	const darkLum = luminance(toLinear(darkSurface.L, darkSurface.C, darkSurface.h));
	const laid = light.lightness.map((l, i) => contrastLum(luminance(toLinear(l, light.chroma[i], light.primary.h)), darkLum));
	say(`contrast ${laid.map((c) => fixed(c, 2)).join(' / ')}  worst ${fixed(Math.min(...laid), 2)} at step ${laid.indexOf(Math.min(...laid)) + 1}`);
}

say();
say('[5] five plain assignments against the light page');
{
	const surface = parseOklch(themes.light['--color-base-100']);
	const surfaceLum = luminance(toLinear(surface.L, surface.C, surface.h));
	const themeFile = {
		primary: [0.45, 0.24, 277.023],
		secondary: [0.65, 0.241, 354.308],
		accent: [0.77, 0.152, 181.912],
		neutral: [0.14, 0.005, 285.823],
		'base-content': [0.21, 0.006, 285.885],
		warning: [0.82, 0.189, 84.429],
		info: [0.74, 0.16, 232.661]
	};
	const sets = {
		'name-to-name   ': ['primary', 'secondary', 'accent', 'neutral', 'base-content'],
		'semantic spread': ['primary', 'secondary', 'accent', 'warning', 'info']
	};
	for (const [label, keys] of Object.entries(sets)) {
		const rgb = keys.map((k) => toLinear(...themeFile[k]));
		const contrast = rgb.map((c) => contrastLum(luminance(c), surfaceLum));
		const below = contrast.map((c, i) => (c < 3 ? keys[i] : null)).filter(Boolean);
		say(`${label} ${keys.map((k, i) => `${k} ${fixed(contrast[i], 2)}`).join(', ')}`);
		say(
			`                 below 3:1 ${below.length} of 5${below.length ? ` (${below.join(', ')})` : ''}  ` +
				`adjacent ${rgb.slice(1).map((c, i) => fixed(deltaE(c, rgb[i]))).join(' / ')}  min pair ${fixed(pairMin(rgb))}`
		);
	}
}

say();
say('[6] separation under CVD, normal and simulated');
{
	const one = solveScheme(themes.light);
	const oneRgb = one.lightness.map((l, i) => toLinear(l, one.chroma[i], one.primary.h));
	const five = {
		'name-to-name': [
			[0.45, 0.24, 277.023],
			[0.65, 0.241, 354.308],
			[0.77, 0.152, 181.912],
			[0.14, 0.005, 285.823],
			[0.21, 0.006, 285.885]
		],
		'semantic': [
			[0.45, 0.24, 277.023],
			[0.65, 0.241, 354.308],
			[0.77, 0.152, 181.912],
			[0.82, 0.189, 84.429],
			[0.74, 0.16, 232.661]
		]
	};
	const row = (label, rgb) =>
		say(
			`${label.padEnd(14)} adjacent ${fixed(adjacentMin(rgb))} / ` +
				Object.keys(CVD).map((kind) => fixed(cvdAdjacent(rgb, kind))).join(' / ') +
				`   pair ${fixed(pairMin(rgb))} / ` +
				Object.keys(CVD).map((kind) => fixed(cvdPair(rgb, kind))).join(' / ')
		);
	say('               normal / protanopia / deuteranopia / tritanopia, adjacent then any pair');
	row('one hue', oneRgb);
	for (const [label, values] of Object.entries(five)) row(label, values.map((v) => toLinear(...v)));
}

const text = `${lines.join('\n')}\n`;
console.log(text);
const out = process.argv.indexOf('--out');
if (out !== -1) writeFileSync(process.argv[out + 1], text, 'utf8');
