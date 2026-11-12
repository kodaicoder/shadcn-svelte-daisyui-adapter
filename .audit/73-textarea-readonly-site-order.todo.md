Phase: implementation

# Ticket 73: the textarea readonly site reports customized on a clean pin

Ticket: `.scratch/daisyui-adapter/issues/73-textarea-readonly-site-order.md`
Session: ses_e327321b6ffeOE797kkxW963CD
Branch: fix/nutchapon/ai/contrast-warning
Commit: b80200e (tag daisyui-adapter-73)

## Blast radius

state: unbuilt (no `graphify-out/graph.json`)
seeds: n/a, graph unavailable
anchors:
  `packages/daisyui-adapter/targets/field-variants.mjs` <- the textarea readonly site's stock anchor
  `packages/daisyui-adapter/test/drift.mjs` <- the clean-pin state check
unlisted:
  `src/lib/components/ui/textarea/textarea.svelte` <- the pin the stock must match, never edited
  `src/lib/components/textarea-fixed/textarea.svelte` <- the copy stayed byte-identical
  `packages/daisyui-adapter/component-fix.mjs` <- reads every state before it writes, the mechanism
  `packages/daisyui-adapter/targets/site.mjs` <- the ring width site whose write created the stock
  the full component set <- `fix --dry-run` still marks 21 `text-*` sites customized, filed as ticket 76
fallback: rg `textarea-readonly-surface`, read `component-fix.mjs:102-121` and `:190-220`

## Playbook: Bug fix

1. Reproduce it yourself on the matching surface.
   `fix textarea --dry-run` reported 14 stock, 1 customized, and `--strict` exited 1 with
   `1 customized site(s) found`.
2. Binary-search the cause.
   The readonly site's stock was `transition-colors focus-visible:ring-3`, but the clean pin holds
   `ring-2`. `component-fix.mjs` computes every state before any write, so the site was classified
   customized and skipped. The input site avoided it because `file:h-6` does not overlap.
3. Plan the fix.
   Anchor the readonly site on the `transition-colors` tail, text the pin and every later state hold.
   The ring width site still applies its own change in the same run. No function boundary crossed,
   implemented directly.
4. Verify on the same surface.
   See Verification.
5. Stage the commits so the failing repro lands before the fix in git history.
   The new drift check failed at `1 customized` before the anchor change, then passed. The check and
   the fix share this commit because the helper refactor touches the same lines.
6. Run Opening a PR.
   skip: the ticket pipeline closes with a commit and a tag.

## Review

Both axes ran on the diff `345f4ab`.

- Standards accepted: drop the redundant `components: {}`, make the check positive rather than
  negative-only, name the customized ids, and comment why the tail stops before the ring width.
- Spec accepted: the helper now takes the tail explicitly instead of deriving it with
  `stock.replace('transition-colors ', '')`, which yielded a bare fragment. The check now asserts 15
  stock, 0 missing, 0 customized and the readonly site specifically stock.
- Noted, not changed: `applySite`'s replace branch has no single-occurrence guard. The readonly stock
  occurs once in the pin; a general guard would change every replace site and is out of this fence.

## Verification

- The check failed before the anchor: `the clean textarea pin reports no customized site :: 1 customized`.
- Final: `the clean textarea pin reports all 15 sites stock :: 0 customized, 15 stock, 0 missing, readonly stock`, and `every fixed copy is what the manifest produces from the pin` still passes.
- `fix textarea --dry-run`: `15 stock, 0 fixed, 0 customized, 0 missing`.
- `fix textarea --strict`: `15 stock, 0 fixed, 0 customized`, exit 0.
- Temp copy of the pin, one `fix textarea`: `15 stock, 0 fixed, 0 customized`; the file holds
  `read-only:enabled:bg-muted/50` and `focus-visible:ring-3` and no `ring-2`; the second run reports
  `0 stock, 15 fixed` and is byte-stable; the result equals `textarea-fixed/textarea.svelte` byte for
  byte.
- Full `fix --dry-run` on the clean pin still reports 21 customized `text-*` sites, filed as ticket 76.

## Todo

- [x] add the clean-pin customized check to `drift.mjs`
- [x] observe it fail with 1 customized
- [x] change the textarea readonly anchor
- [x] `pnpm test:adapter` green
- [x] `fix textarea --dry-run` 0 customized and `--strict` exits 0
- [x] one temp run applies, second run byte no-op
