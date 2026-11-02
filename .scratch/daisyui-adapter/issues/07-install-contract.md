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

Rewritten 2026-10-29 for the pure CLI, decided in ticket 14. The 2026-10-28 answer described a
registry-item install through `shadcn-svelte add`. That path is retired for one measured reason: the
item is a static string, so it cannot read the stylesheet, and without reading it there is no way to
keep the project's own values as fallbacks (14, decisions 1 and 4). Everything the old answer
measured still explains the new one: `docs` prints nothing, `add` cannot write a comment, and `add`
needs `-o` because an item carrying `css` prompts.

The user's sequence is now two commands after the paste.

### 1. Prerequisite state

Unchanged from 2026-10-28. The contract starts after:

```bash
pnpm dlx sv create my-app --add tailwindcss
pnpm dlx shadcn-svelte@latest init
```

They leave `components.json` with `tailwind.css` pointing at the project's global stylesheet, and
that stylesheet imported by the root layout. The path depends on the SvelteKit version: `src/routes/layout.css` on SvelteKit 3, `src/app.css` on older projects. The adapter never hardcodes it; the
CLI reads it from `components.json` on every run.

The theme file may be pasted before or after `shadcn-svelte init`, because nothing in the shadcn flow
touches it. The only requirement is that it exists when the adapter command runs, if the user wants
the CLI to validate it.

### 2. Theme file

Unchanged: fixed `src/daisyui-theme.css`, resolved as `resolve(process.cwd(), 'src/daisyui-theme.css')`, no override in v1. It is input only: the CLI reads it to validate, the plugin reads it at
build to emit values, and neither writes it.

### 3. Commands

```bash
# 1. put one light and one dark block from https://daisyui.com/theme-generator/
#    into src/daisyui-theme.css

# 2. shadcn-svelte, as its guide says
pnpm dlx shadcn-svelte@latest init

# 3. the adapter, at an exact version
pnpm dlx <pkg>@<exact> init

pnpm build
```

No registry URL, no `-o`, no `add`. The adapter command:

1. reads `components.json` and resolves `tailwind.css`;
2. reads the stylesheet and keeps every `:root` and `.dark` declaration;
3. reads and validates `src/daisyui-theme.css` (one light block and one dark block, classified by `color-scheme` per 02);
4. writes a header comment, the `@plugin "<pkg>";` line after the last `@import`, an empty `daisyui-adapter.overrides.css` beside the stylesheet plus its one import line, and 32 bindings per block in the shape `var(--daisy-color-<source>, <the value that was in the file>)`;
5. installs `<pkg>` as a devDependency at the CLI's own version, so the `@plugin` line resolves at build.

Reasons for `dlx` at an exact version rather than a moving tag: every install runs fresh, and the
header comment, the bindings and the plugin must come from one version. `<pkg>` and the exact number
are 17's; the shape is fixed here.

Measured on the probe CLI (`registry-14/probe-cli/init.mjs`) in seven harness runs: the first run
writes 32 + 5 declarations per block and installs the package; a second run is byte-identical; a
later `shadcn-svelte init` wipes the values but keeps the comment and the import; a re-run restores
the bindings with the post-init values as fallbacks; `add -a` afterwards is byte-identical; deleting
the theme then building renders the project's own palette.

### 4. Output

The CLI is the first place in the whole design that can talk to the user, because it runs before the
build and owns the write. It prints, in order:

- `theme ok: light + dark`, or the E1/E2/E3 text from ticket 02 with the absolute path and the generator URL;
- the stylesheet it wrote (`src/app.css` or `src/routes/layout.css`, read from `components.json`);
- `32 light, 32 dark`, so a stylesheet that matched no block is visible;
- the override file it created, or that it left an existing one untouched;
- the package and version it installed.

The build stays silent on success, as before. The header comment is the durable marker (decision 5 of
14): `/* daisyui-adapter <version> | re-run ... after shadcn-svelte init */`. `add` could not write a
comment; the CLI can, and the comment survives both `shadcn-svelte init` and `add button` (measured).
17 pinned the exact version in that recovery command (`pnpm dlx <pkg>@<version> init`) and replaced the
placeholder package name with the published one.

### 5. Missing theme degrades, malformed theme fails

Split, because the two states need different behaviour:

- **Missing** (no `src/daisyui-theme.css`): the CLI prints a warning and continues, and the plugin
  emits nothing at build. The bindings' fallbacks are the project's own pre-adapter values, so the
  page renders exactly as it did before the adapter ran. Measured: build passes, every token falls
  back, including the derived ones through one helper variable per key. The five chart rows take the
  same shape, with the project's own row in the fallback slot ([ticket 21](21-chart-no-theme-fallback.md)
  found that they did not, and a theme present at `init` then absent at build left them painting
  nothing).
- **Malformed** (a block that is not a valid v5 theme pair): the CLI prints E2/E3 and exits non-zero,
  and the plugin throws at build if the file is malformed by then. Absence is a state a later paste
  fixes; malformation is a defect that would otherwise render wrong colours silently.

This supersedes the 2026-10-28 "fail on both": the fallback is now the user's own value rather than a
neutral literal, so degrading is honest. The old objection (a second path nobody tests) is answered by
`evidence/14-override-rerun/cli-missing-theme-daisy/`, and the raw-name variant that silently breaks
(`cli-missing-theme/`) is why the fallback shape uses the prefixed namespace.

### Evidence

- `evidence/14-override-rerun/cli-init/`: one CLI run, the written file, the installed package.
- `…/cli-rerun/`: two consecutive runs, byte-identical.
- `…/cli-lifecycle/`: CLI, CLI, `shadcn-svelte init`, `add button`; the comment and the import survive, the bindings are wiped by init and restored by the next run.
- `…/cli-missing-theme-daisy/`: theme deleted, build passes, the page renders the pre-adapter palette.
- `…/cli-missing-theme/`: the same with raw `--color-*` names, which fails through a cycle with `@theme inline`.
- `…/cli-after-init/`: init then the CLI, with the post-init values as fallbacks.
- `registry-14/check.mjs`: 89 checks over the committed copies.

The retired `add` measurements remain in `evidence/07-install-gate/`; they explain why `docs` is
silent and why `add` needed `-o`.

### Constraints this puts on later tickets

- 16: the plugin emits `--daisy-color-*` and `--daisy-radius` from the theme, emits nothing when the
  file is absent, and throws E2/E3 when it is malformed.
- 17: publish one npm package with the `init` bin at an exact version; there is no registry item and
  no static JSON host.
- 18: document two commands, the header comment as the version marker, the override file the CLI
  creates, and that `-o` and the registry URL are gone.

Lesson: An install step that cannot read the project cannot preserve it, so the fallback it ships is always someone else's value.
Check: code - registry-14/check.mjs asserts the CLI writes the file's own `oklch(0.508 0.118 165.612)` as the fallback and that deleting the theme renders that same value.
