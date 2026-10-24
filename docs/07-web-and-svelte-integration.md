---
title: Web and Svelte Integration
description: Use FSGPUI in web applications and Svelte 5. Generate CSS custom properties and apply inline style strings.
---


While FSGPUI is designed for native GPUI desktop applications, it compiles the same token contracts to web CSS custom properties and inline style objects.

## Key features

* **CSS custom properties generator** - Generate `:root` stylesheet declarations with `toCss()`.
* **Zero-runtime style strings** - Call `.cssText()` on any style or recipe to produce an inline CSS string.
* **Svelte 5 reactivity** - Use `$derived` runes to compute style strings when props change.
* **FractalStyler token parity** - CSS property names align with the standard FractalStyler naming convention.

## Generating the CSS stylesheet

Call `toCss()` to produce your application stylesheet:

```ts
import { writeFileSync } from 'node:fs';
import { defineConfig } from '@fractaldesign/fsgpui';

const { toCss } = defineConfig();

writeFileSync('src/theme.css', toCss());
```

Output:

```css
:root {
  --bg: #0f1115;
  --bg-surface: #16181d;
  --bg-sunken: #121418;
  --bg-raised: #1c1f26;
  --text-primary: #f4f4f6;
  --text-secondary: #9ca3af;
  --brand: #3b82f6;
  --space-3xs: 2px;
  --space-2xs: 4px;
  --space-xs: 6px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-bs: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --radius-sharp: 2px;
  --radius-modern: 4px;
  --radius-curved: 8px;
}
```

## Using styles in Svelte 5

Import your compiled style definitions into your Svelte components:

```svelte
<script lang="ts">
  import { card } from './theme.js';
</script>

<div style={card.cssText()}>
  <h2>Card Heading</h2>
  <p>Card content rendered using typed token definitions.</p>
</div>
```

## Reactive recipe components

Use Svelte 5 runes to recalculate style strings when component props change:

```svelte
<script lang="ts">
  import { button } from './theme.js';

  interface Props {
    variant?: 'primary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    onclick?: () => void;
    children?: any;
  }

  let { variant = 'primary', size = 'md', onclick, children }: Props = $props();

  let styleString = $derived(button({ variant, size }).cssText());
</script>

<button style={styleString} {onclick}>
  {@render children?.()}
</button>
```

## Related pages

* [Getting started](./01-getting-started.md)
* [Style definitions](./04-style-definitions.md)
* [Component recipes](./05-component-recipes.md)
* [GPUI Rust codegen](./06-gpui-rust-codegen.md)
