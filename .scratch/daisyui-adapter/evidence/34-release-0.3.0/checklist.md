# Manual visual check

Evidence in this folder: `light.png` and `dark.png` (the rendered page), `contrast.md` (the measured
matrix), `run.json` (the harness result, including `consoleErrors`).

Check each item in light and then in dark.

- The ten repaired pairs: dialog close and sheet close use the muted fill with the page foreground;
  calendar hover, range hover and range middle use the accent fill with the accent foreground; the
  three destructive menu rows use the destructive tint with the destructive text tone; the chart
  tooltip label uses the page foreground; the muted bubble uses the muted fill with the page
  foreground.
- Button: `success`, `warning`, `info` and `destructive` in filled, outline, ghost and link.
- Badge: the four tones in filled, outline, ghost and link.
- Bubble: the four tones in filled, outline and ghost.
- Alert: `default`, `destructive`, `success`, `warning` and `info`.
- Only the `outline` and `outline-*` rows carry a border. A filled status key has no visible edge; in light its fill sits below 3:1 against the page, which is the recorded known limit.
- Radius on the button, the card and the input follows the theme's field and box steps, not a square
  corner. The paired colour swatches at the top are samples, not controls, so their radius is not part
  of this check.
- The destructive base button paints a solid destructive fill with no border.
- No console error in either scheme; `run.json` records an empty `consoleErrors` array.
- Hover, focus-visible and disabled are checked on the live page and in `states-*.png`: the outline rows are transparent at rest, the ghost and outline rows take the tone fill and foreground on hover, and the link rows underline only on hover.
- `contrast.json` reports no failures; its `findings` list is reviewed, because a filled label's contrast comes from the theme's own `<tone>-content`.
