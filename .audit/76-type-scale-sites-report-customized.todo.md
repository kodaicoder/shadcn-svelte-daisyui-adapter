Phase: implementation

# Ticket 76: the type-scale sites report customized on a clean pin

Ticket: `.scratch/daisyui-adapter/issues/76-type-scale-sites-report-customized.md`
Session: ses_e327321b6ffeOE797kkxW963CD
Branch: fix/nutchapon/ai/contrast-warning
Commit: 6712e04 (tag daisyui-adapter-76)

## Blast radius

state: unbuilt (no `graphify-out/graph.json`)
seeds: n/a, graph unavailable
anchors:
  `packages/daisyui-adapter/component-fix.mjs` <- the state loop in `run`
  `packages/daisyui-adapter/test/drift.mjs` <- the clean-pin check across every component
unlisted:
  `packages/daisyui-adapter/targets/text-rungs.mjs` <- generated from the pin after the other tables
  `packages/daisyui-adapter/tools/generate-text-rungs.mjs` <- the generator behind those stocks
  `packages/daisyui-adapter/targets.mjs` <- the site order the classification must follow
  every shipped `*-fixed` copy <- the byte comparison after the change
  `packages/daisyui-adapter/cli/init.mjs` <- `--dry-run`, `--check` and `--strict` read the states
fallback: rg `stateOf`, read `component-fix.mjs:102-121` and `drift.mjs:217-244`

## Playbook: Bug fix

1. Reproduce it yourself on the matching surface.
   `fix --dry-run` on the clean pin reported `272 stock, 22 fixed, 21 customized`, and the new drift
   check failed with the 21 ids.
2. Binary-search the cause.
   `text-rungs.mjs` is generated from the pin after the other tables apply, so its stocks are text an
   earlier site writes. The drift test documents the intended model at lines 217 to 244: every site is
   checked at its turn, in the fixer's file and site order. `run` classified every site against the
   pre-run file instead.
3. Plan the fix.
   Classify each site at its turn in `run`, applying earlier stock sites to the in-memory content even
   when the run is a scan. A scan counts what is on disk for `fullyFixed`; a fix counts what it wrote.
   No signature change, implemented directly.
4. Verify on the same surface.
   See Verification.
5. Stage the commits so the failing repro lands before the fix in git history.
   The full clean-pin drift check failed first with `21 customized`, then passed after the loop
   change. Both land in this commit because the check reads the new loop.
6. Run Opening a PR.
   skip: the ticket pipeline closes with a commit and a tag.

## Review

Both axes ran on `34b5f40`.

- Standards accepted: drop the `states` array and push each record in the walk, hoist `inScope`,
  rename `initial`/`settled` to `onDisk`/`counted`, correct the stale drift comment, and make the
  new check non-vacuous with a stock count.
- Spec accepted: the ticket's per-site wording was corrected to the measured diagnosis. All 21 are
  generated sites whose stocks are the post-table text by design, so a per-site anchor fights the
  generator. The order-aware walk is the model the drift test already described.
- Noted, not changed: the classification depends on table order, which the drift check guards.
  `scan` now simulates writes in memory, which is required for the dry-run criterion and documented
  in the loop comment.

## Verification

- The new check failed before the fix: `21 customized, 272 stock, 0 missing` with the 21 ids.
- After: `0 customized, 293 stock, 0 missing`; all drift checks pass.
- `fix --dry-run`: `293 stock, 22 fixed, 0 customized, 0 missing`.
- `fix --strict` on the clean pin: `0 customized`, exit 0.
- Temp copy of the whole pin, one `fix`: `293 stock, 22 fixed, 0 customized`. All 20 shipped `.svelte`
  copies compare byte for byte. The second run reports `0 stock, 313 fixed, 2 customized` and makes no
  byte change, so one run applies every site.
- The 2 fixed-project sites are `skeleton-atom-surface` and `slider-atom-thumb-tone`, pre-existing
  fixed-state recognition. Filed as ticket 77.
- `pnpm check` 0/0.

## Todo

- [x] reproduce the 21 customized ids on the clean pin
- [x] classify sites at their turn in `run`
- [x] keep scan counting disk and fix counting its writes
- [x] drift check across every component
- [x] clean pin 0 customized, `--strict` exit 0
- [x] one whole-pin run, copies byte-identical
