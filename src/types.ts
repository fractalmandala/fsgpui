// @fractaldesign/fsgui - Core Type Definitions
// Unified typed styling contracts for GPUI (Rust) and Web

export const VARIANTS = [
	'primary',
	'secondary',
	'themed',
	'outline',
	'ghost',
	'link',
	'icon'
] as const;
export type Variant = (typeof VARIANTS)[number];

export const SIZES = ['sm', 'md', 'bs', 'lg', 'xl'] as const;
export type Size = (typeof SIZES)[number];

export const SHAPES = ['square', 'min', 'modern', 'curved', 'round'] as const;
export type Shape = (typeof SHAPES)[number] | 'bs' | 'lg' | 'none' | 'xs' | 'sm' | 'md' | 'full';

export const INTENTS = ['info', 'success', 'warning', 'danger'] as const;
export type Intent = (typeof INTENTS)[number];

export const ACTIONS = ['button', 'submit', 'reset'] as const;
export type Action = (typeof ACTIONS)[number];

export const ORIENTATIONS = ['horizontal', 'vertical'] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const PLACEMENTS = [
	'top',
	'top-start',
	'top-end',
	'bottom',
	'bottom-start',
	'bottom-end',
	'left',
	'left-start',
	'left-end',
	'right',
	'right-start',
	'right-end'
] as const;
export type Placement = (typeof PLACEMENTS)[number];

export const ALIGNS = ['start', 'center', 'end', 'stretch', 'baseline'] as const;
export type Align = (typeof ALIGNS)[number];

export const JUSTIFIES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;
export type Justify = (typeof JUSTIFIES)[number];

export const SPACES = [
	'none',
	'3xs',
	'2xs',
	'xs',
	'sm',
	'md',
	'bs',
	'lg',
	'xl',
	'2xl',
	'3xl'
] as const;
export type Space = (typeof SPACES)[number];

export const SPEEDS = ['fast', 'normal', 'slow'] as const;
export type Speed = (typeof SPEEDS)[number];

export const SHADOWS = ['sm', 'bs', 'lg', 'xl', '2xl'] as const;
export type Shadow = (typeof SHADOWS)[number];

export const PADS = ['sm', 'md', 'bs', 'lg', 'xl'] as const;
export type Pad = (typeof PADS)[number];

// The `data-*` aliases the public API has always shipped under.
export type DataVariant = Variant;
export type DataSize = Size;
export type DataShape = Shape;
export type DataPad = Pad;

// The axes are class-qualified: an element opts into an axis by carrying the
// matching class from `_10_propped.sass`, and the preset runtime then writes
// the `data-*` value onto it. The element itself is not the qualifier.
export const VARIANT_TARGETS = '.el-variants';
export const SHAPE_TARGETS = '.el-shape';
export const SIZE_TARGETS = '.el-size';
export const PAD_TARGETS = '.el-pad';

export const presetApplication = [
	VARIANT_TARGETS,
	SHAPE_TARGETS,
	SIZE_TARGETS,
	PAD_TARGETS
] as const;

export interface CanonicalProps {
	variant?: Variant;
	size?: Size;
	shape?: Shape;
	pad?: Pad;
	intent?: Intent;
	class?: string;
}

// The intentional escape hatch for deliberate non-system values
export type CustomValue = `${string} !custom`;

export type WithCustom<T extends string> = T | CustomValue;

// Color Palette Keys
export type ColorToken =
	| 'bg'
	| 'bgSurface'
	| 'bgPanel'
	| 'bgSunken'
	| 'bgRaised'
	| 'bgInput'
	| 'bgButton'
	| 'stateSurface'
	| 'stateHover'
	| 'stateSelected'
	| 'textPrimary'
	| 'textSecondary'
	| 'textMuted'
	| 'textInverse'
	| 'border'
	| 'borderSubtle'
	| 'borderStrong'
	| 'ring'
	| 'brand'
	| 'brandAlt'
	| 'brandSub'
	| 'success'
	| 'successBg'
	| 'successText'
	| 'warning'
	| 'warningBg'
	| 'warningText'
	| 'danger'
	| 'dangerBg'
	| 'dangerText'
	| 'info'
	| 'infoBg'
	| 'infoText'
	| 'transparent';

// Theme Contract (Values in hex/rgb/rgba/hsla or numbers)
export interface FsThemeConfig {
	colors?: Partial<Record<ColorToken, string>>;
	spacing?: Partial<Record<Space, number | string>>;
	shapes?: Partial<Record<Shape, number | string>>;
	shadows?: Partial<Record<Shadow, string>>;
	typography?: Partial<Record<Size, { fontSize: number | string; lineHeight?: number | string }>>;
	speeds?: Partial<Record<Speed, number | string>>;
}

// Complete resolved theme
export interface ResolvedTheme {
	colors: Record<ColorToken, string>;
	spacing: Record<Space, number>; // in pixels
	shapes: Record<Shape, number>; // in pixels
	shadows: Record<Shadow, string>;
	typography: Record<Size, { fontSize: number; lineHeight: number }>;
	speeds: Record<Speed, number>; // in ms
}

// Strict Style Declaration (properties only accept tokens or `!custom`)
export interface StyleDeclaration {
	// Layout
	display?: WithCustom<'flex' | 'grid' | 'block' | 'inline-flex' | 'none'>;
	flexDirection?: WithCustom<'row' | 'column' | 'row-reverse' | 'column-reverse'>;
	alignItems?: WithCustom<Align>;
	justifyContent?: WithCustom<Justify>;
	gap?: WithCustom<Space>;
	flexWrap?: WithCustom<'wrap' | 'nowrap' | 'wrap-reverse'>;
	flexGrow?: WithCustom<'0' | '1' | 'auto'> | number;
	flexShrink?: WithCustom<'0' | '1'> | number;

	// Dimensions
	width?: WithCustom<Space | 'full' | 'auto' | 'screen'>;
	maxWidth?: WithCustom<Space | 'full' | 'prose' | 'screen'>;
	minWidth?: WithCustom<Space | 'full' | '0'>;
	height?: WithCustom<Space | Size | 'full' | 'auto' | 'screen' | 'header' | 'footer' | 'sidebar' | '2xl'>;
	maxHeight?: WithCustom<Space | 'full' | 'screen'>;
	minHeight?: WithCustom<Space | 'full' | '0'>;

	// Spacing (Longform and fractalstyler 17-family shorthands)
	padding?: WithCustom<Space>;
	paddingX?: WithCustom<Space>;
	paddingY?: WithCustom<Space>;
	paddingTop?: WithCustom<Space>;
	paddingRight?: WithCustom<Space>;
	paddingBottom?: WithCustom<Space>;
	paddingLeft?: WithCustom<Space>;
	pad?: WithCustom<Space>;
	px?: WithCustom<Space>;
	py?: WithCustom<Space>;
	pt?: WithCustom<Space>;
	pr?: WithCustom<Space>;
	pb?: WithCustom<Space>;
	pl?: WithCustom<Space>;

	margin?: WithCustom<Space | 'auto'>;
	marginX?: WithCustom<Space | 'auto'>;
	marginY?: WithCustom<Space | 'auto'>;
	marginTop?: WithCustom<Space | 'auto'>;
	marginRight?: WithCustom<Space | 'auto'>;
	marginBottom?: WithCustom<Space | 'auto'>;
	marginLeft?: WithCustom<Space | 'auto'>;
	mar?: WithCustom<Space | 'auto'>;
	mx?: WithCustom<Space | 'auto'>;
	my?: WithCustom<Space | 'auto'>;
	mt?: WithCustom<Space | 'auto'>;
	mr?: WithCustom<Space | 'auto'>;
	mb?: WithCustom<Space | 'auto'>;
	ml?: WithCustom<Space | 'auto'>;

	rgap?: WithCustom<Space>;
	cgap?: WithCustom<Space>;

	// Colors & Surfaces
	backgroundColor?: WithCustom<ColorToken>;
	bg?: WithCustom<ColorToken>;
	color?: WithCustom<ColorToken>;

	// Borders & Shapes (including partition-law lines)
	borderRadius?: WithCustom<Shape>;
	borderColor?: WithCustom<ColorToken>;
	borderWidth?: WithCustom<'0' | '1' | '2' | '4'> | number;
	border?: WithCustom<'none' | 'default' | 'sub' | 'str'> | boolean;
	bt?: WithCustom<'none' | 'default' | 'sub' | 'str'> | boolean;
	br?: WithCustom<'none' | 'default' | 'sub' | 'str'> | boolean;
	bb?: WithCustom<'none' | 'default' | 'sub' | 'str'> | boolean;
	bl?: WithCustom<'none' | 'default' | 'sub' | 'str'> | boolean;

	// Typography
	fontSize?: WithCustom<Size | 'xs' | 'sm' | 'md' | 'bs' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'>;
	fontWeight?: WithCustom<'normal' | 'medium' | 'semibold' | 'bold'> | number;
	lineHeight?: WithCustom<Size | 'none' | 'normal' | 'tight' | 'snug' | 'relaxed' | '1.1' | '1.2' | '1.3' | '1.4' | '1.5' | '1.6'>;

	// Effects & Animations
	shadow?: WithCustom<Shadow>;
	opacity?: WithCustom<'0' | '25' | '50' | '75' | '100'> | number;
	transitionDuration?: WithCustom<Speed>;
}

// GPUI View Style Representation (mapped for Rust/GPUI renderer)
export interface GpuiStyleOutput {
	flex: boolean;
	direction: 'row' | 'column';
	align: Align;
	justify: Justify;
	gap: number; // in pixels
	padding: [number, number, number, number]; // top, right, bottom, left in px
	margin: [number, number, number, number];
	width?: number | 'full' | 'auto';
	height?: number | 'full' | 'auto';
	backgroundColor?: string; // hex/hsla
	color?: string;
	borderColor?: string;
	borderWidth?: number;
	borderRadius?: number; // in px
	shadow?: string;
	opacity?: number;
	rustSnippet?: string; // Generated GPUI element builder method chain
}

// Recipe (Variants) System
export type VariantOptionMap = Record<string, Record<string, StyleDeclaration>>;

export interface RecipeConfig<V extends VariantOptionMap> {
	base?: StyleDeclaration;
	variants?: V;
	defaultVariants?: {
		[K in keyof V]?: keyof V[K];
	};
}

export type VariantSelections<V extends VariantOptionMap> = {
	[K in keyof V]?: keyof V[K];
};

export interface CompiledStyle {
	declaration: StyleDeclaration;
	gpui: () => GpuiStyleOutput;
	css: () => Record<string, string>;
	cssText: () => string;
	rustBuilder: () => string;
}
