export const replaceSite = (site) => ({ ...site, position: 'replace' });
export const insertSite = (site) => ({ ...site, position: 'insert' });

export const ringWidthSite = (component, file) =>
	replaceSite({
		id: `${component}-focus-ring-width`,
		component,
		file,
		stock: 'focus-visible:ring-2',
		fixed: 'focus-visible:ring-3'
	});

export const invalidRingSite = (component, file) =>
	replaceSite({
		id: `${component}-invalid-ring-width`,
		component,
		file,
		stock: 'aria-invalid:ring-2',
		fixed: 'aria-invalid:ring-3'
	});

export const CREATES = [
	{
		file: 'binary-variant.ts',
		components: ['checkbox', 'switch', 'radio-group'],
		content: `export type BinaryVariant =
	| 'default'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'info'
	| 'destructive'
	| 'blackwhite';

export const RADIO_GROUP_VARIANT = Symbol.for('radio-group.variant');
`
	}
];
