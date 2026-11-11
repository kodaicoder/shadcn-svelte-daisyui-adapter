<script lang="ts">
	import { Input } from '#lib/components/input-fixed/index.js';
	import { Label } from '#lib/components/label-fixed/index.js';

	let { name = 'for', disabled = false }: { name?: string; disabled?: boolean } = $props();

	const id = $props.id();
</script>

<div class="flex items-center gap-2">
	<Input {id} {disabled} class="w-40" placeholder="Associated input" />
	<Label for={id} data-case={name}>Label for input</Label>
</div>
