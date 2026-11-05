Phase: feature

# Ticket 34: Release 0.3.0

Branch: `fix/nutchapon/ai/contrast-warning`
Base: `fccf1c1` (ticket 37 closeout, HEAD at claim)
Ticket: `.scratch/daisyui-adapter/issues/34-release-0.3.0.md`
Playbook: Feature. poteto-mode drives; the ticket is input. Not `sdlc`, not `implement`.

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

1. `how`: skip. The subsystem is the release surface, read in Discover: `packages/daisyui-adapter/package.json`, `CHANGELOG.md`, the packed file list, `harness/run.mjs` and `harness/prove.mjs`, and the ticket 37 evidence. The ticket names the same files.
2. `architect`: skip. The only design question is how the harness reaches the published artifact, and the answer is one flag on `prove.mjs`. No competing architecture.
3. Throughput checkpoint: written below.
4. Delegate: the code change is one flag in `harness/prove.mjs`, about 20 lines, already read in full this session. A delegate would re-read the file to write what is already specified. The operator owns the publish, which is the only risky step, so the lead keeps the diff.
5. Verify on the matching surface: the published artifact from the registry, in a fresh app, through `run.mjs --then prove.mjs --registry`, then build and render.
6. Commits: one commit for the proof flag, one for the release record.
7. `interrogate`: skip. Not a critical-path ticket on the pipeline's list (no auth, payments, migration, concurrency, shared state, DB schema). The published surface is a CLI plus three ESM modules.
8. Opening a PR: skip. Delivery is a branch push, an npm publish and a tag, not a PR. Same call as tickets 17 and 22.

## Blast radius

`graphify-out/graph.json` is absent, so the gate is `unbuilt`. Fallback: `rg` over the release surfaces. The version and name have one source, `packages/daisyui-adapter/package.json`, and the CLI, the header and the install spec read it there. `harness/prove.mjs` is the only consumer of the packed tarball. `registry-16/publish-test.mjs` also runs a registry `dlx` but pins the pre-fixer header shape; it is ticket 17's artifact and is not run by this ticket. The npm registry, the `v0.3.0` tag and the git remote are outside the repo graph and are checked directly.

## Throughput checkpoint

- **Blocking first steps.** Nothing publishes until the operator's visual sign-off and his npm auth. The registry proof cannot start until the publish lands. Everything local runs before both gates.
- **Independent workstreams.** None. Version, changelog, pack list, publish and proof are one ordered chain; the proof names the exact version, so it can only run after the registry serves it.
- **Shared mutable state.** The published registry is the one shared, irreversible target. One writer, the lead, and only after the operator's explicit go.
- **Smallest safe decomposition.** One worker. The release is a sequence of gates on one artifact; splitting would let one lane publish while another still edits the manifest or the proof.

## Ticket steps

1. Claim ticket 34; confirm HEAD, clean tree, `0.3.0` in the manifest, and the changelog section. Done: `fccf1c1`, clean, `0.3.0`, section present.
2. Local pre-flight: `node packages/daisyui-adapter/test/drift.mjs` and `npm pack --dry-run --json`. Done: 9/9 drift checks pass, 11 files, `component-fix.mjs`, `targets.mjs` and `dist/contrast.mjs` all included.
3. Add a registry mode to `harness/prove.mjs`, so the same assertions (idempotent init, late add, 82 sites, idempotent fix, `--check` 0) run against `pnpm dlx <pkg>@0.3.0 init` instead of the local tarball.
4. Operator visual check: present `evidence/37-contrast-warning/light.png` and `dark.png` with `checklist.md`. Gate: the operator signs off, or names the defect.
5. Publish 0.3.0 through the OTP gate. Gate: the operator's npm login and OTP.
6. Registry proof: fresh app, `run.mjs --pin-registry` with `--then prove.mjs --registry`, build, render, contrast. Keep evidence under `.scratch/daisyui-adapter/evidence/34-release-0.3.0/`.
7. Tag `v0.3.0` at the release commit; confirm the changelog and the manifest both read 0.3.0 and the registry's `latest` points at it.
8. Closeout: ticket Answer with Lesson and Check, commit, report.

## Open decisions

- Target branch for the tag and the push. `develop` is 20 commits behind the fix-phase branches, and `main` is 65 behind. Ticket 22 merged its release branch before publishing; this ticket has no such line.
- Who holds the OTP: the operator's login is absent (`npm whoami` 401), so the publish needs either his terminal or a secret card plus a race against the OTP's lifetime.

## Gate result, 2026-11-05

The operator ran the visual check on `evidence/37-contrast-warning/light.png` and `dark.png` and it failed. In dark, the four tone `outline-*` buttons sit flush with the page while the stock `outline` button carries a surface. The same rows on badge and bubble are flush too. Cause: the tone table wrote `bg-transparent` for the button, no fill for the badge and `bg-background` for the bubble, while the stock presentations carry `dark:bg-input/30`, `bg-input/20 dark:bg-input/30` and `bg-background`.

The operator's direction: an outline variant shows the tone at 15 to 20 percent as its surface. That is ticket 38, opened and fixed before this ticket resumes. Measured with the package math at 20 percent, the lowest text ratio is 6.06, so the AA promise holds.

This ticket is paused at step 4. Steps 1, 2 and 3 are done; step 3's registry mode is unverified until the publish. Resume at the regenerated screenshots from `evidence/38-outline-surface/`, then step 5.

