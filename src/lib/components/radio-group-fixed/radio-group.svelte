<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from "bits-ui";
	import { setContext } from "svelte";
	import type { BinaryVariant } from "#lib/components/ui/binary-variant.js";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		value = $bindable(""),
		variant = "default",
		...restProps
	}: RadioGroupPrimitive.RootProps & {
		variant?: BinaryVariant;
	} = $props();

	setContext("radio-group-variant", {
		get variant() {
			return variant;
		}
	});
</script>

<RadioGroupPrimitive.Root
	bind:ref
	bind:value
	data-slot="radio-group"
	class={cn("grid gap-3 w-full", className)}
	{...restProps}
/>
