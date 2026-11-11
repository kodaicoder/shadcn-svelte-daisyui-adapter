<script lang="ts">
	import { Marker, MarkerContent, MarkerIcon } from '#lib/components/marker-fixed/index.js';
	import { ReviewPage } from '#lib/review/index.js';
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="marker" title="Marker">
		{#snippet controls()}
			<div class="space-y-6">
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">base</span>
					<Marker data-case="base">
						<MarkerIcon>
							<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
								<circle cx="8" cy="8" r="5" />
							</svg>
						</MarkerIcon>
						<MarkerContent>Base marker</MarkerContent>
					</Marker>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">separator</span>
					<Marker data-case="separator" variant="separator">
						<MarkerContent>Separator marker</MarkerContent>
					</Marker>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">border</span>
					<Marker data-case="border" variant="border">
						<MarkerContent>Border marker</MarkerContent>
					</Marker>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">link</span>
					<Marker data-case="link">
						<MarkerContent>Link marker with an <a href="#marker-link">anchor</a></MarkerContent>
					</Marker>
				</div>
				<div class="flex items-end gap-4">
					<div class="space-y-1">
						<span class="text-sm text-muted-foreground">muted</span>
						<span class="text-muted-foreground text-sm" data-oracle="muted">Muted</span>
					</div>
					<div class="space-y-1">
						<span class="text-sm text-muted-foreground">border</span>
						<div class="bg-border size-4" data-oracle="border"></div>
					</div>
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
