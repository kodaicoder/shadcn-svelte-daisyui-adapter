# 79: The theme toolbar reaches the token docs pages

Session IDs: ses_e18bb5a7bffeKzAnGdTEl5lwlM
Lesson: A Storybook addon that ships a decorator only reaches stories. A docs entry runs no story decorator, so any state a docs page needs must come from a preview-level channel listener.
Check: code - `.storybook/preview.ts` subscribes to `setGlobals` and `globalsUpdated` and toggles `dark` on `<html>` for every view mode; a live manager click flips a docs page and a story, and `.verify/prove-71.mjs` stays 233/233 against a fresh static build.
Closeout: 9809d87 (tag daisyui-adapter-79)

**What to build:** make the Storybook theme toolbar switch the four `Tokens/*` docs pages between
light and dark, the way it already switches every story.

**Status:** resolved
**Labels:** bug, storybook, themes
**Blocked by:** None (can start immediately)

Reported by the operator on the live dev server: clicking light or dark on
`?path=/docs/tokens-colourroles--docs` changes nothing. Root cause: `withThemeByClassName` from
`@storybook/addon-themes` is a story decorator, and a docs entry runs no story decorator, so the
`dark` class is never written to `<html>`. The four token pages (ticket 71) paint their own surface
from `var(--background)` and `var(--foreground)`, so they would follow the class if anything set it.

## Fix

`.storybook/preview.ts` subscribes to the preview channel and writes the class itself, for every view
mode. `setGlobals` covers the boot state, `globalsUpdated` covers a toolbar change, and
`withThemeByClassName` stays for stories. The listener is idempotent with the decorator, so a story
gets the same class from both and nothing flickers.

## Verification

- Live manager, `?path=/docs/tokens-colourroles--docs`: one toolbar click moved the page from
  `oklch(0.985 0 264.542)` to `oklch(0.18 0.041 260.031)`, with `<html class="dark">` and light text.
- Live manager, `?path=/story/components-button--playground`: the story still flips, `<html
class="dark">`, body dark. No regression from the new listener.
- `pnpm check` 0 errors and 0 warnings, `prettier --check .storybook/preview.ts` clean.
- `pnpm exec vitest --run --project storybook`: 19 files, 83 tests, with the dev server stopped.
- Static build to `.verify/build-71`, then `.verify/prove-71.mjs`: 233/233 checks.

## Acceptance

- [x] the toolbar switches each `Tokens/*` page between light and dark, and the page surface, text,
      swatches and specimens follow
- [x] stories keep switching exactly as they do today, with no flicker or double apply
- [x] the static build and `pnpm exec vitest --run --project storybook` stay green
- [x] `.verify/prove-71.mjs` still passes 233/233 against a fresh static build
- [x] the fix lives in `.storybook/**`, which ticket 71's file scope excluded, and adds no new page
      workaround
