# daisyUI generator output inventory
Session IDs:
Lesson:
Check:

Type: research
Status: resolved
Blocked by: none

## Question

What exactly does the daisyUI v5 theme generator emit, and what does each token mean?

1. The full token list of a generated light theme and a generated dark theme. Mark each as colour, length, or flag.
2. Meaning and valid range of `--radius-selector`, `--radius-field`, `--radius-box`, `--size-selector`, `--size-field`, and how daisyUI maps them onto component radii and heights.
3. What `default: true`, `prefersdark: true`, and `color-scheme` control at runtime. Is exactly one `default` required, and may two themes both be `default: false`?
4. Does the generator always emit both a light and a dark block? Can the user rename them freely? Does it ever emit more than two themes into one file?
5. daisyUI v4 versus v5 theme syntax differences, since older paste snippets still circulate.
6. Does the emitted file contain comments, blank lines, or other non-token content a parser must tolerate?

Sources: daisyui.com docs (themes, colors, theme generator), the daisyUI source for theme plugin defaults, and the v5 upgrade guide. Use the Context7 docs tools for daisyui where they resolve.

## Output

Write findings to `.scratch/daisyui-adapter/research/01-daisyui-generator-output.md`, ending with a section `## What this means for the adapter` (max 10 bullets). Then append a `## Answer` gist (max 10 lines) to this ticket file and set `Status: resolved`. Do not edit `map.md` or any other ticket.

## Answer

One block per copy, never a pair: `@plugin "daisyui/theme" { name; default; prefersdark; color-scheme; 20×--color-*; --radius-selector/field/box; --size-selector/field; --border; --depth; --noise }` = 28 variables + 4 metadata keys. Only `name` and `color-scheme` are quoted; no comments, no blank lines, one leading newline.

`color-scheme` is the only light/dark marker. `default: true` adds `:where(:root)`; `prefersdark: true` adds `@media (prefers-color-scheme: dark)` on `:root:not([data-theme])`. Neither is validated: zero defaults, or two, are legal.

`--size-field` drives button/input/tab height (×10 = 2.5rem); `--size-selector` drives checkbox/badge (×6 = 1.5rem). `--radius-field` → button/input/select/tab, `--radius-selector` → checkbox/toggle/badge, `--radius-box` → card/modal/alert. `--radius-*`, `--border`, `--depth`, `--noise` have no fallback, only inheritance from the root theme; `--size-*` falls back to 0.25rem.

v4 snippets (`--p`, `--rounded-btn`, bare OKLCH channels) do not work in v5, and v5 requires explicit `*-content` colours. Detail in [research note](../research/01-daisyui-generator-output.md).
