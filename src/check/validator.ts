// @fractaldesign/fsgui - Style & Agent Drift Validator
import type { ResolvedTheme, StyleDeclaration } from '../types.js';

export interface ValidationError {
	property: string;
	value: any;
	allowedTokens: string[];
	message: string;
}

export function validateStyle(
	decl: StyleDeclaration,
	theme: ResolvedTheme
): { valid: boolean; errors: ValidationError[] } {
	const errors: ValidationError[] = [];

	const colorKeys = Object.keys(theme.colors);
	const spacingKeys = Object.keys(theme.spacing);
	const shapeKeys = Object.keys(theme.shapes);
	const shadowKeys = Object.keys(theme.shadows);
	const typographyKeys = Object.keys(theme.typography);
	const speedKeys = Object.keys(theme.speeds);

	function checkToken(
		prop: string,
		val: any,
		allowed: string[],
		allowNumbers = false
	) {
		if (val === undefined || val === null) return;
		if (typeof val === 'number' && allowNumbers) return;

		const strVal = String(val);
		if (strVal.endsWith(' !custom')) return; // Allowed explicit escape hatch

		if (!allowed.includes(strVal)) {
			errors.push({
				property: prop,
				value: val,
				allowedTokens: allowed,
				message: `Invalid value "${val}" for property "${prop}". Value must be one of [${allowed.slice(0, 10).join(', ')}${allowed.length > 10 ? ', ...' : ''}] or explicitly marked with " !custom" (e.g. "${val} !custom").`
			});
		}
	}

	// Layout
	checkToken('display', decl.display, ['flex', 'grid', 'block', 'inline-flex', 'none']);
	checkToken('flexDirection', decl.flexDirection, ['row', 'column', 'row-reverse', 'column-reverse']);
	checkToken('alignItems', decl.alignItems, ['start', 'center', 'end', 'stretch', 'baseline']);
	checkToken('justifyContent', decl.justifyContent, ['start', 'center', 'end', 'between', 'around', 'evenly']);
	checkToken('gap', decl.gap, spacingKeys);
	checkToken('rgap', decl.rgap, spacingKeys);
	checkToken('cgap', decl.cgap, spacingKeys);

	// Spacing (longform and shorthands)
	checkToken('padding', decl.padding, spacingKeys);
	checkToken('paddingX', decl.paddingX, spacingKeys);
	checkToken('paddingY', decl.paddingY, spacingKeys);
	checkToken('paddingTop', decl.paddingTop, spacingKeys);
	checkToken('paddingRight', decl.paddingRight, spacingKeys);
	checkToken('paddingBottom', decl.paddingBottom, spacingKeys);
	checkToken('paddingLeft', decl.paddingLeft, spacingKeys);
	checkToken('pad', decl.pad, spacingKeys);
	checkToken('px', decl.px, spacingKeys);
	checkToken('py', decl.py, spacingKeys);
	checkToken('pt', decl.pt, spacingKeys);
	checkToken('pr', decl.pr, spacingKeys);
	checkToken('pb', decl.pb, spacingKeys);
	checkToken('pl', decl.pl, spacingKeys);

	checkToken('margin', decl.margin, [...spacingKeys, 'auto']);
	checkToken('marginX', decl.marginX, [...spacingKeys, 'auto']);
	checkToken('marginY', decl.marginY, [...spacingKeys, 'auto']);
	checkToken('marginTop', decl.marginTop, [...spacingKeys, 'auto']);
	checkToken('marginRight', decl.marginRight, [...spacingKeys, 'auto']);
	checkToken('marginBottom', decl.marginBottom, [...spacingKeys, 'auto']);
	checkToken('marginLeft', decl.marginLeft, [...spacingKeys, 'auto']);
	checkToken('mar', decl.mar, [...spacingKeys, 'auto']);
	checkToken('mx', decl.mx, [...spacingKeys, 'auto']);
	checkToken('my', decl.my, [...spacingKeys, 'auto']);
	checkToken('mt', decl.mt, [...spacingKeys, 'auto']);
	checkToken('mr', decl.mr, [...spacingKeys, 'auto']);
	checkToken('mb', decl.mb, [...spacingKeys, 'auto']);
	checkToken('ml', decl.ml, [...spacingKeys, 'auto']);

	// Dimensions
	checkToken('width', decl.width, [...spacingKeys, 'full', 'auto', 'screen']);
	checkToken('height', decl.height, [...spacingKeys, 'full', 'auto', 'screen', 'header', 'footer', 'sidebar', 'sm', 'md', 'bs', 'lg', 'xl', '2xl']);

	// Colors
	checkToken('backgroundColor', decl.backgroundColor, colorKeys);
	checkToken('bg', decl.bg, colorKeys);
	checkToken('color', decl.color, colorKeys);
	checkToken('borderColor', decl.borderColor, colorKeys);

	// Shapes & Borders (including partition-law lines)
	const borderOptions = ['none', 'default', 'sub', 'str', 'true', 'false', true as any, false as any];
	checkToken('border', decl.border, borderOptions);
	checkToken('bt', decl.bt, borderOptions);
	checkToken('br', decl.br, borderOptions);
	checkToken('bb', decl.bb, borderOptions);
	checkToken('bl', decl.bl, borderOptions);
	checkToken('borderRadius', decl.borderRadius, shapeKeys);
	checkToken('borderWidth', decl.borderWidth, ['0', '1', '2', '4'], true);

	// Typography
	checkToken('fontSize', decl.fontSize, [...typographyKeys, 'xs', 'sm', 'md', 'bs', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl']);
	checkToken('shadow', decl.shadow, shadowKeys);
	checkToken('transitionDuration', decl.transitionDuration, speedKeys);

	return {
		valid: errors.length === 0,
		errors
	};
}
