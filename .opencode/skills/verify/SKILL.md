---
name: verify
description: Drive the New_Project SvelteKit app and its Storybook the way a user does, to prove a change actually works. Use when a change needs proof on the real artifact, when checking the button showcase page at `/`, a Storybook story, or the packaged library build. Launches on an isolated port 5199, captures screenshots and DOM evidence under `.verify/evidence/`, and never touches a dev server you already have running.
---

# verify: New_Project

This is the driver skill for this repo. It launches the app, proves one user-facing feature at a
time with Playwright, and keeps the evidence. Reach for it whenever a change needs proof beyond a
unit test: a component that should render, a page that should not throw, a package that should still
export what it claims.

## Surfaces

| Surface      | What a user touches                                  | Entry                       |
| ------------ | ---------------------------------------------------- | --------------------------- |
| Showcase app | the single route `/`, the current component showcase | `pnpm dev`, port 5199       |
| Storybook    | Button, Header and Page stories                      | `pnpm storybook`, port 6007 |
| Package      | `dist/` consumed by another project                  | `pnpm build`                |

Primary surface is the showcase app. Storybook is secondary and needs its own server.

## Launch

Run from the repo root:

```sh
node .opencode/skills/verify/scripts/session.mjs start
```

That starts `pnpm dev --port 5199 --strictPort` detached, records its PID in
`.verify/run/dev.json`, and waits until `http://127.0.0.1:5199/` returns 200 with a rendered
button. Ready means the page has real content, not just that a socket answers.

`--strictPort` matters: if 5199 is taken the launch fails loudly instead of silently moving to
another port and making every later check lie. Port 5173 is left alone, so this never fights the
dev server you have open.

Storybook, when you need it:

```sh
pnpm storybook --port 6007 --ci
```

It is a separate server. Stop it yourself; `session.mjs stop` only knows about the app it started.

## Doctor

```sh
node .opencode/skills/verify/scripts/session.mjs status
```

Read-only. Answers "is this instance worth driving?": PID recorded and alive, port answering 200,
page carrying `data-slot="button"`. Exit code 1 means do not trust any drive result until it is
fixed. Run it first whenever a drive result looks wrong.

## Drive

One command per feature:

```sh
node .opencode/skills/verify/scripts/drive.mjs checkbox
```

`checkbox` opens `/`, drives the `#checkbox` section in both schemes, checks the seven tone fills,
the tone border and ring, the invalid ring, the cursor, and the `Field.Label` case, then fails on any
console error or page error. Add `--headed` to watch it run.

The three field journeys drive a route of their own under `/review/<component>`, in both schemes,
against one shared checklist:

- `input` drives `/review/input` and proves a painted border and background, the 28 px height, the
  seven tone borders and rings, the focus ring with no border colour change, the destructive invalid
  border and ring, the disabled opacity, pointer and cursor, the readonly muted surface,
  `cursor: default` and focus, and typing that changes the value.
- `native-select` drives `/review/native-select` and proves the shared states except readonly, the
  seven tones, a 28 px base against a 24 px `size="sm"`, a chevron that lets clicks through, an option
  choice that changes the value, and no hover while disabled.
- `textarea` drives `/review/textarea` and proves the same list plus a 64 px `min-height` and
  `resize: none`.

The eight atom journeys drive their own route under `/review/<component>`, in both schemes:

- `kbd` drives `/review/kbd` and proves three keys or more, the 22 px height, the muted fill, a
  key that never takes the pointer, and a group holding two keys.
- `separator` drives `/review/separator` and proves a horizontal 1 px rule wider than 100 px, a
  vertical 1 px rule at least 40 px tall, both real rules announced as `separator`, and the
  decorative one kept out of the accessibility tree.
- `skeleton` drives `/review/skeleton` and proves two skeletons, the pulse animation, the muted
  fill, empty content, and a 32 by 160 px block.
- `spinner` drives `/review/spinner` and proves a 16 px status spinner labelled Loading that spins,
  a 24 px sibling, and the primary stroke on the large one.
- `marker` drives `/review/marker` and proves four markers with their variants, uppercase text at
  the `text-sm` rung and positive letter spacing in the muted foreground, two 1 px separator
  hairlines and a 1 px bottom edge in the border paint, a 16 px icon kept out of the accessibility
  tree, and one underlined anchor in the link case.
- `progress` drives `/review/progress` and proves three progressbars announcing 0, 50 and 100 of
  100 on a 2 px track in the muted paint, each indicator translated -100, -50 and 0 percent.
- `slider` drives `/review/slider` and proves one thumb on the single case against two on the range
  case, a 12 px primary thumb, an input track, a primary range, a disabled slider at 50 percent
  opacity, and the focus ring on a Tab-focused thumb with its measured width.
- `scroll-area` drives `/review/scroll-area` and proves each case overflows on its axis, a scrollbar
  that mounts on hover with a border-painted thumb, and the viewport focus ring with its measured
  width and alpha.

Available journeys are `checkbox`, `switch`, `radio-group`, `toggle`, `cursor`, `input`,
`native-select`, `textarea`, `kbd`, `separator`, `skeleton`, `spinner`, `marker`, `progress`,
`slider`, `scroll-area`. When you add a feature to the app, add its journey to
`scripts/drive.mjs`.

## Evidence

Every drive writes to `.verify/evidence/<timestamp>-<journey>/`:

- `page.png`: full-page screenshot after the journey's actions
- `result.json`: URL, HTTP status, button count and labels, console errors, pass or fail per assertion

State the proof standard in what you report: the journey must exercise the real user path (a click on
the rendered button, not a component prop in isolation), capture the action and the resulting state,
and verify side effects (DOM, network errors, screenshot) alongside what is visible. A screenshot
alone is not proof; `result.json` is the machine-checked part.

`.verify/` is gitignored. Evidence survives `session.mjs stop` on purpose: cleanup removes instances
and scratch state, never the proof.

## Cleanup

```sh
node .opencode/skills/verify/scripts/session.mjs stop
```

Kills only the PID this skill started, as a process tree, and removes `.verify/run/`. It never kills
by process name, so your own `pnpm dev` is safe. Run it after every drive, including failed ones, so
broken attempts do not strand port 5199.

## Helpers

Both helpers are plain Node ESM, run with `node`, and need no install step. Playwright and Chromium
are already in the repo's devDependencies and browser cache.

| Helper                | Subcommands                                                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/session.mjs` | `start`, `status`, `stop`                                                                                                                            |
| `scripts/drive.mjs`   | `checkbox`, `switch`, `radio-group`, `toggle`, `cursor`, `input`, `native-select`, `textarea`, `kbd`, `separator`, `skeleton`, `spinner`, `marker`, `progress`, `slider`, `scroll-area`, `--headed` |

## Gotchas

- The showcase and each review route render an `h1`; the inherited spec `src/routes/page.svelte.e2e.ts`
  asserts one on `/` only. Do not copy that assertion into a journey. Anchor on the page's `data-slot`
  handle. Each journey targets the current showcase section or its own review route, so a replaced page
  means the journey is removed, not left pointing at a route that no longer exists.
- `pnpm dev` is Vite. Use `--strictPort` or the port check in `session.mjs` becomes meaningless.
- Playwright's own `webServer` in `playwright.config.ts` builds and previews on 4173. This skill does
  not use it: a dev server is faster and does not mask type errors behind a stale build.
- Storybook 10 on Windows occasionally needs a longer first start. Wait for its own "start storybook"
  line rather than polling the port alone.
