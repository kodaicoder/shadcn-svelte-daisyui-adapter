<script lang="ts" module>
	const FIELD_TONES = {
		default: "border-primary focus-visible:border-primary focus-visible:ring-primary/30",
		secondary: "border-secondary-foreground dark:border-secondary focus-visible:border-secondary-foreground dark:focus-visible:border-secondary focus-visible:ring-secondary/30",
		success: "border-success-text focus-visible:border-success-text focus-visible:ring-success/30",
		warning: "border-warning-text focus-visible:border-warning-text focus-visible:ring-warning/30",
		info: "border-info-text focus-visible:border-info-text focus-visible:ring-info/30",
		destructive: "border-destructive-text focus-visible:border-destructive-text focus-visible:ring-destructive/30",
		blackwhite: "border-blackwhite focus-visible:border-blackwhite focus-visible:ring-blackwhite/30",
	} as const;

	export type FieldVariant = keyof typeof FIELD_TONES;
</script>

<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "#lib/utils.js";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		value = $bindable(),
		size = "default",
		variant = "default",
		class: className,
		"data-slot": dataSlot = "textarea",
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> & {
		size?: "sm" | "default" | "lg";
	} & { variant?: FieldVariant } = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	data-size={size}
	class={cn(
		"border-input bg-input/20 dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 resize-none rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg border px-2 py-2 data-[size=sm]:min-h-12 data-[size=sm]:text-[0.625rem] data-[size=lg]:min-h-20 data-[size=lg]:text-sm text-xs/relaxed transition-colors read-only:enabled:cursor-default read-only:enabled:bg-muted/50 dark:read-only:enabled:bg-muted/50 focus-visible:ring-2 aria-invalid:ring-2 flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
		FIELD_TONES[variant],
		className
	)}
	bind:value
	{...restProps}></textarea>
