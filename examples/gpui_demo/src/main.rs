// @fractaldesign/fsgui - GPUI Showcase Demo App
// Demonstrates typed design tokens, variants, and layouts in a real GPUI window.

mod tokens;
use tokens::*;

use gpui::{
    App, Bounds, Context, IntoElement, Render, SharedString, Window, WindowBounds, WindowOptions,
    div, prelude::*, px, size,
};


pub struct FsguiDemoApp {
    theme: FsTheme,
}

impl FsguiDemoApp {
    pub fn new() -> Self {
        Self {
            theme: FsTheme::new(),
        }
    }

    /// Renders a styled button variant according to fsgui rules
    fn render_button(
        &self,
        label: impl Into<SharedString>,
        primary: bool,
    ) -> impl IntoElement {
        let theme = &self.theme;
        let mut btn = div()
            .flex()
            .items_center()
            .justify_center()
            .gap(SPACE_XS)
            .px(SPACE_MD)
            .py(SPACE_SM)
            .rounded(RADIUS_MODERN); // 4px per Fractal rules

        if primary {
            btn = btn
                .bg(theme.brand)
                .text_color(theme.text_inverse)
                .hover(|s| s.bg(theme.brand_alt));
        } else {
            btn = btn
                .bg(theme.bg_raised)
                .text_color(theme.text_primary)
                .border_1()
                .border_color(theme.border)
                .hover(|s| s.bg(theme.state_hover));
        }

        btn.child(label.into())
    }

    /// Renders a semantic intent badge (Success, Warning, Danger, Info)
    fn render_badge(
        &self,
        label: &'static str,
        bg: gpui::Rgba,
        text: gpui::Rgba,
    ) -> impl IntoElement {
        div()
            .flex()
            .items_center()
            .px(SPACE_SM)
            .py(SPACE_3XS)
            .rounded(RADIUS_MIN) // 2px subtle radius
            .bg(bg)
            .text_color(text)
            .text_xs()
            .child(label)
    }
}

impl Render for FsguiDemoApp {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        let theme = &self.theme;

        div()
            .flex()
            .flex_col()
            .size_full()
            .bg(theme.bg)
            .text_color(theme.text_primary)
            // 1. Header Bar
            .child(
                div()
                    .flex()
                    .items_center()
                    .justify_between()
                    .w_full()
                    .px(SPACE_LG)
                    .py(SPACE_MD)
                    .bg(theme.bg_surface)
                    .border_b_1()
                    .border_color(theme.border_subtle)
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .gap(SPACE_SM)
                            .child(
                                div()
                                    .size(px(14.0))
                                    .rounded(RADIUS_MIN)
                                    .bg(theme.brand),
                            )
                            .child(
                                div()
                                    .font_weight(gpui::FontWeight::SEMIBOLD)
                                    .text_sm()
                                    .child("fsgui + GPUI"),
                            ),
                    )
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .gap(SPACE_XS)
                            .child(self.render_badge("SYSTEM ACTIVE", theme.success_bg, theme.success_text))
                            .child(self.render_badge("ZERO DRIFT", theme.info_bg, theme.info_text)),
                    ),
            )
            // 2. Main Content Container
            .child(
                div()
                    .flex()
                    .flex_col()
                    .gap(SPACE_LG)
                    .p(SPACE_LG)
                    // Hero Card
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap(SPACE_SM)
                            .p(SPACE_LG)
                            .bg(theme.bg_surface)
                            .border_1()
                            .border_color(theme.border_subtle)
                            .rounded(RADIUS_MODERN)
                            .child(
                                div()
                                    .text_xl()
                                    .font_weight(gpui::FontWeight::BOLD)
                                    .child("Typed Design System for GPUI"),
                            )
                            .child(
                                div()
                                    .text_sm()
                                    .text_color(theme.text_secondary)
                                    .child(
                                        "Styles, variants, and tokens defined once in TypeScript and compiled into native GPUI Rust code with zero AI drift.",
                                    ),
                            )
                            .child(
                                div()
                                    .flex()
                                    .gap(SPACE_SM)
                                    .pt(SPACE_SM)
                                    .child(self.render_button("Primary Action", true))
                                    .child(self.render_button("Secondary", false)),
                            ),
                    )
                    // Grid / Two Column Showcase
                    .child(
                        div()
                            .flex()
                            .gap(SPACE_MD)
                            // Left Column: Semantic Tokens
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .flex_1()
                                    .gap(SPACE_SM)
                                    .p(SPACE_MD)
                                    .bg(theme.bg_panel)
                                    .border_1()
                                    .border_color(theme.border_subtle)
                                    .rounded(RADIUS_MODERN)
                                    .child(
                                        div()
                                            .text_sm()
                                            .font_weight(gpui::FontWeight::SEMIBOLD)
                                            .child("Semantic Intent Scales"),
                                    )
                                    .child(
                                        div()
                                            .flex()
                                            .gap(SPACE_XS)
                                            .child(self.render_badge("SUCCESS", theme.success_bg, theme.success_text))
                                            .child(self.render_badge("WARNING", theme.warning_bg, theme.warning_text))
                                            .child(self.render_badge("DANGER", theme.danger_bg, theme.danger_text))
                                            .child(self.render_badge("INFO", theme.info_bg, theme.info_text)),
                                    ),
                            )
                            // Right Column: Spacing & Shape Rules
                            .child(
                                div()
                                    .flex()
                                    .flex_col()
                                    .flex_1()
                                    .gap(SPACE_SM)
                                    .p(SPACE_MD)
                                    .bg(theme.bg_panel)
                                    .border_1()
                                    .border_color(theme.border_subtle)
                                    .rounded(RADIUS_MODERN)
                                    .child(
                                        div()
                                            .text_sm()
                                            .font_weight(gpui::FontWeight::SEMIBOLD)
                                            .child("Fractal Geometry (Max 4-8px)"),
                                    )
                                    .child(
                                        div()
                                            .flex()
                                            .items_center()
                                            .gap(SPACE_SM)
                                            .child(
                                                div()
                                                    .size(px(24.0))
                                                    .bg(theme.brand_sub)
                                                    .rounded(RADIUS_SQUARE)
                                                    .flex()
                                                    .items_center()
                                                    .justify_center()
                                                    .text_xs()
                                                    .child("0"),
                                            )
                                            .child(
                                                div()
                                                    .size(px(24.0))
                                                    .bg(theme.brand_sub)
                                                    .rounded(RADIUS_MIN)
                                                    .flex()
                                                    .items_center()
                                                    .justify_center()
                                                    .text_xs()
                                                    .child("2"),
                                            )
                                            .child(
                                                div()
                                                    .size(px(24.0))
                                                    .bg(theme.brand)
                                                    .rounded(RADIUS_MODERN)
                                                    .flex()
                                                    .items_center()
                                                    .justify_center()
                                                    .text_xs()
                                                    .child("4"),
                                            )
                                            .child(
                                                div()
                                                    .size(px(24.0))
                                                    .bg(theme.brand_alt)
                                                    .rounded(RADIUS_CURVED)
                                                    .flex()
                                                    .items_center()
                                                    .justify_center()
                                                    .text_xs()
                                                    .child("8"),
                                            ),
                                    ),
                            ),
                    ),
            )
    }
}

fn main() {
    gpui::Application::new().run(|cx: &mut App| {
        let bounds = Bounds::centered(None, size(px(640.0), px(440.0)), cx);
        cx.open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(bounds)),
                titlebar: Some(gpui::TitlebarOptions {
                    title: Some("fsgui • GPUI Demo".into()),
                    appears_transparent: true,
                    traffic_light_position: Some(gpui::point(px(12.0), px(12.0))),
                }),
                ..Default::default()
            },
            |_, cx| cx.new(|_| FsguiDemoApp::new()),
        )
        .unwrap();
        cx.activate(true);
    });
}
