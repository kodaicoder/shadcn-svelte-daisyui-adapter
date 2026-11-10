# 53: Molecules

**What to build:** review the 26 molecules. Start with the seven targeted ones, which carry the tokens:
`alert`, `bubble`, `card`, `hover-card`, `input-group`, `popover` and `radio-group`. `radio-group` passed
in ticket 49; recheck it after the tone changes. Then the untargeted set, starting with `field`, `form`,
`item`, `tabs`, `toggle-group`, `breadcrumb` and `pagination`, which read the atoms directly.

**Blocked by:** 34
**Status:** ready-for-agent
**Labels:** review, molecules

- [ ] the seven targeted molecules, each with a reviewer page on `/review/<component>` and a journey
- [ ] overlays check open, close, escape, outside click and focus return
- [ ] `field` and `form` place toned controls inside `Field.Label`, which is ticket 50's first item
- [ ] the 19 untargeted molecules, in the order above
- [ ] findings become tickets under this feature
- [ ] the level closes when the operator passes every molecule

Field size variants moved to ticket 51 on 2026-11-10. They are an atom API change and cannot ship after
the atom level closes.
