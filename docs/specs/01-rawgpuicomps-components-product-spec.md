---
title: "Product Spec: Unified Native GPUI Component System (fsgpui-components)"
type: spec
category: framework
status: draft
---

# Product Spec: Unified Native GPUI Component System (`fsgpui-components`)

## Summary
Recreate and unify the 633 raw GPUI components from `modules/rawgpuicomps` into a canonical, cohesive, zero-drift component library under `@fractaldesign/fsgpui` (`fsgpui-components`). This provides developers with an end-to-end, production-ready desktop UI solution for building rich GPUI applications using official Zed GPUI `0.2.2` and `fsgpui-theme` tokens.

---

## 1. Consumer Persona & Core Value
The primary consumer is a Rust developer building native GPUI desktop applications (such as `fractalai-notes`, coding environments, agent workstations, or specialized data tools) within the Fractal platform.

Developers must be able to import all standard UI elements directly from `fsgpui_components::*` and construct rich, responsive, theme-consistent interfaces without authoring custom low-level styling, mouse event math, or external asset loading pipelines.

---

## 2. Behavior Invariants

### 2.1 Theme & Token Invariants
1. **Zero-Drift Enforcement**: Every component reads colors exclusively from the active `FsTheme` and dimensions exclusively from `fsgpui_theme` token constants (`SPACE_*`, `RADIUS_*`, `HEIGHT_*`). Hardcoded pixel dimensions or ad-hoc hex colors in component view code are strictly prohibited.
2. **Dynamic Mode Switching**: Switching between Light and Dark themes via `fsgpui_components::set_theme(...)` updates all rendered components immediately on the next frame with zero view recreation or layout glitch.
3. **Partition-Law Boundaries**: Panel dividers, headers, footers, sidebars, and card edges render as subtle 1px hairline dividers conforming to `fractalstyler` partition law (`.bb_sub`, `.br_sub`, `.bl_sub`, `.bt_sub`).
4. **Border Radius Constraint**: Border radiuses must never exceed 4px (`RADIUS_MODERN` / 4px) for controls/cards or 2px (`RADIUS_MIN`) for tags/tooltips. Pill shapes (`RADIUS_FULL`) are allowed only for circular avatar badges and toggle pills.
5. **Density Modes**: All inputs, buttons, and list rows respond consistently to density configurations (Compact, Standard, Comfortable) via the `ComponentSize` / `ControlSize` trait.

### 2.2 Component Taxonomy & Functional Surface
The system organizes the 25 component domains into 5 cohesive functional layers:

1. **Foundations & Primitives**:
   - `layout`: Flex containers (`h_flex`, `v_flex`, `flex_center`), split panes, resizable containers, and scroll surfaces.
   - `primitives`: Backdrop overlays, caret indicators, disclosure arrows, dividers, focus rings (`FocusRing`), and pressable interaction wrappers.
   - `typography`: Headings (H1–H3), body text, inline code, keyboard shortcut badges (`Kbd`), links, and text ellipsis with tooltip truncation.
   - `motion`: Spinners, progress bars, shimmer skeletons, and spring animation helpers.

2. **Controls, Forms & Inputs**:
   - `buttons`: Standard `Button`, `IconButton`, `ButtonVariant` (Primary, Secondary, Outline, Ghost, Subtle, Danger, Link), button groups, segmented controls, confirm buttons, and copy-to-clipboard triggers.
   - `forms`: Single-line `Input`, multi-line `Textarea`, `Checkbox`, `RadioGroup`, `Switch` toggles, `Slider`, `Select` dropdowns, `Combobox` with fuzzy search, `DatePicker`, and `ColorPicker`.
   - `validation`: Inline field error messages, warning badges, and disabled state styling.

3. **Overlays, Menus & Shell**:
   - `overlays`: Native modal dialogs, popovers with click-outside dismissal, floating tooltips with delay timers, and auto-dismissing toast notifications.
   - `menus`: Popup menus, dropdown menus, context menus (`ContextMenuExt`), and system application menu bars.
   - `shell`: Native window titlebars with macOS traffic light spacing, status bars, tab strips with close buttons and dirty state indicators, and collapsible left/right sidebars.
   - `navigation`: Breadcrumb trails, pagination bars, stepper wizards, and navigation rails.

4. **Data Presentation, Tables & Documents**:
   - `data_display`: Badges, KPI cards, statistics cards, timelines, accordion trees, and tag clouds.
   - `tables`: Virtualized data tables supporting column resizing, sortable headers, row selection, and cell formatters.
   - `files`: File explorer trees, file card previews, drag-and-drop dropzones, and path breadcrumbs.
   - `documents`: Document outline drawers, markdown view surfaces, page thumbnails, and PDF preview cards.

5. **AI, Canvas & Developer Surfaces**:
   - `chat`: Chat message bubbles (User, Assistant, System), composer input with multiline expansion, and action toolbars.
   - `generative`: Thought pill containers (`<ThoughtPill>`) with collapsible reasoning traces, streaming text deltas, inline diff viewers, and tool call status cards.
   - `agent`: Agent task progress bars, memory inspection drawers, permission confirmation cards, and artifact preview panes.
   - `terminal`: ANSI-compatible terminal surface with cursor rendering and selection copy.
   - `canvas`: Node graph canvases with draggable nodes, port connectors, minimap overlay, and pan/zoom controls.

### 2.3 Interaction & Accessibility Invariants
1. **Focus Ring Uniformity**: Any interactive element receiving focus renders an unmistakable high-contrast focus ring (`theme.focus`) conforming to keyboard navigation standards.
2. **Keyboard Ergonomics**: All controls support keyboard activation (`Space` / `Enter` for buttons, arrow keys for segmented controls and menu navigation, `Escape` for dismissals).
3. **Embedded Vector Assets**: Icons render crisp vector SVGs at 1x, 2x, and Retina scales without blurring, powered by in-memory `FsAssets`. No external filesystem icon paths are required.
4. **Disabled State Invariant**: A disabled element cannot be focused, clicked, or hovered, and dims its opacity (`theme.fg_disabled`) with `cursor_not_allowed()`.
5. **Click-Outside Dismissal**: Open popovers, dropdowns, and context menus dismiss immediately when clicking outside their bounding rect.

---

## 3. Edge Cases & Invariants
1. **Zero Layout Thrashing**: Resizing windows or toggling sidebars must never produce frame drops or layout stutter; all flex layouts compute synchronously via GPUI's Taffy engine.
2. **Deep Component Nesting**: Components composed deeply (e.g., a virtualized Table containing Form Controls and Popover Menus inside an Agent Drawer) must share the identical `FsTheme` without context loss or theme flickering.
3. **Headless & Embedded Usage**: Components can be instantiated within standard GPUI `WindowContext`, embedded panes, modal overlays, or canvas nodes without requiring a specific root window type.
