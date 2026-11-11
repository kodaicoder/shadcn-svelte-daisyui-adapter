import { replaceSite } from './site.mjs';

// The radius table is separate from SITES so the contrast fixtures and their counts stay unchanged.
// Every entry writes the radius for one site in one file: usually a `rounded-none` replacement, an
// insertion where the stock class is absent (`input`), or a size-variant class (`button`, `toggle`).
// The step comes from exactly one of `role` or `size`, never both, and a default-size entry may add
// the `data-[size=sm]` override in the same string.
// `radio-group` is a named component with no site because its item and dot are `rounded-full`, which
// this table never touches.
export const RADIUS_COMPONENTS = [
	'button',
	'toggle',
	'input',
	'textarea',
	'native-select',
	'select',
	'input-group',
	'input-group-button',
	'checkbox',
	'radio-group',
	'switch'
];

export const ROLE_STEPS = { selector: 'sm', field: 'md', box: 'lg' };
// The full size contract from the spec, including a name no current site uses (`md`), so a new site
// cannot invent a step.
export const SIZE_STEPS = {
	xs: 'sm',
	sm: 'sm',
	'icon-xs': 'sm',
	'icon-sm': 'sm',
	default: 'md',
	md: 'md',
	icon: 'md',
	lg: 'lg',
	'icon-lg': 'lg'
};

export const RADIUS = [
	{
		id: 'button-base',
		component: 'button',
		file: 'button/button.svelte',
		size: 'default',
		step: 'md',
		stock: 'dark:aria-invalid:border-destructive/50 rounded-md border border-transparent',
		fixed: 'dark:aria-invalid:border-destructive/50 rounded-md border border-transparent'
	},
	{
		id: 'button-xs',
		component: 'button',
		file: 'button/button.svelte',
		size: 'xs',
		step: 'sm',
		stock: 'xs: "h-5 gap-1 rounded-sm px-2',
		fixed: 'xs: "h-5 gap-1 rounded-sm px-2'
	},
	{
		id: 'button-sm',
		component: 'button',
		file: 'button/button.svelte',
		size: 'sm',
		step: 'sm',
		stock: 'sm: "h-6 gap-1 px-2',
		fixed: 'sm: "rounded-sm h-6 gap-1 px-2'
	},
	{
		id: 'button-lg',
		component: 'button',
		file: 'button/button.svelte',
		size: 'lg',
		step: 'lg',
		stock: 'lg: "h-8 gap-1 px-2.5',
		fixed: 'lg: "rounded-lg h-8 gap-1 px-2.5'
	},
	{
		id: 'button-icon-xs',
		component: 'button',
		file: 'button/button.svelte',
		size: 'icon-xs',
		step: 'sm',
		stock: '"icon-xs": "size-5 rounded-sm',
		fixed: '"icon-xs": "size-5 rounded-sm'
	},
	{
		id: 'button-icon-sm',
		component: 'button',
		file: 'button/button.svelte',
		size: 'icon-sm',
		step: 'sm',
		stock: '"icon-sm": "size-6',
		fixed: '"icon-sm": "rounded-sm size-6'
	},
	{
		id: 'button-icon-lg',
		component: 'button',
		file: 'button/button.svelte',
		size: 'icon-lg',
		step: 'lg',
		stock: '"icon-lg": "size-8',
		fixed: '"icon-lg": "rounded-lg size-8'
	},
	{
		id: 'toggle-base',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		size: 'default',
		step: 'md',
		stock: 'gap-1 rounded-md text-xs font-medium',
		fixed: 'gap-1 rounded-md text-sm font-medium'
	},
	{
		id: 'toggle-sm',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		size: 'sm',
		step: 'sm',
		stock: 'sm: "h-6 min-w-6 rounded-[min(var(--radius-md),8px)] px-2',
		fixed: 'sm: "h-6 min-w-6 rounded-sm px-2'
	},
	{
		id: 'toggle-lg',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		size: 'lg',
		step: 'lg',
		stock: 'lg: "h-8 min-w-8 px-2.5',
		fixed: 'lg: "rounded-lg h-8 min-w-8 px-2.5'
	},
	{
		id: 'input-field',
		component: 'input',
		file: 'input/input.svelte',
		size: 'default',
		step: 'md',
		stock: 'h-7 rounded-md border px-2 py-0.5',
		fixed: 'h-7 rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg border px-2 py-0.5'
	},
	{
		id: 'textarea-field',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		size: 'default',
		step: 'md',
		stock: 'resize-none rounded-md border px-2 py-2',
		fixed:
			'resize-none rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg border px-2 py-2'
	},
	{
		id: 'native-select-field',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		size: 'default',
		step: 'md',
		stock: 'appearance-none rounded-md border py-0.5 pr-6 pl-2',
		fixed:
			'appearance-none rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg border py-0.5 pr-6 pl-2'
	},
	{
		id: 'select-trigger-base',
		component: 'select',
		file: 'select/select-trigger.svelte',
		size: 'default',
		step: 'md',
		stock: 'gap-1.5 rounded-md border px-2 py-1.5',
		fixed: 'gap-1.5 rounded-md data-[size=sm]:rounded-sm border px-2 py-1.5'
	},
	{
		id: 'select-content-box',
		component: 'select',
		file: 'select/select-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-lg shadow-md ring-1',
		fixed: 'min-w-32 rounded-lg shadow-md ring-1'
	},
	{
		id: 'select-item-field',
		component: 'select',
		file: 'select/select-item.svelte',
		role: 'field',
		step: 'md',
		stock: 'min-h-7 gap-2 rounded-md px-2 py-1',
		fixed: 'min-h-7 gap-2 rounded-md px-2 py-1'
	},
	{
		id: 'input-group-field',
		component: 'input-group',
		file: 'input-group/input-group.svelte',
		role: 'field',
		step: 'md',
		stock: 'h-7 rounded-md border transition-colors',
		fixed: 'h-7 rounded-md border transition-colors'
	},
	{
		id: 'input-group-block-end',
		component: 'input-group',
		file: 'input-group/input-group.svelte',
		role: 'field',
		step: 'md',
		stock: 'has-data-[align=block-end]:rounded-md',
		fixed: 'has-data-[align=block-end]:rounded-md'
	},
	{
		id: 'input-group-block-start',
		component: 'input-group',
		file: 'input-group/input-group.svelte',
		role: 'field',
		step: 'md',
		stock: 'has-data-[align=block-start]:rounded-md',
		fixed: 'has-data-[align=block-start]:rounded-md'
	},
	{
		id: 'input-group-textarea',
		component: 'input-group',
		file: 'input-group/input-group.svelte',
		role: 'field',
		step: 'md',
		stock: 'has-[textarea]:rounded-md',
		fixed: 'has-[textarea]:rounded-md'
	},
	{
		id: 'input-group-button-base',
		component: 'input-group-button',
		file: 'input-group/input-group-button.svelte',
		size: 'xs',
		step: 'sm',
		stock: 'gap-2 rounded-md text-xs/relaxed flex',
		fixed: 'gap-2 rounded-sm text-sm/relaxed flex'
	},
	{
		id: 'input-group-button-xs',
		component: 'input-group-button',
		file: 'input-group/input-group-button.svelte',
		size: 'xs',
		step: 'sm',
		stock: 'h-5 gap-1 rounded-[calc(var(--radius-sm)_-_2px)] px-1',
		fixed: 'h-5 gap-1 rounded-sm px-1'
	},
	{
		id: 'input-group-addon-keycap',
		component: 'input-group',
		file: 'input-group/input-group-addon.svelte',
		role: 'selector',
		step: 'sm',
		stock: '**:data-[slot=kbd]:rounded-[calc(var(--radius-sm)_-_2px)]',
		fixed: '**:data-[slot=kbd]:rounded-sm'
	},
	{
		id: 'checkbox-selector',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		role: 'selector',
		step: 'sm',
		stock: 'justify-center rounded-[4px] border transition-shadow',
		fixed: 'justify-center rounded-sm border transition-shadow'
	},
	{
		id: 'switch-base',
		component: 'switch',
		file: 'switch/switch.svelte',
		size: 'default',
		step: 'md',
		stock: 'shrink-0 rounded-full border border-transparent',
		fixed: 'shrink-0 border border-transparent rounded-full'
	}
].map(replaceSite);
