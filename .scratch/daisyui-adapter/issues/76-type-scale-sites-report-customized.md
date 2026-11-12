# 76: The type-scale sites report customized on a clean pin

**What to build:** one `fix` run applies every type-scale site, and `fix --strict` exits 0 on a clean
pin for the full component set. Today 21 `text-*` sites are reported customized before anything writes.

**Status:** ready-for-agent
**Labels:** adapter, fixer, type-scale
**Blocked by:** None

Found while fixing ticket 73, same mechanism. `component-fix.mjs` classifies every site from the file
as it was before the run, so a site whose stock a prior site writes is reported customized and
skipped. Ticket 73 fixed the textarea readonly site by anchoring its stock on text the pin already
holds. The type-scale sites are the remaining 21.

`node packages/daisyui-adapter/cli/init.mjs fix --dry-run` on the clean pin reports `272 stock, 22
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

Each one needs either a pre-run anchor, as ticket 73 used, or a converging state pass in the fixer for
sites whose stock genuinely arrives from an earlier write. Choose by evidence per site, not by a
blanket second pass that would hide the classification.

- [ ] `fix --dry-run` on the clean pin reports `0 customized`
- [ ] `fix --strict` exits 0 on the clean pin for the full component set
- [ ] one run applies every site, with no second run needed
- [ ] regenerated copies stay byte-identical
- [ ] `pnpm test:adapter` gains a check that the clean pin has no customized site across every component
