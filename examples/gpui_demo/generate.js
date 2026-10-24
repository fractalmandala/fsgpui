// @fractaldesign/fsgui - Demo Token Generator
// Generates tokens.rs for the GPUI demo app and fsgpui-theme crate

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '../../dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const demoPath = resolve(__dirname, 'src/tokens.rs');
const cratePath = resolve(__dirname, '../../crates/fsgpui-theme/src/tokens.rs');

const { toRust } = defineConfig();
const rustCode = toRust();

mkdirSync(dirname(cratePath), { recursive: true });
writeFileSync(demoPath, rustCode, 'utf-8');
writeFileSync(cratePath, rustCode, 'utf-8');

console.log(`[fsgui] Successfully generated GPUI tokens at:\n - ${demoPath}\n - ${cratePath}`);
