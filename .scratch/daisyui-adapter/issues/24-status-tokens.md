# 24: Status tokens

Session IDs: ses_e5f9f2928ffemPpSznHBw3w7QU
Lesson: Matching the full value a tool writes, instead of the property it owns, turns a re-run guard into an override of the project's own declaration.
Check: code - `.scratch/daisyui-adapter/registry-16/smoke.mjs` asserts the seven bindings and aliases in both runs, the 39 count, and a project entry left un-duplicated; three sabotage runs each fail it.

**What to build:** `init` writes the seven status bindings and their `@theme inline` aliases, so a project gets the status utilities before the text tones and the variants land.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] `init` writes `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground` and `destructive-foreground` in `:root` and `.dark` with the fixed fallbacks from the spec
- [x] The seven aliases exist: `--color-success`, `--color-success-foreground`, `--color-warning`, `--color-warning-foreground`, `--color-info`, `--color-info-foreground`, `--color-destructive-foreground`
- [x] The block goes from 32 to 39 non-derived declarations; the chart rows and the existing helpers are unchanged
- [x] The smoke asserts the seven bindings, the seven aliases, the fixed fallbacks and the 39 count
- [x] A re-run is byte-identical
