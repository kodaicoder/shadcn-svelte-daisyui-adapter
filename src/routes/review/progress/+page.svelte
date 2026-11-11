<script lang="ts">
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { ReviewPage } from '#lib/review/index.js';
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="progress" title="Progress">
		{#snippet controls()}
			<div class="space-y-6">
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">empty</span>
					<Progress data-case="empty" value={0} max={100} />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">half</span>
					<Progress data-case="half" value={50} max={100} />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">full</span>
					<Progress data-case="full" value={100} max={100} />
				</div>
				<div class="flex items-end gap-4">
					<div class="space-y-1">
						<span class="text-sm text-muted-foreground">muted</span>
						<div class="bg-muted size-4" data-oracle="muted"></div>
					</div>
					<div class="space-y-1">
						<span class="text-sm text-muted-foreground">primary</span>
						<div class="bg-primary size-4" data-oracle="primary"></div>
					</div>
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
