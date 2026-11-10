export const TONES = {
	default: {
		fill: 'bg-primary',
		foreground: 'text-primary-foreground',
		border: 'border-primary',
		soft: 'bg-primary/10',
		strong: 'bg-primary/20'
	},
	secondary: {
		fill: 'bg-secondary',
		foreground: 'text-secondary-foreground',
		border: 'border-secondary-foreground dark:border-secondary',
		soft: 'bg-secondary/10',
		strong: 'bg-secondary/20'
	},
	success: {
		fill: 'bg-success',
		foreground: 'text-success-foreground',
		border: 'border-success-text',
		soft: 'bg-success/10',
		strong: 'bg-success/20'
	},
	warning: {
		fill: 'bg-warning',
		foreground: 'text-warning-foreground',
		border: 'border-warning-text',
		soft: 'bg-warning/10',
		strong: 'bg-warning/20'
	},
	info: {
		fill: 'bg-info',
		foreground: 'text-info-foreground',
		border: 'border-info-text',
		soft: 'bg-info/10',
		strong: 'bg-info/20'
	},
	destructive: {
		fill: 'bg-destructive',
		foreground: 'text-destructive-foreground',
		border: 'border-destructive-text',
		soft: 'bg-destructive/10',
		strong: 'bg-destructive/20'
	},
	blackwhite: {
		fill: 'bg-blackwhite',
		foreground: 'text-blackwhite-foreground',
		border: 'border-blackwhite',
		soft: 'bg-blackwhite/10',
		strong: 'bg-blackwhite/20'
	}
} satisfies Record<
	string,
	{ fill: string; foreground: string; border: string; soft: string; strong: string }
>;

export const TONE_NAMES = Object.keys(TONES) as Tone[];
export const SCHEMES = ['light', 'dark'] as const;
export const OUTLINE_TONES = [
	'outline',
	'outline-secondary',
	'outline-success',
	'outline-warning',
	'outline-info',
	'outline-destructive',
	'outline-blackwhite'
] as const;

export type Tone = keyof typeof TONES;
export type Scheme = (typeof SCHEMES)[number];
export type FieldKind = 'input' | 'native-select' | 'textarea';
