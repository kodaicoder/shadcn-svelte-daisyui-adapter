# 48: The default alert uses the primary pair

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A pinned lead key cannot be changed on both sides of a string-replacement fixer. The stock block has to stay byte-identical to the pin, so the new value needs a fixed-side override that only the fixed block reads.
Check: code - `packages/daisyui-adapter/targets.mjs` gains `VARIANT_FIXED.alert.default` and passes `fixed` into `renderVariantBlock`, so the fixed block writes `bg-primary text-primary-foreground *:data-[slot=alert-description]:text-primary-foreground` while `VARIANT_STOCK_CLASS.alert` stays the pinned card treatment. `registry-31` passes 82 checks, including the fixed default uses the primary pair and the stock block is not contained in it. `registry-30` passes 43 checks and the drift test stays 9 of 9. README says the default alert is the primary pair; CHANGELOG with the release commit.

**What to build:** The alert's `default` variant paints the daisyUI primary pair, `bg-primary` with `text-primary-foreground`, instead of the card surface. It is a pinned lead key, so the adapter gains a fixed-side override so the stock block still matches the pinned component while the fixed block writes the primary pair.

**Blocked by:** None

**Status:** resolved

- [x] `default` alert is `bg-primary` with `text-primary-foreground`, and its description text uses the same foreground
- [x] The alert's stock block is unchanged, so the fixer still finds the pinned stock
- [ ] The matrix reports the primary pair on its fill, and the harness renders the default alert in both schemes
- [x] README and CHANGELOG say the default alert is the primary pair

The matrix item stays unticked: the matrix measures the tone rows, not the pinned lead keys, and no evidence folder exists for this state. The render is verified at ticket 34's gate. `docs/atomic-levels.md` is committed here as the closing reference for the release.
