<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { Checkbox } from '../checkbox-fixed/index.js';
	import { Input } from '../input-fixed/index.js';
	import { NativeSelect, NativeSelectOption } from '../native-select-fixed/index.js';
	import { RadioGroup, RadioGroupItem } from '../radio-group-fixed/index.js';
	import { Label } from './index.js';
	import { Switch } from '../switch-fixed/index.js';
	import { Textarea } from '../textarea-fixed/index.js';

	const { Story } = defineMeta({
		title: 'Components/Label',
		component: Label,
		tags: ['autodocs'],
		argTypes: {
			for: { control: 'text' }
		}
	});
</script>

<Story name="Playground" args={{ for: 'label-playground' }}>
	{#snippet template(args)}
		<div class="flex w-64 flex-col gap-1">
			<Label {...args}>Email address</Label>
			<Input id={args.for} placeholder="you@example.com" />
		</div>
	{/snippet}
</Story>

<Story name="Association" asChild>
	<div class="flex flex-col gap-6">
		<div class="flex w-64 flex-col gap-1">
			<Label for="association-input">Name</Label>
			<Input id="association-input" placeholder="your name" />
		</div>
		<div class="flex w-64 flex-col gap-1">
			<Label for="association-textarea">Notes</Label>
			<Textarea id="association-textarea" rows={2} />
		</div>
		<div class="flex w-64 flex-col gap-1">
			<Label for="association-select">Fruit</Label>
			<NativeSelect id="association-select">
				<NativeSelectOption value="apple">Apple</NativeSelectOption>
			</NativeSelect>
		</div>
	</div>
</Story>

<Story name="Wrapping" asChild>
	<Label class="w-fit">
		<Input class="w-56" placeholder="Wrapped control" />
		<span>Wrapped label</span>
	</Label>
</Story>

<Story name="Peers" asChild>
	<div class="flex flex-col gap-4">
		<div class="flex items-center gap-2">
			<Checkbox aria-label="Checkbox" />
			<Label>Checkbox peer</Label>
		</div>
		<RadioGroup value="on" class="flex items-center gap-2">
			<RadioGroupItem value="on" aria-label="Radio" />
			<Label>Radio peer</Label>
		</RadioGroup>
		<div class="flex items-center gap-2">
			<Switch aria-label="Switch" />
			<Label>Switch peer</Label>
		</div>
	</div>
</Story>

<Story name="Disabled" asChild>
	<div class="flex flex-col gap-4">
		<div class="flex w-64 flex-col gap-1">
			<Input id="disabled-input" disabled value="Disabled input" />
			<Label for="disabled-input">Disabled input</Label>
		</div>
		<div class="flex w-64 flex-col gap-1">
			<Textarea id="disabled-textarea" class="h-9 w-56" disabled />
			<Label for="disabled-textarea">Disabled textarea</Label>
		</div>
		<div class="flex w-64 flex-col gap-1">
			<NativeSelect id="disabled-select" class="w-56" disabled>
				<NativeSelectOption value="apple">Apple</NativeSelectOption>
			</NativeSelect>
			<Label for="disabled-select">Disabled select</Label>
		</div>
		<div class="group flex items-center gap-2" data-disabled="true">
			<Label for="disabled-group">Disabled group</Label>
			<Checkbox id="disabled-group" aria-label="Grouped checkbox" disabled />
		</div>
		<Label class="w-fit">
			<Input class="w-56" disabled value="Disabled wrapped input" />
			<span>Disabled wrapped</span>
		</Label>
	</div>
</Story>
