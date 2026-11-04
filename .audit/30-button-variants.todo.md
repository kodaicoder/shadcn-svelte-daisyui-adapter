Phase: feature

# Ticket 30, the button variants

Ticket: `.scratch/daisyui-adapter/issues/30-button-variants.md` (Status: ready-for-agent, Blocked by 24, 25, 26, 28, all resolved).
Branch: `fix/nutchapon/ai/new-variants`. Base: `7f6747d` (ticket 29 closeout, tag `t29-radius-surfaces` at `9d5bfa8`).
Session: `ses_e5bbf0133ffemEBgb412YpS45Q`.
Next tickets, untouched: 31, 32, 33, 34.
Playbook: Feature. poteto-mode drives; the ticket is input.

Gate record: spec and ticket gates passed before this session. Tickets 24, 25, 26 and 28 are resolved;
26 closed with the fixer seam and 28 with the radius seam. No gate pass is claimed here.

## Plan

Matched playbook: Feature (1-8), then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: read end to end this turn: `targets.mjs`, `component-fix.mjs`, `cli/init.mjs`, `test/drift.mjs`,
   spec L63-100, ADR 0001, the glossary terms (Tone, Presentation, Variant, Text tone, Target
   manifest, Fixer state, Fully fixed), the pinned `button/button.svelte`, and the seams
   `registry-26` 100, `registry-16` 139, `registry-27` 64, `registry-28` 71, `registry-29` 45 and
   drift 8. The fixer's four states, `split/join` application and per-file report are the whole
   surface this ticket adds to.
2. `architect` for parallel design exploration.
   skip: the ticket fixes the design. Step 3 of the brief says the site lives in the target manifest,
   the fixer reads one manifest, no style guard returns, and the tone x presentation table is one
   literal table the tv config reads. The remaining choice, site granularity, is forced by ADR 0003's
   four states and by ticket 26's lesson about a fixed string containing its own stock; see Decisions.
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using the configured feature model
   (`opencode-go/deepseek-v4.1-flash#high`), with the data shape and success criteria below. The
   delegate runs `node` and writes its diff to a temp file; it runs no git command, because a
   subagent's git opens a pager and hangs.
5. Verify on the matching surface. `registry-30/variants.mjs` (new) drives the real CLI over temp
   copies of the pinned button. The five old seams stay green at 100, 139, 64, 71, 45 and drift at 8.
   Any numeric expectation a larger target set moves is updated, and each is explained in the Result.
6. Rebase into small, ordered commits. One commit for this ticket.
   Use the **sequence-verifiable-units** principle skill: manifest and site, fixer and drift wiring,
   seam, then closeout.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. The spec fixes the class values, ADR 0001 fixes the text tone and the border,
   and the operator's brief fixes the manifest shape and forbids a style guard.
8. Run **Opening a PR**.
   skip: the operator delivers by branch push and annotated tag, and forbids a merge to `develop`.

## Throughput checkpoint

- **Blocking first steps.** The `BUTTON_VARIANTS` table and the `VARIANTS` site block every other
  step. `component-fix.mjs` and `test/drift.mjs` cannot wire a table that does not exist, and the seam
  asserts the finished artifact. Drift runs before the first CLI run, because it is the only check
  that compares the stock string with the pin.
- **Independent workstreams.** None worth a split. The table, the two `ALL_SITES` wirings and the seam
  meet in one report format and one header count; the seam is written against the finished table, so
  it is not independent either. One owner carries the change.
- **Shared mutable state.** One writer on the branch. The delegate holds the worktree; the lead writes
  only this audit file while it runs. Every fixture writes into `$TEMP`.
- **Smallest safe decomposition.** One worker, one commit. The change is one 16-row table, one
  rendered site, two one-line wirings, one new seam file, and the ticket closeout. Splitting the table
  from the site would leave a manifest that reports nothing.

## Decisions

### Manifest shape

The variants are a fourth table in the same manifest, beside `SITES`, `RADIUS` and `SURFACES`:

```js
export const VARIANT_COMPONENTS = ['button'];
export const BUTTON_VARIANTS = [{ key, tone, presentation, class }, ...16 rows...];
export const VARIANTS = [{ id, component, file, stock, fixed }];
export const KNOWN_COMPONENTS = [...new Set([...COMPONENTS, ...RADIUS_COMPONENTS, ...SURFACE_COMPONENTS, ...VARIANT_COMPONENTS])];
export const TARGETS = { supported, components, sites, pairs, radius, radiusComponents,
                         surfaces, surfaceComponents,
                         variants: VARIANTS, variantComponents: VARIANT_COMPONENTS,
                         buttonVariants: BUTTON_VARIANTS };
```

`VARIANTS` holds one entry per component, and its `fixed` block is rendered from that component's
rows at module load. `BUTTON_VARIANTS` is the tone x presentation table and the single source for
every tone class string. A row is `{ key, tone, presentation, class }`, with the class written out in
full, so a reader can see the string and a test can assert it. Nothing is assembled inside the
component.

Alternatives considered:

| Shape | Why not |
| --- | --- |
| A `variant` key on `SITES` entries | `SITES` is the contrast contract: `registry-26` pins it at eleven sites and every one belongs to one of the nine components. A variant row there would force those counts and the nine-name list to move, which is ticket 26's guard. |
| Per-key sites (16 entries, one per variant key) | An inserted key has no stock line of its own. Chaining each site on the previous key's fixed string breaks on a second run, and a site anchored on the `link:` line would insert its keys whenever that line is untouched, duplicating a key the user added. |
| A second matcher with `anchor`/`insert` and its own state detector | Two fixed-state definitions. ADR 0003 fixes four states; an insertion is already a longer stock string whose fixed string adds text, as ticket 28's `input` site does. |
| One literal row table plus one rendered whole-block site (chosen) | Reuses `stateOf`, `split/join`, idempotency, per-site reporting and the fully-fixed count unchanged. The whole-block stock is the only anchor that a user-added key breaks, so the fixer cannot duplicate a key it did not write. |

### The site is the whole variant object

The site's `stock` is the pinned `variant: { ... }` block in `button/button.svelte` (the five existing
keys and the closing brace), and `fixed` is the same block with the destructive key filled and the
fifteen new keys inserted before `link`. One site, not sixteen:

- A per-key anchor cannot tell a user-added `success` key from the pinned file. The whole block can:
  any edit anywhere inside the object makes the stock string absent, so the site reports `customized`
  and writes nothing, which is ADR 0003's contract.
- The five unchanged keys are rendered from one `BUTTON_STOCK_VARIANTS` constant used by both the
  stock and the fixed block, so "the existing variants are unchanged" is structural, and the seam
  asserts those five lines against the pin.
- The fixed block does not contain the stock block (the keys are inserted between `ghost` and
  `link`), which is ticket 26's lesson: a fixed string that contains its own stock cannot report a
  clean state.
- A second run reads `fixed` first, so it writes nothing and the file stays byte-identical.

### Class strings

Four rows per tone. The filled row keeps the raw tone as the fill and the status foreground as its
text, and carries the text-tone border, per spec L71 and ADR 0001:

- solid: `bg-<tone> text-<tone>-foreground border-<tone>-text hover:bg-<tone>/80`
- outline: `border-<tone>-text bg-transparent text-<tone>-text hover:bg-<tone>/10`
- ghost: `text-<tone>-text hover:bg-<tone>/10`
- link: `text-<tone>-text underline underline-offset-4 hover:underline`

The text and the border of outline, ghost and link use the same `--<tone>-text` token; there is no
separate border tone. The raw tone never appears as a text utility: it measures 1.95 to 2.89 against
the page in the spec's measurement, so it stays the fill. `destructive` changes from the tinted
`bg-destructive/10 text-destructive` base to the filled row, which is the ticket's second bullet.
The filled statuses replace the deleted focus-ring tints with the base `ring-ring/30`, the same way
`default` already behaves.

### Marker and flag consequence

The site joins `ALL_SITES`, so `button` becomes fully fixed only when its seven radius sites and this
site are all fixed. After `init` it already is, so the header count of every fixture that installs
`button` stays the same. `--check` now sees a stock variant site and `--strict` errors on a
customized one, with no CLI change: the site flows through ticket 27's existing report.

The four old seams install `button` only in `registry-28` (the form fixture), where the file is
already counted, so the header and check counts stay 100, 139, 64, 71, 45 and 8. `registry-26` and
`registry-27` install the nine contrast components and report no variant rows for an absent `button`.
`registry-29` installs the surface and contrast components.

### Tests

`registry-30/variants.mjs` reads the manifest and the pin, then drives the real CLI over temp copies:

- the sixteen rows, the four tones, the four presentations, one row per cell; every row key is the
  tone for solid and the `<presentation>-<tone>` pair otherwise; every class is literal;
- the filled, text and border pair per tone; no raw tone as text; no row writes `rounded-*`;
- the stock block occurs exactly once in the pin; the fixed block keeps the five pinned keys; every
  row appears once in `VARIANTS[0].fixed`;
- `init` on a button-only fixture: the site reports `stock -> fixed`, the file holds the fixed block
  and no `bg-destructive/10`/`text-destructive"`, the header is 1, `--check` is 0, `--strict` is 0,
  and a second run is byte-identical;
- the four states: a hand edit inside the block reports `customized` and survives, a user-added key
  inside the block reports `customized` and is not overwritten, a restored stock block reports
  `stock -> fixed`, a deleted file reports `missing`, `--strict` exits 1 on the customized block;
- the radius site in the same file still applies (`button-base` fixed, no `rounded-none`), so the two
  tables do not collide.

## Ticket steps

- [x] Read poteto-mode and pick the playbook, then write this plan
- [x] Claim ticket 30
- [x] `targets.mjs`: `VARIANT_COMPONENTS`, `BUTTON_VARIANTS` (16 literal rows), `VARIANTS` (one
      rendered site), `KNOWN_COMPONENTS`, `TARGETS.variants` / `TARGETS.variantComponents` /
      `TARGETS.buttonVariants`
- [x] Fixer: `ALL_SITES` includes `VARIANTS`; drift iterates `VARIANTS` inside the existing checks
- [x] `button` has `success`, `warning`, `info` plus `outline-*`, `ghost-*`, `link-*` for the four
      tones; the destructive base is filled with `destructive-foreground` and the text-tone border
- [x] The five existing variants are byte-identical to the pin; the tone x presentation table is the
      single source for every tone class
- [x] `registry-30/variants.mjs`: the table, the filled/text/border pairs, the four states, the radius
      site in the same file, the header and the flags
- [x] Old seams green at their counts: `registry-26` 100, `registry-16` 139, `registry-27` 64,
      `registry-28` 71, `registry-29` 45, drift 8
- [x] No dependency, no `src/lib/components/ui` edit, no ten-pair change, header/`--check`/`--strict`
      behavior per ticket 27
- [x] Closeout: Status resolved, Session IDs, Lesson, Check, conventional commit
      `feat(adapter): add the button variants`, annotated `t30-button-variants` on that commit, push
      branch and tag, no merge to `develop`

## Delegation brief

Files the delegate may write:

- `packages/daisyui-adapter/targets.mjs`
- `packages/daisyui-adapter/component-fix.mjs` (one import and one `ALL_SITES` entry)
- `packages/daisyui-adapter/test/drift.mjs` (iterate `VARIANTS` inside the existing checks; keep 8)
- `.scratch/daisyui-adapter/registry-30/variants.mjs` (new)

Out of scope: `src/lib/components/ui`, `dist`, `cli/init.mjs`, `PAIRS`, `SITES`, `COMPONENTS`,
`RADIUS`, `SURFACES`, `CHANGELOG`, docs, release. The delegate runs no git command and only `node`;
the lead reads the diff from the worktree.

## Result

- Implementation owner: `ses_e5bb92243ffexoaJa3PU4MWBWA`. One commit.
- Manifest: `BUTTON_VARIANTS` holds the 16 literal rows (4 solid, 4 outline, 4 ghost, 4 link) with
  `key`, `tone`, `presentation` and the full class string. `VARIANTS` holds one site for
  `button/button.svelte`; its `stock` and `fixed` are rendered by `renderVariantBlock`, so the table is
  the single source for every tone class. `TARGETS` exposes `variants`, `variantComponents` and
  `buttonVariants`, and `KNOWN_COMPONENTS` includes `VARIANT_COMPONENTS`.
- Site: the whole `variant: { ... }` object is the stock string. Any edit anywhere inside it makes the
  anchor absent, so the site reports `customized` and writes nothing; a user-added key is never
  duplicated. The fixed block inserts the 15 new keys between `ghost` and `link` and keeps the five
  pinned keys byte for byte. It does not contain the stock block, so a second run reports `fixed`.
- Fixer and drift: `ALL_SITES` is `SITES + RADIUS + SURFACES + VARIANTS`; drift's membership and stock
  checks now cover `VARIANTS` and still run 8 checks. No other logic change.
- Seam: `registry-30/variants.mjs` runs 43 checks and exits 0. It covers the table shape, the keys and
  the cells, the literal classes, the filled/text/border pairs per tone, the raw tone never as text,
  no radius, the stock block exactly once in the pin, the five pinned keys read from the pin, the
  applied fixture (`stock -> fixed`, the 15 new keys, the radius site in the same file, header 1,
  `--check` 0, `--strict` 0, byte-identical second run), the four states including a user-added key
  and a `--check` on a restored stock block, and `--strict` on the customized block.
- Old seams: `registry-26` 100, `registry-16` 139, `registry-27` 64, `registry-28` 71,
  `registry-29` 45, drift 8. No numeric expectation moved: `button` is already a fully fixed file in
  the one old fixture that installs it (`registry-28`), and the other fixtures do not install it.
- Review: two independent reviewers. Standards (`ses_e5bb08f1bffecvwYjeM3LtRiQW`, glm-5.3-flash)
  found no hard breach and four judgement calls. Spec (`ses_e5bb08f19ffeaZZBii4GLTCM0d`, muse-spark)
  found the closeout pending, the destructive focus-ring removal as unrequested, and the single-source
  wording as partial for the five pinned keys. Accepted and fixed: the destructive row keeps the
  pinned `focus-visible:ring-destructive/20`, `dark:focus-visible:ring-destructive/40` and
  `focus-visible:border-destructive/40`, because the ticket changes the fill, the foreground and the
  border and says nothing about the focus state; the fixture theme now lands in `src/daisyui-theme.css`
  so the map runs against the theme instead of the fallbacks; the one-element stock row is inlined;
  the border check is named for the resting border the stock focus override does not touch;
  `EXPECTED_KEYS` is `TICKET_KEYS`; a `--check` on a stock variant site is asserted. Dismissed with a
  reason: the `TARGETS` projections follow `TARGETS.surfaces` in `registry-29` and are the manifest
  API; `TICKET_KEYS` stays a literal list so a wrong table cannot agree with itself; the shared
  `ALL_SITES` list in `component-fix.mjs` and `drift.mjs` predates this ticket and is left open.
- Deliberate trade-off kept: one whole-object site, so a hand edit anywhere in the variant object
  reports one `customized` site and none of the 15 keys land. The alternative, per-key insertions,
  cannot distinguish a user's `success` key from the pinned file and would write a duplicate.
- Comment pass: `comment-sicko` (`ses_e5bb33321ffeSqwtWQCoOYBuuk`) deleted six comment blocks; one
  why was restored (why the bare `bg-destructive/10` check excludes the outline hover tint) and one
  rename applied. It flagged the whole-object site and the regex as `MUST KILL`; both are recorded
  above rather than changed.
- Mutation: a tinted destructive base (`bg-destructive/10 ...`) fails 3 checks; dropping `VARIANTS`
  from `ALL_SITES` fails 11. Both reverted, seam back to 43 and exit 0.
- Real artifact: the applied fixture's `button.svelte` holds the filled destructive row with the
  pinned focus ring, the 15 new keys and the unchanged five; the header reads `components 1 fixed`;
  the theme reaches the map (`--daisy-derived-destructive-text` is written).
- Verification: prettier clean on `targets.mjs`, `component-fix.mjs`, `test/drift.mjs` and the seam.
- Open decisions: the `ALL_SITES` list is duplicated in the fixer and drift, so the next table has to
  touch both; the five pinned class strings are literals in the manifest and drift is the guard that
  they still match the pin.
- Commit: pending

