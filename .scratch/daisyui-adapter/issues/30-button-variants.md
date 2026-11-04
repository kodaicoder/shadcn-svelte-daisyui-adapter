# 30: Button variants
Session IDs: ses_e5bbf0133ffemEBgb412YpS45Q
Lesson: A string-replacement fixer cannot see a user-added key, so an insertion site's stock has to span the whole object it writes; a narrow anchor duplicates what it did not write.
Check: code - `.scratch/daisyui-adapter/registry-30/variants.mjs`: 43 checks over the real CLI and temp copies of the pinned button: the 16-row tone x presentation table, the literal classes, the filled, text and border pairs, the whole-block stock against the pin, the five pinned keys, the four states including a user-added key, the radius site in the same file, the header at 1, and `--check`/`--strict`; `registry-26` stays at 100 checks, `registry-16` at 139, `registry-27` at 64, `registry-28` at 71, `registry-29` at 45 and the drift test at 8.
Closeout: pending

**What to build:** Button gains the three status tones and the fifteen combined values, the filled destructive base, the text tones and the text-tone border.

**Blocked by:** 24, 25, 26, 28

**Status:** resolved

- [x] Button has `success`, `warning` and `info` plus `outline-*`, `ghost-*` and `link-*` for destructive, success, warning and info
- [x] The destructive base is filled with `destructive-foreground`; the text and border use the same `--<tone>-text` token
- [x] Every class string is literal in the `tv` config; the tone × presentation table is the single source
- [x] The existing variants are unchanged; tests assert the class keys and the filled, text and border pairs
