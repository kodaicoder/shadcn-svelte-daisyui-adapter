# Mechanism spike: prove the install mechanics on a real build

Type: task
Status: open
Blocked by: 15

## Question

Every remaining design ticket rests on three claims read from source but never observed. Prove or falsify them with a throwaway registry item before 07, 08 and 13 are decided.

Build a disposable item that does all of the following, install it into the harness project from ticket 15 through a locally served registry, and report evidence:

1. `css: { "@plugin \"./spike-plugin.js\"": {} }` lands at top level after the last `@import`, and the build loads the plugin. The plugin must leave an observable trace (emit a recognisable custom property, or log on load).
2. `cssVars.light` and `cssVars.dark` overwrite the values inside the existing `:root` and `.dark` blocks in place, rather than appending new blocks. Include a before/after diff of the CSS file.
3. A plain `--color-popover: var(--popover)` declaration is what sonner needs, because `@theme inline` emits no `--color-*`. Render a toast and capture the computed background, or explain precisely why rendering was not possible.
4. Re-running `add` on the same item does not duplicate the injected `@plugin` line.
5. Running `add` in a project where the CSS file is missing produces the documented error, and the files are already written at that point (confirm the order).
6. Two consecutive `add` runs on items with `cssVars` do not inject `@import "shadcn-svelte/tailwind.css"` twice.

Evidence required: the generated CSS file, the build output, and one screenshot or computed-style dump. Store artefacts under `.scratch/daisyui-adapter/spike/`.

This ticket is the proof gate. If claim 1 or 2 fails, tickets 07, 08 and 13 must be re-opened, not patched around.

## Answer

<!-- fill on resolution: claim by claim, pass or fail, with the artefact that proves it -->
