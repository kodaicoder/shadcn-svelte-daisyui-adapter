# 75: The drift copy walk reads story files as fixed copies
Session IDs: ses_e327321b6ffeOE797kkxW963CD
Lesson: A directory walk filtered by a broad extension treats every new sibling file type as data it owns; the filter has to name what the producer writes.
Check: code - `packages/daisyui-adapter/test/drift.mjs` skips `*.stories.svelte` in the fixed-copy walk, and `pnpm test:adapter` passes 24 checks with `button-fixed/button.stories.svelte` present.
Closeout: c9fee02 (tag daisyui-adapter-75)

**What to build:** the fixed-copy comparison skips `*.stories.svelte`, so a story beside its component
is not mistaken for a copy the fixer produces.

**Status:** resolved
**Labels:** adapter, test, storybook
**Blocked by:** None

Found after ticket 67. `pnpm test:adapter` fails with
`button-fixed/button.stories.svelte: ui/button/button.stories.svelte is missing`. The walk at
`packages/daisyui-adapter/test/drift.mjs:129` takes every `.svelte` file in a `*-fixed` directory, and
the fixer never writes a story. The package `files` list already excludes `dist/**/*.stories.*` for
the same reason.

- [x] `pnpm test:adapter` passes with the story in place
- [x] a story beside its component is not compared to the pin
- [x] no other drift check changes
