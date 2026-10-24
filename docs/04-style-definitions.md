---
title: Style Definitions
description: Define elements with the style() function. Learn about token validation, GPUI snippets, and the !custom escape hatch.
---

The `style` function defines a reusable layout or element style. It enforces design token constraints and exposes methods to generate GPUI Rust builder chains or CSS strings.

## Key features

* **Type-checked properties** - Catch invalid property values at compile time.
* **Dual output generation** - Convert styles to GPUI element builder chains or web CSS.
* **Shorthand properties** - Use `paddingX` and `paddingY` for directional spacing.
* **Searchable escape hatch** - Use `!custom` when an intentional off-system value is necessary.

## Defining a style

```ts
import { style } from './theme.js';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'md',               // 12px token
  padding: 'lg',           // 24px token
  backgroundColor: 'bgSurface',
  borderRadius: 'modern',  // 4px token
  color: 'textPrimary'
});
```

## Using styles in GPUI Rust

Call `.gpui()` on any style definition to inspect its GPUI attributes:

```ts
const gpuiOutput = container.gpui();

console.log(gpuiOutput.rustSnippet);
// Output:
// gpui::div().flex().flex_col().gap(gpui::px(12.0)).p(gpui::px(24.0)).bg(gpui::rgba(0x16181dff)).rounded(gpui::px(4.0))
```

You can copy the generated snippet directly into your Rust GPUI view method or use the automated codegen pipeline.

## Using styles in web and Svelte

Call `.cssText()` to get a formatted inline CSS string:

```svelte
<script lang="ts">
  import { container } from './theme.js';
</script>

<div style={container.cssText()}>
  <slot />
</div>
```

Output:

```css
display: flex; flex-direction: column; gap: 12px; padding: 24px; background-color: var(--bg-surface); border-radius: 4px; color: var(--text-primary);
```

## The `!custom` escape hatch

If a design requires an off-system dimension that does not exist in the tokens:

```ts
// ❌ Rejected by TypeScript and runtime validation:
// export const badCard = style({ gap: '15px' });

// ✅ Permitted with explicit escape hatch:
export const customCard = style({
  gap: '15px !custom'
});
```

The `!custom` flag tells the compiler that the value is deliberate. This makes off-system exceptions easy to grep during design audits.

## Related pages

* [Getting started](./01-getting-started.md)
* [Token contracts](./03-token-contracts.md)
* [Component recipes](./05-component-recipes.md)
* [GPUI Rust codegen](./06-gpui-rust-codegen.md)
