// Answers the ticket's visual questions that a static screenshot cannot: contrast ratios, the
// focus ring, and the dialog surface. shot.mjs never focuses or opens anything, so those states
// were unmeasured by the harness run.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:5209/';
const out = process.argv[3] ?? './evidence';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(String(e)));
await page.goto(url, { waitUntil: 'networkidle' });

// Every pair the ticket names as likely to fail, plus the chart series.
const PAIRS = [
	['muted-on-card', '[data-testid=card-plain] p', '[data-testid=card-plain]'],
	['muted-on-page', 'main p', 'body'],
	['body-on-sidebar', '[data-testid=sidebar]', '[data-testid=sidebar]'],
	['active-on-sidebar', '[data-testid=sidebar-active]', '[data-testid=sidebar]'],
	['label-header', 'h2.text-sm.font-semibold', 'body']
];

const measure = (scheme) =>
	page.evaluate(
		({ pairs, scheme }) => {
			const canvas = document.createElement('canvas');
			canvas.width = 1;
			canvas.height = 1;
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			const rgb = (value) => {
				ctx.clearRect(0, 0, 1, 1);
				// Magenta, not black: a colour the browser rejects leaves this sentinel behind, so an
				// invalid colour is distinguishable from a real one instead of reading as black.
				ctx.fillStyle = '#ff00ff';
				ctx.fillStyle = value;
				ctx.fillRect(0, 0, 1, 1);
				const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
				return { r, g, b, a };
			};
			// Composite a possibly translucent layer over an opaque base, which is what the eye sees.
			const over = (front, back) => {
				const a = front.a / 255;
				return {
					r: front.r * a + back.r * (1 - a),
					g: front.g * a + back.g * (1 - a),
					b: front.b * a + back.b * (1 - a),
					a: 255
				};
			};
			const backdrop = (element) => {
				const layers = [];
				for (let node = element; node; node = node.parentElement) {
					const bg = rgb(getComputedStyle(node).backgroundColor);
					if (bg.a === 0) continue;
					layers.push(bg);
					if (bg.a === 255) break;
				}
				let base = { r: 255, g: 255, b: 255, a: 255 };
				for (const layer of layers.reverse()) base = over(layer, base);
				return base;
			};
			const luminance = ({ r, g, b }) => {
				const channel = (v) => {
					const s = v / 255;
					return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
				};
				return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
			};
			const ratio = (fg, bg) => {
				const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
				return (a + 0.05) / (b + 0.05);
			};
			const text = pairs.map(([name, fgSel, bgSel]) => {
				const fgEl = document.querySelector(fgSel);
				const bgEl = document.querySelector(bgSel);
				if (!fgEl) return { name, found: false };
				const bg = backdrop(bgEl ?? fgEl);
				const fg = over(rgb(getComputedStyle(fgEl).color), bg);
				return {
					name,
					found: true,
					foreground: `rgb(${Math.round(fg.r)}, ${Math.round(fg.g)}, ${Math.round(fg.b)})`,
					background: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
					ratio: Number(ratio(fg, bg).toFixed(2))
				};
			});
			const series = [1, 2, 3, 4, 5].map((n) => {
				const el = document.querySelector(`[data-testid=swatch-chart-${n}]`);
				if (!el) return { n, found: false };
				// Alpha is kept: an invalid oklch(from …) resolves to no colour at all, and dropping
				// alpha would report that as opaque black, which is a different failure.
				const px = rgb(getComputedStyle(el).backgroundColor);
				return {
					n,
					found: true,
					rgba: `rgba(${px.r}, ${px.g}, ${px.b}, ${(px.a / 255).toFixed(3)})`,
					alpha: px.a,
					luminance: px.a === 0 ? null : luminance(px)
				};
			});
			return { text, series, scheme };
		},
		{ pairs: PAIRS, scheme }
	);

const report = { url, consoleErrors, light: { text: [], series: [] }, dark: { text: [], series: [] } };

const focusRing = async (label) => {
	const box = async (id) => {
		const el = page.locator(`[data-testid=${id}]`);
		return el.evaluate((node) => {
			const s = getComputedStyle(node);
			return { boxShadow: s.boxShadow, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}` };
		});
	};
	return { label, primary: await box('focus-primary'), surface: await box('focus-surface') };
};

const schemeProbe = async (scheme) => {
	const state = await measure(scheme);
	report[scheme] = state;

	// Ring at rest, then the ring that actually paints when focused.
	report[scheme].ringRest = await focusRing(`${scheme} rest`);
	await page.locator('[data-testid=focus-surface]').focus();
	await page.waitForTimeout(120);
	report[scheme].ringSurfaceFocused = await focusRing(`${scheme} surface focused`);
	await page.screenshot({ path: join(out, `focus-surface-${scheme}.png`), clip: { x: 240, y: 540, width: 620, height: 160 } });
	await page.locator('[data-testid=focus-primary]').focus();
	await page.waitForTimeout(120);
	report[scheme].ringPrimaryFocused = await focusRing(`${scheme} primary focused`);

	// The dialog only paints once opened, so this is the sole look at a popover surface.
	await page.locator('[data-testid=btn-open-dialog]').click();
	await page.waitForTimeout(300);
	report[scheme].dialog = await page.evaluate(() => {
		const node = document.querySelector('[data-testid=dialog-content]');
		if (!node) return { found: false };
		const s = getComputedStyle(node);
		return {
			found: true,
			background: s.backgroundColor,
			color: s.color,
			borderWidth: s.borderTopWidth,
			borderColor: s.borderTopColor,
			borderRadius: s.borderRadius,
			boxShadow: s.boxShadow
		};
	});
	await page.screenshot({ path: join(out, `dialog-${scheme}.png`) });
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
};

await schemeProbe('light');
await page.evaluate(() => document.documentElement.classList.add('dark'));
await page.waitForTimeout(400);
await schemeProbe('dark');

await browser.close();
report.failures = [...report.light.series, ...report.dark.series]
	.filter((entry) => (entry.found === false) || entry.alpha === 0)
	.map((entry) => `chart series ${entry.n} paints no colour`);
writeFileSync(join(out, 'visual.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.failures.length === 0 ? 0 : 1;
if (report.failures.length > 0) {
	console.log(`\n${report.failures.length} chart finding(s): ${report.failures.join('; ')}`);
}
