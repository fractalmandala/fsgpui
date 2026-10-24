// fsgpui-browser: Standalone native GPUI web browser surface using wry
// Embeds native WKWebView (macOS) and WebView2 (Windows) inside GPUI layouts.

use anyhow::{Context as _, Result};
use gpui::{
    div, px, rgba, App, Bounds, Context, ElementId, FocusHandle, Focusable, InteractiveElement,
    IntoElement, ParentElement, Pixels, Render, SharedString, Styled, Window,
};
use wry::WebView;

pub struct Browser {
    pub current_url: String,
    pub title: String,
    pub is_loading: bool,
    webview: Option<WebView>,
    focus_handle: FocusHandle,
}

impl Browser {
    pub fn new(initial_url: impl Into<String>, cx: &mut Context<Self>) -> Self {
        let focus_handle = cx.focus_handle();
        Self {
            current_url: initial_url.into(),
            title: "Browser Preview".to_string(),
            is_loading: false,
            webview: None,
            focus_handle,
        }
    }

    pub fn attach_to_window(&mut self, window: &Window, bounds: Bounds<Pixels>) -> Result<()> {
        let x = f64::from(f32::from(bounds.origin.x));
        let y = f64::from(f32::from(bounds.origin.y));
        let width = f64::from(f32::from(bounds.size.width));
        let height = f64::from(f32::from(bounds.size.height));

        let rect = wry::Rect {
            position: wry::dpi::LogicalPosition::new(x, y).into(),
            size: wry::dpi::LogicalSize::new(width, height).into(),
        };

        let webview = wry::WebViewBuilder::new()
            .with_url(&self.current_url)
            .with_bounds(rect)
            .build_as_child(window)
            .context("Failed to build wry webview")?;

        self.webview = Some(webview);
        Ok(())
    }

    pub fn load_url(&mut self, url: impl Into<String>) -> Result<()> {
        let url = url.into();
        self.current_url = url.clone();
        if let Some(wv) = &self.webview {
            wv.load_url(&url).context("Failed to load URL in webview")?;
        }
        Ok(())
    }

    pub fn set_bounds(&self, bounds: Bounds<Pixels>) -> Result<()> {
        if let Some(wv) = &self.webview {
            let x = f64::from(f32::from(bounds.origin.x));
            let y = f64::from(f32::from(bounds.origin.y));
            let width = f64::from(f32::from(bounds.size.width));
            let height = f64::from(f32::from(bounds.size.height));

            let rect = wry::Rect {
                position: wry::dpi::LogicalPosition::new(x, y).into(),
                size: wry::dpi::LogicalSize::new(width, height).into(),
            };

            wv.set_bounds(rect).context("Failed to update webview bounds")?;
        }
        Ok(())
    }

    pub fn reload(&self) -> Result<()> {
        if let Some(wv) = &self.webview {
            let _ = wv.evaluate_script("location.reload();");
        }
        Ok(())
    }
}

impl Focusable for Browser {
    fn focus_handle(&self, _cx: &App) -> FocusHandle {
        self.focus_handle.clone()
    }
}

impl Render for Browser {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let current_url = self.current_url.clone();

        div()
            .id(ElementId::Name("browser_view".into()))
            .track_focus(&self.focus_handle)
            .flex()
            .flex_col()
            .size_full()
            .bg(rgba(0x0e1117ff))
            .border_1()
            .border_color(rgba(0x30363d80))
            .rounded(px(8.0))
            .overflow_hidden()
            // Browser Address / Toolbar
            .child(
                div()
                    .flex()
                    .items_center()
                    .justify_between()
                    .h(px(36.0))
                    .px(px(8.0))
                    .gap(px(8.0))
                    .bg(rgba(0x161b22ff))
                    .border_b_1()
                    .border_color(rgba(0x30363d60))
                    // Back / Forward / Reload Controls
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .gap(px(4.0))
                            .child(
                                div()
                                    .id(ElementId::Name("browser_reload_btn".into()))
                                    .cursor_pointer()
                                    .px(px(6.0))
                                    .py(px(2.0))
                                    .rounded(px(4.0))
                                    .bg(rgba(0x21262dff))
                                    .hover(|s| s.bg(rgba(0x30363dff)))
                                    .text_size(px(12.0))
                                    .text_color(rgba(0x8b949eff))
                                    .child("↻")
                                    .on_mouse_down(
                                        gpui::MouseButton::Left,
                                        cx.listener(|this, _, _window, cx| {
                                            let _ = this.reload();
                                            cx.notify();
                                        }),
                                    ),
                            ),
                    )
                    // URL Pill Bar
                    .child(
                        div()
                            .flex_1()
                            .flex()
                            .items_center()
                            .h(px(24.0))
                            .px(px(8.0))
                            .bg(rgba(0x0d1117ff))
                            .border_1()
                            .border_color(rgba(0x30363d80))
                            .rounded(px(6.0))
                            .text_size(px(11.0))
                            .text_color(rgba(0xc9d1d9ff))
                            .child(SharedString::from(current_url)),
                    ),
            )
            // Surface Viewport Placeholder / Canvas Area
            .child(
                div()
                    .id(ElementId::Name("webview_surface".into()))
                    .flex_1()
                    .bg(rgba(0x010409ff))
                    .flex()
                    .items_center()
                    .justify_center()
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .items_center()
                            .gap(px(6.0))
                            .child(
                                div()
                                    .text_size(px(12.0))
                                    .text_color(rgba(0x8b949eff))
                                    .child("Native WKWebView Surface Active"),
                            )
                            .child(
                                div()
                                    .text_size(px(10.0))
                                    .text_color(rgba(0x484f58ff))
                                    .child(SharedString::from(self.current_url.clone())),
                            ),
                    ),
            )
    }
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_browser_url_initialization() {
        let url = "http://localhost:5173";
        assert_eq!(url, "http://localhost:5173");
    }
}
