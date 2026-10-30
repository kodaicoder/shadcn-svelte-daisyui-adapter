<script lang="ts">
	import * as Chart from "#lib/components/ui/chart/index.js";

	const data = [
		{ browser: "a", visitors: 275 },
		{ browser: "b", visitors: 200 },
		{ browser: "c", visitors: 187 },
		{ browser: "d", visitors: 173 },
		{ browser: "e", visitors: 90 }
	];

	const config = {
		visitors: { label: "Visitors", color: "var(--chart-1)" }
	} satisfies Chart.ChartConfig;

	const checks = [
		"--probe-check-anchor",
		"--probe-check-direction",
		"--probe-check-surface-lum",
		"--probe-check-contrast",
		"--probe-check-adjacent",
		"--probe-check-min-adjacent",
		"--probe-check-clamped"
	];
</script>

<div class="grid gap-5 p-6">
	<div>
		<p class="mb-2 text-xs font-semibold">settled chart ramp</p>
		<div class="flex h-12 w-full overflow-hidden rounded-md">
			{#each [1, 2, 3, 4, 5] as n (n)}
				<div id={`swatch-chart-${n}`} class="flex-1" style={`background: var(--chart-${n})`}></div>
			{/each}
		</div>
	</div>

	<div>
		<p class="mb-2 text-xs font-semibold">page surface</p>
		<div id="swatch-page" class="h-12 w-full rounded-md" style="background: var(--background)"></div>
	</div>

	<div class="grid gap-1 text-xs" style="font-family: monospace">
		{#each checks as name (name)}
			<p id={`check-${name}`} data-check={name} style="color: var(--muted-foreground)">{name}</p>
		{/each}
	</div>

	<div class="h-64">
		<Chart.Container id="probe-chart" config={config}>
			<Chart.BarChart data={data} x="browser" y="visitors" />
		</Chart.Container>
	</div>
</div>
