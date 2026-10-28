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

Resolved 2026-10-28 on a real build. All six claims PASS. Kept project:
`C:\Users\LENOVO\AppData\Local\Temp\adapter-harness\run-2026-10-28T03-11-55-082Z\app`
(`--keep` run, stamp `2026-10-28T03-11-55-082Z`).

Fixture: `.scratch/daisyui-adapter/registry/` (`registry.json`, `spike-plugin.js`, `package.json`).
Built with `pnpm dlx shadcn-svelte@1.7.1 registry build -c .scratch/daisyui-adapter/registry -o r`,
served at `http://127.0.0.1:5199/r/spike.json`. Evidence: `.scratch/daisyui-adapter/spike/`.
`spike/check-css.mjs` re-runs claims 1 to 3 against the installed and compiled CSS;
`spike/probe-toast.mjs` re-runs the runtime half.

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
- Side effect to plan for: every `cssVars` key that is not already in `@theme inline` gets a self-referential
  entry appended there, seen here as `--spike-light: var(--spike-light)` and `--spike-dark: var(--spike-dark)`
  (end of the `@theme inline` block in `app-after.css`). Harmless while it stays `inline`, but it means `cssVars`
  cannot be used to create a `--color-*` mapping the project does not already have.

### 3. A plain `--color-popover` is what sonner needs. PASS

- `spike/compiled-global.css` carries `--color-popover:var(--popover)`, `--color-popover-foreground:var(--popover-foreground)`
  and `--color-border:var(--border)` in the plain `:root` and `.dark` rules, and no `--color-primary` at all,
  which re-confirms `@theme inline` emits nothing (`check-css.txt`).
- Rendered a real toast with the real sonner component (`shadcn-svelte add sonner`, route at the kept project's
  `src/routes/toast/+page.svelte`). Light `[data-sonner-toast]` background = `oklch(1 0 0)`, equal to `--popover`.
  Dark = `oklch(0.228 0.013 107.4)`, equal to dark `--popover` and not sonner's own `hsl(0,0%,20%)` fallback.
- The binding is not a coincidence: setting `--color-popover: rgb(255,0,0)` on `<html>` at runtime turned the
  toast red (`spike/toast.json`, `overridden.toastBg`). Light popover is white, which equals sonner's `#fff`
  default, so the override and the dark reading are what make this unambiguous.

### 4. Re-running `add` does not duplicate the `@plugin` line. PASS

- Kept project: 1 `@plugin` / 1 shadcn import before the second add, 1 / 1 after it, and
  `spike/app-after-run2.css` is byte-identical to `app-after.css` (`spike/add-run2.txt`).
- From zero as well: `claim6-after-run1.css` and `claim6-after-run2.css` are byte-identical, 1 `@plugin` each.

### 5. Missing CSS file errors, and the files are already written at that point. PASS

- Second temp project (`%TEMP%\opencode\claim5`, own `components.json`, `tsconfig.json`, `package.json`), with
  `tailwind.css` pointing at an absent `src/app.css`. `add` exits 1 with the raw
  `Error: ENOENT: no such file or directory, open '...\src\app.css'` and no hint about `components.json`
  (`spike/claim5-missing-css.txt`).
- Order confirmed: the CLI printed `spike installed at spike` before the error, and `src/spike-plugin.js`
  exists afterwards. A failed install leaves a half-installed project.

### 6. Two consecutive adds leave exactly one `@import "shadcn-svelte/tailwind.css"`. PASS

- From zero: the claim-5 project with that import line removed, add run 1 -> 1 import and 1 `@plugin`,
  run 2 -> 1 and 1, files identical (`claim6-run1.txt`, `claim6-run2.txt`, `claim6-after-run*.css`).
- Kept project, where step 4 already installed the import: 1 -> 1 across the second add.

### What this changes

Claims 1 and 2 hold, so 07, 08 and 13 do not need re-opening. Two new constraints must land in the tickets:

1. **`-o` is mandatory.** An item carrying `css` or `cssVars` triggers the "Updates to your `<path>` are
   required. Existing CSS variables may be overwritten. Continue?" prompt, and `-y` does not answer it. With
   piped stdio the CLI waits forever; the first attempt hung with `src/spike-plugin.js` already written and
   `app.css` untouched (`spike/run-hang-missing-overwrite-flag.txt`). Every install instruction, and any wrapper
   script, has to pass `-o`.
2. **The three sonner names ship as plain light/dark `cssVars` keys.** They survive compilation and resolve at
   runtime, so 13 needs no manual CSS line; the CLI's derived `@theme inline` entry for a name the project lacks
   is a self-reference that emits nothing.

Harness fixes made to run this, because ticket 15's harness could not install a registry item at all:

- `--registry` served `<dir>/r/<name>.json` although its own help text says `<dir>/<name>.json`; it now strips
  the `/r/` prefix.
- The registry server ran in-process while `execFileSync` blocked the event loop, so the CLI never got a
  response (`HeadersTimeoutError`). The add now goes through a promisified `execFile`.
- The add passes `-o`, and the server is closed in `finally` so the harness exits instead of hanging.

