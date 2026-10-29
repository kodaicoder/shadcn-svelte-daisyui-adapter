# End-to-end prototype on a fresh project

Type: prototype
Status: open
Blocked by: 09, 10, 11, 12, 13, 15

## Question

Does the whole chain work on a project that is not this one?

Build the cheapest real version:
1. Take the mapping from tickets 09 to 12 and the emission mechanism from 13.
2. Publish a local registry item and install it with the harness from ticket 15.
3. Use the two theme blocks from the conversation (light and dark) as the input theme file.
4. Install a representative component set: button, card, input, dialog, tabs, and the chart.
5. Capture light and dark renders.

Report what looked wrong, not only what failed. Specifically watch for: invisible borders, low-contrast muted text, a sidebar that does not separate from the page, chart series that read as one colour, and focus rings that vanish in dark mode.

This prototype exists to falsify the mapping, so state the falsifications plainly.

## Constraints from the pure CLI (ticket 14, 2026-10-29)

Step 2 of the Question above is superseded by this section. The install path changed to the adapter
CLI (07 and 08, rewritten the same day). Build this prototype against the CLI, not a registry item:

1. Install with `pnpm dlx <pkg>@<exact> init` (or the probe's `pnpm add -D ./tarball` plus the CLI),
   after `shadcn-svelte init` and with the two theme blocks under `src/daisyui-theme.css`.
2. The CLI writes the bindings; the plugin emits `--daisy-color-*` and `--daisy-radius` from the
   theme. One list must drive both, or a renamed key becomes an invalid token.
3. The plugin emits nothing when the theme file is absent and throws E2/E3 when it is malformed
   (07 decision 5). A missing theme must build and render the CLI-written fallbacks.
4. Do not write raw `--color-*` names. Ticket 14 measured that a binding such as
   `--primary: var(--color-primary, …)` forms a cycle with `@theme inline`'s
   `--color-primary: var(--primary)` and the fallback is ignored
   (`evidence/14-override-rerun/cli-missing-theme/`).
5. The escape hatch is a user file the CLI creates empty beside the stylesheet plus one import line;
   the override wins by `html:not(.dark)` / `html.dark`, not by source order (14, decisions 1 and 2).

## Answer

<!-- fill on resolution: what worked, what looked wrong, what the mapping must change -->
