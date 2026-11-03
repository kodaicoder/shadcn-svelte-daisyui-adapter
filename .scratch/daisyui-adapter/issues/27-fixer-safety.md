# 27: Fixer safety and contract
Session IDs: ses_e5f548125ffeDlPDLsm8c0bUgJ, ses_e5f5055a7ffeXrdDdxQ3Vlif2z
Lesson: A read-only mode is only read-only once the marker writer sits behind the same gate; `--dry-run` skipped the fixer but still reached `updateHeader`, and a header already equal to the count hides that write. The regression check must force a stale count (a stock file restored after `init`) or it passes on the broken code. The guard also has to be scoped to a present component file, or a map-only `init` refuses a style it never reads.
Check: code - `.scratch/daisyui-adapter/registry-27/safety.mjs`: 53 checks over the real CLI and temp copies of the pinned components: the manifest shape, style and version refusal with byte-identical files, an unreadable version warning, the `package.json` range fallback, the map-only init, `--check` on stock/fixed/customized/missing and with `--dry-run`, `--strict` on customized and named-missing with no writes, the header at 10, 9 mixed and 0, a no-op `fix` byte-identical, an old-format header replaced, and a stale header kept on a dry run; `.scratch/daisyui-adapter/registry-26/fix.mjs` stays green at 100 checks, `.scratch/daisyui-adapter/registry-16/smoke.mjs` at 139, and `packages/daisyui-adapter/test/drift.mjs` compares the manifest with the pinned `src/lib/components/ui` at 1.7.1 `mira` in CI.

**What to build:** The fixer refuses an unsupported shadcn-svelte style or version, reads one target manifest, supports `--check` and `--strict`, and records the fully fixed count in the header marker.

**Blocked by:** 26

**Status:** resolved

- [x] The supported stock is shadcn-svelte 1.7.x with the `mira` style; the fixer reads the `components.json` style and the installed version; an unsupported pair exits with a clear message
- [x] One target manifest holds the components, the ten contrast pairs and the supported version and style; the fixer and the tests read it
- [x] `--check` exits 0 when every present site is fixed, customized or never added; non-zero only when a stock site remains
- [x] `--strict` errors on a customized site and on a missing component named on the command line; a never-added target is not an error
- [x] The header marker records the number of fully fixed files (every site fixed); a mixed file is not counted; a no-op `fix` keeps the number and the re-run stays byte-identical
- [x] The repo CI drift test compares the pinned stock components; the runtime guard covers the user's machine
- [x] Tests cover the version and style refusal, the manifest, `--check`, `--strict` and the header count
