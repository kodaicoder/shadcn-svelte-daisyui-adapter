<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
	import CircleIcon from '@lucide/svelte/icons/circle';
	import { getContext } from "svelte";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	const TONES = {
		default: "data-checked:bg-primary/10 data-checked:text-primary data-checked:border-primary data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-primary focus-visible:ring-primary/30",
		secondary: "data-checked:bg-secondary/10 data-checked:text-secondary data-checked:border-secondary-foreground dark:data-checked:border-secondary data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-secondary focus-visible:ring-secondary/30",
		success: "data-checked:bg-success/10 data-checked:text-success data-checked:border-success-text data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-success focus-visible:ring-success/30",
		warning: "data-checked:bg-warning/10 data-checked:text-warning data-checked:border-warning-text data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-warning focus-visible:ring-warning/30",
		info: "data-checked:bg-info/10 data-checked:text-info data-checked:border-info-text data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-info focus-visible:ring-info/30",
		destructive: "data-checked:bg-destructive/10 data-checked:text-destructive data-checked:border-destructive-text data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-destructive focus-visible:ring-destructive/30",
		blackwhite: "data-checked:bg-blackwhite/10 data-checked:text-blackwhite data-checked:border-blackwhite data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-blackwhite focus-visible:ring-blackwhite/30",
	};

	let {
		ref = $bindable(null),
		class: className,
		variant,
		...restProps
	}: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> & {
		variant?: keyof typeof TONES;
	} = $props();

	const groupVariant = getContext<{ variant: keyof typeof TONES } | undefined>(
		"radio-group-variant"
	);
	const resolved = $derived(variant ?? groupVariant?.variant ?? "default");
</script>

<RadioGroupPrimitive.Item
	bind:ref
	data-slot="radio-group-item"
	class={cn(
		"border-input dark:not-data-checked:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50 flex size-4 rounded-full focus-visible:ring-3 group/radio-group-item aria-invalid:ring-3 peer relative aspect-square shrink-0 cursor-pointer border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
		TONES[resolved],
		className
	)}
	{...restProps}
>
	{#snippet children({ checked })}
		<div data-slot="radio-group-indicator" class="flex size-4 items-center justify-center">
			{#if checked}
				<CircleIcon class="bg-primary-foreground absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full" />
			{/if}
		</div>
	{/snippet}
</RadioGroupPrimitive.Item>
