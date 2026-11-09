<script lang="ts">
	import { Checkbox } from '#lib/components/checkbox-fixed/index.js';
	import { RadioGroup, RadioGroupItem } from '#lib/components/radio-group-fixed/index.js';
	import { Switch } from '#lib/components/switch-fixed/index.js';
	import { Toggle } from '#lib/components/toggle-fixed/index.js';

	const tones = [
		'default',
		'secondary',
		'success',
		'warning',
		'info',
		'destructive',
		'blackwhite'
	] as const;

	const outlineTones = [
		'outline',
		'outline-secondary',
		'outline-success',
		'outline-warning',
		'outline-info',
		'outline-destructive',
		'outline-blackwhite'
	] as const;

	const outlineTone: Record<(typeof outlineTones)[number], (typeof tones)[number]> = {
		outline: 'default',
		'outline-secondary': 'secondary',
		'outline-success': 'success',
		'outline-warning': 'warning',
		'outline-info': 'info',
		'outline-destructive': 'destructive',
		'outline-blackwhite': 'blackwhite'
	};

	const fillClasses = {
		default: 'bg-primary',
		secondary: 'bg-secondary',
		success: 'bg-success',
		warning: 'bg-warning',
		info: 'bg-info',
		destructive: 'bg-destructive',
		blackwhite: 'bg-blackwhite'
	};

	const foregroundClasses = {
		default: 'text-primary-foreground',
		secondary: 'text-secondary-foreground',
		success: 'text-success-foreground',
		warning: 'text-warning-foreground',
		info: 'text-info-foreground',
		destructive: 'text-destructive-foreground',
		blackwhite: 'text-blackwhite-foreground'
	};

	const borderClasses = {
		default: 'border-primary',
		secondary: 'border-secondary-foreground dark:border-secondary',
		success: 'border-success-text',
		warning: 'border-warning-text',
		info: 'border-info-text',
		destructive: 'border-destructive-text',
		blackwhite: 'border-blackwhite'
	};

	const softClasses = {
		default: 'bg-primary/10',
		secondary: 'bg-secondary/10',
		success: 'bg-success/10',
		warning: 'bg-warning/10',
		info: 'bg-info/10',
		destructive: 'bg-destructive/10',
		blackwhite: 'bg-blackwhite/10'
	};

	const schemes = ['light', 'dark'] as const;
</script>

{#snippet swatches()}
	<div class="flex flex-wrap items-center gap-3 text-[0.625rem] text-muted-foreground">
		{#each tones as tone}
			<span class="flex items-center gap-1">
				<span data-fill-swatch={tone} class="size-4 rounded-sm {fillClasses[tone]}"></span>
				<span data-soft-swatch={tone} class="size-4 rounded-sm {softClasses[tone]}"></span>
				<span data-foreground-swatch={tone} class="{foregroundClasses[tone]}">Aa</span>
				<span
					data-border-swatch={tone}
					class="size-4 rounded-sm border-2 {borderClasses[tone]}"
				></span>
				{tone}
			</span>
		{/each}
		<span class="flex items-center gap-1">
			<span data-muted-swatch class="size-4 rounded-sm bg-muted/20"></span>
			muted/20
		</span>
	</div>
{/snippet}

<div class="space-y-10 p-6">
	<h1 class="text-lg font-semibold">Binary control tones</h1>

	<section id="checkbox" data-control="checkbox" class="space-y-4">
		<h2 class="text-sm font-semibold tracking-widest uppercase">Checkbox</h2>
		{#each schemes as scheme}
			<div
				data-scheme={scheme}
				class="space-y-4 rounded-lg border p-4 {scheme === 'dark'
					? 'dark bg-background text-foreground'
					: ''}"
			>
				<h3 class="text-xs tracking-widest text-muted-foreground uppercase">{scheme}</h3>
				<div class="flex flex-wrap items-center gap-4">
					{#each tones as tone}
						<label class="flex items-center gap-2 text-xs">
							<Checkbox variant={tone} checked data-tone={tone} />
							{tone}
						</label>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<label class="flex items-center gap-2 text-xs">
						<Checkbox data-case="focus" aria-label="Focus tone" />
						focus
					</label>
					<label class="flex items-center gap-2 text-xs">
						<Checkbox data-case="invalid" aria-invalid="true" aria-label="Invalid tone" />
						invalid
					</label>
					<label class="flex items-center gap-2 text-xs">
						<Checkbox data-case="disabled" disabled aria-label="Disabled tone" />
						disabled
					</label>
				</div>
				{@render swatches()}
			</div>
		{/each}
	</section>

	<section id="switch" data-control="switch" class="space-y-4">
		<h2 class="text-sm font-semibold tracking-widest uppercase">Switch</h2>
		{#each schemes as scheme}
			<div
				data-scheme={scheme}
				class="space-y-4 rounded-lg border p-4 {scheme === 'dark'
					? 'dark bg-background text-foreground'
					: ''}"
			>
				<h3 class="text-xs tracking-widest text-muted-foreground uppercase">{scheme}</h3>
				<div class="flex flex-wrap items-center gap-4">
					{#each tones as tone}
						<label class="flex items-center gap-2 text-xs">
							<Switch variant={tone} checked data-tone={tone} />
							{tone}
						</label>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<label class="flex items-center gap-2 text-xs">
						<Switch data-case="focus" aria-label="Focus tone" />
						focus
					</label>
					<label class="flex items-center gap-2 text-xs">
						<Switch data-case="invalid" aria-invalid="true" aria-label="Invalid tone" />
						invalid
					</label>
					<label class="flex items-center gap-2 text-xs">
						<Switch data-case="disabled" disabled aria-label="Disabled tone" />
						disabled
					</label>
				</div>
				{@render swatches()}
			</div>
		{/each}
	</section>

	<section id="radio-group" data-control="radio-group" class="space-y-4">
		<h2 class="text-sm font-semibold tracking-widest uppercase">Radio group</h2>
		{#each schemes as scheme}
			<div
				data-scheme={scheme}
				class="space-y-4 rounded-lg border p-4 {scheme === 'dark'
					? 'dark bg-background text-foreground'
					: ''}"
			>
				<h3 class="text-xs tracking-widest text-muted-foreground uppercase">{scheme}</h3>
				<div class="flex flex-wrap items-center gap-4">
					{#each tones as tone}
						<span class="flex items-center gap-2 text-xs">
							<RadioGroup value="on" aria-label="Radio {tone}">
								<RadioGroupItem value="on" variant={tone} data-tone={tone} />
								<RadioGroupItem value="off" variant={tone} data-unchecked-tone={tone} />
							</RadioGroup>
							{tone}
						</span>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<span class="flex items-center gap-2 text-xs">
						<RadioGroup value="on" aria-label="Radio focus">
							<RadioGroupItem value="on" data-case="focus" />
						</RadioGroup>
						focus
					</span>
					<span class="flex items-center gap-2 text-xs">
						<RadioGroup value="off" aria-label="Radio invalid">
							<RadioGroupItem value="on" aria-invalid="true" data-case="invalid" />
						</RadioGroup>
						invalid
					</span>
					<span class="flex items-center gap-2 text-xs">
						<RadioGroup value="off" aria-label="Radio disabled">
							<RadioGroupItem value="on" disabled data-case="disabled" />
						</RadioGroup>
						disabled
					</span>
				</div>
				{@render swatches()}
			</div>
		{/each}
	</section>

	<section id="toggle" data-control="toggle" class="space-y-4">
		<h2 class="text-sm font-semibold tracking-widest uppercase">Toggle</h2>
		{#each schemes as scheme}
			<div
				data-scheme={scheme}
				class="space-y-4 rounded-lg border p-4 {scheme === 'dark'
					? 'dark bg-background text-foreground'
					: ''}"
			>
				<h3 class="text-xs tracking-widest text-muted-foreground uppercase">{scheme}</h3>
				<div class="flex flex-wrap items-center gap-4">
					{#each tones as tone}
						<Toggle variant={tone} pressed data-tone={tone}>{tone}</Toggle>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					{#each outlineTones as key}
						<Toggle variant={key} data-outline={key}>{key}</Toggle>
						<Toggle variant={key} pressed data-outline-pressed={key}>{key}</Toggle>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<Toggle data-case="focus" aria-label="Focus tone">focus</Toggle>
					<Toggle data-case="invalid" aria-invalid="true" aria-label="Invalid tone">
						invalid
					</Toggle>
					<Toggle data-case="disabled" disabled aria-label="Disabled tone">disabled</Toggle>
				</div>
				{@render swatches()}
			</div>
		{/each}
	</section>
</div>
