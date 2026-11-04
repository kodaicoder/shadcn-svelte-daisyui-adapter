Phase: feature

# Ticket 28, radius for the form controls

Ticket: `.scratch/daisyui-adapter/issues/28-radius-form.md` (Status: ready-for-agent, Blocked by: 26, resolved).
Branch: `fix/nutchapon/ai/new-variants`. Base: `9e3019d` (tag `t27-fixer-safety`).
Session: `ses_e5d979074ffeWhtLLDlEFHaqwq`.
Next tickets, untouched: 29-34.
Playbook: Feature. poteto-mode drives; the ticket is input.

Gate record: the spec and ticket gates passed before this session. Ticket 26 is resolved and ticket 27
is closed at `9e3019d` with tag `t27-fixer-safety`. No gate pass is claimed here.

## Plan

Matched playbook: Feature (1-8), then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: read end to end this turn: `targets.mjs`, `component-fix.mjs`, `cli/init.mjs`, the eleven stock
   components, spec L74-82 and L119-128, ADR 0002 and 0003, the glossary terms, and the `registry-26`
   (100 checks), `registry-27` (64) and `registry-16` (139) seams plus `test/drift.mjs` (8). The stock
   `rounded-none` set and the scale rows in `src/routes/layout.css` are measured, not assumed.
2. `architect` for parallel design exploration.
   skip: the four-state matcher is fixed by ADR 0003, and the format decision reduces to one table in
   the existing manifest (see Decisions). No second architecture is in play.
3. Write the throughput checkpoint as four todo items.
4. Delegate code-writing to a subagent using the feature model
   (`opencode-go/deepseek-v4.1-flash#high`), with the data shape and success criteria below. The
   delegate runs `node` and writes its diff to a temp file; it runs no git command, because a
   subagent's git opens a pager and hangs.
5. Verify on the matching surface. `registry-28/radius.mjs` (new), `registry-26` 100 checks,
   `registry-16` 139, `registry-27` 64, drift 8. Each fixture runs the real CLI against copies of the
   pinned stock components.
6. Rebase into small, ordered commits. One commit for this ticket.
   Use the **sequence-verifiable-units** principle skill: manifest, fixer, warning, then the seam.
7. If the design is contested, `interrogate` before shipping.
   skip: not contested. ADR 0002 fixes the role and size mapping, and ADR 0003 fixes the state model.
8. Run **Opening a PR**.
   skip: the operator delivers by branch push and annotated tag, and forbids a merge to `develop`.

## Throughput checkpoint

- **Blocking first steps.** The `RADIUS` table blocks the fixer, the CLI scope and every assertion.
   The fixer must apply it before the seam can measure anything. The 2rem warning is independent of
   the table and lands second.
- **Independent workstreams.** None worth a split. The table, the fixer loop and the warning meet in
  `init.mjs`'s single write and one manifest; a second worker would race the report format and the
   header count. `registry-28` is written after the implementation so it can assert the final shape.
- **Shared mutable state.** One writer on the branch. The delegate holds the worktree; the lead writes
   only this audit file while it runs. Fixtures write only into `$TEMP`.
- **Smallest safe decomposition.** One worker, one commit. The changes are 13 site files plus one
   table and one warning; splitting them would create two half-fixed manifests.

## Decisions

### Manifest shape

Radius is a second table in the same manifest, not entries in `SITES`:

```js
export const RADIUS_COMPONENTS = [ ...eleven names... ];
export const ROLE_STEPS = { selector: 'sm', field: 'md', box: 'lg' };
export const SIZE_STEPS = { xs: 'sm', sm: 'sm', 'icon-xs': 'sm', 'icon-sm': 'sm',
                            default: 'md', md: 'md', icon: 'md', lg: 'lg', 'icon-lg': 'lg' };
export const RADIUS = [
  { id, component, file, role | size, step, stock, fixed },
  ...
];
export const KNOWN_COMPONENTS = [...new Set([...COMPONENTS, ...RADIUS_COMPONENTS])];
export const TARGETS = { supported, components, sites, pairs, radius: RADIUS, radiusComponents: RADIUS_COMPONENTS };
```

Alternatives considered:

| Shape | Why not |
| --- | --- |
| Radius entries appended to `SITES` | `registry-26` iterates `SITES` over a fixture that holds only the nine contrast components; radius entries would throw on the absent files and break the 100 and 64 counts. It also makes `COMPONENTS` 20 and rewrites a contract ticket 27 just closed. |
| A second rule engine with `anchor`/`insert` and its own state detector | Two matchers, two fixed-state definitions and a new failure mode. ADR 0003's four states are the contract. |
| Literal `stock`/`fixed` entries in `RADIUS` (chosen) | Reuses `stateOf`, `split/join`, idempotency and the per-site report unchanged. `SITES`/`COMPONENTS`/`PAIRS` keep their counts, so `registry-26`, `registry-16` and `registry-27` stay green. |

The fixer builds its file map from `SITES` plus `RADIUS`, validates `fix <name>` against
`KNOWN_COMPONENTS`, and counts `fullyFixed` over both tables. A file present only in `RADIUS`
participates in the header count exactly as a contrast file does.

### Role and size mapping

- Fixed-size: input, textarea, input-group and its addon, select content and item, checkbox, radio
  group, input-group addon keycap. `selector` to sm, `field` to md, `box` to lg.
- Size-bearing: button, toggle, native-select, select trigger, input-group-button, switch. The size
  step wins over the role. The base entry carries the default step; a size that differs adds
  `rounded-sm` or `rounded-lg` inside its own variant string, which `tv`/`cn` merges (tailwind-merge
  keeps the later class).
- `native-select`, `select-trigger` and `switch` have a `data-size` attribute and no variant string,
  so the small step rides as `data-[size=sm]:rounded-sm` beside the base `rounded-md`.
- `radio-group` is a named target with no site: its item and dot are `rounded-full`, which the ticket
  excludes. `registry-28` asserts both stay.
- `select-content` is a box surface (lg); `select-item` is a field row (md); the select trigger is
  size-bearing (md, sm at `data-size=sm`).

### 2rem warning

`init` reads the effective `--radius` after the theme parse: `themes.light['--radius-box']`, or the
current `:root` `--radius` fallback when no theme exists, unwrapped from an earlier binding. It
converts `px` directly and `rem` at 16px per rem, and warns only above 32px, printing the raw value
and the px value. `calc()` or an unknown unit is skipped, because it cannot be compared. There is no
clamp: the binding stays `var(--daisy-radius, <old>)` and the scale rows stay
`calc(var(--radius) * k)`.

### Scale

`src/routes/layout.css` already holds the linear rows (sm 0.6, md 0.8, lg 1.0, xl 1.4, 2xl 1.8,
3xl 2.2, 4xl 2.6). The ticket does not ask `init` to write them, and `rebuild` never touches a key
outside `BINDING_KEYS` and the chart rows. `registry-28` parses the rows, asserts the coefficients,
zero and order, and asserts a run leaves them byte-identical.

## Ticket steps

- [x] Read poteto-mode and pick the playbook, then write this plan
- [x] Claim ticket 28 (`ses_e5d979074ffeWhtLLDlEFHaqwq`)
- [x] `targets.mjs`: `RADIUS`, `RADIUS_COMPONENTS`, `ROLE_STEPS`, `SIZE_STEPS`, `KNOWN_COMPONENTS`,
      `TARGETS.radius`; `component-fix.mjs` re-exports the new names
- [x] Fixer: file map over `SITES` + `RADIUS`, `targetSites` validates `KNOWN_COMPONENTS`, the
      fully-fixed count covers both tables
- [x] All 24 radius sites: button, toggle, input, textarea, native-select, select trigger/content/
      item, input-group and its button and addon, checkbox, switch
- [x] `rounded-full`, edge joining and the calendar `--cell-radius` untouched; no style guard returns
- [x] `init` warns above 2rem (32px), prints raw and px, no clamp
- [x] `registry-28`: zero, large value, order, 2rem warning, the role/size mapping, idempotency,
      four states, the excluded classes, the drift of every stock string
- [x] `registry-26` 100, `registry-16` 139, `registry-27` 64 and drift 8 stay green
- [x] No dependency, no `src/lib/components/ui` edit, no ten-pair change, header/`--check`/`--strict`
      behaviour preserved
- [x] Closeout: Status resolved, Session IDs, Lesson, Check, conventional commit, annotated
      `t28-radius-form` on that commit, push branch and tag, no merge to develop

## Delegation brief

Files the delegate may write:

- `packages/daisyui-adapter/targets.mjs`
- `packages/daisyui-adapter/component-fix.mjs`
- `packages/daisyui-adapter/cli/init.mjs`
- `packages/daisyui-adapter/test/drift.mjs` (iterate `RADIUS` inside the existing checks; keep 8)
- `.scratch/daisyui-adapter/registry-28/radius.mjs` (new)

Out of scope: `src/lib/components/ui`, `dist`, `PAIRS`, `SITES`, `COMPONENTS`, `CHANGELOG`, docs,
release. The delegate runs no git command; it writes `git diff` output to
`$TEMP/t28-diff.txt` for the lead to read.

## Result

- Implementation owner: `ses_e5d929d6affeNeSTglM06yO6N8`. One commit.
- Manifest: 25 radius sites across 13 files in the same `targets.mjs`, plus the eleven
  `RADIUS_COMPONENTS`. `radio-group` stays a named target with no site because both its radius
  classes are `rounded-full`.
- Fixer: the file map, the per-site report and the fully-fixed count read `SITES` plus `RADIUS`;
  `fix <name>` validates `KNOWN_COMPONENTS`. An unnamed run reports a radius `missing` row only when
  the component directory exists or the component was named, so a project that installed one form
  control does not see the other ten as gaps. Contrast `missing` rows are unchanged.
- Warning: `init` reads `themes.light['--radius-box']`, or the unwrapped `:root` `--radius` without
  a theme, and warns above 32px with the raw and px values. A dark-only rung above 2rem is not
  warned, because the adapter binds one `--radius` and the generator emits one radius for both
  blocks. Recorded as a known limit, not a defect against this ticket.
- Review: two independent reviewers, Standards and Spec. Accepted: the RADIUS comment, the
  table-membership check in `reportMissing`, drift's reverse membership guard and file-level
  existence check, the untested missing, partial-set, `calc()` and unknown-unit branches, the two id
  renames, the trimmed re-export, the section-label cleanup and the anti-agreement note. Dismissed:
  splitting the drift check into two (the combined check carries both guards), the remaining id
  names, and `0 * k === 0` (the coefficient check catches an additive offset). A fresh verification
  reviewer approved the fixes.
- Mutation: `button-sm` writing `rounded-lg` while its step stays `sm` fails the step/class check; a
  64px warning threshold fails the 2.5rem, 33px and fallback checks.
- Real surface: `fix --dry-run` in the repo reports all 25 radius sites stock, 36 stock in total.
- Comment pass: the lead read the new comments; none narrates the change and none was deleted.
  `comment-sicko` was not spawned because it hung in ticket 27.
- Verification: registry-28 71 checks, registry-26 100, registry-27 64, registry-16 139, drift 8,
  all exit 0. Prettier clean on the five source files.
- Commit: `feat(adapter): round the form controls`, annotated tag `t28-radius-form`.
