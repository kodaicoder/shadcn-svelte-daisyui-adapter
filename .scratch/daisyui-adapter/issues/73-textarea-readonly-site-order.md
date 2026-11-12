# 73: The textarea readonly site reports customized on a clean pin

**What to build:** `fix textarea --dry-run` on the untouched 1.8 pin reports every site `stock` except
`textarea-readonly-surface`, which it reports `customized`. The site's stock is
`transition-colors focus-visible:ring-2`, but the table hands it `transition-colors focus-visible:ring-3`,
the text `textarea-focus-ring-width` writes later in the same run. A clean project therefore needs two
`fix` runs before the readonly surface lands, and `fix --strict` exits 1 on a project the adapter never
touched.

**Status:** ready-for-agent
**Labels:** adapter, fixer
**Blocked by:** None

Found while regenerating the field copies for ticket 66. The fixer reads every site's state from the
file before it writes any of them, so a site whose stock an earlier site creates is always reported
from the older content. `input` is unaffected because its readonly stock leans on `transition-colors
file:h-6`, which no earlier site rewrites.

- [ ] `fix textarea --dry-run` on the 1.8 pin reports `0 customized`
- [ ] one run applies the readonly surface, with no second run needed
- [ ] `pnpm test:adapter` stays green and a regenerated copy stays byte-identical
