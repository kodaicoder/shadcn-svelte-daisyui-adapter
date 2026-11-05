# 41: A tone border only on the outline variants

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A boundary rule has to move to the presentation that still draws the boundary. Removing the border from the filled rows without moving the gate, the header and the checklist leaves documents asserting a rule the code no longer has.
Check: code - `packages/daisyui-adapter/targets.mjs`: the eleven filled tone rows on button, badge and bubble lose the text-tone border, and the twelve outline rows keep theirs. `dist/contrast.mjs` drops the border ratio, `WARNING_KIND.border` and the border warning rows, and the CLI header and known-limit line stop naming a border. `registry-30`, 43 checks, and `registry-31`, 83 checks, assert the filled rows carry no resting border, including the prefixed bubble tokens; `registry-37` passes with the text-tone fixture replacing the border fixture and a new fill-text fixture. The drift test stays 9 of 9. CHANGELOG with the release commit.

**What to build:** Only `outline` and `outline-*` carry a border. The filled tone variants on button, badge and bubble, and the soft destructive badge, drop the text-tone border they were given in 30 and 31, so a filled control is a fill with no visible edge. The operator asked for this at the ticket 34 visual gate, and it supersedes the spec line that added the text-tone border to the filled status and destructive variants for the 3:1 component boundary.

**Blocked by:** None

**Status:** resolved

- [x] The filled tone rows on button, badge and bubble carry no border token; `outline` and `outline-*` keep theirs
- [x] The matrix no longer reports a border ratio for the filled rows, because no border is painted; the text-tone pair is still measured under `text tones`
- [x] The light fills below 3:1 against the page stay recorded as known limits, and the checklist says so instead of claiming a border
- [x] README and CHANGELOG say the filled variants carry no border and name the light known limit
- [ ] The harness render shows the filled and ghost variants without an edge, and the outline rows with one

Two operator rulings on 2026-11-05. First, the four strings that still named the border gate (the CLI threshold header, the CLI known-limit suffix, README:72 and the README visual-check line) were corrected inside this ticket, because they described a rule the code had stopped applying. Second, the render item stays unticked: the screenshots in `evidence/38-outline-surface/` predate the class change, so the look is verified only at ticket 34's final gate. The CHANGELOG half of the fourth item lands with the release commit.
