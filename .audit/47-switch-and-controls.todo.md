Phase: implementation

# Ticket 47: Fully rounded switch, fuller controls, animated check

Branch: `fix/nutchapon/ai/contrast-warning`
Base: `fccf1c1` (ticket 37 closeout; the gate fixes are uncommitted on top)
Ticket: `.scratch/daisyui-adapter/issues/47-switch-and-controls.md`
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

1. `how`: skip. The switch, checkbox and controls were read for the previous tickets.
2. `architect`: skip. The operator named each change.
3. Throughput checkpoint: below.
4. Delegate: one radius row, one component snippet and one page section.
5. Verify on the matching surface: the live page and the state frames.
6. Commits: one commit with the other gate fixes.
7. `interrogate`: skip. Not a critical-path ticket.
8. Opening a PR: skip. Delivery is ticket 34's release on the same branch.

## Blast radius

`graphify-out/graph.json` is absent, so the gate is `unbuilt`. Fallback: `rg` over the radius seam. The switch keeps its site, with the fixed string reordered so the fixer still writes and the state model still sees a write. `registry-28` now allows the switch as the `rounded-full` exception and skips it in the step check. The checkbox indicator is outside every stock string, so the drift test still pins the root class. The page and the state capture change.

## Throughput checkpoint

- **Blocking first steps.** The radius row and the component snippet land before the render.
- **Independent workstreams.** n/a: one radius row, one snippet, one page section.
- **Shared mutable state.** One working tree, one evidence dir.
- **Smallest safe decomposition.** One worker.

## Lesson learned in this ticket

Running Prettier on a vendored ui component reorders its Tailwind classes through `prettier-plugin-tailwindcss`, and that breaks the fixer's byte-exact stock strings. The drift test caught it. Vendored components are formatted by the fixer, not by the repo formatter.

## Ticket steps

1. Reorder the switch fixed string so it keeps `rounded-full` and still differs from the stock.
2. Show every state of input, checkbox, switch and radio group.
3. Fade and scale the check and dash icons on both transitions.
4. Update the radius seam, the docs, the harness and the state frames.
