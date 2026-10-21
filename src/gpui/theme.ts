// @fractaldesign/fsgui - GPUI Theme & Unit Mappers
import type { ResolvedTheme, ColorToken } from '../types.js';

export interface GpuiColor {
	hex: string;
	r: number;
	g: number;
	b: number;
	a: number;
	rustLiteral: string; // e.g. "gpui::rgba(0x0f1115ff)" or "gpui::hsla(0.6, 0.2, 0.1, 1.0)"
}

export function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } {
	if (hex === 'transparent') {
		return { r: 0, g: 0, b: 0, a: 0 };
	}

	let clean = hex.replace('#', '');
	if (clean.length === 3) {
		clean = clean.split('').map((c) => c + c).join('') + 'ff';
	} else if (clean.length === 6) {
		clean += 'ff';
	}

	const num = parseInt(clean, 16);
	const r = (num >> 24) & 255;
	const g = (num >> 16) & 255;
	const b = (num >> 8) & 255;
	const a = (num & 255) / 255;

	return { r, g, b, a };
}

export function toGpuiColor(hex: string): GpuiColor {
	const { r, g, b, a } = hexToRgb(hex);
	const hexClean = hex === 'transparent' ? '00000000' : hex.replace('#', '') + (hex.length === 7 ? 'ff' : '');
	const rustLiteral = hex === 'transparent' 
		? 'gpui::rgba(0x00000000)' 
		: `gpui::rgba(0x${hexClean.toLowerCase()})`;

	return {
		hex,
		r,
		g,
		b,
		a,
		rustLiteral
	};
}

export interface GpuiThemeExport {
	colors: Record<ColorToken, GpuiColor>;
	spacing: Record<string, { px: number; rustSnippet: string }>;
	shapes: Record<string, { px: number; rustSnippet: string }>;
	typography: Record<string, { fontSizePx: number; lineHeightPx: number }>;
}

export function toGpuiTheme(theme: ResolvedTheme): GpuiThemeExport {
	const colors = {} as Record<ColorToken, GpuiColor>;
	for (const [key, val] of Object.entries(theme.colors)) {
		colors[key as ColorToken] = toGpuiColor(val);
	}

	const spacing = {} as Record<string, { px: number; rustSnippet: string }>;
	for (const [key, val] of Object.entries(theme.spacing)) {
		spacing[key] = {
			px: val,
			rustSnippet: `gpui::px(${val.toFixed(1)})`
		};
	}

	const shapes = {} as Record<string, { px: number; rustSnippet: string }>;
	for (const [key, val] of Object.entries(theme.shapes)) {
		shapes[key] = {
			px: val,
			rustSnippet: `gpui::px(${val.toFixed(1)})`
		};
	}

	const typography = {} as Record<string, { fontSizePx: number; lineHeightPx: number }>;
	for (const [key, val] of Object.entries(theme.typography)) {
		typography[key] = {
			fontSizePx: val.fontSize,
			lineHeightPx: val.lineHeight
		};
	}

	return {
		colors,
		spacing,
		shapes,
		typography
	};
}
