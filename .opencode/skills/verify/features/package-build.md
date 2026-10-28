# Packaged library

The repo is a Svelte library (`svelte`, `types`, `exports` in `package.json`). Its users are other
projects, not visitors to a page, so this feature is proven by building and inspecting the package,
not by driving a browser.

## Sub-features

- `pnpm build` runs `vite build` then `prepack`
- `prepack` runs `svelte-kit sync`, `svelte-package`, then `publint`
- output lands in `dist/`, with `dist/index.js` and `dist/index.d.ts` as the declared entry points
- `publint` is the gate: a non-zero exit means the package would break for consumers

## How to get to it (user POV)

A consumer runs `pnpm add new-project` and imports from the package root. What they receive is
whatever `dist/` plus `package.json#exports` say. `src/lib/index.ts` currently only holds the
placeholder comment, so the published surface today is effectively empty.

## Driving it with Playwright

Not applicable. Drive it with the build:

```sh
pnpm build
```

Then assert, in order: exit code 0, `dist/index.js` exists, `dist/index.d.ts` exists, and
`package.json#exports['.']` still names both. Capture the combined stdout of `prepack` as evidence;
`publint` prints its own verdict.

## Gotchas

- `pnpm build` is slow and writes to `dist/`, which is gitignored. Never treat a stale `dist/` as
  proof; rebuild.
- `publint` failing is a real consumer-facing break, not a lint nit. Do not waive it.
- `src/lib/index.ts` exports nothing yet, so a green build proves the packaging pipeline works, not
  that any component is reachable by consumers. Say that plainly when reporting.
- `svelte-package` reads `package.json#exports`. Editing exports without rebuilding leaves the two
  out of step.
