Phase: implementation

# Ticket 75: story files are not fixed copies

Ticket: `.scratch/daisyui-adapter/issues/75-story-files-are-not-fixed-copies.md`
Session: ses_e327321b6ffeOE797kkxW963CD
Branch: fix/nutchapon/ai/contrast-warning
Commit: c9fee02 (tag daisyui-adapter-75)

## Blast radius

state: unbuilt (no `graphify-out/graph.json`)
seeds: n/a, graph unavailable
anchors:
  `packages/daisyui-adapter/test/drift.mjs` <- the `copies` walk and both checks that read it
unlisted:
  `package.json` <- the published `files` list already excludes `dist/**/*.stories.*`
  `src/lib/components/button-fixed/button.stories.svelte` <- the file the walk now skips
  every other `*-fixed` directory <- no story file today, but the rule applies to each
fallback: rg `endsWith('.svelte')`, read `drift.mjs:129-161`

## Playbook: Bug fix

1. Reproduce it yourself on the matching surface.
   Done. `pnpm test:adapter` failed one check with `button-fixed/button.stories.svelte:
   ui/button/button.stories.svelte is missing`.
2. Binary-search the cause.
   The only zero-pin-copy file in a `*-fixed` directory was the story added by ticket 67. The walk
   filtered on `.svelte`, not on the component file naming the fixer produces.
3. Plan the fix.
   One filter clause, no function boundary crossed. Implemented directly.
4. Verify on the same surface.
   `pnpm test:adapter` now passes 24 checks, 0 failed, with the story present.
5. Stage the commits so the failing repro lands before the fix in git history.
   skip: the failing run is the pre-existing red gate, and a test that asserts the absence of a false
   positive would restate the filter. The repaired walk is the guard.
6. Run Opening a PR.
   skip: the ticket pipeline closes with a commit and a tag.

## Todo

- [x] skip `*.stories.svelte` in the `copies` walk
- [x] `pnpm test:adapter` green, 24 checks
