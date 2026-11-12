<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Spinner } from './index.js';
	import type { SpinnerSize, SpinnerVariant } from './spinner.svelte';

	const SPINNER_TONES: Record<SpinnerVariant, SpinnerVariant> = {
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const SPINNER_PX: Record<SpinnerSize, number> = {
		sm: 12,
		default: 16,
		lg: 24,
		xl: 32
	};

	const TONES = Object.values(SPINNER_TONES);
	const SIZES = Object.keys(SPINNER_PX) as SpinnerSize[];

	const { Story } = defineMeta({
		title: 'Components/Spinner',
		component: Spinner,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(TONES),
			size: selectControl(SIZES),
			'aria-label': { control: 'text' }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'default', size: 'default', 'aria-label': 'Loading' }}>
	{#snippet template(args)}
		<Spinner {...args} />
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-wrap items-center gap-6">
		{#each TONES as tone (tone)}
			<div class="flex items-center gap-2">
				<Spinner variant={tone} />
				<span class="text-sm text-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="Sizes" asChild>
	<div class="flex flex-wrap items-center gap-6">
		{#each SIZES as size (size)}
			<div class="flex items-center gap-2">
				<Spinner {size} />
				<span class="text-sm text-foreground">{SPINNER_PX[size]} px</span>
			</div>
		{/each}
	</div>
</Story>
