---
name: code-highlighting
description: Formally verify the streaming code highlighter's line integrity, the promise that useHighlightedCode renders exactly the source text for every prefix and every language switch. Use when a change touches use-highlighted-code.svelte.ts, highlighter.ts, or the CodeBlock line components, and you need proof that code blocks cannot silently show wrong, missing, shifted, or duplicated code.
---

# code-highlighting

Formal verification for the one part of this repo where a silent wrong answer is most costly: the
streaming highlighter that feeds `CodeBlock.Line`.

## What is verified

**Property P1.** For any code prefix and any language switch, the lines the hook returns concatenate
back to the source text exactly, one rendered line per source line.

**Harm if it breaks.** A code block shows the wrong code, drops a character, shifts a line, or gains a
phantom blank line. It renders as plausible text, not as an error, so nobody notices until a reader
copies the wrong snippet.

Both statements are the whole contract. Nothing else is claimed.

## Covered code

| File                                                      | What P1 exercises                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/lib/hooks/use-highlighted-code.svelte.ts`            | the `lines` derivation, the `done` cache, the prefix-mismatch reset, the streaming append, the placeholder while a language loads, the language-switch reset |
| `src/lib/highlighter.ts`                                  | `loadHighlighter`, `highlight`, and the identity of the returned highlighter used as the cache key                                                           |
| `src/lib/components/ui/code-block/code-block-line.svelte` | not driven directly; P1 proves the data that component renders                                                                                               |

**Sync commit: none.** This repo has no commit yet (`HEAD` is unborn). Before trusting the table above,
confirm it still matches the code, then record the first commit that contains these files here and
move it forward only after each later change you re-confirm.

## How to run

```sh
pnpm vitest run --config .opencode/skills/code-highlighting/vitest.config.ts
```

About 2 seconds. It needs the repo's Chromium (already installed) because the hook uses `$effect`,
which does not run outside a browser-mode vitest project. The config sets the repo root itself, so no
`vite.config.ts` and no `src/` spec is involved.

## The tool, and why this one

There is no verifier that runs on TypeScript and proves a Svelte `$derived` invariant, so the
question is decided by bounded exhaustion over the real code: every prefix of five documents in five
languages, ten edge inputs, five language switches including an unsupported one, and a line-by-line
stream. Vitest browser mode compiles the real `.svelte.ts` module with runes, and real shiki does the
tokenizing. No hand model of the hook exists, so no model can drift from the code.

## Bounds

Verified:

- every prefix of documents in `typescript`, `bash`, `json`, `python`, `diff`
- `''`, `'a'`, `'a\n'`, `'a\n\n'`, `'\n'`, `'\n\n'`, `'   '`, `'a  \n'`, `'a\n '`, `'a\r\nb'` across `typescript`, `bash`, `json`
- switches `typescript → bash → not-a-real-language → json → typescript`, read both mid-load and after load
- incremental streaming, one line at a time

Not verified:

- token colors, theme correctness, or grammar-state accuracy. P1 is about text, not styling.
- the `ansi` language, which has its own line-splitting branch inside `highlight`
- concurrency: two hooks mounted at once, or a language load racing a code update
- inputs beyond the corpus. A pass bounds the cases above; it is not a proof for arbitrary input.
- `CodeBlock.Line` rendering of a token array. P1 proves the array, not the DOM.

## Reading a result

A failure names the case in the code's own terms, for example
`typescript prefix 22: line count: expected 3 to be 2`. Translate it into a user-visible bug before
reporting: which source line, and what a reader would see.

- **Real bug** when the failing case is within the bounds above and the input is something the app
  can produce (streamed markdown or code, a language switch, an empty document).
- **Model error** when the case sits outside the bounds, or when the expectation itself is wrong. Fix
  the spec or the stated scope, never the expectation, to make a real finding pass. Findings stay
  findings: report the counterexample, do not change product code unless asked.

## Does the check have teeth

Confirmed at the first commit of this skill. Mutation: in `use-highlighted-code.svelte.ts`, change
`code.slice(next.text.length, end - 1)` to `code.slice(next.text.length, end)`, which lets the chunk
swallow its newline. Result: 4 of 4 tests fail, first counterexample `typescript prefix 22: line
count: expected 3 to be 2`. Reverted, hash identical, 4 of 4 pass.

If you change the spec' expectation and everything still passes on an obviously broken variant, the
check has lost its teeth. Re-run the mutation above to confirm.

## When the code changes

1. Read this file's Covered code table and the diff. If the diff touches a covered file or the shape of
   `HighlightedLine`, run the check first, then decide whether the bounds still describe the risk.
2. Update the corpus when a new language is added to `highlighter.ts`'s `languages` map, and update the
   bounds section when you add or remove cases.
3. Re-confirm, then move the sync commit forward. Moving it without re-confirming makes the table a lie.

For keeping this skill honest over time, `/maintain-formal-verification-skill`.
