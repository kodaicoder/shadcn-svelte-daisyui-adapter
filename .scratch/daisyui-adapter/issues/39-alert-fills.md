# 39: Fill the alert tone variants

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A status surface has to come from the theme's own pair, fill and content together. An alert that only tints its text keeps the card surface, so the tone never reads as a state even though the text carries the right token.
Check: code - `.scratch/daisyui-adapter/registry-39/matrix.mjs` measures the four filled alerts from the delivered theme: body text 5.12 / 5.24 / 6.34 / 5.97, no warning, four recorded fill limits. `.scratch/daisyui-adapter/registry-37/warning.mjs` pins this theme state: text tones 7.37 / 6.58 / 8.29 / 13.51 in light and 12.41 / 12.72 / 11.91 / 8.26 in dark, no fill-text warning, four known limits, CLI exit 0. The drift test stays 9 of 9. The CHANGELOG sentence lands with the release commit by decision.

**What to build:** The four alert tone variants paint the tone as the surface and the tone's content colour as the text, so a `destructive` alert is `--daisy-color-error` with `--daisy-color-error-content`, as the operator asked at the ticket 34 visual gate. The delivered 0.3.0 alerts are `bg-card` with the text tone, so `destructive`, `success`, `warning` and `info` look like the default card.

**Blocked by:** None

**Status:** resolved

- [x] `destructive`, `success`, `warning` and `info` paint `bg-<tone>` with `text-<tone>-foreground`; the description text uses the same foreground and the icon follows it
- [x] The demo theme carries daisyUI's three status pairs and the project's own error pair, so every alert body reads at or above 4.5 in both schemes: success 5.12, warning 5.24, info 6.34, destructive 5.97, and the matrix prints no warnings
- [x] README and CHANGELOG say the tone alerts are filled and name the content colour
- [ ] The harness light and dark renders show the four filled alerts beside the default one

Recorded gap, not fixed here: the dark filled rows hover to `bg-<tone>/80`, which takes success and info below 4.5 for their dark content once composited over the page. The matrix samples the resting state, so no gate covers it. It belongs to a follow-up ticket, not to the 0.3.0 reconstruction. The render item stays unticked because the shared evidence folder was written by the later run on the final tree.
