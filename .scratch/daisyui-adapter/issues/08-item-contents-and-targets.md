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

## Answer

Rewritten 2026-10-29 for the pure CLI, decided in ticket 14. There is no registry item. The
2026-10-28 answer described one, and its measurements still explain two things the CLI keeps: a bare
`@plugin` specifier resolves from both layouts, and an item with no files writes nothing at all.

### 1. What ships: one npm package, no item

| artefact | form | lands at |
| --- | --- | --- |
| package | `daisyui-adapter` (name and scope: 17) | `node_modules` as a devDependency |
| modules | `index` (plugin wiring), `parse` (02's contract), `map` (09-12's table) | inside the package, built by `prepare: tsc` |
| bin | `daisyui-adapter` with the `init` command | the user's shell, through `pnpm dlx` / `npx` |
| registry item | none | nothing |

17 corrected this table: there is no `prepare: tsc` build, the published modules are
`index`/`map`/`ramp`, and the parser lives in `index.mjs`. `dist/` and `cli/` ship as they are.

No `files`, no `target`, no `registry:lib` or `registry:file`, no item JSON. The reason is decision 14.1
and 14.4 together: the install has to read the project's stylesheet to keep its values as fallbacks,
and a registry item is a static string that the CLI's `css` merge writes verbatim (04, 13).

### 2. The bin: `init`

`pnpm dlx <pkg>@<exact> init`, run from the project root. It:

1. reads `components.json` and resolves `tailwind.css`;
2. reads the stylesheet and keeps every `:root` and `.dark` declaration;
3. reads and validates `src/daisyui-theme.css` (02's contract: one light, one dark, classified by `color-scheme`);
4. writes the header comment, the `@plugin "<pkg>";` line after the last `@import`, an empty `daisyui-adapter.overrides.css` beside the stylesheet plus its import line, and 32 bindings per block as `var(--daisy-color-<source>, <the value that was in the file>)`;
5. installs `<pkg>` as a devDependency at its own version, so the `@plugin` specifier resolves.

Measured on the probe CLI: 32 + 5 declarations per block (the five are derived helpers), the package
appears under `devDependencies`, a second run is byte-identical, `shadcn-svelte init` keeps the
comment and the import and wipes the values, and `add button` afterwards leaves the file
byte-identical.

### 3. `@plugin` resolution: bare specifier, now written by the CLI

`@plugin "<pkg>";`, no `./`, no path segment. The 2026-10-28 measurement still applies: a relative
prelude resolves against the stylesheet's own directory, so `src/app.css` and `src/routes/layout.css`
need different strings, while a bare specifier goes through Node resolution and is independent of
both. What changed is only who writes the line: the CLI, at a known position, instead of the item's
special-cased `@plugin` merge.

What breaks: offline installs and Yarn PnP without `node_modules`, as before. The CLI runs `pnpm add`
itself, so the package manager must also be reachable at init time.

### 4. No files, no targets, no `registryDependencies`

Nothing is copied into the project except the empty override file, which the user owns and the CLI
never rewrites. There is no item type to resolve, so `getItemAliasDir` never runs and the 2026-10-28
trap (`registry:item` is an unhandled branch) cannot be reached.

### 5. `dependencies`: empty, package installed by the CLI

The package has `dependencies: []` and no peer dependency, because the plugin handler takes `addBase`
and imports nothing from `tailwindcss` (measured in 08's probe, kept). The CLI installs the package as
a devDependency at its own version; the version is not a range, so the CLI's write and the plugin's
emission come from one build.

### 6. `cssVars`: gone, and the mapping moved

The item's `css`/`cssVars` were the carrier 13 chose. Under the CLI they are replaced by the CLI's own
write: the same `:root` and `.dark` maps, the same expressions, with the fallback added. The mapping
table (09-12) now lives in two places that must be generated from one list: the `map` module the plugin
does not use for emission, and the CLI's writer. 16 owns proving that one list drives both.

The `@theme inline` self-reference trap from 04 and 20 does not apply: the CLI writes plain
declarations, not `cssVars`, so no `--x: var(--x)` entry is added.

### Evidence

- `evidence/14-override-rerun/cli-init/`: one CLI run, the written stylesheet, the resulting `package.json`.
- `…/cli-rerun/`: two runs, byte-identical.
- `…/cli-lifecycle/`: CLI, CLI, `shadcn-svelte init`, `add button`.
- `evidence/08-item-shape/`: the retired item measurements, kept because the bare-specifier proof and the
  `files: []` behaviour still explain the CLI's choices.
- `registry-14/check.mjs`: 89 checks over the committed copies.

### Constraints this puts on later tickets

- 16: one list drives the CLI's bindings and the plugin's emission; the plugin emits nothing when the
  theme is absent and throws E2/E3 when it is malformed.
- 17: publish the package and its `init` bin at an exact version; no registry, no static JSON.
- 18: the "did it install" check becomes `rg "daisyui-adapter" <stylesheet>` plus the header comment's
  version; `-o` and the committed `--omit=dev` caveat change shape (the CLI installs a devDependency,
  so a CI that runs `--omit=dev` before build still fails on the `@plugin` specifier).

Lesson: A static artefact can only paste values it was built with, so every value it preserves belongs to someone else.
Check: code - registry-14/check.mjs asserts the CLI's fallback equals the stylesheet's pre-CLI `--primary`, and 08's bare-specifier proof is reused rather than re-argued.
