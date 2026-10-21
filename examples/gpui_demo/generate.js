// @fractaldesign/fsgui - Demo Token Generator
// Generates tokens.rs for the GPUI demo app

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '../../dist/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, 'src/tokens.rs');

const { toRust } = defineConfig();
const rustCode = toRust();

writeFileSync(outputPath, rustCode, 'utf-8');
console.log(`[fsgui] Successfully generated GPUI tokens at: ${outputPath}`);
