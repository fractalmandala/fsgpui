use crate::button::{Button, ButtonVariants as _};
use crate::theme::ActiveTheme;
use fsgpui_theme::*;
use gpui::prelude::FluentBuilder as _;
use gpui::{
    div, AnyElement, App, ClickEvent, IntoElement, ParentElement, RenderOnce, SharedString, Styled,
    Window,
};
use std::sync::Arc;

#[derive(IntoElement)]
pub struct DialogClose {
    trigger_builder: Option<Box<dyn FnOnce(Button) -> Button>>,
}

impl DialogClose {
    pub fn new() -> Self {
        Self {
            trigger_builder: None,
        }
    }

    pub fn trigger<F>(mut self, builder: F) -> Self
    where
        F: FnOnce(Button) -> Button + 'static,
    {
        self.trigger_builder = Some(Box::new(builder));
        self
    }
}

impl RenderOnce for DialogClose {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mut btn = Button::new("dialog-cancel").ghost();
        if let Some(builder) = self.trigger_builder {
            btn = builder(btn);
        }
        btn
    }
}

#[derive(IntoElement)]
pub struct DialogAction {
    child: Option<AnyElement>,
}

impl DialogAction {
    pub fn new() -> Self {
        Self { child: None }
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.child = Some(child.into_any_element());
        self
    }
}

impl RenderOnce for DialogAction {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        div().when_some(self.child, |d, c| d.child(c))
    }
}

#[derive(IntoElement)]
pub struct DialogFooter {
    children: Vec<AnyElement>,
}

impl DialogFooter {
    pub fn new() -> Self {
        Self {
            children: Vec::new(),
        }
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }
}

impl RenderOnce for DialogFooter {
    fn render(self, _window: &mut Window, _cx: &mut App) -> impl IntoElement {
        let mut el = div().flex().items_center().justify_end().gap(SPACE_SM);
        for child in self.children {
            el = el.child(child);
        }
        el
    }
}

#[derive(IntoElement)]
pub struct Dialog {
    title: Option<SharedString>,
    children: Vec<AnyElement>,
    footer: Option<AnyElement>,
    on_ok: Option<Arc<dyn Fn(&ClickEvent, &mut Window, &mut App) -> bool + 'static>>,
}

impl Dialog {
    pub fn new() -> Self {
        Self {
            title: None,
            children: Vec::new(),
            footer: None,
            on_ok: None,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.children.push(child.into_any_element());
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }

    pub fn on_ok<F>(mut self, handler: F) -> Self
    where
        F: Fn(&ClickEvent, &mut Window, &mut App) -> bool + 'static,
    {
        self.on_ok = Some(Arc::new(handler));
        self
    }
}

impl RenderOnce for Dialog {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = cx.theme();
        let mut el = div()
            .flex()
            .flex_col()
            .gap(SPACE_MD)
            .p(SPACE_LG)
            .rounded(RADIUS_CURVED)
            .bg(t.bg_surface)
            .border_sub(t)
            .shadow_lg();

        if let Some(title) = self.title {
            el = el.child(
                div()
                    .text_size(TEXT_LG)
                    .font_weight(gpui::FontWeight::SEMIBOLD)
                    .text_color(t.text_primary)
                    .child(title),
            );
        }

        for child in self.children {
            el = el.child(child);
        }

        if let Some(footer) = self.footer {
            el = el.child(footer);
        }

        el
    }
}

pub trait WindowExt {
    fn open_dialog<F>(&mut self, cx: &mut App, builder: F)
    where
        F: FnOnce(Dialog, &mut Window, &mut App) -> Dialog + 'static;
}

impl WindowExt for Window {
    fn open_dialog<F>(&mut self, cx: &mut App, builder: F)
    where
        F: FnOnce(Dialog, &mut Window, &mut App) -> Dialog + 'static,
    {
        let dialog = Dialog::new();
        let _ = builder(dialog, self, cx);
    }
}
