<script lang="ts" module>
	const SPINNER_TONES = {
		default: "text-primary",
		secondary: "text-secondary-foreground dark:text-secondary",
		success: "text-success-text",
		warning: "text-warning-text",
		info: "text-info-text",
		destructive: "text-destructive-text",
		blackwhite: "text-blackwhite",
	} as const;

	export type SpinnerVariant = keyof typeof SPINNER_TONES;

	const SPINNER_SIZES = {
		sm: "size-3",
		default: "size-4",
		lg: "size-6",
		xl: "size-8",
	} as const;

	export type SpinnerSize = keyof typeof SPINNER_SIZES;
</script>

<script lang="ts">
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import { cn } from "#lib/utils.js";
	import type { SVGAttributes } from "svelte/elements";

	let {
		class: className,
		variant = "default",
		size = "default",
		role = "status",
		// we add name, color, and stroke for compatibility with different icon libraries props.
		// only forward them when set, otherwise `stroke: undefined` overrides the icon's `currentColor`
		name,
		color,
		stroke,
		className: legacyClassName,
		"aria-label": ariaLabel = "Loading",
		...restProps
	}: SVGAttributes<SVGSVGElement> & { variant?: SpinnerVariant; size?: SpinnerSize } = $props();
</script>

<Loader2Icon {role} {...name != null ? { name } : {}} {...color != null ? { color } : {}} {...stroke != null ? { stroke } : {}} {...legacyClassName != null ? { className: legacyClassName } : {}} aria-label={ariaLabel} class={cn("animate-spin", SPINNER_SIZES[size], SPINNER_TONES[variant], className)} {...restProps} />
