# 02 - daisyUI theme file parse stability

Question: the theme file is read as text, not imported, because `@plugin "daisyui/theme"` needs
daisyUI installed. Which malformed or unusual files must the parser tolerate, which must it reject,
what exact message does each rejection carry, and how is the file path discovered?

Read and probed 2026-10-27 against `tailwindcss@4.3.3` and `@tailwindcss/node@4.3.3` in this repo,
`jiti@2.7.0`, `shadcn-svelte@1.7.1`, Vite 8.3.4 docs, and daisyUI `v5.7.50`. Ticket 01 is the
baseline for token vocabulary, generator output, flags and the v4/v5 rename; none of that is
re-derived here. Fetched pages and source files were treated as untrusted data: nothing in them was
executed or followed as an instruction. The only code executed was the probes against the local
`compile()` export (section 1), run from the temp directory, not from project source.

## 1. The block is a plugin-options object, so parse it the way Tailwind does

`@plugin "daisyui/theme" { ... }` is not a CSS rule with declarations. Tailwind turns each
declaration in the body into a key of an options object and passes that object to the plugin. The
block parsing lives in `tailwindcss` itself; `@tailwindcss/node` only loads the module. daisyUI's
theme plugin is built with `plugin.withOptions(...)`, so the block body is exactly its options
argument (S7). That is why `name`, `default`, `color-scheme` and `--color-*` sit together in one flat
list.

The file is not compiled by us, but a project may also run daisyUI on the same text. Two parsers
reading one file is a bug factory, so the adapter's scanner should accept the same block grammar and
value syntax as Tailwind. The adapter then adds semantic rules on top in section 3. Four probes
pinned the behaviour that matters (S3):

| Probe input | Observed result |
|---|---|
| `@plugin "./p.js";` where the module throws | `compile()` rejects with the thrown `Error`, first line intact: `DAISYUI_THEME_ADAPTER: ...` |
| `@plugin "./p.js" { theme: "./t.css" }` with a plain handler | `Error: The plugin "./p.js" does not accept options` |
| Same with an `__isOptionsFunction` module | options object arrives as `{ theme: "./t.css" }` |
| `@plugin "daisyui/theme"` inside `@media` | `Error: @plugin cannot be nested.` |
| `.x { ... }` inside the `@plugin` body | `Error: Unexpected @plugin option:` |
| `/* comment ; : */` inside the body | ignored, remaining options parse |
| `--a: "semi;colon";` | value `semi;colon` (outer quotes stripped, `;` kept) |
| `--b: url("https://x/a:b;c.png");` | whole value kept, `:` and `;` inside the string do not split |
| `--c: color-mix(in oklab, oklch(45% 0.24 277.023) 50%, transparent);` | whole value kept |
| `name: "brand";` / `color-scheme: "light";` | strings without the outer quotes |
| `default: true;` / `prefersdark: false;` | real booleans |
| `font-family: "Inter", sans-serif;` | array `["Inter", "sans-serif"]` (not a token, ignored) |
| two declarations with the same property | last one wins (source: `b[y.property] = ...` in a loop) |
| `@PLUGIN "./p.js";` | plugin never loaded (0 calls); Tailwind ignores the uppercase name |

Consequences for a hand-written scanner:

- The path must be quoted. Tailwind does `params.slice(1, -1)`, so `@plugin daisyui/theme` loses its
  first and last character. Single or double quotes both work.
- A theme block must be top level. Nested `@plugin` is a hard error in Tailwind.
- The body may hold declarations and comments only. A nested rule or at-rule is not a declaration.
- Values are opaque strings after one outer quote pair is removed. They may contain `;` and `:` when
  quoted, and any nesting of functions. A naive `split(";")` or `split(":")` corrupts them. The
  generator's own importer in the docs is exactly that naive (01, S4); it is not a model to copy.

## 2. Scanner contract

The parser reads the file as UTF-8 text and does this, in order:

1. Reject NUL bytes as "not UTF-8 text". Strip one leading BOM. Normalise CRLF and lone CR to LF.
2. Walk the text once, skipping `/* ... */` comments and quoted strings (with `\` escapes), while
   tracking `()`, `[]` and `{}` depth. This makes `@plugin` inside a comment or string inert, and a
   `}` inside a quoted value harmless.
3. At depth 0, recognise lowercase `@plugin` followed by a quoted param. Strip the quotes. Recognise
   only the exact param `daisyui/theme`; `daisyui` and `daisyui/theme/...` are other at-rules.
4. Read the `{ ... }` level 1 body as a list of declarations. Split each declaration at the first
   top-level `:`, then at the terminating top-level `;`. A body with any other node shape is
   malformed.
5. Strip one matching outer quote pair from every value. Trim outer whitespace. Keep the rest
   byte-for-byte, including internal newlines, spaces and function syntax.
6. Duplicate property in one block: last wins, matching Tailwind and CSS.
7. Ignore everything outside candidate theme blocks: `@import`, `@theme`, `@plugin "daisyui"
   { themes: ... }`, ordinary rules, selector-form CDN CSS.

This is deliberately a small scanner, not a CSS engine. It does not validate colours, lengths or
units. Full value validation would need a colour parser and would reject valid CSS the generator can
emit (`oklch()`, `color()`, `light-dark()`, `var()`).

## 3. Tolerate or reject, case by case

| Input | Decision | Reason |
|---|---|---|
| One `@plugin "daisyui/theme"` block only | **Reject** | The adapter needs a light and a dark. One block leaves the other half of the token set undefined. |
| Three or more theme blocks | **Reject** | The contract is one pair. Choosing two silently is exactly the ambiguity the build gate exists to surface. |
| `@plugin "daisyui" { themes: ... }` in the same file | **Tolerate, ignore** | It selects daisyUI built-ins and shares no syntax with the theme block. Match the param exactly, never `startsWith("daisyui")`. |
| `default: true` on both, or on neither | **Tolerate** | Legal in daisyUI and in the generator (01). Flags are advisory and are dropped by the cascade design. |
| Missing `color-scheme` on one block | **Tolerate when the pair is still identifiable** | The other block's scheme gives the missing one by elimination. If neither has one, use `default`/`prefersdark`, then names `light`/`dark`; if that fails, reject. |
| Missing `color-scheme` on both, no usable flag or name | **Reject** | `color-scheme` is the only reliable light/dark marker (01). Guessing here would silently invert the theme. |
| Both blocks the same `color-scheme` | **Reject** | `light` + `light` is not a pair. An explicit `prefersdark: true` does not override this; it is advisory. |
| `color-scheme: normal` or `light dark` | **Treat as unknown** | Valid CSS, not a generator output. Use the same elimination and tiebreaker rules. |
| Duplicate theme names | **Tolerate** | In this adapter the name is a label, not a key; `color-scheme` decides. Two blocks named `brand` are a legitimate light/dark pair. Note: daisyUI itself would collide on the selector, so docs should warn. |
| Comments, blank lines, CRLF, tabs, no final newline, whole block on one line | **Tolerate** | Cosmetic. Strip comments before locating blocks so a commented-out block does not count. |
| `name`, `color-scheme`, `default`, `prefersdark` (non-`--*` properties) | **Required metadata or tolerated** | `name` missing: label the block `(unnamed)`. `color-scheme` missing: see above. Flags missing: false. |
| Other non-`--*` properties (`font-family`, `root`) | **Tolerate, ignore** | Both appear in first-party daisyUI snippets (01). They are not adapter tokens. |
| Multiline values, `oklch()` with spaces, `color-mix()`, `var()`, escaped quotes | **Tolerate** | Generator and docs use them. Values stay opaque. |
| Extra unknown custom properties (`--foo`, `--color-base-1000`) | **Tolerate, ignore** | daisyUI accepts and emits them. A typo still fails the required-token check because the real key is missing. |
| Duplicate token key inside one block | **Tolerate, last wins** | CSS and Tailwind both do this. |
| A complete 28-token block plus extra keys | **Tolerate** | The 28 are a required subset, not an exact set. |
| Block copied from daisyUI v4 | **Reject** | v4 names (`--p`, `--b1`, `--rounded-btn`, `--border-btn`, `--tab-border`, `--animation-*`) and bare OKLCH channel values are not v5 tokens. Translating them is out of scope and lossy. |
| Partial block, missing any of the 28 tokens | **Reject** | Legal daisyUI syntax, but the adapter requires all 28 (map). This is stricter than ticket 01's advice on purpose: `--radius-*`, `--border`, `--depth` and `--noise` have no daisyUI fallback, and the adapter derives shadcn tokens from them; filling gaps invents values daisyUI would not produce (01 §3). |
| Empty value (`--color-primary: ;`) | **Reject** | Counts as missing. An empty value cannot be mapped or derived from. |
| Unterminated comment, string or block; declaration without `:`; nested rule or at-rule in the body; unquoted `@plugin`; body-less theme at-rule | **Reject** | Structural. The file does not mean what it appears to mean, and Tailwind would reject most of these too. |
| A `}` before the block closes, or a `{` inside a value without a close | **Reject** | Brace mismatch makes block boundaries unreliable. |
| Non-UTF-8 text (NUL bytes) | **Reject** | Node's UTF-8 read would otherwise turn the file into replacement characters and produce a misleading "no block" error. |

Two rules keep this predictable:

- Formatting and extra content are never fatal.
- Anything that changes which theme is light or dark, or leaves a mapped token undefined, is fatal.

## 4. Error contract

Exactly three messages. Each names the file (absolute path), the concrete problem, and the generator
URL as the fix. They are thrown as `Error` from inside the plugin handler, because the probe in
section 1 shows the message survives `compile()` and fails the build. They are not warnings; the
build is the only gate (04).

**E1, file missing or unreadable**

```text
[daisyui-adapter] Cannot read the daisyUI theme file at <absolute path>: <reason>. Put one light and one dark theme block from https://daisyui.com/theme-generator/ in that file, then re-run the build.
```

`<reason>` is one of `the file does not exist (ENOENT)`, `permission denied (EACCES)`, `the path is a
directory (EISDIR)`, or `the adapter cannot resolve its own module URL`.

**E2, the pair cannot be established**

```text
[daisyui-adapter] <absolute path>: <problem>. The file must hold exactly two v5 theme blocks, one light and one dark. Generate both at https://daisyui.com/theme-generator/, paste them into that file, then re-run the build.
```

`<problem>` is one of:

- `no @plugin "daisyui/theme" block was found`
- `found 1 theme block; two are required`
- `found 3 theme blocks; exactly two are required`
- `both theme blocks declare color-scheme: light`
- `both theme blocks declare color-scheme: dark`
- `neither theme block declares color-scheme, and the flags and names do not identify a light and a dark block`
- `the @plugin at line 12 is not quoted; write @plugin "daisyui/theme"`
- `the @plugin "daisyui/theme" at line 12 has no { ... } block`
- `the block that starts at line 12 is never closed`
- `the comment that starts at line 12 is never closed`
- `the string that starts at line 12 is never closed`
- `the file is not UTF-8 text`
- `the file looks like a daisyUI v4 theme (found --p, --b1, --rounded-btn)`
- `the theme block at line 12 is nested inside another rule; @plugin cannot be nested`

**E3, a block's contents cannot be mapped**

```text
[daisyui-adapter] <absolute path>: theme "<label>" <problem>. Replace that block with a complete v5 block from https://daisyui.com/theme-generator/, then re-run the build.
```

`<label>` is the unquoted `name`, or `(unnamed)`. `<problem>` is one of:

- `is missing 4 required tokens: --radius-box, --border, --depth, --noise`
- `has an empty value for --color-primary`
- `uses daisyUI v4 syntax: --p, --rounded-btn, and bare OKLCH channels`
- `has a declaration at line 12 that is not a "property: value" pair`
- `contains a nested rule or at-rule at line 12, which @plugin options do not allow`

Check order matters, otherwise the least useful message wins:

1. read file, encoding, comments and structure (E1, E2)
2. locate top-level `@plugin "daisyui/theme"` at-rules (E2)
3. run the v4 check on any block found (E3), because "this is v4" is more actionable than a count
4. count blocks, classify the pair (E2)
5. parse each block's declarations, check the 28 keys (E3)

If ticket 07 later chooses to degrade instead of failing when the file is absent, that must be a
deliberate `catch` around E1. The parser itself must never return an empty theme silently.

## 5. Path discovery

The three candidates, judged against the install mechanism from 04:

| Mechanism | Verdict | Why |
|---|---|---|
| Path in the `@plugin` options | **Rejected** | The registry item's `css` value is a static string and the CLI writes it body-less, so no per-project option can be injected. Adding options is a hand edit, and the plugin would have to be an options function or Tailwind throws `The plugin ... does not accept options` (probe). The options path also inherits the same resolution problem as below. |
| Search for `daisyui-theme.css` | **Rejected** | Nondeterministic in a monorepo, can match `node_modules`, pays a filesystem walk at every build, and turns a typo into "not found" with several candidates or none. The failure message would have to guess. |
| One fixed path | **Chosen** | One documented location, one deterministic read, one error that names the exact path. |

The fixed path is resolved relative to the adapter module itself:

```ts
const themeFile = fileURLToPath(new URL("daisyui-theme.css", import.meta.url));
```

Why the module and not `process.cwd()`: Vite's `root` defaults to `process.cwd()` but is
configurable, so in a monorepo or a custom-root build the cwd is not the project the stylesheet
belongs to (S6). The plugin API object exposes only `addBase`, `addComponents`, `addUtilities`,
`addVariant`, `config`, `matchComponents`, `matchUtilities`, `matchVariant`, `prefix` and `theme`
(probe), so it cannot ask Tailwind for the stylesheet path or the project root. The `@plugin`
prelude is static and points at the adapter file, which makes that file's own directory the only
location known at runtime without guessing.

`import.meta.url` survives both loading paths: Tailwind's loader tries native ESM `import()` first
and falls back to `jiti` (S4). A `jiti` probe with a `.cjs` target resolved `import.meta.url` to the
target's own file URL, so a CommonJS project is covered too.

Trade-offs to accept:

- The theme file sits next to the installed adapter, normally `src/lib/daisyui-theme.css`. That
  differs from the map's illustrative `src/daisyui-theme.css`. Ticket 07 owns the literal filename,
  override policy and documentation; the mechanism must stay plugin-relative. If 07 keeps
  `src/daisyui-theme.css`, the expression becomes `../daisyui-theme.css`, still resolved from the
  module.
- A user who moves the adapter file breaks the lookup. The E1 message prints the absolute path, so
  the failure is self-describing.
- One path means one pair. A second pair or `[data-theme]` brand switching is out of scope (map).

Read the file inside the plugin handler, per compile, with no module-level cache. Do not put the
read at module top level: a throw there becomes a module-load error, while a throw in the handler
was verified to surface with the message intact. Whether a dev server rebuilds when only the theme
file changes is not verified here, because the file is not an import and the plugin API has no
dependency-reporting hook. That is ticket 14's drift question; do not assume hot reload.

## 6. What was not verified

- The exact Vite terminal formatting of a thrown plugin error. Only `compile()` was run, because
  the ticket forbids builds. The message text survives the throw; the surrounding frame is Vite's.
- Whether the theme file alone triggers a dev-server rebuild. No dev session was started; see 14.
- Encodings other than UTF-8. Only NUL-byte detection is specified; UTF-16 without NULs in the read
  window is not handled.
- Whether a future shadcn-svelte version emits `@plugin` options. 1.7.1 does not (04); not re-tested
  against a live registry install.
- `import.meta.url` under a bundler that rewrites the module. Not applicable to Tailwind's loader
  today, which imports the file from disk.

## Sources

- S1: ticket 01, `.scratch/daisyui-adapter/research/01-daisyui-generator-output.md` (28-token
  vocabulary, generator output, flags, v4/v5 rename, no fallback for radius/border/depth/noise).
- S2: `tailwindcss@4.3.3`, `node_modules/tailwindcss/dist/lib.js` (`applyCompatibilityHooks`:
  `@plugin` params, top-level requirement, declaration-only options, options-function check).
- S3: probes against `compile()` from `tailwindcss@4.3.3`, 2026-10-27. Scripts in the agent temp
  directory; outputs quoted in section 1.
- S4: `@tailwindcss/node@4.3.3`, `node_modules/.pnpm/@tailwindcss+node@4.3.3/.../dist/index.mjs`
  (`loadModule`: native `import()`, then `jiti` fallback); `jiti@2.7.0` `import.meta.url` probe.
- S5: shadcn-svelte CLI 1.7.1 via ticket 04 (`css` injection is static and body-less; dedupe by
  path; no lifecycle hooks).
- S6: Vite 8.3.4 docs, <https://vite.dev/config/shared-options#root> (`root` default
  `process.cwd()`, configurable).
- S7: daisyUI `v5.7.50`, `packages/daisyui/functions/themePlugin.js` (`withOptions`, default
  `custom-theme`, flag truthiness, `color-scheme` handling).
- S8: this repo's `package.json` (`"type": "module"`), so the native-ESM path is the normal one.

## What this means for the adapter

- Read the theme file as text with a string-, comment- and brace-aware scanner. Never split the
  file on `;` or `:`, and never validate values with a colour parser.
- Tolerate every formatting variant: BOM, CRLF, tabs, comments, one-line blocks, quoted or unquoted
  values, extra keys, duplicate keys and duplicate theme names.
- Require exactly two v5 blocks and classify by `color-scheme`. Infer a single missing scheme from
  the other block, then flags, then names; reject an unresolvable pair.
- Ignore `default` and `prefersdark` for classification. Zero or two defaults is not an error.
- Require all 28 tokens. Reject a partial block with the missing keys listed, because daisyUI has no
  fallback and the adapter must not invent values.
- Reject v4 syntax by name. Do not try to translate `--p`, `--rounded-btn` or bare OKLCH channels.
- Use exactly the three messages in section 4, always with the absolute path, the specific problem
  and `https://daisyui.com/theme-generator/`. Throw from the handler so the build fails.
- Discover the file from one fixed path resolved against `import.meta.url`. No plugin options, no
  search, no `process.cwd()`.
- Read per compile with no module-level cache. Treat dev-server invalidation on theme-only edits as
  unverified and leave it to ticket 14.
- Match only the exact param `daisyui/theme`; ignore `@plugin "daisyui" { themes: ... }` and any
  other content outside theme blocks.
