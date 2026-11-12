# 69: Storybook documents the interactive atoms

Session IDs: ses_e31a6f71fffewuA5Tw42WyJ3au
Lesson: A docs story can only document what the shipped copy exposes; when the copy renders a child the caller cannot reach, the story's workaround documents the gap, not the API, so the gap needs its own ticket.
Check: code - every tone table is a `Record` keyed on the component's own variant type, and `.verify/prove-69.mjs` fails on a non-distinct tone fill, a ring that is not 3px at 30 percent alpha, or a state count that drifts.
Closeout: b7c3e57 (tag daisyui-adapter-69)

**What to build:** a story per interactive atom, rendering the shipped copy with autodocs and a
Playground, and showing the states a reader has to know: every tone, the checked or pressed state,
disabled, and the focus ring.

**Status:** resolved
**Labels:** docs, storybook, atoms
**Blocked by:** 67

Covers `checkbox`, `switch`, `radio-group`, `toggle`, `progress` and `slider`. All six carry the seven
tones in their shipped copy. `slider` also carries a single value and a two-thumb range, `progress` a
2px bar and a caller-set height, and `radio-group` a group-level tone with a per-item override.

## Corrections made while implementing

- The focus ring is the contract on five of the six: `checkbox`, `switch`, `radio-group`, `toggle` and
  `slider`, each at 3px in the component's tone at 30 percent alpha. `progress` is a display element
  and has no focus ring, so it has no focus story.
- The six do not share one state set. The states are `checkbox`: unchecked, checked, indeterminate,
  disabled (twice) and invalid; `switch`: unchecked, checked, disabled (twice) and invalid, plus two
  sizes; `radio-group`: unchecked, checked, a disabled item and an invalid item, plus the group tone
  and per-item override; `toggle`: unpressed, pressed, disabled (twice) and invalid, plus seven
  outline variants and three sizes; `slider`: one thumb, two thumbs and disabled; `progress`: values,
  not interactive states.
- `toggle` carries more than a tone axis: seven outline variants and three sizes. The stories show
  them as `Outline` and `Sizes`. `switch` carries two sizes, shown as `Sizes`.
- `progress`'s default bar is `h-0.5`, measured at 2px. The caller-set thicker bar is `class="h-2"`,
  measured at 8px.
- A radio paints its tone only when it is checked, so a per-item override cannot be shown on an
  unselected item. `Override` uses three groups, each with the checked item that carries its tone.
- The shipped slider renders `role="slider"` thumbs with no accessible name and forwards no thumb
  props, so axe reports `aria-input-field-name` (serious) on every slider. The stories supply each
  thumb's name from the wrapper to keep the gate green. Ticket 78 tracks the fix in the copy and the
  removal of that workaround.

## Acceptance

- [x] one story file per component, each declaring autodocs and a `Playground` driven by Controls
- [x] every story imports the shipped copy, never `ui`
- [x] all seven tones are rendered, and each is distinct from its neighbours in both schemes
- [x] each component's own states are shown: unchecked, checked, pressed, disabled, invalid where it applies
- [x] `slider` shows one thumb and two, and `progress` shows the default bar and a thicker one set by the caller
- [x] the focus ring is visible in the stories that can take focus, and follows the tone
- [x] no story hardcodes a scheme, and each renders in both from the toolbar
- [x] the Storybook build reports no console error and no a11y violation for these stories
