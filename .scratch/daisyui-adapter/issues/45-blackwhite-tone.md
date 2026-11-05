# 45: The blackwhite tone and the default rows

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A token with no daisyUI source cannot be an alias to a `daisy-*` variable. The CLI has to write the literal per scheme, and the declaration count, the README sample and every seam that pins the count move with it.
Check: code - `dist/map.mjs` holds `STATIC_TOKENS`; `cli/init.mjs` skips stale static keys, writes the two literals per scheme and their `--color-*` aliases, and reports 45 declarations. `targets.mjs` carries twelve `blackwhite` rows, four on button, four on badge, one on alert and three on bubble, and the badge and bubble showcases gain their `default` row. `registry-16`, `registry-26` and `registry-27` pass at 45 declarations, `registry-30` at 43 checks and `registry-31` at 81 checks; the drift test stays 9 of 9. CHANGELOG with the release commit.

**What to build:** A static `blackwhite` tone with no daisyUI source, written per scheme by the CLI, and its variants on button, badge, bubble and alert. The badge and bubble showcases also gain a `default` row, because those components already have that key but the page never showed it.

**Blocked by:** None

**Status:** resolved

- [x] The CLI writes `--blackwhite` and `--blackwhite-foreground` literally per scheme: `oklch(20% 0.042 265.755)` with `oklch(96% 0.007 247.896)` in light, `oklch(98% 0.002 247.839)` with `oklch(13% 0.028 261.692)` in dark, plus `--color-*` aliases
- [x] Button, badge, bubble and alert carry a `blackwhite` key, and button, badge and bubble carry `outline-`, `ghost-` and `link-` where the component supports them
- [x] The badge and bubble sections show a `default` row next to the tone rows
- [ ] Every seam count and key list is updated to the new rows, and the harness renders the new tone in both schemes

Notes on this commit. The badge `href` fixture that ticket 42's DoD asks for landed here, because 42's commit added only the component path. The CHANGELOG half of the last item lands with the release commit. The render is not verifiable here: no evidence folder exists for this state, and the look is verified at ticket 34's final gate. The README's "40 binding keys" was corrected to 38 binding keys plus 2 static tokens, and two strings that still said 43 or named a component boundary were fixed under the ticket 41 ruling.
