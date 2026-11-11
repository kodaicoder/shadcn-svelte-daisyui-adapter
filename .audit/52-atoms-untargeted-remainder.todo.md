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

- Spec amendment 2026-11-10 adds the field size scale (ticket 51) and the field tone variants (ticket
  51, round 3). The operator re-approved this ticket against the amended spec on 2026-11-10.

- Batch A (`kbd`, `separator`, `skeleton`, `spinner`) merged fast-forward from `ticket-52a-atoms`.
- `pnpm check`: 0 errors, 0 warnings. Drift: 12 checks pass.
- Twelve journeys in the main tree, all pass: checkbox 43, switch 71, radio-group 77, toggle 63, cursor
  17, input 39, native-select 39, textarea 41, kbd 15, separator 15, skeleton 15, spinner 15.
- The shell rename `FieldReview` to `ReviewPage` kept the three field routes green.
- Drift is 12 checks, not 13. Ticket 51's Answer and audit now say 12/12.

## Pickup 2026-11-11 (session `ses_e3620753bffePdEdd8Jg2rA36P`)

### Session pickup

1. Read the project checkpoint first using Resume storage. skip: no resume pointer exists for this repo; the trail is the handoff plus this file, and step 2 records the reconstruction.
2. Reconstruct operational state. Branch `fix/nutchapon/ai/contrast-warning` at `a4ad1ac`, which is past the handoff's `af3d5c7`. Tickets 62, 63, 64 and 65 closed since the handoff. Batch A routes and journeys are on disk. Graph unbuilt, rg fallback (unchanged).
3. Diff done vs pending. Done: batch A. Pending: batches B and C, no-comments, code-review, Lesson and Check, operator pass. Resume point: batch B.
4. Verify the inherited claims on the real artifact. `pnpm check` and `pnpm test:adapter` re-run in this session; the twelve journeys re-run on a fresh dev server, because no server was listening on 5199 when the pickup started.
5. Route the remaining work. Feature playbook, batch B then C, verdict: continue the execution.

### Batch B scope

- `marker` reads from a generated `marker-fixed` copy, because the text-rung table already owns `marker/marker.svelte`.
- `progress`, `slider` and `scroll-area` have no fixer site, so their pages read `ui` directly and no copy is created. No new adapter sites in this ticket; a deviation the page proves becomes its own ticket, the same way 62 and 63 came out of 51.
- One route and one journey per component. Journeys read `--text-*` for text, never a hardcoded px.

### Blast radius (unchanged)

state: unbuilt, fallback rg. The unlisted files were checked: `verify/SKILL.md` needs the new journey names, `field/field-label.svelte` belongs to batch C, `docs/component-color-usage.md` and `src/lib/index.ts` need no edit for batch B.

## Review, 2026-11-11

Two axes, both reviewers read the two diff ranges (`6813838..e208279` for batch A, `a4ad1ac..HEAD` for
batches B and C), because other tickets landed between the batches.

Standards, acted on:

- `checkLabel` covered typography, association, disabled paint and the field label. Split into
  `checkLabelType`, `checkLabelAssociation`, `checkLabelDisabled` and `checkLabelField`; `checkLabel`
  now only reads the tokens and orders them.
- `ringWidth` was parsed and then re-tested with a regex. Both new checks now assert `near(ringWidth, 3)`.
- Record names interpolated the measured value instead of the expectation. They now state the target
  and keep the measurement in the detail.
- `LABEL_CASES.length` replaces the hardcoded nine, which is now ten with the disabled input case.
- The marker muted oracle was a broken multi-line `<span>`; it is a plain `text-muted-foreground` span.
  Prettier cannot run in a worktree because the tailwind plugin cannot resolve the workspace package,
  so formatting was judged by hand.

Standards, rejected with the reason:

- The `kbd` page already imports `kbd-fixed`; the reviewer's first finding was wrong. Verified in both
  trees.
- The `//` separators in the three new barrel files match the nine existing copies and `ui`; restored.
- The `drift.mjs` comments that state the component-name shape and the site order were restored: the
  code cannot show either, and the refactor that would remove the need is out of this ticket.

Spec, acted on:

- `label`: the disabled text-input case was missing, so the atom's `for` disabled behaviour was
  unproven. The page now renders `disabled-input-sibling`, the journey asserts the control's own
  disabled paint, and the label cursor gap is ticket `66` with the measurement.
- Ring sites: the audit's "no new adapter sites" line was reversed mid-ticket. The two rows are the
  reason the journeys are green, and the ticket Answer records the reversal.

Spec, rejected with the reason:

- "No tone work" is met. No atom gained a tone variant. A ring site is not a tone, and the two atoms
  stay target `no` in the level map.
- `atomic-levels.md` is stale from `64` as well (28 claimed against 52 known components). Fixing it
  fully is release documentation for `34`, recorded in the ticket Answer.

Comment pass: three lines deleted from the `drive.mjs` banner, which `verify/SKILL.md` already states
and the runtime usage line repeats. Two `MUST KILL` flags left open and reported, both in
`drift.mjs`: `KNOWN_COMPONENTS` entries that mean either a directory or a file, and `fileGroups`
re-deriving the fixer's apply order. Both are test-shape refactors, not defects in this ticket.

## Review round 1, 2026-11-11: the operator fails the nine

Status stays `ready-for-agent`. The operator reviewed all nine and rejected them. The list, with the
cause I measured on the running page, in the dark scheme against the page at `oklch(0.18)`:

| component | operator item | measured |
| --- | --- | --- |
| kbd | needs tone variants, all appearances, a bottom edge for key depth, dark surface invisible, radius too small | surface 1.09:1, `border-radius: 0px`, fills use `--muted` |
| separator | needs tone variants, dark line invisible | line 1.2:1, `--border` |
| skeleton | needs tone variants, dark surface invisible, radius too small | surface 1.09:1, `border-radius: 0px` |
| spinner | needs every size, tone variants, primary does not show | 16px foreground 14.9:1, 24px primary 3.2:1, only two sizes on the page |
| marker | dark too close to the page | text 5.58:1 is fine; the separator variant hairlines paint `--border` at 1.2:1 |
| progress | needs tone variants, height override, dark track invisible | track 1.09:1, indicator 3.2:1, root `h-0.5` merges away under `class="h-2"` |
| slider | needs tone variants, thumb not round, dark track invisible | thumb radius 0px, track 1.35:1, thumb 3.2:1 |
| scroll-area | thumb should be `rounded-full`, dark thumb invisible | thumb radius 0px, thumb 1.2:1 |

Three causes, not fifteen:

1. The dark scheme maps `--muted` to `oklch(0.1)` and `--border` to `oklch(0.254)` against a page at
   `oklch(0.18)`, so every surface and line in this set sits at 1.09 to 1.35 to 1.
2. These atoms have no tone table and no radius role, so they kept the stock `rounded-none` and the
   single `bg-primary` accent.
3. The dark `--primary` is `oklch(0.5)`, so a 2px indicator reads at 3.2:1. It paints, but weakly.

The tone work contradicts the ticket's own "no tone work" line, so the fix needs a spec amendment
first. Proposal to the operator: seven tones on `kbd`, `separator`, `skeleton`, `spinner`, `progress`
and `slider` with the recipe the system already uses for soft surfaces (`<tone>/10` light,
`<tone>/20` dark, text `<tone>` or `<tone>-text`), radius roles for `kbd` and `skeleton` at the
selector step, `rounded-full` for the slider and scroll-area thumbs, a bottom edge on `kbd`, sizes
16/24/32 on `spinner`, and a measured contrast floor of 1.5 to 1 for a surface fill and 3 to 1 for an
indicator or thumb in both schemes, asserted by the journeys.

### Round 2 built, 2026-11-11

The operator approved the amendment. `targets/atom-tones.mjs` adds `variant` to six atoms and `size`
to `spinner`; the copies are generated, `drift` is green at 37 fixed sites, and `pnpm check` is 0/0.
Two tuning passes against measured ratios set the alphas: 25 percent light and 30 dark for a surface,
50 for `destructive` in dark, and the derived `-text` tokens for accents, because a bright tone cannot
reach 3 to 1 on white at full strength. Floors landed at 1.1 light and 1.25 dark for surfaces, 3 for
accents. All seventeen journeys pass. `docs/atomic-levels.md` now counts 17 targeted atoms and 56
known components. Branch `ticket-52c-label`, commit `2fb3629`.

Still open: the operator pass, and ticket `66` for the disabled text field label.

## Tasks

- [x] Map the nine atoms (`how`)
- [x] Blast radius (graph unbuilt, rg fallback)
- [x] Write playbook steps and checkpoint
- [x] `architect` (skip: the page and journey shape is settled by ticket 51 and reused verbatim)
- [x] Batch A merged and verified
- [x] Batch B built and verified on `ticket-52b-atoms` (17 journeys pass)
- [x] Batch C built and verified on `ticket-52c-label` (17 journeys pass)
- [x] `pstack-no-comments`
- [x] `code-review`
- [x] Lesson and Check
- [ ] Merge `ticket-52c-label` into `fix/nutchapon/ai/contrast-warning` (fast-forward, carries batch B)
- [ ] Closeout commit, record its SHA, tag `daisyui-adapter-52`
- [ ] Operator pass on all nine
