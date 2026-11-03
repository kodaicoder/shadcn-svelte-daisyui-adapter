// The build-time half. It reads the user's theme and emits one namespace: `--daisy-color-<source>`
// for the 20 daisyUI colours and `--daisy-radius` for the box rung. It never writes a shadcn token
// name, so the CLI's bindings stay the only place a token is named.
//
// Two reasons it emits bindings rather than tokens. The plugin's `addBase` lands in `@layer base`,
// and the project's unlayered `:root` beats any layered rule regardless of specificity (ticket 13).
// And a `--primary: var(--color-primary, ...)` binding would form a cycle with `@theme inline`'s
// `--color-primary: var(--primary)`, leaving the fallback silently ignored (ticket 14).
//
// Error text is ticket 02's contract: E1 is absent, E2 is a malformed pair, E3 is a malformed block.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { COLOR_SOURCES } from './map.mjs';

export const THEME_FILE = 'src/daisyui-theme.css';
const GENERATOR = 'https://daisyui.com/theme-generator/';

const blockPattern = /@plugin\s+["']daisyui\/theme["']\s*\{([\s\S]*?)\}/g;

const E2 = (path, problem) =>
	`[daisyui-adapter] ${path}: ${problem}. The file must hold exactly two v5 theme blocks, one ` +
	`light and one dark. Generate both at ${GENERATOR}, paste them into that file, then re-run the build.`;

const E3 = (path, label, problem) =>
	`[daisyui-adapter] ${path}: theme "${label}" ${problem}. Replace that block with a complete ` +
	`v5 block from ${GENERATOR}, then re-run the build.`;

// Reads exactly one light block and one dark block. Order does not matter, `default` and
// `prefersdark` are advisory, and `color-scheme` is the only light/dark marker.
export const parseTheme = (text, path) => {
	const blocks = [...text.matchAll(blockPattern)];
	if (blocks.length !== 2) {
		throw new Error(E2(path, `holds ${blocks.length} theme block(s)`));
	}
	const themes = {};
	for (const block of blocks) {
		const body = block[1];
		const label = /name\s*:\s*["']([^"']+)["']/.exec(body)?.[1] ?? 'unnamed';
		const scheme = /color-scheme\s*:\s*["']?(light|dark)["']?\s*;/.exec(body)?.[1];
		if (!scheme) {
			throw new Error(E3(path, label, 'has no color-scheme'));
		}
		if (/--[pr]-[a-z]/.test(body)) {
			throw new Error(E3(path, label, 'uses daisyUI v4 variable names'));
		}
		if (themes[scheme]) {
			throw new Error(E2(path, `holds two ${scheme} blocks`));
		}
		const vars = Object.fromEntries(
			[...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()])
		);
		for (const source of COLOR_SOURCES) {
			if (!vars[`--color-${source}`]) {
				throw new Error(E3(path, label, `is missing --color-${source}`));
			}
		}
		if (!vars['--radius-box']) {
			throw new Error(E3(path, label, 'is missing --radius-box'));
		}
		if (!vars['--border']) {
			throw new Error(E3(path, label, 'is missing --border'));
		}
		themes[scheme] = vars;
	}
	return themes;
};

export const themePath = (cwd = process.cwd()) => resolve(cwd, THEME_FILE);

// Absent is a state a later paste fixes, so the plugin emits nothing and the CLI-written fallbacks
// decide what renders. Present but malformed is a defect that would render wrong colours silently.
export const readTheme = (cwd = process.cwd()) => {
	const path = themePath(cwd);
	if (!existsSync(path)) return null;
	return parseTheme(readFileSync(path, 'utf8'), path);
};

export const bindingsFor = (vars) => {
	const out = {};
	for (const source of COLOR_SOURCES) out[`--daisy-color-${source}`] = vars[`--color-${source}`];
	out['--daisy-radius'] = vars['--radius-box'];
	out['--daisy-border'] = vars['--border'];
	return out;
};

export default {
	handler({ addBase }) {
		const themes = readTheme();
		if (!themes) {
			console.log(`[daisyui-adapter] no ${THEME_FILE}, emitting nothing; the CLI fallbacks render`);
			return;
		}
		addBase({
			':root': bindingsFor(themes.light),
			'.dark': bindingsFor(themes.dark)
		});
	}
};
