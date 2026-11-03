Phase: Implementation

# Ticket 23, brand secondary and accent

Ticket: `.scratch/daisyui-adapter/issues/23-brand-secondary-accent.md` (Type: task, Status: resolved).
Base: `675bf01`. Branch: `feat/brand-secondary-accent`, a worktree at
`D:\Workspace\DesignSystem\New_Project-map`. The operator's test branch and its uncommitted files stay
untouched.

Playbook: Feature. poteto-mode drives; the operator named the mapping and asked for the component list.

## Plan

Matched playbook: Feature. Its steps, verbatim, then the ticket's steps.

1. `how` over the affected subsystem.
   skip: the mapping is one table in `dist/map.mjs`, the consumers are the component files, both read.
2. `architect` for parallel design exploration.
   skip: the operator named the table change; the only decision is the component warning, measured.
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using the feature model, with a specific scope.
   skip: the change is one table plus a version and a changelog, under the direct-execution threshold.
5. Verify on the matching surface.
6. Rebase into small, ordered commits.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested; the operator asked for it and the contrast table states the cost.
8. Run **Opening a PR**.
   skip: delivery is a branch push; the publish waits for the operator's visual check.

Ticket steps:

- [x] `dist/map.mjs`: secondary, secondary-foreground, accent, accent-foreground
- [x] `accent` moves from MIX to SINGLE; `--daisy-derived-accent` disappears
- [x] version 0.3.0 and CHANGELOG
- [x] smoke assertions for the four sources and the helper absence
- [x] ticket 23 and the map line
- [ ] operator visual check of the component list
- [ ] publish 0.3.0 after the check

## Throughput checkpoint

- Blocking first steps: the table change, then the smoke that reads the written bytes.
- Independent workstreams: none. The map, the version and the checks describe one contract.
- Shared mutable state: the worktree `New_Project-map`. The operator's test branch stays separate.
- Smallest safe decomposition: one writer, one worktree.

## Decision trail

| round | question | answer | evidence |
| --- | --- | --- | --- |
| 1 | keep the accent mix | no: the operator asked for the brand token; the mix row becomes a single read | map table and the contrast measurement |
| 2 | does the binding count change | no: accent moves from MIX to SINGLE, so 27 + 5 stays 32 | smoke's `32 light, 32 dark` |
| 3 | which components need a visual check | the list in ticket 23; two uses still fail on the adjusted theme | measured: dialog/sheet close 1.47 in dark, calendar hover 2.30 in light |
| 4 | publish now | no: the operator will visualise first | branch only |
