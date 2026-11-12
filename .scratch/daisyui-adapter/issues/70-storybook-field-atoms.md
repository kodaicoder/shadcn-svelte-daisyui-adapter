# 70: Storybook documents the field atoms

Session IDs: ses_e3124f1b1ffenHWalUU6efubte

**What to build:** a story per field atom, rendering the shipped copy with autodocs and a Playground,
and showing the size scale, the seven tones and the four states a form actually hits.

**Status:** ready-for-agent
**Labels:** docs, storybook, atoms
**Blocked by:** 67

Covers `input`, `textarea`, `native-select` and `label`. The field size scale is `sm`, `default` and
`lg` driven by the type token, the tones are the seven the fields share, and the states are idle,
focused, invalid, disabled and readonly. `textarea` carries a minimum height instead of a fixed one.
`label` is the association story: `for`, wrapping, the peer cases and disabled.

## Corrections made while implementing

- Only `input`, `textarea` and `native-select` carry the seven tones. `label` has no tone and no size
  axis, so the tone axis is three components, not four.
- `native-select` has no readonly state, because a native select has no readonly attribute. Readonly
  is shown on `input` and `textarea` only, where the shipped copy paints `bg-muted/50` and keeps the
  field focusable.
- `input` carries a `type="file"` presentation with its own file-button sizing, so it gets a `File`
  story. Measured: the three heights, and the button text at 10, 12 and 14 px.
- The label's peer cases are `data-slot` = `checkbox`, `radio-group-item` and `switch`. The disabled
  cases are `peer-disabled` for the `input` and `textarea` siblings, `peer-has-[:disabled]` for the
  `native-select` wrapper, `group-data-[disabled=true]` for a group wrapper, and `has-[:disabled]`
  for the wrapping case. The shipped label sets `not-allowed` for the wrapping case but no opacity
  rule, so the wrapped label stays at full opacity.
- The size scale is token driven, not fixed. Measured: `input` and `native-select` height 24, 28 and
  32 px; `textarea` minimum height 48, 56 and 64 px, growing with content; text 12, 14 and 16 px.
- The focus ring is the 3 px tone ring at 30 percent alpha shared with ticket 69, proven from real
  Tab keypresses. For `success` and `info` the border uses the `-text` token while the ring uses the
  base tone, so the proof matches the ring against the tone token, not the border.

## Acceptance

- [x] one story file per component, each declaring autodocs and a `Playground` driven by Controls
- [x] every story imports the shipped copy
- [x] all three sizes and all seven tones are rendered
- [x] idle, focused, invalid, disabled and readonly each appear where the component supports them
- [x] `textarea` shows its minimum height rather than a fixed one
- [x] `label` shows the `for` association, the wrapping case, the three peer cases and the disabled
      cases
- [x] no story hardcodes a scheme, and each renders in both from the toolbar
- [x] the Storybook build reports no console error and no a11y violation for these stories
