Phase: implementation

# Ticket 42: The quiet button states follow the tone

Branch: `fix/nutchapon/ai/contrast-warning`
Base: `fccf1c1` (ticket 37 closeout; the gate fixes are uncommitted on top)
Ticket: `.scratch/daisyui-adapter/issues/42-quiet-button-states.md`
Playbook: Feature. poteto-mode drives; the ticket is the operator's request plus its own DoD.

## Feature playbook (verbatim)

1. `how` over the affected subsystem.
2. `architect` for parallel design exploration.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped.
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

1. `how`: skip. The button rows and the state page were read in the previous pass.
2. `architect`: skip. The operator named each state pair.
3. Throughput checkpoint: below.
4. Delegate: twelve class strings, the page's badge markup and the seams that pin them. The lead keeps the diff.
5. Verify on the matching surface: the live page and the state frames.
6. Commits: one commit with the other gate fixes.
7. `interrogate`: skip. Not a critical-path ticket.
8. Opening a PR: skip. Delivery is ticket 34's release on the same branch.

## Blast radius

`graphify-out/graph.json` is absent, so the gate is `unbuilt`. Fallback: `rg` over the seams that pin these rows. `registry-30` and `registry-31` assert the outline, ghost, link and raw-tone rules; both were updated in the same change. `registry-37` reads the matrix, which does not cover the outline text. The harness page renders the badges.

## Throughput checkpoint

- **Blocking first steps.** The class rows land before the render.
- **Independent workstreams.** n/a: one table plus the page markup and two seams.
- **Shared mutable state.** One working tree, one evidence dir.
- **Smallest safe decomposition.** One worker.

## Ticket steps

1. Outline rows: `border-<tone> bg-transparent text-<tone>` at rest, `hover:bg-<tone> hover:text-<tone>-foreground`.
2. Ghost rows: `text-<tone>-text` at rest, `hover:bg-<tone> hover:text-<tone>-foreground`.
3. Link rows: drop the resting underline.
4. Badge grid back to spans; the component keeps `href` for a link badge.
5. Update the seams, the README and the CHANGELOG, then rerun the page.

## Measured consequence

The raw tone as outline, ghost and link text, and as the outline border, is the same pair as the fill against the page. Light: success 1.96, warning 1.76, info 2.22, destructive 6.53, primary 7.62, secondary 2.87. Dark: success 9.63, warning 10.7, info 8.49, destructive 2.89, primary 3.2, secondary 6.57. Against a 4.5 text promise that fails success, warning, info and secondary in light, and destructive and primary in dark. Against a 3 boundary promise the outline border fails success, warning, info and secondary in light, and destructive in dark. egistry-42/tone-text.mjs holds the run. The operator asked for the raw tone deliberately; the text-tone tokens that pass are still in the package if this is reversed.
