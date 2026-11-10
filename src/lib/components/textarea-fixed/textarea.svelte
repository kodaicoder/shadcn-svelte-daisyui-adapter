<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "#lib/utils.js";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		value = $bindable(),
		size = "default",
		class: className,
		"data-slot": dataSlot = "textarea",
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> & {
		size?: "sm" | "default" | "lg";
	} = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	data-size={size}
	class={cn(
		"border-input bg-input/20 dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 resize-none rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg border px-2 py-2 data-[size=sm]:min-h-12 data-[size=sm]:py-1.5 data-[size=sm]:text-[0.625rem] data-[size=lg]:min-h-20 data-[size=lg]:py-2.5 data-[size=lg]:text-sm text-xs/relaxed transition-colors focus-visible:ring-2 aria-invalid:ring-2 flex field-sizing-content min-h-16 w-full outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value
	{...restProps}></textarea>
