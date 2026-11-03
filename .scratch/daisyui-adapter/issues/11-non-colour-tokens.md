# Non-colour tokens: radius, border, depth, noise
Session IDs:

Type: grilling
Status: resolved
Blocked by: 01, 03

## Question

daisyUI exposes three radii, two sizes, a border width, a depth flag, and a noise flag. shadcn exposes one `--radius` with a computed scale, plus border widths from Tailwind.

Decide:
1. How `--radius-box`, `--radius-field`, `--radius-selector` collapse into `--radius`. Which one wins, or is it an expression?
2. Whether the shadcn radius scale (`sm` to `4xl`) stays as the `calc(var(--radius) * n)` proportions from the template, or gets re-derived from the three daisyUI radii.
3. What happens to `--border` (1px, 2px). shadcn has no token for it. Expose it, ignore it, or apply it to `border-width` utilities.
4. What happens to `--depth` and `--noise`. daisyUI uses them for shadows and texture. shadcn has no shadow tokens. Ignore in v1, or map depth to a shadow scale?
5. What happens to `--size-selector` and `--size-field`. shadcn component heights come from Tailwind utilities, not a token.

Record anything you decide to ignore, so the docs can say so plainly instead of leaving users guessing.

Depends on tickets 01 and 03.

## Answer

Resolved 2026-10-29 on the pure-CLI contract. Every value below comes from the two builds; where a
fact is read from source instead, the line says so. The fixture is `registry-11/`, and the cited
artefacts come from two harness runs, because `harness/runs/` is gitignored:
`2026-10-29T07-57-17-039Z`, the main run with `--border: 2px`, and `2026-10-29T07-57-58-230Z`, the
same fixture with `--border` removed from the theme, to measure the fallback. Both use `--layout
routes`, install ticket 10's item plus the radius binding and `--daisy-border`, add `input`, `card`
and `checkbox` from the registry, and write the `@theme inline` entry last through `apply.mjs`.
`registry-11/check.mjs` re-runs 74 assertions against the committed copies (`check.txt`, all pass).

The probe theme separates the three radii: `--radius-selector: 1rem`, `--radius-field: 0.25rem`,
`--radius-box: 0.75rem`. Both size tokens sit at the top of daisyUI's range, `0.3125rem`, and the
flags are on: `--border: 2px`, `--depth: 1`, `--noise: 1`. A binding that reads the wrong key is
therefore visible in the render: field as the radius would put a button at 3.2px instead of 9.6px,
selector at 12.8px, and a size leak would show as a 50px button or a 30px checkbox.

### The table

| Source | Output | Why |
| --- | --- | --- |
| `--radius-box` | `--radius: var(--daisy-radius)` in `:root` and `.dark` | The 1x step is a surface in the styles that use radius, and mira's card is that step. Measured 12px on the card. |
| `--border` | `--daisy-border` in both blocks, plus `@theme inline { --default-border-width: var(--daisy-border, 1px) }` | Tailwind resolves the bare border width from that one theme key, so it is the only way a token reaches `border`, `border-b` and `divide-y` without a `*` rule. Measured 2px, and 1px when the token is absent. |
| `--radius-field` | nothing | Dropped by the collapse. Buttons and inputs land at 0.8x the box rung. |
| `--radius-selector` | nothing | shadcn's checkbox radii are literals (4 to 6px) in all six rounded styles, so the rung has no consumer to bind. |
| `--size-selector` | nothing | No published style reads it. Selector sizes are static utilities. |
| `--size-field` | nothing | No published style reads it. Control heights are static utilities. |
| `--depth` | nothing | A 0/1 flag that daisyUI multiplies into its own component shadows. There is no shadcn shadow token to drive, and no scale in a boolean. |
| `--noise` | nothing | daisyUI's grain comes from its own components and `--fx-noise`. The adapter ships no component skins. |

### 1. The three radii collapse to `--radius-box`

`--radius` is the rung daisyUI calls box, and it is a direct source, not an expression. In mira, the
style this repo and the harness use, the card is `rounded-lg`, the 1x step, so `--radius` is literally
the card radius, and the render shows 12px against a 0.75rem box rung. The other five rounded styles
place their card above the 1x step: `xl` in vega and nova, `2xl` in maia, `4xl` in luma, and
`min(var(--radius-4xl), ...)` in rhea. Picking the field rung instead would cut mira's card to a third
of the theme's own value (0.25rem against 0.75rem), which is the larger visual error on the larger
surface.

The cost is real and is stated below: controls take `md`, 0.8x the box rung. At daisyUI's defaults
that is 0.4rem against a 0.25rem field radius, 1.6x rounder than the theme asked.

Rejected: a fit expression such as `calc(var(--daisy-radius-box) / 1.4)`. It hardcodes `xl`, so it
is right for three of the six rounded styles and wrong for maia, luma and rhea, and it invents a
constant that no value in the theme file stands for. Also rejected: keeping the template 0.625rem,
which drops a token family the destination promises to fill and that the generator treats as a
first-class slider.

### 2. The seven steps stay at the CLI's proportions

`--radius` is the only radius binding the adapter writes. The `sm` to `4xl` steps stay exactly as
`shadcn-svelte init` wrote them, `calc(var(--radius) * 0.6)` through `* 2.6`, measured byte-identical
before and after the install, and each swatch resolves to those ratios in both schemes.

Re-deriving them from the three daisyUI radii fails on ordering. daisyUI's selector rung is the
larger one for small controls (0.5rem default against field 0.25rem), while shadcn's `sm` must stay
below `md` and `lg`. A faithful remap would force `md` and `lg` onto the same source and the scale
would stop being a scale. It would also need seven new declarations in `@theme inline`, which ticket
05 requires to stay.

Consequence for 16: the writer does not emit `--radius-*`, and the adapter's only radius input is
`--radius`.

### 3. The border width is applied through one theme entry

daisyUI's `--border` is a length; shadcn's `--border` is a colour. The width must never be written to
`--border`, or every `border-border` in the base layer becomes an invalid length. The adapter emits
`--daisy-border: <theme --border>` beside the colours and adds one theme entry,
`--default-border-width: var(--daisy-border, 1px)`, which Tailwind 4.3 reads for the bare width of
`border`, `border-b` and `divide-y`. Measured on the build: `.border` compiles to
`border-width: var(--daisy-border, 1px)`, the button, input, checkbox, `border-b` and `divide-y` all
resolve 2px in both schemes, and with the token removed they all resolve 1px.

The fallback is load-bearing and proved separately. Ticket 14 found that a fallback is silently
dropped when the alias cycles, so the second run removes the key from the theme and the border still
renders at 1px, with the radius unchanged at 12px.

The registry `css` map cannot carry this entry. Passing `"@theme inline"` as a key makes
`shadcn-svelte` parse it as a selector and fail with `CssSyntaxError: Unknown word var`
(`failed-theme-entry-add.log`). The CLI writes the stylesheet directly, so 17 writes the line itself,
and `registry-11/apply.mjs` models that write by merging the entry into the existing block.

### 4. Depth and noise get no output

Both describe daisyUI's own component skins. `--depth` is a 0/1 multiplier on daisyUI's shadow
alphas, `--noise` scales its `--fx-noise` image. shadcn has no shadow token, and all eight published
styles hardcode `shadow-xs` through `shadow-2xl` per component, so there is neither a value nor a
scale to derive. The probe theme sets both to 1 and the render is unchanged: the button has no
shadow and no background image, and a `shadow-md` element keeps its stock shadow. Ticket 06 already
records leaving this geometry on as a documented failure mode of naive adapters.

### 5. Both size tokens get no output

`--size-field` (x10 control height) and `--size-selector` (x6 selector size) are read nowhere in the
eight published styles, measured: zero occurrences. Heights come from per-style utilities, and the
probe theme's maximum values (0.3125rem) would produce 50px and 30px if anything read them; the
render keeps the style's 28px button and 16px checkbox.

The tempting lever is Tailwind's `--spacing`, one multiplier for every padding, gap, width and
height. It would scale the whole UI by up to 25% to change two control sizes, and it still cannot
produce daisyUI's x6 versus x10 ratio. Recorded and dropped.

### Required keys on 16, and the 02 disagreement

Ticket 02 rejects a block missing any of the 28 tokens, while this ticket gives six of them no output.
The two are not in conflict once "ignored" is read as a mapping fact rather than a parse option: the
parser still requires all 28, and 16 inherits this list unchanged.

Required at parse are 02's 28 variables: the 20 `--color-*`, `--radius-selector`, `--radius-field`,
`--radius-box`, `--size-selector`, `--size-field`, `--border`, `--depth` and `--noise`. The four
metadata keys the generator writes (`name`, `default`, `prefersdark`, `color-scheme`) sit beside them,
and 02 still tolerates one missing `color-scheme` when the other block identifies the pair. Of the 28
variables, 22 drive output: the 20 colours, `--radius-box` and `--border`. The other six are parsed,
validated and dropped.

Why keep requiring the six: the sanctioned input is two generator blocks, which always carry all 28,
so a missing key is a paste error, not a preference; daisyUI gives the radius pair, `--depth` and
`--noise` no fallback at all, so absence cannot be read as a default; and one required list keeps E3
a single message. 02 is not edited.

### Ignored on purpose, for 18

`--radius-field`, `--radius-selector`, `--size-selector`, `--size-field`, `--depth` and `--noise` are
read and validated, then dropped. The docs should say it in one place: daisyUI describes these six on
its own components, the adapter ports tokens and not component skins, and anything a team wants back
belongs in `daisyui-adapter.overrides.css`.

### Measured

| Claim | Light | Dark |
| --- | --- | --- |
| `--radius`, from the theme's box rung | 0.75rem | 0.75rem |
| `rounded-sm` to `rounded-4xl` | 7.2 / 9.6 / 12 / 16.8 / 21.6 / 26.4 / 31.2px | same |
| button (`md`) | 9.6px | 9.6px |
| card (`lg`) | 12px | 12px |
| input (`md`) | 9.6px | 9.6px |
| checkbox (literal) | 4px | 4px |
| border on button, input, checkbox, `border-b`, `divide-y` | 2px | 2px |
| the same borders without `--daisy-border` | 1px | 1px |
| button height at `--size-field: 0.3125rem` | 28px | 28px |
| checkbox height at `--size-selector: 0.3125rem` | 16px | 16px |

### Stated limits

- **Controls read 1.6x the field rung at daisyUI's defaults.** `md` is 0.8x the box rung, so the
  default pair turns a 0.25rem field into 0.4rem. The error is zero only when a theme's field rung is
  0.8x its box rung. A theme with square buttons and round cards loses the square buttons.
- **Cards in five of the six rounded styles sit above the box rung.** The styles choose the step, and
  the adapter does not rewrite it. mira is exact; vega and nova are 1.4x, maia 1.8x, luma 2.6x, rhea
  a clamped 2.6x.
- **Selector has no fixed consumer.** Checkbox radii are literals per style (4px in vega, nova and
  mira, 6px in maia, 5px in luma and rhea), and badges take the main scale (4xl in vega, nova and
  maia). The selector rung is dropped, not approximated.
- **Explicit width utilities win over `--border`.** luma and rhea set `border-2` on the checkbox, so
  those checkboxes stay 2px whatever the theme says. Every other border in the eight styles is bare.
- **`@theme inline` gains a third writer target.** 05 asked for the block to stay; it stays, and
  gains one entry. 13's two-selector writer becomes a block plus two selectors. 16 and 17 own it.

### Not proved here

- The real emitter and CLI do not exist yet. The probe plugin prints the theme's box rung and border
  width, and `apply.mjs` writes the theme entry, so the run proves the CSS shape rather than the
  shipping writer.
- A missing theme *file* (07's degradation path) was not run. The fallback run removes the `--border`
  key from the theme, which is the same runtime state for this token.
- Only mira was rendered. The utility-per-component table for the other five rounded styles is read
  from the published style CSS, not from a build.
- Sub-pixel widths (`0.5px`, `1.5px`) were not rendered.

### Evidence

- `evidence/11-non-colour-tokens/`: `run.json`, `render.json`, `css-before.css`, `css-after.css`,
  `css-after-then-1.css`, `css-after-then-2.css`, `then-1.log`, `then-2.log`, `add-install.log`,
  `package-json-before.json`, `package-json-after.json`, `src-listing.txt`, `compiled-sentinel.txt`,
  `build.log`, `light.png`, `dark.png`, `check.txt`.
- `evidence/11-non-colour-tokens/no-border/`: the fallback run's `run.json`, `render.json`, both
  stylesheets, both `then` logs, the add log, the sentinel, the build log and both screenshots.
- `evidence/11-non-colour-tokens/failed-theme-entry-add.log`: the first attempt, with
  `"@theme inline"` as a registry `css` key, which the CLI rejects.
- `registry-11/`: the probe theme and its border-less twin, the package with the probe plugin, the
  item, `apply.mjs`, the rendered page, and `check.mjs`.
- Harness change: `shot.mjs` now records `borderRadius`, the four `borderWidth` sides, `height` and
  `backgroundImage` per sampled element. A radius, a width and a height are used values that no
  `--props` read can return, because a custom property keeps its `calc()` token string, and the
  background image is where a noise leak would surface.

### Constraints this puts on later tickets

- 16: the required list is 02's 28 variables plus the generator's four metadata keys, with 22 of the
  variables driving output. The table has one radius row, one border row, and no row for the six
  ignored tokens. The border row needs the `@theme inline` write, which the registry `css` map cannot
  express.
- 17: the package emits `--daisy-radius` from `--radius-box` and `--daisy-border` from `--border` in
  both scheme blocks, and the CLI writes `--default-border-width: var(--daisy-border, 1px)` into the
  existing `@theme inline` block, once and idempotently.
- 18: document the six ignored tokens together, the 1.6x control rounding, the style-dependent card
  step, and the `border-2` exception in luma and rhea.

Lesson: A token only crosses systems where the receiving side names a key for it, so a mapping is a capability check against that framework, not a policy choice about the source.
Check: code - registry-11/check.mjs proves the capability that exists (border width from one Tailwind theme key, with its fallback) and fails when any of the six unconsumed tokens appears in the output.
