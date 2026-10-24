# fsgpui-theme

> Canonical zero-drift design tokens, 17 space families, partition-law hairlines, and theme palettes (`FsTheme`) for native GPUI applications.

`fsgpui-theme` is generated and maintained by `@fractaldesign/fsgpui`. It defines all spacing, border radiuses, typography baselines, partition borders, and color palettes used across native GPUI crates and desktop applications.

---

## Token Families

- **Spacing Scale**: 17 space family constants (`SPACE_3XS` to `SPACE_4XL`).
- **Border Radii**: Strict fractal standard (`RADIUS_MIN`, `RADIUS_MODERN`, etc. with maximum 4px/8px limits).
- **Partition Law Lines**: Hairline divider helpers matching the fractalstyler partition law:
  - `.bb_sub(&theme)` (border-bottom subtle)
  - `.bt_sub(&theme)` (border-top subtle)
  - `.br_sub(&theme)` (border-right subtle)
  - `.bl_sub(&theme)` (border-left subtle)
- **Palettes**: `FsTheme::dark()`, `FsTheme::light()`, and custom theme constructors.

---

## Usage

```rust
use fsgpui_theme::*;
use gpui::*;

div()
    .flex()
    .h(HEADER_HEIGHT)
    .px(SPACE_BS)
    .bg(theme.bg_surface)
    .bb_sub(&theme)
    .text_sm()
    .text_primary(&theme)
    .child("Zero-drift design system")
```
