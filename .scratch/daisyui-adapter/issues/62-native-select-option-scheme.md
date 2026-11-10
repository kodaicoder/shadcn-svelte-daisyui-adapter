# 62: The native select option list ignores the dark scheme

**What to build:** make the open option list follow the scheme. The `<select>` is themed, but its
`<option>` carries `bg-[Canvas] text-[CanvasText]`, and neither `.dark` nor the daisy theme sets
`color-scheme`, so the list opens with the platform canvas colours.

**Status:** ready-for-agent
**Labels:** review, atoms, finding
**Blocked by:** None

Found in ticket 51. Measured on `/review/native-select`: the `[data-slot="native-select-option"]`
background is `rgb(255, 255, 255)` in both schemes, and the enclosing `[data-scheme="dark"]` computes
`color-scheme: normal`. The closed select paints `oklch(0.291 …)` with a 30 percent input wash in dark,
so the popup flips from a dark field to a white list.

- [ ] Set `color-scheme: dark` on the dark scope, or theme the option list another way
- [ ] Prove it on the rendered popup, not only on the option's computed class
- [ ] Keep the light scheme unchanged
- [ ] `docs/component-color-usage.md` records the choice
