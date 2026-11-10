<script lang="ts">
	import { NativeSelect, NativeSelectOption } from '#lib/components/native-select-fixed/index.js';
	import { FieldReview } from '#lib/review/index.js';

	let base = $state('one');
	let filled = $state('two');
	let focus = $state('one');
	let invalid = $state('one');
	let disabled = $state('one');
	let small = $state('one');
</script>

<div class="space-y-6 p-6">
	<FieldReview kind="native-select" title="Native select">
		{#snippet controls()}
			<div class="grid gap-6 sm:grid-cols-2">
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">base</span>
					<NativeSelect data-case="base" bind:value={base}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
						<NativeSelectOption value="three">Three</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">filled</span>
					<NativeSelect data-case="filled" bind:value={filled}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">focus</span>
					<NativeSelect data-case="focus" bind:value={focus}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">invalid</span>
					<NativeSelect data-case="invalid" aria-invalid="true" bind:value={invalid}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">disabled</span>
					<NativeSelect data-case="disabled" disabled bind:value={disabled}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-xs text-muted-foreground">size-sm</span>
					<NativeSelect data-case="size-sm" size="sm" bind:value={small}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
			</div>
		{/snippet}
	</FieldReview>
</div>
