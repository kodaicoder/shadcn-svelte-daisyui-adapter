# 24: Status tokens
Session IDs:
Lesson:
Check:

**What to build:** `init` writes the seven status bindings and their `@theme inline` aliases, so a project gets the status utilities before the text tones and the variants land.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `init` writes `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground` and `destructive-foreground` in `:root` and `.dark` with the fixed fallbacks from the spec
- [ ] The seven aliases exist: `--color-success`, `--color-success-foreground`, `--color-warning`, `--color-warning-foreground`, `--color-info`, `--color-info-foreground`, `--color-destructive-foreground`
- [ ] The block goes from 32 to 39 non-derived declarations; the chart rows and the existing helpers are unchanged
- [ ] The smoke asserts the seven bindings, the seven aliases, the fixed fallbacks and the 39 count
- [ ] A re-run is byte-identical
