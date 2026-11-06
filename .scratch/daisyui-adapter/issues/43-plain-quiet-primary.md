# 43: The plain quiet variants follow primary

Session IDs: ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A stock key can keep its pin and still change meaning, as long as the stock block and the fixed block are separate. `VARIANT_FIXED` is the seam for that; editing `fix.mjs` would put component knowledge in the mechanism.
Check: code - `packages/daisyui-adapter/targets.mjs`: `VARIANT_FIXED.button` writes `outline` and `ghost` with primary, `VARIANT_FIXED.badge` writes `default`, `secondary`, `destructive`, `outline` and `ghost` with primary, ten badge rows drop the `[a]:` hover guard, and the six badge ghost rows paint their tone at 10 percent on hover with no border. The stock blocks are unchanged, so drift stays 9 of 9; `registry-30` passes 43 checks and `registry-31` 82, with the stock pin read from `.scratch/daisyui-adapter/stock/ui` instead of the mutable demo. The badge driver measures a transparent ghost going to a 10 percent tone on hover with a transparent border.

**What to build:** Plain `outline`, `ghost` and `link` mean the primary tone in another presentation, not a neutral surface, and their hover states apply to a `<span>` as well as an `<a>`.

**Status:** resolved

- [x] Button plain `outline` and `ghost` use primary; `link` already did
- [x] Badge plain `outline`, `ghost` use primary; `default`, `secondary` and the destructive chip lose the anchor-only hover
- [x] Badge tone rows hover without an anchor
- [x] Stock blocks remain byte-identical to the pin
- [ ] README and CHANGELOG state the new meaning of the plain quiet keys

Two constraints found while implementing. The demo's `src/lib/components/ui` is the stock source for `drift.mjs` and for `registry-31`, so a fixed component there breaks both. The seam now reads a pinned copy under `.scratch/daisyui-adapter/stock/ui`, and the review page imports a fixed badge from `src/lib/components/badge-fixed`. The same treatment will be needed when the button is fixed for its review. The docs half of the last item waits for the release commit.
