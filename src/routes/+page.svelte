<script lang="ts">
	import { Checkbox } from '#lib/components/checkbox-fixed/index.js';
	import { Button } from '#lib/components/button-fixed/index.js';
	import { Label } from '#lib/components/label-fixed/index.js';
	import { FieldLabel } from '#lib/components/ui/field/index.js';
	import { RadioGroup, RadioGroupItem } from '#lib/components/radio-group-fixed/index.js';
	import { Switch } from '#lib/components/switch-fixed/index.js';
	import { Toggle } from '#lib/components/toggle-fixed/index.js';
	import { OUTLINE_TONES, SCHEMES, Scheme, TONE_NAMES, TONES } from '#lib/review/index.js';
</script>

{#snippet swatches()}
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
{/snippet}

<div class="space-y-10 p-6">
	<h1 class="text-xl font-semibold">Binary control tones</h1>

	<section id="cursor" data-control="cursor" class="space-y-3">
		<h2 class="text-base font-semibold tracking-widest uppercase">Cursor</h2>
		<div class="flex flex-wrap items-center gap-4">
			<Button data-cursor="button">Button</Button>
			<Button data-cursor="button-disabled" disabled>Disabled button</Button>
			<Button data-cursor="button-link-disabled" href="/nowhere" disabled>Disabled link</Button>
			<fieldset disabled class="rounded-md border p-2">
				<Button data-cursor="fieldset-button">Inherited disabled</Button>
			</fieldset>
		</div>
	</section>

	<section id="disabled-label" data-control="disabled-label" class="space-y-3">
		<h2 class="text-base font-semibold tracking-widest uppercase">Disabled label</h2>
		<div class="flex flex-wrap items-center gap-8">
			<div class="flex items-center gap-2">
				<Checkbox id="label-sibling" disabled />
				<Label for="label-sibling" data-label-case="sibling">Sibling label</Label>
			</div>
			<div class="group flex items-center gap-2" data-disabled="true">
				<Label for="label-group" data-label-case="group">Group label</Label>
				<Checkbox id="label-group" disabled />
			</div>
			<Label data-label-case="wrapped">
				<Checkbox disabled />
				Wrapped label
			</Label>
		</div>
	</section>

	<section id="field-label" data-control="field-label" class="space-y-4">
		<h2 class="text-base font-semibold tracking-widest uppercase">Field.Label focus</h2>
		{#each SCHEMES as scheme (scheme)}
			<Scheme {scheme}>
				<div class="flex flex-wrap items-center gap-6">
					{#each TONE_NAMES as tone (tone)}
						<FieldLabel class="gap-1">
							<Checkbox
								variant={tone}
								checked
								data-field-control="checkbox"
								data-field-tone={tone}
							/>
							<span class="text-sm">{tone}</span>
						</FieldLabel>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-6">
					{#each TONE_NAMES as tone (tone)}
						<FieldLabel class="gap-1">
							<Switch variant={tone} checked data-field-control="switch" data-field-tone={tone} />
							<span class="text-sm">{tone}</span>
						</FieldLabel>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-6">
					{#each TONE_NAMES as tone (tone)}
						<FieldLabel class="gap-1">
							<RadioGroup value="on" variant={tone} aria-label="Field radio {tone}">
								<RadioGroupItem
									value="on"
									data-field-control="radio-group"
									data-field-tone={tone}
								/>
							</RadioGroup>
							<span class="text-sm">{tone}</span>
						</FieldLabel>
					{/each}
				</div>
			</Scheme>
		{/each}
	</section>

	<section id="checkbox" data-control="checkbox" class="space-y-4">
		<h2 class="text-base font-semibold tracking-widest uppercase">Checkbox</h2>
		{#each SCHEMES as scheme (scheme)}
			<Scheme {scheme}>
				<div class="flex flex-wrap items-center gap-4">
					{#each TONE_NAMES as tone (tone)}
						<label class="flex items-center gap-2 text-sm">
							<Checkbox variant={tone} checked data-tone={tone} />
							{tone}
						</label>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<label class="flex items-center gap-2 text-sm">
						<Checkbox data-case="focus" aria-label="Focus tone" />
						focus
					</label>
					<label class="flex items-center gap-2 text-sm">
						<Checkbox data-case="invalid" aria-invalid="true" aria-label="Invalid tone" />
						invalid
					</label>
					<label class="flex items-center gap-2 text-sm">
						<Checkbox data-case="disabled" disabled aria-label="Disabled tone" />
						disabled
					</label>
				</div>
				{@render swatches()}
			</Scheme>
		{/each}
	</section>

	<section id="switch" data-control="switch" class="space-y-4">
		<h2 class="text-base font-semibold tracking-widest uppercase">Switch</h2>
		{#each SCHEMES as scheme (scheme)}
			<Scheme {scheme}>
				<div class="flex flex-wrap items-center gap-4">
					{#each TONE_NAMES as tone (tone)}
						<label class="flex items-center gap-2 text-sm">
							<Switch variant={tone} checked data-tone={tone} />
							{tone}
						</label>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<label class="flex items-center gap-2 text-sm">
						<Switch data-case="focus" aria-label="Focus tone" />
						focus
					</label>
					<label class="flex items-center gap-2 text-sm">
						<Switch data-case="invalid" aria-invalid="true" aria-label="Invalid tone" />
						invalid
					</label>
					<label class="flex items-center gap-2 text-sm">
						<Switch data-case="disabled" disabled aria-label="Disabled tone" />
						disabled
					</label>
				</div>
				{@render swatches()}
			</Scheme>
		{/each}
	</section>

	<section id="radio-group" data-control="radio-group" class="space-y-4">
		<h2 class="text-base font-semibold tracking-widest uppercase">Radio group</h2>
		{#each SCHEMES as scheme (scheme)}
			<Scheme {scheme}>
				<div class="flex flex-wrap items-center gap-4">
					{#each TONE_NAMES as tone (tone)}
						<span class="flex items-center gap-2 text-sm">
							<RadioGroup value="on" variant={tone} aria-label="Radio {tone}">
								<RadioGroupItem value="on" data-tone={tone} />
								<RadioGroupItem value="off" data-unchecked-tone={tone} />
							</RadioGroup>
							{tone}
						</span>
					{/each}
					<span class="flex items-center gap-2 text-sm">
						<RadioGroup value="on" variant="success" aria-label="Radio override">
							<RadioGroupItem value="on" variant="destructive" data-override="radio-group" />
						</RadioGroup>
						override
					</span>
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<span class="flex items-center gap-2 text-sm">
						<RadioGroup value="on" aria-label="Radio focus">
							<RadioGroupItem value="on" data-case="focus" />
						</RadioGroup>
						focus
					</span>
					<span class="flex items-center gap-2 text-sm">
						<RadioGroup value="off" aria-label="Radio invalid">
							<RadioGroupItem value="on" aria-invalid="true" data-case="invalid" />
						</RadioGroup>
						invalid
					</span>
					<span class="flex items-center gap-2 text-sm">
						<RadioGroup value="off" aria-label="Radio disabled">
							<RadioGroupItem value="on" disabled data-case="disabled" />
						</RadioGroup>
						disabled
					</span>
				</div>
				{@render swatches()}
			</Scheme>
		{/each}
	</section>

	<section id="toggle" data-control="toggle" class="space-y-4">
		<h2 class="text-base font-semibold tracking-widest uppercase">Toggle</h2>
		{#each SCHEMES as scheme (scheme)}
			<Scheme {scheme}>
				<div class="flex flex-wrap items-center gap-4">
					{#each TONE_NAMES as tone (tone)}
						<Toggle variant={tone} pressed data-tone={tone}>{tone}</Toggle>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					{#each OUTLINE_TONES as key (key)}
						<Toggle variant={key} data-outline={key}>{key}</Toggle>
						<Toggle variant={key} pressed data-outline-pressed={key}>{key}</Toggle>
					{/each}
				</div>
				<div class="flex flex-wrap items-center gap-4">
					<Toggle data-case="focus" aria-label="Focus tone">focus</Toggle>
					<Toggle data-case="invalid" aria-invalid="true" aria-label="Invalid tone">invalid</Toggle>
					<Toggle data-case="disabled" disabled aria-label="Disabled tone">disabled</Toggle>
				</div>
				{@render swatches()}
			</Scheme>
		{/each}
	</section>
</div>
