<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Toggle, type ToggleSize, type ToggleVariant } from './index.js';

	type Variant = NonNullable<ToggleVariant>;
	type Size = NonNullable<ToggleSize>;
	type Outline = Extract<Variant, `outline${string}`>;
	type Tone = Exclude<Variant, Outline>;

	const TONES: Record<Tone, Tone> = {
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const OUTLINES: Record<Outline, Outline> = {
		outline: 'outline',
		'outline-secondary': 'outline-secondary',
		'outline-success': 'outline-success',
		'outline-warning': 'outline-warning',
		'outline-info': 'outline-info',
		'outline-destructive': 'outline-destructive',
		'outline-blackwhite': 'outline-blackwhite'
	};

	const SIZES: Size[] = ['default', 'sm', 'lg'];

	const SIZE_ROWS: { size: Size; pressed: boolean }[] = SIZES.flatMap((size) => [
		{ size, pressed: false },
		{ size, pressed: true }
	]);

	const TONE_ROWS = Object.values(TONES);
	const OUTLINE_ROWS = Object.values(OUTLINES);
	const VARIANTS = [...TONE_ROWS, ...OUTLINE_ROWS];

	const { Story } = defineMeta({
		title: 'Components/Toggle',
		component: Toggle,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(VARIANTS),
			size: selectControl(SIZES),
			pressed: { control: 'boolean' },
			disabled: { control: 'boolean' }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'default', size: 'default', pressed: true }}>
	{#snippet template(args)}
		<Toggle {...args}>Toggle</Toggle>
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-wrap items-center gap-3">
		{#each TONE_ROWS as tone (tone)}
			<Toggle variant={tone} pressed>{tone}</Toggle>
		{/each}
	</div>
</Story>

<Story name="Outline" asChild>
	<div class="grid gap-3">
		<div class="flex flex-wrap items-center gap-3">
			{#each OUTLINE_ROWS as variant (variant)}
				<Toggle {variant}>
					{variant === 'outline' ? 'default' : variant.slice('outline-'.length)}
				</Toggle>
			{/each}
		</div>
		<div class="flex flex-wrap items-center gap-3">
			{#each OUTLINE_ROWS as variant (variant)}
				<Toggle {variant} pressed>
					{variant === 'outline' ? 'default' : variant.slice('outline-'.length)}
				</Toggle>
			{/each}
		</div>
	</div>
</Story>

<Story name="Sizes" asChild>
	<div class="flex flex-wrap items-center gap-3">
		{#each SIZE_ROWS as row (row.size + row.pressed)}
			<Toggle size={row.size} pressed={row.pressed}>
				{row.size}
				{row.pressed ? 'pressed' : 'idle'}
			</Toggle>
		{/each}
	</div>
</Story>

<Story name="States" asChild>
	<div class="flex flex-wrap items-center gap-3">
		<Toggle>Unpressed</Toggle>
		<Toggle pressed>Pressed</Toggle>
		<Toggle disabled>Disabled unpressed</Toggle>
		<Toggle pressed disabled>Disabled pressed</Toggle>
		<Toggle aria-invalid="true">Invalid</Toggle>
	</div>
</Story>

<Story name="Focus" asChild>
	<div class="flex flex-wrap items-center gap-3">
		{#each TONE_ROWS as tone (tone)}
			<Toggle variant={tone}>{tone}</Toggle>
		{/each}
	</div>
</Story>
