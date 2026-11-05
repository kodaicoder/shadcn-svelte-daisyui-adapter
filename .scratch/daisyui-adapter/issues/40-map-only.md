# 40: A map-only entry point

Session IDs: ses_e5a21d100ffeU95NBg4703jKNW, ses_e556cc47fffeRzb0n2cNJIosE6
Lesson: An entry point that stops before the fixer has to say so in the file it writes and in the command list. Without that record, a mapped project is indistinguishable from a fixed one, and the guard the run skipped is invisible to the next reader.
Check: code - `.scratch/daisyui-adapter/registry-40/map-only.mjs`, 19 checks: `map` and `init --no-fix` leave every component file byte-identical, write `components 0 fixed` in the header, skip the shadcn version guard (on 1.9.0 `map` exits 0 where `init` exits 1), refuse arguments, and the usage names the three commands. `registry-26/fix.mjs` stays green, so the existing `init` and `fix` contract holds. Drift 9 of 9. The CHANGELOG sentence lands with the release commit by decision.

**What to build:** `map` and `init --no-fix` run the mapping and skip the component fixer, so a project that wants only the token layer can have it. Today `init` always fixes every target component on disk and takes no arguments, and `fix` never touches the stylesheet, so there is no mapping-only entry point.

**Blocked by:** None

**Status:** resolved

- [x] `map` and `init --no-fix` write the same stylesheet as the mapping half of `init`, with `components 0 fixed` in the header
- [x] Neither entry point reads, moves or writes a component file, and neither refuses on the supported shadcn version, because no site is read
- [x] `init` and `fix` keep their current behaviour, and an unknown argument to either still exits 1 and prints the usage
- [ ] README, CHANGELOG and the CLI usage list the three commands
- [x] A seam proves the stylesheet and the component tree are byte-identical between `map` and `init --no-fix`, and that both differ from `init` only in the component files

The CHANGELOG half of the fourth item is deferred to the release commit, which is where the 0.3.0 notes are written once for the whole release.
