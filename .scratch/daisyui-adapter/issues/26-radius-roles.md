# 26: Radius roles and sizes

**What to build:** The fixer applies the daisyUI radius roles and the shadcn size steps to the components, within the linear scale and the zero and large-radius edges.

**Blocked by:** 25

**Status:** ready-for-agent

- [ ] The role maps to the step: selector to sm, field to md, box to lg
- [ ] The size-bearing components use the size step; fixed-size components use the role default
- [ ] The four existing scale sites align; `rounded-full`, edge joining and `--cell-radius` are untouched
- [ ] The scale is linear; at `--radius: 0` every step is 0; for any positive radius sm < md < lg; no clamp
- [ ] `init` warns above 2rem after converting to px at 16px per rem and prints the raw and px values
- [ ] The tests cover zero, a large value, the order and the 2rem warning
