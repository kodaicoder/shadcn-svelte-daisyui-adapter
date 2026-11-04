# Why the harness serves the pin instead of the live registry

Recorded 2026-11-04, during the ticket 33 run.

`prove.mjs` first failed against the live registry with:

```
the late-added sheet is not the pinned stock: class="absolute top-4 right-4 bg-secondary"
```

The app's `sheet/sheet-content.svelte` after `pnpm dlx shadcn-svelte@latest add sheet -y -o`
(shadcn-svelte 1.7.2, style `mira`) does not hold that class. The live registry item now ships a separate
`sheet/sheet-close.svelte`, and neither file holds `bg-secondary`.

The same run's `init` reported:

```
[daisyui-adapter] fix: 16 stock, 4 fixed, 63 customized, 1 missing
```

63 sites are neither the pinned stock nor the pinned fixed string.

Live registry items fetched today from `https://shadcn-svelte.com/registry/styles/mira/`:

- `dialog.json` files are `dialog/dialog-close.svelte`, `dialog/dialog-content.svelte`, ... ; the
  stock `class="absolute top-5 right-5 bg-secondary"` and the box string `gap-6 rounded-none p-6`
  are absent.
- `sheet.json` files are `sheet/sheet-close.svelte`, `sheet/sheet-content.svelte`, ... ; the stock
  `class="absolute top-4 right-4 bg-secondary"` is absent.
- `button.json` base is `... rounded-md border border-transparent ... text-xs/relaxed font-medium ...`;
  the pinned `src/lib/components/ui/button/button.svelte` base is
  `... rounded-none border border-transparent ... text-xs font-semibold uppercase tracking-widest ...`.
- `badge.json` does not hold `text-destructive [a]:hover:text-destructive/70`.
- `card.json` does not hold `gap-1.5 rounded-none px-(--card-spacing)`.

So the live `mira` style has moved past the `src/lib/components/ui` snapshot `targets.mjs` pins, and
no `shadcn-svelte add` can reproduce that snapshot today.

## What ticket 33 does about it

The harness serves a registry generated from the pin (`harness/pin-registry.mjs`) and points
`COMPONENTS_REGISTRY_URL` at it for every add, so the add step writes the exact stock the fixer
supports. The migration to the live stock is tracked in `.scratch/daisyui-adapter/issues/36-pin-drift.md`;
0.3.0 must not publish until it closes, because a user who runs `add` today gets the drifted stock.

Reproduce without the harness:

```
node -e "fetch('https://shadcn-svelte.com/registry/styles/mira/sheet.json').then(r=>r.json()).then(j=>console.log(j.files.map(f=>f.target)))"
```
