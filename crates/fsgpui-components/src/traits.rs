use gpui::Pixels;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ComponentSize {
    Xs,
    Sm,
    #[default]
    Md,
    Lg,
    Xl,
}

impl ComponentSize {
    pub fn height(self) -> Pixels {
        match self {
            Self::Xs => fsgpui_theme::HEIGHT_SM,
            Self::Sm => fsgpui_theme::HEIGHT_SM,
            Self::Md => fsgpui_theme::HEIGHT_MD,
            Self::Lg => fsgpui_theme::HEIGHT_LG,
            Self::Xl => fsgpui_theme::HEIGHT_XL,
        }
    }
}

pub trait Sizable {
    fn with_size(self, size: ComponentSize) -> Self;
    fn small(self) -> Self
    where
        Self: Sized,
    {
        self.with_size(ComponentSize::Sm)
    }
    fn medium(self) -> Self
    where
        Self: Sized,
    {
        self.with_size(ComponentSize::Md)
    }
    fn large(self) -> Self
    where
        Self: Sized,
    {
        self.with_size(ComponentSize::Lg)
    }
}

pub trait Selectable {
    fn selected(self, selected: bool) -> Self;
}

pub trait Disableable {
    fn disabled(self, disabled: bool) -> Self;
}
