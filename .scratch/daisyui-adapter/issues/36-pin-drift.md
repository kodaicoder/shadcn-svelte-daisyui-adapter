# 36: Move the supported shadcn-svelte pin

Session IDs: ses_e5b18eda9ffe06dUDmesGVhLvK
Lesson: The supported pin is the stock the public registry serves today, not the stock the repo happened to install. A manifest that matches a stale pin reports every new file as customized, and a harness that serves its own pin cannot see the drift. Move the pin with the stock strings, and let the live registry drive the harness.
Check: process - `.scratch/daisyui-adapter/evidence/36-pin-drift/run.json` is a fresh SvelteKit 3 project that adds the 27 targets from the live registry with no `--pin-registry`, builds, renders light and dark with no console error, and holds the ticket 33 AA matrix; `prove.json` and `11-check.log` report `0 stock, 82 fixed, 0 customized, 0 missing` after a late 1.8 `sheet` add; `seams.log` keeps the eight seams at 139/100/64/71/45/43/82/8.

**What to build:** The fixer matches the stock that `shadcn-svelte add` produces today, or accepts both the current pin and the live stock with one stock variant per site. The live `mira` registry has moved past the `src/lib/components/ui` snapshot: `sheet.json` now ships a separate `sheet-close.svelte` without `bg-secondary`, `button.json` uses `rounded-md` and `text-xs/relaxed font-medium`, and `badge.json` and `card.json` no longer hold their pinned strings. A fresh app that runs `add` today reports 63 `customized` sites, so the fixer applies almost nothing.

**Blocked by:** None

**Status:** resolved

## Migration record

Option A, chosen by the operator: move the pin to the live stock. Details and the per-seam reasons
are in `.scratch/daisyui-adapter/evidence/36-pin-drift/migration.md`.

- The pin is `src/lib/components/ui` at shadcn-svelte 1.8.0, refreshed with the repo's own
  `components.json`. The root `package.json`, lockfile and pnpm workspace follow.
- `SUPPORTED` is 1.8.x. A radius or surface site whose 1.8 stock already holds the role step is an
  assertion: `stock` equals `fixed`, the fixer reports `fixed`, writes nothing, and `--check` still
  fails on a hand edit. 22 sites are assertions.
- `drawer-left`, `drawer-right` and `drawer-top` are pruned: 1.8 has one shared
  `before:rounded-xl` panel surface for every direction. SURFACES is 42 entries; the seam check
  totals are unchanged.
- The badge destructive row keeps the 1.8 soft fill and uses the text tone and border. The alert
  base restores the `after:` positioning that 1.8 dropped, so the tone bars paint again.
- Seam expectations moved: the 1.8 stub, the assertion-aware entry checks, the future version
  1.9.0, `^1.8.0`, the vega header count 29, the navigation-menu indicator `rounded-tl-sm`, and
  the badge destructive checks. The check totals stay 139/100/64/71/45/43/82/8.

### Version implication (operator decides)

`SUPPORTED` moves from 1.7.x to 1.8.x while the package stays `0.3.0`, unpublished. No installed
user is refused because 0.3.0 has not shipped. A project on 1.7 is now refused with a clear
message. If 0.3.0 had been published, this would be a breaking support change and would need a
minor bump or a dual-stock manifest. Nothing was published or bumped in this ticket.

- [x] Choose the migration. Move the pin: refresh `src/lib/components/ui` to the live stock, update the `targets.mjs` stock and fixed strings, and move the seam expectations with a recorded reason. Or add a stock variant per site so both the 1.7.1 shape and the live shape are supported. Narrowing `SUPPORTED` alone cannot work, because the live registry serves the newer content to every CLI version.
- [x] The README and `SUPPORTED` name the same supported version and the same install command.
- [x] A fresh SvelteKit project adds the targets from the live registry, runs `init`, and reports every present site `fixed`, with no `customized` row caused by drift.
- [x] `pnpm --filter` build of the harness page still passes after the move.
- [x] The drift test compares the manifest with the refreshed pin at the new version.

Closeout: see the commit that closes this ticket (`fix(adapter): move the supported shadcn-svelte pin to 1.8`).
