//! Standalone editor demo: `cargo run -p cardfile-editor --example editor`.

use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use fsgpui_doc::from_markdown;
use fsgpui_mdeditor::{BlobStore, EditorToolbar, RichEditor};
use gpui::*;

#[derive(Default)]
struct MemBlobs(Mutex<HashMap<String, (String, Vec<u8>)>>);

impl BlobStore for MemBlobs {
    fn put(&self, data: &[u8], mime: &str, _: Option<&str>) -> Option<String> {
        let id = format!(
            "{:x}",
            data.len() * 31 + data.first().copied().unwrap_or(0) as usize
        );
        self.0
            .lock()
            .ok()?
            .insert(id.clone(), (mime.to_owned(), data.to_vec()));
        Some(id)
    }
    fn get(&self, id: &str) -> Option<(String, Vec<u8>)> {
        self.0.lock().ok()?.get(id).cloned()
    }
}

struct Demo {
    editor: Entity<RichEditor>,
    toolbar: Entity<EditorToolbar>,
}

impl Render for Demo {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        use fsgpui_components::ActiveTheme as _;
        div()
            .size_full()
            .flex()
            .flex_col()
            .bg(cx.theme().background)
            .child(self.toolbar.clone())
            .child(div().flex_1().min_h_0().child(self.editor.clone()))
    }
}

fn main() {
    gpui::Application::new().with_assets(fsgpui_components::FsAssets).run(|cx| {
        fsgpui_mdeditor::init(cx);
        let md = "# Welcome\n\nThis is **bold**, *italic* and `code`. Try typing `**bold**` or `# ` at the start of a line.\n\n- First\n  - Nested\n- Second\n\n1. One\n2. Two\n\n- [ ] Todo\n- [x] Done\n\n> A quote\n\n```rust\nfn main() {}\n```\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n---\n\nThe end.";
        let doc = from_markdown(md);
        let opts = WindowOptions {
            window_bounds: Some(WindowBounds::Windowed(Bounds::centered(None, size(px(900.), px(700.)), cx))),
            ..Default::default()
        };
        let _ = cx.open_window(opts, |window, cx| {
            let editor = cx.new(|cx| {
                let mut e = RichEditor::new(doc, cx);
                e.set_blob_store(Arc::new(MemBlobs::default()));
                e
            });
            editor.focus_handle(cx).focus(window, cx);
            let toolbar = cx.new(|cx| EditorToolbar::new(editor.clone(), cx));
            cx.new(|_| Demo { editor, toolbar })
        });
    });
}
