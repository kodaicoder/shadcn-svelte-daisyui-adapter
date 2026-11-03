# 26: Fixer core and contrast repairs
Session IDs:
Lesson:
Check:

**What to build:** The package gains `component-fix.mjs`; `init` maps and then fixes the present components; the four states, per-site application, alias lookup, CRLF and Windows paths, no-components case; the ten contrast pairs across the nine components.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `init` runs the map then the fixer over the components the project has added; a component that was never added is `missing` and is not an error
- [ ] `fix` runs every present target; `fix <component>` runs the named ones; `--dry-run` writes nothing
- [ ] The fixer reports `missing`, `stock`, `fixed` and `customized` per replacement site; it applies stock, leaves fixed, reports customized, and applies the other sites in the same file; a second run is byte-identical
- [ ] The fixer reads the `components.json` aliases, normalizes CRLF and Windows paths, and reports per file and per site
- [ ] The ten contrast pairs are repaired in dialog, sheet, calendar, range-calendar, dropdown-menu, context-menu, menubar, chart and bubble: dialog/sheet close, calendar and range hover, range middle, destructive shortcuts, chart tooltip, muted bubble; each meets AA 4.5/3.0 in both schemes
- [ ] The fixer unit seam covers the states, the custom alias, the CRLF input, the add-after-init case, the overwrite case and the no-components case
