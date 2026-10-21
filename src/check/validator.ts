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

	// Spacing
	checkToken('padding', decl.padding, spacingKeys);
	checkToken('paddingX', decl.paddingX, spacingKeys);
	checkToken('paddingY', decl.paddingY, spacingKeys);
	checkToken('paddingTop', decl.paddingTop, spacingKeys);
	checkToken('paddingRight', decl.paddingRight, spacingKeys);
	checkToken('paddingBottom', decl.paddingBottom, spacingKeys);
	checkToken('paddingLeft', decl.paddingLeft, spacingKeys);

	checkToken('margin', decl.margin, [...spacingKeys, 'auto']);
	checkToken('marginX', decl.marginX, [...spacingKeys, 'auto']);
	checkToken('marginY', decl.marginY, [...spacingKeys, 'auto']);

	// Dimensions
	checkToken('width', decl.width, [...spacingKeys, 'full', 'auto', 'screen']);
	checkToken('height', decl.height, [...spacingKeys, 'full', 'auto', 'screen', 'header', 'footer']);

	// Colors
	checkToken('backgroundColor', decl.backgroundColor, colorKeys);
	checkToken('color', decl.color, colorKeys);
	checkToken('borderColor', decl.borderColor, colorKeys);

	// Shapes & Borders
	checkToken('borderRadius', decl.borderRadius, shapeKeys);
	checkToken('borderWidth', decl.borderWidth, ['0', '1', '2', '4'], true);

	// Typography
	checkToken('fontSize', decl.fontSize, typographyKeys);
	checkToken('shadow', decl.shadow, shadowKeys);
	checkToken('transitionDuration', decl.transitionDuration, speedKeys);

	return {
		valid: errors.length === 0,
		errors
	};
}
