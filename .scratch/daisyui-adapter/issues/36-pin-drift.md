# 36: Move the supported shadcn-svelte pin

Session IDs:
Lesson:
Check:

**What to build:** The adapter supports the stock that `shadcn-svelte add` produces today, or refuses a stock it does not support with a clear message. The live `mira` registry has moved past the `src/lib/components/ui` snapshot: `sheet.json` now ships a separate `sheet-close.svelte` without `bg-secondary`, `button.json` uses `rounded-md` and `text-xs/relaxed font-medium`, and `badge.json` and `card.json` no longer hold their pinned strings. A fresh app that runs `add` today reports 63 `customized` sites, so the fixer applies almost nothing.

**Blocked by:** None

**Status:** ready-for-agent

- [ ] Either move the pin: refresh `src/lib/components/ui` from the supported `shadcn-svelte` version, update the `targets.mjs` stock and fixed strings, and move the seam expectations with a recorded reason; or narrow `SUPPORTED` to the pin's exact version and make the runtime guard refuse a newer one before the report.
- [ ] The README and `SUPPORTED` name the same supported version and the same install command.
- [ ] A fresh SvelteKit project adds the targets from the live registry, runs `init`, and reports every present site `fixed`, with no `customized` row caused by drift.
- [ ] `pnpm --filter` build of the harness page still passes after the move.
- [ ] The drift test compares the manifest with the refreshed pin at the new version.
