Phase: implementation

# Ticket 77: two atom sites read customized on a fixed project

Ticket: `.scratch/daisyui-adapter/issues/77-fixed-project-still-customized.md`
Session: ses_e132abdd7fferm9owLLIYFCOSZ
Branch: fix/nutchapon/ai/contrast-warning

## Blast radius

state: unbuilt (no `graphify-out/graph.json`)
seeds: n/a, graph unavailable
anchors:
  `packages/daisyui-adapter/component-fix.mjs` <- `stateOf` and the per-file walk in `run`
  `packages/daisyui-adapter/test/drift.mjs` <- the checks that read site states
unlisted:
  `packages/daisyui-adapter/targets.mjs` <- the site order that defines a file group
  `packages/daisyui-adapter/targets/atom-tones.mjs` <- `skeleton-atom-surface`, `slider-atom-thumb-tone`
  `packages/daisyui-adapter/targets/sizes.mjs` <- `skeleton-selector`, the later site that edits it
  `packages/daisyui-adapter/targets/rings.mjs` <- `slider-focus-ring-width`, the later site that edits it
  every shipped `*-fixed` copy <- the byte comparison after the change
  `packages/daisyui-adapter/cli/init.mjs` <- `--strict` reads the state counts
fallback: rg `stateOf`, read `component-fix.mjs:102-121` and `component-fix.mjs:191-218`

## Playbook: Bug fix

1. Reproduce it yourself on the matching surface via the driver skill (Non-negotiable), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
   The matching surface is the fixer on a temp copy of the pin. A script copied `src/lib/components/ui` to a temp root, ran `fix`, then `scan`: `293 stock, 22 fixed, 0 customized` then `2 customized`, matching the ticket exactly.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with `how` over the affected subsystem and the **why** skill for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Drive a long or stubborn hunt with Claude Code's `loop` skill. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
   `how`: not routed, the subsystem is two functions. Regression history: ticket 76 made the walk order-aware and left this gap open.
   Mechanism, measured: `skeleton-atom-surface`'s fixed text is edited by the later `skeleton-selector` (`animate-pulse",` -> `animate-pulse rounded-sm",`), and `slider-atom-thumb-tone`'s by the later `slider-focus-ring-width` (`focus-visible:ring-2` -> `focus-visible:ring-3`). `stateOf` looked for the site's own fixed literal, which no longer survives to disk, so neither stock nor fixed matched.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent using your configured bug-fix model (default in poteto-mode's Models section) with a specific scope.
   No function boundary crossed and no signature exported; `stateOf` stays private. Implemented inline, the same call ticket 76 recorded for the sibling change.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
   See Verification.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test would be expensive, integration-heavy, or unclear.
   The drift check is cheap and local. It fails before the fix and passes after, in one commit, the same way ticket 76 staged its sibling check.
6. Run **Opening a PR**.
   skip: the ticket pipeline closes with a commit and a tag, no PR.

## Review

Both axes ran on `390992e`, and their findings landed in `f62076f`.

- Standards accepted: assert `missing === 0` too, so a skipped file cannot pass as fixed; hash the
  `CREATES` output as well and assert no site reports `written`, so "writes nothing" covers what the
  message claims; move `cpSync` inside the `try`; copy the pin's `package.json` into the temp root so
  the version guard runs instead of warning on every run; rename the `stateOf` parameter to
  `survivingText`, since `surviving` names the array.
- Standards and Spec both flagged that `surrounds` changed an unreachable insert path from `fixed` to
  `stock`. Restored the original expression, so the declared fixed text and the surviving text are the
  only behaviour change this ticket carries.
- Spec: no gap against the four checkboxes, and the blast radius is exactly the two ids.

## Verification

- Before the change, a temp copy of the pin: `fix` reported `293 stock, 22 fixed, 0 customized`,
  then `scan` reported `2 customized` (`skeleton-atom-surface`, `slider-atom-thumb-tone`), and a
  second `fix` reported `0 stock, 313 fixed, 2 customized` with no byte change.
- After the change, the same temp copy: `scan` reports `0 customized`, and the second `fix` reports
  `0 stock, 315 fixed, 0 customized` with no byte change.
- New drift check fails against the fixer as it was before this commit, with the two ids from the
  ticket: `FAIL  a fixed temp project reports no customized site :: 2 customized, 0 stock, 0 missing,
  313 fixed: skeleton-atom-surface, slider-atom-thumb-tone`. It passes with the change:
  `ok  a fixed temp project reports no customized site :: 0 customized, 0 stock, 0 missing, 315 fixed`
  and `ok  a second fix on the fixed temp project writes nothing :: 0 stock, 315 fixed, 0 written`.
- `pnpm test:adapter` all 30 checks pass, including `every fixed copy is what the manifest produces
  from the pin`.
- CLI on a fixed temp project: `fix` prints `fix: 293 stock, 22 fixed, 0 customized, 0 missing`,
  exit 0. `fix --strict` prints `fix: 0 stock, 315 fixed, 0 customized, 0 missing; check only,
  nothing written`, exit 0.
- `svelte-kit sync` exit 0, `svelte-check` 0 errors and 0 warnings.
- Prettier: both touched files already failed `--check` at HEAD on lines this ticket does not touch;
  the added lines are what the repo config produces.

## Todo

- [x] reproduce `2 customized` on a fixed temp project
- [x] classify a site against the fixed text that survives the later sites
- [x] drift check on a fixed temp project
- [x] `pnpm test:adapter`, `svelte-check`
- [x] `fix --strict` exits 0 on a fixed temp project
- [x] shipped copies byte-identical
