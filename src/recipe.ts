// @fractaldesign/fsgui - Recipe (Variants) Engine
import type {
	CompiledStyle,
	RecipeConfig,
	ResolvedTheme,
	StyleDeclaration,
	VariantOptionMap,
	VariantSelections,
	CanonicalProps
} from './types.js';
import { createStyleHelper } from './style.js';

export function canonicalAttrs(props: CanonicalProps = {}) {
	const classes = [
		props.class,
		props.variant !== undefined ? 'el-variants' : undefined,
		props.shape !== undefined ? 'el-shape' : undefined,
		props.size !== undefined ? 'el-size' : undefined,
		props.pad !== undefined ? 'el-pad' : undefined
	]
		.filter(Boolean)
		.join(' ');

	return {
		class: classes,
		'data-variant': props.variant,
		'data-size': props.size,
		'data-shape': props.shape,
		'data-pad': props.pad,
		'data-intent': props.intent
	};
}

export function createRecipeHelper(theme: ResolvedTheme, options: { strict?: boolean } = {}) {
	const style = createStyleHelper(theme, options);

	return function recipe<V extends VariantOptionMap>(config: RecipeConfig<V>) {
		const base = config.base ?? {};
		const defaultVariants = config.defaultVariants ?? ({} as VariantSelections<V>);

		return function applyVariants(selections?: VariantSelections<V>): CompiledStyle {
			const activeSelections = { ...defaultVariants, ...selections };
			let merged: StyleDeclaration = { ...base };

			if (config.variants) {
				for (const [variantKey, variantVal] of Object.entries(activeSelections)) {
					if (variantVal && config.variants[variantKey] && config.variants[variantKey][variantVal as string]) {
						const matchingDecl = config.variants[variantKey][variantVal as string];
						merged = { ...merged, ...matchingDecl };
					}
				}
			}

			return style(merged);
		};
	};
}
