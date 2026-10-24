---
title: GPUI Rust Codegen
description: Generate native Rust code for GPUI desktop applications. Learn about tokens.rs generation, Pixel constants, and builder chains.
---

FSGPUI compiles TypeScript design system definitions into native Rust code for GPUI desktop applications. The generated code uses native `gpui::Pixels`, `gpui::Rgba`, and fluent element builder chains.

## Key features

* **Ready-to-compile Rust** - Generates clean, zero-warning `tokens.rs` modules.
* **Theme struct with color pairs** - Provides `FsTheme::dark()` and `FsTheme::light()` with `gpui::Rgba` values.
* **Pixel constants** - Exposes strongly-typed `gpui::Pixels` constants (e.g. `SPACE_SM`, `RADIUS_MODERN`).
* **Fluent builder chains** - Translates style rules into method chains like `.flex().gap(px(8.0))`.

## Generating `tokens.rs`

Run the codegen generator in your build script:

```ts
import { writeFileSync } from 'node:fs';
import { defineConfig } from '@fractaldesign/fsgpui';

const { toRust } = defineConfig();

writeFileSync('crates/theme/src/tokens.rs', toRust());
```

## Structure of the generated `tokens.rs`

The generated file contains three primary sections:

### 1. Spacing and radius constants

```rust
use gpui::{self, Pixels, Rgba, px};

pub const SPACE_3XS: gpui::Pixels = gpui::px(2.0);
pub const SPACE_2XS: gpui::Pixels = gpui::px(4.0);
pub const SPACE_XS: gpui::Pixels = gpui::px(6.0);
pub const SPACE_SM: gpui::Pixels = gpui::px(8.0);
pub const SPACE_MD: gpui::Pixels = gpui::px(12.0);
pub const SPACE_BS: gpui::Pixels = gpui::px(16.0);
pub const SPACE_LG: gpui::Pixels = gpui::px(24.0);
pub const SPACE_XL: gpui::Pixels = gpui::px(32.0);

pub const RADIUS_NONE: gpui::Pixels = gpui::px(0.0);
pub const RADIUS_SHARP: gpui::Pixels = gpui::px(2.0);
pub const RADIUS_MODERN: gpui::Pixels = gpui::px(4.0);
pub const RADIUS_CURVED: gpui::Pixels = gpui::px(8.0);
pub const RADIUS_FULL: gpui::Pixels = gpui::px(9999.0);
```

### 2. Theme color struct

```rust
#[derive(Debug, Clone)]
pub struct FsTheme {
    pub bg: gpui::Rgba,
    pub bg_surface: gpui::Rgba,
    pub bg_sunken: gpui::Rgba,
    pub bg_raised: gpui::Rgba,
    pub text_primary: gpui::Rgba,
    pub text_secondary: gpui::Rgba,
    pub brand: gpui::Rgba,
    pub border_subtle: gpui::Rgba,
    pub success: gpui::Rgba,
    pub danger: gpui::Rgba,
}

impl FsTheme {
    pub fn dark() -> Self {
        Self {
            bg: gpui::rgba(0x0f1115ff),
            bg_surface: gpui::rgba(0x16181dff),
            bg_sunken: gpui::rgba(0x121418ff),
            bg_raised: gpui::rgba(0x1c1f26ff),
            text_primary: gpui::rgba(0xf4f4f6ff),
            text_secondary: gpui::rgba(0x9ca3afff),
            brand: gpui::rgba(0x3b82f6ff),
            border_subtle: gpui::rgba(0x222630ff),
            success: gpui::rgba(0x10b981ff),
            danger: gpui::rgba(0xef4444ff),
        }
    }
}
```

## Using tokens in GPUI views

In your native Rust application:

```rust
use gpui::*;
use crate::tokens::{FsTheme, SPACE_MD, SPACE_SM, RADIUS_MODERN};

pub struct CardView {
    theme: FsTheme,
}

impl Render for CardView {
    fn render(&mut self, _cx: &mut ViewContext<Self>) -> impl IntoElement {
        div()
            .flex()
            .flex_col()
            .gap(SPACE_SM)
            .p(SPACE_MD)
            .bg(self.theme.bg_surface)
            .rounded(RADIUS_MODERN)
            .child("Card Content")
    }
}
```

## Related pages

* [Getting started](./01-getting-started.md)
* [Token contracts](./03-token-contracts.md)
* [Style definitions](./04-style-definitions.md)
* [GPUI demo walkthrough](./09-gpui-demo-walkthrough.md)
