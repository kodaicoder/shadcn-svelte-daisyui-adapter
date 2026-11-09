import { replaceSite } from './site.mjs';

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
].map(replaceSite);

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
