---
title: Architecture and Philosophy
description: Understand the Zero Drift philosophy behind FSGPUI. Learn how compile-time constraints protect design consistency across web and native apps.
---

AI coding agents and developers produce arbitrary design values faster than design reviews can catch them. FSGPUI eliminates design drift by embedding design tokens into TypeScript type-checker constraints.

## The problem: design drift

Without compiler enforcement, user interfaces drift quickly:

* Developers write random values like `gap: 13px` or `padding: 17px`.
* Designers introduce incompatible border radiuses (`12px`, `24px`) that break system rules.
* Codebases diverge between web frontends (CSS) and desktop applications (GPUI in Rust).

## The solution: Zero Drift

FSGPUI wraps your design system in strict type constraints:

```
[TypeScript Token Contract]
            │
            ├──> Compile-time validation (Type errors for arbitrary values)
            │
            ├──> GPUI Code Generator ──> tokens.rs (Rust constants & builder chains)
            │
            └──> Web CSS Generator   ──> CSS custom properties & style objects
```

* **Exhaustive token keys** - Only declared token names are permitted in style objects.
* **Dual-target codegen** - Web and desktop share identical color values, spacing scales, and border radiuses.
* **Searchable escape hatch** - When an off-system value is truly necessary, you must append `!custom` (e.g. `13px !custom`). This makes deviations visible and searchable in code reviews.

## Fractal design system alignment

FSGPUI encodes the rules of the Fractal Design System:

1. **Strict border radiuses** - Maximum radius is 4px (`modern`) or 8px (`curved`). High border radiuses are rejected.
2. **Sparse borders** - Visual separation relies on background color steps (`bg`, `bgSurface`, `bgSunken`) rather than multiple borders.
3. **Structured spacing scale** - Spacing follows a 4px base increment (`xs: 4px`, `sm: 8px`, `md: 12px`, `bs: 16px`, `lg: 24px`, `xl: 32px`).

## Related pages

* [Getting started](./01-getting-started.md)
* [Token contracts](./03-token-contracts.md)
* [Zero drift and linting](./08-zero-drift-and-linting.md)
* [GPUI Rust codegen](./06-gpui-rust-codegen.md)
