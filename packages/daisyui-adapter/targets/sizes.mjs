import { insertSite, replaceSite } from './site.mjs';
import { scaleValue } from './type-scale.mjs';

// The field size sets the box, the text and the radius step. Radius is a separate table, so every
// entry here stays independent of the radius anchor and a second `fix` run still reports `fixed`.
export const SIZE_COMPONENTS = ['input', 'textarea', 'native-select'];

const INPUT_TEXT = [
	'border px-2 py-0.5',
	`data-[size=sm]:h-${scaleValue('sm', 2)} data-[size=sm]:px-${scaleValue('sm', 0.5)} data-[size=sm]:text-sm`,
	`data-[size=default]:h-${scaleValue('base', 2)} data-[size=default]:px-${scaleValue('base', 0.5)}`,
	`data-[size=lg]:h-${scaleValue('lg', 2)} data-[size=lg]:px-${scaleValue('lg', 0.5)} data-[size=lg]:text-lg`,
	'text-base'
].join(' ');
const TEXTAREA_TEXT = [
	'px-2 py-2',
	`data-[size=sm]:min-h-${scaleValue('sm', 4)} data-[size=sm]:px-${scaleValue('sm', 0.5)} data-[size=sm]:text-sm`,
	`data-[size=default]:px-${scaleValue('base', 0.5)}`,
	`data-[size=lg]:min-h-${scaleValue('lg', 4)} data-[size=lg]:px-${scaleValue('lg', 0.5)} data-[size=lg]:text-lg`,
	'text-base'
].join(' ');
const NATIVE_SELECT_STEPS = [
	`data-[size=sm]:h-${scaleValue('sm', 2)} data-[size=sm]:pl-${scaleValue('sm', 0.5)} data-[size=sm]:text-sm`,
	`data-[size=default]:h-${scaleValue('base', 2)} data-[size=default]:pl-${scaleValue('base', 0.5)}`,
	`data-[size=lg]:h-${scaleValue('lg', 2)} data-[size=lg]:pl-${scaleValue('lg', 0.5)} data-[size=lg]:text-lg`,
	'outline-none'
].join(' ');

export const SIZES = [
	insertSite({
		id: 'input-size-prop',
		component: 'input',
		file: 'input/input.svelte',
		stock: 'type,',
		fixed: 'type,\n\t\tsize = "default",'
	}),
	replaceSite({
		id: 'input-size-type',
		component: 'input',
		file: 'input/input.svelte',
		stock: 'Omit<HTMLInputAttributes, "type">',
		fixed: 'Omit<HTMLInputAttributes, "type" | "size">'
	}),
	insertSite({
		id: 'input-size-props',
		component: 'input',
		file: 'input/input.svelte',
		stock: '({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined })',
		fixed:
			'({ type: "file"; files?: FileList } | { type?: InputType; files?: undefined }) & {\n\t\t\t\tsize?: "sm" | "default" | "lg";\n\t\t\t}'
	}),
	replaceSite({
		id: 'input-size-attribute',
		component: 'input',
		file: 'input/input.svelte',
		stock: 'data-slot={dataSlot}\n\t\tclass={cn(',
		fixed: 'data-slot={dataSlot}\n\t\tdata-size={size}\n\t\tclass={cn('
	}),
	replaceSite({
		id: 'input-size-class',
		component: 'input',
		file: 'input/input.svelte',
		stock: 'border px-2 py-0.5 text-sm',
		fixed: INPUT_TEXT
	}),
	replaceSite({
		id: 'input-size-md',
		component: 'input',
		file: 'input/input.svelte',
		stock: ' md:text-xs/relaxed',
		fixed: ''
	}),
	replaceSite({
		id: 'input-size-file',
		component: 'input',
		file: 'input/input.svelte',
		stock: 'file:h-6 file:text-xs/relaxed file:font-medium',
		fixed:
			'file:h-6 file:text-sm/relaxed data-[size=sm]:file:text-[0.625rem] data-[size=lg]:file:text-base file:font-medium'
	}),
	insertSite({
		id: 'textarea-size-prop',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		stock: 'value = $bindable(),',
		fixed: 'value = $bindable(),\n\t\tsize = "default",'
	}),
	insertSite({
		id: 'textarea-size-type',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		stock: 'WithoutChildren<WithElementRef<HTMLTextareaAttributes>>',
		fixed:
			'WithoutChildren<WithElementRef<HTMLTextareaAttributes>> & {\n\t\tsize?: "sm" | "default" | "lg";\n\t}'
	}),
	insertSite({
		id: 'textarea-size-attribute',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		stock: 'data-slot={dataSlot}',
		fixed: 'data-slot={dataSlot}\n\tdata-size={size}'
	}),
	replaceSite({
		id: 'textarea-min-height',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		stock: 'field-sizing-content min-h-16 w-full',
		fixed: `field-sizing-content min-h-${scaleValue('base', 4)} w-full`
	}),
	replaceSite({
		id: 'textarea-size-class',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		stock: 'px-2 py-2 text-sm',
		fixed: TEXTAREA_TEXT
	}),
	replaceSite({
		id: 'textarea-size-md',
		component: 'textarea',
		file: 'textarea/textarea.svelte',
		stock: ' md:text-xs/relaxed',
		fixed: ''
	}),
	replaceSite({
		id: 'native-select-size-type',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		stock: 'size?: "sm" | "default";',
		fixed: 'size?: "sm" | "default" | "lg";'
	}),
	replaceSite({
		id: 'native-select-size-base',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		stock: 'text-xs/relaxed transition-colors select-none',
		fixed: 'text-base transition-colors select-none'
	}),
	replaceSite({
		id: 'native-select-size-steps',
		component: 'native-select',
		file: 'native-select/native-select.svelte',
		stock: 'data-[size=sm]:h-6 data-[size=sm]:text-[0.625rem] outline-none',
		fixed: NATIVE_SELECT_STEPS
	})
];
