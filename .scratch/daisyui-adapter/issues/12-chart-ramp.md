# Chart ramp derivation

Type: grilling
Status: open
Blocked by: 03

## Question

shadcn charts use `--chart-1` to `--chart-5`. daisyUI supplies no chart palette, only `primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning`, `error`.

Decide:
1. Which five sources fill the ramp, in which order, and why that order reads as a series rather than five random colours.
2. Whether the ramp is five plain assignments or a generated spread (for example rotating hue from `primary` by fixed offsets).
3. How the dark theme differs. Same assignments, or lightness-adjusted.
4. Whether `info`/`success`/`warning`/`error` belong in the ramp, given they carry semantic meaning elsewhere.
5. Whether the ramp must stay distinguishable for colour-blind readers. If so, state the minimum separation rule we can actually implement in CSS.

Depends on ticket 03 for the key list. Cross-check ticket 09 so chart and core do not collide.

## Answer

<!-- fill on resolution -->
