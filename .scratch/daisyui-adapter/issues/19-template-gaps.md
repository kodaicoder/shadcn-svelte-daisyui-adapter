# Template gaps: overlay scrims and sonner

Type: grilling
Status: resolved
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

Resolved 2026-11-03. The scrim stays exactly as it is: `dialog-overlay`, `alert-dialog-overlay`,
`sheet-overlay` and `drawer-overlay` keep `bg-black/20`. A token would not reach an unpatched overlay,
and patching the component is undone by `shadcn-svelte add -a`. This is a documented gap, not a mapping
defect (13).

Sonner needs no output. Ticket 20's claim 3 measured that the stock `@theme inline` map emits the
`--color-*` values `sonner.svelte` reads, so the "invalid values" half of this ticket is wrong. No plain
declarations, no `static` theme block, no component patch.

Lesson: A hardcoded scrim and a runtime `--color-*` read are not token problems; one needs a component patch that `add -a` would overwrite, the other was measured as already working.
Check: code - 20's claim 3 shows the sonner values resolve from the stock map; 13 keeps the scrim and the gap is recorded in 18's docs.
