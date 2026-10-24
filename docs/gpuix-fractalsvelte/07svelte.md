# Svelte

gpuix-fractalsvelte currently uses a fixed vendored version of Svelte from the tarball at `vendor/gpuix-fractalsvelte/vendor`.
24th Oct 3:20PM IST

We are going to try and move it to regular Svelte, and see if we can lose the dependency on vendored copy.
Because regular Svelte 5 operates through document.createElement, template.cloneNode, node.appendChild, and addEventListener, we provide a lightweight Headless Micro-DOM shim that intercepts these calls and flushes them to @gpuix/native's applyBatch(...).

Regular Svelte 5 would emit:

```ts
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<div class="app"><div class="card">...</div></div>`);

export default function App($$anchor) {
    let count = $.state(0);
    var div = root();
    var div_1 = $.child(div);
    // ...
    $.template_effect(() => $.set_text(text, $.get(count)));
    $.delegated('click', div_4, () => $.update(count, -1));
    $.append($$anchor, div);
}
```

## Trying at Gpuix-fs-appone

Step 1: Install Official Svelte from npm
This installs official svelte@5.57.2 directly into your top-level node_modules/svelte.

```sh
cd /Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone
bun add svelte@latest
```

Step 2: Clean Up tsconfig.json
Remove the path redirection that was pinning Svelte to the nested vendored package.
Delete this from the tsconfig.json:

```json
"paths": {
	"svelte": ["./node_modules/gpuix-fractalsvelte/node_modules/svelte"],
	"svelte/*": ["./node_modules/gpuix-fractalsvelte/node_modules/svelte/*"]
}
```

Step 3: The Micro-DOM Bridge (gpui-dom.ts)
Instead of needing a heavy browser, Svelte 5 only requires a handful of DOM primitives:

- document.createElement(tag)
- document.createTextNode(text)
- document.createComment(text)
- document.createElement('template') (for $.from_html, providing .innerHTML and .content.cloneNode(true))
- node.appendChild, node.insertBefore, node.removeChild
- node.addEventListener(type, fn)
- element.setAttribute, element.style, element.className

When Svelte performs any of these actions, gpui-dom.ts translates them 1:1 into @gpuix/native's mutation batch:

```ts
// Example: when Svelte appends a child
appendChild(child) {
    super.appendChild(child);
    nativeRenderer.applyBatch([{
        op: 'insertChild',
        parentId: this.nativeId,
        childId: child.nativeId
    }]);
}
```

Step 4: The Standard Svelte Compiler Plugin
In regular Svelte, compiling .svelte is standard:

```ts
import { compile } from 'svelte/compiler';

const { js } = compile(source, {
    filename: path,
    generate: 'client', // standard client DOM code!
    runes: true
});
```

Step 5: Mount with Standard Svelte mount()
In your entry app.ts:

```ts
import './gpui-dom.js'; // installs global window & document hooked to @gpuix/native
import { mount } from 'svelte';
import App from './App.svelte';

// Standard official Svelte 5 mount!
mount(App, {
    target: document.body
});
```