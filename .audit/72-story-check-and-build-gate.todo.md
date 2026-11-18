Phase: per-ticket

Gates (recorded before this session): `.scratch/daisyui-adapter/spec.md` carries `Status: ready-for-agent`; every
ticket in `.scratch/daisyui-adapter/issues/` carries `Status: ready-for-agent` and `Labels:`. This session works
one ticket only, 72, claimed as `ses_e15c53a84ffemgt44Ia38rmkFx`.

Graph state: no `graphify-out/graph.json` exists in this repo. Fallback taken: `rg` and direct reads, per the
ticket's instruction. No graph build without approval.

## Goal

Ticket 72: a lint over every story file that fails on the three failures this pattern keeps producing, and a
static build the release runs, so a broken docs build cannot ship.

## Matched playbook: Feature

Copied verbatim from `poteto-mode/playbooks/feature.md`:

1. `how` over the affected subsystem.
2. `architect` for parallel design exploration.
3. Write the throughput checkpoint as four todo items. A dimension that genuinely does not apply (single file,
   no fan-out) keeps its item with `n/a: <reason>` rather than being dropped:
   - **Blocking first steps.** Gates run before fan-out.
   - **Independent workstreams.** Disjoint files, services, or layers parallelize. Shared writes serialize.
   - **Shared mutable state.** Default to splitting the target. Serialize only for real invariants.
   - **Smallest safe decomposition.** If one worker is best, name why.
4. Delegate code-writing to a subagent using your configured feature model with a specific scope, and success
   criteria.
5. Verify on the matching surface. "Inconclusive" or wrong-surface is not a pass. Flag it.
6. Rebase into small, ordered commits. Stack follow-ups.
7. If the design is contested, `interrogate` before shipping.
8. Run **Opening a PR**.

Plus, before step 1: `pstack_claim` (done).

## Throughput checkpoint

- **Blocking first steps.** The three rule predicates and the exact measurement of build determinism gate
  everything else. A lint written before the predicates are settled is a rewrite. The determinism run is a
  measurement, not a build gate yet.
- **Independent workstreams.** `scripts/check-stories.mjs` + its three fixtures are one workstream; the
  determinism measurement is a second and needs no shared file; the release-gate wiring (package scripts,
  workflow, ticket 34) is a third and depends only on the finalized command line.
- **Shared mutable state.** `package.json` is the only shared write, and the script name is chosen before any
  delegate starts. Each workstream writes its own files.
- **Smallest safe decomposition.** Two workers: one delegate owns the script and its fixtures (one owner, one
  writer over that directory), and this session owns the measurement and the wiring, because the measurement
  needs this checkout's `node_modules` and `.verify/` and the delegate's worktree cannot carry them.

## Blast radius (rg, no graph)

Read-only subjects of the rules: 19 `*.stories.svelte` files (2 under `src/stories/components/`, 17 under
`src/lib/components/*-fixed/`), `src/stories/story-args.ts`, `.storybook/main.ts`, `.storybook/preview.ts`.

Written by this ticket: `scripts/check-stories.mjs` (new), `scripts/fixtures/**` (new), `package.json` (two
scripts), `.github/workflows/adapter-drift.yml` (the gate job), `.prettierignore` and `eslint.config.js` (fixtures
hold deliberately invalid Svelte and must stay out of both), `.opencode/skills/verify/features/storybook.md` (the
command goes where the repo records how to drive Storybook), ticket 34 (the release command list).

Unlisted edges the ticket does not name, each checked: `packages/daisyui-adapter/test/drift.mjs` walks
`src/lib/components/**` and `src/lib/components/ui/**` for `.svelte`, and skips `.stories.svelte`, so fixtures at
`scripts/` cannot reach it. `tsconfig.json` includes only `src`, `vite.config.ts` and `playwright.config.ts`, so
`pnpm check` never reads `scripts/`. `pnpm lint` runs `prettier --check .` and `eslint .` over `scripts/`, so the
script must be clean there and the fixtures must be ignored by both. `storybook-static/` stays untracked and
unignored; every build writes to `.verify/`.

## Steps

- [x] claim ticket 72
- [x] `how` over the story corpus, the addon's `asChild` semantics and the static build pipeline
- [x] `architect`: four candidates in `.verify/arena-72/`, cross-judged by another family
- [x] throughput checkpoint written (above)
- [x] delegate `scripts/check-stories.mjs`, `scripts/check-build.mjs` and twelve fixtures to one owner (commit 9443845)
- [x] review the delegate's diff, the predicates and every fixture by hand
- [x] verify on the real surface: clean tree, thirteen fixtures, exit codes, a deliberately broken copy
- [x] measure build determinism with a hermetic addon cache (120 files, digest `cdb575b8`, three runs)
- [x] wire the release gate: `docs-gate.yml`, ticket 34, the verify skill doc
- [x] `pnpm check` 0 errors 0 warnings, `pnpm test:adapter` clean, vitest storybook 19 files and 83 tests
- [ ] rebase into ordered commits
- [ ] `interrogate` (not run: the cross-judge already reviewed the design on another model, and the diff is a new script plus fixtures)
- [ ] close: Lesson and Check, commit and tag, next eligible ticket

## Rulings

- Rule 1 stays one-directional (markup without `asChild`). The reverse direction would flag a legal raw-text
  story, and the addon already rejects `asChild` with a template and `asChild` with no children at parse time.
  Cost if wrong: a legal story is flagged by a future reviewer who expects the biconditional; the ticket's
  wording is the authority.
- Fixtures use the `.stories.svelte.fixture` suffix, so no `.prettierignore` or `eslint.config.js` entry is
  needed. Measured: prettier infers no parser, eslint claims nothing. Cost if wrong: a tool that later claims
  the extension would fail the run loudly, not silently.
- The determinism gate clears `node_modules/.cache/storybook` before each build. Measured cause: a cached
  addon manager bundle embeds the absolute path of the checkout that built it
  (`NODE_PATH:["D:\\...\\_wt\\72\\node_modules\\..."]` against `NODE_PATH:[]`), and cached bundles also carry
  different minified identifier names. Without the clear, a build that inherits a foreign cache differs from
  a clean one in six files under `sb-addons/**`. Cost if wrong: each build rebundles the addon managers,
  which is the slower half of the gate.
- A thirteenth fixture proves the `story-file` path (a script that does not parse), because that catch is the
  difference between one broken story and a crashed run.
- `check-build.mjs` gained `--serve <port>` so the operator review has a URL. It refuses to serve when the
  two builds differ.
- The file count moved from 121 (first measurement) to 120, and the whole chunk graph changed with it,
  because that first run inherited a cache from ticket 71's checkouts. `index.json` stayed byte-identical
  throughout, so the docs content never changed.
