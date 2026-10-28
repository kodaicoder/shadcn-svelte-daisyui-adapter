# Item contents and file targets

Type: grilling
Status: resolved
Blocked by: 20

## Question

What exactly does the registry item install, and where does each file land?

Decide:
1. The full file list: plugin file, static binding CSS, any helper module. For each, its `type`, its `target`, and the path it lands at.
2. **How the injected `@plugin` path resolves.** The CLI writes a static string, but the correct relative path depends on where the user's CSS file sits relative to the lib alias. Options: publish the plugin as an npm package and inject a bare specifier (`@plugin "daisyui-adapter"`), inject an assumed relative path for the conventional layout, or fall back to a documented manual line. Pick one and state what breaks outside the conventional layout. Ticket 02 proposes a fourth: resolve the theme file as a sibling of the adapter module, which only works when the module is installed into the project.
3. Whether the plugin is a single file or split into parser and mapping modules. A split needs either an npm package or multiple `@plugin` entries.
4. Which files are `registry:lib` (alias-derived) versus `registry:file` (explicit target), and why.
5. The item's `dependencies` list, including our own package if option 2 lands there.
6. Whether the item declares `registryDependencies` (for example `button`) or installs bare.
7. Whether the item should also declare `cssVars` for the token bindings, given ticket 04's finding that they overwrite in place. Note that another item's `cssVars` already injects `@import "shadcn-svelte/tailwind.css"` into the CSS file on every add.

Depends on ticket 04 for what the CLI can actually apply.

## Answer

Resolved 2026-10-28. Seven decisions, plus the package surface the first one forces. Behaviour that
mattered was run, not read: the fixture is `registry-08/`, and the cited artefacts are copied to
`evidence/08-item-shape/` from harness runs `2026-10-28T08-02-40-125Z` (`--layout app`) and
`2026-10-28T08-03-01-867Z` (`--layout routes`), because `harness/runs/` is gitignored. Both runs
install into a project holding a real two-block theme (`registry-08/probe-theme.css`, placed at
`src/daisyui-theme.css`). The probe package is `daisyui-adapter-08-probe` since the real name is
unpublished; the item keeps the real name `daisyui-adapter`.

### 1. File list: empty

| file | type | target | lands at |
| --- | --- | --- | --- |
| none | none | none | nothing |

The item declares `files: []`. The transcript still prints `daisyui-adapter installed at
src\lib\daisyui-adapter`, and that is a label, not a write: `app/src-listing.txt` and
`routes/src-listing.txt` are post-add listings of every path under `src/`, directories included, and
neither contains `lib/daisyui-adapter/`.

Reasons: the token set needs no project file; the plugin lives in the npm package (decision 2); and
07 requires that the item never ship `src/daisyui-theme.css`, which shipping nothing makes structural
instead of a rule to remember.

### 2. `@plugin` resolution: bare specifier from an npm package

`css: { "@plugin \"<pkg>\"": {} }`, no `./`, no path segment.

- A relative prelude resolves against the stylesheet's own directory (Tailwind slices the params and
  passes the id with the CSS file's base; 20 observed `./spike-plugin.js` resolving to
  `src/spike-plugin.js` with the stylesheet at `src/app.css`), so `src/app.css` needs `./lib/...`
  while `src/routes/layout.css` needs `../lib/...`. One static string cannot serve both, and 07
  requires both layouts.
- A bare specifier goes through Node module resolution, independent of the stylesheet's location and
  of the `lib` alias.
- Observed on the real pipeline in both layouts. `build.log` prints `[probe-08] cwd=<app>
  module=file:///.../node_modules/.pnpm/daisyui-adapter-08-probe@.../dist/index.js
  theme=<app>/src/daisyui-theme.css bytes=2240`, twice per build (client and server): the module
  resolved from `node_modules` while `process.cwd()` stayed the project root, and the plugin read the
  theme file from there. `compiled-sentinel.txt` shows `--probe-08-loaded:1` and
  `--probe-08-theme-bytes:2240` in the built CSS, so the plugin ran rather than merely resolving.
- A documented manual line was rejected: forgetting it leaves the build green with stock step-4
  tokens, the silent failure 07's decision 5 refused.

What breaks: offline installs, and Yarn PnP without `node_modules`. npm must also be reachable at
install time, so 17 has to publish before the item is usable.

### 3. Split: three modules inside the package

`index.ts` (plugin wiring: resolve the theme path, call parse, call map, `addBase`), `parse.ts` (read
plus E1/E2/E3, so all three messages live in one module), `map.ts` (pure: `{light, dark}` in, flat
`key: value` out). TypeScript compiled to `dist/` by `prepare: tsc`, which runs on `npm publish` and
`npm pack`, so the tarball cannot carry a stale entry.

Reasons: two change drivers. The parser follows 02 and 14, the table follows 09-12 and 13. The token
families are rows of one flat table, not modules, so a per-family split would need its shared shape
enforced by eye. The split has no install-side cost now, because the item ships nothing and one bare
specifier loads one entry.

The default export is `{ handler({ addBase }) }` with no `tailwindcss/plugin` import, so the package
has no runtime dependency and no peer dependency. The probe proves that shape loads and that a module
under `node_modules` can read `src/daisyui-theme.css` during the build.

Scope limit, stated plainly: the probe package ships a hand-written `dist/index.js`, because this
ticket must not write adapter code. The three TypeScript modules, their tests and the `prepare: tsc`
build are 16's and 17's work; this Answer fixes the surface those tickets must produce, not its
implementation.

### 4. `registry:lib` versus `registry:file`: neither applies

There is no file entry, so `getItemAliasDir` never runs and no target is resolved. The item's own
`type` is `registry:lib`, which is a label for the index and the website. `registry:item` was
rejected as an unhandled branch, `TODO: unhandled item type` in `getItemAliasDir` (research 04 §4,
which reads `registry/index.ts` L206-L259 at 1.7.1). That branch stays harmless only while the item
has no files, which is a trap for a later ticket.

### 5. `dependencies`: empty, package in `devDependencies`

```json
"dependencies": [],
"devDependencies": ["<pkg>@0.1.0"]
```

Reasons: the plugin runs only inside `vite build`; the CLI installs item `devDependencies` with
`<pm> add -D`, and the probe proves that path. Both `add-install.log` files show `Installing
dependencies with pnpm...` then `Successfully installed dependencies`, and
`*/package-json-after.json` places the entry under `devDependencies` while
`*/package-json-before.json` has no such entry. The version is exact (`0.1.0`, not `^0.1.0`) so the
item and the package cannot drift.

Read from the CLI rather than observed, because the probe cannot publish: the exact-version install
and the "skip when a satisfying range is already installed" check in `add-registry-items.ts`. 17
publishes first and owns confirming both.

What breaks: a CI that runs `--omit=dev` before `build` fails with module-not-found on the specifier.
Loud, and 18 documents it.

### 6. `registryDependencies`: empty

`[]`, install bare. Reasons: tokens need no component; declaring one would write files into the
project, contradicting decision 1; with `-o` in the documented command it could overwrite a
component the user customised; and a dependency given by name resolves from the user's configured
registry and style first, so one adapter URL would install different files for different users.

### 7. `cssVars`: none, provisional, 13 decides the carrier

Provisional, not final. Recorded for 13:

- A `cssVars` value is a static string fixed at install time (registry items have no lifecycle
  hooks), so it can only be a `var(--daisy-*)` reference, never a computed colour.
- Keys should stay inside the names step 4 already declares, or `@theme inline` gains a
  self-referential dead entry, observed in 20 as `--spike-light: var(--spike-light)`.
- Plugin output lands in `@layer base` while step 4's `:root` is unlayered, so plugin output cannot
  override a step-4 token by itself. 13 either routes values through `cssVars` or requires a user
  edit. There is no third mechanism, because a plugin cannot emit unlayered CSS.
- Adding `cssVars` later changes nothing else in this Answer: same item name, same URL, no files, no
  dependencies, no `registryDependencies`.
- The ticket's note about `@import "shadcn-svelte/tailwind.css"` needs no `cssVars` clause. The
  fixture's step-4 stylesheet already carries that import, and `check.txt` measures exactly one
  after the add, so the `@plugin` line neither adds nor duplicates it. Research 04 §7 says any add
  carrying `css` or `cssVars` injects it when absent, and 20 observed the from-zero case reaching
  one and staying there. 13 does not have to account for it.

### Evidence

- `evidence/08-item-shape/app/` and `routes/`: `add-install.log` (exit 0, `Stylesheet updated at
  src\app.css` and `src\routes\layout.css`, the dependency lines), `css-before.css`, `css-after.css`,
  `build.log`, `compiled-sentinel.txt`, `src-listing.txt`, `package-json-before.json`,
  `package-json-after.json`, `run.json`.
- `evidence/08-item-shape/check.txt`: `registry-08/check.mjs` on each installed stylesheet plus its
  compiled sentinel, reporting `plugins: ["daisyui-adapter-08-probe"]`, `pluginAfterLastImport:
  true`, `shadcnImports: 1`, `pluginLoaded: true`, `readTheme: true`, `ok: true` twice.
- `compiled-sentinel.txt` in both runs: `--probe-08-loaded:1` and `--probe-08-theme-bytes:2240`.
- `registry-08/`: `registry.json`, `probe-theme.css`, the probe package under `package/`,
  `check.mjs`, `registry-build.log`, and the built `r/daisyui-adapter.json`.
- Harness change: `--layout <app|routes>` (default `app`, so existing invocations are unchanged),
  `--package <dir>` (packs a package into the app root for an unpublished dependency), `--theme
  <file>` (places a theme file where 07 says it lives), and `--sentinel <prefix>` (reports matching
  custom properties found in the built client CSS).

### Not proved here

- The TypeScript build and the three-module split: 16 and 17 own the package, and 08 writes no
  adapter code. The probe ships a hand-written `dist/index.js` with the same export shape.
- The CLI's exact-version install and its skip-when-already-satisfied check, because the probe
  cannot publish to npm. Both are read from `add-registry-items.ts` and land on 17.
- An install from a published npm name: 17 publishes before the item is usable.
- The parser and its E1/E2/E3 text for a malformed theme: 16 owns them. The probe reads the theme as
  text (never imports it, per 02) and throws only when the file is absent, which is 07's missing-file
  case.

### Constraints this puts on later tickets

- 17: two publication channels at one version (npm package plus registry tag), with `dist/` produced
  by `prepare` during publish, never a hand-built tarball. The probe also shows the CLI prints an
  install path even when the item has no files.
- 18: the "did it install" check is `rg '@plugin "<pkg>"' <stylesheet>`; also document `-o` and the
  `--omit=dev` caveat.
- 13: the constraints in decision 7.

Lesson: A probe that stubs the input it claims to exercise reports the same green build as one that reads it.
Check: code - `registry-08/check.mjs` asserts `--probe-08-theme-bytes` equals the theme fixture's byte length, so a run whose plugin never reads the theme fails.

