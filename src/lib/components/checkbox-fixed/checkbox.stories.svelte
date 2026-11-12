<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { BinaryVariant } from '#lib/components/ui/binary-variant.js';
	import { selectControl } from '../../../stories/story-args.js';
	import { Checkbox } from './index.js';

	const TONES: Record<BinaryVariant, BinaryVariant> = {
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const TONE_ROWS = Object.values(TONES);

	const { Story } = defineMeta({
		title: 'Components/Checkbox',
		component: Checkbox,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(TONE_ROWS),
			checked: { control: 'boolean' },
			indeterminate: { control: 'boolean' },
			disabled: { control: 'boolean' },
			'aria-label': { control: 'text' }
		}
	});
</script>

<Story
	name="Playground"
	args={{
		variant: 'default',
		checked: true,
		indeterminate: false,
		disabled: false,
		'aria-label': 'Accept terms'
	}}
>
	{#snippet template(args)}
		<Checkbox {...args} />
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-wrap items-center gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex items-center gap-2">
				<Checkbox variant={tone} checked aria-label={tone} />
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="States" asChild>
	<div class="flex flex-wrap items-center gap-3">
		<div class="flex items-center gap-2">
			<Checkbox aria-label="Unchecked" />
			<span class="text-sm text-muted-foreground">Unchecked</span>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox checked aria-label="Checked" />
			<span class="text-sm text-muted-foreground">Checked</span>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox indeterminate aria-label="Indeterminate" />
			<span class="text-sm text-muted-foreground">Indeterminate</span>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox disabled aria-label="Disabled unchecked" />
			<span class="text-sm text-muted-foreground">Disabled unchecked</span>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox checked disabled aria-label="Disabled checked" />
			<span class="text-sm text-muted-foreground">Disabled checked</span>
		</div>
		<div class="flex items-center gap-2">
			<Checkbox aria-invalid="true" aria-label="Invalid" />
			<span class="text-sm text-muted-foreground">Invalid</span>
		</div>
	</div>
</Story>

<Story name="Focus" asChild>
	<div class="flex flex-wrap items-center gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex items-center gap-2">
				<Checkbox variant={tone} aria-label={tone} />
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>
