# 50: Follow-ups from the binary control tones review
Session IDs: ses_e50b4d65fffer2AO1ist6QRhAZ, ses_e40e4b8f8ffe1chCTz7jYx00bF

**Status:** resolved
**Labels:** adapter, test

Accepted as `Consider` in the interrogate round on ticket 49. None blocks the shipped behaviour; each is
recorded so it is not lost.

- [x] `Field.Label` focus rules still outrank the tone border and ring. The stock
      `group-has-[:focus-visible]/field-label:*` rules beat the tone row, so a toned checkbox, radio or
      switch inside a focused `Field.Label` shows a primary border. Reviewers B and C.
- [x] `registry-49` has no byte-for-byte regeneration check for the cursor sites. Only the four binary
      components are scaffolded and compared, so `button-fixed` and `label-fixed` can drift from
      `targets.mjs` while every harness stays green. Reviewer B.
- [x] The journeys for `buttons`, `aspect-ratio`, `avatar`, `badge` and `button` point at pages that no
      longer exist. Prune them, or give each reviewer page its own route so a journey always matches
      exactly one page. Reviewer C.
- [x] `radio-group` exposes `variant` at the group level. The root prop is the group tone, items
      inherit it through a reactive context getter, and an item `variant` stays as an override. Spec
      amendment 2026-11-09. Reviewer B.
- [x] `stateOf` reports a site `fixed` whenever its fixed string appears anywhere in the file, so a
      component whose wiring was hand-edited can still pass `--check` (the literals are intact, the map
      is not passed to `cn`). Reviewers B and C.
- [x] `focusSite` is shaped so its fixed text does not contain its stock text, a coupling to the
      substring `stateOf`. Give sites an explicit replace or insert position instead. Comment-sicko,
      ticket 49 pass.
- [x] The toggle cursor and pressed paint share one whole-base replacement, so toggle cannot carry the
      cursor through `CURSOR_SITES` like the other four controls. Extract the shared base and give
      toggle its own cursor site. Comment-sicko, ticket 49 pass.
- [x] `targets.mjs` is 1846 lines and ticket 49 added 333 of them. Split the manifest by responsibility
      before the next level adds more site tables. Standards axis, code review.
- [x] The three fixed copies redeclare the same `variant` prop type. A shared `BinaryVariant` type would
      remove the drift. Standards axis, code review.
- [ ] The reviewer page repeats five tone maps and a four-times-copied scheme wrapper. The per-ticket
      routes in ticket 51 should replace them with one derived map and one snippet. Standards axis,
      code review. Deferred to ticket 51, which owns the `/review` routes.

Dismissed in the same round: the claim that `not-aria-disabled:` kills every enabled hover (the enabled
button paints hover in the cursor journey), and the claim that reading `backgroundColor` on the radio dot
SVG is wrong (the stock dot is the SVG's own rounded background).

## Closeout

Commits: `514011a`, `742f704`, `f674867`, `e9002d3`, `081e224`, `61146ed`, `99c3983`, `2d3365e`,
`94439a9`, `e724d23`, `e5ab5d5`.

Gates: `drift` all pass; `registry-26`, `27`, `29`, `30`, `31`, `49` all pass; `registry-28` has the two
known no-theme fallback failures from the mapped stylesheet, unrelated to this ticket; `pnpm check` clean;
the five journeys pass in both schemes. The `targets.mjs` split ships `targets/` through `package.json`
`files`, and every registry still imports `../targets.mjs`.

Code review closed the ticket. Fixed: the indentation left by the comment sweep, the stale
`content.split(stock).join(fixed)` paragraph in `docs/component-color-usage.md`, the orphaned
`features/buttons.md`, the duplicated context key (now `RADIO_GROUP_VARIANT` in
`ui/binary-variant.ts`), the create-file scope, the `stateOf` unreachable branch, and the
`checkStates` label split. Dismissed with proof: `TARGETS` has consumers (`registry-30` and
`registry-49` read `TARGETS.variants` and `TARGETS.binarySites`).

Lesson: a byte patcher that infers site state from substring order makes a removal site and a hand edit
read the same, so the site contract has to state whether it replaces or inserts.
Check: code - `drift.mjs` asserts every site declares `replace` or `insert`, and `registry-49` compares
every committed binary and cursor copy byte for byte.
