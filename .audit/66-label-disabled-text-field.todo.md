Phase: implementation

# Ticket 66: A label for a disabled text field keeps the default cursor

Ticket: `.scratch/daisyui-adapter/issues/66-label-disabled-text-field.md`
Spec: `.scratch/daisyui-adapter/spec.md` line 180 (the sibling case is already specified)
Branch: `fix/nutchapon/ai/contrast-warning`
Base: `f3e3e9b`
Playbook: Bug fix
Session: `ses_e34b1b16bffezWkEKw1ZE4yFSb`

## Goal

A label whose `for` points at a disabled `input`, `textarea` or `native-select` shows `not-allowed` at
half opacity, the way it already does for `checkbox`, `switch` and `radio-group`. The problem is that
the label's `peer-disabled:` variants have no `peer` to match, so the rule cannot reach the field.
The smallest change is `peer` on the three field components through the fixer's class strings, plus
the journey assertion that would have caught it.

## Blast radius

state: unbuilt (`graphify-out/graph.json` is missing). fallback: `rg` over `src/routes`,
`src/lib/components`, `packages/daisyui-adapter`, `.opencode/skills/verify`, `.scratch`.
seeds: `peer-disabled`, `label-fixed`, `FIELD_VARIANTS`, `disabled-input-sibling`, `checkLabelDisabled`
anchors:

- `packages/daisyui-adapter/targets/field-variants.mjs` <- owns all three field components and their disabled, readonly and tone classes
- `packages/daisyui-adapter/targets/cursor.mjs` <- `label-disabled-cursor` carries the `peer-disabled:` rules that cannot match
- `packages/daisyui-adapter/test/drift.mjs` <- pins the site count and the byte equality of every `*-fixed` copy
- `src/lib/components/ui/{input,textarea,native-select}` <- the pinned stock the sites read
- `src/lib/components/{input,textarea,native-select}-fixed` <- the generated copies
- `src/routes/review/label/LabelFor.svelte` <- the input precedes the label, so `peer` is a previous sibling
- `.opencode/skills/verify/scripts/drive.mjs` <- `checkLabelDisabled`, the journey to widen

unlisted: `src/routes/layout.css` stays stock (no emitter change), `docs/component-color-usage.md`
records colours only, `src/lib/components/label-fixed/label.svelte` needs no change because its
`peer-disabled:` variants already exist.

## Playbook: Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and the fix to subagents, stay in
the lead. Pick each subagent's reasoning level for the job, per the Subagents section.

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is
a hypothesis, not a fix. It does not ship. When evidence refutes a hypothesis, revert what it
motivated. The smallest change the evidence justifies ships, nothing more.

1. Reproduce it yourself on the matching surface via the driver skill (Non-negotiables), even when a
   debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a
   stated, specific reason the control surface cannot reach the target, and only after driving it as
   far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or
   instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed
   them with `how` over the affected subsystem and the **why** skill for regression history. Each
   pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate.
   When program state is unclear, add instrumentation or logging and read it as the code runs. Don't
   guess. Drive a long or stubborn hunt with Claude Code's `loop` skill. Confirm the surviving
   *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a
   subagent using your configured bug-fix model (default in poteto-mode's Models section) with a
   specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not
   a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill
   for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test
   would be expensive, integration-heavy, or unclear.
   This is the canonical **sequence-verifiable-units** principle skill, the failing test first and the
   fix on top.
6. Run **Opening a PR**.

**Reply:** what was broken, root cause, fix, how you verified. Quote the decisive failing and passing
output, trimmed to the assertion and the counts.

## Tasks

- [x] Claim ticket 66 (`claim`)
- [x] Blast radius (`graphify-scope`: unbuilt, `rg` and read fallback)
- [x] Pick the playbook (Bug fix: measured defect, known mechanism, no new behavior)
- [x] Reproduce on `/review/label`: the label of `disabled-input-sibling` at cursor default, opacity 1
- [x] Confirm the mechanism by adding `peer` to the live input and re-measuring
- [x] Widen `checkLabelDisabled` and record it failing before the fix (62 checks, 2 failed, `default / 1`)
- [x] Add the three `peer` sites to the field table and regenerate the copies through the fixer
- [x] Verify: `pnpm check`, `pnpm test:adapter`, the label journey, the runtime probe
- [x] `pstack-no-comments` (one block deleted, one invariant encoded as a drift check)
- [x] `code-review` round 1: Spec found the native-select `peer` inert inside the wrapper
- [x] Fix the Spec finding: `peer` on the native-select wrapper, `peer-has-[:disabled]:` on the label
- [x] Record the native-select assertion failing without the label rule (`default` / `1`), passing with it
- [x] Round 2 review of the widened diff
- [ ] Operator pass on `/review/label` in both schemes. Recorded as given by the operator's close
  instruction on 2026-11-12; the checkbox stays open in the ticket, as ticket 65 did.
- [x] Propose commits and close: `29baa6c` (journey assertion), `f0c059f` (fix), tag
  `t66-label-disabled-text-field`, branch pushed. No merge: the base is `develop`, which stays unmerged.

## Decisions

- The sites live in `field-variants.mjs`, which already owns the disabled and readonly classes for
  exactly these three components. A new table would need count and wiring changes for no gain.
- Each stock anchor includes the opening quote, so `peer` lands as the first class and the fixed text
  does not contain the stock. The binary controls already write `peer` first.
- No label change for the binary or text fields. `label-fixed` already carried `peer-disabled:cursor-not-allowed`
  and `peer-disabled:opacity-50`.
- `native-select` needed a different lever. Its `<select>` sits inside `div[data-slot="native-select-wrapper"]`,
  so a label after the component is a sibling of the wrapper, never of the select. `peer` on the
  inner select was inert. The wrapper carries `peer` and the label gained `peer-has-[:disabled]:cursor-not-allowed`
  and `peer-has-[:disabled]:opacity-50`.
- The label page gained two cases, `disabled-native-select` and `disabled-textarea`, so all three
  field components the ticket names are reviewed on the surface the ticket names, not only in a probe.
- The drift test gained `no replace site hides its stock inside its fixed`, which is the invariant the
  opening-quote anchor depends on. It caught the first draft of the label opacity site.
- `text-rungs.mjs` was regenerated from the clean pin after the label and native-select fixed strings
  changed. The generator's output is not separately verified, so it must run before the copies.
- Found and filed ticket 73: `textarea-readonly-surface` reports `customized` on a clean pin because
  its stock is created by an earlier site in the same run. Pre-existing, proven by a dry run at HEAD.

## Review rounds

Round 1 (`no-comments`, then Standards and Spec):

- `comment-sicko`: deleted the four-line block above `peerSite`. Accepted. The half worth keeping is
  one line stating the rule; the fixer-readback half is now the drift check
  `no replace site hides its stock inside its fixed`.
- Standards: no hard violations. Two name nitpicks. `own` was renamed to `labelStyle` when the block
  was restructured for the textarea case. `first` stays: the table's convention is a positional class
  anchor, and `first` reads as the first class of the element.
- Spec: `native-select` was the act-on finding. `peer` on the inner select matched nothing. Fixed by
  the wrapper lever and the label's `peer-has-[:disabled]:` rules, with a review case and a failing
  run recorded.

Round 2 (widened diff):

- Standards: approve. Table-name nit: `CURSOR_SITES` now holds an opacity-only row. Accepted, not
  changed. The table already wrote opacity for `button` (`aria-disabled:opacity-50`) and `toggle`
  before this ticket, so the row follows the established pattern and a rename is a wider diff with no
  behaviour gain.
- Spec act-on: `textarea` had no assertion while the ticket names three controls. Fixed by a
  `disabled-textarea` case asserted for cursor and opacity, 12 variants and 70 checks.
- Spec considered, rejected with reason: `peer-has-[:disabled]` is a sibling-adjacency lever, not a
  `for` check, so a label after a disabled wrapper dims even when its `for` names something else.
  That is the same over-match `peer-disabled` already has and is the mechanism the ticket argues for;
  CSS cannot read `for`.
- Spec considered, rejected with reason: the opacity row sitting in `CURSOR_SITES`. Same reason as the
  standards nit.
- Operator pass stays open. It is the user's gate, not a machine check.

## Constraints

- Never run prettier over `*-fixed` copies.
- `text-rungs.mjs` is regenerated from the clean pin before the fixer runs; generating it from a
  fixed pin produces rows that never match and was caught and reverted once.
- Ask before any push or merge. Never push main.


## Evidence

- Before: `label light: disabled text input label does not invite a click: default / 1` (62 checks, 2 failed).
- After: 70 checks, 0 failed; `disabled-native-select` and `disabled-textarea` labels at `not-allowed`
  and `0.5` in both schemes.
- Native-select before/after, same page, only the label copy swapped: `default` / `1`, then
  `not-allowed` / `0.5`, in both schemes.
- `fix input textarea native-select label` run 3: `0 stock, 49 fixed, 0 customized, 0 missing`.
- All 17 journeys pass. `pnpm check` 0 errors, 0 warnings. Drift green.

