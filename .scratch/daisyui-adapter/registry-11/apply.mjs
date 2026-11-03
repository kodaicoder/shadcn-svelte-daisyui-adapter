// Stands in for the write the adapter CLI makes after reading the theme: the `@theme inline` entry
// that turns `--daisy-border` into the default border width. The registry css map cannot carry it,
// because shadcn-svelte 1.7 parses an at-rule key as a selector and fails on the value. The entry is
// merged into the existing block rather than appended as a second one.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const entry = '--default-border-width: var(--daisy-border, 1px);';
const components = JSON.parse(readFileSync('components.json', 'utf8'));
const cssPath = resolve(components.tailwind.css);
let css = readFileSync(cssPath, 'utf8');

if (css.includes('--default-border-width')) {
	console.log(`[apply-11] ${components.tailwind.css} already carries the entry`);
	process.exit(0);
}

const match = /@theme inline\s*\{/.exec(css);
if (!match) throw new Error('[apply-11] no @theme inline block in ' + components.tailwind.css);
const open = css.indexOf('{', match.index);
const close = css.indexOf('\n}', open);
if (close === -1) throw new Error('[apply-11] unterminated @theme inline block');

css = `${css.slice(0, close)}\n\t${entry}${css.slice(close)}`;
writeFileSync(cssPath, css);
console.log(`[apply-11] wrote ${entry} into @theme inline in ${components.tailwind.css}`);
