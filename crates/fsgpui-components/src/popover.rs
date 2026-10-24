use crate::theme::ActiveTheme;
use fsgpui_theme::*;
use gpui::{
    div, AnyElement, App, AppContext, Context, ElementId, InteractiveElement, IntoElement,
    ParentElement, Render, RenderOnce, Styled, Window,
};
use std::sync::Arc;

pub struct PopoverState;

impl PopoverState {
    pub fn dismiss(&mut self, _window: &mut Window, _cx: &mut Context<Self>) {}
}

impl Render for PopoverState {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        div()
    }
}

#[derive(IntoElement)]
pub struct Popover {
    id: ElementId,
    trigger: Option<AnyElement>,
    content_builder: Option<
        Arc<
            dyn Fn(
                    &mut PopoverState,
                    &mut Window,
                    &mut Context<PopoverState>,
                ) -> AnyElement
                + 'static,
        >,
    >,
    open: bool,
}

impl Popover {
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            trigger: None,
            content_builder: None,
            open: false,
        }
    }

    pub fn trigger(mut self, trigger: impl IntoElement) -> Self {
        self.trigger = Some(trigger.into_any_element());
        self
    }

    pub fn content<F, E>(mut self, builder: F) -> Self
    where
        F: Fn(&mut PopoverState, &mut Window, &mut Context<PopoverState>) -> E + 'static,
        E: IntoElement,
    {
        self.content_builder = Some(Arc::new(move |state, window, cx| {
            builder(state, window, cx).into_any_element()
        }));
        self
    }
}

impl RenderOnce for Popover {
    fn render(mut self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let t = cx.theme().clone();
        let mut el = div().id(self.id.clone()).relative();

        if self.open {
            if let Some(ref builder) = self.content_builder {
                let state_entity = cx.new(|_| PopoverState);
                let content = state_entity.update(cx, |state, cx| builder(state, window, cx));
                el = el.child(
                    div()
                        .absolute()
                        .top_full()
                        .mt(SPACE_2XS)
                        .bg(t.bg_raised)
                        .border_sub(&t)
                        .rounded(RADIUS_MODERN)
                        .shadow_md()
                        .child(content),
                );
            }
        }

        if let Some(trigger) = self.trigger.take() {
            el = el.child(trigger);
        }

        el
    }
}
