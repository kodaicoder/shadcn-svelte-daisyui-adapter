Phase: feature

# Ticket 37: The contrast matrix warning at init

Branch: `fix/nutchapon/ai/contrast-warning`
Base: `3db7ea3` (`fix/nutchapon/ai/new-variants`, ticket 36 included)
Ticket: `.scratch/daisyui-adapter/issues/37-contrast-warning.md`
Playbook: Feature

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

1. `how`: skip. The subsystem was read in Discover: `cli/init.mjs`, `dist/map.mjs`, `dist/index.mjs`, `targets.mjs` (`PAIRS`), the harness `contrast.mjs` and `matrix.mjs`, `run.mjs` and `prove.mjs`, and the pinned theme. The ticket names the same files.
2. `architect`: skip. The interface is fixed by the ticket (thresholds, named pairs, no failure) and there is one way to compute a ratio without a browser: oklch math on the parsed theme. No competing architecture.
3. `interrogate`: skip. Not a critical-path ticket (no auth, payments, migration, concurrency, or DB). The change is additive: a new `dist` module, a report, and a shared import.
4. Opening a PR: skip. The operator asked for a branch, no publish, no version bump, no merge.

## Blast radius

`graphify-out/graph.json` is absent, so the gate is `unbuilt`. Fallback: `rg` over every importer of the harness matrix and the package entry points. Importers found: `.scratch/daisyui-adapter/harness/contrast.mjs`, `.scratch/daisyui-adapter/harness/run.mjs` (`SELECTORS`). `packages/daisyui-adapter/test/drift.mjs` imports `targets.mjs` only. `registry-26/fix.mjs` reads the CLI's last output line as a check _detail_, not an assertion, so added output lines do not move it. `registry-16/smoke.mjs` matches its own warning text and `43 light, 43 dark`; the contrast lines are distinct. `registry-28/radius.mjs` looks for `above 2rem` only. The eight seams stay untouched.

## Throughput checkpoint

- **Blocking first steps.** The shared module lands first, because the CLI and the harness both import it. The CLI report cannot be asserted before the module exists.
- **Independent workstreams.** The package module, the CLI output, and the harness re-point are the same dependency chain; the docs and the new seam follow the code. Nothing fans out.
- **Shared mutable state.** One working tree, one evidence dir. The delegate holds the branch for the whole edit. The harness temp project is disposable.
- **Smallest safe decomposition.** One worker. The module, the CLI import, the harness re-point, and the seam are one coherent unit: a split would leave a consumer importing a path the other worker has not created.

## Ticket steps

1. Read `poteto-mode`, `oac-integration`, the ticket, the spec Contrast section, the CLI, the map and ramp, the harness matrix and contrast, and the ticket 33 evidence.
2. Claim ticket 37; cut `fix/nutchapon/ai/contrast-warning` from `3db7ea3`.
3. Add `packages/daisyui-adapter/dist/contrast.mjs`: the color math from the harness `matrix.mjs`, the thresholds, `TONES`, `SELECTORS`, and `contrastMatrix(themes)` computed from the parsed theme with the fixed status fallbacks.
4. `init` prints the ten repaired pairs and the four text-tone pairs for both schemes, warns on each text pair below 4.5 and each border pair below 3, and prints the fill-vs-page pair below 3 as a known limit. Exit stays 0.
5. Point the harness `contrast.mjs` and `run.mjs` at the package module; delete `harness/matrix.mjs`.
6. Add the ticket seam `.scratch/daisyui-adapter/registry-37/warning.mjs` (the eight seams stay untouched).
7. Run the eight seams, the new seam, and the harness; keep evidence under `.scratch/daisyui-adapter/evidence/37-contrast-warning/`.
8. README output sample and CHANGELOG name the contrast report; no version bump, no publish, no merge.

## Design decisions

| Decision               | Choice                                                                                        | Why                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Where the matrix lives | `packages/daisyui-adapter/dist/contrast.mjs`, next to `map.mjs` and `ramp.mjs`                | That is the package's build-time half, already shipped in `files`. Both consumers import one path.                              |
| Token resolution       | Reuse `SINGLE` from `map.mjs` plus `PAIRS` from `targets.mjs`; a `-text` key is the 40/60 mix | The manifest already names the ten pairs and the map already names every token's daisyUI source. No second table.               |
| Channel rounding       | Round oklch to sRGB bytes before the ratio                                                    | The browser paints rounded channels. Byte math reproduces the painted 3.49, 1.85 and 3.49; fractional math gives 3.47 and 1.84. |
| Theme vs fallback      | Theme value when present, `TOKEN_FALLBACKS` for a status token without one                    | The fixed fallbacks are what a no-theme project renders; a parsed theme always carries all 20 colors.                           |
| `fix` output           | Unchanged; only `init` measures                                                               | `fix` does not re-map the stylesheet, so it has no new theme state to report.                                                   |
| Fill-vs-page           | Known limit line, never a warning                                                             | The component boundary is the text-tone border. Warning on the fill would claim a failure the spec does not claim.              |

## Expected matrix for the pinned theme (byte math)

- light pairs: dialog close 15.22, sheet close 15.22, calendar hover 4.50, range hover 4.50, range middle 4.50, dropdown destructive 11.16, context destructive 11.16, menubar destructive 11.16, chart tooltip 17.74, bubble muted 15.22. All pass.
- light tones: success text 11.36, warning 6.94, info 12.38, destructive 13.51. All pass.
- light filled text: 4.73, 8.40, 5.72, 5.97. All pass.
- light fills: 4.97, 1.95 (known limit), 6.22, 6.53.
- dark pairs: 16.32, 16.32, 4.50, 4.50, 4.50, 7.76, 7.76, 7.76, 14.92, 16.32. All pass.
- dark tones: 9.96, 13.02, 10.05, 8.26. All pass.
- dark filled text: 3.49, 1.85, 3.49, 5.97. Three warnings.
- dark fills: 5.14, 9.67, 4.96, 2.89 (known limit).
- Totals: 3 warnings, 2 known limits, exit 0.

## Verification

- `node .scratch/daisyui-adapter/registry-37/warning.mjs`: the pinned-theme matrix, the three warnings, the two known limits, exit 0, and both consumers importing the package module.
- The eight seams: registry-16 139, registry-26 100, registry-27 64, registry-28 71, registry-29 45, registry-30 43, registry-31 82, drift 8.
- Harness: fresh SvelteKit 3 project, the 28 targets from the live registry, `init`, build, render light and dark, `contrast.ok: true`.
- `pnpm build` and `pnpm check` for the repo gates.

## Results

- Module: `dist/contrast.mjs` owns the color math, `TONES`, the thresholds, `SELECTORS`, `WARNING_KIND`, `contrastMatrix`, `contrastWarnings`, `contrastKnownLimits`. It reuses `PAIRS`, `SINGLE`, `TEXT_TONE` and `TOKEN_FALLBACKS` rather than a second token table, and takes `parseOklch` from `ramp.mjs`.
- Measurement: oklch to sRGB bytes before the ratio, because the browser paints bytes. The pinned theme reproduces the painted 3.49, 1.85 and 3.49; fractional channels give 3.47 and 1.84.
- CLI: `init` measures before the write and prints the ten pairs, four text tones and four filled rows per scheme; warnings and known limits go to stderr, exit stays 0. `measureContrast` downgrades only a non-oklch value to a warning; any other failure still throws. `fix` output is unchanged.
- Harness: `matrix.mjs` deleted; `contrast.mjs` and `run.mjs` import the package module. The reference block stays on unrounded math so it keeps pinning the published 0.01 rows.
- Docs: README records the report and its thresholds; CHANGELOG records the matrix and the warning.
- Seam expectations moved: none. The eight totals stay 139/100/64/71/45/43/82/8, and no existing seam was edited.
- Evidence: `.scratch/daisyui-adapter/evidence/37-contrast-warning/`, harness `ok: true`, `build: true`, `contrast.ok: true`, `failures: []`, `prove.json` `0 stock, 82 fixed, 0 customized, 0 missing`, `seams.log` all eight at their totals plus `registry-37` exit 0.
- Gates: `pnpm build` passes, `pnpm check` 0 errors and 0 warnings, Prettier clean on every touched file.

## Review rounds

- Round 1, Standards: five `Act on` (duplicate `parseOklch`, untagged messages, measure after write, raw-vs-rounded comparison, same-name `luminance`). All five fixed. `Consider` items dismissed with reasons: `SELECTORS` has two in-repo consumers, the harness `round` is display-only, the fallback row is the documented no-theme path, the `.scratch` seam is this repo's test convention, and the untracked module is the pending commit.
- Round 1, Spec: two `Act on` (boundary warning unproven, no-theme run unproven). Both closed by new seam fixtures: a page-colored `base-content` theme for the boundary and a missing-theme project for the report line. The "harness rebuilds the reference inline" note is by design: the reference pins the published fallback numbers, not the theme.
- Round 2, Standards: double package tag in the downgraded warning and a comment that claimed the write was skipped. Both fixed; the catch now rethrows anything that is not a non-oklch value. The `parseOklch` export remains for the harness reference block.
- Round 2, Spec: closable once the seam is tracked, which the commit does. The border ratio equalling the text ratio is spec L71 (one token, no separate border tone).
- No `interrogate`: the ticket is not critical path, and the diff is additive.

## Version

Not bumped, not published, no merge. Ticket 34 untouched.
