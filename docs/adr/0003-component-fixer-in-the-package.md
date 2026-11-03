---
status: accepted
date: 2026-11-03
---

# Ship the component fixer in the adapter package

The adapter used to publish tokens only. 0.3.0 publishes `component-fix.mjs`, and `init` runs the map and then the fixer over the components the project has added; `fix [component...]` re-runs it. The fixer patches stock shadcn classes (contrast, radius, status and combined variants), reads the `components.json` aliases, is idempotent, skips missing or non-stock files, and supports `--dry-run`. The workflow changes: `shadcn-svelte add <components you use>` must come before `init`. The rejected alternative was a repo-only script plus README rules; the operator wants the published adapter to fix the components it themes. The cost is that the package now edits user files, so the fixer only matches stock class strings, reports skips, and documents that `shadcn-svelte add -a` can overwrite a fixed file and require a re-run.
