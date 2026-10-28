# Install contract: preconditions, errors, commands

Type: grilling
Status: open
Blocked by: 20

## Question

What is the user's exact sequence, and what happens when they deviate?

Decide:
1. The prerequisite state we assume: shadcn-svelte installed through step 4, `components.json` present, CSS file path from `components.json`.
2. Where the theme file lives, its fixed name, and whether we accept an override.
3. The exact commands, in order, including the registry URL form.
4. What the install prints on success, and what it prints when the theme file is missing or malformed. Ticket 04 found `docs` prints nothing, so the only gate is build time. Decide what the user sees there, and whether the adapter should also emit a warning comment into the CSS file.
5. Whether the adapter should degrade gracefully (render with the step-4 defaults) or fail the build when the theme file is absent. Pick one.

## Answer

<!-- fill on resolution -->
