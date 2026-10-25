---
title: Custom Header With Native Traffic Lights
description: replace the macOS titlebar with a Svelte header while keeping the native red/yellow/green buttons, with header drag and double-click zoom
---


> Replace the native macOS titlebar with an in-app Svelte header that:

- keeps the real red / yellow / green traffic-light buttons;
- can contain any app controls and use the app's tokens and colors;
- drags the window when the empty header area is dragged;
- zooms/maximizes the window on double click;
- still allows native minimize and zoom through the traffic lights.

## Why The Current Header Must Go

The current header is the native `NSWindow` titlebar. It is outside the GPUI-rendered scene:

- you cannot insert Svelte elements into it;
- you cannot style its background, border, height, or typography with app CSS;
- it only exposes a title string and the platform traffic lights.

`titlebarTransparent: true` makes that titlebar invisible and lets app content draw underneath it, but anything drawn there is still just GPUI content behind AppKit's buttons. That is the target: keep AppKit's buttons, replace everything else with our own header.

## Approach

Use a transparent native titlebar, keep the traffic lights, and draw the header at the top of the GPUI view.

```ts
initGpuiDom({
  title: 'App',
  width: 640,
  height: 480,
  titlebarTransparent: true,
  trafficLightX: 16,
  trafficLightY: 14
});
```

The header occupies the top of the window and gives the traffic lights their own reserved space. A mousedown listener is what makes the header hittable in `gpui-dom` (`hitbox` is not forwarded there today):

```svelte
<div class="app-header" onmousedown={on_header_mousedown}>
  <div class="traffic-light-space"></div>
  <div class="app-header-content">…</div>
</div>
```

```sass
.app-header
  height: 38px
  flex: none
  flex-direction: row
  align-items: center
  background: var(--bg)
  border-bottom: 1px solid var(--border)

.traffic-light-space
  width: calc(16px + 52px + 12px) // left inset + buttons + gap
  flex: none
```

Traffic lights are native; do not draw replacements.

## Required Changes In The Demo

### 1. Pass window options through `initGpuiDom`

`gpui-dom.ts` currently forwards only `title`, `width`, and `height`:

```ts
nativeRenderer.init({
  title: options.title ?? 'GPUI Svelte 5',
  width: options.width ?? 640,
  height: options.height ?? 480
});
```

Extend its options type with the relevant `WindowOptions` fields and spread them:

```ts
import type { WindowOptions } from '@gpuix/native';

export interface GpuiDomOptions extends WindowOptions {
  title?: string;
  width?: number;
  height?: number;
}

export function initGpuiDom(options: GpuiDomOptions = {}) {
  // …
  nativeRenderer.init({
    ...options,
    title: options.title ?? 'GPUI Svelte 5',
    width: options.width ?? 640,
    height: options.height ?? 480
  });
}
```

Then `app.ts` can set:

```ts
titlebarTransparent: true,
trafficLightX: 16,
trafficLightY: 14
```

If `titlebarTransparent` alone does not extend the content view under the titlebar, the FFI shim below also sets `NSWindowStyleMaskFullSizeContentView`.

### 2. Add the header component

Suggested file: `src/lib/chrome/AppHeader.svelte`.

```svelte
<script lang="ts">
  import { zoom_window } from 'gpuix-fractalsvelte';
  import { drag_window } from './window-drag.ts';

  let { title = 'App' } = $props();

  function on_header_mousedown(e: any) {
    if (e.button !== 0) return;

    // Second press of a double click: zoom, never start a drag.
    if (e.clickCount === 2) {
      e.stopPropagation();
      zoom_window();
      return;
    }

    drag_window();
  }

  function stop(e: any) {
    // Buttons and controls must not start a window drag.
    e.stopPropagation();
  }
</script>

<div class="app-header" onmousedown={on_header_mousedown}>
  <div class="traffic-light-space"></div>

  <div class="app-header-content row ycenter xbetween minw0">
		<div class="logo-area row gap-sm ycenter">
			Arna
		</div>	
    <div class="row ycenter xright" onmousedown={stop}>
      <!-- app toolbar items go here -->
    </div>
  </div>
</div>
```

Use the exact markup above, do not edit it, do not add any `<style>` tags.

### 3. Drag behavior

There is no public `dragWindow()` in `@gpuix/native`. Two options:

#### Option A — rely on AppKit's titlebar band

With `titlebarTransparent: true`, the native titlebar may still provide AppKit's normal drag and double-click behavior in the top ~28px. Test this first: if dragging the empty header works and double-click zooms, no shim is needed for drag.

Limitations:

- only the native titlebar band, not the whole header;
- behavior may depend on GPUI's Metal view hit testing;
- do not rely on it for a 48px custom header.

#### Option B — FFI shim (recommended for a real custom header)

Use the same pattern as `vendor/gpuix-fractalsvelte/examples/liquid-glass-ffi/glass-shim.m` + `glass.ts`.

`window-drag-shim.m`:

```objc
#import <AppKit/AppKit.h>

static NSWindow *gpuix_window(void) {
    return NSApp.windows.count ? NSApp.windows.firstObject : nil;
}

// Ensure the content view covers the titlebar band.
void gpuix_chrome_init(void) {
    NSWindow *w = gpuix_window();
    if (!w) return;
    w.styleMask |= NSWindowStyleMaskFullSizeContentView;
    w.titlebarAppearsTransparent = YES;
    w.titleVisibility = NSWindowTitleHidden;
}

// Called from mousedown while AppKit is still handling that event.
void gpuix_window_drag(void) {
    NSWindow *w = gpuix_window();
    NSEvent *e = NSApp.currentEvent;
    if (w && e) [w performWindowDragWithEvent:e];
}
```

`window-drag.ts` compiles and loads it on demand:

```ts
import { existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const SRC = `${DIR}window-drag-shim.m`;
const DYLIB = `${DIR}.window-drag-shim.dylib`;

let drag: (() => void) | null = null;

export async function init_window_drag() {
  if (process.platform !== 'darwin') return;

  if (!existsSync(DYLIB) || statSync(DYLIB).mtimeMs < statSync(SRC).mtimeMs) {
    execFileSync('clang', ['-dynamiclib', '-fobjc-arc', '-framework', 'AppKit', '-o', DYLIB, SRC]);
  }

  if (process.versions.bun) {
    const { dlopen } = await import('bun:ffi');
    const lib = dlopen(DYLIB, {
      gpuix_chrome_init: { args: [], returns: 'void' },
      gpuix_window_drag: { args: [], returns: 'void' }
    });
    lib.symbols.gpuix_chrome_init();
    drag = () => lib.symbols.gpuix_window_drag();
  } else {
    const { dlopen } = await import('node:ffi');
    const { functions } = dlopen(DYLIB, {
      gpuix_chrome_init: { arguments: [], return: 'void' },
      gpuix_window_drag: { arguments: [], return: 'void' }
    });
    functions.gpuix_chrome_init();
    drag = () => functions.gpuix_window_drag();
  }
}

export function drag_window() {
  drag?.();
}
```

Call `await init_window_drag()` in `app.ts` after `initGpuiDom` and before mounting, so the shim can find the window.

If `performWindowDragWithEvent:` does not work from the GPUI mousedown, fallback is a manual shim:

- record `[NSEvent mouseLocation]` and the window frame on mouse down;
- on GPUI mousemove, compute the screen-space delta and call `[window setFrameOrigin:]`;
- on mouse up, stop.

That is more code and requires the GPUI pointer to keep delivering moves outside the original element, so try `performWindowDragWithEvent:` first.

### 4. Double-click maximize

Use GPUI's `clickCount` on the mousedown event:

```ts
if (e.clickCount === 2) {
  e.stopPropagation();
  zoom_window();
  return;
}
```

`zoom_window()` is macOS's zoom/maximize, the same action as double-clicking a native titlebar. If the requirement is true fullscreen instead, use `toggle_fullscreen()`.

Important: check `clickCount` before starting the drag. If `performWindowDragWithEvent:` starts on the first press, macOS consumes the interaction and the second press may never arrive as a normal click.

### 5. Keep the native traffic lights

Do not hide `NSWindowCloseButton`, `NSWindowMiniaturizeButton`, or `NSWindowZoomButton` in the shim. They remain the close/minimize/maximize controls.

Positioning:

- `trafficLightX` and `trafficLightY` place the group relative to the window;
- reserve matching space in the header with padding or a spacer;
- do not place interactive elements directly under the buttons;
- keep the header's empty drag area clickable.

### 6. App shell layout


```svelte
<div class="app-shell">
  <AppHeader title="App" />
  <div class="app-main">…</div>
</div>
```


With a transparent titlebar, the header starts at window `y = 0`; the traffic lights float above it.

### 7. Window title

The native title is hidden, but macOS still uses the window title in menus and window lists. Keep calling `set_window_title()` with the app name, or set it once through `WindowOptions.title`.

## Verification

- Native titlebar text is gone.
- Traffic lights are visible at the intended position and their minimize/zoom/close actions work.
- Header background and controls use app tokens and change with the theme.
- Header controls are clickable and do not start a drag.
- Dragging empty header space moves the window.
- Double-clicking empty header space zooms/maximizes once, not twice.
- Dragging from inside a toolbar button does not move the window.
- Window resize and native zoom still work.
- `npm run typecheck` passes.
- `npm start` mounts without crashes.

## Risks And Open Questions

- Whether `titlebarTransparent` alone gives a draggable AppKit band must be tested on macOS.
- `performWindowDragWithEvent:` must be called while the mouse-down event is current; if GPUI defers the JS callback, it may not work.
- `NSApp.windows.firstObject` assumes a single window, which matches this demo.
- This targets the `app.ts` + `gpui-dom.ts` path. `standalone.ts` and `test.ts` still use the `gpuix-fractalsvelte` renderer and need their own wiring later.
- Attribute-selector styling in `MatrixHeader.svelte` is not supported yet; use class variants.

## Implementation

Implemented in `examples/gpuix-fs-appone`.

### Window options

`gpui-dom.ts` now accepts `WindowOptions` through `GpuiDomOptions` and spreads them into `nativeRenderer.init`. `app.ts` opens with:

```ts
titlebarTransparent: true,
trafficLightX: 16,
trafficLightY: 14
```

### Header

- Added `src/lib/chrome/AppHeader.svelte` with the exact markup from the Approach section.
- `on_header_mousedown` zooms on `clickCount === 2`, otherwise starts a window drag.
- The right-hand toolbar area stops propagation so controls never start a drag.
- `App.svelte` imports `AppHeader` and renders `<AppHeader title="Aṛṇa" />` instead of the old header div.

Header styles live in `src/lib/styles/_09_own.sass`, not a `<style>` block:

```sass
.app-header
  height: 38px
  padding-inline: 0
  flex-grow: 0
  flex-shrink: 0
  background: var(--bg)
  border-width: 0 0 1px 0
  border-color: var(--border)

.traffic-light-space
  width: 80px
  flex-shrink: 0

.app-header-content
  flex-grow: 1
  flex-basis: 0
  min-width: 0
```

`80px` replaces the doc's `calc(16px + 52px + 12px)` because `gpui-dom` does not evaluate `calc()` in declarations.

### Drag shim

- Added `src/lib/chrome/window-drag-shim.m` with `gpuix_chrome_init` and `gpuix_window_drag`.
- Added `src/lib/chrome/window-drag.ts`, which compiles the shim on demand and loads it through `node:ffi` or `bun:ffi`.
- `app.ts` calls `await init_window_drag()` after `initGpuiDom` and before mounting.
- `package.json` start script now runs `node --experimental-ffi app.ts`; without the flag `node:ffi` is unavailable and `window-drag.ts` warns but the app still runs.

### Child Svelte components

The root hot-reload compile writes to `.cache/App.compiled.js`, which broke relative imports from `App.svelte`. Two changes in `app.ts`:

- relative imports in the compiled root are rewritten to absolute `file:` URLs before writing;
- `module.registerHooks` compiles any other `.svelte` file on load and registers its CSS.

This lets `App.svelte` import `AppHeader.svelte` without a build step. Only the root `App.svelte` is watched for hot reload; editing a child component still requires a restart.

### Verification

- `bun run typecheck` passes with 0 errors and 0 warnings.
- `npm start` mounts `App.svelte` (v1) without crashing.
- The shim compiles and loads without the “window drag unavailable” warning.
- Header class resolution checked directly: `.app-header` resolves height 38, flex-grow 0, flex-shrink 0, background token, bottom border width 1; `.traffic-light-space` resolves 80px fixed; `.app-header-content` resolves flex-grow 1 and space-between.

Manual checks still required on macOS:

- drag empty header space and confirm the window follows;
- double-click empty header space and confirm one zoom;
- confirm traffic lights close/minimize/zoom;
- confirm toolbar controls do not drag the window.

## Follow-up: Cursor, Images, Hot Reload, FFI Warning

### Cursor feedback

`src/lib/styles/_09_own.sass` now sets:

```sass
.app-header
  cursor: grab
  &:active
    cursor: grabbing
```

Verified through `gpui-dom`:

```text
{"cursor":"grab","active":{"cursor":"grabbing"},…}
```

The header shows a grab cursor on hover and a grabbing cursor while pressed. If AppKit takes over the drag loop, the native drag cursor may replace it; the header still gives hover feedback.

### Image loading

The image path was not the only problem. `gpui-dom` previously forwarded only `testId` to native, so `<img src>` never reached GPUI. It now:

- forwards non-local attributes through `setCustomProp`
- aliases `objectfit` → `objectFit`, `testid` → `testId`, `minrows` → `minRows`, and similar names
- keeps `class`, `style`, `hover`, `active`, `hitbox`, and `portal` local

`AppHeader.svelte` uses an absolute filesystem path, because a relative `src` resolves against the process working directory, not the component file:

```ts
import { fileURLToPath } from 'node:url';

const logo = fileURLToPath(new URL('../assets/icon-light.png', import.meta.url));
```

```svelte
<img src={logo} alt="logotype" objectFit="contain" class="logotype" />
```

The image is 786×240, so `.logotype` now sets both dimensions explicitly:

```sass
.logotype
  height: 28px
  width: 92px
```

This also exposed a missing DOM shim: Svelte's `set_attribute` reads `element.nodeName.includes('-')`, but `GpuixElement` only had `tagName`. Added:

```ts
get nodeName() {
  return this.tagName;
}
```

### Hot reload for child components

Previously only `App.svelte` was watched, and child `.svelte` modules stayed cached.

`app.ts` now:

- watches `src/` recursively for `.svelte` changes
- increments a shared `compileVersion`
- rewrites relative `.svelte` imports to absolute file URLs with `?v=<compileVersion>`
- compiles any child `.svelte` on load through `module.registerHooks`

Verified by editing `AppHeader.svelte` while the app was running:

```text
[gpui-dom] App.svelte mounted (v1)
[gpui-dom] lib/chrome/AppHeader.svelte changed on disk — hot reloading...
[gpui-dom] App.svelte mounted (v2)
```

Limitation: non-Svelte TS modules and Sass changes are still cached; editing those needs a restart until the same versioning is applied to them.

### FFI experimental warning

Observed:

```text
(node:14389) ExperimentalWarning: FFI is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
```

Cause:

- macOS window dragging uses `node:ffi` to load `window-drag-shim.dylib`.
- `node:ffi` is still an experimental Node module.
- Node prints `ExperimentalWarning` when it is first imported, before application code can suppress it from inside the process.

Fix:

```json
"start": "node --experimental-ffi --disable-warning=ExperimentalWarning app.ts"
```

`--disable-warning=ExperimentalWarning` silences only that warning category; other warnings remain. `--no-warnings` or `NODE_NO_WARNINGS=1` would silence all warnings and is a broader hammer. Verified: the app starts and the warning is gone.

This does not change the FFI risk itself: the Node FFI API is experimental and may change. `window-drag.ts` already catches load failures and falls back to no drag rather than crashing.
