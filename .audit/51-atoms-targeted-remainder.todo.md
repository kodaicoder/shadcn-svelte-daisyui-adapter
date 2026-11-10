Phase: implementation

# Ticket 51: Atoms, targeted remainder

Ticket: `.scratch/daisyui-adapter/issues/51-atoms-targeted-remainder.md`
Spec: `.scratch/daisyui-adapter/spec.md`
Branch: `fix/nutchapon/ai/contrast-warning`
Base: `3c5deed`
Playbook: Feature
Session: `ses_e3bf72385ffeFALeHHC2Njjlc7`

## Blast radius

state: unbuilt (`graphify-out/graph.json` is missing; freshness exit 5)
seeds: `src/routes/+page.svelte`, `.opencode/skills/verify/scripts/drive.mjs`, `ui/native-select/native-select.svelte`, `targets/radius.mjs`, `targets/binary.mjs`
anchors:
`.opencode/skills/verify/scripts/drive.mjs` <- reviewer page `data-scheme` / `data-case` hooks
`src/lib/components/*-fixed/index.ts` <- the import surface the pages use
`packages/daisyui-adapter/test/drift.mjs` <- reads every radius stock string under `ui`
`src/routes/layout.css` <- Tailwind scans the source that holds the tone literals
unlisted: `.opencode/skills/verify/SKILL.md` (the helper table lists the journey names, so a new journey makes it stale), `src/routes/page.svelte.e2e.ts` (asserts an `h1` on `/`), `docs/component-color-usage.md` (records reviewer-page measurements per component), `src/lib/components/ui/field/field-label.svelte` (`/` renders `FieldLabel` around the binary controls)
fallback: rg over `src/routes`, `.opencode/skills/verify`, `src/lib/components`, `packages/daisyui-adapter`

## Playbook: Feature

**You own the design. Plan, review, verify.** Delegate implementation. Stay in the lead.

1. `how` over the affected subsystem.
2. `architect` for parallel design exploration.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file, no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target (the **separate-before-serializing-shared-state** principle skill). Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Delegate code-writing to a subagent using your configured feature model (default in poteto-mode's Models section) with a specific scope (file paths, named data shape and its organizing structure per **principle-model-the-domain**, a state machine over scattered booleans, a table/registry over branching, a typed model over repeated shape assumptions, chosen before the delegate writes logic, and success criteria). Pick each subagent's reasoning level for the job, per the Subagents section. When the implementation admits multiple valid shapes (error handling, abstraction layer, test structure), delegate via the **arena** skill instead so the runners surface the alternatives and the cross-judge guards the pick. Mandatory: no skip-with-reason escape, and Laziness Protocol does not override it (the gain is review separation, not lines saved). A subagent forbidden to spawn satisfies this by owning the diff directly with the same review separation. No "standing by" reply that waits on a nested agent. **Give every file-writing delegate its own worktree** (spawn it with `isolation: "worktree"`, or hand it an exclusive branch), and do not write files or run a suite in a worktree a delegate still holds. On Claude Code, `isolation: "worktree"` branches from the remote default branch unless the `worktree.baseRef` setting is `"head"`. When the delegate builds on commits the default branch lacks, commit them, create its worktree with `git worktree add <path> -b <delegate-branch> HEAD`, and name that base commit in the brief. Fencing a file in the brief's prose is not a lock (**principle-separate-before-serializing-shared-state**). Comments per **Comments**. Surgical edits, re-ground against the source for upstream-derived files. Port shared-primitive improvements to all consumers and verify each. Commit liberally.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits. Stack follow-ups.
   Use the **sequence-verifiable-units** principle skill, building, verifying, and committing each small unit before the next.
7. If the design is contested, `interrogate` before shipping.
8. Run **Opening a PR**.

Code-coupled work (one feature, one migration) goes to a single owner with the checkpoint inline. That owner fans out internally after the blocking phase. Parent-level fan-out is for slices that produce independent artifacts (audits, cross-subsystem investigations, competing experiments). Rewrite the checkpoint at phase boundaries. Spawn a fresh owner rather than chaining interrupts.

**Reply:** what you built, what you chose and why, the throughput checkpoint, open decisions. Tables for design alternatives.

## Throughput checkpoint

- **Blocking first steps.** `how` and `architect` before any edit; the shared module and route shape decided before pages are written.
- **Independent workstreams.** Shared module (`src/lib/review/`) and the refactor of `/`; the three review routes; the three journeys; the `native-select-fixed` copy. Routes depend on the shared module, so they serialize behind it.
- **Shared mutable state.** `drive.mjs` is one file for every journey, and `+page.svelte` is one file for the refactor. No two workers touch either: one owner writes the shared module, the routes, and the page; a second owner may prepare the fixed copy in its own directory.
- **Smallest safe decomposition.** One code owner for the app surface, because every file in that slice shares the `data-scheme` contract and splitting it invites two writers on one contract.

## Tasks

- [x] Claim ticket 51 (`pstack_claim`, session appended)
- [x] Blast radius (graph unbuilt, rg fallback)
- [x] Write playbook steps and checkpoint
- [x] `how` over the review subsystem
- [x] `architect` on route shape and shared module (arena base 2, judge agreed)
- [x] Build `src/lib/review/` (one tone map, one `Scheme` wrapper)
- [x] Refactor `src/routes/+page.svelte` onto the shared map and wrapper
- [x] Build `/review/input`, `/review/native-select`, `/review/textarea`
- [x] Generate `native-select-fixed` in a scratch run (fix, copy, revert, LF)
- [x] Add journeys `input`, `native-select`, `textarea` to `drive.mjs`
- [x] Update `.opencode/skills/verify/SKILL.md` journey list
- [x] Verify: `pnpm check`, `pnpm test:adapter`, eight journeys
- [x] Record findings as tickets under `.scratch/daisyui-adapter/issues/`
- [x] `pstack-no-comments` (no comments in scope; nothing to delete)
- [x] `code-review` round 1 (Standards and Spec); fixes applied, re-review below
- [ ] Lesson and Check lines
- [ ] Operator visual pass on all three atoms

## Code review round 1

Fixed:

- Inlined the swatch markup as a local snippet on `/`; `SwatchRow.svelte` deleted.
- `native-select-fixed` now holds only the patched `native-select.svelte`; `Option` and `OptGroup`
  re-export from `ui`, and the two byte-identical copies are gone.
- `checkField` split into `checkBaseField`, `checkFieldSize`, `checkTextarea`, `checkFocusField`,
  `checkInvalidField`, `checkDisabledField`, `checkReadonlyField`, `checkTyping`,
  `checkNativeSelect`, `checkField`; the `REVIEW` identity map deleted.
- Type `Scheme` renamed to `ColorScheme`; `FieldReview` prop renamed from `control` to `kind`.
- `index.ts` exports only the names the pages use.

Dismissed with a reason:

- Radius is not in this ticket's checklist; ticket 28 owns the radius contract and its registry
  harness. The field pages assert the states, sizes, disabled, invalid, readonly, focus ring and
  cursor the ticket names.
- An `optgroup` case is not asked for; the option list is driven through `selectOption`, and its paint
  gap is ticket 62.
- The two field route files repeat their case grid. The design chose explicit pages over a
  config-driven registry, and each stays under 45 lines.
- `Status` stays `ready-for-agent` and `Lesson`/`Check` land after the close, per the ticket pipeline.

## Findings (tickets)

- `60-disabled-field-cursor.md`: input and native-select pair `disabled:cursor-not-allowed` with
  `disabled:pointer-events-none`, so the hint never shows; textarea has no `pointer-events-none`.
- `61-readonly-field-affordance.md`: readonly input and textarea match the editable field on border,
  surface, opacity and cursor.
- `62-native-select-option-scheme.md`: the option list is `rgb(255, 255, 255)` in both schemes because
  the dark scope sets no `color-scheme`.

## Verification

- Worktree branch `ticket-51-atoms` merged fast-forward into `fix/nutchapon/ai/contrast-warning`.
- `pnpm check`: 0 errors, 0 warnings.
- `pnpm test:adapter`: all drift checks passed, 12/12.
- Journeys in the main tree: checkbox 41, switch 69, radio-group 75, toggle 61, cursor 17, input 37,
  native-select 37, textarea 39 checks, all pass.
- Heading probe: one `h3` per `[data-scheme]` on `/`, one `h1` per review route.
- Fixed copy is the stock file plus one insertion, `data-[size=sm]:rounded-sm`; `ui` and
  `src/routes/layout.css` are unchanged.

## Review fixes after the delegate

- Removed five duplicate `<h3>` left inside `<Scheme>`; the wrapper already renders the heading.
- Rebuilt `native-select-fixed` from the fixer instead of a prettier-formatted copy, so the class
  order matches what the adapter writes.
- Tightened `TONES` to `satisfies Record<Tone, ToneClasses>` so a missing or extra tone fails the type
  check instead of silently leaving the journey at "6 of 7".

## Decisions

- `input` and `textarea` import from `ui`; the fixer reports `fixed` for both, meaning stock equals fixed. Only `native-select` is patched (`data-[size=sm]:rounded-sm`), so only it gets a `*-fixed` copy.
- Three static routes, not one dynamic route: each page has a different checklist and markup, so a registry would only add branching.
- `native-select` has no `readonly` attribute, so that checklist item is `n/a: select has no readonly`.
- Skip `interrogate`: the ticket touches no auth, payments, discount, migration, concurrency, shared state, public API, or schema.

## Round 2 verification

- `targets/sizes.mjs` holds 14 sites; `targets/radius.mjs` widens the three field radii and moves the
  `input-field` and `textarea-field` entries to the `size` key.
- `fix` run twice: 17 stock on run 1, 0 stock and 17 fixed on run 2. The `input-size-file` site first
  nested its stock in its fixed and stayed `stock` on every run; it now replaces a contiguous
  `file:h-6 file:text-xs/relaxed file:font-medium` run, so the second run is clean.
- Fixed copies `input-fixed`, `textarea-fixed` and the updated `native-select-fixed` match the patched
  `ui` byte for byte after LF normalization; `ui` and `layout.css` stay stock.
- `pnpm check` 0 errors, 0 warnings. Drift 15 checks pass, including the size table count and the
  radius-anchor guard.
- Journeys: input 64, native-select 64, textarea 66; the other nine unchanged; all pass. The field
  checks cover 10/12/14 px text, 24/28/32 px height, 48/64/80 px textarea min height, the radius
  oracle per size and `data-size`, in both schemes. The 400 px default-text check runs once per field
  journey, after both schemes, and restores the viewport in a `finally`.
- `input` no longer forwards the HTML `size` attribute; the prop owns the name.

## Round 2: field sizes (reopened 2026-11-10)

The operator does not pass the three atoms until they carry sizes. Size moved here from ticket 53
because it is an atom API change and cannot ship after the atom level closes.

- [x] spec amendment approved (field size scale and the radius-by-size rule)
- [x] operator re-approved tickets 52 and 34 against the amended spec (2026-11-10)
- [x] decide the `default` font below md (12 px at every width)
- [x] `targets/radius.mjs` size sites for `input` and `textarea`, `lg` for `native-select`
- [x] `input-fixed` and `textarea-fixed` generated by the fixer; `native-select-fixed` gains `lg`
- [x] pages show one row per size; journeys assert height, font size and radius
- [x] verify `pnpm check`, drift, twelve journeys plus the size checks
- [x] `code-review`
- [ ] operator pass on all three

## Round 3: field tones (added 2026-11-10)

The operator wants the three fields to carry the seven tones, with the border and ring following the
tone, the disabled cursor visible, and readonly distinct but still focusable.

- [x] spec amendment approved (field variants and the field states)
- [x] operator re-approved tickets 52 and 34 against the amended spec (2026-11-10)
- [ ] `targets/field-variants.mjs`: the seven literal tone rows, the `variant` prop and the state fixes
- [ ] regenerate `input-fixed`, `textarea-fixed`, `native-select-fixed`; `ui` stays stock
- [ ] pages show a tone row per field; journeys assert border, ring, invalid, disabled pointer and
      readonly surface
- [ ] verify `pnpm check`, drift, twelve journeys
- [ ] `code-review`
- [ ] operator pass on all three
