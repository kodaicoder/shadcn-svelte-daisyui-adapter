export type BinaryVariant =
	| 'default'
	| 'secondary'
	| 'success'
	| 'warning'
	| 'info'
	| 'destructive'
	| 'blackwhite';

export const RADIO_GROUP_VARIANT = Symbol.for('radio-group.variant');
