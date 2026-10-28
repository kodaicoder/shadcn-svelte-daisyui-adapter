# Cascade policy

Type: grilling
Status: open
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

<!-- fill on resolution -->
