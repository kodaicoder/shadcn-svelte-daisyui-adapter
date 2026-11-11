export const TYPE_SCALE = [
	{ name: 'xs', size: 10, lineHeight: 14 },
	{ name: 'sm', size: 12, lineHeight: 16 },
	{ name: 'base', size: 14, lineHeight: 20 },
	{ name: 'lg', size: 16, lineHeight: 24 },
	{ name: 'xl', size: 18, lineHeight: 28 },
	{ name: '2xl', size: 20, lineHeight: 28 }
];

// `@theme inline` resolves its variables away, so the block that carries these has to be plain:
// `calc(var(--text-base) * 2)` in a utility needs the declaration emitted on :root to resolve.
export const typeScaleDeclarations = () =>
	TYPE_SCALE.flatMap(({ name, size, lineHeight }) => [
		{ prop: `--text-${name}`, value: `${size}px` },
		{ prop: `--text-${name}--line-height`, value: `${lineHeight}px` }
	]);

export const scaleValue = (rung, factor) => `[calc(var(--text-${rung})*${factor})]`;

const RUNG_ABOVE = { xs: 'sm', sm: 'base', base: 'lg', lg: 'xl', xl: '2xl' };

// One pass, so a shifted name is never read again.
export const shiftRungs = (text) =>
	text.replace(
		/text-(xs|sm|base|lg|xl|2xl)(?![a-z0-9-])/g,
		(_, rung) => `text-${RUNG_ABOVE[rung] ?? rung}`
	);
