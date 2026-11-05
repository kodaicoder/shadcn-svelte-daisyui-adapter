// Ticket 39 evidence: three candidate status pairs, measured with the package's own math.
import {
	contrastRatio,
	oklchToSrgb,
	parseOklch
} from '../../../packages/daisyui-adapter/dist/contrast.mjs';

const byte = ({ r, g, b }) => ({ r: Math.round(r), g: Math.round(g), b: Math.round(b), a: 255 });
const rgb = (value) => byte(oklchToSrgb(parseOklch(value)));
const round = (value) => Math.round(value * 100) / 100;

const rows = [
	['daisyui default success', 'oklch(76% 0.177 163.223)', 'oklch(37% 0.077 168.94)'],
	['daisyui default warning', 'oklch(82% 0.189 84.429)', 'oklch(41% 0.112 45.904)'],
	['daisyui default info', 'oklch(74% 0.16 232.661)', 'oklch(29% 0.066 243.157)'],
	['daisyui default error', 'oklch(71% 0.194 13.428)', 'oklch(27% 0.105 12.094)'],
	['theme dark success', 'oklch(60% 0.118 184.704)', 'oklch(98% 0.014 180.72)'],
	['theme dark warning', 'oklch(79% 0.184 86.047)', 'oklch(98% 0.026 102.212)'],
	['theme dark info', 'oklch(62% 0.214 259.815)', 'oklch(97% 0.014 254.604)'],
	['theme dark error', 'oklch(50% 0.213 27.518)', 'oklch(97% 0.013 17.38)'],
	['operator content on theme light success', 'oklch(52% 0.118 184.704)', 'oklch(26% 0.065 152.934)'],
	['operator content on daisyui success', 'oklch(76% 0.177 163.223)', 'oklch(26% 0.065 152.934)']
];

console.log(
	JSON.stringify(
		rows.map(([label, fill, content]) => ({
			label,
			fill: rgb(fill),
			content: rgb(content),
			ratio: round(contrastRatio(rgb(content), rgb(fill)))
		})),
		null,
		2
	)
);
