# 28: Radius: form controls
Session IDs: ses_e5d979074ffeWhtLLDlEFHaqwq, ses_e5d929d6affeNeSTglM06yO6N8
Lesson: A per-size radius belongs in the size variant, because the class merge keeps the later one, and a second target table must report a missing file only for a component the project installed or named, or every pinned report count grows by rows the project never had.
Check: code - `.scratch/daisyui-adapter/registry-28/radius.mjs`: 71 checks over the real CLI and temp copies of the pinned form components: the 25-site table with its role and size steps and the class each fixed string writes, the applied button and toggle sizes and the `data-[size=sm]` overrides, the two `input` insertions, `rounded-full` untouched, the calendar `--cell-radius` and edge utilities intact, the range-middle contrast sites still fixed, a byte-identical second run, the four states with per-site application, the header at 13 and 15 after a deletion, `--check` and `--strict` with no writes, the zero, 2rem and 10rem scale, no clamp, and the 2rem warning at 2.5rem, 33px and a 3rem fallback while `0`, `0.5rem`, `2rem`, `calc()` and `2.5em` stay silent; `registry-26` stays at 100 checks, `registry-27` at 64, `registry-16` at 139 and the drift test at 8.
Closeout: 293d69f (tag t28-radius-form)

**What to build:** The fixer applies the field and selector radius roles and the size steps to the form controls, respecting the linear scale and the zero and large-radius edges.

**Blocked by:** 26

**Status:** resolved

- [x] The role maps to the step: selector to sm, field to md; the size-bearing components use the size step (xs/sm/icon-xs/icon-sm to sm, default/md/icon to md, lg/icon-lg to lg)
- [x] The components are button, toggle, input, textarea, native-select, select, input-group, input-group-button, checkbox, radio-group and switch
- [x] `rounded-full` circles, edge joining and the calendar custom property are untouched
- [x] The scale is linear; at `--radius: 0` every step is 0; for any positive radius sm < md < lg; no clamp
- [x] `init` warns above 2rem after converting to px at 16px per rem and prints the raw and px values
- [x] Tests cover zero, a large value, the order and the 2rem warning
