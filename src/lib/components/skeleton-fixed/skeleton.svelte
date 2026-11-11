<script lang="ts" module>
	const SKELETON_TONES = {
		neutral: "bg-foreground/10 dark:bg-foreground/15",
		default: "bg-primary/15 dark:bg-primary/25",
		secondary: "bg-secondary-foreground/15 dark:bg-secondary/25",
		success: "bg-success/15 dark:bg-success/25",
		warning: "bg-warning/15 dark:bg-warning/25",
		info: "bg-info/15 dark:bg-info/25",
		destructive: "bg-destructive/15 dark:bg-destructive/25",
		blackwhite: "bg-blackwhite/15 dark:bg-blackwhite/25",
	} as const;

	export type SkeletonVariant = keyof typeof SKELETON_TONES;
</script>

<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		variant = "neutral",
		class: className,
		...restProps
	}: WithoutChildren<WithElementRef<HTMLAttributes<HTMLDivElement>>> & { variant?: SkeletonVariant } = $props();
</script>

<div
	bind:this={ref}
	data-slot="skeleton"
	class={cn("animate-pulse rounded-sm", SKELETON_TONES[variant], className)}
	{...restProps}
></div>
