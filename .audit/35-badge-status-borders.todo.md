Phase: feature

# Ticket 35, badge status borders

Ticket: `.scratch/daisyui-adapter/issues/35-badge-status-borders.md` (Status: ready-for-agent, Blocked by 31, resolved).
Branch: `fix/nutchapon/ai/new-variants`. Base: `afa995c` (ticket 31 closeout, tag `t31-badge-alert-bubble-variants` at `7213101`).
Next tickets, untouched: 32, 33, 34.
Playbook: Feature. poteto-mode drives; the ticket is input.

Why this ticket exists: the operator read the ticket 31 result and expects `variant="outline-destructive"` to render a badge with only a tone border. Ticket 31 shipped the outline keys as text-only, a deviation it recorded. Spec L21 wants the text tone for every outline text and border, and L71 gives the filled variants the text-tone border.

## Plan

Matched playbook: Feature (1-8), then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: read end to end this turn: the badge tv base and its pinned variant block, the ticket 31 manifest section
   (`VARIANT_ROWS`, `VARIANT_LAYOUT`, `renderVariantBlock`), `registry-31/variants.mjs`, and the fixer's
   whole-string `split/join` with states computed before apply.
2. `architect` for parallel design exploration.
   skip: the shape is fixed by ticket 31 and the choice is one class string per row.
3. Write the throughput checkpoint as four todo items. Done below.
4. Delegate the two-file edit to a subagent on the feature model
   (`opencode-go/deepseek-v4.1-flash#high`). It runs `node` only and no git command.
5. Verify on the matching surface: `registry-31` (the badge checks plus the applied fixture), drift, and the
   five other seams. A rendered badge cannot be proven in this repo without the harness, so the visual check
   is the operator's, per ticket 33.
6. One commit for this ticket, on top of ticket 31.
7. `interrogate` only if the design is contested.
   skip: not contested. The operator named the expected look, and the token is fixed by spec L71.
8. No PR. The operator delivers by branch push and annotated tag.

## Throughput checkpoint

- **Blocking first steps.** The four outline rows and three filled rows block the seam edit, because the seam
  asserts the finished strings. Drift runs with the seam, since the stock block must still match the pin.
- **Independent workstreams.** n/a: one table edit and one seam edit, in one file each, meeting in one table.
- **Shared mutable state.** One writer. The delegate holds the worktree; the lead writes only this audit while
  it runs. Fixtures write into `$TEMP`.
- **Smallest safe decomposition.** One worker, one commit. Splitting the outline rows from the filled rows
  would leave the badge status family half-boxed and the seam asserting a half state.

## Decisions

### Only the new keys become chips

The pinned `outline` key stays `text-foreground [a]:hover:text-foreground/70`. Restyling it needs a second
replacement site on the `outline:` line, and that line sits inside the whole-block badge anchor, which is the
same collision ticket 31 solved for `bubble-muted`. The badge's neutral `outline` therefore stays a text
label until a ticket that restyles the pinned badge variants with their own non-overlapping sites.

### Class strings

- `outline-<tone>`: `border border-<tone>-text text-<tone>-text px-1.5 py-0.5 [a]:hover:text-<tone>-text/70`
- `<tone>` (filled): `border border-<tone>-text bg-<tone> text-<tone>-foreground px-1.5 py-0.5 [a]:hover:bg-<tone>/80`
- `ghost-<tone>` and `link-<tone>`: unchanged, no border and no padding.
- `destructive`: unchanged, pinned, text-only.

The outline rows keep the hover dim the ticket 31 rows already had and gain no hover fill. A first draft used
`[a]:hover:bg-<tone>/10` and the spec review rejected it as a fill the ticket did not authorize, and the
tightened seam now rejects any `bg-` token on an outline row.

`border-<tone>-text` sets colour only, so every chip also writes the `border` width utility, which overrides
the base's `border-0` through tailwind-merge. The padding overrides the base's `px-0 py-0`, so the border has
something to sit on. `px-1.5 py-0.5` is the operator's visual call to make; the audit records it as chosen,
not measured.

### Tests

`registry-31` gains the chip assertions and loses the "badge writes no border" one:

- every `outline-<tone>` row holds `border `, `border-<tone>-text`, `px-1.5 py-0.5`, and no `bg-<tone> ` fill;
- every filled status row holds `bg-<tone> `, `border border-<tone>-text`, `text-<tone>-foreground`, and the padding;
- every `ghost-<tone>` and `link-<tone>` row holds no `border-` and no `px-`;
- the pinned `destructive` row holds no border and no padding;
- the existing checks stay: the tones, the literal classes, the raw-tone exception, the filled border on button
  and bubble, and the applied fixture.

## Ticket steps

- [x] Write the plan
- [x] Claim ticket 35
- [x] `targets.mjs`: the four badge outline rows and the three badge filled status rows
- [x] `registry-31`: the badge chip checks
- [x] Seams green: `registry-16` 139, `registry-26` 100, `registry-27` 64, `registry-28` 71, `registry-29` 45,
      `registry-30` 43, `registry-31` (new count), drift 8
- [x] No dependency, no `src/lib/components/ui` edit, no `PAIRS` change, no version bump
- [x] Closeout: Status resolved, Session IDs, Lesson, Check, conventional commit
      `fix(adapter): give the badge status variants their border`, annotated `t35-badge-status-borders` on that
      commit, push branch and tag, no merge to `develop`

## Result

- Implementation owner: `ses_e5b70badeffeoiqQ8e9KXx0r0Z`. The lead tightened the seam after two review rounds.
- Rows: the four badge `outline-*` keys are now border-only chips
  (`border border-<tone>-text text-<tone>-text px-1.5 py-0.5 [a]:hover:text-<tone>-text/70`), and the three
  filled status keys carry the tone border on the fill
  (`border border-<tone>-text bg-<tone> text-<tone>-foreground px-1.5 py-0.5 [a]:hover:bg-<tone>/80`).
  The pinned rows, the neutral `outline` key, `ghost-*` and `link-*` are untouched.
- Seam: `registry-31` runs 82 checks. The old "badge writes no border" check is replaced by four chip checks.
  They tokenise the class, strip variant prefixes before the fill test, and require the chip padding on both
  chip kinds, so a prefixed fill (`hover:bg-<tone>/10`), an opacity fill (`bg-<tone>/10`), a bare `border`
  and a missing resting fill all fail.
- Old seams: `registry-16` 139, `registry-26` 100, `registry-27` 64, `registry-28` 71, `registry-29` 45,
  `registry-30` 43, drift 8. No expectation moved: `badge` is not installed in any old fixture.
- Review round 1, standards (`ses_e5b6bc4a0ffe3pJdQC9gb53hbK`) and spec (`ses_e5b6bc49fffers79COGz0db7pV`).
  Accepted and fixed: the fill guard was vacuous, the outline rows had an unauthorized hover fill, the DoD
  bullet did not grant the filled padding, and the flat check ignored vertical padding. Dismissed with a
  reason: the tailwind-merge reliance is recorded here rather than in a comment (the repo's pattern is the
  audit), and the pinned `destructive` plus the neutral `outline` cannot be restyled without a second site
  overlapping the block anchor, the same collision the bubble site avoids.
- Review round 2, standards (`ses_e5b6833daffeU2f32Lb4A2D5i4`) and spec (`ses_e5b6833d8ffeEimLEKOAs0UdPC`).
  Both confirmed round 1 closed and found that my tightened token test still let a prefixed fill
  (`hover:bg-...`) through and that the flat check missed a bare `border` and logical padding. Fixed by
  stripping the variant prefix and widening the flat pattern. The loop closed here at two rounds.
- Mutation: a resting `bg-<tone>/10` on an outline row, a prefixed `hover:bg-<tone>/10` on an outline row, a
  filled row with only a hover fill, a bare `border` on a ghost row, a dropped border and a dropped padding
  all fail the seam. Restored to 82 and exit 0.
- Real artifact: the applied fixture's `badge.svelte` holds the four border-only outline chips, the three
  filled chips with the tone border, and the pinned rows unchanged.
- Not proven here: the rendered box depends on tailwind-variants merging the variant over the base
  (`border` over `border-0`, `px-1.5 py-0.5` over `px-0 py-0`). Ticket 33's harness is where that is proven in
  a browser, and the operator's visual check follows it.
- Open: the pinned `destructive` and the neutral `outline` stay text-only. Restyling them needs a badge site
  layout that does not share bytes with the block anchor, which is its own ticket.
- Commit: `fix(adapter): give the badge status variants their border`, annotated tag
  `t35-badge-status-borders` on that commit.
