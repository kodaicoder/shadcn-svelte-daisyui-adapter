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

const TONES = ['default', 'secondary', 'success', 'warning', 'info', 'destructive', 'blackwhite'];
const OUTLINE_TONES = [
	['outline', 'default'],
	['outline-secondary', 'secondary'],
	['outline-success', 'success'],
	['outline-warning', 'warning'],
	['outline-info', 'info'],
	['outline-destructive', 'destructive'],
	['outline-blackwhite', 'blackwhite']
];

const computed = (locator, property) =>
	locator.evaluate((node, prop) => getComputedStyle(node)[prop], property);

const checkTones = async (record, scope, label) => {
	const rows = await scope.locator('[data-slot][data-tone]').evaluateAll((nodes) =>
		nodes.map((node) => ({
			tone: node.dataset.tone,
			fill: getComputedStyle(node).backgroundColor,
			border: getComputedStyle(node).borderTopColor,
			text: getComputedStyle(node).color
		}))
	);
	const parts = await scope.locator('[data-slot][data-tone]').evaluateAll((nodes) =>
		nodes.map((node) => {
			const part = node.querySelector(
				'[data-slot="switch-thumb"], [data-slot="radio-group-indicator"] > svg'
			);
			return { tone: node.dataset.tone, paint: part ? getComputedStyle(part).backgroundColor : null };
		})
	);
	record(`${label}: seven tones`, rows.length === TONES.length, `${rows.length} of 7`);
	record(
		`${label}: seven distinct fills`,
		new Set(rows.map((row) => row.fill)).size === TONES.length,
		rows.map((row) => `${row.tone}=${row.fill}`).join(', ')
	);

	for (const row of rows) {
		const fill = await computed(scope.locator(`[data-fill-swatch="${row.tone}"]`), 'backgroundColor');
		const border = await computed(
			scope.locator(`[data-border-swatch="${row.tone}"]`),
			'borderTopColor'
		);
		const text = await computed(
			scope.locator(`[data-foreground-swatch="${row.tone}"]`),
			'color'
		);
		record(
			`${label}: ${row.tone} paints the tone pair`,
			row.fill === fill && row.border === border && row.text === text,
			`fill ${row.fill} / border ${row.border} / text ${row.text}`
		);
		const part = parts.find((entry) => entry.tone === row.tone);
		if (part?.paint) {
			record(
				`${label}: ${row.tone} child follows the foreground`,
				part.paint === text,
				`${part.paint} vs ${text}`
			);
		}
	}
};

const checkOutlinePairs = async (record, scope, label) => {
	const pairs = await scope.locator('[data-outline]').evaluateAll((nodes) =>
		nodes.map((node) => ({
			key: node.dataset.outline,
			border: getComputedStyle(node).borderTopColor,
			width: getComputedStyle(node).borderTopWidth
		}))
	);
	record(`${label}: seven outline pairs`, pairs.length === 7, `${pairs.length} of 7`);
	record(
		`${label}: every outline pair carries a border`,
		pairs.every((pair) => pair.width === '1px'),
		pairs.map((pair) => `${pair.key}=${pair.width}`).join(', ')
	);
	record(
		`${label}: seven distinct outline borders`,
		new Set(pairs.map((pair) => pair.border)).size === 7,
		pairs.map((pair) => `${pair.key}=${pair.border}`).join(', ')
	);

	for (const [key, tone] of OUTLINE_TONES) {
		const pressed = await computed(
			scope.locator(`[data-outline-pressed="${key}"]`),
			'backgroundColor'
		);
		const fill = await computed(scope.locator(`[data-tone="${tone}"]`), 'backgroundColor');
		record(`${label}: ${key} fills with ${tone}`, pressed === fill, `${pressed} vs ${fill}`);
	}
};

const checkStates = async (page, record, scope, label, invalidKind) => {
	await page.keyboard.press('Tab');
	const focus = scope.locator('[data-case="focus"]');
	await focus.focus();
	await page.waitForTimeout(300);
	const focusState = await focus.evaluate((node) => ({
		focusVisible: node.matches(':focus-visible'),
		shadow: getComputedStyle(node).boxShadow
	}));
	const ring = focusState.shadow
		.split(/,(?![^(]*\))/)
		.map((layer) => layer.trim())
		.find((layer) => /\s[1-9][\d.]*px$/.test(layer));
	record(
		`${label}: focus shows a ring`,
		focusState.focusVisible && Boolean(ring),
		`${focusState.focusVisible} ${ring ?? focusState.shadow}`
	);

	const toneRings = [];
	const borderMismatch = [];
	for (const tone of TONES) {
		const control = scope.locator(`[data-tone="${tone}"]`).first();
		await control.focus();
		await page.waitForTimeout(120);
		const state = await control.evaluate((node) => {
			const layers = getComputedStyle(node).boxShadow.split(/,(?![^(]*\))/);
			const layer =
				layers.map((value) => value.trim()).find((value) => /\s[1-9][\d.]*px$/.test(value)) ?? '';
			return { border: getComputedStyle(node).borderTopColor, ring: layer };
		});
		toneRings.push(state.ring);
		const expected = await computed(
			scope.locator(`[data-border-swatch="${tone}"]`),
			'borderTopColor'
		);
		if (state.border !== expected) borderMismatch.push(`${tone}:${state.border} vs ${expected}`);
	}
	record(
		`${label}: seven distinct focus rings`,
		new Set(toneRings).size === TONES.length && toneRings.every(Boolean),
		toneRings.map((value, index) => `${TONES[index]}=${value}`).join(', ')
	);
	record(`${label}: focus keeps the tone border`, borderMismatch.length === 0, borderMismatch.join(', '));

	const invalid = scope.locator('[data-case="invalid"]');
	if (invalidKind === 'ring') {
		const shadow = await computed(invalid, 'boxShadow');
		record(`${label}: invalid paints a ring`, shadow !== 'none', shadow);
	} else {
		const invalidBorder = await computed(invalid, 'borderTopColor');
		const idleBorder = await computed(scope.locator('[data-case="disabled"]'), 'borderTopColor');
		record(
			`${label}: invalid paints a destructive border`,
			invalidBorder !== idleBorder,
			`${invalidBorder} vs ${idleBorder}`
		);
	}

	await invalid.focus();
	await page.waitForTimeout(120);
	const invalidRing = await invalid.evaluate((node) => {
		const layers = getComputedStyle(node).boxShadow.split(/,(?![^(]*\))/);
		return (
			layers.map((value) => value.trim()).find((value) => /\s[1-9][\d.]*px$/.test(value)) ?? ''
		);
	});
	record(
		`${label}: focused invalid keeps the destructive ring`,
		invalidRing !== '' && invalidRing !== toneRings[0],
		`${invalidRing} vs default ${toneRings[0]}`
	);

	const disabled = scope.locator('[data-case="disabled"]');
	record(`${label}: disabled stays disabled`, await disabled.isDisabled(), 'disabled');
};


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
	checkbox: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const section = page.locator('#checkbox');
		await section.locator('[data-slot="checkbox"]').first().waitFor({ state: 'visible', timeout: 10_000 });
		record('checkbox section', (await section.count()) === 1, 'one section');

		for (const scheme of ['light', 'dark']) {
			const scope = section.locator(`[data-scheme="${scheme}"]`);
			await checkTones(record, scope, `checkbox ${scheme}`);
			await checkStates(page, record, scope, `checkbox ${scheme}`, 'border');
		}
	},
	switch: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const section = page.locator('#switch');
		await section.locator('[data-slot="switch"]').first().waitFor({ state: 'visible', timeout: 10_000 });
		record('switch section', (await section.count()) === 1, 'one section');

		for (const scheme of ['light', 'dark']) {
			const scope = section.locator(`[data-scheme="${scheme}"]`);
			await checkTones(record, scope, `switch ${scheme}`);
			await checkStates(page, record, scope, `switch ${scheme}`, 'border');
		}
	},
	'radio-group': async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const section = page.locator('#radio-group');
		await section
			.locator('[data-slot="radio-group-item"]')
			.first()
			.waitFor({ state: 'visible', timeout: 10_000 });
		record('radio-group section', (await section.count()) === 1, 'one section');

		for (const scheme of ['light', 'dark']) {
			const scope = section.locator(`[data-scheme="${scheme}"]`);
			await checkTones(record, scope, `radio-group ${scheme}`);
			await checkStates(page, record, scope, `radio-group ${scheme}`, 'border');
		}
	},
	toggle: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const section = page.locator('#toggle');
		await section.locator('[data-slot="toggle"]').first().waitFor({ state: 'visible', timeout: 10_000 });
		record('toggle section', (await section.count()) === 1, 'one section');

		for (const scheme of ['light', 'dark']) {
			const scope = section.locator(`[data-scheme="${scheme}"]`);
			await checkTones(record, scope, `toggle ${scheme}`);
			await checkOutlinePairs(record, scope, `toggle ${scheme}`);
			await checkStates(page, record, scope, `toggle ${scheme}`, 'ring');
		}
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

// A worktree whose node_modules is a junction serves the font through /@fs and the dev server
// answers 404 for the real path. The generic 404 console message has no URL, so it is ignored only
// when every failed request is a font file that lives outside the dev root.
const failedRequests = [];
page.on('response', (response) => {
	if (response.status() >= 400) failedRequests.push(response.url());
});

let failure = null;

try {
	await journeys[journey](page, record);
} catch (error) {
	failure = error instanceof Error ? error.message : String(error);
	console.log(`FAIL journey threw: ${failure}`);
}

const fontOnly =
	failedRequests.length > 0 && failedRequests.every((url) => /\/@fs\/.*\.woff2$/.test(url));
const appErrors = fontOnly
	? consoleErrors.filter((text) => !text.includes('404'))
	: consoleErrors;

record(
	'no console errors',
	appErrors.length === 0,
	appErrors.length ? appErrors.join(' | ') : 'none'
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
			consoleErrors: appErrors,
			failedRequests,
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
