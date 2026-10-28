# Map: daisyUI theme adapter for shadcn-svelte

## Destination

A public, installable daisyUI-to-shadcn-svelte theme adapter. A team installs shadcn-svelte up to step 4 of the SvelteKit guide, drops a daisyUI light block and a dark block into `src/daisyui-theme.css`, runs one `shadcn-svelte add` command, and gets a full shadcn-svelte token set (core, sidebar, chart, radius) generated from that file at build time, with no daisyUI dependency left behind.

## Notes

**Domain.** A daisyUI v5 theme is an `@plugin "daisyui/theme" { ... }` block carrying `name`, `default`, `prefersdark`, `color-scheme`, `--color-*`, `--radius-*`, `--size-*`, `--border`, `--depth`, `--noise`. shadcn-svelte ships its own token set in the global CSS file (`:root`, `.dark`, `@theme inline`) and components consume it either through Tailwind utilities (`bg-background`) or directly (`var(--chart-1)`).

**Settled at charting.**
- The destination is public: anyone can install, not only this team.
- Delivery is build-time generation. daisyUI is input only and must not remain a runtime dependency.
- Coverage is every shadcn token family: core, sidebar, chart, radius. Typography stays app-owned because daisyUI has no font tokens.
- Tokens daisyUI lacks (border, input, ring, muted, card, popover, destructive-foreground, charts) get fixed derivations plus an escape hatch.
- Theme names are free. The light/dark pair is chosen by `color-scheme`, with `default` and `prefersdark` as tiebreakers.
- One or two documented manual lines are acceptable where the CLI cannot inject them.

**Constraints.**
- This repo has no git remote and no commits. Public hosting needs a new home.
- shadcn-svelte 1.7 `add` accepts a component name or a full URL. There is no `@scope/name` namespacing in this version.
- Registry items have no lifecycle hooks, so install-time computation is impossible. The plugin runs at build time.
- `cssVars` edits the existing `:root` and `.dark` blocks in place. `css` merges by selector, appends new selectors at the end, and special-cases `@plugin`, inserting it at top level right after the last `@import`. `docs` prints nothing. There is no CSS existence check.
- Token values must stay opaque. Tailwind opacity modifiers (`bg-muted/50`) multiply alpha, so any alpha baked into a generated value produces the wrong result at every use site.
- A daisyUI theme block carries 28 variables and 4 metadata keys: `name`, `default`, `prefersdark`, `color-scheme`, 20 `--color-*`, `--radius-selector/field/box`, `--size-selector/field`, `--border`, `--depth`, `--noise`. The generator emits one block per copy, so the input file is two pasted blocks. `color-scheme` is the only light/dark marker; `default` and `prefersdark` are cascade hints we drop.
- `--radius-*`, `--border`, `--depth` and `--noise` have no fallback in daisyUI, so a partial block renders square and borderless. The parser requires all 28 keys rather than filling gaps. Utilities compile to `var(--popover)` / `var(--radius)`, so the plain `:root` and `.dark` variables are load-bearing even for utility-only components. `shadcn-svelte/tailwind.css` carries no token map; the map is project-owned.
- This repo's token set: 18 core, 5 chart, 8 sidebar, plus `--radius` in `:root` only. `--destructive-foreground` does not exist in shadcn-svelte 1.7.1. The key set is identical across all eight styles, which differ only in component classes; token values come from the base colour and preset. The adapter can therefore own one fixed key list.

**Unproven assumptions.** Three claims came from reading source and were never observed. Ticket 20 must prove them before 07, 08 or 13 are decided:
- the CLI's `@plugin` injection produces a working build, not just a line in a file;
- `cssVars` overwrites in place rather than appending;
- a plain `--color-*` declaration is what sonner needs, since `@theme inline` emits none.

**Work order.** 15 (harness) → 20 (mechanism spike) → 07, 08, 13. Tickets 09 to 12 are unblocked already and may run in any order before 16. 19 follows 13. 17 and 18 follow their own blockers.

**Research convention.** No git remote exists, so research notes live at `.scratch/daisyui-adapter/research/NN-<slug>.md` instead of on a `research/<name>` branch.

**Skills sessions should consult.** `research` for research tickets, `grilling` and `domain-modeling` for decision tickets, `prototype` for ticket 16.

## Decisions so far

- [Verification harness](issues/15-verification-harness.md): `harness/run.mjs` builds a disposable SvelteKit 3 project, reproduces shadcn step 4, optionally installs a registry item, builds, renders light and dark, and keeps evidence. `shadcn-svelte@1.7.1 init` cannot run unattended because it requires a preset id from shadcn-svelte.com/create, so the harness constructs the step-4 state directly. SvelteKit 3 has no `svelte.config.js`; the adapter lives in `vite.config.ts` and the default alias is `#lib`. Clean run: exit 0, build true, no console errors, port freed. Detail in [the ticket](issues/15-verification-harness.md).
- [Core colour mapping](issues/09-core-colour-mapping.md): surface-first, not name-to-name. `secondary`, `muted` and `accent` all take `base-200` because shadcn uses those names for surfaces, while daisyUI uses them for brands. `muted-foreground`, `border`, `input` are opaque `color-mix()` derivations; `ring` takes `primary`. `card` and `popover` are both `base-100`: daisyUI dark themes place `base-200` below `base-100`, so a popover on `base-200` would sink under the page. `info`, `success`, `warning` are dropped in v1, and `destructive-foreground` does not exist. Detail in [the ticket](issues/09-core-colour-mapping.md).
- [daisyUI parse contract](issues/02-parse-stability.md): tolerates BOM/CRLF, comments, quoting variants, key order, duplicates, extra keys, a global `@plugin "daisyui"` block, and one missing `color-scheme` when the other block identifies the pair. Rejects zero/one/3+ blocks, two blocks of the same scheme, v4 syntax, unterminated constructs, and missing tokens. Three error messages defined, all naming the file and the generator URL. Proposes resolving the theme file as a sibling of the adapter module (`fileURLToPath(new URL(...))`), because the injected `@plugin` body is a static string. **Open disagreement:** it rejects any of the 28 tokens missing, while ticket 11 leans toward ignoring six of them. Settle in 11.
- [daisyUI generator output inventory](issues/01-daisyui-generator-output.md): one block per copy, 28 variables plus 4 metadata keys, `color-scheme` is the only light/dark marker. The generator never emits a pair, so the input file is two pasted blocks. Flags are unvalidated: zero or two `default: true` are both legal, so the adapter classifies by `color-scheme` and treats the flags as advisory. v5 removed colour conversion, so values are arbitrary CSS colours and v4 snippets (`--p`, `--rounded-btn`, bare channels) need a named error. Detail in [research note](research/01-daisyui-generator-output.md).
- [shadcn-svelte token inventory](issues/03-shadcn-token-inventory.md): 18 core, 5 chart, 8 sidebar, `--radius` in `:root` only, 40 entries in `@theme inline` (2 fonts, 31 colours, 7 radius steps). `--destructive-foreground` does not exist in 1.7.1, so the adapter must not invent it. Styles carry no token blocks at all, only component classes, so the key list is universal across styles. `cssVars` accepts arbitrary key names, values must be strings, and the `--` prefix is optional. Detail in [research note](research/03-shadcn-token-inventory.md).
- [Registry application mechanics](issues/04-registry-application-mechanics.md): the CLI can inject `@plugin` itself, special-cased and placed after the last `@import`, so the install needs no manual edit. `cssVars` overwrites tokens inside the existing `:root`/`.dark` blocks, which removes the cascade fight entirely. `css` appends unknown selectors at the end, and a `:root` appended after `.dark` can leak light values into dark mode. `docs` prints nothing, so the only failure gate is the build. Detail in [research note](research/04-registry-application-mechanics.md).
- [Component `var()` consumption audit](issues/05-component-var-consumption.md): utilities inline to `var(--token)`, so overriding the plain variables is sufficient for them, and the existing `@theme inline` block must stay. Tokens read raw and therefore name-bound: `--sidebar-border`, `--sidebar-accent`, `--secondary`, `--muted`, `--primary`, `--foreground`, `--radius`. `--primary`, `--secondary`, `--muted` must be complete colours because they feed `color-mix()` and `oklch(from ...)`. Two gaps found: four hardcoded `bg-black/20` scrims, and sonner reading `--color-*` that inline theme blocks never emit. Detail in [research note](research/05-component-var-consumption.md).
- [Prior art and reported failures](issues/06-prior-art.md): no working reference exists. Every hit either installs daisyUI alongside shadcn or ships literal values with no computed input. The documented failure modes are `muted` sourced from `neutral` instead of `base-200`, `border`/`ring` sourced from brand colours, alpha baked into token values (breaks `/50` modifiers), and leaving `--depth`/`--noise` geometry on. The later comment in the same thread (`discussioncomment-11989841`) is the clearest negative example: `border`→`primary`, `ring`→`info`, `muted`→`neutral`, `card`→`neutral`, `sidebar-border`→`base-content`, all name-to-name, plus v4-only `--rounded-btn` and daisyUI still installed. Detail in [research note](research/06-prior-art.md).

## Not yet specified

- Whether to also expose daisyUI extras (`base-200`, `base-300`, `info`, `success`, `warning`) as Tailwind utilities.
- System-preference dark mode (`prefersdark`) without a JS toggle.
- Storybook wiring inside this design system repo.
- npm scope, package name, license, and version policy for the public registry.
- Whether to ship a sample theme so the install has something to show before a user pastes theirs.

## Out of scope

- Porting daisyUI component skins (`btn`, `card`, `input` styling) onto shadcn components. Tokens only.
- Keeping daisyUI installed at runtime. Explicitly rejected during charting.
- More than one light/dark pair per project, or `[data-theme]` brand switching, in v1.
