# 51: Atoms, targeted remainder
Session IDs: ses_e3bf72385ffeFALeHHC2Njjlc7
Lesson: A shared wrapper that owns the heading duplicated it when the page kept its own, and every DOM-hook check still passed.
Check: code - `drive.mjs` asserts one `h3` per scheme scope from `checkField` and `checkStates`.

**What to build:** finish the token review on the three targeted atoms that have not been reviewed:
`input`, `native-select` and `textarea`. The other five targeted atoms passed (badge, button, checkbox,
switch, toggle).

**Status:** resolved
**Labels:** review, atoms

- [x] `input`: states, sizes, disabled, invalid, readonly, focus ring, cursor; tone coverage is whatever the stock supports
- [x] `native-select`: the same checklist, plus the chevron and the option list
- [x] `textarea`: the same checklist, plus resize
- [x] each component gets a reviewer page on its own route, `/review/<component>`, so journeys stop going stale
- [x] replace the old reviewer page's five tone maps and four-times-copied scheme wrapper with one derived map and one snippet (deferred from ticket 50 item 10)
- [x] each gets a journey that drives the real control and keeps evidence
- [x] a fixed copy only where the adapter patches the component; otherwise import from `ui`
- [x] findings become tickets under this feature, never silent edits
- [x] the level closes when the operator passes all three

## Answer

Shipped `src/lib/review/` (`tones.ts`, `Scheme.svelte`, `FieldReview.svelte`, `index.ts`), the three
routes under `/review`, and a journey per route. `/` now reads one tone record and one `Scheme`
wrapper; its swatch markup is one local snippet. `input` and `textarea` import from `ui` because the
fixer reports their stock and fixed strings as identical. `native-select-fixed` holds only the patched
`native-select.svelte` and re-exports its option and optgroup from `ui`; the patch is one insertion,
`data-[size=sm]:rounded-sm`.

Gates: `pnpm check` 0 errors and 0 warnings; `pnpm test:adapter` 13/13; journeys checkbox 43, switch
71, radio-group 77, toggle 63, cursor 17, input 39, native-select 39, textarea 41, all pass, with
evidence under `.verify/evidence/`. The fixed copy matches the fixer output, and `ui` plus
`src/routes/layout.css` are unchanged.

`native-select` has no `readonly` attribute, so that checklist item is `n/a: select has no readonly`.

Findings filed, not fixed: 60 disabled field cursor, 61 readonly field affordance, 62 native select
option list in the dark scheme.

Close commits: `eb928eb`, `4c9dbf2`, `615f690`, `6af11cd`, then the review-fix and bookkeeping
commits.
