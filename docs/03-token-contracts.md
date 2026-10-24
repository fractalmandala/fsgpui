---
title: Token Contracts
description: Inspect the default token contracts in FSGPUI. Learn about color palettes, spacing scales, border radiuses, and font sizes.
---

# Token contracts

Token contracts establish the allowed values in your design system. Every token has an exact representation in both TypeScript, GPUI Rust, and CSS.

## Color tokens

FSGPUI provides a calibrated dark and light color palette:

| Token | Hex value | Description |
| --- | --- | --- |
| `bg` | `#0f1115` | Default canvas background |
| `bgSurface` | `#16181d` | Card, container, and surface background |
| `bgSunken` | `#121418` | Inset inputs and sunken wells |
| `bgRaised` | `#1c1f26` | Floating popovers and dropdown menus |
| `textPrimary` | `#f4f4f6` | High-contrast body copy and headings |
| `textSecondary` | `#9ca3af` | Secondary labels and helper text |
| `textMuted` | `#6b7280` | Placeholder text and disabled controls |
| `brand` | `#3b82f6` | Primary action and focus ring color |
| `borderSubtle` | `#222630` | Default divider and container border |
| `borderStrong` | `#333947` | Selected or emphasized border |
| `success` | `#10b981` | Success states and active indicators |
| `danger` | `#ef4444` | Errors and destructive actions |

## Spacing scale

Spacing tokens increment on a 4px grid:

| Token | Pixel value | GPUI value |
| --- | --- | --- |
| `3xs` | 2px | `gpui::px(2.0)` |
| `2xs` | 4px | `gpui::px(4.0)` |
| `xs` | 6px | `gpui::px(6.0)` |
| `sm` | 8px | `gpui::px(8.0)` |
| `md` | 12px | `gpui::px(12.0)` |
| `bs` | 16px | `gpui::px(16.0)` |
| `lg` | 24px | `gpui::px(24.0)` |
| `xl` | 32px | `gpui::px(32.0)` |
| `2xl` | 48px | `gpui::px(48.0)` |
| `3xl` | 64px | `gpui::px(64.0)` |

## Border radius scale

Per Fractal Design System rules, the maximum standard radius is 8px:

| Token | Pixel value | GPUI value | Rule |
| --- | --- | --- | --- |
| `none` | 0px | `gpui::px(0.0)` | Rectangular |
| `sharp` | 2px | `gpui::px(2.0)` | Tags and badges |
| `modern` | 4px | `gpui::px(4.0)` | Default for buttons and cards |
| `curved` | 8px | `gpui::px(8.0)` | Modals and panels |
| `full` | 9999px | `gpui::px(9999.0)` | Circular avatars and pills |

## Typography scale

| Token | Pixel size | Typical usage |
| --- | --- | --- |
| `xs` | 10px | Badges and captions |
| `sm` | 12px | Helper text and metadata |
| `md` | 13px | Compact table cells |
| `bs` | 14px | Base body text |
| `lg` | 16px | Emphasized text and card titles |
| `xl` | 18px | Section headings |
| `2xl` | 22px | Page titles |
| `3xl` | 28px | Hero headlines |

## Related pages

* [Getting started](./01-getting-started.md)
* [Architecture and philosophy](./02-architecture-and-philosophy.md)
* [Style definitions](./04-style-definitions.md)
* [Component recipes](./05-component-recipes.md)
