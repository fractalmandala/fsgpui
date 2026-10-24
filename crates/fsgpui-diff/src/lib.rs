//! Git diff parsing and hunk review surface for GPUI.

pub mod highlight;
pub mod review_diff;

pub use review_diff::{File, FileStatus, Line, LineKind, Snapshot, Source};
