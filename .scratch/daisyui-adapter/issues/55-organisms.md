# 55: Organisms
Session IDs:
Lesson:
Check:

**What to build:** review the 18 organisms. The targeted 13 share the token work: `calendar`, `chart`,
`command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `menubar`, `navigation-menu`,
`range-calendar`, `select`, `sheet` and `table`. Then the five untargeted: `alert-dialog`, `carousel`,
`questionnaire`, `sidebar` and `sonner`. `select` is classified here for its popup; refine it with the atoms
if that is easier.

**Blocked by:** 54
**Status:** ready-for-agent
**Labels:** review, organisms

- [ ] the overlay set runs off one state model: open, close, escape, scroll lock, focus trap and return
- [ ] each organism gets a reviewer page on `/review/<component>` and a journey, not a screenshot-only pass
- [ ] `sidebar` composes button, input, separator, sheet, skeleton and tooltip, so its review depends on those atoms
- [ ] `sonner` and `questionnaire` are global or multi-step; check them on the real page
- [ ] findings become tickets under this feature
- [ ] the level closes when the operator passes every organism
