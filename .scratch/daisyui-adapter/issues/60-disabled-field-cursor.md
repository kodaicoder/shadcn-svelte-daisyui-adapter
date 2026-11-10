# 60: A disabled field hides its not-allowed cursor

**What to build:** make the disabled cursor hint reachable, or remove it. `input` and `native-select` set
`disabled:cursor:not-allowed` on the same element that carries `disabled:pointer-events-none`, so the
element never receives the hover that would show the cursor. `textarea` sets no `pointer-events-none`,
so it is the only one of the three whose hint works.

**Status:** ready-for-agent
**Labels:** review, atoms, finding
**Blocked by:** None

Found in ticket 51. Measured on `/review/input`, `/review/native-select` and `/review/textarea` in both
schemes: the disabled control computes `cursor: not-allowed`, but `input` and `native-select` also
compute `pointer-events: none` on that same element, and `native-select` dims through its wrapper. A
user who hovers a disabled input or select sees the page cursor, not the hint. The ticket 49 fix for the
button and toggle removed `pointer-events-none` for exactly this reason.

- [ ] Decide the contract: either every disabled field shows `not-allowed`, or none claims it
- [ ] `input`, `native-select` and `textarea` agree
- [ ] The journeys assert the contract that `drive.mjs checkField` reads today
- [ ] `docs/component-color-usage.md` records the choice
