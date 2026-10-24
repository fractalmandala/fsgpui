use crate::theme::ActiveTheme;
use fsgpui_theme::*;
use gpui::{
    div, Action, App, FocusHandle, InteractiveElement, IntoElement, MouseButton, ParentElement,
    RenderOnce, SharedString, Styled, Window,
};

pub enum MenuItem {
    Label(SharedString),
    Action {
        label: SharedString,
        action: Box<dyn Action>,
    },
    Separator,
}

#[derive(Default, IntoElement)]
pub struct PopupMenu {
    focus_handle: Option<FocusHandle>,
    items: Vec<MenuItem>,
}

impl PopupMenu {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn action_context(mut self, handle: FocusHandle) -> Self {
        self.focus_handle = Some(handle);
        self
    }

    pub fn label(mut self, text: impl Into<SharedString>) -> Self {
        self.items.push(MenuItem::Label(text.into()));
        self
    }

    pub fn menu(mut self, label: impl Into<SharedString>, action: Box<dyn Action>) -> Self {
        self.items.push(MenuItem::Action {
            label: label.into(),
            action,
        });
        self
    }

    pub fn separator(mut self) -> Self {
        self.items.push(MenuItem::Separator);
        self
    }
}

impl RenderOnce for PopupMenu {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = cx.theme();
        let mut el = div()
            .flex()
            .flex_col()
            .min_w(gpui::px(160.0))
            .p(SPACE_2XS)
            .rounded(RADIUS_MODERN)
            .bg(t.bg_raised)
            .border_sub(t)
            .shadow_md();

        for (i, item) in self.items.into_iter().enumerate() {
            match item {
                MenuItem::Label(label) => {
                    el = el.child(
                        div()
                            .px(SPACE_SM)
                            .py(SPACE_3XS)
                            .text_size(TEXT_XS)
                            .text_color(t.text_muted)
                            .child(label),
                    );
                }
                MenuItem::Action { label, action } => {
                    let action_clone = action.boxed_clone();
                    el = el.child(
                        div()
                            .id(("menu-item", i))
                            .flex()
                            .items_center()
                            .px(SPACE_SM)
                            .h(HEIGHT_SM)
                            .rounded(RADIUS_MIN)
                            .text_size(TEXT_SM)
                            .text_color(t.text_primary)
                            .cursor_pointer()
                            .hover(|s| s.bg(t.state_hover))
                            .on_mouse_down(MouseButton::Left, move |_, window, cx| {
                                window.dispatch_action(action_clone.boxed_clone(), cx);
                            })
                            .child(label),
                    );
                }
                MenuItem::Separator => {
                    el = el.child(
                        div()
                            .my(SPACE_3XS)
                            .h(gpui::px(1.0))
                            .bg(t.border_subtle),
                    );
                }
            }
        }

        el
    }
}

pub trait ContextMenuExt: Sized {
    fn context_menu<F>(self, builder: F) -> Self
    where
        F: Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static;
}

impl<E: InteractiveElement> ContextMenuExt for E {
    fn context_menu<F>(self, _builder: F) -> Self
    where
        F: Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static,
    {
        // GPUI context menu hook
        self
    }
}

pub trait DropdownMenu: Sized {
    fn dropdown_menu<F>(self, builder: F) -> Self
    where
        F: Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static;
}

impl<E: InteractiveElement> DropdownMenu for E {
    fn dropdown_menu<F>(self, _builder: F) -> Self
    where
        F: Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static,
    {
        self
    }
}

impl DropdownMenu for crate::button::Button {
    fn dropdown_menu<F>(self, _builder: F) -> Self
    where
        F: Fn(PopupMenu, &mut Window, &mut App) -> PopupMenu + 'static,
    {
        self
    }
}
