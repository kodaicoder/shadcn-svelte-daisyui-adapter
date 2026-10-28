# daisyUI parse stability and edge cases

Type: research
Status: resolved
Blocked by: 01

## Question

The theme file is read as text, not imported, because `@plugin "daisyui/theme"` requires the daisyUI package we refuse to install. So the parser is ours. How fragile is that?

1. Enumerate realistic malformed or unusual files and say for each whether we must tolerate it or reject it with a clear error:
   - one `@plugin "daisyui/theme"` block only
   - three or more theme blocks
   - a global `@plugin "daisyui" { themes: ... }` block in the same file
   - `default: true` on both themes, or on neither
   - missing `color-scheme`
   - duplicate theme names
   - comments, blank lines, CRLF, tab indentation
   - property writes that are not `--*` (for example `name`, `color-scheme`)
   - multiline values, `oklch()` with spaces, `color-mix()` values
   - extra unknown custom properties
   - a theme block copied from daisyUI v4
2. Propose the exact set of build-error conditions, each with the message text a user should see. The message must name the file, the problem, and the fix (`https://daisyui.com/theme-generator/`).
3. Decide whether the parser should read the file from a fixed path, a path given in the `@plugin` options, or search. State the trade-off.

Depends on ticket 01 for the token vocabulary. Read `.scratch/daisyui-adapter/research/01-daisyui-generator-output.md` first.

## Output

Write findings to `.scratch/daisyui-adapter/research/02-parse-stability.md`, ending with `## What this means for the adapter` (max 10 bullets). Then append a `## Answer` gist (max 10 lines) to this ticket file and set `Status: resolved`. Do not edit `map.md` or any other ticket.

## Answer

- Tolerate: BOM/CRLF/tabs/blank lines, comments, quoted or unquoted values, arbitrary key order, one-line blocks, extra and duplicate keys, duplicate theme names, zero or two defaults, a global `@plugin "daisyui"` block, multiline/`oklch()`/`color-mix()` values, and one missing `color-scheme` when the other block identifies the pair.
- Reject: zero, one, or 3+ theme blocks; both blocks the same scheme; neither scheme identifiable; v4 names or bare OKLCH channels; any of the 28 tokens missing or empty; unterminated comment/string/block; non-declaration body; nested or body-less `@plugin`; unquoted path; non-UTF-8 text.
- E1: `[daisyui-adapter] Cannot read the daisyUI theme file at <path>: <reason>. Put one light and one dark theme block from https://daisyui.com/theme-generator/ in that file, then re-run the build.`
- E2: `[daisyui-adapter] <path>: <problem>. The file must hold exactly two v5 theme blocks, one light and one dark. Generate both at https://daisyui.com/theme-generator/, paste them into that file, then re-run the build.`
- E3: `[daisyui-adapter] <path>: theme "<label>" <problem>. Replace that block with a complete v5 block from https://daisyui.com/theme-generator/, then re-run the build.`
- Path: one fixed path resolved from the adapter module, `fileURLToPath(new URL("daisyui-theme.css", import.meta.url))`. No plugin options (the registry `css` injection is a static body-less string), no search, no `process.cwd()` (Vite root is configurable). Ticket 07 owns the literal filename and override policy.
- Throw from inside the plugin handler so `compile()` rejects with the message intact. Read per compile, no module cache. Dev-server invalidation on theme-only edits is unverified and left to ticket 14.
