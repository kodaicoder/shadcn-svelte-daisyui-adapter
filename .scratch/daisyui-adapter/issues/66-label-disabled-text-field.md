# 66: A label for a disabled text field keeps the default cursor

**What to build:** the field components carry `peer`, so the label rules that already exist reach them. A
label with `for` pointing at a disabled `input`, `textarea` or `native-select` should compute
`cursor: not-allowed` and `opacity: 0.5`, the way it already does for `checkbox`, `switch` and
`radio-group`.

**Status:** ready-for-agent
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

- [ ] `input`, `textarea` and `native-select` carry `peer` through the fixer's class strings, not by hand
- [ ] `ui` and `src/routes/layout.css` stay stock and `drift` stays green
- [ ] the `label` journey asserts `not-allowed` and `0.5` for `disabled-input-sibling`
- [ ] the operator passes the `label` page again

## Why the fix belongs in the field components

The label cannot reach a control that is not its descendant or a sibling, so `for` association is
invisible to CSS. `peer` on the control is the only lever, and it has to live in the generated copies
so a `fix` run restores it.
