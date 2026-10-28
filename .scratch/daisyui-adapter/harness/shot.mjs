import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:5209/';
const out = process.argv[3] ?? './evidence';
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 640 } });
const consoleErrors = [];
page.on('console', (m) => {
	if (m.type() === 'error') consoleErrors.push(m.text());
});
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const response = await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: join(out, 'light.png'), fullPage: true });

const light = await page.evaluate(() => ({
	background: getComputedStyle(document.body).backgroundColor,
	buttonBg: getComputedStyle(document.querySelector('[data-slot="button"]') ?? document.body)
		.backgroundColor,
	buttonCount: document.querySelectorAll('[data-slot="button"]').length
}));

await page.evaluate(() => document.documentElement.classList.add('dark'));
await page.waitForTimeout(400);
await page.screenshot({ path: join(out, 'dark.png'), fullPage: true });

const dark = await page.evaluate(() => ({
	background: getComputedStyle(document.body).backgroundColor,
	buttonBg: getComputedStyle(document.querySelector('[data-slot="button"]') ?? document.body)
		.backgroundColor
}));

await browser.close();

const result = { url, status: response?.status() ?? null, consoleErrors, light, dark };
writeFileSync(join(out, 'result.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
