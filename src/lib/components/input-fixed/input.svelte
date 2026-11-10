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
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLInputAttributes, HTMLInputTypeAttribute } from "svelte/elements";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type" | "size"> &
			({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined }) & {
				size?: "sm" | "default" | "lg";
			}
	> & { variant?: FieldVariant };

	let {
		ref = $bindable(null),
		value = $bindable(),
		type,
		size = "default",
		variant = "default",
		files = $bindable(),
		class: className,
		"data-slot": dataSlot = "input",
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		data-size={size}
		class={cn(
			"bg-input/20 dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-7 rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg border px-2 py-0.5 data-[size=sm]:h-6 data-[size=sm]:text-[0.625rem] data-[size=lg]:h-8 data-[size=lg]:text-sm text-xs/relaxed transition-colors read-only:cursor-default read-only:bg-muted/50 dark:read-only:bg-muted/50 file:h-6 file:text-xs/relaxed data-[size=sm]:file:text-[0.625rem] data-[size=lg]:file:text-sm file:font-medium focus-visible:ring-2 aria-invalid:ring-2 w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
			FIELD_TONES[variant],
			className
		)}
		type="file"
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		data-slot={dataSlot}
		data-size={size}
		class={cn(
			"bg-input/20 dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-7 rounded-md data-[size=sm]:rounded-sm data-[size=lg]:rounded-lg border px-2 py-0.5 data-[size=sm]:h-6 data-[size=sm]:text-[0.625rem] data-[size=lg]:h-8 data-[size=lg]:text-sm text-xs/relaxed transition-colors read-only:cursor-default read-only:bg-muted/50 dark:read-only:bg-muted/50 file:h-6 file:text-xs/relaxed data-[size=sm]:file:text-[0.625rem] data-[size=lg]:file:text-sm file:font-medium focus-visible:ring-2 aria-invalid:ring-2 w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
			FIELD_TONES[variant],
			className
		)}
		{type}
		bind:value
		{...restProps}
	/>
{/if}
