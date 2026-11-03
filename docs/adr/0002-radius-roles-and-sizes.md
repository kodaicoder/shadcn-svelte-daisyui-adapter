---
status: accepted
date: 2026-11-03
---

# Apply the daisyUI radius roles and the shadcn size scale

The `mira` style is square: 90 `rounded-none` occurrences across 82 component files, and the `--radius-sm` to `--radius-4xl` scale is dead except four calendar and chart sites. The operator wants the daisyUI radius applied, so 0.3.0 maps the role to a scale step (selector to `--radius-sm`, field to `--radius-md`, box to `--radius-lg`) and lets the component size shift the step (xs/sm to sm, default/md to md, lg to lg, icon sizes by their size). The fixer replaces `rounded-none` per component group and leaves `rounded-full` circles and edge joining alone. Keeping the square look is the rejected alternative; binding the raw `--radius-field`/`--radius-selector` values is also rejected because the scale derives from `--radius` (box) and the theme's three role values are equal today. The `--size-field`/`--size-selector` mapping is out of scope.
