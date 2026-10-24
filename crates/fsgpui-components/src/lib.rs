//! Canonical Fractal Design System GPUI Component Collection.
//!
//! Recreated natively on Zed's GPUI base, styled exclusively with `@fractaldesign/fsgpui` tokens.

pub mod button;
pub mod dialog;
pub mod icon;
pub mod input;
pub mod layout;
pub mod menu;
pub mod popover;
pub mod scroll;
pub mod theme;
pub mod tooltip;
pub mod traits;

pub use button::{
    button, chip, ghost_button, icon_button, kbd, pill, primary_button, section_label, Button,
    ButtonVariants,
};
pub use dialog::{Dialog, DialogAction, DialogClose, DialogFooter, WindowExt};
pub use icon::{FsAssets, Icon, IconName};
pub use input::{Input, InputEvent, InputState};
pub use layout::{flex_center, h_flex, v_flex};
pub use menu::{ContextMenuExt, DropdownMenu, MenuItem, PopupMenu};
pub use popover::Popover;
pub use scroll::ScrollableElement;
pub use theme::{set_theme, ActiveTheme};
pub use tooltip::Tooltip;
pub use traits::{ComponentSize, Disableable, Selectable, Sizable};

pub mod prelude {
    pub use crate::button::ButtonVariants as _;
    pub use crate::dialog::WindowExt as _;
    pub use crate::layout::{flex_center, h_flex, v_flex};
    pub use crate::menu::{ContextMenuExt as _, DropdownMenu as _};
    pub use crate::scroll::ScrollableElement as _;
    pub use crate::theme::ActiveTheme as _;
    pub use crate::traits::{Disableable as _, Selectable as _, Sizable as _};
    pub use fsgpui_theme::FsElementExt as _;
}
