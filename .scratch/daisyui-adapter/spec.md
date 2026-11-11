# Fix phase: apply the 0.3.0 mapping to the components

Status: ready-for-agent
Type: spec
Date: 2026-11-03
Feature: daisyui-adapter
Decisions: `docs/adr/0001-brand-secondary-accent.md`, `docs/adr/0002-radius-roles-and-sizes.md`, `docs/adr/0003-component-fixer-in-the-package.md`
Glossary: `GLOSSARY.md`

## Problem Statement

The 0.3.0 brand mapping gives the stylesheet the right tokens, but the components still look pre-adapter. The radii stay square while `--radius` is not zero. The status colors (`success`, `warning`, `info`) have no tokens, aliases or variants. The combined `outline-*`, `ghost-*` and `link-*` tone variants do not exist. The destructive button is a soft tint, not the daisyUI error button. Ten component pairings fail WCAG AA, including the dialog and sheet close button in dark and the calendar hover in light. A project that installs the adapter has to hand-edit classes and variants to get the theme it asked for, and there is no single command that applies both the mapping and the component repairs.

The new variants add a second gap. Their outline, ghost and link presentations paint the tone itself as text and border. Measured with the fixed status fallbacks and the light-blue/dark-blue `base-content` values, the light-page pairs are `success` 2.52, `warning` 1.95 and `info` 2.22, and the dark-page destructive pair is 2.89, so the AA promise does not hold for those presentations. The filled variants pass the text pair but the status fill against the light page is only 1.95 to 2.52, below the 3:1 component boundary; the destructive fill against the dark page is 2.89. The fixer also has no state model: a file it already fixed no longer matches the stock string, so a stock-only matcher would report every fixed file as customized and lose idempotency. The stock strings are tied to a shadcn-svelte version and the `mira` style, and the spec does not name either. The release waits for a visual check that the spec does not define, while the Storybook showcase is a separate feature. Finally, a stylesheet written by 0.3.0 before and after the fixer looks identical, so the header cannot say whether the components were fixed.

## Solution

Ship one release, still numbered 0.3.0, that:

- adds eleven bindings: the seven status tokens (`success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`, `destructive-foreground`) and four text tones (`success-text`, `warning-text`, `info-text`, `destructive-text`), with their `@theme inline` aliases;
- uses the text tones for every outline, ghost and link text and border, and adds the text-tone border to the filled status and destructive variants so the component boundary clears 3:1;
- applies the daisyUI radius roles to the components, with the shadcn size scale choosing the step;
- adds the tone × presentation variants to button, badge, alert and bubble, and makes the destructive button base filled;
- repairs the ten contrast pairs to AA, keeping the sidebar accent neutral;
- publishes `component-fix.mjs`, with a four-state model, a stock version guard, a target manifest, `--dry-run`, `--check` and `--strict`;
- defines the visual check as the harness screenshots plus a short manual checklist;
- records the fixer state in the header marker.

The workflow becomes: `shadcn-svelte init`, `shadcn-svelte add <components you use>`, then the adapter `init`. The result is a themed project at AA for the repaired and text-tone pairs, with the daisyUI radius and brand colors, and no hand edits.

## User Stories

1. As a SvelteKit developer, I want to run `shadcn-svelte init`, add the components I use, then `adapter init`, so that my stylesheet is mapped and those components are fixed in one step.
2. As a SvelteKit developer, I want `adapter fix` after I add a component, so that the new component gets the same fixes without rewriting the whole stylesheet.
3. As a SvelteKit developer, I want `adapter fix button`, so that I can repair one component.
4. As a SvelteKit developer, I want `--dry-run`, so that I can see which files and classes would change before writing.
5. As a SvelteKit developer, I want `--check`, so that CI fails only when a component still holds a stock class, not when it is fixed, customized or absent.
6. As a SvelteKit developer, I want `--strict`, so that a customized site or a missing component I named becomes an error while a target I never added stays silent.
7. As a SvelteKit developer, I want the fixer to be idempotent, so that a second run leaves every file byte-identical.
8. As a SvelteKit developer, I want the fixer to tell me whether a component is missing, stock, already fixed or customized, per replacement site, so that one hand-edited class does not hide or block the other fixes in the same file.
9. As a SvelteKit developer, I want the fixer to refuse a style or shadcn-svelte version it does not support, with a clear message, so that a silent skip never leaves me with a half-themed project.
10. As a SvelteKit developer, I want `--secondary` and `--accent` to use the daisyUI brand colors, so that the UI matches the theme instead of a neutral surface.
11. As a SvelteKit developer, I want `success`, `warning` and `info` tokens and aliases, so that I can use `bg-success`, `text-warning` and their foregrounds.
12. As a SvelteKit developer, I want the outline, ghost and link variants to use a text tone that meets AA on the page, so that a success or warning text is readable in both schemes.
13. As a SvelteKit developer, I want the filled status and destructive variants to carry the text-tone border that gives the component a 3:1 boundary, so that the button is identifiable even though its fill alone is lighter than 3:1.
14. As a SvelteKit developer, I want `destructive-foreground`, so that a filled destructive button is readable.
15. As a SvelteKit developer, I want the destructive button base to be filled, so that it matches the daisyUI error button rather than a soft tint.
16. As a SvelteKit developer, I want `outline-*`, `ghost-*` and `link-*` combined tone variants, so that I can choose the color and the presentation independently.
17. As a SvelteKit developer, I want status variants on button, badge, alert and bubble, so that each component can show success, warning and info.
18. As a SvelteKit developer, I want the component radii to follow the daisyUI roles and the component size, so that buttons and cards are not square when the theme has a radius.
19. As a SvelteKit developer, I want the radius scale to stay non-negative and ordered at `--radius: 0` and at a large radius, so that the theme's choice is not silently lost.
20. As a SvelteKit developer, I want the circles and edge-joining classes to stay as they are, so that avatars, radio buttons and button groups still look right.
21. As a SvelteKit developer, I want the dialog and sheet close buttons, the calendar hover, the range middle and the destructive menu shortcuts repaired, so that their text is readable in both schemes.
22. As a SvelteKit developer, I want the chart tooltip and the muted bubble surface repaired, so that their surfaces are consistent with the rest of the theme.
23. As a SvelteKit developer, I want the sidebar accent to stay neutral, so that the sidebar does not turn brand-colored.
24. As a SvelteKit developer, I want the header marker to record the adapter version and the number of fully fixed components, so that I can tell whether the components were fixed and by which version.
25. As a SvelteKit developer, I want the docs to describe the `add` prerequisite and the `fix` order, so that I know the workflow.
26. As a design-system maintainer, I want the fixer to read one target manifest, so that the components, the contrast pairs and the supported version cannot drift apart.
27. As a design-system maintainer, I want `init` to warn when a theme's own content colors make a pair fail, so that AA is not claimed for a theme it cannot hold.
28. As a design-system maintainer, I want the smoke and harness tests to cover the map, the fixer states, the custom alias, the add-after-init case, the overwrite case and the radius edges, so that a regression cannot ship.
29. As an operator, I want the harness to keep light and dark screenshots and a short manual checklist, so that I can perform the visual check without waiting for the Storybook showcase.

## Implementation Decisions

**Tokens**

- The four text tones are `color-mix(in oklch, var(--<tone>) 40%, var(--foreground) 60%)`. At 40/60 the measured light pairs are `success` 8.30, `warning` 6.91, `info` 8.24 and `destructive` 13.49; the dark pairs are 11.28, 13.00, 11.88 and 8.24. Those numbers were measured with the fixed status fallbacks and the light-blue/dark-blue `base-content` values (`oklch(20% 0.09 240.876)` and `oklch(92% 0.006 264.531)`). A project whose tone or foreground differs gets different values; `init` recomputes the matrix and warns. The raw tone as text measures 2.52, 1.95, 2.22 and 6.52 on light, and the destructive 2.89 on dark, so the raw tone stays a fill and never a text token.
- The seven status tokens keep the fixed fallbacks: `success` `oklch(69% 0.17 162.48)`, `success-foreground` `oklch(26% 0.051 172.552)`, `warning` `oklch(79% 0.184 86.047)`, `warning-foreground` `oklch(28% 0.066 53.813)`, `info` `oklch(74% 0.16 232.661)`, `info-foreground` `oklch(29% 0.066 243.157)`, `destructive-foreground` `oklch(97% 0.013 17.38)`. A text tone falls back to its status fallback mixed with the project's own foreground, so the no-theme state is still readable.
- Each of the eleven tokens gets a `@theme inline` alias: `--color-success`, `--color-success-foreground`, `--color-success-text`, and the same for warning, info and destructive.
- The smoke's declaration count is the non-derived declarations per block. It is 32 today: 27 binding keys (23 single and 4 mix) plus the 5 chart rows. The four mix keys and the five chart rows also write nine derived helpers, which the count excludes; the 0.2.0 "five derived helpers" figure was its mix count and is superseded by this breakdown. The change adds 11 non-derived declarations (7 status and 4 text) to 43 and four derived text helpers, so the derived count becomes 13. The chart rows and their five helpers are unchanged. The smoke asserts 43.
- The filled status and destructive variants carry the text-tone border in addition to the fill and the foreground. The border uses the same `--<tone>-text` token as the text; no separate border tone is introduced. The fill-vs-page pair itself stays below 3:1 for the light status tones (1.95 to 2.52) and for the dark destructive tone (2.89); the border-vs-page pair measures 8.90 to 10.37 on light and 8.24 to 9.68 on dark. The component boundary is the border, not the fill; the matrix records both and the warning checks the border pair.
- The raw tone remains available as `bg-*`; the docs say to use the text alias for text. The `init` output warns when a theme's own tone or content makes a filled or text pair fall below its threshold.

**Radius**

- The role chooses the scale step: selector to `--radius-sm`, field to `--radius-md`, box to `--radius-lg`.
- The component size shifts the step: xs, sm, icon-xs and icon-sm to sm; default, md and icon to md; lg and icon-lg to lg; larger sizes follow the scale.
- All size-bearing components use the size step: button, toggle, item, attachment, select, native-select, switch, input-group-button, input and textarea. `input` and `textarea` take `size: 'sm' | 'default' | 'lg'` and set `data-size`; `native-select` keeps `sm` and `default` and gains `lg`. A field size maps to the radius step as `sm` to `sm`, `default` to `md` and `lg` to `lg`.
- The field size sets the box and the text together. `sm` is `h-6` with 12 px text and the `sm` radius; `default` is `h-7` with 14 px text and the `md` radius; `lg` is `h-8` with 16 px text and the `lg` radius. A textarea has no fixed height: its `min-h` is 3rem at `sm`, 3.5rem at `default` and 4rem at `lg`, and `field-sizing-content` still grows it. The `default` text is 14 px at every width: the stock `text-sm` is kept and its `md:text-xs/relaxed` override is removed so the 12/14/16 scale is explicit.
- The four existing scale sites (calendar head cells and selects, chart tooltip) are aligned to their role.
- `rounded-full` circles, edge-joining utilities and the calendar `--cell-radius` custom property are excluded from the blanket replacement.
- The three daisyUI role values collapse into the shadcn scale, which derives from the box rung. This is a deliberate loss: a theme whose field and selector rungs differ from its box rung is approximated. ADR 0002 records the trade-off.
- The scale is linear in `--radius`: sm 0.6, md 0.8, lg 1.0, xl 1.4, 2xl 1.8, 3xl 2.2, 4xl 2.6. At `--radius: 0` every step is zero; for any positive radius sm < md < lg. There is no clamp in the scale; the adapter passes the theme's length unchanged. `--radius` is read as a CSS length; `init` warns when it exceeds 2rem, comparing after converting to px at 16px per rem (32px), and prints the raw length and the px value, because the components become pill-like and the theme is likely wrong. The tests assert the order except at zero and the warning at the 2rem edge. The `--size-field` and `--size-selector` mappings remain out of scope.

**Variants**

- The component API keeps one `variant` prop. The combined values are literal keys on a tone × presentation table: the four tones (`destructive`, `success`, `warning`, `info`) times the presentations a component supports (`outline`, `ghost`, `link`), plus the filled tone keys.
- Every class string is literal in the `tv` config; no class is assembled at runtime, because Tailwind only scans literal names. The table is the single source for the button, badge, bubble and alert strings.
- Button gains the three status tones plus outline, ghost and link for the four tones; the destructive base becomes filled.
- Badge gains the three status tones plus the three presentations for the four tones.
- Bubble gains the three status tones plus outline and ghost for the four tones; it has no link presentation.
- Alert gains the three status tones; it has no outline, ghost or link presentation.
- `code-block` status variants remain out of scope.

**Field variants**

- `input`, `textarea` and `native-select` take the same `variant` prop with the seven tone keys. The tone sets the border colour in the idle and the focused state, and the focus ring colour. The border keeps its width and shows the tone at 70 percent when idle and at 100 percent on focus; the ring keeps its 3 px width and its 30 percent alpha.
- The border token is the raw tone for `secondary`, `warning` and `destructive`, the text tone for `success` and `info`, and `primary` for `default`. The ring uses the raw tone at 30 percent, so `default` is `primary/30` and matches the stock ring because `--ring` is primary.
- The invalid state keeps the destructive border and ring on top of the tone, at the same 3 px ring width. A tone never replaces the error signal.
- A disabled field shows `not-allowed` and paints no hover, so the pointer-events guard that hid the cursor is removed from `input` and `native-select`.
- A readonly field stays focusable, so a keyboard user can select and copy, and is told apart by a muted surface and `cursor: default`.
- The seven rows are literal strings inside each fixed copy, generated by the adapter table, so Tailwind emits every row.

**Contrast**

- The repaired pairs are the ten from the audit: dialog and sheet close, calendar and range hover, range middle, destructive shortcuts, chart tooltip and muted bubble.
- The variant matrix adds every text, border and filled pair for the four tones in both schemes. The text-tone pairs pass at 40/60; the filled text passes; the filled fill against the page is recorded as a known limit for the light status tones and the dark destructive tone; the border pair is the component boundary and the warning checks it.
- The matrix is computed from the theme at `init`; a pair below its threshold produces a warning, not a failure, because the theme's own content colors decide the outcome. The warning names the pair and the measured ratio.
- The fixed fallbacks make the no-theme state readable; the theme-dependent pairs are reported.
- The ten repaired pairs and the four text-tone pairs meet AA at 4.5 for text. The filled fill-vs-page pair is not claimed as repaired; the component boundary is the text-tone border, which clears 3:1, and the matrix records the fill pair as a known limit.

**Component fixer, version and style**

- The fixer has four states per replacement site: `missing` (no file), `stock` (the stock string matches), `fixed` (the fixed string matches) and `customized` (neither matches). It applies `stock`, leaves `fixed`, reports `customized` and applies the other sites in the same file. A second run is byte-identical.
- The supported stock is shadcn-svelte 1.7.x. The stock strings come from the repo's pinned components; nine of the eleven sites are identical across every 1.7.x style, so the style label is not checked and an unmatched style only reports `customized`. The fixer reads the installed shadcn-svelte version and exits with a clear message when it is outside 1.7.x; a version it cannot read warns and continues, because shadcn-svelte is usually run through `dlx`.
- The repo's CI runs a drift test against the pinned stock components. A change to a pinned component file or to the manifest fails that test in the repo CI, so the committed snapshot and the manifest cannot drift apart; a dependency update enters through that snapshot. The test reads the installed version when `node_modules` exists and the `package.json` range otherwise. The user's machine gets the runtime guard only; a supported-range patch with a changed class is caught when the repo's pin moves, not on the user's machine.
- One target manifest holds the component list per fix, the ten contrast pairs with their token names and thresholds, and the supported version. The fixer and the tests read the same manifest.
- `init` runs the map and then the fixer over the components the project has added. `fix` runs every present target component; `fix <component>` runs the named ones; `--dry-run` reports without writing. `--check` exits 0 when every present site is fixed, customized or a component that was never added, and non-zero only when a stock site remains. A version refusal is the exception: it exits 1 before the report, because the fixer cannot vouch for stock it does not support. `--strict` turns a customized site and a missing component that the user named on the command line into an error; a target that was never added is not an error.
- The fixer reads the `components.json` aliases, normalizes CRLF and Windows paths before matching, and reports the four states per file and per site.
- When no target component is present, `init` maps the stylesheet, reports that no components were found and exits zero. It does not create an empty component.
- The CLI also updates the header marker after the fixer: `/* <pkg> <version> | components <n> fixed | re-run ... */`, where `n` is the number of target component files whose every replacement site is in the fixed state, not the files changed in the run. A file with a mix of fixed and customized sites is reported as mixed and is not counted. A second `fix` that changes nothing keeps the same `n`, so the re-run stays byte-identical. A map-only run records `components 0 fixed`. The pre-fixer 0.3.0 is a development state; the first published 0.3.0 includes the fixer and the marker.
- The version stays 0.3.0. The 0.2.0 is the published predecessor; the 0.3.0 before the fixer is not published. The marker, not a prerelease, distinguishes the states.

**Workflow and visual check**

- The install contract changes: the project adds the components it uses before `init`. The README, CHANGELOG and header describe the order.
- The visual check is the harness's light and dark screenshots plus a short checklist: the ten repaired pairs, the four tones in every presentation, the filled border, the radius on the button, card and input, and the destructive base. The Storybook showcase is the next feature and is not part of this release.

## Testing Decisions

- The highest seam is the existing harness: a fresh SvelteKit project, `shadcn-svelte add` the target components, the adapter `init`, then a build and render in both schemes. It keeps the screenshots and the checklist evidence. This is the one integration seam.
- The fixer gets a unit seam: a temporary copy of the stock components from the repo, one run, then assertions on the replaced classes, the four states, the per-site behavior, the idempotent second run, the custom alias, the CRLF input and the no-components case.
- The extra cases are: add a component after `init` then run `fix`; edit one class by hand and confirm the other sites still apply; set a custom alias in `components.json`; let `shadcn-svelte add` overwrite a fixed file and confirm the next `fix` restores it; run `--check` and `--strict`; confirm `--check` exits 0 for fixed, customized and never-added components and non-zero only for a stock site; confirm the header keeps the same fixed count on a no-op `fix`.
- The map keeps its existing smoke seam: 43 non-derived declarations, 11 aliases, the fixed status fallbacks, the four text tones, the radius and variant classes, the header marker and the byte-identical re-run.
- The contrast matrix is computed from the theme and the fixed fallbacks with the existing ramp helpers. It records the fill-vs-page pair as a known limit, checks the text and border pairs, and reports the reference inputs (the fixed status fallbacks and the light-blue/dark-blue `base-content`). The harness screenshots confirm the painted result. The radius edges are tested at zero and at a large value, asserting sm < md < lg except at zero and the 2rem warning.
- The target manifest is read by the fixer and the tests; a version mismatch fails the test before it reaches a user. The drift test runs in the repo CI against the pinned stock components.
- The Storybook showcase is the visual seam for the next feature, not this spec.
- The tests assert external behavior: the written stylesheet, the patched component files, the states, the build and the painted colors.

## Out of Scope

- The Storybook showcase implementation; it is the next feature.
- The `--size-field` and `--size-selector` mapping.
- `--depth`, `--noise`, hardcoded shadows and fonts.
- `code-block` status variants.
- Multiple light/dark pairs or `[data-theme]` switching.
- daisyUI component skins and any daisyUI runtime dependency.
- The 0.2.0 optional-override change, already shipped.
- The 0.1.0 historical commits and their GitHub verification state.

## Further Notes

The audit found 63 installed component directories; the docs catalog lists 67 entries, the extra four being the Combobox, Data Table and Date Picker compositions and Typography. The `mira` style has 90 `rounded-none` occurrences across 82 files, so the radius change is a deliberate visual shift. The ADRs record the brand mapping, the radius direction and the fixer boundary. The 0.3.0 package is on `develop` and unpublished; the release follows the visual check. The header marker, the target manifest, the text tones, the four fixer states, the drift test and the corrected declaration count were added after the specification reviews on 2026-11-03.

## Amendment 2026-11-06: tone variants for the binary controls

### Problem

The component review confirmed that checkbox, switch, toggle and radio-group carry one tone: primary. daisyUI exposes colour modifiers for each of them, and every other component already expresses a tone through one `variant` prop. A project cannot ask for a success checkbox or a warning switch without hand-writing `data-checked:` classes, and hand-written classes do not survive the next adapter run.

### Outcome

All four controls accept the seven tones through the same single `variant` prop the rest of the system uses:

- `<Checkbox variant="success" checked />`
- `<Switch variant="warning" checked />`
- `<RadioGroupItem variant="info" value="a" />`
- `<Toggle variant="outline-success" pressed />`

The tones are `default`, `secondary`, `success`, `warning`, `info`, `destructive` and `blackwhite`. Toggle already has an appearance axis, so its keys stay combined: the seven filled tones plus `outline` and the six `outline-<tone>` pairs.

### Decisions

- One `variant` prop, not a second `tone` prop. A separate prop splits one selection into two and breaks the contract that button, badge, alert and bubble already use.
- The tone map is a literal string table inside each fixed component. Tailwind emits only classes it can read as literals in application source; a table inside `node_modules` is never scanned, so the colours would silently disappear.
- Fill, border and foreground follow the pair rules already in this spec: the fill is the tone, the foreground is the tone foreground, and the border is the tone text token for the status tones, so the control boundary clears 3:1 while the fill itself stays below it.
- The switch and radio-group keep the tone off the track. Their track is the tone at 10 percent, their border is the tone border, and their thumb or dot is the tone itself, so the sphere carries the state while the track stays quiet.
- An unpressed toggle hovers to its tone at 20 percent.
- Button, checkbox, switch, radio-group and toggle carry the pointer cursor; a disabled control shows `not-allowed` instead, with its hover guarded.
- A label that belongs to a disabled control shows `not-allowed` whether it is a sibling, sits under a group wrapper marked `data-disabled="true"`, or wraps the control.
- The redundant `dark:data-checked:bg-primary` twin is removed rather than overridden. That keeps the tone row winning without `!`, so a caller's `class` still wins.
- The dark unchecked surface `dark:bg-input/30` is scoped to `not-data-checked`, which keeps the indeterminate checkbox on the dark input surface while a tone paints the checked one.
- Checkbox, switch and radio-group get four replacement sites each: the props destructure plus the tone map, the focus pair, the colours, and the class insert. Toggle gets three: its variant block, its outline row, and the pressed base. All anchors live in `targets.mjs`.
- Stock files under `src/lib/components/ui` keep their stock strings. The review copies under `src/lib/components/*-fixed` follow the existing regeneration flow: fix in `ui`, copy the directory, revert `ui`, normalize to LF.

### Out of scope

- Focus-ring weight, currently 2px at 30 percent on the button and 3px at 50 percent on the radio group. Open question, not part of this amendment.
- The stock switch thumb's RTL rule uses `data-[state=checked]` while every other rule uses `data-checked`. Upstream defect, not fixed here.
- The badge secondary quiet rows, the bubble bare appearances and the button ghost hover from ticket 43's follow-up list.

### Acceptance

- Each control renders the seven tones in both schemes: the checked fill equals the tone token, the border equals the tone-text token for the status tones where a border exists, and the foreground equals the tone foreground. The switch and radio-group are the exception: their track is the tone at 10 percent, their border is the tone border, and their thumb or dot is the tone. The filled toggle has no border because its base has no width; the outline keys carry it.
- Focus, invalid and disabled keep working on every tone.
- `variant` is typed, and an unknown key is a type error where the component has a cva table.
- The four reviewer pages show every tone, their journeys pass, and `drift.mjs` stays green.
- A new harness script covers the binary tone rows, in the shape registry-30 and registry-31 already use.

### Version

Folds into 0.3.0. The package is unpublished, since npm still serves 0.2.0 and `npm whoami` returns 401,
so the release record between `eb99aab` and `27d607b` is amended rather than superseded: README and
CHANGELOG gain the binary tones, and the candidate is re-verified before publish.

## Amendment 2026-11-09: group-level radio variant

### Problem

`RadioGroupItem` takes `variant` per item, so a group of N options repeats the tone N times and can mix
tones by accident. The group is the unit that owns the selection, so it should own the tone too.

### Outcome

`variant` moves to `RadioGroup` root. The group publishes it through a reactive Svelte context, and an
item resolves `variant ?? group variant ?? "default"`. The item prop stays as an override for the rare
mixed case. The tone matrix on the reviewer page sets the tone on the group and never per item.

```svelte
<RadioGroup variant="success" bind:value>
	<RadioGroupItem value="on" />
	<RadioGroupItem value="off" />
</RadioGroup>
```

### Decisions

- Root owns the tone. Items read the group tone through a getter in context, so a changed root prop
  repaints every item without an effect and without a DOM read.
- The item `variant` prop is optional with no default. `undefined` means inherit; a value overrides.
- The `TONES` map stays in the item. The root does not render a control and has no reason to carry the
  palette, so the root holds the token only.
- The context key is `RADIO_GROUP_VARIANT`, a symbol exported from `ui/binary-variant.ts`. Both fixed
  copies import it, so one module owns the key, the type and the seven tone names.
- The fixer gains a root file for `radio-group`: one site for the import and type, one for the props and
  the context call. `radio-group` now declares eight sites across two files. The fixed root joins the
  byte-for-byte comparison, and the stylesheet header counts seven fully fixed files.
- `BinaryVariant` and `RADIO_GROUP_VARIANT` live in `ui/binary-variant.ts`, written by the fixer. The
  checkbox, switch and radio-group fixed copies import them, so the three local `variant` types and the
  duplicated key string are gone.

### Acceptance

- `<RadioGroup variant={tone}>` paints every inheriting item with that tone. The checked fill, border,
  ring and indicator match the tone swatches in both schemes.
- An item with its own `variant` keeps that tone while the rest of the group keeps the group tone.
- An item with no group tone and no item tone stays `default`.
- The two fixed copies regenerate byte for byte, and `registry-49` still passes.
- The reviewer page and its journey prove group inheritance and the item override.

### Version

Folds into 0.3.0 with the binary tone amendment.

## Amendment 2026-11-11: outline toggle border alpha

### Problem

The outline toggle keys paint the tone border at full strength while the unpressed hover background is
the tone at 20 percent. The rest state reads heavier than the hover, and the border does not follow the
wash.

### Decision

Every `outline-<tone>` key paints its border at 20 percent alpha in the unpressed state, the same alpha
as the unpressed hover background. The `outline` default keeps its `border-input` border at full
opacity. The pressed state keeps the full tone border. The border colour token is unchanged: the
secondary foreground with its dark twin, the text tone for the status tones, and the blackwhite tone.

### Acceptance

- The six `outline-<tone>` keys paint a 1px border at 20 percent alpha at rest in both schemes.
- The default `outline` keeps its full `border-input` border.
- Pressing a key restores the full tone border.
- The toggle journey asserts the rest alpha and the default border.
- The fixed copy regenerates byte for byte through the fixer.

## Amendment 2026-11-11: a global type scale

### Problem

The system has no type scale of its own. Component text uses Tailwind's default rungs, and the field
boxes repeat the resulting px as spacing utilities: `h-6` 24, `h-7` 28, `h-8` 32, `min-h-12` 48,
`min-h-14` 56, `min-h-16` 64, `px-1.5` 6, `px-[0.4375rem]` 7, `px-2` 8. The numbers agree with a
12/14/16 text scale only by hand. Changing the default font size changes text and leaves every box and
padding where it was, so the operator has to edit each component to follow a type change.

### Decision

- **One table.** `packages/daisyui-adapter/targets/type-scale.mjs` holds the six rungs and their line
  heights: `xs` 10/14, `sm` 12/16, `base` 14/20, `lg` 16/24, `xl` 18/28, `2xl` 20/28. The line
  heights keep the rendered value of the rung that holds the same px today: `sm` 16 is the old `xs`,
  `base` 20 the old `sm`, `lg` 24 the old `base`, `xl` 28 the old `lg`, `2xl` 28 the old `xl`. The new
  `xs` takes 14, matching the 1.4 ratio the old `xl` used.
- **A plain `@theme` block, not `@theme inline`.** `@theme inline` does not emit its variables, so
  `calc(var(--text-base) * 2)` in a utility would have nothing to resolve and no journey could read
  the token at runtime. A plain block emits `--text-*` and `--text-*--line-height` on `:root, :host`.
  Verified by compiling a probe against tailwindcss 4.3.3: the block emits `--text-sm: 12px`, the
  `.text-base` utility emits `font-size: var(--text-base)` with
  `line-height: var(--tw-leading, var(--text-base--line-height))`, and
  `h-[calc(var(--text-base)*2)]` emits `height: calc(var(--text-base) * 2)`.
- **The block is rebuilt, not appended.** `map` re-emits the `--text-*` declarations from the table,
  keeps a foreign declaration in the same block, and leaves a second run byte-identical. The block is
  inserted after `@theme inline` when the stylesheet has none.
- **Rungs move, px does not.** Every class string moves one rung up, so `text-xs` 12 becomes
  `text-sm` 12 and `text-sm` 14 becomes `text-base` 14. `stock` strings keep their rung names,
  because they describe upstream. The move is a generated table, `targets/text-rungs.mjs`, one
  `replace` site per class string that the other tables do not already shift. It is generated from
  the pinned `ui` snapshot and the existing tables by `tools/generate-text-rungs.mjs`, and it runs
  last, so it only sees what the other sites left. A hand-written row per rung was tried first and
  failed: a class string that another site edits without touching its rung (the label's cursor
  insert) hides the unshifted rung from a substring match.
- **Completeness is computed, not listed.** Applying the sites to the stock and applying them to
  the rung-shifted stock with shifted `stock` strings must produce the same file. The first result
  is what the fixer writes; the second is what a complete shift produces. A different result names
  the file and the string still on an old rung, and the drift test fails on it. The `*-fixed` copies
  are held to the same manifest: each copy must equal applying the sites to its `ui` source, so a
  hand-edited copy cannot pass as the shipped result again.
- **Field metrics derive from the token that owns the size.** `sm` reads `--text-sm`, `default`
  `--text-base`, `lg` `--text-lg`. Height is 2×, textarea `min-h` is 4×, padding-x is 0.5×. The base
  height is carried as `data-[size=default]:h-[…]` because `h-7` is upstream stock and a `data-*`
  variant wins over a bare utility in Tailwind's sort order; `data-[size=sm]` already works this way.
- **The other scales stay.** Radius keeps the step table and the role mapping unchanged, the border
  stays `--default-border-width` 1px, and page and component spacing stay on the spacing scale.
- **The journeys read the tokens.** The field journey reads `--text-*` from `:root` and computes text,
  box and padding-x from it instead of hardcoding 12/14/16 and 24/28/32. A change to the table moves
  the assertion with it.
- **The copies stay generated.** The flow is unchanged: `fix` in `ui`, copy the files the fixer changed
  into `*-fixed`, revert `ui`, normalize to LF, never run prettier over the copies. An `index.ts` that
  re-exports from `ui` stays hand-maintained.

### Acceptance

- The stylesheet holds one `@theme` block with all six rungs and their line heights, emitted on
  `:root`, and `map` twice leaves it byte-identical.
- Every class string is one rung up and every `*-fixed` copy equals the fixer's output for its `ui`
  source; the rendered px before and after the change is identical for all twelve journeys.
- No file under `ui` keeps a rung on an old name after a full `fix`, and `kbd` renders from a fixed
  copy so the review route shows the shifted rung.
- The three field sizes read their token, and height, textarea `min-h` and padding-x are 2×, 4× and
  0.5× of it.
- `--text-base: 15px` moves the default field's text to 15px, its height to 30px and its padding-x to
  7.5px in one step; restoring 14 returns all three, and the sm and lg fields never move.
- The light and dark schemes are otherwise unchanged: theme colours, radii, borders and spacing match
  the pre-change readback.
- `pnpm check` is clean, `pnpm test:adapter` passes with the new guard, and the twelve journeys pass on
  a fresh server.

## Amendment 2026-11-11: native select option list follows the color scheme

### Problem

The `<select>` is themed, but its `<option>` carries `bg-[Canvas] text-[CanvasText]`, and neither `.dark` nor
the daisy theme sets `color-scheme`. The open list therefore uses the platform light canvas in both schemes.
Measured on `/review/native-select`: the option background is `rgb(255, 255, 255)` with `rgb(0, 0, 0)` text in
both schemes, while the enclosing `[data-scheme="dark"]` computes `color-scheme: normal`. The closed select
paints `oklch(0.291 …)` with a 30 percent input wash in dark, so the popup flips from a dark field to a white
list.

### Decision

The map writes `color-scheme: dark` as the first declaration of the rebuilt `.dark` body. The light `:root`
block is unchanged. The stock option and optgroup classes stay, because `Canvas` and `CanvasText` resolve
against the scheme the element is used in, so one declaration covers both without a fixer site. The journey
asserts the scope scheme, the dark option luminance and the AA contrast on the list.

### Acceptance

- The dark option resolves a dark canvas at AA: `rgb(18, 18, 18)` with `rgb(255, 255, 255)` text, contrast 18.7.
- Light is unchanged at `rgb(255, 255, 255)` with `rgb(0, 0, 0)` text.
- A second map run leaves the `.dark` block body byte-identical, with one `color-scheme` declaration.
- The readback still reports 45 light and 45 dark; `color-scheme` is not a custom property and is not counted.

## Amendment 2026-11-11: tones, radii and dark surfaces for the atomic set

### Problem

The operator reviewed the nine atoms on `/review/<component>` and failed them. Measured in the dark
scheme against the page at `oklch(0.18)`: the `kbd` and `skeleton` surfaces read 1.09 to 1, the
`progress` track 1.09 to 1, the `slider` track 1.35 to 1, and the `scroll-area` thumb and `separator`
line 1.2 to 1, because `--muted` resolves darker than the page and `--border` sits almost on it. The
`kbd`, `skeleton`, `slider` thumb and `scroll-area` thumb radii measure 0px. Six of the nine atoms
carry no tone variant at all, so the review cannot show the system's tone vocabulary on them.

### Decision

- **Seven tones, one vocabulary.** `kbd`, `separator`, `skeleton`, `spinner`, `progress` and `slider`
  take `variant` with the seven tone keys the fields already use. `separator` and `skeleton` add a
  `neutral` key as their default, because a divider and a placeholder have no tone of their own.
- **Soft surfaces, strong accents.** A surface uses `<tone>/25` in light and `<tone>/30` in dark, except
  `destructive`, whose dark token is itself dark and takes 50. An indicator, line or thumb uses the
  raw tone, because the derived `<tone>-text` tokens mix 60 percent foreground into the tone and drag
  every hue toward the foreground's blue: measured that way, `success` painted cyan and `destructive`
  painted violet. Only `secondary` swaps, to `secondary-foreground` in light, because its light token
  is a near-white surface. Text uses the foreground.
- **Dark surfaces come from the foreground, not from `--muted`.** The neutral key, the `progress`
  track and the `slider` track paint `foreground/10` in light and `foreground/15` in dark.
- **Radii follow the role table.** `kbd` and `skeleton` take the selector step. The `slider` thumb and
  the `scroll-area` thumb are `rounded-full` by shape, like the radio dot, and the `progress` track and
  `separator` stay square because they are a bar and a line.
- **`kbd` carries a 2px bottom edge** in its tone, which is what makes it read as a key.
- **The slider ring follows the thumb.** Its hover and focus rings paint `ring-<tone>/30` instead of
  `--ring`, so a warning slider rings in warning and not in the default colour.
- **`spinner` gains sizes.** `size` takes `sm` 12, `default` 16, `lg` 24 and `xl` 32, so the stock
  16px default never moves.
- **The floor is measured, not asserted from a token.** A surface fill must reach 1.1 to 1 against the
  page in light and 1.25 to 1 in dark. An accent, bar or thumb holds 1.5 to 1 in light and 2.8 to 1
  in dark, because a raw bright tone cannot reach 3 to 1 on white and the dark error token measures
  2.89. Each journey reads the rendered colours, composites the alpha over the page and asserts the
  ratio it measured.

### Acceptance

- Every one of the six components renders seven tones, and `separator` and `skeleton` render the
  neutral key as their default.
- Measured floors hold in both schemes for every tone row, and the journeys print the ratio.
- `kbd`, `skeleton`, `slider` thumb and `scroll-area` thumb radii measure the step or `full`.
- `progress` keeps its 2px bar and a caller's `class="h-2"` still wins, because `cn` merges `h-0.5` away.
- `spinner` renders 12, 16, 24 and 32, and the existing 16px default is unchanged.
- The generated copies are what the fixer produces from the pin, and `ui` and `src/routes/layout.css`
  stay stock.

## Amendment 2026-11-11: Storybook is the component docs and showcase

### Problem

The package ships with README prose only. The `/review/<component>` pages are an internal
verification surface: they carry `data-case` hooks for the journeys, show both schemes side by side,
and have no props table, so they document nothing a consumer can read. Storybook is already installed
at 10.6.4 with a11y, docs, svelte-csf, themes and vitest addons, and holds only the three scaffold
stories from `sv create`.

### Decision

- **Scope is the 19 atoms.** A story file per atom, published as the 0.3.0 docs. Molecules and above
  come with their own release.
- **Stories render the shipped copy.** Every atom with a `*-fixed` directory imports from it, because
  that is what an install gets after `fix`. `aspect-ratio` and `avatar` have no copy and render from
  `ui`.
- **`/review` stays the verification surface.** The journeys keep driving those routes, because they
  depend on the `data-case` hooks and the two schemes on one page. Storybook documents; it does not
  gate behaviour.
- **One story file per component** with `tags: ['autodocs']`, a `Playground` story whose args drive
  the Controls panel, and the states the review page already proves: every tone, every size, and the
  states that apply to that component.
- **The scheme is the toolbar.** `addon-themes` switches `data-theme` between light and dark, so the
  docs show one scheme at a time instead of two cards.
- **a11y is an error with `color-contrast` off.** The contrast gate is the adapter's own matrix and
  the journeys, so the addon's advisory pairs would fail for theme reasons rather than story reasons.
- **A story lint enforces three rules** learned in the reference project: a story that renders
  content sets `asChild`, a component story defines a `Playground` with non-empty args and a template
  that spreads them, and a select control goes through a helper rather than `control: 'select'`, which
  drops URL-persisted args.
- **Static build only.** `pnpm build-storybook` joins the release gate for 0.3.0. No hosting.

### Acceptance

- 19 atom stories exist, each with autodocs and a Playground that Controls can drive.
- The theme toolbar shows every story in light and dark with the adapter tokens.
- `pnpm check-stories` passes over every story file and fails when any of the three rules is broken.
- The a11y addon reports no violation for the story set in either scheme.
- `pnpm build-storybook` writes a static build with no console error.
