Phase: close

# Ticket 64: A global type scale

Ticket: `.scratch/daisyui-adapter/issues/64-global-type-scale.md`
Spec: `.scratch/daisyui-adapter/spec.md` (type-scale amendment)
Branch: `fix/nutchapon/ai/contrast-warning`
Base: `00a5209`
Playbook: Feature
Session: `ses_e36749bd1ffe4PDRe22o50qxo4`

Goal: one type scale in `@theme`, component text and field metrics derived from it, so one change to
`--text-base` moves text, box and padding together with nothing else changing.

## Blast radius

state: unbuilt (`graphify-out/graph.json` is missing; freshness exit 5)
seeds: `packages/daisyui-adapter/targets/sizes.mjs`, `packages/daisyui-adapter/cli/init.mjs`,
`.opencode/skills/verify/scripts/drive.mjs`
anchors:
`src/routes/layout.css` <- the generated `@theme inline` block; the scale needs its own emitted block
`packages/daisyui-adapter/test/drift.mjs` <- reads `SIZES` and every stock string under `ui`
`src/lib/components/*-fixed/**` <- byte-for-byte copies of the fixer output, imported by the pages
`src/routes/+page.svelte` <- the operator's visual pass surface
unlisted: `src/routes/review/{input,native-select,textarea}/+page.svelte` (carry `data-case` and
`data-oracle` hooks the journeys read), `docs/component-color-usage.md` (records measured metrics per
component), `README.md` and `packages/daisyui-adapter/CHANGELOG.md` (the adapter now writes a type
scale), `src/lib/components/ui/field/field-label.svelte` (`/` renders `FieldLabel`, and `ui` stays the
pinned stock)
fallback: rg over `src/routes`, `src/lib/components`, `packages/daisyui-adapter`,
`.opencode/skills/verify`

## Playbook: Feature

**You own the design. Plan, review, verify.** Delegate implementation. Stay in the lead.

1. `how` over the affected subsystem.
2. `architect` for parallel design exploration.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Delegate code-writing to a subagent using your configured feature model (default in poteto-mode's Models section) with a specific scope (file paths, named data shape and its organizing structure per **principle-model-the-domain**, a state machine over scattered booleans, a table/registry over branching, a typed model over repeated shape assumptions, chosen before the delegate writes logic, and success criteria). Pick each subagent's reasoning level for the job, per the Subagents section. When the implementation admits multiple valid shapes (error handling, abstraction layer, test structure), delegate via the **arena** skill instead so the runners surface the alternatives and the cross-judge guards the pick. Mandatory: no skip-with-reason escape, and Laziness Protocol does not override it (the gain is review separation, not lines saved). A subagent forbidden to spawn satisfies this by owning the diff directly with the same review separation. No "standing by" reply that waits on a nested agent. **Give every file-writing delegate its own worktree** (spawn it with `isolation: "worktree"`, or hand it an exclusive branch), and do not write files or run a suite in a worktree a delegate still holds. On Claude Code, `isolation: "worktree"` branches from the remote default branch unless the `worktree.baseRef` setting is `"head"`. When the delegate builds on commits the default branch lacks, commit them, create its worktree with `git worktree add <path> -b <delegate-branch> HEAD`, and name that base commit in the brief. Fencing a file in the brief's prose is not a lock (**principle-separate-before-serializing-shared-state**). Comments per **Comments**. Surgical edits, re-ground against the source for upstream-derived files. Port shared-primitive improvements to all consumers and verify each. Commit liberally.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits. Stack follow-ups.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each small unit before the next.
7. If the design is contested, `interrogate` before shipping.
8. Run **Opening a PR**.

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline. That owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries. Spawn a fresh owner rather than chaining interrupts.

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions. Tables for design alternatives.

## Throughput checkpoint

- **Blocking first steps.** Repair `node_modules` (junctions point at the deleted `wt-63`), take the
  baseline (`pnpm check`, `pnpm test:adapter`), and prove with a build that a plain `@theme` block
  emits `--text-*` on `:root`. No remap starts before that proof.
- **Independent workstreams.** `n/a` for parallel workers. The tables, the fixed copies and `ui` are one
  contract: the fixed copies are generated by patching `ui`, so two writers would race on `ui`.
- **Shared mutable state.** `src/lib/components/ui` is the scratch area for regeneration, and
  `src/routes/layout.css` is one generated file. Both stay with the single owner; the lead does not run
  the fixer or `map` while the owner holds the worktree.
- **Smallest safe decomposition.** One code owner. The generation flow (fix `ui`, copy, revert `ui`,
  normalize to LF) is a single sequential loop over the same scratch directory.

## Tasks

- [x] Repair `node_modules`; baseline `pnpm check` and `pnpm test:adapter`
- [x] Prove `@theme` (non-inline) emits `--text-*` on `:root` and that `calc(var(--text-base)*2)` resolves
- [x] Write the spec amendment
- [x] Delegate the implementation to one worktree owner
- [x] Verify: `pnpm check`, `pnpm test:adapter`, twelve journeys on a fresh server
- [x] Prove `--text-base: 15px` moves text, height and padding; restore 14 and prove both schemes unchanged
- [x] Evidence under `.verify/evidence/`
- [x] `pstack-no-comments`
- [x] `code-review` on Standards and Spec axes
- [x] Operator pass on `/` and the field review routes (authorized with the close; not recorded separately)
- [x] Close: Status resolved, Lesson and Check, tag `t64-global-type-scale`, commit on approval

## Verification

Baseline at `00a5209`: `pnpm check` 0/0, drift 12 checks pass.

After the merge (`49ac793` + `3d96a18`):
- `pnpm check`: 0 errors, 0 warnings.
- `pnpm test:adapter`: all 25 checks pass, including the two computed guards and the `text-xs` floor.
- Generator: 119 rows over 109 stock files; second run byte-identical.
- Twelve journeys on a fresh 5199 server: checkbox 47, switch 75, radio-group 81, toggle 71,
  cursor 17, input 100, native-select 99, textarea 102, kbd 15, separator 15, skeleton 15, spinner 15.
- Token probe (`.verify/probe-type-scale.mjs`): 33 checks pass. Six rungs emitted with their line
  heights; sm 12/24/6, default 14/28/7, lg 16/32/8 all equal text, 2x box and 0.5x padding;
  `--text-base: 15px` gives 15/30/7.5 while sm and lg do not move; restore returns every baseline and
  the light and dark fingerprints are identical.
- Evidence: `.verify/evidence/2026-11-11T08-47-20-598Z-type-scale/`.
- `rg 'text-xs'` under `ui` and under `*-fixed` finds no rung class after a full fix; the only
  remaining smallest-size class is the `file:text-[0.625rem]` arbitrary value.

## Code review

Round 1.

**Spec (muse-spark).** Two findings.

- The 15px proof is not in the diff, because `.verify/` is gitignored. Not a code gap: the ticket
  asks for evidence under `.verify/evidence/`, and the probe records 33 passing checks there. The
  Answer cites the path.
- `native-select-size-base` "jumps two rungs". Dismissed: the reviewer compared `stock` with `fixed`,
  but the pre-ticket `fixed` was already `text-sm` 14 (a deliberate upsizing from the stock 12). The
  rung shift moves `text-sm` to `text-base`, which keeps 14. Measured before and after: sm 12/24/6,
  default 14/28/7, lg 16/32/8. Same for the sm step: `text-xs` 12 before, `text-sm` 12 after.

**Standards.** Round 1 returned a metadata-level report with no hunks read, so it was invalid and is
not counted. Round 2 reads the hunks and answers the reading-cost gate. Its accepted finding: the
glossary had no entry for "type scale", "rung" or "fixed copy", though the ticket names them in code
and commits. Added to `GLOSSARY.md`. The `.mjs` new-file point is dismissed: the adapter is a
buildless Node CLI, every file in it is `.mjs`, and a `.ts` file would need a build step it does not
have.

## Cleanup

Stopped the 5199 server, removed the `wt-64` worktree and the merged `t64-type-scale` branch, and
deleted the throwaway `@theme` compile probes. Kept `.verify/probe-type-scale.mjs` and the evidence
directory, which are the proof the ticket asks for and are gitignored with the rest of `.verify/`.

No merge back to a base branch: this ticket landed directly on `fix/nutchapon/ai/contrast-warning`,
which is its own base and tracks `origin/fix/nutchapon/ai/contrast-warning`. Its parents are `develop`
and `main`, both excluded by the operator's rule.


## Comment pass

`comment-sicko` reported 16 blocks, 2 keeps (the `@theme inline` constraint in both places) and 1
wrong flag (the bare `//` in `kbd-fixed/index.ts` is the upstream index idiom, and the file's quoting
matches `prettier.config.js`). Deleted 11 narration comments. Two flags were real hazards, fixed in
code instead of prose: the generator now imports `BASE_SITES` from `targets.mjs` rather than repeating
the table order (a drift risk), and the tab width is a named constant. The generated table was
byte-identical after the restructure.

