// fsgpui-mdeditor: Internal i18n helper providing clean fallbacks for editor strings.

pub fn t(key: &str) -> String {
    match key {
        "editor.toolbar.paragraph" => "Paragraph".into(),
        "editor.toolbar.heading1" => "Heading 1".into(),
        "editor.toolbar.heading2" => "Heading 2".into(),
        "editor.toolbar.heading3" => "Heading 3".into(),
        "editor.toolbar.bullet_list" => "Bulleted List".into(),
        "editor.toolbar.numbered_list" => "Numbered List".into(),
        "editor.toolbar.check_list" => "Checklist".into(),
        "editor.toolbar.quote" => "Quote".into(),
        "editor.toolbar.code_block" => "Code Block".into(),
        "editor.toolbar.table" => "Table".into(),
        "editor.toolbar.divider" => "Divider".into(),
        "editor.toolbar.image" => "Image".into(),
        "editor.toolbar.attachment" => "Attachment".into(),
        "editor.link.title" => "Insert Link".into(),
        "editor.link.text_placeholder" => "Link text".into(),
        "editor.media.loading" => "Loading media...".into(),
        "editor.media.failed" => "Failed to load media".into(),
        "editor.media.open_external" => "Open in default app".into(),
        "editor.find.placeholder" => "Find in document".into(),
        "editor.find.replace_placeholder" => "Replace with".into(),
        "editor.size_units.bytes" => "{n} B".into(),
        "editor.size_units.kb" => "{n} KB".into(),
        "editor.size_units.mb" => "{n} MB".into(),
        "editor.size_units.gb" => "{n} GB".into(),
        "common.cancel" => "Cancel".into(),
        "common.ok" => "OK".into(),
        _ => {
            let part = key.split('.').last().unwrap_or(key);
            let mut result = String::new();
            for word in part.split('_') {
                if !result.is_empty() {
                    result.push(' ');
                }
                let mut chars = word.chars();
                if let Some(first) = chars.next() {
                    result.extend(first.to_uppercase());
                    result.extend(chars);
                }
            }
            if result.is_empty() {
                key.to_string()
            } else {
                result
            }
        }
    }
}

pub fn t_args(key: &str, args: &[(&str, &dyn std::fmt::Display)]) -> String {
    let mut s = t(key);
    for (k, v) in args {
        s = s.replace(&format!("{{{k}}}"), &v.to_string());
    }
    s
}

pub fn visual(text: &str) -> String {
    text.to_string()
}
