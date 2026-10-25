---
title: Porting Selector Matching Into gpui-dom
description: replace gpui-dom's class-keyed style registry with the selector semantics used by gpuix-fractalsvelte's renderer, while keeping build_style
---

## Why This Task Exists

The regular-Svelte rendering path in `examples/gpuix-fs-appone` bypasses the `gpuix-fractalsvelte` renderer, so it also bypasses the renderer's selector engine. `gpui-dom` currently flattens every rule into one entry per class name, which makes compound selectors leak:

```css
.box         { display: flex; flex-direction: column; }
.box.xcenter { align-items: center; }
.box.xright  { align-items: flex-end; }
```

An element with only `class="box"` receives xright's alignment, and `.xcenter` alone receives declarations meant for `.box.xcenter`.

The finding is recorded in [Compound Class Selector Matching](/devlogs/compound-class-selector-matching.md).

## Reused Pieces

- `parse_css_text` and `define_css_vars` are already imported from `vendor/gpuix-fractalsvelte/src/style.ts`.
- `build_style(attrs, rules)` already merges matching rules, resolves `var()` through the shared generation cache, folds `:hover`/`:active` into nested styles, and applies inline styles last.

So the missing work is only selector extraction and matching:

- `compile_selector` semantics from `vendor/gpuix-fractalsvelte/src/compile.ts`
- `extract_rules` specificity ordering from the same file
- `class_rules` filtering from `vendor/gpuix-fractalsvelte/src/renderer.ts`

## Implementation

In `examples/gpuix-fs-appone/gpui-dom.ts`:

1. Replace `StoredRule { selector, classes, pseudo, decls }` with a `ClassRule`-shaped rule: required classes, optional tag, pseudo, CSS body, source order.
2. Parse raw CSS text with a brace-aware walker, flattening `@media`/`@supports`/`@layer`/`@container` and dropping other at-rules.
3. Split comma-separated selectors and compile each one:
   - classes
   - at most one tag
   - `:hover` / `:active`
   - reject combinators, attributes, and other pseudos
4. Sort rules by specificity (`classes * 2 + tag`) then source order.
5. Match rules against an element's class set and tag in `updateComputedStyle`.
6. Use `build_style(this.attributes, matched)` for the final style, removing `classStyleRegistry`, `hoverStyleRegistry`, and `activeStyleRegistry`.

In `examples/gpuix-fs-appone/src/lib/styles/load.ts`, remove the now-duplicated CSS flattening and let `registerCSS` own it.

## Scope

- Only the demo's `gpui-dom.ts` and `load.ts`.
- No change to the vendored renderer, `compile.ts`, or `style.ts`.
- No support for combinators, attribute selectors, or pseudo-classes beyond hover/active.
- Per-component scoping can remain approximate; the renderer's `stylesheets` map is not ported yet.

## Verification

- Direct check: `.box`, `.box.xcenter`, `.xcenter`, and `.box.xright` in isolation produce different, correct styles.
- Confirm `.box.xcenter` requires both classes.
- Confirm hover rules still resolve through `build_style`.
- Re-run `bun run typecheck` and the existing counter test.
- Re-run the fractalstyler loader check for tokens and class styles.

## Implementation Notes

- `registerCSS` now owns the brace-aware rule walker, flattens `@media`/`@supports`/`@layer`/`@container`, and drops `@keyframes`.
- Selectors are split on commas and compiled one by one. The supported shape is optional tag + classes + optional `:hover`/`:active`. Anything else is warned once and skipped.
- `svelte-*` scope classes are kept as requirements, so component styles do not match elements outside their scope.
- Rules are sorted by `classes.length * 2 + tag` then source order.
- `GpuixElement.updateComputedStyle` filters `storedRules` against the element's class set and tag, then passes the matches to `build_style`.
- `classStyleRegistry`, `hoverStyleRegistry`, and `activeStyleRegistry` are gone. `set_css_vars` still calls `recomputeAllStyles`, which re-runs `updateComputedStyle` on materialized elements.
- `load.ts` no longer flattens CSS itself; it only camel-cases token references before calling `registerCSS`.

## Verification Results

Direct selector check:

```text
box         {"display":"flex","flexDirection":"column"}
box xcenter {"display":"flex","flexDirection":"column","textAlign":"center","alignItems":"center"}
xcenter     {"textAlign":"center"}
box xright  {"display":"flex","flexDirection":"column","alignItems":"flex-end"}
btn hover   {"backgroundColor":"blue"}
```

- `.box` no longer receives xright's alignment.
- `.box.xcenter` gets alignment only when both classes are present.
- `.xcenter` alone gets only the standalone `.xcenter` rule.
- Hover rules still resolve through `build_style`.

Loader check still resolves fractalstyler tokens and classes, e.g. `gap-sm text-bs bg-surface radius-md box xcenter`:
`{boxSizing:"border-box", minWidth:0, display:"flex", flexDirection:"column", textAlign:"center", gap:8, borderRadius:8, fontSize:16, background:"#F4F3EE", alignItems:"center"}`.

`bun run typecheck` passes with 0 errors and 0 warnings. `npm start` mounts `App.svelte` (v1) without crashing.

Remaining unsupported selectors come from `_10_propped.sass` (`[data-variant]`, `[data-shape]`, `[data-size]`) and are reported once each at startup. Those need explicit attribute matching if they are to reach GPUI.
