// The chart ramp rule settled in ticket 12, in one place so the plugin and the writer cannot drift.
//
// One hue from the theme's `primary`, five lightness steps, chroma capped. Lightness is not shared
// between schemes: the adapter solves one anchor for 3.2:1 against that scheme's own base-100 and
// lays four more steps at a fixed offset. A shared band fails, because the light band puts chart-5
// at 1.18:1 on daisyUI's dark page.
//
// Chroma is capped per step, not once for the ramp. sRGB cannot carry chroma 0.08 at every
// lightness, so a single cap clips, and clipping moves the hue: on the daisyUI dark pair the top
// step drifted 4.5 degrees. Fitting each step to the gamut keeps the hue constant and costs no
// separation (worst adjacent dE 0.090 instead of 0.074).

export const CAP = 0.08;
export const STEP = 0.09;
export const ANCHOR_RATIO = 3.2;
export const STEPS = 5;
export const MIN_ADJACENT_DELTA_E = 0.06;
export const MIN_COMPLIANT_DELTA_E = 0.05;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Unclamped, so a caller can tell in-gamut from clipped.
function rawLinear(L, C, h) {
	const a = C * Math.cos((h * Math.PI) / 180);
	const b = C * Math.sin((h * Math.PI) / 180);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	];
}

export const toLinear = (L, C, h) => rawLinear(L, C, h).map((v) => clamp(v, 0, 1));

const inGamut = (L, C, h) => rawLinear(L, C, h).every((v) => v >= -0.0005 && v <= 1.0005);

// The largest chroma sRGB can hold at this lightness and hue, to 4 decimal places.
export function gamutChroma(L, h) {
	let lo = 0;
	let hi = 0.4;
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (inGamut(L, mid, h)) lo = mid;
		else hi = mid;
	}
	return Math.floor(lo * 10000) / 10000;
}

export const luminance = (lin) => 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];

export const contrastLum = (a, b) => {
	const [hi, lo] = [a, b].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

export const toOklab = (lin) => {
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

export const deltaE = (a, b) => {
	const A = toOklab(a);
	const B = toOklab(b);
	return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};

export const hueOf = (lin) => {
	const [, a, b] = toOklab(lin);
	return ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
};

// The widest hue difference inside a set, measured the short way around the wheel.
export function hueSpread(values) {
	const hs = values.map(hueOf);
	let worst = 0;
	for (let i = 0; i < hs.length; i++) {
		for (let j = i + 1; j < hs.length; j++) {
			const d = Math.abs(hs[i] - hs[j]) % 360;
			worst = Math.max(worst, Math.min(d, 360 - d));
		}
	}
	return worst;
}

export function parseOklch(value) {
	const match = /oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)/.exec(value ?? '');
	if (!match) return null;
	return { L: match[2] ? Number(match[1]) / 100 : Number(match[1]), C: Number(match[3]), h: Number(match[4]) };
}

// Reads one daisyUI theme block into its `--color-*` and radius keys.
export function readThemeBlock(body) {
	return Object.fromEntries(
		[...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
	);
}

// Solves the five lightness values and the five chroma caps for one scheme.
export function solveScheme(vars) {
	const primary = parseOklch(vars['--color-primary']);
	const surface = parseOklch(vars['--color-base-100']);
	if (!primary || !surface) {
		throw new Error('[chart-ramp] the theme needs a numeric --color-primary and --color-base-100');
	}
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
	const outside = lightness.filter((l) => l < 0.02 || l > 0.98);
	if (outside.length > 0) {
		throw new Error(
			`[chart-ramp] base-100 at L ${surface.L.toFixed(3)} leaves no room for five steps ` +
				`(${outside.length} of 5 outside L 0.02 to 0.98). A mid-tone surface cannot carry a one-hue ramp; ` +
				`pick a base-100 closer to white or black, or supply chart values in the overrides file.`
		);
	}

	const chroma = lightness.map((l) => Math.min(cappedBrand, gamutChroma(l, primary.h)));
	const rgb = lightness.map((l, i) => toLinear(l, chroma[i], primary.h));
	const contrast = rgb.map((c) => contrastLum(luminance(c), surfaceLum));
	const adjacent = rgb.slice(1).map((c, i) => deltaE(c, rgb[i]));
	const minAdjacent = Math.min(...adjacent);

	if (minAdjacent < MIN_ADJACENT_DELTA_E) {
		throw new Error(
			`[chart-ramp] adjacent separation ${minAdjacent.toFixed(3)} is below ${MIN_ADJACENT_DELTA_E}`
		);
	}
	if (contrast.some((c) => c < 3)) {
		throw new Error(
			`[chart-ramp] a step is below 3:1 against base-100: ${contrast.map((c) => c.toFixed(2)).join(', ')}`
		);
	}

	const drift = hueSpread(rgb);
	if (drift > 2) {
		throw new Error(`[chart-ramp] the ramp drifts ${drift.toFixed(2)} degrees in hue, so it is not one hue`);
	}

	return {
		anchor,
		direction,
		lightness,
		chroma,
		primary,
		surface,
		surfaceLum,
		contrast,
		adjacent,
		minAdjacent,
		hueSpread: drift
	};
}

// The five token values. Hue and brand chroma stay live, so a later `primary` change flows through;
// only the per-step chroma ceiling is baked, because sRGB needs a different ceiling per step.
export function chartTokens(scheme) {
	return scheme.lightness.map(
		(l, i) => `oklch(from var(--daisy-color-primary) ${l.toFixed(4)} min(c, ${scheme.chroma[i]}) h)`
	);
}
