/**
 * Compiles this folder's Sass into GPUI classes and tokens.
 *
 * The Sass tokens are CSS custom properties in `--kebab-case`; GPUI's var map
 * uses `bgSurface`-style names (see devlogs/applying-fractalstyler.md), so every
 * name is camel-cased here. Token values are resolved once (`rem`, `calc`,
 * `clamp`, nested `var()`) because GPUI understands neither `calc` nor `clamp`.
 * Colour rules keep their `var()`s, so `set_css_vars` still repaints them live.
 */

import { fileURLToPath } from 'node:url';
import { compile } from 'sass';
import { registerCSS, set_css_vars } from '../../../gpui-dom.ts';

const ENTRY = fileURLToPath(new URL('./index.sass', import.meta.url));
const ROOT_PX = 16;

const camel = (name: string) =>
	name.replace(/^--/, '').replace(/-([a-z0-9])/gi, (_, c: string) => (/[0-9]/.test(c) ? c : c.toUpperCase()));

const find_call = (value: string, name: string, from = 0): [number, number] | null => {
	const start = value.indexOf(`${name}(`, from);
	if (start === -1) return null;
	let depth = 0;
	for (let i = start + name.length; i < value.length; i++) {
		if (value[i] === '(') depth++;
		else if (value[i] === ')' && --depth === 0) return [start, i + 1];
	}
	return null;
};

const substitute = (value: string, lookup: (name: string) => string | undefined, depth = 0): string => {
	if (depth > 16) return value;
	let out = value;
	let from = 0;
	for (;;) {
		const call = find_call(out, 'var', from);
		if (!call) return out;
		const inner = out.slice(call[0] + 4, call[1] - 1);
		const comma = inner.indexOf(',');
		const name = (comma === -1 ? inner : inner.slice(0, comma)).trim().replace(/^--/, '');
		const found = lookup(name);
		let replacement: string | undefined;
		if (found !== undefined) replacement = substitute(found, lookup, depth + 1);
		else if (comma !== -1) replacement = substitute(inner.slice(comma + 1).trim(), lookup, depth + 1);
		if (replacement === undefined) {
			from = call[1];
			continue;
		}
		out = out.slice(0, call[0]) + replacement + out.slice(call[1]);
		from = call[0] + replacement.length;
	}
};

type Q = { n: number; unit: '' | 'px' };

const arith = (expr: string, base: number): Q | null => {
	const tokens = expr.match(/-?\d*\.?\d+(?:px|rem|em)?|[-+*/()]/g);
	if (!tokens || tokens.join('').length !== expr.replace(/\s+/g, '').replace(/calc\(/g, '(').length) return null;
	let i = 0;

	const atom = (): Q | null => {
		const t = tokens[i++];
		if (t === undefined) return null;
		if (t === '(') {
			const v = sum();
			if (tokens[i++] !== ')') return null;
			return v;
		}
		const m = /^(-?\d*\.?\d+)(px|rem|em)?$/.exec(t);
		if (!m) return null;
		const n = parseFloat(m[1]);
		if (m[2] === 'rem' || m[2] === 'em') return { n: n * base, unit: 'px' };
		return { n, unit: m[2] === 'px' ? 'px' : '' };
	};

	const product = (): Q | null => {
		let left = atom();
		while (left && (tokens[i] === '*' || tokens[i] === '/')) {
			const op = tokens[i++];
			const right = atom();
			if (!right) return null;
			if (op === '*') {
				if (left.unit && right.unit) return null;
				left = { n: left.n * right.n, unit: left.unit || right.unit };
			} else {
				if (right.unit || right.n === 0) return null;
				left = { n: left.n / right.n, unit: left.unit };
			}
		}
		return left;
	};

	const sum = (): Q | null => {
		let left = product();
		while (left && (tokens[i] === '+' || tokens[i] === '-')) {
			const op = tokens[i++];
			const right = product();
			if (!right) return null;
			const unit = left.unit || right.unit;
			if (left.unit !== right.unit && left.n !== 0 && right.n !== 0) return null;
			left = { n: op === '+' ? left.n + right.n : left.n - right.n, unit };
		}
		return left;
	};

	const out = sum();
	return out && i === tokens.length ? out : null;
};

const reduce = (value: string, base = ROOT_PX): string => {
	let out = value;

	// GPUI has no viewport units: use the clamp's upper bound.
	for (;;) {
		const call = find_call(out, 'clamp');
		if (!call) break;
		const args = out.slice(call[0] + 6, call[1] - 1).split(/,(?![^(]*\))/);
		const pick = (args[args.length - 1] ?? '').trim();
		out = out.slice(0, call[0]) + pick + out.slice(call[1]);
	}

	let from = 0;
	for (;;) {
		const call = find_call(out, 'calc', from);
		if (!call) break;
		const q = arith(out.slice(call[0] + 5, call[1] - 1), base);
		if (!q) {
			from = call[1];
			continue;
		}
		const text = `${Math.round(q.n * 1000) / 1000}${q.unit}`;
		out = out.slice(0, call[0]) + text + out.slice(call[1]);
		from = call[0] + text.length;
	}

	return out.replace(/(^|[\s(,])(-?\d*\.?\d+)r?em\b/g, (_, pre: string, n: string) => `${pre}${Math.round(parseFloat(n) * base * 1000) / 1000}px`);
};

/** Every custom property in the compiled sheet, resolved to something GPUI can read. */
const tokens = (css: string) => {
	const raw = new Map<string, string>();
	for (const m of css.matchAll(/--([\w-]+)\s*:\s*([^;{}]+)/g)) raw.set(m[1], m[2].trim());

	const out: Record<string, string> = {};
	for (const [name, value] of raw) out[camel(name)] = reduce(substitute(value, (n) => raw.get(n)));
	return out;
};

let loaded = false;

export function load_styles() {
	if (loaded) return;
	loaded = true;

	const css = compile(ENTRY, { style: 'expanded', charset: false, logger: { warn() {}, debug() {} } }).css;
	set_css_vars(tokens(css));
	registerCSS(css.replace(/var\(\s*--([\w-]+)/g, (_, name: string) => `var(--${camel(name)}`));
}
