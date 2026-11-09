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

Checkbox, switch, radio-group and toggle now take the seven tones through one `variant` prop. `default` is the primary pair; the others are `secondary`, `success`, `warning`, `info`, `destructive` and `blackwhite`. Toggle keeps its appearance axis, so its keys are the seven filled tones, `outline`, and `outline-<tone>` for the six non-default tones. None of the four has a second appearance axis: daisyUI offers colour modifiers only.

Measured on the reviewer page on 2026-11-06. The fill is the same on a checked checkbox, a checked switch and a checked radio, and on a pressed toggle. The border is the checked control border; the text is the tone foreground.

| tone | fill light | fill dark | border light | border dark |
| --- | --- | --- | --- | --- |
| `default` | `oklch(0.42 0.199 265.638)` | `oklch(0.5 0.11 240.79)` | same as fill | same as fill |
| `secondary` | `oklch(0.81 0.111 293.571)` | `oklch(0.7 0.183 293.541)` | same as fill | same as fill |
| `success` | `oklch(0.79 0.209 151.711)` | `oklch(0.76 0.177 163.223)` | `oklch(0.436 0.1376 205.21)` | `oklch(0.856 0.0744 224.008)` |
| `warning` | `oklch(0.79 0.184 86.047)` | `oklch(0.82 0.189 84.429)` | `oklch(0.436 0.1276 178.944)` | `oklch(0.88 0.0792 336.49)` |
| `info` | `oklch(0.74 0.16 232.661)` | `oklch(0.74 0.16 232.661)` | `oklch(0.416 0.118 237.59)` | `oklch(0.848 0.0676 251.783)` |
| `destructive` | `oklch(0.5 0.213 27.518)` | `oklch(0.5 0.213 27.518)` | `oklch(0.32 0.1392 299.533)` | `oklch(0.752 0.0888 313.726)` |
| `blackwhite` | `oklch(0.2 0.042 265.755)` | `oklch(0.98 0.002 247.839)` | same as fill | same as fill |

| tone | text light | text dark |
| --- | --- | --- |
| `default` | `oklch(0.98 0.016 73.684)` | `oklch(0.98 0.016 73.684)` |
| `secondary` | `oklch(0.25 0.09 281.288)` | `oklch(0.26 0.007 34.298)` |
| `success` | `oklch(0.27 0.072 132.109)` | `oklch(0.37 0.077 168.94)` |
| `warning` | `oklch(0.28 0.066 53.813)` | `oklch(0.41 0.112 45.904)` |
| `info` | `oklch(0.29 0.066 243.157)` | `oklch(0.29 0.066 243.157)` |
| `destructive` | `oklch(0.97 0.013 17.38)` | `oklch(0.97 0.013 17.38)` |
| `blackwhite` | `oklch(0.96 0.007 247.896)` | `oklch(0.13 0.028 261.692)` |

The status borders are the text tones, so they inherit the hue shift the badge section records: under the blue foreground a success border reads cyan and a destructive border reads purple. That is the cost of clearing 3:1 on the control boundary while the fill stays the raw tone. `default`, `secondary` and `blackwhite` use the raw tone for the border, because their raw value already clears it.

### Why the tone table is not a variant row

Each variant entry is a static string pair that the fixer writes with
`content.split(stock).join(fixed)` (`packages/daisyui-adapter/component-fix.mjs:177`), and
`renderVariantBlock` builds a cva `variant: { ... }` block (`targets.mjs:1470`). Checkbox has no cva
variant block, and a static replacement cannot choose a value at runtime. The chosen shape is a
literal `TONES` map inserted into each fixed copy's script plus `TONES[variant]` passed to `cn`, so the
key type comes from the map and Tailwind reads every row in application source. Toggle already has a
cva table, so its tones are rows in that table. All of it is written from `BINARY_SITES` in
`packages/daisyui-adapter/targets.mjs`, and the registry-44 harness proves the fixer reproduces each
committed fixed copy byte for byte.

### Parked findings

- Resolved by ticket 44: checkbox, switch and radio-group carry the seven tones, and toggle carries
  them alongside its appearance axis. The tone row is applied after the base class through `cn`, so no
  `!` is needed.
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

Decision taken on 2026-11-06: pressed takes the tone, a pressed hover takes the tone at 80 percent, and
invalid gains a 2px ring. The unpressed hover went through `muted`, `muted` at 20 percent and the tone at
10 percent before the operator settled on the tone at 20 percent, which reads in both schemes. Measured
on the fixed copy:

| state | resolved |
| --- | --- |
| unpressed, hover (light, success) | `oklab(0.79 -0.184039 0.0990491 / 0.2)` |
| unpressed, hover (dark, success) | `oklab(0.76 -0.169466 0.0510906 / 0.2)` |
| pressed, idle | `oklch(0.42 0.199 265.638)`, text `oklch(0.98 0.016 73.684)` |
| pressed, hover | same primary at 80 percent alpha |
| invalid, `default` variant | `2px` ring of `oklab(0.5 0.188902 0.0984118 / 0.2)` |
| pressed `outline` border | primary, so the border follows the fill |

`muted` is `--color-base-200`, one step from the page background, so its washes were too quiet. The tone
at 20 percent carries hue as well as lightness, which is what makes the hover visible on both pages.

`outline-secondary` needed one extra rule on press. The rest state sets `dark:text-secondary`, which
outranks a single-variant `aria-pressed:text-secondary-foreground`, so the label vanished into the fill
in dark. The pressed state now also declares `dark:aria-pressed:text-secondary-foreground`. Measured
pressed: text `oklch(0.25 0.09 281.288)` on `oklch(0.81 0.111 293.571)` in light, and
`oklch(0.26 0.007 34.298)` on `oklch(0.7 0.183 293.541)` in dark.

The change lives in `src/lib/components/toggle-fixed/toggle.svelte` and in `toggle-pressed`
(`packages/daisyui-adapter/targets.mjs`), so `init.mjs fix toggle` reproduces it. Toggle is the one
binary control that already has a `variant` prop, so the tone seam serves a component with an existing
appearance axis: the pressed paint stays in the base, and a tone row overrides it with the same
`aria-pressed:` variants.

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

A checked item paints the `variant` tone through `data-checked:`, and the dot follows the tone
foreground from the item. `default` is the primary pair, so a group with no `variant` still paints
`bg-primary` with a `bg-primary-foreground` dot.

### Radius, proved on the toggle

With `--radius: 0.5rem`, the fixed copy measures `4.8px` at `sm`, `6.4px` at `default` and `8px` at
`lg`. The stock `sm` row is `rounded-[min(var(--radius-md),8px)]`, which resolves to `6.4px`, so the
fixed copy is what lowers it to the selector step.

### Focus ring follows the tone

The stock base carries `focus-visible:border-ring` and `focus-visible:ring-ring/30`, so a focused
control painted with a tone used to show a primary border and a primary ring. Measured on a focused
success checkbox before the change: fill `oklch(0.79 0.209 151.711)`, border
`oklch(0.42 0.199 265.638)`, ring the primary at 30 percent.

The base now drops both classes, the ring width stays, and every tone row declares its own ring at 30
percent of the tone itself, not the text token. Measured after the change, light scheme:

| tone | ring |
| --- | --- |
| default | `oklab(0.42 -0.0151355 -0.198424 / 0.298)` |
| secondary | `oklab(0.81 0.0443873 -0.101739 / 0.291)` |
| success | `oklab(0.79 -0.184039 0.0990491 / 0.291)` |
| warning | `oklab(0.79 0.0126846 0.183562 / 0.291)` |
| info | `oklab(0.74 -0.0970448 -0.12721 / 0.291)` |
| destructive | `oklab(0.5 0.188902 0.0984118 / 0.291)` |
| blackwhite | `oklab(0.2 -0.00310889 -0.0418848 / 0.291)` |

The border keeps its tone on focus, and an invalid control still paints the destructive ring at 20
percent in light and 40 percent in dark. Secondary is the one border that is not the tone in both
schemes: `--secondary-foreground` is dark in light and in dark, so the border uses it on a light page
and the tone itself on a dark one. Measured `oklch(0.25 0.09 281.288)` in light and
`oklch(0.7 0.183 293.541)` in dark. The `30` percent ring measures low against the page, which a WCAG
2.4.11 review of the focus indicator would flag; the width and alpha were kept and recorded rather than
changed in this ticket.

### Switch and radio keep the tone off the track

Asked: should a checked switch or radio fill its track with the tone. No. The tone belongs to the thumb
or dot and the border, and the track stays quiet, so the sphere reads as the state instead of the whole
control.

Measured on the switch, light scheme:

| tone | track | border | thumb |
| --- | --- | --- | --- |
| default | `oklab(0.42 -0.0151355 -0.198424 / 0.1)` | `oklch(0.42 0.199 265.638)` | `oklch(0.42 0.199 265.638)` |
| success | `oklab(0.79 -0.184039 0.0990491 / 0.1)` | `oklch(0.436 0.1376 205.21)` | `oklch(0.79 0.209 151.711)` |

Dark scheme resolves the same tokens, so `success` measures a `oklab(0.76 -0.169466 0.0510906 / 0.1)`
track, `oklch(0.856 0.0744 224.008)` border and `oklch(0.76 0.177 163.223)` thumb.

The radio group follows the same paint from 2026-11-09: a 10 percent wash on the track, the tone border,
the dot in the tone, and the checked text colour in the tone, so the base's primary foreground no longer
applies. Measured for `success` in light: track `oklab(0.79 -0.184039 0.0990491 / 0.1)`, border
`oklch(0.436 0.1376 205.21)`, dot and text `oklch(0.79 0.209 151.711)`. The showcase renders an unchecked
item beside each checked one, so the unchecked border and surface are visible per tone.

A tone thumb or dot on a 10 percent tone track separates more in dark than in light, because the wash
over a dark page is near-black. The border carries the component boundary, so the fill can stay quiet.
