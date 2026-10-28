# Non-colour tokens: radius, border, depth, noise

Type: grilling
Status: open
Blocked by: 01, 03

## Question

daisyUI exposes three radii, two sizes, a border width, a depth flag, and a noise flag. shadcn exposes one `--radius` with a computed scale, plus border widths from Tailwind.

Decide:
1. How `--radius-box`, `--radius-field`, `--radius-selector` collapse into `--radius`. Which one wins, or is it an expression?
2. Whether the shadcn radius scale (`sm` to `4xl`) stays as the `calc(var(--radius) * n)` proportions from the template, or gets re-derived from the three daisyUI radii.
3. What happens to `--border` (1px, 2px). shadcn has no token for it. Expose it, ignore it, or apply it to `border-width` utilities.
4. What happens to `--depth` and `--noise`. daisyUI uses them for shadows and texture. shadcn has no shadow tokens. Ignore in v1, or map depth to a shadow scale?
5. What happens to `--size-selector` and `--size-field`. shadcn component heights come from Tailwind utilities, not a token.

Record anything you decide to ignore, so the docs can say so plainly instead of leaving users guessing.

Depends on tickets 01 and 03.

## Answer

<!-- fill on resolution -->
