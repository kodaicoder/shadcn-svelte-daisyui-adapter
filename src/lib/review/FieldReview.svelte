<script lang="ts">
	import type { Snippet } from 'svelte';
	import Scheme from './Scheme.svelte';
	import { SCHEMES, type FieldKind } from './tones.js';

	let { control, title, controls }: { control: FieldKind; title: string; controls: Snippet } =
		$props();
</script>

<h1 class="text-lg font-semibold">{title}</h1>

<section id={control} data-control={control} class="space-y-4">
	{#each SCHEMES as scheme (scheme)}
		<Scheme {scheme}>{@render controls()}</Scheme>
	{/each}
</section>
