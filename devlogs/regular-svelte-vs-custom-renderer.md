---
title: Regular Svelte vs the Custom Renderer
description: how gpuix-fractalsvelte replaced Svelte's unreleased custom renderer with a headless DOM, and what that trade costs
---

## Short Answer

The move does not reimplement the custom renderer API.

It replaces the custom renderer boundary with a **DOM boundary**:

- the original `gpuix-svelte` compiled Svelte with `experimental.customRenderer` and supplied a renderer module through `svelte/renderer`;
- `gpuix-fractalsvelte` now compiles regular Svelte `generate: 'client'` output, installs a fake DOM in `globalThis`, mounts into that fake DOM, and translates DOM operations to `@gpuix/native` mutations.

Svelte thinks it is running on a normal browser DOM. `gpui-dom` intercepts the DOM operations and projects them onto GPUI.

So `gpuix-fractalsvelte` is **not** using Svelte's unreleased custom renderer API. It is using the public client compiler, the regular client runtime, and an emulation layer at the DOM operations boundary.

## What the Custom Renderer Did

The original model used Svelte's unreleased custom-renderer extension point:

```ts
compile(source, {
  experimental: { customRenderer: 'gpuix-fractalsvelte/renderer' }
});
```

The compiler emitted components that imported `gpuix-fractalsvelte/renderer` instead of using the DOM runtime. The renderer supplied node operations directly:

```ts
createRenderer({
  createElement,
  createTextNode,
  appendChild,
  insertBefore,
  remove,
  setText,
  setAttribute,
  …
});
```

That is a clean architectural boundary: Svelte asks the renderer to create and mutate nodes, and the renderer maps those operations to GPUI without pretending a DOM exists.

The cost was the dependency on an unreleased Svelte API. The exact Svelte build had to be shipped with the package because a normal npm Svelte did not export `svelte/renderer`.

## What gpuix-fractalsvelte Does Now

The current path lives in:

- `src/dom/runner.ts`
- `src/dom/gpui-dom.ts`
- `src/dom/styles/load.ts`
- `src/dom/native.ts`

### 1. Compile regular Svelte

The runner uses the normal client compiler:

```ts
const { js, css } = compile(source, {
  filename,
  generate: 'client',
  runes: true
});
```

No `experimental.customRenderer`.

The root component is written to `.cache`, imported, and mounted.

Child `.svelte` files are compiled on load through Node's `module.registerHooks`. Their CSS is registered at the same time.

### 2. Install a fake DOM before Svelte runs

`initGpuiDom` installs:

```ts
globalThis.Node
globalThis.Element
globalThis.Text
globalThis.Comment
globalThis.DocumentFragment
globalThis.HTMLTemplateElement
globalThis.document
globalThis.window
globalThis.navigator
```

The DOM tree is real enough for Svelte's client runtime:

- `GpuixNode`, `GpuixElement`, `GpuixText`, `GpuixComment`, `GpuixDocumentFragment`
- `appendChild`, `insertBefore`, `removeChild`
- attributes, classes, style strings
- `firstChild`, `nextSibling`, `parentNode`
- template parsing for Svelte's `from_html` cloning

### 3. Mount regular Svelte into the fake DOM

The runner resolves the app's Svelte runtime and mounts:

```ts
const sveltePkg = createRequire(pathToFileURL(svelteFile)).resolve('svelte/package.json');
const clientUrl = new URL('./src/index-client.js', 'file://' + sveltePkg).href;
const { mount, unmount, flushSync } = await import(clientUrl);

mount(component, { target: doc.body, anchor });
```

Svelte runs its normal client runtime. It creates and mutates `GpuixElement`/`GpuixText` objects instead of browser nodes.

### 4. Translate the fake DOM to GPUI

When a node becomes reachable from the root, `gpui-dom` materializes it:

```ts
mutationQueue.push(['createElement', nativeId, tag]);
mutationQueue.push(['setStyle', nativeId, style]);
mutationQueue.push(['setEventListener', nativeId, type, true]);
mutationQueue.push(['appendChild', parentId, childId]);
```

`@gpuix/native` receives the same kind of mutation batch the old renderer used.

### 5. Rebuild the CSS layer

Because Svelte now emits normal CSS text, `gpui-dom` implements the missing browser CSS engine:

- parses flat CSS rules
- splits comma-separated selectors
- supports classes, one tag, `:hover`, `:active`
- computes specificity and source order
- matches rules against the element's class set
- maps declarations through `src/style.ts`

That is why `<style>` blocks still work, and why fractalstyler classes can be loaded through `src/dom/styles/load.ts`.

### 6. Trap Svelte's delegated event symbol

Svelte 5 delegates events through an internal `event_symbol` property on elements. The shim defines that property on `GpuixElement.prototype` and traps writes in a Proxy, so delegated events become native GPUI listeners.

## Side By Side

| Concern | Original custom renderer | Current DOM shim |
|---|---|---|
| Svelte API | `experimental.customRenderer` | stable `generate: 'client'` |
| Svelte build | vendored/forked exact build | npm `svelte` dependency |
| Boundary | renderer node operations | fake DOM node operations |
| Node creation | Svelte renderer `createElement` | `GpuixElement` constructor |
| CSS | CSS text already in renderer pipeline | manually parsed by `gpui-dom` |
| Events | renderer-owned event model | DOM event shim + `event_symbol` trap |
| Hot reload | custom renderer compile + remount | root compile + `registerHooks` + remount |
| Child components | renderer compile | `module.registerHooks` compile |
| Distribution | exact vendored Svelte required | regular Svelte required |
| Failure surface | custom renderer API changes | DOM API gaps + Svelte internals |

## Does It Still Depend on Svelte Internals?

Yes, but at a different place.

Not using `svelte/renderer` does not mean using only public Svelte APIs. The current path depends on:

- `svelte/src/index-client.js` — imported by path, not through the public exports map.
- `svelte/src/internal/client/dom/elements/events.js` — imported by path to read `event_symbol`.
- `svelte/internal/client` — imported by compiled Svelte code. This is an export, but still an internal module.
- Svelte's DOM operation expectations, such as `nodeName`, `namespaceURI`, template cloning, and attribute behavior.

`ensureEventSymbol` is the clearest example:

```ts
const sveltePkg = sveltePkgPath ?? createRequire(import.meta.url).resolve('svelte/package.json');
const eventsUrl = new URL('./src/internal/client/dom/elements/events.js', 'file://' + sveltePkg).href;
const { event_symbol } = await import(eventsUrl);
```

That is more fragile than the custom renderer contract in one sense: the custom renderer API was an explicit extension point; the `event_symbol` module path is an implementation detail.

On the other hand, the package now uses the normal Svelte compiler/runtime, so most Svelte features do not require a fork.

## Tradeoffs

### Gains

1. **No vendored Svelte fork**  
   The package depends on npm Svelte, so users can install and update Svelte normally.

2. **Standard Svelte client output**  
   Runes, snippets, `{#if}`, `{#each}`, `{#await}`, component composition, and normal compiler behavior come from the public compiler.

3. **CSS and `<style>` blocks remain available**  
   The project can keep fractalstyler classes and app CSS, which the custom renderer path had started to support but through a different mechanism.

4. **No dependency on an unreleased API**  
   The package no longer breaks because Svelte changes `customRenderer`. It breaks if Svelte changes DOM internals or the client runtime shape.

5. **Smaller Svelte surface to vendor**  
   No tarball, no exact-build lockstep, no bundling of Svelte inside the package.

### Costs and risks

1. **DOM emulation is incomplete**  
   `gpui-dom` implements only what the demo needs: nodes, attributes, classes, text, basic events, simple style rules. Browser APIs such as `querySelector`, `getBoundingClientRect`, `closest`, form behavior, selection ranges, observers, and actions are absent or partial.

2. **CSS engine is custom and limited**  
   Supported selectors are classes, one tag, `:hover`, and `:active`. Attribute selectors, combinators, media queries, pseudo-elements, keyframes, and real CSS layout are not part of the model. Anything else must be dropped or approximated.

3. **Svelte internals are still a dependency**  
   `event_symbol`, the client entry path, and `svelte/internal/client` can change. A minor Svelte update is still a compatibility event.

4. **Compiler/runtime version alignment matters**  
   `run_dom` uses the app's Svelte runtime but the package's `svelte/compiler`. If those versions diverge, compiled output and runtime expectations can diverge. The package should pin or peer-depend on one Svelte range.

5. **Performance is different**  
   The old renderer translated Svelte node operations directly. The new path builds a virtual DOM tree, materializes nodes lazily, and re-parses CSS rules. It is more allocation-heavy and adds indirection.

6. **Testing surface is smaller**  
   The old custom-renderer test suite exercised the renderer directly. That suite was retired. A new DOM-runtime test suite is required to cover node operations, style matching, events, hot reload, and Svelte feature compatibility.

7. **Standalone build is harder**  
   The old Bun build compiled Svelte at build time through the plugin. The new runtime compiles `.svelte` files at runtime, so a single executable has to embed source files or compile them ahead of time. The current starter has no standalone build.

8. **Node-only runtime**  
   The runner uses `module.registerHooks`, which Bun does not implement. The bin spawns Node even when invoked through Bun. This narrows the supported runtime.

9. **One Svelte instance must be enforced**  
   The starter initially loaded two Svelte copies: the app's and the package's. The runner now resolves Svelte from the entry tree. That fix is essential; otherwise mount and compiled imports use different runtimes.

10. **Global DOM pollution**  
    `initGpuiDom` writes fake DOM classes into `globalThis`. That is how Svelte's client runtime finds them, but it makes multiple runtimes or multiple windows harder and can surprise unrelated code in the same process.

## Is This Better Than the Custom Renderer?

It is a different bet.

The custom renderer bet was:

> depend on an unreleased Svelte extension API, but get a clean renderer boundary.

The DOM shim bet is:

> depend on Svelte's DOM expectations and client internals, but avoid the unreleased extension point and the Svelte fork.

The second bet is better for distribution and for using normal Svelte. It is worse for DOM completeness, performance, and test surface. The package has traded a formal renderer contract for a broad but shallow DOM emulation.

## What Would Make the Trade Sound

- Pin or peer-depend on one Svelte range so compiler and runtime cannot diverge.
- Add a compatibility test that runs on every Svelte update: mount, CSS, events, focus, hot reload, child components.
- Document the supported DOM subset explicitly.
- Keep the CSS selector subset explicit and warn once per unsupported selector.
- Decide whether to support multiple roots/windows; the current globals and one-DOM model assume one app instance per process.
- Provide an ahead-of-time compile path before shipping standalone binaries.

## Conclusion

`gpuix-fractalsvelte` achieves what the custom renderer did by moving the adapter one layer outward:

```text
Svelte custom renderer:
Svelte → custom renderer ops → GPUI

gpuix-fractalsvelte:
Svelte → fake DOM ops → gpui-dom → GPUI
```

It is not using the custom renderer API. It is using regular Svelte and making the DOM look real enough for Svelte to run. That removes the vendored Svelte requirement and the unreleased API dependency, but it adds a hand-built DOM/CSS/event layer that must now be maintained and tested as its own product.

## Was the CSS Engine Better in the Custom Renderer?

No. The custom renderer API did not solve CSS.

The old implementation had the same selector limits. Its `compile.ts` accepted exactly:

```text
optional tag + classes + :hover/:active
```

and refused everything else:

```ts
if (complex.children.length !== 1 || complex.children[0].combinator) return null;
```

The old docs said the same thing explicitly: combinators, pseudo-classes other than `:hover`/`:active`, pseudo-elements, `:global`, attribute selectors, `@media`, and nesting were not supported.

The custom renderer boundary only replaced **node operations**. It did not provide:

- a CSS parser with broader selector support
- attribute-selector matching
- combinators
- media-query evaluation
- pseudo-elements
- a layout engine
- browser CSS inheritance
- CSS animation/keyframes

That logic lived in `compile.ts`, `style.ts`, and the renderer's `class_rules`, not in `svelte/renderer`.

### What the old path did better

The old path compiled CSS during the Svelte compile step and turned rules into `ClassRule[]`:

- declarations without `var()` were parsed at compile time
- rules were grouped by Svelte scope hash
- stylesheet lookup was keyed by scope class
- each rule's resolved style was cached per `set_css_vars` generation
- unsupported selectors were rejected with a warning at compile time

### What the new path does differently

The new path receives raw CSS from the regular Svelte compiler and parses it at runtime:

- `registerCSS()` stores flat rules
- `gpui-dom` computes weight and matches classes/tags/pseudos
- `build_style()` merges matched rules and parses declarations
- `svelte-*` scope classes remain in the required class set

That is more runtime work, but the **selector ceiling is essentially the same**.

One regression: the old compiler refused `@media` outright, while `gpui-dom` currently flattens `@media`/`@supports`/`@layer` wrappers and applies the inner rules unconditionally. That can make responsive rules always apply. It is a difference in behavior, not an improvement.

### Conclusion

Attribute selectors, combinators, responsive conditions, pseudo-elements, and real CSS cascade were already absent in the custom renderer path. They are a limitation of the GPUI styling model and of both CSS implementations, not a consequence of dropping the custom renderer API.

The move changed **when and how CSS is parsed**:

```text
custom renderer: compile-time CSS extraction + scoped ClassRule[]
DOM runtime:     runtime CSS text parsing + global rule registry
```

It did not unlock a richer CSS engine.
