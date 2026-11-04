Phase: feature

# Ticket 32, workflow docs

Ticket: `.scratch/daisyui-adapter/issues/32-workflow-docs.md` (Status: ready-for-agent, Blocked by 26, 27, 28, 29, 30, 31, all resolved).
Branch: `fix/nutchapon/ai/new-variants`. Base: `6d8d1a6` (ticket 35 closeout, tag `t35-badge-status-borders` at `2bd8ce1`).
Next tickets, untouched: 33, 34.
Playbook: Feature. poteto-mode drives; the ticket is input.

## Blast radius

Graph state: no `graphify-out/graph.json` in the checkout, so the graph is not a query surface here. This ticket reads and writes only `packages/daisyui-adapter/README.md` and `CHANGELOG.md`. The version, header marker and install command come from `package.json` and `cli/init.mjs`, which stay unchanged. No seam reads either doc, so no expectation moves.

## Plan

Matched playbook: Feature (1-8), then the ticket's own steps.

1. `how` over the affected subsystem.
   skip: read this turn: README, CHANGELOG, `package.json`, `cli/init.mjs`, `component-fix.mjs`, `targets.mjs` (tokens, radius roles, size steps, variant rows), spec L16-29 and L65-117, ADR 0003, GLOSSARY.
2. `architect` for parallel design exploration.
   skip: docs only, one shape. The output is the existing README sections plus a fix section and a visual-check section; no code design choice.
3. Write the throughput checkpoint as four todo items. Done below.
4. Delegate the two-file edit to a subagent on the feature model
   (`opencode-go/deepseek-v4.1-flash#high`). It runs `node` only and no git command.
5. Verify on the matching surface: README follows end to end with no missing step; CHANGELOG 0.3.0 records tokens, radius, variants, fixer, workflow and marker; the version check; the eight seams.
6. One commit for this ticket, on top of ticket 35.
7. `interrogate` only if the design is contested.
   skip: docs surface, no contested design. The spec fixes the content.
8. No PR. The operator delivers by branch push and annotated tag.

## Throughput checkpoint

- **Blocking first steps.** The content inventory blocks the rewrite: 43 declarations, 11 tokens, radius roles, variant keys, fixer states, marker count. Each is read from source before a line is written. The eight seams run after the edit, because they are the regression gate.
- **Independent workstreams.** README and CHANGELOG are disjoint files, but one writer owns both so the version and the marker story cannot diverge between them. The seam runs are independent reads after the edit.
- **Shared mutable state.** One writer. The delegate holds the working tree; the lead writes only this audit while it runs and reads the diff after.
- **Smallest safe decomposition.** One worker, one commit. Splitting README from CHANGELOG would let the workflow wording and the release record drift, which is the exact defect this ticket fixes.

## Decisions

### Workflow order

`shadcn-svelte init` -> `shadcn-svelte add <components you use>` -> `adapter init` -> `adapter fix [component...]`. The order is load-bearing: `init` maps the stylesheet and then fixes the components already on disk. A component added after `init` needs `fix`, and `shadcn-svelte add -a` can overwrite a fixed file, which the next `fix` restores.

### Counts

The written block holds 43 non-derived declarations: 38 binding keys plus 5 chart rows. Nine derived helpers come from the four mix keys and the five chart rows, four more from the text tones, 13 in all. The README's old 32 is the 0.2.0 figure and is wrong for 0.3.0.

### Tokens

Eleven new bindings: `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`, `destructive-foreground`, `success-text`, `warning-text`, `info-text`, `destructive-text`. Each gets a `--color-*` alias. Text tones are `color-mix(in oklch, var(--<tone>) 40%, var(--foreground) 60%)`; the raw tone stays the fill, never the text.

### Radius

The role picks the step: selector -> `--radius-sm`, field -> `--radius-md`, box -> `--radius-lg`. Size shifts it: xs, sm, icon-xs, icon-sm -> sm; default, md, icon -> md; lg, icon-lg -> lg. No clamp; `init` warns above 2rem. Circles, edge-joining utilities and the calendar cell property are excluded.

### Variants

One `variant` prop, literal keys. Button: `destructive`, `success`, `warning`, `info`, plus `outline-*`, `ghost-*` and `link-*` for the four tones; the destructive base is filled. Badge: the four filled tones plus the three presentations. Bubble: the four filled tones plus outline and ghost, no link. Alert: the four filled tones only. Filled status and destructive rows carry the text-tone border; badge outline rows are border-only chips (ticket 35).

### Fixer

Four states per replacement site: `missing`, `stock`, `fixed`, `customized`. It patches `stock`, leaves `fixed`, reports `customized`, and still applies the other sites in the same file. A second run is byte-identical. It reads the installed shadcn-svelte version and refuses outside 1.7.x; an unreadable version warns and continues. `--dry-run` reports only; `--check` exits 1 only while a stock site remains; `--strict` exits 1 on a customized site or a named component with no files, and stays silent on a target never added.

### Marker

`/* <pkg> <version> | components <n> fixed | re-run ... */`. `n` counts files whose every replacement site is `fixed`, not files changed in the run. A mixed file is reported and not counted, so a no-op `fix` keeps `n` and the re-run stays byte-identical. A map-only run records `components 0 fixed`.

### Version

Stays 0.3.0. The README examples, the pack filename and the install command move to 0.3.0 from package.json; no bump, no prerelease. 0.2.0 and 0.1.0 stay in the CHANGELOG.

## Ticket steps

- [x] Write the plan
- [x] Claim ticket 32
- [x] README: install order, `fix` with its three flags, marker with the fully fixed count, mixed-file report, 43 declarations, 11 tokens, radius roles, variants, visual check
- [x] CHANGELOG: 0.3.0 records tokens, radius, variants, fixer, workflow and marker; 0.2.0 and 0.1.0 stay
- [x] Version check: header marker, install command and package version all name 0.3.0
- [x] Seams green: `registry-16` 139, `registry-26` 100, `registry-27` 64, `registry-28` 71, `registry-29` 45, `registry-30` 43, `registry-31` 82, drift 8
- [x] No dependency, no `src/lib/components/ui` edit, no `PAIRS` change, no version bump, header and flag behavior unchanged
- [x] Closeout: Status resolved, Session IDs, Lesson, Check, conventional `docs(adapter): document the 0.3.0 workflow`, annotated `t32-workflow-docs` on that commit, push branch and tag, no merge to `develop`

## Result

- Implementation owner: `ses_e5b59c9ebffeN3KX6mNG6my4ma`. The lead reviewed and corrected the sample, the variant split, the E4 scope and the visual-check wording.
- README: five-step install order with `add` before `init`; the `fix` section with the four states, `--dry-run`, `--check`, `--strict`, the 1.7.x guard, the style label, the unknown target and the no-target case; the header marker with `components N fixed` and the mixed-file rule; 43 non-derived declarations and 13 derived helpers; the eleven tokens and their aliases; the radius roles and size steps; the four variant sets; the visual check; the release notes for the tarball test. All version examples are 0.3.0.
- Lead corrections: the first-run sample now shows `stock -> fixed` and the pre-write summary `2 stock`, with the second-run and `already installed` behavior in prose. The variant prose names the pinned destructive badge, bubble and alert instead of calling them filled. E4 is scoped to a run that writes. The target component list is in the Usage section. A version refusal is documented as exiting 1 before the report.
- CHANGELOG: 0.3.0 records the eleven tokens and aliases, 43 declarations, the brand mapping, the radius roles, the variants including the badge status border, the fixer and its flags, the workflow, the marker, the ten repaired pairs and the visual check. 0.2.0 and 0.1.0 are unchanged.
- Version check: `package.json` 0.3.0; the generated `headerFor(0)` string is in the README; the install command in the README names `@kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0`. No 0.2.0 remains in the README.
- Seams: `registry-16` 139, `registry-26` 100, `registry-27` 64, `registry-28` 71, `registry-29` 45, `registry-30` 43, `registry-31` 82, drift 8. No expectation moved, because no seam reads the README or the CHANGELOG.
- Scope: no dependency added, no `src/lib/components/ui` edit, no `PAIRS` change, no version bump, no change to `cli/init.mjs` or its marker and flag behavior.
- Commit: `40086db` `docs(adapter): document the 0.3.0 workflow`.
- Tag: annotated `t32-workflow-docs` on `40086db`.
- Not merged to `develop`.
