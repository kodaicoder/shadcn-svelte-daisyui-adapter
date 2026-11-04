Phase: feature

# Ticket 36: Move the supported shadcn-svelte pin

Branch: `fix/nutchapon/ai/pin-drift`
Base: `67ed541` (`fix/nutchapon/ai/new-variants`)
Ticket: `.scratch/daisyui-adapter/issues/36-pin-drift.md`
Playbook: Feature
Migration: **A. Move the pin to 1.8** (operator choice, 2026-11-04)

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

1. `how`: skip. The subsystem was read in Discover: `targets.mjs`, `component-fix.mjs`, `cli/init.mjs` behaviour, the six seam scripts, `run.mjs`, `prove.mjs`, `pin-registry.mjs`, and the live 1.8 registry item contents. The ticket names the same files.
2. `architect`: skip. The shape question (one stock vs two) was decided by the operator, and the remaining choices are per-site string derivations against a fixed contract, not competing architectures.
3. `interrogate`: skip. No contested design after the operator's choice, and the change is data plus tests.
4. Opening a PR: skip. The operator asked for a branch, no publish, no version bump, no merge.

## Throughput checkpoint

- **Blocking first steps.** The pin refresh must land before the manifest is rewritten, because every new stock string is read from the refreshed files. The drift test must be green before the harness run.
- **Independent workstreams.** The pin refresh (28 component dirs) and the doc wording (README, CHANGELOG) are disjoint. The manifest rewrite blocks the seams and the harness.
- **Shared mutable state.** One working tree, one evidence dir. The manifest is one file: one writer. The harness temp project is disposable, so the seams and the harness can run in sequence against the same tree.
- **Smallest safe decomposition.** One delegate for the mechanical pin refresh and one for the manifest/seam edits would share `targets.mjs` through the seams, so the manifest and the seams are one unit. The pin refresh is a separate unit because it is a CLI run, not an edit.

## Ticket steps

1. Read `poteto-mode`, `oac-integration`, this ticket, the spec, the harness and the live registry.
2. Claim ticket 36; cut `fix/nutchapon/ai/pin-drift` from `67ed541`.
3. Refresh the 28 target component dirs from the 1.8 registry with the repo's own `components.json`.
4. Rewrite `targets.mjs`: `SUPPORTED` 1.8, `SITES` close buttons, `RADIUS` and `SURFACES` anchors/step, variant pinned rows. Prune a site only when the 1.8 stock already holds the target step; record each prune.
5. Move the seam expectations that must move; keep the eight check totals at 139/100/64/71/45/43/82/8.
6. Refresh `prove.mjs` for the 1.8 sheet close, and let the harness add from the live registry with no `--pin-registry`.
7. Run the eight seams and the harness; keep evidence under `.scratch/daisyui-adapter/evidence/36-pin-drift/`.
8. README, CHANGELOG and `SUPPORTED` name the same stock and install command.
9. Record the version implication in the ticket; do not bump, publish, touch ticket 34, change PAIRS, or merge.

## Design decisions

| Decision                                                                                               | Choice                                                                                                         | Why                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Site already at the target step                                                                        | Prune it from the table                                                                                        | The four-state model has no "already correct, nothing to assert" state that the seams can distinguish from a fake edit; `registry-28` and `registry-29` require every entry to change. A pruned site is honest. |
| Sites whose stock is a different step                                                                  | Replace the radius token with the role step                                                                    | The 1.7 contract (box lg, field md, selector sm, size override) is preserved across the pin move. The pin move must not change the visual contract.                                                             |
| Menu rows (`*-item`, `*-checkbox-item`, `*-radio-item`, `*-sub-trigger`)                               | Keep, md to lg                                                                                                 | They are in the box table per the spec; keeping them keeps the shipped 1.7 design.                                                                                                                              |
| Content boxes already at lg (popover, dropdown content, menubar root/content, hover card, nav trigger) | Prune                                                                                                          | 1.8 already holds the box step.                                                                                                                                                                                 |
| Drawer                                                                                                 | One `drawer-surface` site on `before:rounded-xl`; drop the three direction sites and the `rounded-full` handle | 1.8 moved the drawer panel to a shared `before:` surface and made the handle a pill. Spec L80 keeps circles.                                                                                                    |
| Alert accent bar                                                                                       | Keep the tone rows, restore the `after:` positioning in the `alert-base` site                                  | 1.8 dropped the base positioning, which makes the adapter's `after:bg-*` inert. Restoring it in the base keeps the 0.3.0 alert look.                                                                            |
| Nested `calc(var(--radius-*))` radii                                                                   | Replace with the plain step token                                                                              | `registry-28` asserts every fixed writes a literal `rounded-sm                                                                                                                                                  | md  | lg`. |
| Variant tables                                                                                         | Update the pinned rows and the stock classes to the 1.8 variant blocks                                         | The block order is unchanged for button and badge; alert lost `after:` from its rows.                                                                                                                           |

## Version implication (for the operator to decide)

`SUPPORTED` moves from 1.7.x to 1.8.x. The package version stays `0.3.0`, still unpublished, so no installed user is refused. If 0.3.0 had shipped, this would be a breaking change for 1.7 projects. I am not bumping the version.

## Verification

- `pnpm --filter @kodaicoder/shadcn-svelte-daisyui-adapter` has no build script; the harness page build and the eight seams are the gates.
- Harness: fresh SvelteKit 3 project, `add` the 28 targets from the live registry (no `--pin-registry`), `init`, build, render light and dark, no console error.
- Seams: registry-16 139, registry-26 100, registry-27 64, registry-28 71, registry-29 45, registry-30 43, registry-31 82, drift 8.
- AA matrix from ticket 33 stays green; seams stay at 139/100/64/71/45/43/82/8.

## Results

- Pin: `src/lib/components/ui` refreshed from shadcn-svelte 1.8.0 with the repo's `components.json`; `shadcn-svelte` moved to `^1.8.0` in the root `package.json`, with the lockfile and the pnpm workspace age exclusion. `SUPPORTED` is 1.8.x. 110 component files changed, no file added or removed.
- Manifest: 11 SITES (two close buttons moved), 25 RADIUS (13 change, 12 assertions), 42 SURFACES (29 change, 13 assertions; the three direction drawers pruned into one `drawer-surface`), 4 VARIANTS (button, badge and alert pinned rows; bubble unchanged). 82 sites, 25 assertions.
- Harness: `run.json` `ok: true`, `build: true`, `addTargetsExitCode: 0`, no `pin-registry` step, `consoleErrors: []`, `contrast.ok: true`. `prove.json` init `55 stock, 25 fixed, 0 customized, 1 missing`, late sheet stock then fixed, `fix` idempotent, `--check` 0 with asserted `checkCounts` `0 stock, 82 fixed, 0 customized, 0 missing`; the proof asserts the `0 customized` row, so a live-registry drift fails it.
- Repo gates: `pnpm build` passes (vite + svelte-package + publint); `pnpm check` reports 0 errors and 0 warnings.
- Seams: 139/100/64/71/45/43/82/8, all exit 0, in `evidence/36-pin-drift/seams.log`.
- Expectations moved: registry-26 (assertion-aware states, copied 39/32/7 fixture totals, 1.8 overwrite stock), registry-27 (1.8 stub, minor 8, future 1.9.0, `^1.8.0`, vega header 29), registry-28/29 (copied assertion-id lists, directional box step, navigation indicator `rounded-tl-sm`), registry-31 (badge destructive row, two raw-tone rows), registry-16/30 (1.8 stub). Counts unchanged.
- Review fixes: `--check` wording corrected to `--strict`; README install commands pinned to `shadcn-svelte@1.8`; card image, card header and alert base moved to assertions (1.8 is directionally correct and 1.8 dropped the alert bar, so the tone rows lose dead `after:bg-*` classes); `prove.mjs` asserts the drift-free counts; the seam assertion lists are copied instead of derived.
- Docs: README 1.8.x, the assertion sentence and the badge destructive row; CHANGELOG supported stock 1.8.x and the badge/alert wording. The spec is not edited, because editing it would invalidate the approved tickets; `migration.md` records the supersession and the state-order deviation.
- Version: not bumped, not published. The implication is in the ticket.
