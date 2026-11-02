# Changelog

## 0.1.0

First release. The CLI writes the header comment, the `@plugin "@kodaicoder/shadcn-svelte-daisyui-adapter";` line, the `daisyui-adapter.overrides.css` file and its import, and the 32 bindings per block; the plugin emits `--daisy-color-*` and `--daisy-radius` from `src/daisyui-theme.css` at build time.

The first install is the only required run. A later `shadcn-svelte init` keeps the header comment and the override import, wipes the bindings, and the next `init` restores them.

A change to the mapping table or to the shape the plugin emits is a minor bump, and it requires a re-run. The header comment names the version that wrote the stylesheet, so a project can tell which one it holds.
