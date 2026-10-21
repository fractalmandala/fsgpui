// @fractaldesign/fsgui - Comprehensive Test Suite
import test from 'node:test';
import assert from 'node:assert/strict';

import { defineConfig, defaultTheme } from '../dist/index.js';
import { validateStyle } from '../dist/check/index.js';

test('1. defineConfig creates bound helpers with default theme', () => {
	const { style, recipe, theme, toRust, toCss, toGpuiTheme } = defineConfig();

	assert.ok(style, 'style helper exists');
	assert.ok(recipe, 'recipe helper exists');
	assert.equal(theme.colors.bg, '#0f1115');
	assert.equal(theme.spacing.sm, 8);
	assert.equal(theme.shapes.modern, 4);

	const rustCode = toRust();
	assert.ok(rustCode.includes('pub struct FsTheme'), 'includes FsTheme struct');
	assert.ok(rustCode.includes('SPACE_SM: gpui::Pixels = gpui::px(8.0)'), 'includes spacing constant');
	assert.ok(rustCode.includes('RADIUS_MODERN: gpui::Pixels = gpui::px(4.0)'), 'includes shape constant');

	const cssVars = toCss();
	assert.ok(cssVars.includes(':root {'), 'includes root selector');
	assert.ok(cssVars.includes('--bg: #0f1115;'), 'includes bg color');
	assert.ok(cssVars.includes('--space-sm: 8px;'), 'includes space-sm');
});

test('2. style helper generates GPUI and CSS outputs', () => {
	const { style } = defineConfig();

	const card = style({
		display: 'flex',
		flexDirection: 'column',
		gap: 'sm',
		padding: 'md',
		backgroundColor: 'bgSurface',
		color: 'textPrimary',
		borderRadius: 'modern'
	});

	const gpuiOut = card.gpui();
	assert.equal(gpuiOut.flex, true);
	assert.equal(gpuiOut.direction, 'column');
	assert.equal(gpuiOut.gap, 8);
	assert.deepEqual(gpuiOut.padding, [12, 12, 12, 12]);
	assert.equal(gpuiOut.borderRadius, 4);
	assert.ok(gpuiOut.rustSnippet?.includes('.flex_col()'));
	assert.ok(gpuiOut.rustSnippet?.includes('.gap(gpui::px(8.0))'));
	assert.ok(gpuiOut.rustSnippet?.includes('.rounded(gpui::px(4.0))'));

	const cssText = card.cssText();
	assert.ok(cssText.includes('display: flex'));
	assert.ok(cssText.includes('flex-direction: column'));
	assert.ok(cssText.includes('background-color: var(--bg-surface, #16181d)'));
	assert.ok(cssText.includes('border-radius: var(--radius-modern, 4px)'));
});

test('3. style rejects invalid off-system values (Agent Drift Protection)', () => {
	const { style } = defineConfig({ strict: true });

	assert.throws(
		() => {
			// 13px is not in the spacing scale!
			style({
				gap: '13px'
			});
		},
		/Styling validation failed/,
		'throws error on off-token value'
	);

	assert.throws(
		() => {
			// #0070f3 is an unconfigured color!
			style({
				backgroundColor: '#0070f3'
			});
		},
		/Styling validation failed/,
		'throws error on unconfigured color'
	);
});

test('4. style permits intentional off-system values with "!custom"', () => {
	const { style } = defineConfig({ strict: true });

	const customElement = style({
		gap: '13px !custom',
		backgroundColor: '#0070f3 !custom',
		borderRadius: '6px !custom'
	});

	const gpuiOut = customElement.gpui();
	assert.equal(gpuiOut.gap, 13);
	assert.equal(gpuiOut.borderRadius, 6);
	assert.equal(gpuiOut.backgroundColor, '#0070f3');
});

test('5. recipe variant engine merges base and variant choices', () => {
	const { recipe } = defineConfig();

	const button = recipe({
		base: {
			display: 'inline-flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 'xs',
			borderRadius: 'modern'
		},
		variants: {
			variant: {
				primary: { backgroundColor: 'brand', color: 'textInverse' },
				ghost: { backgroundColor: 'transparent', color: 'textPrimary' }
			},
			size: {
				sm: { paddingX: 'sm', paddingY: '3xs', fontSize: 'sm' },
				md: { paddingX: 'md', paddingY: 'xs', fontSize: 'bs' }
			}
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md'
		}
	});

	// Default call
	const defBtn = button();
	assert.equal(defBtn.gpui().backgroundColor, '#3b82f6');
	assert.equal(defBtn.gpui().borderRadius, 4);
	assert.deepEqual(defBtn.gpui().padding, [6, 12, 6, 12]);

	// Override variant to ghost and size to sm
	const ghostBtn = button({ variant: 'ghost', size: 'sm' });
	assert.equal(ghostBtn.gpui().backgroundColor, 'transparent');
	assert.deepEqual(ghostBtn.gpui().padding, [2, 8, 2, 8]);
});

test('6. validateStyle reports exact allowed tokens', () => {
	const result = validateStyle(
		{
			display: 'flex',
			gap: 'bad-gap'
		},
		defaultTheme
	);

	assert.equal(result.valid, false);
	assert.equal(result.errors.length, 1);
	assert.equal(result.errors[0].property, 'gap');
	assert.ok(result.errors[0].message.includes('Value must be one of'));
});
