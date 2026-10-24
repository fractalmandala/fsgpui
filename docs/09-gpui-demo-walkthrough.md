---
title: Demo Walkthrough
description: Run the native GPUI desktop demo application. Learn how tokens.rs compiles into a 120 FPS Metal window.
---

The repository includes a runnable native GPUI demonstration in `examples/gpui_demo`. It verifies that TypeScript design tokens compile into native Rust code and render inside a GPU-accelerated macOS window.

## Key features

* **120 FPS rendering** - Renders with Apple Metal hardware acceleration in native Rust.
* **Direct token integration** - Consumes the generated `tokens.rs` file directly.
* **Component showcase** - Renders buttons, cards, status pills, and typography in GPUI.
* **Theme toggling** - Demonstrates switching between dark and light themes at runtime.

## Running the demo application

Execute the demo pipeline from the `packages/fsgpui` directory:

### Step 1: Generate the latest Rust tokens

```bash
npm run demo:generate
```

This script reads the TypeScript theme configuration and writes `tokens.rs` into the GPUI crate directory.

### Step 2: Verify Rust compilation

```bash
npm run demo:check
```

This executes `cargo check` against the GPUI example to verify syntax and type correctness.

### Step 3: Launch the GPUI desktop window

```bash
npm run demo:run
# or run the entire pipeline with one command:
npm run demo
```

The native macOS application opens centered on your display, showing:

* **Container cards** styled with `bg_surface`, `SPACE_MD`, and `RADIUS_MODERN`.
* **Action buttons** using the primary brand color and hover states.
* **Typography labels** rendered with `text_primary` and `text_secondary`.

## Demo architecture

```
[packages/fsgpui/src]
         │
         ▼ (node generate.js)
[crates/gpui/examples/fsgui_demo_tokens.rs]
         │
         ▼ (cargo run --example fsgui_demo)
[Native macOS Metal Window at 120 FPS]
```

## Related pages

* [Getting started](./01-getting-started.md)
* [Token contracts](./03-token-contracts.md)
* [GPUI Rust codegen](./06-gpui-rust-codegen.md)
* [API reference](./10-api-reference.md)
