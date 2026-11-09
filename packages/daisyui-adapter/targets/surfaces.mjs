import { replaceSite } from './site.mjs';

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
].map(replaceSite);
