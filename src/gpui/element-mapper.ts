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

	// Gap & Directional Gaps
	let gapPx = 0;
	const rawGapVal = decl.gap ?? undefined;
	if (rawGapVal) {
		const rawGap = stripCustom(rawGapVal);
		if (typeof rawGap === 'string' && rawGap in theme.spacing) {
			gapPx = theme.spacing[rawGap as Space];
		} else if (typeof rawGap === 'number') {
			gapPx = rawGap;
		} else if (typeof rawGap === 'string' && !isNaN(parseFloat(rawGap))) {
			gapPx = parseFloat(rawGap);
		}
		rustBuilders.push(`.gap(gpui::px(${gapPx.toFixed(1)}))`);
	}
	if (decl.rgap) {
		const raw = stripCustom(decl.rgap);
		const pxVal = typeof raw === 'string' && raw in theme.spacing ? theme.spacing[raw as Space] : parseFloat(String(raw)) || 0;
		rustBuilders.push(`.gap_y(gpui::px(${pxVal.toFixed(1)}))`);
	}
	if (decl.cgap) {
		const raw = stripCustom(decl.cgap);
		const pxVal = typeof raw === 'string' && raw in theme.spacing ? theme.spacing[raw as Space] : parseFloat(String(raw)) || 0;
		rustBuilders.push(`.gap_x(gpui::px(${pxVal.toFixed(1)}))`);
	}

	// Padding & 17-Family Granular Shorthands
	let padTop = 0;
	let padRight = 0;
	let padBottom = 0;
	let padLeft = 0;

	const allPad = decl.padding ?? decl.pad;
	if (allPad) {
		const p = theme.spacing[stripCustom(allPad) as Space] ?? (parseFloat(String(stripCustom(allPad))) || 0);
		padTop = padRight = padBottom = padLeft = p;
		rustBuilders.push(`.p(gpui::px(${p.toFixed(1)}))`);
	} else {
		const padX = decl.paddingX ?? decl.px;
		if (padX) {
			const pxVal = theme.spacing[stripCustom(padX) as Space] ?? (parseFloat(String(stripCustom(padX))) || 0);
			padLeft = padRight = pxVal;
			rustBuilders.push(`.px(gpui::px(${pxVal.toFixed(1)}))`);
		}
		const padY = decl.paddingY ?? decl.py;
		if (padY) {
			const pyVal = theme.spacing[stripCustom(padY) as Space] ?? (parseFloat(String(stripCustom(padY))) || 0);
			padTop = padBottom = pyVal;
			rustBuilders.push(`.py(gpui::px(${pyVal.toFixed(1)}))`);
		}
		const padT = decl.paddingTop ?? decl.pt;
		if (padT) {
			const ptVal = theme.spacing[stripCustom(padT) as Space] ?? (parseFloat(String(stripCustom(padT))) || 0);
			padTop = ptVal;
			rustBuilders.push(`.pt(gpui::px(${ptVal.toFixed(1)}))`);
		}
		const padR = decl.paddingRight ?? decl.pr;
		if (padR) {
			const prVal = theme.spacing[stripCustom(padR) as Space] ?? (parseFloat(String(stripCustom(padR))) || 0);
			padRight = prVal;
			rustBuilders.push(`.pr(gpui::px(${prVal.toFixed(1)}))`);
		}
		const padB = decl.paddingBottom ?? decl.pb;
		if (padB) {
			const pbVal = theme.spacing[stripCustom(padB) as Space] ?? (parseFloat(String(stripCustom(padB))) || 0);
			padBottom = pbVal;
			rustBuilders.push(`.pb(gpui::px(${pbVal.toFixed(1)}))`);
		}
		const padL = decl.paddingLeft ?? decl.pl;
		if (padL) {
			const plVal = theme.spacing[stripCustom(padL) as Space] ?? (parseFloat(String(stripCustom(padL))) || 0);
			padLeft = plVal;
			rustBuilders.push(`.pl(gpui::px(${plVal.toFixed(1)}))`);
		}
	}

	// Margin & Shorthands
	let marginTop = 0;
	let marginRight = 0;
	let marginBottom = 0;
	let marginLeft = 0;

	const allMar = decl.margin ?? decl.mar;
	if (allMar && allMar !== 'auto') {
		const m = theme.spacing[stripCustom(allMar) as Space] ?? (parseFloat(String(stripCustom(allMar))) || 0);
		marginTop = marginRight = marginBottom = marginLeft = m;
		rustBuilders.push(`.m(gpui::px(${m.toFixed(1)}))`);
	} else {
		const marX = decl.marginX ?? decl.mx;
		if (marX && marX !== 'auto') {
			const mxVal = theme.spacing[stripCustom(marX) as Space] ?? (parseFloat(String(stripCustom(marX))) || 0);
			marginLeft = marginRight = mxVal;
			rustBuilders.push(`.mx(gpui::px(${mxVal.toFixed(1)}))`);
		}
		const marY = decl.marginY ?? decl.my;
		if (marY && marY !== 'auto') {
			const myVal = theme.spacing[stripCustom(marY) as Space] ?? (parseFloat(String(stripCustom(marY))) || 0);
			marginTop = marginBottom = myVal;
			rustBuilders.push(`.my(gpui::px(${myVal.toFixed(1)}))`);
		}
		const marT = decl.marginTop ?? decl.mt;
		if (marT && marT !== 'auto') {
			const mtVal = theme.spacing[stripCustom(marT) as Space] ?? (parseFloat(String(stripCustom(marT))) || 0);
			marginTop = mtVal;
			rustBuilders.push(`.mt(gpui::px(${mtVal.toFixed(1)}))`);
		}
		const marR = decl.marginRight ?? decl.mr;
		if (marR && marR !== 'auto') {
			const mrVal = theme.spacing[stripCustom(marR) as Space] ?? (parseFloat(String(stripCustom(marR))) || 0);
			marginRight = mrVal;
			rustBuilders.push(`.mr(gpui::px(${mrVal.toFixed(1)}))`);
		}
		const marB = decl.marginBottom ?? decl.mb;
		if (marB && marB !== 'auto') {
			const mbVal = theme.spacing[stripCustom(marB) as Space] ?? (parseFloat(String(stripCustom(marB))) || 0);
			marginBottom = mbVal;
			rustBuilders.push(`.mb(gpui::px(${mbVal.toFixed(1)}))`);
		}
		const marL = decl.marginLeft ?? decl.ml;
		if (marL && marL !== 'auto') {
			const mlVal = theme.spacing[stripCustom(marL) as Space] ?? (parseFloat(String(stripCustom(marL))) || 0);
			marginLeft = mlVal;
			rustBuilders.push(`.ml(gpui::px(${mlVal.toFixed(1)}))`);
		}
	}

	// Background (support `bg` alias)
	let bgColor: string | undefined;
	const bgVal = decl.backgroundColor ?? decl.bg;
	if (bgVal) {
		const rawBg = stripCustom(bgVal) as string;
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

	// Partition-Law Lines (1px hairline: default, -sub, -str)
	function applyPartitionBorder(prop: 'border' | 'bt' | 'br' | 'bb' | 'bl', val: any) {
		if (!val || val === 'none' || val === false || val === 'false') return;
		const method = prop === 'border' ? '.border_1()' : prop === 'bt' ? '.border_t_1()' : prop === 'br' ? '.border_r_1()' : prop === 'bb' ? '.border_b_1()' : '.border_l_1()';
		const colorToken: ColorToken = val === 'sub' ? 'borderSubtle' : val === 'str' ? 'borderStrong' : 'border';
		const colorLiteral = toGpuiColor(theme.colors[colorToken]).rustLiteral;
		rustBuilders.push(`${method}.border_color(${colorLiteral})`);
	}
	applyPartitionBorder('border', decl.border);
	applyPartitionBorder('bt', decl.bt);
	applyPartitionBorder('br', decl.br);
	applyPartitionBorder('bb', decl.bb);
	applyPartitionBorder('bl', decl.bl);

	// Dimensions & Height Ladder
	const heightMap: Record<string, number> = {
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

	if (decl.width) {
		if (decl.width === 'full') rustBuilders.push('.w_full()');
		else if (decl.width in theme.spacing) rustBuilders.push(`.w(gpui::px(${theme.spacing[decl.width as Space].toFixed(1)}))`);
	}
	if (decl.height) {
		if (decl.height === 'full') rustBuilders.push('.h_full()');
		else if (decl.height in heightMap) rustBuilders.push(`.h(gpui::px(${heightMap[decl.height].toFixed(1)}))`);
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
