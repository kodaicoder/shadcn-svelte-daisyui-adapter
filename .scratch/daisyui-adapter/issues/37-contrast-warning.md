# 37: The contrast matrix warning at init

Session IDs: ses_e5a98c4feffepi0eUqKd2ohG3b
Lesson: A measured ratio must round the way the target paints and compare on the value it prints; a constant copied beside each consumer drifts from the one that owns it.
Check: code - `.scratch/daisyui-adapter/registry-37/warning.mjs` pins the matrix, the three dark fill-text warnings at 3.49/1.85/3.49, the two known limits at 1.95/2.89, and fixtures for a failing pair, a failing boundary and an unreadable theme, all exit 0; `seams.log` keeps the eight at 139/100/64/71/45/43/82/8.

**What to build:** `init` computes the contrast matrix from the theme and the fixed fallbacks, prints a warning for each pair below its threshold, and names the pair and the measured ratio. The spec's Contrast section (L98 and L72) requires this; the CLI currently writes the bindings without measuring any pair. The ticket 33 harness computes the matrix in `.scratch/daisyui-adapter/harness/contrast.mjs` and records the rows, so the CLI can reuse that shape.

**Blocked by:** None

**Status:** ready-for-agent

- [x] `init` reports the ten repaired pairs and the four text-tone pairs from the theme in both schemes.
- [x] A pair below 4.5 for text, or below 3 for a component boundary, prints a warning naming the pair and the ratio; it does not fail the run.
- [x] The filled fill-vs-page pair is reported as a known limit, not a failure.
- [x] A theme with the pinned light-blue/dark-blue content colors reports the dark filled rows below 4.5 (success 3.49, warning 1.85, info 3.49) without failing.
- [x] The matrix helpers live in the package, and both the CLI and the harness read the same code.
