# Atomic levels of the ui components

The rule used here is composition and role, not file size.

- **Atom**: one control or graphic. It has no internal composition and it carries the tokens.
- **Molecule**: a small, single-purpose group of atoms that behaves as one unit.
- **Organism**: a section-level block. A multi-part overlay, a collection, a complex widget, or a global service.
- **Template**: the page shell that places regions.
- **Page**: a route with real content.

`Target` marks the components the adapter's fixer patches today (the 28 component directories in `KNOWN_COMPONENTS`; `input-group-button` is a file inside `input-group`, not its own directory).

## Atoms (19)

| component | target | note |
| --- | --- | --- |
| aspect-ratio | no | layout primitive |
| avatar | no | image with a text fallback |
| badge | yes | |
| button | yes | |
| checkbox | yes | |
| input | yes | |
| kbd | no | |
| label | no | |
| marker | no | icon plus content, one unit |
| native-select | yes | |
| progress | no | |
| scroll-area | no | a wrapper around one scroll container |
| separator | no | |
| skeleton | no | |
| slider | no | |
| spinner | no | |
| switch | yes | |
| textarea | yes | |
| toggle | yes | |

Untargeted: aspect-ratio, avatar, kbd, label, marker, progress, scroll-area, separator, skeleton, slider, spinner (11).

## Molecules (26)

| component | target | note |
| --- | --- | --- |
| accordion | no | |
| alert | yes | title, description and action; often fills a section, still one unit |
| attachment | no | |
| breadcrumb | no | |
| bubble | yes | |
| button-group | no | |
| card | yes | header, content and footer; becomes an organism when used as a page block |
| code-block | no | |
| collapsible | no | |
| empty | no | |
| field | no | label, control, description and error |
| form | no | field-level primitives, not a page form |
| hover-card | yes | |
| input-group | yes | |
| input-otp | no | |
| item | no | |
| message | no | |
| message-scroller | no | |
| pagination | no | |
| popover | yes | |
| radio-group | yes | |
| resizable | no | panes plus handles |
| tabs | no | |
| toggle-group | no | |
| tooltip | no | trigger plus content |
| trace | no | |

Untargeted: accordion, attachment, breadcrumb, button-group, code-block, collapsible, empty, field, form, input-otp, item, message, message-scroller, pagination, resizable, tabs, toggle-group, tooltip, trace (19).

## Organisms (18)

| component | target | note |
| --- | --- | --- |
| alert-dialog | no | |
| calendar | yes | |
| carousel | no | |
| chart | yes | |
| command | yes | dialog plus input-group |
| context-menu | yes | |
| dialog | yes | |
| drawer | yes | |
| dropdown-menu | yes | |
| menubar | yes | |
| navigation-menu | yes | |
| questionnaire | no | multi-step form flow |
| range-calendar | yes | |
| select | yes | a form control, classified here for the popup; refine it with the atoms if easier |
| sheet | yes | |
| sidebar | no | composes button, input, separator, sheet, skeleton and tooltip |
| sonner | no | global toast service |
| table | yes | |

Untargeted: alert-dialog, carousel, questionnaire, sidebar, sonner (5).

## Templates and pages

| item | level | file |
| --- | --- | --- |
| app shell | template | `src/routes/+layout.svelte` |
| demo page | page | `src/routes/+page.svelte` |
| evidence page | page, not a route | `.scratch/daisyui-adapter/harness/page/+page.svelte` |

## Coverage today

| level | count | targeted | untargeted |
| --- | --- | --- | --- |
| atoms | 19 | 8 | 11 |
| molecules | 26 | 7 | 19 |
| organisms | 18 | 13 | 5 |
| total | 63 | 28 | 35 |

## A refinement order

1. **Atoms.** Finish token consumption on the eight targeted atoms first: radius, border, focus ring, disabled and invalid. Then take the eleven untargeted atoms, starting with `label`, `separator`, `progress`, `slider` and `spinner`, because the molecules above them read their tokens.
2. **Molecules.** The targeted seven are close. Then `field`, `form`, `item`, `tabs`, `toggle-group`, `breadcrumb` and `pagination`, which use the atoms directly.
3. **Organisms.** The overlay set is targeted and shares one state model. `sidebar`, `carousel`, `alert-dialog`, `questionnaire` and `sonner` are the uncovered five.
4. **Templates and pages.** The shell last, once the blocks below it are stable.
