// Drives one feature of the app and keeps the evidence.
//   node scripts/drive.mjs checkbox [--headed]
// Requires a running session: node scripts/session.mjs start
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
const PORT = Number(process.env.VERIFY_PORT) || 5199;
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

const CURSORS_OK = new Set(['text', 'auto', 'default']);
const TRANSPARENT = new Set(['transparent', 'rgba(0, 0, 0, 0)']);

const settle = () => new Promise((resolve) => setTimeout(resolve, 250));

const ringOf = (shadow) =>
	shadow === 'none'
		? ''
		: (shadow
				.split(/,(?![^(]*\))/)
				.map((layer) => layer.trim())
				.find((layer) => /\s[1-9][\d.]*px$/.test(layer)) ?? '');

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
	{ size: 'sm', radius: 'sm', text: '10px', height: '24px', minHeight: '48px' },
	{ size: 'default', radius: 'md', text: '12px', height: '28px', minHeight: '64px' },
	{ size: 'lg', radius: 'lg', text: '14px', height: '32px', minHeight: '80px' }
];

const checkFieldSizes = async (record, scope, label, kind) => {
	for (const entry of FIELD_SIZES) {
		const control = scope.locator(`[data-case="size-${entry.size}"]`);
		const state = await control.evaluate((node) => {
			const style = getComputedStyle(node);
			return {
				text: style.fontSize,
				radius: style.borderTopLeftRadius,
				height: `${Math.round(node.getBoundingClientRect().height)}px`,
				minHeight: style.minHeight,
				dataSize: node.dataset.size
			};
		});
		const probe = await computed(
			scope.locator(`[data-oracle="radius-${entry.radius}"]`),
			'borderTopLeftRadius'
		);
		record(`${label}: ${entry.size} text is ${entry.text}`, state.text === entry.text, state.text);
		const box = kind === 'textarea' ? state.minHeight : state.height;
		const expected = kind === 'textarea' ? entry.minHeight : entry.height;
		record(`${label}: ${entry.size} box is ${expected}`, box === expected, box);
		record(
			`${label}: ${entry.size} radius is ${entry.radius}`,
			state.radius === probe,
			`${state.radius} vs ${probe}`
		);
		record(`${label}: ${entry.size} sets data-size`, state.dataSize === entry.size, state.dataSize);
	}
};

const checkNarrowFieldText = async (page, record, scope, kind) => {
	const viewport = page.viewportSize();
	if (!viewport) return;
	try {
		await page.setViewportSize({ width: 400, height: viewport.height });
		await settle();
		const text = await computed(scope.locator('[data-case="size-default"]'), 'fontSize');
		record(`${kind}: default text stays 12px below md`, text === '12px', text);
	} finally {
		await page.setViewportSize(viewport);
		await settle();
	}
};

const checkTextarea = (record, label, state) => {
	record(`${label}: min height is 64px`, state.minHeight === '64px', state.minHeight);
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
		`${label}: focus keeps the border`,
		state.border === baseState.border,
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
	for (const row of idle) {
		const expected = await computed(
			scope.locator(`[data-tone-border="${row.tone}"]`),
			'borderTopColor'
		);
		if (row.border !== expected) borderMismatch.push(`${row.tone}:${row.border} vs ${expected}`);
	}
	record(
		`${label}: every idle border is its tone`,
		borderMismatch.length === 0,
		borderMismatch.join(', ')
	);

	const rings = [];
	const focusMismatch = [];
	for (const row of idle) {
		const control = scope.locator(`[data-tone="${row.tone}"]`).first();
		await control.focus();
		await settle();
		const state = await fieldState(control);
		rings.push(ringOf(state.shadow));
		if (state.border !== row.border)
			focusMismatch.push(`${row.tone}:${state.border} vs ${row.border}`);
	}
	record(
		`${label}: focus keeps the tone border`,
		focusMismatch.length === 0,
		focusMismatch.join(', ')
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
	record(
		`${label}: invalid ring differs from the focus ring`,
		ring !== focusRing,
		`${ring} vs ${focusRing}`
	);
};

const checkDisabledField = async (record, scope, label) => {
	const disabled = scope.locator('[data-case="disabled"]');
	const state = await fieldState(disabled);
	record(`${label}: disabled stays disabled`, await disabled.isDisabled(), 'disabled');
	record(
		`${label}: disabled does not invite a click`,
		state.pointerEvents !== 'none' && state.cursor === 'not-allowed',
		`${state.pointerEvents} / ${state.cursor}`
	);
	record(`${label}: disabled dims to 50 percent`, state.opacity === '0.5', state.opacity);
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

const checkNativeSelect = async (record, scope, label, base, baseState) => {
	const small = scope.locator('[data-case="size-sm"]');
	const state = await fieldState(small);
	record(
		`${label}: size-sm is 24px against a 28px base`,
		Math.round(state.height) === 24 && Math.round(baseState.height) === 28,
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
};

const checkField = async (record, scope, label, kind) => {
	await checkSchemeHeading(record, scope, label);
	const { base, state } = await checkBaseField(record, scope, label);
	if (kind === 'textarea') checkTextarea(record, label, state);
	else record(`${label}: height is 28px`, Math.round(state.height) === 28, `${state.height}px`);
	await checkFieldSizes(record, scope, label, kind);
	await checkFieldTones(record, scope, label);
	const focusRing = await checkFocusField(record, scope, label, state);
	await checkInvalidField(record, scope, label, focusRing);
	await checkDisabledField(record, scope, label);
	if (kind === 'native-select') {
		await checkNativeSelect(record, scope, label, base, state);
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

	for (const scheme of ['light', 'dark']) {
		const scope = section.locator(`[data-scheme="${scheme}"]`);
		await checkField(record, scope, `${kind} ${scheme}`, kind);
	}
	await checkNarrowFieldText(page, record, section.locator('[data-scheme="light"]'), kind);
};

const checkKbd = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const keys = scope.locator('[data-slot="kbd"]');
	const keyCount = await keys.count();
	record(`${label}: three keys`, keyCount >= 3, `${keyCount}`);

	const base = scope.locator('[data-case="base"]');
	const state = await base.evaluate((node) => ({
		height: node.getBoundingClientRect().height,
		background: getComputedStyle(node).backgroundColor,
		pointerEvents: getComputedStyle(node).pointerEvents
	}));
	const muted = await computed(scope.locator('[data-oracle="muted"]'), 'backgroundColor');
	record(`${label}: key height is 22px`, Math.round(state.height) === 22, `${state.height}px`);
	record(
		`${label}: key takes the muted fill`,
		state.background === muted,
		`${state.background} vs ${muted}`
	);
	record(
		`${label}: key never takes the pointer`,
		state.pointerEvents === 'none',
		state.pointerEvents
	);

	const grouped = await scope.locator('[data-case="group"] [data-slot="kbd"]').count();
	record(`${label}: group holds two keys`, grouped === 2, `${grouped}`);
};

const checkSeparator = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
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
		vertical.orientation === 'vertical' &&
			Math.round(vertical.width) === 1 &&
			vertical.height >= 40,
		`${vertical.orientation} ${vertical.width} x ${vertical.height}`
	);
	record(`${label}: vertical is announced`, vertical.role === 'separator', vertical.role);

	const decorative = await read(scope.locator('[data-case="decorative"]'));
	record(
		`${label}: decorative stays silent`,
		decorative.role !== 'separator' && decorative.ariaHidden === 'true',
		`role ${decorative.role} / aria-hidden ${decorative.ariaHidden}`
	);
};

const checkSkeleton = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
	const count = await scope.locator('[data-slot="skeleton"]').count();
	record(`${label}: two skeletons`, count === 2, `${count}`);

	const block = scope.locator('[data-case="block"]');
	const state = await block.evaluate((node) => {
		const rect = node.getBoundingClientRect();
		return {
			animation: getComputedStyle(node).animationName,
			background: getComputedStyle(node).backgroundColor,
			text: node.textContent.trim(),
			width: rect.width,
			height: rect.height
		};
	});
	const muted = await computed(scope.locator('[data-oracle="muted"]'), 'backgroundColor');
	record(`${label}: skeleton pulses`, state.animation === 'pulse', state.animation);
	record(
		`${label}: skeleton takes the muted fill`,
		state.background === muted,
		`${state.background} vs ${muted}`
	);
	record(`${label}: skeleton carries no text`, state.text === '', state.text || 'empty');
	record(
		`${label}: block measures 32px by 160px`,
		Math.round(state.height) === 32 && Math.round(state.width) === 160,
		`${state.height} x ${state.width}`
	);
};

const checkSpinner = async (record, scope, label) => {
	await checkSchemeHeading(record, scope, label);
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

	const large = await read(scope.locator('[data-case="large"]'));
	record(
		`${label}: large spinner is 24px`,
		Math.round(large.width) === 24 && Math.round(large.height) === 24,
		`${large.width} x ${large.height}`
	);
	const primary = await computed(scope.locator('[data-oracle="primary"]'), 'color');
	record(
		`${label}: large spinner takes the primary paint`,
		large.stroke === primary && large.color === primary,
		`stroke ${large.stroke} / color ${large.color} vs ${primary}`
	);
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
	spinner: atomJourney('spinner', '[role="status"]', checkSpinner)
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
