Phase: implementation

# Ticket 50: follow-ups from the binary control tones review

Ticket: `.scratch/daisyui-adapter/issues/50-review-followups.md`
Spec: `.scratch/daisyui-adapter/spec.md`
Branch: `fix/nutchapon/ai/contrast-warning`
Base: `40ed7f3`

## Blast radius

state: unbuilt (`graphify-out/graph.json` is missing; freshness exit 5)
seeds: `targets.mjs`, `component-fix.mjs`, `registry-49/variants.mjs`, `drive.mjs`, `radio-group-item.svelte`
anchors:
  `packages/daisyui-adapter/component-fix.mjs` <- `targets.mjs` imports
  `packages/daisyui-adapter/test/drift.mjs` <- `targets.mjs` imports
  `.scratch/daisyui-adapter/registry-30/variants.mjs` <- `targets.mjs` imports
  `.scratch/daisyui-adapter/registry-31/variants.mjs` <- `targets.mjs` imports
  `.scratch/daisyui-adapter/registry-49/variants.mjs` <- `targets.mjs` and `component-fix.mjs` imports
  `src/routes/+page.svelte` <- fixed copies
  `.opencode/skills/verify/scripts/drive.mjs` <- the reviewer page
unlisted: `packages/daisyui-adapter/cli/init.mjs` (reads `fix`/`scan` and the header count), `packages/daisyui-adapter/package.json` (`files` must ship a split targets tree), `src/lib/components/*-fixed/index.ts` (the exported type surface), `src/lib/components/ui/field/field-label.svelte` (the stock override this ticket removes at the fixed copy), `docs/component-color-usage.md` and `packages/daisyui-adapter/README.md` (the current `Field.Label` exception sentence)
fallback: rg over the named files

## Playbook: Bug fix

### Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and the fix to subagents, stay in the lead. Pick each subagent's reasoning level for the job, per the Subagents section.

Be scientific. Every shipped line traces to runtime evidence. Belt-and-suspenders that "might help" is a hypothesis, not a fix. It does not ship. When evidence refutes a hypothesis, revert what it motivated. The smallest change the evidence justifies ships, nothing more.

1. Reproduce it yourself on the matching surface via the driver skill (Non-negotiables), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with `how` over the affected subsystem and the **why** skill for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Drive a long or stubborn hunt with Claude Code's `loop` skill. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent using your configured bug-fix model (default in poteto-mode's Models section) with a specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test would be expensive, integration-heavy, or unclear.
   This is the canonical **sequence-verifiable-units** principle skill, the failing test first and the fix on top.
6. Run **Opening a PR**.

**Reply:** what was broken, root cause, fix, how you verified. Quote the decisive failing and passing output, trimmed to the assertion and the counts.

## Playbook: Feature

### Feature

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

## Playbook: Refactoring

### Refactoring

Resolve the driver skill through [poteto-mode's Non-negotiables](../SKILL.md#non-negotiables).

**You own the contract. The structure changes. The behavior does not.** Distinct from Feature, which adds behavior, and Bug fix, which corrects it.

If the cleanup reveals a missing feature or a real bug, split it out and ship the structural change first against the pinned contract. A redesign is allowed, but name it and route to Feature. Large or cross-cutting structural work belongs to the **figure-it-out** skill. This playbook is the focused-to-medium change.

1. Pin the behavior contract first. Run the **how** skill over the affected subsystem to learn the contract, then write a characterization test, snapshot, or equivalence harness that captures current behavior before any structure moves. If the area has no coverage, write the pin before touching structure. Type check and lint are not a pin.
2. Name the structure the code is missing per **principle-model-the-domain**. Boring code stays when the shape is already clear and local. The reshape must delete branches or invalid states, not add indirection.
3. Name the target shape. State what the module layout, types, and call graph should be if built today (**principle-foundational-thinking**, **principle-redesign-from-first-principles**). If the target crosses a function boundary, run the **architect** skill for parallel design exploration of the shape before the move.
4. Subtract before you add. Delete dead code, collapse one-caller wrappers, drop redundant validators, and remove orphan references before introducing the new shape (**principle-subtract-before-you-add**). The smallest change that reaches the target shape ships (**principle-laziness-protocol**). A speculative cleanup that "might help" gets reverted.
5. Move in small behavior-preserving steps, each keeping the pin green. For API reshapes, migrate every caller and delete the old API in the same wave (**principle-migrate-callers-then-delete-legacy-apis**). No compatibility shims, no parallel old-and-new paths. Spot-check every rename against the actual files. Renames silently miss usages in strings, prose, and back-references. Delegate the mechanical edits to a subagent using your configured refactoring model (default in poteto-mode's Models section) with a specific scope (file paths, the names being moved, the behavior to hold). Pick each subagent's reasoning level for the job, per the Subagents section.
6. Prove behavior is unchanged on the real artifact, not "it compiles" (**principle-prove-it-works**). For larger reshapes, run an equivalence check: a script that diffs old-vs-new outputs, a recorded baseline replayed against the new code, or a smoke run on the matching surface via the relevant driver skill.
7. Confirm the change is worth keeping. The success measure is reduced reader load (**principle-minimize-reader-load**). If the diff does not lower reader load somewhere, revert it.
8. Rebase into small ordered commits. A subtraction commit, then the reshape, then any follow-on cleanup. Shape them with the **sequence-verifiable-units** principle skill, so each behavior-preserving slice stays green before the next. Run **Opening a PR**.

**Reply:** the structure that changed, the pin you held it against, the equivalence proof, the reader-load delta, what shipped and what got reverted. No new behavior.

## Task steps

### Item 1: `Field.Label` focus override (Bug fix)

1. Reproduce before the fix. Add a `Field.Label` case for checkbox, switch and radio-group to `src/routes/+page.svelte`, one per scheme, with a checked toned control inside a stock `Field.Label`.
2. Add the assertion to `drive.mjs`: focus each control inside the `Field.Label`, read the border and ring, and compare them to the tone swatch. Run it and record the failure. This is the failing repro that lands first.
3. Form the hypothesis and confirm the mechanism: the `group-has-[:focus-visible]/field-label:*` rules outrank the tone row.
4. Fix through the fixer, not by hand. Add one disjoint removal site per control to `BINARY_SITES`. The site replaces the override fragment together with its neighbouring classes, so `fixed` is non-empty. Keep the tone border and the tone ring.
5. Regenerate `checkbox-fixed`, `switch-fixed` and `radio-group-fixed` with `node packages/daisyui-adapter/cli/init.mjs fix <component>`, copy out, `git checkout -- src/lib/components/ui/<component>`, normalize to LF.
6. Run the journey again in both schemes. The tone border survives, the ring follows the tone, and an invalid control keeps the destructive ring.
7. Update `docs/component-color-usage.md` and `packages/daisyui-adapter/README.md` so the `Field.Label` exception is gone.
8. Update the `BINARY_SITES` count checks in `drift.mjs` and `registry-49`.
9. Commit the failing repro first, then the fix.

### Item 2: Cursor copies have no byte check (Feature)

1. Extend `registry-49/variants.mjs` scaffold to `[...BINARY_COMPONENTS, ...CURSOR_COMPONENTS]` (deduplicated) and compare every cursor fixed copy byte for byte.
2. Add a `CURSOR_FILES` map: `button/button.svelte`, `checkbox/checkbox.svelte`, `switch/switch.svelte`, `radio-group/radio-group-item.svelte`, `label/label.svelte`.
3. Update the header assertion from `components 4 fixed` to the new count.
4. Keep the existing binary checks and counts.
5. Run `registry-49` and record the new count.

### Item 3: Stale journeys (Refactoring)

1. Remove `buttons`, `aspect-ratio`, `avatar`, `badge` and `button` from `.opencode/skills/verify/scripts/drive.mjs`.
2. Remove the constants only they used.
3. Update `.opencode/skills/verify/SKILL.md`: the example journey, the helper table, and the gotchas.
4. Do not build `/review` routes. Ticket 51 owns those.
5. Run the five remaining journeys.

### Item 4: `radio-group` variant at the group level (Feature)

1. Run `architect` over the API shape before implementing.
2. Amend `.scratch/daisyui-adapter/spec.md` and ticket 50 before implementing.
3. Put `variant` on `RadioGroup` root. Pass it to items through context. Keep the item prop as an override.
4. Add fixer sites for `radio-group.svelte` and update the item's fallback.
5. Regenerate `radio-group-fixed`.
6. Add a group-level case to the reviewer page and an assertion to the journey: one `variant` paints every item in the group, and an item override still wins.
7. Update the spec acceptance and the README.

### Items 5 to 8: fixer contract unit (Refactoring)

1. Run `architect` once over this unit before implementing.
2. Write the characterization pin: the current `scan`/`fix` behavior over a generated fixture, plus the registry checks.
3. Item 5: give each site an explicit `position` (`replace` or `insert-before`). `stateOf` and `apply` branch on it instead of the fixed-first substring test.
4. Item 6: reshape `focusSite` to the explicit position. The fixed text no longer needs to avoid its stock text.
5. Item 7: extract toggle's shared base and add a toggle entry to `CURSOR_SITES`, so `CURSOR_SITES` covers all five controls.
6. Item 8: split `targets.mjs` by responsibility: variant tables, radius, surfaces, binary, cursor, renderers. Keep the barrel and every public export stable. Update `package.json` `files`.
7. Prove the split with `drift.mjs` and every registry that reads targets.

### Item 9: shared `BinaryVariant` type (Refactoring)

1. Add one type module in application source, written by the fixer, with no Tailwind impact.
2. Migrate checkbox, switch and radio-group to the shared type in the same wave.
3. Delete the three local declarations.
4. Prove the fixed copies still regenerate byte for byte.

### Item 10: reviewer page maps and wrapper

1. Defer to ticket 51. Note the deferral in ticket 50 and in ticket 51.

## Gates before each commit

```sh
node packages/daisyui-adapter/test/drift.mjs
node .scratch/daisyui-adapter/registry-30/variants.mjs
node .scratch/daisyui-adapter/registry-31/variants.mjs
node .scratch/daisyui-adapter/registry-49/variants.mjs
pnpm check
node .opencode/skills/verify/scripts/session.mjs start
node .opencode/skills/verify/scripts/drive.mjs checkbox
node .opencode/skills/verify/scripts/drive.mjs switch
node .opencode/skills/verify/scripts/drive.mjs radio-group
node .opencode/skills/verify/scripts/drive.mjs toggle
node .opencode/skills/verify/scripts/drive.mjs cursor
node .opencode/skills/verify/scripts/session.mjs stop
```

## Closeout

1. Run `no-comments`.
2. Run `code-review` on `40ed7f3..HEAD`.
3. Set ticket 50 to resolved, tick every item, append Lesson and Check. Item 10 stays open in ticket 51.
4. Conventional commit per unit.
5. Annotated tag `t50-review-followups`.
6. Push the branch and the tag. Do not merge. The base is `develop`.
7. Report the next eligible ticket. Expected: 51, atoms targeted remainder.

## Progress

Items 1-9 are implemented and committed. Item 10 is deferred to ticket 51.

- Item 1: Field.Label case on the reviewer page, journey assertion, removal sites, regenerated
  checkbox/switch/radio copies. Repro `514011a`, fix `742f704`.
- Item 2: registry-49 scaffolds and compares every cursor copy; header count 6. `f674867`.
- Item 3: five stale journeys removed; SKILL.md updated. `e9002d3`.
- Item 4: spec amendment 2026-11-09; radio-group root variant through a reactive context getter; item
  override proof; regenerated root and item. `081e224`.
- Items 5-7: explicit `position: replace | insert`; stock-first replace reads; anchored insert reads;
  focusSite reshaped; toggle base split into pressed, hover, cursor and disabled sites; toggle added to
  CURSOR_SITES. `61146ed`.
- Item 8: `targets.mjs` is a 75-line barrel over `targets/{contrast,radius,surfaces,variants,binary,cursor,site,render}.mjs`;
  `ALL_SITES` and `KNOWN_COMPONENTS` derive from one table list; `package.json` ships `targets`. `99c3983`.
- Item 9: `CREATES` writes `ui/binary-variant.ts`; checkbox, switch and radio-group import it; the local
  `keyof typeof TONES` types are gone. `2d3365e`.
- Registry-28 keeps its two known no-theme fallback failures; its header count check now derives the drop
  instead of hard-coding 19/18.

## Architect synthesis

- Radio-group variant: root owns the token, items read it through a context getter, the item prop is an
  override, and `TONES` stays in the item. The alternative (root owns the palette and sends a class
  string) was rejected for leaking render policy and duplicating the map.
- Site contract: explicit `position` on every site. Replace reads stock first and writes with split/join;
  insert reads the anchor with its flanks, refuses a duplicated anchor, and writes once. `fixed` stays the
  public field so registry-30/31/49 and the byte comparisons keep working.
- Manifest split: a barrel over domain modules, with one `TABLES` list driving `ALL_SITES` and
  `KNOWN_COMPONENTS`. The alternative (static vs generated layers) was rejected for splitting each domain
  across two writers.
