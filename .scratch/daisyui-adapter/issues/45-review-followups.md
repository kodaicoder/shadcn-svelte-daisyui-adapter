# 45: Follow-ups from the binary control tones review

**Status:** ready-for-agent
**Labels:** adapter, test

Accepted as `Consider` in the interrogate round on ticket 44. None blocks the shipped behaviour; each is
recorded so it is not lost.

- [ ] `Field.Label` focus rules still outrank the tone border and ring. The stock
      `group-has-[:focus-visible]/field-label:*` rules beat the tone row, so a toned checkbox, radio or
      switch inside a focused `Field.Label` shows a primary border. Reviewers B and C.
- [ ] `registry-44` has no byte-for-byte regeneration check for the cursor sites. Only the four binary
      components are scaffolded and compared, so `button-fixed` and `label-fixed` can drift from
      `targets.mjs` while every harness stays green. Reviewer B.
- [ ] The journeys for `buttons`, `aspect-ratio`, `avatar`, `badge` and `button` point at pages that no
      longer exist. Prune them, or give each reviewer page its own route so a journey always matches
      exactly one page. Reviewer C.
- [ ] `radio-group` exposes `variant` per item, so a group of N options repeats it N times and mixed
      tones are possible. Consider a group-level `variant` with context. Reviewer B.
- [ ] `stateOf` reports a site `fixed` whenever its fixed string appears anywhere in the file, so a
      component whose wiring was hand-edited can still pass `--check` (the literals are intact, the map
      is not passed to `cn`). Reviewers B and C.

Dismissed in the same round: the claim that `not-aria-disabled:` kills every enabled hover (the enabled
button paints hover in the cursor journey), and the claim that reading `backgroundColor` on the radio dot
SVG is wrong (the stock dot is the SVG's own rounded background).
