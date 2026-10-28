# Storybook stories

Component-level browsing for the library. Three story files ship today, all from the Svelte template
scaffold: `Example/Button`, `Header` and `Page`.

## Sub-features

- `Example/Button` from `src/stories/Button.stories.svelte`, stories `Primary`, `Secondary`,
  `Large`, `Small`
- `Header` from `src/stories/Header.stories.svelte`, with a logged-in and logged-out story
- `Page` from `src/stories/Page.stories.svelte`
- autodocs pages for each, and an a11y panel from `@storybook/addon-a11y`
- `Configure.mdx` as the docs intro

## How to get to it (user POV)

```sh
pnpm storybook --port 6007 --ci
```

Then open `http://127.0.0.1:6007/`. Stories are reachable at `?path=/story/<story-id>`. Do not guess
the id: fetch `http://127.0.0.1:6007/index.json` and read the real `id` values, which Storybook
derives from the CSF `title` and story name (`Example/Button` plus `Primary` becomes
`example-button--primary`).

## Driving it with Playwright

No journey yet. When one is added, it belongs in `scripts/drive.mjs` as `storybook`, with its own
server lifecycle, and it should:

1. fetch `/index.json` and assert the three story entries still exist
2. open one story iframe and assert the story root renders with no console error
3. screenshot the iframe, not the manager chrome

Storybook runs on port 6007 so it never collides with the app's 5199 or your own 5173.

## Gotchas

- Storybook is a second server. `scripts/session.mjs stop` does not own it; stop it yourself.
- Story ids change when a `title` changes. Assert against `/index.json`, not a hardcoded id.
- The story files are template leftovers and do not use `src/lib/components/ui`. A broken `Example/`
  story says nothing about the shadcn-svelte components.
- `@storybook/addon-vitest` already runs stories as tests through the `storybook` project in
  `vite.config.ts`. For story-level regressions, `pnpm vitest --project storybook` is cheaper than a
  browser drive. Use this skill's driver only for what that project cannot see (manager chrome,
  iframe rendering, real navigation).
