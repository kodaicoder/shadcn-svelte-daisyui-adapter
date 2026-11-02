// Does `var(--helper, stock)` fall back when the helper is a relative-colour expression whose
// source var is undefined? The 5 mix helpers prove it for color-mix; this checks the oklch(from ...)
// shape B would emit, in a browser, without a build.
import { chromium } from 'playwright';

const CASES = {
	old_shape: '--daisy-derived-chart-1: oklch(from var(--daisy-color-primary) 0.6562 min(c, 0.08) h);',
	new_shape:
		'--chart-1: var(--daisy-derived-chart-1, oklch(0.845 0.143 164.978));' +
		'--daisy-derived-chart-1: oklch(from var(--daisy-color-primary) 0.6562 min(c, 0.08) h);',
	new_shape_with_theme:
		'--daisy-color-primary: oklch(0.45 0.24 277.023);' +
		'--chart-1: var(--daisy-derived-chart-1, oklch(0.845 0.143 164.978));' +
		'--daisy-derived-chart-1: oklch(from var(--daisy-color-primary) 0.6562 min(c, 0.08) h);'
};

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, css] of Object.entries(CASES)) {
	await page.setContent(
		`<style>:root{${css}}#s{background-color:var(--chart-1)}</style><div id="s" style="width:10px;height:10px"></div>`
	);
	const read = await page.evaluate(() => {
		const probe = document.createElement('canvas');
		probe.width = probe.height = 1;
		const ctx = probe.getContext('2d', { willReadFrequently: true });
		ctx.fillStyle = '#ff00ff';
		ctx.fillStyle = getComputedStyle(document.getElementById('s')).backgroundColor;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
		return {
			chart1: getComputedStyle(document.documentElement).getPropertyValue('--chart-1').trim(),
			painted: `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`
		};
	});
	console.log(name.padEnd(22), JSON.stringify(read));
}
await browser.close();
