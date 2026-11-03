# Public hosting and publish
Session IDs: ses_e64ba5071ffe9EeSfpQF0fR3pv

Type: task
Status: resolved
Blocked by: 08, 16

## Question

Where does the package live, and how does it stay published?

Required:
1. Pick the npm identity: package name, scope, and the bin name behind `pnpm dlx <pkg> init`. The name in 07 and 14 is a placeholder.
2. Version policy: the CLI writes its version into the stylesheet's header comment, so an exact version is what a project records. Decide when the number moves and how a mapping change is announced.
3. Publish path: which public repo the source lives in. This repo now has a remote
   (`github.com/kodaicoder/shadcn-svelte-daisyui-adapter`), so "new home" is reduced to whether the
   package ships from here or from a dedicated repo. Also settle the `prepare: tsc` build that
   produces `dist/` during `npm publish`.
4. Verify from a clean machine: a fresh SvelteKit project, `pnpm dlx shadcn-svelte@latest init`, then `pnpm dlx <pkg>@<exact> init`, then `pnpm build` with a real two-block theme under `src/`.
5. Record the licence, the changelog policy, and what happens to a project whose header comment names an older version.

DoD: a stranger can install with the two commands in 07 on a clean machine, and the package name and version are written into the map's Decisions so far.

## Answer

Resolved 2026-11-02. Published as `@kodaicoder/shadcn-svelte-daisyui-adapter@0.1.0`, bin
`daisyui-adapter`, from `packages/daisyui-adapter/` in this repo.

### 1. Identity

| field | value |
| --- | --- |
| package | `@kodaicoder/shadcn-svelte-daisyui-adapter` |
| scope | `@kodaicoder`, an npm org owned by `nutchyleo123` |
| bin | `daisyui-adapter`, so the command is `pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@<exact> init` |
| version | `0.1.0`, first release, `latest` |
| licence | MIT |
| repository | this repo, directory `packages/daisyui-adapter` |

The registry also holds `0.0.0-stage`, npm's staged-publishing placeholder ("Temporary package
placeholder for staged publishing", `stub: true`, 2 files, no bin, no dist-tag). It was created with the
package at 09:03:42Z and is not a release. It is recorded here so the first real version is not
miscounted, and it is left in place because unpublishing a stub is a destructive external change with no
benefit.

`package.json` is the only identity list. The CLI reads `name`, `version` and the bin name from it at
runtime, and derives the `@plugin "<pkg>";` line, the header comment and its own install spec. No second
literal of the name or version exists in `cli/` or `dist/`. The pre-publish 404s were the account, not
the name: `@kodaicoder` is an org, and `nutchyleo123` publishes inside it.

### 2. Publish path, and the build claim

The source moved out of scratch to `packages/daisyui-adapter/`, a pnpm workspace member. It publishes
from here, not from a second repo. The root `package.json` is a SvelteKit library named `new-project`,
so the repo root cannot be the package.

`prepare: tsc` in 08 does not exist and never did. The package has no `scripts` block, no `tsconfig.json`
and no TypeScript. `dist/index.mjs`, `dist/map.mjs` and `dist/ramp.mjs` are hand-written ESM, introduced
in `5bff288`. There is no build step to settle: `pnpm pack` ships `dist/` and `cli/` as they are. 08's
module list is stale too. The modules are `index`/`map`/`ramp`, and the parser lives in `index.mjs`. The
tarball holds 8 files: the manifest, README, CHANGELOG, LICENSE, three modules and the CLI.

### 3. Version policy

- `0.x` until the mapping has survived real projects.
- **Patch** fixes the CLI or the parser without changing a byte the CLI writes or a token the plugin
  emits. No re-run.
- **Minor** changes a mapping row, a token's shape or the plugin's emitted set. A re-run applies it, and
  the changelog names the rows and the command.
- **Major** changes the header format, the command name, the theme path or a supported layout.
- The header pins the exact re-run:
  `/* <pkg> <version> | re-run `pnpm dlx <pkg>@<version> init` after `shadcn-svelte init` */`.
- An **older** header is stripped and replaced, and the CLI prints `upgrading <old> -> <new>`. There is
  no migration beyond the re-run.
- A **newer** header makes the CLI refuse with E4, non-zero, and write nothing.
- A bare pre-21 chart row is left as it is and warned about once, naming the overrides file. 21 measured
  the original value as destroyed, so the CLI does not claim to recover it.
- `CHANGELOG.md` carries one section per published version.

### 4. What 16 left out

The 16 CLI had no self-install, though 07 §3.5 and 08 §2.5 require one and 14's probe did it. The CLI
now runs `pnpm add -D <pkg>@<version>` when `node_modules` does not hold its own version, and prints
`installed` or `already installed`. `DAISYUI_ADAPTER_INSTALL_SPEC` lets the pre-publish tarball test
drive the same branch.

The output follows 07 §4 in order. It also replaces an existing header instead of stacking a second one,
which the 16 CLI did on any version change.

### 5. Clean machine

The DoD's literal adapter command ran from the registry in `evidence/17-public-hosting/arm-registry/`:
`pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.1.0 init` on a fresh SvelteKit 3 project with the
two-block theme, then six `shadcn-svelte add` calls, a second `init` byte-identical at `fea1e298…`, and
`pnpm build` with no console errors. The earlier arms cover the packed tarball path (`arm-full`) and the
deleted-theme build (`arm-missing`).

One limit, stated: `shadcn-svelte init` is interactive because it wants a preset id, so the harness
builds its step-4 state instead, as 15 recorded. The adapter command, the registry fetch, the
self-install and the build are literal. A person at a keyboard runs the same two commands 07 lists; the
only difference is who creates the step-4 state.

### 6. Licence and changelog

MIT, in `packages/daisyui-adapter/LICENSE`, with `"license": "MIT"`. `CHANGELOG.md` starts at the first release, 0.1.0, and
records the re-run rule; the `0.0.0-stage` stub is not a release. The package is not affiliated with
shadcn-svelte or daisyUI; the README says so.

Lesson: A package name is publishable only when the publishing account sits inside the scope, and npm's publish dry run is the one place where the normalized bin target and the exact file list are visible.
Check: code - `registry-16/publish-test.mjs` runs the published `pnpm dlx <pkg>@<version> init` with no copy of the package in the app, asserts the self-installed devDependency is the exact CLI version, one header, and six adds unchanged at `fea1e298…`; `harness/run.mjs` builds and renders that app, and `smoke.mjs` covers the older header, the newer header and the bare pre-21 row.
