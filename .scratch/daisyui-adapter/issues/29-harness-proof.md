# 29: Integration harness and AA proof

**What to build:** The harness proves the add + init + fix + build + render chain and the AA matrix; the visual evidence is kept.

**Blocked by:** 28

**Status:** ready-for-agent

- [ ] The harness builds a fresh SvelteKit project, adds the targets, runs `init`, builds and renders both schemes without console errors
- [ ] The ten contrast pairs and the four text-tone pairs meet AA; the fill/border matrix is recorded; the fill-vs-page is recorded as a known limit
- [ ] The light and dark screenshots and the short manual checklist are kept
- [ ] The `add` prerequisite is demonstrated: an un-added component is not fixed
- [ ] `init` and `fix` re-runs are byte-identical; the evidence is kept
