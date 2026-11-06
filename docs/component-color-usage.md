# Component colour usage

One entry per question asked during the component review. Nothing here is audited up front: an entry
exists because a part's colour came up.

Context: the demo theme is `light-blue` (default) with `dark-blue` as the dark scheme. `map` writes the
bindings into `src/routes/layout.css`, so every `--<token>` below reads a `--daisy-*` variable first
and keeps a literal fallback. Values were measured in the running app on 2026-11-05.

## Avatar

### Fallback background and text

Asked: what colour does the fallback avatar render as its background.

| part | class | token | daisyUI source | resolved |
| --- | --- | --- | --- | --- |
| background | `bg-muted` | `--muted` | `--color-base-200` | `oklch(0.945 0.031 203.388)` |
| text | `text-muted-foreground` | `--muted-foreground` | `color-mix(in oklch, base-content 62%, base-100)` | `oklch(0.4983 0.0558 249.869)` |

Chain for the background:

```
bg-muted -> --muted: var(--daisy-color-base-200, oklch(0.966 0.005 106.5))
         -> --color-base-200: oklch(94.5% 0.031 203.388)   (light-blue)
```

There is no `--daisy-color-muted`. The muted row maps from `base-200`, so changing the fallback tone
means changing `base-200` or the map row, not adding a muted token to the theme.

### Badge default background

Asked: why the default badge rendered green, and what a non-green badge uses.

| part | class | token | daisyUI source | resolved |
| --- | --- | --- | --- | --- |
| default badge | `bg-primary` | `--primary` | `--color-primary` | `oklch(0.42 0.199 265.638)` |
| default badge text | `text-primary-foreground` | `--primary-foreground` | `--color-primary-content` | `oklch(98% 0.016 73.684)` |

Before `light-blue` became the base, `--color-primary` was the teal `oklch(0.508 0.118 165.612)`, which
is why the badge read green. The colour row on the showcase passes explicit classes (`bg-destructive`,
`bg-amber-500`, `bg-foreground`) to show non-default tones. Those are page choices, not component
defaults.

## Format for the next entry

- part, and the class on that part
- the `--<token>` it reads
- the daisyUI source behind that token
- the value resolved in the browser, with the theme named

## Badge

### Size

Asked: does the badge have a size variant.

No. `badgeVariants` has one axis, `variant`. Every badge renders `h-5` (20px). The base sets `px-2`
(8px), and the fixer gives the filled and outline tone rows `px-1.5` (6px). The ghost and link tone
rows keep 8px, because their fixed rows do not add the padding, so horizontal padding is 6px or 8px
depending on presentation. Sizes would need a new variant axis, which the adapter's table does not
have.

### Text-tone hue shift on soft rows

Asked: the outline variants look different in colour, is that correct.

The structure is correct, the hue is not, and it is not specific to outline.

- The soft rows use `text-<tone>-text`: the destructive chip, every `outline-*`, every `ghost-*` and
  every `link-*`. The outline rows also use it for the border.
- `-text` is `color-mix(in oklch, var(--<tone>) 40%, var(--foreground) 60%)` (`dist/map.mjs:70-73`).
- With `--foreground` = `oklch(20% 0.09 240.876)`, a dark blue, the 60 percent foreground share
  rotates every hue toward blue:

| token | raw hue | rendered `-text` hue | reads as |
| --- | --- | --- | --- |
| destructive | 27 red | 299 | purple |
| success | 151 green | 205 | cyan |
| warning | 86 amber | 179 | teal |
| info | 233 blue | 238 | blue |

- The filled success, warning and info rows use `text-<tone>-foreground` instead, and keep their hue:
  132, 53, 243. That is why they look right next to the soft rows.
- The formula assumes a near-neutral foreground. Under a blue foreground it does not preserve the
  tone's identity, so a warning badge reads teal and a destructive badge reads purple.

Options, none applied: raise the tone share (70/30), mix against a neutral instead of the foreground,
or use the raw tone where AA allows. Each is a map change, so it moves every component that uses a
text tone, not just badges.

### Plain `outline` versus `outline-*`

Asked: why the plain `outline` badge has a different background and does not follow `primary`.

- `outline` is one of the five stock badge keys (`default`, `secondary`, `outline`, `ghost`, `link`)
  that the fixer keeps byte for byte. Its row is
  `border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-input/20 dark:bg-input/30`.
- `--input` is a derived neutral: `color-mix(base-content 15%, base-100 85%)`, and the row paints it at
  20 percent. Resolved background: `oklab(0.86725 -0.00211371 -0.0133335 / 0.2)`. It is neutral by
  design and does not read `--primary`.
- `outline-*` rows are adapter additions. They paint the raw tone at 10 percent and use `<tone>-text`
  for border and text, which is why they carry tone colour.
- `ghost-*` rows now paint the same 10 percent tone on hover, without a border, so ghost reads as the
  outline surface with the border removed. The plain `ghost` follows the same rule with `primary`.
- There is no `outline-primary`, `ghost-primary` or `link-primary` badge. Ticket 42 added those quiet
  rows to the button table only. The badge's tone set is the status tones plus `blackwhite`, with
  `primary` present only as the filled `default`.

If `outline` should follow `primary`, there are two routes: add `outline-primary` and its quiet
siblings to the badge table, or rewrite the stock `outline` row. The first keeps the stock keys
matching the pin; the second breaks the pin, the drift test and the fixer's anchor.

The fixer does have a third route, added for the alert `default` in ticket 48: `VARIANT_FIXED` writes
a different class in the fixed block while the stock block stays byte-identical to the pin. That
would let `outline`, `ghost` and `link` follow `primary` without touching the stock anchor, at the
cost of making those three names mean something different from shadcn's stock badge and from the
button's plain rows, unless both components are changed together.

### Hover on filled variants

Asked: why `default` and `secondary` do not change colour on hover.

Their stock rows define `[a]:hover:bg-<tone>/80`, so the hover exists only when the badge is an
anchor. Measured on the page:

| badge | before | after hover |
| --- | --- | --- |
| `default` as `<span>` | `oklch(0.42 0.199 265.638)` | unchanged |
| `default` with `href` | `oklch(0.42 0.199 265.638)` | `oklab(0.42 -0.0151355 -0.198424 / 0.8)` |

The tone rows use the same `[a]:` guard. Hover on a non-anchor badge therefore needs a fixed-side
change that drops the guard, for every filled row.

## Checkbox, switch, toggle and radio-group

### Tone and appearance coverage

Asked: whether the checkbox renders tones and the other appearances.

No, and it cannot today. The tone × presentation table covers `button`, `badge`, `alert` and `bubble`
only (`VARIANT_COMPONENTS`, `packages/daisyui-adapter/targets.mjs:881`). Checkbox appears in the radius
table alone, and its checked colours are fixed in the stock class:

```
data-checked:bg-primary data-checked:border-primary data-checked:text-primary-foreground
```

daisyUI offers colour modifiers on a checkbox (`checkbox-primary`, `checkbox-success`, ...) and no
appearance modifier, so there is one tone to show and no appearance. `switch`, `toggle` and
`radio-group` are in the same position: the variant table never touches them.

Measured on the switch page, the state pair that exists is the track colour, `bg-input` when unchecked
and `bg-primary` when checked: `oklch(0.86725 0.0135 260.992)` to `oklch(0.42 0.199 265.638)`.

### Why the variant table cannot add a tone

Each variant entry is a static string pair that the fixer writes with
`content.split(stock).join(fixed)` (`packages/daisyui-adapter/component-fix.mjs:177`), and
`renderVariantBlock` builds a cva `variant: { ... }` block (`targets.mjs:1470`). Checkbox has no cva
variant block, and a static replacement cannot choose a value at runtime. The shapes that can are a CSS
variable seam, a wrapper component with a `tone` prop, and a two-anchor patch of the fixed copy. The
choice is deferred to one ticket covering all four binary controls, so the mechanism is decided once.

### Parked findings

- Checkbox, switch and radio-group carry the `default` tone only, with no appearance. Toggle carries
  primary when pressed and has an appearance axis, but still no tones. Recorded here rather than fixed,
  because the mechanism is shared.
- `switch.svelte` moves its thumb with `rtl:data-[state=checked]:translate-x-[calc(-100%)]` while every
  other rule uses `data-checked`. bits-ui sets `data-checked`, so the RTL checked position never
  applies. Stock bug, upstream of the adapter.

### Toggle pressed paint and hover feedback

Asked: why hovering a pressed toggle changes nothing, and why a hovered toggle looks pressed.

Stock measured on the page:

| state | class | resolved |
| --- | --- | --- |
| unpressed, idle | none | `rgba(0, 0, 0, 0)` |
| unpressed, hover | `hover:bg-muted` | `oklch(0.945 0.031 203.388)` |
| pressed, idle | `aria-pressed:bg-muted` | same muted value |
| pressed, hover | `hover:bg-muted` | same muted value, no change |
| invalid, `default` variant | `aria-invalid:border-destructive` plus a ring colour | `border-width 0px`, `box-shadow none` |
| invalid, `outline` variant | the same class with a border present | `1px` of `oklch(0.5 0.213 27.518)` |

Pressed and hover painted one surface, so a pressed toggle gave no hover feedback and a hovered toggle
looked pressed. `hover:text-foreground` did nothing because the text is already `foreground`.

Decision taken on 2026-11-06: pressed takes primary, hover keeps muted, a pressed hover takes primary at
80 percent, and invalid gains a 2px ring. Measured on the fixed copy:

| state | resolved |
| --- | --- |
| unpressed, hover | `oklch(0.945 0.031 203.388)` |
| pressed, idle | `oklch(0.42 0.199 265.638)`, text `oklch(0.98 0.016 73.684)` |
| pressed, hover | same primary at 80 percent alpha |
| invalid, `default` variant | `2px` ring of `oklab(0.5 0.188902 0.0984118 / 0.2)` |
| pressed `outline` border | primary, so the border follows the fill |

The change lives in `src/lib/components/toggle-fixed/toggle.svelte` only. `init.mjs fix toggle` does not
produce it, because the fix sits in the base class rather than a radius or variant row. The tone seam
ticket has to encode it in `targets.mjs`, or the fixed copy will drift from the generator. Toggle is
also the one binary control that already has a `variant` prop, so the seam has to serve a component
with an existing appearance axis.

## Button

### Focus ring

Asked: does the button show a focus ring, and where does it come from.

| case | measured |
| --- | --- |
| keyboard focus, default variant | `2px` of `oklab(0.42 -0.0151355 -0.198424 / 0.3)`, which is `--ring` at 30 percent |
| keyboard focus, `destructive` | `2px` of `oklab(0.5 0.188902 0.0984118 / 0.2)` |
| mouse press | `:focus-visible` false, no ring layer |

`:focus-visible` matches after `Tab`, and `--ring` maps to primary. The ring fades in because the base
carries `transition-all`: read immediately after `Tab`, the spread is `0.066px` at alpha `0.0099`, so a
snapshot taken that early shows nothing. Wait for the transition before judging it. The destructive
variant overrides both the ring colour and the border colour, so its focus state is red rather than
primary.

### Press feedback

Asked: what changes while the button is held down.

Only position. `active:not-aria-[haspopup]:translate-y-px` moves the button `1px` down and back:
`148px` at rest, `148.99px` while held, `148px` after release. The background stays at the hover value,
so a press adds no paint of its own. Buttons with `aria-haspopup` skip the translate by design.

### Disabled

A disabled `<button>` reports `disabled` and cannot be activated. A disabled link button renders an
`<a>` with no `href` and `tabindex="-1"`, so it is unreachable by keyboard and does not navigate.

## Radio group

### Focus and keyboard

Asked: how focus lands in a group, and what the arrow keys do.

`Tab` lands on the checked item, not the first one, because the group uses a roving tabindex. The focus
ring measures `3px` of `oklab(0.42 -0.0151355 -0.198424 / 0.5)`, which is `--ring` at 50 percent. That
is wider and stronger than the button's `2px` at 30 percent, so the ring weight is not uniform across
components. `ArrowDown` selects the next item and clears the previous one. A click does the same, and a
controlled group reports the new value through `bind:value`.

### Disabled and invalid

A disabled item reports `disabled`. A disabled group leaves its items unselectable even when the click
is forced. `aria-invalid` has to be set on each item: the root does not propagate it to the items, and
the item classes read it on the item element. On a checked item the stock rule
`aria-invalid:aria-checked:border-primary` wins over `aria-invalid:border-destructive`, so an invalid
checked radio looks valid; only the unchecked items show the destructive border.

### Layout

The root class is `grid gap-3`, so `orientation="horizontal"` changes the arrow-key axis only. A
horizontal row needs a `class` override such as `flex w-auto items-center gap-4`.

### Tone coverage

Checked items paint `data-checked:bg-primary` with a `bg-primary-foreground` dot, so the group carries
the `default` tone only. It joins checkbox, switch and toggle in the shared tone gap.

### Radius, proved on the toggle

With `--radius: 0.5rem`, the fixed copy measures `4.8px` at `sm`, `6.4px` at `default` and `8px` at
`lg`. The stock `sm` row is `rounded-[min(var(--radius-md),8px)]`, which resolves to `6.4px`, so the
fixed copy is what lowers it to the selector step.
