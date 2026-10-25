/**
 * Svelte + GPUI ambient types for every tool that reads this project.
 *
 * 1. Svelte's rune globals (`$state`, `$derived`, `$effect`, `$props`, …) and the
 *    `svelteHTML` element namespace ship *inside* the `svelte` package, but they are
 *    only in scope when something pulls them in. A TS program that opens a
 *    `.svelte.ts` module — or a Svelte language server that fails to inject
 *    `svelte-html.d.ts` — otherwise reports `Cannot find name '$derived'` /
 *    `'svelteHTML'`. Referencing them here makes them program-wide.
 *
 *    `svelte-html.d.ts` is deliberately not exposed through `svelte`'s exports map
 *    (the Svelte language server loads it by path), so it is referenced by path.
 *    `/// <reference lib="dom" />` inside it is why DOM globals appear.
 *
 * 2. GPUI's custom renderer accepts a few attributes the DOM typings do not know.
 *    gpuix-svelte ships no element typings, so they are declared here against the
 *    (intentionally empty) `svelteHTML.HTMLAttributes` / `SVGAttributes` hooks.
 */
/// <reference types="svelte" />
/// <reference path="../node_modules/svelte/svelte-html.d.ts" />

declare namespace svelteHTML {
	interface HTMLAttributes<T extends EventTarget = any> {
		/** Which part of the element receives pointer events (GPUI), e.g. `self`. */
		hitbox?: 'self' | 'children';
		/** Test id, surfaced to the headless test harness. (Svelte lower-cases it.) */
		testId?: string;
		testid?: string;
		/** GPUI's syntax-highlighted <code> block. (Svelte lower-cases it.) */
		code?: string;
		language?: string;
		showLineNumbers?: boolean;
		showlinenumbers?: boolean;
		/** Native animation prop (GPUI animates width, etc. through this). */
		motion?: unknown;
		/** Fires when a pointer goes down outside the element. */
		onmousedownoutside?: (event: unknown) => void;
	}
	interface SVGAttributes<T extends EventTarget = any> {
		hitbox?: 'self' | 'children';
		testId?: string;
		testid?: string;
		/** GPUI paints `<svg src>` in the current colour. */
		src?: string;
	}
}