<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ColorScheme } from './tones.js';

	let { scheme, children }: { scheme: ColorScheme; children?: Snippet } = $props();
</script>

<div
	data-scheme={scheme}
	class="space-y-4 rounded-lg border p-4 {scheme === 'dark'
		? 'dark bg-background text-foreground'
		: ''}"
>
	<h3 class="text-sm tracking-widest text-muted-foreground uppercase">{scheme}</h3>
	{@render children?.()}
</div>
