<script lang="ts">
	import { Input } from '#lib/components/ui/input/index.js';
	import { FieldReview } from '#lib/review/index.js';

	let base = $state('');
	let filled = $state('Filled value');
	let focus = $state('');
	let invalid = $state('not-an-email');
	let disabled = $state('Disabled value');
	let readonly = $state('Read-only value');
</script>

<div class="space-y-6 p-6">
	<FieldReview kind="input" title="Input">
		{#snippet controls()}
			<div class="grid gap-6 sm:grid-cols-2">
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">base</span>
					<Input data-case="base" bind:value={base} placeholder="Placeholder" />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">filled</span>
					<Input data-case="filled" bind:value={filled} />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">focus</span>
					<Input data-case="focus" bind:value={focus} />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">invalid</span>
					<Input data-case="invalid" aria-invalid="true" bind:value={invalid} />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">disabled</span>
					<Input data-case="disabled" disabled bind:value={disabled} />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">readonly</span>
					<Input data-case="readonly" readonly bind:value={readonly} />
				</label>
			</div>
		{/snippet}
	</FieldReview>
</div>
