Phase: implementation

# Ticket 78: the slider thumb has no accessible name

Ticket: `.scratch/daisyui-adapter/issues/78-slider-thumb-accessible-name.md`
Session: ses_e13063380ffeUAisnOYAryNfdG
Branch: fix/nutchapon/ai/contrast-warning

## Blast radius

state: unbuilt (no `graphify-out/graph.json`; not building one for a two-table change)
seeds: n/a, graph unavailable
anchors:
  `packages/daisyui-adapter/targets/atom-tones.mjs` <- the slider prop, type, and thumb rows
  `packages/daisyui-adapter/targets.mjs` <- table registration and site order per file
  `src/lib/components/ui/slider/slider.svelte` <- the pin every site reads, never edited
  `src/lib/components/slider-fixed/slider.svelte` <- the regenerated copy
  `src/lib/components/slider-fixed/slider.stories.svelte` <- `labelThumbs` workaround
unlisted:
  `packages/daisyui-adapter/targets/rings.mjs` <- `slider-focus-ring-width`, a later slider site inside the thumb class
  `packages/daisyui-adapter/component-fix.mjs` <- `stateOf`, `survivingFixed`, and the per-file walk; no edit expected
  `packages/daisyui-adapter/test/drift.mjs` <- copy check, site counts, `every site still finds its stock in its turn`
  `packages/daisyui-adapter/cli/init.mjs` <- `fix --strict` reads the state counts
  `src/lib/components/slider-fixed/index.js` <- re-export surface the stories import
  `src/routes/review/slider/+page.svelte` <- second consumer of the fixed copy, type-checked by svelte-check
  `.storybook/preview.ts` <- `a11y.test = 'error'`, only `color-contrast` disabled
  `vite.config.ts` <- the `storybook` vitest project that runs the axe gate
fallback: rg `slider-atom`, `thumbLabels`; read `component-fix.mjs:102-133`, `targets/rings.mjs:8`

## Playbook: Bug fix

1. Reproduce it yourself on the matching surface via the driver skill (Non-negotiables), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
   The matching surface is the storybook a11y gate: `pnpm vitest --run --project storybook`. Removing the `labelThumbs` attachments reproduces `aria-input-field-name` on `Components/Slider`.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with `how` over the affected subsystem and the **why** skill for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Drive a long or stubborn hunt with Claude Code's `loop` skill. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
   `how`: not routed, the subsystem is one component's props and one table's rows.
   Hypotheses: the tag renders no `aria-label` (read from the pin), the fixer strips caller props (root-only `...restProps`), or bits-ui overrides a passed name (`mergeProps(restProps, thumbState.props)` with no `aria-label` in `thumbState.props`).
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent using your configured bug-fix model (default in poteto-mode's Models section) with a specific scope.
   No function boundary crosses. A `thumbLabels` prop read per `thumb.index`, plus the manifest rows that write it, keeps the copy generated.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
   See Verification.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test would be expensive, integration-heavy, or unclear.
   Commit 1 deletes the story workaround, so the axe gate fails on it. Commit 2 lands the fix.
6. Run **Opening a PR**.
   skip: the ticket pipeline closes with a commit and a tag, no PR.

## Prop shape

`thumbLabels: string[]`, keyed by `thumb.index`, required. An array is the smallest shape that names both
ends of a range, and it is the only one the existing `thumbItems` loop can read without a new indirection.
The prop is required and has no fallback name: the first cut defaulted to `'Value'`, and a `type="multiple"`
slider that passed nothing got that name twice, which is the same green-gate pattern the ticket exists to
remove. The compiler now rejects a call site with no labels, and the review route names its four sliders.

## Review

One round, one reviewer, on `55a4e89..24b9b8f`.

- MAJOR, accepted: the optional prop plus the `'Value'` fallback gave an unlabeled range two identical
  names, and `src/routes/review/slider/+page.svelte:20` was that caller. `thumbLabels` is required, the
  fallback is gone, and the route labels all four sliders (`24b9b8f..` follow-up commit).
- MINOR, accepted with the label kept: the tone stories now name each slider `Volume` instead of the tone
  word. `success` is a class name, not a slider name, and the tone is already the visible caption.
- MINOR, declined: the generated props line exceeds `printWidth`. The pin's props line is one line, the
  `variant` insert already crossed the width at HEAD, and the file is not prettier-clean at HEAD; splitting
  this one would make the generated copy unlike the other four `variantTypeSite` copies.
- MINOR, no action: the sites live in `atom-tones.mjs`, which already owns the slider's prop and thumb rows.

## Ticket corrections applied

1. Checkbox 2 reworded: the pin is stock and must stay unfixed; the fixer's output carries the name, and one `fix` reproduces `slider-fixed` byte for byte.
2. The axe note drops `region`; this repo disables only `color-contrast`.
3. New sites live in `targets/atom-tones.mjs`, the table that already owns the slider's variant prop, type, and thumb class, so the same file's sites stay in one ordered group and no eighth table exists for one component.

## Verification

- Before the fix, after deleting the story attachment: `Tests 5 failed (5)`, each story on
  `aria-input-field-name`, e.g. `× |storybook (chromium)| src/lib/components/slider-fixed/slider.stories.svelte > Playground`.
- After the fix: `Test Files 1 passed (1)`, `Tests 5 passed (5)`; the full project reports
  `Test Files 19 passed (19)`, `Tests 83 passed (83)`, and the log holds no `aria-input-field-name`.
- DOM names, throwaway browser spec (deleted): `Minimum` and `Maximum` both resolve by role for a
  two-thumb slider.
- Type enforcement: with one `thumbLabels` removed from the review route, `svelte-check` reports
  `Property 'thumbLabels' is missing ... but required in type '{ variant?: ...; thumbLabels: string[]; }'`;
  restored, it reports 0 errors and 0 warnings.
- `pnpm test:adapter`: `all drift checks passed`, including
  `every fixed copy is what the manifest produces from the pin` and
  `a second fix on the fixed temp project writes nothing :: 0 stock, 318 fixed, 0 written`.
- Temp project from the pin, CLI: `fix: 296 stock, 22 fixed, 0 customized, 0 missing`, then
  `fix --strict` -> `fix: 0 stock, 318 fixed, 0 customized, 0 missing; check only, nothing written`,
  exit 0, then a third `fix` -> `0 stock, 318 fixed, 0 customized, 0 missing`.
- `pnpm check:stories`: `19 story files, 83 stories, 3 rules, 13 fixtures`, no findings.
- Prettier: `slider.stories.svelte` clean. The new lines in `atom-tones.mjs` are what prettier emits;
  the file's remaining complaints are on HEAD lines. `slider-fixed/slider.svelte` fails like every
  other `*-fixed` copy does at HEAD, and the new `aria-label` line is not one prettier would change.
  The review route already fails at HEAD on two `data-oracle` div class orders this ticket leaves alone.

## Todo

- [x] reproduce `aria-input-field-name` with the story workaround removed
- [x] choose the prop shape and the table that writes it
- [x] add the manifest sites and regenerate `slider-fixed/slider.svelte`
- [x] story passes `thumbLabels` where it used the attachment
- [x] `pnpm test:adapter`, `pnpm vitest --run --project storybook`, `svelte-check`
- [x] fixed temp copy: `0 customized`, `--strict` exit 0, second `fix` writes nothing
- [x] review round applied
- [ ] commit and tag `daisyui-adapter-78`
