Phase: feature

# Ticket 31, the badge, alert and bubble variants

Ticket: `.scratch/daisyui-adapter/issues/31-badge-alert-bubble-variants.md` (Status: ready-for-agent, Blocked by 24, 25, 26, 29, all resolved).
Branch: `fix/nutchapon/ai/new-variants`. Base: `a0ca84c` (ticket 30 closeout, tag `t30-button-variants` at `019cf5d`).
Session: claimed through the ticket tool; the id is appended to the ticket's `Session IDs:` line.
Next tickets, untouched: 32, 33, 34.
Playbook: Feature. poteto-mode drives; the ticket is input.

Gate record: spec and ticket gates passed before this session. Tickets 24, 25, 26 and 29 are resolved.
No gate pass is claimed here.

## Plan

Matched playbook: Feature (1-8), then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: read end to end this turn: `.scratch/daisyui-adapter/issues/31-badge-alert-bubble-variants.md`,
   spec L65-100, `targets.mjs` (the `SITES` bubble row, `alert-base`, the whole variant section L898-1053),
   `component-fix.mjs` (`stateOf`, the states-before-apply loop, `fullyFixed`), `test/drift.mjs`,
   `.scratch/daisyui-adapter/registry-30/variants.mjs`, the pinned `badge`, `alert` and `bubble`
   with their tv configs, and `registry-26`/`registry-29` where they read the bubble and alert files.
   The fixer's four states, per-file grouping and whole-string `split/join` are the whole surface.
2. `architect` for parallel design exploration.
   skip: the ticket fixes the design. The manifest shape, the one-site-per-component rule, the
   literal classes and the table-as-single-source are fixed by the ticket, spec L84-92 and ADR 0001.
   The one open choice, the bubble anchor, is settled below with a seam that proves the ordering.
3. Write the throughput checkpoint as four todo items. Done below.
4. Delegate code-writing to a subagent using the configured feature model
   (`opencode-go/deepseek-v4.1-flash#high`), with the data shape and success criteria below. The
   delegate runs `node` and writes no git command, because a subagent's git opens a pager and hangs.
5. Verify on the matching surface. `registry-31/variants.mjs` (new) drives the real CLI over temp
   copies of the three pinned components. The six old seams stay green at their counts and drift at 8.
   Any numeric expectation a larger site set moves is updated and explained in the Result.
6. Rebase into small, ordered commits. One commit for this ticket.
   Use the **sequence-verifiable-units** principle skill: table and sites, seam, then closeout.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. The spec fixes the class values, ADR 0001 fixes the text tone, and the
   ticket fixes the manifest shape.
8. Run **Opening a PR**.
   skip: the operator delivers by branch push and annotated tag, and forbids a merge to `develop`.

## Throughput checkpoint

- **Blocking first steps.** The `VARIANT_ROWS` table and the four rendered sites block everything.
  `component-fix.mjs` needs no edit this time (`ALL_SITES` already spreads `VARIANTS`), and the new
  seam asserts the finished artifact, so it is written after the manifest. Drift runs first, because
  it is the only check that compares each stock string with the pin.
- **Independent workstreams.** None worth a split. The table, the three new rendered sites and the
  seam meet in one manifest API and one report format. One owner carries the change.
- **Shared mutable state.** One writer on the branch. The delegate holds the worktree; the lead writes
  only this audit file while it runs. Every fixture writes into `$TEMP`.
- **Smallest safe decomposition.** One worker, one commit. The change is one extended table, three
  rendered blocks, one manifest projection, one seam file and the ticket closeout. Splitting the
  alert from the bubble would leave two half-tables and two seams against one manifest.

## Decisions

### One row table, a `component` column

`VARIANT_ROWS` replaces `BUTTON_VARIANTS` as the table. A row is
`{ component, key, tone, presentation, class }`, with the class written out in full. Per-component
projections are `rowsOf(component)` and are exported as `BUTTON_VARIANTS`, `BADGE_VARIANTS`,
`ALERT_VARIANTS` and `BUBBLE_VARIANTS`. `BUTTON_VARIANTS` keeps its name and its 16 rows, so
`registry-30`'s `TARGETS.buttonVariants === BUTTON_VARIANTS` and its 16-row assertion still hold, and
`VARIANTS[0]` stays the button site.

`TARGETS` gains `variantRows`, `badgeVariants`, `alertVariants` and `bubbleVariants` beside the
existing `buttonVariants`. `VARIANT_COMPONENTS` becomes `['button', 'badge', 'alert', 'bubble']`, and
`badge` enters `KNOWN_COMPONENTS` through it.

### One site per component, rendered from the table

Each site's `stock` is the pinned variant block and its `fixed` is the same block with the component's
rows inserted, rendered by one `renderVariantBlock(component, rows)` from a per-component layout
(`lead`, `trail`, `open`) and the pinned class strings. The stock block is the layout with only the
first row, which is the pinned `destructive` row of that component. The fixed block never contains the
stock block, and the pinned keys are rendered from `VARIANT_PINNED`, which drift guards against the
pin.

| Component | Pinned order | Insertion | New rows |
| --- | --- | --- | --- |
| button | default, outline, secondary, ghost, destructive, link | before `link` | 15 (unchanged from ticket 30) |
| badge | default, secondary, destructive, outline, ghost, link | after `secondary`, before `outline` | 15 |
| alert | default, destructive | after `destructive` | 3 |
| bubble | default, secondary, muted, tinted, outline, ghost, destructive | after `destructive` | 11 |

### The bubble anchor starts at `tinted`, and the seam proves the order

`bubble-muted` (in `SITES`) rewrites the `muted:` line, which sits inside the bubble variant object.
The fixer computes every site's state before it applies any write, so a whole-object bubble site whose
stock contains the `muted:` line is destroyed by `bubble-muted` in the same run: the variant site
would report `customized` and write nothing. Per the **separate-before-serializing-shared-state**
principle skill, the fix is to stop the two sites sharing bytes, not to order them.

The bubble site's stock starts at the `tinted:` line, after `muted:`, and runs to the block's closing
brace. Its fixed block inserts the 11 new keys after `destructive`. The two sites now own disjoint
lines, so both apply in one run, in either order. The seam asserts that in one `init` over a bubble
fixture both `bubble-muted` and `bubble-variants` report `stock -> fixed`, that the file holds both
fixes, and that a second run is byte-identical.

Deliberate trade-off: a key a user inserts between `muted:` and `tinted:` is outside the anchor, so
the site could add a second declaration of the same key. Appending a key at the end of the object, the
common case, is inside the anchor and reports `customized`. The alternative, a whole-object anchor,
does not work at all against `bubble-muted`, and the alternative of folding the muted fix into the
variant fixed block makes two sites write one line and makes the report depend on `ALL_SITES` order.

`alert-base` (in `SURFACES`) rewrites the `base:` string, which is outside the alert variant block, so
the alert anchor is the whole block with no overlap. `badge.svelte` has no other site.

### Class strings

The four tones are `destructive`, `success`, `warning` and `info`. The presentations are the ones the
spec allows per component, and every row's text uses `--<tone>-text`; the fill uses the raw tone and
the tone foreground. The border, where the component has one, uses the same `--<tone>-text` token.

| Component | filled | outline | ghost | link |
| --- | --- | --- | --- | --- |
| button | `bg-<tone> text-<tone>-foreground border-<tone>-text hover:bg-<tone>/80` | `border-<tone>-text bg-transparent text-<tone>-text hover:bg-<tone>/10` | `text-<tone>-text hover:bg-<tone>/10` | `text-<tone>-text underline underline-offset-4 hover:underline` |
| badge | `bg-<tone> text-<tone>-foreground [a]:hover:bg-<tone>/80` | `text-<tone>-text [a]:hover:text-<tone>-text/70` | `text-<tone>-text hover:text-<tone>-text/70` | `text-<tone>-text underline-offset-4 hover:underline` |
| alert | `text-<tone>-text bg-card *:data-[slot=alert-description]:text-<tone>-text/90 *:[svg]:text-current after:bg-<tone>` | none | none | none |
| bubble | `*:data-[slot=bubble-content]:bg-<tone> *:data-[slot=bubble-content]:border-<tone>-text *:data-[slot=bubble-content]:text-<tone>-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-<tone>/80` | `*:data-[slot=bubble-content]:bg-background *:data-[slot=bubble-content]:border-<tone>-text *:data-[slot=bubble-content]:text-<tone>-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-<tone>/10` | `*:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 *:data-[slot=bubble-content]:text-<tone>-text [&>[data-slot=bubble-content]:is(button,a):hover]:bg-<tone>/10 border-none` | none |

Component-specific reasons:

- **badge has no border.** Its base pins `border-0 bg-transparent px-0`, so a border utility is dead
  bytes: `border-0` sets the width to zero and `border-<tone>-text` would only set a color, and giving
  the label a real border would need padding it does not have. The badge's own `outline` key is a text
  color, not a box. The tone rows follow the badge's two existing hover idioms: `[a]:hover:` for the
  label presentations and plain `hover:` for ghost. `ghost-<tone>` carries the tone at rest and dims on
  hover, which is the same shape as stock destructive's `[a]:hover:text-destructive/70`, and keeps the
  resting text at the token the theme already measured. Badge filled rows therefore carry no border,
  a recorded deviation from spec L21, whose border requirement needs a box the badge does not have.
- **bubble filled rows carry the border.** `bubble-content` pins `border border-transparent`, so the
  status rows add `*:data-[slot=bubble-content]:border-<tone>-text` and the fill gets the 3:1
  boundary spec L21 asks for. The pinned `destructive` row keeps its transparent border because the
  ticket freezes it.
- **alert gets its border from `currentColor`.** The base carries `border` with no color utility, and
  Tailwind v4 resolves that to `currentColor`, so `text-<tone>-text` sets the border to the same token.
  No border utility is added, and the pinned destructive row already relies on this.
- **bubble ghost keeps `rounded-none`.** It is the ghost presentation's own shape in the pinned
  `ghost:` row, not a radius target; ticket 29 left it in place. Only ghost rows carry it.
- **alert and bubble have no link presentation**, and neither alert nor bubble has outline or ghost for
  alert, per spec L90-91.

### The pinned destructive rows stay byte for byte

The ticket says the existing variants are unchanged, so badge `destructive` keeps
`text-destructive`, bubble `destructive` keeps its tinted base and `text-destructive`, and alert
`destructive` keeps its row. The spec's token rule says the raw tone is a fill and never a text token;
that rule is not applied to these three rows here, because changing them would change the look of
every installed badge, bubble and alert and needs its own ticket and contrast evidence. Every new row
uses the text token. The seam asserts the three pinned strings against the pin and asserts that no new
row writes a raw tone as text.

### Marker and flag consequence

All four sites join `VARIANTS`, which `component-fix.mjs` and `drift.mjs` already spread into
`ALL_SITES`. `bubble` and `alert` already have a contrast or surface site, so they only stay fully
fixed when the variant site is fixed too; after `init` it is, so the header counts of every old
fixture stay the same. `badge` was not a known component before, so no old fixture can install it.

`registry-30` moves one number: `VARIANTS.length` is now 4, not 1, and that check's name says "one
site". The name is corrected to name the button site first, which is what that seam actually needs.
No other old seam changes.

### Tests

`registry-31/variants.mjs` reads the manifest and the three pins, then drives the real CLI over temp
copies:

- the row table: 48 rows, the component column, one row per tone x presentation cell for each
  component's supported presentations, the key naming rule, and no duplicate key within a component;
- every class is a non-empty literal; no row writes a radius except the bubble ghost rows, which write
  exactly the pinned `rounded-none`; no new row writes a raw tone as text; every text and border token
  is the same `<tone>-text`;
- each component's stock block occurs exactly once in its pin, is not contained in its fixed block,
  and every pinned key in its fixed block equals the pin; every row appears exactly once in its
  component's fixed block;
- `init` over a fixture with the three components: the four variant sites report `stock -> fixed`,
  `bubble-muted` and `alert-base` also report `stock -> fixed` in the same run, the files hold the new
  keys and the pinned destructive rows, the bubble file keeps its `rounded-none` ghost rows, the
  header counts three fully fixed files, `--check` is 0, `--strict` is 0, and a second run is
  byte-identical;
- the four states per component: a hand edit inside the block reports `customized` and survives, a
  user key appended inside the block is kept and nothing is inserted, a restored stock block reports
  `stock -> fixed`, a deleted file reports `missing`, and `--strict` exits 1 on a customized block;
- the overlap seam: the bubble run applies both sites, and a second run reports both `fixed`.

## Ticket steps

- [x] Read poteto-mode and pick the playbook, then write this plan
- [x] Claim ticket 31
- [x] `targets.mjs`: `VARIANT_ROWS` (48 literal rows), the per-component projections, the four
      rendered `VARIANTS` sites, `VARIANT_COMPONENTS`, `KNOWN_COMPONENTS`, `TARGETS`
- [x] badge has `success`/`warning`/`info` plus `outline-*`, `ghost-*`, `link-*` for the four tones
- [x] bubble has `success`/`warning`/`info` plus `outline-*`, `ghost-*` for the four tones, with the
      anchor that does not overlap `bubble-muted`
- [x] alert has `success`/`warning`/`info`, with no outline, ghost or link
- [x] The class strings are literal and come from the one table; the text and border use `--<tone>-text`
- [x] `registry-31/variants.mjs`: the table, the pins, the four states, the bubble/alert overlap, the
      header and the flags
- [x] Old seams green: `registry-26` 100, `registry-16` 139, `registry-27` 64, `registry-28` 71,
      `registry-29` 45, `registry-30` 43, drift 8
- [x] No dependency, no `src/lib/components/ui` edit, no ten-pair change, `code-block` untouched,
      header/`--check`/`--strict` behavior per ticket 27
- [x] Closeout: Status resolved, Session IDs, Lesson, Check, conventional commit
      `feat(adapter): add the badge, alert and bubble variants`, annotated
      `t31-badge-alert-bubble-variants` on that commit, push branch and tag, no merge to `develop`

## Delegation brief

Files the delegate may write:

- `packages/daisyui-adapter/targets.mjs` (the variant section only: the table, the projections, the
  layout and pinned maps, the renderer, `VARIANTS`, `VARIANT_COMPONENTS`, `KNOWN_COMPONENTS`, `TARGETS`)
- `.scratch/daisyui-adapter/registry-31/variants.mjs` (new)

Out of scope: `component-fix.mjs`, `cli/init.mjs`, `test/drift.mjs`, `src/lib/components/ui`, `dist`,
`PAIRS`, `SITES`, `COMPONENTS`, `RADIUS`, `SURFACES`, `CHANGELOG`, docs, release. The delegate runs no
git command and only `node`; the lead reads the diff from the worktree and runs the old seams.

## Result

- Implementation owner: `ses_e5b8db1a7fferDHY2zZc3UR9VX`. One code diff; the lead reviewed it and owns
  the class decisions.
- Manifest: `VARIANT_ROWS` holds 48 literal rows with a `component` column (button 16, badge 16,
  alert 4, bubble 12). `rowsOf` projects it into `BUTTON_VARIANTS`, `BADGE_VARIANTS`, `ALERT_VARIANTS`
  and `BUBBLE_VARIANTS`; `BUTTON_VARIANTS` keeps its name and its 16 rows, so ticket 30's seam still
  holds. `VARIANT_PINNED` holds the pinned keys the renderer keeps, `VARIANT_LAYOUT` holds each
  component's `lead`/`trail`/`open`, and `renderVariantBlock` emits the stock block (lead + the pinned
  first row + trail) and the fixed block (lead + every row + trail). `VARIANT_STOCK_CLASS` holds only
  the button's tinted destructive base, because button is the one component whose row 0 is replaced
  rather than kept. `TARGETS` gains `variantRows`, `badgeVariants`, `alertVariants` and
  `bubbleVariants`; `VARIANT_COMPONENTS` names all four, and `badge` enters `KNOWN_COMPONENTS`.
- Sites: `badge-variants` and `alert-variants` anchor the whole `variant: { ... }` block; `button`
  keeps its block and its 15 rows byte for byte; `bubble-variants` anchors from the `tinted:` line to
  the closing brace, because `bubble-muted` owns the `muted:` line and the fixer states every site
  before it writes. The overlap proof is in the seam: one run over a bubble-only fixture reports both
  `bubble-muted` and `bubble-variants` as `stock -> fixed`, the file holds both fixed strings, and a
  second run reports both fixed.
- Rows: badge 15 new (success, warning, info; outline, ghost and link for the four tones), bubble 11
  new (success, warning, info; outline and ghost for the four tones, no link), alert 3 new and no
  outline, ghost or link. Text and border use the same `--<tone>-text` token; filled status rows use
  the raw tone as the fill with `<tone>-foreground` as the text. Badge `ghost-*` carries the tone at
  rest after the standards and spec review, not muted text. Bubble filled status rows carry the
  text-tone border because `bubble-content` has a real border; badge filled rows do not, because the
  badge base pins `border-0 px-0`, recorded above as a spec deviation.
- Pinned rows: badge, alert and bubble `destructive` stay byte for byte, raw tone text included. The
  seam asserts the three pinned strings against the pin and asserts that no other row writes a raw
  tone as text, so the exception is closed rather than opened.
- Seam: `.scratch/daisyui-adapter/registry-31/variants.mjs` runs 79 checks and exits 0. It covers the
  table shape, the four literal key lists, the tone x presentation cells, the literal classes, the
  ghost `rounded-none` scope, the raw-tone exception, the filled/text border pairs, the filled border
  on button and bubble, badge's borderless base, one pass per component over the pin (stock occurs
  once, is not inside fixed, every row once in fixed, every pinned key verbatim), the alert and bubble
  presentation exclusions, `init` over a badge/alert/bubble fixture (four sites `stock -> fixed`,
  `bubble-muted` and `alert-base` in the same run, header 3, `--check` 0, `--strict` 0, byte-identical
  second run), the four states (hand edit, appended key inside the bubble anchor, restored stock block,
  deleted file, `--strict` 1), and the isolated bubble overlap.
- Old seams: `registry-16` 139, `registry-26` 100, `registry-27` 64, `registry-28` 71, `registry-29`
  45, `registry-30` 43, drift 8. Two numeric moves, both explained: `registry-26`'s site count is 39,
  not 38, because `bubble` is one of its nine installed components and now has a second site, and
  `registry-30` asserts `VARIANTS.length === 4` because the table it pins now holds four sites. The
  spelled "thirty-eight" became "thirty-nine" and the `registry-30` check name became "VARIANTS[0] is
  the pinned button site"; no other line of either seam changed.
- Review: two independent reviewers. Standards (`ses_e5b82661dffeaDOM1LTE3sTFJD`) found no hard
  breach and six judgement calls. Spec (`ses_e5b82661cffebC1mfdb9yL4vUJ`) found every DoD bullet met,
  and named the badge outline, badge ghost, filled border, test overclaim and missing decision record.
  Accepted and fixed: badge `ghost-*` now carries the tone at rest (spec L21), bubble filled status
  rows now carry the text-tone border (spec L21 and L71), the seam's badge and bubble key lists are
  literal instead of derived from `BUTTON_KEYS`, and the seam gained three checks: every row names its
  own tone and no other, every filled status row on a bordered component carries the text-tone border,
  and badge writes no border.
  Dismissed with a reason: the stock-block override is drift-guarded, so a moved pinned destructive
  class fails drift rather than shifting silently; `open` naming and the `TARGETS` row/site naming are
  internal shapes and a pre-existing ticket-30 convention that its seam pins; a shared `SITE_COUNT`
  const in `registry-26` is a refactor of ticket 26's seam and moves six literals the operator allowed
  only as numeric expectations; the "resting border" regex is named for resting borders, and the
  pinned `focus-visible:border-destructive/40` is a focus ring, not a resting border; the destructive
  decision record lives in this audit, which is what the brief asked for.
- Comment pass: `comment-sicko` (`ses_e5b8603f4ffeO22m9ySKJ4pS1Z`) deleted 8 comments (7 in the
  variant section, 1 in `registry-30`). Restored: the anchor's why (it is a constraint that lives in
  `component-fix.mjs`, not in the layout it constrains) and the `registry-30` line, which was outside
  the scope it was given. Acted on its MUST KILL: the unused `VARIANT_PINNED.bubble` keys `default`,
  `secondary` and `muted` were deleted. Its `VARIANT_LAYOUT` and `VARIANT_STOCK_CLASS` kills are kept
  and recorded above, because the seam and drift guard the behavior they were worried about.
- Mutation: a whole-object bubble anchor (the collision this ticket exists to avoid) fails 6 checks,
  including `bubble-variants: customized`, header 2 and `--strict` 1. A raw tone in an alert row fails
  the raw-tone check. Dropping the border from the bubble info row fails the new filled-border check.
  All reverted; the seam is back to 79 and exit 0.
- Real artifact: the applied fixture's `badge.svelte` and `alert.svelte` hold their fixed blocks with
  the pinned rows first and the new keys after; `bubble.svelte` holds the `bubble-muted` text token and
  the 11 new keys in one run, its four ghost rows keep `rounded-none`, and the header reads
  `components 3 fixed`.
- Verification: prettier clean on the manifest and the three seams; `node --check` clean.
- Open decisions: a key a user inserts between `muted:` and `tinted:` sits outside the bubble anchor,
  so the fixer could add a second declaration of that key; appending at the end, the common case, is
  inside the anchor and reports `customized`. `ALL_SITES` is still duplicated between the fixer and
  drift, so the next table touches both. `TARGETS.variants` holds sites while `TARGETS.badgeVariants`
  holds rows, a naming asymmetry inherited from ticket 30 and pinned by its seam.
- Commit: `7213101` `feat(adapter): add the badge, alert and bubble variants`, annotated tag
  `t31-badge-alert-bubble-variants` on that commit.
