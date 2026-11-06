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
	},
	'aspect-ratio': async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const expected = [
			{ label: '1:1', ratio: 1 },
			{ label: '4:3', ratio: 4 / 3 },
			{ label: '16:9', ratio: 16 / 9 },
			{ label: '21:9', ratio: 21 / 9 }
		];

		const frames = page.locator('[data-slot="aspect-ratio"]');
		await frames.first().waitFor({ state: 'visible', timeout: 10_000 });
		const count = await frames.count();
		record('four aspect-ratios', count === expected.length, `${count} of ${expected.length}`);

		const widths = [];
		for (const [index, item] of expected.entries()) {
			const frame = frames.nth(index);
			const box = await frame.boundingBox();
			const ratio = box ? box.width / box.height : 0;
			widths.push(Math.round(box?.width ?? 0));
			record(
				`${item.label} box`,
				Math.abs(ratio - item.ratio) < 0.05,
				ratio ? ratio.toFixed(3) : 'no box'
			);

			const image = frame.locator('img');
			const src = await image.getAttribute('src');
			record(
				`${item.label} image source`,
				Boolean(src?.startsWith('https://placehold.co/')),
				src ?? 'missing'
			);

			const decoded = await image.evaluate((el) => el.complete && el.naturalWidth > 0);
			record(`${item.label} image decoded`, decoded, decoded ? 'naturalWidth > 0' : 'not loaded');
		}

		record('distinct widths', new Set(widths).size === expected.length, widths.join(', '));
	},
	avatar: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const avatars = page.locator('[data-slot="avatar"]');
		await avatars.first().waitFor({ state: 'visible', timeout: 10_000 });
		const count = await avatars.count();
		record('twenty-four avatars', count === 24, `${count} of 24`);

		const sizes = await avatars.evaluateAll((nodes) => [
			...new Set(nodes.map((node) => node.getAttribute('data-size')))
		]);
		record(
			'sm, default and lg present',
			['sm', 'default', 'lg'].every((size) => sizes.includes(size)),
			sizes.join(', ')
		);

		const widths = await avatars.evaluateAll((nodes) =>
			[...new Set(nodes.map((node) => Math.round(node.getBoundingClientRect().width)))].sort(
				(a, b) => a - b
			)
		);
		record(
			'three painted sizes',
			widths.length === 3 && widths[0] === 24 && widths[1] === 32 && widths[2] === 40,
			widths.join(', ')
		);

		const images = page.locator('[data-slot="avatar-image"]');
		const imageCount = await images.count();
		record('fifteen images', imageCount === 15, `${imageCount}`);

		const decoded = await images.evaluateAll(
			(nodes) => nodes.filter((node) => node.complete && node.naturalWidth > 0).length
		);
		record('every image decoded', decoded === imageCount, `${decoded} of ${imageCount}`);

		record('fallback text', await page.getByText('CN', { exact: true }).isVisible(), 'CN');

		const groupCounts = page.locator('[data-slot="avatar-group-count"]');
		const groupCountValue = await groupCounts.count();
		record('three group counts', groupCountValue === 3, `${groupCountValue}`);
		record('group count text', await page.getByText('+3', { exact: true }).isVisible(), '+3');

		const badges = page.locator('[data-slot="avatar-badge"]');
		const badgeCount = await badges.count();
		record('eight badges', badgeCount === 8, `${badgeCount}`);

		const badgeColours = await badges.evaluateAll((nodes) => [
			...new Set(nodes.map((node) => getComputedStyle(node).backgroundColor))
		]);
		record(
			'exactly four badge tones',
			badgeColours.length === 4,
			badgeColours.join(' | ')
		);

		const groupBadges = page.locator(
			'[data-slot="avatar-group"] [data-slot="avatar-badge"]'
		);
		const groupBadgeCount = await groupBadges.count();
		record('three badges inside groups', groupBadgeCount === 3, `${groupBadgeCount}`);

		const square = avatars.nth(7);
		const squareRadius = await square.evaluate((node) =>
			parseFloat(getComputedStyle(node).borderRadius)
		);
		record('square uses the 8px radius', squareRadius === 8, `${squareRadius}`);

		const circle = avatars.nth(6);
		const circleClass = (await circle.getAttribute('class')) ?? '';
		record('circle stays rounded-full', circleClass.includes('rounded-full'), circleClass);
	},
	badge: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const badges = page.locator('[data-slot="badge"]');
		await badges.first().waitFor({ state: 'visible', timeout: 10_000 });
		const count = await badges.count();
		record('twenty-nine badges', count === 29, `${count} of 29`);

		const anchors = page.locator('a[data-slot="badge"]');
		const anchorCount = await anchors.count();
		record('seven anchors', anchorCount === 7, `${anchorCount}`);
		record('twenty-two spans', count - anchorCount === 22, `${count - anchorCount}`);

		const classes = await badges.evaluateAll((nodes) => nodes.map((node) => node.className));
		const tokens = [
			'bg-primary',
			'bg-secondary',
			'bg-destructive/10',
			'bg-success',
			'bg-warning',
			'bg-info',
			'bg-blackwhite',
			'border-primary',
			'border-destructive-text',
			'border-success-text',
			'border-warning-text',
			'border-info-text',
			'border-blackwhite',
			'text-destructive-text',
			'text-success-text',
			'text-warning-text',
			'text-info-text',
			'text-blackwhite',
			'underline-offset-4'
		];
		const missing = tokens.filter(
			(token) => !classes.some((value) => value.includes(token))
		);
		record('every variant family rendered', missing.length === 0, missing.join(', ') || 'all present');

		const icons = page.locator('[data-slot="badge"] svg');
		const iconCount = await icons.count();
		record('icon badge', iconCount >= 1, `${iconCount}`);

		const invalid = page.locator('[data-slot="badge"][aria-invalid="true"]');
		record('invalid badge', (await invalid.count()) === 1, 'aria-invalid');

		const backgrounds = await badges.evaluateAll((nodes) => [
			...new Set(nodes.map((node) => getComputedStyle(node).backgroundColor))
		]);
		record('at least six backgrounds', backgrounds.length >= 6, `${backgrounds.length}`);

		const spanBadge = badges.first();
		const beforeHover = await spanBadge.evaluate(
			(node) => getComputedStyle(node).backgroundColor
		);
		await spanBadge.hover();
		await page.waitForTimeout(250);
		const afterHover = await spanBadge.evaluate((node) => getComputedStyle(node).backgroundColor);
		record('span hover changes', beforeHover !== afterHover, `${beforeHover} -> ${afterHover}`);

		const ghost = page.locator('[data-part="ghost"] [data-slot="badge"]').first();
		const ghostBefore = await ghost.evaluate((node) => getComputedStyle(node).backgroundColor);
		await ghost.hover();
		await page.waitForTimeout(250);
		const ghostAfter = await ghost.evaluate((node) => getComputedStyle(node).backgroundColor);
		record('ghost hover paints a surface', ghostBefore !== ghostAfter, `${ghostBefore} -> ${ghostAfter}`);
		const ghostBorder = await ghost.evaluate((node) => getComputedStyle(node).borderTopColor);
		record('ghost has no border', ghostBorder === 'rgba(0, 0, 0, 0)', ghostBorder);
	},
	button: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const buttons = page.locator('[data-slot="button"]');
		await buttons.first().waitFor({ state: 'visible', timeout: 10_000 });
		const count = await buttons.count();
		record('fifteen buttons', count === 15, `${count} of 15`);

		const activeText = () =>
			page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
		const ringOf = () =>
			page.evaluate(() => {
				const el = document.activeElement;
				const layers = getComputedStyle(el).boxShadow.split(/,(?![^(]*\))/);
				const ring =
					layers.find(
						(layer) =>
							layer.trim() !== 'none' &&
							!/rgba\(0, 0, 0, 0\)|oklab\(0 0 0 \/ 0\)/.test(layer)
					) ?? '';
				const spread = Number(/\s([\d.]+)px$/.exec(ring.trim())?.[1] ?? 0);
				return { focusVisible: el.matches(':focus-visible'), ring: ring.trim(), spread };
			});

		const focusLabels = [
			'Focus default',
			'Focus outline',
			'Focus secondary',
			'Focus ghost',
			'Focus link',
			'Focus destructive'
		];
		const rings = [];
		for (const label of focusLabels) {
			await page.keyboard.press('Tab');
			await page.waitForTimeout(250);
			const text = await activeText();
			const ring = await ringOf();
			rings.push(ring.ring);
			record(`tab reaches ${label}`, text === label, text || 'nothing');
			record(
				`${label} shows a ring`,
				ring.focusVisible && ring.spread >= 1.5,
				`${ring.focusVisible} spread ${ring.spread} ${ring.ring}`
			);
		}
		record(
			'destructive overrides the ring colour',
			rings[5] !== rings[0],
			`${rings[5]} vs ${rings[0]}`
		);

		const press = page.getByRole('button', { name: 'Press default', exact: true });
		const idleBox = await press.boundingBox();
		const idlePaint = await press.evaluate((node) => getComputedStyle(node).backgroundColor);
		await press.hover();
		await page.waitForTimeout(200);
		const hoverPaint = await press.evaluate((node) => getComputedStyle(node).backgroundColor);
		await page.mouse.down();
		await page.waitForTimeout(120);
		const pressedBox = await press.boundingBox();
		const pressedPaint = await press.evaluate((node) => getComputedStyle(node).backgroundColor);
		const pressedRing = await ringOf();
		await page.mouse.up();
		await page.waitForTimeout(200);
		const releasedBox = await press.boundingBox();

		record(
			'press moves the button down one pixel',
			Math.round(pressedBox.y - idleBox.y) === 1,
			`${idleBox.y} -> ${pressedBox.y}`
		);
		record('release returns it', releasedBox.y === idleBox.y, `${releasedBox.y} vs ${idleBox.y}`);
		record('hover changes the paint', hoverPaint !== idlePaint, `${idlePaint} -> ${hoverPaint}`);
		record(
			'press adds no paint of its own',
			pressedPaint === hoverPaint,
			`${hoverPaint} -> ${pressedPaint}`
		);
		record(
			'mouse press leaves no ring',
			pressedRing.focusVisible === false && pressedRing.ring === '',
			`${pressedRing.focusVisible} ${pressedRing.ring}`
		);

		const menu = page.getByRole('button', { name: 'Press menu', exact: true });
		const menuBox = await menu.boundingBox();
		await menu.hover();
		await page.mouse.down();
		await page.waitForTimeout(120);
		const menuPressed = await menu.boundingBox();
		await page.mouse.up();
		record(
			'haspopup does not translate',
			Math.round(menuPressed.y - menuBox.y) === 0,
			`${menuBox.y} -> ${menuPressed.y}`
		);

		const disabled = page.getByRole('button', { name: 'Disabled', exact: true });
		record('disabled is not enabled', await disabled.isDisabled(), 'disabled');
		const disabledLink = page.getByRole('link', { name: 'Disabled link', exact: true });
		const disabledHref = await disabledLink.getAttribute('href');
		record('disabled link has no href', disabledHref === null, `${disabledHref}`);

		const iconOnly = page.getByRole('button', { name: 'Add', exact: true });
		record('icon-only button has a name', await iconOnly.isVisible(), 'Add');
	},
	'radio-group': async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const groups = page.locator('[data-slot="radio-group"]');
		await groups.first().waitFor({ state: 'visible', timeout: 10_000 });
		record('seven groups', (await groups.count()) === 7, `${await groups.count()} of 7`);

		const items = page.locator('[data-slot="radio-group-item"]');
		record('seventeen items', (await items.count()) === 17, `${await items.count()} of 17`);

		const checked = page.locator('[data-slot="radio-group-item"][aria-checked="true"]');
		record('six checked', (await checked.count()) === 6, `${await checked.count()}`);

		const state = (id) => page.locator(`#${id}`).getAttribute('aria-checked');

		await page.keyboard.press('Tab');
		await page.waitForTimeout(250);
		const focused = await page.evaluate(() => document.activeElement?.id ?? '');
		record('tab lands on the checked item', focused === 'density-comfortable', focused);

		const ring = await page.evaluate(() => {
			const layers = getComputedStyle(document.activeElement).boxShadow.split(/,(?![^(]*\))/);
			const layer =
				layers.find(
					(value) => value.trim() !== 'none' && !/rgba\(0, 0, 0, 0\)|oklab\(0 0 0 \/ 0\)/.test(value)
				) ?? '';
			return layer.trim();
		});
		record('focused item shows a 3px ring', /\s3px$/.test(ring), ring);

		await page.keyboard.press('ArrowDown');
		await page.waitForTimeout(150);
		record('arrow selects the next item', (await state('density-spacious')) === 'true', 'spacious');
		record(
			'arrow clears the previous item',
			(await state('density-comfortable')) === 'false',
			'comfortable'
		);

		await page.locator('#density-compact').click();
		record('click selects', (await state('density-compact')) === 'true', 'compact');
		record('click clears the other', (await state('density-spacious')) === 'false', 'spacious');

		const invalidBorder = await page
			.locator('#invalid-two')
			.evaluate((node) => getComputedStyle(node).borderTopColor);
		const validBorder = await page
			.locator('#density-comfortable')
			.evaluate((node) => getComputedStyle(node).borderTopColor);
		record(
			'invalid paints a destructive border',
			invalidBorder !== validBorder,
			`${invalidBorder} vs ${validBorder}`
		);

		record('disabled item carries disabled', await page.locator('#item-b').isDisabled(), 'item-b');
		await page.locator('#group-y').click({ force: true });
		record(
			'disabled group does not select',
			(await state('group-y')) === 'false',
			'group-y'
		);

		await page.locator('#live-two').click();
		record('controlled shows the value', await page.getByText('value: two').isVisible(), 'two');
	},
	checkbox: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const boxes = page.locator('[data-slot="checkbox"]');
		await boxes.first().waitFor({ state: 'visible', timeout: 10_000 });
		const count = await boxes.count();
		record('thirteen checkboxes', count === 13, `${count} of 13`);

		const checked = page.locator('[data-slot="checkbox"][aria-checked="true"]');
		record('six checked', (await checked.count()) === 6, `${await checked.count()}`);

		const mixed = page.locator('[data-slot="checkbox"][aria-checked="mixed"]');
		record('two indeterminate', (await mixed.count()) === 2, `${await mixed.count()}`);

		const disabled = page.locator('[data-slot="checkbox"][disabled]');
		record('three disabled', (await disabled.count()) === 3, `${await disabled.count()}`);

		const invalid = page.locator('[data-slot="checkbox"][aria-invalid="true"]');
		record('two invalid', (await invalid.count()) === 2, `${await invalid.count()}`);

		const widths = await boxes.evaluateAll((nodes) => [
			...new Set(nodes.map((node) => Math.round(node.getBoundingClientRect().width)))
		]);
		record('three sizes', widths.length === 3, widths.join(', '));

		const live = page.locator('#live');
		record('controlled starts unchecked', (await live.getAttribute('aria-checked')) === 'false', 'false');
		await live.click();
		record('controlled flips on click', (await live.getAttribute('aria-checked')) === 'true', 'true');
		record('label follows the state', await page.getByText('checked', { exact: true }).isVisible(), 'checked');
	},
	switch: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const switches = page.locator('[data-slot="switch"]');
		await switches.first().waitFor({ state: 'visible', timeout: 10_000 });
		const count = await switches.count();
		record('eleven switches', count === 11, `${count} of 11`);

		const checked = page.locator('[data-slot="switch"][aria-checked="true"]');
		record('six checked', (await checked.count()) === 6, `${await checked.count()}`);

		const disabled = page.locator('[data-slot="switch"][disabled]');
		record('two disabled', (await disabled.count()) === 2, `${await disabled.count()}`);

		const invalid = page.locator('[data-slot="switch"][aria-invalid="true"]');
		record('two invalid', (await invalid.count()) === 2, `${await invalid.count()}`);

		const sizes = await switches.evaluateAll((nodes) => [
			...new Set(nodes.map((node) => node.getAttribute('data-size')))
		]);
		record('both sizes present', sizes.includes('sm') && sizes.includes('default'), sizes.join(', '));

		const off = switches.nth(0);
		const on = switches.nth(1);
		const trackOff = await off.evaluate((node) => getComputedStyle(node).backgroundColor);
		const trackOn = await on.evaluate((node) => getComputedStyle(node).backgroundColor);
		record('checked paints another track', trackOff !== trackOn, `${trackOff} -> ${trackOn}`);

		const thumbOff = await off.locator('[data-slot="switch-thumb"]').boundingBox();
		const thumbOn = await on.locator('[data-slot="switch-thumb"]').boundingBox();
		record(
			'thumb travels when checked',
			Boolean(thumbOff && thumbOn) && thumbOn.x > thumbOff.x,
			`${Math.round(thumbOff?.x ?? 0)} -> ${Math.round(thumbOn?.x ?? 0)}`
		);

		const offWidth = await off.evaluate((node) => Math.round(node.getBoundingClientRect().width));
		const smallWidth = await switches
			.nth(2)
			.evaluate((node) => Math.round(node.getBoundingClientRect().width));
		record('small is narrower', smallWidth < offWidth, `${smallWidth} vs ${offWidth}`);

		const live = page.locator('#live');
		record(
			'controlled starts off',
			(await live.getAttribute('aria-checked')) === 'false',
			'false'
		);
		await live.click();
		record('controlled flips on click', (await live.getAttribute('aria-checked')) === 'true', 'true');
		record('label follows the state', await page.getByText('on', { exact: true }).isVisible(), 'on');
	},
	toggle: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const toggles = page.locator('[data-slot="toggle"]');
		await toggles.first().waitFor({ state: 'visible', timeout: 10_000 });
		const count = await toggles.count();
		record('nineteen toggles', count === 19, `${count} of 19`);

		const pressed = page.locator('[data-slot="toggle"][aria-pressed="true"]');
		record('eleven pressed', (await pressed.count()) === 11, `${await pressed.count()}`);

		const disabled = page.locator('[data-slot="toggle"][disabled]');
		record('three disabled', (await disabled.count()) === 3, `${await disabled.count()}`);

		const invalid = page.locator('[data-slot="toggle"][aria-invalid="true"]');
		record('two invalid', (await invalid.count()) === 2, `${await invalid.count()}`);

		const off = toggles.nth(0);
		const on = toggles.nth(1);
		const background = (locator) =>
			locator.evaluate((node) => getComputedStyle(node).backgroundColor);
		const colour = (locator) => locator.evaluate((node) => getComputedStyle(node).color);

		const offIdle = await background(off);
		const offColour = await colour(off);
		await off.hover();
		await page.waitForTimeout(250);
		const offHover = await background(off);
		record('unpressed gives hover feedback', offIdle !== offHover, `${offIdle} -> ${offHover}`);

		await page.mouse.move(900, 700);
		await page.waitForTimeout(250);
		const onIdle = await background(on);
		const onColour = await colour(on);
		await on.hover();
		await page.waitForTimeout(250);
		const onHover = await background(on);
		record('pressed gives hover feedback', onIdle !== onHover, `${onIdle} -> ${onHover}`);
		record('pressed is not the hover surface', onIdle !== offHover, `${onIdle} vs ${offHover}`);
		record(
			'pressed text flips to the foreground pair',
			onColour !== offColour,
			`${offColour} -> ${onColour}`
		);

		await page.mouse.move(900, 700);
		await page.waitForTimeout(200);
		const invalidRing = await toggles
			.nth(13)
			.evaluate((node) => getComputedStyle(node).boxShadow);
		record('invalid paints on the plain variant', invalidRing !== 'none', invalidRing);

		const pressedBorder = await toggles
			.nth(3)
			.evaluate((node) => getComputedStyle(node).borderTopColor);
		record(
			'pressed outline border follows the fill',
			pressedBorder !== 'oklch(0.86725 0.0135 260.992)',
			pressedBorder
		);

		const plainWidth = await off.evaluate((node) => getComputedStyle(node).borderTopWidth);
		const outlineWidth = await toggles
			.nth(2)
			.evaluate((node) => getComputedStyle(node).borderTopWidth);
		record(
			'outline carries a border, plain does not',
			plainWidth === '0px' && outlineWidth === '1px',
			`${plainWidth} / ${outlineWidth}`
		);

		const heights = await toggles.evaluateAll((nodes) =>
			[4, 5, 6].map((index) => Math.round(nodes[index].getBoundingClientRect().height))
		);
		record(
			'three heights',
			heights.join(',') === '24,28,32',
			heights.join(', ')
		);

		const radii = await toggles.evaluateAll((nodes) =>
			[4, 5, 6].map((index) =>
				Number(parseFloat(getComputedStyle(nodes[index]).borderRadius).toFixed(1))
			)
		);
		record(
			'radii follow the size steps',
			radii.join(',') === '4.8,6.4,8',
			radii.join(', ')
		);

		const live = page.locator('#live');
		record(
			'controlled starts off',
			(await live.getAttribute('aria-pressed')) === 'false',
			'false'
		);
		await live.click();
		record('controlled flips on click', (await live.getAttribute('aria-pressed')) === 'true', 'true');
		record('label follows the state', await page.getByText('on', { exact: true }).isVisible(), 'on');
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
