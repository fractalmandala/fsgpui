// @fractaldesign/fsgui - GPUI Element Mapper
// Maps unified style declarations to GPUI layout metrics and Rust builder method chains

import type { GpuiStyleOutput, ResolvedTheme, StyleDeclaration, Align, Justify, ColorToken, Space, Shape } from '../types.js';
import { toGpuiColor } from './theme.js';

function stripCustom(val: string | number | undefined): string | number | undefined {
	if (typeof val === 'string' && val.endsWith(' !custom')) {
		return val.replace(' !custom', '').trim();
	}
	return val;
}

export function mapStyleToGpui(
	decl: StyleDeclaration,
	theme: ResolvedTheme
): GpuiStyleOutput {
	const rustBuilders: string[] = [];

	// Layout / Flex
	const isFlex = decl.display === 'flex' || decl.display === 'inline-flex' || !decl.display;
	const isCol = decl.flexDirection === 'column' || decl.flexDirection === 'column-reverse';
	
	if (isFlex) {
		rustBuilders.push('.flex()');
		if (isCol) {
			rustBuilders.push('.flex_col()');
		} else {
			rustBuilders.push('.flex_row()');
		}
	}

	const align = (decl.alignItems ?? 'start') as Align;
	const justify = (decl.justifyContent ?? 'start') as Justify;

	if (decl.alignItems) {
		switch (decl.alignItems) {
			case 'center': rustBuilders.push('.items_center()'); break;
			case 'start': rustBuilders.push('.items_start()'); break;
			case 'end': rustBuilders.push('.items_end()'); break;
			case 'stretch': rustBuilders.push('.items_stretch()'); break;
			case 'baseline': rustBuilders.push('.items_baseline()'); break;
		}
	}

	if (decl.justifyContent) {
		switch (decl.justifyContent) {
			case 'center': rustBuilders.push('.justify_center()'); break;
			case 'start': rustBuilders.push('.justify_start()'); break;
			case 'end': rustBuilders.push('.justify_end()'); break;
			case 'between': rustBuilders.push('.justify_between()'); break;
			case 'around': rustBuilders.push('.justify_around()'); break;
		}
	}

	// Gap
	let gapPx = 0;
	if (decl.gap) {
		const rawGap = stripCustom(decl.gap);
		if (typeof rawGap === 'string' && rawGap in theme.spacing) {
			gapPx = theme.spacing[rawGap as Space];
		} else if (typeof rawGap === 'number') {
			gapPx = rawGap;
		} else if (typeof rawGap === 'string' && !isNaN(parseFloat(rawGap))) {
			gapPx = parseFloat(rawGap);
		}
		rustBuilders.push(`.gap(gpui::px(${gapPx.toFixed(1)}))`);
	}

	// Padding
	let padTop = 0;
	let padRight = 0;
	let padBottom = 0;
	let padLeft = 0;

	if (decl.padding) {
		const p = theme.spacing[stripCustom(decl.padding) as Space] ?? (parseFloat(String(stripCustom(decl.padding))) || 0);
		padTop = padRight = padBottom = padLeft = p;
		rustBuilders.push(`.p(gpui::px(${p.toFixed(1)}))`);
	} else {
		if (decl.paddingX) {
			const px = theme.spacing[stripCustom(decl.paddingX) as Space] ?? (parseFloat(String(stripCustom(decl.paddingX))) || 0);
			padLeft = padRight = px;
			rustBuilders.push(`.px(gpui::px(${px.toFixed(1)}))`);
		}
		if (decl.paddingY) {
			const py = theme.spacing[stripCustom(decl.paddingY) as Space] ?? (parseFloat(String(stripCustom(decl.paddingY))) || 0);
			padTop = padBottom = py;
			rustBuilders.push(`.py(gpui::px(${py.toFixed(1)}))`);
		}
	}

	// Margin
	let marginTop = 0;
	let marginRight = 0;
	let marginBottom = 0;
	let marginLeft = 0;

	if (decl.margin && decl.margin !== 'auto') {
		const m = theme.spacing[stripCustom(decl.margin) as Space] ?? (parseFloat(String(stripCustom(decl.margin))) || 0);
		marginTop = marginRight = marginBottom = marginLeft = m;
		rustBuilders.push(`.m(gpui::px(${m.toFixed(1)}))`);
	}

	// Background
	let bgColor: string | undefined;
	if (decl.backgroundColor) {
		const rawBg = stripCustom(decl.backgroundColor) as string;
		bgColor = theme.colors[rawBg as ColorToken] ?? rawBg;
		const gpuiColor = toGpuiColor(bgColor);
		rustBuilders.push(`.bg(${gpuiColor.rustLiteral})`);
	}

	// Text Color
	let textColor: string | undefined;
	if (decl.color) {
		const rawColor = stripCustom(decl.color) as string;
		textColor = theme.colors[rawColor as ColorToken] ?? rawColor;
		const gpuiColor = toGpuiColor(textColor);
		rustBuilders.push(`.text_color(${gpuiColor.rustLiteral})`);
	}

	// Border & Radius (Shapes)
	let borderRadiusPx: number | undefined;
	if (decl.borderRadius) {
		const rawShape = stripCustom(decl.borderRadius) as string;
		borderRadiusPx = theme.shapes[rawShape as Shape] ?? (parseFloat(rawShape) || 0);
		rustBuilders.push(`.rounded(gpui::px(${borderRadiusPx.toFixed(1)}))`);
	}

	let borderColor: string | undefined;
	let borderWidth: number | undefined;
	if (decl.borderColor) {
		const rawBorder = stripCustom(decl.borderColor) as string;
		borderColor = theme.colors[rawBorder as ColorToken] ?? rawBorder;
		const gpuiColor = toGpuiColor(borderColor);
		rustBuilders.push(`.border_color(${gpuiColor.rustLiteral})`);
	}
	if (decl.borderWidth) {
		borderWidth = typeof decl.borderWidth === 'number' ? decl.borderWidth : parseFloat(String(stripCustom(decl.borderWidth)));
		rustBuilders.push(`.border_${borderWidth.toFixed(0)}()`);
	}

	// Dimensions
	if (decl.width) {
		if (decl.width === 'full') rustBuilders.push('.w_full()');
		else if (decl.width in theme.spacing) rustBuilders.push(`.w(gpui::px(${theme.spacing[decl.width as Space].toFixed(1)}))`);
	}
	if (decl.height) {
		if (decl.height === 'full') rustBuilders.push('.h_full()');
		else if (decl.height in theme.spacing) rustBuilders.push(`.h(gpui::px(${theme.spacing[decl.height as Space].toFixed(1)}))`);
	}

	return {
		flex: isFlex,
		direction: isCol ? 'column' : 'row',
		align,
		justify,
		gap: gapPx,
		padding: [padTop, padRight, padBottom, padLeft],
		margin: [marginTop, marginRight, marginBottom, marginLeft],
		backgroundColor: bgColor,
		color: textColor,
		borderColor,
		borderWidth,
		borderRadius: borderRadiusPx,
		rustSnippet: `gpui::div()${rustBuilders.join('')}`
	};
}
