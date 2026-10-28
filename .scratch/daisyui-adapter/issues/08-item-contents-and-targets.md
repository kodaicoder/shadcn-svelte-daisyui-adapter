# Item contents and file targets

Type: grilling
Status: open
Blocked by: 20

## Question

What exactly does the registry item install, and where does each file land?

Decide:
1. The full file list: plugin file, static binding CSS, any helper module. For each, its `type`, its `target`, and the path it lands at.
2. **How the injected `@plugin` path resolves.** The CLI writes a static string, but the correct relative path depends on where the user's CSS file sits relative to the lib alias. Options: publish the plugin as an npm package and inject a bare specifier (`@plugin "daisyui-adapter"`), inject an assumed relative path for the conventional layout, or fall back to a documented manual line. Pick one and state what breaks outside the conventional layout. Ticket 02 proposes a fourth: resolve the theme file as a sibling of the adapter module, which only works when the module is installed into the project.
3. Whether the plugin is a single file or split into parser and mapping modules. A split needs either an npm package or multiple `@plugin` entries.
4. Which files are `registry:lib` (alias-derived) versus `registry:file` (explicit target), and why.
5. The item's `dependencies` list, including our own package if option 2 lands there.
6. Whether the item declares `registryDependencies` (for example `button`) or installs bare.
7. Whether the item should also declare `cssVars` for the token bindings, given ticket 04's finding that they overwrite in place. Note that another item's `cssVars` already injects `@import "shadcn-svelte/tailwind.css"` into the CSS file on every add.

Depends on ticket 04 for what the CLI can actually apply.

## Answer

<!-- fill on resolution -->
