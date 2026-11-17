# Storybook stories

Component-level browsing for the library. Nineteen story files ship: `Components/Button`, the six
display atoms, the six interactive atoms, the four field atoms, each beside its fixed copy, plus
`Components/AspectRatio` and `Components/Avatar`, which render `ui` because the fixer writes no copy
for them. Four token docs pages ship beside them, under a `Tokens` group, and carry no stories.

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
- the interactive atoms, each with autodocs, a Controls-driven `Playground` and a `Focus` story
  except `Progress`, which is not focusable:
  - `Components/Checkbox` from `src/lib/components/checkbox-fixed/checkbox.stories.svelte`: `Playground`, `Tones` (7), `States` (6, including `indeterminate` and `aria-invalid`), `Focus` (7 rings)
  - `Components/Switch` from `src/lib/components/switch-fixed/switch.stories.svelte`: `Playground`, `Tones` (7), `States` (5), `Sizes` (24 and 28 px), `Focus` (7 rings)
  - `Components/RadioGroup` from `src/lib/components/radio-group-fixed/radio-group.stories.svelte`: `Playground`, `Tones` (7 groups), `States` (4 groups), `Override` (3 groups, because a radio paints its tone only when checked), `Focus` (7 rings)
  - `Components/Toggle` from `src/lib/components/toggle-fixed/toggle.stories.svelte`: `Playground`, `Tones` (7 pressed), `Outline` (7 resting, 7 pressed), `Sizes` (24, 28 and 32 px), `States` (5), `Focus` (7 rings)
  - `Components/Progress` from `src/lib/components/progress-fixed/progress.stories.svelte`: `Playground`, `Tones` (7), `Values` (0 to 100), `Thickness` (2px default against a caller `h-2` at 8px)
  - `Components/Slider` from `src/lib/components/slider-fixed/slider.stories.svelte`: `Playground`, `Tones` (7), `Thumbs` (one and two), `Disabled` (one and two), `Focus` (7 rings)
- the field atoms, each with autodocs, a Controls-driven `Playground` and a `Focus` story driven by
  real Tab keypresses:
  - `Components/Input` from `src/lib/components/input-fixed/input.stories.svelte`: `Playground`, `Tones` (7), `Sizes` (24, 28 and 32 px), `States` (idle, invalid, disabled, readonly), `File` (three heights, button text 10, 12 and 14 px), `Focus` (7 rings)
  - `Components/Textarea` from `src/lib/components/textarea-fixed/textarea.stories.svelte`: `Playground`, `Tones` (7), `Sizes` (minimum 48, 56 and 64 px), `MinHeight` (empty against content-grown), `States` (idle, invalid, disabled, readonly), `Focus` (7 rings)
  - `Components/NativeSelect` from `src/lib/components/native-select-fixed/native-select.stories.svelte`: `Playground`, `Tones` (7), `Sizes` (24, 28 and 32 px), `States` (idle, invalid, disabled), `Focus` (7 rings)
  - `Components/Label` from `src/lib/components/label-fixed/label.stories.svelte`: `Playground`, `Association` (`for` on input, textarea and select), `Wrapping`, `Peers` (checkbox, radio and switch), `Disabled` (peer, group and wrapping)
- the theme toolbar, which switches `light` and `dark` and does it by setting or clearing the `dark`
  class on `<html>`
- the token docs, four unattached MDX pages under `src/stories/tokens/`, each with a title, prose and
  specimens whose values come from the adapter tables rather than a hand copy:
  - `Tokens/ColourRoles` from `colour-roles.mdx`: `SINGLE`, `MIX_KEYS`/`mixSources`, `TEXT_TONE` and
    `STATIC_TOKENS` through `@kodaicoder/shadcn-svelte-daisyui-adapter/map`, grouped as page, brand,
    status, sidebar, derived, text-tone and static roles
  - `Tokens/Tones` from `tones.mdx`: the seven tone names, with fill, soft, border and foreground per
    tone. The soft and border class strings are parsed out of the `skeleton-atom-tones` and
    `input-field-tones` site rows through `.../tokens`, so a table edit moves the page
  - `Tokens/TypeScale` from `type-scale.mdx`: the six rungs with class, px and line height. This one
    table is imported by repo path because `targets.mjs` does not re-export it
  - `Tokens/Radius` from `radius.mdx`: `ROLE_STEPS`, `SIZE_STEPS` and the site count per step, plus
    the `--radius` multipliers read from `src/routes/layout.css`
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

1. fetch `/index.json` and assert the fifteen `Components/*` titles still exist
2. open one story iframe and assert the story root renders with no console error
3. screenshot the iframe, not the manager chrome

The ad hoc proof for ticket 68 is `.verify/prove-68.mjs`. It walks every story in both schemes,
records each check in `.verify/evidence/<stamp>-storybook-display-atoms/`, and measures the spinner
box with `getComputedStyle`, because `getBoundingClientRect` on an animated element returns the
rotated bounding box. `.verify/prove-69.mjs` and `.verify/prove-70.mjs` extend the same shape to the
interactive and field atoms; both press Tab for the focus rings rather than calling `.focus()`.

`.verify/prove-71.mjs` serves the static build from `.verify/build-71` on port 6007 with its own
`node:http` server, opens each `Tokens/*` page in `viewMode=docs` in both schemes, runs axe with
`color-contrast` and `region` off, and compares every printed value with the table read in Node.

Storybook runs on port 6007 so it never collides with the app's 5199 or your own 5173.

## Gotchas

- Storybook is a second server. `scripts/session.mjs stop` does not own it; stop it yourself.
- The dev server and the `storybook` vitest project share `node_modules/.cache/storybook`. Running
  both at once fails story imports with a dynamically imported module error, so stop the dev server
  before running `pnpm exec vitest --run --project storybook`.
- Story ids change when a `title` changes. Assert against `/index.json`, not a hardcoded id.
- Stories render `src/lib/components/*-fixed`, except `aspect-ratio` and `avatar`, which render `ui`
  because they have no fixed copy. Do not put a story under `ui`: the drift test walks every
  `.svelte` file there for text rungs, so `pnpm test:adapter` would fail. Those two live in
  `src/stories/components/`.
- The toolbar sets the `dark` class, not `data-theme`, because the adapter binds the dark tokens to
  `.dark` in `src/routes/layout.css`.
- A docs entry runs no story decorator, so `withThemeByClassName` never puts `dark` on a docs page
  and the toolbar changes nothing there. Each token page paints its own surface with
  `var(--background)` and `var(--foreground)` so it reads correctly when the class is present, and
  `.verify/prove-71.mjs` sets that class on `<html>` itself for the dark pass. Making the toolbar
  reach docs entries is a `.storybook` change and belongs to its own ticket.
- A docs page is reachable at `?path=/docs/<id>` and is not covered by the `storybook` vitest project,
  so the a11y gate that project provides does not see it. Open `iframe.html?id=<id>&viewMode=docs` for
  a docs-page proof.
- `pnpm vitest --run --project storybook` is the cheap a11y gate: it runs every story through
  `@storybook/addon-vitest`, so story-level regressions and structural a11y failures surface without
  a browser drive. Use this skill's driver only for what that project cannot see (manager chrome,
  iframe rendering, real navigation).
