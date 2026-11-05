# Commit split for tickets 38 to 48

Phase A of ticket 34. Read-only, no file state changed. Written 2026-11-05.

Base: `fccf1c1`. Working tree: 22 modified tracked files, 29 untracked entries.

Method: each entry is attributed to the ticket whose audit names the change. `Split` means the entry
carries work from more than one ticket, so its intermediate states must be reconstructed by hand.
`Clean` means the whole entry belongs to one ticket and can be committed as it stands.

## Clean: one owner

| Entry | Owner | Note |
| --- | --- | --- |
| `packages/daisyui-adapter/dist/contrast.mjs` | 41 | Removes `WARNING_KIND.border`, `borderRatio`, the border warning rows. |
| `packages/daisyui-adapter/dist/map.mjs` | 45 | Adds `STATIC_TOKENS` with the `blackwhite` pair. |
| `src/lib/components/ui/checkbox/checkbox.svelte` | 47 | Animated check and minus. |
| `harness/pin-registry.mjs` | 46 | Serves `tooltip` and `label` for the evidence page. |
| `harness/shot.mjs` | 46 | Reloads once on `Outdated Optimize Dep`. Follows the component-set change. |
| `harness/prove.mjs` | 34 | The `--registry` mode. |
| `harness/states.mjs` (untracked) | 41 | Its own header says `Ticket 41 evidence`. |
| `registry-28/radius.mjs` | 47 | Exempts `switch-base` from the no-circle rule. |
| `registry-16/smoke.mjs` | 45 | 43 to 45 declarations. |
| `registry-26/fix.mjs` | 45 | 43 to 45 declarations. |
| `registry-27/safety.mjs` | 45 | 43 to 45 declarations. |
| `registry-38/outline.mjs` (untracked) | 38 | Measurement script. |
| `registry-39/check.mjs`, `registry-39/matrix.mjs` | 39 | Measurement scripts. |
| `registry-40/map-only.mjs` (untracked) | 40 | 19 checks. |
| `registry-42/tone-text.mjs` (untracked) | 42 | Measurement script. |
| `registry-44/reference.mjs` (untracked) | 44 | Reference pins. |
| `issues/38` through `issues/48` (10 untracked) | 38, 39, 40, 41, 42, 44, 45, 46, 47, 48 | One ticket each. |
| `.audit/34-release-0.3.0.todo.md` (untracked) | 34 | |
| `.audit/38-*.todo.md` through `.audit/48-*.todo.md` (10 untracked) | 38, 39, 40, 41, 42, 44, 45, 46, 47, 48 | One ticket each. |
| `issues/34-release-0.3.0.md` | 34 | Claim appended the second session ID. |

## Split: more than one owner

| Entry | Owners, in commit order | What has to be reconstructed |
| --- | --- | --- |
| `packages/daisyui-adapter/targets.mjs` | 41, 38, 42, 45, 39, 44, 48 | 22 hunks. The 887 hunk holds five tickets. Detail below. |
| `packages/daisyui-adapter/cli/init.mjs` | 40, 41, 45 | 14 hunks. `map`/`--no-fix` is 40, the border warning is 41, `STATIC_TOKENS` is 45. |
| `packages/daisyui-adapter/README.md` | 38, 39, 40, 41, 42, 45, 47 | The 43 to 45 count and the `blackwhite` paragraph are 45; the `## Commands` table is 40; the outline and bubble sentences are 38, 42 and 44; the alert sentence is 39 and 42; the switch sentence is 47. |
| `packages/daisyui-adapter/CHANGELOG.md` | 38, 39, 41, 42, 45, 47 | One release-notes block, rewritten by six tickets. Candidate for the 34 release commit instead of per ticket. |
| `src/daisyui-theme.css` | 39, 44 | 39 replaces the info, success and warning pairs. 44 sets light `base-100` to `oklch(98.5% 0 264.542)`. |
| `harness/contrast.mjs` | 39, 41, 44 | 41 removes the border columns. 39 and 44 move the reference numbers, because the theme they measure changed. |
| `harness/checklist.md` | 41, 42, 46, 47 | 41 rewrites the border rule. 46 adds the swatch note. 47 adds the states line. |
| `harness/page/+page.svelte` | 44, 45, 46, 47 | The Controls section is 46 and its states are 47. The `blackwhite` showcase rows are 45. The bubble rows are 44. Hunks are interleaved and need line-level mapping before the split. |
| `registry-30/variants.mjs` | 38, 42, 45 | 38 moves the outline pair. 42 moves the quiet pairs and the raw-text rule. 45 adds the `blackwhite` keys and the counts. |
| `registry-31/variants.mjs` | 38, 39, 41, 42, 44, 45 | The largest split. Six tickets: badge outline fill, alert keys, border removal, raw text, bubble rounding, `blackwhite` keys and counts. |
| `registry-37/warning.mjs` | 39, 41, 44 | 41 drops the border warnings. 39 moves the theme pairs and the limit list. 44 moves the page-tint reference. |

## targets.mjs hunk map

| Hunk (old line) | Owner | Change |
| --- | --- | --- |
| 105 | 44 | Muted bubble row gains `rounded-full`. |
| 465 | 47 | Switch fixed string keeps `rounded-full`. |
| 888, 895, 902, 909 | 41 | Four button solid rows lose `border-<tone>-text`. |
| 916, 923, 930, 937 | 38 then 42 | Outline rows. 38 sets `bg-<tone>/10` with `hover:bg-<tone>/30`; 42 replaces it with transparent at rest and the tone fill plus foreground on hover. |
| 944, 951, 958, 965 | 42 | Ghost rows take the tone fill and foreground on hover. |
| 972, 979, 986, 993 | 42 | Link rows. The `underline` class moves to hover. |
| 1000 (+78) | 42 then 45 | Six `primary`/`secondary` quiet rows are 42. Four `blackwhite` rows are 45. |
| 1001, 1008, 1016, 1024 | 41 | Four badge solid rows lose their border. |
| 1032, 1040, 1048, 1055 | 38 | Four badge outline rows gain `bg-<tone>/10`. |
| 1113 (+29) | 45 | Four badge `blackwhite` rows. |
| 1119, 1127, 1135, 1143 | 39 | Four alert solid rows move from card-backed text to `bg-<tone>` with `<tone>-foreground`. |
| 1143 | 45 | Alert `blackwhite` row. |
| 1151 | 44 | Bubble destructive solid: filled, rounded. |
| 1159, 1167, 1175 | 44 then 41 | Bubble solid status rows: 44 rounds them, 41 drops the border. |
| 1183, 1191, 1199, 1207 | 44 | Bubble outline rows: transparent, raw tone border and text, hover fill. |
| 1240 (+24) | 45 | Three bubble `blackwhite` rows. |
| 1304 / 1440 | 44 then 48 | 44 adds the bubble stock class. 48 adds `VARIANT_FIXED` and the `fixed` argument to `renderVariantBlock`. One hunk, two tickets. |

## Not attributable to a ticket

| Entry | Problem |
| --- | --- |
| `evidence/38-outline-surface/` (55 files) | One atomic add. Its name is 38, but the run that wrote it happened after 48 and supplies evidence for 38 through 48. It cannot be split by ticket. |
| `docs/atomic-levels.md` | Written after the last ticket. Names no ticket. |

## Cost

- 7 entries need hunk-level splitting: `targets.mjs`, `cli/init.mjs`, `README.md`, `harness/contrast.mjs`, `registry-31`, `registry-37`, `harness/page`.
- 3 entries need line-level mapping before any split: `checklist.md`, `registry-30`, `harness/page`.
- `CHANGELOG.md` is a release document and belongs in the 34 release commit unless the operator wants it split.
- The evidence directory and `docs/atomic-levels.md` need a home decided before the first commit.

## Blocking observations

1. The 43 to 45 declaration count belongs to ticket 45. Commits 38, 39, 40, 41, 42 and 44 must keep
   the count at 43 in `README.md`, `registry-16`, `registry-26` and `registry-27`.
2. Ticket 42 reverses part of ticket 38 on the outline rows. The 38 state is not recoverable from the
   final diff, only from `.audit/38-outline-surface.todo.md`.
3. Ten tickets still have an empty `Lesson:` and `Check:` and no `code-review`. The commit split does
   not change that.

## Progress

| Ticket | Commit | State |
| --- | --- | --- |
| 38 outline surface | `eb99aab` | done, reviewed, seams green |
| 39 alert fills | `eb6be6f` | done, reviewed, amended once for the `registry-31` raw-text rule |
| 40 map-only | `eeb84a5` | done, reviewed, seams green |
| 41 outline-only borders | `8caad2e` | done, reviewed, seams green |
| 42 quiet button states | `7d4d33b` | done, reviewed, seams green |
| 44 page tint and bubble | `b94e9e2` | done, reviewed, seams green |
| 45 blackwhite tone | `cfd902a` | done, reviewed, seams green |
| 46 controls page | `33f62d8` | done, reviewed |
| 47 switch and controls | `9542c62` | done, reviewed, radius seam 71 |
| 48 alert default primary | `01de0e4` | done, seams green, final tree matches the recorded state |
| 34 release record | | in progress |

### Intentional deviations from the recorded final tree

Two operator rulings on 2026-11-05 fixed strings the code had outgrown. They must survive the later
tickets that rewrite the same files.

1. Ticket 41: `cli/init.mjs` contrast header and known-limit suffix, `README.md:72`, and the README
   visual-check line stop naming a border gate. Later tickets that rewrite `cli/init.mjs` (45) and
   `README.md` (44, 45, 47) must keep this wording.
2. Ticket 42: the README sentence that said the raw tone is never the text.

### Seam corrections made during reconstruction

- Ticket 39: `registry-31` raw-text rule drops the `alert:destructive` allowance, because the alert
  row stopped using raw text in 39. Amended into `eb6be6f`.
- Ticket 41: `registry-30` and `registry-31` guards inverted to require no resting border on filled
  rows, and the bubble border token matched by its prefixed form.

### Known gaps carried forward

- `TONES` in `registry-30` and `registry-31` is still the literal four, so the `primary` and
  `secondary` rows added in 42 are outside the per-tone shape checks.
- Dark filled hover at `bg-<tone>/80` drops below 4.5 for success and info (ticket 39).
- Badge anchor branch is never exercised by a fixture (ticket 42).

