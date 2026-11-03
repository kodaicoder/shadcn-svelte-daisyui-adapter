# 27: Fixer safety and contract
Session IDs:
Lesson:
Check:

**What to build:** The fixer refuses an unsupported shadcn-svelte style or version, reads one target manifest, supports `--check` and `--strict`, and records the fully fixed count in the header marker.

**Blocked by:** 26

**Status:** ready-for-agent

- [ ] The supported stock is shadcn-svelte 1.7.x with the `mira` style; the fixer reads the `components.json` style and the installed version; an unsupported pair exits with a clear message
- [ ] One target manifest holds the components, the ten contrast pairs and the supported version and style; the fixer and the tests read it
- [ ] `--check` exits 0 when every present site is fixed, customized or never added; non-zero only when a stock site remains
- [ ] `--strict` errors on a customized site and on a missing component named on the command line; a never-added target is not an error
- [ ] The header marker records the number of fully fixed files (every site fixed); a mixed file is not counted; a no-op `fix` keeps the number and the re-run stays byte-identical
- [ ] The repo CI drift test compares the pinned stock components; the runtime guard covers the user's machine
- [ ] Tests cover the version and style refusal, the manifest, `--check`, `--strict` and the header count
