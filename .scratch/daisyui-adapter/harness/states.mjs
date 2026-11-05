// Ticket 41 evidence: the painted resting state plus hover, focus-visible and disabled on the same
// page the operator reads. Chromium's focus({ focusVisible: true }) is what forces :focus-visible
// without a keyboard.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { chromium } from 'playwright';

const [
	URL = 'http://127.0.0.1:5210/',
	OUT = '.scratch/daisyui-adapter/evidence/38-outline-surface'
] = process.argv.slice(2);

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const report = { url: URL, shots: [] };

const shoot = async (page, locator, name) => {
	const path = join(OUT, `states-${name}.png`);
	await locator.screenshot({ path });
	report.shots.push(name);
};

for (const scheme of ['light', 'dark']) {
	const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
	await page.goto(URL, { waitUntil: 'networkidle' });
	if (scheme === 'dark') {
		await page.evaluate(() => document.documentElement.classList.add('dark'));
		await page.waitForTimeout(400);
	}

	const states = page.locator('section').filter({ hasText: 'Interactive states' });
	const buttons = page.locator('section').filter({ hasText: 'Button' }).first();
	const badges = page.locator('section').filter({ hasText: 'Badge' }).first();

	await shoot(page, states, `${scheme}-resting`);

	await page.getByRole('button', { name: 'hover filled' }).hover();
	await page.waitForTimeout(250);
	await shoot(page, states, `${scheme}-hover-filled`);

	await page.getByRole('button', { name: 'hover outline' }).hover();
	await page.waitForTimeout(250);
	await shoot(page, states, `${scheme}-hover-outline`);

	await page.getByRole('button', { name: 'hover ghost' }).hover();
	await page.waitForTimeout(250);
	await shoot(page, states, `${scheme}-hover-ghost`);

	await page
		.getByRole('button', { name: 'hover filled' })
		.evaluate((el) => el.focus({ focusVisible: true }));
	await shoot(page, states, `${scheme}-focus-filled`);

	await page
		.getByRole('button', { name: 'hover outline' })
		.evaluate((el) => el.focus({ focusVisible: true }));
	await shoot(page, states, `${scheme}-focus-outline`);

	await page.locator('body').click({ position: { x: 5, y: 5 } });
	await page.locator('a[data-slot="badge"]').first().hover();
	await page.waitForTimeout(250);
	await shoot(page, badges, `${scheme}-badge-hover`);

	await shoot(page, buttons, `${scheme}-buttons`);

	const controls = page
		.locator('section')
		.filter({ has: page.getByRole('heading', { name: 'Controls', exact: true }) })
		.first();
	await shoot(page, controls, `${scheme}-controls`);
	await page.getByRole('button', { name: 'Hover or focus me' }).hover();
	await page.waitForTimeout(700);
	await page.screenshot({ path: join(OUT, `states-${scheme}-tooltip.png`), fullPage: true });
	await page.getByRole('button', { name: 'Open dialog' }).click();
	await page.waitForTimeout(400);
	await page.screenshot({ path: join(OUT, `states-${scheme}-dialog.png`), fullPage: true });
	await page.keyboard.press('Escape');
	await page.waitForTimeout(300);

	const toggle = page.getByRole('button', { name: 'Toggle light / dark' });
	await toggle.click();
	await page.waitForTimeout(250);
	const afterFirst = await page.evaluate(() => document.documentElement.classList.contains('dark'));
	await toggle.click();
	await page.waitForTimeout(250);
	const afterSecond = await page.evaluate(() =>
		document.documentElement.classList.contains('dark')
	);
	report.toggle = { ...(report.toggle ?? {}), [scheme]: { afterFirst, afterSecond } };
	await page.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
