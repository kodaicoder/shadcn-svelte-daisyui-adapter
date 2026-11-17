Phase: implementation

# Ticket 71: Storybook explains the token layer

Ticket: `.scratch/daisyui-adapter/issues/71-storybook-token-docs.md`
Session: ses_e18bb5a7bffeKzAnGdTEl5lwlM
Branch: fix/nutchapon/ai/contrast-warning
Base: e916a2c

## Blast radius

state: unbuilt (no `graphify-out/graph.json`, no manifest; `graphify-scope` reports `unbuilt`)
seeds: n/a, graph unavailable; fallback is direct `rg` reads, per the operator's brief
anchors:
`src/stories/tokens/{colour-roles,tones,type-scale,radius}.mdx` <- new
`packages/daisyui-adapter/package.json` <- one `./tokens` exports entry
`.storybook/main.ts` <- already globs `../src/stories/**/*.mdx`; untouched
unlisted:
`packages/daisyui-adapter/dist/map.mjs` <- the colour role tables, reachable today through `./map`
`packages/daisyui-adapter/targets/atom-tones.mjs` <- `ATOM_TONES` site `skeleton-atom-tones` carries the soft-surface rows
`packages/daisyui-adapter/targets/field-variants.mjs` <- `FIELD_VARIANTS` site `input-field-tones` carries the idle border rows
`packages/daisyui-adapter/targets/radius.mjs` <- `ROLE_STEPS`, `SIZE_STEPS`, `RADIUS`
`packages/daisyui-adapter/targets/type-scale.mjs` <- `TYPE_SCALE`
`packages/daisyui-adapter/targets/variants.mjs` <- `VARIANT_ROWS`, the tone names and presentations above the atom set
`src/routes/layout.css` <- `--radius-sm|md|lg` are `calc(var(--radius) * 0.6|0.8|1)`, and the `dark` variant binds `.dark`
`src/lib/components/skeleton-fixed/skeleton.svelte` <- holds the soft-surface literals Tailwind emits
`src/lib/components/input-fixed/input.svelte` <- holds the idle border literals Tailwind emits
`.verify/prove-70.mjs` <- the proof shape to model
`.opencode/skills/verify/features/storybook.md` <- names the story set and port 6007

## Playbook: Feature

1. `how` over the affected subsystem.
   skip: read directly. The adapter tables, `Configure.mdx`, `.storybook/main.ts`, `.storybook/preview.ts`, the verify skill and `prove-70.mjs` settle the subsystem. The one open unknown is an MDX capability question (can a page build its specimens from imported tables), which is an experiment, not a walkthrough.
2. `architect` for parallel design exploration.
   skip: docs-only diff, no interface boundary, no behavior change. The page shape is fixed by `Configure.mdx`, and the single design fork (how a page reads table values) is settled by the smoke build in step 4, not by four model opinions.
3. Write the throughput checkpoint as four todo items.
   - **Blocking first steps.** The `./tokens` export must resolve in Node and in the Storybook build before a page can import it; a smoke page proves the MDX can build a specimen from an imported table before four pages are written on that assumption.
   - **Independent workstreams.** The four pages are disjoint files; the proof script is independent of them except for the titles it reads. Disjoint or not, one writer holds all four pages because they share one specimen idiom.
   - **Shared mutable state.** One writer on `src/stories/tokens/`, `packages/daisyui-adapter/package.json` and the proof; port 6007, `node_modules/.cache/storybook` and `.verify` are shared, so the dev server and the storybook vitest project serialize, and the proof writes to OS temp until the end.
   - **Smallest safe decomposition.** Two sequential delegates: the first owns the export plus the four pages, the second owns `.verify/prove-71.mjs`. They never hold the same file, and the proof cannot be written against an unbuilt page.
4. Delegate code-writing to a subagent with file paths, the data shape, and success criteria.
5. Verify on the matching surface: live Storybook in `viewMode=docs`, both schemes, console and axe.
6. Rebase into small, ordered commits: export, pages, proof.
7. `interrogate` only for a contested design: not run, the shape is fixed by `Configure.mdx` and ticket 70's proof.
8. Opening a PR: no PR, the branch is shared and the operator lands it.

Code-coupled work: one owner per unit, checkpoint inline.

## Decisions taken before the first edit

- Format: `.mdx` under `src/stories/tokens/`, `Meta` from `@storybook/addon-docs/blocks`, titles
  `Tokens/ColourRoles`, `Tokens/Tones`, `Tokens/TypeScale`, `Tokens/Radius`. A docs page is not a
  story, so the a11y proof opens `viewMode=docs`.
- Reachability: add one `"./tokens": "./targets.mjs"` entry to the adapter `exports`. The `.` and
  `./map` entries stay byte-identical so `@plugin` resolution is untouched. Fallback if publint, the
  pin or `prepack` refuse it: relative repo imports, recorded with the reason.
- Tones: the page names the seven tone names and shows one specimen row per tone (fill, soft,
  border, foreground). `variants.mjs` presentations are named in prose, not duplicated as rows.
- Specimen idiom: inline `style` with `var(--token)`, plus the two parsed class rows for surfaces and
  borders whose alpha and `dark:` twins live only in the shipped fixed copies. No `dark:` in the
  page, no daisyUI class, no hex.
- Radius: `--radius-sm|md|lg` are declarations in the generated stylesheet, not adapter table rows. The
  page first printed the formula and let the proof assert the live ratio; review round 4 replaced that
  with a `?raw` read of `src/routes/layout.css`, parsed at module scope, so a stylesheet edit moves the
  page and the hand copy is gone.

## Progress

- [x] claim (ses_e18bb5a7bffeKzAnGdTEl5lwlM)
- [x] export entry + smoke page
- [x] four pages
- [x] proof script
- [x] gates: check, prettier, eslint, storybook vitest, test:adapter, prepack, static build, live proof
- [x] review round, Standards and Spec
- [x] round 4 fixes, rebuild and re-prove (233/233 checks)
- [x] commit 807cb39, tag daisyui-adapter-71
- [ ] close commit with Lesson and Check

## Findings and decisions from implementation

- MDX + prettier: a standalone comment at MDX top level makes prettier print the next ESM block as
  markdown, so `*` inside a string became `_` (`calc(var(--radius) _ 0.6)`). Non-export top-level
  statements also lose their indentation. Every module-scope binding is therefore `export const`, and
  comments sit inside the declaration they describe.
- MDX here compiles to JSX. `{items.map(...)}`, exported components, `style={{}}` and package subpath
  imports all work; Svelte template syntax does not. The smoke page proved it before four pages were
  written on the assumption.
- Tone surfaces and borders: their literal class strings live only inside the generated fixed copies,
  so the page parses the `skeleton-atom-tones` and `input-field-tones` rows at module scope and throws
  when a row is missing. Tailwind already emits both strings from the shipped copies, so the page adds
  no class to any scanned source.
- Class strings are not printed; token names are (`--<role>`, `--<tone>`, `text-<rung>`,
  `--radius-<step>`), because the token name is the stable API and the class string is an
  implementation detail of the copy.
- Review finding, fixed: the tone fill cell had no edge, so `secondary` in light was a white block on
  a white page. Fill, soft and foreground cells now carry `1px solid var(--border)`; the border cell
  keeps a borderless base so its inline width and style never override the tone colour class.
- Refused, out of the ticket's file scope: editing README `### Tokens` / `### Radius` / `### Variants`
  into a pointer at these pages. The overlap is named in the ticket Answer and goes to a follow-up.
  `docs/component-color-usage.md` stays as a dated measurement record; it documents resolved values per
  component part for one theme, not the role map, so it does not overlap.
- Refused: an `.mdx` block in the eslint flat config. `eslint src/stories/tokens` reports all files
  ignored; `eslint .` reports 43 pre-existing errors in untouched files and none in the new pages.

## Review round

Standards and Spec reviewers ran in parallel against `e916a2c` plus the working tree. Fixed in round 4:

- the "thin accent uses the raw tone" rule contradicted the table: `success` and `info` borders carry
  `-text`. The rule is now derived from the parsed border rows, and the exception tones are printed
  from the table.
- the radius multipliers were a hand copy of `src/routes/layout.css`. The page now reads that file as
  text (`?raw`), parses `--radius` and the three step declarations, and throws when one is missing.
- the seven tone names were typed by hand. They now come from the key order of the parsed
  `input-field-tones` rows.
- the colour role groups were typed by hand. A coverage guard now throws when a direct table row is in
  none of the groups, or a mix key, text tone or static key is unplaced.
- the scheme prose claimed the toolbar moves the swatches, which a docs entry does not get. Rewritten.
- hand counts, duplicated source prose, the single-use `RungList`, the duplicated `Static` component and
  `tokenOf`'s two jobs removed or derived.
- the type-scale import lost its reason in the comment pass; restored, because the deviation is not
  visible from the code.

Refused, each with the reason, and proposed as follow-ups:

1. Rewriting README `### Tokens`, `### Radius` and the tone paragraphs of `### Variants` into a
   pointer. The operator's file scope is four pages plus one exports entry, and `README.md` is the
   published package readme, so the edit needs its own ticket. The overlap is named in the ticket
   Answer.
2. A curated `tokens.mjs` barrel in place of `./tokens -> ./targets.mjs`. A new package file is outside
   the scope. Consequence recorded: `./tokens` publishes the fixer's whole target manifest, including
   `stock` and `fixed` site strings, and the subpath name is wider than what it points at.
3. Re-exporting `TYPE_SCALE` from `targets.mjs` so the page uses the subpath. A second package edit is
   outside the one-entry scope; the deep import and its one-line reason stay.
4. A shared module for the chrome repeated in the four pages (`PAGE`, `MUTED`, `HEAD`, `Header`, the
   `<style>` block). Same scope, and a shared utility needs the operator's permission.
5. Making the theme toolbar reach docs entries through `.storybook/preview.ts`.

The a11y gate for these pages is the live proof only. The `storybook` vitest project runs stories and
does not see a docs entry, which the ticket states.
