use gpui::{ScrollHandle, Styled};

pub trait ScrollableElement: Sized {
    fn vertical_scrollbar(self, _handle: &ScrollHandle) -> Self;
}

impl<T: Styled> ScrollableElement for T {
    fn vertical_scrollbar(self, _handle: &ScrollHandle) -> Self {
        self
    }
}
