# 35: Badge status borders
Session IDs: ses_e5b9347ceffesVUlciF14SLLUW
Lesson: An "outline" presentation was modelled as a text colour on a `border-0` base, so the shape the name promises was absent and the tests asserted tokens instead of the shape.
Check: code - `.scratch/daisyui-adapter/registry-31/variants.mjs`: 82 checks, including four badge chip checks that tokenise the class, strip variant prefixes, and require `border`, `border-<tone>-text` and `px-1.5 py-0.5` on the four outline rows and the three filled status rows, and no border or padding on the ghost, link and pinned destructive rows; `registry-16` stays at 139 checks, `registry-26` at 100, `registry-27` at 64, `registry-28` at 71, `registry-29` at 45, `registry-30` at 43 and the drift test at 8.
Closeout:

**What to build:** The badge status keys read as chips. `outline-<tone>` is a border-only chip in the tone border, and the filled status keys carry the fill plus the tone border, so the presentation matches spec L21 and L71 on the one badge base that can hold a box.

**Blocked by:** 31

**Status:** resolved

- [x] `outline-<tone>` badge variants carry `border` and `border-<tone>-text`, no fill, and padding for the border to sit on
- [x] The filled status badge variants carry the fill with `border-<tone>-text` on top, on the same chip padding
- [x] The text and border use the same `--<tone>-text` token; the class strings stay literal
- [x] The pinned badge variants, the pinned `destructive` row and the neutral `outline` key are unchanged
- [x] Tests assert the chip shape; the old seams stay green
