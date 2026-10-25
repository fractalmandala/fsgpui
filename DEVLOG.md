# Devlog

Log of all tasks and development activity in "gpuix-fractalsvelte enhancement project".
See [AGENTS](packages/fsgpui/vendor/gpuix-fractalsvelte/AGENTS.md) for "gpuix-fractalsvelte enhancement project"

[x] Renamed gpuix-svelte to gpuix-fractalsvelte
[x] Scaffolded demo app via gpuix-fractalsvelte - `fsgpui/examples/gpuix-fs-appone`
[x] Moving gpuix-fractalsvelte to regular Svelte 5 - initiation done
[x] Preparing CSS Vars & dynamic theming support
[x] Hot reload artifact accumulation resolved
[ ] Applying/enabling fractalstyler
[x] Compound class selector matching in gpuix-dom
[x] Porting selector matching into gpui-dom
[ ] Custom header with native traffic lights
[ ] Reconcile fsgpui / gpuix-fractalsvelte sources of truth
[ ] Decide gpui-svelte synergy vs competing runtime path
[x] Calibrating gpuix-fractalsvelte (pre-clean)

## Devlogs

Devlog documents capture tasks, task assignments, goals, goal definitions, and the log of events and development:

1. [Moving gpuix-fractalsvelte to regular Svelte 5](./devlogs/moving-to-regular-svelte-5.md)
2. [Preparing CSS Vars](./devlogs/preparing-css-vars.md)
3. [App Hot Reload Terror](./devlogs/hot-reload-terror.md)
4. [Applying Fractalstyler](./devlogs/applying-fractalstyler.md)
5. [Compound Class Selector Matching](./devlogs/compound-class-selector-matching.md)
6. [Porting Selector Matching Into gpui-dom](./devlogs/porting-selector-matching-into-gpui-dom.md)
7. [Custom Header With Native Traffic Lights](./devlogs/custom-header-with-native-traffic-lights.md)
8. [FSGPUI and gpuix-fractalsvelte Overlap](./devlogs/fsgpui-gpuix-fractalsvelte-overlap.md)
9. [gpui-svelte Synergies](./devlogs/gpui-svelte-synergies.md)
10. [Calibrating Gpuix-Fractalsvelte](./devlogs/calibrating-gpuix-fractalsvelte.md)
11. [Regular Svelte vs the Custom Renderer](./devlogs/regular-svelte-vs-custom-renderer.md)

## Applying Fractalstyler

Objective 1 - validating that gpuix-fs-appone can load custom tokens and values, and apply them.
Objective 2 - validating this scales to gpuix-fractalsvelte