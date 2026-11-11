# 72: The story lint and the static build gate

**What to build:** the two gates that keep the docs honest. A lint over every story file that fails on
the three failures this pattern keeps producing, and a static build that the release runs, so a broken
docs build cannot ship.

**Status:** ready-for-agent
**Labels:** docs, storybook, gate
**Blocked by:** 68, 69, 70

The three rules come from the reference project, where each one had a real failure behind it:

- a story that renders content must set `asChild`, or the story renders a wrapper control around its
  own markup, a button inside a button;
- a component story must define a `Playground` with non-empty args and a template that spreads them,
  or Controls cannot drive the component;
- a select control must go through the shared helper, because a raw `control: 'select'` keeps the
  docgen union and silently drops URL-persisted args.

The lint must prove itself: each rule is broken on purpose in a fixture and the check has to fail.

- [ ] a check script walks every story file and reports file, line and rule for each finding
- [ ] each rule is proven by a fixture that fails
- [ ] the script exits non-zero on a finding and zero on a clean tree
- [ ] the command is wired into the release gate for 0.3.0
- [ ] the static build command is wired into the release gate and writes a clean build
- [ ] a second build run is byte-stable, so a release can diff it
- [ ] the operator reviews the built docs before the release
