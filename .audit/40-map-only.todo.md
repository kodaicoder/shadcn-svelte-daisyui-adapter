Phase: implementation

# Ticket 40: A map-only entry point

Branch: `fix/nutchapon/ai/contrast-warning`
Base: `fccf1c1` (ticket 37 closeout; the gate fixes for 38, 39 and 34 are uncommitted on top)
Ticket: `.scratch/daisyui-adapter/issues/40-map-only.md`
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

1. `how`: skip. `cli/init.mjs` was read in full for this request, including the `init` body, the dispatch and the usage string.
2. `architect`: skip. The operator named both entry points and the behaviour is one branch around the existing `fix` call.
3. Throughput checkpoint: below.
4. Delegate: one flag and one dispatch branch in a file already read in full. A delegate would re-read it to write what the operator named. The lead keeps the diff.
5. Verify on the matching surface: the CLI in a fixture, plus the existing `registry-26` command seam.
6. Commits: one commit with tickets 38 and 39, since all three are the same release gate's changes.
7. `interrogate`: skip. Not a critical-path ticket.
8. Opening a PR: skip. Delivery is ticket 34's release on the same branch.

## Blast radius

`graphify-out/graph.json` is absent, so the gate is `unbuilt`. Fallback: `rg` over the CLI's consumers. `registry-26/fix.mjs` asserts the unknown-command usage text and the `init` argument refusal, so both keep the phrases it matches. `registry-16/smoke.mjs`, `registry-27/safety.mjs`, `registry-28/radius.mjs`, `registry-29/surfaces.mjs`, `registry-30/variants.mjs` and `registry-31/variants.mjs` call `init` with no arguments, which keeps the current path. `harness/prove.mjs` calls `init` with no arguments. The package manifest's `bin` is unchanged.

## Throughput checkpoint

- **Blocking first steps.** The dispatch branch lands before the seam can call it.
- **Independent workstreams.** n/a: one file plus its seam and two documents.
- **Shared mutable state.** One working tree; the seam builds its fixture under TEMP.
- **Smallest safe decomposition.** One worker.

## Ticket steps

1. Add `init --no-fix` and the `map` command, both calling the mapping with the fixer skipped.
2. Keep the header at `components 0 fixed` for both and print a line that says the components were left untouched.
3. Update the usage string, README and CHANGELOG.
4. Add the `registry-40` seam and run it with the `registry-26` command seam.
5. Report and hand back to ticket 34.
