<script lang="ts">
	import { Spinner } from '#lib/components/spinner-fixed/index.js';
	import { ReviewPage, TONE_NAMES } from '#lib/review/index.js';

	const sizes = ['sm', 'default', 'lg', 'xl'] as const;
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="spinner" title="Spinner">
		{#snippet controls()}
			<div class="flex flex-wrap items-start gap-6">
				<div class="space-y-1">
					<span class="text-sm text-muted-foreground">base</span>
					<Spinner data-case="base" aria-label="Loading" />
				</div>
				<div class="space-y-1">
					<span class="text-sm text-muted-foreground">large</span>
					<Spinner data-case="large" size="lg" aria-label="Loading" />
				</div>
			</div>
			<div class="space-y-2">
				<span class="text-sm text-muted-foreground">sizes</span>
				<div class="flex flex-wrap items-end gap-4">
					{#each sizes as size (size)}
						<div class="space-y-1">
							<Spinner data-size={size} {size} aria-label="Loading" />
							<span class="block text-xs text-muted-foreground">{size}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="space-y-2">
				<span class="text-sm text-muted-foreground">tones</span>
				<div class="flex flex-wrap items-end gap-2">
					{#each TONE_NAMES as tone (tone)}
						<Spinner data-tone={tone} variant={tone} aria-label="Loading" />
					{/each}
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
