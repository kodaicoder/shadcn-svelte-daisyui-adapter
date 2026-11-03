# Cascade policy

Type: grilling
Status: resolved
Blocked by: 04, 05, 20

## Question

Who wins when the generated bindings meet the step-4 defaults?

The trap: shadcn step 4 leaves tokens unlayered in `layout.css`. A Tailwind plugin's `addBase` emits into `@layer base`, and unlayered rules beat layered rules regardless of specificity. Ticket 04 found that `cssVars` overwrites tokens inside the existing `:root` block, which avoids the trap without any appended rule. Verify that reasoning and decide the rest.

Decide:
1. Do the token bindings ship as `cssVars` (in-place overwrite of `:root`/`.dark`) or as appended unlayered rules? Justify against ticket 04's merge behaviour.
2. Whether the user must change their own file at all. If not, say so, and delete the old "wrap in `@layer base`" idea from the plan.
3. What happens on a later `shadcn-svelte init` that rewrites the CSS file, and on `add -a` after the adapter. Does the adapter survive, get duplicated, or get wiped?
4. Whether the plugin's own output (`--daisy-*`) can collide with the user's tokens, and what namespace guarantees separation.
5. Where the scrim and sonner declarations from ticket 19 land under this policy.

Depends on tickets 04 and 05. This is the highest-risk decision on the map.

## Answer

Resolved 2026-10-28. Five decisions. Behaviour that mattered was run, not read: the fixture is
`registry-13/`, and the cited artefacts are copied to `evidence/13-cascade-policy/` from six harness
runs, because `harness/runs/` is gitignored. Every run installs into a project holding a real
two-block theme (`registry-13/probe-theme.css` placed at `src/daisyui-theme.css`) on `--layout app`,
and every check below is re-run by `registry-13/check.mjs` against the committed copies
(`check.txt`, 35 checks, all pass).

### 1. Carrier: `css` maps for `:root` and `.dark`, not `cssVars`

The item's `css` carries two declaration maps, `":root"` and `".dark"`, each holding the 32 shadcn
keys with the mapping's expressions (09's core table; chart and sidebar are placeholders until 12
and 10), where every `--daisy-<source>` is written as `--daisy-color-<source>` (`--daisy-radius` for
radius). One command rewrites the stock blocks in place: 63 declarations are replaced, and
`--radius` is inserted into `.dark` because step 4 declares it only in `:root`.

Reasons:

- `update-css.ts` calls `processRule` for a selector key, which finds the exact `:root` or `.dark`
  child and `replaceWith`s each declaration (read from source). The installed CSS shows the result:
  one block each, one declaration per token, no appended rule, and `@theme inline` byte-identical
  (`re-add`, `check.txt` C).
- The plugin cannot do this itself. Its `addBase` declarations land in `@layer base`, and a value it
  writes for a token name loses to the user's unlayered `:root`. In `cascade-raw` the compiled base
  layer carries `--primary:red` and `--primary:#0f0`, while the computed `--primary` stays the
  step-4 `oklch(0.508 0.118 165.612)` / `oklch(0.432 0.095 166.913)`.
- `cssVars` also wins at runtime, but it rewrites `@theme inline` with one self-referential dead
  entry per colour key: 31 entries measured in `cssvars` (`--primary: var(--primary)` and so on),
  because `isColorValue()` sees neither a literal colour nor the exact substring `--color-` in
  `var(--daisy-color-primary)` (the name has a single dash before `color`). `radius` takes the CLI's
  separate branch and adds none. `css` leaves that block untouched.
- Both carriers are unlayered, so neither depends on layer order. The difference is what else each
  one rewrites.

Cost, stated plainly: the `css` lookup is a direct-child exact-selector match, not `walkRules`. The
documented precondition is stock step 4, whose selectors are exactly `:root` and `.dark` on both
layouts (08). A stylesheet that combines selectors or nests them in a layer would get both blocks
appended at the end instead. Key order `:root` then `.dark` keeps dark correct even then, but the
source gains a duplicate light block. That fallback is read from `update-css.ts` and was not run, so
it is not claimed as proved.

### 2. The user edits nothing

One `add <url> -y -o` after pasting the theme does the whole job. No wrap, no manual declaration, no
second file. The old "wrap the generated bindings in `@layer base`" idea is deleted: unlayered beats
layered, so wrapping would guarantee the bindings lose, which is exactly what `cascade-raw` measured
for plugin `addBase` output.

`-o` stays mandatory. The item carries `css`, so `add` prompts to rewrite the stylesheet, and `-y`
does not answer that prompt (20's hang).

### 3. Lifecycle: `add -a` and `add <component>` are safe, `init` wipes values

- Same item again: byte-identical stylesheet (`re-add`, C).
- `add -a`: byte-identical, build passes, tokens still the theme values (`add-all`, E).
- `add card`: byte-identical, build passes (`add-component`, F).
- `init --preset a0`: structure survives, values are wiped (`init`, D). One `@plugin` line after the
  last import, one `:root` and one `.dark`, the probe's unlayered selector rule intact, no duplicate
  import. 63 of the 64 `var(--daisy-*)` declarations become preset literals; the survivor is
  `--radius` in `.dark`, the one declaration the adapter inserted rather than replaced. The fetched
  preset item (`/init?preset=a0`) has 32 light keys and 31 dark keys, with no dark `radius`, so the
  declaration the adapter inserted is the one the preset never writes. The recovery is measured in
  the same run: after the original `add` command runs again (`css-after-then-2.css`), the 64
  bindings are back, one `@plugin` line and one block each remain, and the runtime follows the theme
  in both schemes.
- Operational note for 18: a non-interactive `init` also needs `--lib-alias`, `--components-alias`,
  `--ui-alias`, `--utils-alias` and `--hooks-alias`, or it prompts for each alias.

### 4. Namespace: `--daisy-` in front of daisyUI's own name

The plugin emits `--daisy-color-<daisyUI source>` for the 20 colour variables and `--daisy-radius`;
the `css` maps reference exactly those. In `re-add` the literal values sit in `@layer base`, and the
unlayered `--primary: var(--daisy-color-primary)` resolves them in both schemes. Layering is
irrelevant for the referenced name, so uniqueness is the only requirement.

The 20 sources are the theme block's `--color-*` names, for example `base-100`, `base-content`,
`primary` and `primary-content`; the probe emits them all, with no shadcn key list inside the
plugin. The mapping from shadcn key to source lives in the item's `css`, so 09-12's table is reused
verbatim with the prefix swap.

Why this name: it reads as daisyUI's `--color-primary` with a vendor prefix. It avoids every shadcn
token name, the `--color-*` theme namespace, daisyUI's own `--color-*` / `--size-*` / `--radius-*`,
and Tailwind's `--tw-*`. A user who declares `--daisy-color-*` themselves overrides the adapter by
design, because their declaration is unlayered; 18 documents that as the escape hatch.

### 5. Scrim and sonner contribute no adapter output

- Scrim: the four overlays keep `bg-black/20`. The shipped item (17) carries no patched files, no
  selector rule and no `--overlay` token; the probe fixture carries one `[data-slot="button"]` rule
  only to measure the mechanism. An unlayered selector rule beats a `@layer utilities` utility in
  both schemes (measured), all four overlays expose a stable slot (read from
  `dialog-overlay.svelte`, `alert-dialog-overlay.svelte`, `sheet-overlay.svelte` and
  `drawer-overlay.svelte`, not rendered), and the rule survives `init` and `add -a` (measured). A
  rule that restates black/20 changes nothing, so 19 closes with no work.
- Sonner: nothing. 20's control removed the six plain `--color-*` declarations and the toast still
  resolved. The stock `@theme inline` supplies the three names at build time and is load-bearing for
  `@apply border-border`.

### Evidence

- `evidence/13-cascade-policy/cascade-raw/`: run.json, add-install.log, css-before/after,
  compiled-global.css, compiled-sentinel.txt, build.log, render.json. The compiled base layer has
  `--primary:red` / `#0f0`; the computed `--primary` is step-4.
- `…/cssvars/`: the same source and runtime files, without a compiled copy. The 31-entry difference
  is asserted by `check.mjs` against `css-before.css` and `css-after.css`.
- `…/re-add/`: idempotency, in-place replacement, `@theme` untouched, unlayered binding, selector
  beats utility.
- `…/init/`: `css-after.css` (adapter), `css-after-then-1.css` (after init) and
  `css-after-then-2.css` (after the recovery add), with `then-1.log` and `then-2.log`.
- `…/add-all/` and `…/add-component/`: byte-identical after-then snapshots.
- `…/check.txt`: `registry-13/check.mjs` against the committed copies, 35 checks.
- `registry-13/`: registry.json, probe-theme.css, the probe package, the built `r/` payload and
  `registry-build.log`.

Harness change: `harness/run.mjs` gained `--then` (a repeatable post-add pnpm command, whitespace
split, each run snapshotting the stylesheet) and `--props` (runtime custom properties to read);
`harness/shot.mjs` reports them. Both are ticket 15's harness, extended the way 08 extended it.

### Not proved here

- The append fallback for a stylesheet whose `:root` / `.dark` selectors are not exact: read from
  `update-css.ts`, not run.
- A published package name: the probe installs a `file:` tarball; 17 publishes.
- The adapter's real mapping values: 09-12 own them. The fixture's core values are 09's expressions
  with the prefix; its chart and sidebar values are placeholders because 12 and 10 own those.
- That the four overlay slots render, or that a scrim rule wins on them: the selector-versus-utility
  measurement uses `[data-slot="button"]`, and the overlay slots are read from the component source.

### Constraints this puts on later tickets

- 16: emit `--daisy-color-<daisyui-name>` and `--daisy-radius` from `addBase`, from one list shared
  with the item's `css` keys.
- 17: the item carries `css` maps keyed `":root"` and `".dark"` whose property names include the `--`
  prefix. `registry build` does not validate them: a key written the `cssVars` way (`primary`, no
  prefix) silently becomes the invalid property `primary: …`.
- 18: document `-y -o`, the re-add after `init`, the five alias flags for a non-interactive `init`,
  and `--daisy-color-*` as the override hook.
- 19: no work. Record the scrim decision and that sonner needs nothing.

Lesson: A mechanism chosen for its headline effect hides its side effects; two carriers can share the cascade outcome and differ in what else they rewrite.
Check: code - registry-13/check.mjs keeps both carriers side by side, asserting cssVars leaves 31 self-referential @theme entries and css leaves @theme inline byte-identical while both bind at runtime.

## Amendment (ticket 14, 2026-10-29): the writer is the CLI

All five decisions stand. What changes is who performs the write: the adapter CLI (07 and 08, rewritten
the same day) replaces `add`, because the CLI can read the stylesheet and the item cannot. Nothing in
the cascade policy moves.

- The carrier is still the `css` maps keyed `:root` and `.dark`, rewritten in place: 63 stock
  declarations replaced and `--radius` inserted into `.dark`, with `@theme inline` untouched.
- The namespace is unchanged: `--daisy-color-<daisyUI source>` plus `--daisy-radius`. Ticket 14
  measured why the raw `--color-*` names cannot carry the fallback: `@theme inline` emits
  `--color-primary: var(--primary)`, so a binding written as `--primary: var(--color-primary, …)` is a
  cycle, computes to `""`, and ignores the fallback (`evidence/14-override-rerun/cli-missing-theme/`).
- `add -a` and `add <component>` still leave the stylesheet byte-identical after the CLI wrote it
  (13 measured; 14 re-measured `add button` after `shadcn-svelte init` in `cli-lifecycle/`).
- A later `shadcn-svelte init` still wipes the values and keeps the `@plugin` line; the recovery is now
  `daisyui-adapter init` again, which re-binds with the post-init values as fallbacks
  (`evidence/14-override-rerun/cli-after-init/`).
- Decision 3's "the original `add` command restores them" becomes "the original CLI command restores
  them". The measured facts from 2026-10-28 are unchanged for a project that also runs `add`.
- Read three sentences in the 2026-10-28 Answer as history: "One `add <url> -y -o` … does the whole
  job", "`-o` stays mandatory", and "no … second file". The first two describe the retired writer. The
  third meant no second file for the install; 14's override file is the deliberate second step and is
  empty until the user edits it, so the base install still needs no user edit.
- The constraint to 18 reads "`--daisy-color-*` as the override hook". 18 documents the file as the
  hook; `--daisy-color-*` is the source-level variable a user may set inside it, alongside the
  shadcn token itself (`--primary`) when the derived expression is what they want to change.

