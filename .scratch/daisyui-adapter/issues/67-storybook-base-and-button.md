# 67: Storybook runs with the theme toolbar, the args helper and a Button tracer

**What to build:** a working Storybook that documents one real component end to end, so the rest of
the atom set is a repetition of a proven shape. It brings the config the repo lacks, the controls
helper, and `Button` rendered from its shipped copy with autodocs, a Playground and every tone and
size.

**Status:** ready-for-agent
**Labels:** docs, storybook, atoms
**Blocked by:** None (can start immediately)

Storybook 10.6.4 is installed with the a11y, docs, svelte-csf, themes and vitest addons, and holds
only the three scaffold stories. Nothing switches the scheme, nothing enforces the story rules, and
no component story exists.

The reference project `D:\Workspace\DesignSystem\Project` already solved the theme decorator and the
select-control problem. Read its `.storybook/preview.ts` and `src/stories/story-args.ts` before
writing these.

- [ ] the story globs cover `src/stories/**` and every component story directory
- [ ] the theme toolbar switches `data-theme` between light and dark through `addon-themes`, and no story hardcodes a scheme
- [ ] `addon-a11y` runs as an error with `color-contrast` disabled, because the adapter's own contrast gate owns that rule
- [ ] a `selectControl` helper exists and keeps args in the URL, which a raw `control: 'select'` drops
- [ ] a `Button` story renders from the shipped copy, declares autodocs, and shows all seven tones, every size, disabled and link
- [ ] the `Playground` story drives the component from Controls and carries non-empty args
- [ ] composed stories set `asChild`, so the story renders its own markup instead of a wrapper control
- [ ] `pnpm storybook` serves the story in both schemes with no console error and no a11y violation
