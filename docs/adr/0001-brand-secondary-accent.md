---
status: accepted
date: 2026-11-03
---

# Map secondary and accent to daisyUI's brand tokens

Ticket 09 mapped `--secondary` and `--accent` surface-first (`base-200` and a `base-200`/`base-300` mix) because shadcn uses those names for surfaces while daisyUI uses them for brands. 0.3.0 reverses those four rows to `secondary`/`secondary-content` and `accent`/`accent-content` at the operator's request. The solid pairs pass AA (8.76 secondary; 8.17 light, 6.52 dark accent), but the components that paint with them as surfaces need the fixer's class repairs. Reverting to surface-first is the alternative and would remove both the brand look and most of the component fixes.
