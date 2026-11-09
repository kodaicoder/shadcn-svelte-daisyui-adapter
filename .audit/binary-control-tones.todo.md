Phase: tickets

# Ticket 44: binary control tones

Spec: `.scratch/daisyui-adapter/spec.md`, "Amendment 2026-11-06: tone variants for the binary controls".
Ticket: `.scratch/daisyui-adapter/issues/44-binary-control-tones.md`.
Branch: `fix/nutchapon/ai/contrast-warning`.

## Gates

- Spec gate: approved 2026-11-06 (amendment), version folded into 0.3.0.
- Ticket gate: pending.

## Blast radius

`graphify-out/graph.json` is absent, so the graph is `unbuilt`. Fallback: read-only `rg` over the
adapter and the four components. Files the ticket names:

- `packages/daisyui-adapter/targets.mjs` (anchors, tone rows)
- `packages/daisyui-adapter/component-fix.mjs` (only if the site shape needs a new field)
- `src/lib/components/checkbox-fixed/`, `toggle-fixed/`
- `src/lib/components/ui/switch/switch.svelte`, `ui/radio-group/radio-group-item.svelte` (stock, read only)
- `.opencode/skills/verify/scripts/drive.mjs`, `session.mjs`
- `src/routes/+page.svelte`
- `docs/component-color-usage.md`, `README.md`, `CHANGELOG.md`
- `.scratch/daisyui-adapter/registry-30`, `registry-31`, plus a new registry script

Unlisted files to check before the first edit: `packages/daisyui-adapter/cli/init.mjs` (the fix
subcommand and the header counts), `packages/daisyui-adapter/test/drift.mjs` (stock-string guard), and
`src/lib/components/toggle-fixed/index.ts` (the exported variant type).

## Playbook: Feature

1. `how` over the affected subsystem. Done this session: the fixer mechanics and the variant renderer.
2. `architect` for parallel design exploration. Done this session: four sketches, one synthesized shape
   in the spec amendment.
3. Throughput checkpoint:
   - Blocking first steps: prototype the cascade on checkbox (tone row after the base, no `!`) before
     touching the other three. Done: light works with the tone row appended, dark needed two base edits
     (`dark:data-checked:bg-primary` removed, `dark:bg-input/30` scoped to `data-unchecked`). Measured in
     both schemes; the success fill follows the token in light and dark.
   - Independent workstreams: switch and radio-group files are disjoint; toggle shares the map shape.
     Parallelize only after the pattern is proven.
   - Shared mutable state: `targets.mjs` is one file, so manifest edits serialize. Split by file, never
     by tone.
   - Smallest safe decomposition: one owner for the adapter plus the fixed copies, because the pattern
     must be identical across four components and the manifest is a single file.
4. Delegate code-writing to a subagent with the chosen data shape: a literal tone map per fixed copy,
   a `variant` prop, and two or three replacement sites in `targets.mjs`.
5. Verify on the matching surface: the four reviewer pages plus their journeys, drift and the new
   harness.
6. Rebase into small, ordered commits: manifest, checkbox, switch, radio-group, toggle, docs.
7. `interrogate` if the design is contested. It is not: four sketches agreed.
8. Opening a PR after the ticket closes.

## Focus ring round (2026-11-09)

Measured on a focused tone control: the border fell back to primary because `focus-visible:border-ring`
in the base wins the cascade, and the ring was `--ring` at 30 percent for every tone. Operator decision:
the ring follows the tone.

Implemented with a `focusSite` per checkbox, switch and radio-group that removes the base border and
ring colour, keeps the ring width, and leaves `aria-invalid:ring-destructive/20` in place. Every tone row
declares `focus-visible:ring-<toneBorder>/30`, and toggle's `default` and `outline` rows declare
`focus-visible:ring-primary/30`.

Measured after: seven distinct rings per scheme, the tone border survives focus, and a focused invalid
control keeps the destructive ring at 20 percent in light and 40 percent in dark. drift 9, registry-44
51, registry-30 43, registry-31 82, `pnpm check` clean, four journeys pass.

The round was finished in the main checkout after two delegates were lost, one to a server restart and
one to a cancelled run that left the worktree mid-regeneration.

## Interrogate round 1 (2026-11-09)

Four reviewers on `d172c89..HEAD`. Acted on: indeterminate checkboxes lost their dark surface
(`not-data-checked` replaces `data-unchecked`), `aria-invalid:aria-checked:border-primary` outranked the
tone border, a button disabled through a `<fieldset>` painted no dim and still hovered (`disabled:` and
`not-disabled:` joined the guard), the wrapped label dimmed its control twice, the filled toggle rows
declared a border colour with no width, the checkbox/radio insert anchor was one short line, and the
disabled-cursor check accepted `pointer-events: none`.

Considered with ticket 45: the `Field.Label` focus override, no byte check for the cursor copies, stale
journeys, the per-item radio variant, and `stateOf` false-fixed wiring. Dismissed: the dead-hover claim
and the radio-dot measurement claim.
