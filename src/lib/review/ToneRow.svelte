<script lang="ts">
	import type { Snippet } from 'svelte';
	import { TONE_NAMES, TONES, type Tone } from './tones.js';

	let { control }: { control: Snippet<[Tone]> } = $props();
</script>

<div class="space-y-2 sm:col-span-2">
	<span class="text-xs text-muted-foreground">tones</span>
	<div class="flex flex-wrap items-end gap-2">
		{#each TONE_NAMES as tone (tone)}
			{@render control(tone)}
		{/each}
	</div>
	<div class="flex flex-wrap items-center gap-2">
		{#each TONE_NAMES as tone (tone)}
			<span data-tone-border={tone} class="size-4 rounded-sm border-2 {TONES[tone].fieldIdle}"
			></span>
		{/each}
		<span
			data-oracle="invalid-border"
			class="size-4 rounded-sm border-2 border-destructive dark:border-destructive/50"
		></span>
	</div>
	<div class="flex flex-wrap items-center gap-2">
		{#each TONE_NAMES as tone (tone)}
			<span data-tone-focus={tone} class="size-4 rounded-sm border-2 {TONES[tone].fieldFocus}"
			></span>
		{/each}
		{#each TONE_NAMES as tone (tone)}
			<span data-tone-ring={tone} class="size-4 rounded-sm ring-2 {TONES[tone].ring}"></span>
		{/each}
	</div>
</div>
