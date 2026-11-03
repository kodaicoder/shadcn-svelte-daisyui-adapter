# End-to-end prototype on a fresh project
Session IDs:

Type: prototype
Status: resolved
Blocked by: 09, 10, 11, 12, 13, 15

## Question

Does the whole chain work on a project that is not this one?

Build the cheapest real version:
1. Take the mapping from tickets 09 to 12 and the emission mechanism from 13.
2. Publish a local registry item and install it with the harness from ticket 15.
3. Use the two theme blocks from the conversation (light and dark) as the input theme file.
4. Install a representative component set: button, card, input, dialog, tabs, and the chart.
5. Capture light and dark renders.

Report what looked wrong, not only what failed. Specifically watch for: invisible borders, low-contrast muted text, a sidebar that does not separate from the page, chart series that read as one colour, and focus rings that vanish in dark mode.

This prototype exists to falsify the mapping, so state the falsifications plainly.

## Constraints from the pure CLI (ticket 14, 2026-10-29)

Step 2 of the Question above is superseded by this section. The install path changed to the adapter
CLI (07 and 08, rewritten the same day). Build this prototype against the CLI, not a registry item:

1. Install with `pnpm dlx <pkg>@<exact> init` (or the probe's `pnpm add -D ./tarball` plus the CLI),
   after `shadcn-svelte init` and with the two theme blocks under `src/daisyui-theme.css`.
2. The CLI writes the bindings; the plugin emits `--daisy-color-*` and `--daisy-radius` from the
   theme. One list must drive both, or a renamed key becomes an invalid token.
3. The plugin emits nothing when the theme file is absent and throws E2/E3 when it is malformed
   (07 decision 5). A missing theme must build and render the CLI-written fallbacks.
4. Do not write raw `--color-*` names. Ticket 14 measured that a binding such as
   `--primary: var(--color-primary, …)` forms a cycle with `@theme inline`'s
   `--color-primary: var(--primary)` and the fallback is ignored
   (`evidence/14-override-rerun/cli-missing-theme/`).
5. The escape hatch is a user file the CLI creates empty beside the stylesheet plus one import line;
   the override wins by `html:not(.dark)` / `html.dark`, not by source order (14, decisions 1 and 2).

## Answer

Done 2026-10-30. The chain works end to end on a project that is not this one, with one real
falsification: **five of the CLI's written values have no fallback**, so with no theme the chart
colours vanish. Constraint 3 splits in two here: its build-and-render half holds in both arms, and
its "render the CLI-written fallbacks" half holds for 27 of the 32 binding declarations the CLI
writes and fails for the five chart rows.

Both arms built and rendered. `arm-full` is the real install path, `arm-missing` deletes
`src/daisyui-theme.css` after the CLI runs. Evidence is in `evidence/16-e2e-prototype/`.

One limit on what this proves for constraint 1: the harness constructs the shadcn step 4 state by
copying this repo's `layout.css` and `components.json` rather than running `shadcn-svelte init`,
because that command cannot run unattended (ticket 15). So the app is genuinely new, but its
pre-install stylesheet is this repo's.

| | arm full | arm missing |
| --- | --- | --- |
| build | `true` | `true` |
| render | HTTP 200 | HTTP 200 |
| console errors | none | none |
| plugin emitted | 20 `--daisy-color-*` plus radius and border | nothing, as designed |
| `init` twice | `65189342…` both times, byte identical across six adds | n/a |

### What worked

`pnpm add -D ./daisyui-adapter-0.1.0.tgz` then `daisyui-adapter init` wrote the stylesheet and the
empty override file, and the second `init` after six `shadcn-svelte add` calls produced a
byte-identical hash. All 26 colour-binding keys resolve to a token in `registry-12`'s theme, so the
mapping transfers to a purple themed project, not only this repo's green one. Of the theme's 20
tokens, 7 are actually read: `base-100`, `base-200`, `base-300`, `base-content`, `primary`,
`primary-content` and `error`. The other 13 (`secondary`, `accent`, `neutral`, `info`, `success`,
`warning` and their `-content` pairs) are never read, which is ticket 09's surface-first decision
working as designed rather than a gap: shadcn's `secondary` and `accent` are surfaces, so
`secondary` takes `base-200` and `accent` is a `color-mix` of `base-200` and `base-300`, and
daisyUI's brand meanings for those names go unused.
Radius and border width arrive as used values: buttons render `6.4px`, cards `8px`, inputs and
buttons carry a real `1px` border.

### Falsification 1, the chart ramp dies with no theme. Half of constraint 3 fails.

`ramp.mjs` writes each chart row as `oklch(from var(--daisy-color-primary) 0.6562 min(c, 0.08) h)`.
That has no fallback, and the CLI writes the ramp whenever the theme is present, including the row
it will later depend on. When the plugin emits nothing, `--daisy-color-primary` is undefined, the
`oklch(from …)` is invalid at computed-value time, and `--chart-1` resolves to the empty string.

Measured on the painted page: all five swatches paint `rgba(0, 0, 0, 0.000)` and the SVG bars fall
back to `rgb(0, 0, 0)` because their `fill` is `var(--chart-1)` with nothing to resolve. Every other
binding survives because it keeps `oklch(0.508 0.118 165.612)` in its `var()` second argument, so
the surface and text colours fall back correctly while the five chart colours go colourless. The
fix belongs in `ramp.mjs` or in the CLI: the chart values need a solved fallback too, the same way
the colour bindings have one.

### Falsification 2, surfaces barely separate. Ticket 09 and 10's rule holds, the input ramp is tight.

Contrast between adjacent surfaces, `arm-full`, which is the theme the ticket asks about:

| pair | light | dark |
| --- | --- | --- |
| page vs sidebar | 1.062:1 | 1.059:1 |
| sidebar vs active row | 1.092:1 | 1.053:1 |
| card ring vs page | 1.24:1 | 1.34:1 |

`arm-missing` differs because its fallbacks are this repo's palette, not the theme's: page vs
sidebar is 1.036:1 light and 1.156:1 dark, and sidebar vs active 1.064:1 light and 1.187:1 dark.

This is not the mapping collapsing. daisyUI's own light theme puts base-100 at 100%, base-200 at
98% and base-300 at 95%, so `sidebar = base-200` and `sidebar-accent = base-300` are 2 and 5
points apart by construction. The card does what ticket 09 asked: it takes base-100 for its fill
and separates from the page by its 1px ring alone, at 1.24:1, which is visible but faint. A user on
this theme will say the sidebar does not read as a panel, and the mapping cannot fix that without
dropping the daisyUI rungs ticket 10 settled.

### What looked wrong

The five ticket questions, answered from the painted bytes rather than from the CSS:

1. **Invisible borders.** No, but two surfaces are thinner than they look. The card has no border,
   only a 1.24:1 ring in light and 1.34:1 in dark, which reads at 1px. The dialog fill is exactly
   the page colour in both schemes, so its whole edge is its 1px ring at 1.23:1 light and 1.34:1
   dark, plus the `bg-black/80` scrim behind it doing most of the separating work. That is ticket
   09's decision applied honestly, `card`, `popover` and `background` all taking `base-100`, and
   daisyUI's ramp has no rung between 100% and 98% to elevate a popover onto. It is not a mapping
   bug, but a user will call the card edge faint, and the dialog depends on the scrim to read at all.
2. **Low-contrast muted text.** In `arm-full`, no: 5.77:1 on light and 5.97:1 on dark, above AA.
   In `arm-missing` light it drops to **4.25:1**, below the 4.5:1 AA floor for body text. The cause
   is the fallback the CLI writes from the project's own stylesheet, `oklch(0.58 0.031 107.3)`
   (which paints `rgb(124, 124, 103)`), not the theme's derived value. A no-theme project inherits
   this repo's muted grey, and that grey is too light.
3. **Sidebar that does not separate.** Yes, confirmed and quantified above: 1.062:1 in light and
   1.059:1 in dark against the page. The active row is barely distinct from the panel, 1.092:1 in
   light and 1.053:1 in dark, so the current page does not stand out.
4. **Chart series reading as one colour.** No in `arm-full`; yes and worse in `arm-missing`, where
   they read as no colour at all. In `arm-full` the five series span relative luminance 0.279 to
   0.025 in light and 0.162 to 0.747 in dark, with adjacent luminance deltas from 0.031 to 0.203.
   The closest pair is chart-4 to chart-5 in light, at 0.031, which is the one place they crowd.
   Note this is luminance separation, not ticket 12's settled metric: that ticket's rule is adjacent
   OKLab ΔE of 0.06 or more on painted sRGB, which `registry-12/check.mjs` already enforces and
   which this probe does not recompute. So this line answers "do they look like five series", not
   "does the ramp satisfy its own floor".
5. **Focus rings vanishing in dark mode.** No. The dark ring paints `oklch(0.58 0.233 277.117)` as
   a 4px band outside a 2px background-coloured gap, and it is clearly visible on both the primary
   button and the surface button in `focus-surface-dark.png`.

### What the mapping must change

Only one thing, and it is the chart fallback. It is carried by
[21](21-chart-no-theme-fallback.md), with this ticket's measurements as its input. Everything else
this prototype found is either the input theme being tight, or this repo's palette leaking into a
no-theme build through the CLI's own fallbacks. The second is worth a ticket, but note it is an
artefact of the harness: the harness copies this repo's `layout.css` instead of running
`shadcn-svelte init`, so under a real init the fallbacks would be shadcn's neutral values rather than
this repo's olive grey.

### What this prototype did not measure

Stated plainly so the ticket is not read as covering more than it does:

- **No malformed-theme arm ran.** Constraint 3's E2 and E3 throws are unexercised here. `install.mjs`
  used to carry a dead `no-theme` arm whose comment described a one-block pair while its code added
  a button; it was deleted during review rather than left to be misread as coverage.
- **Constraint 5 is not exercised.** The override import is written
  (`css-after-then-1.css` line 8) and the file is created empty, but no override is authored, so the
  `html:not(.dark)` / `html.dark` specificity win is untested.
- **The two stale chart fixtures the plan names are still stale.** `registry-14/probe-cli/init.mjs`
  and `registry-10/daisyui-adapter.json` still carry `chart-1 primary` through `chart-5 success`, and
  `init.mjs` also still carries the `sidebar: base-100` / `sidebar-accent: base-200` rows ticket 10
  superseded. They were left alone deliberately: 10, 11 and 14 are resolved and their fixtures are
  the record of what those runs installed. `registry-16/` is the authoritative table. This is an
  open judgement call for the operator, not a completed step.

Lesson: A derived value that borrows another token's channel (oklch(from var(--x) … h)) has no fallback of its own, so the arm with no theme loses every chart colour while each plain var() binding beside it degrades correctly.
Check: code - registry-16/probe-visual.mjs reads the painted sRGB bytes of five swatches plus the dialog, focus ring and computed contrast in both schemes, keeps alpha rather than dropping it, and exits non-zero on any series that paints transparent or unfound, so a chart ramp with no fallback cannot pass as a working no-theme build. Measured: `arm-missing` exits 1 naming all five series; `arm-full` exits 0.

