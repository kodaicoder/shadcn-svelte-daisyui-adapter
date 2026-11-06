<script lang="ts">
	import { Switch as SwitchPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "#lib/utils.js";

	const TONES = {
		default: "data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary data-checked:[&_[data-slot=switch-thumb]]:bg-primary-foreground",
		secondary: "data-checked:bg-secondary data-checked:text-secondary-foreground data-checked:border-secondary data-checked:[&_[data-slot=switch-thumb]]:bg-secondary-foreground",
		success: "data-checked:bg-success data-checked:text-success-foreground data-checked:border-success-text data-checked:[&_[data-slot=switch-thumb]]:bg-success-foreground",
		warning: "data-checked:bg-warning data-checked:text-warning-foreground data-checked:border-warning-text data-checked:[&_[data-slot=switch-thumb]]:bg-warning-foreground",
		info: "data-checked:bg-info data-checked:text-info-foreground data-checked:border-info-text data-checked:[&_[data-slot=switch-thumb]]:bg-info-foreground",
		destructive: "data-checked:bg-destructive data-checked:text-destructive-foreground data-checked:border-destructive-text data-checked:[&_[data-slot=switch-thumb]]:bg-destructive-foreground",
		blackwhite: "data-checked:bg-blackwhite data-checked:text-blackwhite-foreground data-checked:border-blackwhite data-checked:[&_[data-slot=switch-thumb]]:bg-blackwhite-foreground",
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
		variant?: keyof typeof TONES;
	} = $props();
</script>

<SwitchPrimitive.Root
	bind:ref
	bind:checked
	data-slot="switch"
	data-size={size}
	class={cn(
		"data-checked:bg-primary data-unchecked:bg-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 dark:data-unchecked:bg-input/80 shrink-0 border border-transparent rounded-full focus-visible:ring-2 aria-invalid:ring-2 group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:border-transparent data-[size=default]:h-[16.6px] data-[size=default]:w-[28px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50",
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
