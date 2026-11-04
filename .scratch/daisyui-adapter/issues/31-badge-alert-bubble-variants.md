# 31: Badge, alert and bubble variants
Session IDs: ses_e5b9347ceffesVUlciF14SLLUW
Lesson: A fixer that states every site before it writes cannot carry two sites whose stock strings share bytes, so a new site's anchor must start after the line another site owns.
Check: code - `.scratch/daisyui-adapter/registry-31/variants.mjs`: 79 checks over the real CLI and temp copies of the pinned badge, alert and bubble: the 48-row table, the four literal key lists, the cells, the literal classes, the ghost `rounded-none` scope, the raw-tone exception for the three pinned destructive rows, the filled/text/border pairs, one pass per component over the pin, the alert and bubble presentation exclusions, `init` with `bubble-muted` and `alert-base` fixed in the same run, the header at 3, `--check`/`--strict`, the four states, and the isolated bubble overlap; `registry-26` stays at 100 checks with its site count at 39, `registry-16` at 139, `registry-27` at 64, `registry-28` at 71, `registry-29` at 45, `registry-30` at 43 and the drift test at 8.
Closeout: 7213101 (tag t31-badge-alert-bubble-variants)

**What to build:** Badge, alert and bubble gain the status tones and their supported presentations, using the text tones.

**Blocked by:** 24, 25, 26, 29

**Status:** resolved

- [x] Badge has `success`/`warning`/`info` plus the three presentations for the four tones
- [x] Bubble has `success`/`warning`/`info` plus `outline-*` and `ghost-*` for the four tones; it has no link presentation
- [x] Alert has `success`/`warning`/`info`; it has no outline, ghost or link presentation
- [x] The text and border use the same `--<tone>-text` token; the class strings are literal
- [x] `code-block` is untouched; the existing variants are unchanged; tests assert the keys
