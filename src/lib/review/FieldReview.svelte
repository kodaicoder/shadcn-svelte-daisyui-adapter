<script lang="ts">
	import type { Snippet } from 'svelte';
	import Scheme from './Scheme.svelte';
	import { SCHEMES, type FieldKind } from './tones.js';

	let { kind, title, controls }: { kind: FieldKind; title: string; controls: Snippet } = $props();
</script>

<h1 class="text-lg font-semibold">{title}</h1>

<section id={kind} data-control={kind} class="space-y-4">
	{#each SCHEMES as scheme (scheme)}
		<Scheme {scheme}>{@render controls()}</Scheme>
	{/each}
</section>
