export type ToneClasses = {
	fill: string;
	foreground: string;
	border: string;
	ring: string;
	soft: string;
	strong: string;
};

export type Tone =
	'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive' | 'blackwhite';

export const TONES = {
	default: {
		fill: 'bg-primary',
		foreground: 'text-primary-foreground',
		border: 'border-primary',
		ring: 'ring-primary/30',
		soft: 'bg-primary/10',
		strong: 'bg-primary/20'
	},
	secondary: {
		fill: 'bg-secondary',
		foreground: 'text-secondary-foreground',
		border: 'border-secondary-foreground dark:border-secondary',
		ring: 'ring-secondary/30',
		soft: 'bg-secondary/10',
		strong: 'bg-secondary/20'
	},
	success: {
		fill: 'bg-success',
		foreground: 'text-success-foreground',
		border: 'border-success-text',
		ring: 'ring-success/30',
		soft: 'bg-success/10',
		strong: 'bg-success/20'
	},
	warning: {
		fill: 'bg-warning',
		foreground: 'text-warning-foreground',
		border: 'border-warning-text',
		ring: 'ring-warning/30',
		soft: 'bg-warning/10',
		strong: 'bg-warning/20'
	},
	info: {
		fill: 'bg-info',
		foreground: 'text-info-foreground',
		border: 'border-info-text',
		ring: 'ring-info/30',
		soft: 'bg-info/10',
		strong: 'bg-info/20'
	},
	destructive: {
		fill: 'bg-destructive',
		foreground: 'text-destructive-foreground',
		border: 'border-destructive-text',
		ring: 'ring-destructive/30',
		soft: 'bg-destructive/10',
		strong: 'bg-destructive/20'
	},
	blackwhite: {
		fill: 'bg-blackwhite',
		foreground: 'text-blackwhite-foreground',
		border: 'border-blackwhite',
		ring: 'ring-blackwhite/30',
		soft: 'bg-blackwhite/10',
		strong: 'bg-blackwhite/20'
	}
} satisfies Record<Tone, ToneClasses>;

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

export type ColorScheme = (typeof SCHEMES)[number];
export type FieldKind = 'input' | 'native-select' | 'textarea';
