<script lang="ts">
	import { Input } from '#lib/components/input-fixed/index.js';
	import { Field, FieldDescription, FieldLabel } from '#lib/components/ui/field/index.js';

	const id = $props.id();
</script>

<Field>
	<FieldLabel data-case="field-label" for={id}>Field label</FieldLabel>
	<FieldDescription>A short description for the field.</FieldDescription>
	<Input {id} placeholder="Field value" />
</Field>
