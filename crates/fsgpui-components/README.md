# fsgpui-components

> Native UI component collection for GPUI desktop applications, styled strictly with `@fractaldesign/fsgpui` zero-drift tokens.

`fsgpui-components` is the canonical native component library for GPUI applications within the Fractal ecosystem. It replaces third-party dependencies with clean, self-contained primitives that consume `fsgpui-theme` tokens directly.

---

## Features

- **Layout Helpers**: `h_flex()`, `v_flex()`, and `flex_center()` for consistent flex layouts.
- **Theme Trait**: `ActiveTheme` (`cx.theme()`) providing access to the current `FsTheme` across GPUI views and contexts.
- **Embedded Vector Icons (`Icon`, `IconName`)**: ~45 vector SVG icons embedded into memory via `FsAssets`, eliminating disk asset dependencies.
- **Buttons & Chips**:
  - `Button`, `ButtonVariants`, `IconButton`
  - Canonical helpers: `button()`, `primary_button()`, `ghost_button()`, `chip()`, `pill()`, `kbd()`, `section_label()`.
- **Inputs**: `Input`, `InputState`, and `InputEvent` (`Change`, `Submit`, `PressEnter`).
- **Menus & Popovers**:
  - `PopupMenu`, `MenuItem`, `ContextMenuExt`
  - `DropdownMenu` with caret integration
  - `Popover`, `PopoverState` (`dismiss`)
- **Tooltips & Scroll**:
  - `Tooltip` (supporting both `Render` and `RenderOnce`)
  - `ScrollableElement` with smooth scrolling ergonomics
- **Traits**: Standardized `ComponentSize`, `Sizable`, `Selectable`, and `Disableable`.

---

## Quickstart

Add `fsgpui-components` and `fsgpui-theme` to your `Cargo.toml`:

```toml
[dependencies]
gpui = "0.2.2"
fsgpui-theme = { path = "../fsgpui-theme" }
fsgpui-components = { path = "../fsgpui-components" }
```

In your application entry point:

```rust
use fsgpui_components::FsAssets;
use gpui::*;

fn main() {
    gpui::Application::new()
        .with_assets(FsAssets)
        .run(|cx: &mut App| {
            // Your app initialization
        });
}
```

Using components in a view:

```rust
use fsgpui_components::*;
use fsgpui_theme::*;
use gpui::*;

fn render_actions(cx: &mut WindowContext) -> impl IntoElement {
    let theme = cx.theme();

    h_flex()
        .gap(SPACE_SM)
        .child(
            primary_button("save-btn", "Save", &theme)
                .on_click(cx.listener(|this, _, _window, cx| {
                    // Handle action
                }))
        )
        .child(
            ghost_button("settings-btn", "Settings", &theme)
        )
}
```
