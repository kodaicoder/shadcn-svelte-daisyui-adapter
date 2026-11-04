# 37: The contrast matrix warning at init

Session IDs:
Lesson:
Check:

**What to build:** `init` computes the contrast matrix from the theme and the fixed fallbacks, prints a warning for each pair below its threshold, and names the pair and the measured ratio. The spec's Contrast section (L98 and L72) requires this; the CLI currently writes the bindings without measuring any pair. The ticket 33 harness computes the matrix in `.scratch/daisyui-adapter/harness/contrast.mjs` and records the rows, so the CLI can reuse that shape.

**Blocked by:** None

**Status:** ready-for-agent

- [ ] `init` reports the ten repaired pairs and the four text-tone pairs from the theme in both schemes.
- [ ] A pair below 4.5 for text, or below 3 for a component boundary, prints a warning naming the pair and the ratio; it does not fail the run.
- [ ] The filled fill-vs-page pair is reported as a known limit, not a failure.
- [ ] A theme with the pinned light-blue/dark-blue content colors reports the dark filled rows below 4.5 (success 3.49, warning 1.85, info 3.49) without failing.
- [ ] The matrix helpers live in the package, and both the CLI and the harness read the same code.
