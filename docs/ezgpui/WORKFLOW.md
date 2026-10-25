# ezgpui — a YAML-described GPUI app creation & scaffolding workflow

A conceptual design for app creation where the UI is described in YAML and
rendered by gpui. The core loop already works — see the samples in this
folder ([sample.config.yaml](sample.config.yaml),
[sample.config.rs](sample.config.rs),
[sample.renderer.rs](sample.renderer.rs),
[sample.main.rs](sample.main.rs)) and the
[README](README.md.md). This doc lays out how that grows into a full
workflow.

## The core loop (already proven)

```
app.yaml → serde → typed Rust structs → recursive tree walker → gpui-kit → pixels
```

`config.rs` mirrors the YAML schema as serde structs. `renderer.rs` walks the
node tree recursively and applies styles to gpui `Div`s. `main.rs` opens the
window from the `window:` section and renders the root view. Three files,
one dependency (`gpui-kit`), zero gpui code in the user's YAML.

## The workflow (developer / agent loop)

```
1. ezgpui new my-app          ← scaffold from template
2. describe the app in app.yaml
3. ezgpui check               ← validate schema headlessly, no window
4. cargo run                  ← YAML renders live
5. edit app.yaml → hot-reload ← no recompile, no restart
6. need behavior? → escape hatch to Rust bindings
7. ezgpui freeze              ← optional: compile YAML → Rust for production
```

## Scaffolded project

```
my-app/
├── Cargo.toml        # single dep: gpui-kit = "0.7.3"
├── app.yaml          # the entire UI definition
└── src/
    ├── main.rs       # shell: window title/size from YAML, root view, quit-on-close
    ├── config.rs     # serde schema types (AppConfig, NodeConfig, StyleConfig)
    └── renderer.rs   # tree walker: build_root / build_node_inner
```

This is the sample architecture kept as-is. One dependency, one gpui lineage,
pinned — never mix gpui lineages (crates.io vs git vs fork) in one app.

## YAML schema grows in layers — don't build them all at once

| Layer | What | Status |
|---|---|---|
| **L0 Static layout** | `div`, `text`, flex direction/gap, style (background, color, font_size, weight, padding, border_radius, width, height) | works today (samples) |
| **L1 Components** | `button`, `input`, `icon`, `image`, `list` → mapped onto gpui-kit's component families | next |
| **L2 Layout systems** | multiple windows, split/dock panes | later |
| **L3 Behavior bindings** | `on_click: save_note` → named Rust actions/entities | the hard part |
| **L4 Theming** | design-tokens section (color scales, spacing) | later |

L3 is where the design matters most: YAML stays declarative. Interactive
nodes get *named bindings* to Rust handlers registered in a small registry.
State ownership stays in Rust entities; YAML only references names.

## Architecture rules

Learned from the highest-modularity studies in this wiki (Tailor 4/5, Bezel 4/5):

1. **gpui-free core, gpui-only renderer.** Schema + validation + tree model
   live in a pure crate, headless-testable in CI. Only `renderer.rs` imports
   gpui.
2. **Single source of truth.** One schema definition drives validation,
   editor autocomplete (JSON Schema export), and any future codegen — they
   can never diverge.
3. **Facade dependency.** Apps depend only on the gpui-kit facade; the gpui
   lineage is pinned once and never mixed.
4. **Agent-operable.** Ship an MCP server exposing `new` / `check` /
   `screenshot` so agents can scaffold and verify without a human.

## Key design decisions to make early

- **Interpreter vs codegen.** Interpreter (the samples) = hot-reload,
  dynamic. Codegen (Tailor's approach) = compile-time safety, full
  expressiveness. The hybrid — develop interpreted, `freeze` to Rust when a
  screen outgrows YAML — gives both from one schema.
- **Hot-reload mechanics.** File watcher → re-parse → rebuild the tree.
  Simple for L0 (the root view already re-renders from the config tree every
  frame). Retained state of interactive components is what makes L3 harder.
- **Strict validation.** `deny_unknown_fields` + YAML line numbers in
  errors. A typo'd `bockground` should fail at `ezgpui check`, not render
  silently wrong.

## Phasing

1. **Phase 1 (done):** static skeleton — the samples in this folder.
2. **Phase 2:** `ezgpui new` scaffold CLI + `check` with good errors.
3. **Phase 3:** hot-reload via file watcher.
4. **Phase 4:** L1 component mapping to gpui-kit.
5. **Phase 5:** L3 bindings + `freeze` codegen + MCP.

## Target-schema examples

One example `app.yaml` per studied GPUI app (18 files), written against
the target schema (L0–L3) and validated for YAML syntax. Each header
comment names the app, its source case doc, and which layers it
exercises.

| app | studygroup | the YAML shows |
|---|---|---|
| [bezel](examples/bezel.yaml) | ui | gallery of the component catalog; Brand re-hue, designed light/dark |
| [tailor](examples/tailor.yaml) | ui | Interface Builder: palette → real-component canvas → codegen preview; MCP tools |
| [cydonia](examples/cydonia.yaml) | multiagent | agent workspace: artifact sidebar, article/board/table views, feature toggles |
| [herdr](examples/herdr.yaml) | multiagent | daemon-painted terminals: layout-over-the-wire, host vitals, worktree rows |
| [wake](examples/wake.yaml) | multiagent | read-only historian: CJK search palette, transcript, resume-to-terminal, insights |
| [gupi](examples/gupi.yaml) | agent chat | Pi host: conversations, branch strip, activity stream, temporary chats |
| [necoder](examples/necoder.yaml) | agent chat | color-coded projects/threads, todo board, token-usage bar |
| [eide](examples/eide.yaml) | ide | launcher chrome + progress while code-server (webview) boots |
| [tide](examples/tide.yaml) | ide | Zed-git IDE: PR review, build panel, finder; schema-validated tokens |
| [ide](examples/ide.yaml) | ide | Zed-based IDE: activity bar, editor tabs, BYOK agent panel, preview, dock |
| [markion](examples/markion.yaml) | notes | four view modes over one markdown truth; slash palette |
| [fulgur](examples/fulgur.yaml) | notes | E2EE sync chrome: devices, theme packs, tab-sync |
| [waku](examples/waku.yaml) | agentic chat | sessions + composer, browser/terminal/repl right panel, usage meter |
| [ghostex](examples/ghostex.yaml) | poly | one chat tab per alive agent; gx-core Intent/selector wiring |
| [glass](examples/glass.yaml) | poly | browser-first fusion: browser tabs in sidebar, voice, local models |
| [rovar](examples/rovar.yaml) | other | design editor: canvas view node, layers, auto-layout inspector, export |
| [reviu](examples/reviu.yaml) | other | diff-centric review: changed files, hunk comments, agent chat |
| [zorca](examples/zorca.yaml) | other | ADE on Zed: worktree-per-agent rows, thread terminals, session restore |

The rule they all follow: **YAML owns the chrome, Rust owns the content** —
heavy top-level surfaces (editor, transcript, webview, terminal, canvas)
are `view:` nodes bound to Rust-registered components. The set doubles as
a survey: apps whose layout is local composition (ide, markion, rovar)
versus apps whose layout is data from elsewhere (herdr, eide) — the schema
handles both, by keeping the region shapes local and letting `view:`
nodes fill them.

## The feature layer

The same idea one level up — app features (commands, state, tasks,
integrations, settings) described in `features.yaml`, cross-validated
against the UI references: see [FEATURES.md](FEATURES.md) and one
manifest per app in [examples/features/](examples/features/).
