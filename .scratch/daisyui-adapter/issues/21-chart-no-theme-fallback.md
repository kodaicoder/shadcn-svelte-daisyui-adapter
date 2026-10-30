# Chart rows have no fallback, so a deleted theme paints them black

Type: task
Status: open
Blocked by: none

## Question

Ticket 16 measured a state every other binding survives: the theme is present when `init` runs, and
absent when the build runs. `ramp.mjs` emits each chart row as

```
--chart-1: oklch(from var(--daisy-color-primary) 0.6562 min(c, 0.0800) h);
```

with no second argument. When the plugin emits nothing, `--daisy-color-primary` is undefined, the
`oklch(from …)` is invalid at computed-value time, and `--chart-N` resolves to the empty string. All
five swatches paint `rgba(0, 0, 0, 0.000)` and the SVG bars fall back to `rgb(0, 0, 0)`.

Every other value degrades. Measured on `evidence/16-e2e-prototype/arm-missing/css-after-then-1.css`,
`:root` carries 37 declarations:

| group | count | degrades with no theme |
| --- | --- | --- |
| bindings, `var(--daisy-color-x, value)` and `var(--daisy-radius, value)` | 27 | yes, all 27 |
| `--daisy-derived-*` helpers, `color-mix(…)` with no fallback | 5 | yes, because their consumer is `var(--daisy-derived-x, value)` |
| chart rows, `oklch(from …)` with no fallback | 5 | **no, all 5** |

So ticket 07 §5's promise ("the page renders exactly as it did before the adapter ran … every token
falls back") is true for 27 of 32 and false for the five chart rows.

Decide how the chart rows fall back, and prove it on the painted page.

## Constraints from the resolved tickets

- **07 §5.** A missing theme degrades rather than fails, and the fallback is the project's own
  pre-adapter value, not a neutral literal. A chart fallback baked from daisyUI's `base-100` would
  violate that: it is a literal, and it was solved against a surface the project no longer has.
- **12.** The ramp is one generated one-hue spread from `primary` with a per-step chroma cap, and the
  writer enforces adjacent OKLab ΔE >= 0.06 plus 3:1 because CSS cannot compute ΔE. Whatever the
  fallback is, it must not produce five values that fail that floor. Ticket 12's "Emitted for the
  daisyUI built-in pair" block prints the current `oklch(from …)` form as the settled output, so it
  is amended if the shape changes.
- **13.** The rows live in the project's unlayered `:root` and `.dark`, not in the plugin's `addBase`,
  because the unlayered block wins. The plugin cannot supply the fallback.
- **14.** `init` is byte-identical on re-run, and `init` wipes the values while the CLI restores them.
  A fallback slot that holds the previous run's ramp expression would nest on the second run and
  break that.

## Candidate answers, with what each costs

**A. Inline a solved literal into the source var.** `oklch(from var(--daisy-color-primary, oklch(…)) …)`.
One line in `ramp.mjs`. Cheapest, and it would turn `arm-missing` green. But the `L` values were solved
against daisyUI's `base-100`, so with no theme the chart sits on the project's own surface and its
contrast is unmeasured. It also contradicts 07 §5 as written, because the fallback is a daisyUI-derived
literal rather than the project's value.

**B. Reuse the derived-helper shape the 5 mix keys already use.** Emit
`--chart-N: var(--daisy-derived-chart-N, <the project's own stock row>)` plus a
`--daisy-derived-chart-N: oklch(from var(--daisy-color-primary) …)` helper. This matches 07 and it is
the pattern already proven to degrade, but it touches `map.mjs`'s key sets, `ramp.mjs`, `init.mjs`'s
`rebuild`, and ticket 12's emitted block.

**C. Refuse the split.** Make a missing theme fail the build instead of degrading, so there is no
half-degraded state. Rejected by 07 already, and 16 confirmed the degrade path is otherwise sound, so
this trades a working promise for one bad row.

The re-run hazard applies to both A and B: on the second run the "current" chart row is the previous
run's ramp expression, not the project's stock row, so the fallback source has to be captured before
the first overwrite rather than read back from the block.

## What this ticket does not cover

- The four stale chart fixtures in tickets 10, 11 and 14 (`registry-10/daisyui-adapter.json`,
  `registry-11/daisyui-adapter.json`, `registry-14/registry.json` both items, `registry-14/r/*.json`,
  and `registry-14/probe-cli/init.mjs`). Those remain an open operator call recorded in ticket 16.
- A malformed-theme arm. Ticket 16's E2/E3 throws are still unexercised.
- The sidebar and active-row separation, which is the input theme's tightness and not a mapping defect.

## DoD

1. `arm-missing` paints five distinct opaque chart colours in both schemes, and
   `registry-16/probe-visual.mjs` exits 0. Today it exits 1 naming all ten series.
2. `arm-full` is unregressed: the ramp it paints is byte-identical to ticket 16's evidence, or the
   difference is stated and justified.
3. `init` twice is still byte-identical in the theme-present arm, and `init` with the theme absent
   then present again does not nest a ramp expression into its own fallback slot.
4. `registry-16/smoke.mjs:143` (`a missing theme leaves the stock chart rows`) is replaced by an
   assertion for the real failing state, the theme present then removed, and that assertion is proven
   to fail under deliberate sabotage.
5. Ticket 07 §5 carries a pointer to this ticket, and ticket 12's emitted block is updated if the
   emitted shape changes.

## Answer

<!-- fill on resolution: the chosen shape, the painted bytes in arm-missing, and the smoke assertion -->
