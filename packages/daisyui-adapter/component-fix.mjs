// The `stock` strings are the shadcn-svelte 1.7.x `mira` template, not markup this repo owns.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

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

// A `#` alias is a package.json subpath import and can point anywhere, so the project's own
// `imports` map wins over the convention below. `$lib` is SvelteKit's fixed lib alias; `@/` and
// `~/` are the src-relative forms shadcn writes.
const readImports = (root) => {
	const path = join(root, 'package.json');
	if (!existsSync(path)) return [];
	return Object.entries(JSON.parse(readFileSync(path, 'utf8')).imports ?? {})
		.filter(
			([key, value]) => key.endsWith('/*') && typeof value === 'string' && value.endsWith('/*')
		)
		.sort(([a], [b]) => b.length - a.length);
};

const resolveAlias = (alias, root) => {
	for (const [key, value] of readImports(root)) {
		const prefix = key.slice(0, -2);
		if (alias !== prefix && !alias.startsWith(`${prefix}/`)) continue;
		return resolve(root, value.slice(0, -1), alias.slice(prefix.length).replace(/^[/\\]/, ''));
	}
	const lib = (rest) => resolve(root, 'src', 'lib', rest.replace(/^[/\\]/, ''));
	if (alias === '$lib' || alias.startsWith('$lib/')) return lib(alias.slice(4));
	if (alias === '#lib' || alias.startsWith('#lib/')) return lib(alias.slice(4));
	if (alias.startsWith('@/')) return resolve(root, 'src', alias.slice(2));
	if (alias.startsWith('~/')) return resolve(root, 'src', alias.slice(2));
	if (isAbsolute(alias) || alias.startsWith('.')) return resolve(root, alias);
	return resolve(root, 'src', alias);
};

export function uiDirectory(componentsJson = {}, root = process.cwd()) {
	const aliases = componentsJson.aliases ?? {};
	if (!aliases.ui && !aliases.components) return resolve(root, 'src', 'lib', 'components', 'ui');
	return resolveAlias(aliases.ui ?? `${aliases.components}/ui`, root);
}

const stateOf = (content, site) => {
	if (content.includes(site.fixed)) return 'fixed';
	if (content.includes(site.stock)) return 'stock';
	return 'customized';
};

const targetSites = (names) => {
	if (names.length === 0) return SITES;
	for (const name of names) {
		if (!COMPONENTS.includes(name)) {
			throw new Error(
				`[daisyui-adapter] unknown fix target "${name}". Known targets: ${COMPONENTS.join(', ')}`
			);
		}
	}
	return SITES.filter((site) => names.includes(site.component));
};

export function fix({ root = process.cwd(), components, names = [], dryRun = false } = {}) {
	const directory = uiDirectory(components, root);
	const groups = new Map();
	for (const site of targetSites(names)) {
		const group = groups.get(site.file) ?? [];
		group.push(site);
		groups.set(site.file, group);
	}

	const sites = [];
	for (const [file, group] of groups) {
		const path = join(directory, ...file.split('/'));
		if (!existsSync(path)) {
			for (const site of group) {
				sites.push({
					id: site.id,
					component: site.component,
					file,
					state: 'missing',
					written: false
				});
			}
			continue;
		}

		const raw = readFileSync(path, 'utf8');
		const crlf = raw.includes('\r\n');
		let content = crlf ? raw.replace(/\r\n/g, '\n') : raw;
		const states = group.map((site) => ({ site, state: stateOf(content, site), written: false }));

		if (!dryRun) {
			for (const entry of states) {
				if (entry.state !== 'stock') continue;
				content = content.split(entry.site.stock).join(entry.site.fixed);
				entry.written = true;
			}
			const changed = states.some((entry) => entry.written);
			if (changed) writeFileSync(path, crlf ? content.replace(/\n/g, '\r\n') : content);
		}

		for (const entry of states) {
			sites.push({
				id: entry.site.id,
				component: entry.site.component,
				file,
				state: entry.state,
				written: entry.written
			});
		}
	}

	const counts = { stock: 0, fixed: 0, customized: 0, missing: 0 };
	for (const site of sites) counts[site.state] += 1;
	return { sites, counts };
}
