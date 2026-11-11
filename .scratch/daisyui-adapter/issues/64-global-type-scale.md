# 64: A global type scale
Session IDs:
Lesson:
Check:

**What to build:** one type scale for the system, defined in `@theme`, and component metrics that
derive from it. The operator wants a single change to the default font size to move every component's
text, box and padding.

**Status:** ready-for-agent
**Labels:** typography, adapter, review
**Blocked by:** None

Approved direction from the ticket 51 review. The fields are the reference: 12/14/16 text with
24/28/32 boxes. This ticket moves the scale to the whole system.

- [ ] `@theme` defines `--text-xs` 10, `--text-sm` 12, `--text-base` 14, `--text-lg` 16,
      `--text-xl` 18 and `--text-2xl` 20, with their line heights
- [ ] every component is remapped to the new names; the old `text-xs` 12 moves to `text-sm` 12, the
      old `text-sm` 14 moves to `text-base` 14
- [ ] the field sizes reference the tokens: `sm` `--text-sm`, `default` `--text-base`, `lg` `--text-lg`
- [ ] the box metrics derive from the token: height 2×, textarea `min-h` 4×, padding-x 0.5×
- [ ] radius stays on its theme scale, the border stays 1 px, and the page spacing stays on the
      spacing scale
- [ ] the journeys read the tokens or compute from them instead of hardcoding px
- [ ] changing `--text-base` from 14 to 15 moves text, height and padding together
- [ ] the operator passes the components again on the new scale
