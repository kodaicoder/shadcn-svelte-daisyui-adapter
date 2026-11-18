# 34: Release 0.3.0

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6, ses_e12edb773ffemAfWkemyMXneJn
Lesson: A release record quotes numbers, and every one of them ages. The docs digest, the story line and the registry proof's 82-site anchor were all stale on HEAD, so a resumed release re-measures each number instead of trusting the ticket.
Check: code - `pnpm check:docs-build` prints one digest for both builds and `result identical`, `pnpm check:stories` prints `19 story files, 83 stories, 3 rules, 13 fixtures` with no findings, and `node .scratch/daisyui-adapter/harness/prove.mjs <dir> --registry` against the published version returns `ok: true` with `0 stock, 234 fixed, 0 customized, 0 missing`; `run.mjs` keeps its baseline add async because the pin registry is served by the same process.
Closeout: 68cc4ff (tag v0.3.0, signed, pushed)

**What to build:** The operator visual check, the publish and the registry proof for 0.3.0.

**Blocked by:** 49, 51, 52, 66, 67, 68, 69, 70, 71, 72

**Status:** resolved

- [x] The operator visual check passes on the light and dark screenshots and the checklist
- [x] 0.3.0 publishes through the OTP gate and the registry serves it as `latest`
- [x] The literal `pnpm dlx <pkg>@0.3.0 init` runs on a fresh scaffold: the map, the fixer, the build and the render pass; the evidence is kept
- [x] The `v0.3.0` tag lands; the changelog and version match

## Docs gate, 2026-11-18

Ticket 72 added two commands and a workflow. A release runs both commands from the repo root and keeps
the output.

```sh
pnpm check:stories      # 19 story files, 83 stories, 3 rules, 13 fixtures, exit 0 on a clean tree
pnpm check:docs-build   # two builds, one digest, exit 0 when they match
```

`check:docs-build` writes `.verify/docs-build/a` and `b`, both gitignored, and prints the digest of each
build. Measured on `fix/nutchapon/ai/contrast-warning` at `68cc4ff`, with `pnpm check:docs-build` from the repo
root and the addon cache cleared before each build, 120 files per build and
`sha256:65719d953b0918452ab58d951dc08db1466e36f9cb0d95e856bdea4ad1c737d2` on both, `result identical`.

After the publish, `src/stories/Configure.mdx` was replaced by `src/stories/Adapter.mdx`, an adapter usage page,
because the template page was Storybook marketing rather than this package's documentation. The replacement
drops the nine template images that page imported, so the same command now prints 111 files per build and
`sha256:51f31a15e9d6c833ff160df44031ad30a10abfefc233f3b2c4761dd57f7b944a` on both, `result identical`. That
111-file build is the one served for the operator's verdict.

The earlier `sha256:cdb575b89c70c90397916d25680a8c8e6f24dad2333c6edaf87a6d20f6abbedc` on 120 files predates
ticket 78's story change, so it no longer describes any tree.

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
  exit 0. Re-run after the Configure page became the adapter page, with the same line.
- `pnpm check:docs-build`: `build a 120 files`, `build b 120 files`, `digest a` and `digest b`
  `sha256:65719d953b0918452ab58d951dc08db1466e36f9cb0d95e856bdea4ad1c737d2`, `result identical`, exit 0. The
  later 111-file build with `sha256:51f31a15…` is recorded in the Docs gate section above.
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

Both must print `0.3.0`.

Published 2026-11-18. `npm view …@0.3.0 version` printed `0.3.0`, `dist-tags` printed `{"latest":"0.3.0"}`, and
the packument's `time.modified` moved to `2026-11-18T06:13:26Z`. The registry's `0.3.0` shasum is
`497e32ef6e1a2960b8bbf50767b27d1250f12de4`, which is the same shasum `npm pack` gave on the committed tree,
so the published bytes are the packed bytes and they carry the `thumbLabels` sentences.

Then the registry proof, which runs the literal
`pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 init` on a fresh scaffold and then builds and
renders it, keeping the evidence under `.scratch/daisyui-adapter/evidence/34-release-0.3.0/`:

```bash
node .scratch/daisyui-adapter/harness/run.mjs --pin-registry \
  --then "exec node D:/Workspace/DesignSystem/New_Project/.scratch/daisyui-adapter/harness/prove.mjs D:/Workspace/DesignSystem/New_Project/.scratch/daisyui-adapter/evidence/34-release-0.3.0 --registry"
```

`--pin-registry` points the app's adds at the repo's pinned components, because the live shadcn registry has
moved past the pin; it reaches prove's own add through `COMPONENTS_REGISTRY_URL`.

The first attempt failed before the adapter ran. `run.mjs` serves the pinned registry from its own process and
then ran the baseline `add button` through `execFileSync`, which blocks the event loop that answers that
server, so the CLI's fetch timed out with `HeadersTimeoutError: Headers Timeout Error`. The baseline add now
uses the async `runCapture`, the path the targets branch already used, and keeps `add-baseline.log`. This is
the proof tool, not the published package, so the fix does not change the artifact.

The second attempt reached prove and failed on prove's own anchor. It asserted `fix covered 82`, the site count
when ticket 33 wrote that line, and the pinned 29-component app now holds 234 sites because the type scale and
the atom tables grew since. The run reported `207 stock` sites with `22 fixed` and only the sheet missing at
init, then `234` sites with `0 missing` and `0 customized` after the late add and `fix`. The anchor is now the
named `SITES = 234` constant in `prove.mjs`.

### Registry proof, passed

`run.mjs --pin-registry --components "<the 29 pinned names>" --then "… prove.mjs <evidence> --registry"`
returned `ok: true`. prove printed `install spec @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 from the
registry`, so the literal `pnpm dlx @kodaicoder/shadcn-svelte-daisyui-adapter@0.3.0 init` is what ran.

- init, two runs byte identical, sha `fc53ef9bf8e605ec61618eaff8e0cc483507d6c16c161140f0ec331423dd5aca`,
  header `components 97 fixed`, counts `207 stock, 22 fixed, 0 customized, 1 missing`.
- late add of `sheet` was `stock` before and `fixed` after.
- fix, two runs byte identical, sha `78d2a75cf4cc134ffe28cb24508250e859558a301f033db9cb95cb5903b336f8`,
  and `fix --check` exit 0 with `0 stock, 234 fixed, 0 customized, 0 missing`.
- build `true`; render status 200, `consoleErrors: []`, light background `oklch(1 0 0)`, dark background
  `oklch(0.153 0.006 107.1)`.

The operator's visual check is `pnpm check:docs-build --serve 6007`, read at `http://127.0.0.1:6007/` in light
and dark, over the components and the four token pages. The same bytes are packaged for IIS at
`.verify/docs-build-34` and `.verify/docs-build-34.zip`, both gitignored, copied from build a and given a
`web.config` for static hosting plus `checklist.md`. The tag is created only after the registry reads 0.3.0,
points at this ticket's release commit, and is pushed as a tag alone.

### Operator verdict and tag

The operator reviewed the deployed 111-file build and said, on 2026-11-18, "it look good for me now for 0.3.0".
The build under review is `.verify/docs-build-34`, the copy of build a with `sha256:51f31a15…`.

`v0.3.0` is a signed annotated tag on `68cc4ffe01e63b3c521881dac0be1d20868c9cc0`, the commit whose tree the
registry served. `git show -s --format='%H %G? %s' v0.3.0` prints
`68cc4ffe01e63b3c521881dac0be1d20868c9cc0 G docs(daisyui-adapter): 📚 name the slider prop in the 0.3.0 notes (ticket 34)`,
and `git ls-remote --tags origin v0.3.0` prints `e2ff83eaefe9e97058bf359916efcdcab7f5f9ac refs/tags/v0.3.0`, the
same object as the local tag.

After the verdict, the sixteen template images under `src/stories/assets` were removed. Nothing referenced them,
and `pnpm check:docs-build` still prints `111 files` per build with `sha256:51f31a15…` on both and
`result identical`, so the build under review is byte for byte the same.
