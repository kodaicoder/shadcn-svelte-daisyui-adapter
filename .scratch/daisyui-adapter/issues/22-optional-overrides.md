# Overrides are optional

Type: task
Status: resolved
Blocked by: none

## Question

`init` creates `daisyui-adapter.overrides.css` and writes its `@import` even when the project has no
overrides. The operator does not want an empty file and an import left behind. Overrides should stay
possible, but opt-in, and the README should show how to add them.

## Answer

Done in 0.2.0. The CLI no longer creates `daisyui-adapter.overrides.css` and no longer writes
`@import "./daisyui-adapter.overrides.css";`. Overrides are opt-in. The README's "Overrides (optional)"
section shows the manual setup: create the file beside the global stylesheet, add the import after the
other `@import` lines and before the generated `:root` and `.dark` blocks, and use `html:not(.dark)` for
light and `html.dark` for dark, because the import comes before the generated blocks and source order
alone loses.

The CLI never deletes or rewrites an existing file or import. A project that installed 0.1.0 keeps both,
and deletes both itself if it does not use them. The change is not a migration: the new CLI simply stops
adding the pair. The output drops the old override line, so `init` prints four lines instead of five.

0.2.0 is a minor bump because the bytes the CLI writes and the install contract change. A re-run applies
it to a 0.1.0 project and updates the header. `CHANGELOG.md` records the version.

Lesson: An escape hatch created empty on every install reads as generated output, so make it opt-in at the point the user needs it and leave the file entirely to the user.
Check: code - `registry-16/smoke.mjs` asserts no override file and no import after `init`, keeps an existing import and a byte-identical existing file, and `publish-test.mjs` asserts the absence on the published path.
