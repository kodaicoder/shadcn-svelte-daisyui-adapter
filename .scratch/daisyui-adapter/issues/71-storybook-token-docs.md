# 71: Storybook explains the token layer

Session IDs: ses_e18bb5a7bffeKzAnGdTEl5lwlM

**What to build:** documentation pages for the things a consumer needs before they use any component:
the colour roles, the seven tones and how a tone is painted, the type scale, and the radius roles.
Prose plus live specimens, so a reader can copy a class name they have just seen render.

**Status:** ready-for-agent
**Labels:** docs, storybook, tokens
**Blocked by:** 67

The adapter's value is the token mapping, and today it is only in README prose. These pages are the
half of the docs a consumer reads first, and they should come from the same tables the fixer uses
rather than from a hand-written copy that drifts.

## Corrections made while implementing

- Page format is MDX under `src/stories/tokens/`, because MDX is the only prose format in this
  Storybook. A docs page is not a story, so the a11y proof opens `viewMode=docs` with axe; the
  `storybook` vitest project does not see a docs entry.
- The seven tones are the field and atom prop names, and `default` paints the `primary` token. One
  specimen row per tone. The `targets/variants.mjs` presentations over button, badge, alert and bubble
  are named in prose, not duplicated as rows.
- Reachability: one `"./tokens": "./targets.mjs"` entry in the adapter `exports`. `targets.mjs` does
  not re-export `TYPE_SCALE`, so the type-scale page imports that table by repo path with a one-line
  reason; a second exports entry was outside the file scope. Consequence: `./tokens` publishes the
  whole target manifest, stock strings included.
- Radius: the `--radius-sm|md|lg` multipliers are declarations in `src/routes/layout.css`, not adapter
  rows, so the page reads that file with `?raw` and parses `--radius` and the three steps. A stylesheet
  edit moves the page.
- The type scale is six rungs, not three. The page prints all six with their px and line height.
- A docs entry runs no story decorator, so the theme toolbar never puts `dark` on these pages. Each
  page paints its own surface from `var(--background)` and `var(--foreground)` so it is correct in
  either scheme, and the proof applies the class itself for the dark pass. Making the toolbar reach
  docs entries is a `.storybook/preview.ts` change, outside this ticket's file scope.
- "A thin accent uses the raw tone" is only mostly true: the field border rows for `success` and
  `info` carry `-text` so the edge clears 3:1. The page states the exception and derives which tones
  take it from the parsed rows.
- Prose overlap: these pages supersede README `### Tokens` and `### Radius`, and the tone paragraphs
  of `### Variants`. `docs/component-color-usage.md` stays, because it records measured resolved
  values per component part for one theme rather than the role map. The README pointer edit was
  outside the file scope and needs its own ticket.

## Acceptance

- [x] a page for the colour roles, showing each role against the page in both schemes
- [x] a page for the seven tones, showing fill, soft surface, border and foreground, plus the rule that a thin accent uses the raw tone
- [x] a page for the type scale, with each rung, its line height and the px it renders
- [x] a page for the radius roles, selector, field and box, with the step each one takes and the `--radius` they derive from
- [x] each page renders a live specimen next to its explanation, in both schemes
- [x] the values shown come from the adapter's own tables, so a table change moves the page
- [x] the Storybook build reports no console error and no a11y violation for these pages
