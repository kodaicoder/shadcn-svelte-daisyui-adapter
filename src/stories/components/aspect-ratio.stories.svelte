<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { AspectRatio } from '#lib/components/ui/aspect-ratio/index.js';

	const RATIOS = [
		{ label: '16 / 9', ratio: 16 / 9 },
		{ label: '1', ratio: 1 },
		{ label: '3 / 4', ratio: 3 / 4 }
	];

	const { Story } = defineMeta({
		title: 'Components/AspectRatio',
		component: AspectRatio,
		tags: ['autodocs'],
		argTypes: { ratio: { control: 'number' } }
	});
</script>

<Story name="Playground" args={{ ratio: 16 / 9 }}>
	{#snippet template(args)}
		<div class="w-64">
			<AspectRatio
				{...args}
				class="flex items-center justify-center bg-muted text-sm text-foreground"
			>
				Ratio
			</AspectRatio>
		</div>
	{/snippet}
</Story>

<Story name="Ratios" asChild>
	<div class="flex flex-wrap items-start gap-4">
		{#each RATIOS as { label, ratio } (label)}
			<div class="w-48">
				<AspectRatio
					{ratio}
					class="flex items-center justify-center bg-muted text-sm text-foreground"
				>
					{label}
				</AspectRatio>
			</div>
		{/each}
	</div>
</Story>
