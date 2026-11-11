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

const wcagRelativeLuminance = (color) => {
	const match = /rgba?\(([^)]+)\)/.exec(color);
	if (!match) throw new Error(`expected an rgb() colour, got ${color}`);
	const [r, g, b] = match[1]
		.split(/[,\s/]+/)
		.slice(0, 3)
		.map(Number);
	const linear = (channel) => {
		const value = channel / 255;
		return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

const AA_TEXT_CONTRAST = 4.5;

const wcagContrastRatio = (a, b) => {
	const [high, low] = [wcagRelativeLuminance(a), wcagRelativeLuminance(b)].sort((x, y) => y - x);
	return (high + 0.05) / (low + 0.05);
};

// Computed colours arrive as oklch, and a tone fill carries alpha. A one-pixel canvas resolves both
// to the sRGB the eye sees, stacked in order, which is the only honest way to compare a 15 percent
// wash against the page behind it.
const paint = (page, layers) =>
	page.evaluate((colors) => {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;
		const context = canvas.getContext('2d');
		for (const value of colors) {
			context.fillStyle = value;
			context.fillRect(0, 0, 1, 1);
		}
		const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
		return `rgb(${r}, ${g}, ${b})`;
	}, layers);

const surfaceRatio = async (page, pageBackground, fill) =>
	wcagContrastRatio(
		await paint(page, [pageBackground]),
		await paint(page, [pageBackground, fill])
	);

const inkRatio = async (page, pageBackground, fill, ink) =>
	wcagContrastRatio(
		await paint(page, [pageBackground, fill]),
		await paint(page, [pageBackground, fill, ink])
	);

const SURFACE_FLOOR = { light: 1.1, dark: 1.25 };
const INK_FLOOR = 3;
// A raw tone keeps its hue, and a bright one cannot reach 3 to 1 on white. The stroke still has to
// be perceivable above the page, and 1.5 is the measured floor the raw tones clear in light.
const ACCENT_FLOOR = { light: 1.5, dark: 2.8 };

const cssLength = (page, expression) =>
	page.evaluate((value) => {
		const probe = document.createElement('div');
		probe.style.position = 'absolute';
		probe.style.width = value;
		document.body.append(probe);
		const width = probe.getBoundingClientRect().width;
		probe.remove();
		return width;
	}, expression);

// The light scheme card paints no background of its own, so the page behind it is the honest
// backdrop. Walk up until an opaque layer shows.
const backdropOf = (scope) =>
	scope.evaluate((node) => {
		for (let current = node; current; current = current.parentElement) {
			const value = getComputedStyle(current).backgroundColor;
			if (value && value !== 'transparent' && !/rgba\(0, 0, 0, 0\)/.test(value)) return value;
		}
		return 'rgb(255, 255, 255)';
	});

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
	const tonePairs = pairs.filter((pair) => pair.key !== 'outline');
	record(
		`${label}: every tone outline border sits at the hover wash alpha`,
		tonePairs.every((pair) => near(alphaOf(pair.border), 0.2)),
		tonePairs.map((pair) => `${pair.key}=${alphaOf(pair.border)}`).join(', ')
	);
	const defaultPair = pairs.find((pair) => pair.key === 'outline');
	record(
		`${label}: the default outline keeps its full border`,
		defaultPair !== undefined && near(alphaOf(defaultPair.border), 1),
		defaultPair ? `${alphaOf(defaultPair.border)}` : 'missing'
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
	await checkSchemeHeading(record, scope, label);
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
	record(`${label}: focus ring is 3px`, /\s3px$/.test(ring ?? ''), ring ?? focusState.shadow);

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
	record(`${label}: invalid ring is 3px`, /\s3px$/.test(invalidRing), invalidRing);

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

const CURSORS_OK = new Set(['text', 'auto', 'default']);
const TRANSPARENT = new Set(['transparent', 'rgba(0, 0, 0, 0)']);

const settle = () => new Promise((resolve) => setTimeout(resolve, 250));

const tabTo = async (locator, max = 120) => {
	const page = locator.page();
	for (let press = 0; press < max; press += 1) {
		await page.keyboard.press('Tab');
		if (await locator.evaluate((node) => node === document.activeElement)) return true;
	}
	return false;
};

const ringOf = (shadow) =>
	shadow === 'none'
		? ''
		: (shadow
				.split(/,(?![^(]*\))/)
				.map((layer) => layer.trim())
				.find((layer) => /\s[1-9][\d.]*px$/.test(layer)) ?? '');

const alphaOf = (color) => {
	const slash = /\/\s*([\d.]+)\s*\)/.exec(color);
	if (slash) return Number(slash[1]);
	const rgba = /rgba?\([^)]*,\s*([\d.]+)\s*\)/.exec(color);
	if (rgba) return Number(rgba[1]);
	return 1;
};

const near = (value, target) => Math.abs(value - target) < 0.02;

const translateFraction = (transform, width) => {
	if (transform === 'none') return 0;
	const match = /matrix\(([^)]+)\)/.exec(transform);
	if (!match || width === 0) return NaN;
	return Number(match[1].split(',')[4]) / width;
};

const fieldState = (locator) =>
	locator.evaluate((node) => {
		const style = getComputedStyle(node);
		const dimmed = node.closest('[data-slot="native-select-wrapper"]') ?? node;
		return {
			border: style.borderTopColor,
			background: style.backgroundColor,
			shadow: style.boxShadow,
			height: node.getBoundingClientRect().height,
			minHeight: style.minHeight,
			opacity: getComputedStyle(dimmed).opacity,
			cursor: style.cursor,
			pointerEvents: style.pointerEvents,
			resize: style.resize,
			readOnly: node.readOnly === true
		};
	});

const checkSchemeHeading = async (record, scope, label) => {
	const count = await scope.locator('h3').count();
	record(`${label}: one scheme heading`, count === 1, `${count}`);
};

const checkBaseField = async (record, scope, label) => {
	const base = scope.locator('[data-case="base"]');
	const state = await fieldState(base);
	record(`${label}: base border is painted`, !TRANSPARENT.has(state.border), state.border);
	record(
		`${label}: base background is painted`,
		!TRANSPARENT.has(state.background),
		state.background
	);
	record(
		`${label}: enabled cursor does not refuse a click`,
		CURSORS_OK.has(state.cursor),
		state.cursor
	);
	return { base, state };
};

const FIELD_SIZES = [
	{ size: 'sm', rung: 'sm', radius: 'sm' },
	{ size: 'default', rung: 'base', radius: 'md' },
	{ size: 'lg', rung: 'lg', radius: 'lg' }
];

const readFieldTokens = (page) =>
	page.evaluate(() => {
		const style = getComputedStyle(document.documentElement);
		const px = (rung) => parseFloat(style.getPropertyValue(`--text-${rung}`).trim());
		return { sm: px('sm'), base: px('base'), lg: px('lg') };
	});

const checkFieldSizes = async (record, scope, label, kind, tokens) => {
	for (const entry of FIELD_SIZES) {
		const token = tokens[entry.rung];
		const expectedText = `${token}px`;
		const expectedBox = kind === 'textarea' ? `${token * 4}px` : `${token * 2}px`;
		const expectedPadding = `${token * 0.5}px`;
		const control = scope.locator(`[data-case="size-${entry.size}"]`);
		const state = await control.evaluate((node) => {
			const style = getComputedStyle(node);
			return {
				text: style.fontSize,
				radius: style.borderTopLeftRadius,
				height: `${Math.round(node.getBoundingClientRect().height)}px`,
				minHeight: style.minHeight,
				paddingLeft: style.paddingLeft,
				dataSize: node.dataset.size
			};
		});
		const probe = await computed(
			scope.locator(`[data-oracle="radius-${entry.radius}"]`),
			'borderTopLeftRadius'
		);
		record(`${label}: ${entry.size} text is ${expectedText}`, state.text === expectedText, state.text);
		const box = kind === 'textarea' ? state.minHeight : state.height;
		record(`${label}: ${entry.size} box is ${expectedBox}`, box === expectedBox, box);
		record(
			`${label}: ${entry.size} padding-left is ${expectedPadding}`,
			state.paddingLeft === expectedPadding,
			state.paddingLeft
		);
		record(
			`${label}: ${entry.size} radius is ${entry.radius}`,
			state.radius === probe,
			`${state.radius} vs ${probe}`
		);
		record(`${label}: ${entry.size} sets data-size`, state.dataSize === entry.size, state.dataSize);
	}
};

const checkNarrowFieldText = async (page, record, scope, kind, tokens) => {
	const viewport = page.viewportSize();
	if (!viewport) return;
	try {
		await page.setViewportSize({ width: 400, height: viewport.height });
		await settle();
		const text = await computed(scope.locator('[data-case="size-default"]'), 'fontSize');
		record(
			`${kind}: default text stays ${tokens.base}px below md`,
			text === `${tokens.base}px`,
			text
		);
	} finally {
		await page.setViewportSize(viewport);
		await settle();
	}
};

const checkTextarea = (record, label, state, tokens) => {
	const minHeight = `${tokens.base * 4}px`;
	record(`${label}: min height is ${minHeight}`, state.minHeight === minHeight, state.minHeight);
	record(`${label}: resize is off`, state.resize === 'none', state.resize);
};

const checkFocusField = async (record, scope, label, baseState) => {
	const focus = scope.locator('[data-case="focus"]');
	await focus.focus();
	await settle();
	const visible = await focus.evaluate((node) => node.matches(':focus-visible'));
	const state = await fieldState(focus);
	const ring = ringOf(state.shadow);
	record(`${label}: focus is visible`, visible, 'focus-visible');
	record(`${label}: focus paints a ring`, ring !== '', ring || state.shadow);
	record(
		`${label}: focus raises the border to full opacity`,
		!near(alphaOf(state.border), alphaOf(baseState.border)) && near(alphaOf(state.border), 1),
		`${state.border} vs ${baseState.border}`
	);
	return ring;
};

const checkFieldTones = async (record, scope, label) => {
	const controls = scope.locator('[data-tone]');
	const count = await controls.count();
	record(`${label}: seven tone controls`, count === TONES.length, `${count} of 7`);
	const idle = await controls.evaluateAll((nodes) =>
		nodes.map((node) => ({
			tone: node.dataset.tone,
			border: getComputedStyle(node).borderTopColor
		}))
	);
	const borderMismatch = [];
	const idleAlphaMismatch = [];
	for (const row of idle) {
		const expected = await computed(
			scope.locator(`[data-tone-border="${row.tone}"]`),
			'borderTopColor'
		);
		if (row.border !== expected) borderMismatch.push(`${row.tone}:${row.border} vs ${expected}`);
		if (!near(alphaOf(row.border), 0.7))
			idleAlphaMismatch.push(`${row.tone}:${alphaOf(row.border)}`);
	}
	record(
		`${label}: every idle border is its tone`,
		borderMismatch.length === 0,
		borderMismatch.join(', ')
	);
	record(
		`${label}: every idle border is 70 percent`,
		idleAlphaMismatch.length === 0,
		idleAlphaMismatch.join(', ')
	);

	const rings = [];
	const focusMismatch = [];
	const focusAlphaMismatch = [];
	const ringMismatch = [];
	const ringWidthMismatch = [];
	for (const row of idle) {
		const control = scope.locator(`[data-tone="${row.tone}"]`).first();
		await control.focus();
		await settle();
		const state = await fieldState(control);
		const ring = ringOf(state.shadow);
		rings.push(ring);
		const ringOracle = ringOf(
			await computed(scope.locator(`[data-tone-ring="${row.tone}"]`), 'boxShadow')
		);
		if (ring !== ringOracle) ringMismatch.push(`${row.tone}:${ring} vs ${ringOracle}`);
		if (!/\s3px$/.test(ring)) ringWidthMismatch.push(`${row.tone}:${ring}`);
		const focusOracle = await computed(
			scope.locator(`[data-tone-focus="${row.tone}"]`),
			'borderTopColor'
		);
		if (state.border !== focusOracle)
			focusMismatch.push(`${row.tone}:${state.border} vs ${focusOracle}`);
		if (!near(alphaOf(state.border), 1))
			focusAlphaMismatch.push(`${row.tone}:${alphaOf(state.border)}`);
	}
	record(
		`${label}: focus raises the border to its tone`,
		focusMismatch.length === 0,
		focusMismatch.join(', ')
	);
	record(
		`${label}: focus border is 100 percent`,
		focusAlphaMismatch.length === 0,
		focusAlphaMismatch.join(', ')
	);
	record(
		`${label}: every tone ring is 3px`,
		ringWidthMismatch.length === 0,
		ringWidthMismatch.join(', ')
	);
	record(
		`${label}: every tone ring is its token at 2px`,
		ringMismatch.length === 0,
		ringMismatch.join(', ')
	);
	record(`${label}: every tone paints a ring`, rings.every(Boolean), rings.join(', '));
	record(
		`${label}: seven distinct tone rings`,
		new Set(rings).size === TONES.length,
		rings.map((value, index) => `${idle[index].tone}=${value}`).join(', ')
	);
};

const checkInvalidField = async (record, scope, label, focusRing) => {
	const invalid = scope.locator('[data-case="invalid"]');
	const mark = await invalid.getAttribute('aria-invalid');
	await invalid.focus();
	await settle();
	const state = await fieldState(invalid);
	const expected = await computed(
		scope.locator('[data-oracle="invalid-border"]'),
		'borderTopColor'
	);
	const ring = ringOf(state.shadow);
	record(`${label}: invalid is marked`, mark === 'true', mark);
	record(
		`${label}: invalid border is destructive`,
		state.border === expected,
		`${state.border} vs ${expected}`
	);
	record(`${label}: invalid paints a ring`, ring !== '', ring || state.shadow);
	record(`${label}: invalid ring is 3px`, /\s3px$/.test(ring), ring);
	record(
		`${label}: invalid ring differs from the focus ring`,
		ring !== focusRing,
		`${ring} vs ${focusRing}`
	);
};

const checkDisabledField = async (record, scope, label, baseState) => {
	const disabled = scope.locator('[data-case="disabled"]');
	const state = await fieldState(disabled);
	record(`${label}: disabled stays disabled`, await disabled.isDisabled(), 'disabled');
	record(
		`${label}: disabled does not invite a click`,
		state.pointerEvents !== 'none' && state.cursor === 'not-allowed',
		`${state.pointerEvents} / ${state.cursor}`
	);
	record(`${label}: disabled dims to 50 percent`, state.opacity === '0.5', state.opacity);
	record(
		`${label}: disabled keeps the base surface`,
		state.background === baseState.background,
		`${state.background} vs ${baseState.background}`
	);
	const idle = await computed(disabled, 'backgroundColor');
	await disabled.hover({ force: true });
	await settle();
	const hovered = await computed(disabled, 'backgroundColor');
	record(`${label}: disabled paints no hover`, idle === hovered, `${idle} -> ${hovered}`);
};

const checkReadonlyField = async (record, scope, label, baseState) => {
	const readonly = scope.locator('[data-case="readonly"]');
	const state = await fieldState(readonly);
	const editable = await readonly.isEditable();
	const focused = await readonly.evaluate((node) => {
		node.focus();
		return document.activeElement === node;
	});
	record(
		`${label}: readonly stays read only`,
		state.readOnly && !editable,
		`readOnly ${state.readOnly} / editable ${editable}`
	);
	record(
		`${label}: readonly surface is muted`,
		state.background !== baseState.background,
		`${state.background} vs ${baseState.background}`
	);
	record(`${label}: readonly uses the default cursor`, state.cursor === 'default', state.cursor);
	record(`${label}: readonly takes focus`, focused, String(focused));
	record(
		`${label}: readonly is not dimmed`,
		state.opacity === baseState.opacity,
		`${state.opacity} vs ${baseState.opacity}`
	);
};

const checkTyping = async (record, label, base) => {
	await base.fill('typed');
	record(
		`${label}: typing changes the value`,
		(await base.inputValue()) === 'typed',
		await base.inputValue()
	);
};

const checkNativeSelect = async (record, scope, label, base, baseState, scheme, tokens) => {
	if (scheme === 'dark') {
		const resolvedScheme = await computed(scope, 'colorScheme');
		record(`${label}: scope resolves the color scheme`, resolvedScheme === 'dark', resolvedScheme);
	}
	const small = scope.locator('[data-case="size-sm"]');
	const state = await fieldState(small);
	const smallBox = `${tokens.sm * 2}px`;
	const baseBox = `${tokens.base * 2}px`;
	record(
		`${label}: size-sm is ${smallBox} against a ${baseBox} base`,
		`${Math.round(state.height)}px` === smallBox && `${Math.round(baseState.height)}px` === baseBox,
		`${state.height}px vs ${baseState.height}px`
	);
	const chevron = await small.evaluate((node) => {
		const icon = node.parentElement?.querySelector('[data-slot="native-select-icon"]');
		return icon ? getComputedStyle(icon).pointerEvents : 'missing';
	});
	record(`${label}: chevron lets clicks through`, chevron === 'none', chevron);
	await base.selectOption('two');
	record(
		`${label}: choosing an option changes the value`,
		(await base.inputValue()) === 'two',
		await base.inputValue()
	);
	const optionPaint = await scope
		.locator('[data-slot="native-select-option"]')
		.first()
		.evaluate((node) => ({
			background: getComputedStyle(node).backgroundColor,
			color: getComputedStyle(node).color
		}));
	const optionLuminance = wcagRelativeLuminance(optionPaint.background);
	record(
		`${label}: option list follows the scheme`,
		scheme === 'dark' ? optionLuminance <= 0.05 : optionPaint.background === 'rgb(255, 255, 255)',
		`${optionPaint.background} L ${optionLuminance.toFixed(3)}`
	);
	const optionContrast = wcagContrastRatio(optionPaint.color, optionPaint.background);
	record(
		`${label}: option text meets AA on the list`,
		optionContrast >= AA_TEXT_CONTRAST,
		`${optionContrast.toFixed(1)}:1`
	);
};

const checkField = async (record, scope, label, kind, scheme, tokens) => {
	await checkSchemeHeading(record, scope, label);
	const { base, state } = await checkBaseField(record, scope, label);
	const baseBox = `${tokens.base * 2}px`;
	if (kind === 'textarea') checkTextarea(record, label, state, tokens);
	else record(`${label}: height is ${baseBox}`, `${Math.round(state.height)}px` === baseBox, `${state.height}px`);
	await checkFieldSizes(record, scope, label, kind, tokens);
	await checkFieldTones(record, scope, label);
	const focusRing = await checkFocusField(record, scope, label, state);
	await checkInvalidField(record, scope, label, focusRing);
	await checkDisabledField(record, scope, label, state);
	if (kind === 'native-select') {
		await checkNativeSelect(record, scope, label, base, state, scheme, tokens);
		return;
	}
	await checkReadonlyField(record, scope, label, state);
	await checkTyping(record, label, base);
};

const fieldJourney = (kind) => async (page, record) => {
	const response = await page.goto(`${BASE}review/${kind}`, { waitUntil: 'networkidle' });
	record('http 200', response?.status() === 200, `got ${response?.status()}`);

	const section = page.locator(`#${kind}`);
	await section
		.locator(`[data-slot="${kind}"]`)
		.first()
		.waitFor({ state: 'visible', timeout: 10_000 });
	record(`${kind} section`, (await section.count()) === 1, 'one section');

	const tokens = await readFieldTokens(page);
	for (const scheme of ['light', 'dark']) {
		const scope = section.locator(`[data-scheme="${scheme}"]`);
		await checkField(record, scope, `${kind} ${scheme}`, kind, scheme, tokens);
	}
	await checkNarrowFieldText(page, record, section.locator('[data-scheme="light"]'), kind, tokens);
};

const schemeOf = (scope) => scope.getAttribute('data-scheme');

const toneRows = (scope) => scope.locator('[data-tone]');

const toneFills = (locator) =>
	locator.evaluateAll((nodes) =>
		nodes.map((node) => ({
			tone: node.dataset.tone,
			fill: getComputedStyle(node).backgroundColor
		}))
	);

const checkKbd = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const page = scope.page();
	const scheme = await schemeOf(scope);
	const pageBackground = await backdropOf(scope);
	const selectorRadius = await cssLength(page, 'var(--radius-sm)');

	const keys = scope.locator('[data-slot="kbd"]');
	const base = scope.locator('[data-case="base"]');
	const state = await base.evaluate((node) => {
		const style = getComputedStyle(node);
		return {
			height: node.getBoundingClientRect().height,
			fill: style.backgroundColor,
			ink: style.color,
			pointerEvents: style.pointerEvents,
			radius: style.borderRadius,
			bottomBorder: style.borderBottomWidth
		};
	});
	record(`${label}: key height is 22px`, Math.round(state.height) === 22, `${state.height}px`);
	record(
		`${label}: key never takes the pointer`,
		state.pointerEvents === 'none',
		state.pointerEvents
	);
	record(
		`${label}: key radius follows the selector step`,
		Math.abs(parseFloat(state.radius) - selectorRadius) < 0.5,
		`${state.radius} of ${selectorRadius}px`
	);
	record(
		`${label}: key carries a 2px bottom edge`,
		state.bottomBorder === '2px',
		state.bottomBorder
	);

	const surface = await surfaceRatio(page, pageBackground, state.fill);
	record(
		`${label}: key surface reaches ${SURFACE_FLOOR[scheme]} to 1`,
		surface >= SURFACE_FLOOR[scheme],
		`${surface.toFixed(2)}:1`
	);
	const ink = await inkRatio(page, pageBackground, state.fill, state.ink);
	record(`${label}: key text reaches 3 to 1`, ink >= INK_FLOOR, `${ink.toFixed(2)}:1`);

	const grouped = await scope.locator('[data-case="group"] [data-slot="kbd"]').count();
	record(`${label}: group holds two keys`, grouped === 2, `${grouped}`);

	const tones = await toneFills(toneRows(scope));
	record(`${label}: ${TONES.length} tone keys`, tones.length === TONES.length, `${tones.length}`);
	record(
		`${label}: every tone paints its own fill`,
		new Set(tones.map((row) => row.fill)).size === TONES.length,
		tones.map((row) => `${row.tone}=${row.fill}`).join(', ')
	);
	const dim = [];
	for (const row of tones) {
		const ratio = await surfaceRatio(page, pageBackground, row.fill);
		if (ratio < SURFACE_FLOOR[scheme]) dim.push(`${row.tone}=${ratio.toFixed(2)}:1`);
	}
	record(
		`${label}: every tone surface reaches ${SURFACE_FLOOR[scheme]} to 1`,
		dim.length === 0,
		dim.join(', ') || `${tones.length} rows`
	);
	record(`${label}: key count is the group plus the row`, (await keys.count()) === 10, `${await keys.count()}`);
};

const checkSeparator = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const page = scope.page();
	const scheme = await schemeOf(scope);
	const pageBackground = await backdropOf(scope);
	const read = (locator) =>
		locator.evaluate((node) => {
			const rect = node.getBoundingClientRect();
			return {
				orientation: node.getAttribute('data-orientation'),
				role: node.getAttribute('role'),
				ariaHidden: node.getAttribute('aria-hidden'),
				width: rect.width,
				height: rect.height
			};
		});

	const horizontal = await read(scope.locator('[data-case="horizontal"]'));
	record(
		`${label}: horizontal spans the row`,
		horizontal.orientation === 'horizontal' &&
			Math.round(horizontal.height) === 1 &&
			horizontal.width > 100,
		`${horizontal.orientation} ${horizontal.width} x ${horizontal.height}`
	);
	record(`${label}: horizontal is announced`, horizontal.role === 'separator', horizontal.role);

	const vertical = await read(scope.locator('[data-case="vertical"]'));
	record(
		`${label}: vertical spans the row height`,
		vertical.orientation === 'vertical' && Math.round(vertical.width) === 1 && vertical.height >= 40,
		`${vertical.orientation} ${vertical.width} x ${vertical.height}`
	);
	record(`${label}: vertical is announced`, vertical.role === 'separator', vertical.role);

	const decorative = await read(scope.locator('[data-case="decorative"]'));
	record(
		`${label}: decorative stays silent`,
		decorative.role !== 'separator' && decorative.ariaHidden === 'true',
		`role ${decorative.role} / aria-hidden ${decorative.ariaHidden}`
	);

	const lines = await toneFills(toneRows(scope));
	record(
		`${label}: ${TONES.length + 1} tone lines`,
		lines.length === TONES.length + 1,
		`${lines.length}`
	);
	const dim = [];
	for (const row of lines) {
		const ratio = await surfaceRatio(page, pageBackground, row.fill);
		if (ratio < SURFACE_FLOOR[scheme]) dim.push(`${row.tone}=${ratio.toFixed(2)}:1`);
	}
	record(
		`${label}: every line reaches ${SURFACE_FLOOR[scheme]} to 1`,
		dim.length === 0,
		dim.join(', ') || `${lines.length} rows`
	);
};

const checkSkeleton = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const page = scope.page();
	const scheme = await schemeOf(scope);
	const pageBackground = await backdropOf(scope);
	const selectorRadius = await cssLength(page, 'var(--radius-sm)');

	const block = await scope.locator('[data-case="block"]').evaluate((node) => {
		const rect = node.getBoundingClientRect();
		const style = getComputedStyle(node);
		return {
			animation: style.animationName,
			fill: style.backgroundColor,
			text: node.textContent.trim(),
			width: rect.width,
			height: rect.height,
			radius: style.borderRadius
		};
	});
	record(`${label}: skeleton pulses`, block.animation === 'pulse', block.animation);
	record(`${label}: skeleton carries no text`, block.text === '', block.text || 'empty');
	record(
		`${label}: block measures 32px by 160px`,
		Math.round(block.height) === 32 && Math.round(block.width) === 160,
		`${block.height} x ${block.width}`
	);
	record(
		`${label}: block radius follows the selector step`,
		Math.abs(parseFloat(block.radius) - selectorRadius) < 0.5,
		`${block.radius} of ${selectorRadius}px`
	);

	const circle = await computed(scope.locator('[data-case="circle"]'), 'borderRadius');
	record(`${label}: circle stays fully round`, parseFloat(circle) >= 20, circle);

	const neutral = await scope.locator('[data-tone="neutral"]').evaluate((node) => getComputedStyle(node).backgroundColor);
	const neutralRatio = await surfaceRatio(page, pageBackground, neutral);
	record(
		`${label}: neutral surface reaches ${SURFACE_FLOOR[scheme]} to 1`,
		neutralRatio >= SURFACE_FLOOR[scheme],
		`${neutralRatio.toFixed(2)}:1`
	);

	const tones = await toneFills(toneRows(scope).filter({ hasNot: scope.locator('[data-tone="neutral"]') }));
	record(
		`${label}: ${TONES.length} tone fill and one neutral`,
		(await toneRows(scope).count()) === TONES.length + 1,
		`${await toneRows(scope).count()}`
	);
	const dim = [];
	for (const row of tones) {
		const ratio = await surfaceRatio(page, pageBackground, row.fill);
		if (ratio < SURFACE_FLOOR[scheme]) dim.push(`${row.tone}=${ratio.toFixed(2)}:1`);
	}
	record(
		`${label}: every tone surface reaches ${SURFACE_FLOOR[scheme]} to 1`,
		dim.length === 0,
		dim.join(', ') || `${tones.length} rows`
	);
};

const checkSpinner = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const page = scope.page();
	const scheme = await schemeOf(scope);
	const pageBackground = await backdropOf(scope);
	// animate-spin rotates the box, so its bounding rect oscillates; the CSS size is the honest one.
	const read = (locator) =>
		locator.evaluate((node) => {
			const style = getComputedStyle(node);
			const svg = node.tagName.toLowerCase() === 'svg' ? node : node.querySelector('svg');
			return {
				role: node.getAttribute('role'),
				ariaLabel: node.getAttribute('aria-label'),
				animation: style.animationName,
				width: parseFloat(style.width),
				height: parseFloat(style.height),
				stroke: svg ? getComputedStyle(svg).stroke : 'missing',
				color: style.color
			};
		});

	const base = await read(scope.locator('[data-case="base"]'));
	record(
		`${label}: spinner announces itself`,
		base.role === 'status' && base.ariaLabel === 'Loading',
		`${base.role} / ${base.ariaLabel}`
	);
	record(`${label}: spinner spins`, base.animation === 'spin', base.animation);
	record(
		`${label}: base spinner is 16px`,
		Math.round(base.width) === 16 && Math.round(base.height) === 16,
		`${base.width} x ${base.height}`
	);

	const sizes = await scope.locator('[data-size]').evaluateAll((nodes) =>
		nodes.map((node) => ({
			size: node.dataset.size,
			width: parseFloat(getComputedStyle(node).width)
		}))
	);
	const expectedSizes = { sm: 12, default: 16, lg: 24, xl: 32 };
	const wrongSize = sizes
		.filter((row) => Math.round(row.width) !== expectedSizes[row.size])
		.map((row) => `${row.size}=${row.width}`);
	record(
		`${label}: four sizes render at 12, 16, 24 and 32`,
		sizes.length === 4 && wrongSize.length === 0,
		wrongSize.join(', ') || sizes.map((row) => `${row.size}=${row.width}`).join(', ')
	);

	const tones = await scope.locator('[data-tone]').evaluateAll((nodes) =>
		nodes.map((node) => {
			const svg = node.tagName.toLowerCase() === 'svg' ? node : node.querySelector('svg');
			return {
				tone: node.dataset.tone,
				stroke: svg ? getComputedStyle(svg).stroke : 'missing'
			};
		})
	);
	record(`${label}: ${TONES.length} tone spinners`, tones.length === TONES.length, `${tones.length}`);
	record(
		`${label}: every tone paints its own stroke`,
		new Set(tones.map((row) => row.stroke)).size === TONES.length,
		tones.map((row) => `${row.tone}=${row.stroke}`).join(', ')
	);
	const dim = [];
	for (const row of tones) {
		const ratio = await surfaceRatio(page, pageBackground, row.stroke);
		if (ratio < ACCENT_FLOOR[scheme]) dim.push(`${row.tone}=${ratio.toFixed(2)}:1`);
	}
	record(
		`${label}: every stroke reaches ${ACCENT_FLOOR[scheme]} to 1`,
		dim.length === 0,
		dim.join(', ') || `${tones.length} rows`
	);
};

const checkMarker = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const page = scope.page();
	const scheme = await schemeOf(scope);
	const pageBackground = await backdropOf(scope);
	const markers = scope.locator('[data-slot="marker"]');
	const count = await markers.count();
	record(`${label}: four markers`, count === 4, `${count}`);

	const variants = await markers.evaluateAll((nodes) =>
		nodes.map((node) => ({ name: node.dataset.case, variant: node.dataset.variant }))
	);
	const expected = { base: 'default', separator: 'separator', border: 'border', link: 'default' };
	const wrongVariant = variants
		.filter((row) => expected[row.name] !== row.variant)
		.map((row) => `${row.name}=${row.variant}`);
	record(
		`${label}: every marker carries its variant`,
		wrongVariant.length === 0,
		wrongVariant.join(', ') || 'all four'
	);

	const rung = await cssLength(page, 'var(--text-sm)');
	const text = await scope
		.locator('[data-case="base"] [data-slot="marker-content"]')
		.evaluate((node) => {
			const style = getComputedStyle(node);
			return {
				transform: style.textTransform,
				spacing: parseFloat(style.letterSpacing),
				size: parseFloat(style.fontSize),
				color: style.color
			};
		});
	record(`${label}: marker text is uppercase`, text.transform === 'uppercase', text.transform);
	record(`${label}: marker tracking is positive`, text.spacing > 0, `${text.spacing}px`);
	record(`${label}: marker text is ${rung}px`, text.size === rung, `${text.size}px`);
	const ink = await surfaceRatio(page, pageBackground, text.color);
	record(`${label}: marker text reaches 4.5 to 1`, ink >= AA_TEXT_CONTRAST, `${ink.toFixed(2)}:1`);

	const hairlines = await scope.locator('[data-case="separator"]').evaluate((node) => {
		const before = getComputedStyle(node, '::before');
		const after = getComputedStyle(node, '::after');
		return {
			beforeHeight: before.height,
			afterHeight: after.height,
			beforePaint: before.backgroundColor,
			afterPaint: after.backgroundColor
		};
	});
	record(
		`${label}: separator paints a 1px hairline on each side`,
		hairlines.beforeHeight === '1px' && hairlines.afterHeight === '1px',
		`${hairlines.beforeHeight} / ${hairlines.afterHeight}`
	);
	const beforeRatio = await surfaceRatio(page, pageBackground, hairlines.beforePaint);
	const afterRatio = await surfaceRatio(page, pageBackground, hairlines.afterPaint);
	record(
		`${label}: both hairlines reach ${SURFACE_FLOOR[scheme]} to 1`,
		beforeRatio >= SURFACE_FLOOR[scheme] && afterRatio >= SURFACE_FLOOR[scheme],
		`${beforeRatio.toFixed(2)}:1 / ${afterRatio.toFixed(2)}:1`
	);

	const edged = await scope.locator('[data-case="border"]').evaluate((node) => ({
		width: getComputedStyle(node).borderBottomWidth,
		paint: getComputedStyle(node).borderBottomColor
	}));
	record(`${label}: border variant paints a 1px bottom edge`, edged.width === '1px', edged.width);
	const edgeRatio = await surfaceRatio(page, pageBackground, edged.paint);
	record(
		`${label}: bottom edge reaches ${SURFACE_FLOOR[scheme]} to 1`,
		edgeRatio >= SURFACE_FLOOR[scheme],
		`${edgeRatio.toFixed(2)}:1`
	);

	const icons = scope.locator('[data-slot="marker-icon"]');
	const iconCount = await icons.count();
	const icon = await icons.first().evaluate((node) => {
		const style = getComputedStyle(node);
		return {
			ariaHidden: node.getAttribute('aria-hidden'),
			width: parseFloat(style.width),
			height: parseFloat(style.height)
		};
	});
	record(`${label}: one icon`, iconCount === 1, `${iconCount}`);
	record(
		`${label}: icon stays out of the accessibility tree`,
		icon.ariaHidden === 'true',
		icon.ariaHidden
	);
	record(
		`${label}: icon measures 16px`,
		Math.round(icon.width) === 16 && Math.round(icon.height) === 16,
		`${icon.width} x ${icon.height}`
	);

	const anchors = scope.locator('[data-case="link"] a');
	const anchorCount = await anchors.count();
	const decoration =
		anchorCount === 1 ? await computed(anchors.first(), 'textDecorationLine') : 'missing';
	record(
		`${label}: link case holds one underlined anchor`,
		anchorCount === 1 && decoration.includes('underline'),
		`${anchorCount} / ${decoration}`
	);
};

const PROGRESS_STOPS = {
	empty: { now: '0', fraction: -1 },
	half: { now: '50', fraction: -0.5 },
	full: { now: '100', fraction: 0 },
	thick: { now: '50', fraction: -0.5 }
};

const checkProgress = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const page = scope.page();
	const scheme = await schemeOf(scope);
	const pageBackground = await backdropOf(scope);

	const cases = await scope.locator('[data-case]').evaluateAll((nodes) =>
		nodes.map((node) => {
			const indicator = node.querySelector('[data-slot="progress-indicator"]');
			const style = getComputedStyle(node);
			return {
				name: node.dataset.case,
				now: node.getAttribute('aria-valuenow'),
				max: node.getAttribute('aria-valuemax'),
				height: node.getBoundingClientRect().height,
				track: style.backgroundColor,
				radius: style.borderRadius,
				indicator: indicator ? getComputedStyle(indicator).backgroundColor : 'missing',
				transform: indicator ? getComputedStyle(indicator).transform : 'missing',
				width: indicator ? indicator.getBoundingClientRect().width : 0
			};
		})
	);
	record(`${label}: four progress cases`, cases.length === 4, `${cases.length}`);
	for (const row of cases) {
		const expected = PROGRESS_STOPS[row.name];
		const fraction = translateFraction(row.transform, row.width);
		record(`${label}: ${row.name} announces ${expected.now}`, row.now === expected.now, row.now);
		record(`${label}: ${row.name} sets max 100`, row.max === '100', row.max);
		record(
			`${label}: ${row.name} indicator sits at ${(fraction * 100).toFixed(1)} percent`,
			near(fraction, expected.fraction),
			`${(fraction * 100).toFixed(1)}%`
		);
	}
	const bar = cases.find((row) => row.name === 'half');
	const thick = cases.find((row) => row.name === 'thick');
	record(`${label}: the default bar is 2px`, Math.round(bar.height) === 2, `${bar.height}px`);
	record(
		`${label}: a caller's h-2 wins over h-0.5`,
		Math.round(thick.height) === 8,
		`${thick.height}px`
	);
	record(
		`${label}: the track is fully round`,
		parseFloat(bar.radius) >= bar.height / 2,
		`${bar.radius} of ${bar.height / 2}px`
	);

	const track = await surfaceRatio(page, pageBackground, bar.track);
	record(
		`${label}: track reaches ${SURFACE_FLOOR[scheme]} to 1`,
		track >= SURFACE_FLOOR[scheme],
		`${track.toFixed(2)}:1`
	);
	const indicator = await surfaceRatio(page, pageBackground, bar.indicator);
	record(`${label}: indicator reaches ${ACCENT_FLOOR[scheme]} to 1`, indicator >= ACCENT_FLOOR[scheme], `${indicator.toFixed(2)}:1`);

	const tones = await scope.locator('[data-tone]').evaluateAll((nodes) =>
		nodes.map((node) => {
			const bar = node.querySelector('[data-slot="progress-indicator"]');
			return {
				tone: node.dataset.tone,
				fill: bar ? getComputedStyle(bar).backgroundColor : 'missing'
			};
		})
	);
	record(`${label}: ${TONES.length} tone bars`, tones.length === TONES.length, `${tones.length}`);
	record(
		`${label}: every tone paints its own bar`,
		new Set(tones.map((row) => row.fill)).size === TONES.length,
		tones.map((row) => `${row.tone}=${row.fill}`).join(', ')
	);
	const dim = [];
	for (const row of tones) {
		const ratio = await surfaceRatio(page, pageBackground, row.fill);
		if (ratio < ACCENT_FLOOR[scheme]) dim.push(`${row.tone}=${ratio.toFixed(2)}:1`);
	}
	record(
		`${label}: every tone bar reaches ${ACCENT_FLOOR[scheme]} to 1`,
		dim.length === 0,
		dim.join(', ') || `${tones.length} rows`
	);
};

const SLIDER_CASES = { single: 1, range: 2, disabled: 1 };

const checkSlider = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const page = scope.page();
	const scheme = await schemeOf(scope);
	const pageBackground = await backdropOf(scope);

	for (const [name, expected] of Object.entries(SLIDER_CASES)) {
		const found = await scope.locator(`[data-case="${name}"] [data-slot="slider-thumb"]`).count();
		record(`${label}: ${name} holds ${expected} thumb`, found === expected, `${found}`);
	}

	const thumb = await scope
		.locator('[data-case="single"] [data-slot="slider-thumb"]')
		.evaluate((node) => {
			const style = getComputedStyle(node);
			return {
				width: parseFloat(style.width),
				height: parseFloat(style.height),
				radius: parseFloat(style.borderRadius),
				fill: style.backgroundColor
			};
		});
	record(
		`${label}: thumb measures 12px`,
		Math.round(thumb.width) === 12 && Math.round(thumb.height) === 12,
		`${thumb.width} x ${thumb.height}`
	);
	record(
		`${label}: thumb is fully round`,
		thumb.radius >= thumb.width / 2,
		`${thumb.radius}px of ${thumb.width / 2}px`
	);

	const track = await computed(
		scope.locator('[data-case="single"] [data-slot="slider-track"]'),
		'backgroundColor'
	);
	const trackRatio = await surfaceRatio(page, pageBackground, track);
	record(
		`${label}: track reaches ${SURFACE_FLOOR[scheme]} to 1`,
		trackRatio >= SURFACE_FLOOR[scheme],
		`${trackRatio.toFixed(2)}:1`
	);

	const range = await computed(
		scope.locator('[data-case="single"] [data-slot="slider-range"]'),
		'backgroundColor'
	);
	const rangeRatio = await surfaceRatio(page, pageBackground, range);
	record(`${label}: range reaches ${ACCENT_FLOOR[scheme]} to 1`, rangeRatio >= ACCENT_FLOOR[scheme], `${rangeRatio.toFixed(2)}:1`);
	const thumbRatio = await surfaceRatio(page, pageBackground, thumb.fill);
	record(`${label}: thumb reaches ${ACCENT_FLOOR[scheme]} to 1`, thumbRatio >= ACCENT_FLOOR[scheme], `${thumbRatio.toFixed(2)}:1`);

	const disabled = await computed(scope.locator('[data-case="disabled"]'), 'opacity');
	record(`${label}: disabled slider dims to 50 percent`, disabled === '0.5', disabled);

	const tones = await scope.locator('[data-tone]').evaluateAll((nodes) =>
		nodes.map((node) => {
			const thumb = node.querySelector('[data-slot="slider-thumb"]');
			const range = node.querySelector('[data-slot="slider-range"]');
			const thumbStyle = thumb ? getComputedStyle(thumb) : null;
			return {
				tone: node.dataset.tone,
				thumb: thumbStyle ? thumbStyle.backgroundColor : 'missing',
				range: range ? getComputedStyle(range).backgroundColor : 'missing',
				ring: thumbStyle ? thumbStyle.getPropertyValue('--tw-ring-color').trim() : 'missing'
			};
		})
	);
	record(`${label}: ${TONES.length} tone sliders`, tones.length === TONES.length, `${tones.length}`);
	record(
		`${label}: every tone paints its own thumb`,
		new Set(tones.map((row) => row.thumb)).size === TONES.length,
		tones.map((row) => `${row.tone}=${row.thumb}`).join(', ')
	);
	record(
		`${label}: every tone ring follows its thumb`,
		new Set(tones.map((row) => row.ring)).size === TONES.length &&
			tones.every((row) => row.ring !== '' && row.ring !== 'missing'),
		tones.map((row) => `${row.tone}=${row.ring || 'none'}`).join(', ')
	);
	const dim = [];
	for (const row of tones) {
		const ratio = await surfaceRatio(page, pageBackground, row.thumb);
		if (ratio < ACCENT_FLOOR[scheme]) dim.push(`${row.tone}=${ratio.toFixed(2)}:1`);
	}
	record(
		`${label}: every tone thumb reaches ${ACCENT_FLOOR[scheme]} to 1`,
		dim.length === 0,
		dim.join(', ') || `${tones.length} rows`
	);

	const first = scope.locator('[data-case="single"] [data-slot="slider-thumb"]');
	const reached = await tabTo(first);
	await settle();
	const shadow = await computed(first, 'boxShadow');
	const ring = ringOf(shadow);
	const ringWidth = ring ? Number(/([\d.]+)px$/.exec(ring)?.[1] ?? 0) : 0;
	record(`${label}: Tab reaches the thumb`, reached, reached ? 'focused' : 'not reachable');
	record(`${label}: thumb focus ring is 3px`, near(ringWidth, 3), `${ringWidth}px`);
};

const SCROLL_CASES = {
	vertical: { x: false, y: true, axis: 'the y axis' },
	horizontal: { x: true, y: false, axis: 'the x axis' },
	both: { x: true, y: true, axis: 'both axes' }
};

const checkScrollArea = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const page = scope.page();
	const scheme = await schemeOf(scope);
	const pageBackground = await backdropOf(scope);

	const viewports = await scope
		.locator('[data-slot="scroll-area-viewport"]')
		.evaluateAll((nodes) =>
			nodes.map((node) => ({
				name: node.closest('[data-case]')?.dataset.case,
				clientWidth: node.clientWidth,
				clientHeight: node.clientHeight,
				scrollWidth: node.scrollWidth,
				scrollHeight: node.scrollHeight
			}))
		);
	record(`${label}: three viewports`, viewports.length === 3, `${viewports.length}`);

	for (const view of viewports) {
		const spec = SCROLL_CASES[view.name];
		const overflowsX = view.scrollWidth > view.clientWidth;
		const overflowsY = view.scrollHeight > view.clientHeight;
		record(
			`${label}: ${view.name} overflows on ${spec.axis}`,
			overflowsX === spec.x && overflowsY === spec.y,
			`${view.scrollWidth} x ${view.scrollHeight} in ${view.clientWidth} x ${view.clientHeight}`
		);
	}

	const vertical = scope.locator('[data-case="vertical"]');
	await vertical.hover();
	await settle();
	const scrollbars = vertical.locator('[data-slot="scroll-area-scrollbar"]');
	const mounted = await scrollbars.count();
	const thumbPaint =
		mounted === 1
			? await computed(scrollbars.first().locator('[data-slot="scroll-area-thumb"]'), 'backgroundColor')
			: 'missing';
	record(`${label}: hovering mounts a scrollbar`, mounted === 1, `${mounted}`);
	const thumbRatio = mounted === 1 ? await surfaceRatio(page, pageBackground, thumbPaint) : 0;
	record(
		`${label}: scrollbar thumb reaches ${SURFACE_FLOOR[scheme]} to 1`,
		thumbRatio >= SURFACE_FLOOR[scheme],
		`${thumbRatio.toFixed(2)}:1`
	);
	const thumbRadius =
		mounted === 1
			? await scrollbars.first().locator('[data-slot="scroll-area-thumb"]').evaluate((node) => {
					const style = getComputedStyle(node);
					return {
						radius: parseFloat(style.borderRadius),
						width: node.getBoundingClientRect().width
					};
				})
			: { radius: 0, width: 0 };
	record(
		`${label}: scrollbar thumb is fully round`,
		thumbRadius.radius >= thumbRadius.width / 2 && thumbRadius.width > 0,
		`${thumbRadius.radius}px of ${thumbRadius.width / 2}px`
	);

	const viewport = vertical.locator('[data-slot="scroll-area-viewport"]');
	const reached = await tabTo(viewport);
	await settle();
	const shadow = await computed(viewport, 'boxShadow');
	const ring = ringOf(shadow);
	const ringWidth = ring ? Number(/([\d.]+)px$/.exec(ring)?.[1] ?? 0) : 0;
	const ringAlpha = ring ? alphaOf(ring) : 0;
	record(`${label}: Tab reaches the viewport`, reached, reached ? 'focused' : 'not reachable');
	record(`${label}: viewport focus ring is 3px`, near(ringWidth, 3), `${ringWidth}px`);
	record(
		`${label}: viewport ring alpha is 30 percent`,
		near(ringAlpha, 0.3),
		`${Math.round(ringAlpha * 100)}%`
	);
};

const LABEL_CASES = [
	'for',
	'wrap',
	'peer-checkbox',
	'peer-radio',
	'peer-switch',
	'disabled-sibling',
	'disabled-group',
	'disabled-wrapped',
	'disabled-input-sibling',
	'field-label'
];

const readTextTokens = (page) =>
	page.evaluate(() => {
		const root = getComputedStyle(document.documentElement);
		return {
			xs: parseFloat(root.getPropertyValue('--text-xs').trim()),
			sm: parseFloat(root.getPropertyValue('--text-sm').trim()),
			base: parseFloat(root.getPropertyValue('--text-base').trim())
		};
	});

const labelText = (target) =>
	target.evaluate((node) => {
		const style = getComputedStyle(node);
		return {
			size: parseFloat(style.fontSize),
			transform: style.textTransform,
			spacing: style.letterSpacing,
			weight: style.fontWeight,
			color: style.color
		};
	});

const checkLabelType = async (record, scope, label, tokens) => {
	const labels = scope.locator('[data-slot="label"], [data-slot="field-label"]');
	const count = await labels.count();
	record(
		`${label}: ${LABEL_CASES.length} label variants`,
		count === LABEL_CASES.length,
		`${count}`
	);

	const names = await labels.evaluateAll((nodes) => nodes.map((node) => node.dataset.case));
	const missing = LABEL_CASES.filter((name) => !names.includes(name));
	const extra = names.filter((name) => !LABEL_CASES.includes(name));
	record(
		`${label}: every label carries its own case name`,
		missing.length === 0 && extra.length === 0 && new Set(names).size === names.length,
		names.join(', ')
	);

	const base = await labelText(scope.locator('[data-case="for"]'));
	const foreground = await computed(scope.locator('[data-oracle="foreground"]'), 'backgroundColor');
	record(`${label}: base label is ${tokens.sm}px`, base.size === tokens.sm, `${base.size}px`);
	record(`${label}: base label is uppercase`, base.transform === 'uppercase', base.transform);
	record(`${label}: base label tracks wide`, parseFloat(base.spacing) > 0, base.spacing);
	record(`${label}: base label is weight 600`, base.weight === '600', base.weight);
	record(
		`${label}: base label takes the foreground`,
		base.color === foreground,
		`${base.color} vs ${foreground}`
	);

	for (const name of ['peer-checkbox', 'peer-radio', 'peer-switch']) {
		const peer = await labelText(scope.locator(`[data-case="${name}"]`));
		record(`${label}: ${name} label is ${tokens.base}px`, peer.size === tokens.base, `${peer.size}px`);
		record(`${label}: ${name} label is not uppercase`, peer.transform === 'none', peer.transform);
		record(
			`${label}: ${name} label keeps normal tracking`,
			peer.spacing === 'normal' || parseFloat(peer.spacing) === 0,
			peer.spacing
		);
		record(`${label}: ${name} label is weight 400`, peer.weight === '400', peer.weight);
	}
};

const checkLabelAssociation = async (record, scope, label) => {
	const scheme = await scope.getAttribute('data-scheme');
	if (scheme !== 'light') return;

	const forIds = await scope
		.page()
		.locator('#label [data-case="for"]')
		.evaluateAll((nodes) => nodes.map((node) => node.htmlFor));
	record(
		`${label}: the two schemes carry different for ids`,
		forIds.length === 2 && new Set(forIds).size === 2,
		forIds.join(' and ')
	);

	const association = await scope.locator('[data-case="for"]').evaluate((node) => ({
		htmlFor: node.htmlFor,
		tag: node.control?.tagName.toLowerCase() ?? null,
		controlId: node.control?.id ?? null,
		owner: node.control?.closest('[data-scheme]')?.dataset.scheme ?? null
	}));
	record(
		`${label}: for resolves to the input in this scheme`,
		association.controlId === association.htmlFor && association.owner === scheme,
		`${association.htmlFor} -> ${association.tag}#${association.controlId} in ${association.owner}`
	);

	const wrap = scope.locator('[data-case="wrap"]');
	await wrap.locator('span').click();
	await settle();
	const focused = await wrap.evaluate(
		(node) => node.querySelector('input') === document.activeElement
	);
	record(
		`${label}: clicking the wrap label focuses its input`,
		focused,
		focused ? 'input focused' : 'input not focused'
	);
};

const checkLabelDisabled = async (record, scope, label) => {
	for (const name of ['disabled-sibling', 'disabled-group', 'disabled-wrapped']) {
		const cursor = await computed(scope.locator(`[data-case="${name}"]`), 'cursor');
		record(`${label}: ${name} label does not invite a click`, cursor === 'not-allowed', cursor);
	}
	const group = await computed(scope.locator('[data-case="disabled-group"]'), 'opacity');
	record(`${label}: disabled group label dims to 0.5`, group === '0.5', group);

	const input = await scope.locator('[data-case="disabled-input-sibling"]').evaluate((node) => {
		const control = node.control;
		const style = control ? getComputedStyle(control) : null;
		return {
			found: Boolean(control),
			cursor: style?.cursor ?? 'missing',
			opacity: style?.opacity ?? 'missing'
		};
	});
	record(
		`${label}: disabled text input does not invite a click`,
		input.found && input.cursor === 'not-allowed' && input.opacity === '0.5',
		`${input.cursor} / ${input.opacity}`
	);
};

const checkLabelField = async (record, scope, label, tokens) => {
	const fieldLabels = scope.locator('[data-slot="field-label"]');
	const count = await fieldLabels.count();
	record(`${label}: one field label`, count === 1, `${count}`);
	const field = await labelText(fieldLabels);
	record(
		`${label}: field label sits at the ${tokens.xs}px stock rung`,
		field.size === tokens.xs,
		`${field.size}px, ${tokens.sm}px on the shipped label`
	);
};

const checkLabel = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const tokens = await readTextTokens(scope.page());
	await checkLabelType(record, scope, label, tokens);
	await checkLabelAssociation(record, scope, label);
	await checkLabelDisabled(record, scope, label);
	await checkLabelField(record, scope, label, tokens);
};

const atomJourney = (kind, probe, check) => async (page, record) => {
	const response = await page.goto(`${BASE}review/${kind}`, { waitUntil: 'networkidle' });
	record('http 200', response?.status() === 200, `got ${response?.status()}`);

	const section = page.locator(`#${kind}`);
	await section.locator(probe).first().waitFor({ state: 'visible', timeout: 10_000 });
	record(`${kind} section`, (await section.count()) === 1, 'one section');
	await settle();

	for (const scheme of ['light', 'dark']) {
		const scope = section.locator(`[data-scheme="${scheme}"]`);
		await check(record, scope, `${kind} ${scheme}`);
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
	},
	input: fieldJourney('input'),
	'native-select': fieldJourney('native-select'),
	textarea: fieldJourney('textarea'),
	kbd: atomJourney('kbd', '[data-slot="kbd"]', checkKbd),
	separator: atomJourney('separator', '[data-slot="separator"]', checkSeparator),
	skeleton: atomJourney('skeleton', '[data-slot="skeleton"]', checkSkeleton),
	spinner: atomJourney('spinner', '[role="status"]', checkSpinner),
	marker: atomJourney('marker', '[data-slot="marker"]', checkMarker),
	progress: atomJourney('progress', '[role="progressbar"]', checkProgress),
	slider: atomJourney('slider', '[data-slot="slider"]', checkSlider),
	'scroll-area': atomJourney('scroll-area', '[data-slot="scroll-area"]', checkScrollArea),
	label: atomJourney('label', '[data-slot="label"]', checkLabel)
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
