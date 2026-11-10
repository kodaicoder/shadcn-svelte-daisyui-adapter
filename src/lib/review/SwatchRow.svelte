<script lang="ts">
	import { TONES, TONE_NAMES } from './tones.js';
</script>

<div class="flex flex-wrap items-center gap-3 text-[0.625rem] text-muted-foreground">
	{#each TONE_NAMES as tone (tone)}
		<span class="flex items-center gap-1">
			<span data-fill-swatch={tone} class="size-4 rounded-sm {TONES[tone].fill}"></span>
			<span data-soft-swatch={tone} class="size-4 rounded-sm {TONES[tone].soft}"></span>
			<span data-foreground-swatch={tone} class={TONES[tone].foreground}>Aa</span>
			<span data-border-swatch={tone} class="size-4 rounded-sm border-2 {TONES[tone].border}"
			></span>
			{tone}
		</span>
	{/each}
	<span class="flex items-center gap-1">
		<span data-muted-swatch class="size-4 rounded-sm bg-muted/20"></span>
		muted/20
	</span>
	<span class="flex items-center gap-1">
		<span data-strong-swatch="success" class="size-4 rounded-sm {TONES.success.strong}"></span>
		tone/20
	</span>
</div>
