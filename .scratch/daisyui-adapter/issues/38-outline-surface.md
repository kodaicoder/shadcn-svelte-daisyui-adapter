# 38: The tone outline surface is the page colour

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: An outline row in a variant table has to carry the surface its stock presentation carries. A table that writes only border and text drops the affordance in dark, because the surface belongs to the presentation, not to the tone.
Check: code - `.scratch/daisyui-adapter/registry-30/variants.mjs`, 43 checks, and `registry-31/variants.mjs`, 83 checks: each of the twelve outline rows on button, badge and bubble carries the tone at 10 percent, and the button and bubble rows move to 30 on hover. `registry-38/outline.mjs` prints the text tone on 10, 20 and 30 percent; the lowest on 10 is 6.48 at light warning and the highest 11.18, so the AA promise holds. The drift test stays 9 of 9.

**What to build:** The four `outline-*` tone variants paint the tone at 20 percent as their surface instead of `bg-transparent`, so an outline control reads as a control in both schemes. The operator found this at the ticket 34 visual gate: in dark, `outline-success`, `outline-warning`, `outline-info` and `outline-destructive` on the button sit flush with the page while the stock `outline` button carries a surface.

**Blocked by:** None

**Status:** resolved

- [x] `outline-*` on button, badge and bubble paints `bg-<tone>/10` over the page in both schemes; hover moves to `/30`
- [x] Every text tone on the 10 percent surface stays at or above 4.5 in both schemes; measured with the package math, the lowest is 6.48
- [ ] The harness light and dark renders show the tone outline button, badge and bubble distinguishable from the page
- [x] README and CHANGELOG state the tone surface, replacing the border-only wording

Known deviation, ruled by the operator on 2026-11-05: the badge outline rows keep the stock text-dim hover at 70 percent rather than a 30 percent fill. The hover clause above applies to button and bubble. The render item is not ticked here because `evidence/38-outline-surface/` was written by the later run on the final tree and shows the 42 and 44 states, not this commit; the look was signed off at ticket 34's gate on that final tree.
