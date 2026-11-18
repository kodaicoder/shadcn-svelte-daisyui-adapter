# 72: The story lint and the static build gate

Session IDs: ses_e15c53a84ffemgt44Ia38rmkFx
Lesson: A build gate that compares two builds only proves what it controls. Storybook caches prebuilt addon manager bundles and a cached bundle records the checkout that built it, so a gate that inherits a cache compares the cache against itself instead of the tree.
Check: code - `scripts/check-build.mjs` clears `node_modules/.cache/storybook` before each build and compares every remaining byte, and `scripts/check-stories.mjs` runs its thirteen fixtures on every invocation, so a rule without a failing fixture or a build with an inherited cache fails the run.
Closeout: e82237e (tag daisyui-adapter-72)

**What to build:** the two gates that keep the docs honest. A lint over every story file that fails on
the three failures this pattern keeps producing, and a static build that the release runs, so a broken
docs build cannot ship.

**Status:** resolved
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

- [x] a check script walks every story file and reports file, line and rule for each finding
- [x] each rule is proven by a fixture that fails
- [x] the script exits non-zero on a finding and zero on a clean tree
- [x] the command is wired into the release gate for 0.3.0
- [x] the static build command is wired into the release gate and writes a clean build
- [x] a second build run is byte-stable, so a release can diff it
- [ ] the operator reviews the built docs before the release

## Corrections made while implementing

- "Wired into the release gate for 0.3.0" named no artifact. It is three now. Two package scripts carry the
  commands, `check:stories` and `check:docs-build`. `.github/workflows/docs-gate.yml` runs both on every push
  and pull request, in the jobs `stories` and `docs-build`, because `adapter-drift.yml` states by its missing
  install step that it reads committed sources only. Ticket 34 carries the release command list and the
  operator review step.
- "A story that renders content must set `asChild`" needed a predicate. A `<Story>` renders content when a
  child is not `Text`, `Comment`, `ExpressionTag`, `HtmlTag`, `RenderTag`, `ConstTag` or `DebugTag`, and is
  not the `template` snippet. Text-only children are slot content, so `<Story name="Plain">Label</Story>`
  passes, and a template story passes without `asChild`. The addon source is the authority.
  `content.js:108` returns the raw children when `asChild` is set, and `content.js:131` wraps them as
  `<Component {...args}>` when it is not.
- The `Playground` rule reads the whole `<Story>` tag through `svelte/compiler`, so the six files that put
  `name="Playground"` on its own line are read correctly, and the finding lands on the `<Story` line.
- The select rule targets a `control` property whose value is the literal `select`, single or double quoted,
  found by walking the parsed script block rather than scanning lines. `selectControl(...)` is a call
  expression, so it passes. `src/stories/story-args.ts` holds the one legitimate raw select and is not a
  story file, so discovery never reads it.
- "Byte-stable" is measured, not assumed. Two builds agree byte for byte apart from `project.json`'s
  `generatedAt`, and only when both start from the same addon cache state. A cached addon manager bundle
  under `node_modules/.cache/storybook` embeds the absolute path of the checkout that built it, which showed
  up as `NODE_PATH:["D:\\...\\_wt\\72\\node_modules\\..."]` against `NODE_PATH:[]`. The gate clears that
  cache before each build. Measured after the clear, 120 files per build and
  `sha256:cdb575b89c70c90397916d25680a8c8e6f24dad2333c6edaf87a6d20f6abbedc` on both, reproduced across three
  separate runs.
- A fourth finding id, `story-file`, carries a parse failure and a CSF `.stories.ts` file, so the lint
  reports them instead of ending the run. A thirteenth fixture proves it.
- Fixtures end in `.stories.svelte.fixture`. Measured, prettier infers no parser for that extension and
  eslint supplies no config, so neither needs an ignore entry, and the Storybook globs and the storybook
  vitest project never see them.

The last box is the operator's. Ticket 34 names the path, `.verify/docs-build/a`, and the URL,
`http://127.0.0.1:6007/`, served by `pnpm check:docs-build --serve 6007`.
