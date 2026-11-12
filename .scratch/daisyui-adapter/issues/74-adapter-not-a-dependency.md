# 74: The demo app references the adapter plugin without depending on it
Session IDs: ses_e327321b6ffeOE797kkxW963CD
Lesson: A package the build loads has to be declared; a hidden-store link can make an undeclared import work on one machine and fail on a clean install.
Check: code - `packages/daisyui-adapter/test/drift.mjs` asserts every `@plugin` in `layout.css` is declared in `package.json` and resolves from the app, and `pnpm test:adapter` passes both.
Closeout: b02b171 (tag daisyui-adapter-74)

**What to build:** the demo app declares the adapter it already loads, so the `@plugin` line in
`src/routes/layout.css` resolves from a declared dependency instead of a pnpm hidden-store junction.

**Status:** resolved
**Labels:** bug, tooling
**Blocked by:** None

Found while implementing ticket 67. Observed on this checkout:

- `package.json` listed no `@kodaicoder/shadcn-svelte-daisyui-adapter` in any dependency block.
- `pnpm why "@kodaicoder/shadcn-svelte-daisyui-adapter"` reports nothing.
- `node_modules/@kodaicoder/` was empty, and `require.resolve` from `src/routes` failed.
- The only link was `node_modules/.pnpm/node_modules/@kodaicoder/shadcn-svelte-daisyui-adapter`, a
  junction to `packages/daisyui-adapter`.
- Tailwind resolved the `@plugin` through that junction and emitted the theme bindings, so the app and
  Storybook painted the daisy tokens.
- `prettier-plugin-tailwindcss` resolves the same stylesheet from `src/routes` and failed with
  `Can't resolve '@kodaicoder/shadcn-svelte-daisyui-adapter'`, so Tailwind class sorting silently
  never ran. Prettier still exited 0.

- [x] the demo app declares the adapter as a `workspace:*` devDependency
- [x] `pnpm list --depth 0` names the link and the root `node_modules/@kodaicoder/` holds it
- [x] `@plugin` still emits the same bindings, with `--daisy-color-primary` at `oklch(42% 0.199 265.638)`
      for the light theme and `oklch(50% 0.11 240.79)` for dark
- [x] `prettier-plugin-tailwindcss` resolves the stylesheet and sorts classes; the remaining `pnpm lint`
      failures are pre-existing and unrelated
- [x] a clean install from `pnpm-lock.yaml` keeps both behaviours

Correction 2026-11-12: `pnpm why` prints `[]` for a `link:` dependency on pnpm 12.9.1, so the item uses
`pnpm list --depth 0`. `pnpm lint` was already red at base `71dd967`, with about 1000 formatting
warnings and two unparsable `.scratch` registry `.d.ts` files, so this ticket claims the plugin
resolution and class sorting, not a green repo-wide lint.
