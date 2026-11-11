<script lang="ts" module>
	const SEPARATOR_TONES = {
		neutral: "bg-foreground/20 dark:bg-foreground/25",
		default: "bg-primary/60 dark:bg-primary",
		secondary: "bg-secondary-foreground/60 dark:bg-secondary",
		success: "bg-success/60 dark:bg-success",
		warning: "bg-warning/60 dark:bg-warning",
		info: "bg-info/60 dark:bg-info",
		destructive: "bg-destructive/60 dark:bg-destructive",
		blackwhite: "bg-blackwhite/60 dark:bg-blackwhite",
	} as const;

	export type SeparatorVariant = keyof typeof SEPARATOR_TONES;
</script>

<script lang="ts">
	import { Separator as SeparatorPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		variant = "neutral",
		"data-slot": dataSlot = "separator",
		...restProps
	}: SeparatorPrimitive.RootProps & { variant?: SeparatorVariant } = $props();
</script>

<SeparatorPrimitive.Root
	bind:ref
	data-slot={dataSlot}
	class={cn(
		"shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
		SEPARATOR_TONES[variant],
		className
	)}
	{...restProps}
/>
