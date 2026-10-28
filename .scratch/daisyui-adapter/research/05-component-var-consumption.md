# Component `var()` consumption audit

Type: research · Ticket: `issues/05-component-var-consumption.md`
Date: 2026-10-27

## Scope and method

Three evidence layers, in this order:

1. **Shipped components in this repo** (`src/lib/components/ui/**`), which is the final registry output for this project (style `mira`, `components.json`). Scanned every `.svelte` / `.ts` for `var(--`.
2. **Upstream registry at the matching tag** `shadcn-svelte@1.7.1`: `docs/src/lib/registry/ui/**` and `docs/src/lib/registry/styles/style-mira.css` (the CLI inlines the `cn-*` placeholders from the style file into the literal classes shipped here, e.g. `cn-sidebar-menu-button-variant-outline` → `shadow-[0_0_0_1px_var(--sidebar-border)]`).
3. **The `shadcn-svelte/tailwind.css` export actually imported** by `src/routes/layout.css:3`, plus Tailwind's own `@theme inline` semantics.

`var(--*)` on internal plumbing (`--bits-*`, `--sidebar-width*`, `--gap`, `--spacing`) is listed but is not a design token.

## 1. Inventory: direct token reads that bypass the utility layer

| Token(s) | Consumer | How it is read | Plain `:root`/`.dark` enough? | `@theme inline` needed too? |
| --- | --- | --- | --- | --- |
| `--sidebar-border`, `--sidebar-accent` | `ui/sidebar/sidebar-menu-button.svelte:9` (`variant: outline`) | `shadow-[0_0_0_1px_var(--sidebar-border)]`, `hover:shadow-[0_0_0_1px_var(--sidebar-accent)]` | **Yes** | Not for this read; the `ring-sidebar-ring` / `bg-sidebar-accent` siblings still need the mapping |
| `--secondary`, `--foreground` | `ui/button/button.svelte:12` (`variant: secondary` hover) | `bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]` | **Yes** (both must be real colour values) | Not for this read |
| `--secondary`, `--muted`, `--foreground` | `ui/bubble/bubble.svelte:9-10` | `color-mix(in oklch, var(--secondary|--muted), var(--foreground) 5%)` | **Yes** | Not for this read |
| `--primary` | `ui/bubble/bubble.svelte:11` (`variant: tinted`) | `oklch(from var(--primary) 0.93 calc(c*0.4) h)` and `0.88/0.3/0.35` variants | **Yes**, and `--primary` must be a full colour (`oklch()` / `hsl()`), not a bare channel triplet | Not for this read |
| `--color-popover`, `--color-popover-foreground`, `--color-border` | `ui/sonner/sonner.svelte:16` | inline `style="--normal-bg: var(--color-popover); …"` read by svelte-sonner at runtime | **No** — these names do not exist unless explicitly declared | **No** — `@theme inline` does *not* emit them (see §4) |
| `--radius` | `ui/sidebar/sidebar-content.svelte:18`, `ui/sidebar/sidebar-header.svelte:17` | `[--radius:0]` (local override, flattens every `rounded-*` inside the sidebar) | **Yes**, and `--radius` must exist or the override has nothing to shadow | The `rounded-*` utilities read it through the inline radius scale |
| `--radius` (via scale) | `ui/chart/chart-tooltip.svelte:109` (`rounded-lg`), `calendar/*-select.svelte` (`rounded-md`) | utility → `var(--radius)` / `calc(var(--radius) * n)` after inlining | **Yes** | **Yes** — the scale itself lives in `@theme inline` (`layout.css:113-119`) |
| `--chart-1…5` | none in component source | charts receive the string through user config (`color: "var(--chart-1)"`), emitted by `ui/chart/chart-style.svelte:19` as `--color-<key>` on `[data-chart=id]` | **Yes** | No |
| internal | `--bits-*` (`navigation-menu-viewport.svelte:22`, `trace-collapsible-content.svelte:17`, dropdown/context-menu arbitrary values), `--sidebar-width*` (`sidebar.svelte:77,85,88`, `sidebar-provider.svelte:43`), `--gap` (`toggle-group.svelte:71`), `--spacing` | library plumbing, set by bits-ui or the component | n/a | n/a |

Per-component check of everything the ticket named:

- **chart**: `chart-container.svelte`, `chart-style.svelte`, `chart-utils.ts` contain no `var(--`. `chart-tooltip.svelte` reads `--color-bg` / `--color-border` (set on the same element at `:146`) via `border-(--color-border) bg-(--color-bg)`, plus token *utilities* `border-border/50 bg-background text-muted-foreground text-foreground`. No theme token is read directly. `THEMES` is `{ light: "", dark: ".dark" }` (`chart-utils.ts:4`).
- **sidebar**: only `sidebar-menu-button.svelte:9` reads tokens directly; the rest is utilities plus `--sidebar-width*` plumbing.
- **dialog**: `dialog-content.svelte:31` = `bg-popover text-popover-foreground ring-foreground/10`, `dialog-overlay.svelte:15` = `bg-black/20`. No `var()`.
- **dropdown menu / context menu**: identical pattern, `ring-foreground/10 bg-popover text-popover-foreground` (`dropdown-menu-content.svelte:26`, `dropdown-menu-sub-content.svelte:26`). No `var()`.
- **tooltip**: `tooltip-content.svelte:29` = `bg-foreground text-background` (inverted pair). No `var()`.
- **input**: `input.svelte:27` = `border-b-input`, `focus-visible:border-b-ring`, `aria-invalid:border-b-destructive`. No `var()`.
- **`--background`, `--border`, `--ring`**: **never** read as raw properties anywhere in `src/lib/components/ui`. They are reached only through utilities (`bg-background`, `border-border`, `ring-ring`), i.e. through the `@theme inline` map.

## 2. The `tailwind.css` export

`node_modules/shadcn-svelte/dist/tailwind.css` (source: `packages/cli/src/tailwind.css` at the same tag) contains **no token mapping at all**: two `@theme inline` blocks that only register `@keyframes` (`accordion-*`, `scroll-fade-*`, `tw-shimmer`, lines 1-19 and 117-162), the `data-*` variants, and the `no-scrollbar` / `scroll-fade-*` / `shimmer-*` utilities. It references only internal vars (`--accordion-panel-height`, `--scroll-fade-*`, `--shimmer-*`).

Consequence: the `--color-*` → token map and the radius scale are **project-owned**, in `src/routes/layout.css:79-120`. The package export does not carry them, so an adapter cannot lean on the export for either half of the contract.

## 3. Hardcoded colours instead of tokens

- `ui/dialog/dialog-overlay.svelte:15`, `ui/alert-dialog/alert-dialog-overlay.svelte:15`, `ui/sheet/sheet-overlay.svelte:16`, `ui/drawer/drawer-overlay.svelte:16`: `bg-black/20` scrim. There is no scrim token, so a retheme cannot reach it through variables.
- svelte-sonner's own defaults (`node_modules/svelte-sonner/dist/Toaster.svelte:1027-1054`: `--normal-bg: #fff`, `--gray4`, `hsl(0,0%,20%)`) are the fallback layer for the sonner case above.
- `ui/code-block/code-block-line.svelte:61` applies `token.style` supplied by the caller's syntax theme, not a project token.
- Everything else (tooltip `bg-foreground text-background`, chart tooltip, dropdowns) is token-driven.

## 4. What `@theme inline` actually emits (the decisive mechanic)

Tailwind v4.3.0, `packages/tailwindcss/src/index.ts:652-670` emits every non-`reference` theme entry into `:root, :host`, then `packages/tailwindcss/src/ast.ts:451-461` prunes each one unless it is `STATIC` or `USED`. `Theme.resolve` (`theme.ts:230-234`) returns the raw value for `INLINE` and never references the variable, so an inline theme variable is never marked used and is dropped.

Tailwind's own test snapshot proves the output shape: `@theme inline { --color-primary: var(--primary) }` + `bg-primary` compiles to

```css
.bg-primary { background-color: var(--primary); }
```

with **no `:root` block at all** (`packages/tailwindcss/src/index.test.ts`, "theme values added as `inline` are not wrapped in `var(…)` when used as utility values"). Docs agree: `inline` makes the utility "use the theme variable *value* instead of referencing the actual theme variable", and "by default only used CSS variables will be generated".

Two consequences:

1. Every utility in `layout.css:79-120` (`bg-popover`, `border-border`, `ring-ring`, `rounded-lg`, `font-sans`) resolves to `var(--popover)` / `var(--radius)` at runtime. **The plain variables are load-bearing even for utility-only components.**
2. `--color-popover`, `--color-popover-foreground`, `--color-border` are **not** in the compiled CSS, so `sonner.svelte:16` passes guaranteed-invalid values. Its inline `style` sits on the same element as svelte-sonner's `[data-sonner-toaster][data-sonner-theme='light']` defaults (`Toaster.svelte:1027`), so the inline declaration wins and `background: var(--normal-bg)` (`Toaster.svelte:633`) has nothing to resolve. The sonner theme binding is effectively dead in the stock layout; only an explicitly declared `--color-*` (plain `:root`, or `@theme static`) fixes it. Marked as source-derived: no build or browser run was performed (forbidden by the ticket), so the rendered result was not observed.

## 5. Sufficiency, token by token

- `--sidebar-border`, `--sidebar-accent`, `--secondary`, `--muted`, `--primary`, `--foreground`, `--radius`, `--chart-*`: plain `:root`/`.dark` override is sufficient **provided the name is kept** and the value is a complete colour. No remap needed for the read itself.
- The same tokens still need the `@theme inline` map for the ~95% of the surface that is utility-driven.
- `--color-popover` / `--color-popover-foreground` / `--color-border`: plain override of `--popover` etc. is **not** sufficient; the `--color-*` name must exist.
- No component needs a `--ring`, `--border`, or `--background` raw override, but all three need the map so `ring-ring`, `border-border`, `bg-background` resolve.

## What this means for the adapter

- **Emit both layers.** Plain `:root`/`.dark` alone breaks the utility layer; `@theme inline` alone breaks every direct `var()` reader and resolves utilities to undefined.
- The `@theme inline` block must stay (colors + radius scale + font). It is project-owned (`layout.css:79-120`), not in `shadcn-svelte/tailwind.css`, so the adapter owns it.
- Keep the exact token names. Direct readers are name-bound: `--sidebar-border`, `--sidebar-accent`, `--secondary`, `--muted`, `--primary`, `--foreground`, `--radius`.
- Always declare a plain `--radius`. `--radius-sm/md/lg/…` are inline-only, and sidebar/calendar `[--radius:0]` depends on the base var existing.
- Bind `--primary`, `--secondary`, `--muted`, `--foreground` to resolvable colours, not channel triplets: `button.svelte:12` and `bubble.svelte:11` use `color-mix()` and `oklch(from var(--primary) …)`.
- Add plain `--color-popover`, `--color-popover-foreground`, `--color-border` (or use `@theme static`) or accept sonner toasts losing theme colours. `@theme inline` will not do it.
- `--background`, `--border`, `--ring`, `--input`, `--card`, `--accent`, chart and sidebar colours need only the map, since no component reads them raw.
- Plan for the four `bg-black/20` overlay scrims: they need a class-level override, not a variable.
- Chart tokens are safe: nothing in the chart components reads `--chart-*`; they only travel through user config into per-instance `--color-*` set by `chart-style.svelte`.
- `shadcn-svelte/tailwind.css` gives no token mapping, so wiring the map into it or expecting it to contain one is a dead end.

## Sources

- Local: `src/routes/layout.css`, `src/lib/components/ui/**` (paths and line numbers cited inline), `node_modules/shadcn-svelte/dist/tailwind.css`, `node_modules/svelte-sonner/dist/Toaster.svelte`.
- Upstream registry: https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte%401.7.1/docs/src/lib/registry/ui/sonner/sonner.svelte · .../ui/sidebar/sidebar-menu-button.svelte · .../styles/style-mira.css (direct `var()` inventory at lines 162, 232, 349, 803, 1181, 1361, 1370, 1424, 1474-1482: `--secondary`, `--muted`, `--primary`, `--foreground`, `--radius-sm`, `--radius-md`, `--sidebar-border`, `--sidebar-accent`).
- Tailwind: https://tailwindcss.com/docs/theme#referencing-other-variables · `packages/tailwindcss/src/theme.ts` (resolve, prune options) · `src/index.ts:652-670` · `src/ast.ts:451-461` · `src/index.test.ts` (`@theme inline` snapshot) at tag `v4.3.0`.
