---
status: accepted
date: 2026-11-03
---

# Map secondary and accent to daisyUI's brand tokens

Ticket 09 mapped `--secondary` and `--accent` surface-first (`base-200` and a `base-200`/`base-300` mix) because shadcn uses those names for surfaces while daisyUI uses them for brands. 0.3.0 reverses those four rows to `secondary`/`secondary-content` and `accent`/`accent-content` at the operator's request. The solid pairs pass AA (8.76 secondary; 8.17 light, 6.52 dark accent), but the components that paint with them as surfaces need the fixer's class repairs. Reverting to surface-first is the alternative and would remove both the brand look and most of the component fixes.

The 0.3.0 variants add a readable text tone. The raw status tones measure 2.52, 1.95 and 2.22 against the light page and the destructive tone 2.89 against the dark page, so the outline, ghost and link presentations use a 40/60 text tone mixed with the page foreground (8.30, 6.91, 8.24 and 13.49 light; 11.28, 13.00, 11.88 and 8.24 dark). The filled variants carry the text-tone border so the component boundary clears 3:1. The theme's own content colors still decide some filled pairs, so `init` warns instead of claiming AA for every theme.
