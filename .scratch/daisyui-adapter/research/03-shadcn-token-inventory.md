# 03 — shadcn-svelte token inventory by style

Researched 2026-10-27 against `shadcn-svelte@1.7.1`, tag commit
`6149e14107a9de3530a3083de2f1b7623b3c5d1f` (this repo depends on
`shadcn-svelte ^1.7.1`, so tag and code line up). Every claim below is from
that commit, this repo's committed `src/routes/layout.css`, or the public
JSON schema at the same commit.

## How the token set is produced (the actual chain)

1. `shadcn-svelte init` resolves a preset (`style`, `baseColor`, `theme`,
   `font`, `fontHeading`, `radius`, `menuAccent`, `menuColor`) and encodes it
   into a short code
   ([`preset/preset.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/preset/preset.ts#L17-L26),
   [`preset/preset.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/preset/preset.ts#L116-L122)).
2. The CLI fetches `<registry>/init?preset=<code>` and applies it like any
   registry item
   ([`commands/init/index.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/commands/init/index.ts#L312-L351)).
3. That endpoint calls `buildRegistryBase`, which merges
   `baseColor.cssVars[light|dark]` with `theme.cssVars[light|dark]`, optionally
   overrides `chart-1..5` from `chartColor`, `accent`/`accent-foreground` from
   `menuAccent: "bold"`, and `radius` from the radius preset, then returns a
   single `registry:base` item carrying `cssVars` and `css`
   ([`registry/config.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/src/lib/registry/config.ts#L196-L313)).
   Note: `style` is **not** read here. It only sets the item name and the
   component-class bundle.
4. Fonts are separate `registry:font` items. Each one contributes
   `cssVars.theme[font.variable] = font.family` and an `@import`
   ([`utils/fonts.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/utils/fonts.ts#L18-L25)).
5. `transformCss` parses the existing global CSS with PostCSS, calls
   `updateCssVars`, and writes the file back in place
   ([`transform-css.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/utils/transform-css.ts#L12-L40)).

So the token set is a function of **base colour + theme + fonts + radius**.
The style is orthogonal (see §5).

## 1. Every custom property, `sera` reference

Reference output: this repo's `src/routes/layout.css`
(`:root` lines 11–42, `.dark` lines 46–76, `@theme inline` lines 80–119).
Counts were checked mechanically: 32 / 31 / 40 declarations.

### `:root` — 32 keys

| Family | Keys |
| --- | --- |
| Core surfaces | `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground` |
| Core roles | `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive` |
| Core lines | `border`, `input`, `ring` |
| Charts | `chart-1`, `chart-2`, `chart-3`, `chart-4`, `chart-5` |
| Length | `radius` |
| Sidebar | `sidebar`, `sidebar-foreground`, `sidebar-primary`, `sidebar-primary-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-border`, `sidebar-ring` |

18 + 5 + 1 + 8 = 32.

### `.dark` — 31 keys

Identical list **minus `radius`**. `--radius` is written only into the light
map: all seven base colours define `radius` inside `cssVars.light`, and no
theme defines it at all (7 `radius:` declarations total in
[`registry/themes.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/src/lib/registry/themes.ts#L3-L522),
one per base colour).

### `@theme inline` — 40 keys

| Kind | Keys | Written as |
| --- | --- | --- |
| Fonts (2, from `registry:font`) | `font-sans`, `font-heading` | literal family string |
| Colours (31, derived from light/dark) | `color-background`, `color-foreground`, `color-card`, `color-card-foreground`, `color-popover`, `color-popover-foreground`, `color-primary`, `color-primary-foreground`, `color-secondary`, `color-secondary-foreground`, `color-muted`, `color-muted-foreground`, `color-accent`, `color-accent-foreground`, `color-destructive`, `color-border`, `color-input`, `color-ring`, `color-chart-1`…`color-chart-5`, `color-sidebar`, `color-sidebar-foreground`, `color-sidebar-primary`, `color-sidebar-primary-foreground`, `color-sidebar-accent`, `color-sidebar-accent-foreground`, `color-sidebar-border`, `color-sidebar-ring` | `var(--<key>)` |
| Radius (7, derived from `radius`) | `radius-sm`, `radius-md`, `radius-lg`, `radius-xl`, `radius-2xl`, `radius-3xl`, `radius-4xl` | `calc(...)` / `var(...)` |

2 + 31 + 7 = 40. There is **no** `--radius` entry in `@theme inline`, and the
sidebar colour is `--color-sidebar`, not `--color-sidebar-background`
(the updater renames `sidebar-background` → `sidebar`, then emits
`--color-sidebar: var(--sidebar)`)
([`update-css-vars.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/utils/updaters/update-css-vars.ts#L205-L218)).

Ordering is an artefact of repeated `insertAfter`, so the emitted order looks
reversed (sidebar first, then charts, then core). Do not depend on it.

## 2. Radius scale

Hardcoded in the updater, same for every style
([`update-css-vars.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/utils/updaters/update-css-vars.ts#L179-L204)):

| Token | Value |
| --- | --- |
| `--radius-sm` | `calc(var(--radius) * 0.6)` |
| `--radius-md` | `calc(var(--radius) * 0.8)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) * 1.4)` |
| `--radius-2xl` | `calc(var(--radius) * 1.8)` |
| `--radius-3xl` | `calc(var(--radius) * 2.2)` |
| `--radius-4xl` | `calc(var(--radius) * 2.6)` |

The scale is emitted only when a `radius` key exists in `cssVars`; existing
`--radius-*` declarations are never overwritten.

Base value: base colours ship `radius: 0.625rem`. The radius preset overrides
it **only when the preset is not `default`**
([`registry/config.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/src/lib/registry/config.ts#L240-L246)):
`none` 0rem, `small` 0.45rem, `medium` 0.625rem, `large` 0.875rem. The `default`
row in `PRESET_RADII` says `0.5rem`
([`preset/preset.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/preset/preset.ts#L116-L122)),
but that value is never applied by this path: `default` means "keep the base
colour's 0.625rem". This repo's file confirms it (`--radius: 0.625rem`).

## 3. Token types

- **Colours (30 + 5 sidebar + 3 lines + 2 role pairs = everything but radius):**
  every `:root`/`.dark` key except `radius`, all `oklch(...)` in shipped data.
- **Length:** `radius` only. The seven `--radius-*` are derived lengths.
- **Fonts:** `--font-sans`, `--font-heading` only, and only in `@theme inline`.
  They are literal family strings, not `var()` references, and never appear in
  `:root`/`.dark`.
- There are no shadows, spacing, z-index, or animation tokens in the set.

## 4. `--destructive-foreground`

It **does not exist** in shadcn-svelte 1.7.1. Evidence:

- Zero occurrences in `registry/themes.ts` (all base colours + all themes).
- Absent from the documented variable list
  ([`docs/content/theming.md`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/content/theming.md#L37-L110)).
- Absent from this repo's generated `layout.css`.

Only `--destructive` exists, and it has no `-foreground` partner. Destructive
buttons use `text-white`-style foregrounds inside components, not a token.

## 5. Which keys are style-dependent

**None.** All eight shipped styles (`vega`, `nova`, `maia`, `lyra`, `mira`,
`luma`, `sera`, `rhea`) have the same token set. Their CSS files
(`docs/src/lib/registry/styles/style-<style>.css`) contain only a
`.style-<name> { .cn-<component> { @apply … } }` tree. I checked all eight for
`:root`, `.dark`, `@theme`, and custom-property declarations: the only
`--*` hits are component-local arbitrary properties such as
`[--radius:0]` on `.cn-sidebar-header`, plus `--cell-size`, `--cell-radius`,
`--card-spacing`, `--drawer-inset`. No global token blocks exist in any style.
The style is applied by rewriting component class lists at registry build time
([`docs/scripts/build-registry.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/scripts/build-registry.ts#L212-L256)).

What actually varies:

- **Values** vary by `baseColor` and `theme`. Coloured themes (e.g. `emerald`)
  supply a subset (primary, secondary, charts, sidebar-primary/accent) that is
  merged over the base colour's full 32-key map.
- **`--font-heading` presence** varies by preset, not by style: it is added only
  when `fontHeading !== "inherit"`
  ([`registry/config.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/src/lib/registry/config.ts#L280-L286)).
  Of the eight shipped presets, only `sera` sets a heading font
  (`playfair-display`)
  ([`preset/presets.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/preset/presets.ts#L111-L125)).
- `--font-sans` is present for every preset (every preset names a body font).

Union check: every key name appearing anywhere in `themes.ts` is exactly the
32 listed in §1. No theme adds `chart-6`, `sidebar-background`, or anything
else.

## 6. Registry `cssVars` contract

Containers are fixed, key names are not:

- Public schema: `cssVars` has `additionalProperties: false` with only
  `theme`, `light`, `dark`. Each of those is
  `propertyNames: {type: "string"}`, `additionalProperties: {type: "string"}`
  ([`schema/registry-item.json`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/static/schema/registry-item.json)).
- CLI Zod schema: `const colorSchema = z.record(z.string(), z.string())`, reused
  for `theme`, `light`, `dark`
  ([`utils/registry/schema.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/utils/registry/schema.ts#L107-L126)).
- Docs show an arbitrary key (`brand`) alongside `radius`
  ([`registry-item-json.md`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/content/registry/registry-item-json.md#L243-L262)).

So: **arbitrary token keys are accepted and passed through.** Values must be
strings. No known-token allowlist is applied.

Behaviour that matters when passing keys:

- Leading `--` is optional; the updater strips it before prefixing
  (`key.replace(/^--/, "")`).
- `sidebar-background` is aliased to `sidebar`.
- A value that looks like an HSL triplet (`"20 14.3% 4.1%"`) is wrapped as
  `hsl(...)`; anything starting `hsl`, `rgb`, `#`, `oklch`, or containing
  `--color-` is passed verbatim. daisyUI's `oklch()` values therefore pass
  through unchanged.
- In `light`/`dark`, a colour-looking value additionally produces
  `--color-<key>: var(--<key>)` in `@theme inline`. A non-colour value produces
  `--<key>: var(--<key>)` instead, which is a self-referential no-op: it gives
  you no Tailwind utility. Non-colour values belong in `cssVars.theme`, which
  is written literally into `@theme inline`.

## 7. Where `cssVars.light` is written

Into the **existing** `:root`, not a new block.

- `updateCssVars` walks rules for one whose selectors include `:root` and calls
  `applyVarsToRule` on it, appending or replacing each declaration
  ([`update-css-vars.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/utils/updaters/update-css-vars.ts#L31-L57)).
- A new `:root` is created only when none exists **and** the file has an
  `@import` or `@theme` at-rule (`hasV4Structure`). In a file with neither, the
  light/dark vars are silently dropped.
- `.dark` follows the same rule, and the updater adds
  `@custom-variant dark (&:is(.dark *))` when dark vars exist in a v4 file.
- Existing declarations are **overwritten by default**
  (`overwriteCssVars ?? true`, line 20). The CLI asks once before writing the
  stylesheet ("Existing CSS variables may be overwritten"), then writes the
  whole file back
  ([`add-registry-items.ts`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/packages/cli/src/utils/add-registry-items.ts#L240-L277)).
- The docs prompt text "this file will be overwritten" is misleading: the token
  path is an in-place AST edit, and unrelated rules survive. The `css` payload
  (the `@layer base` rule, `@import` lines) is merged separately.

## Caveat: this repo's `layout.css` is not the `taupe` output

The ticket describes it as `sera` + baseColor `taupe`. The committed file is
`sera` but the values are **baseColor `olive` + theme `emerald`**:

- `--foreground: oklch(0.153 0.006 107.1)` is `olive` light
  (`taupe` light is `oklch(0.147 0.004 49.3)`).
- `--primary: oklch(0.508 0.118 165.612)` is the `emerald` theme's primary,
  not `olive`'s `oklch(0.228 0.013 107.4)`.
- Fonts are `manrope` (`--font-sans`) plus `playfair-display`
  (`--font-heading`), not the `sera` preset's `noto-sans`.

The key set is identical either way, so every answer above is unaffected; only
the sample values differ.

## Caveats on verification

- All behaviour was read from source at the 1.7.1 tag. No CLI was run (out of
  scope for this ticket), so the write mechanics are source-verified, not
  execution-verified.
- The installation doc's step-4 prompt transcript is stale: it says "Which base
  color…" while 1.7.1 prompts for a preset
  ([`docs/content/installation/sveltekit.md`](https://github.com/huntabyte/shadcn-svelte/blob/6149e14107a9de3530a3083de2f1b7623b3c5d1f/docs/content/installation/sveltekit.md#L43-L55)).
  The resulting CSS is unaffected; `init` is what writes it.
- The Zod `cssVars` object is not `.strict()`, so unknown *containers* would be
  stripped by Zod but rejected by the published JSON schema. Either way,
  `theme`/`light`/`dark` are the only containers that work.

## What this means for the adapter

- Target exactly 32 light keys, 31 dark keys, and the font/radius theme keys.
  There is no `destructive-foreground` to invent; anything claiming to emit it
  is adding a non-shadcn token.
- Emit colours under `cssVars.light` / `cssVars.dark` and let the CLI derive
  `--color-*`; do not hand-author the `@theme inline` colour block, because the
  CLI will append a second mapping for keys it does not already see.
- One `radius` value in `light` is enough; the seven-step scale is fixed by the
  CLI (0.6 / 0.8 / 1 / 1.4 / 1.8 / 2.2 / 2.6). A daisyUI `--radius-*` ramp does
  not map onto it one-to-one.
- Keep typography app-owned, or ship `registry:font` items with
  `variable: "--font-sans"` / `"--font-heading"`. Only `sera` currently gets a
  heading font by default, so `--font-heading` is optional, not guaranteed.
- Arbitrary keys are legal, but a non-colour value in `light`/`dark` only yields
  a self-referential `@theme` entry. Use `cssVars.theme` for literals.
- daisyUI's `oklch()` values pass through verbatim; HSL-triplet strings would be
  wrapped in `hsl()`, so normalise to `oklch()` to avoid surprises.
- Keys may be written unprefixed; the CLI adds `--`. Do not rely on key order in
  the emitted file.
- The token set is style-independent, so the adapter needs no per-style
  variants; `style` can be whatever the project already chose.
- Because `:root` is merged and overwritten by default, a rerun replaces values
  in place and leaves unrelated declarations alone. That is the mechanical
  baseline ticket 14 has to design around.
- A global CSS file without `@import`/`@theme` silently receives no variables;
  document the Tailwind v4 requirement rather than debugging empty output.
