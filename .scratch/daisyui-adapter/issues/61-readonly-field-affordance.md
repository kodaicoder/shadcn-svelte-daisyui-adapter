# 61: A readonly field looks editable
Session IDs:
Lesson:
Check:

**What to build:** give `readonly` a visible state, or record that the stock has none and the review
accepts it. `input` and `textarea` render a readonly field with the same border, surface, opacity and
cursor as an editable one, so only the DOM attribute tells them apart.

**Status:** resolved
**Labels:** review, atoms, finding
**Blocked by:** None

Found in ticket 51. Measured on `/review/input` and `/review/textarea` in both schemes: the readonly
control matches `[data-case="base"]` on `border-top-color`, `background-color`, `opacity: 1` and
`cursor: text`. The stock shadcn class has no `readonly:` rule.

- [ ] Choose a token for a readonly surface, or a written decision that no rule ships
- [ ] Apply it to `input` and `textarea` through the adapter target table, not by editing `ui`
- [ ] The journey checks the chosen state instead of "not dimmed"
- [ ] `docs/component-color-usage.md` records the choice

## Answer

Resolved in ticket 51. eadonly stays focusable, paints a muted surface through ead-only:enabled:bg-muted/50, and uses cursor: default; the field journey asserts the surface, the cursor and that focus lands on the control.
