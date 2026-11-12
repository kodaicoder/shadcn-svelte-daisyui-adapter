<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { selectControl } from '../../../stories/story-args.js';
	import type { KbdVariant } from './kbd.svelte';
	import { Kbd, KbdGroup } from './index.js';

	const KBD_TONES: Record<KbdVariant, KbdVariant> = {
		default: 'default',
		secondary: 'secondary',
		success: 'success',
		warning: 'warning',
		info: 'info',
		destructive: 'destructive',
		blackwhite: 'blackwhite'
	};

	const TONES = Object.values(KBD_TONES);

	const { Story } = defineMeta({
		title: 'Components/Kbd',
		component: Kbd,
		tags: ['autodocs'],
		argTypes: { variant: selectControl(TONES) }
	});
</script>

<Story name="Playground" args={{ variant: 'default' }}>
	{#snippet template(args)}
		<Kbd {...args}>K</Kbd>
	{/snippet}
</Story>

<Story name="Tones" asChild>
	<div class="flex flex-col items-start gap-2">
		{#each TONES as tone (tone)}
			<Kbd variant={tone}>{tone}</Kbd>
		{/each}
	</div>
</Story>

<Story name="Chord" asChild>
	<div class="flex flex-col items-start gap-2">
		<KbdGroup>
			<Kbd>Ctrl</Kbd>
			<Kbd>Shift</Kbd>
			<Kbd>P</Kbd>
		</KbdGroup>
		<KbdGroup>
			<Kbd variant="info">⌘</Kbd>
			<Kbd variant="info">K</Kbd>
		</KbdGroup>
	</div>
</Story>
