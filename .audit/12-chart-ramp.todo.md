Phase: Closeout

# Ticket 12, chart ramp derivation

Ticket: `.scratch/daisyui-adapter/issues/12-chart-ramp.md` (grilling, five decisions).
Base: `e266ace` (tag `t11-non-colour-tokens`). Branch: `feat/daisyui-adapter`.
Playbook: `skip: no bundled poteto playbook matches a decision-only grilling ticket; the ticket's own DoD drives` (same call as 11).

## Plan

Matched playbook: none, so the ticket's five decisions are the steps. The grilling skill
drives the interview shape, one question at a time as the operator asked.

- [x] Read 12, 09, 10, 05, 11, `map.md`, the harness, and registry-10/11 fixtures
- [x] Read first, 3 files max: ticket 12, ticket 09, ticket 10, then 05 and 11 as needed
- [x] Extend the harness only if a decision needs it: not needed, `shot.mjs` already reads
      element background as sRGB bytes, which is what a ramp contrast needs
- [x] Build `registry-12/`: probe theme (daisyUI built-in pair), probe package, item with 09's
      core rows, probe page, `measure.mjs`
- [x] Run `harness/run.mjs` on 5199 and 5209, kill every server it starts. `2026-10-30T04-27-45-353Z`
      is the cited render. `2026-10-30T02-10-55-497Z` measured the rejected constructions; its
      `render.json` stays uncommitted because `runs/` is ignored. Two earlier runs failed on a page
      importing a chart component the harness never installs, fixed with `--then`
- [x] Compute contrast and separation from the painted bytes, cross-checked against an offline
      OKLCH model (agree within 1%)
- [x] Interview: the five decisions, one question at a time, each with a recommendation and facts
- [x] Settle decision 1 and 2: the ramp's shape and its source set (one fork, not two).
      One generated one-hue ramp from `primary`, fixed L per step, capped chroma. Rejected:
      five assignments (3 of 5 under 3:1 in light), hue rotation (offset lands on `warning`),
      `color-mix` toward base-100 (last step converges on the page)
- [x] Settle decision 3: dynamic lightness via a build-time anchor solve. S3: one anchor solved for
      3.2:1 against the scheme's own base-100, then four fixed L steps. Rejected S1 (fixed band
      fails above page L 0.30) and S2 (ratio-target every step spends the separation budget and loses
      a step on a mid-tone page). The operator's requirement that lightness adapt is
      met by the anchor, which is solved from the surface
- [x] Settle decision 4: `info`/`success`/`warning`/`error` are out, settled by decision 1,
      because a second hue is what a one-hue ramp forbids
- [x] Settle decision 5: the separation rule we can implement. Adjacent OKLab ΔE >= 0.06 on
      painted sRGB plus 3:1 contrast, both enforced by the writer at generation time, chroma cap
      0.08 fitted per step to the sRGB gamut, step 0.09, hard error on a mid-tone surface.
      The measurement corrected the ticket's premise: a one-hue ramp retains 100% of its
      separation under protanopia/deuteranopia/tritanopia, while the rejected five-hue set
      collapses to 0.035 under tritanopia
- [x] Write `## Answer`, `Status: resolved`, `Lesson:` and `Check:` in the ticket
- [x] Append one line to `## Decisions so far` in `map.md`
- [x] Copy cited artefacts to `evidence/12-chart-ramp/`; `check.txt` and `floors.txt` written as
      UTF-8 via `writeFileSync`, not a PowerShell redirect
- [x] `code-review` on the Spec axis against `e266ace`; `no-comments` only if the diff carries code
- [x] `deslop`, conventional commit on `feat/daisyui-adapter`, tag `t12-chart-ramp`; push deferred by
      the operator
- [ ] Clear leftovers: harness runs, temp project, ports 5199 and 5209, working tree

## Review round (2026-10-30)

Two `reviewer` passes against `e266ace`, Standards and Spec, both confirmed by hand. Fixed:

- Ticket said 15 assertions, `check.txt` has 16. Ticket said dark CVD worst 0.089, it is 0.088.
- The rejected assignment set was described as name-to-name while `measure.mjs` measured the semantic
  four. Both sets are now measured in `sweep.txt` section 5: 1 of 5 and 3 of 5 below 3:1.
- `+60` from `primary` is 17 degrees from `secondary`, not inside the `error` band. Both the ticket
  and the map line corrected.
- Light band on the dark page is 1.13:1, not 1.18:1.
- The clipped-versus-fitted table, the 10-hue sweep and the five-hue CVD row are now printed by
  `registry-12/sweep.mjs` instead of asserted. The old 0.071/21.93/1.84 figures were not reproducible
  from any committed artefact and are replaced by 0.075/39.51/9.33. The rule refuses 7 of 60
  combinations on the hue guard, which the ticket now states.
- Downstream constraint named 17 as the writer; 17 is hosting. The CLI is 07/14, proved by 16.
- Code: `measure.mjs` step indices, `ramp.mjs` percent parsing, `check.mjs` direction, alpha, cap
  message, and constants imported from the rule instead of duplicated. `floors.txt` is byte-identical
  after the parse fix; `check.txt` differs only in the cap message.
- `apply.mjs` was left alone by decision: its blank-line growth would invalidate the committed render.
  Recorded as a constraint for the CLI in the ticket instead.

Rejected review findings: merging `toOklab`/`toOklabLinear` (different input domains by design),
gitignoring `evidence/` (it is committed because `runs/` is ignored), the undefined
`--daisy-color-primary` (the probe plugin defines it, that is the namespace from 13), and a vitest
spec for a frozen `src/`.

Cross-check: `sweep.mjs` assignment contrasts agree with the painted bytes of run
`2026-10-30T02-10-55-497Z` within 0.01, measured by `measure.mjs`.

## Settled input (do not re-litigate)

- Namespace `--daisy-color-<source>` plus `--daisy-radius`; the table is written by the adapter CLI
- Every colour value is opaque
- 09's surface-first rule and 10's rung assignment for the sidebar
- Escape hatch is the user-owned overrides file with `html:not(.dark)` and `html.dark`
- The chart tokens have no component consumer; the ramp is application-facing only
- shadcn's published base ramps ramp one hue with monotone lightness, identical light and dark
- `src/routes/layout.css` chart values are emerald's ramp, not olive's

## Throughput checkpoint

- Blocking first steps: the five decisions are sequential by dependency (shape gates source set,
  which gates the dark rule, which gates the separation rule). One owner, no fan-out.
- Independent workstreams: `n/a: one decision tree, five nodes, each gated by the previous`.
- Shared mutable state: `n/a: one ticket file and one map line`.
- Smallest safe decomposition: one worker (this session), because every step is a conversation
  with the operator, and a delegate cannot interview.

## Decision trail

| round | question | answer | evidence |
| --- | --- | --- | --- |
| 1 | ramp shape: assignment vs one-hue spread | settled: one hue from `primary` | `sweep.txt` sections 5 and 6 |
