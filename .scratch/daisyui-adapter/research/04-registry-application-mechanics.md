# 04 - Registry application mechanics

What `shadcn-svelte add <url>` does to a project's CSS and files.

## Method and versions

Read the actual CLI source, not the docs, because the answers are implementation details:

- `shadcn-svelte@1.7.1` tag on `huntabyte/shadcn-svelte` (the version installed in this repo,
  `node_modules/shadcn-svelte/package.json`). The six cited files are byte-identical to `main`
  at fetch time (verified by comparing the tag and `main` blobs).
- Cross-checked against the bundled CLI in this repo, `node_modules/shadcn-svelte/dist/index.mjs`
  (minified, same code paths: `plugin` branch, `custom-variant`, break-comment cleanup).
- `tailwindlabs/tailwindcss` `main`, `src/compat/apply-compat-hooks.ts`, for how `@plugin` is parsed
  (needed to judge what a registry item may inject).

The two entry points that matter:

- `add` writes files first, then applies CSS once at the end:
  [`commands/add/index.ts` L46-L135](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/commands/add/index.ts#L46-L135)
- `addRegistryItems` is shared by `add` and `init`:
  [`utils/add-registry-items.ts` L28-L283](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/add-registry-items.ts#L28-L283)

Order of the whole run:

1. load and resolve `components.json` (`getConfig`), run preconditions (Tailwind/Svelte versions)
2. fetch the registry index for the configured style (`<registry>/styles/<style>/index.json`)
3. resolve every item (URL, index name, relative deps) and fetch item JSON
4. prompt about overwriting if any target file already exists
5. file tasks: transform and write each `files[]` entry, and accumulate `css` / `cssVars`
6. one CSS pass: read the stylesheet, `transformCss`, confirm, write
7. dependency install (optional)

The CSS pass happens after all files are written, so a CSS failure leaves files behind.

## 1. How `cssVars` is applied

`cssVars` from every item is `deepmerge`d into one object during the file tasks
([L205-L210](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/add-registry-items.ts#L205-L210)),
then applied by `updateCssVars` inside the single `transformCss` call
([`transform-css.ts` L31](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/transform-css.ts#L31)).

Targeting, in [`update-css-vars.ts`](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css-vars.ts):

- `light` targets **every** rule in the whole tree whose selector list includes `:root`
  (`rule.selectors.includes(":root")`, so a combined rule like `:root, .foo` also matches).
  Variables are written in place: an existing declaration with the same property is **replaced**,
  a missing one is appended to that rule.
- `dark` does the same for `.dark`.
- `theme` upserts `@theme inline` (or an existing `@theme` with empty params): find top-level
  `@theme` with `params === "inline" || params === ""`, else append one at the end
  ([`upsertThemeNode` L238](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css-vars.ts#L238)).
- Derived variables are then added to that same `@theme` node: `--color-<name>: var(--<name>)` for
  every light/dark variable (only if absent), plus `--radius-sm|md|lg|xl|2xl|3xl|4xl` when `radius`
  is present. `sidebar-background` is remapped to `sidebar`.
- Bare HSL triples (`"240 5% 96%"`) are wrapped in `hsl(...)`; anything starting with `hsl`/`rgb`/`#`/`oklch` is kept as is
  (`applyVarsToRule`, `isLocalHSLValue`).

**A new block only appears when the file already looks like Tailwind v4.**
`hasV4Structure` is true only if the root has a top-level `@import` or `@theme`
([L23-L26](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css-vars.ts#L23-L26)).
If `:root` (or `.dark`) is missing and `hasV4Structure` is true, `ensureRootRule` **appends** the new
block at the very end of the file, preceded by a `/* ---break--- */` marker
([L123-L133](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css-vars.ts#L123-L133)).
If `hasV4Structure` is false, nothing new is created at all: variables are only merged into blocks
that already exist.

Also injected when `dark` variables exist and `hasV4Structure` is true: a top-level
`@custom-variant dark (&:is(.dark *));` if the file has none, inserted right after the last `@import`
(or after the first node, or appended) ([`addCustomVariant` L80-L116](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css-vars.ts#L80-L116)).

**Overwrite is on by default.** `overwriteCssVars` defaults to `true`, and `addRegistryItems` never
sets it, so a variable that already exists in the user's `:root` is silently replaced by the item's
value ([L20](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css-vars.ts#L20)).

Resulting source order:

- Existing `:root`, `.dark`, `@theme` blocks are **not moved**; only their contents change.
- Newly created blocks are appended at the end, in this order: `:root`, then `.dark`, then
  `@theme inline` (light is processed before dark, and the theme node is created after both).
- Consequence: if a file has `.dark` but no `:root`, the injected `:root` lands **after** `.dark`.
  `:root` and `.dark` have equal specificity (0,1,0), and `.dark` is normally on `<html>`, so on a
  shared property the later `:root` wins and the light value leaks into dark mode. Only cosmetic for
  distinct properties, a real bug for shared ones.

## 2. How `css` is applied

`css` is merged across items with `deepmerge` (same object keys merge deeply, later items win on the
same property), then applied by `updateCss` after `cssVars` in the same `transformCss` call
([`transform-css.ts` L31-L36](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/transform-css.ts#L31-L36)).

Behaviour is per key, not "append the whole block":

| key shape | what happens |
|---|---|
| `"@import ..."` | deduped by normalised params, inserted **after the last existing `@import`**, else prepended ([L47-L82](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css.ts#L47-L82)) |
| `"@plugin ..."` | special-cased, see section 3 ([L85-L148](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css.ts#L85-L148)) |
| any other at-rule with `{}` (no body) | deduped by name + exact params, **appended at the end** of the file |
| `"@layer base"`, `"@media ..."`, other at-rules with a body | matched at **root level** by name + exact params; merged in place if present, else appended at the end; children are written **inside** that at-rule ([`processAtRule` L364](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css.ts#L364)) |
| `"@keyframes x"` | placed **inside `@theme inline`** (created if missing) - surprising, and not where Tailwind would normally put keyframes ([L176-L236](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css.ts#L176-L236)) |
| `"@utility name"` | appended at the end, declarations written inside |
| `".selector"` | root-level lookup by exact selector; merged in place if found, else **appended at the end** ([`processRule` L444](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/updaters/update-css.ts#L444)) |
| value that is a plain string for a selector | parsed as `.temp{<string>}`, only declaration nodes are copied; nested rules in the string are dropped |

Lookups are shallow: `processRule` and `processAtRule` search only the direct children of the node
they are given, not the whole tree. A selector that exists only inside `@layer` or `@media` is not
found, and a second copy is appended at root level.

Nested selectors are **flattened, not nested**:

```ts
// update-css.ts L521
const nestedSelector = prop.startsWith("&")
  ? selector.replace(/^([^:]+)/, `$1${prop.substring(1)}`)
  : prop;
processRule(parent, nestedSelector, value);
```

`parent` is the same parent, so `&:hover` under `".card"` becomes a **root-level** `.card:hover`, and
a non-`&` nested key (`"h1"`) becomes a root-level `h1` rule. No CSS nesting is emitted.

### Exact serialisation (derived from the code paths)

Every created node sets `raws.before` explicitly, so the output is determined by
`inferBefore(parentBefore) = "\n" + parentBefore.replaceAll("\n","") + "\t"` (`TAB`, spaces are never
detected). Nodes created at root level get `"\n"` (at-rules) or `"\n\t"` (rules, via
`inferBefore(root.raws.before)` when the root has no `before`), declarations get one more tab.

Input:

```json
{
  "@layer base": {
    "body": { "background": "var(--background)" },
    "*.adapter": { "@apply bg-base-100": {} }
  },
  ".card": { "color": "red", "&:hover": { "color": "blue" } }
}
```

Appended at the end of the CSS file (markers already stripped, blank lines collapsed):

```css
@layer base {
	body {
		background: var(--background);
	}
	*.adapter {
		@apply bg-base-100;
	}
}

.card {
	color: red;
}

.card:hover {
	color: blue;
}
```

For an `@layer base` block the `@layer` itself sits at column 0, child rules get one tab and their
declarations two tabs. A top-level selector rule injected by `css` gets a leading tab (cosmetic
quirk of `inferBefore(root.raws.before)`). `@apply` merges with an existing `@apply` in the same rule
through `twMerge` instead of adding a second one.

Tidy-up at the end of `transformCss`
([L38-L58](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/transform-css.ts#L38-L58)):
a trailing at-rule gets a `;`, all `/* ---break--- */` markers are removed, runs of blank lines are
collapsed to one blank line, and the trailing newline is preserved if the file had one. If the
result equals the input, nothing is written and no prompt appears.

## 3. Can `css` inject `@plugin "./daisyui-adapter.js"`? Yes.

This is a first-class, special-cased key, not a generic at-rule hack:

```ts
// update-css.ts L85-L148
if (name === "plugin") {
    let quotedParams = params;
    if (params && !params.startsWith('"') && !params.startsWith("'")) {
        quotedParams = `"${params}"`;   // quoting is added for you
    }
    // dedupe on params with one pair of quotes stripped
    // insert after the last @plugin, else after the last @import,
    // else prepend; break markers added in the latter two cases
}
```

So the registry item carries:

```json
{
  "css": { "@plugin \"./daisyui-adapter.js\"": {} }
}
```

and `add` writes `@plugin "./daisyui-adapter.js";` as a top-level at-rule immediately after the last
`@import` (or after the last existing `@plugin`). Unquoted params are quoted automatically; an
existing `@plugin` with the same path in single or double quotes is not duplicated. The value `{}`
is required only to be an object; for `@plugin` the value's contents are ignored (the check runs
before the empty-body branch).

Why this form is the right one, from Tailwind's parser
([apply-compat-hooks.ts L185-L200, L350-L360](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/compat/apply-compat-hooks.ts)):

- `let pluginPath = node.params.slice(1, -1)` - the first and last characters are stripped, so the
  path **must be quoted**. A bare `@plugin ./daisyui-adapter.js` would be read as `./daisyui-adapter.j`.
- `if (ctx.parent !== null) throw new Error('@plugin` cannot be nested.')` - it must be a top-level
  at-rule. `updateCss` writes it at root level, so this holds.
- the path is passed as `id` with `base: ctx.context.base`, the base of the CSS file being compiled,
  so a relative path resolves against the stylesheet's own directory, not the project root.

Closest alternatives, if a future version dropped the special case (all still injectable today):

- `{ "@import \"./daisyui-adapter.css\"": {} }` - the import branch is also first-class and inserts at
  the top; the plugin file can be an imported CSS file that itself contains `@plugin`.
- Any other body-less at-rule with a prelude works through the generic branch
  (`{ "@source \"./src\"": {} }`), but it is appended at the very end of the file rather than near the
  top, which matters for `@source`/`@theme` ordering assumptions.

Tailwind's own docs confirm the directive form: "Use the `@plugin` directive to load a legacy
JavaScript-based plugin ... accepts either a package name or a local path"
(<https://tailwindcss.com/docs/functions-and-directives>).

## 4. Where `registry:lib`, `registry:component`, `registry:file` land

Path = `path.resolve(aliasDir, file.target)`, where `aliasDir` comes from `getItemAliasDir`
([`registry/index.ts` L206-L259](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/registry/index.ts#L206-L259)):

| type | alias dir |
|---|---|
| `registry:lib` | `resolvedPaths.lib` |
| `registry:component`, `registry:block` | `resolvedPaths.components` |
| `registry:file`, `registry:font`, `registry:base` | `resolvedPaths.cwd` |
| `registry:ui` | `resolvedPaths.ui` |
| `registry:hook` | `resolvedPaths.hooks` |
| `registry:page` | `src/routes` if SvelteKit, else `resolvedPaths.components` |
| `registry:style`, `registry:theme` | no file write; looked up as the stylesheet name |
| `registry:item` | **not handled** - falls through to `throw new Error("TODO: unhandled item type registry:item")` |

Which type is used for the lookup:

```ts
// registry/index.ts L249-L253
if (file.type === "registry:file") {
    aliasDir = getItemAliasDir(config, item.type);  // item type decides
} else {
    aliasDir = getItemAliasDir(config, file.type);  // file type decides
}
```

So a `registry:file` entry resolves against the project root **only when the item itself is
`registry:file`** (or `base`/`font`). A file of type `registry:file` inside a `registry:component`
item lands in the components directory instead. The `target` is a path, not just a filename:
subdirectories in it are preserved, an absolute `target` wins over the alias, and a target starting
with `~/` is resolved against the project root before any alias
([L232-L246](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/registry/index.ts#L232-L246)).
There is one name special case: an item named `utils` writes to `resolvedPaths.utils`, with `.ts`
appended when the alias has no extension.

`aliases` in `components.json` are resolved at load time by `resolveImportAlias`
([`resolve-imports.ts` L18-L55](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/resolve-imports.ts#L18-L55)),
in this order: tsconfig `paths`, then `<alias>/*` wildcard, then the `package.json` `imports` map for
`#` aliases, then workspace dependencies. The CSS path is `path.resolve(cwd, tailwind.css)` and is not
touched by this
([`config/utils.ts` L56](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/config/utils.ts#L56)).

In this repo (`#lib` -> `./src/lib/*` in `package.json` `imports`): `registry:lib` ->
`src/lib`, `registry:component` -> `src/lib/components`, `registry:ui` -> `src/lib/components/ui`,
`registry:hooks` -> `src/lib/hooks`. A `registry:lib` item with `target: "daisyui-adapter.ts"` lands at
`src/lib/daisyui-adapter.ts`.

## 5. What `docs` prints

Nothing. `docs` exists in the item schema (`registryItemCommonSchema`, "a markdown string") but the
CLI never reads it: there is no `item.docs` access anywhere in `packages/cli/src` at 1.7.1 (checked
`add-registry-items.ts`, `registry/index.ts`, `commands/*`), and no `view` command exists
(`commands/index.ts` exports only `add`, `apply`, `init`, `update`, `registry`). The bundled 1.7.1 CLI
in `node_modules` likewise contains no `docs` handling; the only `docs` strings are documentation URLs.
`registry build` passes the field through into the generated item JSON for the website to render.

## 6. Do relative `registryDependencies` resolve against the fetched item's URL? Yes.

[`resolveRegistryItems` L99-L158](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/registry/index.ts#L99-L158):

1. try the configured registry index by name;
2. if absent and the entry is an absolute URL, or starts with `./` / `../` and a `parentUrl` exists,
   fetch `new URL(item, parentUrl)` - for the top-level URL the `parentUrl` is undefined, so the item
   URL itself is the base;
3. recurse with `parentUrl: remoteUrl`, so `./button.json` in `https://x.dev/r/card.json` fetches
   `https://x.dev/r/button.json`.

Two consequences: a dependency whose name also exists in the configured index is taken from the
index, not from the sibling URL; and results are deduped by `name`.

Also note the index is always fetched first (`getRegistryIndex(registryUrl)` before resolving, L52),
keyed on `<components.json registry>/styles/<style>`, so `add <url>` still needs the configured
registry reachable even when every item comes from your own URL.

## 7. Existence checks and errors

- **Missing `components.json`**: `getConfig` returns `undefined`, `add` throws
  `ConfigError("Configuration file is missing. Please run init to create a components.json file.")`
  ([L56-L62](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/commands/add/index.ts#L56-L62)).
  `handleError` prints the stack and exits 1.
- **Malformed `components.json`**: `ConfigError("Invalid configuration found in <path>")` plus
  `z.prettifyError` output.
- **Invalid alias** (alias not present in tsconfig paths / package imports): `ConfigError` naming the
  alias, from `resolveConfig`.
- **CSS file missing or wrong path**: there is **no check**. `tailwindCss` is only
  `path.resolve(cwd, config.tailwind.css)`; `init` validates a `--css` path before writing, but `add`
  does not. The failure surfaces at `await fs.readFile(cssPath, "utf8")`
  ([L245](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/add-registry-items.ts#L245)),
  i.e. **after** all component files have been written, as a raw `ENOENT` / `EISDIR` stack printed by
  `handleError` (`printError` prints `error.stack`), exit code 1, with no hint about
  `components.json`.
- The CSS read happens only when the merged `css`/`cssVars` is non-empty
  ([L240-L245](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/add-registry-items.ts#L240-L245)).
  An item with only `files` never touches the stylesheet, so a wrong CSS path stays invisible.
- Preconditions reject a project without `tailwindcss` and `svelte` in its dependencies, and reject
  Svelte < 5.
- Before writing the stylesheet, if the content changed and `--overwrite` was not passed, it asks
  "Updates to your `<path>` are required. Existing CSS variables may be overwritten. Continue?" so a
  non-interactive run needs `-o` (or `--yes` plus `-o`) to avoid hanging
  ([L250-L270](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/add-registry-items.ts#L250-L270)).

## Caveats

- Every add that carries `css` or `cssVars` also injects `@import "shadcn-svelte/tailwind.css"`:
  `css = merge(css, shadcnSvelteTailwindCssImport)` runs unconditionally inside that branch
  ([L241](https://github.com/huntabyte/shadcn-svelte/blob/shadcn-svelte@1.7.1/packages/cli/src/utils/add-registry-items.ts#L241)).
  It is unavoidable from the item side.
- `@plugin` files are not copied by the registry item unless you also ship them as `files[]`; `add`
  writes files before it touches CSS, so both orders are safe.
- `css` values are CSS-in-JSON, so anything Tailwind-specific must survive `postcss` parsing; a
  string value is re-parsed through a `.temp{}` wrapper.
- `@keyframes` being parked inside `@theme inline` is real 1.7.1 behaviour and worth avoiding.
- Indentation is always tabs and one extra tab on top-level injected selector rules; a spaces-only
  stylesheet will look mixed.
- `registry:item` type throws `TODO: unhandled item type` when added, despite being in the schema.
- Not verified here: whether `add` is idempotent when the CSS already came from the same item - the
  dedupe is per at-rule/selector/property, so re-running should be a no-op (import, plugin, at-rule
  body-less, selector all dedupe), but this was reasoned from the code, not executed.

## What this means for the adapter

- One command can wire it: `css: { "@plugin \"./daisyui-adapter.js\"": {} }` is a supported,
  special-cased injection that lands at top level right under the imports, which is exactly where
  Tailwind wants `@plugin`.
- Ship the plugin file in the same item as `registry:lib` with `target: "daisyui-adapter.ts"`;
  `transformStripTypes` strips the types and renames `.ts` to `.js` when `components.json` says
  `typescript: false`, so one registration serves both project types.
- The `@plugin` path is resolved relative to the **stylesheet**, not the project root: with
  `src/lib/daisyui-adapter.js` and `src/routes/layout.css` the prelude must be
  `@plugin "../lib/daisyui-adapter.js"`. A target that differs per project (custom `lib` alias) forces
  the CSS prelude to differ too, so the adapter needs to know the CSS path or use a stable relative
  layout.
- Prefer one `registry:lib` item over `registry:item`; `registry:item` is unhandled in `getItemAliasDir`.
- Do not rely on `docs` for install-time instructions: nothing prints it.
- Do not rely on relative `registryDependencies` unless items are fetched by URL; names resolve from
  the configured index first.
- Expect the stylesheet prompt: document `add <url> -o` for non-interactive use, and expect an
  `@import "shadcn-svelte/tailwind.css"` side effect on the first add that carries CSS.
- `cssVars` are a blunt instrument: default overwrite replaces the user's values, and a new `:root`
  appended after an existing `.dark` breaks dark mode. Prefer `css` for anything DaisyUI-specific and
  keep `cssVars` to additive `@theme` tokens if at all.
- `@plugin` options cannot carry a body; any configuration must come from the plugin file itself or
  via flat `@plugin "..." { key: value }` declarations (Tailwind supports those, shadcn-svelte does
  not emit them), so the adapter's config should live inside the JS plugin, not in the CSS.
- Nested selectors in `css` are flattened to root-level selectors, so `&`-nesting will not work the
  way it does in the design system's source.
- A wrong `tailwind.css` path in `components.json` fails late and cryptically; the adapter docs should
  tell users to fix `components.json` first.

## Sources

- shadcn-svelte CLI at tag `shadcn-svelte@1.7.1` (identical to `main` when read):
  - `packages/cli/src/utils/updaters/update-css.ts`
  - `packages/cli/src/utils/updaters/update-css-vars.ts`
  - `packages/cli/src/utils/transform-css.ts`
  - `packages/cli/src/utils/add-registry-items.ts`
  - `packages/cli/src/utils/registry/index.ts`, `packages/cli/src/utils/registry/schema.ts`
  - `packages/cli/src/commands/add/index.ts`, `packages/cli/src/utils/config/utils.ts`,
    `packages/cli/src/utils/resolve-imports.ts`, `packages/cli/src/utils/preconditions.ts`,
    `packages/cli/src/utils/prompt-helpers.ts`, `packages/cli/src/utils/utils.ts`
- Bundled CLI 1.7.1 shipped in this repo: `node_modules/shadcn-svelte/dist/index.mjs`
- Tailwind CSS v4: `packages/tailwindcss/src/compat/apply-compat-hooks.ts` (`@plugin` parsing,
  top-level requirement, quoted path) and <https://tailwindcss.com/docs/functions-and-directives>
