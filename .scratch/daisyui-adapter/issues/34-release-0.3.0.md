# 34: Release 0.3.0

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
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
pnpm check:stories      # 19 story files, 83 stories, 13 fixtures, exit 0 on a clean tree
pnpm check:docs-build   # two builds, one digest, exit 0 when they match
```

`check:docs-build` writes `.verify/docs-build/a` and `b`, both gitignored, and prints the digest of each
build. Measured on this checkout, with the addon cache cleared before each build, 120 files per build and
`sha256:cdb575b89c70c90397916d25680a8c8e6f24dad2333c6edaf87a6d20f6abbedc` on both. Record that digest in
the release note.

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
