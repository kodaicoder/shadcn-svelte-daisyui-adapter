# Install contract: preconditions, errors, commands

Type: grilling
Status: resolved
Blocked by: 20

## Question

What is the user's exact sequence, and what happens when they deviate?

Decide:
1. The prerequisite state we assume: shadcn-svelte installed through step 4, `components.json` present, CSS file path from `components.json`.
2. Where the theme file lives, its fixed name, and whether we accept an override.
3. The exact commands, in order, including the registry URL form.
4. What the install prints on success, and what it prints when the theme file is missing or malformed. Ticket 04 found `docs` prints nothing, so the only gate is build time. Decide what the user sees there, and whether the adapter should also emit a warning comment into the CSS file.
5. Whether the adapter should degrade gracefully (render with the step-4 defaults) or fail the build when the theme file is absent. Pick one.

## Answer

Resolved 2026-10-28. Five decisions. Behaviour that mattered was run, not read: the fixture is
`registry-07/`, and the cited artefacts are copied to `evidence/07-install-gate/` from harness run
`2026-10-28T04-14-34-526Z` (the run directory is gitignored).

### 1. Prerequisite state

The contract starts after both of these have run:

```bash
pnpm dlx sv create my-app --add tailwindcss
pnpm dlx shadcn-svelte@latest init
```

They leave `components.json` with `tailwind.css` pointing at the project's global stylesheet, and that
stylesheet imported by the root layout. The path depends on the SvelteKit version: `src/routes/layout.css`
on SvelteKit 3, `src/app.css` on older projects. The adapter never hardcodes it, because `add` reads it
from `components.json`. The SvelteKit 3 branch is this repo's own `components.json`; no harness `add` has
run against a `src/routes/layout.css` project yet, so 08 must exercise that layout before claiming it.

Reasons: `add` will not run without `components.json` (ticket 04), and it has no CSS existence check, so a
wrong `tailwind.css` writes every file and then dies with a raw `ENOENT`. The guide therefore says
"shadcn-svelte is initialised" and never asks the user to create `components.json`. The imported-stylesheet
condition is separate and documented, because an unimported file means the plugin never runs and the build
still passes. Versions: Tailwind 4, `init` unpinned, `add` pinned per decision 3, verified on SvelteKit 3.

### 2. Theme file

Fixed `src/daisyui-theme.css`, resolved as `resolve(process.cwd(), 'src/daisyui-theme.css')`, with no
override in v1. This supersedes ticket 02's sibling-of-module resolution.

Reasons: it matches the map's Destination; it is independent of where the stylesheet lives, which matters
because that path already varies by SvelteKit version; the harness confirms `process.cwd()` is the project
root during `vite build`; a stylesheet-relative path is impossible because a Tailwind plugin is not told
which CSS file loaded it; and sibling resolution dies if the adapter ships as an npm package, where the
module lives under `node_modules`. A plugin option (`@plugin "..." { theme: "..." }`) is the future
extension point, but it needs `plugin.withOptions` and a `css` params string containing braces, and neither
has been observed. Constraint for 08: the item must not install `src/daisyui-theme.css`, or `add -o`
overwrites the blocks the user just pasted.

Limitation: the supported invocation is a build or dev run started from the project root. Ticket 02 rejected
`process.cwd()` because Vite root is configurable, and that objection stands for a run whose process cwd is
not the project root. The failure is still visible, because the error names the path it tried, but such an
invocation is unsupported in v1.

### 3. Commands

```bash
# prerequisites, already done
pnpm dlx sv create my-app --add tailwindcss
pnpm dlx shadcn-svelte@latest init

# paste one light and one dark block from https://daisyui.com/theme-generator/
# into src/daisyui-theme.css

pnpm dlx shadcn-svelte@1.7.1 add \
  https://raw.githubusercontent.com/<owner>/<repo>/v0.1.0/registry/r/daisyui-adapter.json \
  -y -o

pnpm build
```

URL form: the full URL to the built item JSON, at a tag or commit SHA on `raw.githubusercontent.com`. The
concrete path and `v0.1.0` in the example are placeholders; 17 owns the tag policy and the file layout.
Reasons: 1.7 has no `@scope/name` lookup, and a bare name only resolves against the `registry` field in
`components.json`, which must stay on shadcn-svelte.com or `add button` breaks. A repository or `blob/` URL
returns HTML, which `response.json()` cannot parse; raw serves the JSON as `text/plain`, which parses
(`raw-url-probe.txt`). `main` is rejected because every install runs fresh and a moving URL is a
supply-chain hole. The repo must be public, since the CLI has no token support. `-o` is mandatory (ticket
20's hang) and `-y` keeps the rest non-interactive. Paste precedes `add` so the first build after install
passes. Ticket 17 owns the final host, tag and path; the URL shape (a raw item JSON URL) does not change.

### 4. Output

Install prints only the CLI's own lines: `<item name> installed at <item name>`, then, when the item
declares dependencies, `Installing dependencies with pnpm...` and `Successfully installed dependencies`,
then `Success! Components added.` For the contract item that reads `daisyui-adapter installed at
daisyui-adapter`; `add-install.log` shows the pattern with the probe item (`theme-probe`), since the fixture
is not published under the final name. The `docs` field is never read, so the adapter cannot print at
install time. The build is silent on success.

A missing or malformed theme file fails the build with ticket 02's E1/E2/E3 text. Through Vite's wrapper the
user sees `[plugin @tailwindcss/vite:generate:build] <css file>`, then the adapter message with the absolute
path and the generator URL, intact. There is no warning comment in the CSS: the CLI's `css` merge handles
at-rules, selectors and declarations only, so a comment key is serialised as a selector, and a plugin cannot
write the source file. The "did it install" check is `rg "@plugin" src/app.css` (or the project's stylesheet),
documented by ticket 18. No success log at build time: it fires once per environment and the rendered UI is
the proof.

### 5. Absent theme file: fail the build

No graceful fallback. `add` runs no adapter code, so the first Tailwind compile is the only gate available.
Measured on the kept harness project: `pnpm build` exits 1 with E1, and `pnpm dev` starts, returns HTTP 500
on the first request, and prints the same message in the terminal. Stock step-4 tokens are not a neutral
fallback: daisyUI has no fallback for `--radius-*`, `--border`, `--depth` or `--noise`, so a partial theme
looks square and borderless, which reads as broken. Absence is a mistake, because the user just created the
file by instruction. A fallback would add a second path no harness run covers and would hide a wrong path or
a forgotten paste.

### Evidence

- `evidence/07-install-gate/add-install.log`: the item's `add` transcript, showing the CLI's only output.
- `evidence/07-install-gate/build-missing-theme.log`: build fails with E1 intact, exit 1.
- `evidence/07-install-gate/build-with-theme.log` and `probe-cwd.log`: build passes, the plugin runs with
  `process.cwd()` set to the project root.
- `evidence/07-install-gate/probe-sentinel.txt`: the plugin's `addBase` output reaches the compiled CSS as
  `--probe-theme-bytes:105`.
- `evidence/07-install-gate/dev-missing-theme.stderr.log` and `.stdout.log`: dev starts, first request is
  500, E1 printed.
- `evidence/07-install-gate/raw-url-probe.txt`: a raw GitHub URL serves JSON as `text/plain` and parses.
- `registry-07/`: the throwaway item and its built `r/` payload.

### Constraints this puts on 08

- The injected `@plugin` specifier must resolve from both `src/app.css` and `src/routes/layout.css`. One
  relative path cannot serve both (`./lib/x.js` versus `../lib/x.js`), so 08 chooses a bare specifier or a
  documented manual line for one layout.
- The item must not carry `src/daisyui-theme.css` as a file, or `-o` overwrites the user's theme.
- The install must work with the stylesheet path read from `components.json`, never assumed.

Lesson: A precondition placed in a phase that runs none of your code is not a gate; put it where the code executes.
Check: process - ticket 18's guide must name the build as the only gate and the `rg "@plugin"` check, and its code-review compares that against this Answer.
