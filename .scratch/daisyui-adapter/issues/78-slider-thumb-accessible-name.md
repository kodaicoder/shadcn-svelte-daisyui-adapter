# 78: The slider thumb has no accessible name

**What to build:** the shipped slider names each thumb it renders. Today a consumer cannot label a
slider at all, so every `role="slider"` in an install fails `aria-input-field-name`.

**Status:** ready-for-agent
**Labels:** adapter, review, atoms
**Blocked by:** None

Found while closing ticket 69. The shipped copies render `SliderPrimitive.Thumb` with no accessible
name, and `slider.svelte` forwards `...restProps` to the root only, so a caller has no prop to name a
thumb with. Under axe's default ruleset, with `color-contrast` and `region` off, a page holding one
unnamed `role="slider"` reports:

```
aria-input-field-name (serious) x1
```

Both the `ui` copy and `slider-fixed/slider.svelte` do this, so it is upstream of the fixer, not a
fixer regression. Ticket 69's slider stories work around it by setting `aria-label` on each thumb
from the story wrapper. That keeps the a11y gate green and the docs honest, but it documents a name a
consumer cannot set. Delete the workaround when this lands.

- [ ] each rendered thumb carries an accessible name a caller sets, with distinct names for a
      two-thumb range
- [ ] the name survives the fixer, so `ui` and `slider-fixed` do not disagree
- [ ] the `labelThumbs` attachment and its ticket 78 comment are deleted from
      `src/lib/components/slider-fixed/slider.stories.svelte`
- [ ] axe reports no `aria-input-field-name` for `Components/Slider` in `pnpm vitest --run --project storybook`
- [ ] `pnpm test:adapter` stays green
