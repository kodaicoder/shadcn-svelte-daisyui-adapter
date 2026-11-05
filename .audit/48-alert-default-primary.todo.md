Phase: implementation

# Ticket 48: The default alert uses the primary pair

Branch: `fix/nutchapon/ai/contrast-warning`
Base: `fccf1c1` (ticket 37 closeout; the gate fixes are uncommitted on top)
Ticket: `.scratch/daisyui-adapter/issues/48-alert-default-primary.md`
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

1. `how`: skip. The variant block renderer was read for this request.
2. `architect`: skip. The operator named the class pair.
3. Throughput checkpoint: below.
4. Delegate: one override table and one seam. The lead keeps the diff.
5. Verify on the matching surface: the harness render.
6. Commits: one commit with the other gate fixes.
7. `interrogate`: skip. Not a critical-path ticket.
8. Opening a PR: skip. Delivery is ticket 34's release on the same branch.

## Blast radius

`graphify-out/graph.json` is absent, so the gate is `unbuilt`. Fallback: `rg` over `renderVariantBlock`, `VARIANT_PINNED` and `pinnedInside`. The alert `default` is a pinned lead key, so the stock block must keep the card pair while the fixed block writes the primary pair. `VARIANT_FIXED` carries that one override; the stock block is untouched, so the fixer still matches the pin. `registry-31` asserted the byte-for-byte pinned lead and now asserts the primary pair instead.

## Throughput checkpoint

- **Blocking first steps.** The override lands before the seam and the render.
- **Independent workstreams.** n/a: one table and its seam.
- **Shared mutable state.** One working tree, one evidence dir.
- **Smallest safe decomposition.** One worker.

## Ticket steps

1. Add `VARIANT_FIXED` with the alert default and thread a `fixed` flag through `renderVariantBlock`.
2. Update the alert seam to assert the primary pair in the fixed block.
3. Update the README and CHANGELOG, then rerun the harness and the state frames.
