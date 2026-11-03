# 25: Text tones
Session IDs:
Lesson:
Check:

**What to build:** `init` writes the four text tones as the 40/60 mix with the project foreground, plus their aliases, so the outline, ghost and link presentations have a readable text token.

**Blocked by:** 24

**Status:** ready-for-agent

- [ ] `init` writes `success-text`, `warning-text`, `info-text` and `destructive-text` as `color-mix(in oklch, var(--<tone>) 40%, var(--foreground) 60%)` in `:root` and `.dark`
- [ ] The four aliases exist: `--color-success-text`, `--color-warning-text`, `--color-info-text`, `--color-destructive-text`
- [ ] The text and the border use the same `--<tone>-text` token; no separate border token is introduced
- [ ] The block goes from 39 to 43; the four text tones add four derived helpers
- [ ] The smoke asserts the four text tones, the four aliases and the 43 count
- [ ] A re-run is byte-identical
