Phase: implementation

# Ticket 41: A tone border only on the outline variants

Branch: `fix/nutchapon/ai/contrast-warning`
Base: `fccf1c1` (ticket 37 closeout; the gate fixes for 38, 39, 40 and 34 are uncommitted on top)
Ticket: `.scratch/daisyui-adapter/issues/41-outline-only-borders.md`
Playbook: Feature. poteto-mode drives; the ticket is the operator's request plus its own DoD.

## Feature playbook (verbatim)

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

## Playbook decisions

1. `how`: skip. The variant table and the matrix were read for tickets 38 to 40.
2. `architect`: skip. The operator named the rule: a border belongs to the outline presentation only.
3. Throughput checkpoint: below.
4. Delegate: eleven class strings and the matrix fields that describe them. The lead keeps the diff.
5. Verify on the matching surface: a fresh harness run, the same page the operator reads.
6. Commits: one commit with the other gate fixes.
7. `interrogate`: skip. Not a critical-path ticket.
8. Opening a PR: skip. Delivery is ticket 34's release on the same branch.

## Blast radius

`graphify-out/graph.json` is absent, so the gate is `unbuilt`. Fallback: `rg` over `borderPass`, `borderThreshold`, `WARNING_KIND.border`, `row.border` and `borderVsPage`. Consumers are `dist/contrast.mjs` (the filled row and the warning list), `cli/init.mjs` (`printContrast` and `warningSuffix`), `harness/contrast.mjs` (the live and reference rows and the markdown table), `registry-37/warning.mjs` (the stdout format and the border-warning fixture), and the harness checklist. `registry-30` and `registry-31` assert key sets and tone text, not the border token.

## Throughput checkpoint

- **Blocking first steps.** The class rows and the matrix change land before the render, because the render is the verification.
- **Independent workstreams.** n/a: one table plus the metric that describes it.
- **Shared mutable state.** One working tree, one evidence dir.
- **Smallest safe decomposition.** One worker.

## Ticket steps

1. Drop the border token from the filled rows in `targets.mjs` (button 4, badge 4, bubble 3).
2. Drop the border ratio from `contrastMatrix`, `contrastWarnings` and the CLI's report, because the matrix must not claim a border nobody paints.
3. Update the harness `contrast.mjs`, the checklist, README and CHANGELOG.
4. Update `registry-37/warning.mjs` to the new stdout shape and to warn on the text tone instead of a border.
5. Re-run the harness and the seams, then present the render at ticket 34's gate.

## Supersedes

Spec line 21 required "the text-tone border to the filled status and destructive variants so the component boundary clears 3:1". This ticket supersedes that line by operator decision. The light fills stay below 3:1 against the page and are recorded as known limits; the text tone is still held at 4.5 against the page for the outline, ghost and link presentations, which is measured under `text tones`.
