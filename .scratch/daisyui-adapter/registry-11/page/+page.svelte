<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
</script>

<div class="grid gap-6 p-6">
	<div class="flex items-center gap-3">
		<Button id="button">Button</Button>
		<Input id="input" class="w-40" placeholder="Input" />
		<Checkbox id="checkbox" />
	</div>

	<div id="card-wrap">
		<Card.Root class="w-64">
			<Card.Header>
				<Card.Title>Card</Card.Title>
			</Card.Header>
			<Card.Content>Body</Card.Content>
		</Card.Root>
	</div>

	<!-- The seven template steps, sampled as used values so the calc() chain is visible. -->
	<div class="flex items-end gap-2">
		<div id="r-sm" class="size-8 rounded-sm bg-muted"></div>
		<div id="r-md" class="size-8 rounded-md bg-muted"></div>
		<div id="r-lg" class="size-8 rounded-lg bg-muted"></div>
		<div id="r-xl" class="size-8 rounded-xl bg-muted"></div>
		<div id="r-2xl" class="size-8 rounded-2xl bg-muted"></div>
		<div id="r-3xl" class="size-8 rounded-3xl bg-muted"></div>
		<div id="r-4xl" class="size-8 rounded-4xl bg-muted"></div>
	</div>

	<div id="border-b" class="border-b py-2 text-sm">border-b</div>
	<div id="divide" class="divide-y text-sm">
		<div id="div-1" class="py-2">divide row one</div>
		<div id="div-2" class="py-2">divide row two</div>
	</div>
	<div id="shadow" class="shadow-md size-8 bg-muted"></div>
</div>
