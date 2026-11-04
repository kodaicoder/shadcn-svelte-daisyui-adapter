import { PAIRS } from '../../../packages/daisyui-adapter/targets.mjs';

export const TONES = ['success', 'warning', 'info', 'destructive'];
export const TEXT_THRESHOLD = 4.5;
export const BORDER_THRESHOLD = 3;

export const SELECTORS = [
	...PAIRS.map((pair) => `[data-pair="${pair.id}"]`),
	...TONES.flatMap((tone) => [
		`[data-tone="${tone}"][data-part="text"]`,
		`[data-tone="${tone}"][data-part="filled"]`
	])
].join(',');

export const REFERENCE = {
	light: {
		text: { success: 8.3, warning: 6.91, info: 8.24, destructive: 13.49 },
		fill: { success: 2.52, warning: 1.95, info: 2.22 }
	},
	dark: {
		text: { success: 11.28, warning: 13.0, info: 11.88, destructive: 8.24 },
		fill: { destructive: 2.89 }
	}
};

const clamp = (value) => Math.min(1, Math.max(0, value));

export const parseRgb = (value) => {
	const match = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+)(%)?)?\s*\)/.exec(
		value ?? ''
	);
	if (!match) throw new Error(`not an rgb() colour: ${JSON.stringify(value)}`);
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

export const luminance = (colour) =>
	0.2126 * channel(colour.r) + 0.7152 * channel(colour.g) + 0.0722 * channel(colour.b);

export const contrastRatio = (foreground, background) => {
	const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
	return (high + 0.05) / (low + 0.05);
};

export const parseOklch = (value) => {
	const match = /oklch\(\s*([\d.]+)(%)?\s+([\d.]+)\s+([\d.]+)/.exec(value ?? '');
	if (!match) throw new Error(`not an oklch() colour: ${JSON.stringify(value)}`);
	return {
		L: match[2] ? Number(match[1]) / 100 : Number(match[1]),
		C: Number(match[3]),
		h: Number(match[4])
	};
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

// Channels stay fractional so a reference row can be pinned to the published 0.01 without the
// byte rounding a painted snapshot forces.
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
