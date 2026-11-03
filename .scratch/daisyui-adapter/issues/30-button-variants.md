# 30: Button variants
Session IDs:
Lesson:
Check:

**What to build:** Button gains the three status tones and the fifteen combined values, the filled destructive base, the text tones and the text-tone border.

**Blocked by:** 24, 25, 26, 28

**Status:** ready-for-agent

- [ ] Button has `success`, `warning` and `info` plus `outline-*`, `ghost-*` and `link-*` for destructive, success, warning and info
- [ ] The destructive base is filled with `destructive-foreground`; the text and border use the same `--<tone>-text` token
- [ ] Every class string is literal in the `tv` config; the tone × presentation table is the single source
- [ ] The existing variants are unchanged; tests assert the class keys and the filled, text and border pairs
