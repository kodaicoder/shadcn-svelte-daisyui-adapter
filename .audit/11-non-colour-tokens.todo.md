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
- [ ] `no-comments` (the diff carries code: `shot.mjs`, `check.mjs`, `apply.mjs`, the probe plugin)
- [ ] `code-review` on the Spec axis against `349c212`, fix every finding
- [ ] `deslop`
- [ ] Conventional commit on `feat/daisyui-adapter`, tag `t11-non-colour-tokens`, push, no merge to main

## Settled input (do not re-litigate)

- Namespace `--daisy-color-<source>` plus `--daisy-radius`; the table is written by the adapter CLI, not a registry item
- Every colour value is opaque
- 09's surface-first rule and 10's rung assignment
- Escape hatch is the user-owned overrides file with `html:not(.dark)` and `html.dark`
