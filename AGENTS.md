# AGENTS.md

FSGPUI is a project driving integration between Svelte and GPUI, via fractalsvelte.

The current testing and demo app is `gpuix-fs-appone` at `examples/gpuix-fs-appone`.
The current status is that initial demo window at Svelte 5, without vendored Svelte copy, is working.

> The objectives we are pursuing:
1. Removing the need to vendor specific Svelte version, and using regular Svelte 5 instead, for gpuix-fractalsvelte apps.
2. Incorporating `fractalstyler` into gpuix-fractalsvelte.

**Always See `DEVLOG.md` for details.**

## Rules

### 1. Devlogging

Every code editing/adding/removing, every feature, every addition, every activity must be logged. Tasks are opened from DEVLOG, list is managed there, and each work stream or session is logged in a document of its own at `devlogs/` folder. 

### 2. Responsibilities

User opens tasks from description/listing in DEVLOG, or
User opens task by creating doc in `devlogs/` and adding task description.

⭐ Agents run tasks, must maintain DEVLOG and `devlogs/`.
⭐ Always maintain `README` of the experimental demo app up to date - `fsgpui/examples/gpuix-fs-appone/README.md`

### 3. Verification

Agents must use `/Users/amrit/ars-docs/alldocs/90skills/create-verification-skill` create verification skill, and use verification tests to validate work before presenting it. Do not proceed if you do not have a verification locked for the work.

⭐ Maintain indexed list of created skills at [Verification Skills Index](alldocs/04canonicals/verification-skills-index.md).
⭐ Always check index if skills/test already exist for your work.

Create skills in this folder - `/Users/amrit/ars-docs/alldocs/90skills`.

### 4. Markdown and YAML

All docs in `devlogs/` folder must have YAML frontmatter:

```YAML
---
title:
description:
---
```

⭐ Do not add `#` H1 title in documents. Do not begin with any headings. 
⭐ Linking should be `[linked text](/relative-path-to-item)`. Do not use `[[` backlinking system.


## Gpuix-fractalsvelte Docs

- [Overview](./docs/gpuix-fractalsvelte/01overview.md): what the package is, setup, how it differs from Svelte on the web, TypeScript config
- [Styling](./docs/gpuix-fractalsvelte/02styling.md): every CSS property and value GPUI accepts, what is dropped, theming with var() and set_css_vars
- [Components](./docs/gpuix-fractalsvelte/03components.md): Scroller (scrollbars, virtual lists), Portal (modals, menus, toasts), Tooltip, Popover and the native <anchored> they build on
- [Guide](./docs/gpuix-fractalsvelte/04guide.md): forms and inputs, keyboard shortcuts and focus, window and desktop helpers, state that survives hot reload
- [Testing](./docs/gpuix-fractalsvelte/06testing.md): headless tests through gpuix-svelte/test: mount, click, type, read back, screenshot; gpuix-svelte/automation drives a running window
- [Shipping](./docs/gpuix-fractalsvelte/05shipping.md): standalone binaries with Bun, macOS signing, running in a browser on WebGPU

