// @fractaldesign/fsgui - Web CSS Generator
import type { ResolvedTheme, StyleDeclaration, ColorToken, Space, Shape, Shadow } from '../types.js';

function toKebabCase(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function stripCustom(val: string | number | undefined): string | number | undefined {
	if (typeof val === 'string' && val.endsWith(' !custom')) {
		return val.replace(' !custom', '').trim();
	}
	return val;
}

export function toCssVariables(theme: ResolvedTheme): string {
	const lines: string[] = [':root {'];

	for (const [key, val] of Object.entries(theme.colors)) {
		lines.push(`  --${toKebabCase(key)}: ${val};`);
	}
	for (const [key, val] of Object.entries(theme.spacing)) {
		lines.push(`  --space-${key}: ${val}px;`);
	}
	for (const [key, val] of Object.entries(theme.shapes)) {
		lines.push(`  --radius-${key}: ${val}px;`);
	}
	for (const [key, val] of Object.entries(theme.shadows)) {
		lines.push(`  --shadow-${key}: ${val};`);
	}

	lines.push('}');
	return lines.join('\n');
}

export function mapStyleToCss(
	decl: StyleDeclaration,
	theme: ResolvedTheme
): Record<string, string> {
	const css: Record<string, string> = {};

	if (decl.display) css['display'] = String(stripCustom(decl.display));
	if (decl.flexDirection) css['flex-direction'] = String(stripCustom(decl.flexDirection));
	if (decl.alignItems) css['align-items'] = String(stripCustom(decl.alignItems));
	if (decl.justifyContent) css['justify-content'] = String(stripCustom(decl.justifyContent));

	if (decl.gap) {
		const g = stripCustom(decl.gap);
		css['gap'] = typeof g === 'string' && g in theme.spacing ? `var(--space-${g}, ${theme.spacing[g as Space]}px)` : `${g}`;
	}

	if (decl.padding) {
		const p = stripCustom(decl.padding);
		css['padding'] = typeof p === 'string' && p in theme.spacing ? `var(--space-${p}, ${theme.spacing[p as Space]}px)` : `${p}`;
	}
	if (decl.paddingX) {
		const px = stripCustom(decl.paddingX);
		const val = typeof px === 'string' && px in theme.spacing ? `var(--space-${px}, ${theme.spacing[px as Space]}px)` : `${px}`;
		css['padding-left'] = val;
		css['padding-right'] = val;
	}
	if (decl.paddingY) {
		const py = stripCustom(decl.paddingY);
		const val = typeof py === 'string' && py in theme.spacing ? `var(--space-${py}, ${theme.spacing[py as Space]}px)` : `${py}`;
		css['padding-top'] = val;
		css['padding-bottom'] = val;
	}

	if (decl.backgroundColor) {
		const bg = stripCustom(decl.backgroundColor);
		css['background-color'] = typeof bg === 'string' && bg in theme.colors ? `var(--${toKebabCase(bg)}, ${theme.colors[bg as ColorToken]})` : `${bg}`;
	}
	if (decl.color) {
		const c = stripCustom(decl.color);
		css['color'] = typeof c === 'string' && c in theme.colors ? `var(--${toKebabCase(c)}, ${theme.colors[c as ColorToken]})` : `${c}`;
	}

	if (decl.borderRadius) {
		const r = stripCustom(decl.borderRadius);
		css['border-radius'] = typeof r === 'string' && r in theme.shapes ? `var(--radius-${r}, ${theme.shapes[r as Shape]}px)` : `${r}`;
	}
	if (decl.borderColor) {
		const bc = stripCustom(decl.borderColor);
		css['border-color'] = typeof bc === 'string' && bc in theme.colors ? `var(--${toKebabCase(bc)}, ${theme.colors[bc as ColorToken]})` : `${bc}`;
	}
	if (decl.borderWidth) {
		css['border-width'] = `${stripCustom(decl.borderWidth)}px`;
		if (!css['border-style']) css['border-style'] = 'solid';
	}

	if (decl.shadow) {
		const s = stripCustom(decl.shadow);
		css['box-shadow'] = typeof s === 'string' && s in theme.shadows ? `var(--shadow-${s}, ${theme.shadows[s as Shadow]})` : `${s}`;
	}

	return css;
}

export function formatCssRule(selector: string, css: Record<string, string>): string {
	const declarations = Object.entries(css)
		.map(([prop, val]) => `  ${prop}: ${val};`)
		.join('\n');
	return `@layer fsgui {\n  ${selector} {\n${declarations}\n  }\n}`;
}
