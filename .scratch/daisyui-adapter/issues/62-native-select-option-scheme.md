# 62: The native select option list ignores the dark scheme
Session IDs: ses_e373b3507ffeTuC0vzOAEVfeiy
Lesson: A themed subtree that paints platform system colours must declare its color-scheme; the adapter wrote only custom properties, so Canvas stayed light.
Check: code - the three native-select assertions in .opencode/skills/verify/scripts/drive.mjs prove the dark scope scheme, the option luminance and the AA contrast, and the popup capture covers the rendered list.

**What to build:** make the open option list follow the scheme. The `<select>` is themed, but its
`<option>` carries `bg-[Canvas] text-[CanvasText]`, and neither `.dark` nor the daisy theme sets
`color-scheme`, so the list opens with the platform canvas colours.

**Status:** resolved
**Labels:** review, atoms, finding
**Blocked by:** None

Found in ticket 51. Measured on `/review/native-select`: the `[data-slot="native-select-option"]`
background is `rgb(255, 255, 255)` in both schemes, and the enclosing `[data-scheme="dark"]` computes
`color-scheme: normal`. The closed select paints `oklch(0.291 …)` with a 30 percent input wash in dark,
so the popup flips from a dark field to a white list.

- [x] Set `color-scheme: dark` on the dark scope, or theme the option list another way
- [x] Prove it on the rendered popup, not only on the option's computed class
- [x] Keep the light scheme unchanged
- [x] `docs/component-color-usage.md` records the choice

Closeout: 80d0e6c, 11130b6 (tag `t62-native-select-option-scheme`)
Merged: e95f47c
