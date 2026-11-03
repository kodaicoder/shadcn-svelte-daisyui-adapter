Phase: Ticket

# Ticket 10 - sidebar mapping

Map-planned: `.scratch/daisyui-adapter/map.md` is the planning artefact and
`issues/10-sidebar-mapping.md` is the ticket named by Nut ("Work on ticket 10, branch
feat/daisyui-adapter at fad325b"). No `spec.md`; the ticket set is not carrying
`Status: approved`. Ticket 10 may not edit other tickets, `src/`, the map's Destination, or `Notes`.
Review base is `fad325b`.

Ticket step, in the ticket's own words: "This is a grilling ticket, not implementation. Interview me
one question at a time, each with your recommended answer and the facts behind it, until all eight
tokens are settled."

Settled before this session, not re-litigated: namespace `--daisy-color-<source>` plus `--daisy-radius`;
the table is written by the adapter CLI, not a registry item; every value is opaque, no alpha; 09's
surface-first rule (secondary, muted, accent -> base-200; card, popover -> base-100); the escape hatch
is the user-owned overrides file with `html:not(.dark)` and `html.dark`.

## Data shape

One table, eight rows: `token`, `source or expression`, `reason`, `measured pair`. The measured pair is
what the harness reads back at runtime in both schemes.

## Decisions (grilled with Nut, one question at a time)

- [x] D1 `sidebar`: `var(--daisy-color-base-200)`. The panel is a surface, and it cannot be base-100
      because `sidebar-inset` and the outline menu button fill `bg-background`.
- [x] D2 `sidebar-foreground`: `var(--daisy-color-base-content)`. daisyUI's foreground on the ladder;
      the group label already dims itself with `/70`.
- [x] D3 `sidebar-accent`: `var(--daisy-color-base-300)`. The next rung after base-200; 09's accent mix
      would be a 0.45% step here. Re-checked on the render: dark is 2.11 points, kept with the limit
      recorded.
- [x] D4 `sidebar-accent-foreground`: `var(--daisy-color-base-content)`. No content token for the
      ladder's third rung.
- [x] D5 `sidebar-border`: 09's `color-mix(base-content 10%, base-100)`. Five uses across two surfaces.
- [x] D6 `sidebar-ring`: `var(--daisy-color-primary)`. Same source as the core ring.
- [x] D7 `sidebar-primary`: `var(--daisy-color-primary)`. The app-level brand slot; no component reads it.
- [x] D8 `sidebar-primary-foreground`: `var(--daisy-color-primary-content)`. daisyUI's guaranteed pair.

## Proof (harness, not source)

- [x] `registry-10/`: the item, daisyUI's built-in light and dark pair, the rendered page, `check.mjs`
- [x] `harness/run.mjs --page` and `harness/shot.mjs --selectors` (colours sampled through a 1x1 canvas);
      ports 5199 and 5209 only, every server killed
- [x] One run (`2026-10-29T05-44-45-513Z`), screenshots light and dark, resolved values for four pairs
- [x] Artefacts copied to `evidence/10-sidebar/`; 61 checks green against the committed copies

## Closing

- [x] `## Answer` with each token, its source or expression, and its reason; `Status: resolved`
- [x] `Lesson:` and `Check:` appended to the ticket
- [x] One line appended to the map's `## Decisions so far`
- [x] `no-comments` because the diff carries code (fixture, check, harness)
- [x] `code-review` on the Spec axis; findings fixed before close
- [x] Conventional commit on `feat/daisyui-adapter`, pushed and tagged `t10-sidebar-mapping`; no merge
      because the base is `main`

skip: critical-path review loop, no auth, payments, discount, migrations, concurrency, shared state, public API or DB schema. The Spec-axis `code-review` found five precision gaps and one weak assertion; all six are fixed and `check.mjs` is green at 61.

