import { insertSite, replaceSite } from './site.mjs';

// The three fields share one tone table. Each row is literal inside the fixed copy because Tailwind
// only emits a class it can read in application source. The row follows the base class through `cn`,
// so it wins the border and ring merge without `!`. On input and textarea a caller's class still wins;
// native-select applies the caller's class to its wrapper.
export const FIELD_VARIANT_COMPONENTS = ['input', 'textarea', 'native-select'];

const TONES = {
	default: 'border-primary focus-visible:border-primary focus-visible:ring-primary/30',
	secondary:
		'border-secondary-foreground dark:border-secondary focus-visible:border-secondary-foreground dark:focus-visible:border-secondary focus-visible:ring-secondary/30',
	success: 'border-success-text focus-visible:border-success-text focus-visible:ring-success/30',
	warning: 'border-warning-text focus-visible:border-warning-text focus-visible:ring-warning/30',
	info: 'border-info-text focus-visible:border-info-text focus-visible:ring-info/30',
	destructive:
		'border-destructive-text focus-visible:border-destructive-text focus-visible:ring-destructive/30',
	blackwhite: 'border-blackwhite focus-visible:border-blackwhite focus-visible:ring-blackwhite/30'
};

const TONE_MAP = [
	'\tconst FIELD_TONES = {',
	...Object.entries(TONES).map(([tone, row]) => `\t\t${tone}: "${row}",`),
	'\t} as const;',
	'',
	'\texport type FieldVariant = keyof typeof FIELD_TONES;'
].join('\n');

// The tone table and its type live in a module script: Svelte rejects `export type` in the instance
// script, and a module binding is still visible to the component and its template.
const toneMapSite = (component, file) =>
	insertSite({
		id: `${component}-field-tones`,
		component,
		file,
		stock: '<script lang="ts">',
		fixed: `<script lang="ts" module>\n${TONE_MAP}\n</script>\n\n<script lang="ts">`
	});

// Each stock is text the pinned file already holds and that the size table leaves in place. The size
// table writes `size` in the same run, so a stock that names it would not exist when this table runs.
const variantPropSite = (component, file, stock) =>
	insertSite({
		id: `${component}-field-variant-prop`,
		component,
		file,
		stock,
		fixed: `variant = "default",\n\t\t${stock}`
	});

const disabledSite = (component, file) =>
	replaceSite({
		id: `${component}-disabled-cursor`,
		component,
		file,
		stock: 'disabled:pointer-events-none disabled:cursor-not-allowed',
		fixed: 'disabled:cursor-not-allowed'
	});

const readonlySite = (component, file, stock) =>
	replaceSite({
		id: `${component}-readonly-surface`,
		component,
		file,
		stock,
		// The dark twin outranks the base `dark:bg-input/30`; without it the muted surface loses in dark.
		fixed: `transition-colors read-only:cursor-default read-only:bg-muted/50 dark:read-only:bg-muted/50 ${stock.replace('transition-colors ', '')}`
	});

export const FIELD_VARIANTS = [
	toneMapSite('input', 'input/input.svelte'),
	variantPropSite('input', 'input/input.svelte', 'files = $bindable(),'),
	replaceSite({
		id: 'input-field-variant-type',
		component: 'input',
		file: 'input/input.svelte',
		stock: '\t>;',
		fixed: '\t> & { variant?: FieldVariant };'
	}),
	replaceSite({
		id: 'input-field-tone-class',
		component: 'input',
		file: 'input/input.svelte',
		stock: '",\n\t\t\tclassName',
		fixed: '",\n\t\t\tFIELD_TONES[variant],\n\t\t\tclassName'
	}),
	disabledSite('input', 'input/input.svelte'),
	readonlySite('input', 'input/input.svelte', 'transition-colors file:h-6'),

	toneMapSite('textarea', 'textarea/textarea.svelte'),
	variantPropSite('textarea', 'textarea/textarea.svelte', 'class: className,'),
	insertSite({
		id: 'textarea-field-variant-type',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		stock: ' = $props();',
		fixed: ' & { variant?: FieldVariant } = $props();'
	}),
	replaceSite({
		id: 'textarea-field-tone-class',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		stock: '",\n\t\tclassName',
		fixed: '",\n\t\tFIELD_TONES[variant],\n\t\tclassName'
	}),
	readonlySite('textarea', 'textarea/textarea.svelte', 'transition-colors focus-visible:ring-2'),

	toneMapSite('native-select', 'native-select/native-select.svelte'),
	variantPropSite('native-select', 'native-select/native-select.svelte', 'children,'),
	insertSite({
		id: 'native-select-field-variant-type',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		stock: 'Omit<WithElementRef<HTMLSelectAttributes, HTMLSelectElement>, "size">',
		fixed:
			'Omit<WithElementRef<HTMLSelectAttributes, HTMLSelectElement>, "size"> & { variant?: FieldVariant }'
	}),
	// The select class spans `rounded-md`, which belongs to the radius table. Opening the `cn` call
	// and closing it after the class keep this row independent of the radius anchor.
	replaceSite({
		id: 'native-select-field-tone-open',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		stock: 'data-size={size}\n\t\tclass="',
		fixed: 'data-size={size}\n\t\tclass={cn("'
	}),
	replaceSite({
		id: 'native-select-field-tone-close',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		stock: '"\n\t\t{...restProps}',
		fixed: '", FIELD_TONES[variant])}\n\t\t{...restProps}'
	}),
	disabledSite('native-select', 'native-select/native-select.svelte'),
	replaceSite({
		id: 'native-select-disabled-hover',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		stock: 'dark:hover:bg-input/50',
		fixed: 'dark:enabled:hover:bg-input/50'
	})
];
