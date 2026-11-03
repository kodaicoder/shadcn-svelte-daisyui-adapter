Phase: feature

# Ticket 24, status tokens

Ticket: `.scratch/daisyui-adapter/issues/24-status-tokens.md` (Status: ready-for-agent, Blocked by: none).
Branch: `fix/nutchapon/ai/new-variants` (holds tickets 24-34, tag `t24-34-fix-phase-tickets`).
Playbook: Feature. poteto-mode drives; the ticket is input.

Gate record: the spec gate and the ticket gate passed before this session; the branch carries the
approved fix-phase set and tag `t24-34-fix-phase-tickets`, and the ticket carries
`Status: ready-for-agent`. No gate pass is claimed here.

## Plan

Matched playbook: Feature. Its steps, verbatim, then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: the subsystem is `dist/map.mjs`, `cli/init.mjs`, `dist/index.mjs` and one smoke file, all
   read end to end this turn, plus the spec, ADR 0001 and the glossary. Nothing left to discover.
2. `architect` for parallel design exploration.
   skip: the spec fixes the values, the count and the alias list; one shape remains (a registry row
   carrying the daisyUI source and the fixed fallback), and a second shape would be the literal-value
   design the glossary rules out ("Binding ... keeps the project's previous value as its fallback").
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using your configured feature model:
   - **Blocking first steps.** The map rows block everything: the CLI reads them and the smoke reads
     the CLI's output. One delegate owns all three files in order.
   - **Independent workstreams.** None. `map.mjs`, `init.mjs` and `smoke.mjs` are one contract.
   - **Shared mutable state.** None. The smoke writes only `$TEMP\adapter-16-smoke`; the repo
     stylesheet is copied, never edited in place. The delegate holds the branch alone.
   - **Smallest safe decomposition.** One worker (the delegate), because a split would need the other
     two files to prove anything.
5. Verify on the matching surface. The smoke run is the surface; 39/39 and the byte-identical re-run,
   with the new assertions shown to fail under sabotage.
6. Rebase into small, ordered commits. One commit for this ticket.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each
   small unit before the next.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. The spec, ADR 0001 and the glossary agree on the binding-plus-fallback shape.
8. Run **Opening a PR**.
   skip: the operator delivers by branch push and annotated tag, and forbids a merge to `develop`.
9. `code-review` on the Spec axis against this ticket.
10. Lesson and Check in the ticket.

Ticket steps, from the operator's order:

- [x] Read poteto-mode and pick the playbook, then write this plan
- [x] Claim ticket 24
- [x] Add the 7 status bindings in `:root` and `.dark` with the fixed spec fallbacks
- [x] Add the 7 `@theme inline` aliases
- [x] Confirm 32 -> 39 non-derived declarations, chart rows and existing helpers unchanged
- [x] Update the smoke: 7 bindings, 7 aliases, fixed fallbacks, count 39
- [x] Run the smoke, and `init` twice for a byte-identical result
- [x] Done: every ticket checkbox passes; text tones (25) and the fixer (26) untouched
- [x] Closeout: Status resolved, Session IDs / Lesson / Check, conventional commit
      `feat(adapter): add the status tokens`, annotated tag `t24-status-tokens`, push branch and tag
- [x] Do not merge back to `develop`

## Throughput checkpoint

- Blocking first step: the two new tables in `dist/map.mjs`. They decide the keys, the sources and the
  fallbacks, and the CLI and the smoke both read from them.
- Independent workstreams: none. One delegate owns the three files.
- Shared mutable state: none. Temp smoke directory only; the repo stylesheet is read, not written.
- Smallest safe decomposition: one worker. Every assertion depends on the CLI output, and the CLI
  output depends on the map rows.

## Decision trail

| round | question                                                        | answer                                                 | evidence                                                                                                                             |
| ----- | --------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | theme-bound binding or fixed literal                            | theme-bound with the spec value in the fallback slot   | spec L68 + L99, ADR 0001, GLOSSARY "Binding"                                                                                         |
| 2     | who writes the aliases                                          | `init`, next to `--default-border-width`               | GLOSSARY "Alias"; no alias writer exists in `dist/index.mjs`                                                                         |
| 3     | are aliases theme-gated                                         | no: written always, border stays gated                 | the tokens are written without a theme too, so their utilities must exist                                                            |
| 4     | where the status rows sit in `SINGLE`                           | after `destructive`, grouped                           | keeps `destructive` and `destructive-foreground` adjacent; no test asserts order                                                     |
| 5     | delegate was cut off by a model switch mid-write                | audit its diff myself rather than re-running the brief | the working tree held all three files; the smoke passed 72/72 before review                                                          |
| 6     | `insertThemeEntries` matches on the whole entry or the property | the property, inside the block                         | the old guard skipped on the property name, so a project's `--default-border-width: 2px` must not gain a second, winning declaration |
| 7     | aliases under no theme                                          | written, bindings already carry the fallback           | GLOSSARY "Alias"; a theme-less project still gets the seven tokens                                                                   |

## Verification evidence

- `node .scratch/daisyui-adapter/registry-16/smoke.mjs` prints `all smoke checks passed`, 87 checks.
- The themed and theme-less runs both report `39 light, 39 dark`; the second `init` is byte-identical.
- Sabotage 1: `info` fallback changed to `232.662` in `map.mjs` -> the two binding checks fail.
- Sabotage 2: alias RHS changed to `var(--${key}-x)` -> the seven alias checks fail in both runs.
- Sabotage 3: guard reverted to the whole-entry match -> the project-entry check fails.

## Review round

Two-axis `code-review` against `9bcbe48`, then the fix round.

Accepted and fixed:

- `insertThemeEntries` matched the full entry string, so a project's own `--color-success` or
  `--default-border-width: 2px` gained a second, winning declaration. Now it matches the property
  inside the block, and a smoke check plus sabotage proves it.
- The warning named `--border` on a theme-less run. It now prints the entries it could not write.
- The theme-less run never asserted the binding fallbacks, their stated purpose. Both helpers now run
  on both runs.
- `ADDED` / `ADDED_KEYS` named the ticket event. Renamed `TOKEN_FALLBACKS`, keys derived at use site.

Rejected with reason:

- Magic-number literal `39` in the smoke: the expected count is the ticket's claim, and deriving it
  from `BINDING_KEYS.length` makes the assertion follow a dropped row.
- `ADDED` as a duplicated key list: the source lives on the row and the fallback in one table, a
  normalized join. A stray key fails loudly in `targetVar`, not silently. Ticket 25's mix aliases need
  the same key list, which a `SINGLE`-only field could not hold.
- `.mjs` to `.ts`: `dist/` ships as source with no build step; accepted debt, not this ticket.
- `rebuild` preferring the project's value over the fixed fallback: that is the binding contract.
- Exact-string alias dedupe on differing whitespace: superseded by the property match above.
- `themes` as a boolean in one ternary: it is a nullable input, not a flag worth a type.
- Duplicated `blockOf` / `blockBounds`: the smoke must not share the CLI's parser, or both agree on a
  wrong read.
- Spec line 124 says 43 and 11 aliases: that is the post-ticket-25 state; ticket 24 stops at 39 and 7.
- `README.md` still prints `32 light, 32 dark`: ticket 32 owns the workflow docs, and this diff does
  not claim them.
