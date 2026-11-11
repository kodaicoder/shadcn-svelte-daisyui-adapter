// The one target manifest: the stock the fixer patches and the shadcn-svelte version it patches. The
// `stock` strings come from the pinned `src/lib/components/ui` snapshot at 1.8; nine of the eleven
// contrast sites match every style, so the style label is not part of the guard.
// A radius or surface entry whose 1.8 stock already holds the role step repeats the string as its
// own `fixed`: the fixer reports it `fixed` and writes nothing, and `--check` still fails when a
// hand edit moves it off the step.
// `packages/daisyui-adapter/test/drift.mjs` fails when the pin moves without this list.

import { COMPONENTS, PAIRS, SITES, SUPPORTED } from './targets/contrast.mjs';
import { FIELD_VARIANT_COMPONENTS, FIELD_VARIANTS } from './targets/field-variants.mjs';
import { RADIUS, RADIUS_COMPONENTS, ROLE_STEPS, SIZE_STEPS } from './targets/radius.mjs';
import { RING_COMPONENTS, RINGS } from './targets/rings.mjs';
import { SIZE_COMPONENTS, SIZES } from './targets/sizes.mjs';
import { SURFACE_COMPONENTS, SURFACES } from './targets/surfaces.mjs';
import {
	ALERT_VARIANTS,
	BADGE_VARIANTS,
	BUBBLE_VARIANTS,
	BUTTON_VARIANTS,
	VARIANT_COMPONENTS,
	VARIANT_ROWS,
	VARIANTS
} from './targets/variants.mjs';
import { BINARY_COMPONENTS, BINARY_SITES } from './targets/binary.mjs';
import { ATOM_TONE_COMPONENTS, ATOM_TONES } from './targets/atom-tones.mjs';
import { CURSOR_COMPONENTS, CURSOR_SITES } from './targets/cursor.mjs';
import { CREATES } from './targets/site.mjs';
import { TEXT_RUNGS } from './targets/text-rungs.mjs';

export {
	ALERT_VARIANTS,
	ATOM_TONE_COMPONENTS,
	ATOM_TONES,
	BADGE_VARIANTS,
	BINARY_COMPONENTS,
	BINARY_SITES,
	BUBBLE_VARIANTS,
	BUTTON_VARIANTS,
	COMPONENTS,
	CREATES,
	CURSOR_COMPONENTS,
	CURSOR_SITES,
	FIELD_VARIANT_COMPONENTS,
	FIELD_VARIANTS,
	PAIRS,
	RADIUS,
	RADIUS_COMPONENTS,
	RING_COMPONENTS,
	RINGS,
	ROLE_STEPS,
	SITES,
	SIZE_COMPONENTS,
	SIZE_STEPS,
	SIZES,
	SUPPORTED,
	SURFACE_COMPONENTS,
	SURFACES,
	TEXT_RUNGS,
	VARIANT_COMPONENTS,
	VARIANT_ROWS,
	VARIANTS
};

// The rung shift is generated from the pinned stock, so every component it names gets a site, not
// only the components the hand-written tables happen to touch.
export const TEXT_RUNG_COMPONENTS = [...new Set(TEXT_RUNGS.map((site) => site.component))];

const BASE_TABLES = [
	{ sites: SITES, components: COMPONENTS },
	{ sites: SIZES, components: SIZE_COMPONENTS },
	{ sites: FIELD_VARIANTS, components: FIELD_VARIANT_COMPONENTS },
	{ sites: ATOM_TONES, components: ATOM_TONE_COMPONENTS },
	{ sites: RADIUS, components: RADIUS_COMPONENTS },
	{ sites: SURFACES, components: SURFACE_COMPONENTS },
	{ sites: VARIANTS, components: VARIANT_COMPONENTS },
	{ sites: BINARY_SITES, components: BINARY_COMPONENTS },
	{ sites: CURSOR_SITES, components: CURSOR_COMPONENTS },
	{ sites: RINGS, components: RING_COMPONENTS }
];

const TABLES = [...BASE_TABLES, { sites: TEXT_RUNGS, components: TEXT_RUNG_COMPONENTS }];

export const BASE_SITES = BASE_TABLES.flatMap((table) => table.sites);
export const ALL_SITES = TABLES.flatMap((table) => table.sites);
export const KNOWN_COMPONENTS = [...new Set(TABLES.flatMap((table) => table.components))];

export const TARGETS = {
	supported: SUPPORTED,
	components: COMPONENTS,
	sites: SITES,
	pairs: PAIRS,
	radius: RADIUS,
	radiusComponents: RADIUS_COMPONENTS,
	sizes: SIZES,
	sizeComponents: SIZE_COMPONENTS,
	fieldVariants: FIELD_VARIANTS,
	fieldVariantComponents: FIELD_VARIANT_COMPONENTS,
	surfaces: SURFACES,
	surfaceComponents: SURFACE_COMPONENTS,
	variants: VARIANTS,
	variantComponents: VARIANT_COMPONENTS,
	binarySites: BINARY_SITES,
	binaryComponents: BINARY_COMPONENTS,
	cursorSites: CURSOR_SITES,
	cursorComponents: CURSOR_COMPONENTS,
	rings: RINGS,
	ringComponents: RING_COMPONENTS,
	textRungs: TEXT_RUNGS,
	textRungComponents: TEXT_RUNG_COMPONENTS,
	buttonVariants: BUTTON_VARIANTS,
	variantRows: VARIANT_ROWS,
	badgeVariants: BADGE_VARIANTS,
	alertVariants: ALERT_VARIANTS,
	bubbleVariants: BUBBLE_VARIANTS
};
