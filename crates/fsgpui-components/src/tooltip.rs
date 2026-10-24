use crate::theme::ActiveTheme;
use fsgpui_theme::*;
use gpui::{
    div, App, Context, IntoElement, ParentElement, Render, RenderOnce, SharedString, Styled, Window,
};

#[derive(Clone, IntoElement)]
pub struct Tooltip {
    text: SharedString,
}

impl Tooltip {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self { text: text.into() }
    }
}

impl Render for Tooltip {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let t = cx.theme();
        div()
            .px(SPACE_XS)
            .py(SPACE_3XS)
            .rounded(RADIUS_MODERN)
            .bg(t.bg_raised)
            .border_sub(t)
            .text_size(TEXT_XS)
            .text_color(t.text_primary)
            .shadow_sm()
            .child(self.text.clone())
    }
}

impl RenderOnce for Tooltip {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = cx.theme();
        div()
            .px(SPACE_XS)
            .py(SPACE_3XS)
            .rounded(RADIUS_MODERN)
            .bg(t.bg_raised)
            .border_sub(t)
            .text_size(TEXT_XS)
            .text_color(t.text_primary)
            .shadow_sm()
            .child(self.text)
    }
}
