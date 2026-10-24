---
title: Component Recipes
description: Create multi-variant component designs with the recipe() function. Learn about base styles, variant axes, and default fallbacks.
---

The `recipe` function creates multi-variant component styles. It models components like buttons, badges, and cards with variant axes (such as `size` or `variant`) and provides full TypeScript autocompletion.

## Key features

* **Multi-axis variants** - Combine independent styling axes like `variant` and `size`.
* **Base style inheritance** - Apply common layout rules to all variants automatically.
* **Default variants** - Provide fallback variant selections when options are omitted.
* **Full type inference** - Enjoy auto-complete for variant keys in your IDE.

## Defining a component recipe

```ts
import { recipe } from './theme.js';

export const button = recipe({
  base: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'xs',              // 6px token
    borderRadius: 'modern', // 4px token
  },
  variants: {
    variant: {
      primary: { backgroundColor: 'brand', color: 'textInverse' },
      ghost: { backgroundColor: 'transparent', color: 'textPrimary' },
      outline: { borderColor: 'borderSubtle', borderWidth: 1, color: 'textPrimary' },
      danger: { backgroundColor: 'danger', color: 'textInverse' }
    },
    size: {
      sm: { paddingX: 'sm', paddingY: '3xs', fontSize: 'sm' },
      md: { paddingX: 'md', paddingY: 'xs', fontSize: 'bs' },
      lg: { paddingX: 'lg', paddingY: 'sm', fontSize: 'lg' }
    }
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md'
  }
});
```

## Using recipes in code

Call the recipe function with your chosen variant options:

```ts
// 1. Uses default variants (primary + md)
const defaultBtn = button();

// 2. Override specific variants with type checking
const smallGhost = button({ variant: 'ghost', size: 'sm' });

// 3. Generate GPUI Rust element snippet
console.log(smallGhost.gpui().rustSnippet);
// Output:
// gpui::div().flex().flex_row().items_center().justify_center().gap(gpui::px(6.0)).px(gpui::px(8.0)).py(gpui::px(2.0)).bg(gpui::rgba(0x00000000)).rounded(gpui::px(4.0))

// 4. Generate web CSS text
console.log(smallGhost.cssText());
```

## In Svelte components

You can forward recipe variant props directly into your Svelte 5 component:

```svelte
<script lang="ts">
  import { button } from './theme.js';

  interface Props {
    variant?: 'primary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children?: any;
  }

  let { variant = 'primary', size = 'md', children }: Props = $props();

  let btnStyle = $derived(button({ variant, size }));
</script>

<button style={btnStyle.cssText()}>
  {@render children?.()}
</button>
```

## Related pages

* [Getting started](./01-getting-started.md)
* [Style definitions](./04-style-definitions.md)
* [GPUI Rust codegen](./06-gpui-rust-codegen.md)
* [Web and Svelte integration](./07-web-and-svelte-integration.md)
