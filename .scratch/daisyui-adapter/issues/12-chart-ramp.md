# Chart ramp derivation

Type: grilling
Status: resolved
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

Resolved 2026-10-30 on the pure-CLI contract. The ramp is generated from `primary` by the adapter's
writer, not assigned key by key. Numbers that need a browser come from a real build with daisyUI's
built-in light and dark pair: harness run `2026-10-30T04-27-45-353Z`, `--layout routes`, ticket 10's
item plus `--daisy-color-*` and `--daisy-radius`, the stock `chart` component added from the registry,
then `registry-12/apply.mjs` writing the ramp. `registry-12/check.mjs` re-runs 16 assertions against
the committed render from the painted sRGB bytes and all pass (`check.txt`). Numbers that are
arithmetic on the rule come from `registry-12/sweep.mjs`, printed in `sweep.txt`: the CVD table, the
per-step versus single-cap comparison, the 10-hue by 6-surface sweep, the light band on the dark page,
and both five-assignment sets. `harness/runs/` is gitignored, so the cited artefacts are copied into
`evidence/12-chart-ramp/`.

The settled rule, in one line: **one hue from `primary`, five lightness steps at a fixed 0.09, chroma
capped at 0.08 per step and fitted to sRGB, one anchor per scheme solved for 3.2:1 against that
scheme's own `base-100`.**

### 1 and 2. One generated one-hue ramp from `primary`, not five assignments

`primary` is the brand colour, and the ramp shades from it. That is why the ramp is generated rather
than assigned. With five plain assignments the ramp is a palette, and a palette cannot follow a theme
the user pastes in. The generated form inherits the hue live and the brand chroma up to the baked
per-step ceiling, so a theme swap moves the charts with it.

Order is fixed by contrast, not by hue. `chart-1` is the step nearest the page in both schemes and
`chart-5` the furthest, because the anchor is solved at 3.2:1 and the rest walk away from the surface
at a fixed 0.09. A series therefore reads in one direction in either scheme, and the first series
colour is the one that just clears the floor.

Five plain assignments were measured and rejected. Sourced name-to-name from `primary`, `secondary`,
`accent`, `neutral` and `base-content`, only `accent` lands under 3:1 (1.91 against the light page),
but the set is not ordered, the nearest pair is 0.070 OKLab ΔE, and `accent` on its own is unreadable.
The version that spreads across the semantic four is worse: `accent` 1.91, `warning` 1.76 and `info`
2.22 are three of five under 3:1. Neither set reads as a series. `sweep.txt` section 5.

Hue rotation was measured and rejected for a different reason. daisyUI's hues are not spread evenly,
so `calc(h + 60)` from `primary` at 277 lands at 337, 17 degrees from `secondary` at 354. The first
step would wear another key's hue. Any fixed offset large enough to separate also needs a hue that is
free across all possible themes, and there is none. The built-in pair already occupies 13, 84, 163,
182, 233, 277 and 354.

`color-mix()` toward `base-100` was rejected because it converges. The fifth step approaches the page
by construction, so contrast against the page falls to nothing at exactly the step that is supposed
to be the strongest.

### 3. Lightness is solved per scheme, never shared

The two schemes cannot share a lightness band. The light band, laid on daisyUI's dark page, runs
4.95 / 3.44 / 2.34 / 1.59 / 1.13, so `chart-5` lands at 1.13:1. Each scheme therefore solves its own
anchor: the lightness that first reaches 3.2:1 against that scheme's own `base-100`, taking whichever
direction has headroom, then four more steps at a fixed 0.09 in that direction.

Two alternatives were measured and rejected:

- **Fixed band.** Holds on a white page and fails above page L 0.30, which is where daisyUI's dark
  `base-100` sits.
- **Ratio-targeting every step.** Each step solved for its own contrast target. This looks stricter
  and is worse. It spends the separation budget on the target, and on a mid-tone page two steps solve
  to the same lightness, so the ramp loses a step. Solving once, then stepping by a fixed amount,
  keeps both contrast and separation.

### 4. `info`/`success`/`warning`/`error` are out of the ramp

A one-hue ramp forbids a second hue, so the semantic four cannot be in it by construction. This is a
consequence of decision 1, not a separate judgement. It also agrees with ticket 09, which drops
`info`, `success` and `warning` from the core map in v1, because a chart series must not be the same
colour that means "danger" in an alert on the same page.

### 5. The separation rule, and where it can live

The premise in the question is slightly wrong, and the measurement says so. **A one-hue lightness ramp
is already the colour-blind-safe construction**, because colour-vision deficiency destroys the
red-green and blue-yellow axes and not lightness.

The table reports the worst OKLab ΔE in each set, using adjacent steps for a ramp and any pair for
five hues. The first row and the last come from `sweep.txt` section 6, the shadcn rows are their
published values:

| Construction | Normal | Protanopia | Deuteranopia | Tritanopia |
| --- | --- | --- | --- | --- |
| One-hue ramp, per-step cap, step 0.09 | 0.090 | 0.090 | 0.090 | 0.090 |
| shadcn emerald (published) | 0.081 | 0.084 | 0.079 | 0.080 |
| shadcn olive (published) | 0.075 | 0.074 | 0.075 | 0.073 |
| shadcn red (published) | 0.061 | **0.051** | 0.060 | 0.062 |
| Five semantic hues, worst pair | 0.137 | 0.128 | 0.112 | **0.035** |

The five-hue set separates better in normal vision and then collapses under tritanopia to 0.035,
below shadcn's own worst published ramp. That row is a worst pair, not an adjacent step, and it is
the semantic spread; the name-to-name set holds 0.070 under every simulation, because `neutral` and
`base-content` differ mainly in lightness. The one-hue ramp holds 100% of its separation under all
three simulations. The question is what number the writer enforces, not whether to be colour-blind
safe.

**The rule: adjacent OKLab ΔE >= 0.06 on the painted sRGB value, plus 3:1 contrast against the page,
both enforced by the writer at generation time.** The number is 0.06 because shadcn's weakest published
ramp is red at 0.061 in normal vision, and red falls to 0.051 under protanopia. The floor sits just
under the published normal worst, so it does not reject the house style it replaces, and above the
published simulated worst, so it keeps a margin the house style does not.

The rule can only live in the writer. CSS has no `contrast()` or `deltaE()` between two custom
properties, so no stylesheet can check itself. The writer reads the theme, solves the anchor, lays out
five steps, computes both numbers, and refuses to emit a ramp that breaks a floor. The CSS it emits is
then guaranteed as far as sRGB cooperates. Swept over 10 hues and 6 page lightnesses (L 0.98, 0.90,
0.80, 0.25, 0.12, 0.03) the rule accepts 53 of 60, with worst adjacent ΔE 0.090 normal and 0.091
simulated among the accepted, and refuses seven on the 2 degree hue guard. `sweep.txt` section 3.

### The chroma cap is per step, because sRGB is not uniform

The first version of this rule capped chroma at 0.08 for the whole ramp. That cap is not always
reachable. At L 0.9091 the largest chroma sRGB can hold at hue 277 is 0.0442, so the top step of the
dark ramp clipped, and clipping moved the hue 4.48 degrees. The rendered ramp was therefore not one
hue, which is the invariant decision 1 rests on.

The rule now fits each step to the gamut: `min(brand chroma, 0.08, gamut limit at that L and hue)`.
Measured against the clipping version over the same 10 hues and 6 surfaces:

| | Worst adjacent ΔE | Worst hue drift | Refused on the 2° guard |
| --- | --- | --- | --- |
| Per-step gamut fit (settled) | 0.086 | 9.33° | 7 of 60 |
| Single cap, clipped | 0.075 | 39.51° | 19 of 60 |

Fitting is better on both axes and on refusals, so per-step fitting has no downside. On the daisyUI
pair the top dark step emits `min(c, 0.0442)` and the painted hue stays within 0.62° of the rest of
the ramp.

### Emitted for the daisyUI built-in pair

`:root` and `.dark` are unlayered, so these win over `@layer base`. A plugin cannot own them:
`addBase` emits into `@layer base` and the project's unlayered `:root` wins, which is why the CLI's
writer emits them and the prototype's generator must emit them the same way.

```
:root
  --chart-1: oklch(from var(--daisy-color-primary) 0.6562 min(c, 0.0800) h);   3.20:1
  --chart-2: oklch(from var(--daisy-color-primary) 0.5662 min(c, 0.0800) h);   4.60:1
  --chart-3: oklch(from var(--daisy-color-primary) 0.4762 min(c, 0.0800) h);   6.76:1
  --chart-4: oklch(from var(--daisy-color-primary) 0.3862 min(c, 0.0800) h);   9.94:1
  --chart-5: oklch(from var(--daisy-color-primary) 0.2962 min(c, 0.0800) h);  14.06:1

.dark
  --chart-1: oklch(from var(--daisy-color-primary) 0.5491 min(c, 0.0800) h);   3.20:1
  --chart-2: oklch(from var(--daisy-color-primary) 0.6391 min(c, 0.0800) h);   4.63:1
  --chart-3: oklch(from var(--daisy-color-primary) 0.7291 min(c, 0.0800) h);   6.52:1
  --chart-4: oklch(from var(--daisy-color-primary) 0.8191 min(c, 0.0800) h);   8.94:1
  --chart-5: oklch(from var(--daisy-color-primary) 0.9091 min(c, 0.0442) h);  12.03:1
```

Painted bytes, from the render: light `rgb(132,141,194)` to `rgb(36,39,84)` on `rgb(255,255,255)`,
dark `rgb(101,109,160)` to `rgb(217,223,255)` on `rgb(29,35,42)`. The ratios on the right of the block
are solved values, before sRGB rounding; the painted values are one rounding step away and appear in
Measured below.

### Measured

Painted from the render, except the anchor row, which is solved:

| Claim | Light | Dark |
| --- | --- | --- |
| anchor lightness at 3.2:1 | 0.6562 | 0.5491 |
| contrast, steps 1 to 5 | 3.20 / 4.60 / 6.76 / 9.92 / 14.06 | 3.20 / 4.64 / 6.50 / 8.96 / 12.03 |
| adjacent OKLab ΔE | 0.090 / 0.090 / 0.090 / 0.090 | 0.091 / 0.089 / 0.091 / 0.096 |
| worst adjacent ΔE under CVD | 0.090 | 0.088 |
| painted hue drift | 0.90° | 0.62° |
| painted chroma | 0.080 max | 0.081 max, 0.044 at step 5 |
| brand chroma vs emitted | 0.240 asked, 0.080 emitted | 0.233 asked, 0.080 emitted |

### Stated limits

- **Five steps of one hue cannot convey identity.** WCAG 1.4.1 requires more than colour to carry
  information, and a legend or direct labels is what supplies it. Distinguishable is not the same as
  identifiable, and this is true of shadcn's published ramps too. 18 must say the chart needs a
  legend or labels.
- **Cap 0.08 is desaturated against the brand.** daisyUI's indigo asks for 0.24 and the charts show
  0.08. It sits inside shadcn's own published range (olive ships 0.05 to 0.11), so charts read as
  muted brand colour rather than brand colour. The overrides file is where a user who wants saturated
  series goes.
- **A mid-tone `base-100` has no valid ramp.** Both directions run out of headroom at L 0.45 to 0.55
  and the writer throws, naming the surface, instead of emitting five identical colours. Proved by
  `registry-12/floors.mjs`: L 0.45, 0.50 and 0.55 all throw, and a chroma-less brand still produces a
  valid grey ramp.
- **The hue guard refuses some light-grey surfaces.** In the 60-combination sweep the rule refuses
  seven, six at surface L 0.80 and one at L 0.90, spread over hues 0, 36, 72, 180, 216 and 252, where
  sRGB cannot hold the cap without rotating the hue. Those themes throw rather than get a ramp that is
  not one hue. `sweep.txt` section 3 lists them.
- **Only daisyUI's built-in pair was rendered.** The 10-hue and 6-surface sweeps are arithmetic on the
  same module, not builds.

### Evidence

- `evidence/12-chart-ramp/`: `run.json`, `render.json`, `css-before.css`, `css-after.css`,
  `css-after-then-1.css`, `css-after-then-2.css`, `then-1.log`, `then-2.log`, `add-install.log`,
  `build.log`, `compiled-sentinel.txt`, `light.png`, `dark.png`, `check.txt`, `floors.txt`,
  `sweep.txt`. 16 files.
- `registry-12/`: the probe theme, the package with `dist/ramp.mjs` (the settled rule) and the probe
  plugin, the item, `apply.mjs` (the writer), `floors.mjs`, `sweep.mjs` (the offline arithmetic), the
  rendered page, and `check.mjs`.

### Constraints this puts on later tickets

- 16: the prototype's generator emits `--chart-1` to `--chart-5` from `primary` with these constants,
  and it owns the throw for a mid-tone surface and for the hue guard's refusals.
  `registry-10/daisyui-adapter.json` still carries the placeholder rows `chart-1 primary` through
  `chart-5 success`; those are superseded by this ticket.
- The CLI (07, 14) emits the five values into `:root` and `.dark` alongside the 32 bindings,
  idempotently. They cannot come from the plugin, because `addBase` lands in `@layer base`. The probe
  writer in `registry-12/apply.mjs` adds one blank line per re-run and writes in place; the real CLI
  must not, and 14 already measures a byte-identical re-run.
- 17: inherits nothing here; it is hosting and publish.
- 18: document the ramp, the legend requirement, the desaturation, the mid-tone failure, and the
  seven hue-guard refusals.

Lesson: A generated scale is only as good as the physical limits of the space it lands in, so a colour rule has to be solved against the gamut and the page at generation time, where the numbers exist, rather than declared in CSS where nothing can check them.
Check: code - registry-12/check.mjs recomputes contrast, adjacent ΔE and hue drift from the painted sRGB bytes of a real build and fails on any of the three, so a ramp that clips, drifts off its hue, or loses separation cannot be committed; registry-12/floors.mjs proves the writer refuses a mid-tone surface instead of emitting five identical steps; registry-12/sweep.mjs re-derives every offline number in this ticket, and refuses to report if its arithmetic disagrees with ramp.mjs on the shipped pair.
