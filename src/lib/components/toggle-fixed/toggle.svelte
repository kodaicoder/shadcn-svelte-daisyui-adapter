<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";

	export const toggleVariants = tv({
		base: "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:border-primary aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-2 aria-invalid:border-destructive gap-1 rounded-md text-xs font-medium transition-all [&_svg:not([class*='size-'])]:size-4 group/toggle inline-flex cursor-pointer items-center justify-center whitespace-nowrap outline-none aria-pressed:hover:bg-primary/80 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
		variants: {
			variant: {
				default: "bg-transparent aria-[pressed=false]:hover:bg-primary/20 focus-visible:ring-primary/30",
				secondary: "bg-transparent aria-pressed:bg-secondary aria-pressed:text-secondary-foreground aria-pressed:border-secondary-foreground dark:aria-pressed:border-secondary aria-pressed:hover:bg-secondary/80 aria-[pressed=false]:hover:bg-secondary/20 focus-visible:ring-secondary/30",
				success: "bg-transparent aria-pressed:bg-success aria-pressed:text-success-foreground aria-pressed:border-success-text aria-pressed:hover:bg-success/80 aria-[pressed=false]:hover:bg-success/20 focus-visible:ring-success/30",
				warning: "bg-transparent aria-pressed:bg-warning aria-pressed:text-warning-foreground aria-pressed:border-warning-text aria-pressed:hover:bg-warning/80 aria-[pressed=false]:hover:bg-warning/20 focus-visible:ring-warning/30",
				info: "bg-transparent aria-pressed:bg-info aria-pressed:text-info-foreground aria-pressed:border-info-text aria-pressed:hover:bg-info/80 aria-[pressed=false]:hover:bg-info/20 focus-visible:ring-info/30",
				destructive: "bg-transparent aria-pressed:bg-destructive aria-pressed:text-destructive-foreground aria-pressed:border-destructive-text aria-pressed:hover:bg-destructive/80 aria-[pressed=false]:hover:bg-destructive/20 focus-visible:ring-destructive/30",
				blackwhite: "bg-transparent aria-pressed:bg-blackwhite aria-pressed:text-blackwhite-foreground aria-pressed:border-blackwhite aria-pressed:hover:bg-blackwhite/80 aria-[pressed=false]:hover:bg-blackwhite/20 focus-visible:ring-blackwhite/30",
				outline: "border border-input aria-[pressed=false]:hover:bg-primary/20 bg-transparent focus-visible:ring-primary/30",
				"outline-secondary": "border border-secondary-foreground dark:border-secondary bg-transparent text-secondary-foreground dark:text-secondary aria-pressed:bg-secondary aria-pressed:text-secondary-foreground aria-pressed:border-secondary-foreground dark:aria-pressed:border-secondary aria-pressed:hover:bg-secondary/80 aria-[pressed=false]:hover:bg-secondary/20 focus-visible:ring-secondary/30",
				"outline-success": "border border-success-text bg-transparent text-success-text aria-pressed:bg-success aria-pressed:text-success-foreground aria-pressed:border-success-text aria-pressed:hover:bg-success/80 aria-[pressed=false]:hover:bg-success/20 focus-visible:ring-success/30",
				"outline-warning": "border border-warning-text bg-transparent text-warning-text aria-pressed:bg-warning aria-pressed:text-warning-foreground aria-pressed:border-warning-text aria-pressed:hover:bg-warning/80 aria-[pressed=false]:hover:bg-warning/20 focus-visible:ring-warning/30",
				"outline-info": "border border-info-text bg-transparent text-info-text aria-pressed:bg-info aria-pressed:text-info-foreground aria-pressed:border-info-text aria-pressed:hover:bg-info/80 aria-[pressed=false]:hover:bg-info/20 focus-visible:ring-info/30",
				"outline-destructive": "border border-destructive-text bg-transparent text-destructive-text aria-pressed:bg-destructive aria-pressed:text-destructive-foreground aria-pressed:border-destructive-text aria-pressed:hover:bg-destructive/80 aria-[pressed=false]:hover:bg-destructive/20 focus-visible:ring-destructive/30",
				"outline-blackwhite": "border border-blackwhite bg-transparent text-blackwhite aria-pressed:bg-blackwhite aria-pressed:text-blackwhite-foreground aria-pressed:border-blackwhite aria-pressed:hover:bg-blackwhite/80 aria-[pressed=false]:hover:bg-blackwhite/20 focus-visible:ring-blackwhite/30",
			},
			size: {
				default: "h-7 min-w-7 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
				sm: "h-6 min-w-6 rounded-sm px-2 text-[0.625rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
				lg: "rounded-lg h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];
	export type ToggleSize = VariantProps<typeof toggleVariants>["size"];
	export type ToggleVariants = VariantProps<typeof toggleVariants>;
</script>

<script lang="ts">
	import { Toggle as TogglePrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		pressed = $bindable(false),
		class: className,
		size = "default",
		variant = "default",
		...restProps
	}: TogglePrimitive.RootProps & {
		variant?: ToggleVariant;
		size?: ToggleSize;
	} = $props();
</script>

<TogglePrimitive.Root
	bind:ref
	bind:pressed
	data-slot="toggle"
	class={cn(toggleVariants({ variant, size }), className)}
	{...restProps}
/>
