# README.md

Consider a YAML-driven UI framework built on gpui. Define the desktop app's UI in a `config.yaml` file, and the agent renders it using gpui-kit and its GPU-accelerated gpui engine under the hood.


```
app-name/
├── Cargo.toml
├── config.yaml          # User-facing UI definition
└── src/
    ├── main.rs          # Application shell and entry point
    ├── config.rs        # YAML schema types (serde structs)
    └── renderer.rs      # Tree walker: config tree → gpui elements
```


## Architecture

```
config.yaml
    │
    ▼
serde_yaml::deserialize
    │
    ▼
AppConfig (typed Rust structs)
    │
    ▼
build_root() / build_node_inner()  ← recursive tree walker
    │
    ▼
gpui-kit (gpui-kit = "0.7.3", includes GPUI, GPUI Base, the styled GPUI Component library and its default icon assets)
    │
    ▼
GPUI renders pixels
```

1. **`config.rs`** defines Rust structs that mirror the YAML schema. Serde deserializes the YAML into these structs automatically.
2. **`renderer.rs`** walks the config tree recursively. For each node, it creates a gpui `Div` element and applies styles.
3. **`main.rs`** loads the config, opens a gpui window, and renders the root view.


## Struct Reference

### `config.rs`

#### `AppConfig`

Top-level config. Represents the entire `config.yaml` file.

```rust
pub struct AppConfig {
    pub window: WindowConfig,
    pub root: NodeConfig,
}
```

| Field  | Type          | Description                          |
|--------|---------------|--------------------------------------|
| window | `WindowConfig`| Window title and size                |
| root   | `NodeConfig`  | Root UI node (the element tree)      |

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `load` | `fn load(path: &str) -> Result<Self, Box<dyn Error>>` | Reads a YAML file and deserializes it into `AppConfig`. |

**YAML example:**

```yaml
window:
  title: "My App"
  size: [800, 600]

root:
  type: div
  # ...
```


#### `WindowConfig`

Controls the native window that gpui opens.

```rust
pub struct WindowConfig {
    pub title: String,
    pub size: [f32; 2],
}
```

| Field | Type       | Description                              |
|-------|------------|------------------------------------------|
| title | `String`   | Text shown in the window titlebar        |
| size  | `[f32; 2]` | `[width, height]` in pixels              |

**YAML example:**

```yaml
window:
  title: "My App"
  size: [800, 600]
```


#### `NodeConfig`

A tagged enum representing a UI element. The `type` field in YAML selects the variant.

```rust
#[serde(tag = "type", rename_all = "lowercase")]
pub enum NodeConfig {
    Div {
        direction: Option<String>,
        gap: Option<f32>,
        style: Option<StyleConfig>,
        children: Vec<NodeConfig>,
    },
    Text {
        content: String,
        style: Option<StyleConfig>,
    },
}
```

##### Variant: `Div`

A flex container. Can hold children.

| Field     | Type                | Default     | Description                                      |
|-----------|---------------------|-------------|--------------------------------------------------|
| direction | `Option<String>`    | `"row"`     | `"row"` or `"column"` — maps to `flex-direction` |
| gap       | `Option<f32>`       | none        | Space between children in pixels                 |
| style     | `Option<StyleConfig>`| none       | Visual styling (see `StyleConfig`)               |
| children  | `Vec<NodeConfig>`   | `[]`        | Nested child nodes                               |

**YAML example:**

```yaml
type: div
direction: column
gap: 16
style:
  background: "#1e1e2e"
  padding: 32
children:
  - type: text
    content: "Hello"
```

##### Variant: `Text`

A text label.

| Field   | Type                | Default | Description                         |
|---------|---------------------|---------|-------------------------------------|
| content | `String`            | —       | The text string to display          |
| style   | `Option<StyleConfig>`| none   | Visual styling (see `StyleConfig`)  |

**YAML example:**

```yaml
type: text
content: "Hello World"
style:
  color: "#cdd6f4"
  font_size: 24
  weight: bold
```


#### `StyleConfig`

Visual properties that can be applied to any node.

```rust
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
```

| Field         | Type            | gpui method      | Description                                    |
|---------------|-----------------|------------------|------------------------------------------------|
| background    | `Option<String>`| `.bg()`          | Background color as hex string (`"#1e1e2e"`)   |
| color         | `Option<String>`| `.text_color()`  | Text/foreground color as hex string             |
| font_size     | `Option<f32>`   | `.text_size()`   | Font size in pixels                             |
| weight        | `Option<String>`| `.font_weight()` | Font weight: `"bold"`, `"semibold"`, `"medium"`, `"light"`, `"thin"`, `"normal"` |
| padding       | `Option<f32>`   | `.p()`           | Padding on all sides in pixels                  |
| border_radius | `Option<f32>`   | `.rounded()`     | Corner radius in pixels                         |
| width         | `Option<f32>`   | `.w()`           | Element width in pixels                         |
| height        | `Option<f32>`   | `.h()`           | Element height in pixels                        |

**YAML example:**

```yaml
style:
  background: "#89b4fa"
  color: "#1e1e2e"
  font_size: 16
  weight: semibold
  padding: 16
  border_radius: 8
  width: 200
  height: 50
```

---

### `main.rs`

#### `YamlView`

The root view struct registered with gpui. Implements the `Render` trait.

```rust
struct YamlView {
    root: config::NodeConfig,
}
```

| Field | Type         | Description                                |
|-------|--------------|--------------------------------------------|
| root  | `NodeConfig` | The parsed config tree for the entire UI   |

**Trait impl:**

```rust
impl Render for YamlView {
    fn render(&mut self, _window: &mut Window, _cx: &mut Context<Self>) -> impl IntoElement {
        build_root(&self.root)
    }
}
```

Calls `build_root()` from `renderer.rs` to convert the config tree into a gpui element tree every frame.


### `renderer.rs`

#### `pub fn build_root(node: &NodeConfig) -> Div`

Entry point for rendering. Calls `build_node_inner` with `is_root = true`, which applies `size_full()` so the root fills the entire window.

| Parameter | Type         | Description               |
|-----------|--------------|---------------------------|
| node      | `&NodeConfig`| The root node from config |

**Returns:** A gpui `Div` element representing the full UI tree.


#### `fn build_node_inner(node: &NodeConfig, is_root: bool) -> Div`

Recursive tree walker. Matches on `NodeConfig` variants and constructs gpui elements.

- For `Div`: creates a `div().flex()`, optionally sets `flex_col`, `gap`, applies styles, and recurses into children.
- For `Text`: creates a `div()` with the text content as a child, applies styles.

| Parameter | Type         | Description                                |
|-----------|--------------|--------------------------------------------|
| node      | `&NodeConfig`| The config node to render                  |
| is_root   | `bool`       | `true` only for the top-level node         |


#### `fn apply_style(element: Div, style: &Option<StyleConfig>) -> Div`

Applies `StyleConfig` properties to a gpui `Div` element. Each field is checked with `if let Some(...)` and mapped to the corresponding gpui builder method.

| Parameter | Type                | Description                    |
|-----------|---------------------|--------------------------------|
| element   | `Div`               | The gpui element to style      |
| style     | `&Option<StyleConfig>` | Style properties from YAML  |

**Returns:** The styled `Div`.


#### `pub fn parse_color(hex: &str) -> gpui::Rgba`

Parses a hex color string (e.g. `"#ff0000"`) into a gpui `Rgba` value.

| Parameter | Type   | Description                          |
|-----------|--------|--------------------------------------|
| hex       | `&str` | Hex color string, with or without `#`|

**Returns:** `gpui::Rgba` value for use with `.bg()`, `.text_color()`, etc.


#### `fn parse_weight(w: &str) -> FontWeight`

Maps a string font weight name to a gpui `FontWeight` enum value.

| Parameter | Type   | Description           |
|-----------|--------|-----------------------|
| w         | `&str` | Weight name (case-insensitive) |

**Accepted values:**

| Input        | Output                   |
|--------------|--------------------------|
| `"bold"`     | `FontWeight::BOLD`       |
| `"semibold"` | `FontWeight::SEMIBOLD`   |
| `"medium"`   | `FontWeight::MEDIUM`     |
| `"light"`    | `FontWeight::LIGHT`      |
| `"thin"`     | `FontWeight::THIN`       |
| anything else| `FontWeight::NORMAL`     |


## Full `config.yaml` Example

```yaml
window:
  title: "ez-gpui App"
  size: [800, 600]

root:
  type: div
  direction: column
  gap: 16
  style:
    background: "#1e1e2e"
    padding: 32
  children:
    - type: text
      content: "Hello from YAML!"
      style:
        color: "#cdd6f4"
        font_size: 32
        weight: bold

    - type: text
      content: "This entire UI was generated from config.yaml"
      style:
        color: "#a6adc8"
        font_size: 16

    - type: div
      direction: row
      gap: 12
      children:
        - type: div
          style:
            background: "#89b4fa"
            padding: 16
            border_radius: 8
          children:
            - type: text
              content: "Blue Box"
              style:
                color: "#1e1e2e"
                weight: semibold

        - type: div
          style:
            background: "#a6e3a1"
            padding: 16
            border_radius: 8
          children:
            - type: text
              content: "Green Box"
              style:
                color: "#1e1e2e"
                weight: semibold

        - type: div
          style:
            background: "#f38ba8"
            padding: 16
            border_radius: 8
          children:
            - type: text
              content: "Red Box"
              style:
                color: "#1e1e2e"
                weight: semibold

    - type: div
      style:
        background: "#313244"
        padding: 20
        border_radius: 8
      children:
        - type: text
          content: "Edit config.yaml and restart to see changes"
          style:
            color: "#bac2de"
            font_size: 14
```


## Extending

### Add a new element type

1. Add a variant to `NodeConfig` in `config.rs`
2. Add a match arm in `build_node_inner()` in `renderer.rs`
3. Use it in `config.yaml`

### Add a new style property

1. Add a field to `StyleConfig` in `config.rs`
2. Add an `if let Some(...)` block in `apply_style()` in `renderer.rs`
3. Use it in `config.yaml`