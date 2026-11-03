# 27: Fixer safety and contract
Session IDs: ses_e5f548125ffeDlPDLsm8c0bUgJ, ses_e5f5055a7ffeXrdDdxQ3Vlif2z
Lesson: A read-only mode is only read-only once the marker writer sits behind the same gate; `--dry-run` skipped the fixer but still reached `updateHeader`, and a header already equal to the count hides that write. The regression check must force a stale count (a stock file restored after `init`) or it passes on the broken code. A style label is not evidence that the stock strings match: the repo's two close sites carried the `sera` markup while `components.json` said `mira`, and the drift test could not see it because it compares the manifest to the same snapshot. The guard is scoped to a present component file and checks the version only, because nine of the eleven sites match every 1.7.x style and an unmatched style already reports `customized`.
Check: code - `.scratch/daisyui-adapter/registry-27/safety.mjs`: 54 checks over the real CLI and temp copies of the pinned components: the manifest shape, the version refusal with byte-identical files, an unreadable version warning, the `package.json` range fallback, `vega`, `default` and missing styles all accepted, the map-only init, `--check` on stock/fixed/customized/missing and with `--dry-run`, `--strict` on customized and named-missing with no writes, the header at 10, 9 mixed and 0, a no-op `fix` byte-identical, an old-format header replaced, a stale header kept on a dry run, and a header update that leaves the rest of the stylesheet intact; `.scratch/daisyui-adapter/registry-26/fix.mjs` stays green at 100 checks, `.scratch/daisyui-adapter/registry-16/smoke.mjs` at 139, and `packages/daisyui-adapter/test/drift.mjs` compares the manifest with the pinned `src/lib/components/ui` at 1.7.1 in CI.

**What to build:** The fixer refuses an unsupported shadcn-svelte version, reads one target manifest, supports `--check` and `--strict`, and records the fully fixed count in the header marker.

**Blocked by:** 26

**Status:** resolved

- [x] The supported stock is shadcn-svelte 1.7.x; the fixer reads the installed version and an unsupported one exits with a clear message; the `components.json` style is not checked, and a style outside the pinned snapshot reports `customized`
- [x] One target manifest holds the components, the ten contrast pairs and the supported version; the fixer and the tests read it
- [x] `--check` exits 0 when every present site is fixed, customized or never added; non-zero only when a stock site remains
- [x] `--strict` errors on a customized site and on a missing component named on the command line; a never-added target is not an error
- [x] The header marker records the number of fully fixed files (every site fixed); a mixed file is not counted; a no-op `fix` keeps the number and the re-run stays byte-identical
- [x] The repo CI drift test compares the pinned stock components; the runtime guard covers the user's machine
- [x] Tests cover the version refusal, the style acceptance, the manifest, `--check`, `--strict` and the header count
