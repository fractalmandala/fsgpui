---
title: applying fractalstyler
description: initial task definition
---

When we say fractalstyler, we mean `/Users/amrit/fractaldesign/packages/fractalstyler`. Also at npm as @fractaldesign/fractalstyler.
Also available as fractalstyler-mcp.

When we say we want to integrate fractalstyler, what we mean is:

1. User is accustomed to a specific nomenclature for tokens - bg-surface, text-primary, theme-color, and so on. These are the fractalstyler tokens. They want to be able to use the same tokens across platforms.
 - (--this-token of css becomes thisToken of GPUI, ie - remove the hyphen, capitalize the joined affix's first letter. Gotcha is in --space-2xl, --text-3xl, etc., there the first letter of affix is a number. so no capitalization - space2xl, text3xl...)
2. User wants to be able to paint shells and surfaces with their token schema - bg, bg-surface, bg-panel, bg-input, etc.
3. User wants the basic customization props of fractalstyler to be extended
	- in css data-variant sets types of primary, secondary, outline, themed, and more to buttons, inputs, selects, etc.
	- data-size sets heights
	- data-shape sets border-radius
	- and others
4. User is accustomed to styling via defined classes - the ones in fractalstyler. This should be progressively made more and more possible in GPUI as well. 
	- for example, can it ever be that using something like `.box().xcenter()` in GPUI will yield a flex with column direction and align-items center?

Let us take these step by step.
Can we begin by having steps 1 and 2 in gpuix-fractalsvelte?

## Canonical Tokens and Declarations

Tokens - `canonicals.json` - `gpuix-fs-appone/src/lib/data/canonicals.json`
Declarations - `declarations.json` - `gpuix-fs-appone/src/lib/data/declarations.json`

## Session — activating tokens and classes in gpuix-fs-appone

Added `examples/gpuix-fs-appone/src/lib/styles/load.ts`, called once from `app.ts` before mount.

- Compiles `src/lib/styles/index.sass` with `sass` (new devDependency).
- Registers the resulting class rules through `gpui-dom`'s `registerCSS`, flattening `@media`/`@layer` wrappers first (registerCSS only reads flat rules).
- Collects every custom property, resolves nested `var()`, `rem`, `calc()` and `clamp()` (upper bound), then calls `set_css_vars`.
- Camel-cases token names (`--bg-surface` → `bgSurface`, `--space-2xl` → `space2xl`) so token names match `themes.ts` and the existing `set_css_vars` calls. Colour declarations keep their `var()` so theme switches still repaint live.

Validation: `bun run typecheck` passes. A direct load check reports 382 class rules and 20 hover rules, with `.gap-sm` → `{gap:8}`, `.text-bs` → `{fontSize:16}`, `.bg-surface` → `{background:"#F4F3EE"}`, `.radius-md` → `{borderRadius:8}`.

Known limitation: `gpui-dom`'s registry keys rules by class name, so compound selectors (`.box.xcenter`) leak onto the base class. Selector-aware matching remains a separate task.
