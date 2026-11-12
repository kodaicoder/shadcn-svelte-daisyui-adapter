<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import { Badge, type BadgeVariant } from './index.js';

	type Variant = NonNullable<BadgeVariant>;
	type Appearance = 'outline' | 'ghost' | 'link';
	type Presentation = Extract<Variant, Appearance | `${Appearance}-${string}`>;
	type Tone = Exclude<Variant, Presentation>;

	const TONES: Record<Tone, Variant> = {
		default: 'default',
		secondary: 'secondary',
		destructive: 'destructive',
		success: 'success',
		warning: 'warning',
		info: 'info',
		blackwhite: 'blackwhite'
	};

	const PRESENTATIONS: Record<Presentation, Variant> = {
		outline: 'outline',
		'outline-destructive': 'outline-destructive',
		'outline-success': 'outline-success',
		'outline-warning': 'outline-warning',
		'outline-info': 'outline-info',
		'outline-blackwhite': 'outline-blackwhite',
		ghost: 'ghost',
		'ghost-destructive': 'ghost-destructive',
		'ghost-success': 'ghost-success',
		'ghost-warning': 'ghost-warning',
		'ghost-info': 'ghost-info',
		'ghost-blackwhite': 'ghost-blackwhite',
		link: 'link',
		'link-destructive': 'link-destructive',
		'link-success': 'link-success',
		'link-warning': 'link-warning',
		'link-info': 'link-info',
		'link-blackwhite': 'link-blackwhite'
	};

	const APPEARANCES: Appearance[] = ['outline', 'ghost', 'link'];
	const TONE_ROWS = Object.values(TONES);
	const PRESENTATION_KEYS = Object.keys(PRESENTATIONS) as Presentation[];
	const APPEARANCE_ROWS = APPEARANCES.map((appearance) => ({
		appearance,
		variants: PRESENTATION_KEYS.filter(
			(key) => key === appearance || key.startsWith(`${appearance}-`)
		)
	}));

	const { Story } = defineMeta({
		title: 'Components/Badge',
		component: Badge,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl([...TONE_ROWS, ...PRESENTATION_KEYS]),
			href: { control: 'text' }
		}
	});
</script>

<Story name="Playground" args={{ variant: 'default', href: '' }}>
	{#snippet template(args)}
		<Badge {...args}>Badge</Badge>
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-col items-start gap-2">
		{#each TONE_ROWS as variant (variant)}
			<Badge {variant}>{variant}</Badge>
		{/each}
	</div>
</Story>

<Story name="Appearances" asChild>
	<div class="flex flex-col gap-3">
		{#each APPEARANCE_ROWS as row (row.appearance)}
			<div class="flex flex-wrap items-center gap-2">
				{#each row.variants as variant (variant)}
					<Badge {variant}>{variant}</Badge>
				{/each}
			</div>
		{/each}
	</div>
</Story>

<Story name="AsLink" asChild>
	<Badge href="https://svelte.dev" target="_blank" rel="noreferrer">svelte.dev</Badge>
</Story>
