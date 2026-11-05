// The one list that drives both the plugin and the CLI, so a renamed key cannot become an invalid
// token. Ticket 09 (surfaces), 10 (sidebar rungs) and 11 (radius) settled the rows; ticket 12
// settled that the chart ramp is computed, not assigned, so chart-1..5 are absent here on purpose
// and are written by the CLI from ramp.mjs.
//
// 0.3.0 maps secondary and accent to daisyUI's brand tokens, overriding 09's surface-first rows at
// the operator's request. Both are surfaces in shadcn, so the components that paint with them need
// a visual check; ticket 23 records the measured pairs.

export const COLOR_SOURCES = [
	'base-100',
	'base-200',
	'base-300',
	'base-content',
	'primary',
	'primary-content',
	'secondary',
	'secondary-content',
	'accent',
	'accent-content',
	'neutral',
	'neutral-content',
	'info',
	'info-content',
	'success',
	'success-content',
	'warning',
	'warning-content',
	'error',
	'error-content'
];

// A single row is a direct read of one daisyUI source. `radius` reads the CLI's scalar binding.
export const SINGLE = {
	background: { source: 'base-100' },
	foreground: { source: 'base-content' },
	card: { source: 'base-100' },
	'card-foreground': { source: 'base-content' },
	popover: { source: 'base-100' },
	'popover-foreground': { source: 'base-content' },
	primary: { source: 'primary' },
	'primary-foreground': { source: 'primary-content' },
	secondary: { source: 'secondary' },
	'secondary-foreground': { source: 'secondary-content' },
	muted: { source: 'base-200' },
	accent: { source: 'accent' },
	'accent-foreground': { source: 'accent-content' },
	destructive: { source: 'error' },
	'destructive-foreground': { source: 'error-content' },
	success: { source: 'success' },
	'success-foreground': { source: 'success-content' },
	warning: { source: 'warning' },
	'warning-foreground': { source: 'warning-content' },
	info: { source: 'info' },
	'info-foreground': { source: 'info-content' },
	ring: { source: 'primary' },
	sidebar: { source: 'base-200' },
	'sidebar-foreground': { source: 'base-content' },
	'sidebar-primary': { source: 'primary' },
	'sidebar-primary-foreground': { source: 'primary-content' },
	'sidebar-accent': { source: 'base-300' },
	'sidebar-accent-foreground': { source: 'base-content' },
	'sidebar-ring': { source: 'primary' },
	radius: { scalar: 'radius' }
};

// A text tone is a status tone mixed toward the page foreground, because the raw tone reads below AA as
// text and stays the fill.
export const TEXT_TONE = {
	'success-text': ['success', 40, 'foreground', 60],
	'warning-text': ['warning', 40, 'foreground', 60],
	'info-text': ['info', 40, 'foreground', 60],
	'destructive-text': ['destructive', 40, 'foreground', 60]
};

export const TEXT_TONE_KEYS = Object.keys(TEXT_TONE);

export const textToneValue = (key) => {
	const row = TEXT_TONE[key];
	if (!row) throw new Error(`[daisyui-adapter] no text-tone row for ${key}`);
	return `color-mix(in oklch, var(--${row[0]}) ${row[1]}%, var(--${row[2]}) ${row[3]}%)`;
};

// Tokens the stock stylesheet does not have. Each value is the fallback its binding renders with when
// no theme is present, and each key also needs a `@theme inline` alias.
export const TOKEN_FALLBACKS = {
	'destructive-foreground': 'oklch(97% 0.013 17.38)',
	success: 'oklch(69% 0.17 162.48)',
	'success-foreground': 'oklch(26% 0.051 172.552)',
	warning: 'oklch(79% 0.184 86.047)',
	'warning-foreground': 'oklch(28% 0.066 53.813)',
	info: 'oklch(74% 0.16 232.661)',
	'info-foreground': 'oklch(29% 0.066 243.157)',
	...Object.fromEntries(TEXT_TONE_KEYS.map((key) => [key, textToneValue(key)]))
};

// A tone with no daisyUI source: the pair is fixed per scheme, so the CLI writes the literal rather
// than a `var(--daisy-color-*)` reference. The names are part of the theme contract, like the other
// `--<tone>` keys.
export const STATIC_TOKENS = {
	light: {
		blackwhite: 'oklch(20% 0.042 265.755)',
		'blackwhite-foreground': 'oklch(96% 0.007 247.896)'
	},
	dark: {
		blackwhite: 'oklch(98% 0.002 247.839)',
		'blackwhite-foreground': 'oklch(13% 0.028 261.692)'
	}
};

// A mix row is a derivation over two sources. Values stay opaque: Tailwind's opacity modifiers
// multiply alpha, so any alpha baked in here would be wrong at every use site.
const MIX = {
	'muted-foreground': ['base-content', 62, 'base-100'],
	border: ['base-content', 10, 'base-100'],
	input: ['base-content', 15, 'base-100'],
	'sidebar-border': ['base-content', 10, 'base-100']
};

export const MIX_KEYS = Object.keys(MIX);

// The colour source a mix row reads, so the plugin can emit exactly the bindings the map needs.
export const mixSources = (key) => {
	const row = MIX[key];
	return row ? [row[0], row[2]] : [];
};

export const mixValue = (key, colorVar) => {
	const row = MIX[key];
	if (!row) throw new Error(`[daisyui-adapter] no mix row for ${key}`);
	return `color-mix(in oklch, var(${colorVar(row[0])}) ${row[1]}%, var(${colorVar(row[2])}))`;
};

export const isSingle = (key) => key in SINGLE;
export const isMix = (key) => key in MIX;

// Every binding key the CLI writes into each block, in a stable order.
export const BINDING_KEYS = [...Object.keys(SINGLE), ...MIX_KEYS, ...TEXT_TONE_KEYS];
