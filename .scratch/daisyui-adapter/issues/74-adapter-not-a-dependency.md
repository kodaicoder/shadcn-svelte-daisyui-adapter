# 74: The demo app references the adapter plugin without depending on it

**What to build:** the demo app declares the adapter it already loads, so the `@plugin` line in
`src/routes/layout.css` resolves from a declared dependency instead of a pnpm hidden-store junction.

**Status:** ready-for-agent
**Labels:** bug, tooling
**Blocked by:** None

Found while implementing ticket 67. Observed on this checkout:

- `package.json` lists no `@kodaicoder/shadcn-svelte-daisyui-adapter` in any dependency block.
- `pnpm why "@kodaicoder/shadcn-svelte-daisyui-adapter"` reports nothing.
- `node_modules/@kodaicoder/` is empty, and `require.resolve` from `src/routes` fails.
- The only link is `node_modules/.pnpm/node_modules/@kodaicoder/shadcn-svelte-daisyui-adapter`, a
  junction to `packages/daisyui-adapter`.
- Tailwind resolves the `@plugin` through that junction and emits the theme bindings, so the app and
  Storybook paint the daisy tokens today.
- `prettier-plugin-tailwindcss` resolves the same stylesheet from `src/routes` and fails with
  `Can't resolve '@kodaicoder/shadcn-svelte-daisyui-adapter'`, so Tailwind class sorting silently
  never runs. Prettier still exits 0.

Inference, not measured: a clean `pnpm install` on another machine may prune the orphan junction, at
which point the `@plugin` line has no package to load. Whether Tailwind fails the build or silently
falls back to the CLI fallbacks has not been tested, because testing it means removing a junction
from the shared pnpm store.

- [ ] the demo app declares the adapter as a `workspace:*` devDependency
- [ ] `pnpm why` names the dependency and the root `node_modules/@kodaicoder/` holds the link
- [ ] `@plugin` still emits the same bindings, with `--daisy-color-primary` at `oklch(42% 0.199 265.638)`
      for the light theme
- [ ] `prettier-plugin-tailwindcss` resolves the stylesheet, and `pnpm lint` sorts classes or fails
      loudly instead of printing a swallowed error
- [ ] a clean install from `pnpm-lock.yaml` keeps both behaviours
