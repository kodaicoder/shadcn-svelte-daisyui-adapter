import { invalidRingSite, replaceSite, ringWidthSite } from './site.mjs';

export const RING_COMPONENTS = ['button', 'scroll-area', 'slider'];

export const RINGS = [
	ringWidthSite('button', 'button/button.svelte'),
	invalidRingSite('button', 'button/button.svelte'),
	ringWidthSite('slider', 'slider/slider.svelte'),
	replaceSite({
		id: 'scroll-area-focus-ring-alpha',
		component: 'scroll-area',
		file: 'scroll-area/scroll-area.svelte',
		stock: 'focus-visible:ring-ring/50',
		fixed: 'focus-visible:ring-ring/30'
	})
];
