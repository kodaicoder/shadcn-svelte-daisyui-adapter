<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Separator } from './index.js';
	import type { SeparatorVariant } from './separator.svelte';

	const SEPARATOR_VARIANTS: Record<SeparatorVariant, SeparatorVariant> = {
		neutral: 'neutral',
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const VARIANTS = Object.values(SEPARATOR_VARIANTS);

	const { Story } = defineMeta({
		title: 'Components/Separator',
		component: Separator,
		tags: ['autodocs'],
		argTypes: { variant: selectControl(VARIANTS) }
	});
</script>

<Story name="Playground" args={{ variant: 'neutral' }}>
	{#snippet template(args)}
		<div class="w-80">
			<Separator {...args} />
		</div>
	{/snippet}
</Story>

<Story name="Variants" asChild>
	<div class="flex w-80 flex-col gap-3">
		{#each VARIANTS as variant (variant)}
			<div class="flex flex-col gap-1">
				<span class="text-sm text-muted-foreground">{variant}</span>
				<Separator {variant} />
			</div>
		{/each}
	</div>
</Story>

<Story name="Vertical" asChild>
	<div class="flex w-80 flex-col gap-6">
		<Separator />
		<div class="flex h-16 items-center gap-4 text-sm text-foreground">
			<span>Left</span>
			<Separator orientation="vertical" variant="default" />
			<span>Right</span>
		</div>
	</div>
</Story>
