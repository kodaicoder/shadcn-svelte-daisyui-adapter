<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Progress } from './index.js';
	import type { ProgressVariant } from './progress.svelte';

	const TONES: Record<ProgressVariant, ProgressVariant> = {
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const VALUES = [0, 25, 50, 75, 100];
	const TONE_ROWS = Object.values(TONES);

	const { Story } = defineMeta({
		title: 'Components/Progress',
		component: Progress,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(TONE_ROWS),
			value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
			max: { control: 'number' },
			'aria-label': { control: 'text' }
		}
	});
</script>

<Story
	name="Playground"
	args={{ variant: 'default', value: 40, max: 100, 'aria-label': 'Progress' }}
>
	{#snippet template(args)}
		<Progress {...args} />
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="grid max-w-md gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="grid gap-1">
				<span class="text-sm text-muted-foreground">{tone}</span>
				<Progress variant={tone} value={60} aria-label={tone} />
			</div>
		{/each}
	</div>
</Story>

<Story name="Values" asChild>
	<div class="grid max-w-md gap-3">
		{#each VALUES as value (value)}
			<div class="grid gap-1">
				<span class="text-sm text-muted-foreground">{value}</span>
				<Progress {value} aria-label={'Value ' + value} />
			</div>
		{/each}
	</div>
</Story>

<Story name="Thickness" asChild>
	<div class="grid max-w-md gap-3">
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Default bar</span>
			<Progress value={60} aria-label="Default bar" />
		</div>
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Thicker bar</span>
			<Progress value={60} class="h-2" aria-label="Thicker bar" />
		</div>
	</div>
</Story>
