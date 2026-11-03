# Sidebar mapping

Type: grilling
Status: resolved
Blocked by: 03

## Question

daisyUI has no sidebar palette, so all eight sidebar tokens are derivations. Decide each:

- `sidebar`
- `sidebar-foreground`
- `sidebar-primary`, `sidebar-primary-foreground`
- `sidebar-accent`, `sidebar-accent-foreground`
- `sidebar-border`
- `sidebar-ring`

For each, pick a source (`base-100`, `base-200`, `base-300`, `base-content`, `primary`, an expression) and give the rationale. The constraint to respect: a sidebar should read as a distinct surface from the page without a hard border, and the accent state must stay visible in both themes.

Depends on ticket 03 for the key list.

## Answer

Resolved 2026-10-29 on the pure-CLI contract. The surfaces were rendered, not read. The fixture is
`registry-10/`, and the cited artefacts are copied to `evidence/10-sidebar/` from one harness run
(`2026-10-29T05-44-45-513Z`), because `harness/runs/` is gitignored. The run installs ticket 14's item
with the eight settled sidebar rows into a project holding a hand-transcribed copy of daisyUI's built-in
light and dark colours (`registry-10/probe-theme.css`, from research 01's table, under probe names; only
the 20 colours are the built-ins), on `--layout app`. It adds the real `sidebar` component and renders
an active row, an outline row, a separator, the brand pair and an inset content card.
`registry-10/check.mjs` re-runs 61 assertions against the committed copies (`check.txt`, all pass).

### The table

| Token | Value | Why |
| --- | --- | --- |
| `sidebar` | `var(--daisy-color-base-200)` | The panel is a surface, and 09 gives surfaces `base-200`. It also has to differ from `background`: the inset variant paints the content card `bg-background` on top of the panel, and the outline menu button fills `bg-background` too, so a base-100 panel would leave both cards with no fill contrast. |
| `sidebar-foreground` | `var(--daisy-color-base-content)` | daisyUI's foreground for the whole base ladder. shadcn sets sidebar-foreground equal to foreground in both schemes, and the group label already dims itself with `/70`, so this token must stay at full strength. |
| `sidebar-primary` | `var(--daisy-color-primary)` | The app-level brand slot. No shipped component reads it; daisyUI has one brand rung with a guaranteed content pair, and no second step to source a lighter variant from. |
| `sidebar-primary-foreground` | `var(--daisy-color-primary-content)` | The only foreground daisyUI documents against `primary`, so it stays readable whatever lightness the brand has. |
| `sidebar-accent` | `var(--daisy-color-base-300)` | The panel is `base-200`, so the active state takes the next rung. 09's core accent mix would be a 0.45% step on this surface, invisible. |
| `sidebar-accent-foreground` | `var(--daisy-color-base-content)` | daisyUI defines no content token for the ladder's third rung; `base-content` is its foreground for the ladder. |
| `sidebar-border` | `color-mix(in oklch, var(--daisy-color-base-content) 10%, var(--daisy-color-base-100))` | 09's hairline, unchanged. It is drawn against two surfaces: the page edge (floating ring, outline row) and the panel (separator, rail, sub-menu border). Full-strength `base-content` is the prior-art failure. |
| `sidebar-ring` | `var(--daisy-color-primary)` | The same source as 09's core ring, so focus reads as interactive and the sidebar and page share one decision. |

Five rows are direct sources, one is an expression, two are the brand pair. No new constant is
introduced beyond 09's `10%`. One row widens the ticket's source list: `sidebar-primary-foreground`
uses `primary-content`, because `primary` cannot carry text without its content pair.

The key list is ticket 03's eight (`:root` 32 keys, `.dark` 31 with no `radius`; 13 measured that the
writer inserts the dark `radius`). The fixture's other rows are ticket 14's, chart placeholders and that
insertion included, and 10 asserts only its own eight. 16 owns the one shared list, so no check here
compares the copied rows to 14.

### The ladder is a closed set

daisyUI's built-in pair gives base-100 `100%`, base-200 `98%`, base-300 `95%` in light and `25.33%`,
`23.26%`, `21.15%` in dark. Three rungs, one direction. The table assigns each relationship a distinct
rung rather than inventing a value:

- **Page** owns `base-100`. 09 already binds `background`, `card` and `popover` to it.
- **Surface** owns `base-200`. `secondary`, `muted` and now `sidebar`.
- **State inside a surface** owns `base-300`. The sidebar accent is the first consumer.
- **Text and brand** stay on `base-content`, `primary` and `primary-content`.

That is why `sidebar` is not `base-100`: the panel would be the page, and the two components that paint
`bg-background` inside it would have nothing to stand on. It is also why the accent is not 09's core
`accent` expression (`base-200 85%`, `base-300 15%`): that mix is a 0.45% step from `base-200`, which
works on a page but not on a panel that is already `base-200`.

### What consumes each token

- `bg-sidebar` paints the panel (`sidebar.svelte:28`, `:97`), the mobile sheet (`:44`) and the inset
  wrapper (`sidebar-provider.svelte:45`). `sidebar-inset.svelte:16` is `bg-background`, which is the
  card-on-panel relationship the fill decision rests on.
- `sidebar-accent` is `hover:bg-` and `data-active:bg-` on the menu button, sub button and group action,
  plus a raw read in the outline variant's hover shadow (`sidebar-menu-button.svelte:5-9`).
- `sidebar-border` appears five times against two surfaces: the floating ring, the separator fill, the
  2px rail, the sub-menu's left border, and the raw `shadow-[0_0_0_1px_var(--sidebar-border)]` on the
  outline button.
- `sidebar-foreground` carries `text-sidebar-foreground` and the `/70` group label.
- `sidebar-ring` carries `focus-visible:ring-2` on the button, sub button, group label and group action.
- `sidebar-primary` and `sidebar-primary-foreground` are read by no shipped component. The fixture
  paints them as a block so the binding is proved rather than assumed.

### Measured

Thresholds: `7:1` for body text (WCAG AAA), `3:1` for a focus ring and for the brand pair (1.4.11
non-text; the pair belongs to the theme author), `0.02` OKLCH L for a ladder step, because the built-in
step is 2.0 to 2.1 and a lower floor would not catch a surface collapsing onto its neighbour, and
`0.04` for a hairline against the surface it divides.

| Pair | Light | Dark |
| --- | --- | --- |
| panel vs page | ΔL 0.021 | ΔL 0.021 |
| active row vs panel | ΔL 0.030 | ΔL 0.021 |
| separator vs panel | ΔL 0.057 | ΔL 0.093 |
| border vs page edge | ΔL 0.078 | ΔL 0.072 |
| foreground on panel | 16.7:1 | 15.6:1 |
| accent-foreground on active row | 15.3:1 | 16.4:1 |
| focus ring on panel | 7.8:1 | 3.6:1 |
| primary pair | 6.8:1 | 4.1:1 |

The outline row resolved to the page colour in both schemes (`rgb(255 255 255)` / `rgb(29 35 42)`)
and drew the border colour as its 1px shadow, and the inset card resolved to the page colour on the
panel. That is the component read the fill decision predicted, measured rather than inferred.

### Stated limits

- **The dark active step is subtle: 2.11 points, about 1.05:1.** It matches shadcn's own light step
  (2.2 points, `src/routes/layout.css:35,39`) and sits under its dark step (5.8 points, `:69,73`). The
  component also marks the row with `data-active:font-medium` (`sidebar-menu-button.svelte:5`), a cue
  the fill measurement does not cover. Every cross-scheme strengthening is asymmetric, because
  `base-content` and `neutral` sit on the opposite side of the ladder in dark. Arithmetic on the
  fixture: 15% of `neutral` (L 0.14) in a base-300 row puts light at L 0.83, 15.1 points below the
  panel, while dark only reaches 3.2 points. Per-scheme rows would double the table for one token. A
  team that wants a stronger state edits `daisyui-adapter.overrides.css`; that is what the escape hatch
  is for.
- **The brand pair is the theme author's, not ours.** In the built-in dark pair, `primary-content` on
  `primary` measures 4.13:1, under 4.5 for normal text. The adapter preserves the pair and does not
  audit it; a brand whose pair fails WCAG needs a new theme, not a different mapping.
- **The dark ladder is compressed.** base-100 to base-300 is 4.18 points in dark against 5.0 in light,
  so the panel step and the active step are each about one rung. The panel reads through the inset gap,
  its shadow and the border, not through fill alone.
- **The direction is assumed.** `base-300` is treated as "deeper" in both schemes, which is what
  daisyUI's built-in pair does and what 09's card and popover correction already rests on. A custom
  theme whose base-300 is lighter than base-200 would put the active row above the panel.

### Not proved here

- The mobile sheet path (`sidebar.isMobile`) shares `bg-sidebar` but was not rendered.
- The rail hover, the floating-variant ring, the sub-menu left border and the focus ring were not
  rendered as states. They read the same `--sidebar-border` or `--sidebar-ring` that the separator and
  the contrast pairs measure, so their colour is proved and their geometry is read from source.
- The probe theme's length and flag tokens (`--radius-*`, `--size-*`, `--border`, `--depth`, `--noise`)
  are the fixture's usual values, not the built-in ones. Only the 20 colours are daisyUI's built-ins.
- That these eight values survive a shipping CLI. The fixture's item is a static JSON payload, and
  tickets 16 and 17 own the writer.

### Evidence

- `evidence/10-sidebar/`: `run.json`, `render.json`, `css-before.css`, `css-after.css`,
  `css-after-then-1.css`, `then-1.log`, `add-install.log`, `package-json-after.json`,
  `compiled-sentinel.txt`, `build.log`, `light.png`, `dark.png`, `check.txt`.
- `registry-10/`: the item (`daisyui-adapter.json`), the built-in pair (`probe-theme.css`), the rendered
  page (`page/+page.svelte`), and `check.mjs`.
- Harness change: `run.mjs` gained `--page` (a page fixture replacing the baseline buttons) and
  `--selectors` (resolved element colours); `shot.mjs` samples each colour through a 1x1 canvas so
  `color-mix()` and `var()` chains come back as sRGB bytes. The ticket's flag list has no way to render
  a component other than the baseline buttons, so without these two flags the sidebar could not be
  rendered at all. Both are ticket 15's harness, extended the way 08, 13 and 14 extended it.
- Measured during the run: `add sidebar -y` hangs on the overwrite prompt for its `button` dependency;
  `add sidebar -y -o` succeeds and leaves the stylesheet byte-identical (`css-after.css` and
  `css-after-then-1.css` hash equal). That is a second instance of 20's `-o` finding, this time for a
  component add rather than the adapter item.

### Constraints this puts on later tickets

- 16: the eight rows join the one list that drives the plugin's emission and the CLI's bindings. The
  only expression is 09's `10%` border mix, shared with core `border`.
- 17: the package ships these eight rows; nothing in them is version-specific to the probe.
- 18: document the sidebar table, the 2.1 point dark active step, and the override file as the remedy.
  Also document `-o` on a component add whose dependencies are already installed.
- 12: unaffected. The chart rows in the fixture are still 14's placeholders.

Lesson: A guard threshold set below the property it protects cannot fail, so a surface step is only guarded when the floor is the step itself.
Check: code - registry-10/check.mjs derives the ladder floor from the rung (0.02 OKLCH L) and fails a panel or active row that collapses onto its neighbour, in both schemes.
