# Control: does sonner still work without the plain `--color-*` declarations?

Claim 3 said the three plain declarations that `cssVars` wrote into `:root`/`.dark` are what sonner needs.
This control removes them and re-measures.

Setup: the kept project at `...\adapter-harness\run-2026-10-28T03-11-55-082Z\app`, after
`shadcn-svelte add sonner` and `pnpm build`, with `src/routes/toast/+page.svelte` from
`spike/toast-route.svelte`.

1. Remove exactly six lines from `src/app.css`, the `--color-popover`, `--color-popover-foreground` and
   `--color-border` declarations inside `:root` and inside `.dark`. The three entries in `@theme inline`
   stay. (`--color-popover` count in the file drops from 5 to 2, both in the map.)
2. `pnpm build`, then serve the build on 5209 and run `probe-toast.mjs`.

Result, `control-no-plain-decls/toast.json`:

| reading | light | dark |
| --- | --- | --- |
| toast background | `oklch(1 0 0)` | `oklch(0.228 0.013 107.4)` |
| `--popover` probe | `oklch(1 0 0)` | `oklch(0.228 0.013 107.4)` |
| `--color-popover` computed | `oklch(100% 0 0)` | `oklch(22.8% .013 107.4)` |

Identical to `spike/toast.json`, which was produced with the declarations present. The toast still resolves
to the popover colour in both themes.

`control-no-plain-decls/emitted-theme-block.txt` shows where the value comes from. Tailwind emits
`--color-popover: var(--popover)` itself, in `@layer theme{:root,:host{...}}`, with the plain declarations
gone. The `@theme inline` map is the source.

Conclusion. The plain declarations are redundant. Claim 3 fails as worded, both halves: sonner does not need
them, and `@theme inline` is not inert for names a component references.

One thing this control did not settle: the first build (before the sonner component existed) emitted only 5
theme variables, while every build after it emits 55, including `--color-primary`, which no component reads
raw. The switch is not explained here. It does not change the conclusion, and it is a reason not to build
the adapter on any claim about which theme variables Tailwind emits.

The declarations were restored and the project rebuilt after the control (`0.xdzkVg79.css`, 55 theme
variables). `spike/toast.json` was regenerated from that restored build with the current `probe-toast.mjs`.
