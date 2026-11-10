<script lang="ts">
	import { Input } from '#lib/components/input-fixed/index.js';
	import { TONES, TONE_NAMES, ReviewPage } from '#lib/review/index.js';

	let base = $state('');
	let filled = $state('Filled value');
	let focus = $state('');
	let invalid = $state('not-an-email');
	let disabled = $state('Disabled value');
	let readonly = $state('Read-only value');
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="input" title="Input">
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
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">size-sm</span>
					<Input data-case="size-sm" size="sm" />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">size-default</span>
					<Input data-case="size-default" size="default" />
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">size-lg</span>
					<Input data-case="size-lg" size="lg" />
				</label>
				<div class="flex items-end gap-2">
					<span class="size-4 rounded-sm" data-oracle="radius-sm"></span>
					<span class="size-4 rounded-md" data-oracle="radius-md"></span>
					<span class="size-4 rounded-lg" data-oracle="radius-lg"></span>
				</div>
				<div class="space-y-2 sm:col-span-2">
					<span class="text-xs text-muted-foreground">tones</span>
					<div class="flex flex-wrap items-end gap-2">
						{#each TONE_NAMES as tone (tone)}
							<Input data-tone={tone} variant={tone} placeholder={tone} />
						{/each}
					</div>
					<div class="flex flex-wrap items-center gap-2">
						{#each TONE_NAMES as tone (tone)}
							<span data-tone-border={tone} class="size-4 rounded-sm border-2 {TONES[tone].border}"
							></span>
						{/each}
						<span data-oracle="invalid-border" class="size-4 rounded-sm border-2 border-destructive"
						></span>
					</div>
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
