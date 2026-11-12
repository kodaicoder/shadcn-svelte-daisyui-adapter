// Storybook keeps the docgen union for a select control and drops URL-persisted args, so
// `?args=variant:secondary` survives only with an explicit enum type.
export function selectControl<const T extends string>(options: readonly T[]) {
	return {
		control: 'select' as const,
		options: [...options],
		type: { name: 'enum' as const, value: [...options] }
	};
}
