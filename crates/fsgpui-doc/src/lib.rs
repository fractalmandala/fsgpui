//! fsgpui document model and exporters.
//!
//! Documents are stored as a [`Document`] serialized to JSON. Markdown, HTML, PDF and
//! JSON are export/import formats.

pub mod bidi;
pub mod blob_ref;
mod export;
pub mod fonts;
mod markdown_in;
mod model;
pub mod pdf;

pub mod rules;

pub use blob_ref::BlobRef;
pub use export::{
    BlobResolver, MarkdownOptions, NoBlobs, blob_file_name, escape_html, is_safe_link, to_html,
    to_markdown, to_plain_text,
};
pub use markdown_in::{from_markdown, looks_like_markdown};
pub use model::{
    Align, Attachment, Block, BlockKind, Color, DOC_VERSION, Document, Image, MAX_INDENT, Mark,
    RichText, Run, Style, Table, TextSize,
};

/// Up to `max_chars` characters of plain text on one line, for list previews.
pub fn preview(plain_text: &str, max_chars: usize) -> String {
    let mut out = String::new();
    for word in plain_text.split_whitespace() {
        if out.chars().count() + word.chars().count() + 1 > max_chars {
            if out.is_empty() {
                out.extend(word.chars().take(max_chars));
            }
            out.push('…');
            break;
        }
        if !out.is_empty() {
            out.push(' ');
        }
        out.push_str(word);
    }
    out
}
