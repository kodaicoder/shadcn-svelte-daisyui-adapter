<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Star } from '@lucide/svelte';
	import { selectControl } from '../../../stories/story-args.js';
	import { Marker, MarkerContent, MarkerIcon, type MarkerVariant } from './index.js';

	type Variant = NonNullable<MarkerVariant>;

	const MARKER_VARIANTS: Record<Variant, Variant> = {
		default: 'default',
		separator: 'separator',
		border: 'border'
	};

	const VARIANTS = Object.values(MARKER_VARIANTS);

	const { Story } = defineMeta({
		title: 'Components/Marker',
		component: Marker,
		tags: ['autodocs'],
		argTypes: { variant: selectControl(VARIANTS) }
	});
</script>

<Story name="Playground" args={{ variant: 'default' }}>
	{#snippet template(args)}
		<Marker {...args}>Section</Marker>
	{/snippet}
</Story>

<Story name="Variants" asChild>
	<div class="flex w-80 flex-col gap-4">
		{#each VARIANTS as variant (variant)}
			<Marker {variant}>{variant}</Marker>
		{/each}
	</div>
</Story>

<Story name="WithIcon" asChild>
	<div class="flex w-80 flex-col gap-4">
		<Marker variant="separator">
			<MarkerIcon><Star /></MarkerIcon>
			<MarkerContent>Starred</MarkerContent>
		</Marker>
		<Marker variant="border">
			<MarkerIcon><Star /></MarkerIcon>
			<MarkerContent>Starred</MarkerContent>
		</Marker>
	</div>
</Story>
