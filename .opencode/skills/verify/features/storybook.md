# Storybook stories

Component-level browsing for the library. Nine story files ship: `Components/Button` and the six
display atoms that have a fixed copy, each beside that copy, plus `Components/AspectRatio` and
`Components/Avatar`, which render `ui` because the fixer writes no copy for them.

## Sub-features

- `Components/Button` from `src/lib/components/button-fixed/button.stories.svelte`, with the stories
  `Playground`, `Tones`, `Appearances`, `Sizes`, `Disabled` and `AsLink`, plus its autodocs page
- the display atoms, each with autodocs and a Controls-driven `Playground`:
  - `Components/AspectRatio` from `src/stories/components/aspect-ratio.stories.svelte`: `Playground`, `Ratios`
  - `Components/Avatar` from `src/stories/components/avatar.stories.svelte`: `Playground`, `Sizes`, `Fallback`, `WithBadge`, `Group`
  - `Components/Badge` from `src/lib/components/badge-fixed/badge.stories.svelte`: `Playground`, `Tones` (7), `Appearances` (18), `AsLink`
  - `Components/Kbd` from `src/lib/components/kbd-fixed/kbd.stories.svelte`: `Playground`, `Tones` (7), `Chord`
  - `Components/Marker` from `src/lib/components/marker-fixed/marker.stories.svelte`: `Playground`, `Variants` (3), `WithIcon`
  - `Components/Separator` from `src/lib/components/separator-fixed/separator.stories.svelte`: `Playground`, `Variants` (8, `neutral` first), `Vertical`
  - `Components/Skeleton` from `src/lib/components/skeleton-fixed/skeleton.stories.svelte`: `Playground`, `Variants` (8, `neutral` first), `Shapes`
  - `Components/Spinner` from `src/lib/components/spinner-fixed/spinner.stories.svelte`: `Playground`, `Tones` (7), `Sizes` (12, 16, 24 and 32 px, every one labeled `Loading`)
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
derives from the CSF `title` and story name (`Components/Badge` plus `Tones` becomes
`components-badge--tones`).

## Driving it with Playwright

No journey yet. When one is added, it belongs in `scripts/drive.mjs` as `storybook`, with its own
server lifecycle, and it should:

1. fetch `/index.json` and assert the nine `Components/*` titles still exist
2. open one story iframe and assert the story root renders with no console error
3. screenshot the iframe, not the manager chrome

The ad hoc proof for ticket 68 is `.verify/prove-68.mjs`. It walks every story in both schemes,
records each check in `.verify/evidence/<stamp>-storybook-display-atoms/`, and measures the spinner
box with `getComputedStyle`, because `getBoundingClientRect` on an animated element returns the
rotated bounding box.

Storybook runs on port 6007 so it never collides with the app's 5199 or your own 5173.

## Gotchas

- Storybook is a second server. `scripts/session.mjs stop` does not own it; stop it yourself.
- Story ids change when a `title` changes. Assert against `/index.json`, not a hardcoded id.
- Stories render `src/lib/components/*-fixed`, except `aspect-ratio` and `avatar`, which render `ui`
  because they have no fixed copy. Do not put a story under `ui`: the drift test walks every
  `.svelte` file there for text rungs, so `pnpm test:adapter` would fail. Those two live in
  `src/stories/components/`.
- The toolbar sets the `dark` class, not `data-theme`, because the adapter binds the dark tokens to
  `.dark` in `src/routes/layout.css`.
- `pnpm vitest --run --project storybook` is the cheap a11y gate: it runs every story through
  `@storybook/addon-vitest`, so story-level regressions and structural a11y failures surface without
  a browser drive. Use this skill's driver only for what that project cannot see (manager chrome,
  iframe rendering, real navigation).
