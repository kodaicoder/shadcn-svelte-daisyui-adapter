<script lang="ts">
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { ReviewPage } from '#lib/review/index.js';

	let single = $state(40);
	let range = $state([25, 75]);
	let disabled = $state(40);
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="slider" title="Slider">
		{#snippet controls()}
			<div class="space-y-6">
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">single</span>
					<Slider data-case="single" type="single" bind:value={single} />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">range</span>
					<Slider data-case="range" type="multiple" bind:value={range} />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">disabled</span>
					<Slider data-case="disabled" type="single" disabled bind:value={disabled} />
				</div>
				<div class="flex items-end gap-4">
					<div class="space-y-1">
						<span class="text-sm text-muted-foreground">primary</span>
						<div class="bg-primary size-4" data-oracle="primary"></div>
					</div>
					<div class="space-y-1">
						<span class="text-sm text-muted-foreground">input</span>
						<div class="bg-input/50 size-4" data-oracle="input"></div>
					</div>
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
