Phase: feature

# Ticket 29, radius for the surfaces

Ticket: `.scratch/daisyui-adapter/issues/29-radius-surfaces.md` (Status: ready-for-agent, Blocked by: 26, resolved).
Branch: `fix/nutchapon/ai/new-variants`. Base: `e85157c` (tag `t28-radius-form` at `293d69f`).
Session: `ses_e5c15293fffeOE2q3V31L2kDs7`.
Next tickets, untouched: 30, 31, 32, 33, 34.
Playbook: Feature. poteto-mode drives; the ticket is input.

Gate record: spec and ticket gates passed before this session. Ticket 26 is resolved, 28 is closed at
`e85157c` with tag `t28-radius-form`. No gate pass is claimed here.

## Plan

Matched playbook: Feature (1-8), then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: read end to end this turn: `targets.mjs`, `component-fix.mjs`, `cli/init.mjs`, `test/drift.mjs`,
   spec L74-82 and L119-128, ADR 0002 and 0003, the glossary terms, the three old seams (`registry-26`
   100 checks, `registry-27` 64, `registry-28` 71) and `registry-16` 139, plus all 39 pinned stock files
   the surfaces live in. Every stock anchor was counted in the pin before it entered the table.
2. `architect` for parallel design exploration.
   skip: the four-state matcher and the manifest shape are fixed by ADR 0003 and ticket 28. The only
   open decision, whether a surface file joins the marker count, is forced by ADR 0003's definition of
   a replacement site and by user story 5 (`--check` must see a stock site); see Decisions. No second
   architecture is in play.
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using your configured feature model
   (`opencode-go/deepseek-v4.1-flash#high`), with the data shape and success criteria below. The
   delegate runs `node` and writes its diff to a temp file; it runs no git command, because a
   subagent's git opens a pager and hangs.
5. Verify on the matching surface. `registry-29/surfaces.mjs` (new), `registry-26`, `registry-16`,
   `registry-27`, `registry-28` and drift. Each fixture runs the real CLI against copies of the pinned
   stock components. The three old seams keep their check counts; only the numeric expectations that a
   larger target set necessarily moves are updated, and each new number is explained in the Result.
6. Rebase into small, ordered commits. One commit for this ticket.
   Use the **sequence-verifiable-units** principle skill: manifest, fixer wiring, seam updates, then
   the new seam.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. ADR 0002 fixes box to lg; ADR 0003 fixes the states; the operator's step 5 and
   step 6 fix the seam and marker constraints.
8. Run **Opening a PR**.
   skip: the operator delivers by branch push and annotated tag, and forbids a merge to `develop`.

## Throughput checkpoint

- **Blocking first steps.** The `SURFACES` table blocks the fixer wiring and every assertion. The
  seam updates depend on the final table, so they land after it. The new `registry-29` seam is written
  last, against the finished artifact.
- **Independent workstreams.** None worth a split. The table, the two call sites (`ALL_SITES` in the
  fixer and in drift) and the three seam expectation updates meet in one report format and one
  header count; a second worker would race both. `registry-29` is written after the implementation so
  it can assert the final shape.
- **Shared mutable state.** One writer on the branch. The delegate holds the worktree; the lead writes
  only this audit file while it runs. Fixtures write only into `$TEMP`.
- **Smallest safe decomposition.** One worker, one commit. The change is one table of 45 sites, two
  one-line wirings and three numeric expectation updates; splitting it would leave a half-fixed
  manifest whose header count is wrong.

## Decisions

### Manifest shape

Surfaces are a third table in the same manifest, beside `SITES` and `RADIUS`:

```js
export const SURFACE_COMPONENTS = [ ...fourteen names... ];
export const SURFACES = [
  { id, component, file, role: 'box', step: 'lg', stock, fixed },
  ...
];
export const KNOWN_COMPONENTS = [...new Set([...COMPONENTS, ...RADIUS_COMPONENTS, ...SURFACE_COMPONENTS])];
export const TARGETS = { supported, components, sites, pairs, radius, radiusComponents,
                         surfaces: SURFACES, surfaceComponents: SURFACE_COMPONENTS };
```

Alternatives considered:

| Shape | Why not |
| --- | --- |
| Surface entries appended to `RADIUS` | `registry-28` asserts `RADIUS_COMPONENTS` is exactly the eleven form components, that every `RADIUS` component is in that list, and that no radius file is under `calendar/`; all three would have to be deleted, which removes ticket 28's guard. |
| A second rule engine with `anchor`/`insert` and its own state detector | Two matchers and two fixed-state definitions. ADR 0003's four states are the contract. An insertion is already expressible as a longer stock string whose fixed string adds the class, as ticket 28's `input` site does. |
| Literal `stock`/`fixed` entries in `SURFACES` (chosen) | Reuses `stateOf`, `split/join`, idempotency, per-site reporting and the fully-fixed count unchanged. `SITES`, `COMPONENTS` and `PAIRS` keep their counts, so the contrast contract is untouched. |

`component-fix.mjs` gains `SURFACES` in `ALL_SITES`; `targetSites` already validates against
`KNOWN_COMPONENTS`; `reportMissing` already reports a non-contrast site only when its component
directory exists or it was named, so a project that installed no surface gets no rows.

### Surface sites

45 sites across 39 files. Each is a `rounded-none` replacement inside one class string, an insertion
where the stock class is absent, or the calendar head/select alignment:

- `card` 2 (image corner pair as one site, header), `dialog` 1, `alert` 1 (insert), `popover` 1,
  `dropdown-menu` 6, `context-menu` 6, `menubar` 8, `sheet` 1 (insert), `drawer` 5 (four directions
  and the handle), `navigation-menu` 4 (content, viewport, link, trigger), `command` 3 (root insert,
  item, link-item), `hover-card` 1 (insert), `table` 1 (insert), `calendar` 5.
- A site whose class string carries the same utility twice (card image corners, navigation link,
  command items) uses one stock string that spans both occurrences, so the report stays one row.
- Two files may carry the same stock text (`dropdown-menu-checkbox-item` and `-radio-item`, the
  context and menubar mirrors). The fixer matches per file, so that is not a collision.

### Role

Every surface site is `role: 'box'`, `step: 'lg'`, per the ticket's first bullet. That includes the
three calendar alignment files: their `rounded-md` is a field step, not the box step, so they move to
`lg`. The chart tooltip already carries `rounded-lg`, so it is aligned by the pin, not patched, and
`registry-29` asserts it.

### Exclusions

- `rounded-full` is never written; `radio-group` stays a named radius target with no site.
- The calendar `rounded-(--cell-radius)`, `rounded-s-`/`rounded-e-(--cell-radius)` utilities and the
  `[--cell-radius:0]` property stay. Day cells are not surface sites.
- `navigation-menu-indicator` is the diamond pointer that joins the trigger to the viewport edge. It
  keeps `rounded-none`, because lg on an 8px square is a dot and the spec excludes edge joining. The
  seam asserts it is unchanged.
- `range-calendar` head cells and selects mirror the calendar's and stay at `md`. The ticket names the
  four existing sites and the calendar component only; the asymmetry is reported as an open decision.
- The chart tooltip's `rounded-[2px]` indicator dot is not a surface class and is untouched.

### Marker and flag consequence

A surface file is a target component file, so ADR 0003's fully-fixed count includes it and
`--check` sees a stock surface. That grows the numbers the three old seams pin, because their
fixtures install components that now have surface sites:

- `registry-26`: 11 rows to 38 (11 contrast + 22 surface rows in the shared dirs + 5 calendar
  alignment rows); `fix dialog` reports its two sites.
- `registry-27`: header 10 to 30 (10 contrast files + 20 new surface files: dropdown 5, context 5,
  menubar 7, calendar 3); mixed 29, named 29, vega-shaped 28, late 30, dry run 30, replaced 30.
- `registry-28`: the calendar fixture gains three alignment files, so 16 to 19 before the delete and
  15 to 18 after. Its 13-file header fixture has no surfaces and stays 13.
- `registry-16` (139) and drift (8) are unchanged.

The check counts stay 100, 64, 71, 139 and 8. Each updated expectation is an arithmetic consequence
of the table, not a relaxed assertion.

### Tests

`registry-29/surfaces.mjs` reads the manifest and the pin, then drives the real CLI over temp copies:

- the fourteen names, the table membership, box to lg, every stock present in the pin, every fixed
  string writes lg and no `rounded-none`, no `rounded-full`, no fixed string contained in its own
  stock, no range-calendar file, and the four existing scale sites (three patched to lg, the chart
  tooltip already lg);
- an applied fixture over all fourteen components plus the nine contrast ones: every surface fixed,
  every contrast site still fixed in the shared files, the calendar edge utilities and `--cell-radius`
  intact, the nav indicator still `rounded-none`, the header count, `--check` and `--strict` clean,
  and a byte-identical second run;
- the four states on a surface: a hand edit reports `customized` and survives, a restored stock site
  reports `stock` and is rewritten, a deleted file reports `missing` and is not recreated;
- zero and a large value: lg is 1.0 in the scale, every step is 0 at `--radius: 0`, `sm < md < lg` at
  10rem, and no clamp appears in the binding or the scale rows.

## Ticket steps

- [x] Read poteto-mode and pick the playbook, then write this plan
- [x] Claim ticket 29
- [x] `targets.mjs`: `SURFACE_COMPONENTS`, `SURFACES`, `KNOWN_COMPONENTS`, `TARGETS.surfaces` /
      `TARGETS.surfaceComponents`
- [x] Fixer: `ALL_SITES` includes `SURFACES`; no other logic change
- [x] All 45 surface sites: card, dialog, alert, popover, dropdown-menu, context-menu, menubar,
      sheet, drawer, navigation-menu, command, hover-card, table, calendar
- [x] The box role maps to lg; the four existing scale sites align (calendar head/selects to lg,
      chart tooltip already lg)
- [x] `rounded-full`, edge joining, the calendar `--cell-radius` and the nav indicator untouched
- [x] `registry-29/surfaces.mjs`: surface classes, four states, shared-file contrast sites, zero and
      10rem
- [x] Old seams green at their check counts: `registry-26` 100, `registry-16` 139, `registry-27` 64,
      `registry-28` 71, drift 8
- [x] No dependency, no `src/lib/components/ui` edit, no ten-pair change, header/`--check`/`--strict`
      behavior per ticket 27
- [x] Closeout: Status resolved, Session IDs, Lesson, Check, conventional commit, annotated
      `t29-radius-surfaces` on that commit, push branch and tag, no merge to develop

## Delegation brief

Files the delegate may write:

- `packages/daisyui-adapter/targets.mjs`
- `packages/daisyui-adapter/component-fix.mjs`
- `packages/daisyui-adapter/test/drift.mjs` (iterate `SURFACES` inside the existing checks; keep 8)
- `.scratch/daisyui-adapter/registry-26/fix.mjs` (numeric expectations only)
- `.scratch/daisyui-adapter/registry-27/safety.mjs` (numeric expectations only)
- `.scratch/daisyui-adapter/registry-28/radius.mjs` (two header numbers and their comments)
- `.scratch/daisyui-adapter/registry-29/surfaces.mjs` (new)

Out of scope: `src/lib/components/ui`, `dist`, `PAIRS`, `SITES`, `COMPONENTS`, `RADIUS`,
`RADIUS_COMPONENTS`, `cli/init.mjs`, `CHANGELOG`, docs, release. The delegate runs no git command; it
writes `git diff` output to `$TEMP/t29-diff.txt` for the lead to read.

## Result

- Implementation owner: `ses_e5c091c18ffe4akVSxm90775i5`. One commit.
- Manifest: `SURFACES` holds 45 sites across 39 files in the same `targets.mjs`, plus the fourteen
  `SURFACE_COMPONENTS`. Every entry is `role: 'box'`, `step: 'lg'`. `TARGETS.surfaces` and
  `TARGETS.surfaceComponents` expose them; `KNOWN_COMPONENTS` now names 28 components, so
  `fix drawer`, `fix card` and the rest validate.
- Fixer: `ALL_SITES` is `SITES + RADIUS + SURFACES`. No logic change: the file map, `stateOf`,
  `split/join`, `reportMissing`, the row report, the four states and the fully-fixed count are the
  ticket-26/27 machinery unchanged.
- Drift: the existing eight checks now cover surfaces in the membership, directory and stock checks.
- Seam expectations: `registry-26` 38 rows in the five row-count checks and two rows for `fix dialog`
  (plus its snapshots now include surface files, so "byte-identical" and "writes nothing" cover them);
  `registry-27` header 30/29/30/30/30/29/28 and its snapshots include surface files; `registry-28`
  18 before/after the delete, `headerFor(13)` untouched. Check counts stay 100, 64, 71.
- Seams: `registry-29` 45 checks; `registry-26` 100, `registry-16` 139, `registry-27` 64,
  `registry-28` 71, drift 8, all exit 0.
- Review: one independent reviewer (`ses_e5bff22d7ffeC00Dh7q0zQ9UzM`, muse-spark). Accepted: the
  snapshot coverage gaps in `registry-26` and `registry-27` (a surface write would have passed a
  "writes nothing" check), the `fix dialog` other-stock check now covers surfaces, all ten contrast
  ids in `registry-29` (not seven), a stock string must occur exactly once, and the vacuous
  `0 * k === 0` zero check now pins the row shape. Dismissed: widening `registry-28`'s
  `formSnapshot`, because that check is named for the form files and `registry-29` owns the surface
  no-write proof. No collision, idempotency or DoD gap was found.
- Mutation: `card-header` writing `rounded-xl` fails `every fixed string writes rounded-lg`; dropping
  `SURFACES` from `ALL_SITES` fails 11 checks including the applied fixture, the header, `--check`
  on a stock surface and all four states. Both reverted; the six seams are green at their counts.
- Real surface: `fix --dry-run` in the repo reports `81 stock`, and 45 of those rows are surface
  sites, so the fixer reads the new table on the repo's own pin.
- Comment pass: the lead read the new comments; none narrates the change and none was deleted.
  `comment-sicko` was not spawned because it hung in ticket 27.
- Verification: prettier clean on the seven changed files.
- Open decision: `range-calendar` mirrors the calendar's head cells and selects and stays at `md`,
  because the ticket names the four existing calendar sites and the calendar component only. The
  drawer and sheet surfaces get `lg` on all four corners even on a flush edge, because the ticket
  maps the box role to the surface; both are recorded rather than silently widened.
- Commit: `9d5bfa8` `feat(adapter): round the surfaces`, annotated tag `t29-radius-surfaces` on that
  commit, branch and tag pushed to `origin`. Temp fixtures and the mutation copies were removed
  after the close.
