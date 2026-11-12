# 76: The type-scale sites report customized on a clean pin
Session IDs: ses_e327321b6ffeOE797kkxW963CD
Lesson: A table generated from post-fix text has to be read in the order it is written; classifying every site before any write turns intended sequencing into false customizations.
Check: code - `packages/daisyui-adapter/test/drift.mjs` asserts `the clean pin reports no customized site across every component` at 0 customized, 293 stock and 0 missing, and `pnpm test:adapter` passes; `.audit/76-type-scale-sites-report-customized.todo.md` records the whole-pin temp run that applies every site in one run with all 20 shipped copies byte-identical.
Closeout: 6712e04 (tag daisyui-adapter-76)

**What to build:** one `fix` run applies every type-scale site, and `fix --strict` exits 0 on a clean
pin for the full component set. Today 21 `text-*` sites are reported customized before anything writes.

**Status:** resolved
**Labels:** adapter, fixer, type-scale
**Blocked by:** None

Found while fixing ticket 73, same mechanism. `component-fix.mjs` classified every site from the file
as it was before the run, so a site whose stock a prior site writes was reported customized and
skipped. Ticket 73 fixed the textarea readonly site by anchoring its stock on text the pin already
holds. The type-scale sites were the remaining 21.

`node packages/daisyui-adapter/cli/init.mjs fix --dry-run` on the clean pin reported `272 stock, 22
fixed, 21 customized`. The customized sites:

```
dialog text-dialog-1 (dialog/dialog-content.svelte)
sheet text-sheet-1 (sheet/sheet-content.svelte)
range-calendar text-range-calendar-1 (range-calendar/range-calendar-cell.svelte)
dropdown-menu text-dropdown-menu-3 (dropdown-menu/dropdown-menu-item.svelte)
context-menu text-context-menu-3 (context-menu/context-menu-item.svelte)
button text-button-1, text-button-3, text-button-4 (button/button.svelte)
select text-select-4 (select/select-trigger.svelte)
input-group text-input-group-1 (input-group/input-group-addon.svelte)
dropdown-menu text-dropdown-menu-1, text-dropdown-menu-5 (dropdown-menu/*-item.svelte)
context-menu text-context-menu-1, text-context-menu-5 (context-menu/*-item.svelte)
menubar text-menubar-5 (menubar/menubar-trigger.svelte)
menubar text-menubar-1, text-menubar-4 (menubar/*-item.svelte)
drawer text-drawer-1 (drawer/drawer-content.svelte)
calendar text-calendar-5, text-calendar-6 (calendar/*-select.svelte)
label text-label-1 (label/label.svelte)
```

All 21 are generated `text-rungs.mjs` sites, and their stocks are the post-other-table text by design,
so a per-site anchor would fight the generator. The drift test at lines 217 to 244 already described
the intended model: each site is checked against the content its turn sees, in file and table order.
`run` now classifies that way, simulating the earlier writes for a scan. One order-aware walk, not a
second pass.

- [x] `fix --dry-run` on the clean pin reports `0 customized`
- [x] `fix --strict` exits 0 on the clean pin for the full component set
- [x] one run applies every site, with no second run needed
- [x] regenerated copies stay byte-identical
- [x] `pnpm test:adapter` gains a check that the clean pin has no customized site across every component

The fixed project still reports `skeleton-atom-surface` and `slider-atom-thumb-tone` customized, a
separate pre-existing fixed-state recognition gap. Filed as ticket 77.
