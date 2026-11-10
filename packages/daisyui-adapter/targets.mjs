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
import { CURSOR_COMPONENTS, CURSOR_SITES } from './targets/cursor.mjs';
import { CREATES } from './targets/site.mjs';

export {
	ALERT_VARIANTS,
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
	ROLE_STEPS,
	SITES,
	SIZE_COMPONENTS,
	SIZE_STEPS,
	SIZES,
	SUPPORTED,
	SURFACE_COMPONENTS,
	SURFACES,
	VARIANT_COMPONENTS,
	VARIANT_ROWS,
	VARIANTS
};

const TABLES = [
	{ sites: SITES, components: COMPONENTS },
	{ sites: SIZES, components: SIZE_COMPONENTS },
	{ sites: FIELD_VARIANTS, components: FIELD_VARIANT_COMPONENTS },
	{ sites: RADIUS, components: RADIUS_COMPONENTS },
	{ sites: SURFACES, components: SURFACE_COMPONENTS },
	{ sites: VARIANTS, components: VARIANT_COMPONENTS },
	{ sites: BINARY_SITES, components: BINARY_COMPONENTS },
	{ sites: CURSOR_SITES, components: CURSOR_COMPONENTS }
];

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
	buttonVariants: BUTTON_VARIANTS,
	variantRows: VARIANT_ROWS,
	badgeVariants: BADGE_VARIANTS,
	alertVariants: ALERT_VARIANTS,
	bubbleVariants: BUBBLE_VARIANTS
};
