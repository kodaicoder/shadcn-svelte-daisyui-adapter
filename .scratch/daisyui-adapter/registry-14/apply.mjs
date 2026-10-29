// Applies a ticket 14 override fixture to an installed app, the way a user would: one file plus
// one import line, or a fenced block inside the generated :root. Runs from the app root, so the
// harness invokes it with `--then "exec node <this file> <arm>"`.
//
// Arms:
//   carriers  eight override carriers, each on its own token, so one build measures all of them
//   win       the recommended carrier only (html:root / html.dark)
//   win-edit  the recommended carrier, plus a hand edit of a generated --ring declaration
//   fenced    hand edits inside the generated :root, one key the map owns and one it does not
//   theme-drift  edit the theme file after the add and touch no stylesheet, to test whether the
//                build re-reads the theme or serves a cached map
//   missing-name  rewrite one light binding to a --daisy-color-* the plugin never emits, the
//                shape a package upgrade without a re-add would produce
//   theme-rule   put both shapes of override into the theme file itself, a selector rule at the
//                end and an extra --daisy-color-* key inside the light block
//   raw-collision  the settled map plus an escape hatch, against the item whose plugin also
//                declares daisyUI's own --color-primary; one binding gets a fallback
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const ARM = process.argv[2];
const OVERRIDE = 'daisyui-adapter.overrides.css';
const IMPORT = `@import "./${OVERRIDE}";`;

// Six carriers, one token each. Each value is a flat rgb() so the runtime read cannot be
// confused with a colour-mix result.
const CARRIERS = `/* 1. imported, plain selectors: source order loses, because an @import sits first */
:root { --primary: rgb(1 1 1); }
.dark { --primary: rgb(2 2 2); }

/* 2. imported, html:root specificity 0,1,1 */
html:root { --border: rgb(3 3 3); }
html.dark { --border: rgb(4 4 4); }

/* 3. imported, :root:root specificity 0,2,0 */
:root:root { --input: rgb(5 5 5); }
:root.dark { --input: rgb(6 6 6); }

/* 4. imported, inside a cascade layer */
@layer overrides {
	:root { --accent: rgb(7 7 7); }
	.dark { --accent: rgb(8 8 8); }
}

/* 7. imported, light only with plain html:root: no dark block, so it leaks into dark */
html:root { --chart-1: rgb(13 13 13); }

/* 8. imported, light only with html:not(.dark): no dark block, and no leak */
html:not(.dark) { --ring: rgb(12 12 12); }
`;

// Appended (not imported), to measure the in-file block the ticket calls marker-fenced.
const APPENDED = `
/* 5. appended pair: plain selectors, last in the file */
:root { --secondary: rgb(9 9 9); }
.dark { --secondary: rgb(10 10 10); }

/* 6. appended light block only: the documented leak shape */
:root { --muted: rgb(11 11 11); }
`;

const WIN = `html:root { --primary: rgb(3 3 3); --border: rgb(3 3 3); }
html.dark { --primary: rgb(4 4 4); --border: rgb(4 4 4); }
`;

const arms = {
	carriers: CARRIERS,
	win: WIN,
	'win-edit': WIN,
	'empty-file': '',
	'import-only': null,
	'theme-rule': null,
	'raw-collision': `html:not(.dark) { --primary: rgb(3 3 3); }\n`,
	'raw-map': `html:not(.dark) { --color-primary: rgb(3 3 3); }\n`,
	'win-probe': WIN,
	fenced: null,
	'theme-drift': null,
	'missing-name': null
};
const WRITES_FILE = ['carriers', 'win', 'win-edit', 'empty-file', 'raw-collision', 'raw-map', 'win-probe'].includes(ARM);
const WRITES_IMPORT = WRITES_FILE || ARM === 'import-only';

if (!(ARM in arms)) throw new Error(`unknown arm ${ARM}`);

const components = JSON.parse(readFileSync('components.json', 'utf8'));
const cssPath = resolve(components.tailwind.css);
const cssDir = dirname(cssPath);
const sha = (text) => createHash('sha256').update(text).digest('hex');

if (ARM === 'theme-rule') {
	const themePath = resolve('src/daisyui-theme.css');
	const before = readFileSync(themePath, 'utf8');
	const withKey = before.replace(
		'--color-base-100: oklch(100% 0 0);',
		'--color-base-100: oklch(100% 0 0);\n\t--daisy-color-primary: rgb(22 22 22);'
	);
	if (withKey === before) throw new Error('no light block to add a key to');
	writeFileSync(themePath, `${withKey.trimEnd()}\n\nhtml:not(.dark) { --primary: rgb(21 21 21); }\n`);
	const stylesheet = readFileSync(cssPath, 'utf8');
	console.log(`[apply-14] arm=theme-rule theme=${themePath}`);
	console.log(`[apply-14] stylesheet untouched sha256=${sha(stylesheet)}`);
	process.exit(0);
}

if (ARM === 'theme-drift') {
	const themePath = resolve('src/daisyui-theme.css');
	const before = readFileSync(themePath, 'utf8');
	const after = before
		.replace('--color-primary: oklch(49% 0.118 165);', '--color-primary: rgb(12 34 56);')
		.replace('--color-primary: oklch(60% 0.13 166);', '--color-primary: rgb(65 43 21);');
	if (after === before) throw new Error('no --color-primary to edit in the theme');
	writeFileSync(themePath, after);
	const stylesheet = readFileSync(cssPath, 'utf8');
	console.log(`[apply-14] arm=theme-drift theme=${themePath}`);
	console.log(`[apply-14] stylesheet untouched sha256=${sha(stylesheet)}`);
	process.exit(0);
}

if (WRITES_FILE) {
	writeFileSync(join(cssDir, OVERRIDE), arms[ARM] ?? '');
}

let css = readFileSync(cssPath, 'utf8');
if (WRITES_IMPORT && !css.includes(IMPORT)) {
	const lines = css.split('\n');
	const last = lines.reduce((found, line, i) => (line.startsWith('@import ') ? i : found), -1);
	if (last === -1) throw new Error('no @import line in the stylesheet');
	lines.splice(last + 1, 0, IMPORT);
	css = lines.join('\n');
}
if (ARM === 'missing-name') {
	const edited = css.replace(
		'--primary: var(--daisy-color-primary);',
		'--primary: var(--daisy-color-no-such-name);'
	);
	if (edited === css) throw new Error('no light --primary declaration to rename');
	writeFileSync(cssPath, edited);
	console.log('[apply-14] arm=missing-name light --primary points at a name the plugin never emits');
	process.exit(0);
}

if (ARM === 'raw-collision') {
	const edited = css.replace(
		'--ring: var(--daisy-color-primary);',
		'--ring: var(--daisy-color-no-such-name, rgb(33 33 33));'
	);
	if (edited === css) throw new Error('no light --ring declaration to give a fallback');
	css = edited;
}
if (ARM === 'raw-map') {
	const edited = css.replace(
		'--primary: var(--daisy-color-primary);',
		'--primary: var(--color-primary);'
	);
	if (edited === css) throw new Error('no light --primary binding to point at the raw name');
	css = edited;
}
if (ARM === 'win-probe') {
	css = `${css.trimEnd()}\n\n:root {\n\t--probe-self: var(--daisy-color-primary, var(--probe-self));\n\t--probe-self-missing: var(--daisy-color-no-such-name, var(--probe-self-missing));\n}\n`;
}
if (ARM === 'carriers') css = `${css.trimEnd()}\n${APPENDED}`;
if (ARM === 'win-edit') {
	const edited = css.replaceAll('--ring: var(--daisy-color-primary);', '--ring: rgb(99 99 99);');
	if (edited === css) throw new Error('no --ring declaration to hand-edit');
	css = edited;
}
if (ARM === 'fenced') {
	const start = css.indexOf(':root {');
	if (start === -1) throw new Error('no :root block to fence');
	const end = css.indexOf('\n}', start);
	const fence = '\n\t/* ticket-14 fence */\n\t--primary: rgb(77 77 77);\n\t--info: rgb(88 88 88);';
	css = `${css.slice(0, end)}${fence}${css.slice(end)}`;
}
writeFileSync(cssPath, css);

console.log(`[apply-14] arm=${ARM} stylesheet=${components.tailwind.css}`);
if (WRITES_FILE) {
	console.log(`[apply-14] override=${join(cssDir, OVERRIDE)} sha256=${sha(arms[ARM] ?? '')}`);
}
if (ARM === 'import-only') {
	console.log('[apply-14] import line present, override file deliberately absent');
}
