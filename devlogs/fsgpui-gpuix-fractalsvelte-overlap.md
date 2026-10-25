---
title: FSGPUI and gpuix-fractalsvelte Overlap
description: factfinding on duplicated responsibilities, drift risks, and the rightful integration boundary between fsgpui and gpuix-fractalsvelte
---

## Scope

Read:

- `packages/fsgpui/README.md`
- `packages/fsgpui/src/`
- `packages/fsgpui/crates/`
- `packages/fsgpui/docs/`
- `packages/fsgpui/tests/index.test.js`
- `packages/fsgpui/examples/gpui_demo/`
- `packages/fsgpui/vendor/gpuix-fractalsvelte/src/`
- `packages/fsgpui/examples/gpuix-fs-appone/` as the current integration demo

This is factfinding, not an implementation plan. It separates observed facts from inferences.

## 1. Where gpuix-fractalsvelte Redoes Or Re-Solves FSGPUI Work

### 1.1 CSS-to-GPUI style mapping

FSGPUI already owns a typed mapping from design declarations to GPUI:

- `src/gpui/element-mapper.ts` maps `StyleDeclaration` to `GpuiStyleOutput` and a Rust builder chain.
- `src/gpui/theme.ts` maps colors to `gpui::rgba(...)` and token scales to px snippets.
- `src/gpui/rust-gen.ts` emits `tokens.rs`, `FsTheme`, constants, and extension traits.

gpuix-fractalsvelte independently owns a runtime CSS-to-GPUI mapping:

- `vendor/gpuix-fractalsvelte/src/style.ts` (`parse_css_text`, `build_style`) maps CSS declarations to `GpuiStyle`.
- It handles CSS shorthands, `var()` substitution, hover/active, and dropped unsupported values.
- `examples/gpuix-fs-appone/gpui-dom.ts` now also owns selector parsing, specificity, and rule matching.

Observation: these are two different front doors to the same GPUI style model.

- FSGPUI starts from a TypeScript contract.
- gpuix-fractalsvelte starts from CSS text.
- Both encode spacing, radius, color, border, font, gap, padding, and margin semantics.

They are not identical, but they are the same responsibility at different layers. Any GPUI property support added to one must be added to the other or the two paths render differently.

### 1.2 Token extraction and emission

FSGPUI already defines token contracts and two outputs:

- `src/defaults.ts` — default colors, spacing, shapes, shadows, typography, speeds.
- `src/web/css.ts` — `toCssVariables(theme)`.
- `src/gpui/rust-gen.ts` — `generateRustTokens(theme)`.
- `src/gpui/theme.ts` — `toGpuiTheme(theme)`.

The current gpuix demo independently does the same job again:

- `examples/gpuix-fs-appone/src/lib/styles/load.ts` compiles Sass, extracts custom properties, resolves `rem`/`calc`/`clamp`/nested `var()`, camel-cases names, and calls `set_css_vars`.
- `examples/gpuix-fs-appone/src/lib/styles/themes.ts` holds a separate light/dark palette.
- `vendor/gpuix-fractalsvelte/src/style.ts` stores and substitutes those variables.

Observation: there are now at least three token pipelines:

1. fractalstyler Sass (`_00_tokens.sass`) -> CSS custom properties -> `load.ts` -> `set_css_vars`.
2. FSGPUI TypeScript theme -> `toCss()` / `toRust()` / `toGpuiTheme()`.
3. hand-maintained palettes in `examples/gpuix-fs-appone/src/lib/styles/themes.ts` and `App.svelte`.

They produce overlapping token names but are not the same source.

### 1.3 Validation and drift control

FSGPUI has authoring-time validation:

- `src/check/validator.ts` rejects unknown token names.
- `src/style.ts` throws in strict mode.
- `!custom` is the documented escape hatch.

gpuix-fractalsvelte has runtime guardrails instead:

- `style.ts` drops unsupported style values and warns once per property.
- `compile.ts` refuses unsupported selectors.
- `gpui-dom.ts` now warns on selectors it cannot match and skips them.

Observation: both are “zero drift” mechanisms, but they fail at different times with different rules. FSGPUI fails at authoring time for token names; gpuix fails at render time for CSS/GPUI capability. Neither knows about the other’s allowlist.

### 1.4 Variants, sizes, shapes, and presets

FSGPUI already models the fractalstyler preset system:

- `src/types.ts` defines `VARIANTS`, `SIZES`, `SHAPES`, `PADS`, and `VARIANT_TARGETS` / `SIZE_TARGETS` / `SHAPE_TARGETS` / `PAD_TARGETS`.
- `src/recipe.ts` (`canonicalAttrs`) emits `el-variants`, `el-size`, `el-shape`, `el-pad` plus `data-*` attributes.

gpuix-fractalsvelte separately handles class rules and pseudo states:

- `vendor/gpuix-fractalsvelte/src/compile.ts` accepts classes, one tag, `:hover`, `:active`.
- `examples/gpuix-fs-appone/gpui-dom.ts` now ports the same matching model.
- Neither gpuix path matches `[data-variant]` selectors.

Observation: the variant model exists twice.

- FSGPUI models it in TypeScript and emits inline CSS plus data attributes.
- fractalstyler models it in Sass (`_10_propped.sass`, `el-variants[data-variant=...]`).

The Sass model works when attribute selectors are supported. The FSGPUI model does not reach GPUI today because gpuix has no attribute-selector matching. The current demo works around this by using class variants instead.

### 1.5 Component libraries

FSGPUI has native GPUI components in `crates/fsgpui-components`:

- Button, IconButton, Input, Menu, Popover, Tooltip, Scroll, Dialog, layout helpers, icons.
- These are Rust/GPUI-native and use `fsgpui_theme::FsTheme`.

gpuix-fractalsvelte has Svelte components and native tags:

- `src/components/Scroller.svelte`, `Portal.svelte`, `Popover.svelte`, `Tooltip.svelte`.
- Native tags exposed by `@gpuix/native`: `input`, `textarea`, `code`, `diff`, `markdown`, `virtual-list`, `anchored`, `canvas`, `img`, `svg`.
- `src/renderer.ts` treats these as GPUI elements and manages their behavior.

Observation: the component sets overlap in purpose (button, input, popover, tooltip, scroll) but not in language. One is Rust-native, one is Svelte-native. They are both canonical component collections.

The overlap becomes a conflict when both claim the same tag or the same visual contract. For example:

- FSGPUI `fsgpui-components::Button` vs a future Svelte `Button.svelte`.
- gpuix native `<markdown>` / `<diff>` vs `fsgpui-doc` / `fsgpui-diff` / `fsgpui-mdeditor`.

Today they are separate implementations with separate token usage.

### 1.6 Hot reload, testing, and automation

FSGPUI has no Svelte runtime, so it does not duplicate these. This is a genuine gpuix-fractalsvelte capability:

- hot reload (`hot.ts`, `app.ts`)
- headless test harness (`test.ts`)
- automation protocol (`automation.ts`, `automation-server.ts`)
- event delegation and window key handling (`events.ts`, `renderer.ts`)
- window helpers (`window.ts`)

This is not redoing FSGPUI; it is the missing runtime layer.

## 2. Conflict And Divergence Risks

### 2.1 Token vocabulary differs

Observed differences:

| Concept | FSGPUI | fractalstyler / gpuix demo |
|---|---|---|
| Brand color | `brand`, `brandAlt`, `brandSub` | `theme-color`, `theme-color-alt`, `theme-color-sub` |
| Base text size | `--text-bs: 14px` | `--text-bs` is a `clamp(...)` around 16px |
| Header height | `48px` (`defaultHeights.header`, `HEADER_HEIGHT`) | `64px` (`--header-height`) |
| Sidebar width | `260px` | `280px` |
| Space scale | adds `3xs`, `2xs` | starts at `xs`, ends at `3xl` |
| Shape vocabulary | `min`, `modern`, `curved`, `bs`, `lg`, `full`, … | `radius-xs/sm/md/bs/lg/full` plus presets `square/min/modern/curved/round` |

These are not cosmetic differences. The same token name can resolve to a different value depending on which system generated the CSS.

### 2.2 The same palette exists in several places

Observed palettes:

- `src/defaults.ts` — dark palette `bg: #0f1115`, `bgSurface: #16181d`.
- `examples/gpuix-fs-appone/src/lib/styles/themes.ts` — dark palette `bg: #121412`, `bgSurface: #1E201E`; its `lightTheme` is currently identical to `darkTheme`.
- `examples/gpuix-fs-appone/src/App.svelte` — a separate, inline light palette.
- `examples/gpuix-fs-appone/src/lib/styles/_00_tokens.sass` — light and dark token blocks with yet another set of values.
- `crates/fsgpui-theme/src/tokens.rs` — `FsTheme::dark()` and `FsTheme::light()`.

A single color change now has five candidate edit points. This is the clearest existing drift risk.

### 2.3 Generated Rust already diverges from its generator

Observed:

- `src/gpui/rust-gen.ts` generates `FsTheme` from the color keys in `ResolvedTheme`.
- `crates/fsgpui-theme/src/tokens.rs` contains extra fields not generated by that source: `background`, `foreground`, `muted_foreground`, `primary`, `popover`, `muted`, `list_active`, `list_hover`, `link`, `caret`, `selection`, `font_family`, `mono_font_family`.
- `crates/fsgpui-theme/src/tokens.rs` and `examples/gpui_demo/src/tokens.rs` are not identical.
- `examples/gpui_demo/generate.js` imports from `../../dist/index.js`, not from `src/`, so the generator can run against stale compiled output.
- `docs/03-token-contracts.md` documents values that differ from `src/defaults.ts` (for example `xs: 6px` vs `4px`; `sharp` radius vs `min`/`modern`).

This is not only a cross-package risk. FSGPUI already has internal source-of-truth drift between docs, source, dist, and generated Rust.

### 2.4 Two selector/style engines

Observed:

- `vendor/gpuix-fractalsvelte/src/renderer.ts` + `compile.ts` implement selector matching for the custom-renderer path.
- `examples/gpuix-fs-appone/gpui-dom.ts` now implements selector matching for the regular-Svelte path.
- Both use `vendor/gpuix-fractalsvelte/src/style.ts` for declaration parsing and `build_style`.

Risk: the two selector engines can drift on:

- supported selector shapes
- specificity ordering
- scoping (`svelte-*` classes)
- hover/active handling
- tag-only rules
- attribute selectors
- CSS at-rule handling

The demo now has two render paths that must be kept behaviorally equal:

- `app.ts` -> `gpui-dom.ts` (regular Svelte)
- `standalone.ts` / `test.ts` -> `gpuix-fractalsvelte` renderer (custom renderer)

### 2.5 Style property coverage differs

Observed:

- `fsgpui` `StyleDeclaration` is a curated, typed subset.
- `gpuix-fractalsvelte` `style.ts` accepts any CSS property and drops only values GPUI rejects.
- The CSS parser has broader coverage (for example `display: grid`, `border-width` shorthands, CSS variables on any property).
- The FSGPUI mapper has narrower coverage and a different output shape (`rustSnippet` plus `GpuiStyleOutput`).

Risk: a style authored with FSGPUI can validate and generate Rust but be impossible to express through the CSS class pipeline, or produce different output than the same design expressed in Sass.

### 2.6 Variant enums already differ

Observed:

- `src/types.ts` `SIZES = ['sm', 'md', 'bs', 'lg', 'xl']`.
- `crates/fsgpui-components/src/traits.rs` `ComponentSize = Xs | Sm | Md | Lg | Xl`.
- `shapes` includes `square`, `min`, `modern`, `curved`, `round`, plus loose extras `bs`, `lg`, `none`, `xs`, `sm`, `md`, `full`.
- fractalstyler `_10_propped.sass` has `data-variant`, `data-shape`, `data-size`, `data-pad` with its own sets.

Risk: a “size” or “shape” value valid in one package is not valid in another, and the Rust component defaults can disagree with the Sass presets.

### 2.7 Documentation is ahead of or behind the code

Observed examples:

- `docs/08-zero-drift-and-linting.md` documents `checkDrift()`, but `src/check/index.ts` exports only `validator`; no `checkDrift` exists in source.
- `docs/10-api-reference.md` documents `.raw()` on styles, but `CompiledStyle` in `src/types.ts` does not show `.raw()`.
- `docs/03-token-contracts.md` documents spacing and radius values different from `src/defaults.ts`.
- README goal 7 says gpuix-fractalsvelte should be enhanced with fractalstyler styling; the actual integration still lives in the demo, not the package.

Risk: agents and users following docs can implement against APIs or values that do not exist.

### 2.8 `.dist` can be the de facto source

Observed:

- `tests/index.test.js` imports `../dist/index.js`.
- `examples/gpui_demo/generate.js` imports `../../dist/index.js`.
- `crates/fsgpui-theme/src/tokens.rs` looks newer or hand-edited relative to `src/gpui/rust-gen.ts`.

Risk: source changes that are not rebuilt can silently fail tests or generate stale Rust. A generated artifact can become the real source of truth by accident.

### 2.9 Package name and comments are inconsistent

Observed:

- Package name is `@fractaldesign/fsgpui`.
- Source comments still say `@fractaldesign/fsgui`.
- README refers to `packages/fsgpui` while living at that path; internal links assume different roots.

This is minor but contributes to “which package owns this?” confusion.

## 3. Where Integration Is Rightful

Assuming the overlaps are resolved by assigning ownership, gpuix-fractalsvelte is a strong complement to FSGPUI.

### 3.1 FSGPUI owns the design contract and native crates

FSGPUI is the right place for:

- token vocabulary and validation
- `!custom` escape-hatch policy
- drift auditing
- Rust codegen (`tokens.rs`, `FsTheme`, constants, extension traits)
- native GPUI component crates (`fsgpui-components`)
- native capability crates (`fsgpui-doc`, `fsgpui-mdeditor`, `fsgpui-terminal`, `fsgpui-diff`, `fsgpui-mermaid`, `fsgpui-browser`)

None of these are Svelte concerns, and gpuix-fractalsvelte should not reimplement them.

### 3.2 gpuix-fractalsvelte owns the Svelte-to-GPUI runtime

gpuix-fractalsvelte is the right place for:

- Svelte 5 compilation and mounting
- GPUI window creation and event loop
- event delegation, focus, keyboard, and pointer handling
- hot reload
- CSS class application at runtime
- Svelte components (`Scroller`, `Portal`, `Tooltip`, `Popover`)
- headless testing and automation
- window APIs (`minimize`, `zoom`, fullscreen, title, file picker)
- web/browser target

FSGPUI does not need to duplicate any of this.

### 3.3 The natural seam

A clean boundary would be:

```text
fractalstyler Sass / FSGPUI tokens
        │
        ├─ CSS custom properties ──> gpuix-fractalsvelte runtime
        ├─ Rust tokens.rs ─────────> FSGPUI native crates
        └─ typed style/recipes ────> app authoring
```

and:

```text
Svelte component
        │
        └─ class rules / inline styles ──> gpuix-fractalsvelte
                                             └─ @gpuix/native
```

FSGPUI should not generate a second CSS class system. gpuix-fractalsvelte should not define its own palette or its own token scale.

### 3.4 What gpuix-fractalsvelte uniquely adds

- Regular Svelte 5 support without the vendored Svelte fork (`gpui-dom.ts` path).
- A custom-renderer path with richer selector/scoping semantics.
- A real event/focus/keyboard model over GPUI’s native events.
- Live theme updates through `set_css_vars`.
- Hot reload that keeps one Svelte runtime alive.
- A headless test harness and automation server.
- Svelte-native overlays: portal, popover, tooltip, scroller.
- A browser/web target for the same component code.

These are not things FSGPUI currently provides and are the strongest argument for keeping gpuix-fractalsvelte as a separate package.

### 3.5 What FSGPUI uniquely adds

- Compile-time token contracts and drift detection.
- A single theme definition that can emit both web CSS and Rust.
- Native GPUI components that Svelte should not own.
- Rich native capabilities: document AST, Markdown editor, terminal, diff review, Mermaid, WKWebView/WebView2.
- Rust-side performance and typed builder chains.

These justify FSGPUI as the design-system and native-capability layer.

## 4. Recommended Ownership Boundaries

These are proposals, not implemented decisions.

### 4.1 One token source

Pick one canonical source:

- fractalstyler Sass, or
- FSGPUI TypeScript theme.

Generate the others from it:

- CSS custom properties for gpuix
- `tokens.rs` / `FsTheme` for native crates
- a JS token map for `set_css_vars`
- documentation tables

Do not hand-maintain palettes in `themes.ts`, `App.svelte`, `_00_tokens.sass`, and `tokens.rs`.

### 4.2 One CSS-to-GPUI mapper

Choose one owner:

- gpuix-fractalsvelte owns runtime CSS parsing (`style.ts` + selector engine), and FSGPUI’s `element-mapper` is only a Rust-codegen helper.
- or FSGPUI owns the mapping contract, and gpuix consumes generated style objects instead of parsing CSS.

Having both parse and map styles is the highest-risk duplication.

### 4.3 One variant model

Choose:

- fractalstyler class/preset model (works today), or
- FSGPUI `data-*` recipe model (needs attribute-selector support).

Do not ship both as “canonical”. `canonicalAttrs` currently emits data attributes that gpuix cannot use; either gpuix supports them or FSGPUI emits classes.

### 4.4 One native component owner per tag

Define which package owns `button`, `input`, `markdown`, `diff`, `virtual-list`, `popover`, `tooltip`, and `scroll`.

Likely split:

- FSGPUI owns Rust-native primitives and big native surfaces.
- gpuix-fractalsvelte owns Svelte composition and DOM-like tags.
- `@gpuix/native` owns the GPUI element implementation for tags it exposes.

### 4.5 Generated artifacts must be checked

Add drift checks:

- regenerate `tokens.rs` from source and fail if the committed file differs
- compare `crates/fsgpui-theme/src/tokens.rs` and `examples/gpui_demo/src/tokens.rs`
- ensure tests import `src` or a freshly built `dist`, not a stale `dist`
- run `toCss()` against fractalstyler’s token output and compare token names/values

## 5. Open Questions

- Is fractalstyler Sass or FSGPUI TypeScript the intended token source of truth?
- Should `canonicalAttrs` keep emitting `data-*`, or should it emit class variants?
- Should `fsgpui-element-mapper` be deprecated in favor of gpuix’s CSS parser?
- Should `gpui-dom.ts` be promoted into gpuix-fractalsvelte, or stay demo-local?
- Which native tags are owned by `@gpuix/native` versus `fsgpui-components`?
- Should FSGPUI’s `toCss()` output be compatible with fractalstyler’s `_00_tokens.sass`, or is it a separate web-only theme?
- Should docs be generated from source to prevent the current API/value drift?
