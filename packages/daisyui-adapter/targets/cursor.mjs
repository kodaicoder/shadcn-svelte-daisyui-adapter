import { replaceSite } from './site.mjs';

export const CURSOR_COMPONENTS = ['button', 'checkbox', 'switch', 'radio-group', 'toggle', 'label'];

export const CURSOR_SITES = [
	{
		id: 'button-cursor',
		component: 'button',
		file: 'button/button.svelte',
		stock: 'group/button inline-flex shrink-0 items-center justify-center',
		fixed: 'group/button inline-flex shrink-0 cursor-pointer items-center justify-center'
	},
	{
		id: 'checkbox-cursor',
		component: 'checkbox',
		file: 'checkbox/checkbox.svelte',
		stock: 'peer relative shrink-0 outline-none',
		fixed: 'peer relative shrink-0 cursor-pointer outline-none'
	},
	{
		id: 'switch-cursor',
		component: 'switch',
		file: 'switch/switch.svelte',
		stock: 'peer group/switch relative inline-flex items-center',
		fixed: 'peer group/switch relative inline-flex cursor-pointer items-center'
	},
	{
		id: 'radio-group-cursor',
		component: 'radio-group',
		file: 'radio-group/radio-group-item.svelte',
		stock: 'peer relative aspect-square shrink-0 border',
		fixed: 'peer relative aspect-square shrink-0 cursor-pointer border'
	},
	{
		id: 'toggle-cursor',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		stock: 'group/toggle inline-flex items-center',
		fixed: 'group/toggle inline-flex cursor-pointer items-center'
	},
	{
		id: 'toggle-disabled-cursor',
		component: 'toggle',
		file: 'toggle/toggle.svelte',
		stock: 'disabled:pointer-events-none disabled:opacity-50',
		fixed: 'disabled:cursor-not-allowed disabled:opacity-50'
	},
	{
		id: 'button-disabled',
		component: 'button',
		file: 'button/button.svelte',
		stock: 'disabled:pointer-events-none disabled:opacity-50',
		fixed:
			'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50'
	},
	{
		id: 'label-disabled-cursor',
		component: 'label',
		file: 'label/label.svelte',
		stock: 'group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed',
		fixed:
			'group-data-[disabled=true]:cursor-not-allowed peer-disabled:cursor-not-allowed has-[:disabled]:cursor-not-allowed'
	}
].map(replaceSite);
