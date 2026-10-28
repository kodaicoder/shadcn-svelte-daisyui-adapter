// Property check for src/lib/hooks/use-highlighted-code.svelte.ts
//
// Property (P1): for every code prefix and every language switch, the rendered lines
// concatenate back to the source text exactly, and there is one line per source line.
//
// Harm if broken: a code block shows wrong, missing, duplicated, or shifted code. Silent,
// because it renders as plausible text rather than an error.
import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import type { HighlightedLine } from '#lib/highlighter.js';
import { createDoc, mount, type View } from './harness.svelte.js';

const DOCS = [
	{
		name: 'typescript',
		lang: 'typescript',
		text: 'const a: number = 1;\nfunction b(x: string) {\n  return x + a;\n}\n'
	},
	{
		name: 'bash',
		lang: 'bash',
		text: '#!/bin/sh\nset -euo pipefail\nfor f in *.ts; do\n  echo "$f"\ndone\n'
	},
	{
		name: 'json',
		lang: 'json',
		text: '{\n  "name": "new-project",\n  "workspaces": [],\n  "n": 1.5\n}\n'
	},
	{
		name: 'python',
		lang: 'python',
		text: 'def f(x):\n    if x is None:\n        return 0\n    return x + 1\n'
	},
	{
		name: 'diff',
		lang: 'diff',
		text: '--- a/x\n+++ b/x\n@@ -1 +1 @@\n-old line\n+new line\n'
	}
] as const;

const EDGE_INPUTS = ['', 'a', 'a\n', 'a\n\n', '\n', '\n\n', '   ', 'a  \n', 'a\n ', 'a\r\nb'];

function lineText(line: HighlightedLine): string {
	if (typeof line === 'string') return line;
	if (!Array.isArray(line)) return '<not a line>';
	return line.map((token) => token.content).join('');
}

function actualLines(view: View): string[] {
	const lines: HighlightedLine[] = view.current;
	const texts = lines.map(lineText);
	// A missing line must fail the comparison, not be silently skipped.
	return texts.includes('<not a line>') ? [...texts, '<undefined line>'] : texts;
}

// The hook strips at most one trailing newline before splitting, so the expectation does too.
function expectedLines(code: string): string[] {
	const stripped = code.endsWith('\n') ? code.slice(0, -1) : code;
	return stripped.split('\n');
}

function assertIntegrity(view: View, code: string, label: string) {
	const actual = actualLines(view);
	const expected = expectedLines(code);

	expect(actual.length, `${label}: line count`).toBe(expected.length);

	for (let index = 0; index < expected.length; index += 1) {
		expect(actual[index], `${label}: line ${index + 1} content`).toBe(expected[index]);
	}

	// Stronger statement, stated once: the whole document round-trips.
	expect(actual.join('\n'), `${label}: whole document`).toBe(expected.join('\n'));
}

async function settled(view: View, timeoutMs = 5000): Promise<void> {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		flushSync();
		if (view.current.some((line) => Array.isArray(line))) return;
		await new Promise((resolve) => setTimeout(resolve, 20));
	}
	throw new Error(`highlighter did not load within ${timeoutMs}ms`);
}

describe('useHighlightedCode line integrity (P1)', () => {
	it('preserves every prefix of every document', async () => {
		for (const doc of DOCS) {
			const state = createDoc();
			const view = mount(state);

			try {
				state.setLang(doc.lang);
				state.setCode(doc.text);
				await settled(view);

				for (let length = 0; length <= doc.text.length; length += 1) {
					const prefix = doc.text.slice(0, length);
					state.setCode(prefix);
					flushSync();
					assertIntegrity(view, prefix, `${doc.name} prefix ${length}`);
				}
			} finally {
				view.destroy();
			}
		}
	});

	it('preserves empty, trailing-newline and whitespace-only inputs', async () => {
		const languages = ['typescript', 'bash', 'json'];

		for (const lang of languages) {
			const state = createDoc();
			const view = mount(state);

			try {
				state.setLang(lang);
				state.setCode('x');
				await settled(view);

				for (const input of EDGE_INPUTS) {
					state.setCode(input);
					flushSync();
					assertIntegrity(view, input, `${lang} input ${JSON.stringify(input)}`);
				}
			} finally {
				view.destroy();
			}
		}
	});

	it('preserves integrity across language switches, including an unsupported one', async () => {
		const text = DOCS[0].text;
		const state = createDoc();
		const view = mount(state);

		try {
			const sequence = ['typescript', 'bash', 'not-a-real-language', 'json', 'typescript'];

			for (const lang of sequence) {
				state.setLang(lang);
				state.setCode(text);
				flushSync();
				// Read straight away, while the new language is still loading.
				assertIntegrity(view, text, `${lang} immediately after switch`);

				if (lang !== 'not-a-real-language') {
					await settled(view);
					assertIntegrity(view, text, `${lang} after load`);
				}
			}
		} finally {
			view.destroy();
		}
	});

	it('keeps the document intact while it streams in line by line', async () => {
		const text = DOCS[0].text;
		const lines = text.split('\n');
		const state = createDoc();
		const view = mount(state);

		try {
			state.setLang('typescript');
			state.setCode(lines[0]);
			await settled(view);

			let built = lines[0];
			for (const line of lines.slice(1)) {
				built += `\n${line}`;
				state.setCode(built);
				flushSync();
				assertIntegrity(view, built, `stream after ${JSON.stringify(line)}`);
			}
		} finally {
			view.destroy();
		}
	});
});
