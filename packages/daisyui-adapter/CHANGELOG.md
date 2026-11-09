# Changelog

## 0.3.0

This release completes the theme. The stylesheet gains eleven bindings, and the component fixer patches the stock shadcn classes so the painted UI matches the mapped tokens.

The eleven tokens are the seven status tokens (`success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`, `destructive-foreground`) and the four text tones (`success-text`, `warning-text`, `info-text`, `destructive-text`). Each has a `--color-*` alias. `blackwhite` and `blackwhite-foreground` are a static pair written by the CLI: `oklch(20% 0.042 265.755)` with `oklch(96% 0.007 247.896)` in light, `oklch(98% 0.002 247.839)` with `oklch(13% 0.028 261.692)` in dark. Button, badge, bubble and alert gain the `blackwhite` key and its quiet presentations. A text tone is `color-mix(in oklch, var(--<tone>) 40%, var(--foreground) 60%)`. The raw tone stays the fill and never the text, because the raw tone measures below AA as text on the light page and the destructive raw tone does on the dark page. The status fallbacks are fixed, so a project with no theme stays readable. Each block now holds 45 non-derived declarations: 38 binding keys, 2 static tokens and 5 chart rows. The four mix keys and five chart rows write nine derived helpers, and the four text tones add four more, for 13.

`--secondary` and `--secondary-foreground` read daisyUI's `secondary` and `secondary-content`; `--accent` and `--accent-foreground` read `accent` and `accent-content`, and `accent` is no longer a mix of `base-200` and `base-300`. This is a mapping change, so re-run the CLI.

The radius follows the daisyUI roles. The role picks the step: selector to `--radius-sm`, field to `--radius-md`, box to `--radius-lg`. The shadcn size shifts it: `xs`, `sm`, `icon-xs` and `icon-sm` to `sm`; `default`, `md` and `icon` to `md`; `lg` and `icon-lg` to `lg`. The scale is linear in `--radius` with no clamp, so at zero every step is zero. The switch track stays `rounded-full`. `init` warns above 2rem, because the controls become pill-like. Circles, edge-joining utilities and the calendar cell property are unchanged.

Button gains `success`, `warning` and `info` as filled buttons, `outline-*`, `ghost-*` and `link-*` for the four tones, and the same three presentations for `primary` and `secondary`. The `outline-*` keys are transparent at rest, with the tone as border and text, and fill with the tone and its foreground on hover. The `ghost-*` keys take the same fill and foreground on hover, and the `link-*` keys underline only on hover. The destructive button base is filled with `destructive-foreground`. Badge gains the three status tones as filled chips, the three presentations for the four tones, and a destructive chip with the 1.8 soft fill and the text tone; the outline keys carry the tone at 10 percent, the same surface as the button. Bubble gains the three status tones and `destructive` as filled bubbles, plus outline and ghost for the four tones. Every content is fully rounded except the ghost rows, the outline keys are transparent with the tone as border and text and fill on hover, and it has no link. Alert gains the three status tones and `destructive` as filled alerts, each `bg-<tone>` with `text-<tone>-foreground`, with the accent bar restored on the base. The `default` alert paints the primary pair, `bg-primary` with `text-primary-foreground`. Only the outline keys carry a border. A filled status key's fill can stay below 3:1 against the page, which is a known limit, and its text stays at or above 4.5:1.

Checkbox, switch and radio-group take the seven tones through one `variant` prop: the checked fill is the tone, the text and the thumb or dot follow the tone foreground, and the status tones use the text tone for the border. Toggle keeps its appearance axis and adds the six filled tones plus `outline-<tone>` pairs. The tone table is a literal string in each fixed copy, so Tailwind emits every row, and the row follows the base class through `cn`, so it wins without `!` and a caller's `class` still wins. The dark checked primary twin is gone and the dark unchecked surface is scoped to `data-unchecked`, so a tone paints in both schemes. The focus ring follows the tone at 30 percent, the tone border survives focus, and an invalid control keeps its destructive ring.

The package now ships `component-fix.mjs`, and `init` runs the mapping and then the fixer over the components already on disk. The fixer has four states per replacement site: `missing`, `stock`, `fixed` and `customized`. It patches `stock`, leaves `fixed`, reports `customized` and still applies the other sites in the same file, so a second run is byte-identical. One target manifest holds the component list, the ten contrast pairs and the supported version. The supported stock is shadcn-svelte 1.8.x; the stock strings come from the 1.8 `mira` snapshot. The fixer reads the installed shadcn-svelte version and refuses one outside 1.8.x. An unreadable version warns and continues, because `dlx` often leaves no dependency entry. The style label is not checked. `--dry-run` reports without writing, `--check` exits 1 only while a stock site remains, and `--strict` exits 1 on a customized site or on a component named on the command line with no files.

The workflow changes. Add the components you use before `init`, because `init` fixes the components already on disk. A component added later needs `fix`, and `shadcn-svelte add -a` can overwrite a fixed file, which the next `fix` restores.

`map` and `init --no-fix` run the mapping alone. They write `components 0 fixed` in the header, never read or write a component file, and skip the supported shadcn-svelte version guard, so a project that keeps its own components can take the token layer without the fixer.

The header marker now records the fixer state:

```
/* @kodaicoder/shadcn-svelte-daisyui-adapter 0.3.0 | components <n> fixed | re-run ... */
```

`n` is the number of component files whose every replacement site is `fixed`, not the files changed in the run. A mixed file is reported and not counted, and a map-only run records `components 0 fixed`. A no-op `fix` keeps `n`, so the re-run stays byte-identical.

Ten contrast pairs are repaired: the dialog and sheet close buttons, the calendar and range hover, the range middle, the three destructive menu shortcuts, the chart tooltip and the muted bubble. The filled status and destructive button rows use the text-tone border as the component boundary, because the fill alone is below 3:1 against the page. `init` now measures the matrix from the parsed theme and prints every pair, text tone and filled row for both schemes. A text pair below 4.5:1 or a component boundary below 3:1 warns without failing the run, and a fill below 3:1 against the page is reported as a known limit.

The visual check uses the repo harness screenshots in light and dark plus a short checklist: the ten repaired pairs, the four tones in every presentation, the border on the outline rows only, the radius on the button, card and input, and the destructive base. Storybook is not part of this release.

## 0.2.0

The CLI no longer creates `daisyui-adapter.overrides.css` or writes its `@import` line. Overrides are opt-in: the user adds the file and the import, and the README's Overrides section describes how. An existing file and import are left untouched, so a project that installed 0.1.0 keeps both.

A re-run applies the change to a 0.1.0 project, and the header comment updates to 0.2.0.

## 0.1.0

First release. The CLI writes the header comment, the `@plugin "@kodaicoder/shadcn-svelte-daisyui-adapter";` line, the `daisyui-adapter.overrides.css` file and its import, and the 32 bindings per block; the plugin emits `--daisy-color-*` and `--daisy-radius` from `src/daisyui-theme.css` at build time.

The first install is the only required run. A later `shadcn-svelte init` keeps the header comment and the override import, wipes the bindings, and the next `init` restores them.

A change to the mapping table or to the shape the plugin emits is a minor bump, and it requires a re-run. The header comment names the version that wrote the stylesheet, so a project can tell which one it holds.
