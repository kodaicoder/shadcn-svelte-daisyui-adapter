// The one target manifest: the stock the fixer patches and the shadcn-svelte version it patches. The
// `stock` strings come from the pinned `src/lib/components/ui` snapshot; nine of the eleven sites
// match every 1.7.x style, so the style label is not part of the guard.
// `packages/daisyui-adapter/test/drift.mjs` fails when the pin moves without this list.
export const SUPPORTED = { version: { major: 1, minor: 7 } };

export const COMPONENTS = [
	'dialog',
	'sheet',
	'calendar',
	'range-calendar',
	'dropdown-menu',
	'context-menu',
	'menubar',
	'chart',
	'bubble'
];

export const SITES = [
	{
		id: 'dialog-close',
		component: 'dialog',
		file: 'dialog/dialog-content.svelte',
		stock: 'class="absolute top-5 right-5 bg-secondary"',
		fixed: 'class="absolute top-5 right-5 bg-muted"'
	},
	{
		id: 'sheet-close',
		component: 'sheet',
		file: 'sheet/sheet-content.svelte',
		stock: 'class="absolute top-4 right-4 bg-secondary"',
		fixed: 'class="absolute top-4 right-4 bg-muted"'
	},
	{
		id: 'calendar-hover',
		component: 'calendar',
		file: 'calendar/calendar-day.svelte',
		stock: 'not-data-selected:hover:bg-accent/50 not-data-selected:hover:text-accent-foreground',
		fixed: 'not-data-selected:hover:bg-accent not-data-selected:hover:text-accent-foreground'
	},
	{
		id: 'range-hover',
		component: 'range-calendar',
		file: 'range-calendar/range-calendar-day.svelte',
		stock: 'not-data-selected:hover:bg-accent/50 not-data-selected:hover:text-accent-foreground',
		fixed: 'not-data-selected:hover:bg-accent not-data-selected:hover:text-accent-foreground'
	},
	{
		id: 'range-middle',
		component: 'range-calendar',
		file: 'range-calendar/range-calendar-cell.svelte',
		stock: '[&:has([data-range-middle])]:bg-accent first:',
		fixed:
			'[&:has([data-range-middle])]:bg-accent [&:has([data-range-middle])]:text-accent-foreground first:'
	},
	{
		id: 'range-middle-hover',
		component: 'range-calendar',
		file: 'range-calendar/range-calendar-cell.svelte',
		stock: 'dark:[&:has([data-range-middle])]:hover:bg-accent/50 [&:has([data-range-start])]',
		fixed: 'dark:[&:has([data-range-middle])]:hover:bg-accent [&:has([data-range-start])]'
	},
	{
		id: 'dropdown-destructive',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-item.svelte',
		stock:
			'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive',
		fixed:
			'data-[variant=destructive]:text-destructive-text data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive-text data-[variant=destructive]:*:[svg]:text-destructive-text data-[variant=destructive]:[&_[data-slot=dropdown-menu-shortcut]]:text-destructive-text!'
	},
	{
		id: 'context-destructive',
		component: 'context-menu',
		file: 'context-menu/context-menu-item.svelte',
		stock:
			'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive',
		fixed:
			'data-[variant=destructive]:text-destructive-text data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive-text data-[variant=destructive]:*:[svg]:text-destructive-text data-[variant=destructive]:[&_[data-slot=context-menu-shortcut]]:text-destructive-text!'
	},
	{
		id: 'menubar-destructive',
		component: 'menubar',
		file: 'menubar/menubar-item.svelte',
		stock:
			'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive!',
		fixed:
			'data-[variant=destructive]:text-destructive-text data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive-text data-[variant=destructive]:*:[svg]:text-destructive-text! data-[variant=destructive]:[&_[data-slot=menubar-shortcut]]:text-destructive-text!'
	},
	{
		id: 'chart-tooltip-label',
		component: 'chart',
		file: 'chart/chart-tooltip.svelte',
		stock: '<span class="text-muted-foreground">',
		fixed: '<span class="text-foreground">'
	},
	{
		id: 'bubble-muted',
		component: 'bubble',
		file: 'bubble/bubble.svelte',
		stock:
			'*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]',
		fixed:
			'*:data-[slot=bubble-content]:bg-muted *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]'
	}
];

export const PAIRS = [
	{
		id: 'dialog-close',
		component: 'dialog',
		name: 'dialog close',
		threshold: 4.5,
		foreground: 'foreground',
		background: 'muted',
		sites: ['dialog-close']
	},
	{
		id: 'sheet-close',
		component: 'sheet',
		name: 'sheet close',
		threshold: 4.5,
		foreground: 'foreground',
		background: 'muted',
		sites: ['sheet-close']
	},
	{
		id: 'calendar-hover',
		component: 'calendar',
		name: 'calendar hover',
		threshold: 4.5,
		foreground: 'accent-foreground',
		background: 'accent',
		sites: ['calendar-hover']
	},
	{
		id: 'range-hover',
		component: 'range-calendar',
		name: 'range hover',
		threshold: 4.5,
		foreground: 'accent-foreground',
		background: 'accent',
		sites: ['range-hover']
	},
	{
		id: 'range-middle',
		component: 'range-calendar',
		name: 'range middle',
		threshold: 4.5,
		foreground: 'accent-foreground',
		background: 'accent',
		sites: ['range-middle', 'range-middle-hover']
	},
	{
		id: 'dropdown-destructive',
		component: 'dropdown-menu',
		name: 'dropdown destructive',
		threshold: 4.5,
		foreground: 'destructive-text',
		background: 'destructive/10',
		backgroundDark: 'destructive/20',
		sites: ['dropdown-destructive']
	},
	{
		id: 'context-destructive',
		component: 'context-menu',
		name: 'context destructive',
		threshold: 4.5,
		foreground: 'destructive-text',
		background: 'destructive/10',
		backgroundDark: 'destructive/20',
		sites: ['context-destructive']
	},
	{
		id: 'menubar-destructive',
		component: 'menubar',
		name: 'menubar destructive',
		threshold: 4.5,
		foreground: 'destructive-text',
		background: 'destructive/10',
		backgroundDark: 'destructive/20',
		sites: ['menubar-destructive']
	},
	{
		id: 'chart-tooltip-label',
		component: 'chart',
		name: 'chart tooltip',
		threshold: 4.5,
		foreground: 'foreground',
		background: 'background',
		sites: ['chart-tooltip-label']
	},
	{
		id: 'bubble-muted',
		component: 'bubble',
		name: 'bubble muted',
		threshold: 4.5,
		foreground: 'foreground',
		background: 'muted',
		sites: ['bubble-muted']
	}
];

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
		stock: 'dark:aria-invalid:border-destructive/50 rounded-none border border-transparent',
		fixed: 'dark:aria-invalid:border-destructive/50 rounded-md border border-transparent'
	},
	{
		id: 'button-xs',
		component: 'button',
		file: 'button/button.svelte',
		size: 'xs',
		step: 'sm',
		stock: 'xs: "h-7 gap-1 px-3',
		fixed: 'xs: "rounded-sm h-7 gap-1 px-3'
	},
	{
		id: 'button-sm',
		component: 'button',
		file: 'button/button.svelte',
		size: 'sm',
		step: 'sm',
		stock: 'sm: "h-9 gap-1 px-4',
		fixed: 'sm: "rounded-sm h-9 gap-1 px-4'
	},
	{
		id: 'button-lg',
		component: 'button',
		file: 'button/button.svelte',
		size: 'lg',
		step: 'lg',
		stock: 'lg: "h-11 gap-1.5 px-8',
		fixed: 'lg: "rounded-lg h-11 gap-1.5 px-8'
	},
	{
		id: 'button-icon-xs',
		component: 'button',
		file: 'button/button.svelte',
		size: 'icon-xs',
		step: 'sm',
		stock: `"icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3"`,
		fixed: `"icon-xs": "rounded-sm size-7 [&_svg:not([class*='size-'])]:size-3"`
	},
	{
		id: 'button-icon-sm',
		component: 'button',
		file: 'button/button.svelte',
		size: 'icon-sm',
		step: 'sm',
		stock: '"icon-sm": "size-9"',
		fixed: '"icon-sm": "rounded-sm size-9"'
	},
	{
		id: 'button-icon-lg',
		component: 'button',
		file: 'button/button.svelte',
		size: 'icon-lg',
		step: 'lg',
		stock: '"icon-lg": "size-11"',
		fixed: '"icon-lg": "rounded-lg size-11"'
	},
	{
		id: 'toggle-base',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		size: 'default',
		step: 'md',
		stock: 'gap-1.5 rounded-none text-xs font-semibold uppercase',
		fixed: 'gap-1.5 rounded-md text-xs font-semibold uppercase'
	},
	{
		id: 'toggle-sm',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		size: 'sm',
		step: 'sm',
		stock: 'sm: "h-9 min-w-9 px-4',
		fixed: 'sm: "rounded-sm h-9 min-w-9 px-4'
	},
	{
		id: 'toggle-lg',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		size: 'lg',
		step: 'lg',
		stock: 'lg: "h-11 min-w-11 px-8',
		fixed: 'lg: "rounded-lg h-11 min-w-11 px-8'
	},
	{
		id: 'input-field',
		component: 'input',
		file: 'input/input.svelte',
		role: 'field',
		step: 'md',
		stock: 'h-10 border px-0 py-1 text-base',
		fixed: 'h-10 rounded-md border px-0 py-1 text-base'
	},
	{
		id: 'textarea-field',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		role: 'field',
		step: 'md',
		stock: 'resize-none rounded-none border px-0 py-3 text-base',
		fixed: 'resize-none rounded-md border px-0 py-3 text-base'
	},
	{
		id: 'native-select-field',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		size: 'default',
		step: 'md',
		stock: 'appearance-none rounded-none border py-2 pr-8 pl-0 text-sm',
		fixed: 'appearance-none rounded-md data-[size=sm]:rounded-sm border py-2 pr-8 pl-0 text-sm'
	},
	{
		id: 'select-trigger-base',
		component: 'select',
		file: 'select/select-trigger.svelte',
		size: 'default',
		step: 'md',
		stock: 'gap-1.5 rounded-none border py-2 px-0 text-sm',
		fixed: 'gap-1.5 rounded-md data-[size=sm]:rounded-sm border py-2 px-0 text-sm'
	},
	{
		id: 'select-content-box',
		component: 'select',
		file: 'select/select-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-36 rounded-none shadow-md',
		fixed: 'min-w-36 rounded-lg shadow-md'
	},
	{
		id: 'select-item-field',
		component: 'select',
		file: 'select/select-item.svelte',
		role: 'field',
		step: 'md',
		stock: 'gap-2.5 rounded-none py-2 pr-8 pl-3 text-sm',
		fixed: 'gap-2.5 rounded-md py-2 pr-8 pl-3 text-sm'
	},
	{
		id: 'input-group-field',
		component: 'input-group',
		file: 'input-group/input-group.svelte',
		role: 'field',
		step: 'md',
		stock: 'h-10 rounded-none border',
		fixed: 'h-10 rounded-md border'
	},
	{
		id: 'input-group-block-end',
		component: 'input-group',
		file: 'input-group/input-group.svelte',
		role: 'field',
		step: 'md',
		stock: 'has-data-[align=block-end]:rounded-none',
		fixed: 'has-data-[align=block-end]:rounded-md'
	},
	{
		id: 'input-group-block-start',
		component: 'input-group',
		file: 'input-group/input-group.svelte',
		role: 'field',
		step: 'md',
		stock: 'has-data-[align=block-start]:rounded-none',
		fixed: 'has-data-[align=block-start]:rounded-md'
	},
	{
		id: 'input-group-textarea',
		component: 'input-group',
		file: 'input-group/input-group.svelte',
		role: 'field',
		step: 'md',
		stock: 'has-[textarea]:rounded-none',
		fixed: 'has-[textarea]:rounded-md'
	},
	{
		id: 'input-group-button-base',
		component: 'input-group-button',
		file: 'input-group/input-group-button.svelte',
		size: 'xs',
		step: 'sm',
		stock: 'gap-2 rounded-none text-sm flex',
		fixed: 'gap-2 rounded-sm text-sm flex'
	},
	{
		id: 'input-group-button-xs',
		component: 'input-group-button',
		file: 'input-group/input-group-button.svelte',
		size: 'xs',
		step: 'sm',
		stock: 'xs: "h-6 gap-1 rounded-none px-1.5',
		fixed: 'xs: "h-6 gap-1 rounded-sm px-1.5'
	},
	{
		id: 'input-group-addon-keycap',
		component: 'input-group',
		file: 'input-group/input-group-addon.svelte',
		role: 'selector',
		step: 'sm',
		stock: '**:data-[slot=kbd]:rounded-none',
		fixed: '**:data-[slot=kbd]:rounded-sm'
	},
	{
		id: 'checkbox-selector',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		role: 'selector',
		step: 'sm',
		stock: 'justify-center rounded-none border transition-shadow',
		fixed: 'justify-center rounded-sm border transition-shadow'
	},
	{
		id: 'switch-base',
		component: 'switch',
		file: 'switch/switch.svelte',
		size: 'default',
		step: 'md',
		stock: 'shrink-0 rounded-none focus-visible:ring-2',
		fixed: 'shrink-0 rounded-md data-[size=sm]:rounded-sm focus-visible:ring-2'
	}
];

export const KNOWN_COMPONENTS = [...new Set([...COMPONENTS, ...RADIUS_COMPONENTS])];

export const TARGETS = {
	supported: SUPPORTED,
	components: COMPONENTS,
	sites: SITES,
	pairs: PAIRS,
	radius: RADIUS,
	radiusComponents: RADIUS_COMPONENTS
};
