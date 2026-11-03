# 24: Status tokens and text tones

**What to build:** `init` writes the seven status bindings and the four text tones with their `@theme inline` aliases, so a project gets the status utilities and the readable text form of each tone.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `init` writes `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground` and `destructive-foreground` in `:root` and `.dark` with the fixed fallbacks from the spec
- [ ] `init` writes `success-text`, `warning-text`, `info-text` and `destructive-text` as the 40/60 mix with the project foreground, each with its alias
- [ ] The 11 new bindings take the block from 32 non-derived declarations to 43; the chart rows and the existing helpers are unchanged
- [ ] The text and border use the same `--<tone>-text` token; no separate border token exists
- [ ] The smoke asserts the 43 count, the 11 aliases, the fixed status fallbacks and the four text tones
- [ ] A re-run is byte-identical
