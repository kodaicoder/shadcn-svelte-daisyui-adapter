Phase: implementation

# Ticket 69: Storybook documents the interactive atoms

Ticket: `.scratch/daisyui-adapter/issues/69-storybook-interactive-atoms.md`
Session: ses_e31a6f71fffewuA5Tw42WyJ3au
Branch: fix/nutchapon/ai/contrast-warning
Base: d4acf65

## Blast radius

state: unbuilt (no `graphify-out/graph.json`, no manifest)
seeds: n/a, graph unavailable
anchors:
`src/lib/components/checkbox-fixed/checkbox.stories.svelte` <- new
`src/lib/components/switch-fixed/switch.stories.svelte` <- new
`src/lib/components/radio-group-fixed/radio-group.stories.svelte` <- new
`src/lib/components/toggle-fixed/toggle.stories.svelte` <- new
`src/lib/components/progress-fixed/progress.stories.svelte` <- new
`src/lib/components/slider-fixed/slider.stories.svelte` <- new
`.scratch/daisyui-adapter/issues/69-storybook-interactive-atoms.md` <- corrected at close
`.opencode/skills/verify/features/storybook.md` <- names nine story files today
unlisted:
`src/lib/components/ui/binary-variant.ts` <- the `BinaryVariant` union five copies consume
`src/lib/components/{progress,slider}-fixed/*.svelte` <- each owns its variant type in the module script; neither re-exports it from `index.ts`
`packages/daisyui-adapter/test/drift.mjs` <- the fixed-copy walk skips `*.stories.svelte`; a story under `ui` would fail `pnpm test:adapter`
`vite.config.ts` <- the `storybook` vitest project runs every new story through the a11y error gate
`.storybook/preview.ts` <- a11y error mode with `color-contrast` off; untouched
fallback: direct reads of the six copies, both story precedents, `preview.ts`, `main.ts`, `vite.config.ts`, `drift.mjs` and `prove-68.mjs`

## Playbook: Feature

1. `how` over the affected subsystem.
   skip: the subsystem was read directly. All six shipped copies, their entry points, the two story precedents, the preview decorator, the vitest project, the drift walk and `prove-68.mjs` were read; no behavior is left unknown.
2. `architect` for parallel design exploration.
   skip: no open design. Tickets 67 and 68 fix the story shape, and the ticket fixes the per-component state matrix. The only open points were facts, measured below, not competing designs.
3. Write the throughput checkpoint as four todo items.
   - **Blocking first steps.** Read the six copies' tone tables and state props, and measure the two facts the design rests on (script focus and `:focus-visible`; whether an unnamed slider thumb trips axe), before any story file is written.
   - **Independent workstreams.** n/a: six new files in one convention. One owner writes them, because a second owner would restate the tone tables and drift.
   - **Shared mutable state.** None among the story files; each is a new path. The delegate holds the only source write until it returns; the ticket file has one writer, after verification.
   - **Smallest safe decomposition.** One owner. Splitting six one-component stories adds a second convention with no gain.
4. Delegate code-writing to a subagent with a specific scope.
   Done: one `poteto-agent` on `opencode-go/deepseek-v4.1-flash#high` wrote all six files to the brief's story matrix; no other file was in scope.
5. Verify on the matching surface.
6. Rebase into small, ordered commits.
   skip: one commit, one ticket unit. The ticket pipeline closes a ticket with a single commit and an annotated tag.
7. `interrogate` if the design is contested.
   skip: not contested. The shape is proven by tickets 67 and 68; the ticket names every axis.
8. Run **Opening a PR**.
   skip: the ticket pipeline closes a ticket with a commit and an annotated tag, not a PR.

## Gate record

- Spec gate: passed, `.scratch/daisyui-adapter/spec.md` holds `Status: ready-for-agent`.
- Ticket gate: passed, ticket 69 carries `Status: ready-for-agent` and `Labels: docs, storybook, atoms`.
- Claim: `ses_e31a6f71fffewuA5Tw42WyJ3au` appended on 2026-11-12.
- Blocked by 67: resolved, `Closeout: 6d32aea`. Ticket 68 also resolved at `3481da6`.
- Critical-path review loop: skip, docs-only diff in `storybook`, no auth, payments, migration, concurrency, public API or schema.

## Measured facts before writing

- Script focus on a fresh Chromium page matches `:focus-visible` and paints the 3px ring at 30 percent alpha. The proof still drives real Tab keystrokes, so the ring is proven from keyboard focus, not from `.focus()`.
- An unnamed `role="slider"` thumb trips `aria-input-field-name` (serious) even with `color-contrast` and `region` off. The shipped slider renders its thumbs without a name, so each slider story supplies one from its wrapper and the gap is tracked.

## Decisions

- Story location follows the component, as ticket 68 did: one `*.stories.svelte` beside each `*-fixed` copy. Nothing goes under `ui`, because the drift walk reads every `.svelte` there for text rungs.
- Tone tables key on the component's own variant type: `BinaryVariant` for checkbox, switch and radio-group; `ToggleVariant` from `toggle-fixed/index.ts`; `ProgressVariant` and `SliderVariant` imported from each `.svelte` module script because neither entry point re-exports them. A tone added to a copy fails `pnpm check` until the docs cover it.
- `toggle` shows three axes, not one: seven pressed tones, seven outline variants, and three sizes. `switch` shows its two sizes. Both axes come from `ToggleVariant` through `Extract` and `Exclude`, so a new tone or outline still fails `pnpm check`.
- `progress` is a display element. It gets values and thickness, and no focus story.
- `slider` supplies each thumb's accessible name from the story wrapper, because the copy forwards no thumb props. The gap is tracked in its own ticket.
- `radio-group`'s `Override` uses three groups, each with the checked item that carries its tone. A radio paints its tone only when checked, so a single group with one selection cannot show a per-item override at all.
- The `Focus` stories carry no mount-focus attachment. Script focus is the `.focus()` path the ticket distrusts, and it steals focus on the docs page. The proof resets to the document and presses Tab, so the ring is painted by keyboard focus alone.
- `toggle`'s `Outline` shows each of the seven outline variants twice, resting and pressed, because the resting border and text tone is half of what `outline` means.
- Story files stay out of `ui`. The drift walk reads every `.svelte` under `ui` for text rungs, so a story there would fail `pnpm test:adapter`.

## Todo

- [x] one story file per interactive atom, autodocs and a Controls-driven Playground
- [x] six stories import the shipped copy, never `ui`
- [x] tone tables typed on each component's own variant type
- [x] checkbox seven tones, plus unchecked, checked, indeterminate, disabled and invalid
- [x] switch seven tones, both sizes, plus unchecked, checked, disabled and invalid
- [x] radio-group seven group tones, plus a per-item override, unchecked, checked, disabled and invalid
- [x] toggle seven pressed tones, seven outline variants, three sizes, plus pressed, unpressed, disabled and invalid
- [x] progress seven tones, five values, and the 2px default against the caller's thicker bar
- [x] slider seven tones, one thumb and two, plus disabled
- [x] focus story on the five focusable controls
- [x] `pnpm check` clean
- [x] `pnpm vitest --run --project storybook` clean
- [x] `pnpm test:adapter` still clean
- [x] live proof in both schemes: no console error, no structural axe violation, every tone, state and measurement above
- [x] static build lists all six titles with a docs entry and a Playground
- [x] ticket 69 corrected and closed with Session IDs, Lesson and Check
- [x] verify surface doc updated

## Verification

- `pnpm check` on the final tree: `svelte-check found 0 errors and 0 warnings`.
- `pnpm test:adapter`: `all drift checks passed`.
- `pnpm exec vitest --run --project storybook`: `Test Files 15 passed (15)` and `Tests 61 passed (61)`. The project runs every story through the a11y error mode, and the six new files add 29 stories to ticket 68's 32.
- `pnpm build-storybook -o .verify/storybook-static-69 --quiet`: `Storybook build completed successfully`. `.verify/storybook-static-69/index.json` is 22674 bytes and lists every title with one docs entry, one `Playground`, and its stories: Checkbox 4, Switch 5, RadioGroup 5, Toggle 6, Progress 4, Slider 5.
- Live proof on `pnpm storybook --port 6007 --ci`, script `.verify/prove-69.mjs`, evidence in `.verify/evidence/2026-11-12T06-36-09-286Z-storybook-interactive-atoms/`:
  - `result.json` records 315 checks, 0 failures, `passed: true`.
  - Every story in light and dark: no console error, no structural axe violation, and the iframe `<html>` carries `.dark` only in dark.
  - Tones: seven distinct painted fills per component in each scheme, read from the checkbox background, switch thumb, radio dot, toggle background, progress indicator and slider thumb.
  - Focus: five sequences of seven real Tab keypresses. Every ring is 3px at 0.3 alpha, the seven are distinct, and each ring's sRGB bytes match its tone's measured fill within 3. Rings are sampled 300ms after Tab because `transition-shadow` and `transition-all` animate the ring for 150ms; at 80ms the spread is still mid-transition and reads as no ring. The stories do not focus a control on mount, so no ring is painted by script.
  - States: checkbox `mixed=1, invalid=1, disabled=2`; switch 5 states and widths 24, 24, 28, 28; toggle 5 states, 14 outline borders at 1px with 7 resting rows transparent and 7 painted, heights 24, 24, 28, 28, 32, 32; radio 4 state groups and 8 items.
  - Override: the plain item's dot equals `var(--secondary)`, the info item equals `var(--info)`, the destructive item equals `var(--destructive)`, in both schemes.
  - Slider: one slider with 1 thumb and one with 2, thumbs named `Volume, Minimum, Maximum`, all three `aria-disabled="true"` in `Disabled`.
  - Progress: values `0, 25, 50, 75, 100`; heights `2px, 8px`.
  - The theme toolbar reads `light theme`, a click moves it to `dark theme`, and the iframe gains `.dark`.
  - The page background moves from `oklch(0.985 0 264.542)` to `oklch(0.18 0.041 260.031)` in every component.

## Runtime notes

- Storybook dev and the `storybook` vitest project share `node_modules/.cache/storybook`. Running both at once made 15 tests fail with `Failed to fetch dynamically imported module ... axe-core.js` and `Cannot read properties of undefined (reading 'call')`, including ticket 68 stories. With the dev server stopped, the same command passed 61 of 61.
- Writing the proof's own output under `.verify/` while Storybook watched the project reloaded the story mid-sequence. The proof now writes evidence to the OS temp directory and copies it into `.verify/evidence/` at the end.

## Comments

`pstack-no-comments` ran `comment-sicko` over the six files, report in `.verify/comment-sicko-69.md`.

- Deleted 0. The one comment, the slider `labelThumbs` explanation, stays: bits-ui renders the thumb unnamed, the copy forwards no thumb props, and ticket 78 makes deleting it the fix's completion criterion.
- `MUST KILL`: none.

## Code review

Base `d4acf65`, two axes in parallel. The spec report is `.verify/review-69-spec.md`; the standards reviewer could not write its file and returned the report inline, which is transcribed here.

Standards, accepted: the stale nine-title line in `storybook.md`, the duplicated toggle Decision, the single-use `outlineLabel`, the duplicated size list in `toggle`, and the missing `aria-label` controls in three Playgrounds.

Standards, rejected with reason: a shared tone table would be a seventh file and would lose the per-component `Record` keyed on each own variant type; the five three-line focus helpers are now deleted with the mount focus; the radio option markup repeats the exact documented state per row; and the `ProgressVariant` and `SliderVariant` imports come from each `.svelte` module script because neither entry point exports them and the guardrail forbids editing the copy.

Spec, accepted: `Outline` now shows each variant resting and pressed, so the resting border and text tone appear, and the mount-focus attachments are gone because script focus is the `.focus()` path the ticket distrusts.

Spec, rejected with reason: the proof's `region` rule is disabled by the addon itself (`DISABLED_RULES = ["region"]` in `@storybook/addon-a11y`), so the proof matches the gate rather than weakening it; `color-contrast` stays off because the adapter's own contrast gate owns that rule.

Spec, deferred: the ticket was still open when the review ran, and the closeout commit closes it.

## Findings outside this ticket

Ticket 78, the slider thumb has no accessible name. Filed because the copy gives a caller no way to name a thumb, and the story workaround documents the gap rather than the contract.

## Closeout

b7c3e57 (tag `daisyui-adapter-69`). Ticket 69 carries the Session IDs, Lesson, Check and Closeout.
