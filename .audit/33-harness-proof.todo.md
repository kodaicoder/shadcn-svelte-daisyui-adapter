Phase: feature

# Ticket 33: Integration harness and AA proof

Branch: `fix/nutchapon/ai/new-variants`
Base: `391e535` (ticket 32 closeout, tag `t32-workflow-docs` at `40086db`)
Ticket: `.scratch/daisyui-adapter/issues/33-harness-proof.md`
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

1. `how`: skip. The subsystem walkthrough was completed in Discover by reading the harness (`run.mjs`, `shot.mjs`, `registry.mjs`), the CLI (`cli/init.mjs`, `component-fix.mjs`), the manifest (`targets.mjs`: 29 known components, 11 sites, 10 pairs, 25 radius rows, 45 surfaces, 4 variant tables), the map and ramp helpers, and the five seam scripts. The ticket's input list names the same files.
2. `architect`: skip. The one integration seam is fixed by spec L121, and the two open shape choices are settled below with their trade-offs. Spawning a design panel would revisit a decision the spec already made.
7. `interrogate`: skip. No contested design, no critical-path surface; this ticket adds test evidence only.
8. Opening a PR: skip. The operator asked for a branch and tag push with no merge and no PR.

## Throughput checkpoint

- **Blocking first steps.** The harness code and the fixture must exist before the run. The seam suite must be green before the closeout commit. The evidence dir is created before the first log is written.
- **Independent workstreams.** Harness code (prove, contrast, page, `run.mjs` and `shot.mjs` edits) blocks the run. The seam suite can run while the closeout text is drafted. No two writers share the evidence dir.
- **Shared mutable state.** One working tree and one evidence dir. The delegate owns `harness/*`; the lead owns the run, the evidence, the ticket and git. Serialize: delegate writes finish, then the lead runs node and reads the diff.
- **Smallest safe decomposition.** One delegate for the coupled harness files, because they share the evidence schema (`render.json` selectors and `prove.json` keys). A second delegate would need the schema the first writes. The lead runs and repairs.

## Design alternatives

| Fork | Options | Pick | Why |
| --- | --- | --- | --- |
| Scenario driver | Extend `run.mjs` with a prove mode; a standalone `prove.mjs`; a ticket script via `--then` | `prove.mjs` invoked through `--then`, plus three small `run.mjs` flags | Keeps the generic harness intact, mirrors `registry-16/publish-test.mjs`, and one command still produces the evidence |
| Matrix source | Compute from the theme tokens; read painted element colours | Painted elements from `render.json`, plus a reference block computed from the fallbacks | The painted block proves the rendered project; the reference block pins the published spec numbers |
| Fixture | Real components only; real components plus labelled painted pair chips | Both | Tones, alerts, bubbles, card, input and toggle render as real components; the dialog, sheet, calendar and menu pairs render as their exact fixed classes, because their real states need interaction |

## Ticket steps

1. Read `poteto-mode` and write this plan.
2. Claim ticket 33.
3. Check graphify state, record the fallback.
4. Run the harness against a fresh project and keep evidence under `.scratch/daisyui-adapter/evidence/33-harness-proof/`.
5. Check the evidence proves the AA matrix, the add prerequisite, the re-run idempotency and both schemes.
6. Run the existing seams green: registry-16 139, registry-26 100, registry-27 64, registry-28 71, registry-29 45, registry-30 43, registry-31 82, drift 8. Move only an expectation that must move, and report each with its reason.
7. Do not touch ticket 34, do not bump the version, do not publish, do not edit `src/lib/components/ui` unless the ticket says, do not touch `PAIRS`.
8. Closeout: Status resolved, Session IDs, Lesson, Check, Closeout SHA, conventional commit `test(adapter): prove the 0.3.0 harness and AA matrix`, annotated tag `t33-harness-proof`, push branch and tag, no merge.

## Blast radius

```
state: unbuilt (graphify-out/graph.json is missing, freshness exit 5)
seeds: none (fallback)
anchors:
  .scratch/daisyui-adapter/harness/run.mjs        <- the driver the ticket names
  .scratch/daisyui-adapter/harness/shot.mjs       <- the render reader
  packages/daisyui-adapter/cli/init.mjs           <- init and fix, under test
  packages/daisyui-adapter/targets.mjs            <- 29 components, 11 sites, 10 pairs, PAIRS read only
  packages/daisyui-adapter/dist/{map,ramp}.mjs    <- fallbacks and contrast helpers, read only
  src/lib/components/ui/*                          <- the pinned stock, read only (no edits)
  src/daisyui-theme.css                            <- the light-blue/dark-blue theme input
  src/routes/layout.css                            <- the stylesheet the CLI rewrites in the app copy
unlisted: none
fallback: rg + read over the files above
```

## Evidence schema

`evidence/33-harness-proof/`
- `run.json` from the harness, `prove.json` from the proof script
- `light.png`, `dark.png`
- `contrast.json`, `contrast.md` (matrix, ten pairs, four text tones, fill and border rows, fill-vs-page known limit, reference block)
- `checklist.md`
- `01-add-targets.log` through `12-header.txt`
- `sheet-before.svelte`, `sheet-after.svelte`
- `init-1.sha`, `init-2.sha`, `fix-1.sha`, `fix-2.sha`
- `seams.log` with the eight seam outputs

## Implementation notes

- `prove.mjs` runs with cwd = the fresh app. It finds the packed tarball, sets `DAISYUI_ADAPTER_INSTALL_SPEC` for the CLI, and runs `node <repo>/packages/daisyui-adapter/cli/init.mjs` for init and fix.
- `init` runs twice, then `sheet` is added, then `fix` runs twice, then `--check`. Each run writes its log, and the stylesheet plus the component tree get a SHA-256 tree hash.
- `contrast.mjs` reads the painted colours from `render.json`, composites the `destructive/10` and `destructive/20` rows over the page, and writes the matrix. The reference block parses the theme base colours and uses `TOKEN_FALLBACKS` for the four tones.
- `run.mjs` gains `--evidence`, `--components`, `--pin-registry`, `--contrast`; `--then` no longer requires `--add`; a non-empty `consoleErrors` fails the run.
- `pin-registry.mjs` builds a shadcn registry from the pinned `src/lib/components/ui`, and `registry.mjs` serves it, so the add writes the stock the fixer supports. The live registry drift is issue 36.
- `shot.mjs` gains `borderTopColor` and its resolved sRGB.
- The fixture imports `button`, `badge`, `alert`, `bubble`, `card`, `input` and `toggle` only, because those render the four tones in each presentation. `sheet` is deliberately not imported so it can be added late.

## Verification

- The harness exits 0 and its `run.json` records `ok: true` and empty `consoleErrors` in both schemes.
- `contrast.json` reports ten pairs and four text tones at or above 4.5 in both schemes, four borders at or above 3, the fill-vs-page rows recorded, and the reference block matching the spec numbers at L67 and L71.
- `prove.json` records `identical: true` for both init runs and both fix runs, and `sheet` missing before the add and fixed after it.
- The eight seams print their expected counts.

## Results

- Harness: `harness-run.log` exits 0. `run.json` records `ok: true`, `build: true`, steps `scaffold` through `contrast`, and `consoleErrors: []`. The add source is the pin registry (`pin-registry.mjs`, 28 items), because the live registry has moved past the pin (see `registry-drift.md`).
- Prerequisite: `prove.json` records `init.runs 2`, `init.identical true`, `sheetMissing true`, `lateAdd.stockBefore true`, `lateAdd.fixedAfter true`, `fix.runs 2`, `fix.identical true`, `fix.checkExit 0`. The header reads `components 58 fixed`.
- Matrix: `contrast.json` records `ok: true` and no failures. All ten pairs and all four text tones are at or above 4.5 in both schemes; all four borders are at or above 3. Fill-vs-page is recorded, with light warning 1.95 and dark destructive 2.89 as known limits. The reference block reproduces the published numbers: light text 8.30 / 6.91 / 8.24 / 13.49, dark text 11.28 / 13.00 / 11.88 / 8.24, light fills 2.52 / 1.95 / 2.22 and dark destructive 2.89.
- Findings: the dark filled labels use the theme's own content colors, so success 3.49, warning 1.85 and info 3.49 are below 4.5. They are recorded in `contrast.md` under Findings, not counted as matrix failures. Issue 37 tracks the init warning the spec requires.
- Evidence: `light.png`, `dark.png`, `checklist.md` (hash-equal to the harness source), `01` to `11`, `sheet-before.svelte`, `sheet-after.svelte`, `08-header.txt`, `contrast.md`, `seams.log`, `build-defect.md`, `registry-drift.md`.
- Seams: registry-16 139, registry-26 100, registry-27 64, registry-28 71, registry-29 45, registry-30 43, registry-31 82, drift 8. All exit 0.

### Defects found

- `packages/daisyui-adapter/targets.mjs` emitted the hyphenated variant keys (`outline-success`, `ghost-warning`, `link-info`, ...) unquoted, so `vite build` failed with `Unexpected token` in `button.svelte`, `badge.svelte` and `bubble.svelte`. Fixed by quoting a key that is not a valid identifier. The stock string is unchanged. Evidence: `build-defect.md`.
- The live `mira` registry serves 1.8-era stock, not the 1.7.1 pin, so a fresh `add` yields 63 `customized` sites. The harness serves the pin; issue 36 tracks the migration.

### Expectations moved

- `registry-30/variants.mjs`: the key readers accept the quoted form (`writtenKey`, the declared-key regex). Three checks read the block; the block content did not change.
- `registry-31/variants.mjs`: the same key readers, plus the bubble ghost row check. One check read the block; the block content did not change.

### Open

- Issue 36 (pin drift) blocks the 0.3.0 publish, not this ticket's chain. Issue 37 (init contrast warning) tracks the spec's missing warning.
