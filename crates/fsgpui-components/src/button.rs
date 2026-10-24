use crate::icon::{Icon, IconName};
use crate::theme::ActiveTheme;
use crate::traits::{ComponentSize, Disableable, Selectable, Sizable};
use fsgpui_theme::{RgbaExt as _, *};
use gpui::prelude::FluentBuilder as _;
use gpui::{
    div, AnyElement, App, ClickEvent, Div, ElementId, FontWeight, InteractiveElement, IntoElement,
    ParentElement, Pixels, RenderOnce, SharedString, Stateful, StatefulInteractiveElement as _,
    Styled, Window, px,
};
use std::sync::Arc;

pub trait ButtonVariants: Sized {
    fn ghost(self) -> Self;
    fn outline(self) -> Self;
    fn primary(self) -> Self;
}

#[derive(IntoElement)]
pub struct Button {
    id: ElementId,
    label: Option<SharedString>,
    icon: Option<IconName>,
    variant: FsVariant,
    size: ComponentSize,
    selected: bool,
    disabled: bool,
    tooltip: Option<SharedString>,
    width: Option<Pixels>,
    children: Vec<AnyElement>,
    on_click: Option<Arc<dyn Fn(&ClickEvent, &mut Window, &mut App) + 'static>>,
}

impl Button {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            label: None,
            icon: None,
            variant: FsVariant::Secondary,
            size: ComponentSize::Md,
            selected: false,
            disabled: false,
            tooltip: None,
            width: None,
            children: Vec::new(),
            on_click: None,
        }
    }

    pub fn dropdown_caret(self, _show: bool) -> Self {
        self
    }

    pub fn w(mut self, w: Pixels) -> Self {
        self.width = Some(w);
        self
    }

    pub fn xsmall(mut self) -> Self {
        self.size = ComponentSize::Xs;
        self
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    pub fn icon(mut self, icon: IconName) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn tooltip(mut self, tip: impl Into<SharedString>) -> Self {
        self.tooltip = Some(tip.into());
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Arc::new(handler));
        self
    }
}

impl ButtonVariants for Button {
    fn ghost(mut self) -> Self {
        self.variant = FsVariant::Ghost;
        self
    }
    fn outline(mut self) -> Self {
        self.variant = FsVariant::Outline;
        self
    }
    fn primary(mut self) -> Self {
        self.variant = FsVariant::Primary;
        self
    }
}

impl Sizable for Button {
    fn with_size(mut self, size: ComponentSize) -> Self {
        self.size = size;
        self
    }
}

impl Selectable for Button {
    fn selected(mut self, selected: bool) -> Self {
        self.selected = selected;
        self
    }
}

impl Disableable for Button {
    fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl ParentElement for Button {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for Button {
    fn render(self, _window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = cx.theme();
        let height = self.size.height();
        let (font_size, pad_x) = match self.size {
            ComponentSize::Xs => (TEXT_XS, SPACE_XS),
            ComponentSize::Sm => (TEXT_SM, SPACE_SM),
            ComponentSize::Md => (TEXT_SM, SPACE_MD),
            ComponentSize::Lg => (TEXT_MD, SPACE_LG),
            ComponentSize::Xl => (TEXT_BS, SPACE_XL),
        };

        let mut el = div()
            .id(self.id)
            .flex()
            .items_center()
            .justify_center()
            .gap(SPACE_2XS)
            .h(height)
            .px(pad_x)
            .rounded(RADIUS_MODERN)
            .text_size(font_size);

        if let Some(w) = self.width {
            el = el.w(w);
        }

        if self.disabled {
            el = el
                .bg(t.bg_sunken)
                .text_color(t.text_muted)
                .opacity(0.5)
                .cursor_not_allowed();
        } else {
            el = el.cursor_pointer();
            match self.variant {
                FsVariant::Primary => {
                    el = el
                        .bg(t.brand)
                        .text_color(t.text_inverse)
                        .hover(|s| s.opacity(0.88));
                }
                FsVariant::Ghost => {
                    let hover = t.state_hover;
                    if self.selected {
                        el = el.bg(t.state_selected).text_color(t.text_primary);
                    } else {
                        el = el
                            .text_color(t.text_secondary)
                            .hover(move |s| s.bg(hover));
                    }
                }
                FsVariant::Outline => {
                    let hover = t.state_hover;
                    el = el
                        .border_1()
                        .border_color(t.border)
                        .text_color(t.text_primary)
                        .hover(move |s| s.bg(hover));
                }
                _ => {
                    let hover = t.state_hover;
                    if self.selected {
                        el = el.bg(t.state_selected).text_color(t.text_primary);
                    } else {
                        el = el
                            .bg(t.bg_raised)
                            .border_sub(t)
                            .text_color(t.text_primary)
                            .hover(move |s| s.bg(hover));
                    }
                }
            }

            if let Some(handler) = self.on_click {
                el = el.on_click(move |ev, window, cx| handler(ev, window, cx));
            }
        }

        if let Some(icon) = self.icon {
            let color = match self.variant {
                FsVariant::Primary => t.text_inverse,
                _ => t.text_secondary,
            };
            el = el.child(Icon::new(icon).size(px(14.0)).text_color(color));
        }

        if let Some(label) = self.label {
            el = el.child(label);
        }

        for child in self.children {
            el = el.child(child);
        }

        el
    }
}

/// Standalone styled button functions matching fsgpui tokens
pub fn ghost_button(id: impl Into<ElementId>, t: &FsTheme) -> Stateful<Div> {
    let hover = t.state_hover;
    div()
        .id(id)
        .flex()
        .items_center()
        .gap(SPACE_2XS)
        .px(SPACE_SM)
        .h(HEIGHT_MD)
        .rounded(RADIUS_MODERN)
        .text_size(TEXT_SM)
        .text_color(t.text_secondary)
        .cursor_pointer()
        .hover(move |s| s.bg(hover))
}

pub fn button(id: impl Into<ElementId>, t: &FsTheme) -> Stateful<Div> {
    let hover = t.state_hover;
    div()
        .id(id)
        .flex()
        .items_center()
        .justify_center()
        .gap(SPACE_2XS)
        .px(SPACE_SM)
        .h(HEIGHT_MD)
        .rounded(RADIUS_MODERN)
        .bg(t.bg_raised)
        .border_sub(t)
        .text_size(TEXT_SM)
        .text_color(t.text_primary)
        .cursor_pointer()
        .hover(move |s| s.bg(hover))
}

pub fn primary_button(id: impl Into<ElementId>, t: &FsTheme) -> Stateful<Div> {
    div()
        .id(id)
        .flex()
        .items_center()
        .justify_center()
        .gap(SPACE_2XS)
        .px(SPACE_SM)
        .h(HEIGHT_MD)
        .rounded(RADIUS_MODERN)
        .bg(t.brand)
        .text_size(TEXT_SM)
        .text_color(t.text_inverse)
        .cursor_pointer()
        .hover(|s| s.opacity(0.88))
}

pub fn icon_button(id: impl Into<ElementId>, icon: IconName, t: &FsTheme) -> Stateful<Div> {
    let hover = t.state_hover;
    div()
        .id(id)
        .flex()
        .items_center()
        .justify_center()
        .size(HEIGHT_MD)
        .rounded(RADIUS_MODERN)
        .text_color(t.text_muted)
        .cursor_pointer()
        .hover(move |s| s.bg(hover))
        .child(Icon::new(icon).size(px(14.0)))
}

pub fn chip(
    id: impl Into<ElementId>,
    label: impl Into<SharedString>,
    active: bool,
    t: &FsTheme,
) -> Stateful<Div> {
    let hover = t.state_hover;
    div()
        .id(id)
        .flex()
        .items_center()
        .gap(SPACE_2XS)
        .px(SPACE_SM)
        .h(HEIGHT_SM)
        .rounded(RADIUS_MIN)
        .text_size(TEXT_XS)
        .cursor_pointer()
        .when(active, |d| {
            d.bg(t.brand.opacity(0.16)).text_color(t.brand)
        })
        .when(!active, |d| {
            d.bg(t.bg_raised)
                .text_color(t.text_secondary)
                .hover(move |s| s.bg(hover))
        })
        .child(label.into())
}

pub fn pill(label: impl Into<SharedString>, t: &FsTheme) -> Div {
    div()
        .flex()
        .items_center()
        .px(SPACE_XS)
        .py(SPACE_3XS)
        .rounded(RADIUS_MIN)
        .bg(t.bg_raised)
        .text_size(TEXT_XS)
        .text_color(t.text_muted)
        .child(label.into())
}

pub fn kbd(keys: impl Into<SharedString>, t: &FsTheme) -> Div {
    div()
        .px(SPACE_XS)
        .py(SPACE_3XS)
        .rounded(RADIUS_MIN)
        .bg(t.bg_sunken)
        .border_sub(t)
        .text_size(TEXT_XS)
        .text_color(t.text_muted)
        .child(keys.into())
}

pub fn section_label(text: impl Into<SharedString>, t: &FsTheme) -> Div {
    div()
        .text_size(TEXT_XS)
        .font_weight(FontWeight::SEMIBOLD)
        .text_color(t.text_muted)
        .child(text.into())
}
