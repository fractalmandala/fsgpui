use gpui::{div, Div, Styled};

/// Horizontal flex container aligned to center items
pub fn h_flex() -> Div {
    div().flex().flex_row().items_center()
}

/// Vertical flex container
pub fn v_flex() -> Div {
    div().flex().flex_col()
}

/// Centered flex container
pub fn flex_center() -> Div {
    div().flex().items_center().justify_center()
}
