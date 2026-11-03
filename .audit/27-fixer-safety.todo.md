Phase: feature

# Ticket 27, fixer safety and contract

Ticket: `.scratch/daisyui-adapter/issues/27-fixer-safety.md` (Status: ready-for-agent, Blocked by: 26).
Branch: `fix/nutchapon/ai/new-variants`. Base: `99e8cad` (ticket 26 closed at `5243cd4`, tag `t26-fixer-core`).
Next ticket, untouched: `.scratch/daisyui-adapter/issues/28-radius-form.md`.
Playbook: Feature. poteto-mode drives; the ticket is input.

Gate record: the spec gate and the ticket gate passed before this session. The ticket carries
`Status: ready-for-agent` and ticket 26 is closed. No gate pass is claimed here.

## Plan

Matched playbook: Feature. Its steps, verbatim, then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: read end to end this turn: `component-fix.mjs`, `cli/init.mjs`, spec L102-112 and L119-128,
   ADR 0003, the glossary terms, the `registry-26` seam (100 checks) and the `registry-16` smoke
   header contract. The stock baseline is measured below, not assumed.
2. `architect` for parallel design exploration.
   skip: the shape is fixed by spec L104-112 and ADR 0003 (one manifest, four states, two guard
   reads, the marker after the fixer). The calls below are contract semantics, settled by the
   ticket's own sentences, not by a second architecture.
3. Write the throughput checkpoint as four todo items.
   - **Blocking first steps.** `targets.mjs` (the manifest) blocks the fixer, the CLI and every
     test. The guard blocks any `--check`/`--strict` assertion, because a refusal must happen
     before a report exists.
   - **Independent workstreams.** None worth a split. The manifest, the guard, the two flags, the
     marker and the seam are one contract, written by one owner on one branch. The drift test is
     independent of the CLI and lands first, because it proves the baseline below.
   - **Shared mutable state.** One writer. The delegate holds the branch alone; the lead writes no
     repo file while it runs. The seams write only into `$TEMP`.
   - **Smallest safe decomposition.** One worker, one commit. A second worker on the seam would
     race the CLI's report format and duplicate the manifest's contract.
4. Delegate code-writing to a subagent using the feature model
   (`opencode-go/deepseek-v4.1-flash#high`), with the data shape and success criteria below.
5. Verify on the matching surface. `registry-26/fix.mjs` (100 checks), `registry-16/smoke.mjs`
   (139 checks), the new `registry-27/safety.mjs`, and the drift test against the real pinned
   components. Measured baseline: 11 sites across 10 files, every stock string present today.
6. Rebase into small, ordered commits. One commit for this ticket.
   Use the **sequence-verifiable-units** principle skill: each verification unit below is checked
   before the next.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. ADR 0003 and spec L104-112 fix the state model, the guard and the marker.
8. Run **Opening a PR**.
   skip: the operator delivers by branch push and annotated tag, and forbids a merge to `develop`.
9. `code-review` on the Spec axis against this ticket, plus `no-comments` before it.
10. Lesson and Check in the ticket.

## Decisions

- **Manifest.** `packages/daisyui-adapter/targets.mjs` exports one `TARGETS` object holding
  `supported` (`{ style: 'mira', version: { major: 1, minor: 7 } }`), `components`, `sites`,
  `pairs`, plus the named exports `COMPONENTS`, `SITES`, `PAIRS` and `SUPPORTED`.
  `component-fix.mjs` re-exports the three arrays, so `registry-26` keeps importing the same names.
  `targets.mjs` joins `files` in package.json.
- **Version read order.** `node_modules/shadcn-svelte/package.json`, then the project
  `package.json` dependency range. A missing or unparseable version warns and continues, because
  shadcn-svelte is a `dlx` CLI and many projects never list it; an unsupported style or a parsed
  version outside 1.7.x throws. The style has no fallback: it is a file in the project.
- **Guard scope.** The guard runs when the run's scope holds at least one present target file.
  `init` with no component present stays a map-only run that exits zero, as spec L110 requires.
- **Flag semantics.** `--check` and `--strict` never write (not the components, not the marker).
  `--check` exits 1 only when a stock site remains. `--strict` exits 1 on a customized site and on
  a component named on the command line whose sites are all missing. They compose: `--check
  --strict` applies both rules. `--dry-run` keeps ticket 26's exit 0 and gains no write when
  combined with either.
- **Marker ownership.** `init` runs the fixer first, counts fully fixed files, then writes the
  stylesheet once with the marker. A write-mode `fix` recomputes the count and replaces an existing
  marker; it never creates one on a stylesheet the adapter did not write.
- **Drift test and CI.** The repo has no CI at all, so "repo CI drift test" needs a real runner.
  `packages/daisyui-adapter/test/drift.mjs` (node builtins only, reads the pinned
  `src/lib/components/ui`) plus `.github/workflows/adapter-drift.yml` running it on push and pull
  request. No install step: the test reads committed files, so CI stays fast and lockfile-free.
  The runtime guard stays the user-machine half.
- **Seam fixtures move with the contract.** `registry-26/fix.mjs` and `registry-16/smoke.mjs`
  gain `style: "mira"` and a `node_modules/shadcn-svelte` 1.7.1 stub in their scaffolds, and the
  smoke `headerLines` regex accepts the optional `components <n> fixed |` segment. Their checks
  stay as they are.

## Ticket steps

- [x] Read poteto-mode and pick the playbook, then write this plan
- [x] Claim ticket 27 (`ses_e5f548125ffeDlPDLsm8c0bUgJ`)
- [x] `targets.mjs`: one manifest, re-exported by `component-fix.mjs`, listed in package.json
- [x] Version and style guard: style from components.json, version from node_modules then
      package.json, unsupported pair exits with a clear message, unreadable version warns,
      no-component init stays map-only
- [x] `--check` and `--strict` with the defined exit rules, no writes, defined with `--dry-run`
- [x] Header marker: `components <n> fixed`, fully fixed files only, mixed excluded, no-op
      byte-identical, `HEADER_PATTERN` reads old and new, `smoke.mjs` headerLines updated
- [x] Drift test against the pinned stock components, plus the CI workflow and its reason
- [x] Tests: refusal, manifest shape, `--check`, `--strict`, header count, mixed file, no-op fix
- [x] `registry-26` and `registry-16` seams green after their fixture updates
- [x] No radius, variants, docs, harness, release work; no new dependency
- [x] Closeout: Status resolved, Session IDs, Lesson, Check, conventional commit, annotated
      `t27-fixer-safety` on that commit, push branch and tag, no merge to develop

## Result

- Implementation owner: `ses_e5f5055a7ffeXrdDdxQ3Vlif2z`. Lead review found one real defect:
  `fix --dry-run` still reached `updateHeader`, so a stale marker could be rewritten while the
  report said nothing was written. Fixed by gating the header on the same `write` flag, with a
  regression check that restores a stock file after `init` so the count is stale. Mutation run:
  the check fails on the old code (`components 9 fixed`) and passes after the fix.
- The new seam also asserts the marker rewrite leaves every other stylesheet byte intact.
- Review gate: the independent `comment-sicko` pass was cancelled by the operator after a hang.
  The lead did the comment and Spec-axis review instead. Recorded as `BLOCKED: independent review`
  for that pass, so it is not claimed. No comment was deleted; one pointer sentence was trimmed.
- Verification: `registry-26` 100 checks, `registry-16` 139, `registry-27` 53, drift 9. All exit 0.

## Delegation brief (blocking scope)

Files the delegate may write: `packages/daisyui-adapter/targets.mjs` (new),
`packages/daisyui-adapter/component-fix.mjs`, `packages/daisyui-adapter/cli/init.mjs`,
`packages/daisyui-adapter/package.json` (the `files` array only),
`packages/daisyui-adapter/test/drift.mjs` (new),
`.scratch/daisyui-adapter/registry-27/safety.mjs` (new),
`.scratch/daisyui-adapter/registry-26/fix.mjs` (scaffold only),
`.scratch/daisyui-adapter/registry-16/smoke.mjs` (scaffold and `headerLines` only),
`.github/workflows/adapter-drift.yml` (new), `package.json` (one `test:adapter` script).

Out of scope: `src/lib/components/ui`, radius, variants, docs, `dist`, CHANGELOG, release.
