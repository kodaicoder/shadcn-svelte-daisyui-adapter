# 26: Fixer core and contrast repairs

Session IDs: ses_e5f793088ffeivY0j080ONkUda, ses_e5f7065aaffekyDJr0JhC6QYG9
Lesson: A class added mid-list needs the next token inside its stock string, or the fixed string contains its own stock and the run appends on every pass; and a close chip cannot borrow a brand surface, because no text token reaches 4.5 on a mid-lightness theme colour.
Check: code - `.scratch/daisyui-adapter/registry-26/fix.mjs` drives the real CLI over a temp copy of the nine stock components: 11 sites, 10 pairs, the four states, per-site application, a custom alias, a remapped `#app` subpath import, CRLF, add-after-init, overwrite, no-components, `init` twice byte-identical, no fixed string contained in its own stock, and the ten pairs at 4.5 or better in both schemes; `.scratch/daisyui-adapter/registry-16/smoke.mjs` stays green at 139 checks.

**What to build:** The package gains `component-fix.mjs`; `init` maps and then fixes the present components; the four states, per-site application, alias lookup, CRLF and Windows paths, no-components case; the ten contrast pairs across the nine components.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] `init` runs the map then the fixer over the components the project has added; a component that was never added is `missing` and is not an error
- [x] `fix` runs every present target; `fix <component>` runs the named ones; `--dry-run` writes nothing
- [x] The fixer reports `missing`, `stock`, `fixed` and `customized` per replacement site; it applies stock, leaves fixed, reports customized, and applies the other sites in the same file; a second run is byte-identical
- [x] The fixer reads the `components.json` aliases, normalizes CRLF and Windows paths, and reports per file and per site
- [x] The ten contrast pairs are repaired in dialog, sheet, calendar, range-calendar, dropdown-menu, context-menu, menubar, chart and bubble: dialog/sheet close, calendar and range hover, range middle, destructive shortcuts, chart tooltip, muted bubble; each meets AA 4.5/3.0 in both schemes
- [x] The fixer unit seam covers the states, the custom alias, the CRLF input, the add-after-init case, the overwrite case and the no-components case
