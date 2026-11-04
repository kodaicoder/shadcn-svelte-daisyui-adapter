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

// The surface table: every box that holds content, so it takes the box step (`lg`). Each entry is a
// `rounded-none` replacement, an insertion where the stock class is absent, or the calendar
// head/select alignment. `navigation-menu-indicator` is the edge-joining pointer and stays
// `rounded-none`; the `range-calendar` mirrors are out of scope; the calendar `--cell-radius` day
// cells are not surface sites.
export const SURFACE_COMPONENTS = [
	'card',
	'dialog',
	'alert',
	'popover',
	'dropdown-menu',
	'context-menu',
	'menubar',
	'sheet',
	'drawer',
	'navigation-menu',
	'command',
	'hover-card',
	'table',
	'calendar'
];

export const SURFACES = [
	{
		id: 'card-image',
		component: 'card',
		file: 'card/card.svelte',
		role: 'box',
		step: 'lg',
		stock: '*:[img:first-child]:rounded-none *:[img:last-child]:rounded-none',
		fixed: '*:[img:first-child]:rounded-lg *:[img:last-child]:rounded-lg'
	},
	{
		id: 'card-header',
		component: 'card',
		file: 'card/card-header.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-1.5 rounded-none px-(--card-spacing)',
		fixed: 'gap-1.5 rounded-lg px-(--card-spacing)'
	},
	{
		id: 'dialog-content',
		component: 'dialog',
		file: 'dialog/dialog-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-6 rounded-none p-6',
		fixed: 'gap-6 rounded-lg p-6'
	},
	{
		id: 'alert-base',
		component: 'alert',
		file: 'alert/alert.svelte',
		role: 'box',
		step: 'lg',
		stock: 'grid gap-1 bg-background border',
		fixed: 'grid gap-1 rounded-lg bg-background border'
	},
	{
		id: 'popover-content',
		component: 'popover',
		file: 'popover/popover-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'flex flex-col gap-4 rounded-none p-4',
		fixed: 'flex flex-col gap-4 rounded-lg p-4'
	},
	{
		id: 'dropdown-content',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-48 rounded-none p-1.5',
		fixed: 'min-w-48 rounded-lg p-1.5'
	},
	{
		id: 'dropdown-sub-content',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-sub-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-36 rounded-none p-1.5',
		fixed: 'min-w-36 rounded-lg p-1.5'
	},
	{
		id: 'dropdown-item',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none px-3 py-2',
		fixed: 'gap-2.5 rounded-lg px-3 py-2'
	},
	{
		id: 'dropdown-checkbox-item',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-checkbox-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none py-2 pr-8 pl-3',
		fixed: 'gap-2.5 rounded-lg py-2 pr-8 pl-3'
	},
	{
		id: 'dropdown-radio-item',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-radio-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none py-2 pr-8 pl-3',
		fixed: 'gap-2.5 rounded-lg py-2 pr-8 pl-3'
	},
	{
		id: 'dropdown-sub-trigger',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-sub-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2 rounded-none px-3 py-2',
		fixed: 'gap-2 rounded-lg px-3 py-2'
	},
	{
		id: 'context-content',
		component: 'context-menu',
		file: 'context-menu/context-menu-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-48 rounded-none p-1.5',
		fixed: 'min-w-48 rounded-lg p-1.5'
	},
	{
		id: 'context-sub-content',
		component: 'context-menu',
		file: 'context-menu/context-menu-sub-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-none p-1.5',
		fixed: 'min-w-32 rounded-lg p-1.5'
	},
	{
		id: 'context-item',
		component: 'context-menu',
		file: 'context-menu/context-menu-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none px-3 py-2',
		fixed: 'gap-2.5 rounded-lg px-3 py-2'
	},
	{
		id: 'context-checkbox-item',
		component: 'context-menu',
		file: 'context-menu/context-menu-checkbox-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none py-2 pr-8 pl-3',
		fixed: 'gap-2.5 rounded-lg py-2 pr-8 pl-3'
	},
	{
		id: 'context-radio-item',
		component: 'context-menu',
		file: 'context-menu/context-menu-radio-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none py-2 pr-8 pl-3',
		fixed: 'gap-2.5 rounded-lg py-2 pr-8 pl-3'
	},
	{
		id: 'context-sub-trigger',
		component: 'context-menu',
		file: 'context-menu/context-menu-sub-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'rounded-none px-3 py-2 text-xs',
		fixed: 'rounded-lg px-3 py-2 text-xs'
	},
	{
		id: 'menubar-root',
		component: 'menubar',
		file: 'menubar/menubar.svelte',
		role: 'box',
		step: 'lg',
		stock: 'h-10 rounded-none border p-1',
		fixed: 'h-10 rounded-lg border p-1'
	},
	{
		id: 'menubar-trigger',
		component: 'menubar',
		file: 'menubar/menubar-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'aria-expanded:bg-muted rounded-none px-2 py-0.75',
		fixed: 'aria-expanded:bg-muted rounded-lg px-2 py-0.75'
	},
	{
		id: 'menubar-content',
		component: 'menubar',
		file: 'menubar/menubar-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-48 rounded-none p-1.5',
		fixed: 'min-w-48 rounded-lg p-1.5'
	},
	{
		id: 'menubar-sub-content',
		component: 'menubar',
		file: 'menubar/menubar-sub-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-none p-1.5',
		fixed: 'min-w-32 rounded-lg p-1.5'
	},
	{
		id: 'menubar-item',
		component: 'menubar',
		file: 'menubar/menubar-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none px-3 py-2',
		fixed: 'gap-2.5 rounded-lg px-3 py-2'
	},
	{
		id: 'menubar-checkbox-item',
		component: 'menubar',
		file: 'menubar/menubar-checkbox-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none py-2 pr-3 pl-9.5',
		fixed: 'gap-2.5 rounded-lg py-2 pr-3 pl-9.5'
	},
	{
		id: 'menubar-radio-item',
		component: 'menubar',
		file: 'menubar/menubar-radio-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2.5 rounded-none py-2 pr-3 pl-9.5',
		fixed: 'gap-2.5 rounded-lg py-2 pr-3 pl-9.5'
	},
	{
		id: 'menubar-sub-trigger',
		component: 'menubar',
		file: 'menubar/menubar-sub-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-2 rounded-none px-3 py-2',
		fixed: 'gap-2 rounded-lg px-3 py-2'
	},
	{
		id: 'sheet-content',
		component: 'sheet',
		file: 'sheet/sheet-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'bg-popover text-popover-foreground fixed z-50',
		fixed: 'bg-popover text-popover-foreground rounded-lg fixed z-50'
	},
	{
		id: 'drawer-bottom',
		component: 'drawer',
		file: 'drawer/drawer-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'data-[vaul-drawer-direction=bottom]:rounded-none',
		fixed: 'data-[vaul-drawer-direction=bottom]:rounded-lg'
	},
	{
		id: 'drawer-left',
		component: 'drawer',
		file: 'drawer/drawer-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'data-[vaul-drawer-direction=left]:rounded-none',
		fixed: 'data-[vaul-drawer-direction=left]:rounded-lg'
	},
	{
		id: 'drawer-right',
		component: 'drawer',
		file: 'drawer/drawer-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'data-[vaul-drawer-direction=right]:rounded-none',
		fixed: 'data-[vaul-drawer-direction=right]:rounded-lg'
	},
	{
		id: 'drawer-top',
		component: 'drawer',
		file: 'drawer/drawer-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'data-[vaul-drawer-direction=top]:rounded-none',
		fixed: 'data-[vaul-drawer-direction=top]:rounded-lg'
	},
	{
		id: 'drawer-handle',
		component: 'drawer',
		file: 'drawer/drawer-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'shrink-0 rounded-none mx-auto hidden shrink-0',
		fixed: 'shrink-0 rounded-lg mx-auto hidden shrink-0'
	},
	{
		id: 'nav-content',
		component: 'navigation-menu',
		file: 'navigation-menu/navigation-menu-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'group-data-[viewport=false]/navigation-menu:rounded-none',
		fixed: 'group-data-[viewport=false]/navigation-menu:rounded-lg'
	},
	{
		id: 'nav-viewport',
		component: 'navigation-menu',
		file: 'navigation-menu/navigation-menu-viewport.svelte',
		role: 'box',
		step: 'lg',
		stock: 'ring-foreground/10 rounded-none shadow-md ring-1',
		fixed: 'ring-foreground/10 rounded-lg shadow-md ring-1'
	},
	{
		id: 'nav-link',
		component: 'navigation-menu',
		file: 'navigation-menu/navigation-menu-link.svelte',
		role: 'box',
		step: 'lg',
		stock: `rounded-none p-3 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-3.5 in-data-[slot=navigation-menu-content]:rounded-none`,
		fixed: `rounded-lg p-3 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-3.5 in-data-[slot=navigation-menu-content]:rounded-lg`
	},
	{
		id: 'nav-trigger',
		component: 'navigation-menu',
		file: 'navigation-menu/navigation-menu-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'data-popup-open:hover:bg-muted rounded-none px-4.5 py-2.5',
		fixed: 'data-popup-open:hover:bg-muted rounded-lg px-4.5 py-2.5'
	},
	{
		id: 'command-root',
		component: 'command',
		file: 'command/command.svelte',
		role: 'box',
		step: 'lg',
		stock: 'bg-popover text-popover-foreground flex size-full flex-col overflow-hidden',
		fixed: 'bg-popover text-popover-foreground rounded-lg flex size-full flex-col overflow-hidden'
	},
	{
		id: 'command-item',
		component: 'command',
		file: 'command/command-item.svelte',
		role: 'box',
		step: 'lg',
		stock: `gap-2 rounded-none px-3 py-2 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-none`,
		fixed: `gap-2 rounded-lg px-3 py-2 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg`
	},
	{
		id: 'command-link-item',
		component: 'command',
		file: 'command/command-link-item.svelte',
		role: 'box',
		step: 'lg',
		stock: `gap-2 rounded-none px-3 py-2 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-none`,
		fixed: `gap-2 rounded-lg px-3 py-2 text-sm outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg`
	},
	{
		id: 'hover-card-content',
		component: 'hover-card',
		file: 'hover-card/hover-card-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'ring-foreground/10 bg-popover text-popover-foreground w-72',
		fixed: 'ring-foreground/10 bg-popover text-popover-foreground rounded-lg w-72'
	},
	{
		id: 'table-surface',
		component: 'table',
		file: 'table/table.svelte',
		role: 'box',
		step: 'lg',
		stock: 'cn("w-full caption-bottom text-sm"',
		fixed: 'cn("w-full rounded-lg caption-bottom text-sm"'
	},
	{
		id: 'calendar-head-cell',
		component: 'calendar',
		file: 'calendar/calendar-head-cell.svelte',
		role: 'box',
		step: 'lg',
		stock: 'w-(--cell-size) rounded-md text-[0.8rem]',
		fixed: 'w-(--cell-size) rounded-lg text-[0.8rem]'
	},
	{
		id: 'calendar-month-select',
		component: 'calendar',
		file: 'calendar/calendar-month-select.svelte',
		role: 'box',
		step: 'lg',
		stock: 'relative flex rounded-md border border-input shadow-xs',
		fixed: 'relative flex rounded-lg border border-input shadow-xs'
	},
	{
		id: 'calendar-month-select-label',
		component: 'calendar',
		file: 'calendar/calendar-month-select.svelte',
		role: 'box',
		step: 'lg',
		stock: 'items-center gap-1 rounded-md ps-2 pe-1',
		fixed: 'items-center gap-1 rounded-lg ps-2 pe-1'
	},
	{
		id: 'calendar-year-select',
		component: 'calendar',
		file: 'calendar/calendar-year-select.svelte',
		role: 'box',
		step: 'lg',
		stock: 'relative flex rounded-md border border-input shadow-xs',
		fixed: 'relative flex rounded-lg border border-input shadow-xs'
	},
	{
		id: 'calendar-year-select-label',
		component: 'calendar',
		file: 'calendar/calendar-year-select.svelte',
		role: 'box',
		step: 'lg',
		stock: 'items-center gap-1 rounded-md ps-2 pe-1',
		fixed: 'items-center gap-1 rounded-lg ps-2 pe-1'
	}
];

export const VARIANT_COMPONENTS = ['button', 'badge', 'alert', 'bubble'];

export const VARIANT_ROWS = [
	{
		component: 'button',
		key: 'destructive',
		tone: 'destructive',
		presentation: 'solid',
		class:
			'bg-destructive text-destructive-foreground border-destructive-text hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 focus-visible:border-destructive/40'
	},
	{
		component: 'button',
		key: 'success',
		tone: 'success',
		presentation: 'solid',
		class: 'bg-success text-success-foreground border-success-text hover:bg-success/80'
	},
	{
		component: 'button',
		key: 'warning',
		tone: 'warning',
		presentation: 'solid',
		class: 'bg-warning text-warning-foreground border-warning-text hover:bg-warning/80'
	},
	{
		component: 'button',
		key: 'info',
		tone: 'info',
		presentation: 'solid',
		class: 'bg-info text-info-foreground border-info-text hover:bg-info/80'
	},
	{
		component: 'button',
		key: 'outline-destructive',
		tone: 'destructive',
		presentation: 'outline',
		class: 'border-destructive-text bg-transparent text-destructive-text hover:bg-destructive/10'
	},
	{
		component: 'button',
		key: 'outline-success',
		tone: 'success',
		presentation: 'outline',
		class: 'border-success-text bg-transparent text-success-text hover:bg-success/10'
	},
	{
		component: 'button',
		key: 'outline-warning',
		tone: 'warning',
		presentation: 'outline',
		class: 'border-warning-text bg-transparent text-warning-text hover:bg-warning/10'
	},
	{
		component: 'button',
		key: 'outline-info',
		tone: 'info',
		presentation: 'outline',
		class: 'border-info-text bg-transparent text-info-text hover:bg-info/10'
	},
	{
		component: 'button',
		key: 'ghost-destructive',
		tone: 'destructive',
		presentation: 'ghost',
		class: 'text-destructive-text hover:bg-destructive/10'
	},
	{
		component: 'button',
		key: 'ghost-success',
		tone: 'success',
		presentation: 'ghost',
		class: 'text-success-text hover:bg-success/10'
	},
	{
		component: 'button',
		key: 'ghost-warning',
		tone: 'warning',
		presentation: 'ghost',
		class: 'text-warning-text hover:bg-warning/10'
	},
	{
		component: 'button',
		key: 'ghost-info',
		tone: 'info',
		presentation: 'ghost',
		class: 'text-info-text hover:bg-info/10'
	},
	{
		component: 'button',
		key: 'link-destructive',
		tone: 'destructive',
		presentation: 'link',
		class: 'text-destructive-text underline underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'link-success',
		tone: 'success',
		presentation: 'link',
		class: 'text-success-text underline underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'link-warning',
		tone: 'warning',
		presentation: 'link',
		class: 'text-warning-text underline underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'link-info',
		tone: 'info',
		presentation: 'link',
		class: 'text-info-text underline underline-offset-4 hover:underline'
	},
	{
		component: 'badge',
		key: 'destructive',
		tone: 'destructive',
		presentation: 'solid',
		class:
			'text-destructive [a]:hover:text-destructive/70 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40'
	},
	{
		component: 'badge',
		key: 'success',
		tone: 'success',
		presentation: 'solid',
		class:
			'border border-success-text bg-success text-success-foreground px-1.5 py-0.5 [a]:hover:bg-success/80'
	},
	{
		component: 'badge',
		key: 'warning',
		tone: 'warning',
		presentation: 'solid',
		class:
			'border border-warning-text bg-warning text-warning-foreground px-1.5 py-0.5 [a]:hover:bg-warning/80'
	},
	{
		component: 'badge',
		key: 'info',
		tone: 'info',
		presentation: 'solid',
		class: 'border border-info-text bg-info text-info-foreground px-1.5 py-0.5 [a]:hover:bg-info/80'
	},
	{
		component: 'badge',
		key: 'outline-destructive',
		tone: 'destructive',
		presentation: 'outline',
		class:
			'border border-destructive-text text-destructive-text px-1.5 py-0.5 [a]:hover:text-destructive-text/70'
	},
	{
		component: 'badge',
		key: 'outline-success',
		tone: 'success',
		presentation: 'outline',
		class:
			'border border-success-text text-success-text px-1.5 py-0.5 [a]:hover:text-success-text/70'
	},
	{
		component: 'badge',
		key: 'outline-warning',
		tone: 'warning',
		presentation: 'outline',
		class:
			'border border-warning-text text-warning-text px-1.5 py-0.5 [a]:hover:text-warning-text/70'
	},
	{
		component: 'badge',
		key: 'outline-info',
		tone: 'info',
		presentation: 'outline',
		class: 'border border-info-text text-info-text px-1.5 py-0.5 [a]:hover:text-info-text/70'
	},
	{
		component: 'badge',
		key: 'ghost-destructive',
		tone: 'destructive',
		presentation: 'ghost',
		class: 'text-destructive-text hover:text-destructive-text/70'
	},
	{
		component: 'badge',
		key: 'ghost-success',
		tone: 'success',
		presentation: 'ghost',
		class: 'text-success-text hover:text-success-text/70'
	},
	{
		component: 'badge',
		key: 'ghost-warning',
		tone: 'warning',
		presentation: 'ghost',
		class: 'text-warning-text hover:text-warning-text/70'
	},
	{
		component: 'badge',
		key: 'ghost-info',
		tone: 'info',
		presentation: 'ghost',
		class: 'text-info-text hover:text-info-text/70'
	},
	{
		component: 'badge',
		key: 'link-destructive',
		tone: 'destructive',
		presentation: 'link',
		class: 'text-destructive-text underline-offset-4 hover:underline'
	},
	{
		component: 'badge',
		key: 'link-success',
		tone: 'success',
		presentation: 'link',
		class: 'text-success-text underline-offset-4 hover:underline'
	},
	{
		component: 'badge',
		key: 'link-warning',
		tone: 'warning',
		presentation: 'link',
		class: 'text-warning-text underline-offset-4 hover:underline'
	},
	{
		component: 'badge',
		key: 'link-info',
		tone: 'info',
		presentation: 'link',
		class: 'text-info-text underline-offset-4 hover:underline'
	},
	{
		component: 'alert',
		key: 'destructive',
		tone: 'destructive',
		presentation: 'solid',
		class:
			'text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current after:bg-destructive'
	},
	{
		component: 'alert',
		key: 'success',
		tone: 'success',
		presentation: 'solid',
		class:
			'text-success-text bg-card *:data-[slot=alert-description]:text-success-text/90 *:[svg]:text-current after:bg-success'
	},
	{
		component: 'alert',
		key: 'warning',
		tone: 'warning',
		presentation: 'solid',
		class:
			'text-warning-text bg-card *:data-[slot=alert-description]:text-warning-text/90 *:[svg]:text-current after:bg-warning'
	},
	{
		component: 'alert',
		key: 'info',
		tone: 'info',
		presentation: 'solid',
		class:
			'text-info-text bg-card *:data-[slot=alert-description]:text-info-text/90 *:[svg]:text-current after:bg-info'
	},
	{
		component: 'bubble',
		key: 'destructive',
		tone: 'destructive',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-destructive/10 dark:*:data-[slot=bubble-content]:bg-destructive/20 *:data-[slot=bubble-content]:text-destructive [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30'
	},
	{
		component: 'bubble',
		key: 'success',
		tone: 'success',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-success *:data-[slot=bubble-content]:border-success-text *:data-[slot=bubble-content]:text-success-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-success/80'
	},
	{
		component: 'bubble',
		key: 'warning',
		tone: 'warning',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-warning *:data-[slot=bubble-content]:border-warning-text *:data-[slot=bubble-content]:text-warning-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-warning/80'
	},
	{
		component: 'bubble',
		key: 'info',
		tone: 'info',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-info *:data-[slot=bubble-content]:border-info-text *:data-[slot=bubble-content]:text-info-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-info/80'
	},
	{
		component: 'bubble',
		key: 'outline-destructive',
		tone: 'destructive',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:border-destructive-text *:data-[slot=bubble-content]:text-destructive-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/10'
	},
	{
		component: 'bubble',
		key: 'outline-success',
		tone: 'success',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:border-success-text *:data-[slot=bubble-content]:text-success-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-success/10'
	},
	{
		component: 'bubble',
		key: 'outline-warning',
		tone: 'warning',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:border-warning-text *:data-[slot=bubble-content]:text-warning-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-warning/10'
	},
	{
		component: 'bubble',
		key: 'outline-info',
		tone: 'info',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:border-info-text *:data-[slot=bubble-content]:text-info-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-info/10'
	},
	{
		component: 'bubble',
		key: 'ghost-destructive',
		tone: 'destructive',
		presentation: 'ghost',
		class:
			'*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 *:data-[slot=bubble-content]:text-destructive-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/10 border-none'
	},
	{
		component: 'bubble',
		key: 'ghost-success',
		tone: 'success',
		presentation: 'ghost',
		class:
			'*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 *:data-[slot=bubble-content]:text-success-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-success/10 border-none'
	},
	{
		component: 'bubble',
		key: 'ghost-warning',
		tone: 'warning',
		presentation: 'ghost',
		class:
			'*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 *:data-[slot=bubble-content]:text-warning-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-warning/10 border-none'
	},
	{
		component: 'bubble',
		key: 'ghost-info',
		tone: 'info',
		presentation: 'ghost',
		class:
			'*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 *:data-[slot=bubble-content]:text-info-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-info/10 border-none'
	}
];

const rowsOf = (component) => VARIANT_ROWS.filter((row) => row.component === component);

export const BUTTON_VARIANTS = rowsOf('button');
export const BADGE_VARIANTS = rowsOf('badge');
export const ALERT_VARIANTS = rowsOf('alert');
export const BUBBLE_VARIANTS = rowsOf('bubble');

const VARIANT_FILES = {
	button: 'button/button.svelte',
	badge: 'badge/badge.svelte',
	alert: 'alert/alert.svelte',
	bubble: 'bubble/bubble.svelte'
};

const VARIANT_PINNED = {
	button: {
		default: 'bg-primary text-primary-foreground hover:bg-primary/80',
		outline:
			'border-border bg-transparent hover:bg-muted hover:text-foreground dark:hover:bg-input/30 aria-expanded:bg-muted aria-expanded:text-foreground',
		secondary:
			'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
		ghost:
			'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
		link: 'text-primary underline-offset-4 hover:underline underline'
	},
	badge: {
		default: 'text-foreground [a]:hover:text-foreground/70',
		secondary: 'text-muted-foreground [a]:hover:text-foreground',
		outline: 'text-foreground [a]:hover:text-foreground/70',
		ghost: 'text-muted-foreground hover:text-foreground',
		link: 'text-foreground underline-offset-4 hover:underline'
	},
	alert: {
		default: 'bg-card text-card-foreground after:bg-foreground'
	},
	bubble: {
		tinted:
			'*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.93_calc(c*0.4)_h)] dark:*:data-[slot=bubble-content]:bg-[oklch(from_var(--primary)_0.3_calc(c*0.4)_h)] *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.88_calc(c*0.5)_h)] dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[oklch(from_var(--primary)_0.35_calc(c*0.5)_h)]',
		outline:
			'*:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:border-border [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-input/30',
		ghost:
			'*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50 border-none'
	}
};

// bubble opens at `tinted`: `bubble-muted` owns the `muted:` line, and the fixer states every site
// before it writes, so the two stock strings must not share a byte.
const VARIANT_LAYOUT = {
	button: { lead: ['default', 'outline', 'secondary', 'ghost'], trail: ['link'], open: true },
	badge: { lead: ['default', 'secondary'], trail: ['outline', 'ghost', 'link'], open: true },
	alert: { lead: ['default'], trail: [], open: true },
	bubble: { lead: ['tinted', 'outline', 'ghost'], trail: [], open: false }
};

const VARIANT_STOCK_CLASS = {
	button:
		'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30'
};

const renderVariantBlock = (component, rows) => {
	const { lead, trail, open } = VARIANT_LAYOUT[component];
	const pinned = VARIANT_PINNED[component];
	const line = (key) => `\t\t\t\t${key}: "${pinned[key]}",`;
	return [
		...(open ? ['variant: {'] : []),
		...lead.map(line),
		...rows.map((row) => `\t\t\t\t${row.key}: "${row.class}",`),
		...trail.map(line),
		'\t\t\t}'
	].join('\n');
};

const stockRowsOf = (component) =>
	rowsOf(component)
		.slice(0, 1)
		.map((row) => ({ ...row, class: VARIANT_STOCK_CLASS[component] ?? row.class }));

export const VARIANTS = VARIANT_COMPONENTS.map((component) => ({
	id: `${component}-variants`,
	component,
	file: VARIANT_FILES[component],
	stock: renderVariantBlock(component, stockRowsOf(component)),
	fixed: renderVariantBlock(component, rowsOf(component))
}));

export const KNOWN_COMPONENTS = [
	...new Set([...COMPONENTS, ...RADIUS_COMPONENTS, ...SURFACE_COMPONENTS, ...VARIANT_COMPONENTS])
];

export const TARGETS = {
	supported: SUPPORTED,
	components: COMPONENTS,
	sites: SITES,
	pairs: PAIRS,
	radius: RADIUS,
	radiusComponents: RADIUS_COMPONENTS,
	surfaces: SURFACES,
	surfaceComponents: SURFACE_COMPONENTS,
	variants: VARIANTS,
	variantComponents: VARIANT_COMPONENTS,
	buttonVariants: BUTTON_VARIANTS,
	variantRows: VARIANT_ROWS,
	badgeVariants: BADGE_VARIANTS,
	alertVariants: ALERT_VARIANTS,
	bubbleVariants: BUBBLE_VARIANTS
};
