# Docs and onboarding

Type: grilling
Status: resolved
Blocked by: 07, 09

## Question

What does a stranger read before they trust this?

Decide the structure and the required content, not the prose:
1. The preconditions page section: shadcn through step 4, `components.json`, the CSS path.
2. The theme page section: where to get a daisyUI theme, which file to paste it into, the two-name rule and how the light/dark pair is detected.
3. The install section: exact commands, expected output, and the one manual line if ticket 13 requires it.
4. The mapping table: every token, its source or expression, and a note for each token we deliberately ignored.
5. The override page: escape hatch syntax and precedence.
6. Troubleshooting: the build error text from ticket 02, what it means, how to fix it.
7. What we explicitly do not do: component skins, daisyUI at runtime, more than one light/dark pair.

Also decide whether the docs live on the registry site, in the repo README, or both.

## Answer

Resolved 2026-11-03. The user docs live in `packages/daisyui-adapter/README.md`, which ships inside the
tarball. There is no separate registry site.

The README carries the user flow: prerequisites (shadcn through step 4, `components.json`, the CSS path),
the theme file and the two-block rule, the two commands and the printed output, the header comment and
the re-run rule, the optional override file and its selectors, the version policy, the build check, and
the tarball test. E1, E2, E3 and E4 are described where each one can occur, so there is no separate
troubleshooting page.

The full mapping table stays in this repo at `map.md` and tickets 09 to 12, updated by 23. It changes
with the mapping and is not the first thing a user reads; the README points at the repo for it.

"What we do not do" is the map's Out of scope: component skins, daisyUI at runtime, more than one
light/dark pair. The README already says the package is not affiliated and installs no runtime
dependency; the short section can land the next time the docs are touched.

0.3.0 is on `develop` and is not published. The version examples in the README stay at the
published 0.2.0 until the fix phase settles the final mapping and releases it.

Lesson: User docs belong to the package that ships them, so the README is the only surface; the mapping table stays with the code because it changes with it.
Check: docs - the README covers the install, header, optional overrides, version and build; the mapping table is the map and tickets 09 to 12/23, and the error text is where each error occurs.
