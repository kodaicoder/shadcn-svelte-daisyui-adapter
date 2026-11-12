<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import type { BinaryVariant } from '#lib/components/ui/binary-variant.js';
	import { selectControl } from '../../../stories/story-args.js';
	import { RadioGroup, RadioGroupItem } from './index.js';

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
		title: 'Components/RadioGroup',
		component: RadioGroup,
		tags: ['autodocs'],
		argTypes: {
			variant: selectControl(TONE_ROWS),
			value: selectControl(['a', 'b'])
		}
	});
</script>

<Story name="Playground" args={{ variant: 'default', value: 'a' }}>
	{#snippet template(args)}
		<RadioGroup {...args} aria-label="Options">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="a" aria-label="Option A" />
				<span class="text-sm text-muted-foreground">Option A</span>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="b" aria-label="Option B" />
				<span class="text-sm text-muted-foreground">Option B</span>
			</div>
		</RadioGroup>
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="grid max-w-md gap-3">
		{#each TONE_ROWS as tone (tone)}
			<RadioGroup variant={tone} value="a" aria-label={tone}>
				<div class="flex items-center gap-2">
					<RadioGroupItem value="a" aria-label={tone} />
					<span class="text-sm text-muted-foreground">{tone}</span>
				</div>
			</RadioGroup>
		{/each}
	</div>
</Story>

<Story name="States" asChild>
	<div class="grid max-w-md gap-6">
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Unchecked</span>
			<RadioGroup aria-label="Unchecked">
				<div class="flex items-center gap-2">
					<RadioGroupItem value="a" aria-label="Option A" />
					<span class="text-sm text-muted-foreground">Option A</span>
				</div>
				<div class="flex items-center gap-2">
					<RadioGroupItem value="b" aria-label="Option B" />
					<span class="text-sm text-muted-foreground">Option B</span>
				</div>
			</RadioGroup>
		</div>
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Checked</span>
			<RadioGroup value="a" aria-label="Checked">
				<div class="flex items-center gap-2">
					<RadioGroupItem value="a" aria-label="Option A" />
					<span class="text-sm text-muted-foreground">Option A</span>
				</div>
				<div class="flex items-center gap-2">
					<RadioGroupItem value="b" aria-label="Option B" />
					<span class="text-sm text-muted-foreground">Option B</span>
				</div>
			</RadioGroup>
		</div>
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Disabled item</span>
			<RadioGroup aria-label="Disabled item">
				<div class="flex items-center gap-2">
					<RadioGroupItem value="a" aria-label="Option A" />
					<span class="text-sm text-muted-foreground">Option A</span>
				</div>
				<div class="flex items-center gap-2">
					<RadioGroupItem value="b" disabled aria-label="Option B" />
					<span class="text-sm text-muted-foreground">Option B</span>
				</div>
			</RadioGroup>
		</div>
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Invalid item</span>
			<RadioGroup aria-label="Invalid item">
				<div class="flex items-center gap-2">
					<RadioGroupItem value="a" aria-label="Option A" />
					<span class="text-sm text-muted-foreground">Option A</span>
				</div>
				<div class="flex items-center gap-2">
					<RadioGroupItem value="b" aria-invalid="true" aria-label="Option B" />
					<span class="text-sm text-muted-foreground">Option B</span>
				</div>
			</RadioGroup>
		</div>
	</div>
</Story>

<Story name="Override" asChild>
	<div class="grid max-w-md gap-3">
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Group secondary, item inherits</span>
			<RadioGroup variant="secondary" value="a" aria-label="Group tone">
				<div class="flex items-center gap-2">
					<RadioGroupItem value="a" aria-label="Inherits secondary" />
					<span class="text-sm text-muted-foreground">Inherits secondary</span>
				</div>
			</RadioGroup>
		</div>
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Group secondary, item info</span>
			<RadioGroup variant="secondary" value="a" aria-label="Item info">
				<div class="flex items-center gap-2">
					<RadioGroupItem value="a" variant="info" aria-label="info" />
					<span class="text-sm text-muted-foreground">info</span>
				</div>
			</RadioGroup>
		</div>
		<div class="grid gap-1">
			<span class="text-sm text-muted-foreground">Group secondary, item destructive</span>
			<RadioGroup variant="secondary" value="a" aria-label="Item destructive">
				<div class="flex items-center gap-2">
					<RadioGroupItem value="a" variant="destructive" aria-label="destructive" />
					<span class="text-sm text-muted-foreground">destructive</span>
				</div>
			</RadioGroup>
		</div>
	</div>
</Story>

<Story name="Focus" asChild>
	<div class="grid max-w-md gap-3">
		{#each TONE_ROWS as tone (tone)}
			<div class="grid gap-1">
				<RadioGroup variant={tone} value="a" aria-label={tone}>
					<div class="flex items-center gap-2">
						<RadioGroupItem value="a" aria-label={tone} />
						<span class="text-sm text-muted-foreground">{tone}</span>
					</div>
				</RadioGroup>
			</div>
		{/each}
	</div>
</Story>
