# 46: Controls on the evidence page

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A release page that only shows painted swatches cannot catch a control that fails to toggle. The evidence has to carry the controls the operator can drive, in the same two schemes as the static matrix.
Check: code - `.scratch/daisyui-adapter/harness/page/+page.svelte` gains the Controls section: input normal, filled, disabled and invalid; checkbox unchecked, checked, indeterminate and both disabled states; switch off, on, small and both disabled states; the radio group with its selected value; the tooltip and dialog markup. All twenty imports exist under `src/lib/components/ui/`, and `.scratch/daisyui-adapter/harness/pin-registry.mjs` serves `tooltip` and `label` as extra items. `shot.mjs` reloads once on `Outdated Optimize Dep`, drops only those lines, and reports the reloaded response. The checklist gains the swatch note. The Interactive states section is ticket 47.

**What to build:** The harness page carries an interactive Controls section: input, checkbox, switch, radio group, tooltip and dialog, in both schemes, so the operator can check their painted states and interactions.

**Blocked by:** None

**Status:** resolved

- [x] Input renders normal, disabled and invalid
- [x] Checkbox and switch render unchecked, checked and disabled, and toggle on click
- [x] Radio group selects one option and shows the selected value
- [x] Tooltip opens on hover and focus, and the dialog opens and closes

The captured frames are ticket 47's, because the state rows and the screenshot script land there. Recorded gap: the page seeds its dark flag to `false` instead of reading the document class, so the first toggle click is a no-op in the dark scheme; it does not affect the painted frames.
