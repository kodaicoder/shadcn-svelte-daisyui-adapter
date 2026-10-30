Phase: Prototype

# Ticket 16, end-to-end prototype on a fresh project

Ticket: `.scratch/daisyui-adapter/issues/16-e2e-prototype.md` (Type: prototype, Status: open,
Blocked by: 09, 10, 11, 12, 13, 15, all resolved).
Base: `c938e62` (tag `t12-chart-ramp-closeout`). Branch: `feat/daisyui-adapter`.
Playbook: Prototype.

Gate record, stated as fact rather than as a pass: no `.scratch/daisyui-adapter/spec.md` exists, and
no ticket in this feature carries `Status: approved` (16 carries `Status: open`, 09 to 15 carry
`Status: resolved`). `map.md` is the standing spec artifact for this feature; the spec and ticket
gates were never recorded in this feature's history. This ticket proceeds on the operator's explicit
instruction and the ticket's own DoD. No `Phase:` change claims a gate pass that did not happen.

## Plan

Matched playbook: Prototype. Its steps, verbatim, then the ticket's own steps.

1. Scope the decision the prototype exists to make: which layout, which interaction, which density,
   or for an empirical fork which behavior, timing, or approach. No decision means no prototype.
   Route to Feature.
2. Gather references when the design space is open. Search for prior art, summarize a moodboard of
   themes, palettes, and layouts, let the user pick directions before building. Skip when the
   direction is set.
3. Build throwaway in an isolated scratch dir, separate from production source. For a visual
   decision, vanilla HTML/CSS/JS or the lightest stack that renders the idea, CDN deps, a dev server
   with hot reload. For a behavioral or timing decision, the smallest script that exercises the
   question. No production framework, no tests, no abstractions.
4. When comparing alternatives, build them behind one switcher (buttons or a keypress), each variant
   labeled. This is the **exhaust-the-design-space** principle skill made cheap.
5. Verify on the matching surface. For a visual decision, screenshot each variant via the driver
   skill and drive the interaction. For a behavioral or timing decision, observe the thing you are
   deciding by logging the timing, printing the output, or watching the render. The observation is
   the test here, not an assertion.
6. Present alternatives, tradeoffs, and a recommendation. The output is the decision plus the
   throwaway artifact, not shippable code. Hand the chosen direction to **Feature** (or `architect`
   for the shape) for the real build.

- [x] Step 1 decision, stated: does the CLI plus plugin chain produce a usable shadcn-svelte token set
      on a project other than this one, and where does the mapping visibly fail
- [x] skip: no open design space, the mapping was settled in 09 to 12, so no moodboard
- [x] Step 3: build `registry-16/` under `.scratch/daisyui-adapter/`, no production source touched
- [x] skip: one variant, not a bakeoff, so no switcher
- [x] Step 5: render light and dark through `harness/shot.mjs`, read the painted bytes
- [x] Step 6: present the falsifications and the recommendation, mark the artifact throwaway

Ticket steps, from the 2026-10-29 constraints section that supersedes its own step 2:

- [x] Read first, 3 files: ticket 16, `registry-14/probe-cli/init.mjs`, `registry-12/package/dist/ramp.mjs`
      (all three under `.scratch/daisyui-adapter/`, not the repo root)
- [x] Resolve the theme-pair contradiction before building (see Deviations 1)
- [x] Build the package: plugin module plus an `init` bin, one shared key list
- [ ] OPEN, operator call: fix the stale chart rows in `registry-14/probe-cli/init.mjs`
- [ ] OPEN, operator call: fix the stale chart rows in `registry-10/daisyui-adapter.json`
- [x] Build the six-component page: button, card, input, dialog, tabs, chart, plus a sidebar surface
- [x] Run A: install the tarball, `init`, `init` again for idempotency, add the components, build,
      render light and dark
- [x] Run B: same chain, theme removed before build, to prove the CLI-written fallbacks render
- [x] Copy every cited artifact into `evidence/16-e2e-prototype/`, because `harness/runs/` is ignored
- [x] Write `## Answer`, `Status: resolved`, `Lesson:` and `Check:`
- [x] Append one line to `## Decisions so far` in `map.md`
- [ ] `code-review` on the Spec axis against `c938e62`
- [ ] `deslop`, conventional commit on `feat/daisyui-adapter`, tag `t16-e2e-prototype`
- [x] Clear leftovers: harness temp projects, server ports 5199 and 5209 free

## Deviations found while reading, before any build

**1. The two theme files are not the same pair.** The brief says `registry-12/probe-theme.css` and
`registry-14/probe-theme.css` are the same pair. They are not:

| | registry-12 | registry-14 |
| --- | --- | --- |
| names | `daisy-light` / `daisy-dark` | `probe-light` / `probe-dark` |
| light primary | `oklch(45% 0.24 277.023)` purple | `oklch(49% 0.118 165)` green |
| dark base-100 | L 0.2533 | L 0.15 |
| dark base-200 vs base-100 | 0.2326 **below** | 0.20 **above** |

Decision: use registry-12. It is daisyUI's own built-in pair, so it is the input a real user pastes
into a fresh project, and its dark ramp (base-200 below base-100) is the case ticket 09's
`card = popover = base-100` rule exists for. registry-14's dark pair inverts that orientation, so it
would not exercise the settled rule.

Both pairs solve a valid ramp. Measured with `ramp.mjs`:

| | light anchor | light L | dark anchor | dark L | min adjacent | hue drift |
| --- | --- | --- | --- | --- | --- | --- |
| registry-12 | 0.6562 | 0.6562 to 0.2962 | 0.5491 | 0.5491 to 0.9091 | 0.090 | 0.00 |
| registry-14 | 0.6428 | 0.6428 to 0.2828 | 0.4845 | 0.4845 to 0.8445 | 0.090 | 0.41 |

Neither throws. registry-12 dark clips step 5 chroma to 0.0442, which is the per-step gamut fit
working, not a failure.

**2. `registry-14/probe-cli/init.mjs` is stale on the sidebar too, not only the chart.** Lines 40 to
46 set `sidebar: base-100` and `sidebar-accent: base-200`. Ticket 10 settled `base-200` and
`base-300`, and `registry-10/daisyui-adapter.json` already carries the settled rungs. Copying
`init.mjs`'s sidebar would produce a sidebar flush with the page and would report as a mapping
falsification something that is only a stale fixture. Both rows get fixed.

**3. The stale chart rows live at six sites, not two.** `rg -l chart` across the fixtures finds the
placeholder `chart-1 primary` through `chart-5 success` in:

- `registry-14/probe-cli/init.mjs` (named by the brief)
- `registry-10/daisyui-adapter.json` (named by the brief)
- `registry-11/daisyui-adapter.json`
- `registry-14/registry.json`, both items
- `registry-14/r/daisyui-adapter.json`
- `registry-14/r/daisyui-adapter-raw.json`

Decision: fix the two the brief names, and record the other four with a marker rather than silently
rewriting closed tickets' fixtures. 10, 11 and 14 are resolved, and their fixtures are the record of
what those runs installed. A silent rewrite would leave their evidence describing a table their
fixtures no longer contain. The new table lives in `registry-16/`, which is the authoritative one.

## Throughput checkpoint

- Blocking first step: the package (plugin plus CLI) must exist before the harness can install it,
  and the page must exist before the add, so the chain is sequential. One owner.
- Independent workstreams: none. The plugin, the CLI and the page share one key list.
- Shared mutable state: `harness/runs/` and the two evidence ports. One run at a time.
- Smallest safe decomposition: one worker (this session), because each step's output names the next
  step's input and a mis-sequenced install proves nothing.

## Decision trail

| round | question | answer | evidence |
| --- | --- | --- | --- |
| 1 | which theme pair | registry-12, daisyUI built-in | `ramp.mjs` solve on both, table above |
| 2 | where the new mapping table lives | `registry-16/`, fixtures marked not rewritten | four closed tickets' evidence stays true |
| 3 | why the harness `--then` step failed (handoff blamed `process.cwd()`) | **handoff was wrong**: shadcn-svelte's overwrite prompt hung on piped stdin because `install.mjs` passed `-y` without `-o`; the harness's own 600 s timeout then fired | run 1's error path was `../../../../` from `app`, i.e. cwd was correct; run 2 `add-install.log` 14:32:28 to `run.json` 14:42:28 = 600.038 s; `add badge -y` hung to a 90 s cap with `code=null`, `add badge -y -o` finished in 1.1 s |
| 4 | does `pnpm exec node` keep cwd | yes, verified directly, so the handoff's proposed fix would have changed nothing | probe script and a `execFile` with the harness's own options both printed the app root |

## 2026-10-30, cleanup after closeout

Ticket 16 stays `Status: resolved`. This section records the leftover sweep and where the one
falsification now lives.

**The chart fallback defect has its own ticket.** It is
[`issues/21-chart-no-theme-fallback.md`](../.scratch/daisyui-adapter/issues/21-chart-no-theme-fallback.md),
`Type: task`, `Status: open`, `Blocked by: none`, with this ticket's measurements as its input. The
Answer's "What the mapping must change" section now points at it. The binding split it cites was
re-measured from `evidence/16-e2e-prototype/arm-missing/css-after-then-1.css` rather than copied:
37 declarations per block, 27 bindings all carrying a fallback, 5 `--daisy-derived-*` helpers whose
consumer carries the fallback for them, 5 chart rows carrying none.

**Temp apps deleted.** 578.7 MB, all four `--keep` apps under `$TEMP\adapter-harness` plus
`$TEMP\adapter-16-smoke`. Precondition checked before deleting: `cmp-dirs.mjs` proved both evidence
directories are byte-identical to their harness runs, 17 files each, zero content differences. Each
run held two files the evidence dir does not: `package-json-before.json` and `package-json-after.json`
from the shadcn `add` step, and they are identical to each other, so they carried no claim. Nothing
cited was lost. `harness/runs/` is gone too; it is gitignored and regenerable.

**Ports.** 5199, 5209, 5301 to 5304 all free after the sweep.

**Still an open operator call, unchanged:** the six stale chart fixture sites and the stale sidebar
rows in `registry-14/probe-cli/init.mjs`. See Deviations 2 and 3. `registry-16/` is authoritative and
ticket 21 is the fix path, but rewriting closed tickets' fixtures is still the operator's call.
