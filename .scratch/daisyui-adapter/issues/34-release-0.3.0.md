# 34: Release 0.3.0

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson:
Check:

**What to build:** The operator visual check, the publish and the registry proof for 0.3.0.

**Blocked by:** 49, 51, 52

**Status:** ready-for-agent

- [ ] The operator visual check passes on the light and dark screenshots and the checklist
- [ ] 0.3.0 publishes through the OTP gate and the registry serves it as `latest`
- [ ] The literal `pnpm dlx <pkg>@0.3.0 init` runs on a fresh scaffold: the map, the fixer, the build and the render pass; the evidence is kept
- [ ] The `v0.3.0` tag lands; the changelog and version match

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
