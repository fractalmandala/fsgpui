//! GPU-accelerated terminal emulator surface built on GPUI and portable-pty.

pub mod terminal;

pub use terminal::{PtySession, TerminalGrid, TerminalView};
