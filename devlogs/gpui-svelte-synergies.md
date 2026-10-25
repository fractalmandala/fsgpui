---
title: gpui-svelte Synergies
description: factfinding on what @fractaldesign/gpui-svelte can contribute to the fsgpui + gpuix-fractalsvelte journey, and where it competes with it
---

## Scope

Read:

- `packages/gpui-svelte/README.md`
- `packages/gpui-svelte/DESIGN.md`, `START.md`, `AGENTS.md`
- `packages/gpui-svelte/docs/architecture.md`, `docs/svelte.md`, `docs/components.md`
- `packages/gpui-svelte/src/` — compiler, renderer, runtime, components, kit, testing, automation
- `packages/gpui-svelte/crates/gpui-core/`

This is factfinding, not an implementation decision.

## What gpui-svelte Is

`@fractaldesign/gpui-svelte` is a complete Svelte 5 native desktop runtime:

- its own Rust N-API engine (`crates/gpui-core`)
- its own Svelte compiler/plugin (`src/compiler.ts`, `src/vite.ts`)
- a pinned Svelte 5.57.0 runtime with redirected `svelte/internal/client`
- native primitives (`View`, `Row`, `Column`, `Text`, `Image`, `Svg`, `Canvas`, `TextInput`, `VirtualList`, `Markdown`, `Diff`, …)
- 86+ GPUI Kit components (`Button`, `DataTable`, `Dock`, `Sidebar`, `TitleBar`, `Theme`, charts, …)
- headless controls (`Select`, `Combobox`, `Tooltip`, `FloatingLayer`)
- Vite plugin, WebGPU canvas, multiple windows, frame clock, audio/timeline
- memory-based and GPU-based test renderers, plus automation
- a retained style-object model (`style={{ … }}`), not CSS stylesheets

Provenance: a modified standalone consolidation of `countradooku/gpui-native`, itself incorporating `remorses/gpuix`, `zeronsh/comet`, `longbridge/gpui-kit`, and Zed GPUI. Apache-2.0.

## Where There Is Real Synergy

### 1. Native component catalog

gpui-svelte already ships the broad native component set FSGPUI has started building in `fsgpui-components`:

| gpui-svelte / GPUI Kit | fsgpui-components |
|---|---|
| Button, Input, Checkbox, Switch, Slider | Button, Input |
| Menu, DropdownMenu, ContextMenu, Popover, Tooltip | Menu, Popover, Tooltip |
| Dialog, Sheet, Sidebar, TitleBar, StatusBar | Dialog, layout helpers |
| DataTable, Tree, List, VirtualList | scroll helpers |
| Tabs, Accordion, Breadcrumb, Pagination | — |
| charts, Dock, Resizable, Command, Settings, Theme | — |

Observation: maintaining both native component catalogs is a large duplication. If gpui-svelte remains in the ecosystem, FSGPUI should either:

- theme gpui-svelte/kit and let it own the native component catalog, or
- keep `fsgpui-components` and treat gpui-svelte's kit as out of scope.

Doing both means two button systems, two dialog systems, two menu systems, and two sets of accessibility/event behavior.

### 2. Design-token bridge

FSGPUI has the token contract and typed recipes. gpui-svelte has the native components and takes camelCase style objects:

```svelte
<Button style={{ padding: 12, background: "#89b4fa", borderRadius: 6 }} />
```

FSGPUI currently emits:

- `GpuiStyleOutput` / `rustSnippet`
- CSS text / CSS variables
- `StyleDeclaration` validated against tokens

A natural adapter is missing:

```ts
button({ variant: 'primary', size: 'md' }).nativeStyle()
// -> { padding: 12, backgroundColor: 'var(--theme-color)', … }
// or resolved px/hex values for gpui-svelte's StyleDesc
```

This would let FSGPUI recipes drive gpui-svelte primitives without changing either package’s authoring model.

### 3. Token/theme parity

gpui-svelte has a `Theme` kit component and app-wide kit locale/theme state. FSGPUI has `FsTheme`, `toRust()`, `toCss()`, and `toGpuiTheme()`.

Synergy: make FSGPUI tokens the source that configures gpui-svelte’s native theme, instead of gpui-svelte apps hand-picking colors. This is the same “one token source” problem identified in [FSGPUI and gpuix-fractalsvelte Overlap](/devlogs/fsgpui-gpuix-fractalsvelte-overlap.md).

### 4. Testing and automation

gpui-svelte has mature testing infrastructure:

- `MemoryNativeRenderer` — deterministic protocol implementation for unit tests
- `TestRenderer` — GPU-backed `TestGpuiRenderer`
- `GpuiAutomation` — find by testId/type, bounds, click, mouse, wheel, keys
- snapshots, automation tree, painted text/highlights, screenshots
- frame clock pause/seek/fast-forward, audio/timeline state

gpuix-fractalsvelte has its own headless test harness and automation server.

Synergy: converge on one automation protocol / node snapshot shape. Both packages already speak nearly the same mutation vocabulary. Duplicating test-driver APIs fragments the agent tooling.

### 5. Native renderer protocol

The mutation protocol is almost identical:

```text
createElement, destroyElement, appendChild, insertBefore,
setStyle, setText, setEventListener, setRoot, setCustomProp,
applyBatch, tick, init, close
```

`@gpuix/native` and gpui-svelte’s N-API renderer both implement this shape. That suggests a shared adapter interface and shared host/runtime tests are possible.

However, see the engine conflict below before treating this as a merge path.

### 6. Compiler patterns

gpui-svelte’s compiler does two useful things:

- validates that only supported native elements are used
- rewrites HTML tags to native primitives (`<div>` → `Native type="div"`), rejecting CSS stylesheets, `style:`/`class:` directives, browser-only elements

gpuix-fractalsvelte has the opposite tradeoff: it supports CSS classes and DOM-like Svelte at the cost of a custom renderer path.

Synergy: borrow the **tag validation / primitive lowering** idea for gpuix’s non-CSS path, or use it to define a supported-tag manifest shared by both packages. Do not merge the compilers directly — their Svelte assumptions differ.

### 7. Capabilities gpuix lacks

gpui-svelte has first-class support for:

- multiple windows (`createWindow`, root lifecycle)
- WebGPU canvas leasing and shared textures
- timeline/audio frame state
- text search API
- frame clock control for deterministic tests
- native screenshot capture
- richer kit surfaces (TitleBar, Dock, Resizable, Command, Settings, DataTable, charts)

Some of these are legitimate additions to the gpuix/fsgpui repertoire rather than competing implementations.

## Where It Conflicts

### 1. Two native engines

gpui-svelte bundles its own `gpui-core` N-API binary from `countradooku/zed`. gpuix uses `@gpuix/native` from a related but separate GPUI binding.

The project has already seen what happens when two GPUI N-API binaries load in one process: duplicate Objective-C class registration (`GPUIWindow`) aborts the process. See [Preparing CSS Vars](/devlogs/preparing-css-vars.md).

Fact: two GPUI N-API engines in one process are a hard risk.

Inference: fsgpui/gpuix should not depend on both. Pick one engine per app, or expose one through the other, not side by side.

### 2. Three Svelte integration strategies

| Strategy | Package | Tradeoff |
|---|---|---|
| Custom Svelte renderer + `svelte/renderer` | gpuix-fractalsvelte | richest DOM/CSS semantics, vendored Svelte fork |
| Regular Svelte compile + headless DOM (`gpui-dom`) | gpuix-fs-appone | regular Svelte, app-local shim, smaller API surface |
| Compiler tag rewriting + isolated runtime | gpui-svelte | fast native primitives, pinned Svelte, no CSS |

These are three answers to the same question. Maintaining all three is the largest architectural divergence in the ecosystem.

### 3. Styling philosophy

- gpui-svelte: no CSS stylesheets, no `class:`/`style:` directives, native style objects only.
- gpuix-fractalsvelte: CSS class rules, `<style>` blocks, CSS variables, selector matching.
- FSGPUI: typed style declarations and token contracts, with CSS and Rust outputs.

A single app cannot use all three without a translation layer. FSGPUI recipes currently emit inline CSS and `data-*` attributes; gpui-svelte wants style objects; gpuix wants CSS classes. That is three representations of one design.

### 4. Component ownership

Both packages claim native buttons, inputs, menus, popovers, tooltips, and scroll. Both have Svelte component layers for floating content. Without an ownership rule, apps will mix `fsgpui-components::Button`, gpui-svelte `<Button>`, gpuix `<div class="button el-variants">`, and raw HTML-like `<button>` depending on which doc they read.

### 5. License and provenance

gpui-svelte is Apache-2.0 with upstream provenance from gpui-native/gpuix/comet/gpui-kit. FSGPUI has mixed licensing across crates (some GPL-3.0-only: diff, mermaid). Reusing code across them needs explicit license compatibility review.

### 6. Package positioning

gpui-svelte is already a complete “Svelte 5 on GPUI” package. gpuix-fractalsvelte is another complete “Svelte 5 on GPUI” package. They are competitors at the runtime layer, not natural dependencies of each other.

FSGPUI’s objective 7 says to enhance gpuix-fractalsvelte into a Svelte 5 + fractalstyler runtime. gpui-svelte is effectively an alternative execution of that objective with different tradeoffs.

## What Fits The FSGPUI Journey

### Keep

- FSGPUI as the token/design contract and Rust-native capability layer.
- gpuix-fractalsvelte as the Svelte runtime if regular Svelte 5 + CSS/fractalstyler classes remain the goal.
- `fsgpui-components` only if gpui-svelte/kit is not adopted as the native component layer.

### Borrow or adapt

1. **FSGPUI → native style object adapter**  
   Add a `.nativeStyle()`/`toStyleDesc()` output for gpui-svelte primitives.

2. **Automation snapshot/protocol convergence**  
   Use gpui-svelte’s `GpuiAutomation` shape as a reference for gpuix’s automation API, or share the protocol.

3. **Memory renderer for tests**  
   Adopt a deterministic protocol renderer in gpuix tests instead of always requiring native.

4. **Tag manifest / primitive lowering**  
   Define one supported native tag list shared by fsgpui, gpuix, and gpui-svelte.

5. **Capability ports**  
   Multiple windows, WebGPU canvas, frame clock, screenshot capture, and text search are additive features that can be ported independently of the component/runtime conflict.

### Do not

- Load both native engines in one process.
- Maintain three Svelte compilers indefinitely.
- Maintain three native component catalogs with no ownership rule.
- Fork gpui-svelte’s kit into fsgpui while also keeping gpui-svelte as a dependency.

## Decision Questions

- Is gpui-svelte a future dependency, a reference implementation, or a competing runtime to retire?
- If regular Svelte 5 is non-negotiable, can gpui-svelte’s pinned-runtime compiler be adapted, or is gpuix’s path the only option?
- Which native component catalog is canonical: `fsgpui-components`, gpui-svelte/kit, or gpuix’s native tags?
- Should FSGPUI tokens theme gpui-svelte/kit, or should FSGPUI stay engine-agnostic?
- Can the three Svelte runtime strategies converge to one?
- Is the automation protocol a shared package rather than two implementations?

## Summary

gpui-svelte is the most complete Svelte-on-GPUI runtime in the workspace. It has real synergies with FSGPUI at the design-token, component-catalog, testing, automation, and capability layers.

It is also the closest competitor to gpuix-fractalsvelte. The synergy is not “merge them”. The realistic choices are:

1. Adopt gpui-svelte as the native runtime and make FSGPUI its design system.
2. Keep gpuix-fractalsvelte as the runtime for regular Svelte 5 + fractalstyler CSS, and borrow specific gpui-svelte capabilities without depending on its engine.
3. Retire one runtime path.

Pick one native engine and one component catalog first; everything else follows.

## Borrowable Capabilities, By Cost

This assumes gpuix-fractalsvelte stays on regular Svelte 5 + fractalstyler CSS, and the gpui-svelte engine/compiler is not adopted.

### Tier 1 — Portable now (JS/TS only, no native engine change)

- **Memory renderer for tests**  
  gpui-svelte’s `MemoryNativeRenderer` implements the mutation protocol in pure TypeScript. A gpuix equivalent would make protocol tests deterministic without `@gpuix/native`.

- **Automation facade shape**  
  `GpuiAutomation` already exposes `findByTestId`, `findByType`, `bounds`, `click`, `mouseMove`, `mouseDown`, `mouseUp`, `wheel`, `keystrokes`, snapshots. gpuix has the native primitives; borrow the API shape and snapshot model, not the engine.

- **Test helper coverage**  
  gpui-svelte maps every native simulation to a helper (`click`, `hover`, `drag`, `type`, `key`, `scroll`, `screenshot`). gpuix’s `test.ts` has a subset; align the surface.

- **Runtime error boundary**  
  `RuntimeBoundary.svelte` + `listenForRuntimeErrors` gives component-level failure containment. gpuix currently logs from `commit`; a boundary would keep the window alive and render an error pane.

- **Renderer ownership guard**  
  `claimRenderer()` prevents two roots from owning one native renderer. gpuix’s `render`/`render_hot` can use the same guard.

- **Tag validation / primitive registry**  
  gpui-svelte’s compiler rejects unsupported native tags and lowers `<div>` to a native primitive. gpuix can borrow the supported-tag manifest and validation without adopting the compiler.

- **Prop and event normalization**  
  gpui-svelte aliases lowercase event names (`onclick`/`onPress`) and normalizes `bind:value` via prop descriptors. `gpui-dom` can borrow the normalization rules.

- **Headless control interactions**  
  Select, Combobox, Tooltip, and FloatingLayer are pure Svelte behavior over native primitives. Their keyboard, typeahead, focus, dismissal, and active-item logic could be ported to gpuix Svelte components.

- **Style-prop snapshot semantics**  
  gpui-svelte snapshots reactive style/prop objects before sending them native. gpuix currently re-parses CSS declarations; the snapshot idea is useful for any future style-object API.

- **Motion/stagger helpers**  
  `MotionView`, `motion.View`, and `stagger()` are thin helpers over the native `motion` prop. gpuix already exposes `motion`; the helpers are portable.

### Tier 2 — Needs native work in `@gpuix/native`

- **Multiple windows**  
  gpui-svelte has `createWindow` lifecycle. `@gpuix/native` exposes one renderer/window. Porting needs native multi-window support first.

- **WebGPU canvas / texture leasing**  
  gpui-svelte has `createCanvasSource`, `presentCanvasTexture`, `createCanvasTexture`, shared WGPU devices. `@gpuix/native` exposes a `<canvas>` tag but not this GPU interop. Needs native surface work.

- **Timeline and audio frame state**  
  gpui-svelte has timeline play/pause/seek and audio frame queues. `@gpuix/native` has no equivalent. Needs native work.

- **Kit component catalog**  
  Button, DataTable, Dock, Sidebar, TitleBar, charts, etc. are implemented in gpui-svelte’s Rust `gpui-core`/GPUI Kit. They cannot be copied as JS. Options are: port designs/interaction specs, wrap the gpui-svelte engine (conflicts with `@gpuix/native`), or skip them.

### Tier 3 — Do not borrow

- gpui-svelte’s native engine (`gpui-core`)
- its compiler and pinned Svelte runtime
- its `svelte/internal/client` redirects
- its Vite plugin as-is

These are the pieces that make gpui-svelte a competing runtime rather than a library.

### Already available in gpuix

Do not re-port these; `@gpuix/native` already exposes them:

- `getAutomationTree`
- `getElementBounds`
- `simulateClick`, `simulateMouseDown`, `simulateMouseUp`, `simulateMouseMove`, `simulateScrollWheel`
- `simulateKeystrokes`, `simulateKeyDown`, `simulateKeyUp`
- `clockPause`, `clockSet`, `clockFastForward`, `clockResume`
- `captureScreenshot`
- `getAllText`, `getPaintedText`, `getPaintedHighlights`
- `getSelectedText`, `clearSelection`, `dragSelect`
- `setDebugFrameOverlay`, `getDebugFrameOverlayStats`

The gap is mostly API shape, test ergonomics, and higher-level components — not raw engine capability.
