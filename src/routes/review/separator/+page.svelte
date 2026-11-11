<script lang="ts">
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { ReviewPage } from '#lib/review/index.js';
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="separator" title="Separator">
		{#snippet controls()}
			<div class="space-y-6">
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">horizontal</span>
					<Separator data-case="horizontal" />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">vertical</span>
					<div class="flex h-16 items-center gap-4">
						<span class="text-base">Left</span>
						<Separator data-case="vertical" orientation="vertical" />
						<span class="text-base">Right</span>
					</div>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">decorative</span>
					<Separator data-case="decorative" decorative />
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
