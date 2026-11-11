<script lang="ts" module>
	const SKELETON_TONES = {
		neutral: "bg-foreground/15 dark:bg-foreground/20",
		default: "bg-primary/25 dark:bg-primary/30",
		secondary: "bg-secondary-foreground/25 dark:bg-secondary/30",
		success: "bg-success/25 dark:bg-success/30",
		warning: "bg-warning/25 dark:bg-warning/30",
		info: "bg-info/25 dark:bg-info/30",
		destructive: "bg-destructive/25 dark:bg-destructive/50",
		blackwhite: "bg-blackwhite/25 dark:bg-blackwhite/30",
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
