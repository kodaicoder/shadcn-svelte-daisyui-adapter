import { keyToken } from './render.mjs';
import { insertSite, replaceSite } from './site.mjs';

// Tailwind only emits a class it can read in application source, so each fixed copy under
// `src/lib/components` carries the rows as literal strings. A row follows the base class through
// `cn`, so it wins the merge without `!` and a caller's `class` still wins.
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
const toneBorderClasses = (tone, prefix = '') =>
	STATUS_TONES.has(tone)
		? `${prefix}border-${tone}-text`
		: tone === 'secondary'
			? `${prefix}border-secondary-foreground dark:${prefix}border-secondary`
			: `${prefix}border-${tone}`;

const toneTextClasses = (tone, prefix = '') =>
	STATUS_TONES.has(tone)
		? `${prefix}text-${tone}-text`
		: tone === 'secondary'
			? `${prefix}text-secondary-foreground dark:${prefix}text-secondary`
			: `${prefix}text-${tone}`;
const tokenFor = (tone) => (tone === 'default' ? 'primary' : tone);

const focusSite = (component, file, before, ring) =>
	replaceSite({
		id: `${component}-focus`,
		component,
		file,
		stock: `${before} focus-visible:border-ring focus-visible:ring-ring/${ring}`,
		fixed: before
	});

const toneRow = (component, tone) => {
	const token = tokenFor(tone);
	if (component === 'switch') {
		return `data-checked:bg-${token}/10 ${toneBorderClasses(token, 'data-checked:')} data-checked:[&_[data-slot=switch-thumb]]:bg-${token} focus-visible:ring-${token}/30`;
	}
	if (component === 'radio-group') {
		return `data-checked:bg-${token}/10 data-checked:text-${token} ${toneBorderClasses(token, 'data-checked:')} data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-${token} focus-visible:ring-${token}/30`;
	}
	return `data-checked:bg-${token} data-checked:text-${token}-foreground ${toneBorderClasses(token, 'data-checked:')} focus-visible:ring-${token}/30`;
};

const toneMap = (component) =>
	[
		'\tconst TONES = {',
		...BINARY_TONES.map(
			(tone) => `\t\t${keyToken(tone)}: "${toneRow(component, tone)}",`
		),
		'\t};'
	].join('\n');

const binaryProps = (component, stock, fixed) =>
	replaceSite({
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
\t\tvariant?: BinaryVariant;
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
\t\tvariant?: BinaryVariant;
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
\t\tvariant,
\t\t...restProps
\t}: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> & {
\t\tvariant?: BinaryVariant;
\t} = $props();

\tconst groupVariant = getContext<{ variant: BinaryVariant } | undefined>(
\t\t"radio-group-variant"
\t);
\tconst resolved = $derived(variant ?? groupVariant?.variant ?? "default");`;

const radioRootImportStock = `\timport { cn } from "#lib/utils.js";`;

const radioRootImportFixed = `\timport { setContext } from "svelte";
\timport type { BinaryVariant } from "#lib/components/ui/binary-variant.js";
\timport { cn } from "#lib/utils.js";`;

const radioRootPropsStock = `\tlet {
\t\tref = $bindable(null),
\t\tclass: className,
\t\tvalue = $bindable(""),
\t\t...restProps
\t}: RadioGroupPrimitive.RootProps = $props();`;

const radioRootPropsFixed = `\tlet {
\t\tref = $bindable(null),
\t\tclass: className,
\t\tvalue = $bindable(""),
\t\tvariant = "default",
\t\t...restProps
\t}: RadioGroupPrimitive.RootProps & {
\t\tvariant?: BinaryVariant;
\t} = $props();

\tsetContext("radio-group-variant", {
\t\tget variant() {
\t\t\treturn variant;
\t\t}
\t});`;

const radioItemImportStock = `\timport { cn, type WithoutChildrenOrChild } from "#lib/utils.js";`;

const radioItemImportFixed = `\timport { getContext } from "svelte";
\timport type { BinaryVariant } from "#lib/components/ui/binary-variant.js";
\timport { cn, type WithoutChildrenOrChild } from "#lib/utils.js";`;

const binaryItemImportStock = `\timport { cn, type WithoutChildrenOrChild } from "#lib/utils.js";`;

const binaryItemImportFixed = `\timport type { BinaryVariant } from "#lib/components/ui/binary-variant.js";
\timport { cn, type WithoutChildrenOrChild } from "#lib/utils.js";`;

const radioClassInsertFixed = `\t\tTONES[resolved],
\t\tclassName
\t)}`;

const controlColorsStock = `border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary`;

const controlColorsFixed = `border-input dark:not-data-checked:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary`;

const classInsertStock = `\t\tclassName\n\t)}`;

const classInsertFixed = `\t\tTONES[variant],
\t\tclassName
\t)}`;

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
	`bg-transparent aria-pressed:bg-${tone} aria-pressed:text-${tone}-foreground enabled:aria-pressed:hover:bg-${tone}/80 enabled:aria-[pressed=false]:hover:bg-${tone}/20 focus-visible:ring-${tone}/30`;

// The pressed label for secondary needs the dark twin: the rest state sets `dark:text-secondary`, and dark
// outranks a plain `aria-pressed:` rule, so the single-variant pressed colour would lose and vanish.
const toggleOutlineRow = (tone) =>
	`border ${toneBorderClasses(tone)} bg-transparent ${toneTextClasses(tone)} aria-pressed:bg-${tone} ${
		tone === 'secondary'
			? 'aria-pressed:text-secondary-foreground dark:aria-pressed:text-secondary-foreground'
			: `aria-pressed:text-${tone}-foreground`
	} ${toneBorderClasses(tone, 'aria-pressed:')} enabled:aria-pressed:hover:bg-${tone}/80 enabled:aria-[pressed=false]:hover:bg-${tone}/20 focus-visible:ring-${tone}/30`;

const toggleVariantStock = `\t\t\t\tdefault: "bg-transparent",`;

const toggleVariantFixed = [
	`\t\t\t\tdefault: "bg-transparent enabled:aria-[pressed=false]:hover:bg-primary/20 focus-visible:ring-primary/30",`,
	...BINARY_TONES.filter((tone) => tone !== 'default').map(
		(tone) => `\t\t\t\t${keyToken(tone)}: "${toggleRow(tone)}",`
	)
].join('\n');

const toggleOutlineStock = `\t\t\t\toutline: "border-input hover:bg-muted border bg-transparent",`;

const toggleOutlineFixed = [
	`\t\t\t\toutline: "border border-input enabled:aria-[pressed=false]:hover:bg-primary/20 bg-transparent focus-visible:ring-primary/30",`,
	...BINARY_TONES.filter((tone) => tone !== 'default').map(
		(tone) => `\t\t\t\t${keyToken(`outline-${tone}`)}: "${toggleOutlineRow(tone)}",`
	)
].join('\n');

const togglePressedStock = `hover:text-foreground aria-pressed:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[state=on]:bg-muted`;

const togglePressedFixed = `aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2 aria-invalid:border-destructive`;

const toggleHoverStock = `hover:bg-muted focus-visible:ring-[3px]`;

const toggleHoverFixed = `enabled:aria-pressed:hover:bg-primary/80 focus-visible:ring-[3px]`;

export const BINARY_SITES = [
	{
		id: 'checkbox-imports',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		position: 'insert',
		stock: binaryItemImportStock,
		fixed: binaryItemImportFixed
	},
	binaryProps('checkbox', checkboxPropsStock, checkboxPropsFixed),
	focusSite('checkbox', 'checkbox/checkbox.svelte', 'dark:aria-invalid:border-destructive/50', 30),
	{
		id: 'checkbox-field-label',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		position: 'replace',
		stock:
			'group-has-disabled/field:opacity-50 focus-visible:ring-2 aria-invalid:ring-2 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input group-has-[:focus-visible]/field-label:data-checked:border-primary',
		fixed: 'focus-visible:ring-2 group-has-disabled/field:opacity-50 aria-invalid:ring-2'
	},
	{
		id: 'checkbox-colors',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		position: 'replace',
		stock: controlColorsStock,
		fixed: controlColorsFixed
	},
	{
		id: 'checkbox-insert',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		position: 'insert',
		stock: classInsertStock,
		fixed: classInsertFixed
	},
	{
		id: 'switch-imports',
		component: 'switch',
		file: 'switch/switch.svelte',
		position: 'insert',
		stock: binaryItemImportStock,
		fixed: binaryItemImportFixed
	},
	binaryProps('switch', switchPropsStock, switchPropsFixed),
	focusSite('switch', 'switch/switch.svelte', 'data-unchecked:bg-input', 30),
	{
		id: 'switch-field-label',
		component: 'switch',
		file: 'switch/switch.svelte',
		position: 'replace',
		stock:
			'aria-invalid:ring-2 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:border-transparent data-[size=default]:h-[16.6px]',
		fixed: 'data-[size=default]:h-[16.6px] aria-invalid:ring-2'
	},
	{
		id: 'switch-insert',
		component: 'switch',
		file: 'switch/switch.svelte',
		position: 'insert',
		stock: switchRootInsertStock,
		fixed: switchRootInsertFixed
	},
	{
		id: 'switch-thumb',
		component: 'switch',
		file: 'switch/switch.svelte',
		position: 'replace',
		stock: switchThumbStock,
		fixed: switchThumbFixed
	},
	{
		id: 'radio-group-root-imports',
		component: 'radio-group',
		file: 'radio-group/radio-group.svelte',
		position: 'insert',
		stock: radioRootImportStock,
		fixed: radioRootImportFixed
	},
	{
		id: 'radio-group-root-props',
		component: 'radio-group',
		file: 'radio-group/radio-group.svelte',
		position: 'replace',
		stock: radioRootPropsStock,
		fixed: radioRootPropsFixed
	},
	{
		id: 'radio-group-imports',
		component: 'radio-group',
		file: 'radio-group/radio-group-item.svelte',
		position: 'insert',
		stock: radioItemImportStock,
		fixed: radioItemImportFixed
	},
	binaryProps('radio-group', radioPropsStock, radioPropsFixed),
	focusSite('radio-group', 'radio-group/radio-group-item.svelte', 'aria-invalid:border-destructive', 50),
	{
		id: 'radio-group-field-label',
		component: 'radio-group',
		file: 'radio-group/radio-group-item.svelte',
		position: 'replace',
		stock:
			'aria-invalid:ring-3 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input group-has-[:focus-visible]/field-label:data-checked:border-primary group/radio-group-item',
		fixed: 'group/radio-group-item aria-invalid:ring-3'
	},
	{
		id: 'radio-group-colors',
		component: 'radio-group',
		file: 'radio-group/radio-group-item.svelte',
		position: 'replace',
		stock: controlColorsStock,
		fixed: controlColorsFixed
	},
	{
		id: 'radio-group-insert',
		component: 'radio-group',
		file: 'radio-group/radio-group-item.svelte',
		position: 'insert',
		stock: classInsertStock,
		fixed: radioClassInsertFixed
	},
	{
		id: 'toggle-tones',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		position: 'replace',
		stock: toggleVariantStock,
		fixed: toggleVariantFixed
	},
	{
		id: 'toggle-outline-tones',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		position: 'replace',
		stock: toggleOutlineStock,
		fixed: toggleOutlineFixed
	},
	{
		id: 'toggle-pressed',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		position: 'replace',
		stock: togglePressedStock,
		fixed: togglePressedFixed
	},
	{
		id: 'toggle-hover',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		position: 'replace',
		stock: toggleHoverStock,
		fixed: toggleHoverFixed
	}
];
