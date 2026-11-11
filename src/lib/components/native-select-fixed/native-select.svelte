<script lang="ts" module>
	const FIELD_TONES = {
		default: "border-primary/70 focus-visible:border-primary focus-visible:ring-primary/30",
		secondary: "border-secondary/70 focus-visible:border-secondary focus-visible:ring-secondary/30",
		success: "border-success-text/70 focus-visible:border-success-text focus-visible:ring-success/30",
		warning: "border-warning/70 focus-visible:border-warning focus-visible:ring-warning/30",
		info: "border-info-text/70 focus-visible:border-info-text focus-visible:ring-info/30",
		destructive: "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/30",
		blackwhite: "border-blackwhite/70 focus-visible:border-blackwhite focus-visible:ring-blackwhite/30",
	} as const;

	export type FieldVariant = keyof typeof FIELD_TONES;
</script>

<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLSelectAttributes } from "svelte/elements";

	type NativeSelectProps = Omit<WithElementRef<HTMLSelectAttributes, HTMLSelectElement>, "size"> & { variant?: FieldVariant } & {
		size?: "sm" | "default" | "lg";
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		size = "default",
		variant = "default",
		children,
		...restProps
	}: NativeSelectProps = $props();
</script>

<div
	class={cn(
		"group/native-select relative w-fit has-[select:disabled]:opacity-50",
		className
	)}
	data-slot="native-select-wrapper"
	data-size={size}
>
	<select
		bind:value
		bind:this={ref}
		data-slot="native-select"
		data-size={size}
		class={cn("border-input bg-input/20 placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:enabled:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 h-7 w-full min-w-0 appearance-none rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg border py-0.5 pr-6 pl-2 text-sm transition-colors select-none focus-visible:ring-2 aria-invalid:ring-2 data-[size=sm]:h-6 data-[size=sm]:pl-1.5 data-[size=sm]:text-xs data-[size=default]:pl-[0.4375rem] data-[size=lg]:h-8 data-[size=lg]:text-base outline-none disabled:cursor-not-allowed", FIELD_TONES[variant])}
		{...restProps}
	>
		{@render children?.()}
	</select>
	<ChevronDownIcon class="text-muted-foreground top-1/2 right-1.5 size-3.5 -translate-y-1/2 group-data-[size=sm]/native-select:size-3 group-data-[size=sm]/native-select:-translate-y-[calc(--spacing(1.25))] pointer-events-none absolute select-none" aria-hidden data-slot="native-select-icon" />
</div>
