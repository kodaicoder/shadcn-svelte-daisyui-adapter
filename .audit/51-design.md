# Ticket 51 design: one review module, three field routes

Synthesis decision: base candidate 2, with the optional-swatch graft from candidates 1 and 3. The cross-judge scored base 2 highest on literal safety and the drive contract, and flagged candidate 4's fixed-copy claim as false.

## Usage

```svelte
<!-- src/routes/review/input/+page.svelte; Input from ui, FieldReview from #lib/review -->
<FieldReview control="input" title="Input">
	{#snippet controls()}
		<Input data-case="base" aria-label="Input" />
		<Input data-case="filled" value="Example" aria-label="Filled input" />
		<!-- focus, invalid, disabled, readonly -->
	{/snippet}
</FieldReview>
```

```svelte
<!-- src/routes/+page.svelte, one section after the refactor -->
<section id="checkbox" data-control="checkbox" class="space-y-4">
	<h2 class="text-sm font-semibold tracking-widest uppercase">Checkbox</h2>
	{#each SCHEMES as scheme}
		<Scheme {scheme}>
			<!-- unchanged rows -->
			<SwatchRow />
		</Scheme>
	{/each}
</section>
```

## Shape

One frozen record is authored; every other list derives from it.

```ts
// src/lib/review/tones.ts
export const TONES = {
	default: { fill: 'bg-primary', foreground: 'text-primary-foreground', border: 'border-primary', soft: 'bg-primary/10', strong: 'bg-primary/20' },
	// six more, classes copied verbatim from +page.svelte
} satisfies Record<string, ToneClasses>;
export const TONE_NAMES = Object.keys(TONES) as Tone[];
export const SCHEMES = ['light', 'dark'] as const;
export const OUTLINE_TONES = [['outline', 'default'], /* six more */] as const;
export type Tone = keyof typeof TONES;
export type Scheme = (typeof SCHEMES)[number];
export type FieldKind = 'input' | 'native-select' | 'textarea';
```

Module map:

| File | Props | Renders |
| --- | --- | --- |
| `Scheme.svelte` | `{ scheme, children }` | the current wrapper, class string byte-identical, plus the `h3` |
| `SwatchRow.svelte` | none | seven tones of `fill` / `soft` / `foreground` / `border`, `data-muted-swatch`, `data-strong-swatch="success"` |
| `FieldReview.svelte` | `{ control, title, controls }` | `h1`, `section#<control>[data-control]`, then `Scheme` per scheme around `controls()` |
| `index.ts` | - | `TONES`, `TONE_NAMES`, `SCHEMES`, `OUTLINE_TONES`, `Scheme`, `SwatchRow`, `FieldReview` |

Chain: route to `FieldReview` to `Scheme` is three hops. `SwatchRow` is not rendered on a field page because the field has no tone; the legend would claim a support the stock does not have.

## Journeys

`drive.mjs` gains `REVIEW = { input: 'input', 'native-select': 'native-select', textarea: 'textarea' }`, one `checkField(record, scope, label)` (base border, focus ring, invalid border and ring, disabled opacity and cursor, readonly, typed value), and three journeys that `goto(\`${BASE}review/${kind}\`)`. Kind extras: textarea `resize: none`; native-select `data-size="sm"` height, chevron `pointer-events: none`, `selectOption` changes the value. Existing journeys untouched.

## Rejected shapes

- `/review/[component]` param route: unknown slugs need a guard and the control markup collapses into a branch.
- A `FieldReview` that takes a component type: props differ per kind, so it needs `any`.
- Tone classes as `@utility` in `layout.css`: widens the blast radius into a file `ui` shares.
- Rendering the tone legend on field pages: claims tone support the stock does not have.

## Fixed copies

`input` and `textarea` import `ui` (dry-run: stock equals fixed). `native-select` gets `native-select-fixed/` from `init.mjs fix native-select`, copy, revert `ui/native-select` and the `layout.css` header, LF normalize. `pnpm test:adapter` stays 12/12.

## Risks

- The wrapper class string must stay byte-identical, or the dark scope and six journeys break.
- `TONES` still exists twice (app and `drive.mjs`). `checkTones` fails at "7 of N" the moment they diverge.
