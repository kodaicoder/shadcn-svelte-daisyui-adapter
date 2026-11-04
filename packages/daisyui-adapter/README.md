# @kodaicoder/shadcn-svelte-daisyui-adapter

Generate a shadcn-svelte token set from a daisyUI v5 theme, at build time, with no daisyUI runtime dependency.

The CLI reads your stylesheet and your `src/daisyui-theme.css`, then rewrites each `:root` and `.dark` block so every shadcn token reads a daisyUI value, with the value that was already in the file as the fallback. It also writes the `@plugin` line and the chart ramp. `init` maps the stylesheet and then patches the target component classes on disk, and `fix` re-runs the patch step.

The plugin then emits `--daisy-color-*` and `--daisy-radius` from the theme while Tailwind builds, so a theme change takes one rebuild and no re-run.

This package is not affiliated with shadcn-svelte or daisyUI. Both names are used only to say what it reads and what it writes.

## Prerequisites

- A SvelteKit project with `shadcn-svelte` 1.8.x set up through step 4 of its guide.
- `components.json` at the project root, with `tailwind.css` pointing at the project's global stylesheet (`src/routes/layout.css` on SvelteKit 3, `src/app.css` on older projects). The CLI reads that path on every run and never hardcodes it.
- That stylesheet imported by the root layout.
- `src/daisyui-theme.css` holding one light and one dark block from the [daisyUI theme generator](https://daisyui.com/theme-generator/). Copy the blocks as they are, including the `@plugin "daisyui/theme"` prelude.

## Usage

```bash
# 1. paste one light and one dark block from the theme generator
#    into src/daisyui-theme.css

# 2. create the shadcn-svelte setup
pnpm dlx shadcn-svelte@latest init

# 3. add the components you use
pnpm dlx shadcn-svelte@latest add <components you use>

# 4. map the stylesheet and fix those components
pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 init

# 5. the gate
pnpm build
```

Step 3 comes before step 4 because `init` fixes the components already on disk. A component you add later needs `pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 fix <component>`. `shadcn-svelte add -a` can overwrite a fixed file, and the next `fix` restores it.

The fixer covers the form controls (`button`, `toggle`, `input`, `textarea`, `native-select`, `select`, `input-group`, `input-group-button`, `checkbox`, `radio-group`, `switch`), the surfaces (`card`, `dialog`, `sheet`, `alert`, `popover`, `drawer`, `navigation-menu`, `command`, `hover-card`, `table`, `calendar`, `range-calendar`, `dropdown-menu`, `context-menu`, `menubar`), the chart, and the four variant components (`button`, `badge`, `alert`, `bubble`). Add the ones you use; the rest are left untouched.

The CLI adds the package as a devDependency at its own version, because the `@plugin` specifier resolves through `node_modules` at build time. Run it from the project root.

## What the CLI prints

A first run on a project that added `dialog` only starts like this:

```
[daisyui-adapter] theme ok: light + dark
[daisyui-adapter] wrote src/routes/layout.css
[daisyui-adapter] 43 light, 43 dark
[daisyui-adapter] dialog dialog-close (dialog/dialog-content.svelte): stock -> fixed
[daisyui-adapter] dialog dialog-content (dialog/dialog-content.svelte): stock -> fixed
[daisyui-adapter] fix: 2 stock, 0 fixed, 0 customized, 10 missing
[daisyui-adapter] installed @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0
```

The ten sites the project never added each print a `missing` line above the summary, omitted here. The CLI prints one line per replacement site. A site this run patches prints `stock -> fixed`, and the summary counts it as `stock` because the states are read before the write. A site already fixed prints `fixed`. A site it leaves alone prints `customized`, and a target with no file prints `missing`.

The count above the fix report is read back from the written file, so a missing row shows a number below 43. A second run prints `already installed` instead of installing again. A run on a stylesheet from an older version prints `upgrading <old> -> 0.3.0` before the rest. With a theme, two chart lines follow the install line and report the solved lightness ramp and the minimum adjacent difference.

A missing theme file is a warning, not a failure. The CLI prints `E1`, writes the bindings with your own values as fallbacks, and the build renders the project's palette. A malformed theme file exits non-zero with `E2` or `E3`, because a wrong pair would render wrong colours silently. When the header names a newer version than the CLI, the CLI prints `E4`, exits non-zero and writes nothing, because an older CLI would undo bindings a newer one wrote.

## Fixing components after the first run

`fix` runs every present target component. `fix <component>` runs the named ones:

```bash
pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 fix
pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 fix dialog
```

The fixer reads four states per replacement site: `missing`, `stock`, `fixed` and `customized`. It patches a `stock` site, leaves a `fixed` site, reports a `customized` site, and still applies the other sites in the same file. A second run is byte-identical.

`--dry-run` reports without writing. `--check` exits 1 only while a stock site remains. A fixed, customized or never-added component does not fail it. `--strict` exits 1 on a customized site or on a component you named that has no files. A target you never added is not an error. A radius or surface site whose 1.8 stock already holds the role step is reported `fixed` without a write, so `--check` still fails if a hand edit moves it off the step.

The fixer reads the installed shadcn-svelte version and refuses one outside 1.8.x with a clear message, exiting 1 before the report. An unreadable version warns and continues, because `dlx` often leaves no dependency entry. The style label is not checked. An unmatched style only reports `customized`.

An unknown target name exits non-zero and lists the known targets. With no target component present, `init` maps the stylesheet, prints `no target components found; nothing to fix` and exits 0.

A write updates the header marker. `--dry-run`, `--check` and `--strict` never write and never move the marker.

## The header comment

The first line of the stylesheet is the version marker:

```
/* @kodaicoder/shadcn-svelte-daisyui-adapter 0.3.0 | components 0 fixed | re-run `pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 init` after `shadcn-svelte init` */
```

The first number is the version that wrote the stylesheet. `components N fixed` is the number of component files whose every replacement site is `fixed`, not the number of files changed in the run. A file with a mix of fixed and customized sites is reported and not counted. A map-only run records `components 0 fixed`. A no-op `fix` keeps N, so the re-run stays byte-identical.

`shadcn-svelte init` keeps the header comment, wipes the bindings, and the next adapter run restores them. If the project has an override import, that import is kept too, but the CLI does not create it. Re-run when:

- `shadcn-svelte init` or a large `add` changed the stylesheet;
- you moved to a newer CLI and want the header to name it;
- the changelog says the mapping table or the emitted shape changed.

A run that writes refuses when the header names a newer version than the CLI. It prints `E4`, exits non-zero and writes nothing, because an older CLI would undo bindings a newer one wrote. `init` and a write-mode `fix` both check it. Run the version the header names, or upgrade the CLI.

## What the adapter writes

### Tokens

Each block holds 43 non-derived declarations: 38 binding keys plus 5 chart rows. Thirteen derived helpers sit beside them: nine from the four mix keys and the five chart rows, and four from the text tones.

0.3.0 adds eleven bindings. The seven status tokens are `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground` and `destructive-foreground`. The four text tones are `success-text`, `warning-text`, `info-text` and `destructive-text`. Each has a `--color-*` alias.

A text tone is `color-mix(in oklch, var(--<tone>) 40%, var(--foreground) 60%)`. The raw tone stays the fill and is never the text. The status fallbacks are fixed, so a project with no theme is still readable.

### Radius

The role picks the step: selector to `--radius-sm`, field to `--radius-md`, box to `--radius-lg`. The component size shifts the step: `xs`, `sm`, `icon-xs` and `icon-sm` to `sm`; `default`, `md` and `icon` to `md`; `lg` and `icon-lg` to `lg`.

The scale is linear in `--radius`, with no clamp, so at zero every step is zero. `init` warns above 2rem, because the components become pill-like. Circles, edge-joining utilities and the calendar cell property stay unchanged.

### Variants

The components keep one `variant` prop. Every combined value is a literal key.

Button gains `success`, `warning` and `info` as filled buttons with the text-tone border, `destructive` as a filled button with the same border, and `outline-*`, `ghost-*` and `link-*` for the four tones. The `outline-*` keys paint the text tone as text and border.

Badge gains `success`, `warning` and `info` as filled chips with the text-tone border, and `outline-*`, `ghost-*` and `link-*` for the four tones. The `outline-*` keys are border-only chips. The destructive badge is a `bg-destructive/10` chip with the text-tone border and text.

Bubble gains `success`, `warning` and `info` as filled bubbles with the text-tone border, plus `outline-*` and `ghost-*` for the four tones. It has no link presentation. The destructive bubble stays the stock tint.

Alert gains `success`, `warning` and `info` as card-backed alerts. The destructive alert stays the stock text treatment.

The filled status keys and the filled destructive button carry the text-tone border, so the component boundary clears 3:1. The fill against the page can stay below 3:1. The border is the boundary.

## Visual check

Check light and dark. Check the ten repaired pairs: dialog and sheet close, calendar and range hover, range middle, destructive menu shortcuts, chart tooltip and muted bubble. Check the four tones in each presentation the component supports, the filled border, the radius on the button, card and input, and the destructive base. The adapter's own release check uses the repo harness for light and dark screenshots, plus this checklist. Storybook is not part of 0.3.0.

## Overrides (optional)

The CLI does not create `daisyui-adapter.overrides.css` and does not write its import. Overrides are opt-in: you add both yourself.

To use overrides, create `daisyui-adapter.overrides.css` beside the global stylesheet, then add this line after the other `@import` lines and before the generated `:root` and `.dark` blocks:

```css
@import './daisyui-adapter.overrides.css';
```

The CLI never writes or deletes the file. If the project installed 0.1.0, the file and the import already exist. Keep them if you use them, or delete both if you do not.

The import comes before the generated blocks, so a plain `:root` there loses on source order. Raise the specificity and keep the light block out of dark mode. Use `html:not(.dark)` for light and `html.dark` for dark:

```css
html:not(.dark) {
	--daisy-derived-chart-1: oklch(0.62 0.08 250);
}

html.dark {
	--daisy-derived-chart-1: oklch(0.72 0.08 250);
}
```

Both selectors beat the generated `:root` and `.dark`, and the light one does not leak into dark. Write the pair when you need both schemes.

## Version policy

The header records one exact version, and that number is what a project holds. A patch release fixes the CLI or the parser without moving a key or changing a shape, and does not need a re-run. A change to the mapping table, to a token's shape or to what the plugin emits is a minor bump, and it requires a re-run. The changelog names each one.

0.3.0 is a minor bump. A project on the previous release re-runs `init`, and `fix` covers components added later.

## Checking the result

`pnpm build` is the gate. The plugin reads `src/daisyui-theme.css` while Tailwind builds, so a malformed theme block fails there. With the theme removed, the build still passes and the page renders the pre-adapter palette.

## Testing a tarball before publish

`pnpm pack` writes `kodaicoder-shadcn-svelte-daisyui-adapter-0.3.0.tgz`. Set `DAISYUI_ADAPTER_INSTALL_SPEC` to that file and the CLI installs it instead of the registry copy. Pack from the package directory, then run the CLI from the app's root:

```bash
# in packages/daisyui-adapter, writing into the app's root
pnpm pack --pack-destination <app>

# in the app's root
DAISYUI_ADAPTER_INSTALL_SPEC=./kodaicoder-shadcn-svelte-daisyui-adapter-0.3.0.tgz \
  node <repo>/packages/daisyui-adapter/cli/init.mjs
```

The CLI prints `installed ./kodaicoder-shadcn-svelte-daisyui-adapter-0.3.0.tgz`. Without the variable it installs `@kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0` from the registry.

## What it does not do

- It does not apply daisyUI component skins.
- It does not add a daisyUI runtime dependency.
- It does not map more than one light and dark pair.
- It does not map `--size-field` or `--size-selector`.
