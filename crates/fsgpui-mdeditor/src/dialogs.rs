//! Small dialogs opened by the editor.

use fsgpui_components::button::{Button, ButtonVariants as _};
use fsgpui_components::dialog::{DialogAction, DialogClose, DialogFooter, WindowExt as _};
use fsgpui_components::input::{Input, InputState};
use fsgpui_components::v_flex;
use gpui::{AppContext as _, Entity, ParentElement as _, Styled as _, Window, px, App};

use crate::editor::RichEditor;

/// Ask for a link URL (and its text when nothing is selected).
///
/// `current` is the link under the caret and `needs_text` whether a display text must
/// be asked for. The caller passes them in because it is usually an editor action
/// handler, and reading the editor entity while it is being updated panics.
pub fn open_link_dialog(
    editor: Entity<RichEditor>,
    current: String,
    needs_text: bool,
    window: &mut Window,
    cx: &mut App,
) {
    let url = cx.new(|cx| {
        InputState::new(cx)
            .placeholder("https://…")
            .default_value(current)
    });
    let text = cx.new(|cx| {
        InputState::new(cx).placeholder(crate::i18n::t("editor.link.text_placeholder"))
    });
    url.update(cx, |s, _cx| s.focus(window));
    window.open_dialog(cx, move |dialog, _window, _cx| {
        let url_input = url.clone();
        let text_input = text.clone();
        let editor = editor.clone();
        let mut body = v_flex().gap_2().w(px(380.)).child(Input::new(&url_input));
        if needs_text {
            body = body.child(Input::new(&text_input));
        }
        dialog
            .title(crate::i18n::t("editor.link.title"))
            .child(body)
            // A plain Dialog draws no buttons of its own; OK runs `on_ok` like Enter.
            .footer(
                DialogFooter::new()
                    .child(
                        DialogClose::new()
                            .trigger(|button| button.label(crate::i18n::t("common.cancel"))),
                    )
                    .child(
                        DialogAction::new().child(
                            Button::new("link-ok")
                                .primary()
                                .label(crate::i18n::t("common.ok")),
                        ),
                    ),
            )
            .on_ok(move |_, window, cx| {
                let u = url_input.read(cx).value().to_string();
                let t = needs_text.then(|| text_input.read(cx).value().to_string());
                editor.update(cx, |e, cx| e.apply_link(u.clone(), t.clone(), cx));
                let focus = editor.read(cx).focus_handle.clone();
                focus.focus(window);
                true
            })
    });
}
