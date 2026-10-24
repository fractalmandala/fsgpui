// @fractaldesign/fsgui - Default Design Tokens
// Handcrafted for GPUI and Web with Fractal Design Guidelines

import type { ResolvedTheme, Shape, Size, Space, Speed, Shadow, ColorToken } from './types.js';

export const defaultColors: Record<ColorToken, string> = {
	// Backgrounds & Surfaces
	bg: '#0f1115',
	bgSurface: '#16181d',
	bgPanel: '#1a1d24',
	bgSunken: '#0a0b0d',
	bgRaised: '#222630',
	bgInput: '#131519',
	bgButton: '#222630',
	stateSurface: '#262a36',
	stateHover: '#2d3240',
	stateSelected: '#363d50',

	// Typography
	textPrimary: '#f0f2f5',
	textSecondary: '#a0a6b5',
	textMuted: '#687082',
	textInverse: '#0b0c0e',

	// Borders & Rings (subtle per fractal rules)
	border: '#282d38',
	borderSubtle: '#1f232b',
	borderStrong: '#3b4353',
	ring: '#60a5fa',

	// Brand / Accent
	brand: '#3b82f6',
	brandAlt: '#60a5fa',
	brandSub: '#1d4ed8',

	// Semantic Intents
	success: '#10b981',
	successBg: '#064e3b',
	successText: '#6ee7b7',

	warning: '#f59e0b',
	warningBg: '#78350f',
	warningText: '#fcd34d',

	danger: '#ef4444',
	dangerBg: '#7f1d1d',
	dangerText: '#fca5a5',

	info: '#0ea5e9',
	infoBg: '#0c4a6e',
	infoText: '#7dd3fc',

	transparent: 'transparent'
};

// Spacing in pixels (aligned to fractalstyler 8-step canonical scale: unit-space = 4px)
export const defaultSpacing: Record<Space, number> = {
	none: 0,
	'3xs': 2,
	'2xs': 4,
	xs: 4,
	sm: 8,
	md: 12,
	bs: 16,
	lg: 24,
	xl: 32,
	'2xl': 48,
	'3xl': 64
};

// Corner radii in pixels (Strictly follows Fractal rule: max 4px, 8px, with 16px/32px for large containers)
export const defaultShapes: Record<Shape, number> = {
	square: 0,
	none: 0,
	min: 2,
	xs: 2,
	modern: 4,
	sm: 4,
	curved: 8,
	md: 8,
	bs: 16,
	lg: 32,
	round: 9999,
	full: 9999
};

// Heights in pixels (element height ladder & shell metrics)
export const defaultHeights: Record<string, number> = {
	sm: 20,
	md: 24,
	bs: 28,
	lg: 32,
	xl: 40,
	'2xl': 48,
	header: 48,
	footer: 32,
	sidebar: 260
};

// Shadows
export const defaultShadows: Record<Shadow, string> = {
	sm: '0 1px 2px 0 rgba(0, 0, 0, 0.35)',
	bs: '0 2px 4px -1px rgba(0, 0, 0, 0.45), 0 1px 2px -1px rgba(0, 0, 0, 0.35)',
	lg: '0 6px 12px -2px rgba(0, 0, 0, 0.55), 0 3px 6px -2px rgba(0, 0, 0, 0.45)',
	xl: '0 12px 24px -4px rgba(0, 0, 0, 0.65), 0 6px 12px -4px rgba(0, 0, 0, 0.55)',
	'2xl': '0 20px 32px -6px rgba(0, 0, 0, 0.75)'
};

// Typography scale (font size and line height in px)
export const defaultTypography: Record<Size, { fontSize: number; lineHeight: number }> = {
	sm: { fontSize: 12, lineHeight: 16 },
	md: { fontSize: 13, lineHeight: 18 },
	bs: { fontSize: 14, lineHeight: 20 },
	lg: { fontSize: 16, lineHeight: 22 },
	xl: { fontSize: 20, lineHeight: 26 }
};

// Complete Typography Scale (xs through 5xl)
export const defaultFullTypography: Record<string, { fontSize: number; lineHeight: number }> = {
	xs: { fontSize: 11, lineHeight: 16 },
	sm: { fontSize: 12, lineHeight: 16 },
	md: { fontSize: 13, lineHeight: 18 },
	bs: { fontSize: 14, lineHeight: 20 },
	lg: { fontSize: 16, lineHeight: 22 },
	xl: { fontSize: 20, lineHeight: 26 },
	'2xl': { fontSize: 24, lineHeight: 30 },
	'3xl': { fontSize: 30, lineHeight: 36 },
	'4xl': { fontSize: 36, lineHeight: 42 },
	'5xl': { fontSize: 48, lineHeight: 56 }
};

// Speeds in ms
export const defaultSpeeds: Record<Speed, number> = {
	fast: 120,
	normal: 200,
	slow: 350
};

export const defaultTheme: ResolvedTheme = {
	colors: defaultColors,
	spacing: defaultSpacing,
	shapes: defaultShapes,
	shadows: defaultShadows,
	typography: defaultTypography,
	speeds: defaultSpeeds
};
