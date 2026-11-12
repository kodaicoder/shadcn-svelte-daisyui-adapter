Phase: implementation

# Ticket 74: the demo app references the adapter plugin without depending on it

Ticket: `.scratch/daisyui-adapter/issues/74-adapter-not-a-dependency.md`
Session: ses_e327321b6ffeOE797kkxW963CD
Branch: fix/nutchapon/ai/contrast-warning
Commit: b02b171 (tag daisyui-adapter-74)

## Blast radius

state: unbuilt (no `graphify-out/graph.json`)
seeds: n/a, graph unavailable
anchors:
  `package.json` <- the declared workspace dependency and the lock specifier
  `pnpm-lock.yaml` <- the importer entry and the linked workspace package
  `packages/daisyui-adapter/test/drift.mjs` <- the declaration and resolution checks
unlisted:
  `src/routes/layout.css` <- the `@plugin` line that needs the dependency, generated and never edited
  `prettier.config.js` <- `tailwindStylesheet` points at layout.css, so the plugin resolution changes
  `.storybook/preview.ts` <- imports layout.css, so Tailwind must still resolve the plugin
  every fixed component <- class sorting became live, and Prettier reports a clean story file
fallback: rg `kodaicoder`, `node -e require.resolve`, `pnpm why`, `pnpm list`

## Playbook: Bug fix

1. Reproduce it yourself on the matching surface.
   `pnpm why` empty, `node_modules/@kodaicoder/` empty, `require.resolve` from `src/routes` failed,
   and Prettier printed `Can't resolve '@kodaicoder/shadcn-svelte-daisyui-adapter'`.
2. Binary-search the cause.
   The demo app loaded a package that was not in any dependency block. Tailwind resolved it through
   the orphan junction; Prettier resolved through Node and failed.
3. Plan the fix.
   Declare `workspace:*` in devDependencies and install. No application code change.
4. Verify on the same surface.
   See Verification.
5. Stage the commits so the failing repro lands before the fix in git history.
   skip: the failing repro is the missing manifest entry and the observed resolver failure. A test
   that asserts a package's own declaration is the new drift check, committed with the fix because the
   install and the check cannot be split without a red tree in between.
6. Run Opening a PR.
   skip: the ticket pipeline closes with a commit and a tag.

## Review

Both axes ran on `71dd967`.

- Standards accepted: resolve from the app root rather than the CSS path, assert the declaration, and
  carry the resolution error code. `devDependencies` is the right block because the only consumer is
  the CSS `@plugin`, and `drift.mjs` is the right home because `test:adapter` runs it.
- Spec accepted: a resolvable but undeclared package would have passed the first check, so the check
  now asserts `devDependencies` separately. The `pnpm why` and `pnpm lint` items are reworded with the
  evidence.
- Noted, not changed: the check resolves through CJS `require`, while Tailwind loads the plugin as
  ESM. The adapter's exports use a single `default` condition, so the path is the same today.

## Verification

- `package.json` declares `"@kodaicoder/shadcn-svelte-daisyui-adapter": "workspace:*"`; the lock holds
  `link:packages/daisyui-adapter`.
- `require.resolve` from `src/routes` returns `packages/daisyui-adapter/dist/index.mjs`.
- `pnpm list --depth 0` names `link:packages/daisyui-adapter`. `pnpm why` prints `[]` for a link
  dependency on pnpm 12.9.1.
- Served `layout.css` carries `--daisy-color-primary: oklch(42% 0.199 265.638)` and
  `oklch(50% 0.11 240.79)`, the light and dark theme values.
- Prettier sort probe: `text-sm p-2 flex z-10 absolute` and `absolute z-10 flex p-2 text-sm` both
  normalize to `absolute z-10 flex p-2 text-sm`. The `Can't resolve` line is gone.
- Storybook serves the 7 `Components/Button` entries after the change.
- `pnpm install --frozen-lockfile`: up to date, link kept, resolution still succeeds.
- `pnpm check` 0/0. `pnpm test:adapter` passes both new checks, 1 plugin named, none undeclared or
  unresolved.
- `pnpm lint` was already red at `71dd967` (about 1000 warnings and two unparsable `.scratch` registry
  `.d.ts` files), so the ticket does not claim it green.

## Todo

- [x] add the workspace dependency
- [x] `pnpm install` and `pnpm list` names it
- [x] `require.resolve` succeeds from `src/routes`
- [x] served CSS still carries both theme bindings
- [x] Prettier no longer prints the resolution error and sorts classes
- [x] `pnpm install --frozen-lockfile` keeps the link
- [x] `pnpm check` 0/0 and `pnpm test:adapter` green
