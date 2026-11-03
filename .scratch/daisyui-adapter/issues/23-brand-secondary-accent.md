# Brand secondary and accent
Session IDs:

Type: task
Status: resolved
Blocked by: none

## Question

The operator wants `--secondary` / `--secondary-foreground` to read daisyUI's `secondary` /
`secondary-content`, and `--accent` / `--accent-foreground` to read `accent` / `accent-content`.
This overrides ticket 09's surface-first rows. Which components need a visual check afterwards?

## Answer

Done in 0.3.0. `dist/map.mjs` now holds:

| shadcn token | daisyUI source |
| --- | --- |
| `secondary` | `secondary` |
| `secondary-foreground` | `secondary-content` |
| `accent` | `accent`, a direct read instead of the `base-200` / `base-300` mix |
| `accent-foreground` | `accent-content` |

`accent` moved from the mix table to the single table, so `--daisy-derived-accent` is gone. The binding
count stays 32 because the key moved rather than disappearing.

Measured on the adjusted light-blue / dark-blue pair:

| pair | light | dark |
| --- | --- | --- |
| `secondary-content` on `secondary` | 8.76 | 8.76 |
| `base-content` on `secondary` (dialog/sheet close) | 9.51 | **1.47** |
| `accent-content` on `accent` (solid) | 8.17 | 6.52 |
| `accent-content` on `accent/50` (calendar hover) | **2.30** | 11.29 |
| `base-content` on `accent/50` | 6.85 | 10.02 |

The solid pairs pass. Two component uses still fail and are the visual check list:

1. `dialog-content.svelte:40` and `sheet-content.svelte:47` paint a ghost Button with `bg-secondary`
   but no `text-secondary-foreground`. The icon inherits the page foreground and measures 1.47 in dark.
2. `calendar-day.svelte` and `range-calendar-day.svelte` use `bg-accent/50` with
   `text-accent-foreground` on hover. The half-alpha surface measures 2.30 in light.

Components that paint with the new tokens and should be checked:

- `button.svelte` secondary variant, including the `color-mix(--secondary, --foreground 5%)` hover.
- `bubble.svelte` secondary bubble.
- `dialog-content.svelte` and `sheet-content.svelte` close buttons (the dark failure above).
- `dropdown-menu-item`, `dropdown-menu-checkbox-item`, `dropdown-menu-radio-item`,
  `dropdown-menu-sub-trigger`, `dropdown-menu-shortcut`.
- `context-menu-item`, `context-menu-checkbox-item`, `context-menu-radio-item`,
  `context-menu-sub-trigger`, `context-menu-shortcut`.
- `menubar-item`, `menubar-checkbox-item`, `menubar-radio-item`, `menubar-sub-trigger`,
  `menubar-shortcut`.
- `select-item` focus and `data-highlighted` rows.
- `calendar-day` hover, today, and outside-month hover.
- `range-calendar-day`, `range-calendar-cell` hover, today, and the range-middle fill.

Not affected: `badge`'s secondary variant uses `text-muted-foreground` and no `bg-secondary`; `alert`
has only default and destructive variants; `sidebar-accent` still reads `base-300`, not `accent`;
sonner uses `--color-popover`, not these tokens.

0.3.0 is a minor bump because the mapping changes. A re-run applies it and updates the header. The
component fixes are not in this ticket: they belong to the project that owns the components, and the two
pairs above should be fixed there or accepted with a different accent.

Lesson: A name-first mapping is a different contract from a surface-first one, so the tokens can pass contrast in isolation while the components that pair them still fail.
Check: code - `registry-16/smoke.mjs` asserts the four new sources and the absence of `--daisy-derived-accent`; the contrast table above is measured with the ramp helpers on the adjusted theme, and the component list is the set that names these tokens.
