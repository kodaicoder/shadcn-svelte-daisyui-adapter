# 65: The unpressed outline toggle border matches its hover wash
Session IDs: ses_e3779ea3affeQXvoGAMatMLPbv
Lesson: A rest border at full alpha reads heavier than its own 20 percent hover wash; the border has to share the wash alpha, not only its hue.
Check: code - `checkOutlinePairs` asserts the six tone outline borders at 0.2 and the default `outline` at 1.

**What to build:** every `outline-<tone>` toggle in the unpressed state paints its border at 20 percent
alpha, the same alpha as the unpressed hover background. The default `outline` keeps its full
`border-input` border. The pressed state keeps the full tone border. The border colour token stays as
it is: the secondary foreground with its dark twin, the text token for the status tones, and the
blackwhite tone.

**Status:** resolved
**Labels:** adapter, review, toggle
**Blocked by:** None

Found during the operator pass on ticket 63. The outline border is full strength at rest while the
hover wash is 20 percent, so the rest state reads heavier than the hover. The default `outline` is
excluded because its border is neutral, not a tone.

- [ ] the six `outline-<tone>` keys paint a 20 percent border at rest
- [ ] the default `outline` keeps its full `border-input` border
- [ ] pressed keeps the full tone border
- [x] the border colour token is unchanged
- [x] the fixed copy regenerates through the fixer
- [x] the toggle journey asserts the tone rest alpha and the default border
- [ ] the operator passes the outline rows on `/`

Closeout: 9127ec3 (tag `t65-toggle-outline-border-opacity`)
Merged: e95f47c
