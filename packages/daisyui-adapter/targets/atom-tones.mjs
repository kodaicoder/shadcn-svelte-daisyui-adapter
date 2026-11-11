import { insertSite, replaceSite } from './site.mjs';

// The tone table for the atomic set. Every row is a literal string inside the fixed copy, because
// Tailwind only emits a class it can read in application source. The row follows the base class
// through `cn`, so it wins the merge without `!`, and a caller's own class still wins over it.
//
// Surfaces use the soft step, the way the alert rows do: 15 percent in light, 25 percent in dark.
// Indicators, lines and thumbs use the tone at full strength. The secondary tone swaps to
// `secondary-foreground` in light because `--secondary` is white there and would vanish; that is the
// same inversion the field border rows already carry.
export const ATOM_TONE_COMPONENTS = [
	'kbd',
	'separator',
	'skeleton',
	'spinner',
	'progress',
	'slider'
];

const TONE_TOKENS = {
	default: ['primary', 'primary'],
	secondary: ['secondary-foreground', 'secondary'],
	success: ['success', 'success'],
	warning: ['warning', 'warning'],
	info: ['info', 'info'],
	destructive: ['destructive', 'destructive'],
	blackwhite: ['blackwhite', 'blackwhite']
};

const TONE_KEYS = Object.keys(TONE_TOKENS);

// A tint has to clear the measured floor against the page, and a bright tone on white cannot reach
// the dark floor without turning into a solid block. 25 percent in light keeps every tone above 1.1
// to 1 on white; 30 percent in dark keeps every tone above 1.3 except destructive, whose dark token
// is itself dark, so it takes 50.
// A stroke, bar or thumb is a thin graphic with no text of its own, so it has to clear 3 to 1 on
// its own. The derived `-text` tokens are the ones built for that, and they are what the field
// borders already use; the raw tone is kept for surfaces, where the tint is the message, not the
// only signal.
const ACCENT_TOKENS = {
	default: ['primary', 'primary'],
	secondary: ['secondary-foreground', 'secondary'],
	success: ['success-text', 'success-text'],
	warning: ['warning-text', 'warning-text'],
	info: ['info-text', 'info-text'],
	destructive: ['destructive-text', 'destructive-text'],
	blackwhite: ['blackwhite', 'blackwhite']
};

const accentRows = (build) =>
	Object.fromEntries(TONE_KEYS.map((key) => [key, build(...ACCENT_TOKENS[key])]));

const SOFT_LIGHT = 25;
const SOFT_DARK = {
	default: 30,
	secondary: 30,
	success: 30,
	warning: 30,
	info: 30,
	destructive: 50,
	blackwhite: 30
};

const softRow = (tone) => {
	const [light, dark] = TONE_TOKENS[tone];
	return `bg-${light}/${SOFT_LIGHT} dark:bg-${dark}/${SOFT_DARK[tone]}`;
};

const solidRow = (light, dark) => (light === dark ? `bg-${light}` : `bg-${light} dark:bg-${dark}`);

const textRow = (light, dark) => (light === dark ? `text-${light}` : `text-${light} dark:text-${dark}`);

const rowsFor = (keys, build) =>
	Object.fromEntries(keys.map((key) => [key, build(...TONE_TOKENS[key], key)]));

const tableOf = (name, type, rows) =>
	[
		`\tconst ${name} = {`,
		...Object.entries(rows).map(([key, row]) => `\t\t${key}: "${row}",`),
		'\t} as const;',
		'',
		`\texport type ${type} = keyof typeof ${name};`
	].join('\n');

const moduleSite = (id, component, file, tables) =>
	insertSite({
		id,
		component,
		file,
		stock: '<script lang="ts">',
		fixed: `<script lang="ts" module>\n${tables.join('\n\n')}\n</script>\n\n<script lang="ts">`
	});

const variantPropSite = (id, component, file, before, fallback = 'default') =>
	insertSite({
		id,
		component,
		file,
		stock: before,
		fixed: `variant = "${fallback}",\n\t\t${before}`
	});

const variantTypeSite = (id, component, file, stock, typeName) =>
	replaceSite({
		id,
		component,
		file,
		stock,
		fixed: stock.replace(' = $props();', ` & { variant?: ${typeName} } = $props();`)
	});

const KBD_ROWS = rowsFor(
	TONE_KEYS,
	(light, dark, tone) =>
		`${softRow(tone)} text-foreground border-b-2 border-${light}/60 dark:border-${dark}/60 rounded-sm`
);

const NEUTRAL_SURFACE = 'bg-foreground/15 dark:bg-foreground/20';
const NEUTRAL_LINE = 'bg-foreground/20 dark:bg-foreground/25';

const SEPARATOR_ROWS = {
	neutral: NEUTRAL_LINE,
	...rowsFor(TONE_KEYS, (light, dark) => `bg-${light}/60 dark:bg-${dark}`)
};

const SKELETON_ROWS = {
	neutral: NEUTRAL_SURFACE,
	...rowsFor(TONE_KEYS, (light, dark, tone) => softRow(tone))
};

const SPINNER_ROWS = accentRows((light, dark) => textRow(light, dark));

const PROGRESS_ROWS = accentRows((light, dark) => solidRow(light, dark));

const SLIDER_ROWS = accentRows((light, dark) => solidRow(light, dark));

const SPINNER_SIZES = {
	sm: 'size-3',
	default: 'size-4',
	lg: 'size-6',
	xl: 'size-8'
};

const SLIDER_THUMB_STOCK =
	'class="size-3 border-none bg-primary transition-colors hover:ring-2 hover:ring-ring/30 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-hidden block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50"';

const SLIDER_THUMB_FIXED =
	'class={cn("size-3 border-none rounded-full transition-colors hover:ring-2 hover:ring-ring/30 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-hidden block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50", SLIDER_TONES[variant])}';

const SLIDER_RANGE_STOCK = `class={cn(
					"bg-primary absolute select-none data-horizontal:h-full data-vertical:w-full"
				)}`;

const SLIDER_RANGE_FIXED = `class={cn(
					"absolute select-none data-horizontal:h-full data-vertical:w-full",
					SLIDER_TONES[variant]
				)}`;

export const ATOM_TONES = [
	moduleSite('kbd-atom-tones', 'kbd', 'kbd/kbd.svelte', [
		tableOf('KBD_TONES', 'KbdVariant', KBD_ROWS)
	]),
	variantPropSite('kbd-atom-variant-prop', 'kbd', 'kbd/kbd.svelte', 'class: className,'),
	variantTypeSite(
		'kbd-atom-variant-type',
		'kbd',
		'kbd/kbd.svelte',
		'}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();',
		'KbdVariant'
	),
	replaceSite({
		id: 'kbd-atom-tone-class',
		component: 'kbd',
		file: 'kbd/kbd.svelte',
		stock: '",\n\t\tclassName',
		fixed: '",\n\t\tKBD_TONES[variant],\n\t\tclassName'
	}),

	moduleSite('separator-atom-tones', 'separator', 'separator/separator.svelte', [
		tableOf('SEPARATOR_TONES', 'SeparatorVariant', SEPARATOR_ROWS)
	]),
	variantPropSite(
		'separator-atom-variant-prop',
		'separator',
		'separator/separator.svelte',
		'"data-slot": dataSlot = "separator",',
		'neutral'
	),
	variantTypeSite(
		'separator-atom-variant-type',
		'separator',
		'separator/separator.svelte',
		'}: SeparatorPrimitive.RootProps = $props();',
		'SeparatorVariant'
	),
	replaceSite({
		id: 'separator-atom-surface',
		component: 'separator',
		file: 'separator/separator.svelte',
		stock: '"shrink-0 bg-border data-horizontal:h-px',
		fixed: '"shrink-0 data-horizontal:h-px'
	}),
	replaceSite({
		id: 'separator-atom-tone-class',
		component: 'separator',
		file: 'separator/separator.svelte',
		stock: '",\n\t\tclassName',
		fixed: '",\n\t\tSEPARATOR_TONES[variant],\n\t\tclassName'
	}),

	moduleSite('skeleton-atom-tones', 'skeleton', 'skeleton/skeleton.svelte', [
		tableOf('SKELETON_TONES', 'SkeletonVariant', SKELETON_ROWS)
	]),
	variantPropSite(
		'skeleton-atom-variant-prop',
		'skeleton',
		'skeleton/skeleton.svelte',
		'class: className,',
		'neutral'
	),
	variantTypeSite(
		'skeleton-atom-variant-type',
		'skeleton',
		'skeleton/skeleton.svelte',
		'}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> = $props();',
		'SkeletonVariant'
	),
	replaceSite({
		id: 'skeleton-atom-surface',
		component: 'skeleton',
		file: 'skeleton/skeleton.svelte',
		stock: 'class={cn("bg-muted animate-pulse", className)}',
		fixed: 'class={cn("animate-pulse", SKELETON_TONES[variant], className)}'
	}),

	moduleSite('spinner-atom-tones', 'spinner', 'spinner/spinner.svelte', [
		tableOf('SPINNER_TONES', 'SpinnerVariant', SPINNER_ROWS),
		[
			'\tconst SPINNER_SIZES = {',
			...Object.entries(SPINNER_SIZES).map(([key, value]) => `\t\t${key}: "${value}",`),
			'\t} as const;',
			'',
			'\texport type SpinnerSize = keyof typeof SPINNER_SIZES;'
		].join('\n')
	]),
	insertSite({
		id: 'spinner-atom-variant-prop',
		component: 'spinner',
		file: 'spinner/spinner.svelte',
		stock: '\t\trole = "status",',
		fixed: '\t\tvariant = "default",\n\t\tsize = "default",\n\t\trole = "status",'
	}),
	replaceSite({
		id: 'spinner-atom-variant-type',
		component: 'spinner',
		file: 'spinner/spinner.svelte',
		stock: '}: SVGAttributes<SVGSVGElement> = $props();',
		fixed:
			'}: SVGAttributes<SVGSVGElement> & { variant?: SpinnerVariant; size?: SpinnerSize } = $props();'
	}),
	replaceSite({
		id: 'spinner-atom-tone-class',
		component: 'spinner',
		file: 'spinner/spinner.svelte',
		stock: 'class={cn("size-4 animate-spin", className)}',
		fixed: 'class={cn("animate-spin", SPINNER_SIZES[size], SPINNER_TONES[variant], className)}'
	}),

	moduleSite('progress-atom-tones', 'progress', 'progress/progress.svelte', [
		tableOf('PROGRESS_TONES', 'ProgressVariant', PROGRESS_ROWS)
	]),
	variantPropSite('progress-atom-variant-prop', 'progress', 'progress/progress.svelte', 'max = 100,'),
	variantTypeSite(
		'progress-atom-variant-type',
		'progress',
		'progress/progress.svelte',
		'}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> = $props();',
		'ProgressVariant'
	),
	replaceSite({
		id: 'progress-atom-surface',
		component: 'progress',
		file: 'progress/progress.svelte',
		stock: '"bg-muted h-0.5 rounded-none relative',
		fixed: '"bg-foreground/15 dark:bg-foreground/20 h-0.5 rounded-none relative'
	}),
	replaceSite({
		id: 'progress-atom-tone-class',
		component: 'progress',
		file: 'progress/progress.svelte',
		stock: 'class="bg-primary size-full flex-1 transition-all"',
		fixed: 'class={cn("size-full flex-1 transition-all", PROGRESS_TONES[variant])}'
	}),

	moduleSite('slider-atom-tones', 'slider', 'slider/slider.svelte', [
		tableOf('SLIDER_TONES', 'SliderVariant', SLIDER_ROWS)
	]),
	variantPropSite('slider-atom-variant-prop', 'slider', 'slider/slider.svelte', 'class: className,'),
	variantTypeSite(
		'slider-atom-variant-type',
		'slider',
		'slider/slider.svelte',
		'}: WithoutChildrenOrChild<SliderPrimitive.RootProps> = $props();',
		'SliderVariant'
	),
	replaceSite({
		id: 'slider-atom-surface',
		component: 'slider',
		file: 'slider/slider.svelte',
		stock: '"bg-input/50 data-horizontal:h-0.5',
		fixed: '"bg-foreground/15 dark:bg-foreground/20 data-horizontal:h-0.5'
	}),
	replaceSite({
		id: 'slider-atom-range-tone',
		component: 'slider',
		file: 'slider/slider.svelte',
		stock: SLIDER_RANGE_STOCK,
		fixed: SLIDER_RANGE_FIXED
	}),
	replaceSite({
		id: 'slider-atom-thumb-tone',
		component: 'slider',
		file: 'slider/slider.svelte',
		stock: SLIDER_THUMB_STOCK,
		fixed: SLIDER_THUMB_FIXED
	}),

	// The scrollbar thumb is a shape, not a tone: a scroller reads the same in every tone.
	replaceSite({
		id: 'scroll-area-thumb-shape',
		component: 'scroll-area',
		file: 'scroll-area/scroll-area-scrollbar.svelte',
		stock: 'class="rounded-none relative flex-1 bg-border"',
		fixed: 'class="rounded-full relative flex-1 bg-foreground/25 dark:bg-foreground/30"'
	}),

	// A marker's hairlines and bottom edge paint `--border` today, which sits on the dark page.
	replaceSite({
		id: 'marker-hairline-before',
		component: 'marker',
		file: 'marker/marker.svelte',
		stock: 'before:bg-border',
		fixed: 'before:bg-foreground/25'
	}),
	replaceSite({
		id: 'marker-hairline-after',
		component: 'marker',
		file: 'marker/marker.svelte',
		stock: 'after:bg-border',
		fixed: 'after:bg-foreground/25'
	}),
	replaceSite({
		id: 'marker-border-edge',
		component: 'marker',
		file: 'marker/marker.svelte',
		stock: 'border-b border-border pb-2',
		fixed: 'border-b border-foreground/25 pb-2'
	})
];
