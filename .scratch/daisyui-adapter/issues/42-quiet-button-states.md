# 42: The quiet button states follow the tone

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A quiet presentation is defined by its state pair, not by its resting colour. The outline row looked repaired while the wash sat at rest; the shape only reads once the rest is transparent and the hover carries the tone.
Check: code - `packages/daisyui-adapter/targets.mjs`: the four outline rows are `border-<tone> bg-transparent text-<tone>` with `hover:bg-<tone> hover:text-<tone>-foreground`; the four ghost rows and four link rows take the raw tone, and the links underline only on hover; six `primary`/`secondary` quiet rows are added, so the button table holds 22 rows. `registry-30`, 43 checks, and `registry-31`, 83 checks, pin the key set, the cells and the state pairs. `registry-42/tone-text.mjs` records the measured consequence: light success fill 1.96, warning 1.76, info 2.22, and the new secondary row 2.87 as text and border. Drift 9 of 9. `badge.svelte` renders a span unless `href` is set, so the harness grid needed no markup change. CHANGELOG with the release commit.

**What to build:** The outline and ghost buttons lose the tone wash and take the daisyUI state shape, the link buttons gain a visible hover, and the harness renders badges as spans unless they carry an `href`. The operator asked for this after checking the interactive states on the live page.

**Blocked by:** None

**Status:** resolved

- [x] `outline-*` at rest is `border-<tone>` and `text-<tone>` with a transparent surface; hover is `bg-<tone>` and `text-<tone>-foreground`
- [x] `ghost-*` hover is `bg-<tone>` and `text-<tone>-foreground`, with no opacity
- [x] `link-*` has no resting underline and underlines on hover
- [x] The harness badge grid renders `<span>`; a badge with `href` still renders an anchor
- [x] The measured consequence is recorded, because the raw tone as outline text and border is below 4.5:1 and 3:1 in light for success, warning and info

Two gaps recorded, not fixed here. First, `TONES` in `registry-30` and `registry-31` is still the literal four, so the new `primary` and `secondary` rows are outside the per-tone shape checks even though the key lists cover them. Second, the badge anchor branch is read in the component but no fixture exercises it. The fourth item is ticked for the span path the grid renders. The README sentence that said the raw tone is never the text was corrected here, by the same operator ruling as ticket 41.
