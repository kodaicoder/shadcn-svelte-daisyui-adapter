Phase: implementation

# Ticket 52: Atoms, untargeted remainder

Ticket: `.scratch/daisyui-adapter/issues/52-atoms-untargeted-remainder.md`
Spec: `.scratch/daisyui-adapter/spec.md`
Branch: `fix/nutchapon/ai/contrast-warning`
Base: `6813838`
Playbook: Feature
Session: `ses_e3bf72385ffeFALeHHC2Njjlc7`

## Blast radius

state: unbuilt (`graphify-out/graph.json` is missing; freshness exit 5)
seeds: `.opencode/skills/verify/scripts/drive.mjs`, `src/lib/review/FieldReview.svelte`, `src/routes/review`, `ui/kbd`, `ui/slider`
anchors:
  `.opencode/skills/verify/scripts/drive.mjs` <- every review route's `data-scheme` hooks
  `src/lib/review/index.ts` <- the four new routes and the three field routes
  `src/lib/review/FieldReview.svelte` <- the shell the field routes already use
unlisted: `.opencode/skills/verify/SKILL.md` (journey list), `src/lib/components/ui/tooltip` and `ui/input-group` (kbd context variants), `src/lib/components/ui/field/field-label.svelte` (the label review), `docs/component-color-usage.md` (per-component decisions), `src/lib/index.ts` (exports)
fallback: rg

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

- **Blocking first steps.** The shared shell is generalized once per batch before any route is added, and the four legacy field routes must stay green.
- **Independent workstreams.** One batch at a time. `drive.mjs` is one file for every journey, so two batches never write it in parallel.
- **Shared mutable state.** None. The review module exports frozen data, and each page owns its own `$state`.
- **Smallest safe decomposition.** A batch is one delegate. Nine atoms in one diff is too much to review well, so the ticket runs in three batches, each merged before the next starts.

## Batches

- **A (static and token).** `kbd`, `separator`, `skeleton`, `spinner`. First rename the shell to `ReviewPage` with `kind: string`, update the three field routes, then add the four routes and journeys.
- **B (structured and interactive).** `marker`, `progress`, `scroll-area`, `slider`.
- **C (label).** `label`, including `for`, wrapping and the disabled group, with `Field.Label` as the neighbour.

## Decisions

- The shell becomes `ReviewPage` with `kind: string`; `FieldReview` and the `FieldKind` union go away, because the other nine atoms are not fields and the id is a DOM id, not a domain type.
- `kbd` context variants (tooltip, input-group) are reviewed with those molecules in ticket 53, not on the atom page, because the context is the parent's markup.
- Static atoms still get a journey. Each asserts what can fail: a computed token, a dimension, an aria attribute, or an animation name.
- Slider covers both a single value and a two-thumb range, since the thumb count changes the locator.

## Verification

- Batch A (`kbd`, `separator`, `skeleton`, `spinner`) merged fast-forward from `ticket-52a-atoms`.
- `pnpm check`: 0 errors, 0 warnings. Drift: 12 checks pass.
- Twelve journeys in the main tree, all pass: checkbox 43, switch 71, radio-group 77, toggle 63, cursor
  17, input 39, native-select 39, textarea 41, kbd 15, separator 15, skeleton 15, spinner 15.
- The shell rename `FieldReview` to `ReviewPage` kept the three field routes green.
- Drift is 12 checks, not 13. Ticket 51's Answer and audit now say 12/12.

## Tasks

- [x] Claim 52
- [x] Map the nine atoms (`how`)
- [x] Blast radius (graph unbuilt, rg fallback)
- [x] Write playbook steps and checkpoint
- [x] `architect` (skip: the page and journey shape is settled by ticket 51 and reused verbatim)
- [x] Batch A merged and verified
- [ ] Batch B merged and verified
- [ ] Batch C merged and verified
- [ ] `pstack-no-comments`
- [ ] `code-review`
- [ ] Lesson and Check
- [ ] Operator pass on all nine
