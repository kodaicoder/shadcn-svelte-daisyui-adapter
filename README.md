# shadcn-svelte daisyUI adapter

A shadcn-svelte token set generated from a daisyUI v5 theme at build time, with no daisyUI runtime dependency.

The package lives in [`packages/daisyui-adapter`](packages/daisyui-adapter/README.md) and ships as [`@kodaicoder/shadcn-svelte-daisyui-adapter`](https://www.npmjs.com/package/@kodaicoder/shadcn-svelte-daisyui-adapter).

```bash
pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 init
```

## What is in this repo

- `packages/daisyui-adapter/` is the published package: the CLI, the target manifest and the component fixer.
- `src/stories/` is the Storybook that documents the tokens and the painted components.
- `src/routes/review/` holds the reviewer pages, one per component, used to check the painted result by hand.
- `scripts/` holds the gates: story conventions, the docs build digest and the static preview server.
- `.scratch/daisyui-adapter/` holds the tickets, the harness and the release evidence.

## Commands

```bash
pnpm install
pnpm dev                 # the app and the reviewer pages
pnpm storybook           # the docs at http://localhost:6006
pnpm check:stories       # story conventions and fixtures
pnpm check:docs-build    # two Storybook builds, one digest, refuses to differ
pnpm test:adapter        # the fixer's drift checks
pnpm test                # unit and end-to-end
```

## Status

0.3.0 completes the token layer and the atom layer. Molecules come next, then organisms, templates and pages, with 1.0.0 as the full review. The release notes are in [`packages/daisyui-adapter/CHANGELOG.md`](packages/daisyui-adapter/CHANGELOG.md).
