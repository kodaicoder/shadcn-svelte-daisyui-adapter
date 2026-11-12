<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { BinaryVariant } from '#lib/components/ui/binary-variant.js';
	import { selectControl } from '../../../stories/story-args.js';
	import { Switch } from './index.js';

	const TONES: Record<BinaryVariant, BinaryVariant> = {
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const SIZES = ['default', 'sm'] as const;

	const TONE_ROWS = Object.values(TONES);

	const { Story } = defineMeta({
		title: 'Components/Switch',
		component: Switch,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(TONE_ROWS),
			size: selectControl(SIZES),
			checked: { control: 'boolean' },
			disabled: { control: 'boolean' },
			'aria-label': { control: 'text' }
		}
	});
</script>

<Story
	name="Playground"
	args={{
		variant: 'default',
		size: 'default',
		checked: true,
		disabled: false,
		'aria-label': 'Notifications'
	}}
>
	{#snippet template(args)}
		<Switch {...args} />
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-wrap items-center gap-6">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex items-center gap-2">
				<Switch variant={tone} checked aria-label={tone} />
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="States" asChild>
	<div class="flex flex-wrap items-center gap-6">
		<div class="flex items-center gap-2">
			<Switch aria-label="Unchecked" />
			<span class="text-sm text-muted-foreground">Unchecked</span>
		</div>
		<div class="flex items-center gap-2">
			<Switch checked aria-label="Checked" />
			<span class="text-sm text-muted-foreground">Checked</span>
		</div>
		<div class="flex items-center gap-2">
			<Switch disabled aria-label="Disabled unchecked" />
			<span class="text-sm text-muted-foreground">Disabled unchecked</span>
		</div>
		<div class="flex items-center gap-2">
			<Switch checked disabled aria-label="Disabled checked" />
			<span class="text-sm text-muted-foreground">Disabled checked</span>
		</div>
		<div class="flex items-center gap-2">
			<Switch aria-invalid="true" aria-label="Invalid" />
			<span class="text-sm text-muted-foreground">Invalid</span>
		</div>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div class="grid max-w-md gap-3">
		<div class="flex items-center gap-2">
			<Switch size="sm" aria-label="sm unchecked" />
			<span class="text-sm text-muted-foreground">sm unchecked</span>
		</div>
		<div class="flex items-center gap-2">
			<Switch size="sm" checked aria-label="sm checked" />
			<span class="text-sm text-muted-foreground">sm checked</span>
		</div>
		<div class="flex items-center gap-2">
			<Switch size="default" aria-label="default unchecked" />
			<span class="text-sm text-muted-foreground">default unchecked</span>
		</div>
		<div class="flex items-center gap-2">
			<Switch size="default" checked aria-label="default checked" />
			<span class="text-sm text-muted-foreground">default checked</span>
		</div>
	</div>
</Story>

<Story name="Focus" asChild>
	<div class="flex flex-wrap items-center gap-6">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex items-center gap-2">
				<Switch variant={tone} checked aria-label={tone} />
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>
