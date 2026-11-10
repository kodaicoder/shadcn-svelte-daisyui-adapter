<script lang="ts">
	import { Kbd, KbdGroup } from '#lib/components/ui/kbd/index.js';
	import { ReviewPage } from '#lib/review/index.js';
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="kbd" title="Kbd">
		{#snippet controls()}
			<div class="flex flex-wrap items-start gap-6">
				<div class="space-y-1">
					<span class="text-xs text-muted-foreground">base</span>
					<div><Kbd data-case="base">Ctrl</Kbd></div>
				</div>
				<div class="space-y-1">
					<span class="text-xs text-muted-foreground">group</span>
					<KbdGroup data-case="group">
						<Kbd>Ctrl</Kbd>
						<Kbd>K</Kbd>
					</KbdGroup>
				</div>
				<div class="space-y-1">
					<span class="text-xs text-muted-foreground">muted</span>
					<div class="bg-muted size-4 rounded-sm" data-oracle="muted"></div>
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
