---
status: accepted
date: 2026-11-03
---

# Ship the component fixer in the adapter package

The adapter used to publish tokens only. 0.3.0 publishes `component-fix.mjs`, and `init` runs the map and then the fixer over the components the project has added; `fix [component...]` re-runs it. The fixer patches stock shadcn classes (contrast, radius, status and combined variants), reads the `components.json` aliases, is idempotent, skips missing or non-stock files, and supports `--dry-run`. The workflow changes: `shadcn-svelte add <components you use>` must come before `init`. The rejected alternative was a repo-only script plus README rules; the operator wants the published adapter to fix the components it themes.

The fixer has four states per replacement site: missing, stock, fixed and customized. A stock-only matcher would report every already-fixed file as customized and lose idempotency, and a file-level skip would let one hand-edited class block the other sites. It supports shadcn-svelte 1.7.x; the stock strings come from the repo's pinned components, and the fixer reads the installed version, refusing one outside 1.7.x with a clear message. The style label is not checked, because nine of the eleven sites match every 1.7.x style and an unmatched style only reports `customized`. One target manifest holds the components, the ten contrast pairs and the supported version. The repo's CI runs a drift test against the pinned stock components, so a change to a pinned file or to the manifest fails there; a dependency update enters through that snapshot. The user's machine gets the runtime guard only, and a supported-range patch with a changed class is caught when the repo's pin moves.

`--check` exits 0 when every present site is fixed, customized or a component that was never added, and non-zero only when a stock site remains. `--strict` turns a customized site and a missing component named on the command line into an error; a target that was never added is not an error. The header marker records the number of target component files whose every replacement site is in the fixed state, not the files changed in the run; a mixed file is reported as mixed and is not counted, so a no-op `fix` keeps the same count and the re-run stays byte-identical.

The cost is that the package now edits user files. The fixer matches stock strings, reports skips, and documents that `shadcn-svelte add -a` can overwrite a fixed file and require a re-run.
