---
title: Calibrating Gpuix-Fractalsvelte
description: Repackaging and updating gpuix-fractalsvelte, free from vendored Svelte dependency, with new gpui dom rendering.
---

Currently, (25 Oct 12:15PM IST)
- gpuix-fractalsvelte was able to scaffold a new GPUI + Svelte app, without vendored Svelte. Using current Svelte 5.
- doing so necessitated creation of new gpui-dom.ts and replacing existing hot reloader and renderer.
- a few other changes.

> Each change currently sits inside the demo app - gpuix-fs-appone `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone`

> Now the changes have to be brought back home, ie, to gpuix-fractalsvelte. 

## Steps

1. Move `gpuix-fractalsvelte` to directly inside the `packages` folder. 
	- ie, out of the current `vendor` folder it is in, and out of the `fsgpui` folder. 
	- ie, as a standalone package folder inside `packages.`

2. Scope what needs to be brought back home (copy these, do not remove from their current locations):
- possibly - `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone/app.ts`
- `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone/build.ts`
- `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone/gpui-dom.ts`
- `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone/src/lib/chrome` - as a component gpuix-fractalsvelte can own, an users have option of using it.
- `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone/src/lib/styles/load.ts` ?

- any docs, devlog etc. we will move separately and later.

3. Once gpuix-fractalsvelte is in new location and items brought back home, 
- reconfirm that it no longer is using vendored Svelte copy.
- when confirmed, remove the folder `vendor` inside it. 
- confirm no existing code/files are pointing to that folder.

4. At this stage we would have a "pre-clean" version. 

5. We will then move to scaffolding a new app to test things out. 
## Implementation — Step 1–4 (pre-clean)

### 1. Package moved

`gpuix-fractalsvelte` now lives at:

```text
/Users/amrit/fractaldesign/packages/gpuix-fractalsvelte
```

It was moved out of `packages/fsgpui/vendor/gpuix-fractalsvelte`.

### 2. New regular-Svelte DOM runtime copied home

Added under `src/dom`:

- `gpui-dom.ts` — headless DOM, class registry, selector matching, native bridge
- `runner.ts` — generic `run_dom(entry, options)` compile/mount/hot-reload runner
- `chrome/AppHeader.svelte` — optional traffic-light header component
- `chrome/window-drag.ts` + `window-drag-shim.m` — macOS drag FFI
- `chrome/app.d.ts` — GPUI attrs (`objectFit`, `hitbox`, `testId`) for svelte-check
- `styles/load.ts` — generic fractalstyler Sass/token loader, now takes the Sass entry path
- `native.ts` — re-exports `GpuixRenderer`/`WindowOptions` so apps have one native module path

The demo versions remain untouched in `examples/gpuix-fs-appone`.

### 3. Package exports and dependencies

`package.json` root now points at `src/dom/index.ts`. New subpaths:

```text
gpuix-fractalsvelte
gpuix-fractalsvelte/dom
gpuix-fractalsvelte/dom/runner
gpuix-fractalsvelte/dom/gpui-dom
gpuix-fractalsvelte/dom/styles
gpuix-fractalsvelte/dom/chrome
gpuix-fractalsvelte/dom/chrome/window-drag
gpuix-fractalsvelte/native
```

Old custom-renderer exports (`./renderer`, `./plugin`, `./register`, `./test`, `./automation`) were removed from the manifest.

Dependencies changed from a vendored Svelte tarball to:

```json
"svelte": "^5.57.2",
"sass": "^1.106.1"
```

`bundleDependencies` was removed.

### 4. Vendored Svelte removed

- Deleted `packages/gpuix-fractalsvelte/vendor/` (the Svelte tarball).
- Regenerated `bun.lock`.
- After a clean reinstall, `node_modules/svelte` reports `5.57.2` with `exports['./renderer'] === false`.
- Removed the `vendor` script and the obsolete `scripts/vendor-svelte.ts`.
- Simplified `scripts/publish.ts` so it no longer reads/validates `vendor/`.
- Removed the `!vendor/*.tgz` `.gitignore` exception.

Remaining `vendor/` text references are documentation only (`README.md`, `starter/AGENTS.md`, `CLAUDE.md`), left for the later docs pass per the task.

### 5. Legacy custom-renderer files

Old files (`renderer.ts`, `render.ts`, `hot.ts`, `compile.ts`, `plugin.ts`, `register.ts`, `test.ts`, `automation.ts`, `automation-server.ts`, `components/`, old `index.ts`) remain for reference.

They are not exported, not on the new typecheck path, and still assume `svelte/renderer`, which regular Svelte does not provide. They are pre-clean leftovers, not the current runtime.

New typecheck:

```bash
npm run typecheck        # tsc -p tsconfig.dom.json + svelte-check
npm run typecheck:legacy # the old config, expected to fail until legacy is removed
```

### 6. Demo updated to consume the moved package

`examples/gpuix-fs-appone` now points at the new package location and imports style/types from `gpuix-fractalsvelte`. Its `gpui-dom` imports `GpuixRenderer` from `gpuix-fractalsvelte/native` so only one `@gpuix/native` physical module is loaded. This avoids the Objective-C duplicate-class abort seen earlier.

The demo’s old `build.ts`, `standalone.ts`, and `test.ts` are excluded from its typecheck for now. They use the removed custom-renderer exports and are part of the later scaffold/cleanup step.

## Verification

- `packages/gpuix-fractalsvelte`: `npm run typecheck` → 0 errors, 0 warnings.
- Temporary app using `run_dom()` mounted a regular Svelte component in a GPUI window:
  ```text
  mounted 1
  running true
  ```
- `examples/gpuix-fs-appone`: `npm start` mounts `App.svelte` (v1) with the moved package.
- `gpuix-fs-appone` `npm run typecheck` → 0 errors after excluding legacy entrypoints.
- Experimental FFI warning remains suppressed by `--disable-warning=ExperimentalWarning`.

## Not Done Yet

- Scaffold the new test app against the moved package (step 5).
- Replace `starter/` with the new `run_dom` entrypoint and update `bin/` to the new runtime.
- Update README/CLAUDE/starter docs that still mention `vendor/`.
- Decide whether legacy custom-renderer files should be deleted, moved to `legacy/`, or kept as historical reference.

## Bin and starter cut over to `run_dom`

### Bin

`bin/gpuix-fractalsvelte.js` no longer uses the custom-renderer path.

Removed:

- `--conditions custom-renderer --conditions development`
- `--import gpuix-fractalsvelte/register`
- `--preload gpuix-fractalsvelte/plugin`
- `--bun` runtime switching

Now it resolves the entry and spawns Node with the DOM runtime. On Node 26+ it adds:

```text
--experimental-ffi --disable-warning=ExperimentalWarning
```

for the optional macOS window-drag shim. When the launcher itself is run through Bun, it still spawns Node because Bun has no `module.registerHooks`, which the DOM runner uses for child `.svelte` compilation.

### Starter

- `starter/app.ts` now calls `run_dom(new URL('./App.svelte', import.meta.url), …)`.
- `starter/package.json` keeps only `start` and `typecheck`.
- `starter/tsconfig.json` removes `customConditions` and the `gpuixHTML` namespace.
- `starter/App.svelte` drops `testId` (the headless test path is retired for now).
- Removed `starter/build.ts`, `starter/standalone.ts`, `starter/test.ts`, and `starter/bunfig.toml`, which all depended on the custom-renderer exports.
- Rewrote `starter/README.md` for the DOM runtime.

### Svelte runtime selection fix

The starter initially hit two different Svelte runtimes: the app’s hoisted Svelte and the package’s nested Svelte. Mount used one, the compiled component imported the other, and Svelte’s DOM operations were undefined.

`run_dom` now resolves Svelte from the **entry file’s** package tree:

```ts
createRequire(pathToFileURL(svelteFile)).resolve('svelte/package.json')
```

and passes that same package path to `ensureEventSymbol`. Mount, events, and compiled imports now share one Svelte instance.

### Verification

Starter test copy (outside the repo, `file:` dependency on the new package):

- `bun run typecheck` → 0 errors, 0 warnings.
- `gpuix-fractalsvelte app.ts` → `mounted 1`.
- Bin spawns Node and applies the FFI warning suppression.

### Remaining pre-clean issues

- The package’s old demo/test scripts still point at custom-renderer entries and will fail if run.
- Package README/CLAUDE still describe the custom-renderer setup.
- Legacy `src/*` custom-renderer files remain, excluded from the new typecheck.
- Standalone build and headless test paths are removed from the starter until equivalent DOM-runtime versions exist.

## Cleanup Pass

The pre-clean leftovers were removed.

### Package scripts

`package.json` now keeps only:

```text
typecheck
lint
pack
publish:npm
```

Removed all retired runtime scripts:

- `demo`, `demo:*`, `bun:demo*`
- `test`, `test:*`, `bun:test*`
- `tutorial`, `bun:tutorial`
- `docs`, `docs:serve`, `og`, `og:docs`
- `consume`, `consume:open`, `bun:consume*`
- `compile`, `compile:app`
- `parity`, `check:svelte`
- `typecheck:legacy`

There is intentionally no `test` script yet; the new suite comes next.

### Deleted example and test trees

- `examples/` — all retired custom-renderer demos.
- `test/` — old headless/custom-renderer test suite.

The only app example is now `starter/`, running `run_dom`.

### Deleted old tooling

- `scripts/compile.ts`
- `scripts/consume.ts`
- `scripts/demo-all.ts`
- `scripts/docs.ts`
- `scripts/native-parity.ts`
- `scripts/og.ts`
- `scripts/svelte-mcp.ts`
- `scripts/web.ts`

Kept `scripts/publish.ts` for `pack` / `publish:npm`, updated for the new entry and removed `html.d.ts` handling.

### Deleted legacy source

- `src/renderer.ts`
- `src/render.ts`
- `src/hot.ts`
- `src/compile.ts`
- `src/plugin.ts`
- `src/register.ts`
- `src/test.ts`
- `src/automation.ts`
- `src/automation-server.ts`
- `src/components/`
- `src/index.ts` (old root)
- `src/web.ts`
- `src/html.d.ts`

Remaining source:

```text
src/dom/           new DOM runtime
src/style.ts       CSS declaration/var helpers
src/types.ts       shared types
src/events.ts      event name map
src/search.ts      native text search
src/window.ts      window helpers
```

### Config and CI cleanup

- Removed `tsconfig.dom.json`; `tsconfig.json` is the one config.
- Removed custom-renderer conditions and `gpuixHTML` namespace from tsconfig.
- Updated `tsconfig.lib.json` for the new source set.
- Removed old `vendor`/`test`/`examples` ignores and fixed the scaffolder template path.
- Updated `packages/create-gpuix-svelte` output to show only `start` and `typecheck`.
- Replaced the old multi-job CI with a Node 26 typecheck job.
- Deleted the docs workflow that called the removed `scripts/docs.ts`.
- Release verification now runs `npm run typecheck` instead of the removed test/consume scripts.

### Verification

```text
npm run typecheck → 0 errors, 0 warnings
```

Package tree no longer contains retired example/test/source entrypoints. Docs, homepage, README, CLAUDE.md, and starter AGENTS remain for the final documentation pass.

## Revert to the Vendored Custom Renderer

The experiment was judged and reverted.

### Restored

The package at `/Users/amrit/fractaldesign/packages/gpuix-fractalsvelte` was restored to the pre-experiment tree from the deleted `packages/fsgpui/vendor/gpuix-fractalsvelte`:

- `src/` custom renderer, compiler, plugin, register, test, automation, components
- `scripts/`
- `test/`
- `examples/`
- `starter/` using `render_hot`
- old `package.json`, `tsconfig.json`, `bunfig.toml`, `svelte.config.js`
- old README/docs/CLAUDE/CI
- `vendor/svelte-5.57.2-694f791.tgz`

The user-added `build/` directory and renamed `packages/create-gpuix-fractalsvelte` were preserved.

### Removed experiment files

- `src/dom/` is gone.
- The regular-Svelte `run_dom` runner, `gpui-dom`, `dom/styles`, `dom/chrome`, and `dom/native` are gone.
- The experiment package scripts/config were replaced by the old ones.

### Dependency and vendor state

- `bun install` used the vendored tarball.
- Installed Svelte: `5.57.2`.
- `svelte/renderer` is present again.
- `package.json` main is `src/index.ts`; bin is the custom-renderer launcher.

### Export fix

The restored `src/web.ts` was missing renderer/window exports that the old test suite imports. Added:

- `renderer`, `set_native`, `get_native`, `create_root`, `commit`, `is_dirty`, `set_auto_commit`, `dispatch`
- `on_window_key`, `on_selection_change`, `set_css_vars`
- synchronous window helpers instead of async wrappers

`npm run typecheck` now passes.

### Starter verification

Test copy with a local `file:` dependency:

```text
npm start      → created native window; mount complete
edit App.svelte → remount complete
npm run typecheck → 0 errors, 0 warnings
```

### Package test suite

`npm test` runs the restored suite. Everything passes except 10 `test/host.ts` assertions around focus walking and `scroll_into_view`:

```text
focus_next_within / focus_previous_within / focus_next / focus_previous
scroll_into_view
```

Those are the remaining old-suite failures to inspect separately. The starter and package typecheck are green.

### Not wired

The user-provided `build/` directory is app-specific: it imports `../src/kernel/design.svelte.ts` and belongs to the `fractalgpui` app, not the starter. It was left in place but is not part of the starter build.
