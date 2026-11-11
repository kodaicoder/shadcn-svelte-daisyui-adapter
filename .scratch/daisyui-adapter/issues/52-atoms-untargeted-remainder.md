# 52: Atoms, untargeted remainder
Lesson: A review page that proves a defect leaves a red assertion unless the same ticket also fixes the cause through the generator, and a red assertion with no owner reads the same as a regression.
Check: code - the slider and scroll-area journeys assert the ring width and the ring alpha they measure, and `packages/daisyui-adapter/test/drift.mjs` pins the four ring sites.
Session IDs: ses_e3bf72385ffeFALeHHC2Njjlc7, ses_e3620753bffePdEdd8Jg2rA36P

**What to build:** review the untargeted atoms. `aspect-ratio` and `avatar` already passed. `label` was
touched by the disabled-cursor work but has not had a full review.

**Status:** resolved
**Labels:** review, atoms

- [ ] `kbd`
- [ ] `label` (full review, including the `for` and wrapping cases)
- [ ] `marker`
- [ ] `progress`
- [ ] `scroll-area`
- [ ] `separator`
- [ ] `skeleton`
- [ ] `slider`
- [ ] `spinner`
- [ ] each gets a reviewer page on `/review/<component>` and a journey
- [ ] no tone work: these are target `no`, so the check is tokens, states, cursor and disabled where it applies
- [ ] the level closes when the operator passes all of them, which closes the atoms

## Answer

All nine atoms carry a route under `/review/<component>` and a journey in
`.opencode/skills/verify/scripts/drive.mjs`, and `verify/SKILL.md` lists the seventeen journeys.

- Batch A: `kbd`, `separator`, `skeleton`, `spinner`, plus the shell rename to `ReviewPage`.
- Batch B: `marker`, `progress`, `scroll-area`, `slider`.
- Batch C: `label`, with `for`, wrapping, three peer cases, three disabled cases and the `FieldLabel`
  neighbour. `LabelFor` and `FieldCase` call `$props.id()` so each scheme gets its own id.

`marker` reads from a generated copy because the text-rung table owns it. `progress` has no fixer
site, so its page reads `ui`. `label` reads `label-fixed`. `slider` and `scroll-area` gained ring
sites, so both now have generated copies too.

The review proved two defects and fixed them here, since a red assertion with no owner cannot be
told apart from a regression: the slider thumb painted a 2 px focus ring and the scroll-area viewport
painted its ring at 50 percent alpha, against the 3 px and 30 percent the fields and the five
interactive components already carry. Both are rows in `targets/rings.mjs`, so `drift` re-proves the
copies and the journeys read the measured width and alpha.

### Round 2: the operator failed the nine and approved the tone amendment

The first operator pass rejected every page. Measured in dark against the page at `oklch(0.18)`, the
surfaces sat between 1.09 and 1.35 to 1, four radii measured 0px, and six atoms had no tone variant.

`targets/atom-tones.mjs` adds `variant` to `kbd`, `separator`, `skeleton`, `spinner`, `progress` and
`slider` with the seven tone keys, plus `neutral` on the two that have no tone of their own, and
`size` on `spinner` at 12/16/24/32. Surfaces tint the tone at 25 percent in light and 30 in dark,
`destructive` takes 50 in dark, and an accent, line, bar or thumb uses the raw tone or its derived
`-text` token, which is what keeps a bright tone above 3 to 1 on white. `kbd` and `skeleton` take the
selector radius, the `slider` and `scroll-area` thumbs are `rounded-full`, and `kbd` carries a 2 px
bottom edge.

`resolve` versus measurement: the journeys now composite the rendered colour over the page and assert
the ratio they measured, 1.1 to 1 in light and 1.25 in dark for a surface, 3 to 1 for an accent.
`pnpm test:adapter` passes 23 checks over 37 fixed sites and all seventeen journeys pass.

Open findings, each with its owner:

- `66`: a label for a disabled text field keeps `cursor: default`, because `input`, `textarea` and
  `native-select` carry no `peer` class for the label's `peer-disabled` rules. Measured on the page
  by disabling the associated input: the label stayed at `default` and `1`, the checkbox sibling at
  `not-allowed` and `0.5`. The page now shows the case; the assertion covers the input, not the
  label, until `66` lands.
- `FieldLabel` renders at the 10 px stock rung and paints a 2 px focus ring. `ui/field` is stock and
  the molecule belongs to `53`; the label journey records both numbers.

Checks: `pnpm check` 0 errors and 0 warnings. `pnpm test:adapter` passes 23 checks. All seventeen
journeys pass on a fresh server, run in the worktree that holds all three batches.

Closeout: see the docs commit that follows the merge of `ticket-52c-label`
Merged: bd54814 into `fix/nutchapon/ai/contrast-warning` (fast-forward)
