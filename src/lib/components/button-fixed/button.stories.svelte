<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Plus } from '@lucide/svelte';
	import type { Tone } from '#lib/review/tones.js';
	import { selectControl } from '../../../stories/story-args.js';
	import { Button, type ButtonSize, type ButtonVariant } from './index.js';

	type Variant = NonNullable<ButtonVariant>;
	type Size = NonNullable<ButtonSize>;
	type Appearance = 'outline' | 'ghost' | 'link';

	type ToneVariants = {
		tone: Tone;
		filled: Variant;
		quiet: Record<Appearance, Variant>;
	};

	const APPEARANCES: Appearance[] = ['outline', 'ghost', 'link'];

	const TONES: Record<Tone, ToneVariants> = {
		default: {
			tone: 'default',
			filled: 'default',
			quiet: { outline: 'outline', ghost: 'ghost', link: 'link' }
		},
		secondary: {
			tone: 'secondary',
			filled: 'secondary',
			quiet: { outline: 'outline-secondary', ghost: 'ghost-secondary', link: 'link-secondary' }
		},
		success: {
			tone: 'success',
			filled: 'success',
			quiet: { outline: 'outline-success', ghost: 'ghost-success', link: 'link-success' }
		},
		warning: {
			tone: 'warning',
			filled: 'warning',
			quiet: { outline: 'outline-warning', ghost: 'ghost-warning', link: 'link-warning' }
		},
		info: {
			tone: 'info',
			filled: 'info',
			quiet: { outline: 'outline-info', ghost: 'ghost-info', link: 'link-info' }
		},
		destructive: {
			tone: 'destructive',
			filled: 'destructive',
			quiet: {
				outline: 'outline-destructive',
				ghost: 'ghost-destructive',
				link: 'link-destructive'
			}
		},
		blackwhite: {
			tone: 'blackwhite',
			filled: 'blackwhite',
			quiet: {
				outline: 'outline-blackwhite',
				ghost: 'ghost-blackwhite',
				link: 'link-blackwhite'
			}
		}
	};

	const TONE_ROWS = Object.values(TONES);
	const TEXT_SIZES: Size[] = ['default', 'xs', 'sm', 'lg'];
	const ICON_SIZES: Size[] = ['icon', 'icon-xs', 'icon-sm', 'icon-lg'];
	const VARIANTS = TONE_ROWS.flatMap((row) => [row.filled, ...Object.values(row.quiet)]);

	const { Story } = defineMeta({
		title: 'Components/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(VARIANTS),
			size: selectControl([...TEXT_SIZES, ...ICON_SIZES]),
			disabled: { control: 'boolean' },
			href: { control: 'text' }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'default', size: 'default', disabled: false, href: '' }}>
	{#snippet template(args)}
		<Button {...args}>Button</Button>
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-wrap items-center gap-2">
		{#each TONE_ROWS as row (row.tone)}
			<Button variant={row.filled}>{row.tone}</Button>
		{/each}
	</div>
</Story>

<Story name="Appearances" asChild>
	<div class="flex flex-col gap-3">
		{#each TONE_ROWS as row (row.tone)}
			<div class="flex flex-wrap items-center gap-2">
				{#each APPEARANCES as appearance (appearance)}
					<Button variant={row.quiet[appearance]}>{appearance} {row.tone}</Button>
				{/each}
			</div>
		{/each}
	</div>
</Story>

<Story name="Sizes" asChild>
	<div class="flex flex-col gap-3">
		<div class="flex flex-wrap items-center gap-2">
			{#each TEXT_SIZES as size (size)}
				<Button {size}>{size}</Button>
			{/each}
		</div>
		<div class="flex flex-wrap items-center gap-2">
			{#each ICON_SIZES as size (size)}
				<Button {size} aria-label="Add">
					<Plus />
				</Button>
			{/each}
		</div>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div class="flex flex-wrap items-center gap-2">
		<Button disabled>Disabled</Button>
		<Button variant="outline" disabled>Outline</Button>
		<Button variant="ghost" disabled>Ghost</Button>
		<Button variant="link" disabled>Link</Button>
		<Button href="https://svelte.dev" disabled>Disabled link</Button>
	</div>
</Story>

<Story name="AsLink" asChild>
	<Button href="https://svelte.dev" target="_blank" rel="noreferrer">External link</Button>
</Story>
