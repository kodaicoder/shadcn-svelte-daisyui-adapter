Phase: implementation

# Ticket 65: The unpressed outline toggle border matches its hover wash

Ticket: `.scratch/daisyui-adapter/issues/65-toggle-outline-border-opacity.md`
Spec: `.scratch/daisyui-adapter/spec.md`, amendment 2026-11-11
Branch: `fix/nutchapon/ai/contrast-warning`
Base: `af3d5c7`
Worktree: `C:\Users\LENOVO\AppData\Local\Temp\opencode\wt-63` (branch `ticket-63-rings`)
Session: `ses_e3779ea3affeQXvoGAMatMLPbv`

## Change

- `packages/daisyui-adapter/targets/binary.mjs`: `toneBorderAlphaClasses(tone, alpha)` keeps the border
  colour token and appends the alpha; `toggleOutlineRow` uses it at 20 for the six `outline-<tone>`
  keys. The default `outline` keeps `border-input` at full opacity.
- `src/lib/components/toggle-fixed/toggle.svelte`: regenerated through the fixer.
- `.opencode/skills/verify/scripts/drive.mjs`: `checkOutlinePairs` records that the six tone outline
  borders sit at the hover wash alpha, 0.2, and that the default outline border stays at 1.

## Verification

- `pnpm check`: 0 errors, 0 warnings.
- `pnpm test:adapter`: 19 checks pass.
- `fix toggle` run 2: `0 stock, 9 fixed, 0 customized, 0 missing`; dry run identical; the fixed copy
  matches a fresh run byte for byte; `ui` and `src/routes/layout.css` reverted.
- Toggle journey: 71 checks pass, four new, in both schemes. The six tone borders measure `0.2` alpha
  and the default outline border measures `1`.
- All twelve journeys pass.
- Evidence: the latest `*-toggle` run under `.verify/evidence/`.

## Remaining

- Operator pass on the six tone outline rows and the default `outline` on `/`.
- Commit after the wording is approved, separate from ticket 63.
- Commit: 9127ec3, tag t65-toggle-outline-border-opacity, merged at e95f47c
