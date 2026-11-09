// Drives one feature of the app and keeps the evidence.
//   node scripts/drive.mjs checkbox [--headed]
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

const checkTones = async (record, scope, label, kind = 'filled') => {
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
			return {
				tone: node.dataset.tone,
				paint: part ? getComputedStyle(part).backgroundColor : null
			};
		})
	);
	record(`${label}: seven tones`, rows.length === TONES.length, `${rows.length} of 7`);
	record(
		`${label}: seven distinct fills`,
		new Set(rows.map((row) => row.fill)).size === TONES.length,
		rows.map((row) => `${row.tone}=${row.fill}`).join(', ')
	);

	for (const row of rows) {
		const fill = await computed(
			scope.locator(`[data-fill-swatch="${row.tone}"]`),
			'backgroundColor'
		);
		const border = await computed(
			scope.locator(`[data-border-swatch="${row.tone}"]`),
			'borderTopColor'
		);
		if (kind === 'wash') {
			const soft = await computed(
				scope.locator(`[data-soft-swatch="${row.tone}"]`),
				'backgroundColor'
			);
			record(
				`${label}: ${row.tone} track is a 10 percent wash`,
				row.fill === soft,
				`${row.fill} vs ${soft}`
			);
			record(
				`${label}: ${row.tone} border is the tone border`,
				row.border === border,
				`${row.border} vs ${border}`
			);
			const part = parts.find((entry) => entry.tone === row.tone);
			record(
				`${label}: ${row.tone} thumb takes the tone`,
				part?.paint === fill,
				`${part?.paint} vs ${fill}`
			);
			continue;
		}
		if (kind === 'pressed') {
			const text = await computed(scope.locator(`[data-foreground-swatch="${row.tone}"]`), 'color');
			record(
				`${label}: ${row.tone} paints the tone and its foreground`,
				row.fill === fill && row.text === text,
				`fill ${row.fill} / text ${row.text}`
			);
			continue;
		}
		const text = await computed(scope.locator(`[data-foreground-swatch="${row.tone}"]`), 'color');
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

	const secondaryPressed = scope.locator('[data-outline-pressed="outline-secondary"]');
	const secondaryText = await computed(secondaryPressed, 'color');
	const secondaryFill = await computed(secondaryPressed, 'backgroundColor');
	const secondaryExpected = await computed(
		scope.locator('[data-foreground-swatch="secondary"]'),
		'color'
	);
	record(
		`${label}: outline-secondary keeps its label on press`,
		secondaryText !== secondaryFill && secondaryText === secondaryExpected,
		`text ${secondaryText} / fill ${secondaryFill} / expected ${secondaryExpected}`
	);
};

const checkStates = async (page, record, scope, component, scheme, label, invalidKind) => {
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
		const state = await control.evaluate((node) => ({
			border: getComputedStyle(node).borderTopColor,
			borderWidth: getComputedStyle(node).borderTopWidth,
			ring:
				getComputedStyle(node)
					.boxShadow.split(/,(?![^(]*\))/)
					.map((value) => value.trim())
					.find((value) => /\s[1-9][\d.]*px$/.test(value)) ?? ''
		}));
		toneRings.push(state.ring);
		if (state.borderWidth !== '0px') {
			const expected = await computed(
				scope.locator(`[data-border-swatch="${tone}"]`),
				'borderTopColor'
			);
			if (state.border !== expected) borderMismatch.push(`${tone}:${state.border} vs ${expected}`);
		}
	}
	record(
		`${label}: seven distinct focus rings`,
		new Set(toneRings).size === TONES.length && toneRings.every(Boolean),
		toneRings.map((value, index) => `${TONES[index]}=${value}`).join(', ')
	);
	record(
		`${label}: focus keeps the tone border`,
		borderMismatch.length === 0,
		borderMismatch.join(', ')
	);

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
	const pointer = await focus.evaluate((node) => getComputedStyle(node).cursor);
	record(`${label}: pointer cursor on hover`, pointer === 'pointer', pointer);
	const disabledCursor = await disabled.evaluate((node) => ({
		cursor: getComputedStyle(node).cursor,
		events: getComputedStyle(node).pointerEvents
	}));
	record(
		`${label}: disabled does not invite a click`,
		disabledCursor.cursor === 'not-allowed',
		`${disabledCursor.cursor} / ${disabledCursor.events}`
	);

	const fieldRows = page.locator(
		`#field-label [data-scheme="${scheme}"] [data-field-control="${component}"]`
	);
	if ((await fieldRows.count()) > 0) {
		const fieldRings = [];
		const fieldBorderMismatch = [];
		for (const tone of TONES) {
			const control = page.locator(
				`#field-label [data-scheme="${scheme}"] [data-field-control="${component}"][data-field-tone="${tone}"]`
			);
			await control.focus();
			await page.waitForTimeout(120);
			const state = await control.evaluate((node) => ({
				border: getComputedStyle(node).borderTopColor,
				ring:
					getComputedStyle(node)
						.boxShadow.split(/,(?![^(]*\))/)
						.map((value) => value.trim())
						.find((value) => /\s[1-9][\d.]*px$/.test(value)) ?? ''
			}));
			fieldRings.push(state.ring);
			const expected = await computed(
				scope.locator(`[data-border-swatch="${tone}"]`),
				'borderTopColor'
			);
			if (state.border !== expected)
				fieldBorderMismatch.push(`${tone}:${state.border} vs ${expected}`);
		}
		record(
			`${label}: Field.Label keeps the tone border`,
			fieldBorderMismatch.length === 0,
			fieldBorderMismatch.join(', ')
		);
		record(
			`${label}: Field.Label keeps the tone ring`,
			fieldRings.every(Boolean) && new Set(fieldRings).size === TONES.length,
			fieldRings.map((value, index) => `${TONES[index]}=${value}`).join(', ')
		);
	}
};

const journeys = {
	checkbox: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const section = page.locator('#checkbox');
		await section
			.locator('[data-slot="checkbox"]')
			.first()
			.waitFor({ state: 'visible', timeout: 10_000 });
		record('checkbox section', (await section.count()) === 1, 'one section');

		for (const scheme of ['light', 'dark']) {
			const scope = section.locator(`[data-scheme="${scheme}"]`);
			await checkTones(record, scope, `checkbox ${scheme}`);
			await checkStates(page, record, scope, 'checkbox', scheme, `checkbox ${scheme}`, 'border');
		}
	},
	switch: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const section = page.locator('#switch');
		await section
			.locator('[data-slot="switch"]')
			.first()
			.waitFor({ state: 'visible', timeout: 10_000 });
		record('switch section', (await section.count()) === 1, 'one section');

		for (const scheme of ['light', 'dark']) {
			const scope = section.locator(`[data-scheme="${scheme}"]`);
			await checkTones(record, scope, `switch ${scheme}`, 'wash');
			await checkStates(page, record, scope, 'switch', scheme, `switch ${scheme}`, 'border');
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
			await checkTones(record, scope, `radio-group ${scheme}`, 'wash');
			const override = scope.locator('[data-override="radio-group"]');
			const overrideFill = await computed(override, 'backgroundColor');
			const overrideDot = await override
				.locator('[data-slot="radio-group-indicator"] > svg')
				.evaluate((node) => getComputedStyle(node).backgroundColor);
			const destructiveSoft = await computed(
				scope.locator('[data-soft-swatch="destructive"]'),
				'backgroundColor'
			);
			const destructiveFill = await computed(
				scope.locator('[data-fill-swatch="destructive"]'),
				'backgroundColor'
			);
			record(
				`radio-group ${scheme}: item variant overrides the group`,
				overrideFill === destructiveSoft && overrideDot === destructiveFill,
				`fill ${overrideFill} vs ${destructiveSoft} / dot ${overrideDot} vs ${destructiveFill}`
			);
			const unchecked = await scope.locator('[data-unchecked-tone]').evaluateAll((nodes) =>
				nodes.map((node) => ({
					tone: node.dataset.uncheckedTone,
					checked: node.getAttribute('aria-checked'),
					fill: getComputedStyle(node).backgroundColor
				}))
			);
			record(
				`radio-group ${scheme}: seven unchecked items`,
				unchecked.length === TONES.length && unchecked.every((row) => row.checked === 'false'),
				unchecked.map((row) => `${row.tone}=${row.checked}`).join(', ')
			);
			const texts = await scope
				.locator('[data-tone]')
				.evaluateAll((nodes) =>
					nodes.map((node) => ({ tone: node.dataset.tone, color: getComputedStyle(node).color }))
				);
			const textMismatch = [];
			for (const row of texts) {
				const fill = await computed(
					scope.locator(`[data-fill-swatch="${row.tone}"]`),
					'backgroundColor'
				);
				if (row.color !== fill) textMismatch.push(`${row.tone}:${row.color} vs ${fill}`);
			}
			record(
				`radio-group ${scheme}: checked text follows the tone`,
				textMismatch.length === 0,
				textMismatch.join(', ')
			);
			await checkStates(
				page,
				record,
				scope,
				'radio-group',
				scheme,
				`radio-group ${scheme}`,
				'border'
			);
		}
	},
	toggle: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const section = page.locator('#toggle');
		await section
			.locator('[data-slot="toggle"]')
			.first()
			.waitFor({ state: 'visible', timeout: 10_000 });
		record('toggle section', (await section.count()) === 1, 'one section');

		for (const scheme of ['light', 'dark']) {
			const scope = section.locator(`[data-scheme="${scheme}"]`);
			await checkTones(record, scope, `toggle ${scheme}`, 'pressed');
			await checkOutlinePairs(record, scope, `toggle ${scheme}`);
			const hoverProbe = scope.locator('[data-outline="outline-success"]');
			const idle = await computed(hoverProbe, 'backgroundColor');
			await hoverProbe.hover();
			await page.waitForTimeout(200);
			const hovered = await computed(hoverProbe, 'backgroundColor');
			const strong = await computed(
				scope.locator('[data-strong-swatch="success"]'),
				'backgroundColor'
			);
			record(
				`toggle ${scheme}: unpressed hover paints the tone at 20 percent`,
				idle !== hovered && hovered === strong,
				`${idle} -> ${hovered} (swatch ${strong})`
			);
			await page.mouse.move(0, 0);
			await checkStates(page, record, scope, 'toggle', scheme, `toggle ${scheme}`, 'ring');
		}
	},
	cursor: async (page, record) => {
		const response = await page.goto(BASE, { waitUntil: 'networkidle' });
		record('http 200', response?.status() === 200, `got ${response?.status()}`);

		const button = page.locator('[data-cursor="button"]');
		const buttonCursor = await computed(button, 'cursor');
		record('button points', buttonCursor === 'pointer', buttonCursor);
		const enabledPaint = await computed(button, 'backgroundColor');
		await button.hover();
		await page.waitForTimeout(150);
		const enabledHover = await computed(button, 'backgroundColor');
		record(
			'enabled button still paints hover',
			enabledPaint !== enabledHover,
			`${enabledPaint} -> ${enabledHover}`
		);
		await page.mouse.move(0, 0);

		for (const [name, slot] of [
			['checkbox', 'checkbox'],
			['switch', 'switch'],
			['radio-group', 'radio-group-item'],
			['toggle', 'toggle']
		]) {
			const node = page.locator(`#${name} [data-slot="${slot}"]`).first();
			const cursor = await computed(node, 'cursor');
			record(`${name} points`, cursor === 'pointer', cursor);
		}

		const disabled = page.locator('[data-cursor="button-disabled"]');
		const disabledCursor = await disabled.evaluate((node) => ({
			cursor: getComputedStyle(node).cursor,
			events: getComputedStyle(node).pointerEvents
		}));
		record(
			'disabled button does not invite a click',
			disabledCursor.cursor === 'not-allowed',
			`${disabledCursor.cursor} / ${disabledCursor.events}`
		);

		const disabledLink = page.locator('[data-cursor="button-link-disabled"]');
		const linkCursor = await computed(disabledLink, 'cursor');
		record(
			'disabled link button does not invite a click',
			linkCursor === 'not-allowed',
			linkCursor
		);

		const idlePaint = await computed(disabled, 'backgroundColor');
		await disabled.hover({ force: true });
		await page.waitForTimeout(150);
		const hoverPaint = await computed(disabled, 'backgroundColor');
		record(
			'disabled button does not paint hover',
			idlePaint === hoverPaint,
			`${idlePaint} -> ${hoverPaint}`
		);

		const disabledToggle = page.locator('#toggle [data-case="disabled"]').first();
		const toggleCursor = await computed(disabledToggle, 'cursor');
		record('disabled toggle does not invite a click', toggleCursor === 'not-allowed', toggleCursor);

		const inherited = page.locator('[data-cursor="fieldset-button"]');
		const inheritedStyle = await inherited.evaluate((node) => ({
			cursor: getComputedStyle(node).cursor,
			opacity: getComputedStyle(node).opacity
		}));
		record(
			'fieldset-disabled button dims and does not point',
			inheritedStyle.cursor === 'not-allowed' && inheritedStyle.opacity === '0.5',
			`${inheritedStyle.cursor} / ${inheritedStyle.opacity}`
		);
		const inheritedIdle = await computed(inherited, 'backgroundColor');
		await inherited.hover({ force: true });
		await page.waitForTimeout(150);
		const inheritedHover = await computed(inherited, 'backgroundColor');
		record(
			'fieldset-disabled button does not paint hover',
			inheritedIdle === inheritedHover,
			`${inheritedIdle} -> ${inheritedHover}`
		);

		for (const name of ['sibling', 'group', 'wrapped']) {
			const label = page.locator(`[data-label-case="${name}"]`);
			const cursor = await computed(label, 'cursor');
			record(`disabled ${name} label does not invite a click`, cursor === 'not-allowed', cursor);
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
