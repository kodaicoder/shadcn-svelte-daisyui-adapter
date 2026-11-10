<script lang="ts">
	import { Textarea } from '#lib/components/textarea-fixed/index.js';
	import { ReviewPage, ToneRow, type Tone } from '#lib/review/index.js';

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
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">size-sm</span>
					<Textarea data-case="size-sm" size="sm"></Textarea>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">size-default</span>
					<Textarea data-case="size-default" size="default"></Textarea>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">size-lg</span>
					<Textarea data-case="size-lg" size="lg"></Textarea>
				</label>
				<div class="flex items-end gap-2">
					<span class="size-4 rounded-sm" data-oracle="radius-sm"></span>
					<span class="size-4 rounded-md" data-oracle="radius-md"></span>
					<span class="size-4 rounded-lg" data-oracle="radius-lg"></span>
				</div>
				<ToneRow>
					{#snippet control(tone: Tone)}
						<Textarea data-tone={tone} variant={tone} placeholder={tone}></Textarea>
					{/snippet}
				</ToneRow>
			</div>
		{/snippet}
	</ReviewPage>
</div>
