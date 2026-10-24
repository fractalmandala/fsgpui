---
title: App Hot Reload Terror
description: appcompile generation at each instance of save and hot reload
---

## Reported Issue

> On live server, at each instance of saving, a new appcompile file being generated! 18 files generated so far!!!
> 
> `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone/.App.compiled.1.js`  
> `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone/.App.compiled.2.js`  
> .....  
> `/Users/amrit/fractaldesign/packages/fsgpui/examples/gpuix-fs-appone/.App.compiled.18.js`  

---

## Root Cause Analysis

In `app.ts`, hot reloading was re-compiling `App.svelte` and writing a distinct versioned file on every disk change:
```ts
const compiledFile = `./.App.compiled.${++reloadVersion}.js`;
writeFileSync(compiledFile, js.code);
const mod = await import(`${compiledFile}`);
```

### Why Was This Done Initially?
In Node.js, the ES Module loader caches modules by their resolved specifier. If you write new code into the exact same file path (`./.App.compiled.js`) and call `import('./.App.compiled.js')` again, Node returns the cached module from the first import without re-evaluating the new code. The version suffix was originally added to bypass this module cache.

### The Problem
Generating versioned files (`.App.compiled.1.js` ... `.App.compiled.18.js`) without removing older files littered the project root with temporary build artifacts.

---

## Solution Implemented

### 1. Single-File Compilation with Query-String Cache Busting
Node.js's native ESM loader supports query parameters (e.g. `file:///path/to/file.js?v=2`) on `file://` URLs. The query string bypasses the module cache while pointing to the **exact same physical file on disk**.

In `app.ts`:
```ts
// Use a single compiled artifact in .cache with URL query cache-busting
const cacheDir = resolve('./.cache');
if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
const compiledFile = resolve(cacheDir, 'App.compiled.js');
const compiledUrl = pathToFileURL(compiledFile).href;

let reloadVersion = 0;

async function loadAndMount() {
  // ... compile Svelte code ...
  writeFileSync(compiledFile, js.code);
  const mod = await import(`${compiledUrl}?v=${++reloadVersion}`);
  // ... mount new instance ...
}
```

### 2. Isolated Cache Directory & Cleanup
- All temporary compilation artifacts are now scoped inside `.cache/` (e.g. `.cache/App.compiled.js`).
- Deleted all 18 accumulated `.App.compiled.*.js` and `.App.*` files from the project root.
- Added `.cache` and `.App.*` to `.gitignore`.

---

## Verification & Results

1. **Clean Root Directory**:
   - `ls .App*` in project root: **0 files** (clean).
   - `.cache/` contains **exactly 1 file**: `App.compiled.js`, overwritten on each save.
2. **Live In-Process Hot-Reload**:
   - Tested repeated edits: `App.svelte mounted (v1)`, `(v2)`, `(v3)` cleanly unmounts and remounts within 15ms.
   - Theme switching buttons (`light set` / `dark set`) and counter clicks maintain 100% reactivity across saves.
3. **Automated Verification Harness**:
   - Ran `verify.mjs`:
     - Doctor Diagnostic: **PASSED**
     - Button Reactivity (`0 -> 1 -> 0`): **PASSED**
     - Hot Reload: **PASSED**
