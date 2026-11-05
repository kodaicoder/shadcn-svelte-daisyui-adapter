Phase: implementation

# Ticket 38: The tone outline surface

Branch: `fix/nutchapon/ai/contrast-warning`
Base: `fccf1c1` (ticket 37 closeout; ticket 34's proof flag is uncommitted)
Ticket: `.scratch/daisyui-adapter/issues/38-outline-surface.md`
Playbook: Bug fix. poteto-mode drives; the ticket is the operator's report plus its own DoD.

## Bug fix playbook (verbatim)

1. Reproduce it yourself on the matching surface via the driver skill (Non-negotiables), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with `how` over the affected subsystem and the **why** skill for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Drive a long or stubborn hunt with Claude Code's `loop` skill. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent using your configured bug-fix model (default in poteto-mode's Models section) with a specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test would be expensive, integration-heavy, or unclear.
   This is the canonical **sequence-verifiable-units** principle skill, the failing test first and the fix on top.
6. Run **Opening a PR**.

## Playbook decisions

1. Reproduce on the matching surface: the ticket 37 harness render is the surface. The operator's report names the dark button row; `evidence/37-contrast-warning/dark.png` shows the stock `outline` button with a surface and the four tone outline buttons without one.
2. Cause, confirmed by reading the stock anchors: stock button `outline` is `border-border dark:bg-input/30`, stock badge `outline` is `bg-input/20 dark:bg-input/30`, stock bubble `outline` is `*:data-[slot=bubble-content]:bg-background`. The tone table wrote `bg-transparent` for the button, no fill for the badge, and `bg-background` for the bubble, so no tone outline carries a tone surface. That is the mechanism, not a rendering artifact.
3. Fix: the tone table is one table with one row per presentation, so the fix is the four `outline-*` rows per component. No function boundary moves, so no `architect`.
4. Verify: a fresh harness run in both schemes; the screenshots are the same surface the operator used.
5. Failing repro first: the harness run before the fix is `evidence/37-contrast-warning`, already committed and kept. It is the failing artefact; this ticket keeps the passing one beside it, so the pair is the before and after.
6. Opening a PR: skip. The delivery is ticket 34's release on the same branch.

## Blast radius

`graphify-out/graph.json` is absent, so the gate is `unbuilt`. Fallback: `rg` over the variant table's consumers. `targets.mjs` `VARIANTS` feeds `component-fix.mjs`, which writes the keys into the stock `variants` maps; `packages/daisyui-adapter/test/drift.mjs` checks the eleven contrast sites, not the variant strings; `harness/prove.mjs` counts 82 fixed sites, which the variant table does not move. The seams that read button, badge and bubble output are `registry-30/variants.mjs` and `registry-31/variants.mjs`; both assert the key set and the tone text, so a class change inside a key is inside their coverage rather than beside it. `registry-16/smoke.mjs` and `registry-26/fix.mjs` do not read these classes.

## Ticket steps

1. Measure the text tone on the tinted surface with the package's own math: `.scratch/daisyui-adapter/registry-38/outline.mjs`.
2. Change the eight `outline-*` rows in `targets.mjs` to `bg-<tone>/20` with `hover:bg-<tone>/30`.
3. Update README and CHANGELOG, which currently say the outline keys are border-only.
4. Re-run the harness on the same surface and keep `evidence/38-outline-surface/`.
5. Present the new light and dark screenshots at ticket 34's gate.

## Measured baselines

`registry-38/outline.mjs` prints the text tone against the page, against a 10, 20 and 30 percent tint, for all four tones in both schemes. The operator asked for 10 percent on the resting state after seeing 20, so the table takes 10 and hover moves to 30. Text is far above the 4.5 promise at every alpha: the lowest at 10 percent is 6.19 (light warning) and the highest 11.16. The tint against the page at 10 percent runs 1.06 to 1.18, so it is a wash rather than a fill, which is the look the operator asked for; the light warning row is the faintest at 1.06.
