import { initGpuiDom, registerCSS, setEventFlush, ensureEventSymbol } from './gpui-dom.ts';
import { compile } from 'svelte/compiler';
import { readFileSync, writeFileSync, watch, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';

// 1. Initialize GPUI Headless DOM and window
const { doc, renderer } = initGpuiDom({
  title: 'Regular Svelte 5 + GPUI-DOM',
  width: 640,
  height: 480
});

// Ensure Svelte 5 delegated event symbol is trapped on GpuixElement
await ensureEventSymbol();

// 2. Load standard Svelte 5 client mount & unmount
const sveltePkg = createRequire(import.meta.url).resolve('svelte/package.json');
const clientUrl = new URL('./src/index-client.js', 'file://' + sveltePkg).href;
const { mount, unmount, flushSync } = await import(clientUrl);
setEventFlush(flushSync);

const svelteFile = fileURLToPath(new URL('./App.svelte', import.meta.url));
let currentInstance: any = null;
let anchor = doc.createComment('');
doc.body.appendChild(anchor);

// Use a single compiled artifact in .cache with URL query cache-busting
const cacheDir = resolve('./.cache');
if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
const compiledFile = resolve(cacheDir, 'App.compiled.js');
const compiledUrl = pathToFileURL(compiledFile).href;

let reloadVersion = 0;

async function loadAndMount() {
  try {
    const source = readFileSync(svelteFile, 'utf8');
    const { js, css } = compile(source, {
      filename: svelteFile,
      generate: 'client',
      runes: true
    });

    if (css?.code) {
      registerCSS(css.code);
    }

    if (currentInstance) {
      try { unmount(currentInstance); } catch {}
      currentInstance = null;
    }

    writeFileSync(compiledFile, js.code);
    const mod = await import(`${compiledUrl}?v=${++reloadVersion}`);

    currentInstance = mount(mod.default, {
      target: doc.body,
      anchor
    });
    flushSync();
    console.log(`[gpui-dom] App.svelte mounted (v${reloadVersion})`);
  } catch (err: any) {
    console.error('[gpui-dom] Mount / reload error:', err.message);
  }
}

await loadAndMount();

// 3. Hot Reload: Watch App.svelte for changes
let reloadTimer: NodeJS.Timeout | null = null;
watch(svelteFile, (event) => {
  if (event === 'change' || event === 'rename') {
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(async () => {
      console.log('[gpui-dom] App.svelte changed on disk — hot reloading...');
      await loadAndMount();
    }, 50);
  }
});
