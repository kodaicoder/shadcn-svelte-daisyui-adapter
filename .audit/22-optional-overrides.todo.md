Phase: Implementation

# Ticket 22, overrides are optional

Ticket: `.scratch/daisyui-adapter/issues/22-optional-overrides.md` (Type: task, Status: resolved).
Base: `8b3603b`. Branch: `feat/optional-overrides`, a worktree at
`D:\Workspace\DesignSystem\New_Project-override`. The operator's test branch
`test/daisyui-adapter-0.1.0` and its uncommitted files stay untouched.

Playbook: Feature. poteto-mode drives; the ticket is the operator's request plus its own DoD.

## Plan

Matched playbook: Feature. Its steps, verbatim, then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: the subsystem is the CLI plus three test/doc files, all read in full this session.
2. `architect` for parallel design exploration.
   skip: one shape was named by the operator. The only design question was whether the CLI removes an
   existing file, and the answer is no because the file may hold the user's overrides.
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using the feature model, with a specific scope.
5. Verify on the matching surface.
6. Rebase into small, ordered commits.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. The operator named the behavior and the README requirement.
8. Run **Opening a PR**.
   skip: delivery is a branch push and a registry publish, not a PR.

Ticket steps:

- [x] CLI writes no override file and no override import
- [x] Existing file and import are left untouched
- [x] README documents opt-in overrides, with the manual import and selectors
- [x] CHANGELOG and version 0.2.0
- [x] smoke and publish-test assert the absence and the kept state
- [x] pre-publish proof with the packed 0.2.0 tarball
  `evidence/22-optional-overrides/arm-full` and `arm-missing`. The CLI prints four lines, creates no
  override file and writes no import. Six adds leave the stylesheet byte-identical, the re-run matches,
  and both arms build and render. A fresh checkout on Windows failed `pnpm pack` with
  `ERR_PNPM_BIN_CRLF`; `.gitattributes` now forces `*.mjs` to LF, and the bin checkout was regenerated.
- [ ] gate: ask before publishing 0.2.0
- [ ] publish 0.2.0, then the literal `pnpm dlx <pkg>@0.2.0 init`
- [ ] merge to `feat/daisyui-adapter`, push

## Throughput checkpoint

- Blocking first steps: the override file and import must disappear from the writer before any test can
  assert their absence. One delegate owns the six files.
- Independent workstreams: none. The CLI, README, CHANGELOG, version and tests describe one contract.
- Shared mutable state: the worktree `New_Project-override`. The operator's main worktree stays on the
  test branch, so the two never share a file.
- Smallest safe decomposition: one writer, one worktree. A split would put two agents in one package.

## Decision trail

| round | question | answer | evidence |
| --- | --- | --- | --- |
| 1 | does the CLI delete an existing 0.1.0 file and import | no: the file may hold user overrides; the README says delete both manually | ticket 14 makes the file user-owned; smoke now asserts the kept state |
| 2 | which version | 0.2.0 minor: the written bytes and the install contract change | ticket 17's version policy |
| 3 | does the output keep the override line | no: it described a file the CLI no longer creates | smoke and the README output block |
| 4 | why did the pre-publish pack fail | a fresh Windows checkout writes the bin with CRLF and pnpm refuses it; `.gitattributes` sets `*.mjs` to LF | `ERR_PNPM_BIN_CRLF` from `pnpm pack`, then a successful pack after the LF checkout |
