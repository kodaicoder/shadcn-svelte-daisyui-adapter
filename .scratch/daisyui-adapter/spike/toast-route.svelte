<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
</script>

<Toaster />
<button id="fire" class="m-6 rounded border px-3 py-1" onclick={() => toast('spike toast')}>
	fire toast
</button>
<div id="probe-color" style="background-color: var(--color-popover)">color-popover probe</div>
<div id="probe-popover" style="background-color: var(--popover)">popover probe</div>
