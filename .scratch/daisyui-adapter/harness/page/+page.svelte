<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Alert, AlertDescription, AlertTitle } from '#lib/components/ui/alert/index.js';
	import { Bubble, BubbleContent } from '#lib/components/ui/bubble/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Toggle } from '#lib/components/ui/toggle/index.js';
</script>

<div class="min-h-screen bg-background p-6 text-foreground">
	<header class="mb-4">
		<h1 class="text-lg font-semibold">Adapter evidence page</h1>
		<p class="text-xs text-muted-foreground">
			Ticket 33 harness proof: painted pairs, four tones, surfaces.
		</p>
	</header>

	<section class="mb-4">
		<h2 class="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Repaired pairs (fixed classes, painted)
		</h2>
		<div class="grid grid-cols-2 gap-1.5">
			<div class="flex items-center gap-2">
				<span class="bg-muted px-2 py-1 text-xs text-foreground" data-pair="dialog-close"
					>dialog</span
				>
				<span class="text-xs text-muted-foreground">dialog close</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="bg-muted px-2 py-1 text-xs text-foreground" data-pair="sheet-close">sheet</span
				>
				<span class="text-xs text-muted-foreground">sheet close</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="bg-accent px-2 py-1 text-xs text-accent-foreground" data-pair="calendar-hover"
					>calendar</span
				>
				<span class="text-xs text-muted-foreground">calendar hover</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="bg-accent px-2 py-1 text-xs text-accent-foreground" data-pair="range-hover"
					>range</span
				>
				<span class="text-xs text-muted-foreground">range hover</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="bg-accent px-2 py-1 text-xs text-accent-foreground" data-pair="range-middle"
					>middle</span
				>
				<span class="text-xs text-muted-foreground">range middle</span>
			</div>
			<div class="flex items-center gap-2">
				<span
					class="text-destructive-text bg-destructive/10 px-2 py-1 text-xs dark:bg-destructive/20"
					data-pair="dropdown-destructive">dropdown</span
				>
				<span class="text-xs text-muted-foreground">dropdown destructive</span>
			</div>
			<div class="flex items-center gap-2">
				<span
					class="text-destructive-text bg-destructive/10 px-2 py-1 text-xs dark:bg-destructive/20"
					data-pair="context-destructive">context</span
				>
				<span class="text-xs text-muted-foreground">context destructive</span>
			</div>
			<div class="flex items-center gap-2">
				<span
					class="text-destructive-text bg-destructive/10 px-2 py-1 text-xs dark:bg-destructive/20"
					data-pair="menubar-destructive">menubar</span
				>
				<span class="text-xs text-muted-foreground">menubar destructive</span>
			</div>
			<div class="flex items-center gap-2">
				<span
					class="border border-border bg-background px-2 py-1 text-xs text-foreground"
					data-pair="chart-tooltip-label">tooltip</span
				>
				<span class="text-xs text-muted-foreground">chart tooltip</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="bg-muted px-2 py-1 text-xs text-foreground" data-pair="bubble-muted"
					>bubble</span
				>
				<span class="text-xs text-muted-foreground">bubble muted</span>
			</div>
		</div>
	</section>

	<section class="mb-4">
		<h2 class="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Button
		</h2>
		<div class="flex flex-wrap items-center gap-1.5">
			<Button>Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="outline">Outline</Button>
		</div>
		<div class="mt-1.5 grid grid-cols-4 gap-1.5">
			<Button variant="success" data-tone="success" data-part="filled">success</Button>
			<Button variant="outline-success">outline</Button>
			<Button variant="ghost-success">ghost</Button>
			<Button variant="link-success">link</Button>
			<Button variant="warning" data-tone="warning" data-part="filled">warning</Button>
			<Button variant="outline-warning">outline</Button>
			<Button variant="ghost-warning">ghost</Button>
			<Button variant="link-warning">link</Button>
			<Button variant="info" data-tone="info" data-part="filled">info</Button>
			<Button variant="outline-info">outline</Button>
			<Button variant="ghost-info">ghost</Button>
			<Button variant="link-info">link</Button>
			<Button variant="destructive" data-tone="destructive" data-part="filled">destructive</Button>
			<Button variant="outline-destructive">outline</Button>
			<Button variant="ghost-destructive">ghost</Button>
			<Button variant="link-destructive">link</Button>
		</div>
	</section>

	<section class="mb-4">
		<h2 class="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Text tones on the page
		</h2>
		<div class="grid grid-cols-4 gap-1.5">
			<span
				class="text-success-text bg-background px-2 py-1 text-xs"
				data-tone="success"
				data-part="text">success</span
			>
			<span
				class="text-warning-text bg-background px-2 py-1 text-xs"
				data-tone="warning"
				data-part="text">warning</span
			>
			<span class="text-info-text bg-background px-2 py-1 text-xs" data-tone="info" data-part="text"
				>info</span
			>
			<span
				class="text-destructive-text bg-background px-2 py-1 text-xs"
				data-tone="destructive"
				data-part="text">destructive</span
			>
		</div>
	</section>

	<section class="mb-4">
		<h2 class="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Badge
		</h2>
		<div class="grid grid-cols-4 gap-1.5">
			<Badge variant="success">success</Badge>
			<Badge variant="outline-success">outline</Badge>
			<Badge variant="ghost-success">ghost</Badge>
			<Badge variant="link-success">link</Badge>
			<Badge variant="warning">warning</Badge>
			<Badge variant="outline-warning">outline</Badge>
			<Badge variant="ghost-warning">ghost</Badge>
			<Badge variant="link-warning">link</Badge>
			<Badge variant="info">info</Badge>
			<Badge variant="outline-info">outline</Badge>
			<Badge variant="ghost-info">ghost</Badge>
			<Badge variant="link-info">link</Badge>
			<Badge variant="destructive">destructive</Badge>
			<Badge variant="outline-destructive">outline</Badge>
			<Badge variant="ghost-destructive">ghost</Badge>
			<Badge variant="link-destructive">link</Badge>
		</div>
	</section>

	<section class="mb-4">
		<h2 class="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Bubble
		</h2>
		<div class="grid grid-cols-3 gap-1.5">
			<Bubble variant="success"><BubbleContent>success</BubbleContent></Bubble>
			<Bubble variant="outline-success"><BubbleContent>outline</BubbleContent></Bubble>
			<Bubble variant="ghost-success"><BubbleContent>ghost</BubbleContent></Bubble>
			<Bubble variant="warning"><BubbleContent>warning</BubbleContent></Bubble>
			<Bubble variant="outline-warning"><BubbleContent>outline</BubbleContent></Bubble>
			<Bubble variant="ghost-warning"><BubbleContent>ghost</BubbleContent></Bubble>
			<Bubble variant="info"><BubbleContent>info</BubbleContent></Bubble>
			<Bubble variant="outline-info"><BubbleContent>outline</BubbleContent></Bubble>
			<Bubble variant="ghost-info"><BubbleContent>ghost</BubbleContent></Bubble>
			<Bubble variant="destructive"><BubbleContent>destructive</BubbleContent></Bubble>
			<Bubble variant="outline-destructive"><BubbleContent>outline</BubbleContent></Bubble>
			<Bubble variant="ghost-destructive"><BubbleContent>ghost</BubbleContent></Bubble>
		</div>
	</section>

	<section class="mb-4">
		<h2 class="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Alert
		</h2>
		<div class="grid grid-cols-2 gap-1.5">
			<Alert>
				<AlertTitle>Default</AlertTitle>
				<AlertDescription>Neutral notice.</AlertDescription>
			</Alert>
			<Alert variant="destructive">
				<AlertTitle>Destructive</AlertTitle>
				<AlertDescription>Destructive notice.</AlertDescription>
			</Alert>
			<Alert variant="success">
				<AlertTitle>Success</AlertTitle>
				<AlertDescription>Success notice.</AlertDescription>
			</Alert>
			<Alert variant="warning">
				<AlertTitle>Warning</AlertTitle>
				<AlertDescription>Warning notice.</AlertDescription>
			</Alert>
			<Alert variant="info">
				<AlertTitle>Info</AlertTitle>
				<AlertDescription>Info notice.</AlertDescription>
			</Alert>
		</div>
	</section>

	<section>
		<h2 class="mb-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
			Surfaces
		</h2>
		<div class="grid grid-cols-2 gap-1.5">
			<Card>
				<CardHeader>
					<CardTitle>Card with input</CardTitle>
				</CardHeader>
				<CardContent>
					<Input placeholder="card field" />
				</CardContent>
			</Card>
			<div class="flex flex-col gap-1.5">
				<Input placeholder="standalone field" />
				<div class="flex items-center gap-1.5">
					<Toggle>Toggle</Toggle>
					<Button variant="destructive">Destructive base</Button>
				</div>
			</div>
		</div>
	</section>
</div>
