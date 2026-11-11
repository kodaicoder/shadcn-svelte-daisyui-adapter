<script lang="ts" module>
	const PROGRESS_TONES = {
		default: "bg-primary",
		secondary: "bg-secondary-foreground dark:bg-secondary",
		success: "bg-success-text",
		warning: "bg-warning-text",
		info: "bg-info-text",
		destructive: "bg-destructive-text",
		blackwhite: "bg-blackwhite",
	} as const;

	export type ProgressVariant = keyof typeof PROGRESS_TONES;
</script>

<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		max = 100,
		value,
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> & { variant?: ProgressVariant } = $props();
</script>

<ProgressPrimitive.Root
	bind:ref
	data-slot="progress"
	class={cn("bg-foreground/15 dark:bg-foreground/20 h-0.5 rounded-none relative flex w-full items-center overflow-x-hidden", className)}
	{value}
	{max}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		class={cn("size-full flex-1 transition-all", PROGRESS_TONES[variant])}
		style="transform: translateX(-{100 - (100 * (value ?? 0)) / (max ?? 1)}%)"
	></div>
</ProgressPrimitive.Root>
