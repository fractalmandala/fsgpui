import { existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const SRC = `${DIR}window-drag-shim.m`;
const DYLIB = `${DIR}.window-drag-shim.dylib`;

let drag: (() => void) | null = null;

export async function init_window_drag() {
	if (process.platform !== 'darwin') return;

	try {
		if (!existsSync(DYLIB) || statSync(DYLIB).mtimeMs < statSync(SRC).mtimeMs) {
			execFileSync('clang', ['-dynamiclib', '-fobjc-arc', '-framework', 'AppKit', '-o', DYLIB, SRC]);
		}

		const ffiModule = (process.versions as Record<string, string | undefined>).bun ? 'bun:ffi' : 'node:ffi';
		const ffi: any = await import(ffiModule);

		if ((process.versions as Record<string, string | undefined>).bun) {
			const lib = ffi.dlopen(DYLIB, {
				gpuix_chrome_init: { args: [], returns: 'void' },
				gpuix_window_drag: { args: [], returns: 'void' }
			});
			lib.symbols.gpuix_chrome_init();
			drag = () => lib.symbols.gpuix_window_drag();
		} else {
			const { functions } = ffi.dlopen(DYLIB, {
				gpuix_chrome_init: { arguments: [], return: 'void' },
				gpuix_window_drag: { arguments: [], return: 'void' }
			});
			functions.gpuix_chrome_init();
			drag = () => functions.gpuix_window_drag();
		}
	} catch (err) {
		console.warn('[gpuix-fs-appone] window drag unavailable:', (err as Error).message);
	}
}

export function drag_window() {
	drag?.();
}
