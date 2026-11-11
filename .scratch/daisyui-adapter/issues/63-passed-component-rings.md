# 63: The passed interactive components carry the 3px ring
Session IDs: ses_e3779ea3affeQXvoGAMatMLPbv
Lesson: A ring width that lives in each component's own class string drifts; one shared site helper feeding the generated fixed copies is the only source.
Check: code - the binary journeys assert `focus ring is 3px` and `invalid ring is 3px` in both schemes, and `test/drift.mjs` pins the two ring sites.

**What to build:** bring the interactive components that already passed up to the field ring
treatment. `button`, `checkbox`, `switch`, `radio-group` and `toggle` still paint a 2 px focus ring;
`radio-group` already paints a 3 px invalid ring while the others paint 2 px. Align them at 3 px for
the focus ring and the invalid ring, keep the tone colour and the 30 percent alpha, and keep the dark
scheme unchanged.

**Status:** resolved
**Labels:** adapter, review, atoms
**Blocked by:** None

Found while closing ticket 51. The fields now use a 3 px focus ring and a 3 px invalid ring; the
components passed earlier still use 2 px, so the system disagrees with itself.

- [ ] `button`, `checkbox`, `switch`, `radio-group` and `toggle` use `focus-visible:ring-3`
- [ ] the invalid ring is 3 px on every one of them; the colour stays destructive
- [ ] the tone ring colours and their 30 percent alpha are unchanged
- [ ] the adapter tables and the fixed copies change through the fixer, not by hand
- [ ] the binary journeys assert the ring width at 3 px for focus and invalid
- [ ] `ui` and `src/routes/layout.css` stay stock; drift stays green
- [ ] the operator passes the five components again on `/`
