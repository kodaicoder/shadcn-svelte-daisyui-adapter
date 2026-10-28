Phase: Ticket

# Ticket 08 - item contents and file targets

This feature is map-planned: `.scratch/daisyui-adapter/map.md` is the planning artefact and
`issues/08-item-contents-and-targets.md` is the approved ticket, named by Nut in the session brief
("Work on ticket 08 ... branch feat/daisyui-adapter at 3c0d3fe"). There is no `spec.md` and no
`Status: approved` line on the ticket set, and 08 is forbidden from editing other tickets.

Ticket step, in the ticket's own words: resolve seven decisions by grilling. No adapter code.

## Decisions (grilled with Nut, one question at a time)

- [x] D2 `@plugin` resolution: npm package, bare specifier.
- [x] D3 split: 3 modules `index.ts` / `parse.ts` / `map.ts`, TS to `dist/`, `{ handler }` default,
      no `tailwindcss/plugin` import.
- [x] D1 + D4 file list and targets: `files: []`, `type: registry:lib`, nothing lands in the project.
- [x] Package surface: `exports` only `.`, `files: ["dist"]`, `prepare: tsc`, no runtime or peer deps.
- [x] D5 dependencies: `dependencies: []`, `devDependencies: ["<pkg>@0.1.0"]`; CLI installs with `-D`.
- [x] D6 `registryDependencies: []`, install bare.
- [x] D7 `cssVars`: none for now, provisional, 13 owns the carrier; three constraints recorded.

## Proof (harness, not source)

- [x] `registry-08/`: probe item (`files: []`, `css` bare specifier, `devDependencies` tarball),
      probe package, two-block theme, `check.mjs`, built `r/`
- [x] `harness/run.mjs`: `--layout`, `--package`, `--theme`, `--sentinel`; `css-before`/`css-after`
      names; tarball name asserted from the packed `package.json`
- [x] Run `--layout app` (`2026-10-28T08-02-40-125Z`): add exit 0, CSS line lands, dependency installs,
      build passes, both sentinels in compiled CSS
- [x] Run `--layout routes` (`2026-10-28T08-03-01-867Z`): same, into `src/routes/layout.css`
- [x] Artefacts copied to `evidence/08-item-shape/`

## Closing

- [x] `## Answer` with each decision and its reason, `Status: resolved`
- [x] One line in the map's `## Decisions so far`
- [x] `no-comments`
- [x] `code-review` on the Spec axis against base `3c0d3fe`
- [x] Commit on `feat/daisyui-adapter` (`f33039d`), pushed

## Review gates

- Review loop (interrogate): skip: grilling ticket, diff is harness plumbing plus a probe fixture,
  no auth, payments, migrations, concurrency, shared state, public API or DB schema. Nut agreed.

### `no-comments`

One general reviewer read the four executable files. Findings and disposition:

- Usage synopsis line for the new flags: killed, the per-flag lines below cover it.
- `runCapture` rationale: KILL rejected, reworded to one line. The file's other helpers throw, so a
  reader would "fix" this one back into throwing and drop the transcript. Intentional design, not a
  restatement.
- `// 7b. did the plugin ...` step narration: killed.
- `// 6. optional package tarball ...` kept: pre-existing numbered narration in the same file, only
  extended for accuracy. A file-wide sweep is out of scope for a surgical diff.
- No dead code by scope: no unused imports, no suppressions.

### `code-review` (Spec + Standards, base `3c0d3fe`, uncommitted diff)

Spec findings, all fixed:

- Theme file was never read (`exists=false` in the cited log) and the build still passed, the silent
  green build 07 forbids. Added `--theme`, a real two-block fixture, a probe that throws when the
  theme is absent, and `--probe-08-theme-bytes:2240` in the compiled CSS.
- Ticket question 7's `@import "shadcn-svelte/tailwind.css"` note was unanswered. Answered with the
  measurement: `shadcnImports: 1` from the `@plugin` line alone.
- Decision 3 read as if the TS build ran. Added a scope-limit paragraph: the probe ships a
  hand-written `dist/index.js`; 16 and 17 own the modules and `prepare: tsc`.
- Decision 5's exact-version and skip-if-satisfied claims were stated as observed. Moved to a
  read-from-CLI note with 17 as owner.
- `r/*.json` was cited as built with no build log. `registry-build.log` committed.
- `package-json-before.json` was written and unused. Committed and cited as the before side.
- Routes evidence files were named `app-*` while the stylesheet was `src/routes/layout.css`. Renamed
  `css-before.css` / `css-after.css`.
- Relative-prelude and `registry:item` claims had no citation. Now cite 20's stylesheet-relative
  observation and research 04 §4 (`registry/index.ts` L206-L259).

Standards findings, all fixed:

- `runCapture` swallowed timeout and spawn faults as exit code 1. Re-throws when `error.code` is not
  numeric.
- Conditional sentinel artefact: absent `clientDir` left no file, so "not found" and "never ran"
  looked alike. The file is always written, with the reason inside.
- Duplicated exec options: one `execOptions(cmd, cwd)`.
- Hardcoded ticket-08 sentinel in the shared harness: replaced by `--sentinel <prefix>`.
- Weak tarball selection: the expected name is computed from the packed `package.json` and asserted.
- Duplicated fixture constant (`daisyui-adapter-08-probe` in three artefacts): dismissed. Each
  occurrence has a different role (item CSS, package name, assertion) and the fixture is throwaway.

Confirmation pass on the same reviewer session:

- Decision 7's `@import` sentence over-read the artefact (the fixture already had the import, so the
  run shows no duplication, not injection). Reworded to match the measurement and to attribute
  injection to research 04 §7 and 20's from-zero run.
- Malformed-theme behaviour: not 08's, and the Answer now says so under "Not proved here".
- "The theme file is never imported, so no build parses it": dismissed. 02 settled that the theme is
  read as text, never imported, because parsing it as CSS would require the daisyUI package we refuse
  to install.

## Not proved here

- The CLI-driven install against a published npm name, the exact-version form, and the
  skip-when-satisfied branch: 17 publishes first. The probe exercises the same `-D` path with a
  `file:` tarball spec.
- The TypeScript build: 16 and 17.
