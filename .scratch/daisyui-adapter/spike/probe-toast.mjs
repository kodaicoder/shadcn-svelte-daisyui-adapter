// Usage: node probe-toast.mjs http://127.0.0.1:5209/toast <outDir>
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:5209/toast';
const out = process.argv[3] ?? '.';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
const consoleErrors = [];
page.on('console', (m) => {
	if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const read = () =>
	page.evaluate(() => {
		const root = getComputedStyle(document.documentElement);
		const toast = document.querySelector('[data-sonner-toast]');
		return {
			spikeLoaded: root.getPropertyValue('--spike-loaded').trim(),
			colorPopover: root.getPropertyValue('--color-popover').trim(),
			popover: root.getPropertyValue('--popover').trim(),
			probeColorBg: getComputedStyle(document.querySelector('#probe-color')).backgroundColor,
			probePopoverBg: getComputedStyle(document.querySelector('#probe-popover')).backgroundColor,
			toastBg: toast ? getComputedStyle(toast).backgroundColor : null,
			toastNormalBg: toast ? getComputedStyle(toast).getPropertyValue('--normal-bg').trim() : null
		};
	});

await page.goto(url, { waitUntil: 'networkidle' });
const beforeToast = await read();

await page.click('#fire');
await page.waitForSelector('[data-sonner-toast]');
await page.waitForTimeout(700);
const light = await read();
await page.screenshot({ path: join(out, 'toast-light.png') });

await page.evaluate(() =>
	document.documentElement.style.setProperty('--color-popover', 'rgb(255, 0, 0)')
);
await page.waitForTimeout(150);
const overridden = await read();

await page.evaluate(() => {
	document.documentElement.style.removeProperty('--color-popover');
	document.documentElement.classList.add('dark');
});
await page.waitForTimeout(300);
await page.click('#fire');
await page.waitForTimeout(900);
const dark = await page.evaluate(() => {
	const root = getComputedStyle(document.documentElement);
	const toasts = [...document.querySelectorAll('[data-sonner-toast]')];
	const toast = toasts.at(-1);
	return {
		spikeLoaded: root.getPropertyValue('--spike-loaded').trim(),
		colorPopover: root.getPropertyValue('--color-popover').trim(),
		popover: root.getPropertyValue('--popover').trim(),
		probeColorBg: getComputedStyle(document.querySelector('#probe-color')).backgroundColor,
		probePopoverBg: getComputedStyle(document.querySelector('#probe-popover')).backgroundColor,
		toastBg: toast ? getComputedStyle(toast).backgroundColor : null,
		toastCount: toasts.length
	};
});
await page.screenshot({ path: join(out, 'toast-dark.png') });

await browser.close();

const result = { url, consoleErrors, beforeToast, light, overridden, dark };
writeFileSync(join(out, 'toast.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
