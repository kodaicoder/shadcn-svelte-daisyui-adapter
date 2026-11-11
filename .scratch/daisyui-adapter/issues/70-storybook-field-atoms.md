# 70: Storybook documents the field atoms

**What to build:** a story per field atom, rendering the shipped copy with autodocs and a Playground,
and showing the size scale, the seven tones and the four states a form actually hits.

**Status:** ready-for-agent
**Labels:** docs, storybook, atoms
**Blocked by:** 67

Covers `input`, `textarea`, `native-select` and `label`. The field size scale is `sm`, `default` and
`lg` driven by the type token, the tones are the seven the fields share, and the states are idle,
focused, invalid, disabled and readonly. `textarea` carries a minimum height instead of a fixed one.
`label` is the association story: `for`, wrapping, the peer cases and disabled.

- [ ] one story file per component, each declaring autodocs and a `Playground` driven by Controls
- [ ] every story imports the shipped copy
- [ ] all three sizes and all seven tones are rendered
- [ ] idle, focused, invalid, disabled and readonly each appear where the component supports them
- [ ] `textarea` shows its minimum height rather than a fixed one
- [ ] `label` shows the `for` association, the wrapping case, the three peer cases and the disabled cases
- [ ] no story hardcodes a scheme, and each renders in both from the toolbar
- [ ] the Storybook build reports no console error and no a11y violation for these stories
