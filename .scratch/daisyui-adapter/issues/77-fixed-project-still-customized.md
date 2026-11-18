# 77: Two atom sites read customized on a fixed project
Session IDs: ses_e132abdd7fferm9owLLIYFCOSZ
Lesson: A site's fixed text stops being a literal when a later site writes inside it, so the state read has to accept the text one full run leaves, meaning the site's fixed text with every later site in the same file applied, not the fixed text as declared.
Check: code - `packages/daisyui-adapter/test/drift.mjs` asserts `a fixed temp project reports no customized site` at 0 customized, 0 stock, 0 missing and 315 fixed, and `a second fix on the fixed temp project writes nothing` at 0 written, and `pnpm test:adapter` passes; `.audit/77-fixed-project-still-customized.todo.md` records `fix --strict` exiting 0 with 0 customized on a fixed temp project.
Closeout: f62076f (tag daisyui-adapter-77)

**What to build:** a project that `fix` just completed reports every site fixed, so a second `fix`
writes nothing and `fix --strict` exits 0. Today two sites still read customized.

**Status:** resolved
**Labels:** adapter, fixer
**Blocked by:** None

Found while fixing ticket 76. A full `fix` on a temp copy of the pin applies everything and the copies
match, but the next scan reports:

```text
fix: 0 stock, 313 fixed, 2 customized, 0 missing
skeleton skeleton-atom-surface (skeleton/skeleton.svelte): customized
slider slider-atom-thumb-tone (slider/slider.svelte): customized
```

`fix --strict` then exits 1 on a project the fixer just wrote. The second run makes no byte changes.

The states are read from the fixed file. A later site changes text inside these two sites' `fixed`
strings, so `stateOf` finds neither the stock nor the fixed text. This is pre-existing: ticket 76
changed when a state is read, not how the fixed text is recognised.

- [x] a fixed project reports `0 customized`
- [x] a second `fix` makes no write, and `fix --strict` exits 0
- [x] `pnpm test:adapter` gains a check that a fixed temp project has no customized site
- [x] the regenerated copies stay byte-identical
