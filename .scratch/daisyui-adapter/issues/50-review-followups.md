# 50: Follow-ups from the binary control tones review

**Status:** ready-for-agent
**Labels:** adapter, test

Accepted as `Consider` in the interrogate round on ticket 49. None blocks the shipped behaviour; each is
recorded so it is not lost.

- [ ] `Field.Label` focus rules still outrank the tone border and ring. The stock
      `group-has-[:focus-visible]/field-label:*` rules beat the tone row, so a toned checkbox, radio or
      switch inside a focused `Field.Label` shows a primary border. Reviewers B and C.
- [ ] `registry-49` has no byte-for-byte regeneration check for the cursor sites. Only the four binary
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
- [ ] `focusSite` is shaped so its fixed text does not contain its stock text, a coupling to the
      substring `stateOf`. Give sites an explicit replace or insert position instead. Comment-sicko,
      ticket 49 pass.
- [ ] The toggle cursor and pressed paint share one whole-base replacement, so toggle cannot carry the
      cursor through `CURSOR_SITES` like the other four controls. Extract the shared base and give
      toggle its own cursor site. Comment-sicko, ticket 49 pass.
- [ ] `targets.mjs` is 1846 lines and ticket 49 added 333 of them. Split the manifest by responsibility
      before the next level adds more site tables. Standards axis, code review.
- [ ] The three fixed copies redeclare the same `variant` prop type. A shared `BinaryVariant` type would
      remove the drift. Standards axis, code review.
- [ ] The reviewer page repeats five tone maps and a four-times-copied scheme wrapper. The per-ticket
      routes in ticket 51 should replace them with one derived map and one snippet. Standards axis,
      code review.

Dismissed in the same round: the claim that `not-aria-disabled:` kills every enabled hover (the enabled
button paints hover in the cursor journey), and the claim that reading `backgroundColor` on the radio dot
SVG is wrong (the stock dot is the SVG's own rounded background).
