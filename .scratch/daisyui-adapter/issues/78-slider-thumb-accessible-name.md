# 78: The slider thumb has no accessible name
Session IDs: ses_e13063380ffeUAisnOYAryNfdG
Lesson: An axe gate stays green on a story that patches the DOM after render, so a component defect needs the story workaround deleted before the gate says anything about the component.
Check: code - `pnpm vitest --run --project storybook` reports no `aria-input-field-name` for `Components/Slider`, and 5 of 5 of its stories fail it before the fix; `packages/daisyui-adapter/test/drift.mjs` keeps `every fixed copy is what the manifest produces from the pin` at 318 fixed.
Closeout: c1f27a9 (tag daisyui-adapter-78)

**What to build:** the shipped slider names each thumb it renders. Today a consumer cannot label a
slider at all, so every `role="slider"` in an install fails `aria-input-field-name`.

**Status:** resolved
**Labels:** adapter, review, atoms
**Blocked by:** None

Found while closing ticket 69. The shipped copies render `SliderPrimitive.Thumb` with no accessible
name, and `slider.svelte` forwards `...restProps` to the root only, so a caller has no prop to name a
thumb with. Under axe's default ruleset, with `color-contrast` off (the only rule this repo disables),
one unnamed `role="slider"` reports `aria-input-field-name (serious)` once per thumb:

```text
aria-input-field-name (serious)
```

Both the `ui` copy and `slider-fixed/slider.svelte` do this, so it is upstream of the fixer, not a
fixer regression. Ticket 69's slider stories work around it by setting `aria-label` on each thumb
from the story wrapper. That keeps the a11y gate green and the docs honest, but it documents a name a
consumer cannot set. Delete the workaround when this lands.

- [x] each rendered thumb carries an accessible name a caller sets, with distinct names for a
      two-thumb range
- [x] the fixer writes the name, so one `fix` on the pin leaves `slider-fixed/slider.svelte`
      byte-identical to the manifest output; `ui` stays the unfixed stock pin
- [x] the `labelThumbs` attachment and its ticket 78 comment are deleted from
      `src/lib/components/slider-fixed/slider.stories.svelte`
- [x] axe reports no `aria-input-field-name` for `Components/Slider` in `pnpm vitest --run --project storybook`
- [x] `pnpm test:adapter` stays green

The fix adds `thumbLabels: string[]`, one entry per `thumb.index`, required so `svelte-check` rejects a
Slider that names no thumb. Every story and the review route pass it, and the fixer writes the prop, the
type, and the `aria-label` from `targets/atom-tones.mjs`.
