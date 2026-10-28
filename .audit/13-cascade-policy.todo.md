Phase: Ticket

# Ticket 13 - cascade policy

This feature is map-planned: `.scratch/daisyui-adapter/map.md` is the planning artefact and
`issues/13-cascade-policy.md` is the ticket named by Nut in the session brief ("Work on ticket 13,
branch feat/daisyui-adapter at 57e7284"). There is no `spec.md` and no `Status: approved` line on the
ticket set; 13 is forbidden from editing other tickets, `src/`, or the map's Destination and Notes.

Ticket step, in the ticket's own words: resolve five decisions by grilling. No adapter code.

## Decisions (grilled with Nut, one question at a time)

- [x] D1 carrier: `css` maps keyed `:root` and `.dark`, rewriting the stock declarations in place.
      `cssVars` rejected: same runtime result, 31 self-referential `@theme inline` entries measured.
- [x] D2 no user edit. The old "wrap the bindings in `@layer base`" idea is deleted.
- [x] D3 lifecycle: `add -a` and `add <component>` leave the stylesheet byte-identical; re-add is
      byte-identical; a later `init` wipes values (structure survives) and the original `add`
      restores them.
- [x] D4 namespace `--daisy-color-<daisyui-name>` and `--daisy-radius`; layering is irrelevant for
      the referenced name, uniqueness is the requirement.
- [x] D5 scrim keeps `bg-black/20` with no adapter output; sonner needs no output.

## Proof (harness, not source)

- [x] `registry-13/`: three-item set (`cascade-raw`, `cssvars-namespaced`, `daisyui-adapter`), probe
      package emitting the chosen namespace plus a deliberate `--primary` collision, two-block theme,
      built `r/`
- [x] `harness/run.mjs`: `--then` (repeatable post-add pnpm command with a stylesheet snapshot) and
      `--props` (runtime custom properties); `harness/shot.mjs` reads the requested properties
- [x] `cascade-raw` (`2026-10-28T09-51-18-660Z`): compiled base layer has `--primary:red` / `#0f0`,
      computed `--primary` stays step-4
- [x] `cssvars` (`2026-10-28T09-51-35-478Z`): binds at runtime, adds 31 dead `@theme inline` entries
- [x] `re-add` (`2026-10-28T09-51-52-731Z`): byte-identical second add, `@theme` untouched,
      unlayered binding resolves the layered value, selector beats a utility
- [x] `init` (`2026-10-28T10-32-58-916Z`): values wiped, `@plugin` line and probe rule survive; the
      second `--then` re-adds the item and restores all 64 bindings
- [x] `add-all` (`2026-10-28T09-52-37-136Z`) and `add-component` (`2026-10-28T09-53-13-385Z`):
      byte-identical stylesheet, build passes
- [x] Artefacts copied to `evidence/13-cascade-policy/`; `registry-13/check.mjs` runs 34 checks green

## Closing

- [x] `## Answer` with each decision and its reason, `Status: resolved`
- [x] One line in the map's `## Decisions so far`
- [x] `no-comments`
- [x] `code-review` on the Spec axis against base `57e7284`
- [ ] Commit on `feat/daisyui-adapter`, pushed

## Review gates

- Review loop (interrogate): skip: grilling ticket, the diff is harness plumbing, a throwaway probe
  fixture, ticket prose and evidence. No auth, payments, migrations, concurrency, shared state,
  public API or DB schema. Nut's brief routes this ticket to grilling only.

### `no-comments`

One general reviewer read the four executable files. Findings and disposition:

- `check.mjs` `themeBlock` was a second block reader with a false-pass path: a missing `\n}` made
  both sides `''`, so "unchanged" passed. Deleted; `topLevelBlock` is the only reader and the
  @theme checks require a non-empty block.
- `runCapture` comment restated its signature. Reworded to the constraint: the caller writes the
  transcript before it fails.
- `check.mjs` arm B said "one dead entry per key"; it is 31 for 32 keys because radius has no
  `--color-*` twin. Corrected, then the arm comments were cut back to experiment labels.
- The probe's un-namespaced `--daisy-<token>` emission was read by nothing. Removed at the root:
  the `cssvars-unprefixed` registry item is gone, the probe emits only `--daisy-color-*` and
  `--daisy-radius`, and all six cited runs were redone with that probe.
- Probe header's cross-ticket reference trimmed; the "probe values, not the mapping table"
  constraint stays.
- Kept with proof: the numeric-`code` guard in `runCapture` (a timeout or missing binary must
  surface as a harness fault), the Windows child-tree kill (the spawn uses a shell, so `dev.kill()`
  leaves the port holder), and the daisyUI radius source comment.
- Rejected as pre-existing lines outside this diff: the empty `taskkill` catch, the bare catch in
  the dev-ready loop, `// Node writes no BOM`, the numbered step narration, and `// did the plugin
  reach the compiled CSS?`. They belong to the harness's own upkeep, not ticket 13.

### `code-review` (Spec + Standards, base `57e7284`, working tree)

Spec findings, all fixed:

- Decision 1 claimed all 64 bindings replace stock values. `--radius` in `.dark` is an insertion
  (step 4 has it only in `:root`). Reworded to 63 replacements and one insertion.
- Decision 5 said "the item ships no selector rule" while the probe item carries
  `[data-slot="button"]`. Now the shipped item (17) carries none and the probe rule is named as the
  measurement.
- The overlay slot list was stated as measured. Marked read from the four `*-overlay.svelte` files;
  only the button selector is rendered and measured.
- "Recovery is the original `add`" had no run. Added a second `--then` after `init`; three checks
  cover the restored 64 bindings, the structure and the runtime values.
- `cssVars` "one dead entry per key" explained 31 of 32; radius takes the CLI's separate branch.
  Corrected, and a check now asserts the stock block has zero self-references.
- `cssvars` evidence claimed a compiled copy and a diff file. Reworded to the source/runtime files
  and the check that asserts the addition.
- The harness extension was undocumented. Added a Harness change paragraph for `--then` and
  `--props`.
- The probe's mapping was called "placeholder derivations". It is surface-first like 09 but uses
  plain daisyUI tokens; the text now says so, and overlay rendering is listed as not proved.
- The map line said `cssVars` "adds ... to achieve" the result; cause and effect reversed. Reworded.
- Audit counts and the fixture item list were stale. Fixed.

Standards findings, fixed:

- Magic `64` and `31` in `check.mjs`: replaced by `BINDINGS` and `COLOR_KEYS` derived from the
  fixture's `cssVars` key count.
- `count` shadowed the `text` helper and returned 1 for a non-global pattern: renamed
  `occurrences(source, pattern)`.
- `--then` re-scanned the argv and could swallow `--props` as its value: added `options(name)` with
  a missing-value guard, and documented the whitespace split.
- The probe read the theme twice: one read, then `.toString('utf8')` and `.length` from the same
  buffer.
- `shot.mjs` `read` renamed `snapshot`; the check usage line now names the repo-root invocation.

Standards findings, dismissed with reasons:

- Hand-written `dist/index.js` in a probe package: this is a throwaway fixture. 16 and 17 own the
  TypeScript modules and `prepare: tsc`; 08 set the same precedent.
- `report.then` / `??=`: the report is serialized evidence, never awaited. Renaming the key would
  invalidate every committed `run.json` for no behavioural gain.
- Two CSS block readers in `check.mjs`: one reads the CLI's pretty-printed source, the other the
  minified compiled CSS. Different inputs, different jobs.
- `check()` accumulates failures in script scope: the harness script idiom, same as 08's
  `check-css.mjs`.

Confirmation pass:

- The `cssVars.dark` radius claim was an inference. Verified against the fetched preset item
  (`/init?preset=a0`): 32 light keys, 31 dark keys, no dark `radius`. The Answer now cites that.
- `check.txt` was written UTF-16LE by PowerShell. Rewritten as UTF-8 without BOM.
- The init-alias note no longer claims an unlogged hang; it states the five flags a non-interactive
  `init` needs.
