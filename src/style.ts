// @fractaldesign/fsgui - Style Helper
import type { CompiledStyle, ResolvedTheme, StyleDeclaration } from './types.js';
import { mapStyleToGpui } from './gpui/element-mapper.js';
import { mapStyleToCss } from './web/css.js';
import { validateStyle } from './check/validator.js';

export function createStyleHelper(theme: ResolvedTheme, options: { strict?: boolean } = {}) {
	return function style(declaration: StyleDeclaration): CompiledStyle {
		if (options.strict !== false) {
			const { valid, errors } = validateStyle(declaration, theme);
			if (!valid) {
				const msgs = errors.map((e) => `[fsgui] ${e.message}`).join('\n');
				// In development / testing, throw an error to alert the developer or agent
				throw new Error(`Styling validation failed:\n${msgs}`);
			}
		}

		return {
			declaration,
			gpui: () => mapStyleToGpui(declaration, theme),
			css: () => mapStyleToCss(declaration, theme),
			cssText: () => {
				const cssMap = mapStyleToCss(declaration, theme);
				return Object.entries(cssMap)
					.map(([k, v]) => `${k}: ${v}`)
					.join('; ');
			},
			rustBuilder: () => {
				const out = mapStyleToGpui(declaration, theme);
				return out.rustSnippet ?? 'gpui::div()';
			}
		};
	};
}
