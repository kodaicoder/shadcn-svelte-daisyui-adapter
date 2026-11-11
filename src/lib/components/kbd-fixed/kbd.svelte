<script lang="ts" module>
	const KBD_TONES = {
		default: "bg-primary/15 dark:bg-primary/25 text-foreground border-b-2 border-primary/60 dark:border-primary/60 rounded-sm",
		secondary: "bg-secondary-foreground/15 dark:bg-secondary/25 text-foreground border-b-2 border-secondary-foreground/60 dark:border-secondary/60 rounded-sm",
		success: "bg-success/15 dark:bg-success/25 text-foreground border-b-2 border-success/60 dark:border-success/60 rounded-sm",
		warning: "bg-warning/15 dark:bg-warning/25 text-foreground border-b-2 border-warning/60 dark:border-warning/60 rounded-sm",
		info: "bg-info/15 dark:bg-info/25 text-foreground border-b-2 border-info/60 dark:border-info/60 rounded-sm",
		destructive: "bg-destructive/15 dark:bg-destructive/25 text-foreground border-b-2 border-destructive/60 dark:border-destructive/60 rounded-sm",
		blackwhite: "bg-blackwhite/15 dark:bg-blackwhite/25 text-foreground border-b-2 border-blackwhite/60 dark:border-blackwhite/60 rounded-sm",
	} as const;

	export type KbdVariant = keyof typeof KBD_TONES;
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		variant = "default",
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> & { variant?: KbdVariant } = $props();
</script>

<kbd
	bind:this={ref}
	data-slot="kbd"
	class={cn(
		"bg-muted text-muted-foreground in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 h-5.5 w-fit min-w-5.5 gap-1 rounded-none px-1.5 font-sans text-sm font-medium [&_svg:not([class*='size-'])]:size-3 in-data-[slot=input-group]:bg-input pointer-events-none inline-flex items-center justify-center select-none",
		KBD_TONES[variant],
		className
	)}
	{...restProps}
>
	{@render children?.()}
</kbd>
