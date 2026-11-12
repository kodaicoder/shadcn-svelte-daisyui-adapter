# Storybook stories

Component-level browsing for the library, driven by the shipped components under
`src/lib/components/*-fixed`. One story file ships today, `Components/Button`.

## Sub-features

- `Components/Button` from `src/lib/components/button-fixed/button.stories.svelte`, with the stories
  `Playground`, `Tones`, `Appearances`, `Sizes`, `Disabled` and `AsLink`, plus its autodocs page
- the theme toolbar, which switches `light` and `dark` and does it by setting or clearing the `dark`
  class on `<html>`
- the a11y panel from `@storybook/addon-a11y`, in error mode with the `color-contrast` rule off, so a
  structural violation fails the run and a colour pair does not
- `Configure.mdx` as the docs intro

## How to get to it (user POV)

```sh
pnpm storybook --port 6007 --ci
```

Then open `http://127.0.0.1:6007/`. Stories are reachable at `?path=/story/<story-id>`. Do not guess
the id: fetch `http://127.0.0.1:6007/index.json` and read the real `id` values, which Storybook
derives from the CSF `title` and story name (`Components/Button` plus `Playground` becomes
`components-button--playground`).

## Driving it with Playwright

No journey yet. When one is added, it belongs in `scripts/drive.mjs` as `storybook`, with its own
server lifecycle, and it should:

1. fetch `/index.json` and assert the `Components/Button` entries still exist
2. open one story iframe and assert the story root renders with no console error
3. screenshot the iframe, not the manager chrome

Storybook runs on port 6007 so it never collides with the app's 5199 or your own 5173.

## Gotchas

- Storybook is a second server. `scripts/session.mjs stop` does not own it; stop it yourself.
- Story ids change when a `title` changes. Assert against `/index.json`, not a hardcoded id.
- Stories render `src/lib/components/*-fixed`, never `ui`, so a broken story says nothing about the
  shadcn-svelte components under `src/lib/components/ui`.
- The toolbar sets the `dark` class, not `data-theme`, because the adapter binds the dark tokens to
  `.dark` in `src/routes/layout.css`.
- `pnpm vitest --run --project storybook` is the cheap a11y gate: it runs every story through
  `@storybook/addon-vitest`, so story-level regressions and structural a11y failures surface without
  a browser drive. Use this skill's driver only for what that project cannot see (manager chrome,
  iframe rendering, real navigation).
