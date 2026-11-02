# @kodaicoder/shadcn-svelte-daisyui-adapter

Generate a shadcn-svelte token set from a daisyUI v5 theme, at build time, with no daisyUI runtime dependency.

The CLI reads your stylesheet and your `src/daisyui-theme.css`, then rewrites each `:root` and `.dark` block so every shadcn token reads a daisyUI value, with the value that was already in the file as the fallback. It also writes the `@plugin` line and the chart ramp. The plugin then emits `--daisy-color-*` and `--daisy-radius` from the theme while Tailwind builds, so a theme change takes one rebuild and no re-run.

This package is not affiliated with shadcn-svelte or daisyUI. Both names are used only to say what it reads and what it writes.

## Prerequisites

- A SvelteKit project with `shadcn-svelte` set up through step 4 of its guide.
- `components.json` at the project root, with `tailwind.css` pointing at the project's global stylesheet (`src/routes/layout.css` on SvelteKit 3, `src/app.css` on older projects). The CLI reads that path on every run and never hardcodes it.
- That stylesheet imported by the root layout.
- `src/daisyui-theme.css` holding one light and one dark block from the [daisyUI theme generator](https://daisyui.com/theme-generator/). Copy the blocks as they are, including the `@plugin "daisyui/theme"` prelude.

## Usage

```bash
# 1. paste one light and one dark block from the theme generator
#    into src/daisyui-theme.css

# 2. shadcn-svelte, as its guide says
pnpm dlx shadcn-svelte@latest init

# 3. the adapter, at an exact version
pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.1.0 init

# 4. the gate
pnpm build
```

The CLI adds the package as a devDependency at its own version, because the `@plugin` specifier resolves through `node_modules` at build time. Run it from the project root.

## What the CLI prints

```
[daisyui-adapter] theme ok: light + dark
[daisyui-adapter] wrote src/routes/layout.css
[daisyui-adapter] 32 light, 32 dark
[daisyui-adapter] created src/routes/daisyui-adapter.overrides.css
[daisyui-adapter] installed @kodaicoder/shadcn-svelte-daisyui-adapter@0.1.0
```

The declaration count comes back from the file it wrote, so a stylesheet missing a row the adapter expects shows a number below 32. A second run prints `already installed` instead of installing again. A run on an older stylesheet prints `upgrading 0.0.9 -> 0.1.0` before the rest.

A missing theme file is a warning, not a failure. The CLI prints `E1`, writes the bindings with your own values as fallbacks, and the build renders the project's palette. A malformed theme file exits non-zero with `E2` or `E3`, because a wrong pair would render wrong colours silently.

## The header comment

The first line of the stylesheet is the version marker:

```
/* @kodaicoder/shadcn-svelte-daisyui-adapter 0.1.0 | re-run `pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.1.0 init` after `shadcn-svelte init` */
```

`shadcn-svelte init` keeps this line and the override import, wipes the bindings, and the next adapter run restores them. Re-run when:

- `shadcn-svelte init` or a large `add` changed the stylesheet;
- you moved to a newer CLI and want the header to name it;
- the changelog says the mapping table or the emitted shape changed.

The CLI refuses to run when the header names a newer version than the CLI. It prints `E4`, exits non-zero and writes nothing, because an older CLI would undo bindings a newer one wrote. Run the version the header names, or upgrade the CLI.

## The override file

The CLI creates `daisyui-adapter.overrides.css` beside the stylesheet, empty, plus its `@import` line. It never writes that file again, so a user edit survives every later run.

The import comes before the generated blocks, so a plain `:root` there loses on source order. Raise the specificity and keep the light block out of dark mode:

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

## Checking the result

`pnpm build` is the gate. The plugin reads `src/daisyui-theme.css` while Tailwind builds, so a malformed theme block fails there. With the theme removed, the build still passes and the page renders the pre-adapter palette.

## Testing a tarball before publish

`pnpm pack` writes `kodaicoder-shadcn-svelte-daisyui-adapter-0.1.0.tgz`. Set `DAISYUI_ADAPTER_INSTALL_SPEC` to that file and the CLI installs it instead of the registry copy. Pack from the package directory, then run the CLI from the app's root:

```bash
# in packages/daisyui-adapter, writing into the app's root
pnpm pack --pack-destination <app>

# in the app's root
DAISYUI_ADAPTER_INSTALL_SPEC=./kodaicoder-shadcn-svelte-daisyui-adapter-0.1.0.tgz \
  node <repo>/packages/daisyui-adapter/cli/init.mjs
```

The CLI prints `installed ./kodaicoder-shadcn-svelte-daisyui-adapter-0.1.0.tgz`. Without the variable it installs `@kodaicoder/shadcn-svelte-daisyui-adapter@0.1.0` from the registry.
