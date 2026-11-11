<script lang="ts">
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import { ReviewPage } from '#lib/review/index.js';
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
					<Spinner data-case="large" class="text-primary size-6" aria-label="Loading" />
				</div>
				<div class="space-y-1">
					<span class="text-sm text-muted-foreground">primary</span>
					<div class="text-primary size-4" data-oracle="primary"></div>
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
