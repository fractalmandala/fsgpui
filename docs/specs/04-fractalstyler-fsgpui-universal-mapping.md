---
title: "Universal Mapping Specification: fractalstyler to fsgpui (L1 & L2)"
type: spec
category: framework
status: approved-canonical
---

# Universal Mapping Specification: fractalstyler to fsgpui (L1 & L2)

This document serves as the single source of truth for how every token, class, layout rule, and component in **Layer 1 (Primitives & Foundations)** and **Layer 2 (Controls, Forms & Overlays)** maps between `@fractaldesign/fractalstyler` and `@fractaldesign/fsgpui`.

---

## 1. Architectural Invariants

1. **Direct Token Parity**: Every token in `fractalstyler` (`--radius-sm`, `--space-md`, `--height-bs`) maps directly to its identical snake_case identifier in `fsgpui` (`theme.radius_sm`, `theme.space_md`, `theme.height_bs`). No invented uppercase constants (`RADIUS_MODERN`) or alias layers.
2. **Physical Coordinate Axes (Contract 4)**: 
   - `x*` controls the physical horizontal axis on both `.row` and `.box`.
   - `y*` controls the physical vertical axis on both `.row` and `.box`.
3. **Exact Code Execution**: Every high-level convenience extension in `fsgpui` must map to an explicit, predictable sequence of GPUI styling operations.

---

## 2. Token Identity Mapping (Layer 1 Theme)

*(Exact values such as `#FFFFFF` or `16px` are encapsulated within themes and not hardcoded here).*

### Surfaces & Backgrounds
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--bg` | `theme.bg` | `.bg(theme.bg)` |
| `--bg-surface` | `theme.bg_surface` | `.bg(theme.bg_surface)` |
| `--bg-panel` | `theme.bg_panel` | `.bg(theme.bg_panel)` |
| `--bg-sunken` | `theme.bg_sunken` | `.bg(theme.bg_sunken)` |
| `--bg-raised` | `theme.bg_raised` | `.bg(theme.bg_raised)` |
| `--bg-extra` | `theme.bg_extra` | `.bg(theme.bg_extra)` |
| `--bg-input` | `theme.bg_input` | `.bg(theme.bg_input)` |
| `--bg-button` | `theme.bg_button` | `.bg(theme.bg_button)` |

### Inks (Typography Colors)
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--text-primary` | `theme.text_primary` | `.text_color(theme.text_primary)` |
| `--text-secondary` | `theme.text_secondary` | `.text_color(theme.text_secondary)` |
| `--text-muted` | `theme.text_muted` | `.text_color(theme.text_muted)` |
| `--text-inverse` | `theme.text_inverse` | `.text_color(theme.text_inverse)` |

### Partition Borders & Ring
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--border` | `theme.border` | `.border_color(theme.border)` |
| `--border-subtle` | `theme.border_subtle` | `.border_color(theme.border_subtle)` |
| `--border-strong` | `theme.border_strong` | `.border_color(theme.border_strong)` |
| `--ring` | `theme.ring` | Focus outline color |

### Brand Accents & Semantics
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--theme-color` | `theme.theme_color` | `.bg(theme.theme_color)` / `.text_color(...)` |
| `--theme-color-alt` | `theme.theme_color_alt` | Selected / active state fill |
| `--theme-color-sub` | `theme.theme_color_sub` | Hover state fill |
| `--accent-orange` | `theme.accent_orange` | Accent highlight fill |
| `--accent-green` | `theme.accent_green` | Accent highlight fill |
| `--success` / `--success-hover` | `theme.success` / `theme.success_hover` | Success feedback fill & hover |
| `--warning` / `--warning-hover` | `theme.warning` / `theme.warning_hover` | Warning feedback fill & hover |
| `--danger` / `--danger-hover` | `theme.danger` / `theme.danger_hover` | Error / destructive fill & hover |
| `--info` / `--info-hover` | `theme.info` / `theme.info_hover` | Informational fill & hover |

### Interaction States
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--state-surface` | `theme.state_surface` | `.bg(theme.state_surface)` |
| `--state-hover` | `theme.state_hover` | `.hover(|s| s.bg(theme.state_hover))` |
| `--state-selected` | `theme.state_selected` | Active / pressed background fill |

### Border Radius Scale
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--radius-xs` | `theme.radius_xs` | `.rounded(theme.radius_xs)` |
| `--radius-sm` | `theme.radius_sm` | `.rounded(theme.radius_sm)` |
| `--radius-md` | `theme.radius_md` | `.rounded(theme.radius_md)` |
| `--radius-bs` | `theme.radius_bs` | `.rounded(theme.radius_bs)` |
| `--radius-lg` | `theme.radius_lg` | `.rounded(theme.radius_lg)` |
| `--radius-full` | `theme.radius_full` | `.rounded(theme.radius_full)` |

### Spacing Scale
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--space-xs` | `theme.space_xs` | `.gap(theme.space_xs)` / `.p(theme.space_xs)` |
| `--space-sm` | `theme.space_sm` | `.gap(theme.space_sm)` / `.p(theme.space_sm)` |
| `--space-md` | `theme.space_md` | `.gap(theme.space_md)` / `.p(theme.space_md)` |
| `--space-bs` | `theme.space_bs` | `.gap(theme.space_bs)` / `.p(theme.space_bs)` |
| `--space-lg` | `theme.space_lg` | `.gap(theme.space_lg)` / `.p(theme.space_lg)` |
| `--space-xl` | `theme.space_xl` | `.gap(theme.space_xl)` / `.p(theme.space_xl)` |
| `--space-2xl` | `theme.space_2xl` | `.gap(theme.space_2xl)` / `.p(theme.space_2xl)` |
| `--space-3xl` | `theme.space_3xl` | `.gap(theme.space_3xl)` / `.p(theme.space_3xl)` |

### Control Height Scale
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--height-sm` | `theme.height_sm` | `.h(theme.height_sm)` |
| `--height-md` | `theme.height_md` | `.h(theme.height_md)` |
| `--height-bs` | `theme.height_bs` | `.h(theme.height_bs)` |
| `--height-lg` | `theme.height_lg` | `.h(theme.height_lg)` |
| `--height-xl` | `theme.height_xl` | `.h(theme.height_xl)` |
| `--height-2xl` | `theme.height_2xl` | `.h(theme.height_2xl)` |

### Shell Metrics & Scrollbar
| fractalstyler Token | fsgpui Token Identity | Applied GPUI Method |
| :--- | :--- | :--- |
| `--header-height` | `theme.header_height` | `.h(theme.header_height)` |
| `--footer-height` | `theme.footer_height` | `.h(theme.footer_height)` |
| `--sidebar-width` | `theme.sidebar_width` | `.w(theme.sidebar_width)` |
| `scrollbar-width` | `theme.scrollbar_width` | Scrollbar track/thumb thickness |

---

## 3. Partition Borders (The 14-Law Set from `_08_visuals.sass`)

| fractalstyler Class | fsgpui Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `.border` | `.border(&theme)` | `.border_1().border_color(theme.border)` |
| `.bt` | `.bt(&theme)` | `.border_t_1().border_color(theme.border)` |
| `.br` | `.br(&theme)` | `.border_r_1().border_color(theme.border)` |
| `.bb` | `.bb(&theme)` | `.border_b_1().border_color(theme.border)` |
| `.bl` | `.bl(&theme)` | `.border_l_1().border_color(theme.border)` |
| `.border-subtle` | `.border_sub(&theme)` | `.border_1().border_color(theme.border_subtle)` |
| `.bt-sub` | `.bt_sub(&theme)` | `.border_t_1().border_color(theme.border_subtle)` |
| `.br-sub` | `.br_sub(&theme)` | `.border_r_1().border_color(theme.border_subtle)` |
| `.bb-sub` | `.bb_sub(&theme)` | `.border_b_1().border_color(theme.border_subtle)` |
| `.bl-sub` | `.bl_sub(&theme)` | `.border_l_1().border_color(theme.border_subtle)` |
| `.border-strong` | `.border_str(&theme)` | `.border_1().border_color(theme.border_strong)` |
| `.bt-str` | `.bt_str(&theme)` | `.border_t_1().border_color(theme.border_strong)` |
| `.br-str` | `.br_str(&theme)` | `.border_r_1().border_color(theme.border_strong)` |
| `.bb-str` | `.bb_str(&theme)` | `.border_b_1().border_color(theme.border_strong)` |
| `.bl-str` | `.bl_str(&theme)` | `.border_l_1().border_color(theme.border_strong)` |

---

## 4. Flexbox Containers & Physical Axes (Flow from `_04_containers.sass`)

### Base Containers
| fractalstyler Class | fsgpui Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `.row` | `.row()` | `.flex().flex_row()` |
| `.box` | `.box()` | `.flex().flex_col()` |

### Horizontal Alignment (`x*`)
| fractalstyler Class | fsgpui Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `.row.xleft` | `.row().xleft()` | `.flex().flex_row().justify_start()` |
| `.row.xcenter` | `.row().xcenter()` | `.flex().flex_row().justify_center()` |
| `.row.xright` | `.row().xright()` | `.flex().flex_row().justify_end()` |
| `.row.xbetween` | `.row().xbetween()` | `.flex().flex_row().justify_between()` |
| `.row.xevenly` | `.row().xevenly()` | `.flex().flex_row().justify_around()` |
| `.box.xleft` | `.box().xleft()` | `.flex().flex_col().items_start()` |
| `.box.xcenter` | `.box().xcenter()` | `.flex().flex_col().items_center()` |
| `.box.xright` | `.box().xright()` | `.flex().flex_col().items_end()` |

### Vertical Alignment (`y*`)
| fractalstyler Class | fsgpui Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `.row.ytop` | `.row().ytop()` | `.flex().flex_row().items_start()` |
| `.row.ycenter` | `.row().ycenter()` | `.flex().flex_row().items_center()` |
| `.row.ybot` | `.row().ybot()` | `.flex().flex_row().items_end()` |
| `.box.ytop` | `.box().ytop()` | `.flex().flex_col().justify_start()` |
| `.box.ycenter` | `.box().ycenter()` | `.flex().flex_col().justify_center()` |
| `.box.ybot` | `.box().ybot()` | `.flex().flex_col().justify_end()` |
| `.box.ybetween` | `.box().ybetween()` | `.flex().flex_col().justify_between()` |
| `.box.yevenly` | `.box().yevenly()` | `.flex().flex_col().justify_around()` |

### Canonical Gaps
| fractalstyler Class | fsgpui Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `.gap-xs` | `.gap_xs(&theme)` | `.gap(theme.space_xs)` |
| `.gap-sm` | `.gap_sm(&theme)` | `.gap(theme.space_sm)` |
| `.gap-md` | `.gap_md(&theme)` | `.gap(theme.space_md)` |
| `.gap-bs` | `.gap_bs(&theme)` | `.gap(theme.space_bs)` |
| `.gap-lg` | `.gap_lg(&theme)` | `.gap(theme.space_lg)` |
| `.gap-xl` | `.gap_xl(&theme)` | `.gap(theme.space_xl)` |
| `.gap-2xl` | `.gap_2xl(&theme)` | `.gap(theme.space_2xl)` |
| `.gap-3xl` | `.gap_3xl(&theme)` | `.gap(theme.space_3xl)` |

---

## 5. Typography Hierarchy (`_03_typography.sass`)

| fractalstyler Class | fsgpui Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `.text-xs` | `.text_xs(&theme)` | `.text_size(theme.text_xs)` |
| `.text-sm` | `.text_sm(&theme)` | `.text_size(theme.text_sm)` |
| `.text-md` | `.text_md(&theme)` | `.text_size(theme.text_md)` |
| `.text-bs` | `.text_bs(&theme)` | `.text_size(theme.text_bs)` |
| `.text-lg` | `.text_lg(&theme)` | `.text_size(theme.text_lg)` |
| `.text-xl` | `.text_xl(&theme)` | `.text_size(theme.text_xl)` |
| `.text-2xl` | `.text_2xl(&theme)` | `.text_size(theme.text_2xl)` |
| `.text-3xl` | `.text_3xl(&theme)` | `.text_size(theme.text_3xl)` |
| `.page-title` | `.page_title(&theme)` | `.text_size(theme.text_3xl).font_weight(FontWeight::BOLD).line_height(relative(1.1))` |
| `.page-heading-xl`| `.page_heading_xl(&theme)` | `.text_size(theme.text_xl).font_weight(FontWeight::SEMIBOLD).line_height(relative(1.1))` |
| `.page-heading-lg`| `.page_heading_lg(&theme)` | `.text_size(theme.text_lg).font_weight(FontWeight::SEMIBOLD).line_height(relative(1.1))` |
| `.page-heading-bs`| `.page_heading_bs(&theme)` | `.text_size(theme.text_bs).font_weight(FontWeight::SEMIBOLD).line_height(relative(1.1))` |
| `.card-title` | `.card_title(&theme)` | `.text_size(theme.text_lg).font_weight(FontWeight::SEMIBOLD).line_height(relative(1.2))` |
| `.text-body` | `.text_body(&theme)` | `.text_size(theme.text_bs).text_color(theme.text_primary).line_height(relative(1.5))` |
| `.page-desc` | `.page_desc(&theme)` | `.text_size(theme.text_md).text_color(theme.text_secondary)` |
| `.text-body-sm` | `.text_body_sm(&theme)` | `.text_size(theme.text_sm).text_color(theme.text_muted).line_height(relative(1.5))` |
| `.card-desc` | `.card_desc(&theme)` | `.text_size(theme.text_md).line_height(relative(1.2))` |
| `.truncate` | `.truncate()` | `.overflow_hidden().text_ellipsis()` |
| `.mono` | `.font_mono()` | `.font_family(theme.mono_font_family.clone())` |
| `.sans` | `.font_sans()` | `.font_family(theme.font_family.clone())` |

---

## 6. Motion & Feedback Primitives (Layer 1)

| Primitive | fractalstyler Equivalent | fsgpui API | Underlying Implementation |
| :--- | :--- | :--- | :--- |
| **Spinner** | `.spinner` | `Spinner::new().size(...)` | Arc rotation animation via GPUI frame clock |
| **Progress Bar** | `.progress-bar` | `ProgressBar::new().progress(f32)` | Track `.bg(theme.bg_sunken)`, fill `.bg(theme.theme_color)` |

---

## 7. Button Matrix (Layer 2 from `_10_propped.sass` & `_07_interactions.sass`)

Base button constructor: `Button::new(id)` generates a centered flex container with text and icon vertically and horizontally aligned (`.flex().items_center().justify_center()`).

### Shape Props (`data-shape=`)
| fractalstyler Attribute | fsgpui Builder Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `[data-shape="square"]` | `.shape(ButtonShape::Square)` | `.rounded_none()` |
| `[data-shape="min"]` | `.shape(ButtonShape::Min)` | `.rounded(theme.radius_xs)` |
| `[data-shape="modern"]` | `.shape(ButtonShape::Modern)` | `.rounded(theme.radius_sm)` |
| `[data-shape="curved"]` | `.shape(ButtonShape::Curved)` | `.rounded(theme.radius_md)` |
| `[data-shape="round"]` | `.shape(ButtonShape::Round)` | `.rounded(theme.radius_full)` |

### Size Props (`data-size=`)
| fractalstyler Attribute | fsgpui Builder Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `[data-size="sm"]` | `.size(ButtonSize::Sm)` | `.h(theme.height_sm).px(theme.space_sm)` |
| `[data-size="md"]` | `.size(ButtonSize::Md)` | `.h(theme.height_md).px(theme.space_md)` |
| `[data-size="bs"]` | `.size(ButtonSize::Bs)` | `.h(theme.height_bs).px(theme.space_bs)` |
| `[data-size="lg"]` | `.size(ButtonSize::Lg)` | `.h(theme.height_lg).px(theme.space_lg)` |
| `[data-size="xl"]` | `.size(ButtonSize::Xl)` | `.h(theme.height_xl).px(theme.space_xl)` |

### Variant Props (`data-variant=`)
| fractalstyler Attribute | fsgpui Builder Call | Exact Code Executed in fsgpui |
| :--- | :--- | :--- |
| `[data-variant="primary"]` | `.variant(ButtonVariant::Primary)` | `.bg(theme.state_surface).border_1().border_color(theme.border).hover(\|s\| s.bg(theme.state_hover))` |
| `[data-variant="secondary"]` | `.variant(ButtonVariant::Secondary)` | `.bg(theme.bg_panel).border_1().border_color(theme.border_subtle).hover(\|s\| s.border_color(theme.border))` |
| `[data-variant="themed"]` | `.variant(ButtonVariant::Themed)` | `.bg(theme.theme_color).border_1().border_color(theme.theme_color).hover(\|s\| s.bg(theme.theme_color_sub))` |
| `[data-variant="outline"]` | `.variant(ButtonVariant::Outline)` | `.bg(transparent).border_1().border_color(theme.text_primary).hover(\|s\| s.border_color(theme.theme_color))` |
| `[data-variant="ghost"]` | `.variant(ButtonVariant::Ghost)` | `.bg(transparent).border_0().hover(\|s\| s.bg(theme.state_hover))` |
| `[data-variant="link"]` | `.variant(ButtonVariant::Link)` | `.bg(transparent).border_0().hover(\|s\| s.underline())` |
| `[data-variant="icon"]` | `.variant(ButtonVariant::Icon)` | `.bg(transparent).border_0().hover(\|s\| s.bg(theme.state_hover))` |
| `[data-variant="danger"]` | `.variant(ButtonVariant::Danger)` | `.bg(transparent).border_1().border_color(theme.danger).text_color(theme.danger)` |

---

## 8. Form Controls & Overlays (Layer 2)

| Component | fractalstyler Pattern | fsgpui API | Exact Code Executed in fsgpui |
| :--- | :--- | :--- | :--- |
| **Input** | `input.input` | `Input::new(id)` | `.h(theme.height_bs).bg(theme.bg_input).border_1().border_color(theme.border_subtle).focus(\|s\| s.border_color(theme.ring))` |
| **Textarea** | `textarea.textarea` | `Textarea::new(id)` | `.bg(theme.bg_input).border_1().border_color(theme.border_subtle).rounded(theme.radius_sm)` |
| **Checkbox** | `.checkbox` | `Checkbox::new(id)` | Box `.rounded(theme.radius_xs)`. When checked: `.bg(theme.theme_color)` with inverse check icon |
| **RadioGroup** | `.radio-group` | `RadioGroup::new(id)` | Outer ring `.rounded(theme.radius_full)`. Inner center dot `.bg(theme.theme_color)` |
| **Switch** | `.switch` | `Switch::new(id)` | Track `.w(theme.switch_w).h(theme.switch_h).rounded(theme.radius_full)`. Thumb `.size(theme.switch_thumb)` |
| **Slider** | `.slider` | `Slider::new(id)` | Track `.h(px(4.0)).bg(theme.bg_sunken)`. Active track `.bg(theme.theme_color)` |
| **Select** | `.select` | `Select::new(id)` | Trigger `.h(theme.height_bs).border_1().border_color(theme.border)`. Popup list with anchored position |
| **FormField** | `.form-field` | `FormField::new()` | `.flex().flex_col().gap(theme.space_xs)` with label, control, and error text |
| **Tooltip** | `.tooltip` | `Tooltip::new(...)` | Anchored floating tag `.rounded(theme.radius_xs).bg(theme.bg_raised).border_1().border_color(theme.border_subtle)` |
| **Popover** | `.popover` | `Popover::new(...)` | Anchored floating box `.rounded(theme.radius_md).bg(theme.bg_panel).border_1().border_color(theme.border)` |
| **ModalDialog** | `.dialog` (`action-dialog`) | `ModalDialog::new(...)` | Backdrop scrim + centered panel with header `.bb(&theme)` and footer `.bt(&theme).bg(theme.bg_raised)` |
| **Sheet** | `.sheet` | `Sheet::new(...)` | Docked drawer with edge partition hairline (`.bl(&theme)` or `.br(&theme)`) |
| **Toast** | `.toast` | `Toast::new(...)` | Corner stacked cards `.rounded(theme.radius_sm).bg(theme.bg_raised).border_1().border_color(theme.border)` |
| **DropdownMenu** | `.dropdown-menu` | `DropdownMenu::new(...)` | Floating menu container `.rounded(theme.radius_sm).bg(theme.bg_panel).border_1().border_color(theme.border)` |
