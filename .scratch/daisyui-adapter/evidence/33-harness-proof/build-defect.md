# The build caught three variant tables the seams could not

The first pinned-stock build failed in `vite build` with three errors, one per variant table:

```
button.svelte:18:11  RolldownError: Unexpected token
  outline-destructive: "border-destructive-text ..."
bubble.svelte:18:11  RolldownError: Unexpected token
  outline-destructive: "*:data-[slot=bubble-content]:bg-background ..."
badge.svelte:14:11   RolldownError: Unexpected token
  outline-destructive: "border border-destructive-text ..."
```

An unquoted `outline-destructive:` is not a valid object key. The stock blocks never showed it,
because every pinned key (`default`, `outline`, `secondary`, `ghost`, `link`) is a valid identifier,
and the seam scripts compared the block text without compiling it.

Fix: `renderVariantBlock` in `packages/daisyui-adapter/targets.mjs` quotes a key that is not a valid
JavaScript identifier. The stock string is unchanged, so the manifest still matches the pin. The
seam helpers that read the block now accept the quoted form.

The `build.log` in this folder is the passing run. The error text above is quoted from the failing run.
