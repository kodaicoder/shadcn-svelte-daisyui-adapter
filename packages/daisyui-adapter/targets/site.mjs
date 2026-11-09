export const replaceSite = (site) => ({ ...site, position: 'replace' });
export const insertSite = (site) => ({ ...site, position: 'insert' });

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
