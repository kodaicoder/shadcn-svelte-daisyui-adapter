Phase: Implementation

# Ticket 17, package identity, version policy and publish path

Ticket: `.scratch/daisyui-adapter/issues/17-public-hosting.md` (Type: task, Status: open, Blocked by: 08, 16).
Base: `61333e9` (tag `t21-chart-no-theme-fallback`). Branch: `feat/daisyui-adapter`.
Playbook: Feature. poteto-mode drives; the ticket is input. Not `sdlc`, not `implement`.

Gate record: no `.scratch/daisyui-adapter/spec.md` and no `Status: ready-for-agent` ticket in this feature.
`map.md` is the standing spec artifact. This ticket runs on the operator's explicit instruction and its own
DoD. No gate pass is claimed.

Chosen identity (operator, this session): `@kodaicoder/shadcn-svelte-daisyui-adapter`, bin
`daisyui-adapter`. The operator picked the scoped option and wrote the full scoped name in the note; the
note wins. Confirm before the publish gate, not now.

Worktree: the code delegate writes in `D:\Workspace\DesignSystem\New_Project-t17` (sibling, branch
`t17-work` off `61333e9`), merged back fast-forward and removed at closeout. Nothing outside the worktree
is written while it runs.

## Plan

Matched playbook: Feature. Its steps, verbatim, then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: the subsystem is six files, 400 lines total, already read in full this session (`cli/init.mjs`,
   `dist/index.mjs`, `dist/map.mjs`, `dist/ramp.mjs`, `package.json`, `registry-16/smoke.mjs`). A re-read
   buys nothing.
2. `architect` for parallel design exploration.
   skip: the design space is the three calls the ticket enumerates, each with a measured constraint, and
   the code change is inside one file plus one manifest. Parallel designs would restate the same three
   options.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single
   file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Delegate code-writing to a subagent using your configured feature model (default in poteto-mode's Models section) with a specific scope (file paths, named data shape and its organizing structure per **principle-model-the-domain**, a state machine over scattered booleans, a table/registry over branching, a typed model over repeated shape assumptions, chosen before the delegate writes logic, and success criteria). Pick each subagent's reasoning level for the job, per the Subagents section. When the implementation admits multiple valid shapes (error handling, abstraction layer, test structure), delegate via the **arena** skill instead so the runners surface the alternatives and the cross-judge guards the pick. Mandatory: no skip-with-reason escape, and Laziness Protocol does not override it (the gain is review separation, not lines saved). A subagent forbidden to spawn satisfies this by owning the diff directly with the same review separation. No "standing by" reply that waits on a nested agent. **Give every file-writing delegate its own worktree** (spawn it with `isolation: "worktree"`, or hand it an exclusive branch), and do not write files or run a suite in a worktree a delegate still holds. On Claude Code, `isolation: "worktree"` branches from the remote default branch unless the `worktree.baseRef` setting is `"head"`. When the delegate builds on commits the default branch lacks, commit them, create its worktree with `git worktree add <path> -b <delegate-branch> HEAD`, and name that base commit in the brief. Fencing a file in the brief's prose is not a lock (**principle-separate-before-serializing-shared-state**). Comments per **Comments**. Surgical edits, re-ground against the source for upstream-derived files. Port shared-primitive improvements to all consumers and verify each. Commit liberally.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits. Stack follow-ups.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each small unit before the next.
7. If the design is contested, `interrogate` before shipping.
   skip: no contested choice. Each call is backed by a measurement (404s, the missing scripts block, the
   duplicate header, the missing self-install) or by the operator's explicit pick.
8. Run **Opening a PR**.
   skip: this feature delivers by push and tag, not a PR. `main` is the base branch and the delivery rule
   excludes it, so a PR has no merge target (same as ticket 21).

Ticket steps, from the order given with the ticket:

- [x] Step 1: measure the `prepare: tsc` claim from the file before proposing a publish path
- [x] Step 2: one identity list drives package name, bin, `PLUGIN`, `HEADER`, self-install, docs
- [x] Step 3: publish path decided and written, with the build claim corrected
- [x] Step 4: version policy, including what the CLI does on an older and a newer header
- [x] Step 5: licence and changelog policy recorded
- [x] Step 6: pack and prove the path on a fresh scaffold with the tarball
- [x] Gate: stop and ask before the first publish
  Pre-publish evidence: `evidence/17-public-hosting/arm-full` (self-install from the tarball, 32/32,
  six adds unchanged at `fea1e298…`, build true, render 200) and `arm-missing` (same install, theme
  deleted, build true, render 200, the project's own palette). Tarball contents checked: 8 files,
  `dist` + `cli` + the three docs, no tests, no scratch. The operator approved the publish.
- [x] Step 7: publish, then `pnpm dlx <pkg>@<exact> init` on a clean scaffold, transcript kept
  Published 2026-11-02 as `@kodaicoder/shadcn-svelte-daisyui-adapter@0.1.0`. The literal command ran
  from the registry in `evidence/17-public-hosting/arm-registry`: self-install, 32/32, six adds
  unchanged at `fea1e298…`, build true, render 200. The first PUT required an OTP; the org is
  `@kodaicoder`, owned by `nutchyleo123`.
- [x] DoD 2: package name and version policy in `map.md` Decisions so far
- [ ] code-review on the Spec axis against `61333e9`
- [x] Lesson and Check, two lines
- [ ] cleanup, conventional commit, annotated tag `t17-public-hosting`, push
- [ ] Do not merge to main. Do not touch the registry-10/11/14 fixtures. No publish without approval.

## Throughput checkpoint

- Blocking first step: the identity. Every written byte (plugin line, header, install spec) derives from
  it, so no code lands until the name is fixed. The name is fixed.
- Independent workstreams: the package manifest and docs on one side, the CLI writer on the other. One
  delegate owns both, because the CLI reads the manifest; a second writer would race the same files.
- Shared mutable state: `packages/daisyui-adapter/` and `registry-16/smoke.mjs`. One writer, one worktree.
  The harness runs after the merge, alone, because it owns the ports and `$TEMP\adapter-harness`.
- Smallest safe decomposition: one delegate for the code, then this session for verification and the
  records. The change is one file of logic plus a manifest, and a split would put two agents in one
  package.

## Decision trail

| round | question | answer | evidence |
| --- | --- | --- | --- |
| 1 | is 08's `prepare: tsc` a stale claim or a build never ported | never ported: no `scripts`, no tsconfig, no TypeScript, `dist/*.mjs` hand-written in `5bff288` | `registry-16/package/` listing and `git log -- registry-16/package` |
| 2 | where does the package ship from | `packages/daisyui-adapter/` in this repo, one workspace member | root `package.json` is a SvelteKit library named `new-project`; the remote is already the adapter repo; source lived only in scratch |
| 3 | package name | `@kodaicoder/shadcn-svelte-daisyui-adapter`, bin `daisyui-adapter` | operator pick plus note; registry 404 for every candidate |
| 4 | version policy | semver 0.x; patch changes no written bytes, minor is a mapping or shape change and needs a re-run, major is a contract change; header pins the exact re-run command | 14 §4 one drift axis; 21's shape change is the first minor |
| 5 | older header | re-run and print the version change; a bare pre-21 chart row is warned about, never claimed as recovered | 21 limit 2: the old writer destroyed the row |
| 6 | newer header | refuse with E4 and write nothing | an older CLI must not rewrite a newer stylesheet |
| 7 | self-install | the CLI runs `pnpm add -D <pkg>@<version>` when node_modules does not hold its version; `DAISYUI_ADAPTER_INSTALL_SPEC` lets the pre-publish tarball test drive the same branch | 07 §3.5 and 08 §2.5 require it; the 16 CLI omitted it |
| 8 | licence | MIT | convention for this ecosystem; recorded in 17 |
