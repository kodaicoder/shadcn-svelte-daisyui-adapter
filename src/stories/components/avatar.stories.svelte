<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import {
		Avatar,
		AvatarBadge,
		AvatarFallback,
		AvatarGroup,
		AvatarGroupCount,
		AvatarImage
	} from '#lib/components/ui/avatar/index.js';
	import { selectControl } from '../story-args.js';

	const SIZES = ['sm', 'default', 'lg'] as const;
	const LOADING_STATUSES = ['loading', 'loaded', 'error'] as const;

	const AVATAR_SVG =
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#8a8a8a"/><circle cx="32" cy="25" r="11" fill="#f4f4f5"/><path d="M12 64c0-11 9-20 20-20s20 9 20 20z" fill="#f4f4f5"/></svg>';
	const AVATAR_IMAGE = `data:image/svg+xml,${encodeURIComponent(AVATAR_SVG)}`;

	const PEOPLE = [
		{ name: 'Ada Lovelace', initials: 'AL' },
		{ name: 'Grace Hopper', initials: 'GH' },
		{ name: 'Alan Turing', initials: 'AT' }
	];

	const { Story } = defineMeta({
		title: 'Components/Avatar',
		component: Avatar,
		tags: ['autodocs'],
		argTypes: {
			size: selectControl(SIZES),
			loadingStatus: selectControl(LOADING_STATUSES)
		}
	});
</script>

<Story name="Playground" args={{ size: 'default', loadingStatus: 'loaded' }}>
	{#snippet template(args)}
		<Avatar {...args}>
			<AvatarImage src={AVATAR_IMAGE} alt="Ada Lovelace" />
			<AvatarFallback>AL</AvatarFallback>
		</Avatar>
	{/snippet}
</Story>

<Story name="Sizes" asChild>
	<div class="flex items-end gap-4">
		{#each SIZES as size (size)}
			<div class="flex flex-col items-center gap-2">
				<Avatar {size}>
					<AvatarImage src={AVATAR_IMAGE} alt="Ada Lovelace" />
					<AvatarFallback>AL</AvatarFallback>
				</Avatar>
				<span class="text-sm text-muted-foreground">{size}</span>
			</div>
		{/each}
	</div>
</Story>

<Story name="Fallback" asChild>
	<div class="flex items-end gap-4">
		<Avatar>
			<AvatarFallback>AL</AvatarFallback>
		</Avatar>
		<Avatar size="lg">
			<AvatarFallback>AL</AvatarFallback>
		</Avatar>
	</div>
</Story>

<Story name="WithBadge" asChild>
	<Avatar size="lg">
		<AvatarImage src={AVATAR_IMAGE} alt="Ada Lovelace" />
		<AvatarFallback>AL</AvatarFallback>
		<AvatarBadge />
	</Avatar>
</Story>

<Story name="Group" asChild>
	<AvatarGroup>
		{#each PEOPLE as { name, initials } (name)}
			<Avatar>
				<AvatarImage src={AVATAR_IMAGE} alt={name} />
				<AvatarFallback>{initials}</AvatarFallback>
			</Avatar>
		{/each}
		<AvatarGroupCount>+3</AvatarGroupCount>
	</AvatarGroup>
</Story>
