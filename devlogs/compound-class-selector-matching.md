---
title: Compound Class Selector Matching
description: gpui-dom applies compound selector declarations to each class independently, so .box.xcenter leaks onto .box
---


`src/lib/styles/load.ts` now registers every fractalstyler class with `gpui-dom`, but compound selectors do not behave like CSS. For example:

```css
.box         { display: flex; flex-direction: column; }
.box.xcenter { align-items: center; }
.box.xright  { align-items: flex-end; }
```

An element with only `class="box"` receives xright's alignment, and an element with only `class="xcenter"` receives declarations intended for `.box.xcenter`.

## Root Cause

`registerCSS` in [gpui-dom.ts](/examples/gpuix-fs-appone/gpui-dom.ts) extracts every class name from a selector and merges the rule's declarations under each name independently:

```ts
for (const cls of r.classes) {
  classStyleRegistry.set(cls, { ...existing, ...parsed });
}
```

`GpuixElement.updateComputedStyle` then merges only by the element's class list:

```ts
for (const cls of classes) {
  if (classStyleRegistry.has(cls)) {
    combined = { ...combined, ...classStyleRegistry.get(cls) };
  }
}
```

The selector as a whole is never evaluated. Later rules overwrite earlier ones under the same class key, so order also changes the result. The class registry cannot distinguish:

- `.a` from `.a.b`
- `.a, .b` (alternatives) from `.a.b` (both required)

This is specific to `gpui-dom`'s simplified styling path. The vendored `gpuix-fractalsvelte` renderer matches selectors in `renderer.ts` and merges the matched rules through `style.ts`; the app does not use that renderer.

## Why the Renderer's Selector Engine Does Not Apply

The app is not using `gpuix-fractalsvelte`'s renderer. It only uses the package's pure style helpers.

- `app.ts` starts `initGpuiDom` and mounts a component compiled with Svelte's regular `client` output. It never calls `render` or `render_hot`.
- `gpui-dom.ts` imports `parse_css_text` and `define_css_vars` from the vendored `style.ts`. So declaration parsing and `var()` substitution are already reused.
- `style.ts` does not match selectors. `build_style(attrs, rules)` only merges the rules the caller hands it. Selector matching lives in `renderer.ts` (`class_rules`), and rule extraction from a Svelte `<style>` block lives in `compile.ts` (`compile_selector`, `extract_rules`, `define_styles`).
- Those renderer files are reached only through the custom-renderer compile path (`experimental.customRenderer` plus `svelte/renderer`), which is exactly the vendored Svelte fork the project set out to avoid. See [Moving gpuix-fractalsvelte to regular Svelte 5](/devlogs/moving-to-regular-svelte-5.md).
- With regular Svelte, the compiler emits DOM CSS (`css.code`) and no `define_styles` call. `gpui-dom`'s `registerCSS` was added as the replacement for the missing browser CSS engine. See the second iteration in the same devlog and [Preparing CSS Vars](/devlogs/preparing-css-vars.md).

So `gpui-dom` duplicates the *renderer's* sheet registry and selector matching, not `style.ts`. `style.ts` is applied, but only its variable and declaration helpers; there is no renderer in this path to call `build_style`.

Reusing the correct path would mean either switching `app.ts` back to `render`/`render_hot` with the custom-renderer Svelte build, or porting `compile_selector`/`extract_rules` and `class_rules` semantics into `gpui-dom` while continuing to call `build_style` from `style.ts`.

## Planned Resolution

Implemented in [Porting Selector Matching Into gpui-dom](/devlogs/porting-selector-matching-into-gpui-dom.md).

Make `gpui-dom` store and evaluate selector requirements instead of flattening them into class keys.

1. Parse each comma-separated selector separately in `registerCSS`.
2. For each selector, record its required class set, optional tag, and pseudo state (`hover`, `active`).
3. During `updateComputedStyle`, apply a rule only when the element satisfies its requirements:
   - every required class is present;
   - the tag matches when the selector names one;
   - the pseudo state matches the pass being built.
4. Apply matched rules in source order, after single-class rules, so `.a.b` wins over `.a`.
5. Keep the existing class-keyed maps as a fast path if useful, but do not register compound rules under their individual classes.

Sketch of the rule shape:

```ts
interface StoredRule {
  selector: string;
  required: string[];      // ['box', 'xcenter']
  tag: string | null;
  pseudo: 'hover' | 'active' | null;
  decls: string;
}
```

Sketch of matching:

```ts
if (rule.required.every((c) => elementClasses.has(c)) &&
    (!rule.tag || rule.tag === element.tagName.toLowerCase())) {
  combined = { ...combined, ...parse_css_text(rule.decls) };
}
```

## Scope

- Only `examples/gpuix-fs-appone/gpui-dom.ts`.
- No changes to the Sass partials or `load.ts`.
- No attempt to support combinators, attribute selectors, or other unsupported CSS; those stay out of range.

## Verification

- Add a headless check with sibling elements: `.box`, `.box.xcenter`, `.xcenter`, and `.box.xright`.
- Confirm `.box` alone gets no alignment, `.box.xcenter` centers only with `box`, and `.xcenter` alone gets nothing.
- Re-run `bun run typecheck` and the existing counter test.
- Spot-check hover rules from the fractalstyler sheet after the registry change.
