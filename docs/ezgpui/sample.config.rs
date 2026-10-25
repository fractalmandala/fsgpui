use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct AppConfig {
    pub window: WindowConfig,
    pub root: NodeConfig,
}

#[derive(Debug, Deserialize)]
pub struct WindowConfig {
    pub title: String,
    pub size: [f32; 2],
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum NodeConfig {
    Div {
        #[serde(default)]
        direction: Option<String>,
        #[serde(default)]
        gap: Option<f32>,
        #[serde(default)]
        style: Option<StyleConfig>,
        #[serde(default)]
        children: Vec<NodeConfig>,
    },
    Text {
        content: String,
        #[serde(default)]
        style: Option<StyleConfig>,
    },
}

#[derive(Debug, Deserialize, Default, Clone)]
pub struct StyleConfig {
    pub background: Option<String>,
    pub color: Option<String>,
    pub font_size: Option<f32>,
    pub weight: Option<String>,
    pub padding: Option<f32>,
    pub border_radius: Option<f32>,
    pub width: Option<f32>,
    pub height: Option<f32>,
}

impl AppConfig {
    pub fn load(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string(path)?;
        let config: AppConfig = serde_yaml::from_str(&content)?;
        Ok(config)
    }
}
