# 49: Binary controls carry the seven tones
Session IDs: ses_e50b4d65fffer2AO1ist6QRhAZ

**What to build:** checkbox, switch, toggle and radio-group accept the seven tones through one `variant`
prop, with the tone classes emitted as literals in application source and written by the fixer's exact
string replacement. Spec: `.scratch/daisyui-adapter/spec.md`, section "Amendment 2026-11-06: tone
variants for the binary controls".

**Status:** ready-for-agent
**Labels:** adapter, component-api

- [ ] `Checkbox` takes `variant` with `default`, `secondary`, `success`, `warning`, `info`, `destructive` and `blackwhite`
- [ ] `Switch` takes the same seven keys on the root; the thumb follows the tone foreground
- [ ] `RadioGroupItem` takes the same seven keys; the dot follows the tone foreground
- [ ] `Toggle` keeps `variant` and gains the seven filled tones plus `outline` and the six `outline-<tone>` pairs
- [ ] The checked fill is the tone, the foreground is the tone foreground, and the status tones use the tone text token for the border
- [ ] The switch and radio-group keep the tone off the track: a 10 percent tone wash on the track, the tone border, and the thumb or dot in the tone
- [ ] An unpressed toggle hovers to its tone at 20 percent
- [ ] Button, checkbox, switch, radio-group and toggle carry the pointer cursor; a disabled control shows `not-allowed` and paints no hover
- [ ] A label that belongs to a disabled control shows `not-allowed` as a sibling, under a group wrapper, or wrapping the control
- [ ] The tone table is a literal string map inside each fixed copy, so Tailwind emits every row
- [ ] The redundant `dark:data-checked:bg-primary` twin is removed, so no `!` is used and a caller `class` still wins
- [ ] The dark unchecked surface is scoped to `not-data-checked`, so it covers indeterminate and cannot win the fill over a tone in dark
- [ ] The anchors live in `packages/daisyui-adapter/targets.mjs`; checkbox, switch and radio-group have two sites, toggle has three
- [ ] Stock files under `src/lib/components/ui` keep their stock strings, so `drift.mjs` stays green
- [ ] The reviewer copies under `src/lib/components/*-fixed` are regenerated through fix, copy, revert, LF-normalize
- [ ] The four reviewer pages show every tone, and their journeys pass
- [ ] The focus ring follows the tone at 30 percent, the tone border survives focus, and a focused invalid control keeps its destructive ring
- [ ] A new harness script covers the binary tone rows, in the shape registry-30 and registry-31 use
- [ ] README and CHANGELOG describe the new keys, since the change folds into 0.3.0

Constraints found in the review:

- Toggle's pressed paint edit lives only in `src/lib/components/toggle-fixed/toggle.svelte` today. The
  fixer does not reproduce it, because it sits in the base class. This ticket has to encode it, or the
  copy drifts from the generator.
- `cn` is tailwind-merge. A tone row passed after the base rows must win the cascade; a prototype on
  checkbox settles it before the other three follow.
- The focus-ring weight differs between button and radio-group. Out of scope here.

Out of scope: the switch thumb RTL rule that uses `data-[state=checked]`, and ticket 43's follow-up
pairs for badge, bubble and the button ghost hover.
