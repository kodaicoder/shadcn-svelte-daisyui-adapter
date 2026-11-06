<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
	import CircleIcon from '@lucide/svelte/icons/circle';
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	const TONES = {
		default: "data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-primary-foreground",
		secondary: "data-checked:bg-secondary data-checked:text-secondary-foreground data-checked:border-secondary data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-secondary-foreground",
		success: "data-checked:bg-success data-checked:text-success-foreground data-checked:border-success-text data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-success-foreground",
		warning: "data-checked:bg-warning data-checked:text-warning-foreground data-checked:border-warning-text data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-warning-foreground",
		info: "data-checked:bg-info data-checked:text-info-foreground data-checked:border-info-text data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-info-foreground",
		destructive: "data-checked:bg-destructive data-checked:text-destructive-foreground data-checked:border-destructive-text data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-destructive-foreground",
		blackwhite: "data-checked:bg-blackwhite data-checked:text-blackwhite-foreground data-checked:border-blackwhite data-checked:[&_[data-slot=radio-group-indicator]>svg]:bg-blackwhite-foreground",
	};

	let {
		ref = $bindable(null),
		class: className,
		variant = "default",
		...restProps
	}: WithoutChildrenOrChild<RadioGroupPrimitive.ItemProps> & {
		variant?: keyof typeof TONES;
	} = $props();
</script>

<RadioGroupPrimitive.Item
	bind:ref
	data-slot="radio-group-item"
	class={cn(
		"border-input dark:data-unchecked:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:aria-invalid:border-destructive/50 flex size-4 rounded-full focus-visible:ring-3 aria-invalid:ring-3 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input group-has-[:focus-visible]/field-label:data-checked:border-primary group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
		TONES[variant],
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
