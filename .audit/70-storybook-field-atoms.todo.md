Phase: implementation

# Ticket 70: Storybook documents the field atoms

Ticket: `.scratch/daisyui-adapter/issues/70-storybook-field-atoms.md`
Session: ses_e3124f1b1ffenHWalUU6efubte
Branch: fix/nutchapon/ai/contrast-warning
Base: 448fdb4

## Blast radius

state: unbuilt (no `graphify-out/graph.json`, no manifest)
seeds: n/a, graph unavailable
anchors:
`src/lib/components/input-fixed/input.stories.svelte` <- new
`src/lib/components/textarea-fixed/textarea.stories.svelte` <- new
`src/lib/components/native-select-fixed/native-select.stories.svelte` <- new
`src/lib/components/label-fixed/label.stories.svelte` <- new
`.scratch/daisyui-adapter/issues/70-storybook-field-atoms.md` <- corrected at close
`.opencode/skills/verify/features/storybook.md` <- names fifteen story files today
unlisted:
`src/lib/components/{input,textarea,native-select}-fixed/*.svelte` <- each owns its `FieldVariant` in the module script and does not re-export it from `index.ts`
`src/lib/components/label-fixed/label.svelte` <- bits-ui `Label.Root`; `for` rides rest props
`src/routes/review/label/+page.svelte` <- the working peer, group and wrapping markup from ticket 66
`vite.config.ts` <- the `storybook` vitest project runs every new story through the a11y error gate
`.storybook/preview.ts` <- a11y error mode with `color-contrast` off; untouched
`packages/daisyui-adapter/test/drift.mjs` <- the fixed-copy walk skips `*.stories.svelte`
fallback: direct reads of the four copies, four entry points, the switch, badge and button stories, `story-args.ts`, `prove-69.mjs`, the review label page and the 66, 60, 61 and 73 tickets

## Playbook: Feature

1. `how` over the affected subsystem.
   skip: read directly. The four shipped copies, their entry points, the story precedents from 67 to 69, the proof script and the ticket 66 review page settle every behavior the stories touch. No unknown is left.
2. `architect` for parallel design exploration.
   skip: no open design. Ticket 67 fixes the story shape, ticket 68 the tone-table keying, ticket 69 the state and focus shape, and the operator's brief fixes the per-component matrix. The open points were measurements, not competing designs.
3. Write the throughput checkpoint as four todo items.
   - **Blocking first steps.** The four files must type-check and pass the storybook vitest project before the live proof means anything, and the dev server must be stopped before that project runs, because both hold `node_modules/.cache/storybook`.
   - **Independent workstreams.** The four story files are disjoint paths and could fan out; the proof script is independent of them except for the titles it reads.
   - **Shared mutable state.** One writer on the four paths. The Storybook cache, port 6007 and the `.verify` watch are shared, so the servers serialize and the proof writes to OS temp until the end.
   - **Smallest safe decomposition.** One delegate writes all four, because they restate one tone table shape and one review pass. Four delegates would duplicate the context and race the shared cache.
4. Delegate code-writing to a subagent with a specific scope.
   Done: one `poteto-agent` on `opencode-go/deepseek-v4.1-flash#high` wrote the four files to the brief's story matrix; no other file was in scope.
5. Verify on the matching surface.
6. Rebase into small, ordered commits.
   skip: one commit, one ticket unit. The ticket pipeline closes a ticket with a single commit and an annotated tag.
7. `interrogate` if the design is contested.
   skip: not contested. Tickets 67 to 69 prove the shape and the ticket names every axis.
8. Run **Opening a PR**.
   skip: the ticket pipeline closes a ticket with a commit and an annotated tag, not a PR.

## Gate record

- Spec gate: passed, `.scratch/daisyui-adapter/spec.md` holds `Status: ready-for-agent`.
- Ticket gate: passed, ticket 70 carries `Status: ready-for-agent` and `Labels: docs, storybook, atoms`.
- Claim: `ses_e3124f1b1ffenHWalUU6efubte` appended on 2026-11-12.
- Blocked by 67: resolved, `Closeout: 6d32aea`. Tickets 68 and 69 also resolved at `3481da6` and `b7c3e57`.
- Critical-path review loop: skip, docs-only diff in `storybook`, no auth, payments, migration, concurrency, public API or schema.

## Measured facts before writing

- Token scale from `src/routes/layout.css`: `--text-sm` 12px, `--text-base` 14px, `--text-lg` 16px.
- Input and native-select height is `calc(token * 2)`, so 24, 28 and 32 px. Textarea is `min-h-[calc(token * 4)]`, so 48, 56 and 64 px, with `field-sizing-content` and no fixed height.
- `native-select` has no `readonly` attribute, so readonly covers input and textarea only.
- `label` has no tone or size axis. Its peer cases key on `data-slot` = `checkbox`, `radio-group-item` and `switch`, and its disabled cases run through `peer-disabled`, `peer-has-[:disabled]`, `group-data-[disabled=true]` and `has-[:disabled]`.
- The file branch of `input` carries `file:h-6` and `data-[size=*]:file:text-*`, so its button text is 10, 12 and 14 px.

## Decisions

- Story location follows the component, as tickets 68 and 69 did: one `*.stories.svelte` beside each `*-fixed` copy. Nothing goes under `ui`, because the drift walk reads every `.svelte` there for text rungs.
- Tone tables key on `FieldVariant` imported from each `.svelte` module script, because no field entry point re-exports it and the guardrail forbids editing the entry points. A tone added to a copy fails `pnpm check` until the docs cover it.
- `label` has no tone table. The tone axis is three components, not four.
- `native-select` has no readonly story. A native select has no readonly attribute, so the state would be fake.
- `input` gets a `File` story, because the shipped copy carries a separate file branch with its own button sizing.
- `textarea` gets a `MinHeight` story: one empty field sitting on its minimum and one with content proving the field grows. `Sizes` shows the three minimums.
- The focus stories carry no mount-focus attachment. Script focus is the `.focus()` path the ticket distrusts; the proof resets to the document and presses Tab.
- The `Disabled` label story covers all four mechanisms: peer-disabled for input and textarea, peer-has for native-select, the group attribute, and the wrapping `has-[:disabled]` case.

## Todo

- [x] one story file per field component, autodocs and a Controls-driven Playground
- [x] every story imports the shipped copy
- [x] seven tones on input, textarea and native-select, keyed on `FieldVariant`
- [x] all three sizes on the three form fields, textarea showing minimum height
- [x] idle, focused, invalid, disabled and readonly where each component supports it
- [x] `input` file branch story
- [x] `label` association, wrapping, three peer cases and the disabled cases
- [x] `pnpm check` clean
- [x] `pnpm exec vitest --run --project storybook` clean and above 61 tests
- [x] `pnpm test:adapter` still clean
- [x] live proof in both schemes: no console error, no structural axe violation, every tone, height, size, state, ring and label case
- [x] static build lists all four titles with a docs entry and a Playground
- [ ] ticket 70 corrected and closed with Session IDs, Lesson and Check
- [x] verify surface doc updated

## Verification

- `pnpm check` on the final tree: `svelte-check found 0 errors and 0 warnings`.
- `pnpm exec prettier --check` on the four files: `All matched files use Prettier code style!`.
- `pnpm exec eslint` on the four files: exit 0, no findings.
- `pnpm test:adapter`: `all drift checks passed`.
- `pnpm exec vitest --run --project storybook`: `Test Files 19 passed (19)` and `Tests 83 passed (83)`, up from ticket 69's 61. The four files add 22 stories.
- `pnpm build-storybook -o <temp>/storybook-static-70 --quiet`: `Storybook build completed successfully`, exit 0. `index.json` is 30447 bytes and lists each title with one docs entry and its stories: Input 6, Textarea 6, NativeSelect 5, Label 5.
- Live proof on `pnpm storybook --port 6007 --ci`, script `.verify/prove-70.mjs`, evidence `.verify/evidence/2026-11-12T08-57-08-926Z-storybook-field-atoms/`:
  - `result.json` records 223 checks, 0 failures, `passed: true`.
  - Every story in light and dark: no console error, no structural axe violation, and the iframe `<html>` carries `.dark` only in dark.
  - Tones: seven distinct tone borders per field component in each scheme, read from `border-top-color`.
  - Sizes: input and native-select heights 24, 28 and 32; textarea minimums 48, 56 and 64 with every rendered height at or above its own minimum; text 12, 14 and 16 on all three. `MinHeight` reads 56 for the empty field and 98 for the four-line one.
  - File: three fields at 24, 28 and 32, and the `::file-selector-button` text at 10, 12 and 14.
  - States: idle carries no state attribute; invalid carries `aria-invalid`; disabled is `not-allowed` with `pointer-events: auto` and dims to 0.5, through the wrapper on native-select; readonly is `cursor: default` on the `bg-muted/50` surface against the idle `bg-input/20`.
  - Label: `label.control` resolves for the three `for` associations and for the wrapped input; the three peer labels compute 14px normal-case; the four sibling and group labels compute `not-allowed` at 0.5; the wrapping label computes `not-allowed` and stays at opacity 1, which matches the shipped copy, since it carries no `has-[:disabled]:opacity-*` rule.
  - Focus: three sequences of seven real Tab keypresses. Every ring is 3px at 0.3 alpha, the seven are distinct, and each ring's sRGB bytes match its tone variable. The ring uses `--primary`, `--secondary`, `--success`, `--warning`, `--info`, `--destructive` and `--blackwhite`; `success` and `info` borders use the `-text` token instead, so the proof matches the ring to the tone, not to the border.
  - The theme toolbar reads `light theme`, a click moves it to `dark theme`, and the iframe gains `.dark`.
  - The page background moves from `oklch(0.985 0 264.542)` to `oklch(0.18 0.041 260.031)`.

## Runtime notes

- The first `pnpm exec vitest --run --project storybook` invocation through a PowerShell pipeline (`2>&1 | Select-Object -Last 25`) produced no output and had to be killed at 900s with no vitest processes left behind. The same command redirected to a log passed with 19 files and 83 tests. The stall was the pipeline, not vitest; long runs now redirect to a log.
- `waitUntil: 'networkidle'` timed out on the first iframe load, because Vite transforms the story graph on demand. The proof opens with `domcontentloaded`, waits for a field selector, and warms the first story once.
- The dev server and the vitest project still share `node_modules/.cache/storybook`. The project ran with the server stopped, and the server was stopped again before the static build.
- The proof wrote its screenshots and `result.json` to OS temp and copied them into `.verify/evidence/` at the end, so the Storybook watcher never saw the output directory change.

## Comments

The four story files carry no comments. `rg` over them returns nothing and the diff adds no prose to describe. `no-comments` was not run because there is nothing for it to act on.

## Findings outside this ticket

None. The `success` and `info` ring and border use different tokens (`--success` against `--success-text`), which is the intended contrast split, not a defect.

