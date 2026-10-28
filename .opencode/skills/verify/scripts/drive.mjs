// Drives one feature of the app and keeps the evidence.
//   node scripts/drive.mjs buttons [--headed]
// Requires a running session: node scripts/session.mjs start
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const PORT = 5199;
const BASE = `http://127.0.0.1:${PORT}/`;

const EXPECTED_LABELS = ['Extra Small', 'Small', 'Default', 'Large', 'Destructive'];
const EXPECTED_ICON_COUNT = 4;
const EXPECTED_BUTTON_COUNT = 9;

const journeys = {
	buttons: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const buttons = page.locator('[data-slot="button"]');
		await buttons.first().waitFor({ state: 'visible', timeout: 10_000 });

		const count = await buttons.count();
		record('button count', count === EXPECTED_BUTTON_COUNT, `${count} of ${EXPECTED_BUTTON_COUNT}`);

		for (const label of EXPECTED_LABELS) {
			const visible = await page.getByRole('button', { name: label, exact: true }).isVisible();
			record(`label "${label}"`, visible, visible ? 'visible' : 'missing');
		}

		const icons = page.getByRole('button', { name: 'Submit' });
		const iconCount = await icons.count();
		record(
			'icon buttons (aria-label Submit)',
			iconCount === EXPECTED_ICON_COUNT,
			`${iconCount} of ${EXPECTED_ICON_COUNT}`
		);

		await page.getByRole('button', { name: 'Destructive', exact: true }).click();
		const stillThere = await page
			.getByRole('button', { name: 'Destructive', exact: true })
			.isVisible();
		record(
			'destructive click keeps the button',
			stillThere,
			stillThere ? 'visible after click' : 'vanished'
		);
	}
};

const journey = process.argv[2];
const headed = process.argv.includes('--headed');

if (!journeys[journey]) {
	console.error(`usage: node scripts/drive.mjs <${Object.keys(journeys).join('|')}> [--headed]`);
	process.exit(2);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const evidenceDir = path.join(ROOT, '.verify', 'evidence', `${stamp}-${journey}`);
await mkdir(evidenceDir, { recursive: true });

const checks = [];
const record = (name, ok, detail) => {
	checks.push({ name, ok, detail });
	console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${detail}`);
};

const browser = await chromium.launch({ headless: !headed });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();

const consoleErrors = [];
page.on('console', (message) => {
	if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => consoleErrors.push(String(error)));

let failure = null;

try {
	await journeys[journey](page, record);
} catch (error) {
	failure = error instanceof Error ? error.message : String(error);
	console.log(`FAIL journey threw: ${failure}`);
}

record(
	'no console errors',
	consoleErrors.length === 0,
	consoleErrors.length ? consoleErrors.join(' | ') : 'none'
);

const screenshot = path.join(evidenceDir, 'page.png');
await page.screenshot({ path: screenshot, fullPage: true });

const passed = checks.every((check) => check.ok) && failure === null;

await writeFile(
	path.join(evidenceDir, 'result.json'),
	JSON.stringify(
		{
			journey,
			base: BASE,
			passed,
			failure,
			consoleErrors,
			checks,
			screenshot,
			at: new Date().toISOString()
		},
		null,
		2
	)
);

await browser.close();

console.log(`\nevidence: ${evidenceDir}`);
console.log(passed ? 'PASS' : 'FAIL');

process.exit(passed ? 0 : 1);
