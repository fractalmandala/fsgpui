import { initGpuiDom, registerCSS, setEventFlush, ensureEventSymbol } from './gpui-dom.ts';
import { load_styles } from './src/lib/styles/load.ts';
import { init_window_drag } from './src/lib/chrome/window-drag.ts';
import { compile } from 'svelte/compiler';
import { readFileSync, writeFileSync, watch, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire, registerHooks } from 'node:module';

// 1. Initialize GPUI Headless DOM and window
const { doc, renderer } = initGpuiDom({
  title: 'Regular Svelte 5 + GPUI-DOM',
  width: 640,
  height: 480,
  titlebarTransparent: true,
  trafficLightX: 16,
  trafficLightY: 14
});

await init_window_drag();

// Ensure Svelte 5 delegated event symbol is trapped on GpuixElement
await ensureEventSymbol();

// Activate the fractalstyler tokens and classes from src/lib/styles.
load_styles();

// 2. Load standard Svelte 5 client mount & unmount
const sveltePkg = createRequire(import.meta.url).resolve('svelte/package.json');
const clientUrl = new URL('./src/index-client.js', 'file://' + sveltePkg).href;
const { mount, unmount, flushSync } = await import(clientUrl);
setEventFlush(flushSync);

const IMPORT_RE = /((?:from|import)\s*\(?\s*['"])(\.\.?\/[^'"]+)(['"])/g;
let compileVersion = 0;

/** The compiled root lives in .cache, so relative imports become absolute file URLs. */
function bust_svelte_imports(code: string, file: string, version: number) {
  return code.replace(IMPORT_RE, (_match, pre: string, rel: string, post: string) => {
    const url = pathToFileURL(resolve(dirname(file), rel));
    if (rel.split('?')[0].endsWith('.svelte')) url.searchParams.set('v', String(version));
    return `${pre}${url.href}${post}`;
  });
}

// Child .svelte imports miss the root compile below, so compile them on load.
registerHooks({
  load(url, context, nextLoad) {
    if (!url.split('?')[0].endsWith('.svelte')) return nextLoad(url, context);
    const path = fileURLToPath(url);
    const source = readFileSync(path, 'utf8');
    const { js, css } = compile(source, { filename: path, generate: 'client', runes: true });
    if (css?.code) registerCSS(css.code);
    return { format: 'module', source: bust_svelte_imports(js.code, path, compileVersion), shortCircuit: true };
  }
});

const svelteFile = fileURLToPath(new URL('./src/App.svelte', import.meta.url));
let currentInstance: any = null;
let anchor = doc.createComment('');
doc.body.appendChild(anchor);

// Use a single compiled artifact in .cache with URL query cache-busting
const cacheDir = resolve('./.cache');
if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
const compiledFile = resolve(cacheDir, 'App.compiled.js');
const compiledUrl = pathToFileURL(compiledFile).href;

async function loadAndMount() {
  try {
    const version = ++compileVersion;
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

    js.code = bust_svelte_imports(js.code, svelteFile, version);

    writeFileSync(compiledFile, js.code);
    const mod = await import(`${compiledUrl}?v=${version}`);
    currentInstance = mount(mod.default, {
      target: doc.body,
      anchor
    });
    flushSync();
    console.log(`[gpui-dom] App.svelte mounted (v${version})`);
  } catch (err: any) {
    console.error('[gpui-dom] Mount / reload error:', err.stack ?? err.message);
  }
}

await loadAndMount();

// 3. Hot Reload: watch every component under src.
let reloadTimer: NodeJS.Timeout | null = null;
watch(dirname(svelteFile), { recursive: true }, (_event, file) => {
  if (!file || !file.endsWith('.svelte')) return;
  if (reloadTimer) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(async () => {
    console.log(`[gpui-dom] ${file} changed on disk — hot reloading...`);
    await loadAndMount();
  }, 50);
});
