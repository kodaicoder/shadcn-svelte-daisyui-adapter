# 77: Two atom sites read customized on a fixed project

**What to build:** a project that `fix` just completed reports every site fixed, so a second `fix`
writes nothing and `fix --strict` exits 0. Today two sites still read customized.

**Status:** ready-for-agent
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

- [ ] a fixed project reports `0 customized`
- [ ] a second `fix` makes no write, and `fix --strict` exits 0
- [ ] `pnpm test:adapter` gains a check that a fixed temp project has no customized site
- [ ] the regenerated copies stay byte-identical
