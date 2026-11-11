<script lang="ts">
	import { NativeSelect, NativeSelectOption } from '#lib/components/native-select-fixed/index.js';
	import { ReviewPage, ToneRow, type Tone } from '#lib/review/index.js';

	let base = $state('one');
	let filled = $state('two');
	let focus = $state('one');
	let invalid = $state('one');
	let disabled = $state('one');
	let small = $state('one');
	let sizeDefault = $state('one');
	let sizeLarge = $state('one');
</script>

<div class="space-y-6 p-6">
	<ReviewPage kind="native-select" title="Native select">
		{#snippet controls()}
			<div class="grid gap-6 sm:grid-cols-2">
				<label class="space-y-1">
					<span class="text-sm text-muted-foreground">base</span>
					<NativeSelect data-case="base" bind:value={base}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
						<NativeSelectOption value="three">Three</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-sm text-muted-foreground">filled</span>
					<NativeSelect data-case="filled" bind:value={filled}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-sm text-muted-foreground">focus</span>
					<NativeSelect data-case="focus" bind:value={focus}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-sm text-muted-foreground">invalid</span>
					<NativeSelect data-case="invalid" aria-invalid="true" bind:value={invalid}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-sm text-muted-foreground">disabled</span>
					<NativeSelect data-case="disabled" disabled bind:value={disabled}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-sm text-muted-foreground">size-sm</span>
					<NativeSelect data-case="size-sm" size="sm" bind:value={small}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-sm text-muted-foreground">size-default</span>
					<NativeSelect data-case="size-default" size="default" bind:value={sizeDefault}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<label class="space-y-1">
					<span class="text-sm text-muted-foreground">size-lg</span>
					<NativeSelect data-case="size-lg" size="lg" bind:value={sizeLarge}>
						<NativeSelectOption value="one">One</NativeSelectOption>
						<NativeSelectOption value="two">Two</NativeSelectOption>
					</NativeSelect>
				</label>
				<div class="flex items-end gap-2">
					<span class="size-4 rounded-sm" data-oracle="radius-sm"></span>
					<span class="size-4 rounded-md" data-oracle="radius-md"></span>
					<span class="size-4 rounded-lg" data-oracle="radius-lg"></span>
				</div>
				<ToneRow>
					{#snippet control(tone: Tone)}
						<NativeSelect data-tone={tone} variant={tone}>
							<NativeSelectOption value="one">One</NativeSelectOption>
							<NativeSelectOption value="two">Two</NativeSelectOption>
						</NativeSelect>
					{/snippet}
				</ToneRow>
			</div>
		{/snippet}
	</ReviewPage>
</div>
