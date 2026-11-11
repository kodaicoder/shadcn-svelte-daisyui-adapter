<script lang="ts">
	import { ScrollArea } from '#lib/components/ui/scroll-area/index.js';
	import { ReviewPage } from '#lib/review/index.js';
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="scroll-area" title="Scroll area">
		{#snippet controls()}
			<div class="space-y-6">
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">vertical</span>
					<ScrollArea data-case="vertical" class="h-32 w-64 border">
						<div class="h-72 p-2 text-xs">Tall content that overflows the viewport.</div>
					</ScrollArea>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">horizontal</span>
					<ScrollArea data-case="horizontal" orientation="horizontal" class="h-16 w-64 border">
						<div class="h-14 w-[480px] p-2 text-xs">Wide content that overflows the viewport.</div>
					</ScrollArea>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">both</span>
					<ScrollArea data-case="both" orientation="both" class="h-32 w-64 border">
						<div class="h-72 w-[480px] p-2 text-xs">Tall and wide content that overflows both axes.</div>
					</ScrollArea>
				</div>
				<div class="space-y-1">
					<span class="text-sm text-muted-foreground">border</span>
					<div class="bg-border size-4" data-oracle="border"></div>
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
