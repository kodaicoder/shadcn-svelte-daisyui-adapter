Phase: feature

# Ticket 25, text tones

Ticket: `.scratch/daisyui-adapter/issues/25-text-tones.md` (Status: ready-for-agent, Blocked by: 24, closed at 47f296a).
Branch: `fix/nutchapon/ai/new-variants`. Base: `47f296a`.
Session: `ses_e5f8863c3ffejT9Kc9zJQtIiBg`.
Playbook: Feature. poteto-mode drives; the ticket is input.

Gate record: the spec gate and the ticket gate passed before this session. The ticket carries
`Status: ready-for-agent` and ticket 24 is closed at `47f296a`. No gate pass is claimed here.

## Plan

Matched playbook: Feature. Its steps, verbatim, then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: the subsystem is `dist/map.mjs`, `cli/init.mjs` and one smoke file, all read end to end this
   turn, plus the spec (L67-72), ADR 0001, the glossary and ticket 24's diff. Nothing left to discover.
2. `architect` for parallel design exploration.
   skip: one shape remains (a derived row over two bindings), and the spec fixes the expression, the
   40/60 split, the count and the alias list. A second shape is the literal-value design the glossary
   rules out ("Binding ... keeps the project's previous value as its fallback").
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using your configured feature model:
   - **Blocking first steps.** The text-tone row in the map blocks the CLI and the smoke.
   - **Independent workstreams.** None. `map.mjs`, `init.mjs` and `smoke.mjs` are one contract.
   - **Shared mutable state.** None. The smoke writes only `$TEMP\adapter-16-smoke`; the repo
     stylesheet is copied, never edited in place. The delegate holds the branch alone.
   - **Smallest safe decomposition.** One worker (the delegate), because a split would need the other
     files to prove anything.
5. Verify on the matching surface. The smoke run is the surface: 43/43, the four text tones and their
   aliases in both blocks, the byte-identical re-run, and a sabotage run shown to fail.
6. Rebase into small, ordered commits. One commit for this ticket.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each
   small unit before the next.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. The spec, ADR 0001 and the glossary agree on the tone-mixed-with-foreground
   expression, and the ticket names the exact value.
8. Run **Opening a PR**.
   skip: the operator delivers by branch push and annotated tag, and forbids a merge to `develop`.
9. `code-review` on the Spec axis against this ticket. The review loop (critical-path) is
   `skip: mechanical token rows, no auth/payments/schema/concurrency/shared state`.
10. Lesson and Check in the ticket.

Ticket steps, from the operator's order:

- [x] Read poteto-mode and pick the playbook, then write this plan
- [x] Claim ticket 25
- [x] Add the 4 text tones in `:root` and `.dark` as the 40/60 mix with `--foreground`, each with a
      derived helper, after the mix rows
- [x] Add the 4 `@theme inline` aliases through `TOKEN_FALLBACKS`
- [x] Confirm 39 -> 43 non-derived declarations, chart rows and ticket 24's status bindings unchanged
- [x] Update the smoke: 4 bindings, 4 helpers, 4 aliases, fallbacks, count 43, no border token
- [x] Run the smoke, and `init` twice for a byte-identical result
- [x] Done: every ticket checkbox passes; text and border share `--<tone>-text`; the fixer (26) untouched
- [x] Closeout: Status resolved, Session IDs / Lesson / Check, conventional commit
      `feat(adapter): add the text tones`, annotated tag `t25-text-tones`, push branch and tag
- [x] Do not merge back to `develop`
- `deslop` before commit.
  skip: the diff passed `no-comments`, the standards review and prettier on the three files, and it adds
  no defensive branch, dead path, or narration comment to remove.

## Throughput checkpoint

- Blocking first step: the text-tone row table in `dist/map.mjs`. It decides the keys, the expression
  and the fallbacks, and the CLI and the smoke both read from it.
- Independent workstreams: none. One delegate owns the three files.
- Shared mutable state: none. Temp smoke directory only; the repo stylesheet is read, not written.
- Smallest safe decomposition: one worker. Every assertion depends on the CLI output, and the CLI
  output depends on the map row.

## Decision trail

| round | question                                                             | answer                                                                  | evidence                                                                                                              |
| ----- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 1     | daisy-source mix row or a row over bindings                          | a new `TEXT_TONE` row over bindings, `var(--<tone>)` and `var(--foreground)` | ticket L12 names `var(--<tone>)`; a daisy-source row would bypass a project's own `--success` override                |
| 2     | what the fallback slot holds                                         | the same 40/60 expression                                              | a text tone has no stock value, and the expression resolves without a theme through the status fallback (spec L68)     |
| 3     | where the text tones join `BINDING_KEYS`                             | appended after the mix rows                                            | keeps every existing row's position, so the diff is append-only                                                       |
| 4     | how the aliases pick up the four keys                                | the fallback table, which the alias list already reads                 | `cli/init.mjs` L282 maps `Object.keys(TOKEN_FALLBACKS)`; one list drives aliases and fallbacks                        |
| 5     | a border token for the filled variants                               | none; the text token is the border token                               | ticket L14 and spec L71; the smoke asserts no `--<tone>-border` name                                                  |
| 6     | the brief's template omitted the second weight                       | both weights live in the row, `['success', 40, 'foreground', 60]`      | the ticket requires the literal `60%`; omitting it relies on CSS's remainder rule and fails the smoke's literal assertion |
| 7     | derived helpers without a theme                                      | 8, not 13                                                              | the chart rows are not wrapped without a theme, so only the 4 mix and 4 text helpers exist                              |
| 8     | the border check's name after review                                 | names what it proves, not what ticket 30 will do                      | the assertion proves no separate token; the border class is tickets 30 and 31                                          |

## Verification evidence

- `node .scratch/daisyui-adapter/registry-16/smoke.mjs` prints `all smoke checks passed`, 139 checks,
  exit 0. Both runs report `43 light, 43 dark`; the second `init` is byte-identical.
- Base-vs-head on one input: the base tree at `47f296a` and the working tree each ran `init` over the
  same `src/routes/layout.css` and probe theme (`$TEMP\t25-verify`). The site diff is exactly 8 added
  declarations per block (4 bindings, 4 helpers) and 4 aliases. Every status binding, mix row and chart
  row is unchanged.
- The written block: `--success-text: var(--daisy-derived-success-text, color-mix(in oklch, var(--success) 40%, var(--foreground) 60%));`
  with `--daisy-derived-success-text` holding the same mix, and `--color-success-text` in `@theme inline`.
- Sabotage 1: `success-text` weights changed to 41/59 in `map.mjs` -> 8 checks fail (binding and helper,
  both slots, both runs).
- Sabotage 2: the alias RHS changed to `var(--${key}-x)` in `init.mjs` -> 22 checks fail, the four text
  aliases and the seven status aliases in both runs.
- Derived helpers per block: 13 with a theme (4 mix, 5 chart, 4 text), 8 without one (the chart ramp
  needs a theme). Asserted per slot in both runs.
- `pnpm exec prettier --check` on the three files: `All matched files use Prettier code style!`

## Review round

`code-review` two axes against `47f296a` (working tree; no commits on top), reviewers on
`muse-spark-1.3-contributor` (Standards) and `gpt-6.1-terra` (Spec).

Standards: no documented violation. One judgement call, no action: the `isMix ? mixValue : textToneValue`
branch is a two-way dispatch with one predicate, matching the existing `SINGLE[key]` / `else` shape.

Spec: one finding, accepted and fixed. The border check's name claimed the text token *is* the border
token, while the assertion only proves no separate border token is written. Renamed to
`the text tones introduce no separate --<tone>-border token`, which is what ticket 25 can prove; binding
the border class to the text token is tickets 30 and 31. Smoke re-run green.

`no-comments`: 3 hunks, 4 comment lines deleted. Two accepted (restatement of `var(--<tone>)` sources and
of the spread that builds the fallback). One rejected and restored: the CLI's read-back comment states
why the count comes from the file on disk, not from the intended data, and this ticket only changes its
number. `MUST KILL`: none.
