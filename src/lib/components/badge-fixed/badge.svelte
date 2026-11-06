<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const badgeVariants = tv({
		base: "h-5 gap-1 rounded-full border border-transparent px-2 py-0.5 text-[0.625rem] font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-2.5! group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/80",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive: "bg-destructive/10 text-destructive-text px-1.5 py-0.5 hover:bg-destructive/20 dark:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
				success: "bg-success text-success-foreground px-1.5 py-0.5 hover:bg-success/80",
				warning: "bg-warning text-warning-foreground px-1.5 py-0.5 hover:bg-warning/80",
				info: "bg-info text-info-foreground px-1.5 py-0.5 hover:bg-info/80",
				"outline-destructive": "border border-destructive-text bg-destructive/10 text-destructive-text px-1.5 py-0.5 hover:text-destructive-text/70",
				"outline-success": "border border-success-text bg-success/10 text-success-text px-1.5 py-0.5 hover:text-success-text/70",
				"outline-warning": "border border-warning-text bg-warning/10 text-warning-text px-1.5 py-0.5 hover:text-warning-text/70",
				"outline-info": "border border-info-text bg-info/10 text-info-text px-1.5 py-0.5 hover:text-info-text/70",
				"ghost-destructive": "text-destructive-text hover:bg-destructive/10 hover:text-destructive-text/70",
				"ghost-success": "text-success-text hover:bg-success/10 hover:text-success-text/70",
				"ghost-warning": "text-warning-text hover:bg-warning/10 hover:text-warning-text/70",
				"ghost-info": "text-info-text hover:bg-info/10 hover:text-info-text/70",
				"link-destructive": "text-destructive-text underline-offset-4 hover:underline",
				"link-success": "text-success-text underline-offset-4 hover:underline",
				"link-warning": "text-warning-text underline-offset-4 hover:underline",
				"link-info": "text-info-text underline-offset-4 hover:underline",
				blackwhite: "bg-blackwhite text-blackwhite-foreground px-1.5 py-0.5 hover:bg-blackwhite/80",
				"outline-blackwhite": "border border-blackwhite bg-transparent text-blackwhite px-1.5 py-0.5 hover:text-blackwhite/70",
				"ghost-blackwhite": "text-blackwhite hover:bg-blackwhite/10 hover:text-blackwhite/70",
				"link-blackwhite": "text-blackwhite underline-offset-4 hover:underline",
				outline: "border border-primary bg-primary/10 text-primary hover:text-primary/70",
				ghost: "text-primary hover:bg-primary/10 hover:text-primary/70",
				link: "text-primary underline-offset-4 hover:underline",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];
</script>

<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAnchorAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		href,
		class: className,
		variant = "default",
		children,
		...restProps
	}: WithElementRef<HTMLAnchorAttributes> & {
		variant?: BadgeVariant;
	} = $props();
</script>

<svelte:element
	this={href ? "a" : "span"}
	bind:this={ref}
	data-slot="badge"
	{href}
	class={cn(badgeVariants({ variant }), className)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
