---
title: Scaffold GPUIX Fractalsvelte
description: This guide walks you through scaffolding and running a native GPUI Svelte application using the local vendor copy.
---

Local vendor copy located at:
`/Users/amrit/fractaldesign/packages/fsgpui/vendor/gpuix-fractalsvelte`

Instead of running:
```bash
npm create gpuix-svelte@latest my-app
cd my-app
npm install
npm start
```

Follow the step-by-step instructions below.

---

## 1. Prerequisites & Vendor Setup

Make sure you have **Node >= 24** or **Bun >= 1.4** installed.

The local vendor directory must have its dependencies installed once (this unpacks the vendored Svelte build and downloads `@gpuix/native` binaries):

```bash
cd /Users/amrit/fractaldesign/packages/fsgpui/vendor/gpuix-fractalsvelte
bun install
```

> **Note:** If you plan to run your app with Node rather than Bun, compile the vendor library's TypeScript output once:
> ```bash
> cd /Users/amrit/fractaldesign/packages/fsgpui/vendor/gpuix-fractalsvelte
> node scripts/publish.ts pack /tmp/gpuix-pack
> ```

---

## 2. Scaffold the Project

Choose either **Option A** (local CLI scaffolder) or **Option B** (direct copy).

### Option A: Using the Local Scaffolder Script

Run the built-in scaffolder script pointing to your new app directory:

```bash
node /Users/amrit/fractaldesign/packages/fsgpui/vendor/gpuix-fractalsvelte/packages/create-gpuix-svelte/index.js my-app
cd my-app
```

### Option B: Copying the Starter Template Directly

Copy the starter template directory:

```bash
mkdir my-app
cp -R /Users/amrit/fractaldesign/packages/fsgpui/vendor/gpuix-fractalsvelte/starter/ my-app/
cd my-app
```

---

## 3. Link `package.json` to the Local Vendor

Open `my-app/package.json` and update the `gpuix-fractalsvelte` dependency to reference your local vendor path:

```json
{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "start": "gpuix-fractalsvelte app.ts",
    "test": "gpuix-fractalsvelte test.ts",
    "build": "bun build.ts",
    "typecheck": "tsc --noEmit && svelte-check --diagnostic-sources js,svelte --fail-on-warnings"
  },
  "dependencies": {
    "gpuix-fractalsvelte": "file:/Users/amrit/fractaldesign/packages/fsgpui/vendor/gpuix-fractalsvelte"
  },
  "devDependencies": {
    "@types/bun": "^1.4.3",
    "@types/node": "^26.6.5",
    "svelte-check": "^4.7.6",
    "typescript": "^5.9.3"
  }
}
```

> If you packed a `.tgz` in Step 1 for Node, point to that tarball instead:
> `"gpuix-fractalsvelte": "file:/tmp/gpuix-pack/gpuix-fractalsvelte-0.2.0.tgz"`

---

## 4. Install Dependencies

Install dependencies in your new project folder:

```bash
# Recommended (fastest, supports TypeScript out of the box):
bun install

# Or with npm:
npm install
```

---

## 5. Verify `tsconfig.json`

Ensure your `my-app/tsconfig.json` resolves the vendored Svelte build from the installed package:

```json
{
  "compilerOptions": {
    "target": "esnext",
    "lib": ["esnext"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "customConditions": ["custom-renderer", "development"],
    "types": ["node", "gpuix-fractalsvelte/html"],
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "paths": {
      "svelte": ["./node_modules/gpuix-fractalsvelte/node_modules/svelte"],
      "svelte/*": ["./node_modules/gpuix-fractalsvelte/node_modules/svelte/*"]
    }
  },
  "svelteOptions": { "namespace": "gpuixHTML" },
  "include": ["*.ts", "*.svelte"]
}
```

---

## 6. Run Your App

Start the development runner:

```bash
npm start
# or:
bun run start
```

### What Happens:
1. `gpuix-fractalsvelte` starts Node/Bun with `--conditions custom-renderer --conditions development`.
2. It mounts `app.ts` and renders `App.svelte` directly into a GPU-accelerated GPUI desktop window (via Metal on macOS).
3. Any edits made to `App.svelte` will hot-reload in real time without refreshing or restarting the process.
