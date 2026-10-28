# Ticket 20 - mechanism spike

Ticket steps (verbatim from the ticket), plus the task brief.

- [x] Build throwaway registry fixture: `registry/registry.json`, one item `spike`
- [x] Plugin: Tailwind v4 plugin, `addBase` sets `--spike-loaded: 1`, logs once on load
- [x] Item fields: files `[{ path: "spike-plugin.js", type: "registry:file", target: "src/spike-plugin.js" }]`
- [x] Item fields: css `{ "@plugin \"./spike-plugin.js\"": {} }`
- [x] Item fields: cssVars.light / .dark sentinels plus `color-popover`, `color-popover-foreground`, `color-border`
- [x] `shadcn-svelte registry build` so `files[].content` is embedded
- [x] Serve so `http://127.0.0.1:5199/r/spike.json` resolves
- [x] Run `run.mjs --keep --registry ... --add http://127.0.0.1:5199/r/spike.json`
- [x] Claim 1: `@plugin` lands at top level after last `@import`, plugin loads. PASS
- [x] Claim 2: cssVars overwrite inside existing `:root`/`.dark`, no new block. PASS
- [x] Claim 3: plain `--color-popover` is what sonner needs. **FAIL**, control shows the toast is identical
      with the plain declarations removed; Tailwind emits the name from the stock `@theme inline` map
- [x] Claim 4: re-run `add` keeps `@plugin` count at 1. PASS
- [x] Claim 5: `add` with missing CSS file errors, files written first. PASS, listing committed
- [x] Claim 6: two consecutive `add` runs leave one `@import "shadcn-svelte/tailwind.css"`. PASS
- [x] Evidence under `.scratch/daisyui-adapter/spike/`
- [x] Write `## Answer` in the ticket, `Status: resolved`, one line in `## Decisions so far`
- [x] Commit on `feat/daisyui-adapter`, no push

## Harness fixes required to get a run at all (ticket 15's harness)

- `--registry` mapped `/r/x.json` to `<dir>/r/x.json`; help text said `<dir>/x.json`.
- Registry server is in-process, and `execFileSync` blocked its event loop. Add runs through `execFile`.
- `-y` does not answer the stylesheet overwrite prompt. Add passes `-o`. Server closes after the add.

## Review gates

- Review loop (interrogate rounds): skip: no auth, payments, migrations, concurrency, shared state, public API
  or DB schema in this diff.
- `no-comments` (step 5): run. 3 flags, all acted on. `-o` comment kept as a foreign-behaviour keep.
- `code-review` (step 6): run on `8dfe1b8..HEAD`, both axes.
  - Standards: path traversal (fixed, 400 on `/r/../../package.json`), duplicated port and shutdown (fixed),
    duplicate polling in `probe-toast.mjs` (fixed). Dismissed: `shot.mjs` coupling, the `run()` guard, the
    committed `r/` payload.
  - Spec: claim 3 falsified (control run, verdict changed to FAIL), claim 5 listing added, claim 6 counts
    added, toast route committed.

## Not proved here

- Why the emitted theme-variable set goes from 5 to 55 once the sonner component exists.
- Whether cssVars reach a second `:root` rule nested in `@media (prefers-color-scheme: dark)`.
