use gpui::{div, prelude::*, Div, FontWeight, SharedString};

use crate::config::{NodeConfig, StyleConfig};

pub fn parse_color(hex: &str) -> gpui::Rgba {
    let hex = hex.trim_start_matches('#');
    let val = u32::from_str_radix(hex, 16).unwrap_or(0);
    gpui::rgb(val)
}

fn parse_weight(w: &str) -> FontWeight {
    match w.to_lowercase().as_str() {
        "bold" => FontWeight::BOLD,
        "semibold" => FontWeight::SEMIBOLD,
        "medium" => FontWeight::MEDIUM,
        "light" => FontWeight::LIGHT,
        "thin" => FontWeight::THIN,
        _ => FontWeight::NORMAL,
    }
}

fn apply_style(element: Div, style: &Option<StyleConfig>) -> Div {
    let Some(s) = style else { return element };
    let mut el = element;

    if let Some(ref bg) = s.background {
        el = el.bg(parse_color(bg));
    }
    if let Some(ref c) = s.color {
        el = el.text_color(parse_color(c));
    }
    if let Some(fs) = s.font_size {
        el = el.text_size(gpui::px(fs));
    }
    if let Some(ref w) = s.weight {
        el = el.font_weight(parse_weight(w));
    }
    if let Some(p) = s.padding {
        el = el.p(gpui::px(p));
    }
    if let Some(br) = s.border_radius {
        el = el.rounded(gpui::px(br));
    }
    if let Some(w) = s.width {
        el = el.w(gpui::px(w));
    }
    if let Some(h) = s.height {
        el = el.h(gpui::px(h));
    }

    el
}

pub fn build_root(node: &NodeConfig) -> Div {
    build_node_inner(node, true)
}

fn build_node_inner(node: &NodeConfig, is_root: bool) -> Div {
    match node {
        NodeConfig::Div {
            direction,
            gap,
            style,
            children,
        } => {
            let mut el = div().flex();

            if is_root {
                el = el.size_full();
            }

            if let Some(dir) = direction {
                if dir == "column" {
                    el = el.flex_col();
                }
            }

            if let Some(g) = gap {
                el = el.gap(gpui::px(*g));
            }

            el = apply_style(el, style);

            for child in children {
                el = el.child(build_node_inner(child, false));
            }

            el
        }
        NodeConfig::Text { content, style } => {
            let mut el = div().child(SharedString::from(content.clone()));
            el = apply_style(el, style);
            el
        }
    }
}
