// Proves the writer's refusals are real: a mid-tone surface and a grey brand both have to be
// handled by the rule rather than silently emitting five identical or five flat colours.
//
// Usage: node .scratch/daisyui-adapter/registry-12/floors.mjs
import { solveScheme } from './package/dist/ramp.mjs';

const themes = {
	'daisy light': { '--color-primary': 'oklch(45% 0.24 277.023)', '--color-base-100': 'oklch(100% 0 0)' },
	'daisy dark': { '--color-primary': 'oklch(58% 0.233 277.117)', '--color-base-100': 'oklch(25.33% 0.016 252.42)' },
	'mid L 0.45': { '--color-primary': 'oklch(45% 0.24 277.023)', '--color-base-100': 'oklch(45% 0.01 253)' },
	'mid L 0.50': { '--color-primary': 'oklch(45% 0.24 277.023)', '--color-base-100': 'oklch(50% 0.01 253)' },
	'mid L 0.55': { '--color-primary': 'oklch(45% 0.24 277.023)', '--color-base-100': 'oklch(55% 0.01 253)' },
	'grey brand': { '--color-primary': 'oklch(45% 0 0)', '--color-base-100': 'oklch(100% 0 0)' }
};

for (const [name, vars] of Object.entries(themes)) {
	try {
		const s = solveScheme(vars);
		console.log(`OK    ${name.padEnd(12)} L ${s.lightness.map((l) => l.toFixed(4)).join(' / ')}`);
		console.log(`      C ${s.chroma.map((c) => c.toFixed(4)).join(' / ')} | minAdj ${s.minAdjacent.toFixed(3)} | hue drift ${s.hueSpread.toFixed(2)}`);
		console.log(`      contrast ${s.contrast.map((c) => c.toFixed(2)).join(' / ')}`);
	} catch (error) {
		console.log(`THROW ${name.padEnd(12)} ${error.message}`);
	}
}
