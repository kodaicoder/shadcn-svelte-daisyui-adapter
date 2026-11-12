# 68: Storybook documents the display atoms
Session IDs: ses_e31fe7822ffeKZ7ogcqlFrzxLQ

**What to build:** a story per display atom, each rendering the shipped copy with autodocs and a
Playground, and showing every tone and size the component carries. A consumer reading the docs sees
exactly what an install paints.

**Status:** ready-for-agent
**Labels:** docs, storybook, atoms
**Blocked by:** 67

Covers `aspect-ratio`, `avatar`, `badge`, `kbd`, `marker`, `separator`, `skeleton` and `spinner`.
`aspect-ratio` and `avatar` have no fixed copy and render from `ui`. The rest import their shipped
copy: the one the fixer produces after `map` and `fix`.

The tones each one carries are settled and must all appear: `badge` seven, `kbd` seven, `separator`
eight with the neutral line, `skeleton` eight with the neutral surface, `spinner` seven with its four
sizes and the Loading label.

- [ ] one story file per component, each declaring autodocs and a `Playground` driven by Controls
- [ ] every story imports the shipped copy where one exists, and `ui` only where none does
- [ ] every tone and every size the component carries is rendered
- [ ] `separator` and `skeleton` show their neutral default as its own row
- [ ] `spinner` shows 12, 16, 24 and 32 and keeps the accessible Loading label in every size
- [ ] no story hardcodes a scheme, and each renders in both from the toolbar
- [ ] the Storybook build reports no console error and no a11y violation for these stories
