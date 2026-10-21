// @fractaldesign/fsgui - Config Engine
import type { FsThemeConfig, ResolvedTheme } from './types.js';
import { defaultTheme } from './defaults.js';
import { createStyleHelper } from './style.js';
import { createRecipeHelper } from './recipe.js';
import { generateRustTokens } from './gpui/rust-gen.js';
import { toGpuiTheme } from './gpui/theme.js';
import { toCssVariables } from './web/css.js';

export interface FsConfigInput {
	theme?: FsThemeConfig;
	strict?: boolean;
}

export function resolveTheme(userTheme?: FsThemeConfig): ResolvedTheme {
	if (!userTheme) return defaultTheme;

	return {
		colors: {
			...defaultTheme.colors,
			...(userTheme.colors as any)
		},
		spacing: {
			...defaultTheme.spacing,
			...(userTheme.spacing as any)
		},
		shapes: {
			...defaultTheme.shapes,
			...(userTheme.shapes as any)
		},
		shadows: {
			...defaultTheme.shadows,
			...(userTheme.shadows as any)
		},
		typography: {
			...defaultTheme.typography,
			...(userTheme.typography as any)
		},
		speeds: {
			...defaultTheme.speeds,
			...(userTheme.speeds as any)
		}
	};
}

export function defineConfig(config: FsConfigInput = {}) {
	const theme = resolveTheme(config.theme);
	const strict = config.strict ?? true;

	const style = createStyleHelper(theme, { strict });
	const recipe = createRecipeHelper(theme, { strict });

	return {
		theme,
		style,
		recipe,
		toRust: () => generateRustTokens(theme),
		toCss: () => toCssVariables(theme),
		toGpuiTheme: () => toGpuiTheme(theme)
	};
}
