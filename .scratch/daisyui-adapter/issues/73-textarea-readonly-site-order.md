# 73: The textarea readonly site reports customized on a clean pin
Session IDs: ses_e327321b6ffeOE797kkxW963CD
Lesson: A site's stock has to exist before the run reads the file; deriving it from a later site's output makes a clean pin look customized.
Check: code - `packages/daisyui-adapter/test/drift.mjs` asserts the clean textarea pin reports 15 stock, 0 missing and 0 customized with `textarea-readonly-surface` stock, and the fixed-copy check keeps the emitted copy byte-identical; `.audit/73-textarea-readonly-site-order.todo.md` records the temp one-run proof, the byte-stable second run and `--strict` exiting 0.
Closeout: b80200e (tag daisyui-adapter-73)

**What to build:** `fix textarea --dry-run` on the untouched 1.8 pin reports every site `stock` except
`textarea-readonly-surface`, which it reports `customized`. The site's stock is
`transition-colors focus-visible:ring-2`, but the table hands it `transition-colors focus-visible:ring-3`,
the text `textarea-focus-ring-width` writes later in the same run. A clean project therefore needs two
`fix` runs before the readonly surface lands, and `fix --strict` exits 1 on a project the adapter never
touched.

**Status:** resolved
**Labels:** adapter, fixer
**Blocked by:** None

Found while regenerating the field copies for ticket 66. The fixer reads every site's state from the
file before it writes any of them, so a site whose stock an earlier site creates is always reported
from the older content. `input` is unaffected because its readonly stock leans on `transition-colors
file:h-6`, which no earlier site rewrites.

- [x] `fix textarea --dry-run` on the 1.8 pin reports `0 customized`
- [x] one run applies the readonly surface, with no second run needed
- [x] `pnpm test:adapter` stays green and a regenerated copy stays byte-identical

The same mechanism still marks 21 `text-*` sites customized on a full clean pin. Filed as ticket 76.
