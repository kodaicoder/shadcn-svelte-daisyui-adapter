# Fix phase: apply the 0.3.0 mapping to the components

Status: draft
Type: spec
Date: 2026-11-03
Feature: daisyui-adapter
Decisions: `docs/adr/0001-brand-secondary-accent.md`, `docs/adr/0002-radius-roles-and-sizes.md`, `docs/adr/0003-component-fixer-in-the-package.md`
Glossary: `GLOSSARY.md`

## Problem Statement

The 0.3.0 brand mapping gives the stylesheet the right tokens, but the components still look pre-adapter. The radii stay square while `--radius` is not zero. The status colors (`success`, `warning`, `info`) have no tokens, aliases or variants. The combined `outline-*`, `ghost-*` and `link-*` tone variants do not exist. The destructive button is a soft tint, not the daisyUI error button. Ten component pairings fail WCAG AA, including the dialog and sheet close button in dark and the calendar hover in light. A project that installs the adapter has to hand-edit classes and variants to get the theme it asked for, and there is no single command that applies both the mapping and the component repairs.

The new variants add a second gap. Their outline, ghost and link presentations paint the tone itself as text and border. Measured on the spec's fixed status fallbacks, the light-page pairs are `success` 2.52, `warning` 1.95 and `info` 2.22, and the dark-page destructive pair is 2.89, so the AA promise does not hold for those presentations. The filled variants pass the text pair (6.05 to 7.63) but the status fill against the light page is only 1.95 to 2.52, below the 3:1 component boundary; the destructive fill against the dark page is 2.89. The fixer also has no state model: a file it already fixed no longer matches the stock string, so a stock-only matcher would report every fixed file as customized and lose idempotency. The stock strings are tied to a shadcn-svelte version and the `mira` style, and the spec does not name either. The release waits for a visual check that the spec does not define, while the Storybook showcase is a separate feature. Finally, a stylesheet written by 0.3.0 before and after the fixer looks identical, so the header cannot say whether the components were fixed.

## Solution

Ship one release, still numbered 0.3.0, that:

- adds eleven bindings: the seven status tokens (`success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`, `destructive-foreground`) and four text tones (`success-text`, `warning-text`, `info-text`, `destructive-text`), with their `@theme inline` aliases;
- uses the text tones for every outline, ghost and link text and border, and adds the text-tone border to the filled status and destructive variants so the component boundary clears 3:1;
- applies the daisyUI radius roles to the components, with the shadcn size scale choosing the step;
- adds the tone × presentation variants to button, badge, alert and bubble, and makes the destructive button base filled;
- repairs the ten contrast pairs to AA, keeping the sidebar accent neutral;
- publishes `component-fix.mjs`, with a four-state model, a stock version and style guard, a target manifest, `--dry-run`, `--check` and `--strict`;
- defines the visual check as the harness screenshots plus a short manual checklist;
- records the fixer state in the header marker.

The workflow becomes: `shadcn-svelte init`, `shadcn-svelte add <components you use>`, then the adapter `init`. The result is a themed project at AA for the repaired and variant pairs, with the daisyUI radius and brand colors, and no hand edits.

## User Stories

1. As a SvelteKit developer, I want to run `shadcn-svelte init`, add the components I use, then `adapter init`, so that my stylesheet is mapped and those components are fixed in one step.
2. As a SvelteKit developer, I want `adapter fix` after I add a component, so that the new component gets the same fixes without rewriting the whole stylesheet.
3. As a SvelteKit developer, I want `adapter fix button`, so that I can repair one component.
4. As a SvelteKit developer, I want `--dry-run`, so that I can see which files and classes would change before writing.
5. As a SvelteKit developer, I want `--check`, so that CI fails when a component still needs a fix.
6. As a SvelteKit developer, I want `--strict`, so that a skip is an error only when I ask for it.
7. As a SvelteKit developer, I want the fixer to be idempotent, so that a second run leaves every file byte-identical.
8. As a SvelteKit developer, I want the fixer to tell me whether a component is missing, stock, already fixed or customized, per replacement site, so that one hand-edited class does not hide or block the other fixes in the same file.
9. As a SvelteKit developer, I want the fixer to refuse a style or shadcn-svelte version it does not support, with a clear message, so that a silent skip never leaves me with a half-themed project.
10. As a SvelteKit developer, I want `--secondary` and `--accent` to use the daisyUI brand colors, so that the UI matches the theme instead of a neutral surface.
11. As a SvelteKit developer, I want `success`, `warning` and `info` tokens and aliases, so that I can use `bg-success`, `text-warning` and their foregrounds.
12. As a SvelteKit developer, I want the outline, ghost and link variants to use a text tone that meets AA on the page, so that a success or warning text is readable in both schemes.
13. As a SvelteKit developer, I want the filled status and destructive variants to clear the 3:1 component boundary, so that the button is identifiable against the page.
14. As a SvelteKit developer, I want `destructive-foreground`, so that a filled destructive button is readable.
15. As a SvelteKit developer, I want the destructive button base to be filled, so that it matches the daisyUI error button rather than a soft tint.
16. As a SvelteKit developer, I want `outline-*`, `ghost-*` and `link-*` combined tone variants, so that I can choose the color and the presentation independently.
17. As a SvelteKit developer, I want status variants on button, badge, alert and bubble, so that each component can show success, warning and info.
18. As a SvelteKit developer, I want the component radii to follow the daisyUI roles and the component size, so that buttons and cards are not square when the theme has a radius.
19. As a SvelteKit developer, I want the radius scale to survive `--radius: 0` and a large radius without negative or collapsed steps, so that the theme's choice is not silently lost.
20. As a SvelteKit developer, I want the circles and edge-joining classes to stay as they are, so that avatars, radio buttons and button groups still look right.
21. As a SvelteKit developer, I want the dialog and sheet close buttons, the calendar hover, the range middle and the destructive menu shortcuts repaired, so that their text is readable in both schemes.
22. As a SvelteKit developer, I want the chart tooltip and the muted bubble surface repaired, so that their surfaces are consistent with the rest of the theme.
23. As a SvelteKit developer, I want the sidebar accent to stay neutral, so that the sidebar does not turn brand-colored.
24. As a SvelteKit developer, I want the header marker to record the adapter version and the number of fixed components, so that I can tell whether the components were fixed and by which version.
25. As a SvelteKit developer, I want the docs to describe the `add` prerequisite and the `fix` order, so that I know the workflow.
26. As a design-system maintainer, I want the fixer to read one target manifest, so that the components, the contrast pairs and the supported version cannot drift apart.
27. As a design-system maintainer, I want `init` to warn when a theme's own content colors make a pair fail, so that AA is not claimed for a theme it cannot hold.
28. As a design-system maintainer, I want the smoke and harness tests to cover the map, the fixer states, the custom alias, the add-after-init case, the overwrite case and the radius edges, so that a regression cannot ship.
29. As an operator, I want the harness to keep light and dark screenshots and a short manual checklist, so that I can perform the visual check without waiting for the Storybook showcase.

## Implementation Decisions

**Tokens**

- The four text tones are `color-mix(in oklch, var(--<tone>) 40%, var(--foreground) 60%)`. At 40/60 the measured light pairs are `success` 8.30, `warning` 6.91, `info` 8.24 and `destructive` 13.49; the dark pairs are 11.28, 13.00, 11.88 and 8.24. The raw tone as text measures 2.52, 1.95, 2.22 and 6.52 on light, and the destructive 2.89 on dark, so the raw tone stays a fill and never a text token.
- The seven status tokens keep the fixed fallbacks: `success` `oklch(69% 0.17 162.48)`, `success-foreground` `oklch(26% 0.051 172.552)`, `warning` `oklch(79% 0.184 86.047)`, `warning-foreground` `oklch(28% 0.066 53.813)`, `info` `oklch(74% 0.16 232.661)`, `info-foreground` `oklch(29% 0.066 243.157)`, `destructive-foreground` `oklch(97% 0.013 17.38)`. A text tone falls back to its status fallback mixed with the project's own foreground, so the no-theme state is still readable.
- Each of the eleven tokens gets a `@theme inline` alias: `--color-success`, `--color-success-foreground`, `--color-success-text`, and the same for warning, info and destructive.
- The binding count rises from 32 to 43: the twenty-seven existing bindings, the seven status tokens, the four text tones and the five chart rows.
- The filled status and destructive variants carry the text-tone border in addition to the fill and the foreground, so the light status button and the dark destructive button clear the 3:1 boundary.
- The raw tone remains available as `bg-*`; the docs say to use the text alias for text. The `init` output warns when a theme's own tone or content makes a filled or text pair fall below its threshold.

**Radius**

- The role chooses the scale step: selector to `--radius-sm`, field to `--radius-md`, box to `--radius-lg`.
- The component size shifts the step: xs, sm, icon-xs and icon-sm to sm; default, md and icon to md; lg and icon-lg to lg; larger sizes follow the scale.
- All size-bearing components use the size step: button, toggle, item, attachment, select, native-select, switch and input-group-button. Fixed-size components use their role default.
- The four existing scale sites (calendar head cells and selects, chart tooltip) are aligned to their role.
- `rounded-full` circles, edge-joining utilities and the calendar `--cell-radius` custom property are excluded from the blanket replacement.
- The three daisyUI role values collapse into the shadcn scale, which derives from the box rung. This is a deliberate loss: a theme whose field and selector rungs differ from its box rung is approximated. ADR 0002 records the trade-off.
- The tests cover `--radius: 0` and a large radius. At zero every step is zero, which is square rather than negative; at a large radius the multiply keeps the order, and any step that would exceed the clamp is reported. The `--size-field` and `--size-selector` mappings remain out of scope.

**Variants**

- The component API keeps one `variant` prop. The combined values are literal keys on a tone × presentation table: the four tones (`destructive`, `success`, `warning`, `info`) times the presentations a component supports (`outline`, `ghost`, `link`), plus the filled tone keys.
- Every class string is literal in the `tv` config; no class is assembled at runtime, because Tailwind only scans literal names. The table is the single source for the button, badge, bubble and alert strings.
- Button gains the three status tones plus outline, ghost and link for the four tones; the destructive base becomes filled.
- Badge gains the three status tones plus the three presentations for the four tones.
- Bubble gains the three status tones plus outline and ghost for the four tones; it has no link presentation.
- Alert gains the three status tones; it has no outline, ghost or link presentation.
- `code-block` status variants remain out of scope.

**Contrast**

- The repaired pairs are the ten from the audit: dialog and sheet close, calendar and range hover, range middle, destructive shortcuts, chart tooltip and muted bubble.
- The variant matrix adds every text, border and filled pair for the four tones in both schemes. The text-tone pairs pass at 40/60; the filled text passes; the filled fill against the page is checked at 3:1 and carries the text-tone border where it fails.
- The matrix is computed from the theme at `init`; a pair below its threshold produces a warning, not a failure, because the theme's own content colors decide the outcome. The warning names the pair and the measured ratio.
- The fixed fallbacks make the no-theme state readable; the theme-dependent pairs are reported.
- Every repaired pair and every text-tone pair meets AA: 4.5 for text, 3.0 for non-text. The filled boundary is covered by the border and the warning.

**Component fixer, version and style**

- The fixer has four states per replacement site: `missing` (no file), `stock` (the stock string matches), `fixed` (the fixed string matches) and `customized` (neither matches). It applies `stock`, leaves `fixed`, reports `customized` and applies the other sites in the same file. A second run is byte-identical.
- The supported stock is shadcn-svelte 1.7.x with the `mira` style. The fixer reads the style from `components.json` and the installed shadcn-svelte version; an unsupported pair exits with a clear message rather than skipping silently.
- One target manifest holds the component list per fix, the ten contrast pairs with their token names and thresholds, and the supported version and style. The fixer and the tests read the same manifest.
- `init` runs the map and then the fixer over the components the project has added. `fix` runs every present target component; `fix <component>` runs the named ones; `--dry-run` reports without writing; `--check` exits non-zero when a stock site remains; `--strict` turns a skip into an error.
- The fixer reads the `components.json` aliases, normalizes CRLF and Windows paths before matching, and reports the four states per file and per site.
- When no target component is present, `init` maps the stylesheet, reports that no components were found and exits zero. It does not create an empty component.
- The CLI also updates the header marker after the fixer: `/* <pkg> <version> | components <n> fixed | re-run ... */`, where `n` is the number of component files fixed. A map-only run records `components 0 fixed`. The `fix` re-run updates the count. The pre-fixer 0.3.0 is a development state; the first published 0.3.0 includes the fixer and the marker.
- The version stays 0.3.0. The 0.2.0 is the published predecessor; the 0.3.0 before the fixer is not published. The marker, not a prerelease, distinguishes the states.

**Workflow and visual check**

- The install contract changes: the project adds the components it uses before `init`. The README, CHANGELOG and header describe the order.
- The visual check is the harness's light and dark screenshots plus a short checklist: the ten repaired pairs, the four tones in every presentation, the filled border, the radius on the button, card and input, and the destructive base. The Storybook showcase is the next feature and is not part of this release.

## Testing Decisions

- The highest seam is the existing harness: a fresh SvelteKit project, `shadcn-svelte add` the target components, the adapter `init`, then a build and render in both schemes. It keeps the screenshots and the checklist evidence. This is the one integration seam.
- The fixer gets a unit seam: a temporary copy of the stock components from the repo, one run, then assertions on the replaced classes, the four states, the per-site behavior, the idempotent second run, the custom alias, the CRLF input and the no-components case.
- The extra cases are: add a component after `init` then run `fix`; edit one class by hand and confirm the other sites still apply; set a custom alias in `components.json`; let `shadcn-svelte add` overwrite a fixed file and confirm the next `fix` restores it; run `--check` and `--strict`.
- The map keeps its existing smoke seam: 43 bindings, 11 aliases, the fixed status fallbacks, the four text tones, the radius and variant classes, the header marker and the byte-identical re-run.
- The contrast matrix is computed from the theme and the fixed fallbacks with the existing ramp helpers, and is checked against AA; the harness screenshots confirm the painted result. The radius edges are tested at zero and at a large value.
- The target manifest is read by the fixer and the tests; a version or style mismatch fails the test before it reaches a user.
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

The audit found 63 installed component directories; the docs catalog lists 67 entries, the extra four being the Combobox, Data Table and Date Picker compositions and Typography. The `mira` style has 90 `rounded-none` occurrences across 82 files, so the radius change is a deliberate visual shift. The ADRs record the brand mapping, the radius direction and the fixer boundary. The 0.3.0 package is on `develop` and unpublished; the release follows the visual check. The header marker, the target manifest and the text tones were added after the specification review on 2026-11-03.
