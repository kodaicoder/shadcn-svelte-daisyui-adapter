# 69: Storybook documents the interactive atoms

**What to build:** a story per interactive atom, rendering the shipped copy with autodocs and a
Playground, and showing the states a reader has to know: every tone, the checked or pressed state,
disabled, and the focus ring.

**Status:** ready-for-agent
**Labels:** docs, storybook, atoms
**Blocked by:** 67

Covers `checkbox`, `switch`, `radio-group`, `toggle`, `progress` and `slider`. All six carry the seven
tones in their shipped copy, and the focus ring is part of the contract: 3px, in the component's own
tone, at 30 percent alpha. `slider` also carries a single value and a two-thumb range, `progress` a
2px bar and a caller-set height, and `radio-group` a group-level tone with a per-item override.

- [ ] one story file per component, each declaring autodocs and a `Playground` driven by Controls
- [ ] every story imports the shipped copy, never `ui`
- [ ] all seven tones are rendered, and each is distinct from its neighbours in both schemes
- [ ] each component's own states are shown: unchecked, checked, pressed, disabled, invalid where it applies
- [ ] `slider` shows one thumb and two, and `progress` shows the default bar and a thicker one set by the caller
- [ ] the focus ring is visible in the stories that can take focus, and follows the tone
- [ ] no story hardcodes a scheme, and each renders in both from the toolbar
- [ ] the Storybook build reports no console error and no a11y violation for these stories
