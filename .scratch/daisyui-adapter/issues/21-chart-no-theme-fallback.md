# Chart rows have no fallback, so a deleted theme paints them black

Type: task
Status: resolved
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

Done 2026-11-02. Shape B, the derived-helper shape the five mix keys already use:

```
--chart-1: var(--daisy-derived-chart-1, oklch(0.845 0.143 164.978));
--daisy-derived-chart-1: oklch(from var(--daisy-color-primary) 0.6562 min(c, 0.08) h);
```

A was rejected because a solver literal contradicts 07 §5, and C because 07 §5 rejects it outright.
B costs one function in `init.mjs`, not four files: `map.mjs` needed nothing, because `rebuild()`
already special-cases `chart-*` and `--daisy-derived-*`, and `ramp.mjs` still only solves the ramp.

The re-run trap is answered without a side file. The row's own second argument holds the project's
value, so `unwrapFallback()` (the `strip()` the 27 bindings already use) reads it back on the next
run. Nothing needs capturing before the first overwrite, because the first overwrite writes the
capture. A second guard stops the one value that is not a capture, a row that already holds a ramp,
from being copied into its own slot.

Measured on a real build, both arms fresh, in `evidence/21-chart-no-theme-fallback/`.

**Reproduced first.** `baseline-repro/visual.json`, today's package, theme present at `init` and
removed before the build: `failures` lists all ten series, every swatch `rgba(0, 0, 0, 0.000)`, and
`probe-visual.mjs` exited 1.

**DoD 1.** `arm-missing/visual.json` after the fix: light and dark both
`rgba(94, 233, 181, 1.000)`, `rgba(0, 188, 125, 1.000)`, `rgba(0, 153, 102, 1.000)`,
`rgba(0, 122, 85, 1.000)`, `rgba(0, 96, 69, 1.000)`, `failures: []`, probe exit 0. Those are the
project's own five stock rows, which is what 07 §5 promises. The SVG bars resolve too
(`oklch(0.845 0.143 164.978)` through `oklch(0.432 0.095 166.913)`), so the `rgb(0,0,0)` half of the
defect is closed as well. `mechanism-probe.txt` shows the pivot directly: the old shape resolves
`--chart-1` to `""` and paints `rgba(0, 0, 0, 0.000)`, the new shape resolves to
`oklch(0.845 0.143 164.978)` and paints `rgba(94, 233, 181, 1.000)`.

**DoD 2.** `arm-full/visual.json` is byte-identical, all ten series, to
`evidence/16-e2e-prototype/arm-full/visual.json`: light `rgba(132, 141, 194, 1.000)` to
`rgba(36, 39, 84, 1.000)`, dark `rgba(101, 109, 160, 1.000)` to `rgba(217, 223, 255, 1.000)`. The
text pairs are identical too (`muted-on-card` 5.77 light, 5.97 dark). The ramp did not move; only the
wrapper around it did.

**DoD 3.** `then-1.log` records `2a2a84ac…` after the first `init` and the same after the second, in
both arms. That hash differs from ticket 16's `65189342…` because the emitted shape changed, which is
DoD 5's amendment, not a regression. Absent-then-present is measured twice: a CLI round trip
(present, present, absent, present) returns the present hash unchanged, and `smoke.mjs` asserts it as
`the theme returning after an absence does not nest a ramp in its own slot`. Both assertions read the
`:root` and `.dark` slots, so a dark-only regression fails.

**DoD 4.** `smoke.mjs:143`'s "a missing theme leaves the stock chart rows" is replaced by the state
that actually failed: rows written with the theme must carry the project value in their own fallback
slot. Proven under sabotage, output kept in `sabotage.txt`: reverting the writer to the bare ramp
makes three checks fail and names `--chart-1: oklch(from var(--daisy-color-primary) 0.6562 min(c,
0.08) h)`. The `bare` arm's original assertion is kept as well, now comparing against the project's
own row rather than the absence of a ramp string.

**DoD 5.** 07 §5 points at this ticket. 12's emitted block shows the new shape with its solved
lightness, chroma and ratios unchanged.

### Two limits, stated

1. **Ticket 12's separation floor holds; its 3:1 floor does not describe the fallback.** The stock
   rows measure min adjacent ΔE 0.081 in both schemes, above 0.06. Their contrast against the
   project's own surface is 1.52, 2.46, 3.67, 5.37, 7.58 in light and 12.91, 7.95, 5.34, 3.65, 2.58
   in dark, so step 1 is below 3:1 on white. Those are the bytes the page painted before the adapter
   ran, which is exactly what 07 §5 asks for. 12's floor binds the ramp the writer solves, not a
   value it preserves; the only way to satisfy both is shape A, which 07 §5 forbids.
2. **A stylesheet already written by the pre-21 writer cannot recover its stock rows.** The old
   writer destroyed them, so the guard leaves that row as the bare ramp rather than nesting it. This
   is unreachable for an installed project, since 0.1.0 is unpublished (ticket 17 is still open), and
   `registry-16/` is the only place the old shape exists.

Lesson: A fallback has to be written at the moment the value is still known; a value that borrows another token's channel can only degrade through the consumer that still holds the original.
Check: code - registry-16/smoke.mjs asserts the emitted chart row is `var(--daisy-derived-chart-N, <project row>)` in both `:root` and `.dark`, and fails under a reverted writer (evidence/21-chart-no-theme-fallback/sabotage.txt); registry-16/probe-visual.mjs reads the painted bytes and exits 0 on arm-missing, 1 on the pre-fix build.
