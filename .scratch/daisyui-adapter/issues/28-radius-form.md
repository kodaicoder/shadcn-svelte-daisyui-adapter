# 28: Radius: form controls
Session IDs:
Lesson:
Check:

**What to build:** The fixer applies the field and selector radius roles and the size steps to the form controls, respecting the linear scale and the zero and large-radius edges.

**Blocked by:** 26

**Status:** ready-for-agent

- [ ] The role maps to the step: selector to sm, field to md; the size-bearing components use the size step (xs/sm/icon-xs/icon-sm to sm, default/md/icon to md, lg/icon-lg to lg)
- [ ] The components are button, toggle, input, textarea, native-select, select, input-group, input-group-button, checkbox, radio-group and switch
- [ ] `rounded-full` circles, edge joining and the calendar custom property are untouched
- [ ] The scale is linear; at `--radius: 0` every step is 0; for any positive radius sm < md < lg; no clamp
- [ ] `init` warns above 2rem after converting to px at 16px per rem and prints the raw and px values
- [ ] Tests cover zero, a large value, the order and the 2rem warning
