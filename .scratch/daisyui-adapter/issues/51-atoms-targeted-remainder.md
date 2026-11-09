# 51: Atoms, targeted remainder

**What to build:** finish the token review on the three targeted atoms that have not been reviewed:
`input`, `native-select` and `textarea`. The other five targeted atoms passed (badge, button, checkbox,
switch, toggle).

**Status:** ready-for-agent
**Labels:** review, atoms

- [ ] `input`: states, sizes, disabled, invalid, readonly, focus ring, cursor; tone coverage is whatever the stock supports
- [ ] `native-select`: the same checklist, plus the chevron and the option list
- [ ] `textarea`: the same checklist, plus resize
- [ ] each component gets a reviewer page on its own route, `/review/<component>`, so journeys stop going stale
- [ ] replace the old reviewer page's five tone maps and four-times-copied scheme wrapper with one derived map and one snippet (deferred from ticket 50 item 10)
- [ ] each gets a journey that drives the real control and keeps evidence
- [ ] a fixed copy only where the adapter patches the component; otherwise import from `ui`
- [ ] findings become tickets under this feature, never silent edits
- [ ] the level closes when the operator passes all three
