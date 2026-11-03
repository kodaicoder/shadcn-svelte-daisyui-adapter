# 25: Component fixer core and contrast repairs

**What to build:** The package gains `component-fix.mjs`; `init` maps and then fixes the components the project has added; `fix` re-runs; the four states, the version and style guard, the target manifest, `--dry-run`, `--check` and `--strict`; the first fix set is the ten contrast pairs.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] `init` runs the map then the fixer over the present components; a component that was never added is `missing` and is not an error
- [ ] `fix` runs every present target; `fix <component>` runs the named ones; `--dry-run` writes nothing
- [ ] The fixer reports `missing`, `stock`, `fixed` and `customized` per replacement site; it applies stock, leaves fixed, reports customized, and applies the other sites in the same file; a second run is byte-identical
- [ ] The fixer reads the `components.json` aliases and the installed shadcn-svelte 1.7.x with the `mira` style; an unsupported pair exits with a clear message
- [ ] One target manifest holds the components, the ten contrast pairs and the supported version and style; the fixer and the tests read it
- [ ] `--check` exits 0 for fixed, customized and never-added, and non-zero only for stock; `--strict` errors on customized and on a named missing component
- [ ] The header marker records the fully fixed count (every site fixed); a mixed file is not counted; a no-op `fix` keeps the number
- [ ] The ten contrast pairs meet AA in both schemes; the text and border pairs are checked; the fill-vs-page pair is recorded as a known limit
- [ ] The fixer unit seam covers the states, the custom alias, the CRLF input, the add-after-init case, the overwrite case and the no-components case
