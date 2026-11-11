<script lang="ts">
	import { Skeleton } from '#lib/components/skeleton-fixed/index.js';
	import { ReviewPage, TONE_NAMES } from '#lib/review/index.js';
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="skeleton" title="Skeleton">
		{#snippet controls()}
			<div class="flex flex-wrap items-start gap-6">
				<div class="space-y-1">
					<span class="text-sm text-muted-foreground">block</span>
					<Skeleton data-case="block" class="h-8 w-40" />
				</div>
				<div class="space-y-1">
					<span class="text-sm text-muted-foreground">circle</span>
					<Skeleton data-case="circle" class="size-10 rounded-full" />
				</div>
				<div class="space-y-1">
					<span class="text-sm text-muted-foreground">muted</span>
					<div class="bg-muted size-4 rounded-sm" data-oracle="muted"></div>
				</div>
			</div>
			<div class="space-y-2">
				<span class="text-sm text-muted-foreground">tones</span>
				<div class="flex flex-wrap items-end gap-2">
					<Skeleton data-tone="neutral" class="size-10" />
					{#each TONE_NAMES as tone (tone)}
						<Skeleton data-tone={tone} variant={tone} class="size-10" />
					{/each}
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
