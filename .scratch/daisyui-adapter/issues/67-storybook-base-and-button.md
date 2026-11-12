# 67: Storybook runs with the theme toolbar, the args helper and a Button tracer
Session IDs: ses_e327321b6ffeOE797kkxW963CD
Lesson: A ported config is only proven for the mechanism it was proven on; the reference's `data-theme` toolbar would paint nothing here, because this repo binds the dark tokens to `.dark`.
Check: process - `.audit/67-storybook-base-and-button.todo.md` Verification records the html class and the painted background per scheme from the live Storybook, and `.opencode/skills/verify/features/storybook.md` names the `.dark` binding for tickets 68 to 72.
Closeout: 6d32aea (tag daisyui-adapter-67)

**What to build:** a working Storybook that documents one real component end to end, so the rest of
the atom set is a repetition of a proven shape. It brings the config the repo lacks, the controls
helper, and `Button` rendered from its shipped copy with autodocs, a Playground and every tone and
size.

**Status:** resolved
**Labels:** docs, storybook, atoms
**Blocked by:** None (can start immediately)

Storybook 10.6.4 is installed with the a11y, docs, svelte-csf, themes and vitest addons, and holds
only the three scaffold stories. Nothing switches the scheme, nothing enforces the story rules, and
no component story exists.

The reference project `D:\Workspace\DesignSystem\Project` already solved the theme decorator and the
select-control problem. Read its `.storybook/preview.ts` and `src/stories/story-args.ts` before
writing these.

- [x] the story globs cover `src/stories/**` and every component story directory
- [x] the theme toolbar switches the `dark` class between light and dark through `addon-themes`, and no
  story hardcodes a scheme
- [x] `addon-a11y` runs as an error with `color-contrast` disabled, because the adapter's own contrast gate owns that rule
- [x] a `selectControl` helper exists and keeps args in the URL, which a raw `control: 'select'` drops
- [x] a `Button` story renders from the shipped copy, declares autodocs, and shows all seven tones,
  every size, disabled and link
- [x] the `Playground` story drives the component from Controls and carries non-empty args
- [x] composed stories set `asChild`, so the story renders its own markup instead of a wrapper control
- [x] `pnpm storybook` serves the story in both schemes with no console error and no a11y violation

The theme criterion was corrected on 2026-11-12, with the operator's approval before implementation:
the adapter binds the dark tokens to `.dark` and `layout.css` defines the dark variant as
`&:is(.dark *)`, so the original `data-theme` wording would paint nothing. The shipped decorator is
`withThemeByClassName`, the same addon and toolbar.
