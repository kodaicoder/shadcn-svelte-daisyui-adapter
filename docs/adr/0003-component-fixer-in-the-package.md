---
status: accepted
date: 2026-11-03
---

# Ship the component fixer in the adapter package

The adapter used to publish tokens only. 0.3.0 publishes `component-fix.mjs`, and `init` runs the map and then the fixer over the components the project has added; `fix [component...]` re-runs it. The fixer patches stock shadcn classes (contrast, radius, status and combined variants), reads the `components.json` aliases, is idempotent, skips missing or non-stock files, and supports `--dry-run`. The workflow changes: `shadcn-svelte add <components you use>` must come before `init`. The rejected alternative was a repo-only script plus README rules; the operator wants the published adapter to fix the components it themes.

The fixer has four states per replacement site: missing, stock, fixed and customized. A stock-only matcher would report every already-fixed file as customized and lose idempotency, and a file-level skip would let one hand-edited class block the other sites. It supports shadcn-svelte 1.7.x with the `mira` style, reads both the style from `components.json` and the installed version, and exits with a clear message outside that pair. One target manifest holds the components, the ten contrast pairs and the supported version and style, so the fixer and the tests cannot drift apart. `--check` exits non-zero while a stock site remains; `--strict` turns a skip into an error. The CLI updates the header marker with the number of fixed components.

The cost is that the package now edits user files. The fixer matches stock strings, reports skips, and documents that `shadcn-svelte add -a` can overwrite a fixed file and require a re-run.
