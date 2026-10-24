---
title: preparing css vars
description: issue arising on initiating css vars, and issue resolution log
---

> As a replication of theming with css variables (`fsgpui/docs/gpuix-fractalsvelte/02styling.md`), have implemented in
`fsgpui/examples/gpuix-fs-appone/App.svelte`

Now app is failing:

```
thread '<unnamed>' (6699088) panicked at /Users/runner/work/gpuix/gpuix/zed/crates/gpui_macos/src/window.rs:366:57:
called `Option::unwrap()` on a `None` value
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

thread '<unnamed>' (6699088) panicked at /rustc/8bab26f4f68e0e26f0bb7960be334d5b520ea452/library/core/src/panicking.rs:225:5:
panic in a function that cannot unwind
stack backtrace:
   0:        0x1513e4828 - <<std[7648081134ee26d8]::sys::backtrace::BacktraceLock>::print::DisplayBacktrace as core[318a34b566a36fe]::fmt::Display>::fmt
   1:        0x1513fb964 - core[318a34b566a36fe]::fmt::write
   2:        0x1513eb190 - <std[7648081134ee26d8]::sys::stdio::unix::Stderr as std[7648081134ee26d8]::io::Write>::write_fmt
   3:        0x1513caa00 - std[7648081134ee26d8]::panicking::default_hook::{closure#0}
   4:        0x1513dd7e4 - std[7648081134ee26d8]::panicking::default_hook
   5:        0x1513ddb0c - std[7648081134ee26d8]::panicking::panic_with_hook
   6:        0x1513caac0 - std[7648081134ee26d8]::panicking::panic_handler::{closure#0}
   7:        0x1513bfbd4 - std[7648081134ee26d8]::sys::backtrace::__rust_end_short_backtrace::<std[7648081134ee26d8]::panicking::panic_handler::{closure#0}, !>
   8:        0x1513cb6b4 - __rustc[6ef78fba13ac776c]::rust_begin_unwind
   9:        0x15145bbc8 - core[318a34b566a36fe]::panicking::panic_nounwind_fmt
  10:        0x15145bb50 - core[318a34b566a36fe]::panicking::panic_nounwind
  11:        0x15145bca4 - core[318a34b566a36fe]::panicking::panic_cannot_unwind
  12:        0x1514685c8 - gpui_macos[5d500610e7f6bd13]::window::build_classes::_::__ctor_private
  13:        0x151468b28 - ctor[2b73acd5b3abd5e0]::priority_ctor::_::__CTOR_PRIVATE_REF::__ctor_private
  14:        0x18382edf0 - <unknown>
thread caused non-unwinding panic. aborting.
zsh: abort      npm start
```

---

## Root Cause Analysis

### 1. Why Did the Process Abort on `gpui_macos::window::build_classes`?
- **Duplicate Native Binary Hazard**:
  When `gpuix-fs-appone` was scaffolded, `package.json` referenced `"gpuix-fractalsvelte": "file:/Users/amrit/fractaldesign/packages/fsgpui/vendor/gpuix-fractalsvelte"`.
  `npm install` performed a full directory copy of `vendor/gpuix-fractalsvelte` into `examples/gpuix-fs-appone/node_modules/gpuix-fractalsvelte`, which included a second nested copy of `node_modules/@gpuix/native`.
- **Dual `dlopen` Execution**:
  1. `app.ts` imported `./gpui-dom.ts`, which loaded `@gpuix/native` from `gpuix-fs-appone/node_modules/@gpuix/native`.
  2. `App.svelte` imported `{ set_css_vars } from 'gpuix-fractalsvelte'`, which resolved to `examples/gpuix-fs-appone/node_modules/gpuix-fractalsvelte/src/index.ts`.
  3. `index.ts` statically imported `hot.ts` -> `render.ts` -> `@gpuix/native`.
  4. Because Node's ESM loader resolved two different physical paths on disk to `gpuix-native.darwin-arm64.node`, Node executed `process.dlopen` on both binaries.
- **Objective-C Runtime Class Collision**:
  On macOS, dynamic libraries execute C/Rust static initializers (`#[ctor::ctor]`) upon loading. In `@gpuix/native`, `build_classes()` invokes Apple's Objective-C runtime via `objc::runtime::ClassBuilder::new("GPUIWindow", superclass).unwrap()`.
  Objective-C class names exist in a single global runtime namespace per process. On the second `dlopen`, `ClassBuilder::new` returned `None` because `GPUIWindow` was already registered.
  The `.unwrap()` on `None` caused an uncatchable Rust panic across an FFI boundary (`panic_cannot_unwind`), immediately aborting the process.

### 2. Why Was `@gpuix/native` Loaded on Import of `set_css_vars`?
- `gpuix-fractalsvelte/src/index.ts` statically re-exported `render_hot` from `./hot.ts` and everything from `./web.ts`.
- `./web.ts` statically imported `./render.ts` and `./renderer.ts`.
- Both `./render.ts` and `./renderer.ts` statically imported `@gpuix/native` and `svelte/renderer` (the unreleased Svelte PR #18511 custom-renderer fork).
- Even though `set_css_vars` is a pure JS style utility that takes a dictionary of colors and sets CSS variables, importing it from `gpuix-fractalsvelte` dragged in the entire native windowing system and the vendored Svelte fork.

### 3. Missing Dynamic Re-evaluation for CSS Variables
- In Svelte, `<style>` block rules are compiled and registered at component load time.
- At registration time, CSS variables (`var(--surface)`, `var(--ink)`, `var(--bgButton)`) are not yet defined (they are set in an `$effect` or runtime call).
- `parse_css_text` dropped declarations whose variables had no fallback, and the raw rules were discarded. When `set_css_vars` ran later, elements were never restyled.

---

## Architectural Fix & Implementation

### 1. Decoupled Entrypoints in `vendor/gpuix-fractalsvelte`
- **Pure Style Export**:
  Moved `set_css_vars` implementation into `vendor/gpuix-fractalsvelte/src/style.ts` (pure JS, zero native or Svelte-compiler dependencies).
- **Lazy Native Loaders in `web.ts` and `index.ts`**:
  Updated `render` in `web.ts` and `render_hot` in `index.ts` to be dynamic async loaders (`await import(...)`), preventing static ESM imports from loading `@gpuix/native` when app code only imports styling utilities or helpers.
- **Direct Symlink**:
  Replaced the duplicated directory copy at `examples/gpuix-fs-appone/node_modules/gpuix-fractalsvelte` with a direct symlink to `packages/fsgpui/vendor/gpuix-fractalsvelte`, removing the duplicated nested `node_modules/@gpuix/native`.

### 2. Dynamic Style Registry & Variable Engine in `gpui-dom.ts`
- **Rule Preservation (`StoredRule`)**:
  `registerCSS(cssCode)` now preserves raw selector and declaration strings for all class and pseudo-class (`:hover`, `:active`) rules in `storedRules`.
- **Dynamic Re-computation (`recomputeAllStyles`)**:
  When `set_css_vars(vars)` is called:
  1. `define_css_vars(vars)` updates the CSS variable dictionary in `style.ts`.
  2. `recomputeAllStyles()` re-parses all stored CSS declarations with the new variable values.
  3. Every materialized element in `nodesById` re-runs `updateComputedStyle()` and immediately emits `['setStyle', nativeId, style]` to GPUI.
  4. GPUI paints the updated theme in a single frame.
- **Nested Hover & Active Support**:
  Rules with `:hover` and `:active` (e.g. `.btn:hover { background-color: var(--stateHover); }`) are parsed and folded into GPUI's native nested style format (`style.hover`, `style.active`).
- **Global Bridge**:
  Wired `globalThis.__gpui_set_css_vars = set_css_vars` so calls to `import { set_css_vars } from 'gpuix-fractalsvelte'` seamlessly route into the active `gpui-dom` engine.

---

## Verification & Status

1. **Panic Eliminated**:
   `node app.ts` launches immediately without class registration panics or duplicate `dlopen` conflicts.
2. **Theme Switching Verified**:
   - On initial mount with `LIGHT` palette:
     - `.app`: `backgroundColor: "#fFFFFF"`
     - `.count`: `color: "#2a251f"`
     - `.btn`: `backgroundColor: "#474747"`, `color: "#FFFFFF"`, `hover: { backgroundColor: "#313131" }`
     - `.primary`: `backgroundColor: "#04AA32"`, `hover: { backgroundColor: "#313131" }`
     - `.hint`: `color: "#2a251f"`
   - Switching to `DARK` palette:
     - `.app`: `backgroundColor: "#181218"`
     - `.count`: `color: "#FFFFFF"`
     - `.hint`: `color: "#FFFFFF"`
3. **Full Regression Suite Passed**:
   Running `node /Users/amrit/fractaldesign/.agents/skills/verify-gpuix-fs-appone/verify.mjs`:
   - [1/3] Doctor Diagnostic: **PASSED**
   - [2/3] Button Reactivity (`0 -> 1 -> 0`): **PASSED**
   - [3/3] Hot Reload: **PASSED**
