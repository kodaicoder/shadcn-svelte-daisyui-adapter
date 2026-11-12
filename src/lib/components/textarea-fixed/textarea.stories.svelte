<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Textarea } from './index.js';
	import type { FieldVariant } from './textarea.svelte';

	const TONES: Record<FieldVariant, FieldVariant> = {
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const SIZES = ['sm', 'default', 'lg'] as const;

	const TONE_ROWS = Object.values(TONES);

	const FOUR_LINES = 'First line\nSecond line\nThird line\nFourth line';

	const { Story } = defineMeta({
		title: 'Components/Textarea',
		component: Textarea,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(TONE_ROWS),
			size: selectControl(SIZES),
			disabled: { control: 'boolean' },
			readonly: { control: 'boolean' },
			placeholder: { control: 'text' },
			'aria-label': { control: 'text' }
		}
	});
</script>

<Story
	name="Playground"
	args={{
		variant: 'default',
		size: 'default',
		placeholder: 'Write a note',
		disabled: false,
		readonly: false,
		'aria-label': 'Note'
	}}
>
	{#snippet template(args)}
		<Textarea {...args} rows={3} />
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-wrap items-start gap-4">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex w-56 flex-col gap-2">
				<Textarea variant={tone} rows={2} placeholder={tone} aria-label={tone} />
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="Sizes" asChild>
	<div class="flex flex-col gap-4">
		{#each SIZES as size (size)}
			<div class="flex w-56 flex-col gap-2">
				<Textarea {size} rows={1} value="Field text" aria-label="Size {size}" />
				<span class="text-sm text-muted-foreground">{size}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="MinHeight" asChild>
	<div class="flex flex-col gap-4">
		<div class="flex w-56 flex-col gap-2">
			<Textarea rows={1} aria-label="Empty textarea" />
			<span class="text-sm text-muted-foreground">Empty rows=1, sits at minimum height</span>
		</div>
		<div class="flex w-56 flex-col gap-2">
			<Textarea rows={1} value={FOUR_LINES} aria-label="Filled textarea" />
			<span class="text-sm text-muted-foreground">Content grows it past rows=1</span>
		</div>
	</div>
</Story>

<Story name="States" asChild>
	<div class="flex flex-wrap items-start gap-4">
		<div class="flex w-56 flex-col gap-2">
			<Textarea rows={2} placeholder="Idle" aria-label="Idle" />
			<span class="text-sm text-muted-foreground">Idle</span>
		</div>
		<div class="flex w-56 flex-col gap-2">
			<Textarea rows={2} value="Invalid" aria-invalid="true" aria-label="Invalid" />
			<span class="text-sm text-muted-foreground">Invalid</span>
		</div>
		<div class="flex w-56 flex-col gap-2">
			<Textarea rows={2} disabled value="Disabled" aria-label="Disabled" />
			<span class="text-sm text-muted-foreground">Disabled</span>
		</div>
		<div class="flex w-56 flex-col gap-2">
			<Textarea rows={2} readonly value="Readonly" aria-label="Readonly" />
			<span class="text-sm text-muted-foreground">Readonly</span>
		</div>
	</div>
</Story>

<Story name="Focus" asChild>
	<div class="flex flex-col gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex items-center gap-2">
				<Textarea variant={tone} rows={1} placeholder={tone} aria-label={tone} />
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>
