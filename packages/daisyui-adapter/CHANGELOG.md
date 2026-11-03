# Changelog

## 0.3.0

`--secondary` and `--secondary-foreground` now read daisyUI's `secondary` and `secondary-content`; `--accent` and `--accent-foreground` read `accent` and `accent-content`, and `accent` is no longer a mix of `base-200` and `base-300`. This is a mapping change: re-run the CLI, and the header updates to 0.3.0. The components that paint with these tokens as surfaces need a visual check; ticket 23 lists them and the measured contrast on the light-blue/dark-blue pair.

## 0.2.0

The CLI no longer creates `daisyui-adapter.overrides.css` or writes its `@import` line. Overrides are opt-in: the user adds the file and the import, and the README's Overrides section describes how. An existing file and import are left untouched, so a project that installed 0.1.0 keeps both.

A re-run applies the change to a 0.1.0 project, and the header comment updates to 0.2.0.

## 0.1.0

First release. The CLI writes the header comment, the `@plugin "@kodaicoder/shadcn-svelte-daisyui-adapter";` line, the `daisyui-adapter.overrides.css` file and its import, and the 32 bindings per block; the plugin emits `--daisy-color-*` and `--daisy-radius` from `src/daisyui-theme.css` at build time.

The first install is the only required run. A later `shadcn-svelte init` keeps the header comment and the override import, wipes the bindings, and the next `init` restores them.

A change to the mapping table or to the shape the plugin emits is a minor bump, and it requires a re-run. The header comment names the version that wrote the stylesheet, so a project can tell which one it holds.
