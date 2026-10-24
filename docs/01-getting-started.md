---
title: Getting Started
description: Install and configure @fractaldesign/fsgpui. Generate typed design tokens for GPUI Rust applications and web frontends.
---

FSGPUI is a typed, zero-drift design system. You define design tokens, style rules, and component recipes once in TypeScript. FSGPUI compiles them into idiomatic Rust code (`tokens.rs`) for GPUI desktop apps and CSS variables for web applications.

## Key features

* **Zero-drift constraint system** - Only declared token names are accepted. Arbitrary values trigger compile errors.
* **Dual-target compilation** - Compile TypeScript tokens to GPUI Rust code and web CSS custom properties.
* **Fluent GPUI builder chains** - Generate element builder chains such as `.flex().gap(px(8.0)).rounded(px(4.0))`.
* **Component recipes** - Define multi-variant component styles with complete TypeScript completions.
* **Deliberate escape hatch** - Append `!custom` when an off-system value is required.

## Installation

Install the package into your project:

```bash
pnpm add @fractaldesign/fsgpui
```

## Quick configuration

Create a design system configuration file (e.g. `src/theme.ts`):

```ts
import { defineConfig } from '@fractaldesign/fsgpui';

export const { style, recipe, theme, toRust, toCss } = defineConfig();
```

## Define your first style

Use `style` to define an element layout with strict token checking:

```ts
export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'sm',              // 8px token
  padding: 'md',          // 12px token
  backgroundColor: 'bgSurface',
  borderRadius: 'modern', // 4px token (Fractal rule: max 8px)
  color: 'textPrimary'
});
```

If you pass an undeclared value (such as `gap: '13px'`), TypeScript produces a compile error. If you need an off-system value, mark it explicitly with `!custom`:

```ts
// Allowed escape hatch:
export const customBadge = style({
  padding: '13px !custom'
});
```

## Compile to GPUI Rust

Generate a `tokens.rs` file for your native GPUI application:

```ts
import { writeFileSync } from 'node:fs';
import { toRust } from './theme.js';

writeFileSync('crates/theme/src/tokens.rs', toRust());
```

The generated Rust module provides typed constants (`SPACE_SM`, `RADIUS_MODERN`) and color structs (`FsTheme`) ready to use in GPUI.

## Compile to web CSS

Generate CSS custom properties for your web application:

```ts
import { toCss } from './theme.js';

console.log(toCss());
```

Output:

```css
:root {
  --bg: #0f1115;
  --bg-surface: #16181d;
  --space-sm: 8px;
  --space-md: 12px;
  --radius-modern: 4px;
}
```

## Related pages

* [Architecture and philosophy](./02-architecture-and-philosophy.md)
* [Token contracts](./03-token-contracts.md)
* [GPUI Rust codegen](./06-gpui-rust-codegen.md)
* [Web and Svelte integration](./07-web-and-svelte-integration.md)
