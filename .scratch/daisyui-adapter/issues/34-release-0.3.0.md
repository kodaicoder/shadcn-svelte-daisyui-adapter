# 34: Release 0.3.0

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6, ses_e12edb773ffemAfWkemyMXneJn
Lesson:
Check:

**What to build:** The operator visual check, the publish and the registry proof for 0.3.0.

**Blocked by:** 49, 51, 52, 66, 67, 68, 69, 70, 71, 72

**Status:** ready-for-agent

- [ ] The operator visual check passes on the light and dark screenshots and the checklist
- [ ] 0.3.0 publishes through the OTP gate and the registry serves it as `latest`
- [ ] The literal `pnpm dlx <pkg>@0.3.0 init` runs on a fresh scaffold: the map, the fixer, the build and the render pass; the evidence is kept
- [ ] The `v0.3.0` tag lands; the changelog and version match

## Docs gate, 2026-11-18

Ticket 72 added two commands and a workflow. A release runs both commands from the repo root and keeps
the output.

```sh
pnpm check:stories      # 19 story files, 83 stories, 3 rules, 13 fixtures, exit 0 on a clean tree
pnpm check:docs-build   # two builds, one digest, exit 0 when they match
```

`check:docs-build` writes `.verify/docs-build/a` and `b`, both gitignored, and prints the digest of each
build. Measured on `fix/nutchapon/ai/contrast-warning` after ticket 78, with `pnpm check:docs-build` from the
repo root and the addon cache cleared before each build, 120 files per build and
`sha256:65719d953b0918452ab58d951dc08db1466e36f9cb0d95e856bdea4ad1c737d2` on both. Record that digest in
the release note. The earlier `sha256:cdb575b8…` on 120 files was measured before ticket 78 changed
`slider-fixed/slider.stories.svelte`, so it no longer describes this tree.

The operator review opens build a, served by the gate itself.

```sh
pnpm check:docs-build --serve 6007
```

Open `http://127.0.0.1:6007/` and walk the components and the four token pages in both schemes. The gate
refuses to serve when the two builds differ.

One measured limit is worth knowing. The gate clears `node_modules/.cache/storybook` before each build,
because a cached addon manager bundle embeds the absolute path of the checkout that built it. Without
that clear, a build that inherits another checkout's cache differs from a clean build in six files under
`sb-addons/**`, and the minified identifier names differ too. Every clean build agrees with every other
clean build.

CI runs both commands in `.github/workflows/docs-gate.yml`, as the jobs `stories` and `docs-build`, on
every push and every pull request.

## State on resuming, 2026-11-05

Tickets 38, 39, 40, 41, 42, 44, 45, 46, 47 and 48 were reconstructed into ten ordered commits on
`fix/nutchapon/ai/contrast-warning`, one per ticket, each verified by its own seams and reviewed on
two axes. The split, its cost and the rulings that changed the recorded tree are in
`.audit/34-commit-split.md`. The reconstructed tree matches the recorded final state except for five
intentional deviations: the border strings in the CLI and README, the raw-tone sentence in the README,
the 45-declaration breakdown in the README and CHANGELOG, the screenshot script that keeps real
console errors, and the checkbox that prefers the minus on indeterminate.

What this ticket still needs: the operator's npm login (`npm whoami` returns 401), the OTP publish,
the registry proof with `prove.mjs --registry`, the `v0.3.0` tag on a branch the operator names, and
this ticket's Lesson and Check.

## Release run, 2026-11-18

Preflight on `fix/nutchapon/ai/contrast-warning` at `9a496b0`, tree clean, `0 0` against
`origin/fix/nutchapon/ai/contrast-warning`.

- Every blocker re-read on HEAD: 49, 51, 52, 66, 67, 68, 69, 70, 71 and 72 are `Status: resolved`.
- `packages/daisyui-adapter/package.json` is `0.3.0`, and `npm view @kodaicoder/shadcn-svelte-daisyui-adapter
  dist-tags.latest` is `0.2.0`, so 0.3.0 is unpublished.
- `npm whoami` still returns `npm error code E401`, the same 401 the 2026-11-05 note records, so the publish
  needs the operator's login.
- `pnpm check:stories`: `19 story files, 83 stories, 3 rules, 13 fixtures`, then `no findings, fixtures match`,
  exit 0.
- `pnpm check:docs-build`: `build a 120 files`, `build b 120 files`, `digest a` and `digest b`
  `sha256:65719d953b0918452ab58d951dc08db1466e36f9cb0d95e856bdea4ad1c737d2`, `result identical`, exit 0.
- `pnpm test:adapter`: `all drift checks passed`, exit 0, including `a fixed temp project reports no
  customized site :: 0 customized, 0 stock, 0 missing, 318 fixed`.

Ticket 78 left one documentation gap: neither the 0.3.0 changelog nor the README named the slider's required
`thumbLabels`. Each carries one sentence now, and the changelog ships in the tarball because `files` lists it.

### Publish handover

The publish, the OTP and the visual verdict are the operator's steps. First `npm login` in the operator's own
terminal, because `npm whoami` returns 401. Then, from `packages/daisyui-adapter`:

```bash
npm publish
```

`publishConfig.access` is `public`, so no `--access` flag is needed. npm prompts for the one-time password on
the operator's own terminal; it is never written to a file, a commit, or this session. The expected last line
is `+ @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0`.

### After the publish

```bash
npm view @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 version
npm view @kodaicoder/shadcn-svelte-daisyui-adapter dist-tags.latest
```

Both must print `0.3.0`. Then the registry proof, which runs the literal
`pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 init` on a fresh scaffold and then builds and
renders it, keeping the evidence under `.scratch/daisyui-adapter/evidence/34-release-0.3.0/`:

```bash
node .scratch/daisyui-adapter/harness/run.mjs --pin-registry \
  --then "exec node D:/Workspace/DesignSystem/New_Project/.scratch/daisyui-adapter/harness/prove.mjs D:/Workspace/DesignSystem/New_Project/.scratch/daisyui-adapter/evidence/34-release-0.3.0 --registry"
```

`--pin-registry` points the app's adds at the repo's pinned components, because the live shadcn registry has
moved past the pin; it reaches prove's own add through `COMPONENTS_REGISTRY_URL`.

The operator's visual check is `pnpm check:docs-build --serve 6007`, read at `http://127.0.0.1:6007/` in light
and dark, over the components and the four token pages. The tag is created only after the registry reads
0.3.0, points at this ticket's release commit, and is pushed as a tag alone.
