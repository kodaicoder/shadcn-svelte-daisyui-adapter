# 27: Status and combined variants

**What to build:** Button, badge, alert and bubble gain the status tones and the combined presentations; the destructive base is filled; the text tones and the text-tone border are used.

**Blocked by:** 24, 25

**Status:** ready-for-agent

- [ ] Button has `success`/`warning`/`info` plus `outline-*`, `ghost-*` and `link-*` for the four tones; the destructive base is filled with `destructive-foreground`
- [ ] Badge has the three status tones plus the three presentations for the four tones
- [ ] Bubble has the three status tones plus `outline-*` and `ghost-*` for the four tones
- [ ] Alert has the three status tones
- [ ] The text and border use the same `--<tone>-text` token; the filled status and destructive carry the border; no separate border token
- [ ] Every class string is literal in the `tv` config; the tone × presentation table is the single source
- [ ] `code-block` is untouched; the existing variants are unchanged
