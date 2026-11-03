# shadcn-svelte token inventory by style
Session IDs:
Lesson:
Check:

Type: research
Status: resolved
Blocked by: none

## Question

When a user finishes step 4 of the shadcn-svelte SvelteKit installation guide, what token set is actually in their CSS file, and how does it vary by style?

1. List every custom property in `:root`, in `.dark`, and in `@theme inline`, using the `mira` style as the reference (this repo's `src/routes/layout.css` is the current output, baseColor `olive`).
2. List the `--radius-*` scale and how each step relates to `--radius`.
3. Which tokens are colours, which are lengths, which are fonts.
4. Does `--destructive-foreground` exist? Which style-dependent keys appear or disappear across the shipped styles (`sera` and its siblings)?
5. Which token keys does the registry format's `cssVars` accept, and does it validate key names or pass arbitrary keys through?
6. Does the CLI write `cssVars.light` into an existing `:root` block or append a new one?

Sources: the shadcn-svelte repo on GitHub (the style and template files that produce `layout.css`, plus the docs at shadcn-svelte.com/docs/theming and /docs/installation/sveltekit), and this repo's own `src/routes/layout.css`.

## Output

Write findings to `.scratch/daisyui-adapter/research/03-shadcn-token-inventory.md`, ending with `## What this means for the adapter` (max 10 bullets). Then append a `## Answer` gist (max 10 lines) to this ticket file and set `Status: resolved`. Do not edit `map.md` or any other ticket.

## Answer

- `:root` = 32 keys: 18 core (`background`…`destructive`, `border`, `input`, `ring`), `chart-1..5`, `radius`, 8 `sidebar-*`. `.dark` = the same 31, minus `radius`.
- `@theme inline` = 40: `--font-sans`, `--font-heading` (literal), 31 `--color-*` (`var()` refs, `--color-sidebar` not `-background`), `--radius-sm|md|lg|xl|2xl|3xl|4xl`.
- Radius scale is CLI-hardcoded: 0.6 / 0.8 / 1 / 1.4 / 1.8 / 2.2 / 2.6 × `--radius`. Base colours ship `0.625rem`; the `default` preset leaves it, other presets override.
- Types: all keys are colours except `radius` (length) and the two `--font-*` (fonts, `@theme` only). `--destructive-foreground` does not exist.
- No keys are style-dependent: all 8 styles only carry `.style-<name> { .cn-* { @apply … } }`, no `:root`/`.dark`/`@theme`. Only `--font-heading` varies, and that is preset-driven (`sera` only).
- `cssVars` containers are fixed to `theme`/`light`/`dark`, but key names are unvalidated (`z.record(z.string(), z.string())`, schema `propertyNames: string`): arbitrary keys pass, values must be strings.
- `--` prefix is optional; `sidebar-background` maps to `sidebar`; HSL triplets get wrapped in `hsl()`, `oklch()` passes through. Non-colour values in light/dark only yield a no-op `--key: var(--key)`.
- `cssVars.light` merges into an existing `:root` (creates one only if the file has `@import`/`@theme`), overwriting existing declarations by default; same for `.dark`; `@theme inline` is upserted.
- This repo's `layout.css` is `sera` but `olive` + `emerald` + `manrope`/`playfair`, not `taupe`; key set identical.
