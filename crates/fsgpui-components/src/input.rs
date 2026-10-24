use crate::icon::{Icon, IconName};
use crate::theme::ActiveTheme;
use fsgpui_theme::*;
use gpui::prelude::FluentBuilder as _;
use gpui::{
    div, App, Context, Entity, EventEmitter, FocusHandle, Focusable, InteractiveElement as _,
    IntoElement, MouseButton, ParentElement as _, Render, RenderOnce, SharedString, Styled, Window,
    px,
};
use std::sync::Arc;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum InputEvent {
    Change,
    Submit(SharedString),
    PressEnter { shift: bool },
}

pub struct InputState {
    pub value: String,
    pub placeholder: Option<SharedString>,
    pub focus_handle: FocusHandle,
}

impl InputState {
    pub fn new(cx: &mut App) -> Self {
        Self {
            value: String::new(),
            placeholder: None,
            focus_handle: cx.focus_handle(),
        }
    }

    pub fn placeholder(mut self, p: impl Into<SharedString>) -> Self {
        self.placeholder = Some(p.into());
        self
    }

    pub fn default_value(mut self, val: impl Into<String>) -> Self {
        self.value = val.into();
        self
    }

    pub fn focus(&self, window: &mut Window) {
        self.focus_handle.focus(window);
    }

    pub fn value(&self) -> &str {
        &self.value
    }

    pub fn set_value(&mut self, val: impl Into<String>, cx: &mut Context<Self>) {
        self.value = val.into();
        cx.emit(InputEvent::Change);
        cx.notify();
    }

    pub fn clear(&mut self, cx: &mut Context<Self>) {
        self.value.clear();
        cx.emit(InputEvent::Change);
        cx.notify();
    }
}

impl EventEmitter<InputEvent> for InputState {}

impl Focusable for InputState {
    fn focus_handle(&self, _cx: &App) -> FocusHandle {
        self.focus_handle.clone()
    }
}

impl Render for InputState {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let t = cx.theme();
        let display = if self.value.is_empty() {
            self.placeholder.as_ref().map(|p| p.as_ref()).unwrap_or("")
        } else {
            &self.value
        };

        div()
            .text_size(TEXT_SM)
            .when(self.value.is_empty(), |d| d.text_color(t.text_muted))
            .when(!self.value.is_empty(), |d| d.text_color(t.text_primary))
            .child(display.to_string())
    }
}

#[derive(IntoElement)]
pub struct Input {
    state: Entity<InputState>,
    placeholder: Option<SharedString>,
    cleanable: bool,
    on_event: Option<Arc<dyn Fn(&InputEvent, &mut Window, &mut App) + 'static>>,
}

impl Input {
    pub fn new(state: &Entity<InputState>) -> Self {
        Self {
            state: state.clone(),
            placeholder: None,
            cleanable: false,
            on_event: None,
        }
    }

    pub fn placeholder(mut self, p: impl Into<SharedString>) -> Self {
        self.placeholder = Some(p.into());
        self
    }

    pub fn cleanable(mut self, cleanable: bool) -> Self {
        self.cleanable = cleanable;
        self
    }

    pub fn small(self) -> Self {
        self
    }

    pub fn on_event(
        mut self,
        handler: impl Fn(&InputEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_event = Some(Arc::new(handler));
        self
    }
}

impl RenderOnce for Input {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = cx.theme();
        let state = self.state.clone();
        let val = state.read(cx).value.clone();
        let is_empty = val.is_empty();

        let mut el = div()
            .flex()
            .items_center()
            .h(HEIGHT_BS)
            .px(SPACE_SM)
            .rounded(RADIUS_MODERN)
            .bg(t.bg_input)
            .border_1()
            .border_color(t.border)
            .text_size(TEXT_SM)
            .child(
                div()
                    .flex_1()
                    .when(is_empty, |d| {
                        d.text_color(t.text_muted)
                            .child(self.placeholder.clone().unwrap_or_default())
                    })
                    .when(!is_empty, |d| {
                        d.text_color(t.text_primary).child(val)
                    }),
            );

        if self.cleanable && !is_empty {
            let state_c = state.clone();
            el = el.child(
                div()
                    .cursor_pointer()
                    .text_color(t.text_muted)
                    .hover(|s| s.text_color(t.text_primary))
                    .child(Icon::new(IconName::Close).size(px(12.0)))
                    .on_mouse_down(MouseButton::Left, move |_, window, cx| {
                        state_c.update(cx, |st, cx| st.clear(cx));
                        window.refresh();
                    }),
            );
        }

        el
    }
}
