# 71: Storybook explains the token layer

**What to build:** documentation pages for the things a consumer needs before they use any component:
the colour roles, the seven tones and how a tone is painted, the type scale, and the radius roles.
Prose plus live specimens, so a reader can copy a class name they have just seen render.

**Status:** ready-for-agent
**Labels:** docs, storybook, tokens
**Blocked by:** 67

The adapter's value is the token mapping, and today it is only in README prose. These pages are the
half of the docs a consumer reads first, and they should come from the same tables the fixer uses
rather than from a hand-written copy that drifts.

- [ ] a page for the colour roles, showing each role against the page in both schemes
- [ ] a page for the seven tones, showing fill, soft surface, border and foreground, plus the rule that a thin accent uses the raw tone
- [ ] a page for the type scale, with each rung, its line height and the px it renders
- [ ] a page for the radius roles, selector, field and box, with the step each one takes and the `--radius` they derive from
- [ ] each page renders a live specimen next to its explanation, in both schemes
- [ ] the values shown come from the adapter's own tables, so a table change moves the page
- [ ] the Storybook build reports no console error and no a11y violation for these pages
