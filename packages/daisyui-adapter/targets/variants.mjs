import { keyToken } from './render.mjs';

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
	const block = [
		...(open ? ['variant: {'] : []),
		...lead.map(line),
		...rows.map((row) => `\t\t\t\t${keyToken(row.key)}: "${row.class}",`),
		...trail.map(line),
		'\t\t\t}'
	].join('\n');
	// A disabled button still matches :hover in Chrome, so every fixed hover is guarded. Native buttons
	// use :disabled and anchors use aria-disabled, so the guard tests both.
	return fixed && component === 'button'
		? block.replace(/\bhover:/g, 'not-aria-disabled:not-disabled:hover:')
		: block;
};

const stockRowsOf = (component) =>
	rowsOf(component)
		.slice(0, 1)
		.map((row) => ({ ...row, class: VARIANT_STOCK_CLASS[component] ?? row.class }));

export const VARIANTS = VARIANT_COMPONENTS.map((component) => ({
	id: `${component}-variants`,
	component,
	file: VARIANT_FILES[component],
	position: 'replace',
	stock: renderVariantBlock(component, stockRowsOf(component)),
	fixed: renderVariantBlock(component, rowsOf(component), true)
}));
