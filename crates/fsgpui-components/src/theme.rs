use fsgpui_theme::FsTheme;
use gpui::{App, Context, Window};
use std::sync::OnceLock;

static DEFAULT_THEME: OnceLock<FsTheme> = OnceLock::new();

fn default_theme() -> &'static FsTheme {
    DEFAULT_THEME.get_or_init(FsTheme::dark)
}

pub trait ActiveTheme {
    fn theme(&self) -> &FsTheme;
}

impl ActiveTheme for App {
    fn theme(&self) -> &FsTheme {
        if self.has_global::<FsTheme>() {
            self.global::<FsTheme>()
        } else {
            default_theme()
        }
    }
}

impl<T> ActiveTheme for Context<'_, T> {
    fn theme(&self) -> &FsTheme {
        if self.has_global::<FsTheme>() {
            self.global::<FsTheme>()
        } else {
            default_theme()
        }
    }
}

impl ActiveTheme for Window {
    fn theme(&self) -> &FsTheme {
        default_theme()
    }
}

/// Set the active application theme in the GPUI environment
pub fn set_theme(theme: FsTheme, cx: &mut App) {
    cx.set_global(theme);
}
