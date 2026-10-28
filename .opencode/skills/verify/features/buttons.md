# Button showcase

The one route in the showcase app. It exists to eyeball the Button component's sizes and variants
together, and it is the fastest proof that the component library still renders.

## Sub-features

- Five labelled buttons: `Extra Small` (size `xs`), `Small` (`sm`), `Default` (`default`),
  `Large` (`lg`), `Destructive` (variant `destructive`)
- Four icon-only buttons, each `aria-label="Submit"`, at sizes `icon-xs`, `icon-sm`, `icon`,
  `icon-lg`
- Every button carries `data-slot="button"`; that attribute is the stable handle

## How to get to it (user POV)

Open `http://127.0.0.1:5199/`. There is no navigation and no login. The buttons are the page.

## Driving it with Playwright

```sh
node .opencode/skills/verify/scripts/session.mjs start
node .opencode/skills/verify/scripts/drive.mjs buttons
node .opencode/skills/verify/scripts/session.mjs stop
```

The journey counts `[data-slot="button"]` and requires exactly 9, checks each label by accessible
name, checks the 4 icon buttons by `aria-label`, clicks `Destructive`, and fails on any console
error. Evidence lands in `.verify/evidence/<timestamp>-buttons/`.

## Gotchas

- There is no `h1` on the page, so the inherited `src/routes/page.svelte.e2e.ts` assertion cannot be
  reused. Anchor on `data-slot="button"` or on accessible names.
- The icon buttons share the accessible name `Submit`, so `getByRole('button', { name: 'Submit' })`
  matches 4 elements. Ask for the count, not a single element.
- Sizes come from Tailwind classes, not from markup. Asserting a computed height is brittle across
  the theme; asserting that each size renders at all is not.
