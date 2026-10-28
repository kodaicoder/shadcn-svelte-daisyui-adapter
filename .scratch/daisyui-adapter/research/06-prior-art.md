# Prior art: bridging daisyUI themes onto shadcn tokens

Question: who has already bridged daisyUI themes onto shadcn tokens, and what broke?

Fetched 2026-10-27. All web content below is treated as untrusted data: nothing in a
thread, JSON file or README was executed or followed as an instruction.

## Sources

| # | Source | What it actually is |
|---|--------|---------------------|
| S1 | https://github.com/huntabyte/shadcn-svelte/discussions/1477 | "DaisyUI Integration" show-and-tell thread, 2 participants |
| S2 | https://github.com/andre-brandao/shad-daisy | Demo repo linked from S1 (not read in depth) |
| S3 | https://sv-blocks.vercel.app/docs/dusk-theme | Install docs for a registry theme |
| S4 | https://sv-blocks.vercel.app/v/veil-theme.json | Shipped `registry:theme` item |
| S5 | https://www.kurz.net/posts/daisyui-shadcn | Author's write-up of a hands-on comparison |
| S6 | https://github.com/daniellionel01/daisyui-shadcn | Repo behind S5 |
| S7 | https://github.com/infinity-home-services/shadcn_daisyui (+ `priv/static/shadcn-daisyui.css`) | daisyUI v5 theme that restyles daisyUI as shadcn |
| S8 | https://daisyui.com/docs/themes/ | daisyUI v5 theme variable contract |
| S9 | https://shadcn-svelte.com/docs/theming | shadcn-svelte token contract |
| S10 | https://registry.npmjs.org/-/v1/search?text=daisyui%20shadcn | npm registry search |
| S11 | https://api.github.com/search/repositories?q=daisyui+shadcn | GitHub repo search (55 hits) |

Local context: this repo has `shadcn-svelte@1.7.1`, Tailwind 4, `bits-ui`, and **no daisyUI
dependency**. Dark mode is the `.dark` class via `@custom-variant dark (&:is(.dark *))` in
`src/routes/layout.css:8`. Token set in use matches S9, including the 8 `--sidebar-*` tokens.

---

## 1. shadcn-svelte discussion #1477 (S1)

### What was proposed

`andre-brandao`, 2024-11-11, in the "Show and tell" category: keep daisyUI installed as the
plugin that owns the palette, and redefine the shadcn color *names* as aliases of daisyUI
CSS variables inside the Tailwind theme config. Colors wrapped as
`oklch(var(--p) / <alpha-value>)`, and corner radii derived from `--rounded-btn`:

| shadcn token | daisyUI variable |
|---|---|
| `background` | `--b1` (base-100) |
| `foreground` | `--bc` (base-content) |
| `primary` / `primary-foreground` | `--p` / `--pc` |
| `secondary` / `-foreground` | `--s` / `--sc` |
| `accent` / `-foreground` | `--a` / `--ac` |
| `destructive` / `-foreground` | `--er` / `--erc` |
| `muted` / `-foreground` | `--n` / `--nc` (neutral) |
| `card` / `-foreground` | `--n` / `--nc` (neutral) |
| `popover` / `-foreground` | `--b2` / `--bc` |
| `border` | `--p` (primary) |
| `input` | `--s` (secondary) |
| `ring` | `--in` (info) |
| `sidebar` / `-foreground` | `--b2` / `--bc` |
| `sidebar-primary`, `sidebar-accent` | `--p`, `--pc` |
| `sidebar-border`, `sidebar-ring` | `--bc` |
| `radius-{xl,lg,md,sm}` | `--rounded-btn` ± 2 to 4px |

Same file also added `tailwindcss-animate` keyframes (`accordion-down`, `caret-blink`) and a
32-entry `daisyui.themes` list. Source: S1, first post.

In 2025-01-28 the author posted a Tailwind v4 variant: `@plugin "daisyui" { themes: winter
--default, dim --prefersdark; }` plus an `@theme` block of `--color-*` aliases pointing at
`var(--color-primary)`, `var(--color-base-100)`, etc., and a `@layer base` rule restoring
`border-color: var(--color-gray-200, currentColor)` because Tailwind v4 changed the default
border color to `currentColor`. Source: S1, first comment.

### Who used it

- The author, in `shad-daisy` (S2), linked as "Demo Repo". No statement of production use.
- `Wombosvideo` replied with their own `app.css`, and explicitly **did not use daisyUI**:
  "Does not use DaisyUI!", `hsl` colors instead of `oklch`, hand-copied values from shadcn
  `default` + `gray`. Source: S1, reply 2025-01-29.
- No third party reported adopting the mapping. Two participants total.

### Concrete problems reported in the thread

Careful reading matters here: the thread reports **no single broken component**. What it
contains is four named obstacles, all upstream of "does it look right":

1. "It might need some ajusts, if you have any that makes it look better please share it here"
   (author, on his own v4 CSS). No specific defect named. Source: S1.
2. `oklch` vs `hsl`: the mapping only works if the consumer's shadcn colors are expressed the
   same way daisyUI v4 expresses them. The author answers that `oklch` "was chosen because of
   the last version of daisyui (v4 works with tailwind v3), daisy v5 ... does not need the
   oklch anymore because of the variable changes". Source: S1, 2025-01-29.
3. Tailwind v4 default border color changed to `currentColor`, requiring a compatibility rule.
   Source: S1.
4. shadcn-svelte's own Tailwind v4 work was not done yet: "to get the best integration
   possible we will have to wait for the shadcn-svelte implementation". Source: S1.

Nothing in the thread mentions dark mode, focus rings, charts, sidebar, or a component that
rendered wrong. The thread is a config sketch, not a field report.

### Reading the mapping itself (analysis, not a reported failure)

Three entries are semantically false regardless of palette, and they are the ones a reviewer
should expect to bite:

- `muted` → `neutral`. In shadcn, `muted` is a low-contrast *surface* (`bg-muted` sits behind
  hover rows, skeletons, code blocks). In daisyUI, `neutral` is a *brand* color used for dark
  buttons and badges. In most daisyUI themes that produces a near-black panel where shadcn
  expects a 3% gray tint.
- `border` → `primary`. Every `border-border` in shadcn-svelte (cards, inputs, separators,
  table cells) would inherit the brand color, which is the opposite of shadcn's subtle border.
- `ring` → `info`. `info` is a semantic status color; focus visibility then depends on the
  theme's info hue rather than on a neutral ring.

## 2. sv-blocks: Dusk docs and the Veil theme item (S3, S4)

### How it is installed

Docs (S3) offer two paths:

1. CLI: `pnpm dlx shadcn-svelte@latest add https://sv-blocks.vercel.app/d/dusk-theme.json`.
   "The CLI updates your main CSS variables".
2. Manual: paste the token block into `themes.css` and import it from `layout.css`, "to keep
   them scoped", then apply the theme scope and container at the app root.

Notable: the registry also installs **component copies** under `ui/dusk` (button, card, input,
label), and S3 states why: "The Dusk registry keeps these four primitives isolated from your
default shadcn-svelte components." Token remapping alone was not the chosen solution for those
four.

### What the shipped item contains

`veil-theme.json` (S4) is a static `registry:theme` item:

- `dependencies`: two `@fontsource` packages. `registryDependencies`: `button`, `card`,
  `input`, `textarea` JSON items.
- `cssVars.theme`: `font-sans`, `font-serif`.
- `cssVars.light` / `cssVars.dark`: 20 literal `oklch(...)` colors each plus `radius`.
- `files`: `[]`. No `css`, no `docs`, no scripts.

**Nothing is computed from user input.** There is no input surface in the item: every value is
a literal string, the only "variables" are the two font stacks, and there is no generator,
template or placeholder. The same holds for the install docs: the token block is copied as is.
The one runtime-ish detail is that alpha is baked into the literal values themselves
(`secondary: oklch(... / 15%)`, `muted: oklch(... / 5%)`, `border: oklch(... / 7.5%)`,
`input: oklch(... / 20%)`), and light/dark are two separate literal blocks.

## 3. Other daisyUI / shadcn bridges found

### 3a. Reverse direction: restyle daisyUI to look like shadcn (S5, S6, S7)

This is the direction most people actually shipped: daisyUI stays installed and its components
are re-skinned, rather than daisyUI variables being fed into shadcn components.

**S5 write-up** (2025-04-12) is a side-by-side of the same UI in both libraries, then editing
the daisyUI theme to approach shadcn. Documented deltas, verbatim in substance:

- "Components in daisy are usually larger by default. Even the `*-sm` versions are too large to
  match the shadcn/ui default."
- "Daisy seems to use `shadow-sm`, where as shadcn uses `shadow-xs`."
- "Daisy styles 'outlined' components with a very prominent border, where as in shadcn it is
  more subtle (gray)": fixed by `base-300` instead of `neutral`.
- "Shadcn seems to have more niche colors, such as `--color-ring`."
- "Shadcn has `muted`, which I think is similar to daisy's `base`." (Note: this contradicts
  S1's `muted` → `neutral`, and S5's reading matches how `muted` is used in components.)
- Per-component fixes needed were "usually ... a `shadow-xs`, less intense border (`base-300`
  instead of `neutral`), a modified border radius and a `font-medium`".
- Explicit scope limit: "There are some fundamental differences in interactivity, composition
  and css variable usage in both libraries, that makes a 'modify this global theme and done'
  approach not feasable".

That last line is the most useful sentence in the whole corpus: it comes from someone who
tried the theme-only route and shipped the comparison.

**S7 theme file** is the mature version of this direction. Facts from the CSS itself:

- daisyUI stays installed with `themes: false`; one file declares real shadcn neutral values,
  then maps daisyUI `--color-*` onto them (`--color-base-100: var(--background)`,
  `--color-primary: var(--primary)`, `--color-base-200: var(--muted)` in dark,
  `--color-base-300: var(--border-color)` in dark).
- It must rename the border color: `--border-color: oklch(...)` with the comment "shadcn
  `--border` colour (daisyUI reserves `--border` for width)". Later: "note: daisyUI `--border`
  is a WIDTH, not the colour above".
- It adds `--color-info/success/warning` itself, with the comment "shadcn has no
  info/success/warning", and `--color-error: var(--destructive)`.
- Dark mode is doubled up: `[data-theme="shadcn-dark"], [data-theme="dark"], .dark` in one
  block, plus a `@custom-variant dark (&:where([data-theme=shadcn-dark], ... .dark ...))` in
  the consumer's CSS. Both mechanisms have to exist because daisyUI keys on `data-theme` and
  the components key on `.dark`.
- The component override layer sits in `@layer utilities`, "because daisyUI v5 emits its
  component CSS into Tailwind's `utilities` layer (the highest-priority layer). To override it
  we must live in the SAME layer and come later in source order".
- Specificity fights are documented inline: "daisyUI repaints disabled bg at specificity 0,3,0,
  so we match it with a `:not()`"; pressed buttons need `!important`; "daisyUI pins
  `.dropdown .dropdown-content` to z-index 999 at a specificity no `z-*` utility beats".
- Behaviour still needed JS: LiveView hooks for command, combobox, date picker, OTP, carousel,
  resizable, and the theme swap itself ("the transition guard is now scoped to theme swaps").
- Coverage claim: all but one of 66 shadcn-svelte components reproducible, "Questionnaire" not.

### 3b. One token source compiled to both systems

- `transtyle/transtyle` (S11): "A compiler for design systems ... compile native themes for
  eight ecosystems (Bootstrap, shadcn/ui, daisyUI, ECharts, ...)". Approach: no bridge at all,
  one W3C token source emitted twice. Only the repository description was read; no code
  verified. Low stars, so treat as a direction, not as prior validation.
- `Ideelab/uicockpit` (S11): themes Tailwind, shadcn, daisyUI and others "with one set of
  values, side by side". Same direction, also unverified.

### 3c. Claims that did not check out

- `NeoTecDigital/nui` (S11): described as "Next-generation Svelte component library with
  daisyUI foundation and shadcn-svelte API compatibility". `README.md` on `main` returns 404
  and the repo has 1 star. Unverified, do not cite as working prior art.
- `derrekdev/daisyui-shadcnui-next`, `TamjidAhmed10/nextui_shadcn_daisyui_template`,
  `zyxzb/Fashion-Corner-...` (S11): apps or templates that install **both** libraries side by
  side. No token bridge, no reported failure.

### 3d. Is there a package for this?

No. npm search for `daisyui shadcn` returns daisyUI itself, shadcn CLIs, both framework ports,
and unrelated packages. The only package that mentions both meaningfully is `arustack`, a
scaffold that installs DaisyUI *and* shadcn into one Express + React app, which is coexistence,
not conversion. Source: S10.

### Summary of the three approaches

| Approach | daisyUI installed? | Where the truth lives | Example |
|---|---|---|---|
| Alias shadcn names to daisyUI vars | yes, owns palette | daisyUI theme | S1 |
| Restyle daisyUI components from shadcn values | yes, `themes: false` | shadcn tokens | S7 |
| Emit literals into shadcn token slots | no | generated values | S3, S4 |
| Compile one token source to both | optional | a third source | transtyle |

---

## 4. Failure modes we are likely to hit

### 4.1 Missing tokens

The two contracts do not overlap cleanly (S8 vs S9).

Present in shadcn-svelte, absent in daisyUI: `ring`, `chart-1`..`chart-5`, all eight
`--sidebar-*` tokens, `card` and `popover` as separate surfaces, `input` as a border color
distinct from `border`, and `--radius` itself as a single base (daisyUI has three radius knobs).

Present in daisyUI, absent in shadcn: `info`, `success`, `warning` (plus their `-content`
partners), `neutral`, the `base-100/200/300` ladder as *three* distinct surfaces, `--size-*`,
`--border` as width, `--depth`, `--noise`.

The thread's mapping silently drops `chart-*` and invent no sidebar story beyond aliasing
`--bc` (S1). S7 has to invent `--color-info/success/warning` and patches one extra surface
(`--page-background`) to make an app shell work (S7). Expect to invent at least 14 values per
theme and to own them forever.

### 4.2 Dark-mode mismatch

Three different switchers exist in this space:

- daisyUI: `data-theme="dark"` on any element, `--prefersdark` for the media-query default,
  and themes nest (S8).
- shadcn-svelte: the `.dark` class (S9), which is what this repo uses
  (`src/routes/layout.css:8`).
- sv-blocks: whichever the consumer wires up, since the item ships bare `light`/`dark` literals
  (S4).

S7 needed both, in one selector list, plus a custom `dark` variant, and it also had to alias
`[data-theme="light"]` so a stock Phoenix toggle would not erase the theme. A converter that
emits only one of the two will half-work: the page goes dark, the components do not, or the
reverse. Also note daisyUI dark themes are not "light theme, inverted": `dim`, `night`,
`business` are separate palettes, so a converter cannot derive one from the other, it must emit
both blocks per theme.

### 4.3 Cascade conflicts

Concrete, observed:

- daisyUI v5 emits component CSS into the `utilities` layer, so overrides must be in
  `@layer utilities` after the plugin, not in `components` (S7).
- daisyUI's disabled repaint is specificity 0,3,0 and needs `:not()` to beat; pressed states
  needed `!important` (S7).
- `.dropdown-content` sits at `z-index: 999` at a specificity no `z-*` utility beats (S7).
- Tailwind v4 changed the default border color to `currentColor`, requiring a base reset (S1).

This is the failure class a token-only adapter avoids by not styling daisyUI components at
all, but it is exactly what we inherit if daisyUI stays installed next to shadcn components:
daisyUI's base layer (`:root` color-scheme, body background, border defaults) can win over
shadcn component styling without either side being obviously wrong in the CSS.

### 4.4 Values that look right as swatches and wrong on components

Ranked by how likely we are to repeat them:

1. **`muted` filled from a brand color.** S1 used `neutral`; S5 says `base`. If we follow S1,
   every hover row, skeleton, tab list and code block goes black. If we follow S5, `bg-muted`
   and `bg-accent` collapse to the same value, which is also what shadcn's own light theme does
   (both `oklch(0.97 0 0)` per S9), so it is tolerable.
2. **`border` from `primary`.** Visible on every card and input, and it is the single most
   common "why does this look like a bootstrap theme" complaint in S5's write-up.
3. **No ring.** S5 calls out `--color-ring` as a thing shadcn has and daisyUI does not. S1
   substituted `info`. The symptom is a focus state that either disappears on dark themes or
   flashes a saturated blue that belongs to no other surface.
4. **Alpha double-dipping.** Both prior arts bake alpha into the token (`/ 15%`, `/ 7.5%` in S4;
   `--input` at `15%` in S7 dark). A consumer writing `bg-muted/50` then multiplies the
   existing alpha (`color-mix` in oklab), so a token authored at 7.5% becomes 3.75%. This is
   the subtlest of the four and the hardest to spot in a diff.
5. **Geometry and depth left at daisyUI defaults.** `--depth` and `--noise` are on by default in
   daisyUI themes (S8) and have no shadcn counterpart. S5 needed `shadow-xs` instead of
   `shadow-sm`, and S7 sets `--depth: 0` plus restates shadows by hand and still has to resize
   `.btn` from 2.5rem-ish heights down to `h-9` and `.checkbox` padding from 4px to 2px.
6. **Semantic drift between the two ladders.** `base-100/200/300` is a ladder; shadcn has
   `background`, `card`/`popover`, `muted`, `accent` and `border`, which do not line up 1:1.
   S7 maps light `base-200` and `base-300` to hard-coded literals but dark `base-200` to
   `--muted` and `base-300` to `--border-color`. Any converter has to make that call per theme
   and document it, or the same token will behave differently in light and dark.

### 4.5 Non-token failures nobody solved with tokens

S5: hover and click behaviors differ and theme edits do not fix them. S7: stateful components
needed JavaScript hooks, and one component could not be reproduced at all. S3: even a pure
token theme ships four **forked** primitives rather than trusting the tokens. So the ceiling of
a token-only adapter is "shadcn components with daisyUI colors", not "shadcn UI backed by
daisyUI".

---

## What this means for the adapter

- Emit **literal values per theme**, not aliases of daisyUI variables. The two directions that
  survived contact with real apps (S4, S7) both end in literals; the alias approach (S1) was
  never reported working and its variable names did not survive daisyUI v5.
- Map `muted` from `base-200` (S5's reading), not `neutral` (S1's). Map `card` from `base-100`,
  `popover` from `base-100` or `base-200`, and keep `border` off the brand color entirely.
- Treat `ring` as a first-class output: derive it from a neutral (or from `base-content` at low
  chroma), never from `info`. Focus visibility is the cheapest thing to get right and the most
  visible thing to get wrong.
- Provide all 28 shadcn-svelte tokens (S9), including `chart-1`..`chart-5` and the eight
  `--sidebar-*` values. daisyUI themes carry no chart or sidebar concept, so mark every derived
  value as derived and pick it deterministically from the palette.
- Keep `--border` as daisyUI's width and name the color something else internally
  (`--border-color`, per S7). Do not let the two meanings share a variable in generated output.
- Emit both `light` and `dark` blocks per daisyUI theme, keyed to this repo's `.dark` class, and
  document that daisyUI's `data-theme` switcher is not wired up. Do not try to derive dark from
  light.
- Emit radius into `--radius` plus the `sm/md/lg/xl` derivations from `--radius-box` /
  `--radius-field`, and neutralise `--depth` / `--noise`. Geometry is where a "correct" color
  mapping still reads as daisyUI.
- Keep token values at full alpha, or state the rule loudly: opacity modifiers multiply baked-in
  alpha, so `bg-muted/50` is not 50%.
- Do not ship a component override layer in v1. If daisyUI is not installed, the cascade issues
  in 4.3 do not exist; if it is, we inherit `@layer utilities` fights, `!important` and
  z-index 999, which is a separate decision worth its own ticket.
- Verify by rendering the same component set side by side in light and dark (S5's method), not
  by inspecting swatches. Every failure in 4.4 is invisible in a token table and obvious on a
  card, an input and a focus ring.
