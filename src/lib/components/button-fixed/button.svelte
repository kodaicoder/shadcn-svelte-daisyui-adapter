<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	export const buttonVariants = tv({
		base: "focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-xs/relaxed font-medium focus-visible:ring-2 aria-invalid:ring-2 active:not-aria-[haspopup]:translate-y-px [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/80",
				outline: "border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
				secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
				ghost: "text-primary hover:bg-primary hover:text-primary-foreground",
				destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 focus-visible:border-destructive/40",
				success: "bg-success text-success-foreground hover:bg-success/80",
				warning: "bg-warning text-warning-foreground hover:bg-warning/80",
				info: "bg-info text-info-foreground hover:bg-info/80",
				"outline-destructive": "border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-destructive-foreground",
				"outline-success": "border-success bg-transparent text-success hover:bg-success hover:text-success-foreground",
				"outline-warning": "border-warning bg-transparent text-warning hover:bg-warning hover:text-warning-foreground",
				"outline-info": "border-info bg-transparent text-info hover:bg-info hover:text-info-foreground",
				"ghost-destructive": "text-destructive hover:bg-destructive hover:text-destructive-foreground",
				"ghost-success": "text-success hover:bg-success hover:text-success-foreground",
				"ghost-warning": "text-warning hover:bg-warning hover:text-warning-foreground",
				"ghost-info": "text-info hover:bg-info hover:text-info-foreground",
				"link-destructive": "text-destructive underline-offset-4 hover:underline",
				"link-success": "text-success underline-offset-4 hover:underline",
				"link-warning": "text-warning underline-offset-4 hover:underline",
				"link-info": "text-info underline-offset-4 hover:underline",
				"outline-primary": "border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
				"ghost-primary": "text-primary hover:bg-primary hover:text-primary-foreground",
				"link-primary": "text-primary underline-offset-4 hover:underline",
				"outline-secondary": "border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-secondary-foreground",
				"ghost-secondary": "text-secondary hover:bg-secondary hover:text-secondary-foreground",
				"link-secondary": "text-secondary underline-offset-4 hover:underline",
				blackwhite: "bg-blackwhite text-blackwhite-foreground hover:bg-blackwhite/80",
				"outline-blackwhite": "border-blackwhite bg-transparent text-blackwhite hover:bg-blackwhite hover:text-blackwhite-foreground",
				"ghost-blackwhite": "text-blackwhite hover:bg-blackwhite hover:text-blackwhite-foreground",
				"link-blackwhite": "text-blackwhite underline-offset-4 hover:underline",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				default: "h-7 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
				xs: "h-5 gap-1 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-2.5",
				sm: "rounded-sm h-6 gap-1 px-2 text-xs/relaxed has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				lg: "rounded-lg h-8 gap-1 px-2.5 text-xs/relaxed has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
				icon: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
				"icon-xs": "size-5 rounded-sm [&_svg:not([class*='size-'])]:size-2.5",
				"icon-sm": "rounded-sm size-6 [&_svg:not([class*='size-'])]:size-3",
				"icon-lg": "rounded-lg size-8 [&_svg:not([class*='size-'])]:size-4",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
