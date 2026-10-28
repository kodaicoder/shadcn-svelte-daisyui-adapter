# Registry application mechanics

Type: research
Status: resolved
Blocked by: none

## Question

What does `shadcn-svelte add <url>` actually do to a project's CSS and files? This decides whether the adapter can wire itself in one command.

1. How is `cssVars` applied? Which existing block is targeted, where does a new block land, and what is the source order relative to the user's own `:root` and `.dark` rules?
2. How is `css` applied? Is it appended at the end of the file, merged, or nested under the existing at-rules? Show the exact serialisation for a nested rule and for an `@layer base` block.
3. Can `css` inject a bare at-rule with a prelude, specifically `@plugin "./daisyui-adapter.js"`? If not, what is the closest injectable form?
4. Where do `registry:lib`, `registry:component`, and `registry:file` files land, and how do `target` and the `aliases` in `components.json` resolve the path?
5. What does `docs` print, and at what point in the run?
6. Does `add <url>` resolve relative `registryDependencies` entries like `./button.json` against the fetched item's URL?
7. Does `add` verify that the target CSS file exists, and what error does it raise when `components.json` is missing or the CSS path is wrong?

Sources: the shadcn-svelte repository on GitHub, especially the CLI package (`add` command, CSS updater, registry fetcher) and the registry item schema, plus the registry docs pages.

## Output

Write findings to `.scratch/daisyui-adapter/research/04-registry-application-mechanics.md`, ending with `## What this means for the adapter` (max 10 bullets). Then append a `## Answer` gist (max 12 lines) to this ticket file and set `Status: resolved`. Do not edit `map.md` or any other ticket.

## Answer

- **Yes, `@plugin` is injectable and special-cased.** `css: { "@plugin \"./daisyui-adapter.js\"": {} }` -> `updateCss` quotes params if missing, dedupes, and inserts the at-rule right after the last `@import` at top level (`update-css.ts` L85-L148). Tailwind requires the quoted, top-level form (`params.slice(1,-1)`; "`@plugin` cannot be nested"), so this is the correct form, not a workaround. Fallbacks: `@import "./x.css"` (goes to the top) or any other body-less at-rule (appended at the very end).
- **Order: `cssVars` then `css`, both in one `transformCss` pass after all files are written.** `cssVars` merges into existing `:root`/`.dark` in place (overwriting values by default) and, only in a v4-shaped file (has top-level `@import` or `@theme`), appends missing blocks at the end in the order `:root`, `.dark`, then `@theme inline`.
- `css` then merges by key: an existing selector or at-rule (exact name + params) is edited in place, anything new is appended at the end; `@import` goes after the last import. So an injected `@plugin` ends up above `:root`/`.dark`/`@theme`, while `css` selectors and `@layer base` land after them.
- A new `:root` appended after an existing `.dark` has equal specificity and wins on shared properties: dark mode can leak light values. Existing blocks are never moved.
- `css` nesting is flattened, not nested: `&:hover` under `".card"` becomes a root-level `.card:hover`. Only at-rule bodies (`@layer base`) really nest, tab-indented; a top-level injected selector rule also gets one leading tab.
- Files: `registry:lib` -> `resolvedPaths.lib`, `registry:component`/`block` -> `components`, `registry:file` -> project root **only when the item type is also `registry:file`** (otherwise the item's alias wins). Path = `resolve(aliasDir, target)`; `~/` target resolves from cwd; `registry:item` throws "TODO: unhandled item type".
- `docs` prints nothing at any point; the CLI never reads it. Relative `registryDependencies` (`./button.json`) do resolve against the fetched item's URL, but a dep name that exists in the configured index wins over the sibling URL.
- No CSS existence check: a wrong `tailwindCss` yields a raw `ENOENT` stack after component files are written; a missing `components.json` gives "Configuration file is missing...". Every add carrying `css`/`cssVars` also injects `@import "shadcn-svelte/tailwind.css"`.

Evidence: shadcn-svelte@1.7.1 tag source (`update-css.ts`, `update-css-vars.ts`, `transform-css.ts`, `add-registry-items.ts`, `registry/index.ts`, `commands/add/index.ts`), identical to `main`, cross-checked against the bundled 1.7.1 CLI in `node_modules`; Tailwind v4 `apply-compat-hooks.ts` for `@plugin` parsing.
