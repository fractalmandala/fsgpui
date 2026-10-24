---
title: "Technical Spec: Unified Native GPUI Component System (fsgpui-components) - Layer 1 & Layer 2"
type: spec
category: framework
status: draft
---

# Technical Spec: Unified Native GPUI Component System (`fsgpui-components`) — Layer 1 & Layer 2

## 1. Scope & Invariant Baseline

Strictly aligned to `@fractaldesign/fractalstyler`:
1. **Removed Requirements**: `divider`, `disclosure`, `caret`, `backdrop`, `pressable`, and `shimmer` are excluded from component requirements.
2. **Scrollbar Metric**: All scrollbars are strictly **4px** (`gpui::px(4.0)`).
3. **Partition Dividers (3 Complete Sets)**:
   - `*_sub`: uses `theme.border_subtle` (`.bb_sub`, `.bt_sub`, `.br_sub`, `.bl_sub`)
   - `*`: uses `theme.border` (`.bb`, `.bt`, `.br`, `.bl`)
   - `*_str`: uses `theme.border_strong` (`.bb_str`, `.bt_str`, `.br_str`, `.bl_str`)
4. **Flexbox Architecture**:
   - `row()` / `h_flex()`: horizontal flex (`flex-direction: row`).
   - `box()` / `v_flex()`: vertical flex (`flex-direction: column`).
   - Spacing scale on flexbox: 8 canonical gap steps from `_00_config.sass`:
     - `gap_xs` (4px), `gap_sm` (8px), `gap_md` (12px), `gap_bs` (16px), `gap_lg` (24px), `gap_xl` (32px), `gap_2xl` (48px), `gap_3xl` (64px).
5. **Shape / Radius Variants (`SHAPES`)**:
   - `square`: 0px
   - `min`: 2px (`RADIUS_MIN`)
   - `modern`: 4px (`RADIUS_MODERN` — default control radius)
   - `curved`: 8px (`RADIUS_CURVED` — max permitted for cards per `DESIGN.md`)
   - `round`: 9999px (pills, badges, toggle switches)
6. **Size Variants (`SIZES`)**:
   - `sm`: height 20px, font `text_sm` (12px)
   - `md`: height 24px, font `text_sm` (12px)
   - `bs`: height 28px, font `text_bs` (16px, base)
   - `lg`: height 32px, font `text_lg` (20px)
   - `xl`: height 40px, font `text_xl` (25px)
7. **Typography Roles (`_03_typography.sass`)**:
   - `page_title` (`h1`): `text-3xl` (39px), weight 700, line-height 1.1
   - `page_heading_xl` (`h2`): `text-xl` (25px), weight 600, line-height 1.1
   - `card_title` (`h3`): `text-lg` (20px), weight 600, line-height 1.2
   - `text_body` (`p`): `text-bs` (16px), line-height 1.5
   - `page_desc` (`p`): `text-md` (14px)
   - `text_body_sm` (`p`): `text-sm` (12px), line-height 1.5
   - `kbd`: keyboard badge with monospace font and subtle border

---

## 2. File Organization (`crates/fsgpui-components/src/`)

```
src/
├── lib.rs              # Re-exports, prelude, and FsAssets
├── theme.rs            # ActiveTheme trait and cx.theme()
├── traits.rs           # Sizable (sm, md, bs, lg, xl), SizedShape (square, min, modern, curved, round)
├── icon.rs             # Icon, IconName, and in-memory FsAssets vector catalog
├── layout/
│   ├── mod.rs          # row(), box(), h_flex(), v_flex(), flex_center()
│   ├── split.rs        # SplitPane with 1px hairline splitter
│   ├── resizable.rs    # ResizablePanel container with clamp constraints
│   └── scroll.rs       # ScrollableElement with strict 4px scrollbar
├── typography/
│   ├── mod.rs          # page_title, page_heading_xl, card_title
│   ├── paragraph.rs    # text_body (16px), page_desc (14px), text_body_sm (12px)
│   ├── kbd.rs          # Keyboard shortcut badge (⌘S, ⌘P)
│   └── ellipsis.rs     # Single-line truncation with tooltip on overflow
├── buttons/
│   ├── mod.rs          # Button with VARIANTS, SIZES, and SHAPES
│   ├── icon_button.rs  # Square 1:1 icon button
│   ├── group.rs        # ButtonGroup with merged interior 1px partition hairlines
│   ├── segmented.rs    # SegmentedControl with data-variant="primary" active item
│   ├── confirm.rs      # Two-stage click safety button
│   └── copy.rs         # Copy-to-clipboard button with checkmark feedback
├── forms/
│   ├── mod.rs
│   ├── input.rs        # Single-line input with SIZES, SHAPES, and error state
│   ├── textarea.rs     # Multi-line text field with 4px scrollbar
│   ├── checkbox.rs     # Checkbox with vector checkmark
│   ├── radio.rs        # RadioGroup and RadioItem
│   ├── switch.rs       # Toggle switch with round pill thumb
│   ├── slider.rs       # Range slider track and thumb
│   ├── select.rs       # Dropdown select menu
│   └── field.rs        # FormField uniting label, description, control, and error
└── overlays/
    ├── mod.rs
    ├── tooltip.rs      # Floating hover tip with anchor positioning
    ├── popover.rs      # Anchored floating card with collision bounds
    ├── modal.rs        # Centered dialog with 60% scrim, header, body, actions
    ├── sheet.rs        # Slide-over edge drawer
    ├── toast.rs        # Corner notification banner stack with auto-dismiss
    └── menu.rs         # PopupMenu, MenuItem, DropdownMenu, ContextMenuExt
```

---

## 3. Partition Law Implementation (`FsElementExt`)

The 3 partition divider sets are implemented as fluent GPUI element extensions on `Div`:

```rust
pub trait FsPartitionExt: Styled {
    // Set 1: *_sub (uses theme.border_subtle)
    fn bb_sub(self, theme: &FsTheme) -> Self;
    fn bt_sub(self, theme: &FsTheme) -> Self;
    fn br_sub(self, theme: &FsTheme) -> Self;
    fn bl_sub(self, theme: &FsTheme) -> Self;
    fn border_sub(self, theme: &FsTheme) -> Self;

    // Set 2: * (uses theme.border)
    fn bb(self, theme: &FsTheme) -> Self;
    fn bt(self, theme: &FsTheme) -> Self;
    fn br(self, theme: &FsTheme) -> Self;
    fn bl(self, theme: &FsTheme) -> Self;
    fn border_std(self, theme: &FsTheme) -> Self;

    // Set 3: *_str (uses theme.border_strong)
    fn bb_str(self, theme: &FsTheme) -> Self;
    fn bt_str(self, theme: &FsTheme) -> Self;
    fn br_str(self, theme: &FsTheme) -> Self;
    fn bl_str(self, theme: &FsTheme) -> Self;
    fn border_str(self, theme: &FsTheme) -> Self;
}
```

---

## 4. Verification & Testing

1. **Unit Tests**:
   - Verify `FsPartitionExt` applies exact 1px borders and respective color tokens.
   - Verify all 5 `SHAPES` (`square`: 0px, `min`: 2px, `modern`: 4px, `curved`: 8px, `round`: 9999px).
   - Verify all 5 `SIZES` (`sm`: 20px, `md`: 24px, `bs`: 28px, `lg`: 32px, `xl`: 40px).
   - Verify `row()` and `box()` gaps match the 8-step spacing scale.
2. **Workspace & App Compilation**:
   - `cargo check --workspace` in `packages/fsgpui`.
   - `cargo test` in `apps/fractalai-notes`.
