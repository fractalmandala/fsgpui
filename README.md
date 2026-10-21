# FSGPUI

FSGPUI
Typed, zero-drift design system and tokens calibrated for GPUI apps.
gpui
gitlink - https://github.com/fractalmandala/fsgpui

Fractalsvelte GPUI is a typed, zero-drift system of design tokens, style definitions, and component recipes targeting GPUI and Web (Svelte, TS).

## Zero Drift
Coding agents product arbitrary design values faster than reviews can catch, and drift from rules often. FSGPUI wraps the design system in compiler and type-checker constraints-
- only declared token names are accepted.
- arbitrary, off-system values trigger type errors and runtime validation errors.
- an escape hatch is stil left - `!custom`.

## Interoperability
The styling logic and token contracts, written once in Typescript, compile to GPUI as idiomatic `tokens.rs` with `gpui::Pixels`, `gpui::Rgba`, and extends fluent classes like `.flex()`, `.gap(px(8.0))`, and more. Component variants are flexible, with default fallbacks.

## Installation

```sh
pnpm add @fractaldesign/fsgui
```

### 1. Configure the Design System

```ts
import { defineConfig } from '@fractaldesign/fsgui';
export const { style, recipe, theme, toRust, toCss } = defineConfig();
```

### 2. Define Styles with Token Constraints

```ts
export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'sm',           // ✅ Allowed token (8px)
  padding: 'md',       // ✅ Allowed token (12px)
  backgroundColor: 'bgSurface',
  borderRadius: 'modern', // ✅ 4px per Fractal rules (max 8px)
  color: 'textPrimary',
});

// ❌ Rejects arbitrary values without !custom:
// style({ gap: '13px' }) -> Throws validation error

// ✅ Explicit escape hatch when deliberate:
// style({ gap: '13px !custom' }) -> Permitted and searchable in PR reviews
```

### 3. Component Recipes & Variants

```ts
export const button = recipe({
  base: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'xs',
    borderRadius: 'modern',
  },
  variants: {
    variant: {
      primary: { backgroundColor: 'brand', color: 'textInverse' },
      ghost: { backgroundColor: 'transparent', color: 'textPrimary' },
      outline: { borderColor: 'borderSubtle', borderWidth: 1 },
    },
    size: {
      sm: { paddingX: 'sm', paddingY: '3xs', fontSize: 'sm' },
      md: { paddingX: 'md', paddingY: 'xs', fontSize: 'bs' },
      lg: { paddingX: 'lg', paddingY: 'sm', fontSize: 'lg' },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

// Use with full TypeScript completions:
const primaryBtn = button();
const smallGhost = button({ variant: 'ghost', size: 'sm' });
```

## Build in GPUI

### 1. Generate a complete, ready-to-compile `tokens.rs` module for your GPUI application:

```ts
import { writeFileSync } from 'node:fs';
import { defineConfig } from '@fractaldesign/fsgui';
const { toRust } = defineConfig();
writeFileSync('crates/theme/src/tokens.rs', toRust());
```

Generated `tokens.rs`:

```rust
use gpui::{self, Pixels, Rgba, px};

#[derive(Debug, Clone)]
pub struct FsTheme {
    pub bg: gpui::Rgba,
    pub bg_surface: gpui::Rgba,
    pub brand: gpui::Rgba,
    // ...
}

pub const SPACE_SM: gpui::Pixels = gpui::px(8.0);
pub const SPACE_MD: gpui::Pixels = gpui::px(12.0);
pub const RADIUS_MODERN: gpui::Pixels = gpui::px(4.0);
```

### 2. Map Styles to GPUI Element Builder Chains

```ts
const btnStyle = button({ variant: 'primary', size: 'sm' });

console.log(btnStyle.gpui().rustSnippet);
// Output:
// gpui::div().flex().flex_row().items_center().justify_center().gap(gpui::px(6.0)).px(gpui::px(8.0)).py(gpui::px(2.0)).bg(gpui::rgba(0x3b82f6ff)).rounded(gpui::px(4.0))
```

## Good Ol' Web

The original [Fractalstyler](https://github.com/fractalmandala/fractalstyler) library remains canonical source of truth, and can be installed via NPM. Or...

1. ### Export CSS Variables

```ts
const { toCss } = defineConfig();
console.log(toCss());
```

```css
:root {
  --bg: #0f1115;
  --bg-surface: #16181d;
  --space-sm: 8px;
  --space-md: 12px;
  --radius-modern: 4px;
}
```

2. ### Apply in Web / Svelte

```svelte
<script lang="ts">
  import { card } from './styles';
</script>

<div style={card.cssText()}>
  <slot />
</div>
```

## Get the Agent On It

Paste this into your AI coding agent:

```markdown
We are using @fractaldesign/fsgpui for styling.
1. Always use configured token keys (e.g. gap: 'sm', borderRadius: 'modern', backgroundColor: 'bgSurface').
2. If an off-system value is strictly required, append ' !custom' (e.g. '13px !custom').
3. Follow Fractal rules: maximum border-radius is 4px ('modern') or 8px ('curved').
```

## Demo App

[GPUI Demo](packages/fsgui/examples/gpui_demo) is a demo app showing how `@fractaldesign/fsgui` tokens and styling conventions are used in a real GPUI window. To run, from the `packages/fsgui` directory:

```sh
# 1. Generate the latest tokens from fsgui TypeScript config
npm run demo:generate

# 2. Check compilation
npm run demo:check

# 3. Launch the GPUI window
npm run demo:run
# or simply:
npm run demo
```


## License

MIT © [Fractal Mandala](https://github.com/fractalmandala)
