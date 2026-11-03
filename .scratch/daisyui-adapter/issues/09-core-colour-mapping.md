# Core colour mapping
Session IDs:
Lesson:
Check:

Type: grilling
Status: resolved
Blocked by: 03

## Question

The token-by-token table for the core family, and the derivation constants for everything daisyUI does not supply.

Decide each of these as: source daisyUI token, or CSS expression, or leave alone.

- `background`, `foreground`
- `card`, `card-foreground`
- `popover`, `popover-foreground`
- `primary`, `primary-foreground`
- `secondary`, `secondary-foreground`
- `muted`, `muted-foreground`
- `accent`, `accent-foreground`
- `destructive`, `destructive-foreground`
- `border`, `input`, `ring`

For every derived value, state the exact expression, for example `color-mix(in oklch, var(--daisy-base-content) 10%, transparent)`. Prefer expressions that stay readable in the generated CSS and that a user can override.

Also decide: does `card` map to `base-100` or `base-200`? Which daisyUI token feeds `muted` versus `accent`, given both exist in daisyUI as palettes rather than surfaces? Answer with a rationale, not a coin flip.

Depends on ticket 03 for the exact key list and which keys exist in the target style.

## Answer

Decided 2026-10-28. Surface-first mapping, chosen to match what shadcn components expect rather than daisyUI's brand-first naming. Every value is opaque, and every derived value is a complete CSS colour so `color-mix()` and `oklch(from ...)` in `button.svelte` and `bubble.svelte` keep working.

| Token | Value |
| --- | --- |
| `background` | `var(--daisy-base-100)` |
| `foreground` | `var(--daisy-base-content)` |
| `card` | `var(--daisy-base-100)` |
| `card-foreground` | `var(--daisy-base-content)` |
| `popover` | `var(--daisy-base-100)` |
| `popover-foreground` | `var(--daisy-base-content)` |
| `primary` | `var(--daisy-primary)` |
| `primary-foreground` | `var(--daisy-primary-content)` |
| `secondary` | `var(--daisy-base-200)` |
| `secondary-foreground` | `var(--daisy-base-content)` |
| `muted` | `var(--daisy-base-200)` |
| `muted-foreground` | `color-mix(in oklch, var(--daisy-base-content) 62%, var(--daisy-base-100))` |
| `accent` | `color-mix(in oklch, var(--daisy-base-200) 85%, var(--daisy-base-300))` |
| `accent-foreground` | `var(--daisy-base-content)` |
| `destructive` | `var(--daisy-error)` |
| `border` | `color-mix(in oklch, var(--daisy-base-content) 10%, var(--daisy-base-100))` |
| `input` | `color-mix(in oklch, var(--daisy-base-content) 15%, var(--daisy-base-100))` |
| `ring` | `var(--daisy-primary)` |

Rationale for the conflicting names (M1 to M5):

- `secondary` and `accent` are surfaces in shadcn and brands in daisyUI, so both take `base-200`. `accent` is mixed 15% toward `base-300` so hover feedback stays visible in both modes: the mix darkens in light and lightens in dark, because `base-300` sits on the opposite side of `base-200` in each mode.
- `muted-foreground` has no daisyUI source. 62% of `base-content` over `base-100` yields a quiet label without dropping to a brand colour.
- `card` and `popover` are both `base-100`. **Correction to the M4 recommendation:** `popover = base-200` was wrong, because daisyUI dark themes put `base-200` *below* `base-100` (18% to 10% in the pasted theme), which would make every popover and menu darker than the page it floats above. shadcn separates those layers with border and shadow, not fill.
- `border`, `input` and `ring` are derived because daisyUI exposes no border token. `base-300` was rejected: 65% lightness in light mode is a hard edge, not a hairline. `ring` is the one place a brand colour belongs, because focus must read as interactive.

Not emitted, deliberately:

- `destructive-foreground`: does not exist in shadcn-svelte 1.7.1.
- `info`, `success`, `warning`: no shadcn slot in v1. `error` reaches the theme through `destructive`. Revisit only if the utilities idea graduates from the fog.
- No alpha anywhere in a token value, so `bg-muted/50` still means half.
