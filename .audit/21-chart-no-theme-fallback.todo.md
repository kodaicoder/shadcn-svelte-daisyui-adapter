Phase: Bug fix

# Ticket 21, chart rows have no fallback

Ticket: `.scratch/daisyui-adapter/issues/21-chart-no-theme-fallback.md` (Type: task, Status: open,
Blocked by: none).
Base: `790650b` (tag `t16-e2e-prototype-cleanup`). Branch: `feat/daisyui-adapter`.
Playbook: Bug fix. poteto-mode drives; the ticket is input.

Gate record: no `.scratch/daisyui-adapter/spec.md` and no `Status: approved` ticket in this feature;
`map.md` is the standing spec artifact. This ticket runs on the operator's explicit instruction and
its own DoD. No gate pass is claimed.

## Plan

Matched playbook: Bug fix. Its steps, verbatim, then the ticket's own steps.

1. Reproduce it yourself on the matching surface via the driver skill (Non-negotiables), even when a
   debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a
   stated, specific reason the control surface cannot reach the target, and only after driving it as
   far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or
   instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives.
   Seed them with `how` over the affected subsystem and the **why** skill for regression history.
   Each pass, take the split that cuts the most remaining problem space, get runtime evidence,
   eliminate. When program state is unclear, add instrumentation or logging and read it as the code
   runs. Don't guess. Drive a long or stubborn hunt with Claude Code's `loop` skill. Confirm the
   surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a
   subagent using your configured bug-fix model (default in poteto-mode's Models section) with a
   specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not
   a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill
   for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test
   would be expensive, integration-heavy, or unclear. This is the canonical
   **sequence-verifiable-units** principle skill, the failing test first and the fix on top.
6. Run **Opening a PR**.
   skip: this feature delivers by push and tag, not a PR. Ticket 16 recorded why: `main` is the base
   branch and the delivery rule excludes it, so a PR has no merge target.

Ticket steps, from the order given with the ticket:

- [x] Step 1: reproduce on a real build, fresh harness run, theme present then removed, before any fix
- [x] Step 2: confirm the mechanism with runtime evidence (browser probe, then the build)
- [x] Step 3: decide the shape, then implement
- [x] Step 4: re-run the same arm and the full arm, read the painted bytes
- [x] Step 5: failing assertion lands before the fix in git history
- [x] DoD 1: arm-missing paints five distinct opaque colours in both schemes, probe-visual exits 0
- [x] DoD 2: arm-full painted ramp unregressed against ticket 16 evidence, or difference justified
- [x] DoD 3: init twice byte-identical; absent then present does not nest a ramp into its own slot
- [x] DoD 4: smoke.mjs:143 replaced, and the replacement proven to fail under sabotage
- [x] DoD 5: 07 §5 points at 21; 12's emitted block updated if the shape changed
- [x] code-review on the Spec axis against `790650b`
- [x] Lesson and Check, two lines
- [x] cleanup, conventional commit, tag `t21-chart-no-theme-fallback`, push
- [x] one decision line in `map.md`
- [x] Do not merge to main. Do not touch the registry-10/11/14 fixtures.

## Throughput checkpoint

- Blocking first step: the repro needs a built app, and the built app needs the package. The baseline
  repro runs on an untouched copy of today's package, in the background, while the fix is written.
- Independent workstreams: none. `map.mjs`, `ramp.mjs`, `init.mjs` and the page share one key list.
- Shared mutable state: `harness/runs/`, the two evidence ports, `$TEMP\adapter-harness`. One build
  at a time, and each build gets its own port.
- Smallest safe decomposition: one worker (this session). Each step's output names the next step's
  input, and a mis-sequenced install proves nothing.

## Decision trail

| round | question | answer | evidence |
| --- | --- | --- | --- |
| 1 | which of the ticket's three shapes | B, the derived-helper shape the 5 mix keys already use | a browser probe paints the stock colour through `var(--helper, stock)` when the source var is gone, and paints the ramp when it is present; A bakes a daisyUI-solved literal against 07 §5, C is rejected by 07 |
| 2 | does the re-run trap apply to B | no, `strip()` already recovers the fallback from `var(--x, value)` | the same `strip()` makes every mix binding byte-identical today; the row's second argument holds the stock value |
| 3 | does the fallback need `map.mjs` | no | `rebuild()` already special-cases `chart-*` and `--daisy-derived-*`; a key set nothing reads is dead code (principle-laziness-protocol) |

