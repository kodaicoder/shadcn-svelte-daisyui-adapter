Phase: Implementation

# Ticket 11, non-colour tokens

Ticket: `.scratch/daisyui-adapter/issues/11-non-colour-tokens.md` (grilling, five decisions).
Base: `349c212` (tag `t10-sidebar-mapping`). Branch: `feat/daisyui-adapter`.
Playbook: `skip: no bundled poteto playbook matches a decision-only ticket; the ticket's own DoD drives`.

## Plan

- [x] Read 11, map, 02, 01, 03, 10, `evidence/10-sidebar/`, the harness, and the published style CSS
- [x] Settle decision 1, how the three daisyUI radii collapse into `--radius`
- [x] Settle decision 2, whether the shadcn 0.6 to 2.6 scale stays
- [x] Settle decision 3, `--border`
- [x] Settle decision 4, `--depth` and `--noise`
- [x] Settle decision 5, `--size-selector` and `--size-field`
- [x] Settle 02's required-key disagreement without editing 02, and name the list 16 inherits
- [x] Extend `harness/shot.mjs` with `borderRadius` and `borderWidth` per sampled element, plus height and background image, which decision 5 needs
- [x] Build `registry-11/`: probe theme, border-less twin, probe package, item, apply script, page, `check.mjs`
- [x] Run `harness/run.mjs` twice on ports 5199 and 5209, kill every server it starts. Two item shapes failed first: an `@theme inline` key in the registry `css` map (`Unknown word var`), and a page that called `Card.Root` on the `Card` default export instead of a namespace. Both fixed before the cited runs, `2026-10-29T07-57-17-039Z` and `2026-10-29T07-57-58-230Z`
- [x] Copy cited artefacts to `evidence/11-non-colour-tokens/`, re-run `check.mjs` against the copies (74 pass)
- [x] Write `## Answer`, `Status: resolved`, `Lesson:` and `Check:` in the ticket
- [x] Append one line to `## Decisions so far` in `map.md`
- [x] `no-comments`: `comment-sicko` is not installed on this runtime, so one labelled comments-only pass with `subagents/code/reviewer`. Two findings accepted and deleted, eleven kept.
- [x] `code-review` on the Spec axis against `349c212`: nine findings, all accepted and fixed (the 28 variables vs 32 keys wording, 02's `color-scheme` tolerance, the failed-log citation, the ignored-token scan now covering the compiled CSS, four number and wording corrections, the map's registry `css` map phrasing)
- [x] `deslop`: no casts, no defensive branches; one magic `16` named as `ROOT_PX`
- [x] Conventional commit `eeed928` on `feat/daisyui-adapter`, tag `t11-non-colour-tokens`, both pushed, no merge to main
- [x] Follow-up `4f8126c`: re-encode `evidence/11-non-colour-tokens/check.txt` from UTF-16LE to UTF-8, which the PowerShell redirect had produced. Git had it as binary; `check.mjs` still passes all 74 against the committed copy.
- [x] Leftovers cleared: my six harness runs under `harness/runs/` and the 129 MB temp project it kept are gone, no server on 5199 or 5209, working tree clean
- Base branch is `main`, which the delivery rule excludes from a merge, so nothing is merged back

## Settled input (do not re-litigate)

- Namespace `--daisy-color-<source>` plus `--daisy-radius`; the table is written by the adapter CLI, not a registry item
- Every colour value is opaque
- 09's surface-first rule and 10's rung assignment
- Escape hatch is the user-owned overrides file with `html:not(.dark)` and `html.dark`
