<script lang="ts">
	import { Switch as SwitchPrimitive } from "bits-ui";
	import type { BinaryVariant } from "#lib/components/ui/binary-variant.js";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	const TONES = {
		default: "data-checked:bg-primary/10 data-checked:border-primary data-checked:[&_[data-slot=switch-thumb]]:bg-primary focus-visible:ring-primary/30",
		secondary: "data-checked:bg-secondary/10 data-checked:border-secondary-foreground dark:data-checked:border-secondary data-checked:[&_[data-slot=switch-thumb]]:bg-secondary focus-visible:ring-secondary/30",
		success: "data-checked:bg-success/10 data-checked:border-success-text data-checked:[&_[data-slot=switch-thumb]]:bg-success focus-visible:ring-success/30",
		warning: "data-checked:bg-warning/10 data-checked:border-warning-text data-checked:[&_[data-slot=switch-thumb]]:bg-warning focus-visible:ring-warning/30",
		info: "data-checked:bg-info/10 data-checked:border-info-text data-checked:[&_[data-slot=switch-thumb]]:bg-info focus-visible:ring-info/30",
		destructive: "data-checked:bg-destructive/10 data-checked:border-destructive-text data-checked:[&_[data-slot=switch-thumb]]:bg-destructive focus-visible:ring-destructive/30",
		blackwhite: "data-checked:bg-blackwhite/10 data-checked:border-blackwhite data-checked:[&_[data-slot=switch-thumb]]:bg-blackwhite focus-visible:ring-blackwhite/30",
	};

	let {
		ref = $bindable(null),
		class: className,
		checked = $bindable(false),
		size = "default",
		variant = "default",
		...restProps
	}: WithoutChildrenOrChild<SwitchPrimitive.RootProps> & {
		size?: "sm" | "default";
		variant?: BinaryVariant;
	} = $props();
</script>

<SwitchPrimitive.Root
	bind:ref
	bind:checked
	data-slot="switch"
	data-size={size}
	class={cn(
		"data-checked:bg-primary data-unchecked:bg-input aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 shrink-0 border border-transparent rounded-full focus-visible:ring-3 data-[size=default]:h-[16.6px] aria-invalid:ring-3 data-[size=default]:w-[28px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] peer group/switch relative inline-flex cursor-pointer items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
		TONES[variant],
		className
	)}
	{...restProps}
>
	<SwitchPrimitive.Thumb
		data-slot="switch-thumb"
		class={cn(
			"bg-background dark:data-unchecked:bg-foreground rounded-full group-data-[size=default]/switch:size-3.5 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%_-_2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%_-_2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 pointer-events-none block ring-0 transition-transform",
			"rtl:data-[state=checked]:translate-x-[calc(-100%)]"
		)}
	/>
</SwitchPrimitive.Root>
