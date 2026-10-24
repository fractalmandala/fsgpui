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

	lines.push('  --unit-space: 0.25rem;');
	lines.push('  --text-scaling: 1.25;');
	lines.push('  --text-xs: 0.67rem;');
	lines.push('  --text-sm: 0.75rem;');
	lines.push('  --text-md: clamp(0.8333rem, 0.8061rem + 0.1212vw, 0.9rem);');
	lines.push('  --text-bs: clamp(1rem, 0.9489rem + 0.2273vw, 1rem);');
	lines.push('  --text-lg: clamp(1.2rem, 1.1156rem + 0.375vw, 1.4063rem);');
	lines.push('  --text-xl: clamp(1.44rem, 1.31rem + 0.5778vw, 1.7578rem);');
	lines.push('  --text-2xl: clamp(1.728rem, 1.536rem + 0.8532vw, 2.1973rem);');
	lines.push('  --text-3xl: clamp(2.0736rem, 1.7983rem + 1.2236vw, 2.7466rem);');
	lines.push('  --text-4xl: clamp(2.4883rem, 2.1018rem + 1.718vw, 3.4332rem);');
	lines.push('  --text-5xl: clamp(2.986rem, 2.4519rem + 2.3737vw, 4.2915rem);');

	lines.push('  --height-sm: 20px;');
	lines.push('  --height-md: 24px;');
	lines.push('  --height-bs: 28px;');
	lines.push('  --height-lg: 32px;');
	lines.push('  --height-xl: 40px;');
	lines.push('  --height-2xl: 48px;');
	lines.push('  --header-height: 48px;');
	lines.push('  --footer-height: 32px;');
	lines.push('  --sidebar-width: 260px;');

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

	// Gap
	const rawGap = decl.gap;
	if (rawGap) {
		const g = stripCustom(rawGap);
		css['gap'] = typeof g === 'string' && g in theme.spacing ? `var(--space-${g}, ${theme.spacing[g as Space]}px)` : `${g}`;
	}
	if (decl.rgap) {
		const g = stripCustom(decl.rgap);
		css['row-gap'] = typeof g === 'string' && g in theme.spacing ? `var(--space-${g}, ${theme.spacing[g as Space]}px)` : `${g}`;
	}
	if (decl.cgap) {
		const g = stripCustom(decl.cgap);
		css['column-gap'] = typeof g === 'string' && g in theme.spacing ? `var(--space-${g}, ${theme.spacing[g as Space]}px)` : `${g}`;
	}

	// Padding
	const allPad = decl.padding ?? decl.pad;
	if (allPad) {
		const p = stripCustom(allPad);
		css['padding'] = typeof p === 'string' && p in theme.spacing ? `var(--space-${p}, ${theme.spacing[p as Space]}px)` : `${p}`;
	}
	const padX = decl.paddingX ?? decl.px;
	if (padX) {
		const pxVal = stripCustom(padX);
		const val = typeof pxVal === 'string' && pxVal in theme.spacing ? `var(--space-${pxVal}, ${theme.spacing[pxVal as Space]}px)` : `${pxVal}`;
		css['padding-inline'] = val;
	}
	const padY = decl.paddingY ?? decl.py;
	if (padY) {
		const pyVal = stripCustom(padY);
		const val = typeof pyVal === 'string' && pyVal in theme.spacing ? `var(--space-${pyVal}, ${theme.spacing[pyVal as Space]}px)` : `${pyVal}`;
		css['padding-block'] = val;
	}
	const padT = decl.paddingTop ?? decl.pt;
	if (padT) {
		const ptVal = stripCustom(padT);
		css['padding-top'] = typeof ptVal === 'string' && ptVal in theme.spacing ? `var(--space-${ptVal}, ${theme.spacing[ptVal as Space]}px)` : `${ptVal}`;
	}
	const padR = decl.paddingRight ?? decl.pr;
	if (padR) {
		const prVal = stripCustom(padR);
		css['padding-right'] = typeof prVal === 'string' && prVal in theme.spacing ? `var(--space-${prVal}, ${theme.spacing[prVal as Space]}px)` : `${prVal}`;
	}
	const padB = decl.paddingBottom ?? decl.pb;
	if (padB) {
		const pbVal = stripCustom(padB);
		css['padding-bottom'] = typeof pbVal === 'string' && pbVal in theme.spacing ? `var(--space-${pbVal}, ${theme.spacing[pbVal as Space]}px)` : `${pbVal}`;
	}
	const padL = decl.paddingLeft ?? decl.pl;
	if (padL) {
		const plVal = stripCustom(padL);
		css['padding-left'] = typeof plVal === 'string' && plVal in theme.spacing ? `var(--space-${plVal}, ${theme.spacing[plVal as Space]}px)` : `${plVal}`;
	}

	// Margin
	const allMar = decl.margin ?? decl.mar;
	if (allMar) {
		const m = stripCustom(allMar);
		css['margin'] = typeof m === 'string' && m in theme.spacing ? `var(--space-${m}, ${theme.spacing[m as Space]}px)` : `${m}`;
	}
	const marX = decl.marginX ?? decl.mx;
	if (marX) {
		const mxVal = stripCustom(marX);
		css['margin-inline'] = typeof mxVal === 'string' && mxVal in theme.spacing ? `var(--space-${mxVal}, ${theme.spacing[mxVal as Space]}px)` : `${mxVal}`;
	}
	const marY = decl.marginY ?? decl.my;
	if (marY) {
		const myVal = stripCustom(marY);
		css['margin-block'] = typeof myVal === 'string' && myVal in theme.spacing ? `var(--space-${myVal}, ${theme.spacing[myVal as Space]}px)` : `${myVal}`;
	}
	const marT = decl.marginTop ?? decl.mt;
	if (marT) {
		const mtVal = stripCustom(marT);
		css['margin-top'] = typeof mtVal === 'string' && mtVal in theme.spacing ? `var(--space-${mtVal}, ${theme.spacing[mtVal as Space]}px)` : `${mtVal}`;
	}
	const marR = decl.marginRight ?? decl.mr;
	if (marR) {
		const mrVal = stripCustom(marR);
		css['margin-right'] = typeof mrVal === 'string' && mrVal in theme.spacing ? `var(--space-${mrVal}, ${theme.spacing[mrVal as Space]}px)` : `${mrVal}`;
	}
	const marB = decl.marginBottom ?? decl.mb;
	if (marB) {
		const mbVal = stripCustom(marB);
		css['margin-bottom'] = typeof mbVal === 'string' && mbVal in theme.spacing ? `var(--space-${mbVal}, ${theme.spacing[mbVal as Space]}px)` : `${mbVal}`;
	}
	const marL = decl.marginLeft ?? decl.ml;
	if (marL) {
		const mlVal = stripCustom(marL);
		css['margin-left'] = typeof mlVal === 'string' && mlVal in theme.spacing ? `var(--space-${mlVal}, ${theme.spacing[mlVal as Space]}px)` : `${mlVal}`;
	}

	// Background & Ink
	const bg = decl.backgroundColor ?? decl.bg;
	if (bg) {
		const b = stripCustom(bg);
		css['background-color'] = typeof b === 'string' && b in theme.colors ? `var(--${toKebabCase(b)}, ${theme.colors[b as ColorToken]})` : `${b}`;
	}
	if (decl.color) {
		const c = stripCustom(decl.color);
		css['color'] = typeof c === 'string' && c in theme.colors ? `var(--${toKebabCase(c)}, ${theme.colors[c as ColorToken]})` : `${c}`;
	}

	// Shape & Radius
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

	// Partition-Law Borders (1px hairline)
	function applyCssBorder(prop: string, val: any) {
		if (!val || val === 'none' || val === false || val === 'false') return;
		const borderVar = val === 'sub' ? 'var(--border-subtle)' : val === 'str' ? 'var(--border-strong)' : 'var(--border)';
		css[prop] = `1px solid ${borderVar}`;
	}
	applyCssBorder('border', decl.border);
	applyCssBorder('border-top', decl.bt);
	applyCssBorder('border-right', decl.br);
	applyCssBorder('border-bottom', decl.bb);
	applyCssBorder('border-left', decl.bl);

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
