# The 1.8 pin move

Recorded 2026-11-04, during the ticket 36 run. Migration A, chosen by the operator: move the pin
to the live stock.

## What the live registry serves

`npm view shadcn-svelte version` is `1.8.0`, and
`https://shadcn-svelte.com/registry/styles/mira/` serves 1.8 content to every CLI version. The
repo's pin was `src/lib/components/ui` at 1.7.1.

Measured before the move, over the 85 sites in the old manifest:

| table            | sites | still matched 1.8 |
| ---------------- | ----- | ----------------- |
| SITES (contrast) | 11    | 9                 |
| RADIUS           | 25    | 0                 |
| SURFACES         | 45    | 7                 |
| VARIANTS         | 4     | 1                 |

1.8 removed `rounded-none` from every radius and surface component and moved to a real radius
scale (`rounded-md`, `rounded-lg`, `rounded-xl`). That is why every radius anchor moved.

## What the move changed

- `src/lib/components/ui` was refreshed with `shadcn-svelte@1.8.0 add` over the 27 target registry
  items plus the 28th name that is a file (`input-group-button`). No component gained or lost a
  file, so no orphan file had to be removed.
- `shadcn-svelte` in the root `package.json` moved from `^1.7.1` to `^1.8.0`; the lockfile and
  `pnpm-workspace.yaml` follow. `pnpm-workspace.yaml` gained `minimumReleaseAgeExclude` for
  `shadcn-svelte@1.8.0`, which pnpm wrote because the release is newer than its age gate.
- `SUPPORTED` is `{ major: 1, minor: 8 }`.
- The two close buttons moved: `dialog` from `absolute top-5 right-5 bg-secondary` to
  `absolute top-2 right-2`, and `sheet` from `absolute top-4 right-4 bg-secondary` to
  `absolute top-4 right-4`. The fix now adds `bg-muted` to a stock the 1.8 add writes.
- The nine other contrast sites still match byte for byte.
- `button`, `badge` and `alert` variant blocks were rewritten. `bubble` is unchanged.
- `card-header` and the card image use `rounded-t-lg`/`rounded-b-lg`; the adapter keeps the 1.7
  contract and writes the box step (`rounded-lg`).
- The alert base lost its `after:` positioning, which made the adapter's `after:bg-*` tone bars
  inert. The `alert-base` site restores `after:absolute after:-inset-y-px after:-left-px
after:w-0.5` on the base.
- The badge destructive row is a soft fill in 1.8. The adapter now keeps `bg-destructive/10` and
  uses the text tone with the text-tone border, instead of the 1.7 text-only row. The raw tone as
  text count drops from three rows to two (alert and bubble).
- The switch and drawer handle are pills in 1.8. Both sites keep the 0.3.0 contract and write
  `rounded-md` and `rounded-lg`; `registry-28` and `registry-29` forbid `rounded-full` in a fixed
  string, and the radius table lists both.

## Assertion sites

A site whose 1.8 stock already holds the role step repeats the string as its own `fixed`. The fixer
reads `fixed` first, so it reports `fixed` and writes nothing; `--check` still fails when a hand
edit moves the file off the step. 22 sites are assertions: 12 in RADIUS (`button-base`,
`button-xs`, `button-icon-xs`, `toggle-base`, `input-field`, `textarea-field`, `select-content-box`,
`select-item-field`, `input-group-field`, `input-group-block-end`, `input-group-block-start`,
`input-group-textarea`) and 10 in SURFACES (`popover-content`, `dropdown-content`,
`dropdown-sub-content`, `context-content`, `context-sub-content`, `menubar-root`, `menubar-content`,
`menubar-sub-content`, `hover-card-content`, `nav-trigger`).

## Pruned sites

`drawer-left`, `drawer-right` and `drawer-top` were removed. 1.8 has one shared
`before:rounded-xl` panel surface for every direction and no direction-specific radius, so a single
`drawer-surface` site owns it. SURFACES is 42 entries instead of 45; the seam check totals are
unchanged because the check count is a property of the seam scripts, not the table length.

## Seam expectations moved

Each of these moved because the 1.8 stock or the assertion model made the old expectation false.
The check totals stay at 139/100/64/71/45/43/82/8.

- `registry-16/smoke.mjs`: the shadcn stub is 1.8.0.
- `registry-26/fix.mjs`: the stub is 1.8.0; the init and dry-run state checks accept an assertion
  site as `fixed` and unwritten; the stock/fixed totals are derived from the manifest (`58 stock,
22 fixed` for this fixture) instead of a copied 39; the overwrite check compares the 1.8 close
  stock instead of `bg-secondary`.
- `registry-27/safety.mjs`: the stub is 1.8.0; `SUPPORTED` is asserted at minor 8; the future
  version is 1.9.0 and the refusal names `1.8.x`; the dependency range is `^1.8.0`; the
  vega-shaped header count is 29 instead of 28, because the 1.8 pin changes which files are fully
  fixed around the one customized close.
- `registry-28/radius.mjs`: the stub is 1.8.0; the two entry-shape checks allow an assertion entry
  whose stock already writes its step, and still reject a changed entry whose fixed hides inside
  its stock.
- `registry-29/surfaces.mjs`: the same two checks; the navigation-menu indicator check expects
  `rounded-tl-sm`, the 1.8 stock, instead of `rounded-none`.
- `registry-30/variants.mjs`: the stub is 1.8.0.
- `registry-31/variants.mjs`: the stub is 1.8.0; the badge destructive checks expect the soft fill
  and the text tone; the raw-tone-as-text allowance is two rows.

## Proof

`run.json` records `ok: true`, `build: true`, a live-registry add (`addTargetsExitCode: 0`, no
`pin-registry` step), zero console errors, and `contrast.ok: true`.

`prove.json` records:

- init twice, byte-identical, with `58 stock, 22 fixed, 0 customized, 1 missing` (the sheet is
  added later, so its close site is missing);
- the late `sheet` add is the 1.8 stock and becomes `fixed`;
- `fix` twice, byte-identical, `--check` exits 0.

`11-check.log` records `fix: 0 stock, 82 fixed, 0 customized, 0 missing; check only, nothing
written`.

`seams.log` records 139/100/64/71/45/43/82/8, every seam exit 0.

## Version implication

`SUPPORTED` moved from 1.7.x to 1.8.x. The package version stays `0.3.0`, still unpublished, so no
installed user is refused. A 1.7 project is now refused with `unsupported shadcn-svelte version`.
If 0.3.0 had shipped, this would be a breaking support change and would need a minor bump or a
dual-stock manifest. The operator decides the version, and nothing is published or bumped here.
