// The one target manifest: the stock the fixer patches and the shadcn-svelte version it patches. The
// `stock` strings come from the pinned `src/lib/components/ui` snapshot at 1.8; nine of the eleven
// contrast sites match every style, so the style label is not part of the guard.
// A radius or surface entry whose 1.8 stock already holds the role step repeats the string as its
// own `fixed`: the fixer reports it `fixed` and writes nothing, and `--check` still fails when a
// hand edit moves it off the step.
// `packages/daisyui-adapter/test/drift.mjs` fails when the pin moves without this list.
export const SUPPORTED = { version: { major: 1, minor: 8 } };

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
		stock: 'class="absolute top-2 right-2"',
		fixed: 'class="absolute top-2 right-2 bg-muted"'
	},
	{
		id: 'sheet-close',
		component: 'sheet',
		file: 'sheet/sheet-content.svelte',
		stock: 'class="absolute top-4 right-4"',
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
			'*:data-[slot=bubble-content]:bg-muted *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]'
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
		fixed: 'gap-1 rounded-md text-xs font-medium'
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
		role: 'field',
		step: 'md',
		stock: 'h-7 rounded-md border px-2 py-0.5',
		fixed: 'h-7 rounded-md border px-2 py-0.5'
	},
	{
		id: 'textarea-field',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		role: 'field',
		step: 'md',
		stock: 'resize-none rounded-md border px-2 py-2',
		fixed: 'resize-none rounded-md border px-2 py-2'
	},
	{
		id: 'native-select-field',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		size: 'default',
		step: 'md',
		stock: 'appearance-none rounded-md border py-0.5 pr-6 pl-2',
		fixed: 'appearance-none rounded-md data-[size=sm]:rounded-sm border py-0.5 pr-6 pl-2'
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
		fixed: 'gap-2 rounded-sm text-xs/relaxed flex'
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
		stock: '*:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg',
		fixed: '*:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg'
	},
	{
		id: 'card-header',
		component: 'card',
		file: 'card/card-header.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-1 rounded-t-lg px-(--card-spacing)',
		fixed: 'gap-1 rounded-t-lg px-(--card-spacing)'
	},
	{
		id: 'dialog-content',
		component: 'dialog',
		file: 'dialog/dialog-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'gap-4 rounded-xl p-4',
		fixed: 'gap-4 rounded-lg p-4'
	},
	{
		id: 'alert-base',
		component: 'alert',
		file: 'alert/alert.svelte',
		role: 'box',
		step: 'lg',
		stock: 'grid gap-0.5 rounded-lg border px-2 py-1.5',
		fixed: 'grid gap-0.5 rounded-lg border px-2 py-1.5'
	},
	{
		id: 'popover-content',
		component: 'popover',
		file: 'popover/popover-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'flex flex-col gap-4 rounded-lg p-2.5',
		fixed: 'flex flex-col gap-4 rounded-lg p-2.5'
	},
	{
		id: 'dropdown-content',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-lg p-1 shadow-md ring-1',
		fixed: 'min-w-32 rounded-lg p-1 shadow-md ring-1'
	},
	{
		id: 'dropdown-sub-content',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-sub-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-lg p-1 shadow-md ring-1',
		fixed: 'min-w-32 rounded-lg p-1 shadow-md ring-1'
	},
	{
		id: 'dropdown-item',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md px-2 py-1',
		fixed: 'min-h-7 gap-2 rounded-lg px-2 py-1'
	},
	{
		id: 'dropdown-checkbox-item',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-checkbox-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md py-1.5 pr-8 pl-2',
		fixed: 'min-h-7 gap-2 rounded-lg py-1.5 pr-8 pl-2'
	},
	{
		id: 'dropdown-radio-item',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-radio-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md py-1.5 pr-8 pl-2',
		fixed: 'min-h-7 gap-2 rounded-lg py-1.5 pr-8 pl-2'
	},
	{
		id: 'dropdown-sub-trigger',
		component: 'dropdown-menu',
		file: 'dropdown-menu/dropdown-menu-sub-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md px-2 py-1 text-xs',
		fixed: 'min-h-7 gap-2 rounded-lg px-2 py-1 text-xs'
	},
	{
		id: 'context-content',
		component: 'context-menu',
		file: 'context-menu/context-menu-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-lg p-1 shadow-md ring-1',
		fixed: 'min-w-32 rounded-lg p-1 shadow-md ring-1'
	},
	{
		id: 'context-sub-content',
		component: 'context-menu',
		file: 'context-menu/context-menu-sub-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-lg p-1 shadow-md ring-1',
		fixed: 'min-w-32 rounded-lg p-1 shadow-md ring-1'
	},
	{
		id: 'context-item',
		component: 'context-menu',
		file: 'context-menu/context-menu-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md px-2 py-1',
		fixed: 'min-h-7 gap-2 rounded-lg px-2 py-1'
	},
	{
		id: 'context-checkbox-item',
		component: 'context-menu',
		file: 'context-menu/context-menu-checkbox-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md py-1.5 pr-8 pl-2',
		fixed: 'min-h-7 gap-2 rounded-lg py-1.5 pr-8 pl-2'
	},
	{
		id: 'context-radio-item',
		component: 'context-menu',
		file: 'context-menu/context-menu-radio-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md py-1.5 pr-8 pl-2',
		fixed: 'min-h-7 gap-2 rounded-lg py-1.5 pr-8 pl-2'
	},
	{
		id: 'context-sub-trigger',
		component: 'context-menu',
		file: 'context-menu/context-menu-sub-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md px-2 py-1 text-xs',
		fixed: 'min-h-7 gap-2 rounded-lg px-2 py-1 text-xs'
	},
	{
		id: 'menubar-root',
		component: 'menubar',
		file: 'menubar/menubar.svelte',
		role: 'box',
		step: 'lg',
		stock: 'h-9 rounded-lg border p-1',
		fixed: 'h-9 rounded-lg border p-1'
	},
	{
		id: 'menubar-trigger',
		component: 'menubar',
		file: 'menubar/menubar-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock:
			'aria-expanded:bg-muted rounded-[calc(var(--radius-md)_-_2px)] px-2 py-[calc(--spacing(0.85))]',
		fixed: 'aria-expanded:bg-muted rounded-lg px-2 py-[calc(--spacing(0.85))]'
	},
	{
		id: 'menubar-content',
		component: 'menubar',
		file: 'menubar/menubar-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-lg p-1 shadow-md ring-1',
		fixed: 'min-w-32 rounded-lg p-1 shadow-md ring-1'
	},
	{
		id: 'menubar-sub-content',
		component: 'menubar',
		file: 'menubar/menubar-sub-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-w-32 rounded-lg p-1 shadow-md ring-1',
		fixed: 'min-w-32 rounded-lg p-1 shadow-md ring-1'
	},
	{
		id: 'menubar-item',
		component: 'menubar',
		file: 'menubar/menubar-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md px-2 py-1 text-xs/relaxed',
		fixed: 'min-h-7 gap-2 rounded-lg px-2 py-1 text-xs/relaxed'
	},
	{
		id: 'menubar-checkbox-item',
		component: 'menubar',
		file: 'menubar/menubar-checkbox-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md py-1.5 pr-2 pl-7.5',
		fixed: 'min-h-7 gap-2 rounded-lg py-1.5 pr-2 pl-7.5'
	},
	{
		id: 'menubar-radio-item',
		component: 'menubar',
		file: 'menubar/menubar-radio-item.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md py-1.5 pr-2 pl-7.5',
		fixed: 'min-h-7 gap-2 rounded-lg py-1.5 pr-2 pl-7.5'
	},
	{
		id: 'menubar-sub-trigger',
		component: 'menubar',
		file: 'menubar/menubar-sub-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'min-h-7 gap-2 rounded-md px-2 py-1 text-xs',
		fixed: 'min-h-7 gap-2 rounded-lg px-2 py-1 text-xs'
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
		id: 'drawer-surface',
		component: 'drawer',
		file: 'drawer/drawer-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'before:absolute before:inset-2 before:-z-10 before:rounded-xl before:border',
		fixed: 'before:absolute before:inset-2 before:-z-10 before:rounded-lg before:border'
	},
	{
		id: 'drawer-handle',
		component: 'drawer',
		file: 'drawer/drawer-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-full',
		fixed: 'mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-lg'
	},
	{
		id: 'nav-content',
		component: 'navigation-menu',
		file: 'navigation-menu/navigation-menu-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'group-data-[viewport=false]/navigation-menu:rounded-xl',
		fixed: 'group-data-[viewport=false]/navigation-menu:rounded-lg'
	},
	{
		id: 'nav-viewport',
		component: 'navigation-menu',
		file: 'navigation-menu/navigation-menu-viewport.svelte',
		role: 'box',
		step: 'lg',
		stock: 'ring-foreground/10 rounded-xl shadow-md ring-1',
		fixed: 'ring-foreground/10 rounded-lg shadow-md ring-1'
	},
	{
		id: 'nav-link',
		component: 'navigation-menu',
		file: 'navigation-menu/navigation-menu-link.svelte',
		role: 'box',
		step: 'lg',
		stock: `rounded-lg p-2 text-xs/relaxed transition-all outline-none focus-visible:ring-2 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4 in-data-[slot=navigation-menu-content]:rounded-md`,
		fixed: `rounded-lg p-2 text-xs/relaxed transition-all outline-none focus-visible:ring-2 focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4 in-data-[slot=navigation-menu-content]:rounded-lg`
	},
	{
		id: 'nav-trigger',
		component: 'navigation-menu',
		file: 'navigation-menu/navigation-menu-trigger.svelte',
		role: 'box',
		step: 'lg',
		stock: 'data-popup-open:hover:bg-muted rounded-lg px-2.5 py-1.5',
		fixed: 'data-popup-open:hover:bg-muted rounded-lg px-2.5 py-1.5'
	},
	{
		id: 'command-root',
		component: 'command',
		file: 'command/command.svelte',
		role: 'box',
		step: 'lg',
		stock:
			'bg-popover text-popover-foreground rounded-xl p-1 flex size-full flex-col overflow-hidden',
		fixed:
			'bg-popover text-popover-foreground rounded-lg p-1 flex size-full flex-col overflow-hidden'
	},
	{
		id: 'command-item',
		component: 'command',
		file: 'command/command-item.svelte',
		role: 'box',
		step: 'lg',
		stock:
			'gap-2 rounded-md px-2.5 py-1.5 text-xs/relaxed outline-hidden select-none in-data-[slot=dialog-content]:rounded-md',
		fixed:
			'gap-2 rounded-lg px-2.5 py-1.5 text-xs/relaxed outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg'
	},
	{
		id: 'command-link-item',
		component: 'command',
		file: 'command/command-link-item.svelte',
		role: 'box',
		step: 'lg',
		stock:
			'gap-2 rounded-md px-2.5 py-1.5 text-xs/relaxed outline-hidden select-none in-data-[slot=dialog-content]:rounded-md',
		fixed:
			'gap-2 rounded-lg px-2.5 py-1.5 text-xs/relaxed outline-hidden select-none in-data-[slot=dialog-content]:rounded-lg'
	},
	{
		id: 'hover-card-content',
		component: 'hover-card',
		file: 'hover-card/hover-card-content.svelte',
		role: 'box',
		step: 'lg',
		stock: 'ring-foreground/10 bg-popover text-popover-foreground w-72 rounded-lg p-2.5',
		fixed: 'ring-foreground/10 bg-popover text-popover-foreground w-72 rounded-lg p-2.5'
	},
	{
		id: 'table-surface',
		component: 'table',
		file: 'table/table.svelte',
		role: 'box',
		step: 'lg',
		stock: 'cn("w-full caption-bottom text-xs"',
		fixed: 'cn("w-full rounded-lg caption-bottom text-xs"'
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
			'bg-destructive text-destructive-foreground hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 focus-visible:border-destructive/40'
	},
	{
		component: 'button',
		key: 'success',
		tone: 'success',
		presentation: 'solid',
		class: 'bg-success text-success-foreground hover:bg-success/80'
	},
	{
		component: 'button',
		key: 'warning',
		tone: 'warning',
		presentation: 'solid',
		class: 'bg-warning text-warning-foreground hover:bg-warning/80'
	},
	{
		component: 'button',
		key: 'info',
		tone: 'info',
		presentation: 'solid',
		class: 'bg-info text-info-foreground hover:bg-info/80'
	},
	{
		component: 'button',
		key: 'outline-destructive',
		tone: 'destructive',
		presentation: 'outline',
		class:
			'border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground'
	},
	{
		component: 'button',
		key: 'outline-success',
		tone: 'success',
		presentation: 'outline',
		class:
			'border-success bg-transparent text-success hover:bg-success hover:text-success-foreground'
	},
	{
		component: 'button',
		key: 'outline-warning',
		tone: 'warning',
		presentation: 'outline',
		class:
			'border-warning bg-transparent text-warning hover:bg-warning hover:text-warning-foreground'
	},
	{
		component: 'button',
		key: 'outline-info',
		tone: 'info',
		presentation: 'outline',
		class: 'border-info bg-transparent text-info hover:bg-info hover:text-info-foreground'
	},
	{
		component: 'button',
		key: 'ghost-destructive',
		tone: 'destructive',
		presentation: 'ghost',
		class: 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
	},
	{
		component: 'button',
		key: 'ghost-success',
		tone: 'success',
		presentation: 'ghost',
		class: 'text-success hover:bg-success hover:text-success-foreground'
	},
	{
		component: 'button',
		key: 'ghost-warning',
		tone: 'warning',
		presentation: 'ghost',
		class: 'text-warning hover:bg-warning hover:text-warning-foreground'
	},
	{
		component: 'button',
		key: 'ghost-info',
		tone: 'info',
		presentation: 'ghost',
		class: 'text-info hover:bg-info hover:text-info-foreground'
	},
	{
		component: 'button',
		key: 'link-destructive',
		tone: 'destructive',
		presentation: 'link',
		class: 'text-destructive underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'link-success',
		tone: 'success',
		presentation: 'link',
		class: 'text-success underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'link-warning',
		tone: 'warning',
		presentation: 'link',
		class: 'text-warning underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'link-info',
		tone: 'info',
		presentation: 'link',
		class: 'text-info underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'outline-primary',
		tone: 'primary',
		presentation: 'outline',
		class:
			'border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground'
	},
	{
		component: 'button',
		key: 'ghost-primary',
		tone: 'primary',
		presentation: 'ghost',
		class: 'text-primary hover:bg-primary hover:text-primary-foreground'
	},
	{
		component: 'button',
		key: 'link-primary',
		tone: 'primary',
		presentation: 'link',
		class: 'text-primary underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'outline-secondary',
		tone: 'secondary',
		presentation: 'outline',
		class:
			'border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-secondary-foreground'
	},
	{
		component: 'button',
		key: 'ghost-secondary',
		tone: 'secondary',
		presentation: 'ghost',
		class: 'text-secondary hover:bg-secondary hover:text-secondary-foreground'
	},
	{
		component: 'button',
		key: 'link-secondary',
		tone: 'secondary',
		presentation: 'link',
		class: 'text-secondary underline-offset-4 hover:underline'
	},
	{
		component: 'button',
		key: 'blackwhite',
		tone: 'blackwhite',
		presentation: 'solid',
		class: 'bg-blackwhite text-blackwhite-foreground hover:bg-blackwhite/80'
	},
	{
		component: 'button',
		key: 'outline-blackwhite',
		tone: 'blackwhite',
		presentation: 'outline',
		class:
			'border-blackwhite bg-transparent text-blackwhite hover:bg-blackwhite hover:text-blackwhite-foreground'
	},
	{
		component: 'button',
		key: 'ghost-blackwhite',
		tone: 'blackwhite',
		presentation: 'ghost',
		class: 'text-blackwhite hover:bg-blackwhite hover:text-blackwhite-foreground'
	},
	{
		component: 'button',
		key: 'link-blackwhite',
		tone: 'blackwhite',
		presentation: 'link',
		class: 'text-blackwhite underline-offset-4 hover:underline'
	},
	{
		component: 'badge',
		key: 'destructive',
		tone: 'destructive',
		presentation: 'solid',
		class:
			'bg-destructive/10 text-destructive-text px-1.5 py-0.5 hover:bg-destructive/20 dark:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40'
	},
	{
		component: 'badge',
		key: 'success',
		tone: 'success',
		presentation: 'solid',
		class: 'bg-success text-success-foreground px-1.5 py-0.5 hover:bg-success/80'
	},
	{
		component: 'badge',
		key: 'warning',
		tone: 'warning',
		presentation: 'solid',
		class: 'bg-warning text-warning-foreground px-1.5 py-0.5 hover:bg-warning/80'
	},
	{
		component: 'badge',
		key: 'info',
		tone: 'info',
		presentation: 'solid',
		class: 'bg-info text-info-foreground px-1.5 py-0.5 hover:bg-info/80'
	},
	{
		component: 'badge',
		key: 'outline-destructive',
		tone: 'destructive',
		presentation: 'outline',
		class:
			'border border-destructive-text bg-destructive/10 text-destructive-text px-1.5 py-0.5 hover:text-destructive-text/70'
	},
	{
		component: 'badge',
		key: 'outline-success',
		tone: 'success',
		presentation: 'outline',
		class:
			'border border-success-text bg-success/10 text-success-text px-1.5 py-0.5 hover:text-success-text/70'
	},
	{
		component: 'badge',
		key: 'outline-warning',
		tone: 'warning',
		presentation: 'outline',
		class:
			'border border-warning-text bg-warning/10 text-warning-text px-1.5 py-0.5 hover:text-warning-text/70'
	},
	{
		component: 'badge',
		key: 'outline-info',
		tone: 'info',
		presentation: 'outline',
		class:
			'border border-info-text bg-info/10 text-info-text px-1.5 py-0.5 hover:text-info-text/70'
	},
	{
		component: 'badge',
		key: 'ghost-destructive',
		tone: 'destructive',
		presentation: 'ghost',
		class: 'text-destructive-text hover:bg-destructive/10 hover:text-destructive-text/70'
	},
	{
		component: 'badge',
		key: 'ghost-success',
		tone: 'success',
		presentation: 'ghost',
		class: 'text-success-text hover:bg-success/10 hover:text-success-text/70'
	},
	{
		component: 'badge',
		key: 'ghost-warning',
		tone: 'warning',
		presentation: 'ghost',
		class: 'text-warning-text hover:bg-warning/10 hover:text-warning-text/70'
	},
	{
		component: 'badge',
		key: 'ghost-info',
		tone: 'info',
		presentation: 'ghost',
		class: 'text-info-text hover:bg-info/10 hover:text-info-text/70'
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
		component: 'badge',
		key: 'blackwhite',
		tone: 'blackwhite',
		presentation: 'solid',
		class: 'bg-blackwhite text-blackwhite-foreground px-1.5 py-0.5 hover:bg-blackwhite/80'
	},
	{
		component: 'badge',
		key: 'outline-blackwhite',
		tone: 'blackwhite',
		presentation: 'outline',
		class:
			'border border-blackwhite bg-transparent text-blackwhite px-1.5 py-0.5 hover:text-blackwhite/70'
	},
	{
		component: 'badge',
		key: 'ghost-blackwhite',
		tone: 'blackwhite',
		presentation: 'ghost',
		class: 'text-blackwhite hover:bg-blackwhite/10 hover:text-blackwhite/70'
	},
	{
		component: 'badge',
		key: 'link-blackwhite',
		tone: 'blackwhite',
		presentation: 'link',
		class: 'text-blackwhite underline-offset-4 hover:underline'
	},
	{
		component: 'alert',
		key: 'destructive',
		tone: 'destructive',
		presentation: 'solid',
		class:
			'bg-destructive text-destructive-foreground *:data-[slot=alert-description]:text-destructive-foreground *:[svg]:text-current'
	},
	{
		component: 'alert',
		key: 'success',
		tone: 'success',
		presentation: 'solid',
		class:
			'bg-success text-success-foreground *:data-[slot=alert-description]:text-success-foreground *:[svg]:text-current'
	},
	{
		component: 'alert',
		key: 'warning',
		tone: 'warning',
		presentation: 'solid',
		class:
			'bg-warning text-warning-foreground *:data-[slot=alert-description]:text-warning-foreground *:[svg]:text-current'
	},
	{
		component: 'alert',
		key: 'info',
		tone: 'info',
		presentation: 'solid',
		class:
			'bg-info text-info-foreground *:data-[slot=alert-description]:text-info-foreground *:[svg]:text-current'
	},
	{
		component: 'alert',
		key: 'blackwhite',
		tone: 'blackwhite',
		presentation: 'solid',
		class:
			'bg-blackwhite text-blackwhite-foreground *:data-[slot=alert-description]:text-blackwhite-foreground *:[svg]:text-current'
	},
	{
		component: 'bubble',
		key: 'destructive',
		tone: 'destructive',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-destructive *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:text-destructive-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/80'
	},
	{
		component: 'bubble',
		key: 'success',
		tone: 'success',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-success *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:text-success-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-success/80'
	},
	{
		component: 'bubble',
		key: 'warning',
		tone: 'warning',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-warning *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:text-warning-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-warning/80'
	},
	{
		component: 'bubble',
		key: 'info',
		tone: 'info',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-info *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:text-info-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-info/80'
	},
	{
		component: 'bubble',
		key: 'outline-destructive',
		tone: 'destructive',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:border-destructive *:data-[slot=bubble-content]:text-destructive [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive [&>[data-slot=bubble-content]:is(button,a):hover]:text-destructive-foreground'
	},
	{
		component: 'bubble',
		key: 'outline-success',
		tone: 'success',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:border-success *:data-[slot=bubble-content]:text-success [&>[data-slot=bubble-content]:is(button,a):hover]:bg-success [&>[data-slot=bubble-content]:is(button,a):hover]:text-success-foreground'
	},
	{
		component: 'bubble',
		key: 'outline-warning',
		tone: 'warning',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:border-warning *:data-[slot=bubble-content]:text-warning [&>[data-slot=bubble-content]:is(button,a):hover]:bg-warning [&>[data-slot=bubble-content]:is(button,a):hover]:text-warning-foreground'
	},
	{
		component: 'bubble',
		key: 'outline-info',
		tone: 'info',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:border-info *:data-[slot=bubble-content]:text-info [&>[data-slot=bubble-content]:is(button,a):hover]:bg-info [&>[data-slot=bubble-content]:is(button,a):hover]:text-info-foreground'
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
	},
	{
		component: 'bubble',
		key: 'blackwhite',
		tone: 'blackwhite',
		presentation: 'solid',
		class:
			'*:data-[slot=bubble-content]:bg-blackwhite *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:text-blackwhite-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-blackwhite/80'
	},
	{
		component: 'bubble',
		key: 'outline-blackwhite',
		tone: 'blackwhite',
		presentation: 'outline',
		class:
			'*:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:rounded-full *:data-[slot=bubble-content]:border-blackwhite *:data-[slot=bubble-content]:text-blackwhite [&>[data-slot=bubble-content]:is(button,a):hover]:bg-blackwhite [&>[data-slot=bubble-content]:is(button,a):hover]:text-blackwhite-foreground'
	},
	{
		component: 'bubble',
		key: 'ghost-blackwhite',
		tone: 'blackwhite',
		presentation: 'ghost',
		class:
			'*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 *:data-[slot=bubble-content]:text-blackwhite [&>[data-slot=bubble-content]:is(button,a):hover]:bg-blackwhite/10 border-none'
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
			'border-border dark:bg-input/30 hover:bg-input/50 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
		secondary:
			'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
		ghost:
			'hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	},
	badge: {
		default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
		secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
		outline:
			'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-input/20 dark:bg-input/30',
		ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
		link: 'text-primary underline-offset-4 hover:underline'
	},
	alert: {
		default: 'bg-card text-card-foreground'
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
		'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30',
	badge:
		'bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20',
	alert:
		'text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current',
	bubble:
		'*:data-[slot=bubble-content]:bg-destructive/10 dark:*:data-[slot=bubble-content]:bg-destructive/20 *:data-[slot=bubble-content]:text-destructive [&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/20 dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/30'
};

const keyToken = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : `"${key}"`);

// A lead key the fixer keeps byte-for-byte in the stock block but replaces in the fixed block.
const VARIANT_FIXED = {
	alert: {
		default:
			'bg-primary text-primary-foreground *:data-[slot=alert-description]:text-primary-foreground'
	},
	button: {
		outline:
			'border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground',
		ghost: 'text-primary hover:bg-primary hover:text-primary-foreground'
	},
	badge: {
		default: 'bg-primary text-primary-foreground hover:bg-primary/80',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		destructive:
			'bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive-text dark:bg-destructive/20',
		outline: 'border border-primary bg-primary/10 text-primary hover:text-primary/70',
		ghost: 'text-primary hover:bg-primary/10 hover:text-primary/70'
	}
};

const renderVariantBlock = (component, rows, fixed = false) => {
	const { lead, trail, open } = VARIANT_LAYOUT[component];
	const pinned = VARIANT_PINNED[component];
	const line = (key) =>
		`\t\t\t\t${keyToken(key)}: "${(fixed && VARIANT_FIXED[component]?.[key]) || pinned[key]}",`;
	return [
		...(open ? ['variant: {'] : []),
		...lead.map(line),
		...rows.map((row) => `\t\t\t\t${keyToken(row.key)}: "${row.class}",`),
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
	fixed: renderVariantBlock(component, rowsOf(component), true)
}));

// The binary controls take one tone through `variant`, not the four presentations a cva table gives
// button, badge, alert and bubble. Each fixed copy carries the seven rows as literal strings, because
// Tailwind only emits classes it can read in application source, and the fixed copy under
// `src/lib/components` is that source. The rows sit after the base class through `cn`, so they win the
// merge without `!` and a caller's `class` still wins. Box and switch both touch a radius site, so
// their class row carries the radius step itself; the binary table is applied first, and the radius
// site then reads its own fixed string and writes nothing.
export const BINARY_COMPONENTS = ['checkbox', 'switch', 'radio-group', 'toggle'];

const BINARY_TONES = [
	'default',
	'secondary',
	'success',
	'warning',
	'info',
	'destructive',
	'blackwhite'
];
const STATUS_TONES = new Set(['success', 'warning', 'info', 'destructive']);
const toneBorder = (tone) => (STATUS_TONES.has(tone) ? `${tone}-text` : tone);
// `default` is the theme's primary pair, so the key and the token differ here and only here.
const toneToken = (tone) => (tone === 'default' ? 'primary' : tone);

// The focus ring follows the tone, so the base class gives up `focus-visible:border-ring` and its ring
// colour instead of letting the primary pair win over a tone on focus. The ring width stays in the
// base; only the colour moves to the row. The anchor keeps the class before the focus utilities, so the
// fixed string cannot be read as already fixed while the stock still holds the classes.
const focusSite = (component, file, before, ring) => ({
	id: `${component}-focus`,
	component,
	file,
	stock: `${before} focus-visible:border-ring focus-visible:ring-ring/${ring} aria-invalid:ring-destructive/20`,
	fixed: `${before} aria-invalid:ring-destructive/20`
});

// The fill and foreground sit on the control; the dot is a child, so the tone row paints it from the
// control and the stock child rule never competes. The switch is different: its track is a 10 percent
// wash, the border carries the tone, and the thumb is the tone itself.
const TONE_EXTRAS = {
	checkbox: () => '',
	'radio-group': (token) =>
		` data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-${token}-foreground`
};

const toneRow = (component, tone) => {
	const token = toneToken(tone);
	const border = toneBorder(token);
	if (component === 'switch') {
		return `data-checked:bg-${token}/10 data-checked:border-${border} data-checked:[&_[data-slot=switch-thumb]]:bg-${token} focus-visible:ring-${border}/30`;
	}
	return `data-checked:bg-${token} data-checked:text-${token}-foreground data-checked:border-${border} focus-visible:ring-${border}/30${TONE_EXTRAS[component](token)}`;
};

const toneMap = (component) =>
	[
		'\tconst TONES = {',
		...BINARY_TONES.map(
			(tone) => `\t\t${keyToken(tone)}: "${toneRow(component, tone)}",`
		),
		'\t};'
	].join('\n');

const binaryProps = (component, stock, fixed) => ({
	id: `${component}-tones`,
	component,
	file: `${component}/${component === 'radio-group' ? 'radio-group-item' : component}.svelte`,
	stock,
	fixed
});

const checkboxPropsStock = `\tlet {
\t\tref = $bindable(null),
\t\tchecked = $bindable(false),
\t\tindeterminate = $bindable(false),
\t\tclass: className,
\t\t...restProps
\t}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props();`;

const checkboxPropsFixed = `${toneMap('checkbox')}

\tlet {
\t\tref = $bindable(null),
\t\tchecked = $bindable(false),
\t\tindeterminate = $bindable(false),
\t\tclass: className,
\t\tvariant = "default",
\t\t...restProps
\t}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> & {
\t\tvariant?: keyof typeof TONES;
\t} = $props();`;

const switchPropsStock = `\tlet {
\t\tref = $bindable(null),
\t\tclass: className,
\t\tchecked = $bindable(false),
\t\tsize = "default",
\t\t...restProps
\t}: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
\t\tsize?: "sm" | "default";
\t} = $props();`;

const switchPropsFixed = `${toneMap('switch')}

\tlet {
\t\tref = $bindable(null),
\t\tclass: className,
\t\tchecked = $bindable(false),
\t\tsize = "default",
\t\tvariant = "default",
\t\t...restProps
\t}: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
\t\tsize?: "sm" | "default";
\t\tvariant?: keyof typeof TONES;
\t} = $props();`;

const radioPropsStock = `\tlet {
\t\tref = $bindable(null),
\t\tclass: className,
\t\t...restProps
\t}: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> = $props();`;

const radioPropsFixed = `${toneMap('radio-group')}

\tlet {
\t\tref = $bindable(null),
\t\tclass: className,
\t\tvariant = "default",
\t\t...restProps
\t}: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> & {
\t\tvariant?: keyof typeof TONES;
\t} = $props();`;

const controlColorsStock = `border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary`;

const controlColorsFixed = `border-input dark:data-unchecked:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary`;

const classInsertStock = `\t\tclassName`;

const classInsertFixed = `\t\tTONES[variant],
\t\tclassName`;

const switchRootInsertStock = `\t\tclassName
\t)}
\t{...restProps}`;

const switchRootInsertFixed = `\t\tTONES[variant],
\t\tclassName
\t)}
\t{...restProps}`;

const switchThumbStock = `bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full`;

const switchThumbFixed = `bg-background dark:data-unchecked:bg-foreground rounded-full`;

const toggleRow = (tone) =>
	`bg-transparent aria-pressed:bg-${tone} aria-pressed:text-${tone}-foreground aria-pressed:border-${toneBorder(tone)} aria-pressed:hover:bg-${tone}/80 focus-visible:ring-${toneBorder(tone)}/30`;

const toggleOutlineRow = (tone) =>
	`border border-${toneBorder(tone)} bg-transparent text-${toneBorder(tone)} aria-pressed:bg-${tone} aria-pressed:text-${tone}-foreground aria-pressed:border-${toneBorder(tone)} aria-pressed:hover:bg-${tone}/80 focus-visible:ring-${toneBorder(tone)}/30`;

const toggleVariantStock = `\t\t\t\tdefault: "bg-transparent",`;

const toggleVariantFixed = [
	`\t\t\t\tdefault: "bg-transparent focus-visible:ring-primary/30",`,
	...BINARY_TONES.filter((tone) => tone !== 'default').map(
		(tone) => `\t\t\t\t${keyToken(tone)}: "${toggleRow(tone)}",`
	)
].join('\n');

const toggleOutlineStock = `\t\t\t\toutline: "border-input hover:bg-muted border bg-transparent",`;

const toggleOutlineFixed = [
	`\t\t\t\toutline: "border-input aria-[pressed=false]:hover:bg-muted border bg-transparent focus-visible:ring-primary/30",`,
	...BINARY_TONES.filter((tone) => tone !== 'default').map(
		(tone) => `\t\t\t\t${keyToken(`outline-${tone}`)}: "${toggleOutlineRow(tone)}",`
	)
].join('\n');

const toggleBaseStock = `hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[state=on]:bg-muted gap-1 rounded-md text-xs font-medium transition-all [&_svg:not([class*='size-'])]:size-4 group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0`;

const toggleBaseFixed = `aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2 aria-invalid:border-destructive gap-1 rounded-md text-xs font-medium transition-all [&_svg:not([class*='size-'])]:size-4 group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none aria-pressed:hover:bg-primary/80 aria-[pressed=false]:hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0`;

export const BINARY_SITES = [
	binaryProps('checkbox', checkboxPropsStock, checkboxPropsFixed),
	focusSite('checkbox', 'checkbox/checkbox.svelte', 'dark:aria-invalid:border-destructive/50', 30),
	{
		id: 'checkbox-colors',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		stock: controlColorsStock,
		fixed: controlColorsFixed
	},
	{
		id: 'checkbox-insert',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		stock: classInsertStock,
		fixed: classInsertFixed
	},
	binaryProps('switch', switchPropsStock, switchPropsFixed),
	focusSite('switch', 'switch/switch.svelte', 'data-unchecked:bg-input', 30),
	{
		id: 'switch-insert',
		component: 'switch',
		file: 'switch/switch.svelte',
		stock: switchRootInsertStock,
		fixed: switchRootInsertFixed
	},
	{
		id: 'switch-thumb',
		component: 'switch',
		file: 'switch/switch.svelte',
		stock: switchThumbStock,
		fixed: switchThumbFixed
	},
	binaryProps('radio-group', radioPropsStock, radioPropsFixed),
	focusSite('radio-group', 'radio-group/radio-group-item.svelte', 'aria-invalid:border-destructive', 50),
	{
		id: 'radio-group-colors',
		component: 'radio-group',
		file: 'radio-group/radio-group-item.svelte',
		stock: controlColorsStock,
		fixed: controlColorsFixed
	},
	{
		id: 'radio-group-insert',
		component: 'radio-group',
		file: 'radio-group/radio-group-item.svelte',
		stock: classInsertStock,
		fixed: classInsertFixed
	},
	{
		id: 'toggle-tones',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		stock: toggleVariantStock,
		fixed: toggleVariantFixed
	},
	{
		id: 'toggle-outline-tones',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		stock: toggleOutlineStock,
		fixed: toggleOutlineFixed
	},
	{
		id: 'toggle-pressed',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		stock: toggleBaseStock,
		fixed: toggleBaseFixed
	}
];

export const KNOWN_COMPONENTS = [
	...new Set([
		...COMPONENTS,
		...RADIUS_COMPONENTS,
		...SURFACE_COMPONENTS,
		...VARIANT_COMPONENTS,
		...BINARY_COMPONENTS
	])
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
	binarySites: BINARY_SITES,
	binaryComponents: BINARY_COMPONENTS,
	buttonVariants: BUTTON_VARIANTS,
	variantRows: VARIANT_ROWS,
	badgeVariants: BADGE_VARIANTS,
	alertVariants: ALERT_VARIANTS,
	bubbleVariants: BUBBLE_VARIANTS
};
