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
- The filled button carries a visible 1px border in the text tone, and the fill is lighter than that
  border against the page.
- Radius on the button, the card and the input follows the theme's field and box steps, not a square
  corner.
- The destructive base button paints a solid destructive fill with the text-tone border.
- No console error in either scheme; `run.json` records an empty `consoleErrors` array.
- `contrast.json` reports no failures; its `findings` list is reviewed, because a filled label's contrast comes from the theme's own `<tone>-content`.
