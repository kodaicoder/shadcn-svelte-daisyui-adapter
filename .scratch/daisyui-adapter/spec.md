# Fix phase: apply the 0.3.0 mapping to the components

Status: ready-for-agent
Type: spec
Date: 2026-11-03
Feature: daisyui-adapter
Decisions: `docs/adr/0001-brand-secondary-accent.md`, `docs/adr/0002-radius-roles-and-sizes.md`, `docs/adr/0003-component-fixer-in-the-package.md`
Glossary: `GLOSSARY.md`

## Problem Statement

The 0.3.0 brand mapping gives the stylesheet the right tokens, but the components still look pre-adapter. The radii stay square while `--radius` is not zero. The status colors (`success`, `warning`, `info`) have no tokens, aliases or variants. The combined `outline-*`, `ghost-*` and `link-*` tone variants do not exist. The destructive button is a soft tint, not the daisyUI error button. Ten component pairings fail WCAG AA, including the dialog and sheet close button in dark and the calendar hover in light. A project that installs the adapter has to hand-edit classes and variants to get the theme it asked for, and there is no single command that applies both the mapping and the component repairs.

## Solution

Ship 0.3.0 as one release that:

- adds seven status bindings (`success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`, `destructive-foreground`) with fixed fallbacks, plus their `@theme inline` aliases;
- applies the daisyUI radius roles to the components, with the shadcn size scale choosing the step;
- adds the tone × presentation variants to button, badge, alert and bubble, and makes the destructive button base filled;
- repairs the ten contrast pairs to AA, keeping the sidebar accent neutral;
- publishes `component-fix.mjs`, so `init` maps the stylesheet and fixes the components the project has added, and `fix [component...]` re-runs the repairs.

The workflow becomes: `shadcn-svelte init`, `shadcn-svelte add <components you use>`, then the adapter `init`. The result is a themed project at AA, with the daisyUI radius and brand colors, and no hand edits.

## User Stories

1. As a SvelteKit developer, I want to run `shadcn-svelte init`, add the components I use, then `adapter init`, so that my stylesheet is mapped and those components are fixed in one step.
2. As a SvelteKit developer, I want `adapter fix` after I add a component, so that the new component gets the same fixes without rewriting the whole stylesheet.
3. As a SvelteKit developer, I want `adapter fix button`, so that I can repair one component.
4. As a SvelteKit developer, I want `--dry-run`, so that I can see which files and classes would change before writing.
5. As a SvelteKit developer, I want the fixer to be idempotent, so that a second run leaves every file byte-identical.
6. As a SvelteKit developer, I want the fixer to skip a missing or customized file and report it, so that it never surprises me with a wrong patch.
7. As a SvelteKit developer, I want `--secondary` and `--accent` to use the daisyUI brand colors, so that the UI matches the theme instead of a neutral surface.
8. As a SvelteKit developer, I want `success`, `warning` and `info` tokens and aliases, so that I can use `bg-success`, `text-warning` and their foregrounds.
9. As a SvelteKit developer, I want `destructive-foreground`, so that a filled destructive button is readable.
10. As a SvelteKit developer, I want the destructive button base to be filled, so that it matches the daisyUI error button rather than a soft tint.
11. As a SvelteKit developer, I want `outline-*`, `ghost-*` and `link-*` combined tone variants, so that I can choose the color and the presentation independently.
12. As a SvelteKit developer, I want status variants on button, badge, alert and bubble, so that each component can show success, warning and info.
13. As a SvelteKit developer, I want the component radii to follow the daisyUI roles and the component size, so that buttons and cards are not square when the theme has a radius.
14. As a SvelteKit developer, I want the circles and edge-joining classes to stay as they are, so that avatars, radio buttons and button groups still look right.
15. As a SvelteKit developer, I want the dialog and sheet close buttons, the calendar hover, the range middle and the destructive menu shortcuts repaired, so that their text is readable in both schemes.
16. As a SvelteKit developer, I want the chart tooltip and the muted bubble surface repaired, so that their surfaces are consistent with the rest of the theme.
17. As a SvelteKit developer, I want the sidebar accent to stay neutral, so that the sidebar does not turn brand-colored.
18. As a SvelteKit developer, I want the version, header and docs to describe the `add` prerequisite and the `fix` command, so that I know the workflow and can tell which adapter version wrote the stylesheet.
19. As a design-system maintainer, I want the fixer to report every skipped file, so that I know what to check by hand.
20. As a design-system maintainer, I want the smoke and harness tests to cover the map, the fixer and the install chain, so that a regression cannot ship.
21. As a showcase viewer, I want light and dark stories for every component and every variant, so that I can compare the theme without reading CSS.

## Implementation Decisions

**Tokens**

- The seven new bindings use fixed fallbacks in both schemes: `success` `oklch(69% 0.17 162.48)`, `success-foreground` `oklch(26% 0.051 172.552)`, `warning` `oklch(79% 0.184 86.047)`, `warning-foreground` `oklch(28% 0.066 53.813)`, `info` `oklch(74% 0.16 232.661)`, `info-foreground` `oklch(29% 0.066 243.157)`, and `destructive-foreground` `oklch(97% 0.013 17.38)`.
- Each new binding gets a `@theme inline` alias: `--color-success`, `--color-success-foreground`, and the same for warning, info and destructive-foreground.
- The binding count rises from 32 to 39. The chart rows and the five derived helpers are unchanged.
- `destructive` keeps its daisyUI `error` source; `destructive-foreground` takes `error-content`. The status tones map to daisyUI `success`, `warning` and `info`.
- The fixed fallbacks are a deliberate exception to the project-value fallback rule: these tokens are new, so there is no previous project value to preserve.

**Radius**

- The role chooses the scale step: selector to `--radius-sm`, field to `--radius-md`, box to `--radius-lg`.
- The component size shifts the step: xs, sm, icon-xs and icon-sm to sm; default, md and icon to md; lg and icon-lg to lg; larger sizes follow the scale.
- All size-bearing components use the size step: button, toggle, item, attachment, select, native-select, switch and input-group-button. Fixed-size components use their role default.
- The four existing scale sites (calendar head cells and selects, chart tooltip) are aligned to their role.
- `rounded-full` circles, edge-joining utilities and the calendar `--cell-radius` custom property are excluded from the blanket replacement.
- The `--size-field` and `--size-selector` mappings are out of scope for this spec.

**Variants**

- The component API keeps one `variant` prop. Combined values are new keys, not a second axis.
- Button gains `success`, `warning` and `info` plus `outline-*`, `ghost-*` and `link-*` for destructive, success, warning and info. The destructive base becomes filled.
- Badge gains `success`, `warning` and `info` plus the three presentation combinations for the four tones.
- Bubble gains `success`, `warning` and `info` plus `outline-*` and `ghost-*` for the four tones; it has no link presentation.
- Alert gains `success`, `warning` and `info`; it has no outline, ghost or link presentation.
- `code-block` status variants are out of scope.
- The status tones use the status tokens; destructive uses the destructive pair.

**Contrast**

- Dialog and sheet close buttons pair the secondary surface with its foreground.
- Calendar and range-calendar hover keeps the half-transparent accent but uses the page foreground.
- The range middle keeps the solid accent and uses the accent foreground.
- Dropdown, context and menubar shortcuts guard the destructive item so the accent foreground does not land on the destructive tint.
- The chart tooltip uses the popover surface and foreground.
- The muted bubble uses the page foreground.
- The sidebar accent stays neutral.
- Every repaired pair meets AA: 4.5 for text, 3.0 for non-text.

**Component fixer and workflow**

- The package publishes `component-fix.mjs`; `init` runs the map and then the fixer over the components the project has added.
- `fix` re-runs the fixer over every present target component; `fix <component>...` runs the named ones; `--dry-run` reports without writing.
- The fixer reads the project's `components.json` aliases, matches only stock class strings, is idempotent, and reports missing or customized files as skips. It exits zero unless `--strict`.
- The target groups are the contrast components (dialog, sheet, calendar, range-calendar, dropdown-menu, context-menu, menubar, chart, bubble), the radius components by role, and the variant components (button, badge, alert, bubble).
- The install contract changes: the project must add the components it uses before `init`. The docs, changelog and header describe the new order.
- The version stays `0.3.0`; the release waits for the visual check.

## Testing Decisions

- The highest seam is the existing harness: a fresh SvelteKit project, `shadcn-svelte add` the target components, the adapter `init`, then a build and render in both schemes. This is the one integration seam.
- The fixer gets a unit seam: a temporary copy of the stock components from the repo, one run of the fixer, then assertions on the replaced classes, the idempotent second run, and the skip path for a missing or customized file.
- The map keeps its existing smoke seam: 39 bindings, seven aliases, the fixed fallbacks, the radius and variant classes, the header and the byte-identical re-run.
- The contrast matrix is computed from the theme with the existing ramp helpers and checked against AA; the harness render confirms the painted result.
- The Storybook showcase is the visual seam for the next feature, not this spec.
- The tests assert external behavior: the written stylesheet, the patched component files, the build, and the painted colors. They do not assert internal helper shapes.

## Out of Scope

- The `--size-field` and `--size-selector` mapping.
- `--depth`, `--noise`, hardcoded shadows and fonts.
- `code-block` status variants.
- The Storybook showcase implementation; it is the next feature.
- Multiple light/dark pairs or `[data-theme]` switching.
- daisyUI component skins and any daisyUI runtime dependency.
- The 0.2.0 optional-override change, already shipped.
- The 0.1.0 historical commits and their GitHub verification state.

## Further Notes

The audit found 63 installed component directories; the docs catalog lists 67 entries, the extra four being the Combobox, Data Table and Date Picker compositions and Typography. The `mira` style has 90 `rounded-none` occurrences across 82 files, so the radius change is a deliberate visual shift, not a small fix. The ADRs record the brand mapping, the radius direction and the fixer boundary. The 0.3.0 package is already on `feat/daisyui-adapter` but unpublished; the release follows the visual check.
