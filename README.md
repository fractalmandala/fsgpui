# FSGPUI

A project to marry GPUI and Svelte, in scaffoldable and templatized ways that bring ease of styling and development. FS stands for fractalstyler, the design system powering it all.

## Subproject A

> Typed, zero-drift design system tokens and style definitions targeting native GPUI (Rust) and Web (Svelte, TypeScript).

You define your design tokens, style rules, and component recipes once in TypeScript. FSGPUI compiles them into native Rust `tokens.rs` modules for GPUI desktop applications and CSS custom properties for web applications.

## Goals
1. zero drift - Accept only declared token names. Arbitrary off-system values trigger compile errors.
2. dual targetting - Compile TypeScript design rules to native GPUI Rust code and web CSS stylesheets.
3. gpui scaffolders - Generate idiomatic element builder chains like `.flex().gap(px(8.0)).rounded(px(4.0))`.
4. component recipes - Author multi-variant component designs with full TypeScript autocompletion.
5. design system alignments
6. modular crating - High-performance modular GPUI crates co-located in `crates/`.
7. enhance the gpuix-svelte package to run on Svelte 5 and with fractalstyler styling, as gpuix-fractalsvelte.

## Native GPUI Capability Crates (`crates/`)

`fsgpui` houses a suite of modular, single-responsibility Rust crates designed to be plugged into GPUI applications:

* **[`fsgpui-theme`](./crates/fsgpui-theme)** - design tokens, spacing scale, partition-law borders, and theme palettes (`FsTheme`).
* **[`fsgpui-components`](./crates/fsgpui-components)** - native component collection (buttons, inputs, menus, dropdowns, popovers, tooltips, layout helpers, and ~45 embedded vector SVG icons).
* **[`fsgpui-doc`](./crates/fsgpui-doc)** - document AST, bidirectional text support, fast Markdown parser, and HTML/PDF generation.
* **[`fsgpui-mdeditor`](./crates/fsgpui-mdeditor)** - GPUI WYSIWYG rich text and Markdown editor with slash commands, floating toolbar, and history tracking.
* **[`fsgpui-browser`](./crates/fsgpui-browser)** - native GPUI webview surface hosting macOS `WKWebView` and Windows `WebView2` with layout deduplication and popover snapshot swapping.
* **[`fsgpui-mermaid`](./crates/fsgpui-mermaid)** - native Mermaid diagram parser and SVG renderer (`merman`) inside GPUI views without Node.js.
* **[`fsgpui-terminal`](./crates/fsgpui-terminal)** - GPU-accelerated terminal emulator pane backed by `alacritty_terminal`.
* **[`fsgpui-diff`](./crates/fsgpui-diff)** - Git diff review view with incremental tokenization, syntax highlighting, and split/unified hunk inspection.

## Documentation

Full guides and references are located in the `docs/` folder:

- [01. Getting started](./docs/01-getting-started.md)
- [02. Architecture and philosophy](./docs/02-architecture-and-philosophy.md)
- [03. Token contracts](./docs/03-token-contracts.md)
- [04. Style definitions](./docs/04-style-definitions.md)
- [05. Component recipes](./docs/05-component-recipes.md)
- [06. GPUI Rust codegen](./docs/06-gpui-rust-codegen.md)
- [07. Web and Svelte integration](./docs/07-web-and-svelte-integration.md)
- [08. Zero drift and linting](./docs/08-zero-drift-and-linting.md)
- [09. GPUI demo walkthrough](./docs/09-gpui-demo-walkthrough.md)
- [10. API reference](./docs/10-api-reference.md)
- [11. Scaffold GPUIX Fractalsvelte](./docs/11-scaffold-gpuix-fractalsvelte.md)

## Quickstart

### 1. Install the package

```bash
pnpm add @fractaldesign/fsgpui
```

### 2. Configure your design system (`src/theme.ts`)

```ts
import { defineConfig } from '@fractaldesign/fsgpui';

export const { style, recipe, theme, toRust, toCss } = defineConfig();
```

### 3. Define styles with token constraints

```ts
export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 'sm',              // 8px token
  padding: 'md',          // 12px token
  backgroundColor: 'bgSurface',
  borderRadius: 'modern', // 4px token
  color: 'textPrimary'
});
```

### 4. Generate native Rust code for GPUI

```ts
import { writeFileSync } from 'node:fs';
import { toRust } from './theme.js';

writeFileSync('crates/theme/src/tokens.rs', toRust());
```

---

## Demo application

Run the native GPUI demo window:

```bash
# 1. Generate latest tokens
npm run demo:generate

# 2. Check Rust compilation
npm run demo:check

# 3. Launch 120 FPS Metal window
npm run demo:run
```

---

## License

MIT © [Fractal Mandala](https://github.com/fractalmandala)
