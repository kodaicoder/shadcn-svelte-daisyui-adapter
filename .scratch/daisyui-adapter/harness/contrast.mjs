// The AA matrix: painted colours from render.json, plus the published reference rows from the theme.
//
// Usage: node contrast.mjs <render.json> <theme.css> <evidence dir>

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { PAIRS } from '../../../packages/daisyui-adapter/targets.mjs';
import { TOKEN_FALLBACKS } from '../../../packages/daisyui-adapter/dist/map.mjs';
import { parseTheme } from '../../../packages/daisyui-adapter/dist/index.mjs';
import {
	BORDER_THRESHOLD,
	SELECTORS,
	TEXT_THRESHOLD,
	TONES,
	contrastRatio,
	mixOklch,
	oklchToSrgb,
	over,
	parseOklch,
	parseRgb
} from '../../../packages/daisyui-adapter/dist/contrast.mjs';

// The published 0.01 values stay on unrounded oklchToSrgb, so the reference rows pin the theme's
// own numbers rather than the bytes a painted snapshot rounds them to. `destructive` has no fixed
// fallback: its fill and content come from the theme, so that row is read and not pinned.
const REFERENCE = {
	light: {
		text: { success: 7.95, warning: 6.62, info: 7.89 },
		fill: { success: 2.41, warning: 1.86, info: 2.13 }
	},
	dark: {
		text: { success: 11.28, warning: 13.0, info: 11.88 }
	}
};

const [renderPath, themePath, evidenceDir] = process.argv.slice(2);
if (!renderPath || !themePath || !evidenceDir) {
	throw new Error('usage: node contrast.mjs <render.json> <theme.css> <evidence dir>');
}
const EVIDENCE = resolve(evidenceDir);
const SCHEMES = ['light', 'dark'];
const round = (value) => Math.round(value * 100) / 100;
const rgbCss = (colour) =>
	`rgb(${Math.round(colour.r)}, ${Math.round(colour.g)}, ${Math.round(colour.b)})`;

const render = JSON.parse(readFileSync(renderPath, 'utf8'));
const theme = parseTheme(readFileSync(themePath, 'utf8'), themePath);
const failures = [];
const findings = [];

const composite = (colour, page) => (colour.a < 255 ? over(colour, page) : colour);

const live = {};
for (const scheme of SCHEMES) {
	const snapshot = render[scheme];
	const elements = new Map(snapshot.elements.map((element) => [element.selector, element]));
	const page = parseRgb(snapshot.backgroundRgb);
	const uncovered = SELECTORS.split(',').filter((selector) => {
		const element = elements.get(selector);
		return !element || element.found === false;
	});
	for (const selector of uncovered) {
		failures.push(`${scheme}: ${selector} was never rendered`);
	}
	if (uncovered.length > 0) continue;

	const pairs = PAIRS.map((pair) => {
		const element = elements.get(`[data-pair="${pair.id}"]`);
		const foreground = parseRgb(element.colorRgb);
		const background = composite(parseRgb(element.backgroundRgb), page);
		const ratio = contrastRatio(foreground, background);
		const pass = ratio >= pair.threshold;
		if (!pass) {
			failures.push(`${scheme}: pair ${pair.id} is ${round(ratio)}:1, below ${pair.threshold}:1`);
		}
		return {
			id: pair.id,
			name: pair.name,
			foreground: element.colorRgb,
			background: element.backgroundRgb,
			compositedBackground: rgbCss(background),
			ratio: round(ratio),
			threshold: pair.threshold,
			pass
		};
	});

	const tones = TONES.map((tone) => {
		const textElement = elements.get(`[data-tone="${tone}"][data-part="text"]`);
		const textForeground = parseRgb(textElement.colorRgb);
		const textBackground = composite(parseRgb(textElement.backgroundRgb), page);
		const textRatio = contrastRatio(textForeground, textBackground);
		const textPass = textRatio >= TEXT_THRESHOLD;
		if (!textPass) {
			failures.push(`${scheme}: ${tone} text is ${round(textRatio)}:1, below ${TEXT_THRESHOLD}:1`);
		}

		const filledElement = elements.get(`[data-tone="${tone}"][data-part="filled"]`);
		const fill = composite(parseRgb(filledElement.backgroundRgb), page);
		const fillVsPage = contrastRatio(fill, page);
		const textOnFill = contrastRatio(parseRgb(filledElement.colorRgb), fill);
		if (textOnFill < TEXT_THRESHOLD) {
			findings.push(
				`${scheme}: ${tone} filled text is ${round(textOnFill)}:1 against its fill; the theme's own ${tone}-content sets this pair`
			);
		}
		return {
			tone,
			text: {
				foreground: textElement.colorRgb,
				background: textElement.backgroundRgb,
				ratio: round(textRatio),
				threshold: TEXT_THRESHOLD,
				pass: textPass
			},
			filled: {
				fill: filledElement.backgroundRgb,
				fillVsPage: round(fillVsPage),
				fillKnownLimit: fillVsPage < BORDER_THRESHOLD,
				textOnFill: round(textOnFill)
			}
		};
	});

	live[scheme] = { page: rgbCss(page), pairs, tones };
}

const reference = {};
for (const scheme of SCHEMES) {
	const schemeTheme = theme[scheme];
	const page = oklchToSrgb(parseOklch(schemeTheme['--color-base-100']));
	const base = parseOklch(schemeTheme['--color-base-content']);
	const fills = {
		success: TOKEN_FALLBACKS.success,
		warning: TOKEN_FALLBACKS.warning,
		info: TOKEN_FALLBACKS.info,
		destructive: schemeTheme['--color-error']
	};
	const foregrounds = {
		success: TOKEN_FALLBACKS['success-foreground'],
		warning: TOKEN_FALLBACKS['warning-foreground'],
		info: TOKEN_FALLBACKS['info-foreground'],
		destructive: schemeTheme['--color-error-content']
	};
	reference[scheme] = {};
	for (const tone of TONES) {
		const fill = parseOklch(fills[tone]);
		const textTone = mixOklch(fill, 0.4, base, 0.6);
		const textVsPage = contrastRatio(oklchToSrgb(textTone), page);
		const fillVsPage = contrastRatio(oklchToSrgb(fill), page);
		const textOnFill = contrastRatio(oklchToSrgb(parseOklch(foregrounds[tone])), oklchToSrgb(fill));
		const row = {
			tone,
			textVsPage: round(textVsPage),
			fillVsPage: round(fillVsPage),
			fillKnownLimit: fillVsPage < BORDER_THRESHOLD,
			textOnFill: round(textOnFill),
			textPass: textVsPage >= TEXT_THRESHOLD,
			textOnFillPass: textOnFill >= TEXT_THRESHOLD
		};
		if (!row.textPass) {
			failures.push(
				`${scheme} reference: ${tone} text is ${row.textVsPage}:1, below ${TEXT_THRESHOLD}:1`
			);
		}
		if (!row.textOnFillPass) {
			failures.push(
				`${scheme} reference: ${tone} text on fill is ${row.textOnFill}:1, below ${TEXT_THRESHOLD}:1`
			);
		}
		for (const [key, published] of Object.entries(REFERENCE[scheme].text ?? {})) {
			if (key !== tone) continue;
			if (Math.abs(textVsPage - published) > 0.01) {
				failures.push(
					`${scheme} reference: ${tone} text is ${row.textVsPage}, published ${published}`
				);
			}
		}
		for (const [key, published] of Object.entries(REFERENCE[scheme].fill ?? {})) {
			if (key !== tone) continue;
			if (Math.abs(fillVsPage - published) > 0.01) {
				failures.push(
					`${scheme} reference: ${tone} fill is ${row.fillVsPage}, published ${published}`
				);
			}
		}
		reference[scheme][tone] = row;
	}
}

const ok = failures.length === 0;
const matrix = {
	ok,
	source: { render: resolve(renderPath), theme: resolve(themePath) },
	schemes: live,
	reference,
	findings,
	failures
};
writeFileSync(join(EVIDENCE, 'contrast.json'), `${JSON.stringify(matrix, null, 2)}\n`);

const pairTable = (scheme) =>
	[
		`### ${scheme} repaired pairs`,
		'',
		'| pair | foreground | background | ratio | threshold | pass |',
		'| --- | --- | --- | --- | --- | --- |',
		...live[scheme].pairs.map(
			(row) =>
				`| ${row.name} | ${row.foreground} | ${row.compositedBackground} | ${row.ratio} | ${row.threshold} | ${row.pass ? 'yes' : 'NO'} |`
		)
	].join('\n');

const toneTable = (scheme) =>
	[
		`### ${scheme} tones`,
		'',
		'| tone | text | text vs page | fill | fill vs page | known limit | text on fill | pass |',
		'| --- | --- | --- | --- | --- | --- | --- | --- |',
		...live[scheme].tones.map(
			(row) =>
				`| ${row.tone} | ${row.text.foreground} | ${row.text.ratio} | ${row.filled.fill} | ${row.filled.fillVsPage} | ${row.filled.fillKnownLimit ? 'yes' : 'no'} | ${row.filled.textOnFill} | ${row.text.pass ? 'yes' : 'NO'} |`
		)
	].join('\n');

const referenceTable = [
	'| scheme | tone | text vs page | fill vs page | known limit | text on fill |',
	'| --- | --- | --- | --- | --- | --- |',
	...SCHEMES.flatMap((scheme) =>
		TONES.map(
			(tone) =>
				`| ${scheme} | ${tone} | ${reference[scheme][tone].textVsPage} | ${reference[scheme][tone].fillVsPage} | ${reference[scheme][tone].fillKnownLimit ? 'yes' : 'no'} | ${reference[scheme][tone].textOnFill} |`
		)
	)
].join('\n');

writeFileSync(
	join(EVIDENCE, 'contrast.md'),
	`# AA matrix

Painted from \`render.json\` (${resolve(renderPath)}), reference rows from \`parseTheme\` (${resolve(themePath)}).

${SCHEMES.map((scheme) => `${pairTable(scheme)}\n\n${toneTable(scheme)}`).join('\n\n')}

## Reference rows

${referenceTable}

## Known limit

A filled status variant whose fill measures below 3:1 against the page is a known limit. The filled variants carry no border; the tone is still held at 4.5:1 as text on the page for the outline, ghost and link presentations.

## Findings

${findings.length === 0 ? 'None.' : findings.map((finding) => `- ${finding}`).join('\n')}

## Failures

${failures.length === 0 ? 'None.' : failures.map((failure) => `- ${failure}`).join('\n')}
`
);

console.log(JSON.stringify({ ok, findings, failures }, null, 2));
process.exitCode = ok ? 0 : 1;
