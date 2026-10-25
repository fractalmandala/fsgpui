mod config;
mod renderer;

use config::AppConfig;
use gpui::{
    prelude::*, App, Application, Bounds, Context, Render, SharedString, Size, Window,
    WindowBounds, WindowOptions,
};
use renderer::build_root;

struct YamlView {
    root: config::NodeConfig,
}

impl Render for YamlView {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        build_root(&self.root)
    }
}

fn main() {
    let app_config = AppConfig::load("config.yaml").expect("Failed to load config.yaml");

    Application::new().run(move |cx: &mut App| {
        let bounds = Bounds::centered(
            None,
            Size {
                width: gpui::px(app_config.window.size[0]),
                height: gpui::px(app_config.window.size[1]),
            },
            cx,
        );

        cx.open_window(
            WindowOptions {
                window_bounds: Some(WindowBounds::Windowed(bounds)),
                titlebar: Some(gpui::TitlebarOptions {
                    title: Some(SharedString::from(&app_config.window.title)),
                    ..Default::default()
                }),
                ..Default::default()
            },
            |_, cx| {
                cx.new(|_| YamlView {
                    root: app_config.root,
                })
            },
        )
        .unwrap();

        cx.activate(true);

        cx.on_window_closed(|cx| {
            if cx.windows().is_empty() {
                cx.quit();
            }
        })
        .detach();
    });
}
