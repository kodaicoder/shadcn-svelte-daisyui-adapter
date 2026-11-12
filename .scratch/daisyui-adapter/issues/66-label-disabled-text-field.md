# 66: A label for a disabled text field keeps the default cursor
Session IDs: ses_e34b1b16bffezWkEKw1ZE4yFSb
Lesson: A sibling-based affordance breaks at a component wrapper; the selector must sit on the element the consumer can see, not on the control inside it.
Check: code - `checkLabelDisabled` asserts the label's not-allowed and 0.5 for the disabled input, textarea and native-select cases.

**What to build:** the field components carry `peer`, so the label rules that already exist reach them. A
label with `for` pointing at a disabled `input`, `textarea` or `native-select` should compute
`cursor: not-allowed` and `opacity: 0.5`, the way it already does for `checkbox`, `switch` and
`radio-group`.

**Status:** resolved
**Labels:** adapter, review, label, field
**Blocked by:** None

Found while closing ticket 52. `label-fixed` carries `peer-disabled:cursor-not-allowed` and
`peer-disabled:opacity-50`, but the field components never carry the `peer` class those variants
need, so the rules cannot match. Measured on `/review/label` with the associated input switched to
`disabled` at runtime: the label stayed at `cursor: default` and `opacity: 1`, while the checkbox
sibling label computed `not-allowed` and `0.5`. The input itself dims and shows `not-allowed`, so
only the label is out of step.

The spec states the rule without limiting it to the binary controls: "A label that belongs to a
disabled control shows `not-allowed` whether it is a sibling, sits under a group wrapper marked
`data-disabled="true"`, or wraps the control." The wrapping case works through `has-[:disabled]`;
the group case works through the group attribute. Only the text-field sibling is uncovered.

- [x] `input`, `textarea` and `native-select` carry `peer` through the fixer's class strings, not by hand
- [x] `ui` and `src/routes/layout.css` stay stock and `drift` stays green
- [x] the `label` journey asserts `not-allowed` and `0.5` for `disabled-input-sibling`
- [ ] the operator passes the `label` page again

## Why the fix belongs in the field components

The label cannot reach a control that is not its descendant or a sibling, so `for` association is
invisible to CSS. `peer` on the control is the only lever, and it has to live in the generated copies
so a `fix` run restores it.

`native-select` needs the lever one level up. Its `<select>` sits inside
`div[data-slot="native-select-wrapper"]`, so a label after the component is a sibling of the wrapper,
never of the select. `peer` on the inner select matched nothing; the wrapper carries `peer` and the
label gained `peer-has-[:disabled]:cursor-not-allowed` and `peer-has-[:disabled]:opacity-50`. The
label page gained a `disabled-native-select` case, measured `default` / `1` without the label rule and
`not-allowed` / `0.5` with it.

Closeout: f0c059f (tag `t66-label-disabled-text-field`), after the journey assertion in 29baa6c
Merged: none. The base branch is `develop`, which stays unmerged by rule.
