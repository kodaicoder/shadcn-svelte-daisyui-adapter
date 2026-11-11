# 59: Full review and 1.0.0
Session IDs:
Lesson:
Check:

**What to build:** re-review every component page against the final tokens, prove the whole surface, then
cut 1.0.0.

**Blocked by:** 58
**Status:** ready-for-agent
**Labels:** release, review

- [ ] every reviewer page is re-read once, light and dark, with the operator
- [ ] every journey runs green in one pass, and stale journeys are gone rather than skipped
- [ ] drift, registry-30, registry-31, registry-49 and the cursor coverage all pass
- [ ] the contrast matrix is re-measured and the AA document is current
- [ ] README, CHANGELOG, GLOSSARY and the ADRs describe the shipped surface
- [ ] the public API is frozen: no component still needs a hand edit after `fix`
- [ ] version 1.0.0 publishes, the registry serves it, and the `v1.0.0` tag lands
- [ ] the feature digest and `retro` close the feature
