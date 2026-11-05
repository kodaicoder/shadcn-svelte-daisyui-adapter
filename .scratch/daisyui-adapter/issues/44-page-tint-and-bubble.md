# 44: The page tint and the bubble shape

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A destructive row starts from a different stock than its tone siblings, so a migration that loops the status tones leaves it behind while every seam stays green.
Check: code - `src/daisyui-theme.css` sets light `--color-base-100: oklch(98.5% 0 264.542)`. The twelve bubble rows: solid, outline and muted content carry `rounded-full`, the four ghost rows keep `rounded-none`, the destructive solid is `bg-destructive` with `text-destructive-foreground`, and the four outline rows are transparent with the raw tone as border and text and fill with the tone and its foreground on hover. `VARIANT_STOCK_CLASS.bubble` keeps the old tint, byte-identical to the pin, and the drift test stays 9 of 9. `registry-31` 82 checks. `registry-37` passes with text tones 7.06 / 6.3 / 7.94 / 12.94 in light and limits 1.88 / 1.69 / 2.13 / 2.89; `harness/contrast.mjs` pins reference 7.95 / 6.62 / 7.89 and 2.41 / 1.86 / 2.13 in light. `registry-44/reference.mjs` prints the measured pairs. CHANGELOG with the release commit.

**What to build:** The light page is `oklch(98.5% 0 264.542)` instead of pure white. The bubble content is fully rounded, the destructive bubble is filled like the other solid tones, and the outline bubble is transparent with the tone as border and text.

**Blocked by:** None

**Status:** resolved

- [x] The light theme sets `--color-base-100: oklch(98.5% 0 264.542)`, so no surface is pure white
- [x] Every bubble content is `rounded-full` except the ghost rows, which stay square and bare
- [x] The destructive bubble paints `bg-destructive` with `text-destructive-foreground`
- [x] `outline-*` bubbles are transparent with `border-<tone>` and `text-<tone>`, and fill with the tone and its foreground on hover
- [x] The matrix is re-measured against the new page and every pinned number that moved is updated with the run that moved it

One gap recorded, not fixed here. The outline bubble contract guard that ticket 38 added was dropped when the rows changed, so `registry-31` went from 83 to 82 checks. The `outline-destructive` row was caught by the review gate, not by a seam, because the migration loop covered only the three status tones. A guard that covers all four outline rows belongs in the next test pass. The render item is not part of this ticket's DoD; the look is verified at ticket 34's gate.
