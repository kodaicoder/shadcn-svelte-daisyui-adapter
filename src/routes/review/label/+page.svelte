<script lang="ts">
	import { Checkbox } from '#lib/components/checkbox-fixed/index.js';
	import { Input } from '#lib/components/input-fixed/index.js';
	import { Label } from '#lib/components/label-fixed/index.js';
	import { RadioGroup, RadioGroupItem } from '#lib/components/radio-group-fixed/index.js';
	import { Switch } from '#lib/components/switch-fixed/index.js';
	import { Field, FieldDescription, FieldLabel } from '#lib/components/ui/field/index.js';
	import { ReviewPage } from '#lib/review/index.js';
	import LabelFor from './LabelFor.svelte';
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="label" title="Label">
		{#snippet controls()}
			<div class="space-y-6">
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">for</span>
					<LabelFor />
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">wrap</span>
					<Label data-case="wrap" class="w-fit">
						<Input class="w-40" placeholder="Wrapped input" />
						<span>Wrapped label</span>
					</Label>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">peer-checkbox</span>
					<div class="flex items-center gap-2">
						<Checkbox />
						<Label data-case="peer-checkbox">Checkbox label</Label>
					</div>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">peer-radio</span>
					<RadioGroup value="on" class="flex items-center gap-2">
						<RadioGroupItem value="on" />
						<Label data-case="peer-radio">Radio label</Label>
					</RadioGroup>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">peer-switch</span>
					<div class="flex items-center gap-2">
						<Switch />
						<Label data-case="peer-switch">Switch label</Label>
					</div>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">disabled-sibling</span>
					<div class="flex items-center gap-2">
						<Checkbox id="label-disabled-sibling" disabled />
						<Label for="label-disabled-sibling" data-case="disabled-sibling">
							Disabled sibling label
						</Label>
					</div>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">disabled-group</span>
					<div class="group flex items-center gap-2" data-disabled="true">
						<Label for="label-disabled-group" data-case="disabled-group">Disabled group label</Label>
						<Checkbox id="label-disabled-group" disabled />
					</div>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">disabled-wrapped</span>
					<Label data-case="disabled-wrapped" class="w-fit">
						<Input class="w-40" disabled value="Disabled input" />
						<span>Wrapped disabled label</span>
					</Label>
				</div>
				<div class="space-y-2">
					<span class="text-sm text-muted-foreground">field-label</span>
					<div class="w-64">
						<Field>
							<FieldLabel data-case="field-label" for="label-field-input">Field label</FieldLabel>
							<FieldDescription>A short description for the field.</FieldDescription>
							<Input id="label-field-input" placeholder="Field value" />
						</Field>
					</div>
				</div>
				<div class="flex items-end gap-4">
					<div class="space-y-1">
						<span class="text-sm text-muted-foreground">foreground</span>
						<div class="bg-foreground size-4" data-oracle="foreground"></div>
					</div>
				</div>
			</div>
		{/snippet}
	</ReviewPage>
</div>
