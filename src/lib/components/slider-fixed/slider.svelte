<script lang="ts" module>
	const SLIDER_TONES = {
		default: "bg-primary",
		secondary: "bg-secondary-foreground dark:bg-secondary",
		success: "bg-success",
		warning: "bg-warning",
		info: "bg-info",
		destructive: "bg-destructive",
		blackwhite: "bg-blackwhite",
	} as const;

	export type SliderVariant = keyof typeof SLIDER_TONES;

	const SLIDER_THUMBS = {
		default: "bg-primary ring-primary/30",
		secondary: "bg-secondary-foreground dark:bg-secondary ring-secondary-foreground/30 dark:ring-secondary/30",
		success: "bg-success ring-success/30",
		warning: "bg-warning ring-warning/30",
		info: "bg-info ring-info/30",
		destructive: "bg-destructive ring-destructive/30",
		blackwhite: "bg-blackwhite ring-blackwhite/30",
	} as const;
</script>

<script lang="ts">
	import { Slider as SliderPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		value = $bindable(),
		orientation = "horizontal",
		variant = "default",
		class: className,
		...restProps
	}: WithoutChildrenOrChild<SliderPrimitive.RootProps> & { variant?: SliderVariant } = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="slider"
	{orientation}
	class={cn(
		"data-vertical:min-h-40 relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:w-auto data-vertical:flex-col",
		className
	)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span
			data-slot="slider-track"
			data-orientation={orientation}
			class={cn(
				"bg-foreground/15 dark:bg-foreground/20 rounded-full data-horizontal:h-0.5 data-horizontal:w-full data-vertical:h-full data-vertical:w-0.5 relative grow overflow-hidden data-horizontal:w-full data-vertical:h-full"
			)}
		>
			<SliderPrimitive.Range
				data-slot="slider-range"
				class={cn(
					"absolute select-none data-horizontal:h-full data-vertical:w-full",
					SLIDER_TONES[variant]
				)}
			/>
		</span>
		{#each thumbItems as thumb (thumb.index)}
			<SliderPrimitive.Thumb
				data-slot="slider-thumb"
				index={thumb.index}
				class={cn("size-3 border-none rounded-full transition-colors hover:ring-2 focus-visible:ring-3 focus-visible:outline-hidden block shrink-0 select-none disabled:pointer-events-none disabled:opacity-50", SLIDER_THUMBS[variant])}
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
