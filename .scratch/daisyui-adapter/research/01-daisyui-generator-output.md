# daisyUI v5 theme generator output inventory

Question: what exactly does the daisyUI v5 theme generator emit, and what does each token mean?

Fetched 2026-10-27 against the daisyUI repo at tag `v5.7.50` (master) and daisyui.com
(site header reads `5.7.50`). All fetched content is treated as untrusted data: nothing in a
page, source file or code comment was executed or followed as an instruction.

Where the docs and the source disagree, the source wins and the disagreement is called out.

## Sources

| # | Source | What it actually is |
|---|--------|---------------------|
| S1 | `packages/docs/src/routes/(routes)/theme-generator/+page.svelte` | Generator UI. Contains `generateCSS()`, the only emitter. |
| S2 | `packages/docs/src/routes/(routes)/theme-generator/+page.server.js` | Emitted key order, allowed slider values, built-in theme loading. |
| S3 | `packages/docs/src/lib/themeGeneratorValidation.js` | Generator-side name/value validation (client only). |
| S4 | `packages/docs/src/lib/themeGeneratorCssParser.js` | The generator's own round-trip parser for pasted CSS. |
| S5 | `packages/daisyui/functions/themePlugin.js` | `@plugin "daisyui/theme"` runtime (v5). |
| S6 | `packages/daisyui/functions/pluginOptionsHandler.js` | `@plugin "daisyui" { themes: ... }` runtime, flag handling, default list. |
| S7 | `packages/daisyui/src/themes/light.css`, `dark.css` | Built-in token values (what the generator loads for light/dark). |
| S8 | `packages/daisyui/src/components/{button,input,checkbox,badge,card,modal,tab}.css` | How components consume the tokens. |
| S9 | https://daisyui.com/docs/themes/ | Themes docs: block shape, `themes:` list, flags, customising built-ins, CDN form. |
| S10 | https://daisyui.com/docs/colors/ | Colour names and what each is for. |
| S11 | https://daisyui.com/docs/v5/ | 5.0 release notes, including the v4→v5 theme rename table. |
| S12 | https://v4.daisyui.com/docs/themes/, https://v4.daisyui.com/docs/colors/ | v4 theme syntax and v4 short variable names. |
| S13 | `packages/daisyui/functions/themePlugin.test.js` | Pins the `color-scheme: normal` fallback and name escaping. |
| S14 | `packages/daisyui/functions/variables.js` | `rounded-*` utility → `--radius-*` aliases. |
| S15 | `packages/daisyui/src/base/{properties,rootcolor,reset}.css` | Proof that base ships **no** token defaults. |

Two paths exist and both matter: `@plugin "daisyui" { themes: ... }` (S6) selects built-in themes,
and `@plugin "daisyui/theme" { ... }` (S5) defines one. They produce the same selector shape.

---

## 1. What the generator emits

`generateCSS(theme)` (S1:349-374) is the whole emitter. It returns one string:

```text
\n@plugin "daisyui/theme" {
  name: "<name>";
  default: <true|false>;
  prefersdark: <true|false>;
  color-scheme: "<light|dark>";
  <20 --color-* lines, in the order below>
  --radius-selector: <value>;
  --radius-field: <value>;
  --radius-box: <value>;
  --size-selector: <value>;
  --size-field: <value>;
  --border: <value>;
  --depth: <value>;
  --noise: <value>;
}
```

Facts that come straight off that function:

- Output starts with a newline before `@plugin` and ends with `}\n` (S1:373). No blank lines inside.
- No comments are emitted, ever.
- `name` and `color-scheme` are emitted **with double quotes**; `default`/`prefersdark` as bare
  `true`/`false`; every token as `key: value;` (S1:351-371).
- `name` is `.trim()`-ed (S1:351). Values are written verbatim, no formatting or unit conversion.
- Key order is fixed: metadata, then the 20 colour keys in `orderedColorKeys` order (S2:90-111),
  then `--radius-selector`, `--radius-field`, `--radius-box` (S1:361), then `--size-selector`,
  `--size-field`, `--border` (S1:365), then `--depth`, `--noise` (S1:369).
- Any key whose value is falsy is skipped (`.filter((key) => theme[key])`), so an empty string drops
  the line. Themes made in the UI always get all 28 variables (`randomizeThemeColors` seeds every
  key, S1:405-410), but the URL-parameter import path (S1:156-190) can build a *partial* theme,
  which then copies out partial. A parser cannot assume completeness.
- `--border` sits in the "size" group, after `--size-field`, not with the radius group.

The copy button writes `themeCSS` verbatim (S1:313-316 → `ThemeCSSModal.svelte`), so what is on the
clipboard is exactly the string above, for exactly one theme.

## 2. Token inventory

28 custom properties plus 4 metadata keys = 32 keys per block. Values below are the built-in
`light` and `dark` values the generator loads (S7); a generated theme of the same scheme only
differs in the values, not the key set.

### Metadata (4)

| Key | Kind | light | dark | Meaning |
|---|---|---|---|---|
| `name` | string (quoted) | `"light"` | `"dark"` | Theme id: selector `[data-theme="<name>"]` and the theme-controller radio value (S5:22, S9). |
| `default` | flag (bool) | `false` | `false` | Adds `:where(:root)` to the selector, making it the root theme (S5:23-26). |
| `prefersdark` | flag (bool) | `false` | `false` | Emits an extra `@media (prefers-color-scheme: dark)` rule on `:root:not([data-theme])` (S5:45-52). |
| `color-scheme` | string (quoted), `"light"` or `"dark"` | `"light"` | `"dark"` | Written as the real CSS `color-scheme` property on the theme selector: browser-drawn UI (scrollbars, form controls). Docs tooltip: "Color of browser-provided UI" (S1:1082, S9). |

### Colours (20) — emitted in this exact order

All are CSS `<color>` values. Generator normalises nothing; built-ins use `oklch()`, any CSS colour
format is accepted (S11: automatic conversion was removed in v5).

| Token | Kind | light | dark | Meaning (S9, S10) |
|---|---|---|---|---|
| `--color-base-100` | colour | `oklch(100% 0 0)` | `oklch(25.33% 0.016 252.42)` | Page/base surface, blank backgrounds. |
| `--color-base-200` | colour | `oklch(98% 0 0)` | `oklch(23.26% 0.014 253.1)` | Base shade for elevation. |
| `--color-base-300` | colour | `oklch(95% 0 0)` | `oklch(21.15% 0.012 254.09)` | Deeper elevation shade. |
| `--color-base-content` | colour | `oklch(21% 0.006 285.885)` | `oklch(97.807% 0.029 256.847)` | Foreground on base. |
| `--color-primary` | colour | `oklch(45% 0.24 277.023)` | `oklch(58% 0.233 277.117)` | Main brand colour. |
| `--color-primary-content` | colour | `oklch(93% 0.034 272.788)` | `oklch(96% 0.018 272.314)` | Foreground on primary. |
| `--color-secondary` | colour | `oklch(65% 0.241 354.308)` | same | Optional secondary brand colour. |
| `--color-secondary-content` | colour | `oklch(94% 0.028 342.258)` | same | Foreground on secondary. |
| `--color-accent` | colour | `oklch(77% 0.152 181.912)` | same | Optional accent. |
| `--color-accent-content` | colour | `oklch(38% 0.063 188.416)` | same | Foreground on accent. |
| `--color-neutral` | colour | `oklch(14% 0.005 285.823)` | same | Desaturated UI parts. |
| `--color-neutral-content` | colour | `oklch(92% 0.004 286.32)` | same | Foreground on neutral. |
| `--color-info` | colour | `oklch(74% 0.16 232.661)` | same | Informational state. |
| `--color-info-content` | colour | `oklch(29% 0.066 243.157)` | same | Foreground on info. |
| `--color-success` | colour | `oklch(76% 0.177 163.223)` | same | Success state. |
| `--color-success-content` | colour | `oklch(37% 0.077 168.94)` | same | Foreground on success. |
| `--color-warning` | colour | `oklch(82% 0.189 84.429)` | same | Warning state. |
| `--color-warning-content` | colour | `oklch(41% 0.112 45.904)` | same | Foreground on warning. |
| `--color-error` | colour | `oklch(71% 0.194 13.428)` | same | Error/destructive state. |
| `--color-error-content` | colour | `oklch(27% 0.105 12.094)` | same | Foreground on error. |

There is no `--color-*` token for borders, inputs, rings, cards, popovers, muted surfaces or charts.
Those are derivations in daisyUI, not tokens.

Note the asymmetry: `light` and `dark` differ only in `base-*`, `primary`, `primary-content` and
`color-scheme` (S7). The state colours are identical in both built-ins, and `dark`'s `base-200/300`
are darker than `base-100`.

### Lengths (6) and unitless numbers (2)

| Token | Kind | light = dark | Valid values | Meaning |
|---|---|---|---|---|
| `--radius-selector` | length | `0.5rem` | docs "preferred": `0rem, 0.25rem, 0.5rem, 1rem, 2rem`; generator also accepts `0.125rem`, `0.75rem` | Radius for small selectors: checkbox, toggle, badge (S9, S3) |
| `--radius-field` | length | `0.25rem` | same | Radius for fields: button, input, select, tab (S9) |
| `--radius-box` | length | `0.5rem` | same | Radius for boxes: card, modal, alert (S9) |
| `--size-selector` | length | `0.25rem` | `0.1875 / 0.21875 / 0.25 / 0.28125 / 0.3125rem` | Base size of checkbox, toggle, badge (S9) |
| `--size-field` | length | `0.25rem` | same | Base size of button, input, select, tab (S9) |
| `--border` | length | `1px` | `0.5px, 1px, 1.5px, 2px` | Border width of all components (S9) |
| `--depth` | number, `0` or `1` | `1` | `0`/`1` | Binary: adds shadow/3D depth (S9) |
| `--noise` | number, `0` or `1` | `0` | `0`/`1` | Binary: adds grain texture (S9) |

"Valid values" are the docs' preferred list and the generator's slider/regex set (S2:15-52,
S3:3-7). **The plugin does not validate any of them** (S5 has no checks at all), so a
hand-written block can carry any CSS value and daisyUI will emit it as-is. Treat these ranges as
advisory.

## 3. How the six scale tokens reach components

Confirmed from component source (S8):

| Token | Consumed by | Formula / effect |
|---|---|---|
| `--size-field` | `.btn` | `--size: calc(var(--size-field, 0.25rem) * 10)` → 2.5rem tall. Size modifiers multiply differently: `btn-xs` ×6, `btn-sm` ×8, `btn-md` ×10, `btn-lg` ×12, `btn-xl` ×14. |
| `--size-field` | `.input` | `calc(var(--size-field, 0.25rem) * var(--in-size-mul, 10))` → 2.5rem tall. |
| `--size-field` | `.tab` | `--tab-height: calc(var(--size-field, 0.25rem) * 10)`. |
| `--size-selector` | `.checkbox` | `--size: calc(var(--size-selector, 0.25rem) * 6)` → 1.5rem square. |
| `--size-selector` | `.badge` | default ×6; `badge-xs` ×4, `-sm` ×5, `-md` ×6, `-lg` ×7, `-xl` ×8. |
| `--radius-field` | `.btn`, `.input`, `.tab` | `border-*-radius: var(--join-ss, var(--radius-field))` / `border-radius: var(--radius-field)`. Tab also caps with `min(var(--radius-field), ...)`. |
| `--radius-selector` | `.checkbox`, `.badge` | `@apply rounded-selector` → `var(--radius-selector)` (alias in S14). |
| `--radius-box` | `.card`, `.modal` | `@apply rounded-box` and `var(--modal-tl, var(--radius-box))` (alias in S14). |
| `--border` | most components | `border-width: var(--border)` / `border: var(--border) solid …`; badge padding is `calc(var(--size) / 2 - var(--border))`. |
| `--depth` | shadows | Multiplied into `color-mix()`/`oklch()` alpha: `calc(var(--depth) * 5%)`, `* 30%`, etc. |
| `--noise` | background texture | `background-size: auto, calc(var(--noise) * 100%)` with `--fx-noise` image. |

Fallback behaviour differs and this matters:

- `--size-field` / `--size-selector` have an inline fallback (`0.25rem`) in the `calc()`, so their
  absence still produces a working height.
- `--radius-*`, `--border`, `--depth`, `--noise` have **no** fallback in the component rules, and
  base ships no defaults (S15: `properties.css` registers only `--radialprogress` and
  `--aura-angle`; `rootcolor.css` only wires `--root-bg`). If a token is missing, declarations such
  as `border-radius: var(--radius-box)` become invalid at computed-value time and fall back to the
  CSS initial value (`0`), not to a daisyUI default. The one rescue is inheritance: custom properties
  inherit, so a partial theme applied under `[data-theme]` picks up whatever the root theme defines.
  A partial theme that *is* the root theme has nothing to inherit from, and renders square/borderless.

## 4. `default`, `prefersdark`, `color-scheme` at runtime

From the theme plugin (S5:10-52) and the options handler (S6:9, S6:22-39):

- Selector for every theme, always:
  `:root:has(input.theme-controller[value="<name>"]:checked),[data-theme="<name>"]`.
  Name is CSS-escaped, so spaces and quotes survive (`themePlugin.test.js` pins
  `brand "theme\name` → `brand\20 \22 theme\5c name`, S13).
- `default: true` prepends `:where(:root),` to that selector. `:where()` gives it zero specificity,
  so any `[data-theme]` rule still wins, and the theme applies at the root when nothing else does.
- `prefersdark: true` adds, in addition, an `@media (prefers-color-scheme: dark)` rule on
  `:root:not([data-theme])` (or `root:not([data-theme])` when `root` is customised). The
  `:not([data-theme])` matters: once an explicit theme is set, prefers-dark no longer applies.
- `color-scheme` is emitted as a plain CSS declaration on the theme selector. Fallback when absent:
  `normal` (S5:40, S13), or, if `name` matches a built-in theme, that built-in's value (S5:30-36).
  It does not select the theme; it tells the browser how to render its own UI. It also does not drive
  Tailwind's `dark:` variant: the docs show a hand-written
  `@custom-variant dark (&:where([data-theme=night], [data-theme=night] *))` for that (S9).
- Name collision is a feature, not an error: if `name` matches a built-in, the built-in tokens are
  merged first and the block's tokens override them (S5:30-36, documented in S9 "How to customize an
  existing theme"). For a *new* name there is no merge, so omitted tokens stay omitted.

**Is exactly one `default` required?** No. Nothing validates it, in the plugin (S5), the options
handler (S6) or the generator's validator (S3: `validateThemeStructure` checks types and value
ranges only, never `default` counts). Consequences, read off the code and the cascade:

- `default: false` on every theme is legal. Result: no theme is applied at `:root`; colours appear
  only under an explicit `[data-theme]` / theme-controller. The generator's UI happily allows this
  (one independent checkbox per theme, S1:1047-1051).
- Two themes both `default: true` is legal too. Both emit `:where(:root)`, so the later rule in the
  stylesheet wins at the root. Emission order, not a flag, decides. (The docs never state a rule
  here; this is from the emitted selectors plus normal cascade order, so treat the "last wins" part
  as inferred rather than documented.)
- If the `themes:` option is omitted entirely, the plugin defaults to
  `["light --default", "dark --prefersdark"]` (S6:9), which is why a stock install always has
  exactly one default and one prefers-dark theme.

## 5. One block or two, naming, and count

- **One theme per copy, never a pair.** `openThemeCSSModal()` calls `generateCSS(currentTheme)` for
  the single selected theme (S1:313-316); the modal displays and copies that string. The generator
  holds many themes in `localStorage` and in the URL hash but has no "export all" path (no
  download/export code in S1). A file containing a light block and a dark block is two pastes, not
  one generator output.
- **No light/dark pairing metadata exists.** There is no `pairedWith`, no `darkTheme` key. Pairing in
  daisyUI is expressed only by flags: `default` for the root/light theme, `prefersdark` for the
  OS-dark fallback, and `themes: light --default, dark --prefersdark` for built-ins (S6, S9).
  Nothing in the file says "these two belong together".
- **Names are free-form.** The generator's name input is a plain text field (S1:621-628) validated
  only client-side by `/^[a-z][a-z0-9- ]{1,18}[a-z0-9]$|^[a-z]{3,20}$/` (lowercase start, 3-20
  chars, letters/digits/hyphen/space, S3:2). The plugin accepts any string and escapes it (S5:4-8).
  Practical consequences: mixed case or names over 20 chars are rejected by the generator UI but
  work in CSS; renaming a block to a built-in name (`light`, `dark`, `cupcake`) silently means
  "override that built-in and inherit the rest".
- **More than two themes in one file:** only if the user pastes several blocks. The generator itself
  emits exactly one block per copy, and the `themes:` list is a separate, hand-written line.

## 6. v4 versus v5 syntax

v4 (S12) and v5 (S9, S11) share nothing syntactically:

| Aspect | v4 | v5 |
|---|---|---|
| Where | `tailwind.config.js` → `daisyui: { themes: [...] }` | CSS: `@plugin "daisyui" { themes: … }` and `@plugin "daisyui/theme" { … }` |
| Custom theme | object in JS: `{ mytheme: { primary: "#a991f7", … } }` | CSS block with `name`, `default`, `prefersdark`, `color-scheme` |
| Colour keys | short vars `--p --pc --s --sc --a --ac --n --nc --b1 --b2 --b3 --bc --in --inc --su --suc --wa --wac --er --erc` | `--color-primary`, `--color-primary-content`, … (full table in S11) |
| Colour values | used as `oklch(var(--p))`, so the stored value had to be raw OKLCH channels | any full CSS colour (`oklch()`, `hex`, `rgb()`, named); no build-time conversion (S11) |
| Missing `*-content` | auto-derived from the background colour ("will be a readable tone of primary") | **not** derived; the key must be present (S11) |
| Radius | `--rounded-box`, `--rounded-btn`, `--rounded-badge`, `--tab-radius` | `--radius-box`, `--radius-field`, `--radius-selector` (S11) |
| Border | `--border-btn`, `--tab-border` | `--border` (S11) |
| Removed | `--animation-btn`, `--animation-input`, `--btn-focus-scale` | gone, no replacements (S11) |
| Added | — | `--size-selector`, `--size-field`, `--depth`, `--noise`, `color-scheme` |
| Default/prefersdark | implied by array position (first theme = default, `"dark"` = dark default) | explicit flags in the `themes:` list or in the block |
| CDN form | `[data-theme="mytheme"] { --p: …; }` | `:root:has(input.theme-controller[value=mytheme]:checked),[data-theme="mytheme"] { color-scheme: light; --color-base-100: …; }` (S9) |

Circulating v4-era snippets therefore fail in three distinct ways in v5: unknown properties
(`--p`, `--rounded-btn`), short channel values that are not valid CSS colours on their own, and
missing `--color-*-content` keys.

## 7. Non-token content a parser must tolerate

What the generator emits: a leading newline, the `@plugin` header, 32 `key: value;` lines, closing
brace. No comments, no blank lines, no trailing content (S1:373).

What a pasted file can contain anyway, all of it seen in first-party docs:

- Comments: the docs block carries `/* set as default */`, `/* border radius */`, `/* base sizes */`
  (S9). The generator never writes them.
- Unquoted `color-scheme: light;` (S9) vs the generator's quoted `color-scheme: "light";` (S1:354).
  The docs' own parser strips quotes from both `name` and `color-scheme` (S4:64-72), so both forms
  are intended to round-trip.
- Other tokens in the same block: `font-family:` appears in the official cyberpunk/wireframe snippets
  (S11), and `root`/`root:` is a plugin option (S5:16). Neither is in the 32-key inventory.
- A sibling `@plugin "daisyui";` line above the block (S9), or a `@plugin "daisyui" { themes: … }`
  block, or several theme blocks in one file.
- The CDN form: a bare selector block (`[data-theme="x"] { … }`, v4) or the `:root:has(…)` selector
  block (v5), same declarations but no `@plugin` header and no `name`/`default`/`prefersdark`.
- CRLF line endings, BOM, trailing whitespace, arbitrary key order, and values containing `;`
  inside `rgb()`/`color-mix()` are all realistic when a user pastes from an editor.
- Missing `default`/`prefersdark`/`color-scheme` entirely: legal for the plugin (name defaults to
  `custom-theme`, flags to `false`, `color-scheme` to `normal`, S5:13-17, S13).

Two data points on tolerance, and they differ:

- The **build-time plugin** is a real CSS parser (Tailwind/PostCSS), so comments inside the block,
  any key order and any CSS-valid value parse fine. It has no required-key list.
- The **generator's own importer** (S4) is a regex plus `split(";")` plus `split(":")`. It requires
  the text to match `^@plugin "daisyui/theme" \{…\}$` (multiline), reads only the first `{…}` pair,
  and does not strip comments. A `/* */` inside the block therefore breaks it, and a value containing
  `:` (e.g. a `url("…")`) mis-splits. That is a limitation of the docs tool, not of the library, but
  it is the closest thing to an official reference parser and it is naive.

## What this means for the adapter

- Parse one block at a time: the read contract is `@plugin "daisyui/theme" { … }`, one theme per
  block, and a light/dark pair means two blocks pasted into the same file. Do not look for pairing
  metadata; there is none.
- Classify by `color-scheme` first (the only reliable light/dark marker, present in every generator
  output), then use `default`/`prefersdark` only as tiebreakers, and fall back to name or file order
  when all three are absent or contradictory.
- Accept both quoting styles for `name` and `color-scheme`, values with or without quotes, arbitrary
  key order, CRLF/BOM, comments, and extra keys (`font-family`, `root`). Do not require all 28
  variables: a partial theme is a legal generator output and a legal plugin input.
- Do not assume a single default. Zero defaults, two defaults and defaults-without-prefersdark are
  all legal and all appear in real files; the adapter must never reject a pair for that.
- Expect 20 colour, 6 length and 2 numeric tokens, and nothing else, for the shadcn colour, radius
  and geometry mapping. There is no daisyUI token for border colour, ring, input, card, popover,
  muted or charts; those stay derived.
- Treat colour values as opaque strings: `oklch()`, hex, `rgb()`, named, even `var()`. v5 no longer
  converts or derives anything at build time, so no value normalisation can be assumed.
- Read `--size-*` for heights only if the adapter derives height or spacing; note the ×10
  (fields) / ×6 (selectors) convention so a 0.25rem base maps to 2.5rem and 1.5rem.
- Radius mapping is three-way and fixed: `--radius-field` → button/input/select/tab,
  `--radius-selector` → checkbox/toggle/badge, `--radius-box` → card/modal/alert. shadcn has one
  radius token, so the adapter must pick one (or expose three) and say which.
- Missing radius/border/depth/noise tokens are not benign: daisyUI has no fallback for them, so a
  root theme that omits them renders square, borderless components (a partial theme under
  `[data-theme]` only inherits them from the root theme). If the adapter defaults them, it is
  inventing values daisyUI itself would not produce; document that.
- Reject nothing silently: v4-era snippets (`--p`, `--rounded-btn`, bare OKLCH channels, missing
  `*-content`) are still in circulation and need a named error, not a partial parse.
