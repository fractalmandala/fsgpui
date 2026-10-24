// fsgpui-terminal: Standalone GPU-accelerated terminal emulator for GPUI
// Powered by portable-pty (WezTerm) and vte (ANSI escape parser)

use std::io::Write;
use std::sync::Arc;
use anyhow::{Context as _, Result};
use crossbeam_channel::{Receiver, unbounded};
use gpui::{
    div, px, rgba, App, Context, ElementId, FocusHandle, Focusable, InteractiveElement,
    IntoElement, KeyDownEvent, ParentElement, Render, SharedString, Styled, Window,
};
use parking_lot::Mutex;
use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};

/// Terminal screen grid maintaining lines of parsed terminal text.
pub struct TerminalGrid {
    pub lines: Vec<String>,
    pub max_lines: usize,
    pub cursor_col: usize,
    pub cursor_row: usize,
}

impl Default for TerminalGrid {
    fn default() -> Self {
        Self {
            lines: vec![String::new()],
            max_lines: 1000,
            cursor_col: 0,
            cursor_row: 0,
        }
    }
}

impl TerminalGrid {
    pub fn new(max_lines: usize) -> Self {
        Self {
            lines: vec![String::new()],
            max_lines,
            cursor_col: 0,
            cursor_row: 0,
        }
    }

    pub fn clear(&mut self) {
        self.lines = vec![String::new()];
        self.cursor_col = 0;
        self.cursor_row = 0;
    }

    fn current_line_mut(&mut self) -> &mut String {
        while self.cursor_row >= self.lines.len() {
            self.lines.push(String::new());
        }
        &mut self.lines[self.cursor_row]
    }
}

impl vte::Perform for TerminalGrid {
    fn print(&mut self, c: char) {
        let col = self.cursor_col;
        let line = self.current_line_mut();
        // Pad line if cursor is past end
        while line.chars().count() < col {
            line.push(' ');
        }
        line.push(c);
        self.cursor_col += 1;
    }

    fn execute(&mut self, byte: u8) {
        match byte {
            b'\n' => {
                // Newline
                self.cursor_row += 1;
                if self.lines.len() > self.max_lines {
                    self.lines.remove(0);
                    if self.cursor_row > 0 {
                        self.cursor_row -= 1;
                    }
                }
            }
            b'\r' => {
                // Carriage return
                self.cursor_col = 0;
            }
            b'\x08' => {
                // Backspace
                if self.cursor_col > 0 {
                    self.cursor_col -= 1;
                }
            }
            b'\t' => {
                // Tab
                let spaces = 4 - (self.cursor_col % 4);
                for _ in 0..spaces {
                    self.print(' ');
                }
            }
            _ => {}
        }
    }

    fn hook(&mut self, _params: &vte::Params, _intermediates: &[u8], _ignore: bool, _action: char) {}
    fn put(&mut self, _byte: u8) {}
    fn unhook(&mut self) {}
    fn osc_dispatch(&mut self, _params: &[&[u8]], _bell_terminated: bool) {}

    fn csi_dispatch(
        &mut self,
        params: &vte::Params,
        _intermediates: &[u8],
        _ignore: bool,
        action: char,
    ) {
        match action {
            'J' => {
                // Clear display
                let mode = params.iter().next().and_then(|p| p.first()).copied().unwrap_or(0);
                if mode == 2 || mode == 3 {
                    self.clear();
                }
            }
            'K' => {
                // Clear in line
                let col = self.cursor_col;
                let line = self.current_line_mut();
                line.truncate(col);
            }
            'H' | 'f' => {
                // Cursor position: row, col (1-based)
                let mut iter = params.iter();
                let row = iter.next().and_then(|p| p.first()).copied().unwrap_or(1);
                let col = iter.next().and_then(|p| p.first()).copied().unwrap_or(1);
                self.cursor_row = (row.max(1) - 1) as usize;
                self.cursor_col = (col.max(1) - 1) as usize;
            }
            _ => {}
        }
    }

    fn esc_dispatch(&mut self, _intermediates: &[u8], _ignore: bool, _byte: u8) {}
}

/// Active PTY Process Session.
pub struct PtySession {
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    receiver: Receiver<Vec<u8>>,
}

impl PtySession {
    pub fn spawn(cols: u16, rows: u16, custom_shell: Option<&str>) -> Result<Self> {
        let pty_system = NativePtySystem::default();
        let pair = pty_system
            .openpty(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .context("Failed to open PTY pair")?;

        let shell = custom_shell
            .map(|s| s.to_string())
            .or_else(|| std::env::var("SHELL").ok())
            .unwrap_or_else(|| "/bin/zsh".to_string());

        let mut cmd = CommandBuilder::new(&shell);
        cmd.env("TERM", "xterm-256color");
        cmd.env("COLORTERM", "truecolor");

        let _child = pair.slave.spawn_command(cmd).context("Failed to spawn shell")?;
        drop(pair.slave);

        let mut reader = pair.master.try_clone_reader().context("Failed to clone PTY reader")?;
        let writer = Arc::new(Mutex::new(
            pair.master.take_writer().context("Failed to take PTY writer")?,
        ));

        let (tx, rx) = unbounded::<Vec<u8>>();

        std::thread::spawn(move || {
            let mut buf = [0u8; 4096];
            while let Ok(n) = reader.read(&mut buf) {
                if n == 0 {
                    break;
                }
                if tx.send(buf[..n].to_vec()).is_err() {
                    break;
                }
            }
        });

        Ok(Self {
            writer,
            receiver: rx,
        })
    }

    pub fn write(&self, data: &[u8]) -> Result<()> {
        let mut w = self.writer.lock();
        w.write_all(data).context("Failed to write to PTY")?;
        w.flush().context("Failed to flush PTY")?;
        Ok(())
    }

    pub fn try_recv(&self) -> Option<Vec<u8>> {
        self.receiver.try_recv().ok()
    }
}

/// Native GPUI Terminal View.
pub struct TerminalView {
    pub pty: Option<PtySession>,
    pub grid: TerminalGrid,
    parser: vte::Parser,
    focus_handle: FocusHandle,
    pub title: String,
}

impl TerminalView {
    pub fn new(cx: &mut Context<Self>) -> Self {
        let focus_handle = cx.focus_handle();
        let mut view = Self {
            pty: None,
            grid: TerminalGrid::new(2000),
            parser: vte::Parser::new(),
            focus_handle,
            title: "Terminal • zsh".to_string(),
        };

        if let Ok(pty) = PtySession::spawn(80, 24, None) {
            view.pty = Some(pty);
        }

        view
    }

    pub fn write_str(&mut self, s: &str) {
        if let Some(pty) = &self.pty {
            let _ = pty.write(s.as_bytes());
        }
    }

    pub fn poll_output(&mut self) -> bool {
        let mut updated = false;
        if let Some(pty) = &self.pty {
            while let Some(bytes) = pty.try_recv() {
                updated = true;
                self.parser.advance(&mut self.grid, &bytes);
            }
        }
        updated
    }
}

impl Focusable for TerminalView {
    fn focus_handle(&self, _cx: &App) -> FocusHandle {
        self.focus_handle.clone()
    }
}

impl Render for TerminalView {
    fn render(&mut self, _window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        // Poll output on frame render
        self.poll_output();

        let lines = self.grid.lines.clone();

        div()
            .id(ElementId::Name("terminal_view".into()))
            .track_focus(&self.focus_handle)
            .flex()
            .flex_col()
            .size_full()
            .bg(rgba(0x0e1117ff))
            .border_1()
            .border_color(rgba(0x30363d80))
            .rounded(px(8.0))
            .overflow_hidden()
            .on_key_down(cx.listener(|this, event: &KeyDownEvent, _window, cx| {
                let keystroke = &event.keystroke;
                let text = match keystroke.key.as_str() {
                    "enter" => Some("\r".to_string()),
                    "backspace" => Some("\x7f".to_string()),
                    "tab" => Some("\t".to_string()),
                    "escape" => Some("\x1b".to_string()),
                    "up" => Some("\x1b[A".to_string()),
                    "down" => Some("\x1b[B".to_string()),
                    "right" => Some("\x1b[C".to_string()),
                    "left" => Some("\x1b[D".to_string()),
                    _ => {
                        if keystroke.modifiers.control && keystroke.key == "c" {
                            Some("\x03".to_string())
                        } else if keystroke.modifiers.control && keystroke.key == "d" {
                            Some("\x04".to_string())
                        } else if keystroke.key.chars().count() == 1 {
                            Some(keystroke.key.clone())
                        } else {
                            None
                        }
                    }
                };

                if let Some(t) = text {
                    this.write_str(&t);
                    cx.notify();
                }
            }))
            // Header Bar
            .child(
                div()
                    .flex()
                    .items_center()
                    .justify_between()
                    .h(px(32.0))
                    .px(px(12.0))
                    .bg(rgba(0x161b22ff))
                    .border_b_1()
                    .border_color(rgba(0x30363d60))
                    .child(
                        div()
                            .flex()
                            .items_center()
                            .gap(px(8.0))
                            .child(
                                div()
                                    .size(px(8.0))
                                    .rounded_full()
                                    .bg(if self.pty.is_some() {
                                        rgba(0x3fb950ff)
                                    } else {
                                        rgba(0xf85149ff)
                                    }),
                            )
                            .child(
                                div()
                                    .text_size(px(11.0))
                                    .text_color(rgba(0x8b949eff))
                                    .font_weight(gpui::FontWeight::SEMIBOLD)
                                    .child(SharedString::from(self.title.clone())),
                            ),
                    ),
            )
            // Monospace Screen Body
            .child(
                div()
                    .flex_1()
                    .p(px(12.0))
                    .overflow_hidden()
                    .font_family(".AppleSystemUIFontMonospaced, Menlo, Monaco, monospace")
                    .text_size(px(12.0))
                    .line_height(px(18.0))
                    .text_color(rgba(0xe6edf3ff))
                    .children(lines.into_iter().enumerate().map(|(idx, line)| {
                        div()
                            .id(ElementId::NamedInteger("term_line".into(), idx as u64))
                            .min_h(px(18.0))
                            .child(if line.is_empty() {
                                " ".to_string()
                            } else {
                                line
                            })
                    })),
            )
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_terminal_grid_print_and_newline() {
        let mut grid = TerminalGrid::new(100);
        let mut parser = vte::Parser::new();
        parser.advance(&mut grid, b"Hello World\r\nFractal AI Terminal\r\n");
        assert_eq!(grid.lines[0], "Hello World");
        assert_eq!(grid.lines[1], "Fractal AI Terminal");
    }

    #[test]
    fn test_terminal_grid_clear_screen() {
        let mut grid = TerminalGrid::new(100);
        let mut parser = vte::Parser::new();
        parser.advance(&mut grid, b"Line 1\nLine 2\x1b[2J");
        assert_eq!(grid.lines.len(), 1);
        assert_eq!(grid.cursor_col, 0);
    }
}
