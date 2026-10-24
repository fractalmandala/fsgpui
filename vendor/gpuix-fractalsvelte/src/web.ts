/**
 * The `browser` condition's entry: everything `index.ts` has except `render_hot`,
 * whose `node:fs` watch cannot resolve in a browser bundle.
 */

export const render = async (...args: any[]) => {
	const mod = await import('./render.ts');
	return (mod.render as any)(...args);
};

export { set_css_vars, parse_css_text, build_style } from './style.ts';
export { to_gpui_event, GPUI_EVENTS } from './events.ts';

export const set_window_title = async (...args: any[]) => (await import('./window.ts') as any).set_window_title(...args);
export const activate_window = async (...args: any[]) => (await import('./window.ts') as any).activate_window(...args);
export const minimize_window = async (...args: any[]) => (await import('./window.ts') as any).minimize_window(...args);
export const zoom_window = async (...args: any[]) => (await import('./window.ts') as any).zoom_window(...args);
export const toggle_fullscreen = async (...args: any[]) => (await import('./window.ts') as any).toggle_fullscreen(...args);
export const prompt_for_paths = async (...args: any[]) => (await import('./window.ts') as any).prompt_for_paths(...args);
export const blur = async (...args: any[]) => (await import('./window.ts') as any).blur(...args);
export const focus_element = async (...args: any[]) => (await import('./window.ts') as any).focus_element(...args);
export const focused_element = async (...args: any[]) => (await import('./window.ts') as any).focused_element(...args);
export const focus_next = async (...args: any[]) => (await import('./window.ts') as any).focus_next(...args);
export const focus_previous = async (...args: any[]) => (await import('./window.ts') as any).focus_previous(...args);
export const focus_next_within = async (...args: any[]) => (await import('./window.ts') as any).focus_next_within(...args);
export const focus_previous_within = async (...args: any[]) => (await import('./window.ts') as any).focus_previous_within(...args);
export const scroll_into_view = async (...args: any[]) => (await import('./window.ts') as any).scroll_into_view(...args);
export const set_image = async (...args: any[]) => (await import('./window.ts') as any).set_image(...args);
export const set_image_pixels = async (...args: any[]) => (await import('./window.ts') as any).set_image_pixels(...args);
export { TextSearch, find_ranges, type TextSearchOptions } from './search.ts';
export type {
	ShadowNode,
	ShadowAttrs,
	NodeKind,
	EventHandler,
	GpuixEvent,
	GpuiStyle,
	StyleValue,
	StyleRule,
	ClassRule,
	Mutation,
	NativeSink,
	Native,
	RenderOptions,
	WindowKeyType,
	AnyComponent
} from './types.ts';
export type { GpuixTheme, HighlightSpec, MotionProps } from '@gpuix/native/host';
export {
	set_debug_overlay,
	cycle_debug_overlay,
	debug_overlay,
	debug_overlay_stats,
	reset_debug_overlay_stats
} from './window.ts';
export type { DebugFrameOverlayMode, DebugFrameOverlayStats } from '@gpuix/native/host';
export { window_size, window_insets } from './window.ts';
export type { WindowSize, WindowInsets, EdgeInsets } from '@gpuix/native/host';
