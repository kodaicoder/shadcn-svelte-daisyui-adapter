---
status: accepted
date: 2026-11-03
---

# Map secondary and accent to daisyUI's brand tokens

Ticket 09 mapped `--secondary` and `--accent` surface-first (`base-200` and a `base-200`/`base-300` mix) because shadcn uses those names for surfaces while daisyUI uses them for brands. 0.3.0 reverses those four rows to `secondary`/`secondary-content` and `accent`/`accent-content` at the operator's request. The solid pairs pass AA (8.76 secondary; 8.17 light, 6.52 dark accent), but the components that paint with them as surfaces need the fixer's class repairs. Reverting to surface-first is the alternative and would remove both the brand look and most of the component fixes.

The 0.3.0 variants add a readable text tone. The raw status tones measure 2.52, 1.95 and 2.22 against the light page and the destructive tone 2.89 against the dark page, so the outline, ghost and link presentations use a 40/60 text tone mixed with the page foreground (8.30, 6.91, 8.24 and 13.49 light; 11.28, 13.00, 11.88 and 8.24 dark). Those numbers were measured with the fixed status fallbacks and the light-blue/dark-blue `base-content` values (`oklch(20% 0.09 240.876)` and `oklch(92% 0.006 264.531)`); a project's own values differ and `init` warns. The filled variants carry the text-tone border: the fill-vs-page pair stays below 3:1 (1.95 to 2.52 light; 2.89 for destructive dark), while the border-vs-page pair is 8.90 to 10.37 light and 8.24 to 9.68 dark, so the component boundary is the border, not the fill.
