# 32: Workflow, docs and version
Session IDs: ses_e5b5cfdebffeqGqeFL989VZU7q
Lesson: Documentation sits outside every seam, so a release that changes behavior and counts leaves the shipped install contract at the previous version until a reader follows it.
Check: process - ticket 34's release DoD verifies the changelog and version match, and `.audit/32-workflow-docs.todo.md` records the header/version check and the eight seam counts.
Closeout:

**What to build:** The install contract and the docs describe the `add` prerequisite and the `init`/`fix` order, and the version and header marker are 0.3.0.

**Blocked by:** 26, 27, 28, 29, 30, 31

**Status:** resolved

- [x] The README describes `shadcn-svelte add` before `init` and the `fix` order
- [x] The CHANGELOG records 0.3.0 with the tokens, radius, variants, fixer and workflow
- [x] The header marker and the install command name 0.3.0; the package version is 0.3.0
- [x] The marker's fully fixed count and the mixed-file report are documented
- [x] A fresh reader can follow the docs without a missing step
