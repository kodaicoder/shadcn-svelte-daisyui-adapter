<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from "bits-ui";
	import CheckIcon from '@lucide/svelte/icons/check';
	import MinusIcon from '@lucide/svelte/icons/minus';
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	const TONES = {
		default: "data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary focus-visible:ring-primary/30",
		secondary: "data-checked:bg-secondary data-checked:text-secondary-foreground data-checked:border-secondary-foreground dark:data-checked:border-secondary focus-visible:ring-secondary/30",
		success: "data-checked:bg-success data-checked:text-success-foreground data-checked:border-success-text focus-visible:ring-success/30",
		warning: "data-checked:bg-warning data-checked:text-warning-foreground data-checked:border-warning-text focus-visible:ring-warning/30",
		info: "data-checked:bg-info data-checked:text-info-foreground data-checked:border-info-text focus-visible:ring-info/30",
		destructive: "data-checked:bg-destructive data-checked:text-destructive-foreground data-checked:border-destructive-text focus-visible:ring-destructive/30",
		blackwhite: "data-checked:bg-blackwhite data-checked:text-blackwhite-foreground data-checked:border-blackwhite focus-visible:ring-blackwhite/30",
	};

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		indeterminate = $bindable(false),
		class: className,
		variant = "default",
		...restProps
	}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> & {
		variant?: keyof typeof TONES;
	} = $props();
</script>

<CheckboxPrimitive.Root
	bind:ref
	data-slot="checkbox"
	class={cn(
		"border-input dark:not-data-checked:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex size-4 items-center justify-center rounded-sm border transition-shadow focus-visible:ring-2 group-has-disabled/field:opacity-50 aria-invalid:ring-2 peer relative shrink-0 cursor-pointer outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
		TONES[variant],
		className
	)}
	bind:checked
	bind:indeterminate
	{...restProps}
>
	{#snippet children({ checked, indeterminate })}
		<div
			data-slot="checkbox-indicator"
			class="[&>svg]:size-3.5 grid place-content-center text-current"
		>
			<CheckIcon
				class="col-start-1 row-start-1 transition-all duration-150 {checked && !indeterminate
					? 'scale-100 opacity-100'
					: 'scale-0 opacity-0'}"
			/>
			<MinusIcon
				class="col-start-1 row-start-1 transition-all duration-150 {indeterminate
					? 'scale-100 opacity-100'
					: 'scale-0 opacity-0'}"
			/>
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
