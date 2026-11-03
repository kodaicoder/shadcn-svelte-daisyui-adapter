# 31: Badge, alert and bubble variants
Session IDs:
Lesson:
Check:

**What to build:** Badge, alert and bubble gain the status tones and their supported presentations, using the text tones.

**Blocked by:** 24, 25, 26, 29

**Status:** ready-for-agent

- [ ] Badge has `success`/`warning`/`info` plus the three presentations for the four tones
- [ ] Bubble has `success`/`warning`/`info` plus `outline-*` and `ghost-*` for the four tones; it has no link presentation
- [ ] Alert has `success`/`warning`/`info`; it has no outline, ghost or link presentation
- [ ] The text and border use the same `--<tone>-text` token; the class strings are literal
- [ ] `code-block` is untouched; the existing variants are unchanged; tests assert the keys
