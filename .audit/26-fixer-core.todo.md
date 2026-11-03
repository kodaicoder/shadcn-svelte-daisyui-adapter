Phase: feature

# Ticket 26, fixer core

Ticket: `.scratch/daisyui-adapter/issues/26-fixer-core.md` (Status: ready-for-agent, Blocked by: none).
Branch: `fix/nutchapon/ai/new-variants`. Base: `3a4e1f1` (ticket 25, tag `t25-text-tones`).
Session: `ses_e5f793088ffeivY0j080ONkUda`.
Playbook: Feature. poteto-mode drives; the ticket is input.
Next ticket, untouched: `.scratch/daisyui-adapter/issues/27-fixer-safety.md`.

Gate record: the spec gate and the ticket gate passed before this session. The ticket carries
`Status: ready-for-agent` and ticket 25 is closed at `3a4e1f1`. No gate pass is claimed here.

## Plan

Matched playbook: Feature. Its steps, verbatim, then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: read end to end this turn: `cli/init.mjs`, `dist/map.mjs`, `dist/ramp.mjs`, the nine stock
   components and their class strings, spec L102-112 and L119-128, ADR 0003, the glossary terms, and
   the smoke's CLI contract. Nothing left to discover.
2. `architect` for parallel design exploration.
   skip: the shape is fixed by the spec and ADR 0003 (one target table, a per-site four-state
   matcher, the stock/fixed pair per site). The only open call was which class each site swaps to,
   settled by the measured matrix below, not by a second architecture.
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using your configured feature model:
   - **Blocking first steps.** The target table blocks everything: the module exports it, the CLI
     prints its states, the seam reads it. The stock strings and the measured pairs are the gate.
   - **Independent workstreams.** None worth a split. `component-fix.mjs`, `cli/init.mjs` and the
     seam are one contract; the seam cannot run before the CLI, and the CLI cannot import a table
     that does not exist.
   - **Shared mutable state.** One writer. The delegate holds the branch alone; the lead writes no
     repo file while it runs. The seam writes only into `$TEMP`.
   - **Smallest safe decomposition.** One worker, one commit. A second worker on the seam would
     duplicate the table's contract and race the CLI's output format.
5. Verify on the matching surface. The seam copies the real stock components into a temp project and
   drives the real CLI; the existing smoke stays green; `init` twice is byte-identical.
6. Rebase into small, ordered commits. One commit for this ticket.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each
   small unit before the next.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. The spec, ADR 0003 and the glossary fix the state model and the table.
8. Run **Opening a PR**.
   skip: the operator delivers by branch push and annotated tag, and forbids a merge to `develop`.
9. `code-review` on the Spec axis against this ticket, plus `no-comments` before it.
10. Lesson and Check in the ticket.

Ticket steps, from the operator's order:

- [ ] Read poteto-mode and pick the playbook, then write this plan
- [ ] Claim ticket 26
- [ ] Add `packages/daisyui-adapter/component-fix.mjs` with the target table: nine components,
      ten contrast pairs, stock strings copied from `src/lib/components/ui` at 1.7.1 `mira`
- [ ] Wire `cli/init.mjs`: `init` maps then fixes; add `fix [component...]` and `--dry-run`
- [ ] Four states per site, per-site application, `components.json` aliases, CRLF and Windows paths,
      no-components exits 0
- [ ] Unit seam in `.scratch/daisyui-adapter/registry-26/fix.mjs`: states, custom alias, CRLF,
      add-after-init, overwrite then fix restores, no-components, second run byte-identical
- [ ] Run the existing smoke and the seam; `init` twice byte-identical
- [ ] Done: every ticket checkbox; ten pairs pass 4.5 in both schemes; no new dependency; tickets
      27-34 untouched
- [ ] Closeout: Status resolved, Session IDs / Lesson / Check, conventional commit
      `feat(adapter): add the component fixer`, annotated tag `t26-fixer-core`, push branch and tag
- [ ] Do not merge back to `develop`
- [ ] `deslop` before commit

## Throughput checkpoint

- Blocking first step: the target table in `component-fix.mjs`. The exact stock and fixed strings,
  and the ten measured pairs, decide everything downstream.
- Independent workstreams: none. One delegate owns the module, the CLI and the seam.
- Shared mutable state: the branch. One writer; the lead reviews the diff after the delegate stops.
- Smallest safe decomposition: one worker. The seam cannot exist before the CLI's output contract.

## The ten pairs and the class each site swaps

Measured against the reference theme (`registry-12/probe-theme.css`): light `base-100` white,
dark `base-100` `oklch(25.33% 0.016 252.42)`, brand `secondary` / `accent` / `error` as the file
holds them. Ratios are WCAG 2.x, alpha composited in sRGB.

| #   | site                 | stock                                   | fixed                                               | pair                                    | light | dark  |
| --- | -------------------- | --------------------------------------- | --------------------------------------------------- | --------------------------------------- | ----- | ----- |
| 1   | dialog close         | `bg-secondary`                          | `bg-muted`                                          | foreground on muted                     | 16.74 | 15.62 |
| 2   | sheet close          | `bg-secondary`                          | `bg-muted`                                          | foreground on muted                     | 16.74 | 15.62 |
| 3   | calendar day hover   | `hover:bg-accent/50`                    | `hover:bg-accent`                                   | accent-foreground on accent             | 5.08  | 5.08  |
| 4   | range day hover      | `hover:bg-accent/50`                    | `hover:bg-accent`                                   | accent-foreground on accent             | 5.08  | 5.08  |
| 5   | range middle         | `bg-accent` + `dark:hover:bg-accent/50` | adds `text-accent-foreground`, hover to full accent | accent-foreground on accent             | 5.08  | 5.08  |
| 6   | dropdown destructive | `text-destructive`                      | `text-destructive-text` + shortcut rule             | destructive-text on destructive/10, /20 | 8.28  | 7.73  |
| 7   | context destructive  | same                                    | same                                                | same                                    | 8.28  | 7.73  |
| 8   | menubar destructive  | same, `!` on svg                        | same, `!` on svg                                    | same                                    | 8.28  | 7.73  |
| 9   | chart tooltip label  | `text-muted-foreground`                 | `text-foreground`                                   | foreground on background                | 17.73 | 14.75 |
| 10  | bubble muted         | `bg-muted`                              | `bg-muted` + `text-foreground`                      | foreground on muted                     | 16.74 | 15.62 |

Stock values before the fix that fail: close 4.83 light / 3.42 dark; calendar and range hover 6.74
light / 1.89 dark; range middle text 9.29 light / 1.78 dark; destructive shortcut 8.74 light /
1.43 dark; muted bubble and chart tooltip passed no text pair before because neither set a text
token, so the fix states the token explicitly and the pair becomes measurable.

`secondary-content` on `secondary` is 3.05 in both schemes on this theme, so it cannot carry the
close button; `foreground` on `secondary` is 4.83 / 3.42. The chip moves to the muted surface, which
is the same surface the ghost variant already paints on hover.

## Decision trail

| round | question                                                | answer                                                                                                                                               | evidence                                                                                                                                               |
| ----- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | where the fixer lives                                   | `packages/daisyui-adapter/component-fix.mjs`, imported by the CLI                                                                                    | the spec and ADR 0003 name the file; ticket 27 makes it the manifest                                                                                   |
| 2     | how a site two files wide is represented                | one row per replacement site, pairs reference row ids                                                                                                | the state model is per site, so a pair that spans the item and the shortcut must not collapse into one row                                             |
| 3     | how the close button clears AA                          | move the chip from `secondary` to `muted`                                                                                                            | no token reaches 4.5 on `secondary` (best is 3.05); foreground on muted is 16.74 / 15.62                                                               |
| 4     | how the range middle clears AA                          | `text-accent-foreground` on the cell, and the dark hover to full `accent`                                                                            | inherited base-content is 1.78 dark; accent/50 with accent-content is 1.89 dark                                                                        |
| 5     | how the destructive shortcut clears AA                  | item text and shortcut to `destructive-text`, shortcut rule from the item with `!`                                                                   | accent-foreground on destructive/10 is 1.43 dark; stacked group variants do not select one element                                                     |
| 6     | how idempotency survives a class that is added mid-list | each stock string carries the next token as an anchor, so `fixed` never contains `stock`                                                             | a bare `bg-accent` stock would match inside its own fixed string and append on every run                                                               |
| 7     | how the alias resolves                                  | the project's `package.json` `imports` first, then known SvelteKit lib roots (`$lib`, `#lib` to `src/lib`, `@/`, `~/` to `src/`), else `src/<alias>` | components.json in this repo holds `#lib/components/ui`; a `#` alias is a subpath import that can point anywhere, so the convention is only a fallback |
| 8     | what a missing component prints                         | per-site `missing`, exit 0, no file created; a named component still prints its row                                                                  | ticket 26 line 12 and spec L110; a user who named it asked about it                                                                                    |
| 9     | chart and bubble pairs                                  | explicit text tokens, not inherited                                                                                                                  | neither variant set a color, so the pair was not measurable; both now are                                                                              |

## Verification evidence

- `node .scratch/daisyui-adapter/registry-26/fix.mjs`: `all fix checks passed`, 99 checks, exit 0.
  Covers the table shape (9/11/10), the alias rules including a `package.json` subpath import, a fresh
  stock tree fixed by `init`, the second run byte-identical, one hand-edited site beside one stock
  site in the same file, `--dry-run` writing nothing, `fix dialog` touching one file, a deleted
  component reported `missing` and not created, add-after-init, an overwritten file restored, the
  no-components `init`, the CLI argument contract, a custom `$lib` alias, CRLF preserved, `init`
  twice, and the ten WCAG rows.
- The ten measured pairs, both schemes: dialog and sheet close 16.74 / 15.62; calendar and range
  hover 5.08 / 5.08; range middle 5.08 / 5.08; the three destructive rows 8.28 / 7.73; chart tooltip
  17.73 / 14.75; bubble muted 16.74 / 15.62. Every row at or above 4.5.
- `node .scratch/daisyui-adapter/registry-16/smoke.mjs`: `all smoke checks passed`, 139 checks,
  exit 0, `43 light, 43 dark`, byte-identical `init`, no other assertion moved.
- The invariant behind idempotency is asserted directly: no fixed string is contained in its own
  stock string, so a stock file cannot report `fixed` before it is patched.
- `pnpm exec prettier --check` on the three package files and the seam: clean.

## Review round

`no-comments` on the three files: 22 comment lines deleted, 3 corrected, 5 kept. Two `MUST KILL`s.

- `SITES` anchor invariant: rejected. The claim was that no check stands behind it; the fresh-tree
  assertion catches a fixed string that is contained in its stock string (the site would report
  `fixed` and never be written), and the seam now asserts the invariant directly. The rewrite it
  proposed is an application change, out of scope for a comment pass.
- `resolveAlias` hardcoded roots: accepted, narrowed. A `#` alias is a `package.json` subpath import
  and can point anywhere, so the fixer now reads the project's own `imports` map first and only
  falls back to the conventions. One seam check pins a remapped `#app/*` to `src/design/*`.

`code-review`, two axes against `3a4e1f1` (working tree). Standards reviewers found no documented
violation; three judgement calls were left as they stand (the pair table is required by the ticket
and read by the contrast test, the duplicate stock shapes are below the rule of three, and the
`SITES`/`PAIRS` split keeps the fixer table from carrying the contrast proof).

Spec reviewer: most findings name ticket 27's contract (manifest, version and style guard, `--check`,
`--strict`, header count). Those are out of scope by the operator's order. Its scope-creep claim that
the seam covers version/style refusal, `--check`, `--strict` or a header count is refuted: a grep of
`.scratch/daisyui-adapter/registry-26/fix.mjs` finds none of them. Its one real observation, that
the ten pairs are text pairs with no border row, is the design call recorded above: the 3:1 border
is the filled variant's boundary, and no filled tone variant exists until tickets 30 and 31, so
ticket 26 cannot measure it. That stays open for 33's matrix.
