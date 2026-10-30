// Writes the settled chart ramp into the project's stylesheet, the way the adapter CLI will.
// The `:root` and `.dark` blocks are unlayered, so they win over `@layer base` and over the stock
// shadcn `:root` that shadcn-svelte writes, which is why the ramp lands here rather than in the
// registry item or the plugin.
//
// Re-running replaces its own rows and leaves every other key untouched.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chartTokens, readThemeBlock, solveScheme } from './package/dist/ramp.mjs';

const MARKER = '/* chart ramp, ticket 12 */';

const components = JSON.parse(readFileSync('components.json', 'utf8'));
const cssPath = resolve(components.tailwind.css);
let css = readFileSync(cssPath, 'utf8');

const theme = readFileSync('src/daisyui-theme.css', 'utf8');
const blocks = [...theme.matchAll(/@plugin\s+["']daisyui\/theme["']\s*\{([\s\S]*?)\}/g)];
const themes = {};
for (const block of blocks) {
	const body = block[1];
	const scheme = /color-scheme\s*:\s*["']?(light|dark)["']?\s*;/.exec(body)?.[1];
	if (scheme) themes[scheme] = readThemeBlock(body);
}
if (!themes.light || !themes.dark) throw new Error('[apply-12] the theme needs a light and a dark block');

const toRows = (scheme) =>
	chartTokens(scheme)
		.map((value, i) => `\t--chart-${i + 1}: ${value};`)
		.join('\n');

const light = solveScheme(themes.light);
const dark = solveScheme(themes.dark);

const emit = (selector, scheme) => `\n${MARKER}\n${selector} {\n${toRows(scheme)}\n}\n`;

// Drop a previous write, then insert each block after the selector it belongs to.
css = css.replace(new RegExp(`\\n${MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\n[^{]+\\{[^}]*\\}\\n`, 'g'), '\n');

const insertAfterBlock = (source, selector, addition) => {
	const start = source.indexOf(`${selector} {`);
	if (start === -1) throw new Error(`[apply-12] no ${selector} block in ${components.tailwind.css}`);
	let depth = 0;
	let i = source.indexOf('{', start);
	for (; i < source.length; i++) {
		if (source[i] === '{') depth++;
		else if (source[i] === '}') {
			depth--;
			if (depth === 0) break;
		}
	}
	return source.slice(0, i + 1) + addition + source.slice(i + 1);
};

css = insertAfterBlock(css, ':root', emit(':root', light));
css = insertAfterBlock(css, '.dark', emit('.dark', dark));

writeFileSync(cssPath, css);
console.log(`[apply-12] wrote the ramp to ${components.tailwind.css}`);
console.log(`[apply-12] light ${light.lightness.map((l) => l.toFixed(4)).join(' / ')} minAdj ${light.minAdjacent.toFixed(3)}`);
console.log(`[apply-12] dark  ${dark.lightness.map((l) => l.toFixed(4)).join(' / ')} minAdj ${dark.minAdjacent.toFixed(3)}`);
