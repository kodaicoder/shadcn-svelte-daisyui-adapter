<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Skeleton } from './index.js';
	import type { SkeletonVariant } from './skeleton.svelte';

	const SKELETON_VARIANTS: Record<SkeletonVariant, SkeletonVariant> = {
		neutral: 'neutral',
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const VARIANTS = Object.values(SKELETON_VARIANTS);

	const { Story } = defineMeta({
		title: 'Components/Skeleton',
		component: Skeleton,
		tags: ['autodocs'],
		argTypes: { variant: selectControl(VARIANTS) }
	});
</script>

<Story name="Playground" args={{ variant: 'neutral' }}>
	{#snippet template(args)}
		<Skeleton {...args} class="h-4 w-64" aria-hidden="true" />
	{/snippet}
</Story>

<Story name="Variants" asChild>
	<div class="flex w-80 flex-col gap-3">
		{#each VARIANTS as variant (variant)}
			<div class="flex flex-col gap-1">
				<span class="text-sm text-muted-foreground">{variant}</span>
				<Skeleton {variant} class="h-6 w-full" aria-hidden="true" />
			</div>
		{/each}
	</div>
</Story>

<Story name="Shapes" asChild>
	<div class="flex w-80 flex-col gap-6">
		<div class="flex flex-col gap-2">
			<Skeleton class="h-4 w-3/4" aria-hidden="true" />
			<Skeleton class="h-4 w-full" aria-hidden="true" />
			<Skeleton class="h-4 w-2/3" aria-hidden="true" />
		</div>
		<div class="flex items-center gap-3">
			<Skeleton class="size-12 rounded-full" aria-hidden="true" />
			<div class="flex flex-1 flex-col gap-2">
				<Skeleton class="h-4 w-1/2" aria-hidden="true" />
				<Skeleton class="h-4 w-3/4" aria-hidden="true" />
			</div>
		</div>
		<div class="flex flex-col gap-3 rounded-lg border border-border p-4">
			<Skeleton class="h-24 w-full" aria-hidden="true" />
			<Skeleton class="h-4 w-2/3" aria-hidden="true" />
			<Skeleton class="h-4 w-1/2" aria-hidden="true" />
		</div>
	</div>
</Story>
