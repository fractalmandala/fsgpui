# ezgpui — the feature layer (`features.yaml`)

The UI schema ([WORKFLOW.md](WORKFLOW.md)) describes presentation. This doc
conceptualizes the same kind of system one layer up: **app features also
described in YAML** — what exists, what connects to what, what triggers
what.

## Why the wiki says this works

- **Ghostex `gx-core`** — an entire feature layer with no gpui: Event-in /
  Effect-out, state read through selectors, injected clock. Desktop,
  mobile, web share it verbatim. A feature model can be platform-neutral.
- **Wake `wake-core` / necoder core crates / Tailor `model`** — all split
  "what features exist and do" (gpui-free) from "what they look like"
  (gpui). Tailor's document format already carries state/actions.
- **Cydonia** — runtime-toggleable features (`sessions`, `boards`,
  `tables`): a feature registry in the wild.
- **Herdr / Waku / Fulgur** — the app + daemon/server family: integrations
  are as much a part of the product as any pane.

And the UI examples already dangle the thread: every `on_click:`, `bind:`,
`source:`, `view:`, and `mcp: tools:` name in `examples/*.yaml` refers to
a feature that exists only as a name. The feature manifest is what defines
those names.

## The pipeline

```
app.yaml        → serde → node tree      → renderer  → pixels   (presentation)
features.yaml   → serde → feature graph  → registry  → wiring   (behavior)
                    ↑ ezgpui check: every UI ref resolves to a feature
```

## The layered schema

| Layer | Describes | Maps to |
|---|---|---|
| **F0 Commands** | named actions, keybindings, palette/menus | gpui-actions |
| **F1 State** | entities, ownership, persistence, subscriptions | gpui-entities |
| **F2 Data flow** | sources feeding list/bind contracts | — |
| **F3 Tasks** | background tasks: startup / interval / event / manual | gpui-async |
| **F4 Integrations** | MCP tools, agents, daemons, protocols, child processes | the app+daemon family |
| **F5 Settings & flags** | settings schema, runtime toggles | cydonia toggles |

## What a feature declares

```yaml
features:
  sessions:
    state:            # F1 — shapes and persistence, not logic
      active: SessionId
      list: { type: List<Session>, persisted: sqlite }
    commands:         # F0 — generates keymap + palette entries
      new: { key: "cmd-n", menu: "File" }
      open: { args: [id] }
    views:            # view nodes this feature owns (UI `view:` refs)
      - "transcript.active"
    sources:          # list sources it provides (UI `source:` refs)
      - "sessions.active"
    tasks:            # F3
      rescan: { trigger: { event: "fs.change" }, runs: "session.rescan" }
    mcp:              # F4 — tools agents can call
      - "session.open"
    toggleable: true  # F5 — cydonia-style runtime toggle
```

## The cross-validation contract (`ezgpui check`)

Single source of truth, Tailor's rule at feature level:

- every UI `on_click: X(…)` resolves to a declared command, arity included
- every UI `bind: path` falls inside some feature's `state:`
- every UI `source:` / `view:` is declared by exactly one feature
- keymap, palette, settings pages, MCP tool lists, and docs are
  **generated from the manifest**, never hand-written — they cannot drift
- the scaffold emits Rust handler **stubs** per feature, so names are
  registered before they are implemented

## The boundary (the honest limit)

Features contain logic, and the moment YAML expresses logic it becomes a
bad programming language. The line:

> **YAML owns the wiring, Rust owns the behavior.**

What exists, what connects, what triggers what — declarative. The bodies
of handlers, effect performers, and state transitions — Rust. State
machines may be declared; transition bodies may not. Features likely want
`feature freeze` (codegen to real crates) earlier than UI does, because
their logic density is higher.

## Examples

One `features.yaml` per studied app in `examples/features/` — same set as
the UI examples, cross-referenced with them:

| app | the features.yaml shows |
|---|---|
| [cydonia](features/cydonia.yaml) | toggleable artifacts, ACP agents, app-as-MCP-server |
| [waku](features/waku.yaml) | 16-feature control plane: sessions→updater, JS REPL, computer-use |
| [ide](features/ide.yaml) | BYOK providers as settings schema, browser preview toggle |
| [bezel](features/bezel.yaml) | a library's features: catalog sections, theme, visual-regression harness |
| [eide](features/eide.yaml) | child-process lifecycle: code-server health poll, 90s timeout, VSIX fetch |
| [gupi](features/gupi.yaml) | host-not-agent: pi process management, tray, onboarding, i18n |
| [herdr](features/herdr.yaml) | daemon integrations: local/SSH connect, boot-ID commands, tint constants |
| [tide](features/tide.yaml) | IDE feature set incl. schema-validated theming as a checked task |
| [necoder](features/necoder.yaml) | one-shot rate-limit reads (no tokens, no polling), parse-only MCP registry |
| [rovar](features/rovar.yaml) | design engine: auto-layout, components, export, collab server |
| [tailor](features/tailor.yaml) | the builder itself: palette/canvas/inspector/codegen + headless build |
| [zorca](features/zorca.yaml) | worktree-per-agent workspaces, session restore, deploy-hash SSH |
| [glass](features/glass.yaml) | surface fusion: browser-first, voice, local models, node runtime |
| [markion](features/markion.yaml) | four modes over one truth; updater refuses while dirty |
| [fulgur](features/fulgur.yaml) | E2EE sync: keychain keys, multi-server, zero-knowledge |
| [ghostex](features/ghostex.yaml) | gx-core wiring: intents in, effects out, selectors read |
| [reviu](features/reviu.yaml) | review-first: diff/hunk comments, git workflows, ACP chat |
| [wake](features/wake.yaml) | read-only historian: adapter-per-agent, watcher, resume handoff |
