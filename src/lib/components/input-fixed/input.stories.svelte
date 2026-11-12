<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Input } from './index.js';
	import type { FieldVariant } from './input.svelte';

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

	const { Story } = defineMeta({
		title: 'Components/Input',
		component: Input,
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
		placeholder: 'you@example.com',
		disabled: false,
		readonly: false,
		'aria-label': 'Email'
	}}
>
	{#snippet template(args)}
		<Input {...args} />
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-wrap items-start gap-4">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex w-40 flex-col gap-2">
				<Input variant={tone} placeholder={tone} aria-label={tone} />
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="Sizes" asChild>
	<div class="flex flex-col gap-4">
		{#each SIZES as size (size)}
			<div class="flex w-56 flex-col gap-2">
				<Input {size} value="Field text" aria-label="Size {size}" />
				<span class="text-sm text-muted-foreground">{size}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="States" asChild>
	<div class="flex flex-wrap items-start gap-4">
		<div class="flex w-40 flex-col gap-2">
			<Input placeholder="Idle" aria-label="Idle" />
			<span class="text-sm text-muted-foreground">Idle</span>
		</div>
		<div class="flex w-40 flex-col gap-2">
			<Input value="Invalid" aria-invalid="true" aria-label="Invalid" />
			<span class="text-sm text-muted-foreground">Invalid</span>
		</div>
		<div class="flex w-40 flex-col gap-2">
			<Input disabled value="Disabled" aria-label="Disabled" />
			<span class="text-sm text-muted-foreground">Disabled</span>
		</div>
		<div class="flex w-40 flex-col gap-2">
			<Input readonly value="Readonly" aria-label="Readonly" />
			<span class="text-sm text-muted-foreground">Readonly</span>
		</div>
	</div>
</Story>

<Story name="File" asChild>
	<div class="flex flex-col gap-4">
		{#each SIZES as size (size)}
			<div class="flex w-56 flex-col gap-2">
				<Input type="file" {size} aria-label="Attachment {size}" />
				<span class="text-sm text-muted-foreground">{size}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="Focus" asChild>
	<div class="flex flex-col gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex items-center gap-2">
				<Input variant={tone} class="w-40" placeholder={tone} aria-label={tone} />
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>
