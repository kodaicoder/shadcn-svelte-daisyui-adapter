<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Slider } from './index.js';
	import type { SliderVariant } from './slider.svelte';

	const TONES: Record<SliderVariant, SliderVariant> = {
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const TONE_ROWS = Object.values(TONES);

	type PlaygroundArgs = { variant: SliderVariant; value: number };

	// bits-ui renders the thumb unnamed and the copy forwards no thumb props, so the story supplies the label a consumer cannot; ticket 78 tracks the fix in the copy.
	const labelThumbs = (labels: string[]) => (node: HTMLElement) => {
		node.querySelectorAll<HTMLElement>('[role="slider"]').forEach((thumb, index) => {
			thumb.setAttribute('aria-label', labels[index] ?? labels[0]);
		});
	};

	const { Story } = defineMeta({
		title: 'Components/Slider',
		component: Slider,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(TONE_ROWS),
			value: { control: { type: 'range', min: 0, max: 100, step: 1 } }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'default', value: 40 }}>
	{#snippet template(args)}
		<div class="w-64" {@attach labelThumbs(['Volume'])}>
			<Slider {...args as PlaygroundArgs} type="single" />
		</div>
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="grid max-w-md gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="grid gap-1">
				<span class="text-sm text-muted-foreground">{tone}</span>
				<div class="w-64" {@attach labelThumbs([tone])}>
					<Slider variant={tone} value={40} type="single" />
				</div>
			</div>
		{/each}
	</div>
</Story>

<Story name="Thumbs" asChild>
	<div class="grid max-w-md gap-6">
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">One thumb</span>
			<div class="w-64" {@attach labelThumbs(['Volume'])}>
				<Slider value={30} type="single" />
			</div>
		</div>
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Two thumbs</span>
			<div class="w-64" {@attach labelThumbs(['Minimum', 'Maximum'])}>
				<Slider value={[25, 75]} type="multiple" />
			</div>
		</div>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div class="grid max-w-md gap-6">
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">One thumb</span>
			<div class="w-64" {@attach labelThumbs(['Volume'])}>
				<Slider value={30} type="single" disabled />
			</div>
		</div>
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Two thumbs</span>
			<div class="w-64" {@attach labelThumbs(['Minimum', 'Maximum'])}>
				<Slider value={[25, 75]} type="multiple" disabled />
			</div>
		</div>
	</div>
</Story>

<Story name="Focus" asChild>
	<div class="grid max-w-md gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="w-64" {@attach labelThumbs([tone])}>
				<Slider variant={tone} value={40} type="single" />
			</div>
		{/each}
	</div>
</Story>
