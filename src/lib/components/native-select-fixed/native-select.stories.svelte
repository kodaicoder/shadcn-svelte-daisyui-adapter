<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { FieldVariant } from './native-select.svelte';
	import { selectControl } from '../../../stories/story-args.js';
	import { NativeSelect, NativeSelectOption } from './index.js';

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
		title: 'Components/NativeSelect',
		component: NativeSelect,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(TONE_ROWS),
			size: selectControl(SIZES),
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
		disabled: false,
		'aria-label': 'Fruit'
	}}
>
	{#snippet template(args)}
		<NativeSelect {...args} class="w-48">
			<NativeSelectOption value="apple">Apple</NativeSelectOption>
			<NativeSelectOption value="banana">Banana</NativeSelectOption>
			<NativeSelectOption value="cherry">Cherry</NativeSelectOption>
		</NativeSelect>
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-wrap items-start gap-4">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex flex-col gap-2">
				<NativeSelect variant={tone} class="w-48" aria-label={tone}>
					<NativeSelectOption value="one">One</NativeSelectOption>
					<NativeSelectOption value="two">Two</NativeSelectOption>
				</NativeSelect>
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="Sizes" asChild>
	<div class="flex flex-col gap-4">
		{#each SIZES as size (size)}
			<div class="flex w-48 flex-col gap-2">
				<NativeSelect {size} value="apple" aria-label="Size {size}">
					<NativeSelectOption value="apple">Apple</NativeSelectOption>
				</NativeSelect>
				<span class="text-sm text-muted-foreground">{size}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="States" asChild>
	<div class="flex flex-wrap items-start gap-4">
		<div class="flex flex-col gap-2">
			<NativeSelect class="w-48" aria-label="Idle">
				<NativeSelectOption value="one">One</NativeSelectOption>
				<NativeSelectOption value="two">Two</NativeSelectOption>
			</NativeSelect>
			<span class="text-sm text-muted-foreground">Idle</span>
		</div>
		<div class="flex flex-col gap-2">
			<NativeSelect class="w-48" aria-invalid="true" aria-label="Invalid">
				<NativeSelectOption value="one">One</NativeSelectOption>
				<NativeSelectOption value="two">Two</NativeSelectOption>
			</NativeSelect>
			<span class="text-sm text-muted-foreground">Invalid</span>
		</div>
		<div class="flex flex-col gap-2">
			<NativeSelect class="w-48" disabled aria-label="Disabled">
				<NativeSelectOption value="one">One</NativeSelectOption>
				<NativeSelectOption value="two">Two</NativeSelectOption>
			</NativeSelect>
			<span class="text-sm text-muted-foreground">Disabled</span>
		</div>
	</div>
</Story>

<Story name="Focus" asChild>
	<div class="flex flex-col gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="flex items-center gap-2">
				<NativeSelect variant={tone} class="w-48" aria-label={tone}>
					<NativeSelectOption value="one">One</NativeSelectOption>
					<NativeSelectOption value="two">Two</NativeSelectOption>
				</NativeSelect>
				<span class="text-sm text-muted-foreground">{tone}</span>
			</div>
		{/each}
	</div>
</Story>
