import { PAIRS } from '../targets.mjs';
import { SINGLE, TEXT_TONE, TOKEN_FALLBACKS } from './map.mjs';
import { parseOklch as parseOklchValue } from './ramp.mjs';

export const TONES = ['success', 'warning', 'info', 'destructive'];
export const TEXT_THRESHOLD = 4.5;
export const BORDER_THRESHOLD = 3;
export const WARNING_KIND = { text: 'text', fillText: 'fill-text' };

export const SELECTORS = [
	...PAIRS.map((pair) => `[data-pair="${pair.id}"]`),
	...TONES.flatMap((tone) => [
		`[data-tone="${tone}"][data-part="text"]`,
		`[data-tone="${tone}"][data-part="filled"]`
	])
].join(',');

const SCHEMES = ['light', 'dark'];
const round = (value) => Number(value.toFixed(2));
const clamp = (value) => Math.min(1, Math.max(0, value));

export const parseRgb = (value) => {
	const match = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+)(%)?)?\s*\)/.exec(
		value ?? ''
	);
	if (!match)
		throw new Error(`[daisyui-adapter] contrast: not an rgb() colour: ${JSON.stringify(value)}`);
	const alpha = match[4] === undefined ? 1 : match[5] ? Number(match[4]) / 100 : Number(match[4]);
	return {
		r: Number(match[1]),
		g: Number(match[2]),
		b: Number(match[3]),
		a: Math.round(alpha * 255)
	};
};

export const over = (front, back) => {
	const alpha = front.a / 255;
	return {
		r: front.r * alpha + back.r * (1 - alpha),
		g: front.g * alpha + back.g * (1 - alpha),
		b: front.b * alpha + back.b * (1 - alpha),
		a: 255
	};
};

const channel = (byte) => {
	const value = byte / 255;
	return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
};

const luminance = (colour) =>
	0.2126 * channel(colour.r) + 0.7152 * channel(colour.g) + 0.0722 * channel(colour.b);

export const contrastRatio = (foreground, background) => {
	const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
	return (high + 0.05) / (low + 0.05);
};

// `ramp.mjs` reads null as "not oklch" so a missing theme can fall back; a measured value that
// cannot be read is a defect here, so the parse fails loudly instead.
export const parseOklch = (value) => {
	const parsed = parseOklchValue(value);
	if (!parsed) {
		throw new Error(`[daisyui-adapter] contrast: not an oklch() colour: ${JSON.stringify(value)}`);
	}
	return parsed;
};

export const mixOklch = (a, weightA, b, weightB) => {
	let delta = b.h - a.h;
	if (delta > 180) delta -= 360;
	if (delta < -180) delta += 360;
	const hue = (a.h * weightA + (a.h + delta) * weightB) % 360;
	return {
		L: a.L * weightA + b.L * weightB,
		C: a.C * weightA + b.C * weightB,
		h: hue < 0 ? hue + 360 : hue
	};
};

export const oklchToSrgb = ({ L, C, h }) => {
	const a = C * Math.cos((h * Math.PI) / 180);
	const b = C * Math.sin((h * Math.PI) / 180);
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const linear = [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
	];
	const encode = (value) => {
		const linearValue = clamp(value);
		return (
			(linearValue <= 0.0031308 ? 12.92 * linearValue : 1.055 * linearValue ** (1 / 2.4) - 0.055) *
			255
		);
	};
	return { r: encode(linear[0]), g: encode(linear[1]), b: encode(linear[2]), a: 255 };
};

// The painted channel is an 8-bit integer. Rounding here, before the ratio, is what reproduces the
// browser's 3.49 and 1.85 instead of the fractional 3.47 and 1.84.
const byte = ({ r, g, b }) => ({
	r: Math.round(r),
	g: Math.round(g),
	b: Math.round(b),
	a: 255
});

const themeOklch = (key, scheme) => {
	const row = SINGLE[key];
	if (!row) throw new Error(`[daisyui-adapter] contrast: no token row for "${key}"`);
	const value = scheme[`--color-${row.source}`] ?? TOKEN_FALLBACKS[key];
	if (value === undefined) {
		throw new Error(
			`[daisyui-adapter] contrast: the theme has no --color-${row.source} and no fallback for "${key}"`
		);
	}
	const parsed = parseOklchValue(value);
	if (!parsed) {
		throw new Error(
			`[daisyui-adapter] contrast: --color-${row.source} for "${key}" is not an oklch() colour: ` +
				JSON.stringify(value)
		);
	}
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

const tokenColour = (key, scheme) => byte(oklchToSrgb(tokenOklch(key, scheme)));

const resolve = (key, scheme, page) => {
	const slash = key.indexOf('/');
	if (slash === -1) return tokenColour(key, scheme);
	const base = key.slice(0, slash);
	const alpha = Number(key.slice(slash + 1)) / 100;
	return over({ ...tokenColour(base, scheme), a: Math.round(alpha * 255) }, page);
};

export const contrastMatrix = (themes) => {
	const matrix = {};
	for (const scheme of SCHEMES) {
		const theme = themes[scheme];
		const page = tokenColour('background', theme);

		const pairs = PAIRS.map((pair) => {
			const background =
				scheme === 'dark' && pair.backgroundDark ? pair.backgroundDark : pair.background;
			const ratio = round(
				contrastRatio(resolve(pair.foreground, theme, page), resolve(background, theme, page))
			);
			return {
				id: pair.id,
				name: pair.name,
				ratio,
				threshold: pair.threshold,
				pass: ratio >= pair.threshold
			};
		});

		const textTones = TONES.map((tone) => {
			const ratio = round(contrastRatio(tokenColour(`${tone}-text`, theme), page));
			return {
				tone,
				ratio,
				threshold: TEXT_THRESHOLD,
				pass: ratio >= TEXT_THRESHOLD
			};
		});

		const filled = TONES.map((tone) => {
			const fill = tokenColour(tone, theme);
			const textRatio = round(contrastRatio(tokenColour(`${tone}-foreground`, theme), fill));
			const fillRatio = round(contrastRatio(fill, page));
			return {
				tone,
				text: textRatio,
				textThreshold: TEXT_THRESHOLD,
				textPass: textRatio >= TEXT_THRESHOLD,
				fill: fillRatio,
				fillKnownLimit: fillRatio < BORDER_THRESHOLD
			};
		});

		matrix[scheme] = { pairs, textTones, filled };
	}
	return matrix;
};

export const contrastWarnings = (matrix) =>
	SCHEMES.flatMap((scheme) => {
		const rows = matrix[scheme];
		return [
			...rows.pairs
				.filter((row) => !row.pass)
				.map((row) => ({
					scheme,
					name: row.name,
					ratio: row.ratio,
					threshold: row.threshold,
					kind: WARNING_KIND.text
				})),
			...rows.textTones
				.filter((row) => !row.pass)
				.map((row) => ({
					scheme,
					name: `${row.tone} text`,
					ratio: row.ratio,
					threshold: TEXT_THRESHOLD,
					kind: WARNING_KIND.text
				})),
			...rows.filled
				.filter((row) => !row.textPass)
				.map((row) => ({
					scheme,
					tone: row.tone,
					name: `${row.tone} fill text`,
					ratio: row.text,
					threshold: TEXT_THRESHOLD,
					kind: WARNING_KIND.fillText
				}))
		];
	});

export const contrastKnownLimits = (matrix) =>
	SCHEMES.flatMap((scheme) =>
		matrix[scheme].filled
			.filter((row) => row.fillKnownLimit)
			.map((row) => ({ scheme, name: `${row.tone} fill`, ratio: row.fill }))
	);
