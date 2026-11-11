import { invalidRingSite, ringWidthSite } from './site.mjs';

export const RING_COMPONENTS = ['button'];

export const RINGS = [
	ringWidthSite('button', 'button/button.svelte'),
	invalidRingSite('button', 'button/button.svelte')
];
