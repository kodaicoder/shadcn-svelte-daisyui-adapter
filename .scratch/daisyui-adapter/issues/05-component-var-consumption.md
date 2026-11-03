# Component var() consumption audit
Session IDs:
Lesson:
Check:

Type: research
Status: resolved
Blocked by: none

## Question

Do shadcn-svelte components read their tokens through Tailwind utilities only, or do some read the raw custom properties? This decides whether overriding `:root` is enough.

1. Scan the shipped component sources and list every direct `var(--*)` usage that bypasses `@theme inline`, grouped by token. Pay attention to the chart component, the sidebar, and anything using `--background`, `--border`, or `--ring` directly.
2. For each such usage, state whether overriding the plain `:root`/`.dark` variable is sufficient, or whether a `@theme inline` remap is also required.
3. Note any component that hardcodes a colour instead of reading a token.
4. State the practical conclusion: can the adapter bind only the plain variables, or must it also emit a `@theme inline` block?

Sources: the shadcn-svelte repository on GitHub (registry component sources and the `tailwind.css` export), plus this repo's `src/routes/layout.css`.

## Output

Write findings to `.scratch/daisyui-adapter/research/05-component-var-consumption.md`, ending with `## What this means for the adapter` (max 10 bullets). Then append a `## Answer` gist (max 10 lines) to this ticket file and set `Status: resolved`. Do not edit `map.md` or any other ticket.

## Answer

Both layers are required; neither one alone works.

- `@theme inline` must be emitted: components are ~95% utility-driven, and `bg-popover`, `border-border`, `ring-ring`, `rounded-lg` only exist because `layout.css:79-120` maps `--color-*` / `--radius-*` to the plain vars. That map is project-owned; `shadcn-svelte/tailwind.css` contains none.
- The full plain `:root`/`.dark` set must also be emitted: `@theme inline` inlines `var(--token)` into every utility, so utilities resolve against the plain vars at runtime.
- Direct raw readers that force plain vars: `--sidebar-border` / `--sidebar-accent` (`sidebar-menu-button.svelte:9`), `--secondary` / `--muted` / `--primary` / `--foreground` in `color-mix()` and `oklch(from var(--primary) …)` (`button.svelte:12`, `bubble.svelte:9-11`), and `--radius` (`[--radius:0]` in `sidebar-content.svelte:18`, `sidebar-header.svelte:17`).
- One case `@theme inline` cannot cover: `sonner.svelte:16` reads `var(--color-popover)`, `var(--color-popover-foreground)`, `var(--color-border)` at runtime, and inline theme vars are never emitted as custom properties (Tailwind v4.3 test snapshot). Declare those three plainly, or use `@theme static`.
- Nothing reads `--background`, `--border`, `--ring`, or any `--chart-*` raw; chart only carries user-supplied `var(--chart-N)` strings into per-instance `--color-*` it sets itself.
- Hardcoded: dialog / alert-dialog / sheet / drawer overlays use `bg-black/20` (no token), so the scrim needs a class override.
