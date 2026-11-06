<script lang="ts">
	import { RadioGroup, RadioGroupItem } from '#lib/components/ui/radio-group/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	let live = $state('one');
</script>

<div class="space-y-10 p-6">
	<section>
		<h2 class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			States
		</h2>
		<RadioGroup value="comfortable" aria-label="Density">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="compact" id="density-compact" />
				<Label for="density-compact">Compact</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="comfortable" id="density-comfortable" />
				<Label for="density-comfortable">Comfortable</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="spacious" id="density-spacious" />
				<Label for="density-spacious">Spacious</Label>
			</div>
		</RadioGroup>
	</section>

	<section>
		<h2 class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Nothing selected
		</h2>
		<RadioGroup aria-label="Empty group">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="alpha" id="empty-alpha" />
				<Label for="empty-alpha">Alpha</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="beta" id="empty-beta" />
				<Label for="empty-beta">Beta</Label>
			</div>
		</RadioGroup>
	</section>

	<section>
		<h2 class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Disabled item
		</h2>
		<RadioGroup value="b" aria-label="Disabled item">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="a" id="item-a" />
				<Label for="item-a">Available</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="b" id="item-b" disabled />
				<Label for="item-b">Disabled but selected</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="c" id="item-c" />
				<Label for="item-c">Available too</Label>
			</div>
		</RadioGroup>
	</section>

	<section>
		<h2 class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Disabled group
		</h2>
		<RadioGroup value="x" disabled aria-label="Disabled group">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="x" id="group-x" />
				<Label for="group-x">Selected</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="y" id="group-y" />
				<Label for="group-y">Not selected</Label>
			</div>
		</RadioGroup>
	</section>

	<section>
		<h2 class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Invalid
		</h2>
		<RadioGroup value="one" aria-label="Invalid group">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="one" id="invalid-one" aria-invalid="true" />
				<Label for="invalid-one">Selected</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="two" id="invalid-two" aria-invalid="true" />
				<Label for="invalid-two">Not selected</Label>
			</div>
		</RadioGroup>
	</section>

	<section>
		<h2 class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Horizontal
		</h2>
		<RadioGroup
			value="left"
			orientation="horizontal"
			class="flex w-auto items-center gap-4"
			aria-label="Alignment"
		>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="left" id="align-left" />
				<Label for="align-left">Left</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="center" id="align-center" />
				<Label for="align-center">Center</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="right" id="align-right" />
				<Label for="align-right">Right</Label>
			</div>
		</RadioGroup>
	</section>

	<section>
		<h2 class="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Controlled
		</h2>
		<RadioGroup bind:value={live} class="w-auto" aria-label="Controlled">
			<div class="flex items-center gap-2">
				<RadioGroupItem value="one" id="live-one" />
				<Label for="live-one">One</Label>
			</div>
			<div class="flex items-center gap-2">
				<RadioGroupItem value="two" id="live-two" />
				<Label for="live-two">Two</Label>
			</div>
		</RadioGroup>
		<p class="mt-2 text-sm">value: {live}</p>
	</section>
</div>
