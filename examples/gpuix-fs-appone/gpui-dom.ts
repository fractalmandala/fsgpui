import { GpuixRenderer, type EventPayload, type WindowOptions } from 'gpuix-fractalsvelte/native';
import { build_style, define_css_vars } from 'gpuix-fractalsvelte';
import type { ClassRule, Pseudo } from 'gpuix-fractalsvelte';
import { createRequire } from 'node:module';

// GPUI mutation tuple type
export type Mutation =
  | ['createElement', number, string]
  | ['destroyElement', number]
  | ['appendChild', number, number]
  | ['insertBefore', number, number, number]
  | ['setStyle', number, any]
  | ['setText', number, string]
  | ['setEventListener', number, string, boolean]
  | ['setRoot', number]
  | ['setCustomProp', number, string, unknown];

let nativeRenderer: GpuixRenderer | null = null;
let nextId = 1;
export const nodesById = new Map<number, GpuixNode>();
const mutationQueue: Mutation[] = [];

let onEventFlush: (() => void) | null = null;
export function setEventFlush(fn: () => void) {
  onEventFlush = fn;
}

type StoredRule = ClassRule & { order: number };

const storedRules: StoredRule[] = [];
const warnedSelectors = new Set<string>();

const weight = (rule: StoredRule) => rule.classes.length * 2 + (rule.tag === null ? 0 : 1);

const closing = (css: string, open: number) => {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return i;
  }
  return -1;
};

function collect_blocks(css: string, out: Array<{ selector: string; body: string }>) {
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open === -1) break;
    const end = closing(css, open);
    if (end === -1) break;
    const pre = css.slice(i, open).trim();
    const body = css.slice(open + 1, end);
    if (/^@(media|supports|layer|container)\b/.test(pre)) collect_blocks(body, out);
    else if (!pre.startsWith('@')) out.push({ selector: pre, body });
    i = end + 1;
  }
}

function compile_selector(selector: string): Pick<StoredRule, 'classes' | 'tag' | 'pseudo'> | null {
  let s = selector.trim();
  let pseudo: Pseudo = null;

  const pseudo_match = /:(hover|active)$/.exec(s);
  if (pseudo_match) {
    pseudo = pseudo_match[1] as Pseudo;
    s = s.slice(0, -pseudo_match[0].length);
  }

  if (s === '*') return { classes: [], tag: null, pseudo };
  if (s.includes(':') || /[>+~\s]/.test(s)) return null;

  const match = /^([a-zA-Z][\w-]*)?((?:\.[\w-]+)*)$/.exec(s);
  if (!match) return null;

  const tag = match[1] ?? null;
  const classes = (match[2].match(/\.[\w-]+/g) ?? []).map((c) => c.slice(1));
  if (tag === null && classes.length === 0) return null;
  return { classes, tag, pseudo };
}

export function recomputeAllStyles() {
  // Update style for every materialized element
  for (const node of nodesById.values()) {
    if (node instanceof GpuixElement && node.isMaterialized && node.nativeId !== null) {
      node.updateComputedStyle();
    }
  }
  flushMutations();
}

export function registerCSS(cssCode: string) {
  const blocks: Array<{ selector: string; body: string }> = [];
  collect_blocks(cssCode.replace(/\/\*[\s\S]*?\*\//g, ''), blocks);

  for (const block of blocks) {
    if (block.body.includes('{')) {
      if (!warnedSelectors.has(block.selector)) {
        warnedSelectors.add(block.selector);
        console.warn(`[gpui-dom] \`${block.selector}\` has nested CSS; only flat rules reach GPUI`);
      }
      continue;
    }

    for (const part of block.selector.split(',')) {
      const compiled = compile_selector(part);
      if (!compiled) {
        const selector = part.trim();
        if (selector && !warnedSelectors.has(selector)) {
          warnedSelectors.add(selector);
          console.warn(`[gpui-dom] \`${selector}\` has no GPUI equivalent; only class and tag selectors, plus :hover/:active, reach GPUI`);
        }
        continue;
      }
      storedRules.push({ ...compiled, css: block.body.trim(), order: storedRules.length });
    }
  }

  storedRules.sort((a, b) => weight(a) - weight(b) || a.order - b.order);
  recomputeAllStyles();
}

export function set_css_vars(vars: Record<string, string | number | null>) {
  define_css_vars(vars);
  recomputeAllStyles();
}

export function flushMutations() {
  if (!nativeRenderer || mutationQueue.length === 0) return;
  const batch = mutationQueue.splice(0);
  const json = JSON.stringify(batch);
  nativeRenderer.applyBatch(json);
}

const g = globalThis as Record<string, any>;

function isConnectedToRoot(node: GpuixNode | null): boolean {
  let curr = node;
  while (curr) {
    if (curr === g.document?.body || curr === g.document) return true;
    curr = curr.parentNode;
  }
  return false;
}

const PROP_ALIASES = new Map<string, string>([
  ['objectfit', 'objectFit'],
  ['testid', 'testId'],
  ['minrows', 'minRows'],
  ['maxrows', 'maxRows'],
  ['showlinenumbers', 'showLineNumbers'],
  ['autofocus', 'autoFocus'],
  ['tabindex', 'tabIndex'],
]);

const prop_name = (name: string) => PROP_ALIASES.get(name.toLowerCase()) ?? name;

/** Attribute names GPUI consumes itself rather than through `setCustomProp`. */
const LOCAL_PROPS = new Set(['class', 'style', 'hover', 'active', 'hitbox', 'portal']);

function apply_props(node: GpuixElement) {
  if (node.nativeId === null) return;
  const seen = new Set<string>();
  for (const [key, value] of Object.entries(node.attributes)) {
    const name = prop_name(key);
    if (seen.has(name) || LOCAL_PROPS.has(name)) continue;
    seen.add(name);
    mutationQueue.push(['setCustomProp', node.nativeId, name, value]);
  }
}

function materialize(node: GpuixNode) {
  if (node.isMaterialized) return;

  if (node instanceof GpuixText) {
    const isBlank = /^\s*$/.test(node.data);
    if (!isBlank) {
      if (node.nativeId === null) {
        node.nativeId = nextId++;
      }
      nodesById.set(node.nativeId, node);
      node.isMaterialized = true;
      mutationQueue.push(['createElement', node.nativeId, 'text']);
      mutationQueue.push(['setText', node.nativeId, node.data]);
    }
    return;
  }

  if (node instanceof GpuixElement) {
    if (node.nativeId === null) {
      node.nativeId = nextId++;
    }
    nodesById.set(node.nativeId, node);
    node.isMaterialized = true;
    const gpuiType = node.tagName.toLowerCase() === 'body' ? 'div' : node.tagName.toLowerCase();
    mutationQueue.push(['createElement', node.nativeId, gpuiType]);

    // Apply styles
    node.updateComputedStyle();

    // Forward attributes GPUI knows: img src/objectFit/alt, input value, testId, …
    apply_props(node);

    // Apply listeners
    for (const evType of Object.keys(node.listeners)) {
      mutationQueue.push(['setEventListener', node.nativeId, evType, true]);
    }
    for (const evType of node._delegatedEvents) {
      mutationQueue.push(['setEventListener', node.nativeId, evType, true]);
    }

    // Recursively materialize all children and append them
    for (const child of node.childNodes) {
      materialize(child);
      if (child.isMaterialized && child.nativeId !== null) {
        mutationQueue.push(['appendChild', node.nativeId, child.nativeId]);
      }
    }
  }
}

function dematerialize(node: GpuixNode) {
  for (const child of node.childNodes) {
    dematerialize(child);
  }
  if (node.isMaterialized && node.nativeId !== null) {
    mutationQueue.push(['destroyElement', node.nativeId]);
    nodesById.delete(node.nativeId);
    node.isMaterialized = false;
  }
}

// 2. Headless DOM Node Hierarchy
export class GpuixNode {
  nativeId: number | null = null;
  isMaterialized: boolean = false;
  nodeType: number;
  parentNode: GpuixNode | null = null;
  childNodes: GpuixNode[] = [];
  ownerDocument = g.document;

  constructor(nodeType: number) {
    this.nodeType = nodeType;
  }

  get isConnected(): boolean {
    return isConnectedToRoot(this);
  }

  get firstChild(): GpuixNode | null {
    return this.childNodes[0] || null;
  }

  get nextSibling(): GpuixNode | null {
    if (!this.parentNode) return null;
    const idx = this.parentNode.childNodes.indexOf(this);
    return idx >= 0 && idx < this.parentNode.childNodes.length - 1
      ? this.parentNode.childNodes[idx + 1]
      : null;
  }

  appendChild<T extends GpuixNode>(child: T): T {
    if (child.nodeType === 11) { // DocumentFragment
      const toAdd = [...child.childNodes];
      child.childNodes = [];
      for (const c of toAdd) this.appendChild(c);
      return child;
    }
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.childNodes.push(child);

    if (isConnectedToRoot(this)) {
      materialize(child);
      if (this.isMaterialized && this.nativeId !== null && child.isMaterialized && child.nativeId !== null) {
        mutationQueue.push(['appendChild', this.nativeId, child.nativeId]);
        flushMutations();
      }
    }
    return child;
  }

  insertBefore<T extends GpuixNode>(newNode: T, refNode: GpuixNode | null): T {
    if (!refNode) return this.appendChild(newNode);
    if (newNode.nodeType === 11) {
      const toAdd = [...newNode.childNodes];
      newNode.childNodes = [];
      for (const c of toAdd) this.insertBefore(c, refNode);
      return newNode;
    }
    if (newNode.parentNode) newNode.parentNode.removeChild(newNode);
    const idx = this.childNodes.indexOf(refNode);
    if (idx >= 0) {
      newNode.parentNode = this;
      this.childNodes.splice(idx, 0, newNode);
    } else {
      return this.appendChild(newNode);
    }

    if (isConnectedToRoot(this)) {
      materialize(newNode);
      if (this.isMaterialized && this.nativeId !== null && newNode.isMaterialized && newNode.nativeId !== null) {
        let nextNative: GpuixNode | null = null;
        const start = this.childNodes.indexOf(newNode);
        for (let i = start + 1; i < this.childNodes.length; i++) {
          const s = this.childNodes[i];
          if (s.isMaterialized && s.nativeId !== null) {
            nextNative = s;
            break;
          }
        }
        if (nextNative && nextNative.nativeId !== null) {
          mutationQueue.push(['insertBefore', this.nativeId, newNode.nativeId, nextNative.nativeId]);
        } else {
          mutationQueue.push(['appendChild', this.nativeId, newNode.nativeId]);
        }
        flushMutations();
      }
    }
    return newNode;
  }

  removeChild<T extends GpuixNode>(child: T): T {
    const idx = this.childNodes.indexOf(child);
    if (idx >= 0) {
      this.childNodes.splice(idx, 1);
      child.parentNode = null;
      if (child.isMaterialized) {
        dematerialize(child);
        flushMutations();
      }
    }
    return child;
  }

  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }

  before(...nodes: GpuixNode[]) {
    if (this.parentNode) {
      for (const n of nodes) this.parentNode.insertBefore(n, this);
    }
  }

  cloneNode(deep = false): GpuixNode {
    const copy = this._cloneShallow();
    if (deep) {
      for (const c of this.childNodes) {
        copy.appendChild(c.cloneNode(true));
      }
    }
    return copy;
  }

  protected _cloneShallow(): GpuixNode {
    throw new Error('Not implemented');
  }
}

export class GpuixText extends GpuixNode {
  data: string;

  constructor(data = '') {
    super(3);
    this.data = data;
  }

  get nodeValue() { return this.data; }
  set nodeValue(val: string) {
    this.data = String(val);
    const isBlank = /^\s*$/.test(this.data);
    if (isConnectedToRoot(this)) {
      if (!isBlank && !this.isMaterialized) {
        materialize(this);
        if (this.parentNode && this.parentNode.isMaterialized && this.parentNode.nativeId !== null && this.nativeId !== null) {
          mutationQueue.push(['appendChild', this.parentNode.nativeId, this.nativeId]);
        }
      } else if (!isBlank && this.isMaterialized && this.nativeId !== null) {
        mutationQueue.push(['setText', this.nativeId, this.data]);
      } else if (isBlank && this.isMaterialized && this.nativeId !== null) {
        dematerialize(this);
      }
      flushMutations();
    }
  }

  get textContent() { return this.data; }
  set textContent(val: string) { this.nodeValue = val; }

  protected _cloneShallow() {
    return new GpuixText(this.data);
  }
}

export class GpuixComment extends GpuixNode {
  data: string;
  constructor(data = '') {
    super(8);
    this.data = data;
  }
  get nodeValue() { return this.data; }
  set nodeValue(v: string) { this.data = String(v); }
  get textContent() { return this.data; }
  set textContent(v: string) { this.data = String(v); }
  protected _cloneShallow() { return new GpuixComment(this.data); }
}

export class GpuixDocumentFragment extends GpuixNode {
  constructor() { super(11); }
  protected _cloneShallow() { return new GpuixDocumentFragment(); }
}

export class GpuixElement extends GpuixNode {
  tagName: string;
  attributes: Record<string, string> = {};
  listeners: Record<string, Array<(e: any) => void>> = {};
  style: any = {};
  _delegatedEvents = new Set<string>();
  _events?: Record<string, any>;
  _proxy?: any;

  constructor(tagName: string) {
    super(1);
    this.tagName = tagName.toUpperCase();
  }

  /** Svelte's attribute setter reads `nodeName` to detect custom elements. */
  get nodeName() {
    return this.tagName;
  }

  updateComputedStyle() {
    const classAttr = this.attributes['class'] || '';
    const classes = new Set(classAttr.split(/\s+/).filter(Boolean));
    const tag = this.tagName.toLowerCase();
    const rules = storedRules.filter(
      (rule) => (rule.tag === null || rule.tag === tag) && rule.classes.every((cls) => classes.has(cls))
    );

    let combined: any = {};
    if (this === g.document?.body) {
      combined = {
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative'
      };
    }

    this.style = { ...combined, ...build_style(this.attributes, rules) };
    if (this.isMaterialized && this.nativeId !== null) {
      mutationQueue.push(['setStyle', this.nativeId, this.style]);
    }
  }

  setAttribute(name: string, value: string) {
    this.attributes[name] = String(value);
    this.attributes[name.toLowerCase()] = String(value);
    if (name === 'style' || name === 'class') {
      this.updateComputedStyle();
      flushMutations();
    } else if (this.isMaterialized && this.nativeId !== null) {
      mutationQueue.push(['setCustomProp', this.nativeId, prop_name(name), value]);
      flushMutations();
    }
  }

  getAttribute(name: string) { return this.attributes[name] ?? null; }
  removeAttribute(name: string) { delete this.attributes[name]; }

  addEventListener(type: string, fn: (e: any) => void) {
    (this.listeners[type] ??= []).push(fn);
    if (this.isMaterialized && this.nativeId !== null) {
      mutationQueue.push(['setEventListener', this.nativeId, type, true]);
      flushMutations();
    }
  }

  removeEventListener(type: string, fn: (e: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(f => f !== fn);
    }
  }

  dispatchEvent(evt: any): boolean {
    evt.target = this;
    const path: any[] = [];
    let c: any = this;
    while (c) {
      path.push(c);
      c = c.parentNode;
    }
    if (g.document) path.push(g.document);
    evt.composedPath = () => path;

    for (const target of path) {
      const list = target.listeners?.[evt.type];
      if (list) {
        for (const fn of [...list]) {
          fn.call(target, evt);
          if (evt.cancelBubble) return !evt.defaultPrevented;
        }
      }
      if (evt.bubbles === false) break;
    }
    return !evt.defaultPrevented;
  }

  protected _cloneShallow() {
    const el = new GpuixElement(this.tagName);
    for (const [k, v] of Object.entries(this.attributes)) {
      el.setAttribute(k, v);
    }
    return el;
  }
}

export class GpuixTemplateElement extends GpuixElement {
  content: GpuixDocumentFragment;

  constructor() {
    super('template');
    this.content = new GpuixDocumentFragment();
  }

  set innerHTML(html: string) {
    this.content.childNodes = [];
    const stack: GpuixNode[] = [this.content];
    const tagRegex = /<(\/)?([a-zA-Z0-9-]+)([^>]*?)(\/)?>|<!--(.*?)-->|([^<]+)/g;
    let match;
    while ((match = tagRegex.exec(html)) !== null) {
      const [_, isClosing, tagName, rawAttrs, isSelfClosing, comment, text] = match;
      if (comment !== undefined) {
        stack[stack.length - 1].appendChild(new GpuixComment(comment));
      } else if (text !== undefined) {
        stack[stack.length - 1].appendChild(new GpuixText(text));
      } else if (isClosing) {
        if (stack.length > 1) stack.pop();
      } else {
        const el = new GpuixElement(tagName);
        const attrRegex = /([a-zA-Z0-9-]+)(?:=([\"'])(.*?)\2)?/g;
        let am;
        while ((am = attrRegex.exec(rawAttrs)) !== null) {
          el.setAttribute(am[1], am[3] !== undefined ? am[3] : '');
        }
        stack[stack.length - 1].appendChild(el);
        if (!isSelfClosing && tagName.toLowerCase() !== 'input' && tagName.toLowerCase() !== 'img') {
          stack.push(el);
        }
      }
    }
  }
}

// 3. Document Root and Global Registrations
export class GpuixDocument {
  body: GpuixElement;
  listeners: Record<string, Array<(e: any) => void>> = {};

  constructor() {
    this.body = new GpuixElement('body');
  }

  createElement(tagName: string): GpuixElement {
    if (tagName.toLowerCase() === 'template') {
      return new GpuixTemplateElement();
    }
    return new GpuixElement(tagName);
  }

  createTextNode(data: string): GpuixText {
    return new GpuixText(data);
  }

  createComment(data: string): GpuixComment {
    return new GpuixComment(data);
  }

  createDocumentFragment(): GpuixDocumentFragment {
    return new GpuixDocumentFragment();
  }

  addEventListener(type: string, fn: (e: any) => void) {
    (this.listeners[type] ??= []).push(fn);
  }

  removeEventListener(type: string, fn: (e: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(f => f !== fn);
    }
  }
}

let eventSymbolInit = false;
export async function ensureEventSymbol() {
  if (eventSymbolInit) return;
  eventSymbolInit = true;
  try {
    const sveltePkg = createRequire(import.meta.url).resolve('svelte/package.json');
    const eventsUrl = new URL('./src/internal/client/dom/elements/events.js', 'file://' + sveltePkg).href;
    const { event_symbol } = await import(eventsUrl);
    if (event_symbol) {
      Object.defineProperty(GpuixElement.prototype, event_symbol, {
        get() {
          if (!this._proxy) {
            this._events = {};
            const self = this;
            this._proxy = new Proxy(this._events, {
              set(target, prop, value) {
                target[prop as string] = value;
                const evType = prop as string;
                self._delegatedEvents.add(evType);
                if (self.isMaterialized && self.nativeId !== null) {
                  mutationQueue.push(['setEventListener', self.nativeId, evType, true]);
                  flushMutations();
                }
                return true;
              }
            });
          }
          return this._proxy;
        },
        set(val) {
          if (this[event_symbol]) Object.assign(this[event_symbol], val);
        },
        configurable: true
      });
    }
  } catch (err) {
    console.error('[gpui-dom] Failed to bind Svelte event_symbol:', err);
  }
}

export interface GpuiDomOptions extends WindowOptions {
  width?: number;
  height?: number;
  title?: string;
}

export function initGpuiDom(options: GpuiDomOptions = {}) {
  const doc = new GpuixDocument();

  // Register globals before any Svelte imports execute
  g.Node = GpuixNode;
  g.Element = GpuixElement;
  g.Text = GpuixText;
  g.Comment = GpuixComment;
  g.DocumentFragment = GpuixDocumentFragment;
  g.HTMLTemplateElement = GpuixTemplateElement;
  g.document = doc;
  g.window = globalThis;

  if (!g.navigator) {
    try { Object.defineProperty(globalThis, 'navigator', { value: { userAgent: 'GPUI' }, configurable: true }); } catch {}
  }

  (g as any).__gpui_set_css_vars = set_css_vars;
  (g as any).__gpui_native = null;
  (g as any).__gpui_nodesById = nodesById;

  // Start Native GPUI Window
  nativeRenderer = new GpuixRenderer((err, event) => {
    if (err || !event) return;
    const type = event.eventType.toLowerCase();
    const id = event.elementId;
    if (id) {
      const node = nodesById.get(id);
      if (node instanceof GpuixElement) {
        const syntheticEvent = {
          type,
          bubbles: true,
          cancelBubble: false,
          defaultPrevented: false,
          preventDefault() { this.defaultPrevented = true; },
          stopPropagation() { this.cancelBubble = true; },
          ...event
        };
        node.dispatchEvent(syntheticEvent);
        try { onEventFlush?.(); } catch {}
        flushMutations();
      }
    }
  });

  nativeRenderer.init({
    ...options,
    title: options.title ?? 'GPUI Svelte 5',
    width: options.width ?? 640,
    height: options.height ?? 480
  });

  (g as any).__gpui_native = nativeRenderer;

  // Materialize body as root
  doc.body.nativeId = nextId++;
  doc.body.isMaterialized = true;
  nodesById.set(doc.body.nativeId, doc.body);
  mutationQueue.push(['createElement', doc.body.nativeId, 'div']);
  mutationQueue.push(['setStyle', doc.body.nativeId, {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative'
  }]);
  mutationQueue.push(['setRoot', doc.body.nativeId]);
  flushMutations();

  // GPUI frame loop
  const loop = () => {
    flushMutations();
    if (nativeRenderer?.tick() !== false) {
      setTimeout(loop, 8);
    }
  };
  loop();

  return { doc, renderer: nativeRenderer, nodesById };
}
