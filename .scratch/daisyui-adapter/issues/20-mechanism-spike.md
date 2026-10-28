# Mechanism spike: prove the install mechanics on a real build

Type: task
Status: resolved
Blocked by: 15

## Question

Every remaining design ticket rests on three claims read from source but never observed. Prove or falsify them with a throwaway registry item before 07, 08 and 13 are decided.

Build a disposable item that does all of the following, install it into the harness project from ticket 15 through a locally served registry, and report evidence:

1. `css: { "@plugin \"./spike-plugin.js\"": {} }` lands at top level after the last `@import`, and the build loads the plugin. The plugin must leave an observable trace (emit a recognisable custom property, or log on load).
2. `cssVars.light` and `cssVars.dark` overwrite the values inside the existing `:root` and `.dark` blocks in place, rather than appending new blocks. Include a before/after diff of the CSS file.
3. A plain `--color-popover: var(--popover)` declaration is what sonner needs, because `@theme inline` emits no `--color-*`. Render a toast and capture the computed background, or explain precisely why rendering was not possible.
4. Re-running `add` on the same item does not duplicate the injected `@plugin` line.
5. Running `add` in a project where the CSS file is missing produces the documented error, and the files are already written at that point (confirm the order).
6. Two consecutive `add` runs on items with `cssVars` do not inject `@import "shadcn-svelte/tailwind.css"` twice.

Evidence required: the generated CSS file, the build output, and one screenshot or computed-style dump. Store artefacts under `.scratch/daisyui-adapter/spike/`.

This ticket is the proof gate. If claim 1 or 2 fails, tickets 07, 08 and 13 must be re-opened, not patched around.

## Answer

Resolved 2026-10-28 on a real build. Five claims PASS, claim 3 FAILS as worded. Claims 1 and 2 hold, so 07, 08 and 13 do not need re-opening. Claim 3's failure changes ticket 19, not 13.

Fixture: `.scratch/daisyui-adapter/registry/` (`registry.json`, `spike-plugin.js`, `package.json`).
Built with `pnpm dlx shadcn-svelte@1.7.1 registry build -c .scratch/daisyui-adapter/registry -o r`,
served at `http://127.0.0.1:5199/r/spike.json`. Evidence: `.scratch/daisyui-adapter/spike/`.
`spike/check-css.mjs` re-runs claims 1, 2, 4 and 6 against the installed and compiled CSS;
`spike/probe-toast.mjs` re-runs the runtime half for claim 3.

Kept project, `--keep` run `2026-10-28T03-11-55-082Z`:
`C:\Users\LENOVO\AppData\Local\Temp\adapter-harness\run-2026-10-28T03-11-55-082Z\app`.
That project carries the sonner probe route (`spike/toast-route.svelte`, installed at
`src/routes/toast/+page.svelte`). It was built by the pre-review harness. `spike/run-4-post-review.txt` is a
run of the reviewed harness with the same flags, and it reports the same render values.

Two build-side quirks found while making the fixture: `registry build` reads `files[].path` relative to the
*process* cwd rather than `-c`, and it requires a `package.json` in `-c`.

### 1. `@plugin` lands at top level after the last `@import`, and the plugin loads. PASS

- `spike/app-after.css:8` is `@plugin "./spike-plugin.js";` at column 0, right after the last `@import` (line 6).
  `check-css.mjs` asserts the position by node index: plugin 6, last import 5 (`spike/check-css.txt`).
- The plugin ran during the build: `[spike-plugin] loaded` twice in `spike/build.log`, once per compile
  (client and server bundles).
- Its `addBase` reached the compiled CSS: `:root{--spike-loaded:1}` inside `@layer base` in
  `spike/compiled-global.css`.
- Runtime: `--spike-loaded` computes to `"1"` on `document.documentElement` in light and dark
  (`spike/toast.json`, `beforeToast.spikeLoaded`).
- The path resolves against the stylesheet, as predicted: prelude `./spike-plugin.js`, file at `src/spike-plugin.js`.

### 2. `cssVars` overwrites inside the existing `:root` and `.dark` blocks. PASS

- `spike/app-before.css` -> `spike/app-after.css`: `--primary` is replaced in place in both blocks, the new keys
  are appended inside those same blocks, and `check-css.mjs` counts exactly one `:root` and one `.dark`
  (no `/* ---break--- */` block appended).
- Runtime confirms the right block wins: `spike/run.json` has `render.light.buttonBg` =
  `oklch(0.55 0.21 250)` (light sentinel) and `render.dark.buttonBg` = `oklch(0.72 0.19 250)` (dark sentinel),
  while `light.background` and `dark.background` keep their original values.
- Side effect to plan for: every `cssVars` key that is not already in `@theme inline` gets an entry appended
  there, seen here as `--spike-light: var(--spike-light)` and `--spike-dark: var(--spike-dark)` (end of the
  `@theme inline` block in `app-after.css`). A self-reference resolves to nothing, so the plain declaration
  carries the value and the theme entry is dead weight.

### 3. A plain `--color-popover` declaration is what sonner needs. FAIL

Both halves of the claim are wrong. Sonner does not need the plain declarations, and `@theme inline` is not
inert for names a component references.

- **It renders either way.** `spike/control-no-plain-decls/control.md` is the control. The six plain
  `--color-popover`, `--color-popover-foreground` and `--color-border` declarations were removed from `:root`
  and `.dark`, with the `@theme inline` map left intact, then rebuilt and probed. The toast background is
  `oklch(1 0 0)` in light and `oklch(0.228 0.013 107.4)` in dark, identical to the run that had them
  (`control-no-plain-decls/toast.json`).
- **Tailwind emits the variable itself.** `control-no-plain-decls/emitted-theme-block.txt` shows
  `--color-popover: var(--popover)` in `@layer theme{:root,:host{...}}` with the plain declarations gone. The
  `@theme inline` map is enough, because the value reaches the page from there.
- **The red-override reading proves the consumer, not the declaration.** Setting `--color-popover:
  rgb(255,0,0)` on `<html>` turned the toast red (`toast.json`, `overridden.toastBg`). That shows sonner reads
  the name. It says nothing about where the name is declared, and an inline style beats every declaration in
  the document, so it cannot separate the two candidates.
- **The old "emits nothing" evidence was a coincidence.** In the pre-sonner build only five theme variables
  were emitted, and `--color-primary` was absent. After the sonner component is installed, every build emits 55,
  `--color-primary` included, although no component reads it raw. I did not explain that switch, so no claim
  should rest on which theme variables Tailwind happens to emit.

What the adapter must do instead: keep the project's `@theme inline` map. Every shadcn-svelte step-4
`layout.css` has all 31 `--color-*` entries, and `@apply border-border` in the same file fails the build with
`Cannot apply unknown utility class 'border-border'` when the map entry is gone (`spike/map-is-load-bearing.txt`),
so the map is load-bearing independently of sonner. No extra plain `--color-*` keys are needed.

### 4. Re-running `add` does not duplicate the `@plugin` line. PASS

- Kept project: 1 `@plugin` and 1 shadcn import before the second add, 1 and 1 after it, and
  `spike/app-after-run2.css` is byte-identical to `app-after.css` (`spike/add-run2.txt`).
- From zero as well: `claim6-after-run1.css` and `claim6-after-run2.css` are byte-identical, 1 `@plugin` each.
  `check-css.mjs` counts both in `spike/check-css.txt`.

### 5. Missing CSS file errors, and the files are already written at that point. PASS

- Second temp project (`%TEMP%\opencode\claim5`, own `components.json`, `tsconfig.json`, `package.json`), with
  `tailwind.css` pointing at an absent `src/app.css`. `add` exits 1 with the raw
  `Error: ENOENT: no such file or directory, open '...\src\app.css'` and no hint about `components.json`.
- Order confirmed in the same file: the CLI prints `spike installed at spike` before the error, and the appended
  listing of `src/` after the failure shows `src\spike-plugin.js` present and `src\app.css` absent
  (`spike/claim5-missing-css.txt`). A failed install leaves a half-installed project.

### 6. Two consecutive adds leave exactly one `@import "shadcn-svelte/tailwind.css"`. PASS

- From zero: the claim-5 project with that import line removed, add run 1 gives 1 import and 1 `@plugin`,
  run 2 gives 1 and 1, files identical (`claim6-run1.txt`, `claim6-run2.txt`, `claim6-after-run*.css`, and the
  counts in `check-css.txt`).
- Kept project, where step 4 already installed the import: 1 -> 1 across the second add.

### What this changes

1. **Ticket 19's premise is falsified, not 13's.** 19 lists "declare plain `--color-popover` and friends" and
   "switch the `@theme` block to `static`" as the fixes for unthemed toasts. Neither is needed; the stock
   `@theme inline` map already supplies the three names. 19 should decide the scrim question and drop the
   sonner options, or note that sonner needs no adapter output.
2. **Research 05 §4 and its conclusion are partly wrong.** Its "inline theme vars are never emitted" is
   contradicted above. The rest of 05 (utilities inline to `var(--token)`, direct readers are name-bound, the
   map is project-owned) stands.
3. **`-o` is mandatory.** An item carrying `css` or `cssVars` triggers the "Updates to your `<path>` are
   required. Existing CSS variables may be overwritten. Continue?" prompt, and `-y` does not answer it. With
   piped stdio the CLI waits forever; the first attempt hung with `src/spike-plugin.js` already written and
   `app.css` untouched (`spike/run-hang-missing-overwrite-flag.txt`). Every install instruction, and any
   wrapper script, has to pass `-o`.
4. **One `add` also rewrites the user's existing token values in place, silently, with `-o`.** That is the
   mechanics 13 must decide around, not a new finding but now observed rather than read.

### Review

`no-comments` and `code-review` ran after the first close, on `8dfe1b8..HEAD`.

- `no-comments`: three flags. The prose about the in-process registry server became a guard (`run()` throws
  while the server is up) plus an earlier close, the `/r/` mapping moved into one module, and header narration
  in the evidence scripts was deleted. The `-o` comment stayed as a keep, backed by the hang artefact.
- Standards axis: path traversal in the registry server (fixed, 400 on `/r/../../package.json`,
  `spike/registry-http.txt`), duplicated port and shutdown code (fixed by `harness/registry.mjs`), and duplicate
  polling inside `probe-toast.mjs` (fixed). Dismissed with reasons: `probe-toast.mjs` vs `shot.mjs` share no
  code worth coupling; the `run()` guard is the encoding the comment review asked for; the committed `r/`
  payload is the point of `registry build`.
- Spec axis: claim 3 falsified by the control (this is the FAIL above), claim 5's ordering assertion had no
  committed artefact (fixed by the listing), claim 6's counts were not in a cited artefact (fixed by
  `check-css.txt`), and the toast route lived only in a temp project (committed as
  `spike/toast-route.svelte`).

### Open

- Why the emitted theme-variable set changes from 5 to 55 once the sonner component exists. Not needed for any
  decision here, and recorded so nobody builds on it.
- `cssVars` write-through to a second `:root` nested in `@media (prefers-color-scheme: dark)` was not tested.
  The pair-by-class design does not need it.

Lesson: A harness proven on one happy path hides the defects in every option path a later ticket depends on.
Check: none - only running that flag end to end surfaces it, no unit test reaches event-loop ordering or an unanswered prompt, so the rule is in CODING_STANDARDS.md section 4.
