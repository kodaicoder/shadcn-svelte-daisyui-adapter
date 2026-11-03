# 25: Text tones
Session IDs: ses_e5f8863c3ffejT9Kc9zJQtIiBg
Lesson: A derived-helper count depends on whether the run had a theme, so one number cannot describe both states.
Check: code - `.scratch/daisyui-adapter/registry-16/smoke.mjs` asserts 13 derived helpers per block with a theme and 8 without, in both slots, and the four text tones and their aliases fail when the 40/60 weight drifts.

**What to build:** `init` writes the four text tones as the 40/60 mix with the project foreground, plus their aliases, so the outline, ghost and link presentations have a readable text token.

**Blocked by:** 24

**Status:** resolved

- [x] `init` writes `success-text`, `warning-text`, `info-text` and `destructive-text` as `color-mix(in oklch, var(--<tone>) 40%, var(--foreground) 60%)` in `:root` and `.dark`
- [x] The four aliases exist: `--color-success-text`, `--color-warning-text`, `--color-info-text`, `--color-destructive-text`
- [x] The text and the border use the same `--<tone>-text` token; no separate border token is introduced
- [x] The block goes from 39 to 43; the four text tones add four derived helpers
- [x] The smoke asserts the four text tones, the four aliases and the 43 count
- [x] A re-run is byte-identical
