# gpuix-fractalsvelte starter

The smallest project that consumes `gpuix-fractalsvelte` from npm: a counter in a native GPUI window.
`npm create gpuix-fractalsvelte@latest` copies it into a new directory; then:

```bash
npm install          # gpuix-fractalsvelte brings its own Svelte build
npm start            # opens the window; edit App.svelte and save to hot-reload
npm test             # headless: mounts App.svelte, clicks through GPUI's real hit testing
npm run typecheck    # tsc --noEmit, then svelte-check over App.svelte against GPUI's element types
npm run build        # dist/app (dist/app.exe on Windows), one executable for this platform; needs Bun
```

AGENTS! Read `AGENTS.md`. You too, Claude.

Every script runs through the `gpuix-fractalsvelte` bin, which starts Node (or Bun, under
`bun run start` / `gpuix-fractalsvelte --bun app.ts`) with the module conditions Svelte's custom
renderer needs and the `.svelte` loader installed. Spelled out:

```bash
node --conditions custom-renderer --conditions development --import gpuix-fractalsvelte/register app.ts
bun  --conditions custom-renderer --conditions development --preload gpuix-fractalsvelte/plugin app.ts
```

`bunfig.toml` carries the same preload for ad-hoc `bun file.ts` runs.

## Files

- `app.ts` — the entry: `render_hot` opens the window and remounts `App.svelte` on every save.
- `App.svelte` — the component. Styling is a `<style>` block of class rules; see
  [docs/styling.md](../../docs/gpuix-fractalsvelte/02styling.md) for what
  CSS reaches GPUI.
- `standalone.ts` and `build.ts` — `npm run build` compiles `standalone.ts` into one executable
  with Bun. It is built for the machine it runs on, so build on macOS, Windows and Linux in turn
  (a CI matrix, say) to ship all three.
- `test.ts` — a headless test through `gpuix-fractalsvelte/test`; plain script, exits 1 on failure.
  Runs on macOS and Windows, where the headless renderer is built.
- `svelte.d.ts` — declares `*.svelte` modules for `tsc`.
- `tsconfig.json` — `nodenext`, and a `paths` entry so `tsc` finds the Svelte that is nested
  inside the package.
  `svelteOptions.namespace` and the `gpuix-fractalsvelte/html` type entry make the editor and
  svelte-check type `App.svelte`'s markup as GPUI elements rather than DOM ones.
- `AGENTS.md` — instructions for coding agents, pointing at the docs' `llms.txt`; `CLAUDE.md`
  imports it for Claude Code.
- `svelte.config.js` — editor and svelte-check only: switches off Svelte's DOM a11y advice.

Needs Node >= 24 or Bun >= 1.4.

## Themeing

```svelte
<script>
  import { set_css_vars } from 'gpuix-fractalsvelte';

  const LIGHT = { surface: '#fbf7ef', ink: '#2a251f', border: '#e2d8c4' };
  const DARK = { surface: '#231f1b', ink: '#ece3d3', border: '#36302a' };
  let { dark } = $props();

  $effect(() => set_css_vars(dark ? DARK : LIGHT));
</script>

<div class="card">…</div>

<style>
  .card { background-color: var(--surface); color: var(--ink); border-color: var(--border); }
  .card:hover { border-color: var(--ink); }
  .badge { padding: var(--badge-pad, 2px 6px); }
</style>
```