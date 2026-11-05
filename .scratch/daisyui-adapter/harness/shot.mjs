import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:5209/';
const out = process.argv[3] ?? './evidence';
const props = (process.argv[4] ?? '').split(',').filter(Boolean);
const selectors = (process.argv[5] ?? '').split(',').filter(Boolean);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
const consoleErrors = [];
page.on('console', (m) => {
	if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

let response = await page.goto(url, { waitUntil: 'networkidle' });
// The dependency optimizer can invalidate the page module graph on the first load after a component
// set changes. That 504 is a dev-server race, not a page error, so reload once before trusting the run.
// Only the optimizer lines are dropped: a real error from the first load has to survive the reload.
if (consoleErrors.some((error) => error.includes('Outdated Optimize Dep'))) {
	for (let i = consoleErrors.length - 1; i >= 0; i -= 1) {
		if (consoleErrors[i].includes('Outdated Optimize Dep')) consoleErrors.splice(i, 1);
	}
	await page.waitForTimeout(1500);
	response = await page.goto(url, { waitUntil: 'networkidle' });
}
await page.screenshot({ path: join(out, 'light.png'), fullPage: true });

const snapshot = () =>
	page.evaluate(
		({ names, selectors }) => {
			const style = getComputedStyle(document.documentElement);
			const readProps = Object.fromEntries(
				names.map((name) => [name, style.getPropertyValue(name).trim()])
			);

			// A 1x1 canvas resolves any CSS colour, color-mix() and var() chains included, to the
			// sRGB bytes the browser would paint, which is the form the checks compare.
			const canvas = document.createElement('canvas');
			canvas.width = 1;
			canvas.height = 1;
			const context = canvas.getContext('2d', { willReadFrequently: true });
			const resolve = (value) => {
				if (!value) return '';
				context.clearRect(0, 0, 1, 1);
				context.fillStyle = '#000000';
				context.fillStyle = value;
				context.fillRect(0, 0, 1, 1);
				const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
				return a === 255
					? `rgb(${r}, ${g}, ${b})`
					: `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
			};

			const readElement = (selector) => {
				const element = document.querySelector(selector);
				if (!element) return { selector, found: false };
				const computed = getComputedStyle(element);
				const shadowColours =
					computed.boxShadow.match(/(?:rgba?|oklch|oklab|color|hsla?)\([^)]*\)|#[0-9a-f]{3,8}/gi) ??
					[];
				return {
					selector,
					found: true,
					background: computed.backgroundColor,
					backgroundRgb: resolve(computed.backgroundColor),
					color: computed.color,
					colorRgb: resolve(computed.color),
					boxShadow: computed.boxShadow,
					boxShadowRgbs: shadowColours.map(resolve),
					// Geometry is a used value, so a radius or border width that comes from a
					// calc() chain or a Tailwind theme key arrives in px, not as a token string.
					borderRadius: computed.borderRadius,
					borderTopLeftRadius: computed.borderTopLeftRadius,
					borderTopColor: computed.borderTopColor,
					borderTopColorRgb: resolve(computed.borderTopColor),
					borderWidth: {
						top: computed.borderTopWidth,
						right: computed.borderRightWidth,
						bottom: computed.borderBottomWidth,
						left: computed.borderLeftWidth
					},
					height: computed.height,
					backgroundImage: computed.backgroundImage
				};
			};

			return {
				background: getComputedStyle(document.body).backgroundColor,
				backgroundRgb: resolve(getComputedStyle(document.body).backgroundColor),
				buttonBg: getComputedStyle(document.querySelector('[data-slot="button"]') ?? document.body)
					.backgroundColor,
				buttonCount: document.querySelectorAll('[data-slot="button"]').length,
				props: readProps,
				propsRgb: Object.fromEntries(names.map((name) => [name, resolve(readProps[name])])),
				elements: selectors.map(readElement)
			};
		},
		{ names: props, selectors }
	);

const light = await snapshot();

await page.evaluate(() => document.documentElement.classList.add('dark'));
await page.waitForTimeout(400);
await page.screenshot({ path: join(out, 'dark.png'), fullPage: true });
const dark = await snapshot();

await browser.close();

const result = { url, status: response?.status() ?? null, consoleErrors, light, dark };
writeFileSync(join(out, 'result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
