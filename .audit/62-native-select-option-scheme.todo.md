Phase: implementation

# Ticket 62: The native select option list ignores the dark scheme

Ticket: `.scratch/daisyui-adapter/issues/62-native-select-option-scheme.md`
Spec: `.scratch/daisyui-adapter/spec.md` (Field variants, amendment for the color-scheme choice)
Pattern: `.audit/51-atoms-targeted-remainder.todo.md` (native-select review), `.opencode/skills/verify/scripts/drive.mjs`
Branch: `ticket-62-option-scheme` (worktree `C:\Users\LENOVO\AppData\Local\Temp\opencode\wt-62`)
Base: `af3d5c7` (ticket 51 close; 63 and 65 are NOT committed or tagged, so 62 opens its own base)
Playbook: Bug fix
Session: `ses_e373b3507ffeTuC0vzOAEVfeiy`

## Goal

The open native select option list follows the scheme. The closed select already paints a dark field in
dark. Light stays as it is. The fix goes through the adapter writer in `packages/daisyui-adapter/cli/init.mjs`
and the regenerated `src/routes/layout.css`, never a lone hand edit of `layout.css`.

## Blast radius

state: unbuilt (`graphify-out/graph.json` is missing). fallback: `rg` over `src/routes`, `src/lib/components`,
`packages/daisyui-adapter`, `.opencode/skills/verify`, `docs`, `.scratch`
seeds: `color-scheme`, `.dark`, `bg-[Canvas]`, `native-select-option`, `rebuild`, `checkNativeSelect`
anchors:
- `packages/daisyui-adapter/cli/init.mjs` <- `rebuild()` writes the `.dark` block; `map` regenerates `layout.css`
- `src/routes/layout.css` <- the `.dark` scope the review shell applies through `class="dark"`
- `src/lib/review/Scheme.svelte` <- dark scope is `class="dark"` plus `data-scheme="dark"`
- `src/lib/components/ui/native-select/native-select-option.svelte`, `native-select-opt-group.svelte` <- `bg-[Canvas] text-[CanvasText]`
- `src/lib/components/native-select-fixed/index.ts` <- re-exports the stock option and opt-group
- `.opencode/skills/verify/scripts/drive.mjs` <- `checkNativeSelect`, the journey to extend
- `packages/daisyui-adapter/test/drift.mjs` <- 18 checks; no layout-block count, so a declaration does not move it
unlisted: `docs/component-color-usage.md` (the ticket records the choice there), `.scratch/daisyui-adapter/spec.md`

## Playbook: Bug fix

**You own this task. Plan, review, verify.** Delegate investigation and the fix to subagents, stay in the lead.

1. Reproduce it yourself on the matching surface via the driver skill (Non-negotiables). Ask the user only with a stated, specific reason the control surface cannot reach the target. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent using your configured bug-fix model with a specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. Skip the failing-test-first cadence when the test would be expensive, integration-heavy, or unclear.
6. Run **Opening a PR**.

**Reply:** what was broken, root cause, fix, how you verified. Quote the decisive failing and passing output, trimmed to the assertion and the counts.

## Tasks

- [x] Claim ticket 62 (`pstack_claim`)
- [x] Blast radius (`graphify-scope`: unbuilt, `rg` fallback)
- [x] Pick the playbook (Bug fix: measured defect, known mechanism, repair not new behavior)
- [x] Create the delegate worktree `wt-62` from `af3d5c7`
- [x] Reproduce on `/review/native-select` (color-scheme, option paint, contrast, both schemes)
- [x] Rule out the candidate mechanisms (injection proved the declaration is the mechanism; Canvas does not fight it)
- [x] Delegate the fix (emitter line, regenerated `layout.css`, journey check, docs and spec amendment)
- [x] Verify: `pnpm check`, `pnpm test:adapter`, native-select journey, computed values, popup evidence
- [x] Light scheme unchanged (computed values identical)
- [x] `pstack-no-comments`, then `code-review` (Standards and Spec axes)
- [ ] Operator pass on `/review/native-select` in both schemes (server on 5198)
- [ ] Close: Status resolved, Lesson and Check, tag `t62-native-select-option-scheme`, commit after wording approval

## Decisions

- `color-scheme: dark` is the whole fix. An injected declaration made the option resolve `rgb(18, 18, 18)` at 18.7:1, so no fixer site and no stock component edit.
- The emitter prepends the declaration on every dark rebuild and the parser stays `--` only. The reviewer's widening removed a real risk: it could lift a declaration out of a nested at-rule. The readback stays 45 light, 45 dark because `color-scheme` is not a custom property.
- A map-only run rewrites the header to `components 0 fixed`; the committed header keeps `58 fixed` from the last full fix run. The `.dark` body is unchanged across runs.
- The journey runs on 5198 from `wt-62`. The 5199 server belongs to the 63/65 worktree and cannot prove this branch.
- The light scope assertion is not pinned: only the dark scope is asserted, and light is checked by its rendered white option.

## Review rounds

- `pstack-no-comments`: one comment deleted; both MUST KILL items resolved by name and by the guard-only emitter.
- Standards: prettier on the new helper, NaN message, readback wording, spec sentence. All applied except the redundant-parameter nit, which is rejected: deriving the expectation from the observed value would make the assertion vacuous.
- Spec: widening removed, light pin removed, docs theme label softened. Re-checked after the change.

## Constraints

- One worktree for the code-writing delegate. No second writer in `wt-62`.
- Never run prettier over `*-fixed` copies.
- Out of scope: the ring work (63, 65), the type scale (64), new tone work.
- Ask before any push or merge. Never push main.
- Do not stop the dev server another session is using on 5199.
