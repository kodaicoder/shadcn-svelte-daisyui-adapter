<script lang="ts">
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { ReviewPage } from '#lib/review/index.js';

	let base = $state('');
	let filled = $state('Filled value');
	let focus = $state('');
	let invalid = $state('not-an-email');
	let disabled = $state('Disabled value');
	let readonly = $state('Read-only value');
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="textarea" title="Textarea">
		{#snippet controls()}
			<div class="grid gap-6 sm:grid-cols-2">
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">base</span>
					<Textarea data-case="base" bind:value={base} placeholder="Placeholder"></Textarea>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">filled</span>
					<Textarea data-case="filled" bind:value={filled}></Textarea>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">focus</span>
					<Textarea data-case="focus" bind:value={focus}></Textarea>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">invalid</span>
					<Textarea data-case="invalid" aria-invalid="true" bind:value={invalid}></Textarea>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">disabled</span>
					<Textarea data-case="disabled" disabled bind:value={disabled}></Textarea>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">readonly</span>
					<Textarea data-case="readonly" readonly bind:value={readonly}></Textarea>
				</label>
			</div>
		{/snippet}
	</ReviewPage>
</div>
