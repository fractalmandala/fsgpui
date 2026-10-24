---
title: "Specification: Complete Manifest of Contents for the L1 & L2 Interactive Preview"
type: spec
category: framework
status: draft
---

# Complete Manifest of Contents for the L1 & L2 Interactive Preview

This document establishes the exact checklist and structural requirements for the interactive HTML preview of **Layer 1 (Foundations & Primitives)** and **Layer 2 (Controls, Forms & Overlays)** before any further HTML updates or GPUI code changes are made.

---

## 1. Why Text Was Top-Aligned in Previous Button Samples
In the previous HTML, buttons had `height` explicitly set without proper vertical flexbox centering (`display: flex; align-items: center; justify-content: center; line-height: 1;`). When a 40px height was applied with a 14px font, the text sat at the top baseline instead of being vertically centered.

**Requirement**: Every button in the preview must be explicitly centered both horizontally and vertically (`display: flex; align-items: center; justify-content: center; line-height: 1;`), regardless of whether its height is 20px, 28px, or 40px.

---

## 2. Complete Inventory of Everything the Preview Must Contain

### Section I: Tokens & Theme Ground Truth
1. **Color Tokens Table (`_00_tokens.sass`)**:
   - Surfaces: `--bg`, `--bg-surface`, `--bg-panel`, `--bg-sunken`, `--bg-raised`, `--bg-extra`, `--bg-input`, `--bg-button`
   - Inks: `--text-primary`, `--text-secondary`, `--text-muted`, `--text-inverse`
   - States: `--state-surface`, `--state-hover`, `--state-selected`
   - Borders: `--border`, `--border-subtle`, `--border-strong`
   - Accents: `--theme-color` (`#22c55e`), `--theme-color-alt` (`#00df89`), `--theme-color-sub` (`#10b981`), `--accent-orange` (`#FF7A00`), `--accent-green` (`#22C55E`)
   - Semantic Feedback: `--success`, `--warning`, `--danger`, `--info`
   - Focus Ring: `--ring` (`rgba(255, 208, 0, 0.45)`)
   - *Requirement*: Live toggle between Dark Theme and Light Theme.
2. **Dimension Scales**:
   - Spacing: The 8 canonical steps (`xs`: 4px, `sm`: 8px, `md`: 12px, `bs`: 16px, `lg`: 24px, `xl`: 32px, `2xl`: 48px, `3xl`: 64px) + fine steps (`3xs`: 2px, `2xs`: 4px).
   - Shapes: The 5 canonical steps (`square`: 0px, `min`: 2px, `modern`: 4px, `curved`: 8px, `round`: 9999px).
   - Sizes / Heights: The 5 canonical control steps (`sm`: 20px, `md`: 24px, `bs`: 28px, `lg`: 32px, `xl`: 40px) + shell metrics (`header`: 48px, `footer`: 32px, `sidebar`: 260px).
   - Scrollbar: Strict 4px width and height.

---

### Section II: Partition Dividers (Visual Isolation of all 14 Methods)
Each individual method rendered in its own dedicated card showing *only* that 1px hairline edge in its exact theme color:
1. **Set 1: `*_sub` (`theme.border_subtle`)**:
   - `.bt-sub` / `.bt_sub(&theme)` (Top edge only)
   - `.br-sub` / `.br_sub(&theme)` (Right edge only)
   - `.bb-sub` / `.bb_sub(&theme)` (Bottom edge only)
   - `.bl-sub` / `.bl_sub(&theme)` (Left edge only)
   - `.border-sub` / `.border_sub(&theme)` (Full box 1px subtle)
2. **Set 2: `*` (`theme.border`)**:
   - `.bt` / `.bt(&theme)` (Top edge only)
   - `.br` / `.br(&theme)` (Right edge only)
   - `.bb` / `.bb(&theme)` (Bottom edge only)
   - `.bl` / `.bl(&theme)` (Left edge only)
   - `.border` / `.border(&theme)` (Full box 1px standard)
3. **Set 3: `*_str` (`theme.border_strong`)**:
   - `.bt-str` / `.bt_str(&theme)` (Top edge only)
   - `.br-str` / `.br_str(&theme)` (Right edge only)
   - `.bb-str` / `.bb_str(&theme)` (Bottom edge only)
   - `.bl-str` / `.bl_str(&theme)` (Left edge only)
   - `.border-str` / `.border_str(&theme)` (Full box 1px strong)

---

### Section III: Flexbox Layout Architecture (`.row` vs `.box` & Physical Axes)
Interactive sandbox demonstrating how children physically position themselves along the physical X and Y coordinate axes:
1. **Controls**:
   - Horizontal Axis (X): `.xleft` (start), `.xcenter` (center), `.xright` (end), `.xbetween` (space-between)
   - Vertical Axis (Y): `.ytop` (start), `.ycenter` (center), `.ybot` (end), `.ybetween` (space-between)
   - Gap scale: `.gap-xs`, `.gap-sm`, `.gap-md`, `.gap-bs`, `.gap-lg`, `.gap-xl`
2. **Side-by-Side Live Viewports**:
   - **Viewport A (`.row`)**: Horizontal flow (`flex-direction: row`).
   - **Viewport B (`.box`)**: Vertical flow (`flex-direction: column`).
   - Visually proving that X controls horizontal positioning on both, and Y controls vertical positioning on both (Contract 4).

---

### Section IV: Typography Hierarchy & Paragraphs (`_03_typography.sass`)
Full verified semantic typography hierarchy:
1. **Headings**:
   - `h1.page-title` (`text-3xl`, 39px, weight-700, line-height 1.1)
   - `h2.page-heading-xl` (`text-xl`, 25px, weight-600, line-height 1.1)
   - `h2.page-heading-lg` (`text-lg`, 20px, weight-600, line-height 1.1)
   - `h3.page-heading-bs` (`text-bs`, 16px, weight-600, line-height 1.1)
   - `h3.card-title` (`text-lg`, 20px, weight-600, line-height 1.2)
2. **Body & Paragraphs (`<p>`)**:
   - `p.text-body` (`text-bs`, 16px, line-height 1.5, `text-primary`)
   - `p.page-desc` (`text-md`, 14px, `text-secondary`)
   - `p.text-body-sm` (`text-sm`, 12px, line-height 1.5, `text-muted`)
   - `p.card-desc` (`text-md`, 14px, line-height 1.2)
3. **Inline Badges & Truncation**:
   - Inline monospace `code` badge (`bg-sunken`, `border-sub`, `radius-min`)
   - Inline `kbd` shortcut badge (`bg-raised`, `border-sub`, `radius-min`, font-mono 11px)
   - Single-line truncated text (`.truncate`) with tooltip trigger on text overflow.

---

### Section V: Motion & Progress (Layer 1)
*(Divider, disclosure, caret, backdrop, pressable, and shimmer are excluded).*
1. **`Spinner`**:
   - Smooth rotating arc in 3 sizes: `sm` (14px), `md` (18px), `lg` (24px).
2. **`ProgressBar`**:
   - Deterministic progress bar (`bg-sunken` track, `--theme-color` fill) with percentage indicator.
   - Indeterminate sliding wave bar.

---

### Section VI: Complete Button Matrix (Layer 2)
1. **All 7 Data Variants (`data-variant=`)**:
   - `primary` (emerald `--theme-color` fill, `--text-inverse` text)
   - `secondary` (`--bg-raised` fill, 1px `--border-subtle`, `--text-primary` text)
   - `themed` (`--theme-color-alt` / `--theme-color-sub` fill)
   - `outline` (transparent fill, 1px solid `--border`, hover `--state-hover`)
   - `ghost` (transparent fill, no border, hover `--state-hover`)
   - `link` (text link, underline on hover)
   - `icon` (square 1:1 button with vector icon)
   - *(Plus semantic `danger` variant in red)*
2. **All 5 Shape Variants (`data-shape=`) Side-by-Side**:
   - `square` (0px)
   - `min` (2px, `RADIUS_MIN`)
   - `modern` (4px, `RADIUS_MODERN` — default)
   - `curved` (8px, `RADIUS_CURVED` — card max)
   - `round` (9999px — pill)
3. **All 5 Size Variants (`data-size=`) Side-by-Side**:
   - `sm` (height 20px, pad 8px)
   - `md` (height 24px, pad 10px)
   - `bs` (height 28px, pad 12px)
   - `lg` (height 32px, pad 16px)
   - `xl` (height 40px, pad 20px)
4. **Decoupled Typography Composability**:
   - An interactive live demo showing button sizing (`data-size`) controlling geometry while typography (`text-xs`, `text-sm`, `text-md`, `text-bs`) is composed independently inside, with text strictly vertically and horizontally centered.
5. **Compound Button Patterns**:
   - `SegmentedControl`: `.row` container in `bg-raised` with active segment in `data-variant="primary"` and inactive in `ghost` (recipe `workspace-segmented-control`).
   - `ButtonGroup`: Multi-button set with merged interior 1px partition hairlines.
   - `ConfirmButton`: Two-stage click safety button ("Delete" -> "Confirm?").
   - `CopyButton`: Clipboard button with transient "Copied!" checkmark feedback.

---

### Section VII: Form Controls & Inputs (Layer 2)
1. **`Input` (Single-line text input)**:
   - Size ladder: `sm` (20px), `md` (24px), `bs` (28px), `lg` (32px), `xl` (40px).
   - Shape ladder: `square` (0px), `min` (2px), `modern` (4px), `curved` (8px).
   - States: Default, Focused (amber `--ring`), Error (`--danger` border), Disabled.
   - Search input bar recipe: leading icon, input, `⌘K` shortcut badge.
2. **`Textarea`**:
   - Multi-line text field with 4px scrollbar and subtle border.
3. **`Checkbox`**:
   - Unchecked, Checked (emerald checkmark), Indeterminate (dash).
4. **`RadioGroup` / `RadioItem`**:
   - Mutually exclusive selection circles with active center dot.
5. **`Switch`**:
   - Toggle switch in `round` pill shape with smooth sliding thumb.
6. **`Slider`**:
   - Range track (`h-1`, `bg-sunken`) with filled track and draggable thumb.
7. **`Select`**:
   - Dropdown selection trigger showing current value, caret, and selectable popup menu.
8. **`FormField`**:
   - Wrapper uniting `<label>`, control, optional description, and validation error message.

---

### Section VIII: Overlays & Menus (Layer 2)
1. **`Tooltip`**:
   - Floating card positioned `top`, `bottom`, `left`, `right` with `min` (2px) radius and subtle shadow.
2. **`Popover`**:
   - Floating anchored card attached to trigger button with click-outside dismissal.
3. **`ModalDialog`**:
   - Native `<dialog>` matching recipe `action-dialog`: header (`bb`), body (`pad-md`), footer (`bt`, `bg-raised`, action buttons), and dark scrim backdrop.
4. **`Sheet`**:
   - Slide-over drawer panel anchored to window edge with smooth slide animation.
5. **`Toast`**:
   - Stack of corner notification banners (`info`, `success`, `warning`, `danger`) with auto-dismiss timer.
6. **`PopupMenu` / `DropdownMenu`**:
   - Matching recipe `dropdown-action-menu`: floating container (`shadow-md`, `radius-md`), menu items with icons and shortcut hints, and separator lines.

---

### Section IX: FSGPUI Rust Code Mappings (`tokens.rs`)
Direct code reference mapping each CSS class/token to its native Rust GPUI counterpart:
- `--theme-color` $\rightarrow$ `theme.theme_color`
- `--border-subtle` $\rightarrow$ `theme.border_subtle`
- `.bb-sub` $\rightarrow$ `.bb_sub(&theme)`
- `SPACE_SM` $\rightarrow$ `gpui::px(8.0)`
- `RADIUS_MODERN` $\rightarrow$ `gpui::px(4.0)`
- `HEIGHT_BS` $\rightarrow$ `gpui::px(28.0)`
- `TEXT_BS` $\rightarrow$ `gpui::px(14.0)` / `16px`
