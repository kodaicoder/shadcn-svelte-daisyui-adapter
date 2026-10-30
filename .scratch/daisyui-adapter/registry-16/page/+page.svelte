<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Tabs from '#lib/components/ui/tabs/index.js';
	import * as Chart from '#lib/components/ui/chart/index.js';
	import { cn } from '#lib/utils.js';

	// Five series, one per chart token, drawn as plain SVG inside the real Chart.Container. The
	// question is whether the five tokens read as five series, which an SVG answers without a
	// chart library's own scaling sitting between the token and the pixel.
	const series = [1, 2, 3, 4, 5].map((n) => ({
		name: `s${n}`,
		value: 30 + n * 14,
		color: `var(--chart-${n})`
	}));

	const config = Object.fromEntries(
		series.map((s) => [s.name, { label: s.name, color: s.color }])
	) satisfies Chart.ChartConfig;
</script>

<div class="flex min-h-screen bg-background text-foreground">
	<aside
		data-testid="sidebar"
		class="w-56 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
	>
		<div class="border-b border-sidebar-border p-3">
			<p class="text-sm font-semibold">Acme</p>
			<p class="text-xs text-muted-foreground">workspace</p>
		</div>
		<nav class="grid gap-1 p-2">
			<a
				href="#dashboard"
				data-testid="sidebar-active"
				class="rounded-md bg-sidebar-accent px-3 py-1.5 text-sm font-medium text-sidebar-accent-foreground"
				>Dashboard</a
			>
			<a href="#reports" class="rounded-md px-3 py-1.5 text-sm">Reports</a>
			<a href="#settings" class="rounded-md px-3 py-1.5 text-sm">Settings</a>
		</nav>
		<div class="border-t border-sidebar-border p-3">
			<button
				data-testid="sidebar-primary"
				class="w-full rounded-md bg-sidebar-primary px-3 py-1.5 text-sm text-sidebar-primary-foreground"
				>New report</button
			>
		</div>
	</aside>

	<main class="grid flex-1 content-start gap-6 p-6">
		<header class="grid gap-1">
			<h1 class="text-2xl font-semibold">Adapter prototype</h1>
			<p class="text-sm text-muted-foreground">
				Six components on a theme the adapter did not write, to see which tokens mislead.
			</p>
		</header>

		<section class="grid gap-2" data-testid="buttons">
			<h2 class="text-sm font-semibold">Button</h2>
			<div class="flex flex-wrap gap-2">
				<Button data-testid="btn-default">Default</Button>
				<Button data-testid="btn-secondary" variant="secondary">Secondary</Button>
				<Button data-testid="btn-outline" variant="outline">Outline</Button>
				<Button data-testid="btn-destructive" variant="destructive">Destructive</Button>
				<Button data-testid="btn-ghost" variant="ghost">Ghost</Button>
			</div>
		</section>

		<section class="grid gap-2" data-testid="cards">
			<h2 class="text-sm font-semibold">Card</h2>
			<div class="grid gap-3 sm:grid-cols-2">
				<Card.Root data-testid="card-plain">
					<Card.Header>
						<Card.Title>Plain card</Card.Title>
						<Card.Description>Rests on the page, so its edge has to hold.</Card.Description>
					</Card.Header>
					<Card.Content>
						<p class="text-sm text-muted-foreground">
							Muted body text on the card surface, at the size a description uses.
						</p>
					</Card.Content>
					<Card.Footer>
						<Button size="sm" variant="outline">Action</Button>
					</Card.Footer>
				</Card.Root>
				<Card.Root data-testid="card-muted" class="bg-muted">
					<Card.Header>
						<Card.Title>Muted card</Card.Title>
						<Card.Description>secondary, muted and accent all resolve to base-200.</Card.Description>
					</Card.Header>
					<Card.Content>
						<Input data-testid="input-in-card" placeholder="Input inside a card" />
					</Card.Content>
				</Card.Root>
			</div>
		</section>

		<section class="grid gap-2" data-testid="inputs">
			<h2 class="text-sm font-semibold">Input</h2>
			<div class="grid max-w-md gap-2">
				<Input data-testid="input-plain" placeholder="you@example.com" />
				<Input data-testid="input-disabled" disabled value="disabled" />
				<p class="text-xs text-muted-foreground">
					Helper text in muted-foreground, which is the pair most likely to fail.
				</p>
			</div>
		</section>

		<section class="grid gap-2" data-testid="tabs">
			<h2 class="text-sm font-semibold">Tabs</h2>
			<Tabs.Root value="one">
				<Tabs.List data-testid="tabs-list">
					<Tabs.Trigger value="one" data-testid="tab-one">Overview</Tabs.Trigger>
					<Tabs.Trigger value="two">Activity</Tabs.Trigger>
					<Tabs.Trigger value="three">Settings</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="one" class="pt-3 text-sm text-muted-foreground">
					The active trigger is the one that has to separate from the list it sits in.
				</Tabs.Content>
			</Tabs.Root>
		</section>

		<section class="grid gap-2" data-testid="dialog">
			<h2 class="text-sm font-semibold">Dialog</h2>
			<div>
				<Dialog.Root>
					<Dialog.Trigger data-testid="btn-open-dialog">Open dialog</Dialog.Trigger>
					<Dialog.Content data-testid="dialog-content">
						<Dialog.Header>
							<Dialog.Title>Delete report</Dialog.Title>
							<Dialog.Description>
								The panel sits above a scrim, which is the one surface the adapter does not own.
							</Dialog.Description>
						</Dialog.Header>
						<Dialog.Footer>
							<Button variant="outline">Cancel</Button>
							<Button variant="destructive">Delete</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
			</div>
		</section>

		<section class="grid gap-2" data-testid="charts">
			<h2 class="text-sm font-semibold">Chart</h2>
			<div class="flex h-10 w-full overflow-hidden rounded-md">
				{#each [1, 2, 3, 4, 5] as n (n)}
					<div
						data-testid={`swatch-chart-${n}`}
						class="flex-1"
						style={`background: var(--chart-${n})`}
					></div>
				{/each}
			</div>
			<div class="h-48 w-full">
				<Chart.Container id="proto-chart" config={config}>
					<svg viewBox="0 0 320 160" class="h-full w-full" role="img" aria-label="Five series">
						{#each series as s, i (s.name)}
							<rect
								data-testid={`bar-${s.name}`}
								x={16 + i * 60}
								y={160 - s.value * 1.4}
								width="44"
								height={s.value * 1.4}
								fill={s.color}
							/>
						{/each}
					</svg>
				</Chart.Container>
			</div>
		</section>

		<section class="grid gap-2" data-testid="focus">
			<h2 class="text-sm font-semibold">Focus</h2>
			<div class="flex gap-2">
				<button
					data-testid="focus-primary"
					class={cn(
						'rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground',
						'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
					)}>Ring on primary</button
				>
				<button
					data-testid="focus-surface"
					class={cn(
						'rounded-md border border-border bg-background px-3 py-1.5 text-sm',
						'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
					)}>Ring on surface</button
				>
			</div>
		</section>
	</main>
</div>
