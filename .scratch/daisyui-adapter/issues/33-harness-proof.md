# 33: Integration harness and AA proof
Session IDs: ses_e5b4b2b2bffespvAWu55q7Wav0, ses_e5b3fb878ffelIG0rNyydUZB6g
Lesson: A seam that only compares text against its own source reports green for output that cannot compile and for a pin the live registry has left behind.
Check: code - `.scratch/daisyui-adapter/harness/run.mjs` with `pin-registry.mjs` and `contrast.mjs`: a fresh SvelteKit 3 project adds the 27 targets from the pinned registry, `init` twice is byte-identical, a late `sheet` is stock then fixed, `fix` twice is byte-identical, `--check` exits 0, the build renders both schemes with no console error, and the painted matrix holds the ten pairs and four text tones at AA; `seams.log` keeps the eight seams at 139/100/64/71/45/43/82/8.
Closeout: a66ecf4 (tag t33-harness-proof)

**What to build:** The harness proves the add + init + fix + build + render chain and the AA matrix; the light and dark evidence and the manual checklist are kept.

**Blocked by:** 32

**Status:** resolved

- [x] The harness builds a fresh SvelteKit project, adds the targets, runs `init`, builds and renders both schemes without console errors
- [x] The ten contrast pairs and the four text-tone pairs meet AA; the fill and border matrix is recorded; the fill-vs-page is recorded as a known limit
- [x] The light and dark screenshots and the short manual checklist are kept
- [x] The `add` prerequisite is demonstrated: an un-added component is not fixed
- [x] `init` and `fix` re-runs are byte-identical; the evidence is kept
