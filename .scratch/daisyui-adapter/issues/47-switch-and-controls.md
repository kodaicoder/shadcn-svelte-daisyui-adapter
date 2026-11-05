# 47: Fully rounded switch, fuller controls, animated check

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: A radius exception is a claim about the fixer, so it needs its own assertion. Exempting the switch from the circle rule left nothing checking that the switch was still a circle.
Check: code - `packages/daisyui-adapter/targets.mjs` keeps the switch fixed string at `shrink-0 border border-transparent rounded-full`, and `registry-28` passes 71 checks with `switch-base` exempted from the no-circle rule and its step check. `src/lib/components/ui/checkbox/checkbox.svelte` mounts both icons and animates scale and opacity over 150ms, with the minus shown only on `indeterminate` and the check only on `checked && !indeterminate`. The page carries the Interactive states section, the checklist names hover, focus-visible and disabled, and the README records the switch exception. Drift 9 of 9.

**What to build:** The switch keeps `rounded-full` as a radius exception, the Controls section shows every state of each component added for the harness, and the checkbox check fades and scales in and out instead of snapping.

**Blocked by:** None

**Status:** resolved

- [x] The switch track stays `rounded-full` after the fixer, so it is a pill like the theme's circles
- [x] Input shows normal, filled, disabled and invalid; checkbox shows unchecked, checked, indeterminate and both disabled forms; switch shows off, on, small and disabled; the radio group shows selected, unselected and disabled
- [x] The checkbox check and dash scale and fade in and out over 150ms
- [x] The harness and the state frames cover the new controls, and the radius seam still passes

Two gaps recorded, not fixed here. First, `registry-28` exempts the switch from the circle rule without asserting that it is a circle, so deleting `rounded-full` from the fixed string would still pass. Second, the switch fixed string equals the stock string with a reordered class list, so the table claims a change the fixer only reorders. The frames are captured by `states.mjs` at ticket 34's gate.
