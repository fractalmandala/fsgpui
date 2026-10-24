---
title: API reference
description: Complete TypeScript API reference for @fractaldesign/fsgpui. Inspect exported functions, options schemas, and subpath modules.
---

`@fractaldesign/fsgpui` exports tools for defining, validating, and compiling design tokens.

## Root exports (`@fractaldesign/fsgpui`)

### `defineConfig(options?)`

Creates an isolated design system configuration instance:

```ts
import { defineConfig } from '@fractaldesign/fsgpui';

export const { style, recipe, theme, toRust, toCss } = defineConfig({
  colors: { brand: '#3b82f6' },
  spacing: { md: 12 },
  radius: { modern: 4 }
});
```

Returns:
* `style` - Function to create typed style definitions.
* `recipe` - Function to create multi-variant component recipes.
* `theme` - The resolved theme configuration object.
* `toRust()` - Compiles the theme into a `tokens.rs` string.
* `toCss()` - Compiles the theme into a CSS `:root` string.

### `style(definition)`

Defines an element layout or style:

```ts
const card = style({
  display: 'flex',
  gap: 'sm',
  padding: 'md',
  backgroundColor: 'bgSurface',
  borderRadius: 'modern'
});
```

Methods on the returned style object:
* `.gpui()` - Returns `{ rustSnippet: string }`.
* `.cssText()` - Returns formatted inline CSS string.
* `.raw()` - Returns raw property tokens.

### `recipe(definition)`

Defines a multi-variant component recipe:

```ts
const button = recipe({
  base: { display: 'flex', borderRadius: 'modern' },
  variants: {
    variant: { primary: { backgroundColor: 'brand' } },
    size: { sm: { padding: 'xs' }, md: { padding: 'sm' } }
  },
  defaultVariants: { variant: 'primary', size: 'md' }
});
```

Returns a recipe callable function: `(variants?) => StyleInstance`.

## Subpath modules

### `@fractaldesign/fsgpui/gpui`

* `toRust(theme: ThemeConfig): string` - Generates a complete Rust `tokens.rs` module.
* `toGpuiSnippet(style: StyleDefinition): string` - Translates a style object into a fluent Rust builder chain.

### `@fractaldesign/fsgpui/web`

* `toCss(theme: ThemeConfig): string` - Generates CSS custom properties for `:root`.
* `toCssText(style: StyleDefinition): string` - Converts a style definition to a CSS property string.

### `@fractaldesign/fsgpui/check`

* `checkDrift(style: Record<string, any>, theme: ThemeConfig): DriftReport` - Audits a style object for undeclared tokens.

## Related pages

* [Getting started](./01-getting-started.md)
* [Style definitions](./04-style-definitions.md)
* [Component recipes](./05-component-recipes.md)
* [GPUI Rust codegen](./06-gpui-rust-codegen.md)
