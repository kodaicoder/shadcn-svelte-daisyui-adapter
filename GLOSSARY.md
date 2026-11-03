# daisyUI adapter

The adapter maps a daisyUI v5 theme onto shadcn-svelte tokens and component classes so a SvelteKit project can keep its own palette as a fallback while the theme controls the final values.

## Language

**Theme file**:
The two-block daisyUI file the project pastes at `src/daisyui-theme.css`; input only, never written by the adapter.
_Avoid_: Theme source, palette file

**Binding**:
A stylesheet declaration that points a shadcn-svelte token at a daisyUI source and keeps the project's previous value as its fallback.
_Avoid_: Variable, override

**Alias**:
A `@theme inline` entry that exposes a binding as a Tailwind utility, such as `bg-success`.
_Avoid_: Utility token

**Surface-first mapping**:
A mapping rule that assigns shadcn's surface tokens to daisyUI's neutral rungs by role rather than by name.
_Avoid_: Name-to-name mapping

**Brand mapping**:
A mapping rule that assigns a shadcn token to the daisyUI token of the same name, accepting that the token's role changes.
_Avoid_: Name-to-name mapping

**Status token**:
A semantic color pair (`success`, `warning`, `info`, `destructive`) with a foreground for its filled presentation.
_Avoid_: Semantic color, state color

**Tone**:
The semantic color of a control, independent of how it is painted.
_Avoid_: Color, variant

**Presentation**:
How a control paints its tone: solid, outline, ghost or link.
_Avoid_: Style

**Variant**:
The component prop value that selects one tone and presentation pair, such as `outline-success`.
_Avoid_: Style, color

**Role radius**:
The daisyUI radius family a component uses: selector, field or box.
_Avoid_: Radius size

**Size radius**:
The shadcn radius step a component uses at a given size.
_Avoid_: Radius scale

**Component fixer**:
The adapter step that patches stock shadcn component classes after the token mapping.
_Avoid_: Codemod, patch script

**Override**:
A user-owned file the adapter never writes, imported beside the stylesheet for local exceptions.
_Avoid_: Customization, patch

**Contrast pair**:
A foreground and background the adapter checks against WCAG AA in both schemes.
_Avoid_: Color pair

**Header marker**:
The first-line comment that records the adapter version and the exact re-run command.
_Avoid_: Version comment

**Showcase**:
The Storybook surface that presents every component in light, dark and its variants.
_Avoid_: Storybook demo
