---
status: accepted
date: 2026-11-03
---

# Apply the daisyUI radius roles and the shadcn size scale

The `mira` style is square: 90 `rounded-none` occurrences across 82 component files, and the `--radius-sm` to `--radius-4xl` scale is dead except four calendar and chart sites. The operator wants the daisyUI radius applied, so 0.3.0 maps the role to a scale step (selector to `--radius-sm`, field to `--radius-md`, box to `--radius-lg`) and lets the component size shift the step (xs/sm to sm, default/md to md, lg to lg, icon sizes by their size). The fixer replaces `rounded-none` per component group and leaves `rounded-full` circles and edge joining alone. Keeping the square look is the rejected alternative; binding the raw `--radius-field`/`--radius-selector` values is also rejected because the scale derives from `--radius` (box) and the theme's three role values are equal today.

The three daisyUI role values collapse into the single shadcn scale. A theme whose field or selector rung differs from its box rung is approximated, and this is a deliberate loss, not an oversight. The scale is linear in `--radius`: sm 0.6, md 0.8, lg 1.0, xl 1.4, 2xl 1.8, 3xl 2.2, 4xl 2.6. At `--radius: 0` every step is zero; for any positive radius sm < md < lg. There is no clamp; the adapter passes the theme's length unchanged. `--radius` is a CSS length; `init` warns when it exceeds 2rem after converting to px at 16px per rem (32px), and prints the raw length and the px value, because the components become pill-like and the theme is likely wrong. The tests assert the order except at zero and the warning at the 2rem edge. The `--size-field`/`--size-selector` mapping is out of scope.
