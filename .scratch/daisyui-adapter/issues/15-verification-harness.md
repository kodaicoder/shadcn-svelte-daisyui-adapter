# Verification harness

Type: task
Status: open
Blocked by: none

## Question

Nothing on this map can be proven without a disposable project to install into. Build the harness before the prototype needs it.

Required:
1. A script (node or shell) that creates a fresh SvelteKit project in a temp directory, runs `shadcn-svelte init` non-interactively, and leaves it ready for `add`.
2. A way to point that project's `add` at a locally served registry JSON, so the harness does not depend on the public deployment.
3. A build step that fails loudly when the CSS or the plugin throws.
4. Screenshot or DOM evidence of at least one rendered component in light and dark.
5. Cleanup, and a `--keep` flag for debugging.

Constraints: never touch the current repo's own dev server, use a dedicated port, and keep the temp directory outside the repo. Follow the repo's existing `verify` skill conventions where they fit.

## Answer

<!-- fill on resolution: where the script lives, how to run it, what it prints -->
