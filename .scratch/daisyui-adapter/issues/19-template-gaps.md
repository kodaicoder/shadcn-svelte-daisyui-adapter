# Template gaps: overlay scrims and sonner

Type: grilling
Status: open
Blocked by: 13

## Question

Ticket 05 found two places the stock template cannot reach through variables:

1. Four overlay components use a hardcoded `bg-black/20` scrim: `dialog-overlay`, `alert-dialog-overlay`, `sheet-overlay`, `drawer-overlay`. No scrim token exists.
2. `sonner.svelte` reads `var(--color-popover)`, `var(--color-popover-foreground)` and `var(--color-border)` at runtime, but `@theme inline` never emits `--color-*`, so toasts currently get invalid values and fall back to svelte-sonner's own white/black defaults.

Decide:
1. Scrim: ship patched component files, ship a CSS class override, or document it as a known gap. Weigh this against `shadcn-svelte add -a` later overwriting any patched component.
2. If CSS override: do the overlays expose a stable selector (`data-slot`, `data-sonner-toaster`) we can target without patching components?
3. Sonner: declare plain `--color-popover`, `--color-popover-foreground`, `--color-border` in the generated block, or switch the `@theme` block to `static`, or accept unthemed toasts.
4. Whether a scrim token should be introduced at all (`--overlay`), given shadcn has none and components would still hardcode black unless patched.

Depends on ticket 13 for where declarations land.

## Answer

<!-- fill on resolution -->
