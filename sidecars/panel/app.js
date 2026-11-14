(() => {
'use strict';

// --- src/icons/svgRegistry.js ---
/**
 * @fileoverview Pure vector SVG icon registry (16x16 grid).
 * Strictly zero emoji characters anywhere in the codebase.
 */

const SVG_ICON_DEFS = Object.freeze({
  pulse: [
    { tag: 'path', attrs: { d: 'M1.5 8h2.5l2.2-5.5 3.6 11 2.2-5.5h2.5' } },
  ],
  bolt: [
    { tag: 'path', attrs: { d: 'M9.2 1.5L3.5 9h4.2l-.9 5.5L12.5 7H8.3l.9-5.5z' } },
  ],
  refresh: [
    { tag: 'path', attrs: { d: 'M13.5 8a5.5 5.5 0 1 1-1.4-3.7' } },
    { tag: 'path', attrs: { d: 'M13.5 2.2v2.6h-2.6' } },
  ],
  check: [
    { tag: 'path', attrs: { d: 'M3 8.5l3.2 3.2L13 4.8' } },
  ],
  warning: [
    { tag: 'path', attrs: { d: 'M8 2.2L1.8 13.2h12.4L8 2.2z' } },
    { tag: 'path', attrs: { d: 'M8 6.2v3.4' } },
    { tag: 'circle', attrs: { cx: '8', cy: '11.5', r: '0.6', fill: 'currentColor', stroke: 'none' } },
  ],
  'chevron-down': [
    { tag: 'path', attrs: { d: 'M4 6.2l4 4 4-4' } },
  ],
  'chevron-up': [
    { tag: 'path', attrs: { d: 'M4 9.8l4-4 4 4' } },
  ],
  'chevron-right': [
    { tag: 'path', attrs: { d: 'M6.2 4l4 4-4 4' } },
  ],
  'chevron-left': [
    { tag: 'path', attrs: { d: 'M9.8 4l-4 4 4 4' } },
  ],
  layers: [
    { tag: 'path', attrs: { d: 'M8 2L2 5.2 8 8.4l6-3.2L8 2z' } },
    { tag: 'path', attrs: { d: 'M2 8.2L8 11.4l6-3.2' } },
    { tag: 'path', attrs: { d: 'M2 11.2L8 14.4l6-3.2' } },
  ],
  'chart-bar': [
    { tag: 'path', attrs: { d: 'M2 13.5h12' } },
    { tag: 'path', attrs: { d: 'M4.5 13.5V7.5' } },
    { tag: 'path', attrs: { d: 'M8 13.5V2.5' } },
    { tag: 'path', attrs: { d: 'M11.5 13.5V5.2' } },
  ],
  table: [
    { tag: 'rect', attrs: { x: '2', y: '2.5', width: '12', height: '11', rx: '1.5' } },
    { tag: 'path', attrs: { d: 'M2 6.2h12' } },
    { tag: 'path', attrs: { d: 'M6.2 6.2v7.3' } },
  ],
  sliders: [
    { tag: 'path', attrs: { d: 'M2 3.5h2M7 3.5h7' } },
    { tag: 'path', attrs: { d: 'M2 8h7M12 8h2' } },
    { tag: 'path', attrs: { d: 'M2 12.5h3.3M8.3 12.5H14' } },
    { tag: 'circle', attrs: { cx: '5.5', cy: '3.5', r: '1.5' } },
    { tag: 'circle', attrs: { cx: '10.5', cy: '8', r: '1.5' } },
    { tag: 'circle', attrs: { cx: '6.8', cy: '12.5', r: '1.5' } },
  ],
  calendar: [
    { tag: 'rect', attrs: { x: '2.2', y: '3.2', width: '11.6', height: '10.6', rx: '1' } },
    { tag: 'path', attrs: { d: 'M5.2 1.8v2.4M10.8 1.8v2.4M2.2 6.5h11.6' } },
  ],
  clock: [
    { tag: 'circle', attrs: { cx: '8', cy: '8', r: '5.8' } },
    { tag: 'path', attrs: { d: 'M8 4.8v3.5l2.4 1.5' } },
  ],
  plus: [
    { tag: 'path', attrs: { d: 'M8 3.5v9M3.5 8h9' } },
  ],
  minus: [
    { tag: 'path', attrs: { d: 'M3.5 8h9' } },
  ],
  dot: [
    { tag: 'circle', attrs: { cx: '8', cy: '8', r: '5', fill: 'currentColor', stroke: 'none' } },
  ],
  'arrow-down': [
    { tag: 'path', attrs: { d: 'M8 2.8v10.4M4.2 9.4L8 13.2l3.8-3.8' } },
  ],
  'arrow-up': [
    { tag: 'path', attrs: { d: 'M8 13.2V2.8M4.2 6.6L8 2.8l3.8 3.8' } },
  ],
  dock: [
    { tag: 'rect', attrs: { x: '1.8', y: '2.5', width: '12.4', height: '11', rx: '1.5' } },
    { tag: 'path', attrs: { d: 'M1.8 6h12.4' } },
    { tag: 'path', attrs: { d: 'M9.2 4.25h3.2' } },
  ],
  close: [
    { tag: 'path', attrs: { d: 'M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6' } },
  ],
});

// --- src/icons/SvgIcon.js ---
/**
 * @fileoverview Dynamic SVG icon component and incremental icon patcher.
 */


const SVG_NS = 'http://www.w3.org/2000/svg';

function createSvgIcon(name, { size = 14, className = '' } = {}) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.5');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  if (className) {
    svg.setAttribute('class', `svg-icon ${className}`.trim());
  } else {
    svg.setAttribute('class', 'svg-icon');
  }
  patchSvgIcon(svg, name);
  return svg;
}

function patchSvgIcon(svgEl, name) {
  if (!svgEl || svgEl.dataset?.iconName === name) return false;
  if (svgEl.dataset) {
    svgEl.dataset.iconName = name;
  }
  while (svgEl.firstChild) {
    svgEl.removeChild(svgEl.firstChild);
  }
  const shapes = SVG_ICON_DEFS[name] || SVG_ICON_DEFS.dot;
  for (const shape of shapes) {
    const child = document.createElementNS(SVG_NS, shape.tag);
    for (const [k, v] of Object.entries(shape.attrs)) {
      child.setAttribute(k, v);
    }
    svgEl.appendChild(child);
  }
  return true;
}

// --- src/core/reactive.js ---
/**
 * @fileoverview Fine-grained reactive store with async microtask batching
 * and structural slice comparison to prevent full-page re-renders.
 */

const pendingJobs = new Set();
let isFlushPending = false;

function scheduleAsyncJob(job) {
  pendingJobs.add(job);
  if (!isFlushPending) {
    isFlushPending = true;
    queueMicrotask(flushAsyncJobs);
  }
}

function flushAsyncJobs() {
  isFlushPending = false;
  const jobs = Array.from(pendingJobs);
  pendingJobs.clear();
  for (const job of jobs) {
    job();
  }
}

function isShallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!Object.is(a[i], b[i])) return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const k of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, k) || !Object.is(a[k], b[k])) {
      return false;
    }
  }
  return true;
}

function createReactiveStore(initialState) {
  let state = { ...initialState };
  const subscribers = new Set();

  function getState() {
    return state;
  }

  function notifyAll() {
    for (const sub of Array.from(subscribers)) {
      if (!subscribers.has(sub)) continue;
      const nextSlice = sub.selector(state);
      const equal = sub.compare(sub.lastSlice, nextSlice);
      if (!equal) {
        const prevSlice = sub.lastSlice;
        sub.lastSlice = nextSlice;
        sub.listener(nextSlice, prevSlice);
      }
    }
  }

  function setState(patchOrUpdater, { sync = false } = {}) {
    const patch = typeof patchOrUpdater === 'function' ? patchOrUpdater(state) : patchOrUpdater;
    if (!patch || typeof patch !== 'object') return;

    let changed = false;
    const nextState = { ...state };
    for (const [k, v] of Object.entries(patch)) {
      if (!Object.is(state[k], v)) {
        nextState[k] = v;
        changed = true;
      }
    }
    if (!changed) {
      return;
    }
    state = nextState;

    if (sync) {
      notifyAll();
    } else {
      scheduleAsyncJob(notifyAll);
    }
  }

  function subscribe(selector, listener, { immediate = true, compare = isShallowEqual } = {}) {
    const initialSlice = selector(state);
    const sub = {
      selector,
      listener,
      compare,
      lastSlice: initialSlice,
    };
    subscribers.add(sub);
    if (immediate) {
      listener(initialSlice, undefined);
    }
    return () => {
      subscribers.delete(sub);
    };
  }

  return {
    getState,
    setState,
    subscribe,
  };
}

// --- src/core/domPatch.js ---
/**
 * @fileoverview Incremental DOM patching utilities and keyed list reconciler.
 * Prevents full innerHTML replacements and preserves active DOM element state.
 */

function h(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  if (props) {
    for (const [key, val] of Object.entries(props)) {
      if (val === undefined || val === null || val === false) continue;
      if (key === 'className' || key === 'class') {
        el.className = String(val);
      } else if (key === 'dataset' && typeof val === 'object') {
        for (const [dk, dv] of Object.entries(val)) {
          if (dv !== undefined && dv !== null) {
            el.dataset[dk] = String(dv);
          }
        }
      } else if (key.startsWith('on') && typeof val === 'function') {
        const evt = key.slice(2).toLowerCase();
        el.addEventListener(evt, val);
      } else if (key === 'text') {
        el.textContent = String(val);
      } else if (val === true) {
        el.setAttribute(key, '');
      } else {
        el.setAttribute(key, String(val));
      }
    }
  }
  const childArray = Array.isArray(children) ? children : [children];
  for (const child of childArray) {
    if (child === null || child === undefined || child === false) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else {
      el.appendChild(child);
    }
  }
  return el;
}

function patchText(el, nextValue) {
  if (!el) return false;
  const nextStr = String(nextValue ?? '');
  if (el.textContent === nextStr) {
    return false;
  }
  el.textContent = nextStr;
  return true;
}

function patchAttr(el, attrName, nextValue) {
  if (!el) return false;
  if (nextValue === null || nextValue === undefined || nextValue === false) {
    let mutated = false;
    if (el.hasAttribute(attrName)) {
      el.removeAttribute(attrName);
      mutated = true;
    }
    if (attrName === 'value' && 'value' in el && el.value !== '') {
      el.value = '';
      mutated = true;
    }
    return mutated;
  }
  const strVal = nextValue === true ? '' : String(nextValue);
  let mutated = false;
  if (el.getAttribute(attrName) !== strVal) {
    el.setAttribute(attrName, strVal);
    mutated = true;
  }
  if (attrName === 'value' && 'value' in el && el.value !== strVal) {
    el.value = strVal;
    mutated = true;
  }
  return mutated;
}

function patchClasses(el, classMap) {
  if (!el || !classMap) return false;
  let mutated = false;
  for (const [cls, active] of Object.entries(classMap)) {
    if (!cls) continue;
    const shouldHave = Boolean(active);
    const tokens = String(cls).split(/\s+/).filter(Boolean);
    for (const tok of tokens) {
      const has = el.classList.contains(tok);
      if (has !== shouldHave) {
        el.classList.toggle(tok, shouldHave);
        mutated = true;
      }
    }
  }
  return mutated;
}

function patchStyleVar(el, varName, nextValue) {
  if (!el) return false;
  const strVal = String(nextValue ?? '');
  const prev = el.style.getPropertyValue(varName);
  if (prev === strVal) {
    return false;
  }
  el.style.setProperty(varName, strVal);
  return true;
}

/**
 * 判断事件是否发生在目标节点内部（兼容 Shadow DOM 的 `composedPath()` 穿透）。
 *
 * @param {Event|null|undefined} event
 * @param {Node|null|undefined} element
 * @returns {boolean}
 */
function isEventInside(event, element) {
  if (!event || !element) return false;
  if (typeof event.composedPath === 'function') {
    const path = event.composedPath();
    if (Array.isArray(path) && path.includes(element)) {
      return true;
    }
  }
  const target = event.target;
  return Boolean(target && typeof element.contains === 'function' && element.contains(target));
}

const keyedListState = new WeakMap();

/**
 * Keyed incremental list reconciler.
 * Reuses existing DOM nodes by key and patches only changed items in-place.
 */
function patchKeyedList(container, items, { keyFn, sigFn, createRow, updateRow }) {
  if (!container) return;
  let map = keyedListState.get(container);
  if (!map) {
    map = new Map();
    keyedListState.set(container, map);
  }

  const nextKeys = new Set();
  const seenInPass = new Map();
  const orderedNodes = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rawKey = String(keyFn(item, i));
    const dupIdx = seenInPass.get(rawKey) || 0;
    seenInPass.set(rawKey, dupIdx + 1);
    const key = dupIdx === 0 ? rawKey : `${rawKey}__dup_${dupIdx}`;
    const sig = sigFn ? String(sigFn(item, i)) : JSON.stringify(item);
    nextKeys.add(key);

    let record = map.get(key);
    if (!record) {
      const created = createRow(item, i);
      record = {
        el: created.el,
        refs: created.refs,
        sig,
      };
      updateRow(record.refs, item, i, record.el);
      map.set(key, record);
    } else if (record.sig !== sig) {
      record.sig = sig;
      updateRow(record.refs, item, i, record.el);
    }
    orderedNodes.push(record.el);
  }

  // Remove stale keys
  for (const [oldKey, record] of map.entries()) {
    if (!nextKeys.has(oldKey)) {
      if (record.el.parentNode === container) {
        container.removeChild(record.el);
      }
      map.delete(oldKey);
    }
  }

  // Reorder or insert nodes with minimal DOM moves
  for (let i = 0; i < orderedNodes.length; i++) {
    const targetNode = orderedNodes[i];
    const currentNode = container.children[i] || null;
    if (currentNode !== targetNode) {
      container.insertBefore(targetNode, currentNode);
    }
  }
}

// --- src/core/component.js ---
/**
 * @fileoverview Vue-inspired lightweight component kernel supporting
 * props, custom v-model value transmission (emit('update:modelValue', val)),
 * reactive subscriptions, and lifecycle cleanup.
 */

function defineComponent({ name, setup }) {
  return function createInstance(initialProps = {}) {
    let props = { ...initialProps };
    const cleanups = [];

    function emit(event, payload) {
      // Support Vue-style onUpdateModelValue / onChange prop callbacks
      if (event === 'update:modelValue') {
        if (typeof props.onUpdateModelValue === 'function') {
          props.onUpdateModelValue(payload);
        }
        if (typeof props.onChange === 'function') {
          props.onChange(payload);
        }
      }
    }

    function onCleanup(fn) {
      if (typeof fn === 'function') {
        cleanups.push(fn);
      }
    }

    let setupResult = null;

    function setProps(nextProps = {}) {
      props = { ...props, ...nextProps };
      if (setupResult && typeof setupResult.onPropsChange === 'function') {
        setupResult.onPropsChange(props);
      }
    }

    function setValue(nextValue) {
      setProps({ modelValue: nextValue });
    }

    setupResult = setup({
      getProps: () => props,
      setProps,
      emit,
      onCleanup,
    });

    function destroy() {
      for (const fn of cleanups.splice(0)) {
        try {
          fn();
        } catch (err) {
          console.error(`[${name}] cleanup error:`, err);
        }
      }
      if (setupResult.el?.parentNode) {
        setupResult.el.parentNode.removeChild(setupResult.el);
      }
    }

    return {
      name,
      el: setupResult.el,
      refs: setupResult.refs || {},
      setProps,
      setValue,
      destroy,
      ...setupResult.methods,
    };
  };
}

// --- src/core/formatters.js ---
/**
 * @fileoverview Pure formatting utilities for speed metrics, token counts,
 * USD estimates, countdown timers, and custom datetime displays.
 */

function formatMetric(value, unit = '') {
  return Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : '—';
}

function formatTokens(num) {
  const n = Number(num || 0);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function formatTokensPrecise(num) {
  const n = Number(num || 0);
  if (n <= 0) return '0';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

function formatCnyApprox(usdAmount, rate = 7.2) {
  const rmb = Number(usdAmount || 0) * rate;
  if (rmb <= 0) return '≈ ¥0';
  if (rmb >= 10) return `≈ ¥${Math.round(rmb)}`;
  return `≈ ¥${rmb.toFixed(1)}`;
}

function formatDateSpanBadge(startMs, endMs) {
  const s = startMs && Number.isFinite(startMs) ? new Date(startMs) : new Date();
  const e = endMs && Number.isFinite(endMs) ? new Date(endMs) : new Date();
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 ~ ${e.getFullYear()}年${e.getMonth() + 1}月${e.getDate()}日`;
  }
  return `${s.getMonth() + 1}月${s.getDate()}日 ~ ${e.getMonth() + 1}月${e.getDate()}日`;
}

function formatUsd(amount, { precise = false } = {}) {
  if (amount == null || !Number.isFinite(Number(amount))) return '待定';
  const val = Number(amount || 0);
  if (precise) {
    if (val > 0 && val < 0.001) return '<$0.001';
    return val >= 1 ? `$${val.toFixed(2)}` : `$${val.toFixed(3)}`;
  }
  return `$${val.toFixed(2)}`;
}

function speedReasonText(reason) {
  return ({
    incomplete_or_invalid_timing: '生成未完成',
    invalid_output_tokens: '无有效输出',
    inconsistent_timing: '耗时数据异常',
    short_timing: '耗时过短 (<0.5s)',
    legacy_cache: '旧版缓存记录',
  })[reason] || '';
}

function sampleSummary(summary) {
  const valid = summary?.sampleCount || 0;
  const excluded = summary?.excludedCount || 0;
  return `${valid}/${valid + excluded} 步`;
}

function formatCountdown(isoTime, nowMs = Date.now()) {
  if (!isoTime) return '未知重置时间';
  const targetMs = Date.parse(isoTime);
  if (!Number.isFinite(targetMs) || targetMs <= 0) return '未知重置时间';
  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) return '即将重置';
  if (diffMs < 60_000) return '<1分钟后重置';

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}天 ${hours}小时后重置`;
  if (hours > 0) return `${hours}小时 ${minutes}分后重置`;
  return `${minutes}分钟后重置`;
}

function formatCompactDateTime(ms) {
  if (!ms || !Number.isFinite(ms)) return '选择时间';
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatElapsedSec(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m < 60) {
    return `${m}m ${String(remS).padStart(2, '0')}s`;
  }
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m`;
}

/**
 * 归一化 Orchestrator 系列 ID 显示格式枚举（`'compact'` 精简代号 vs `'full'` 原始完整 ID，默认 `'compact'`）。
 *
 * @param {unknown} mode
 * @returns {'compact'|'full'}
 */
function normalizeOrchestratorIdDisplayMode(mode) {
  return String(mode ?? '').trim().toLowerCase() === 'full' ? 'full' : 'compact';
}

/**
 * 统一解析步骤、会话摘要或模型汇总行面向用户的模型显示文本与悬停提示。
 *
 * 规则：
 * - Orchestrator 系列（`Orchestrator (Carbon)`、`Orchestrator (Argon)`、`gemini-flash-worker-agy` / `M669`）
 *   独立遵循 `orchestratorIdMode`（`'compact'` 显示 `orchestrator-carbon` / `orchestrator-argon` / `worker-agy-hydrogen`；
 *   `'full'` 显示带括号标注的完整上游 ID），不受普通模型“精简代号 / 原始模型 ID”切换影响；
 * - 其余普通模型继续按 `showUpstreamModel` 与视图选项切换。
 *
 * @param {object|null|undefined} target
 * @param {{ showUpstreamModel?: boolean, orchestratorIdMode?: string }|boolean} [settings]
 * @param {{ preferLabelInShort?: boolean, fallback?: string }} [options]
 * @returns {{ text: string, title: string, isOrchestratorSeries: boolean }}
 */
function resolveModelDisplayInfo(target, settings = {}, options = {}) {
  const showUpstream =
    typeof settings === 'boolean' ? settings : Boolean(settings?.showUpstreamModel);
  const orchestratorMode = normalizeOrchestratorIdDisplayMode(
    typeof settings === 'object' && settings ? settings.orchestratorIdMode : 'compact'
  );
  const preferLabelInShort = Boolean(options?.preferLabelInShort);
  const fallback = options?.fallback ?? '模型未知';

  if (!target || typeof target !== 'object') {
    return { text: fallback, title: fallback, isOrchestratorSeries: false };
  }

  const shortText = String(
    target.activeModelShort ?? target.modelShort ?? target.shortName ?? ''
  ).trim();
  const labelText = String(
    target.activeModelLabel ?? target.modelLabel ?? target.label ?? ''
  ).trim();
  const upstreamText = String(
    target.activeModelUpstream ?? target.modelUpstream ?? target.upstreamName ?? ''
  ).trim();
  const responseText = String(target.responseModel ?? '').trim();
  const modelKeyText = String(target.modelKey ?? '').trim();

  const isCompaction =
    Boolean(target.isCompactionStep) ||
    /·压缩\s*$/.test(shortText) ||
    /·压缩\s*$/.test(upstreamText) ||
    /·压缩\s*$/.test(labelText);

  const combined = `${modelKeyText} ${shortText} ${labelText} ${upstreamText} ${responseText}`;
  const isOrchWorker =
    /\bMODEL_PLACEHOLDER_M669\b|\b[a-z0-9.-]*worker-agy\b|\bworker-agy-hydrogen\b|\bOrchestrator\s+Worker\b/i.test(
      combined
    );
  const isOrchSeries =
    isOrchWorker ||
    /\bgemini-pro-orchestrator(?:-argon)?\b|\borchestrator-(?:carbon|argon)\b|\borch-(?:carbon|argon)(?:·压缩)?(?=\s|$)|Orchestrator\s*\((?:Carbon|Argon)\)|\bMODEL_PLACEHOLDER_M(?:667|681)\b/i.test(
      combined
    );

  if (isOrchSeries) {
    let compactId = 'orchestrator-carbon';
    let fullId = 'gemini-pro-orchestrator (carbon-4)';
    if (isOrchWorker) {
      compactId = 'worker-agy-hydrogen';
      fullId = 'gemini-flash-worker-agy (hydrogen-4)';
    } else if (/\bargon\b|\bMODEL_PLACEHOLDER_M681\b|\borch-argon\b/i.test(combined)) {
      compactId = 'orchestrator-argon';
      fullId = 'gemini-pro-orchestrator-argon (argon-4)';
    }
    const suffix = isCompaction ? '·压缩' : '';
    const text = `${orchestratorMode === 'full' ? fullId : compactId}${suffix}`;
    const multiUpstream =
      Array.isArray(target.upstreamModels) && target.upstreamModels.length > 1
        ? target.upstreamModels.join(' / ')
        : '';
    const title = multiUpstream || `${fullId}${suffix}`;
    return { text, title, isOrchestratorSeries: true };
  }

  const standardText =
    (showUpstream
      ? upstreamText || responseText || shortText || labelText
      : preferLabelInShort
        ? labelText || shortText
        : shortText || labelText) || fallback;
  const standardTitle =
    showUpstream && Array.isArray(target.upstreamModels) && target.upstreamModels.length > 1
      ? target.upstreamModels.join(' / ')
      : standardText;
  return { text: standardText, title: standardTitle, isOrchestratorSeries: false };
}

/**
 * 按当前显示策略 (`resolveModelDisplayInfo`) 解析出的最终展示名称对模型统计列表执行二次去重归并，
 * 确保当多个外层模型槽位映射到同一展示名（例如切换至“原始模型 ID”后共享同一 `upstreamName`）时，
 * 不会在排行榜或总览中出现重复同名行，同时完整累加 Token、调用次数、未定价计数与速度/首字加权均值。
 *
 * @param {object[]} [models=[]]
 * @param {object|boolean} [settings={}]
 * @param {{ preferLabelInShort?: boolean, fallback?: string }} [options={}]
 * @returns {object[]}
 */
function mergeModelsByDisplayName(models = [], settings = {}, options = {}) {
  if (!Array.isArray(models) || models.length === 0) return [];
  const showUpstream =
    typeof settings === 'boolean' ? settings : Boolean(settings?.showUpstreamModel);
  const byDisplay = new Map();

  for (const m of models) {
    if (!m || typeof m !== 'object') continue;
    const disp = resolveModelDisplayInfo(m, settings, options);
    const key = String(disp.text || options?.fallback || '—').trim() || '—';

    const calls = Math.max(0, Number(m.calls || 0));
    const inTok = Math.max(0, Number(m.inputTokens || 0));
    const cacheTok = Math.max(0, Number(m.cacheReadTokens || 0));
    const outTok = Math.max(0, Number(m.outputTokens || 0));
    const thinkTok = Math.max(0, Number(m.thinkingTokens || 0));
    const respTok =
      m.responseTokens != null
        ? Math.max(0, Number(m.responseTokens))
        : Math.max(0, outTok - thinkTok);
    const totTok = Math.max(0, Number(m.totalTokens ?? inTok + cacheTok + outTok));
    const costUsd = Number.isFinite(Number(m.costUsd)) ? Math.max(0, Number(m.costUsd)) : 0;
    const unpricedCalls = Math.max(0, Number(m.unpricedCalls || 0));

    const speedSampleCount = Math.max(0, Number(m.speedSummary?.sampleCount || 0));
    const speedExcludedCount = Math.max(0, Number(m.speedSummary?.excludedCount || 0));
    const speedWeight = speedSampleCount > 0 ? speedSampleCount : Math.max(1, outTok || calls || 1);
    const hasSpeed = m.avgTokPerSec != null && Number.isFinite(Number(m.avgTokPerSec)) && Number(m.avgTokPerSec) > 0;

    const ttftSampleCount = Math.max(0, Number(m.ttftSampleCount || 0));
    const ttftWeight = ttftSampleCount > 0 ? ttftSampleCount : Math.max(1, calls || 1);
    const hasTtft = m.avgTtftSec != null && Number.isFinite(Number(m.avgTtftSec)) && Number(m.avgTtftSec) >= 0;

    let acc = byDisplay.get(key);
    if (!acc) {
      acc = {
        baseItem: m,
        mergedCount: 1,
        displayText: key,
        firstTitle: disp.title || key,
        titleSet: new Set(disp.title ? [disp.title] : []),
        upstreamSet: new Set(
          Array.isArray(m.upstreamModels) ? m.upstreamModels.filter(Boolean) : []
        ),
        sourceLabels: m.label ? [m.label] : [],
        calls,
        inputTokens: inTok,
        cacheReadTokens: cacheTok,
        outputTokens: outTok,
        thinkingTokens: thinkTok,
        responseTokens: respTok,
        totalTokens: totTok,
        costUsd,
        unpricedCalls,
        speedWeightedSum: hasSpeed ? Number(m.avgTokPerSec) * speedWeight : 0,
        speedWeight: hasSpeed ? speedWeight : 0,
        speedSampleCount,
        speedExcludedCount,
        ttftWeightedSum: hasTtft ? Number(m.avgTtftSec) * ttftWeight : 0,
        ttftWeight: hasTtft ? ttftWeight : 0,
        ttftSampleCount,
      };
      if (m.upstreamName) acc.upstreamSet.add(m.upstreamName);
      byDisplay.set(key, acc);
      continue;
    }

    acc.mergedCount += 1;
    if (disp.title) acc.titleSet.add(disp.title);
    if (Array.isArray(m.upstreamModels)) {
      for (const u of m.upstreamModels) {
        if (u) acc.upstreamSet.add(u);
      }
    }
    if (m.upstreamName) acc.upstreamSet.add(m.upstreamName);
    if (m.label && !acc.sourceLabels.includes(m.label)) {
      acc.sourceLabels.push(m.label);
    }

    acc.calls += calls;
    acc.inputTokens += inTok;
    acc.cacheReadTokens += cacheTok;
    acc.outputTokens += outTok;
    acc.thinkingTokens += thinkTok;
    acc.responseTokens += respTok;
    acc.totalTokens += totTok;
    acc.costUsd += costUsd;
    acc.unpricedCalls += unpricedCalls;

    if (hasSpeed) {
      acc.speedWeightedSum += Number(m.avgTokPerSec) * speedWeight;
      acc.speedWeight += speedWeight;
    }
    acc.speedSampleCount += speedSampleCount;
    acc.speedExcludedCount += speedExcludedCount;

    if (hasTtft) {
      acc.ttftWeightedSum += Number(m.avgTtftSec) * ttftWeight;
      acc.ttftWeight += ttftWeight;
    }
    acc.ttftSampleCount += ttftSampleCount;
  }

  return Array.from(byDisplay.values()).map((acc) => {
    if (acc.mergedCount === 1) {
      return {
        ...acc.baseItem,
        displayText: acc.displayText,
        displayTitle: acc.firstTitle,
        sourceLabels: acc.sourceLabels,
      };
    }
    const promptTok = acc.inputTokens + acc.cacheReadTokens;
    const cacheHitPct = promptTok > 0 ? +((acc.cacheReadTokens / promptTok) * 100).toFixed(1) : 0;
    const avgTokPerSec =
      acc.speedWeight > 0 ? +(acc.speedWeightedSum / acc.speedWeight).toFixed(1) : null;
    const avgTtftSec =
      acc.ttftWeight > 0 ? +(acc.ttftWeightedSum / acc.ttftWeight).toFixed(1) : null;
    const upstreamModels = Array.from(acc.upstreamSet);
    const displayTitle =
      showUpstream && upstreamModels.length > 1
        ? upstreamModels.join(' / ')
        : Array.from(acc.titleSet).join(' / ') || acc.displayText;

    return {
      ...acc.baseItem,
      calls: acc.calls,
      inputTokens: acc.inputTokens,
      cacheReadTokens: acc.cacheReadTokens,
      outputTokens: acc.outputTokens,
      thinkingTokens: acc.thinkingTokens,
      responseTokens: acc.responseTokens,
      totalTokens: acc.totalTokens,
      costUsd: +acc.costUsd.toFixed(6),
      unpricedCalls: acc.unpricedCalls,
      cacheHitPct,
      avgTokPerSec,
      avgTtftSec,
      ttftSampleCount: acc.ttftSampleCount,
      speedSummary: acc.baseItem.speedSummary
        ? {
            ...acc.baseItem.speedSummary,
            sampleCount: acc.speedSampleCount,
            excludedCount: acc.speedExcludedCount,
            avgTokPerSec,
          }
        : undefined,
      upstreamModels,
      displayText: acc.displayText,
      displayTitle,
      sourceLabels: acc.sourceLabels,
    };
  });
}

// --- src/core/httpClient.js ---
/**
 * @fileoverview Async HTTP client with AbortController cancellation for stale
 * polling requests, concurrent GET deduplication, and dual-mode transport
 * (Sidecar Webview `window.sidecar.fetch` + Main Window Loopback Bridge).
 */

const inFlightGets = new Map();
const activeControllers = new Map();

/**
 * 读取主窗口双栖模式下注入的本地桥接配置（`port`、`token`、`bundleVersion`、`stylesCss`）。
 *
 * @returns {{ port: number, token: string, bundleVersion?: string, stylesCss?: string } | null}
 */
function getWindowBridgeConfig() {
  if (typeof window === 'undefined') return null;
  const br = window.__AGUsageMonitorBridge;
  const port = Number(br?.port || 0);
  if (br && Number.isInteger(port) && port > 0 && typeof br.token === 'string' && br.token) {
    return br;
  }
  return null;
}

/**
 * 判断当前脚本是否以双栖悬浮模式运行在宿主主聊天窗口内（而非右侧辅助栏 Webview）。
 *
 * @returns {boolean}
 */
function isWindowOverlayMode() {
  if (typeof window === 'undefined') return false;
  if (window.sidecar?.fetch) return false;
  return Boolean(getWindowBridgeConfig());
}

/**
 * 接收 Sidecar 通过 CDP `Runtime.evaluate` 批量投递的 RPC 响应，完成因 CSP/代理解除 HTTP 直连时的兜底请求。
 *
 * @param {Array<{ id: string, ok: boolean, status?: number, data?: any, error?: string }>} responses
 * @returns {number}
 */
function deliverCdpBridgeResponses(responses) {
  const br = getWindowBridgeConfig();
  if (!br || !(br.rpcPending instanceof Map) || !Array.isArray(responses)) return 0;
  let delivered = 0;
  for (const item of responses) {
    const entry = br.rpcPending.get(item?.id);
    if (!entry) continue;
    br.rpcPending.delete(item.id);
    delivered += 1;
    if (item.ok) {
      entry.resolve(item.data);
    } else {
      entry.reject(new Error(item.error || `HTTP ${item.status || 500}`));
    }
  }
  return delivered;
}

function callViaCdpBridge(bridge, path, { method, body, signal }) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const abortErr = new Error('Request aborted');
      abortErr.name = 'AbortError';
      reject(abortErr);
      return;
    }
    if (!Array.isArray(bridge.rpcQueue)) bridge.rpcQueue = [];
    if (!(bridge.rpcPending instanceof Map)) bridge.rpcPending = new Map();

    const reqId = `rpc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const cleanupQueueItem = () => {
      if (!Array.isArray(bridge.rpcQueue)) return;
      const idx = bridge.rpcQueue.findIndex((item) => item?.id === reqId);
      if (idx >= 0) bridge.rpcQueue.splice(idx, 1);
    };

    const timeoutId = setTimeout(() => {
      bridge.rpcPending.delete(reqId);
      cleanupQueueItem();
      reject(new Error('CDP bridge timeout'));
    }, 8000);

    const onAbort = () => {
      clearTimeout(timeoutId);
      bridge.rpcPending.delete(reqId);
      cleanupQueueItem();
      const abortErr = new Error('Request aborted');
      abortErr.name = 'AbortError';
      reject(abortErr);
    };
    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    bridge.rpcPending.set(reqId, {
      resolve: (data) => {
        clearTimeout(timeoutId);
        if (signal) signal.removeEventListener('abort', onAbort);
        resolve(data);
      },
      reject: (err) => {
        clearTimeout(timeoutId);
        if (signal) signal.removeEventListener('abort', onAbort);
        reject(err);
      },
    });

    if (bridge.rpcQueue.length >= 16) {
      const dropped = bridge.rpcQueue.shift();
      if (dropped?.id) {
        const stale = bridge.rpcPending.get(dropped.id);
        bridge.rpcPending.delete(dropped.id);
        stale?.reject(new Error('CDP queue superseded'));
      }
    }
    bridge.rpcQueue.push({ id: reqId, path, method, body });
  });
}

async function callSidecarApi(path, { method = 'GET', body, abortKey = '' } = {}) {
  const upperMethod = method.toUpperCase();
  const dedupKey = upperMethod === 'GET' && !abortKey ? path : '';

  if (dedupKey && inFlightGets.has(dedupKey)) {
    return inFlightGets.get(dedupKey);
  }

  let signal;
  let requestController = null;
  if (abortKey && typeof AbortController !== 'undefined') {
    const prev = activeControllers.get(abortKey);
    if (prev) {
      prev.abort();
    }
    requestController = new AbortController();
    activeControllers.set(abortKey, requestController);
    signal = requestController.signal;
  }

  const runRequest = async () => {
    const sidecar = typeof window !== 'undefined' ? window.sidecar : null;
    const bridge = !sidecar?.fetch ? getWindowBridgeConfig() : null;
    const fetchFn = sidecar?.fetch
      ? sidecar.fetch.bind(sidecar)
      : typeof window !== 'undefined' && typeof window.fetch === 'function'
        ? window.fetch.bind(window)
        : globalThis.fetch.bind(globalThis);

    const requestUrl = bridge ? `http://127.0.0.1:${bridge.port}${path}` : path;
    const headers = {};
    if (body !== undefined || !bridge) {
      headers['Content-Type'] = 'application/json';
    }
    if (bridge) {
      headers['X-Usage-Monitor-Token'] = bridge.token;
      if (bridge.transportMode === 'cdp') {
        return callViaCdpBridge(bridge, path, { method: upperMethod, body, signal });
      }
    }

    let res;
    try {
      res = await fetchFn(requestUrl, {
        method: upperMethod,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (fetchErr) {
      if (!bridge || signal?.aborted || fetchErr?.name === 'AbortError') {
        throw fetchErr;
      }
      // 当宿主环境的 CSP connect-src、混合内容策略或本地代理阻断 HTTP 直连时，无缝切至 CDP 通道
      bridge.transportMode = 'cdp';
      return callViaCdpBridge(bridge, path, { method: upperMethod, body, signal });
    }
    if (signal?.aborted) {
      const abortErr = new Error('Request aborted');
      abortErr.name = 'AbortError';
      throw abortErr;
    }
    const data = await res.json().catch(() => ({}));
    if (signal?.aborted) {
      const abortErr = new Error('Request aborted');
      abortErr.name = 'AbortError';
      throw abortErr;
    }
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  };

  const promise = runRequest().finally(() => {
    if (dedupKey) {
      inFlightGets.delete(dedupKey);
    }
    if (abortKey && requestController && activeControllers.get(abortKey) === requestController) {
      activeControllers.delete(abortKey);
    }
  });

  if (dedupKey) {
    inFlightGets.set(dedupKey, promise);
  }
  return promise;
}

// --- src/store/uiStore.js ---
/**
 * @fileoverview UI navigation and view state store.
 */


const VIEW_TABS = Object.freeze([
  { value: 'overview', label: '实时监控', icon: 'pulse' },
  { value: 'consumption', label: '用量统计', icon: 'chart-bar' },
  { value: 'steps', label: '调用明细', icon: 'table' },
  { value: 'settings', label: '偏好设置', icon: 'sliders' },
]);

const uiStore = createReactiveStore({
  activeView: 'overview',
  stepsSubTab: 'steps', // 'steps' | 'models'
  selectedAgentScope: 'all', // 'all' | 'main' | <subagent cascadeId>
  ctxInspectorAgentId: 'auto', // 'auto' | 'main' | <subagent cascadeId>
});

// --- src/store/telemetryStore.js ---
/**
 * @fileoverview Reactive telemetry store with async non-overlapping poll scheduler
 * and granular slice updates.
 */


const CASCADE_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 在主窗口双栖模式下，提取当前正在浏览的会话 ID：
 * 1. 优先解析 Antigravity 2.0 路由路径 `/c/<uuid>`；
 * 2. 在 Antigravity IDE (`workbench.html`) 无路径路由时，回退读取活跃对话视图
 *    `[data-testid="conversation-view"][data-cascade-id]` 或侧栏选中项。
 *
 * @returns {string}
 */
function extractHostRouteCascadeId() {
  if (typeof window === 'undefined' || !isWindowOverlayMode()) return '';
  const pathname = String(window.location?.pathname || '');
  const m = pathname.match(/^\/c\/([a-f0-9-]{36})(?:\/|$)/i);
  if (m && CASCADE_UUID_RE.test(m[1])) {
    return m[1];
  }
  const extBridgeRouteId = String(window.__AGUsageMonitorBridge?.hostRouteCascadeId || '').trim();
  if (extBridgeRouteId && CASCADE_UUID_RE.test(extBridgeRouteId)) {
    return extBridgeRouteId;
  }
  try {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') {
      return '';
    }
    const selectedRow = document.querySelector(
      '[data-testid^="conversation-row-"][data-selected="true"][data-cascade-id]'
    );
    const selectedRowId = String(selectedRow?.getAttribute?.('data-cascade-id') || '').trim();

    if (typeof document.querySelectorAll === 'function') {
      const views = document.querySelectorAll('[data-testid="conversation-view"][data-cascade-id]');
      const visibleIds = [];
      let focusedId = '';
      const activeEl = document.activeElement || null;
      for (const viewEl of views) {
        const cid = String(viewEl?.getAttribute?.('data-cascade-id') || '').trim();
        if (!CASCADE_UUID_RE.test(cid)) continue;
        if (viewEl.hasAttribute?.('hidden')) continue;
        if (viewEl.getBoundingClientRect) {
          const r = viewEl.getBoundingClientRect();
          if (r.width <= 0 && r.height <= 0) continue;
        }
        visibleIds.push(cid);
        if (activeEl && viewEl.contains?.(activeEl)) {
          focusedId = cid;
        }
      }
      if (focusedId) return focusedId;
      if (
        selectedRowId &&
        CASCADE_UUID_RE.test(selectedRowId) &&
        visibleIds.some((id) => id.toLowerCase() === selectedRowId.toLowerCase())
      ) {
        return selectedRowId;
      }
      if (visibleIds.length > 0) return visibleIds[0];
    }

    const singleView = document.querySelector('[data-testid="conversation-view"][data-cascade-id]');
    const singleViewId = String(singleView?.getAttribute?.('data-cascade-id') || '').trim();
    if (CASCADE_UUID_RE.test(singleViewId)) {
      return singleViewId;
    }
    if (CASCADE_UUID_RE.test(selectedRowId)) {
      return selectedRowId;
    }
  } catch {
    // 忽略宿主 DOM 查询异常
  }
  return '';
}

const initialConversationId =
  (typeof window !== 'undefined' && window.sidecar?.conversationId) || '';

const telemetryStore = createReactiveStore({
  selectedConversationId: initialConversationId,
  hostRouteConversationId: extractHostRouteCascadeId(),
  selectedTimeRange: 'today',
  customStartMs: Date.now() - 24 * 3600 * 1000,
  customEndMs: Date.now(),
  syncState: 'idle', // 'idle' | 'syncing' | 'synced' | 'error'
  minuteTick: 0,
  telemetry: null,
});

let pollTimer = null;
let feedbackTimer = null;
let activeBundleVersion = 0;
let latestRequestSeq = 0;
let activeForceCount = 0;
let loopActive = false;
let loopIntervalMs = 2000;
let loopTickFn = null;

const CLIENT_TOPBAR_SLOT_KEYS = Object.freeze([
  'context',
  'tps',
  'ttft',
  'cost',
  'quota_auto',
  'gemini_5h',
  'gemini_weekly',
  'claude_5h',
  'claude_weekly',
  'none',
]);

const DEFAULT_CLIENT_TOPBAR_SLOTS = Object.freeze(['context', 'tps', 'quota_auto']);

/**
 * 归一化前端顶栏胶囊三槽位配置数组，非法项回退默认值，且禁止三项同时为 `none`。
 *
 * @param {unknown} raw
 * @returns {[string, string, string]}
 */
function normalizeClientTopbarSlots(raw) {
  const arr = Array.isArray(raw) ? raw : [];
  const slots = [0, 1, 2].map((idx) => {
    const val = String(arr[idx] ?? '').trim();
    return CLIENT_TOPBAR_SLOT_KEYS.includes(val) ? val : DEFAULT_CLIENT_TOPBAR_SLOTS[idx];
  });
  if (slots.every((s) => s === 'none')) {
    slots[0] = 'context';
  }
  return slots;
}

/**
 * 归一化前端插件更新策略（`'off'` | `'manual'` | `'auto'`），兼容旧版布尔字段。
 *
 * @param {unknown} mode
 * @param {unknown} [legacyAutoUpdate]
 * @returns {'off'|'manual'|'auto'}
 */
function normalizeClientUpdateMode(mode, legacyAutoUpdate) {
  const m = String(mode ?? '').trim().toLowerCase();
  if (m === 'off' || m === 'manual' || m === 'auto') return m;
  if (legacyAutoUpdate === true) return 'auto';
  return 'manual';
}

function normalizeClientOrchestratorIdMode(mode) {
  return String(mode ?? '').trim().toLowerCase() === 'full' ? 'full' : 'compact';
}

/**
 * 归一化前端面板挂载方式（`'dual'` | `'composer'` | `'sidebar'`），兼容旧版 `enableWindowOverlay` 布尔字段。
 *
 * @param {unknown} mode
 * @param {unknown} [legacyEnableOverlay]
 * @returns {'dual'|'composer'|'sidebar'}
 */
function normalizeClientWindowMountMode(mode, legacyEnableOverlay) {
  const m = String(mode ?? '').trim().toLowerCase();
  if (m === 'composer' || m === 'input') return 'composer';
  if (m === 'sidebar' || m === 'off') return 'sidebar';
  if (m === 'dual' || m === 'topbar') return 'dual';
  if (legacyEnableOverlay === false) return 'sidebar';
  return 'dual';
}

function isEquivalentTelemetry(prev, next) {
  if (!prev || !next) return false;
  if (prev === next) return true;

  // 1. 比对系统设置项（模型显示策略、Orchestrator ID 显示风格、周预算模式与额度、插件更新策略、双栖与顶栏槽位配置）
  const pAct = prev.activeConversation;
  const nAct = next.activeConversation;
  if (prev.settings?.showUpstreamModel !== next.settings?.showUpstreamModel) return false;
  const prevOrchIdMode = String(prev.settings?.orchestratorIdMode ?? 'compact').trim().toLowerCase() === 'full' ? 'full' : 'compact';
  const nextOrchIdMode = String(next.settings?.orchestratorIdMode ?? 'compact').trim().toLowerCase() === 'full' ? 'full' : 'compact';
  if (prevOrchIdMode !== nextOrchIdMode) {
    return false;
  }
  if (prev.settings?.weeklyLimitMode !== next.settings?.weeklyLimitMode) return false;
  if (prev.settings?.weeklyTokenBudget !== next.settings?.weeklyTokenBudget) return false;
  if (prev.settings?.weeklyCostBudget !== next.settings?.weeklyCostBudget) return false;
  if ((prev.settings?.pluginUpdateMode ?? '') !== (next.settings?.pluginUpdateMode ?? '')) return false;
  if (prev.settings?.autoUpdatePlugin !== next.settings?.autoUpdatePlugin) return false;
  const rawPrevMount = String(prev.settings?.windowMountMode ?? '').trim().toLowerCase();
  const prevMountMode =
    rawPrevMount === 'composer' || rawPrevMount === 'input'
      ? 'composer'
      : rawPrevMount === 'sidebar' || rawPrevMount === 'off'
        ? 'sidebar'
        : rawPrevMount === 'dual' || rawPrevMount === 'topbar'
          ? 'dual'
          : prev.settings?.enableWindowOverlay === false
            ? 'sidebar'
            : 'dual';
  const rawNextMount = String(next.settings?.windowMountMode ?? '').trim().toLowerCase();
  const nextMountMode =
    rawNextMount === 'composer' || rawNextMount === 'input'
      ? 'composer'
      : rawNextMount === 'sidebar' || rawNextMount === 'off'
        ? 'sidebar'
        : rawNextMount === 'dual' || rawNextMount === 'topbar'
          ? 'dual'
          : next.settings?.enableWindowOverlay === false
            ? 'sidebar'
            : 'dual';
  if (prevMountMode !== nextMountMode) return false;
  if (prev.settings?.enableWindowOverlay !== next.settings?.enableWindowOverlay) return false;
  if ((prev.settings?.showTopbarMultiSession !== false) !== (next.settings?.showTopbarMultiSession !== false)) {
    return false;
  }
  const pTopSlots = prev.settings?.topbarCapsuleSlots;
  const nTopSlots = next.settings?.topbarCapsuleSlots;
  if (
    (pTopSlots?.[0] ?? 'context') !== (nTopSlots?.[0] ?? 'context') ||
    (pTopSlots?.[1] ?? 'tps') !== (nTopSlots?.[1] ?? 'tps') ||
    (pTopSlots?.[2] ?? 'quota_auto') !== (nTopSlots?.[2] ?? 'quota_auto')
  ) {
    return false;
  }

  // 2. 比对云端状态（插件当前/最新版本、安装模式、价格表版本与模型数量、同步/更新执行状态及错误信息）
  const pCloud = prev.cloudStatus;
  const nCloud = next.cloudStatus;
  if (
    pCloud?.currentPluginVersion !== nCloud?.currentPluginVersion ||
    pCloud?.latestPluginVersion !== nCloud?.latestPluginVersion ||
    pCloud?.updateAvailable !== nCloud?.updateAvailable ||
    pCloud?.installMode !== nCloud?.installMode ||
    pCloud?.catalogVersion !== nCloud?.catalogVersion ||
    pCloud?.source !== nCloud?.source ||
    pCloud?.lastSyncedAtMs !== nCloud?.lastSyncedAtMs ||
    pCloud?.modelCount !== nCloud?.modelCount ||
    pCloud?.isSyncing !== nCloud?.isSyncing ||
    pCloud?.isUpdating !== nCloud?.isUpdating ||
    pCloud?.lastSyncError !== nCloud?.lastSyncError ||
    pCloud?.lastUpdateError !== nCloud?.lastUpdateError ||
    pCloud?.lastUpdateResult?.updatedAtMs !== nCloud?.lastUpdateResult?.updatedAtMs
  ) {
    return false;
  }

  // 3. 比对活跃会话的实时测速指标（会话 ID、步数、子代理拓扑、运行状态、TPS、TTFT、当前模型标识与费用）
  if (pAct?.cascadeId !== nAct?.cascadeId) return false;
  if (pAct?.stepCount !== nAct?.stepCount) return false;
  if (pAct?.subagentCount !== nAct?.subagentCount) return false;
  if (pAct?.totalStepsAllAgents !== nAct?.totalStepsAllAgents) return false;
  if (pAct?.isRunning !== nAct?.isRunning) return false;
  if (
    pAct?.liveActivity?.signature !== nAct?.liveActivity?.signature ||
    pAct?.liveActivity?.startedAtMs !== nAct?.liveActivity?.startedAtMs
  ) {
    return false;
  }
  if (pAct?.aggregated?.isRunning !== nAct?.aggregated?.isRunning) return false;
  if (
    pAct?.aggregated?.liveActivity?.signature !== nAct?.aggregated?.liveActivity?.signature ||
    pAct?.aggregated?.liveActivity?.startedAtMs !== nAct?.aggregated?.liveActivity?.startedAtMs
  ) {
    return false;
  }
  if (pAct?.aggregated?.liveActivity?.agentId !== nAct?.aggregated?.liveActivity?.agentId) return false;
  if (pAct?.aggregated?.activeAgentId !== nAct?.aggregated?.activeAgentId) return false;
  if (pAct?.aggregated?.activeAgentBadge !== nAct?.aggregated?.activeAgentBadge) return false;
  if (pAct?.aggregated?.latestTokPerSec !== nAct?.aggregated?.latestTokPerSec) return false;
  if (pAct?.aggregated?.latestTtftSec !== nAct?.aggregated?.latestTtftSec) return false;
  if (pAct?.aggregated?.avgTokPerSec !== nAct?.aggregated?.avgTokPerSec) return false;
  if (pAct?.aggregated?.latestStepCostUsd !== nAct?.aggregated?.latestStepCostUsd) return false;
  if (pAct?.aggregated?.sessionCostUsd !== nAct?.aggregated?.sessionCostUsd) return false;
  if (pAct?.aggregated?.sessionUnpricedCalls !== nAct?.aggregated?.sessionUnpricedCalls) return false;
  if (pAct?.aggregated?.sessionCacheHitPct !== nAct?.aggregated?.sessionCacheHitPct) return false;
  if (pAct?.aggregated?.activeModelShort !== nAct?.aggregated?.activeModelShort) return false;
  if (pAct?.aggregated?.activeModelUpstream !== nAct?.aggregated?.activeModelUpstream) return false;
  if (pAct?.aggregated?.latestCacheHitPct !== nAct?.aggregated?.latestCacheHitPct) return false;
  if (pAct?.aggregated?.latestSpeedReason !== nAct?.aggregated?.latestSpeedReason) return false;
  if (pAct?.latestTokPerSec !== nAct?.latestTokPerSec) return false;
  if (pAct?.latestTtftSec !== nAct?.latestTtftSec) return false;
  if (pAct?.avgTokPerSec !== nAct?.avgTokPerSec) return false;
  if (pAct?.latestCacheHitPct !== nAct?.latestCacheHitPct) return false;
  if (pAct?.sessionCacheHitPct !== nAct?.sessionCacheHitPct) return false;
  if (pAct?.latestSpeedReason !== nAct?.latestSpeedReason) return false;
  if (pAct?.ttftSummary?.avgSec !== nAct?.ttftSummary?.avgSec) return false;
  if (pAct?.speedSummary?.sampleCount !== nAct?.speedSummary?.sampleCount) return false;
  if (
    pAct?.activeModelShort !== nAct?.activeModelShort ||
    pAct?.activeModelLabel !== nAct?.activeModelLabel ||
    pAct?.activeModelUpstream !== nAct?.activeModelUpstream
  ) {
    return false;
  }
  if (
    pAct?.latestStepCostUsd !== nAct?.latestStepCostUsd ||
    pAct?.sessionCostUsd !== nAct?.sessionCostUsd ||
    pAct?.sessionUnpricedCalls !== nAct?.sessionUnpricedCalls
  ) {
    return false;
  }

  const pAgents = pAct?.agents || [];
  const nAgents = nAct?.agents || [];
  if (pAgents.length !== nAgents.length) return false;
  for (let i = 0; i < pAgents.length; i++) {
    const pa = pAgents[i];
    const na = nAgents[i];
    if (
      pa?.agentId !== na?.agentId ||
      pa?.role !== na?.role ||
      pa?.stepCount !== na?.stepCount ||
      pa?.isRunning !== na?.isRunning ||
      pa?.liveActivity?.signature !== na?.liveActivity?.signature ||
      pa?.latestTokPerSec !== na?.latestTokPerSec ||
      pa?.latestTtftSec !== na?.latestTtftSec ||
      pa?.avgTokPerSec !== na?.avgTokPerSec ||
      pa?.latestCacheHitPct !== na?.latestCacheHitPct ||
      pa?.sessionCacheHitPct !== na?.sessionCacheHitPct ||
      pa?.latestSpeedReason !== na?.latestSpeedReason ||
      pa?.latestStepCostUsd !== na?.latestStepCostUsd ||
      pa?.sessionCostUsd !== na?.sessionCostUsd ||
      pa?.sessionUnpricedCalls !== na?.sessionUnpricedCalls ||
      pa?.activeModelShort !== na?.activeModelShort ||
      pa?.activeModelUpstream !== na?.activeModelUpstream ||
      pa?.context?.totalTokens !== na?.context?.totalTokens ||
      pa?.context?.compactionLimitTokens !== na?.context?.compactionLimitTokens ||
      pa?.context?.limitTokens !== na?.context?.limitTokens ||
      pa?.context?.messagesTokens !== na?.context?.messagesTokens ||
      pa?.context?.toolResultsTokens !== na?.context?.toolResultsTokens ||
      pa?.context?.assistantTokens !== na?.context?.assistantTokens ||
      pa?.context?.userInputTokens !== na?.context?.userInputTokens ||
      pa?.context?.subagentTokens !== na?.context?.subagentTokens ||
      pa?.context?.checkpointTokens !== na?.context?.checkpointTokens ||
      pa?.context?.systemToolsTokens !== na?.context?.systemToolsTokens ||
      pa?.context?.mcpToolsTokens !== na?.context?.mcpToolsTokens ||
      pa?.context?.skillsTokens !== na?.context?.skillsTokens ||
      pa?.context?.systemPromptTokens !== na?.context?.systemPromptTokens ||
      pa?.context?.userRulesTokens !== na?.context?.userRulesTokens
    ) {
      return false;
    }
    const paSteps = pa?.recentSteps || [];
    const naSteps = na?.recentSteps || [];
    if (paSteps.length !== naSteps.length) return false;
    for (let j = 0; j < paSteps.length; j++) {
      const bs = paSteps[j];
      const as = naSteps[j];
      if (
        bs?.stepIndex !== as?.stepIndex ||
        bs?.modelKey !== as?.modelKey ||
        bs?.modelShort !== as?.modelShort ||
        bs?.modelLabel !== as?.modelLabel ||
        bs?.modelUpstream !== as?.modelUpstream ||
        bs?.responseModel !== as?.responseModel ||
        bs?.modelSource !== as?.modelSource ||
        bs?.costUsd !== as?.costUsd ||
        bs?.tokPerSec !== as?.tokPerSec ||
        bs?.ttftSec !== as?.ttftSec ||
        bs?.outputTokens !== as?.outputTokens ||
        bs?.thinkingTokens !== as?.thinkingTokens ||
        bs?.responseTokens !== as?.responseTokens ||
        bs?.inputTokens !== as?.inputTokens ||
        bs?.cacheReadTokens !== as?.cacheReadTokens ||
        bs?.contextTokens !== as?.contextTokens ||
        bs?.cacheHitPct !== as?.cacheHitPct ||
        bs?.selectedSpeedReason !== as?.selectedSpeedReason
      ) {
        return false;
      }
    }
  }

  // 4. 比对 10 通道上下文窗口构成及近期步骤明细
  const pCtx = pAct?.context;
  const nCtx = nAct?.context;
  if (pCtx?.totalTokens !== nCtx?.totalTokens) return false;
  if (pCtx?.compactionLimitTokens !== nCtx?.compactionLimitTokens) return false;
  if (pCtx?.limitTokens !== nCtx?.limitTokens) return false;
  if (pCtx?.messagesTokens !== nCtx?.messagesTokens) return false;
  if (pCtx?.assistantTokens !== nCtx?.assistantTokens) return false;
  if (pCtx?.toolResultsTokens !== nCtx?.toolResultsTokens) return false;
  if (pCtx?.userInputTokens !== nCtx?.userInputTokens) return false;
  if (pCtx?.subagentTokens !== nCtx?.subagentTokens) return false;
  if (pCtx?.checkpointTokens !== nCtx?.checkpointTokens) return false;
  if (pCtx?.systemToolsTokens !== nCtx?.systemToolsTokens) return false;
  if (pCtx?.mcpToolsTokens !== nCtx?.mcpToolsTokens) return false;
  if (pCtx?.skillsTokens !== nCtx?.skillsTokens) return false;
  if (pCtx?.systemPromptTokens !== nCtx?.systemPromptTokens) return false;
  if (pCtx?.userRulesTokens !== nCtx?.userRulesTokens) return false;
  if ((pAct?.recentSteps?.length || 0) !== (nAct?.recentSteps?.length || 0)) return false;
  for (let i = 0; i < (pAct?.recentSteps?.length || 0); i++) {
    const before = pAct.recentSteps[i], after = nAct.recentSteps[i];
    if (
      before.modelKey !== after.modelKey ||
      before.modelShort !== after.modelShort ||
      before.modelLabel !== after.modelLabel ||
      before.modelUpstream !== after.modelUpstream ||
      before.responseModel !== after.responseModel ||
      before.modelSource !== after.modelSource ||
      before.costUsd !== after.costUsd ||
      before.tokPerSec !== after.tokPerSec ||
      before.ttftSec !== after.ttftSec ||
      before.outputTokens !== after.outputTokens ||
      before.thinkingTokens !== after.thinkingTokens ||
      before.responseTokens !== after.responseTokens ||
      before.inputTokens !== after.inputTokens ||
      before.cacheReadTokens !== after.cacheReadTokens ||
      before.contextTokens !== after.contextTokens ||
      before.cacheHitPct !== after.cacheHitPct ||
      before.selectedSpeedReason !== after.selectedSpeedReason
    ) {
      return false;
    }
  }

  // 5. 比对消费统计所选时间区间、当前会话累计消费与账号全局累计消费
  const pRange = prev.consumption?.selectedRange;
  const nRange = next.consumption?.selectedRange;
  if (pRange?.key !== nRange?.key) return false;
  if (nRange?.key === 'custom') {
    if (pRange?.startMs !== nRange?.startMs || pRange?.endMs !== nRange?.endMs) return false;
  }

  const pCons = prev.consumption?.session;
  const nCons = next.consumption?.session;
  if (pCons?.totalTokens !== nCons?.totalTokens) return false;
  if (pCons?.costUsd !== nCons?.costUsd) return false;
  if (pCons?.unpricedCalls !== nCons?.unpricedCalls) return false;

  const pAcct = prev.consumption?.account;
  const nAcct = next.consumption?.account;
  if (pAcct?.totalTokens !== nAcct?.totalTokens) return false;
  if (pAcct?.inputTokens !== nAcct?.inputTokens) return false;
  if (pAcct?.cacheReadTokens !== nAcct?.cacheReadTokens) return false;
  if (pAcct?.outputTokens !== nAcct?.outputTokens) return false;
  if (pAcct?.calls !== nAcct?.calls) return false;
  if (pAcct?.costUsd !== nAcct?.costUsd) return false;
  if (pAcct?.savedCostUsd !== nAcct?.savedCostUsd) return false;
  if (pAcct?.cacheHitPct !== nAcct?.cacheHitPct) return false;
  if (pAcct?.unpricedCalls !== nAcct?.unpricedCalls) return false;

  // 6. 比对历史趋势时间分桶序列与年度分月序列
  const pTrend = prev.consumption?.trendSeries || [];
  const nTrend = next.consumption?.trendSeries || [];
  if (pTrend.length !== nTrend.length) return false;
  for (let i = 0; i < pTrend.length; i++) {
    if (
      pTrend[i]?.tokens !== nTrend[i]?.tokens ||
      pTrend[i]?.calls !== nTrend[i]?.calls ||
      pTrend[i]?.label !== nTrend[i]?.label ||
      pTrend[i]?.fullLabel !== nTrend[i]?.fullLabel
    ) {
      return false;
    }
  }
  if (prev.consumption?.monthlyYear !== next.consumption?.monthlyYear) return false;
  const pMonthly = prev.consumption?.monthlySeries || [];
  const nMonthly = next.consumption?.monthlySeries || [];
  if (pMonthly.length !== nMonthly.length) return false;
  for (let i = 0; i < pMonthly.length; i++) {
    if (
      pMonthly[i]?.totalTokens !== nMonthly[i]?.totalTokens ||
      pMonthly[i]?.costUsd !== nMonthly[i]?.costUsd ||
      pMonthly[i]?.calls !== nMonthly[i]?.calls
    ) {
      return false;
    }
  }

  // 7. 比对按模型汇总明细与数据来源汇总明细
  const pModels = prev.modelBreakdown || [];
  const nModels = next.modelBreakdown || [];
  if (pModels.length !== nModels.length) return false;
  for (let i = 0; i < pModels.length; i++) {
    if (
      pModels[i]?.label !== nModels[i]?.label ||
      pModels[i]?.shortName !== nModels[i]?.shortName ||
      pModels[i]?.upstreamName !== nModels[i]?.upstreamName ||
      pModels[i]?.costUsd !== nModels[i]?.costUsd ||
      pModels[i]?.unpricedCalls !== nModels[i]?.unpricedCalls ||
      pModels[i]?.totalTokens !== nModels[i]?.totalTokens ||
      pModels[i]?.calls !== nModels[i]?.calls
    ) {
      return false;
    }
  }

  const pSources = prev.consumption?.sourcesBreakdown || [];
  const nSources = next.consumption?.sourcesBreakdown || [];
  if (pSources.length !== nSources.length) return false;
  for (let i = 0; i < pSources.length; i++) {
    if (
      pSources[i]?.name !== nSources[i]?.name ||
      pSources[i]?.costUsd !== nSources[i]?.costUsd ||
      pSources[i]?.unpricedCalls !== nSources[i]?.unpricedCalls ||
      pSources[i]?.totalTokens !== nSources[i]?.totalTokens ||
      pSources[i]?.calls !== nSources[i]?.calls
    ) {
      return false;
    }
  }

  // 8. 比对账号订阅档位与动态多配额池（活跃池、周汇总及各配额池的 5h/周限额进度与重置时间）
  if (
    prev.account?.tierName !== next.account?.tierName ||
    prev.account?.planName !== next.account?.planName ||
    prev.account?.aiCredits !== next.account?.aiCredits
  ) {
    return false;
  }

  if (
    prev.quotas?.meta?.refreshFailed !== next.quotas?.meta?.refreshFailed ||
    prev.quotas?.meta?.isStale !== next.quotas?.meta?.isStale
  ) {
    return false;
  }

  const pQuot = prev.quotas?.activePool;
  const nQuot = next.quotas?.activePool;
  if (pQuot?.family !== nQuot?.family) return false;
  if (pQuot?.usedPct !== nQuot?.usedPct) return false;
  if (pQuot?.remainingPct !== nQuot?.remainingPct) return false;
  if (pQuot?.weeklyUsedPct !== nQuot?.weeklyUsedPct) return false;
  if (pQuot?.weeklyRemainingPct !== nQuot?.weeklyRemainingPct) return false;
  if (prev.quotas?.weekly?.usedPct !== next.quotas?.weekly?.usedPct) return false;
  if (prev.quotas?.weekly?.remainingPct !== next.quotas?.weekly?.remainingPct) return false;
  if (prev.quotas?.weekly?.tokens !== next.quotas?.weekly?.tokens) return false;
  if (prev.quotas?.weekly?.costUsd !== next.quotas?.weekly?.costUsd) return false;
  if (prev.quotas?.weekly?.calls !== next.quotas?.weekly?.calls) return false;
  if (prev.quotas?.weekly?.unpricedCalls !== next.quotas?.weekly?.unpricedCalls) return false;
  if (prev.quotas?.weekly?.resetTime !== next.quotas?.weekly?.resetTime) return false;

  const pPools = prev.quotas?.pools || [];
  const nPools = next.quotas?.pools || [];
  if (pPools.length !== nPools.length) return false;
  for (let i = 0; i < pPools.length; i++) {
    if (
      pPools[i]?.poolKey !== nPools[i]?.poolKey ||
      pPools[i]?.poolLabel !== nPools[i]?.poolLabel ||
      pPools[i]?.usedPct !== nPools[i]?.usedPct ||
      pPools[i]?.remainingPct !== nPools[i]?.remainingPct ||
      pPools[i]?.resetTime !== nPools[i]?.resetTime ||
      pPools[i]?.weeklyUsedPct !== nPools[i]?.weeklyUsedPct ||
      pPools[i]?.weeklyRemainingPct !== nPools[i]?.weeklyRemainingPct ||
      pPools[i]?.weeklyResetTime !== nPools[i]?.weeklyResetTime ||
      pPools[i]?.cycle5h?.tokens !== nPools[i]?.cycle5h?.tokens ||
      pPools[i]?.cycle5h?.costUsd !== nPools[i]?.cycle5h?.costUsd ||
      pPools[i]?.cycle5h?.calls !== nPools[i]?.cycle5h?.calls ||
      pPools[i]?.cycleWeekly?.tokens !== nPools[i]?.cycleWeekly?.tokens ||
      pPools[i]?.cycleWeekly?.costUsd !== nPools[i]?.cycleWeekly?.costUsd ||
      pPools[i]?.cycleWeekly?.calls !== nPools[i]?.cycleWeekly?.calls
    ) {
      return false;
    }
  }

  const pConvs = prev.conversations || [];
  const nConvs = next.conversations || [];
  if (pConvs.length !== nConvs.length) return false;
  for (let i = 0; i < pConvs.length; i++) {
    if (
      pConvs[i]?.cascadeId !== nConvs[i]?.cascadeId ||
      pConvs[i]?.title !== nConvs[i]?.title ||
      pConvs[i]?.status !== nConvs[i]?.status ||
      pConvs[i]?.stepCount !== nConvs[i]?.stepCount ||
      pConvs[i]?.subagentCount !== nConvs[i]?.subagentCount ||
      pConvs[i]?.totalStepCount !== nConvs[i]?.totalStepCount
    ) {
      return false;
    }
  }

  const pRunning = prev.runningConversations || [];
  const nRunning = next.runningConversations || [];
  if (pRunning.length !== nRunning.length) return false;
  for (let i = 0; i < pRunning.length; i++) {
    const pr = pRunning[i];
    const nr = nRunning[i];
    if (
      pr?.cascadeId !== nr?.cascadeId ||
      pr?.title !== nr?.title ||
      pr?.isCurrentSelected !== nr?.isCurrentSelected ||
      pr?.isMainRunning !== nr?.isMainRunning ||
      pr?.subagentCount !== nr?.subagentCount ||
      pr?.runningSubagentCount !== nr?.runningSubagentCount ||
      pr?.mainActivity?.signature !== nr?.mainActivity?.signature ||
      pr?.mainActivity?.startedAtMs !== nr?.mainActivity?.startedAtMs
    ) {
      return false;
    }
    const pSubs = pr?.subagents || [];
    const nSubs = nr?.subagents || [];
    if (pSubs.length !== nSubs.length) return false;
    for (let j = 0; j < pSubs.length; j++) {
      if (
        pSubs[j]?.cascadeId !== nSubs[j]?.cascadeId ||
        pSubs[j]?.role !== nSubs[j]?.role ||
        pSubs[j]?.isRunning !== nSubs[j]?.isRunning ||
        pSubs[j]?.stepCount !== nSubs[j]?.stepCount ||
        pSubs[j]?.liveActivity?.signature !== nSubs[j]?.liveActivity?.signature ||
        pSubs[j]?.liveActivity?.startedAtMs !== nSubs[j]?.liveActivity?.startedAtMs
      ) {
        return false;
      }
    }
  }

  return true;
}

async function fetchTelemetry({ force = false } = {}) {
  if (!force && activeForceCount > 0) {
    return telemetryStore.getState().telemetry;
  }

  const st = telemetryStore.getState();
  const reqSeq = ++latestRequestSeq;
  const startMs = Date.now();

  if (force) {
    activeForceCount += 1;
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    telemetryStore.setState({ syncState: 'syncing' });
  }

  try {
    if (isWindowOverlayMode()) {
      const liveRouteId = extractHostRouteCascadeId();
      if (liveRouteId !== st.hostRouteConversationId) {
        const patch = { hostRouteConversationId: liveRouteId };
        if (liveRouteId && st.selectedConversationId && st.selectedConversationId !== liveRouteId) {
          patch.selectedConversationId = '';
        }
        telemetryStore.setState(patch);
      }
    }
    const curSt = telemetryStore.getState();
    const effectiveConvId = curSt.selectedConversationId || curSt.hostRouteConversationId || '';
    const params = new URLSearchParams();
    if (effectiveConvId) {
      params.set('conversationId', effectiveConvId);
    }
    if (curSt.selectedTimeRange) {
      params.set('range', curSt.selectedTimeRange);
    }
    if (curSt.selectedTimeRange === 'custom') {
      if (curSt.customStartMs > 0) params.set('startMs', String(curSt.customStartMs));
      if (curSt.customEndMs > 0) params.set('endMs', String(curSt.customEndMs));
    }
    if (force) {
      params.set('force', '1');
    }
    const qs = params.toString();
    const payload = await callSidecarApi(`/api/telemetry${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      abortKey: force ? 'telemetry-force' : 'telemetry-poll',
    });

    if (reqSeq !== latestRequestSeq) {
      return payload;
    }

    if (payload?.uiBundleVersion) {
      if (activeBundleVersion && activeBundleVersion !== payload.uiBundleVersion) {
        if (
          !isWindowOverlayMode() &&
          typeof window !== 'undefined' &&
          typeof window.location?.reload === 'function'
        ) {
          window.location.reload();
          return payload;
        }
      }
      activeBundleVersion = payload.uiBundleVersion;
    }

    const latestSt = telemetryStore.getState();
    if (force) {
      const elapsed = Date.now() - startMs;
      if (elapsed < 220) {
        await new Promise((r) => setTimeout(r, 220 - elapsed));
      }
      if (reqSeq !== latestRequestSeq) {
        return payload;
      }
      if (feedbackTimer) clearTimeout(feedbackTimer);
      telemetryStore.setState({
        telemetry: payload,
        minuteTick: Math.floor(Date.now() / 30000),
        syncState: 'synced',
      });
      feedbackTimer = setTimeout(() => {
        feedbackTimer = null;
        telemetryStore.setState({ syncState: 'idle' });
      }, 1100);
    } else {
      const isSame = isEquivalentTelemetry(latestSt.telemetry, payload);
      const nextTelemetry = isSame ? latestSt.telemetry : payload;
      telemetryStore.setState({
        telemetry: nextTelemetry,
        minuteTick: Math.floor(Date.now() / 30000),
        syncState: latestSt.syncState === 'synced' ? 'synced' : 'idle',
      });
    }
    return payload;
  } catch (err) {
    if (err?.name === 'AbortError' || reqSeq !== latestRequestSeq) return null;
    telemetryStore.setState({ syncState: 'error' });
    return null;
  } finally {
    if (force) {
      activeForceCount = Math.max(0, activeForceCount - 1);
      if (activeForceCount === 0 && loopActive && loopTickFn && !pollTimer) {
        pollTimer = setTimeout(loopTickFn, loopIntervalMs);
      }
    }
  }
}

async function saveSettingsPatch(patch) {
  const safePatch = patch && typeof patch === 'object' ? { ...patch } : {};
  if (Object.prototype.hasOwnProperty.call(safePatch, 'weeklyLimitMode')) {
    const mode = safePatch.weeklyLimitMode;
    safePatch.weeklyLimitMode =
      mode === 'custom_tokens' || mode === 'custom_cost' ? mode : 'official';
  }
  if (Object.prototype.hasOwnProperty.call(safePatch, 'showTopbarMultiSession')) {
    safePatch.showTopbarMultiSession = Boolean(safePatch.showTopbarMultiSession);
  }
  if (Object.prototype.hasOwnProperty.call(safePatch, 'topbarCapsuleSlots')) {
    safePatch.topbarCapsuleSlots = normalizeClientTopbarSlots(safePatch.topbarCapsuleSlots);
  }
  if (Object.prototype.hasOwnProperty.call(safePatch, 'orchestratorIdMode')) {
    safePatch.orchestratorIdMode = normalizeClientOrchestratorIdMode(safePatch.orchestratorIdMode);
  }
  if (Object.prototype.hasOwnProperty.call(safePatch, 'windowMountMode')) {
    const normMount = normalizeClientWindowMountMode(
      safePatch.windowMountMode,
      safePatch.enableWindowOverlay
    );
    safePatch.windowMountMode = normMount;
    safePatch.enableWindowOverlay = normMount !== 'sidebar';
  } else if (Object.prototype.hasOwnProperty.call(safePatch, 'enableWindowOverlay')) {
    safePatch.enableWindowOverlay = Boolean(safePatch.enableWindowOverlay);
    safePatch.windowMountMode = safePatch.enableWindowOverlay ? 'dual' : 'sidebar';
  }
  const prevTelemetry = telemetryStore.getState().telemetry;
  if (prevTelemetry?.settings) {
    telemetryStore.setState({
      telemetry: {
        ...prevTelemetry,
        settings: { ...prevTelemetry.settings, ...safePatch },
      },
    });
  }
  try {
    await callSidecarApi('/api/settings', { method: 'POST', body: safePatch });
  } catch (err) {
    if (prevTelemetry) {
      telemetryStore.setState({ telemetry: prevTelemetry });
    }
    throw err;
  }
  await fetchTelemetry({ force: true });
}

async function triggerCloudSync() {
  const res = await callSidecarApi('/api/cloud-sync', { method: 'POST', body: {} });
  await fetchTelemetry({ force: true });
  return res;
}

async function triggerPluginUpdate() {
  const res = await callSidecarApi('/api/plugin-update', { method: 'POST', body: {} });
  if (res?.ok && res?.restarting) {
    await new Promise((r) => setTimeout(r, 1100));
    if (
      !isWindowOverlayMode() &&
      typeof window !== 'undefined' &&
      typeof window.location?.reload === 'function'
    ) {
      window.location.reload();
      return res;
    }
  }
  await fetchTelemetry({ force: true });
  return res;
}

function startAsyncTelemetryLoop(intervalMs = 2000) {
  stopAsyncTelemetryLoop();
  loopActive = true;
  loopIntervalMs = intervalMs;

  const resolveNextDelay = () => {
    if (isWindowOverlayMode() && typeof document !== 'undefined' && document.hidden) {
      return Math.max(loopIntervalMs, 8000);
    }
    return loopIntervalMs;
  };

  const tick = async () => {
    pollTimer = null;
    if (!loopActive) return;
    await fetchTelemetry({ force: false });
    if (!loopActive || activeForceCount > 0) return;
    if (!pollTimer) {
      pollTimer = setTimeout(tick, resolveNextDelay());
    }
  };
  loopTickFn = tick;

  tick();
  return () => {
    stopAsyncTelemetryLoop();
  };
}

function stopAsyncTelemetryLoop() {
  loopActive = false;
  loopTickFn = null;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }
}

/**
 * 根据代理索引返回对应的微边框语义徽章样式类名。
 *
 * @param {number} [index=0]
 * @param {boolean} [isMain=false]
 * @returns {string}
 */
function getAgentBadgeClass(index = 0, isMain = false) {
  if (isMain || index <= 0) return 'badge-main';
  const slot = ((index - 1) % 3) + 1;
  return `badge-sub-${slot}`;
}

/**
 * 格式化主/子代理的完整显示名称（如 `子代理 #1 · Codebase Researcher`）。
 *
 * @param {object|null|undefined} agent
 * @returns {string}
 */
function formatAgentLabel(agent) {
  if (!agent) return '主代理';
  if (agent.isMain) return agent.shortLabel || '主代理';
  const rolePart = agent.role && agent.role !== '子代理' ? ` · ${agent.role}` : '';
  return `${agent.shortLabel || '子代理'}${rolePart}`;
}

/**
 * 解析当前选中的主/子代理作用域视图数据与独立上下文窗口检视目标。
 * 同时在客户端按需组装主代理与全部汇总的 `recentSteps`，避免后端 JSON 载荷重复序列化 2-3 倍步骤列表。
 *
 * @param {object|null} telemetry
 * @param {string} [selectedAgentScope='all']
 * @param {string} [ctxInspectorAgentId='auto']
 */
function resolveScopedConversation(
  telemetry,
  selectedAgentScope = 'all',
  ctxInspectorAgentId = 'auto'
) {
  const active = telemetry?.activeConversation || {};
  const agents = Array.isArray(active.agents) && active.agents.length > 0 ? active.agents : [];
  const hasSubagents = Boolean(active.hasSubagents && agents.length > 1);
  const subagents = agents.filter((a) => !a.isMain);
  const mainAgent = agents.find((a) => a.isMain) || active;
  if (mainAgent && !Array.isArray(mainAgent.recentSteps) && Array.isArray(active.recentSteps)) {
    mainAgent.recentSteps = active.recentSteps;
  }
  const aggregated = active.aggregated || active;
  if (hasSubagents && aggregated && !Array.isArray(aggregated.recentSteps)) {
    const combined = [];
    for (const ag of agents) {
      const steps = ag.isMain ? ag.recentSteps || active.recentSteps || [] : ag.recentSteps || [];
      combined.push(...steps);
    }
    combined.sort(
      (a, b) =>
        (b.createdAtMs || 0) - (a.createdAtMs || 0) ||
        (b.agentIndex || 0) - (a.agentIndex || 0) ||
        (b.stepIndex || 0) - (a.stepIndex || 0)
    );
    aggregated.recentSteps = combined;
  }

  if (!hasSubagents) {
    return {
      hasSubagents: false,
      effectiveScope: 'main',
      effectiveCtxScope: 'main',
      agents,
      subagents: [],
      mainAgent,
      aggregated,
      scopedConv: active,
      ctxAgent: mainAgent,
    };
  }

  const isValidSub = subagents.some((s) => s.agentId === selectedAgentScope);
  const effectiveScope =
    selectedAgentScope === 'main'
      ? 'main'
      : isValidSub
        ? selectedAgentScope
        : 'all';

  const scopedConv =
    effectiveScope === 'all'
      ? aggregated
      : agents.find((a) => a.agentId === effectiveScope) || mainAgent;

  let ctxAgent = scopedConv;
  let effectiveCtxScope = effectiveScope;
  if (effectiveScope === 'all') {
    if (ctxInspectorAgentId && ctxInspectorAgentId !== 'auto') {
      const matched = agents.find((a) => a.agentId === ctxInspectorAgentId);
      if (matched) {
        ctxAgent = matched;
        effectiveCtxScope = matched.agentId;
      } else {
        effectiveCtxScope = 'auto';
      }
    } else {
      effectiveCtxScope = 'auto';
    }
    if (effectiveCtxScope === 'auto') {
      ctxAgent =
        agents.find((a) => a.agentId === aggregated.activeAgentId) ||
        agents.find((a) => a.isRunning) ||
        mainAgent;
    }
  }

  return {
    hasSubagents: true,
    effectiveScope,
    effectiveCtxScope,
    agents,
    subagents,
    mainAgent,
    aggregated,
    scopedConv,
    ctxAgent,
  };
}

// --- src/components/ui/TopLongPillNav.js ---
/**
 * @fileoverview Top Long-Pill Navigation Bar (顶部唯一长药丸功能分割栏).
 * Splits the application into focused single-viewport views and animates
 * the active glider using GPU-accelerated translate3d.
 */


const TopLongPillNav = defineComponent({
  name: 'TopLongPillNav',
  setup({ getProps, emit }) {
    const glider = h('div', { className: 'pill-glider', 'aria-hidden': 'true' });
    const navEl = h(
      'nav',
      {
        className: 'long-pill-nav',
        role: 'tablist',
        'aria-label': '主功能视图分割导航',
      },
      [glider]
    );

    const tabButtons = new Map();

    function selectValue(nextVal) {
      const current = getProps().modelValue;
      if (nextVal !== current) {
        emit('update:modelValue', nextVal);
      }
    }

    function syncTabs() {
      const { items = [], modelValue } = getProps();
      patchStyleVar(navEl, '--pill-count', Math.max(1, items.length));

      const validValues = new Set(items.map((it) => it.value));
      for (const [val, entry] of tabButtons.entries()) {
        if (!validValues.has(val)) {
          if (entry.btn?.parentNode === navEl) {
            navEl.removeChild(entry.btn);
          }
          tabButtons.delete(val);
        }
      }

      let activeIdx = 0;
      items.forEach((item, index) => {
        if (item.value === modelValue) {
          activeIdx = index;
        }
        let entry = tabButtons.get(item.value);
        if (!entry) {
          const iconEl = item.icon ? createSvgIcon(item.icon, { size: 14 }) : null;
          const labelEl = h('span', { className: 'pill-tab-label', text: item.label });
          const badgeEl = h('span', { className: 'pill-tab-badge', hidden: true });
          const btn = h(
            'button',
            {
              type: 'button',
              role: 'tab',
              className: 'pill-tab',
              dataset: { pillValue: item.value },
              onClick: () => selectValue(item.value),
              onKeydown: (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const curItems = getProps().items || [];
                  if (!curItems.length) return;
                  const curIndex = Math.max(
                    0,
                    curItems.findIndex((it) => it.value === item.value)
                  );
                  const delta = e.key === 'ArrowRight' ? 1 : -1;
                  const nextIndex = (curIndex + delta + curItems.length) % curItems.length;
                  const target = curItems[nextIndex];
                  if (target) {
                    selectValue(target.value);
                    tabButtons.get(target.value)?.btn?.focus();
                  }
                }
              },
            },
            [iconEl, labelEl, badgeEl]
          );
          entry = { btn, labelEl, badgeEl };
          tabButtons.set(item.value, entry);
          navEl.appendChild(btn);
        }

        patchText(entry.labelEl, item.label);
        if (item.badge !== undefined && item.badge !== null && item.badge !== '') {
          patchAttr(entry.badgeEl, 'hidden', false);
          patchText(entry.badgeEl, `(${item.badge})`);
        } else {
          patchAttr(entry.badgeEl, 'hidden', true);
        }

        const isActive = item.value === modelValue;
        patchClasses(entry.btn, { 'is-active': isActive });
        patchAttr(entry.btn, 'aria-selected', isActive ? 'true' : 'false');
        patchAttr(entry.btn, 'tabindex', isActive ? '0' : '-1');
      });

      patchStyleVar(navEl, '--active-index', activeIdx);
    }

    syncTabs();

    return {
      el: navEl,
      refs: { glider, tabButtons },
      onPropsChange: syncTabs,
      getValue: () => getProps().modelValue,
    };
  },
});

// --- src/components/ui/CustomSelect.js ---
/**
 * @fileoverview Bespoke CustomSelect dropdown component replacing native <select> / <option>.
 * Supports both single-select and multi-select (`multiple: true`) modes, with incremental
 * option patching while open without losing focus or closing the menu.
 */


function normalizeMultiSelection(rawValue, options = [], allValue = '') {
  const arr = Array.isArray(rawValue)
    ? rawValue
    : rawValue !== undefined && rawValue !== null && rawValue !== ''
      ? [rawValue]
      : [];
  const clean = [];
  const seen = new Set();
  for (const item of arr) {
    const str = String(item ?? '');
    if (!str || seen.has(str)) continue;
    seen.add(str);
    clean.push(str);
  }
  if (allValue && (clean.length === 0 || clean.includes(allValue))) {
    return [allValue];
  }
  if (options.length > 0) {
    const validSet = new Set(options.map((o) => String(o.value)));
    const filtered = clean.filter((v) => validSet.has(v));
    if (filtered.length > 0) return filtered;
    return allValue ? [allValue] : [];
  }
  return clean;
}

function sameStringArray(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const CustomSelect = defineComponent({
  name: 'CustomSelect',
  setup({ getProps, setProps, emit, onCleanup }) {
    let isOpen = false;
    let focusedIndex = -1;

    const initialIcon = getProps().icon;
    const leadIcon = createSvgIcon(initialIcon || 'bolt', { size: 13 });
    patchAttr(leadIcon, 'hidden', !initialIcon);
    const triggerLabel = h('span', { className: 'select-label' });
    const chevronIcon = createSvgIcon('chevron-down', { size: 13 });

    const triggerBtn = h(
      'button',
      {
        type: 'button',
        className: 'select-trigger',
        role: 'combobox',
        'aria-expanded': 'false',
        'aria-haspopup': 'listbox',
        onClick: (e) => {
          e.stopPropagation();
          toggleOpen(!isOpen);
        },
        onKeydown: handleKeydown,
      },
      [leadIcon, triggerLabel, chevronIcon]
    );

    const menuEl = h('div', {
      className: 'select-menu',
      role: 'listbox',
      hidden: true,
    });

    const initialClass = [
      'custom-select',
      getProps().multiple ? 'is-multi' : '',
      getProps().className,
    ]
      .filter(Boolean)
      .join(' ');
    const rootEl = h('div', { className: initialClass }, [triggerBtn, menuEl]);

    function getSelectedSet() {
      const { multiple, modelValue, options = [], allValue = '' } = getProps();
      if (!multiple) {
        return new Set(modelValue !== undefined && modelValue !== null ? [modelValue] : []);
      }
      return new Set(normalizeMultiSelection(modelValue, options, allValue));
    }

    function toggleOpen(nextOpen) {
      isOpen = Boolean(nextOpen);
      patchClasses(rootEl, { 'is-open': isOpen });
      patchAttr(triggerBtn, 'aria-expanded', isOpen ? 'true' : 'false');
      patchAttr(menuEl, 'hidden', !isOpen);
      patchSvgIcon(chevronIcon, isOpen ? 'chevron-up' : 'chevron-down');
      if (isOpen) {
        const opts = getProps().options || [];
        const selSet = getSelectedSet();
        focusedIndex = Math.max(
          0,
          opts.findIndex((o) => selSet.has(o.value))
        );
        renderMenuOptions();
      }
    }

    function chooseOption(option) {
      if (!option) return;
      const { multiple, options = [], allValue = '', collapseAll = false } = getProps();
      if (!multiple) {
        const prevVal = getProps().modelValue;
        toggleOpen(false);
        if (option.value !== prevVal) {
          setProps({ modelValue: option.value });
          emit('update:modelValue', option.value);
        }
        return;
      }

      const prevList = normalizeMultiSelection(getProps().modelValue, options, allValue);
      const val = String(option.value);
      let nextList;
      if (allValue && val === allValue) {
        nextList = [allValue];
      } else {
        const base = prevList.filter((v) => v !== allValue);
        if (base.includes(val)) {
          const rest = base.filter((v) => v !== val);
          nextList = rest.length > 0 ? rest : allValue ? [allValue] : [val];
        } else {
          const addedSet = new Set([...base, val]);
          const ordered = options
            .filter((o) => String(o.value) !== allValue && addedSet.has(String(o.value)))
            .map((o) => String(o.value));
          nextList = ordered.length > 0 ? ordered : [...base, val];
          if (collapseAll && allValue) {
            const nonAllTotal = options.filter((o) => String(o.value) !== allValue).length;
            if (nonAllTotal > 0 && nextList.length >= nonAllTotal) {
              nextList = [allValue];
            }
          }
        }
      }

      if (!sameStringArray(prevList, nextList)) {
        setProps({ modelValue: nextList });
        emit('update:modelValue', nextList);
      } else {
        renderMenuOptions();
      }
    }

    function handleKeydown(e) {
      const opts = getProps().options || [];
      if (!opts.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          toggleOpen(true);
        } else {
          focusedIndex = (focusedIndex + 1) % opts.length;
          renderMenuOptions();
          menuEl.children[focusedIndex]?.scrollIntoView?.({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen) {
          toggleOpen(true);
        } else {
          focusedIndex = (focusedIndex - 1 + opts.length) % opts.length;
          renderMenuOptions();
          menuEl.children[focusedIndex]?.scrollIntoView?.({ block: 'nearest' });
        }
      } else if ((e.key === 'Enter' || (e.key === ' ' && isOpen && getProps().multiple)) && isOpen) {
        e.preventDefault();
        const target = opts[focusedIndex];
        if (target) chooseOption(target);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        toggleOpen(false);
      }
    }

    function renderMenuOptions() {
      const { options = [], multiple = false } = getProps();
      const selSet = getSelectedSet();
      patchAttr(menuEl, 'aria-multiselectable', multiple ? 'true' : null);
      patchKeyedList(menuEl, options, {
        keyFn: (opt) => opt.value,
        sigFn: (opt, idx) =>
          `${multiple}::${opt.value}::${opt.label}::${opt.meta || ''}::${selSet.has(opt.value)}::${idx === focusedIndex}`,
        createRow: (opt) => {
          const checkboxIcon = createSvgIcon('check', { size: 10 });
          const checkboxBox = h('span', { className: 'select-checkbox', hidden: true }, [
            checkboxIcon,
          ]);
          const textSpan = h('span', { className: 'select-option-text' });
          const metaSpan = h('span', { className: 'text-muted select-option-meta' });
          const checkIcon = createSvgIcon('check', { size: 12 });
          const btn = h(
            'button',
            {
              type: 'button',
              role: 'option',
              className: 'select-option',
              onClick: (e) => {
                e.stopPropagation();
                const latestOpt =
                  (getProps().options || []).find((o) => o.value === opt.value) || opt;
                chooseOption(latestOpt);
              },
            },
            [checkboxBox, textSpan, metaSpan, checkIcon]
          );
          return { el: btn, refs: { checkboxBox, checkboxIcon, textSpan, metaSpan, checkIcon } };
        },
        updateRow: (refs, opt, idx, el) => {
          const isMulti = Boolean(getProps().multiple);
          const selected = selSet.has(opt.value);
          const focused = idx === focusedIndex;
          patchAttr(refs.checkboxBox, 'hidden', !isMulti);
          patchClasses(refs.checkboxBox, { 'is-checked': selected });
          patchAttr(refs.checkboxIcon, 'hidden', !selected);
          patchText(refs.textSpan, opt.label);
          patchText(refs.metaSpan, opt.meta || '');
          patchAttr(refs.metaSpan, 'hidden', !opt.meta);
          patchAttr(refs.checkIcon, 'hidden', isMulti || !selected);
          patchClasses(el, {
            'is-selected': selected,
            'is-focused': focused,
          });
          patchAttr(el, 'aria-selected', selected ? 'true' : 'false');
          patchAttr(el, 'data-value', opt.value);
        },
      });
    }

    function syncTriggerAndMenu() {
      const {
        options = [],
        modelValue,
        placeholder = '请选择',
        icon,
        multiple = false,
        allValue = '',
        multiUnit = '项',
      } = getProps();
      patchClasses(rootEl, { 'is-multi': Boolean(multiple) });
      patchAttr(leadIcon, 'hidden', !icon);
      if (icon) {
        patchSvgIcon(leadIcon, icon);
      }

      let labelText = placeholder;
      let titleText = placeholder;

      if (multiple) {
        const vals = normalizeMultiSelection(modelValue, options, allValue);
        if ((allValue && vals.includes(allValue)) || vals.length === 0) {
          const allOpt = options.find((o) => String(o.value) === allValue);
          labelText = allOpt ? allOpt.label : placeholder;
          titleText = labelText;
        } else if (vals.length === 1) {
          const singleOpt = options.find((o) => String(o.value) === vals[0]);
          labelText = singleOpt ? singleOpt.label : vals[0];
          titleText = labelText;
        } else {
          const names = vals.map((v) => options.find((o) => String(o.value) === v)?.label || v);
          labelText = `已选 ${vals.length} ${multiUnit}`;
          titleText = `已选 (${vals.length})：${names.join('、')}`;
        }
      } else {
        const matchedOpt = options.find((o) => o.value === modelValue);
        const selectedOpt = matchedOpt || (!modelValue ? options[0] : undefined);
        const fallbackText = modelValue
          ? `${placeholder} (${String(modelValue).slice(0, 8)})`
          : placeholder;
        labelText = selectedOpt ? selectedOpt.label : fallbackText;
        titleText = labelText;
      }

      patchText(triggerLabel, labelText);
      patchAttr(triggerBtn, 'title', titleText);
      if (isOpen) {
        renderMenuOptions();
      }
    }

    const handleDocClick = (e) => {
      if (isOpen && !isEventInside(e, rootEl)) {
        toggleOpen(false);
      }
    };

    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('click', handleDocClick, true);
      onCleanup(() => document.removeEventListener('click', handleDocClick, true));
    }

    syncTriggerAndMenu();

    return {
      el: rootEl,
      refs: { triggerBtn, triggerLabel, menuEl },
      onPropsChange: syncTriggerAndMenu,
      methods: {
        close: () => toggleOpen(false),
      },
    };
  },
});

// --- src/components/ui/CustomNumberInput.js ---
/**
 * @fileoverview Bespoke CustomNumberInput spinbutton & precision stepper.
 * Replaces native <input type="number"> with custom SVG step controls,
 * keyboard ArrowUp/ArrowDown (+Shift 10x), and min/max clamping.
 */


const CustomNumberInput = defineComponent({
  name: 'CustomNumberInput',
  setup({ getProps, setProps, emit }) {
    function clampValue(raw) {
      const { min = -Infinity, max = Infinity, precision = 0 } = getProps();
      const num = Number(raw);
      if (!Number.isFinite(num)) {
        return Number(getProps().modelValue ?? (Number.isFinite(min) ? min : 0));
      }
      const clamped = Math.min(max, Math.max(min, num));
      return precision > 0 ? Number(clamped.toFixed(precision)) : Math.round(clamped);
    }

    function applyStep(direction, multiplier = 1) {
      const { step = 1, modelValue = 0 } = getProps();
      const current = Number(modelValue) || 0;
      const next = clampValue(current + direction * step * multiplier);
      syncFieldDisplay(next);
      if (next !== current) {
        setProps({ modelValue: next });
        emit('update:modelValue', next);
      }
    }

    const decBtn = h(
      'button',
      {
        type: 'button',
        className: 'num-step-btn',
        'aria-label': '减少数值',
        onClick: (e) => {
          e.preventDefault();
          applyStep(-1, e.shiftKey ? 10 : 1);
        },
      },
      [createSvgIcon('minus', { size: 12 })]
    );

    const incBtn = h(
      'button',
      {
        type: 'button',
        className: 'num-step-btn',
        'aria-label': '增加数值',
        onClick: (e) => {
          e.preventDefault();
          applyStep(1, e.shiftKey ? 10 : 1);
        },
      },
      [createSvgIcon('plus', { size: 12 })]
    );

    const textField = h('input', {
      type: 'text',
      inputmode: 'decimal',
      role: 'spinbutton',
      className: 'num-field',
      onKeydown: (e) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          applyStep(1, e.shiftKey ? 10 : 1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          applyStep(-1, e.shiftKey ? 10 : 1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          commitManualInput();
        }
      },
      onBlur: () => commitManualInput(),
    });

    function commitManualInput() {
      const raw = String(textField.value ?? '').trim();
      if (!raw || !/\d/.test(raw)) {
        syncFieldDisplay(getProps().modelValue);
        return;
      }
      const cleaned = raw.replace(/[^0-9.-]/g, '');
      const parsed = Number(cleaned);
      if (!Number.isFinite(parsed)) {
        syncFieldDisplay(getProps().modelValue);
        return;
      }
      const next = clampValue(parsed);
      const prev = Number(getProps().modelValue);
      syncFieldDisplay(next);
      if (next !== prev) {
        setProps({ modelValue: next });
        emit('update:modelValue', next);
      }
    }

    function syncFieldDisplay(val = getProps().modelValue) {
      const { min, max } = getProps();
      const normalized = clampValue(val);
      if (textField.value !== String(normalized)) {
        textField.value = String(normalized);
      }
      patchAttr(textField, 'aria-valuenow', normalized);
      if (Number.isFinite(min)) patchAttr(textField, 'aria-valuemin', min);
      if (Number.isFinite(max)) patchAttr(textField, 'aria-valuemax', max);
    }

    const rootEl = h('div', { className: 'number-input' }, [decBtn, textField, incBtn]);
    syncFieldDisplay();

    return {
      el: rootEl,
      refs: { decBtn, incBtn, textField },
      onPropsChange: () => syncFieldDisplay(),
      methods: {
        commit: () => commitManualInput(),
      },
    };
  },
});

// --- src/components/ui/CustomDateTimePicker.js ---
/**
 * @fileoverview Bespoke CustomDateTimePicker calendar matrix and hour/minute stepper.
 * Replaces native <input type="datetime-local"> and emits Unix epoch ms.
 */


const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function buildCalendarDays(viewYear, viewMonth, selectedDate) {
  const firstDay = new Date(viewYear, viewMonth, 1);
  // Convert Sunday=0..Saturday=6 into Monday=0..Sunday=6
  const startOffset = (firstDay.getDay() + 6) % 7;
  const cells = [];

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(viewYear, viewMonth, 1 - startOffset + i);
    const y = cellDate.getFullYear();
    const m = cellDate.getMonth();
    const d = cellDate.getDate();
    const isCurrentMonth = m === viewMonth;
    const isSelected =
      selectedDate &&
      selectedDate.getFullYear() === y &&
      selectedDate.getMonth() === m &&
      selectedDate.getDate() === d;

    cells.push({
      key: `${y}-${m}-${d}`,
      year: y,
      month: m,
      day: d,
      isCurrentMonth,
      isSelected,
    });
  }
  return cells;
}

const CustomDateTimePicker = defineComponent({
  name: 'CustomDateTimePicker',
  setup({ getProps, emit, onCleanup }) {
    let isOpen = false;
    const initialDate = new Date(getProps().modelValue || Date.now());
    let viewYear = initialDate.getFullYear();
    let viewMonth = initialDate.getMonth();

    const triggerText = h('span', { className: 'text-mono' });
    const triggerBtn = h(
      'button',
      {
        type: 'button',
        className: 'dt-trigger',
        'aria-expanded': 'false',
        onClick: (e) => {
          e.stopPropagation();
          togglePopover(!isOpen);
        },
      },
      [createSvgIcon('calendar', { size: 13 }), triggerText]
    );

    const monthTitle = h('span', { className: 'text-mono' });
    const prevMonthBtn = h(
      'button',
      {
        type: 'button',
        className: 'icon-btn',
        'aria-label': '上个月',
        onClick: (e) => {
          e.stopPropagation();
          viewMonth -= 1;
          if (viewMonth < 0) {
            viewMonth = 11;
            viewYear -= 1;
          }
          renderCalendar();
        },
      },
      [createSvgIcon('chevron-left', { size: 12 })]
    );

    const nextMonthBtn = h(
      'button',
      {
        type: 'button',
        className: 'icon-btn',
        'aria-label': '下个月',
        onClick: (e) => {
          e.stopPropagation();
          viewMonth += 1;
          if (viewMonth > 11) {
            viewMonth = 0;
            viewYear += 1;
          }
          renderCalendar();
        },
      },
      [createSvgIcon('chevron-right', { size: 12 })]
    );

    const navBar = h('div', { className: 'dt-nav' }, [prevMonthBtn, monthTitle, nextMonthBtn]);

    const weekdayRow = h(
      'div',
      { className: 'dt-weekdays' },
      WEEKDAYS.map((w) => h('span', { className: 'dt-weekday', text: w }))
    );

    const daysGrid = h('div', { className: 'dt-days' });

    const hourValSpan = h('strong', { className: 'text-mono', text: '00' });
    const minValSpan = h('strong', { className: 'text-mono', text: '00' });

    function adjustTime(part, delta) {
      const cur = new Date(getProps().modelValue || Date.now());
      if (part === 'hour') {
        cur.setHours(cur.getHours() + delta);
      } else {
        cur.setMinutes(cur.getMinutes() + delta);
      }
      const nextMs = cur.getTime();
      viewYear = cur.getFullYear();
      viewMonth = cur.getMonth();
      emit('update:modelValue', nextMs);
    }

    const timeRow = h('div', { className: 'dt-time-row' }, [
      h('span', { className: 'text-muted', text: '时 / 分' }),
      h('div', { className: 'dt-time-controls' }, [
        h('div', { className: 'dt-mini-step' }, [
          h('button', {
            type: 'button',
            className: 'dt-mini-btn',
            text: '-',
            onClick: (e) => {
              e.stopPropagation();
              adjustTime('hour', -1);
            },
          }),
          hourValSpan,
          h('button', {
            type: 'button',
            className: 'dt-mini-btn',
            text: '+',
            onClick: (e) => {
              e.stopPropagation();
              adjustTime('hour', 1);
            },
          }),
        ]),
        h('span', { text: ':' }),
        h('div', { className: 'dt-mini-step' }, [
          h('button', {
            type: 'button',
            className: 'dt-mini-btn',
            text: '-',
            onClick: (e) => {
              e.stopPropagation();
              adjustTime('minute', -5);
            },
          }),
          minValSpan,
          h('button', {
            type: 'button',
            className: 'dt-mini-btn',
            text: '+',
            onClick: (e) => {
              e.stopPropagation();
              adjustTime('minute', 5);
            },
          }),
        ]),
      ]),
    ]);

    const popoverEl = h(
      'div',
      {
        className: 'dt-popover',
        hidden: true,
      },
      [navBar, weekdayRow, daysGrid, timeRow]
    );

    const rootEl = h('div', { className: 'datetime-picker' }, [triggerBtn, popoverEl]);

    function togglePopover(nextOpen) {
      isOpen = Boolean(nextOpen);
      patchAttr(popoverEl, 'hidden', !isOpen);
      patchAttr(triggerBtn, 'aria-expanded', isOpen ? 'true' : 'false');
      if (isOpen) {
        const cur = new Date(getProps().modelValue || Date.now());
        viewYear = cur.getFullYear();
        viewMonth = cur.getMonth();
        renderCalendar();
      }
    }

    function selectDay(cell) {
      const cur = new Date(getProps().modelValue || Date.now());
      cur.setFullYear(cell.year, cell.month, cell.day);
      const nextMs = cur.getTime();
      viewYear = cell.year;
      viewMonth = cell.month;
      emit('update:modelValue', nextMs);
    }

    function renderCalendar() {
      const cur = new Date(getProps().modelValue || Date.now());
      const pad = (n) => String(n).padStart(2, '0');
      patchText(monthTitle, `${viewYear}-${pad(viewMonth + 1)}`);
      patchText(hourValSpan, pad(cur.getHours()));
      patchText(minValSpan, pad(cur.getMinutes()));

      const cells = buildCalendarDays(viewYear, viewMonth, cur);
      patchKeyedList(daysGrid, cells, {
        keyFn: (c) => c.key,
        sigFn: (c) => `${c.key}:${c.isCurrentMonth}:${c.isSelected}`,
        createRow: (cell) => {
          const btn = h('button', {
            type: 'button',
            className: 'dt-day',
            onClick: (e) => {
              e.stopPropagation();
              selectDay(cell);
            },
          });
          return { el: btn, refs: {} };
        },
        updateRow: (_refs, cell, _idx, el) => {
          patchText(el, cell.day);
          patchClasses(el, {
            'is-selected': cell.isSelected,
            'is-outside': !cell.isCurrentMonth,
          });
          patchAttr(el, 'data-date-key', cell.key);
        },
      });
    }

    function syncDisplay() {
      const ms = Number(getProps().modelValue || Date.now());
      patchText(triggerText, formatCompactDateTime(ms));
      if (isOpen) {
        renderCalendar();
      }
    }

    const handleDocClick = (e) => {
      if (isOpen && !isEventInside(e, rootEl)) {
        togglePopover(false);
      }
    };

    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('click', handleDocClick, true);
      onCleanup(() => document.removeEventListener('click', handleDocClick, true));
    }

    syncDisplay();

    return {
      el: rootEl,
      refs: { triggerBtn, triggerText, popoverEl, daysGrid, hourValSpan, minValSpan },
      onPropsChange: syncDisplay,
    };
  },
});

// --- src/components/ui/CustomScrollbar.js ---
/**
 * @fileoverview Bespoke custom scrollbar component (零原生滚动条).
 * Hides native OS scrollbars completely and renders a precision 4px floating
 * rail + GPU-translated thumb with drag and track-jump support.
 */


const CustomScrollbar = defineComponent({
  name: 'CustomScrollbar',
  setup({ getProps, onCleanup }) {
    const contentEl = getProps().contentEl || h('div');
    contentEl.classList.add('custom-scroll-content');

    const thumbEl = h('div', { className: 'scrollbar-thumb' });
    const railEl = h(
      'div',
      {
        className: 'scrollbar-rail is-inactive',
        'aria-hidden': 'true',
      },
      [thumbEl]
    );

    const hostEl = h(
      'div',
      {
        className: `custom-scroll-host ${getProps().className || ''}`.trim(),
      },
      [contentEl, railEl]
    );

    let isDragging = false;
    let dragStartY = 0;
    let dragStartScrollTop = 0;

    function syncThumb() {
      const scrollHeight = Number(contentEl.scrollHeight || 0);
      const clientHeight = Number(contentEl.clientHeight || 0);
      const scrollTop = Number(contentEl.scrollTop || 0);
      const overflow = scrollHeight - clientHeight;

      if (overflow <= 1 || clientHeight <= 0) {
        patchClasses(railEl, { 'is-inactive': true });
        patchStyleVar(thumbEl, '--thumb-h', '0px');
        patchStyleVar(thumbEl, '--thumb-y', '0px');
        return;
      }

      patchClasses(railEl, { 'is-inactive': false });
      const railHeight = Math.max(24, clientHeight - 4);
      const thumbHeight = Math.max(24, Math.round((clientHeight / scrollHeight) * railHeight));
      const maxThumbTop = Math.max(0, railHeight - thumbHeight);
      const ratio = Math.max(0, Math.min(1, scrollTop / overflow));
      const thumbTop = Math.round(ratio * maxThumbTop);

      patchStyleVar(thumbEl, '--thumb-h', `${thumbHeight}px`);
      patchStyleVar(thumbEl, '--thumb-y', `${thumbTop}px`);
    }

    function onContentScroll() {
      syncThumb();
    }

    function onDocMouseMove(e) {
      if (!isDragging) return;
      const clientHeight = Number(contentEl.clientHeight || 0);
      const scrollHeight = Number(contentEl.scrollHeight || 0);
      const overflow = scrollHeight - clientHeight;
      if (overflow <= 1) return;

      const railHeight = Math.max(24, clientHeight - 4);
      const thumbHeight = Math.max(24, Math.round((clientHeight / scrollHeight) * railHeight));
      const maxThumbTop = Math.max(1, railHeight - thumbHeight);

      const deltaY = (e.clientY || 0) - dragStartY;
      const scrollDelta = (deltaY / maxThumbTop) * overflow;
      contentEl.scrollTop = Math.max(0, Math.min(overflow, dragStartScrollTop + scrollDelta));
      syncThumb();
    }

    function onDocMouseUp() {
      if (!isDragging) return;
      isDragging = false;
      patchClasses(railEl, { 'is-dragging': false });
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousemove', onDocMouseMove);
        document.removeEventListener('mouseup', onDocMouseUp);
      }
    }

    thumbEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      dragStartY = e.clientY || 0;
      dragStartScrollTop = Number(contentEl.scrollTop || 0);
      patchClasses(railEl, { 'is-dragging': true });
      if (typeof document !== 'undefined') {
        document.addEventListener('mousemove', onDocMouseMove);
        document.addEventListener('mouseup', onDocMouseUp);
      }
    });

    railEl.addEventListener('mousedown', (e) => {
      if (e.target === thumbEl) return;
      e.preventDefault();
      const rect = railEl.getBoundingClientRect ? railEl.getBoundingClientRect() : null;
      if (!rect || rect.height <= 0) return;
      const clickOffset = (e.clientY || 0) - rect.top;
      const ratio = Math.max(0, Math.min(1, clickOffset / rect.height));
      const overflow = Math.max(0, (contentEl.scrollHeight || 0) - (contentEl.clientHeight || 0));
      contentEl.scrollTop = Math.round(ratio * overflow);
      syncThumb();
    });

    contentEl.addEventListener('scroll', onContentScroll);
    hostEl.addEventListener('mouseenter', syncThumb);

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => syncThumb());
      resizeObserver.observe(hostEl);
      resizeObserver.observe(contentEl);
    }

    syncThumb();

    onCleanup(() => {
      onDocMouseUp();
      contentEl.removeEventListener('scroll', onContentScroll);
      hostEl.removeEventListener('mouseenter', syncThumb);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });

    let pendingSync = false;
    function scheduleSyncThumb() {
      if (typeof queueMicrotask === 'function') {
        if (pendingSync) return;
        pendingSync = true;
        queueMicrotask(() => {
          pendingSync = false;
          syncThumb();
        });
      } else {
        syncThumb();
      }
    }

    return {
      el: hostEl,
      refs: { contentEl, railEl, thumbEl },
      onPropsChange: scheduleSyncThumb,
      methods: {
        refresh() {
          scheduleSyncThumb();
        },
      },
    };
  },
});

// --- src/components/ui/SegmentedControl.js ---
/**
 * @fileoverview Micro-bezel (2px radius) SegmentedControl switcher
 * for time-range filtering, context limit selection, and sub-table switching.
 */


const SegmentedControl = defineComponent({
  name: 'SegmentedControl',
  setup({ getProps, setProps, emit }) {
    const rootEl = h('div', {
      className: 'segmented',
      role: 'group',
      'aria-label': getProps().ariaLabel || '分段切换器',
    });

    function syncSegments() {
      const { options = [], modelValue } = getProps();
      patchKeyedList(rootEl, options, {
        keyFn: (opt) => opt.value,
        sigFn: (opt) => `${opt.value}::${opt.label}::${opt.value === modelValue}`,
        createRow: (opt) => {
          const btn = h('button', {
            type: 'button',
            className: 'seg-btn',
            onClick: (e) => {
              e.stopPropagation();
              if (getProps().modelValue !== opt.value) {
                setProps({ modelValue: opt.value });
                emit('update:modelValue', opt.value);
              }
            },
          });
          return { el: btn, refs: {} };
        },
        updateRow: (_refs, opt, _idx, el) => {
          const active = opt.value === modelValue;
          patchText(el, opt.label);
          patchClasses(el, { 'is-active': active });
          patchAttr(el, 'aria-pressed', active ? 'true' : 'false');
          patchAttr(el, 'data-seg-value', opt.value);
        },
      });
    }

    syncSegments();

    return {
      el: rootEl,
      refs: {},
      onPropsChange: syncSegments,
      getValue: () => getProps().modelValue,
    };
  },
});

// --- src/components/ui/ContextSegmentMeter.js ---
/**
 * @fileoverview 10-channel segmented context window progress bar updated via
 * CSS custom variables against the current model's automatic compaction baseline,
 * dynamically ordered from largest to smallest segment.
 */


const SEGMENT_DEFS = [
  { key: 'assistant', cls: 'seg-assistant', getVal: (c) => Number(c.assistantTokens || 0) },
  { key: 'toolResults', cls: 'seg-tool-results', getVal: (c) => Number(c.toolResultsTokens || 0) },
  {
    key: 'userInput',
    cls: 'seg-user-input',
    getVal: (c) => Number(c.userInputTokens ?? c.messagesTokens ?? 0),
  },
  { key: 'subagent', cls: 'seg-subagent-msg', getVal: (c) => Number(c.subagentTokens || 0) },
  { key: 'checkpoint', cls: 'seg-checkpoint', getVal: (c) => Number(c.checkpointTokens || 0) },
  { key: 'systemPrompt', cls: 'seg-system-prompt', getVal: (c) => Number(c.systemPromptTokens || 0) },
  { key: 'systemTools', cls: 'seg-system-tools', getVal: (c) => Number(c.systemToolsTokens || 0) },
  { key: 'mcpTools', cls: 'seg-mcp-tools', getVal: (c) => Number(c.mcpToolsTokens || 0) },
  { key: 'skills', cls: 'seg-skills', getVal: (c) => Number(c.skillsTokens || 0) },
  { key: 'userRules', cls: 'seg-user-rules', getVal: (c) => Number(c.userRulesTokens || 0) },
];

const ContextSegmentMeter = defineComponent({
  name: 'ContextSegmentMeter',
  setup({ getProps }) {
    // 固定 10 个位置槽位节点，不通过 appendChild 移动 DOM，防止浏览器中断 CSS transition 动画
    const slotEls = SEGMENT_DEFS.map((def) =>
      h('div', { className: `progress-seg ${def.cls}` })
    );

    const trackEl = h(
      'div',
      {
        className: 'progress-track',
        role: 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
      },
      slotEls
    );

    let lastOrderSig = '';

    function syncMeter() {
      const ctx = getProps().context || {};
      const limit = Math.max(1, Number(ctx.compactionLimitTokens || ctx.limitTokens || 256000));
      const scored = SEGMENT_DEFS.map((def, defaultOrder) => {
        const val = def.getVal(ctx);
        const pct = Math.min(100, (val / limit) * 100);
        return { def, defaultOrder, val, pct };
      });

      scored.sort((a, b) => b.val - a.val || a.defaultOrder - b.defaultOrder);
      // 仅关注非零通道的相对顺序变化，决定是否启用 0.05s 先变色再伸缩的衔接延迟
      const activeOrderSig = scored
        .filter((x) => x.val > 0)
        .map((x) => x.def.key)
        .join(',');
      const orderChanged = Boolean(lastOrderSig && activeOrderSig && activeOrderSig !== lastOrderSig);
      if (activeOrderSig) {
        lastOrderSig = activeOrderSig;
      }

      patchClasses(trackEl, { 'is-reordering': orderChanged });

      for (let i = 0; i < slotEls.length; i++) {
        const slotEl = slotEls[i];
        const item = scored[i];
        patchAttr(slotEl, 'class', `progress-seg ${item.def.cls}`);
        patchStyleVar(slotEl, '--seg-w', `${item.pct.toFixed(2)}%`);
      }

      patchAttr(trackEl, 'aria-valuenow', Math.round(ctx.compactionUsedPct ?? ctx.usedPct ?? 0));
    }

    syncMeter();

    return {
      el: trackEl,
      refs: { segments: slotEls },
      onPropsChange: syncMeter,
    };
  },
});

// --- src/components/ui/FourSegmentBar.js ---
/**
 * @fileoverview 通用 4 段式 Token 构成比例条组件 (FourSegmentBar).
 * 用于在消费概览、热门模型明细及数据来源明细中直观展示：
 * 直接输入 (Input)、缓存读取 (Cached)、内容生成 (Output) 与思考推理 (Thinking) 的 Token 占比。
 */


/**
 * 创建 4 段式水平比例进度条实例。
 * 通过动态更新各分段节点的 `--seg-w` CSS 变量实现零重排平滑过渡。
 *
 * @returns {{
 *   el: HTMLElement,
 *   update: (metrics: {
 *     inputTokens?: number,
 *     cacheReadTokens?: number,
 *     responseTokens?: number,
 *     thinkingTokens?: number
 *   }) => void
 * }} 组件根元素与增量更新方法
 */
function createFourSegmentBar() {
  const segInput = h('div', { className: 'progress-seg seg-input' });
  const segCached = h('div', { className: 'progress-seg seg-cached' });
  const segOutput = h('div', { className: 'progress-seg seg-output' });
  const segThinking = h('div', { className: 'progress-seg seg-thinking' });
  const el = h('div', { className: 'progress-track cons-seg-bar' }, [
    segInput,
    segCached,
    segOutput,
    segThinking,
  ]);

  /**
   * 根据四类 Token 数量重新计算并写入各分段百分比宽度。
   */
  function update({ inputTokens = 0, cacheReadTokens = 0, responseTokens = 0, thinkingTokens = 0 }) {
    const total = Math.max(1, inputTokens + cacheReadTokens + responseTokens + thinkingTokens);
    patchStyleVar(segInput, '--seg-w', `${((inputTokens / total) * 100).toFixed(2)}%`);
    patchStyleVar(segCached, '--seg-w', `${((cacheReadTokens / total) * 100).toFixed(2)}%`);
    patchStyleVar(segOutput, '--seg-w', `${((responseTokens / total) * 100).toFixed(2)}%`);
    patchStyleVar(segThinking, '--seg-w', `${((thinkingTokens / total) * 100).toFixed(2)}%`);
  }

  return { el, update };
}

// --- src/components/charts/TrendAreaChart.js ---
/**
 * @fileoverview 交互式历史用量趋势图组件 (TrendAreaChart).
 * 支持双模式自适应切换：
 * 1. <= 90 天（或整点小时分桶）：渲染三次贝塞尔平滑曲线面积图、峰值气泡与对齐多刻度时间轴；
 * 2. > 90 天（自然日分桶）：自动切换为类 GitHub 贡献日历的小格子热力排列（一格一天，7 行星期 × 周列、月份刻度、分位数 5 档热力色阶与底部图例）；
 * 3. 两种模式共享自适应防溢出的悬浮详情卡片（精确日期/小时区间、Token 拆分、费用与调用次数）。
 */


/** 超过该自然日天数（> 90 天）时，趋势图切换为类 GitHub 每日小格子热力图 */
const HEATMAP_DAYS_THRESHOLD = 90;

let chartUidCounter = 0;

function safeSlotTokens(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * 将二维采样点序列转换为水平张力平滑的三次贝塞尔曲线 SVG 路径 (`M ... C ...`)。
 * 控制点沿 X 轴取相邻点间距的 `0.42` 张力系数，Y 轴与各自端点齐平，
 * 保证曲线在极值点处平缓过渡且不会产生上下过冲 (Overshoot)。
 *
 * @param {Array<{ x: number, y: number }>} points SVG 坐标系下的采样点数组（长度 >= 2）
 * @returns {string} SVG `<path>` 的 `d` 属性字符串
 */
function buildSmoothSplinePath(points) {
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpx1 = p0.x + (p1.x - p0.x) * 0.42;
    const cpx2 = p1.x - (p1.x - p0.x) * 0.42;
    d += ` C ${cpx1.toFixed(1)} ${p0.y.toFixed(1)}, ${cpx2.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

/**
 * 根据分桶总数与标签平均长度，计算底部 X 轴应当展示的均匀刻度下标列表。
 *
 * @param {Array<{ label?: string }>} slots
 * @returns {number[]}
 */
function computeTickIndices(slots) {
  const n = slots.length;
  if (n <= 1) return [0];
  if (n <= 8) {
    return Array.from({ length: n }, (_, i) => i);
  }
  const sampleLabel = String(slots[Math.floor(n / 2)]?.label || slots[0]?.label || '');
  const maxTicks = sampleLabel.length > 6 ? 5 : 6;
  const set = new Set();
  for (let k = 0; k < maxTicks; k++) {
    const idx = Math.round((k / (maxTicks - 1)) * (n - 1));
    set.add(idx);
  }
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * 基于非零活跃日的分位数阈值计算热力图 5 档色阶（0 ~ 4），避免单日极端峰值压缩其余活跃日的层次对比。
 *
 * @param {number[]} nonZeroValues 已升序排列的正数 Token 列表
 * @param {number} maxTokens
 * @returns {{ q1: number, q2: number, q3: number, maxTokens: number, count: number }}
 */
function computeHeatmapThresholds(nonZeroValues, maxTokens) {
  const n = nonZeroValues.length;
  if (n === 0 || maxTokens <= 0) {
    return { q1: 0, q2: 0, q3: 0, maxTokens: 0, count: 0 };
  }
  if (n < 4) {
    return {
      q1: maxTokens * 0.25,
      q2: maxTokens * 0.5,
      q3: maxTokens * 0.75,
      maxTokens,
      count: n,
    };
  }
  return {
    q1: nonZeroValues[Math.floor((n - 1) * 0.25)],
    q2: nonZeroValues[Math.floor((n - 1) * 0.5)],
    q3: nonZeroValues[Math.floor((n - 1) * 0.75)],
    maxTokens,
    count: n,
  };
}

function resolveHeatmapLevel(tokens, thresholds) {
  if (tokens <= 0 || thresholds.maxTokens <= 0) return 0;
  if (tokens >= thresholds.maxTokens || tokens > thresholds.q3) return 4;
  if (tokens > thresholds.q2) return 3;
  if (tokens > thresholds.q1) return 2;
  return 1;
}

/**
 * 解析日期槽位的年份与月份信息（兼容真实时间戳 `startMs` 与测试简写 `label`）。
 *
 * @param {object} slot
 * @returns {{ year: number, month: number, day: number }}
 */
function parseSlotCalendarParts(slot) {
  const sMs = Number(slot?.startMs);
  if (Number.isFinite(sMs) && sMs > 0) {
    const d = new Date(sMs);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  }
  const m = String(slot?.label || '').match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) {
    return { year: new Date().getFullYear(), month: Number(m[1]), day: Number(m[2]) };
  }
  return { year: new Date().getFullYear(), month: 0, day: 0 };
}

/**
 * 构建热力图顶部与周列对齐的月份刻度标签（自动跳过首尾过窄残月，防止相邻月份文字重叠）。
 *
 * @param {Array<object>} slots
 * @param {number} firstDow 首日对应的星期行索引（0 = 周一 .. 6 = 周日）
 * @param {number} totalWeeks 总周列数
 * @returns {Array<{ col: number, text: string }>}
 */
function buildHeatmapMonthTicks(slots, firstDow, totalWeeks) {
  if (!slots.length || totalWeeks <= 0) return [];
  const firstParts = parseSlotCalendarParts(slots[0]);
  const lastParts = parseSlotCalendarParts(slots[slots.length - 1]);
  const crossYear = firstParts.year !== lastParts.year;

  const candidates = [];
  let prevMonthKey = '';

  for (let col = 0; col < totalWeeks; col++) {
    let chosenParts = null;
    for (let row = 0; row < 7; row++) {
      const idx = col * 7 + row - firstDow;
      if (idx < 0 || idx >= slots.length) continue;
      const parts = parseSlotCalendarParts(slots[idx]);
      if (!parts.month) continue;
      const mKey = `${parts.year}-${parts.month}`;
      if (col === 0 && !chosenParts) {
        chosenParts = parts;
        prevMonthKey = mKey;
        break;
      }
      if (mKey !== prevMonthKey) {
        chosenParts = parts;
        prevMonthKey = mKey;
        break;
      }
    }
    if (chosenParts && chosenParts.month > 0) {
      candidates.push({ col, year: chosenParts.year, month: chosenParts.month });
    }
  }

  const baseMinGap = totalWeeks > 40 ? 4 : 3;
  if (
    candidates.length >= 2 &&
    candidates[0].col === 0 &&
    candidates[1].col - candidates[0].col < baseMinGap
  ) {
    candidates.shift();
  }

  const ticks = [];
  let nextAllowedCol = 0;
  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    if (totalWeeks > 16 && c.col >= totalWeeks - 1) continue;
    if (ticks.length > 0 && c.col < nextAllowedCol) continue;
    const showYear = crossYear && (c.month === 1 || ticks.length === 0);
    const text = showYear ? `${String(c.year).slice(-2)}年${c.month}月` : `${c.month}月`;
    ticks.push({ col: c.col, text });
    nextAllowedCol = c.col + (showYear ? baseMinGap + 1 : baseMinGap);
  }
  return ticks;
}

/**
 * 创建交互式历史趋势组件（<=90 天为 SVG 平滑曲线图，>90 天自动切换为类 GitHub 每日小格子热力图）。
 *
 * @returns {{
 *   el: HTMLElement,
 *   update: (series?: Array<object>) => void
 * }}
 */
function createTrendAreaChart() {
  const DEFAULT_VIEW_W = 460;
  const VIEW_H = 120;
  const TOP_Y = 24;
  const BOTTOM_Y = 102;
  const SPAN_Y = BOTTOM_Y - TOP_Y;

  let viewW = DEFAULT_VIEW_W;

  function resolvePlotBounds(w) {
    const leftX = 1;
    const rightX = Math.max(leftX + 20, w - 1);
    return { leftX, rightX, spanX: rightX - leftX };
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${viewW} ${VIEW_H}`);
  svg.setAttribute('class', 'trend-svg');
  svg.setAttribute('aria-hidden', 'true');

  // 垂直线性渐变（每实例独立 ID，避免多图表挂载时 SVG url(#...) 冲突）
  const gradId = `trend-area-grad-${++chartUidCounter}`;
  const defs = document.createElementNS(SVG_NS, 'defs');
  const grad = document.createElementNS(SVG_NS, 'linearGradient');
  grad.setAttribute('id', gradId);
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0');
  grad.setAttribute('y2', '1');

  const stop1 = document.createElementNS(SVG_NS, 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', 'var(--ctx-cached)');
  stop1.setAttribute('stop-opacity', '0.34');

  const stop2 = document.createElementNS(SVG_NS, 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', 'var(--ctx-cached)');
  stop2.setAttribute('stop-opacity', '0.0');

  grad.appendChild(stop1);
  grad.appendChild(stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  // 背景水平与垂直参考网格线（水平网格全宽贴边铺满 0..viewW）
  const hGridGroup = document.createElementNS(SVG_NS, 'g');
  hGridGroup.setAttribute('class', 'trend-grid');
  const hGridLines = [];
  for (const y of [TOP_Y, Math.round((TOP_Y + BOTTOM_Y) / 2), BOTTOM_Y]) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', String(y));
    line.setAttribute('x2', String(viewW));
    line.setAttribute('y2', String(y));
    hGridGroup.appendChild(line);
    hGridLines.push(line);
  }
  svg.appendChild(hGridGroup);

  const vGridGroup = document.createElementNS(SVG_NS, 'g');
  vGridGroup.setAttribute('class', 'trend-grid trend-v-grid');
  svg.appendChild(vGridGroup);

  const areaPath = document.createElementNS(SVG_NS, 'path');
  areaPath.setAttribute('fill', `url(#${gradId})`);
  svg.appendChild(areaPath);

  const linePath = document.createElementNS(SVG_NS, 'path');
  linePath.setAttribute('class', 'trend-line');
  linePath.setAttribute('fill', 'none');
  svg.appendChild(linePath);

  const dotsGroup = document.createElementNS(SVG_NS, 'g');
  dotsGroup.setAttribute('class', 'trend-dots-group');
  svg.appendChild(dotsGroup);

  const peakDot = document.createElementNS(SVG_NS, 'circle');
  peakDot.setAttribute('r', '3');
  peakDot.setAttribute('class', 'trend-peak-dot');
  svg.appendChild(peakDot);

  // 悬停十字准星与焦点圆点
  const hoverLine = document.createElementNS(SVG_NS, 'line');
  hoverLine.setAttribute('class', 'trend-hover-line');
  hoverLine.setAttribute('y1', '12');
  hoverLine.setAttribute('y2', String(BOTTOM_Y));
  hoverLine.setAttribute('hidden', 'true');
  svg.appendChild(hoverLine);

  const hoverDot = document.createElementNS(SVG_NS, 'circle');
  hoverDot.setAttribute('r', '3.2');
  hoverDot.setAttribute('class', 'trend-hover-dot');
  hoverDot.setAttribute('hidden', 'true');
  svg.appendChild(hoverDot);

  const peakPill = h('span', { className: 'trend-peak-pill text-mono', text: '0' });

  // 共享悬停详情浮层卡片（曲线图与热力格子图共用）
  const tipTimeEl = h('span', { className: 'trend-tip-time text-mono' });
  const tipCallsEl = h('span', { className: 'trend-tip-calls text-mono' });
  const tipTokensEl = h('strong', { className: 'trend-tip-tokens text-mono' });
  const tipCostEl = h('span', { className: 'trend-tip-cost text-mono' });
  const tipSubEl = h('div', { className: 'trend-tip-sub text-mono', hidden: true });

  const tooltipEl = h(
    'div',
    { className: 'trend-tooltip', hidden: true },
    [
      h('div', { className: 'trend-tip-head' }, [tipTimeEl, tipCallsEl]),
      h('div', { className: 'trend-tip-main' }, [tipTokensEl, tipCostEl]),
      tipSubEl,
    ]
  );

  // 底部对齐刻度轴（曲线模式）
  const xAxisEl = h('div', { className: 'trend-x-axis' });
  const plotStage = h('div', { className: 'trend-plot-stage' }, [peakPill, svg]);

  // 类 GitHub 每日小格子热力图容器（> 90 天模式）
  const weekdayLabels = ['一', '', '三', '', '五', '', '日'];
  const hmWeekdaysEl = h('div', { className: 'trend-hm-weekdays', 'aria-hidden': 'true' }, [
    h('span', { className: 'trend-hm-month-spacer' }),
    ...weekdayLabels.map((txt) => h('span', { className: 'trend-hm-wday', text: txt })),
  ]);
  const hmMonthsEl = h('div', { className: 'trend-hm-months' });
  const hmGridEl = h('div', { className: 'trend-hm-grid', role: 'grid', 'aria-label': '每日用量热力格子图' });
  const hmTrackEl = h('div', { className: 'trend-hm-track' }, [hmMonthsEl, hmGridEl]);
  const hmScrollEl = h('div', { className: 'trend-hm-scroll' }, [hmTrackEl]);
  const hmBodyEl = h('div', { className: 'trend-heatmap-body' }, [hmWeekdaysEl, hmScrollEl]);

  const hmSummaryEl = h('span', { className: 'trend-hm-summary text-mono', text: '' });
  const hmLegendEl = h('span', { className: 'trend-hm-legend', 'aria-hidden': 'true' }, [
    h('span', { text: '少' }),
    h('span', { className: 'trend-hm-swatch lv-0' }),
    h('span', { className: 'trend-hm-swatch lv-1' }),
    h('span', { className: 'trend-hm-swatch lv-2' }),
    h('span', { className: 'trend-hm-swatch lv-3' }),
    h('span', { className: 'trend-hm-swatch lv-4' }),
    h('span', { text: '多' }),
  ]);
  const hmFooterEl = h('div', { className: 'trend-hm-footer' }, [hmSummaryEl, hmLegendEl]);
  const heatmapStage = h('div', { className: 'trend-heatmap-stage', hidden: true }, [
    hmBodyEl,
    hmFooterEl,
  ]);

  const chartWrap = h('div', { className: 'trend-chart-wrap' }, [
    plotStage,
    xAxisEl,
    heatmapStage,
    tooltipEl,
  ]);

  let currentSlots = [];
  let currentPts = [];
  let currentIsHeatmap = false;
  let currentHeatmapWeeks = 0;
  let currentCellEls = [];
  let tickElsByIdx = new Map();
  let hoveredIdx = -1;
  let hoveredCellEl = null;
  let lastRenderSig = '';

  function populateTooltipContent(slot) {
    patchText(tipTimeEl, slot.fullLabel || slot.label || '--');
    patchText(tipCallsEl, `${Math.max(0, Math.floor(Number(slot.calls) || 0))} 次`);
    const slotTok = safeSlotTokens(slot.tokens);
    patchText(tipTokensEl, `${formatTokensPrecise(slotTok)} tok`);
    const slotCost = Number.isFinite(Number(slot.costUsd)) ? Math.max(0, Number(slot.costUsd)) : 0;
    patchText(
      tipCostEl,
      formatUsd(slotCost, {
        precise: slotCost > 0 && slotCost < 0.1,
      })
    );

    const hasSubBreakdown =
      slotTok > 0 &&
      (slot.inputTokens !== undefined ||
        slot.cacheReadTokens !== undefined ||
        slot.outputTokens !== undefined);
    patchAttr(tipSubEl, 'hidden', !hasSubBreakdown);
    if (hasSubBreakdown) {
      patchText(
        tipSubEl,
        `入 ${formatTokensPrecise(safeSlotTokens(slot.inputTokens))} · 缓 ${formatTokensPrecise(safeSlotTokens(slot.cacheReadTokens))} · 出 ${formatTokensPrecise(safeSlotTokens(slot.outputTokens))}`
      );
    }
  }

  function showLineHoverAtIndex(idx) {
    if (currentIsHeatmap || idx < 0 || idx >= currentSlots.length || !currentPts[idx]) {
      clearHover();
      return;
    }
    hoveredIdx = idx;
    const slot = currentSlots[idx];
    const pt = currentPts[idx];

    patchAttr(hoverLine, 'hidden', false);
    patchAttr(hoverLine, 'x1', pt.x.toFixed(1));
    patchAttr(hoverLine, 'x2', pt.x.toFixed(1));

    patchAttr(hoverDot, 'hidden', false);
    patchAttr(hoverDot, 'cx', pt.x.toFixed(1));
    patchAttr(hoverDot, 'cy', pt.y.toFixed(1));

    patchAttr(peakPill, 'hidden', true);
    patchClasses(tooltipEl, { 'is-hm-bottom': false, 'is-hm-top': false });
    patchAttr(tooltipEl, 'hidden', false);
    populateTooltipContent(slot);

    const rawPct = (pt.x / viewW) * 100;
    const clampedPct = Math.max(1, Math.min(99, rawPct));
    patchStyleVar(tooltipEl, '--tip-x', `${clampedPct.toFixed(1)}%`);
    patchStyleVar(tooltipEl, '--tip-shift', `-${clampedPct.toFixed(1)}%`);

    for (const [tIdx, el] of tickElsByIdx.entries()) {
      patchClasses(el, { 'is-hovered': tIdx === idx });
    }
  }

  function showHeatmapHoverAtIndex(idx, cellEl) {
    if (!currentIsHeatmap || idx < 0 || idx >= currentSlots.length) {
      clearHover();
      return;
    }
    const targetCell = cellEl || currentCellEls[idx] || null;
    if (!targetCell) {
      clearHover();
      return;
    }
    hoveredIdx = idx;
    if (hoveredCellEl && hoveredCellEl !== targetCell) {
      patchClasses(hoveredCellEl, { 'is-hovered': false });
    }
    hoveredCellEl = targetCell;
    patchClasses(targetCell, { 'is-hovered': true });

    const slot = currentSlots[idx];
    const row = Number(targetCell.getAttribute('data-hm-row') || 0);
    const col = Number(targetCell.getAttribute('data-hm-col') || 0);

    // 上半区（周一~周四）浮层停靠底部，下半区（周五~周日）停靠顶部，互不遮挡被悬停格子且永不越界裁剪
    patchClasses(tooltipEl, {
      'is-hm-bottom': row <= 3,
      'is-hm-top': row > 3,
    });
    patchAttr(tooltipEl, 'hidden', false);
    populateTooltipContent(slot);

    const wrapRect = chartWrap.getBoundingClientRect();
    const cellRect = targetCell.getBoundingClientRect();
    let rawPct = 50;
    if (
      wrapRect &&
      wrapRect.width > 0 &&
      cellRect &&
      cellRect.width > 0 &&
      cellRect.width < wrapRect.width
    ) {
      rawPct = ((cellRect.left + cellRect.width / 2 - wrapRect.left) / wrapRect.width) * 100;
    } else if (currentHeatmapWeeks > 0) {
      rawPct = ((col + 0.5) / currentHeatmapWeeks) * 100;
    }
    const clampedPct = Math.max(1, Math.min(99, rawPct));
    patchStyleVar(tooltipEl, '--tip-x', `${clampedPct.toFixed(1)}%`);
    patchStyleVar(tooltipEl, '--tip-shift', `-${clampedPct.toFixed(1)}%`);
  }

  function clearHover() {
    hoveredIdx = -1;
    patchAttr(hoverLine, 'hidden', true);
    patchAttr(hoverDot, 'hidden', true);
    patchAttr(tooltipEl, 'hidden', true);
    patchClasses(tooltipEl, { 'is-hm-bottom': false, 'is-hm-top': false });
    if (!currentIsHeatmap) {
      patchAttr(peakPill, 'hidden', false);
    }
    if (hoveredCellEl) {
      patchClasses(hoveredCellEl, { 'is-hovered': false });
      hoveredCellEl = null;
    }
    for (const el of tickElsByIdx.values()) {
      patchClasses(el, { 'is-hovered': false });
    }
  }

  function syncViewWidth() {
    const measured = Math.round(
      plotStage.clientWidth ||
        svg.clientWidth ||
        plotStage.getBoundingClientRect?.()?.width ||
        0
    );
    if (measured >= 160 && measured !== viewW) {
      viewW = measured;
      svg.setAttribute('viewBox', `0 0 ${viewW} ${VIEW_H}`);
      for (const line of hGridLines) {
        line.setAttribute('x1', '0');
        line.setAttribute('x2', String(viewW));
      }
      return true;
    }
    return false;
  }

  function handlePointerMove(e) {
    if (currentIsHeatmap || !currentSlots.length) return;
    const rect = svg.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const relX = ((e.clientX - rect.left) / rect.width) * viewW;
    const { leftX, spanX } = resolvePlotBounds(viewW);
    const ratio = (relX - leftX) / Math.max(1, spanX);
    const idx = Math.max(
      0,
      Math.min(currentSlots.length - 1, Math.round(ratio * (currentSlots.length - 1)))
    );
    showLineHoverAtIndex(idx);
  }

  function findHeatmapCellFromEvent(e) {
    let cur = e?.target || null;
    while (cur && cur !== hmGridEl) {
      const idxAttr = cur.getAttribute?.('data-slot-idx');
      if (idxAttr !== null && idxAttr !== undefined && idxAttr !== '') {
        return { idx: Number(idxAttr), cellEl: cur };
      }
      cur = cur.parentNode || null;
    }
    return null;
  }

  function handleHeatmapPointer(e) {
    if (!currentIsHeatmap || !currentSlots.length) return;
    const hit = findHeatmapCellFromEvent(e);
    if (!hit || !Number.isFinite(hit.idx)) {
      clearHover();
      return;
    }
    if (hit.idx !== hoveredIdx || hit.cellEl !== hoveredCellEl) {
      showHeatmapHoverAtIndex(hit.idx, hit.cellEl);
    }
  }

  function handleHeatmapWheel(e) {
    if (!currentIsHeatmap) return;
    const maxScrollLeft = (hmScrollEl.scrollWidth || 0) - (hmScrollEl.clientWidth || 0);
    if (maxScrollLeft <= 2) return;
    const dy = Number(e.deltaY || 0);
    const dx = Number(e.deltaX || 0);
    if (Math.abs(dy) > Math.abs(dx) && dy !== 0) {
      const prev = hmScrollEl.scrollLeft || 0;
      const next = Math.max(0, Math.min(maxScrollLeft, prev + dy));
      if (next !== prev) {
        hmScrollEl.scrollLeft = next;
        e.preventDefault?.();
      }
    }
  }

  plotStage.addEventListener('mousemove', handlePointerMove);
  plotStage.addEventListener('mouseleave', clearHover);

  hmGridEl.addEventListener('mouseover', handleHeatmapPointer);
  hmGridEl.addEventListener('mousemove', handleHeatmapPointer);
  hmGridEl.addEventListener('click', handleHeatmapPointer);
  hmGridEl.addEventListener('mouseleave', clearHover);
  hmScrollEl.addEventListener('wheel', handleHeatmapWheel);

  let resizeObs = null;
  let onWinResize = null;
  if (typeof ResizeObserver === 'function') {
    resizeObs = new ResizeObserver(() => {
      if (!currentIsHeatmap && syncViewWidth() && currentSlots.length > 0) {
        lastRenderSig = '';
        update(currentSlots);
      }
    });
    resizeObs.observe(plotStage);
  } else if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    onWinResize = () => {
      if (!currentIsHeatmap && syncViewWidth() && currentSlots.length > 0) {
        lastRenderSig = '';
        update(currentSlots);
      }
    };
    window.addEventListener('resize', onWinResize);
  }

  function destroy() {
    resizeObs?.disconnect();
    resizeObs = null;
    if (onWinResize && typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', onWinResize);
      onWinResize = null;
    }
  }

  /**
   * 根据最新时间分桶序列重绘平滑曲线（<=90天/小时级）或类 GitHub 每日小格子热力图（>90天）。
   */
  function update(series = []) {
    const slots =
      Array.isArray(series) && series.length >= 1
        ? series
        : [
            { label: '00:00', fullLabel: '00:00 - 01:00', tokens: 0, calls: 0, costUsd: 0 },
            { label: '06:00', fullLabel: '06:00 - 07:00', tokens: 0, calls: 0, costUsd: 0 },
            { label: '12:00', fullLabel: '12:00 - 13:00', tokens: 0, calls: 0, costUsd: 0 },
            { label: '18:00', fullLabel: '18:00 - 19:00', tokens: 0, calls: 0, costUsd: 0 },
          ];
    currentSlots = slots;

    const isHourly =
      slots[0]?.granularity === 'hour' || String(slots[0]?.label || '').includes(':');
    const useHeatmap = !isHourly && slots.length > HEATMAP_DAYS_THRESHOLD;
    const modeChanged = useHeatmap !== currentIsHeatmap;
    currentIsHeatmap = useHeatmap;

    if (modeChanged) {
      clearHover();
    }
    patchClasses(chartWrap, { 'is-heatmap': useHeatmap });
    patchAttr(plotStage, 'hidden', useHeatmap);
    patchAttr(xAxisEl, 'hidden', useHeatmap);
    patchAttr(heatmapStage, 'hidden', !useHeatmap);

    if (!useHeatmap) {
      syncViewWidth();
    }

    let maxTokens = 0;
    let peakIdx = 0;
    let activeDays = 0;
    const nonZeroVals = [];

    for (let i = 0; i < slots.length; i++) {
      const t = safeSlotTokens(slots[i]?.tokens);
      if (t > 0) {
        activeDays++;
        nonZeroVals.push(t);
      }
      if (t >= maxTokens) {
        maxTokens = t;
        peakIdx = i;
      }
    }

    const sig =
      `${useHeatmap ? 'hm' : `line:${viewW}`}|` +
      slots
        .map(
          (s) =>
            `${s?.startMs || ''}:${s?.label || ''}:${s?.fullLabel || ''}:${safeSlotTokens(s?.tokens)}:${Number(s?.costUsd || 0)}:${Number(s?.calls || 0)}`
        )
        .join('|');

    if (useHeatmap) {
      currentPts = [];
      if (sig !== lastRenderSig) {
        lastRenderSig = sig;
        nonZeroVals.sort((a, b) => a - b);
        const thresholds = computeHeatmapThresholds(nonZeroVals, maxTokens);

        const firstStartMs = Number(slots[0]?.startMs);
        const firstDow =
          Number.isFinite(firstStartMs) && firstStartMs > 0
            ? (new Date(firstStartMs).getDay() + 6) % 7
            : 0;
        const totalCells = firstDow + slots.length;
        const totalWeeks = Math.max(1, Math.ceil(totalCells / 7));
        currentHeatmapWeeks = totalWeeks;

        patchStyleVar(hmBodyEl, '--hm-weeks', String(totalWeeks));
        patchStyleVar(hmBodyEl, '--hm-gap', totalWeeks > 42 ? '1.5px' : '2px');

        // 重建顶部对齐月份标签
        while (hmMonthsEl.firstChild) hmMonthsEl.removeChild(hmMonthsEl.firstChild);
        const monthTicks = buildHeatmapMonthTicks(slots, firstDow, totalWeeks);
        for (const mt of monthTicks) {
          const mEl = h('span', { className: 'trend-hm-month text-mono', text: mt.text });
          patchStyleVar(mEl, '--hm-col', String(mt.col));
          hmMonthsEl.appendChild(mEl);
        }

        // 重建 7 行 × N 周列的每日小格子（一格一天）
        while (hmGridEl.firstChild) hmGridEl.removeChild(hmGridEl.firstChild);
        hoveredCellEl = null;
        currentCellEls = new Array(slots.length);

        for (let pad = 0; pad < firstDow; pad++) {
          hmGridEl.appendChild(
            h('span', { className: 'trend-hm-cell is-pad', 'aria-hidden': 'true' })
          );
        }

        for (let i = 0; i < slots.length; i++) {
          const slot = slots[i];
          const tok = safeSlotTokens(slot?.tokens);
          const lv = resolveHeatmapLevel(tok, thresholds);
          const gridPos = firstDow + i;
          const col = Math.floor(gridPos / 7);
          const row = gridPos % 7;
          const cellEl = h('span', {
            className: `trend-hm-cell lv-${lv}`,
            'data-slot-idx': String(i),
            'data-hm-col': String(col),
            'data-hm-row': String(row),
            role: 'gridcell',
          });
          hmGridEl.appendChild(cellEl);
          currentCellEls[i] = cellEl;
        }

        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => {
            if (hmScrollEl.scrollWidth > hmScrollEl.clientWidth) {
              hmScrollEl.scrollLeft = hmScrollEl.scrollWidth;
            }
          });
        }
      }

      const peakSlot = slots[peakIdx];
      const summaryText =
        maxTokens > 0 && peakSlot?.label
          ? `活跃 ${activeDays}/${slots.length} 天 · 峰值 ${peakSlot.label} · ${formatTokensPrecise(maxTokens)}`
          : `活跃 0/${slots.length} 天`;
      patchText(hmSummaryEl, summaryText);

      if (hoveredIdx >= slots.length) {
        clearHover();
      } else if (hoveredIdx >= 0) {
        showHeatmapHoverAtIndex(hoveredIdx, currentCellEls[hoveredIdx]);
      }
      return;
    }

    // --- <= 90 天（或整点小时级）：渲染平滑面积曲线图（1:1 贴边对齐） ---
    currentCellEls = [];
    const { leftX, rightX, spanX } = resolvePlotBounds(viewW);
    const denom = Math.max(1, maxTokens);
    const isSingle = slots.length === 1;
    const pts = slots.map((s, idx) => {
      const tok = safeSlotTokens(s?.tokens);
      const x = isSingle
        ? (leftX + rightX) / 2
        : leftX + (idx / Math.max(1, slots.length - 1)) * spanX;
      const ratio = maxTokens > 0 ? tok / denom : 0;
      const y = BOTTOM_Y - ratio * SPAN_Y;
      return { x, y, tokens: tok };
    });
    currentPts = pts;

    if (sig !== lastRenderSig) {
      lastRenderSig = sig;
      let lineD;
      let areaD;
      if (isSingle) {
        const yStr = pts[0].y.toFixed(1);
        lineD = `M ${leftX.toFixed(1)} ${yStr} L ${rightX.toFixed(1)} ${yStr}`;
        areaD = `${lineD} L ${rightX.toFixed(1)} ${BOTTOM_Y} L ${leftX.toFixed(1)} ${BOTTOM_Y} Z`;
      } else {
        lineD = buildSmoothSplinePath(pts);
        areaD = `${lineD} L ${pts[pts.length - 1].x.toFixed(1)} ${BOTTOM_Y} L ${pts[0].x.toFixed(1)} ${BOTTOM_Y} Z`;
      }
      patchAttr(linePath, 'd', lineD);
      patchAttr(areaPath, 'd', areaD);

      // 渲染与底部刻度对齐的垂直参考网格线及底部 X 轴标签（起止标签严格左右贴边）
      const tickIndices = computeTickIndices(slots);
      while (vGridGroup.firstChild) vGridGroup.removeChild(vGridGroup.firstChild);
      while (xAxisEl.firstChild) xAxisEl.removeChild(xAxisEl.firstChild);
      tickElsByIdx = new Map();

      for (let i = 0; i < tickIndices.length; i++) {
        const tIdx = tickIndices[i];
        const pt = pts[tIdx];
        const slot = slots[tIdx];
        if (!pt || !slot) continue;

        if (i > 0 && i < tickIndices.length - 1) {
          const vLine = document.createElementNS(SVG_NS, 'line');
          vLine.setAttribute('x1', pt.x.toFixed(1));
          vLine.setAttribute('y1', '16');
          vLine.setAttribute('x2', pt.x.toFixed(1));
          vLine.setAttribute('y2', String(BOTTOM_Y));
          vGridGroup.appendChild(vLine);
        }

        const isFirst = !isSingle && i === 0;
        const isLast = !isSingle && i === tickIndices.length - 1;
        const pct = isFirst ? 0 : isLast ? 100 : (pt.x / viewW) * 100;
        const tickEl = h('span', {
          className: `trend-x-tick text-mono${isFirst ? ' is-start' : isLast ? ' is-end' : ''}`,
          text: slot.label || '',
          title: slot.fullLabel || slot.label || '',
        });
        patchStyleVar(tickEl, '--tick-x', `${pct.toFixed(2)}%`);
        tickEl.onclick = () => showLineHoverAtIndex(tIdx);
        xAxisEl.appendChild(tickEl);
        tickElsByIdx.set(tIdx, tickEl);
      }

      // 渲染采样点小圆点（当点数 <= 36 时展示，突出有消耗的整点/日期）
      while (dotsGroup.firstChild) dotsGroup.removeChild(dotsGroup.firstChild);
      if (pts.length <= 36) {
        for (let i = 0; i < pts.length; i++) {
          if (pts[i].tokens <= 0) continue;
          const dot = document.createElementNS(SVG_NS, 'circle');
          dot.setAttribute('cx', pts[i].x.toFixed(1));
          dot.setAttribute('cy', pts[i].y.toFixed(1));
          dot.setAttribute('r', '2');
          dot.setAttribute('class', 'trend-node-dot');
          dotsGroup.appendChild(dot);
        }
      }
    }

    const peakPt = pts[peakIdx] || { x: viewW / 2, y: BOTTOM_Y };
    patchAttr(peakDot, 'cx', peakPt.x.toFixed(1));
    patchAttr(peakDot, 'cy', peakPt.y.toFixed(1));

    const peakSlot = slots[peakIdx];
    const peakText =
      maxTokens > 0 && peakSlot?.label
        ? `峰值 ${peakSlot.label} · ${formatTokensPrecise(maxTokens)}`
        : formatTokensPrecise(maxTokens);
    patchText(peakPill, peakText);
    const pctLeft = Math.max(12, Math.min(88, (peakPt.x / viewW) * 100));
    patchStyleVar(peakPill, '--peak-x', `${pctLeft.toFixed(1)}%`);

    if (hoveredIdx >= slots.length) {
      clearHover();
    } else if (hoveredIdx >= 0) {
      showLineHoverAtIndex(hoveredIdx);
    }
  }

  return { el: chartWrap, update, destroy };
}

// --- src/components/charts/SessionStepCharts.js ---
/**
 * @fileoverview 当前会话步骤级线性走势图与模型趋势拟合图组件 (SessionStepCharts).
 *
 * 包含两部分能力：
 * 1. `createSessionLineChart`：查看当前会话（支持主代理 / 子代理 / 全部汇总）所有模型的步进变化，
 *    支持切换 `总Token`（累计调用总量）、`上下文`（单步上下文体积）、`TPS`、`首字`、`费用` 五大维度；
 * 2. `createModelFitChart`：查看指定模型或全部模型的 `TPS`、`首字`、`缓存`、`费用` 散点与鲁棒局部加权线性回归（LOWESS + OLS 基准）拟合曲线，
 *    内置视图级模型锁定状态机，进入视图时自动锚定当前调用模型，停留在视图期间绝不随轮询跳变。
 */


let sessionChartUid = 0;

/** 多模型节点与多曲线对比语义调色板（全部取自 tokens.css 语义变量，兼顾设计一致性与交叉曲线区分度） */
const MODEL_COLOR_VARS = Object.freeze([
  'var(--ctx-cached)',
  'var(--ctx-skills)',
  'var(--ctx-user-input)',
  'var(--ctx-checkpoint)',
  'var(--ctx-tool-results)',
  'var(--ctx-subagent-msg)',
]);

/**
 * 提取步骤所属的基础模型分组键（与后端 `usage-aggregator.mjs` 中 `modelBreakdown[].label` 严格一致），
 * 且不受“精简代号 / 原始模型 ID”或“自动压缩”后缀切换影响。
 *
 * @param {object|null|undefined} step
 * @returns {string}
 */
function getStepModelGroupKey(step) {
  if (!step || typeof step !== 'object') return '模型未知';
  const rawLabel = String(step.modelLabel || step.label || '')
    .replace(/\s*\[自动压缩\]\s*$/u, '')
    .replace(/\s*\((?:Max|XHigh|High|Medium|Low|Thinking|Extra Low|Tiered)\)\s*$/i, '')
    .trim();
  if (rawLabel) return rawLabel;
  const rawShort = String(step.modelShort || step.shortName || '')
    .replace(/·压缩\s*$/u, '')
    .trim();
  return rawShort || '模型未知';
}

/**
 * 将逆序或混合代理的步骤列表归一化为严格时间升序序列（最旧 -> 最新）。
 *
 * @param {Array<object>} steps
 * @param {boolean} isMergedAllAgents
 * @returns {Array<object>}
 */
function toChronologicalSteps(steps, isMergedAllAgents = false) {
  if (!Array.isArray(steps) || steps.length === 0) return [];
  const copy = steps.slice();
  if (isMergedAllAgents) {
    copy.sort(
      (a, b) =>
        (Number(a?.createdAtMs) || 0) - (Number(b?.createdAtMs) || 0) ||
        (Number(a?.agentIndex) || 0) - (Number(b?.agentIndex) || 0) ||
        (Number(a?.stepIndex) || 0) - (Number(b?.stepIndex) || 0)
    );
    return copy;
  }
  copy.sort(
    (a, b) =>
      (Number(a?.stepIndex) || 0) - (Number(b?.stepIndex) || 0) ||
      (Number(a?.createdAtMs) || 0) - (Number(b?.createdAtMs) || 0)
  );
  return copy;
}

function clampValue(v, minVal = 0, maxVal = Infinity) {
  if (!Number.isFinite(v)) return minVal;
  return Math.max(minVal, Math.min(maxVal, v));
}

/**
 * 双侧 95% 置信区间对应的 Student-t 临界值近似表（t_{0.975, df}）。
 *
 * @param {number} df 残差自由度
 * @returns {number}
 */
function tCritical95(df) {
  if (!Number.isFinite(df) || df <= 1.5) return 3.182;
  if (df <= 2.5) return 3.182 + (2.5 - df) * 0.9;
  if (df <= 3.5) return 2.776 + (3.5 - df) * 0.406;
  if (df <= 4.5) return 2.571 + (4.5 - df) * 0.205;
  if (df <= 6) return 2.447;
  if (df <= 8) return 2.306;
  if (df <= 10) return 2.228;
  if (df <= 15) return 2.131;
  if (df <= 20) return 2.086;
  if (df <= 30) return 2.042;
  if (df <= 60) return 2.0;
  if (df <= 120) return 1.98;
  return 1.96;
}

/**
 * 计算普通最小二乘线性回归（OLS: y = intercept + slope * x）。
 *
 * @param {number[]} ys 样本纵坐标序列
 * @param {{ minVal?: number, maxVal?: number, xs?: number[] }} [options]
 * @returns {{ values: number[], slope: number, intercept: number, mean: number, r: number, r2: number }}
 */
function computeLinearFit(ys, { minVal = 0, maxVal = Infinity, xs = null } = {}) {
  const n = Array.isArray(ys) ? ys.length : 0;
  if (n === 0) {
    return { values: [], slope: 0, intercept: 0, mean: 0, r: 0, r2: 0 };
  }
  const xArr =
    Array.isArray(xs) && xs.length === n ? xs : Array.from({ length: n }, (_, idx) => idx);
  const meanY = ys.reduce((acc, v) => acc + v, 0) / n;
  if (n === 1) {
    const c = clampValue(ys[0], minVal, maxVal);
    return { values: [c], slope: 0, intercept: c, mean: c, r: 0, r2: 0 };
  }
  const meanX = xArr.reduce((acc, v) => acc + v, 0) / n;
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xArr[i] - meanX;
    const dy = ys[i] - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const slope = sxx > 1e-12 ? sxy / sxx : 0;
  const intercept = meanY - slope * meanX;
  const r =
    sxx > 1e-12 && syy > 1e-12 ? clampValue(sxy / Math.sqrt(sxx * syy), -1, 1) : 0;
  const values = xArr.map((x) => clampValue(intercept + slope * x, minVal, maxVal));
  return { values, slope, intercept, mean: meanY, r, r2: r * r };
}

/**
 * 学术论文级回归与 95% 置信带计算引擎（Cleveland & Devlin 高斯局部加权线性回归 LOESS + 精确帽子矩阵标准误，
 * 小样本 n <= 5 时自动采用精确 OLS 线性回归与双曲 t 分布 95% 置信区间，等同于 R `ggplot2::geom_smooth(se = TRUE)`）。
 *
 * @param {number[]} xs 严格递增或单调的样本横坐标序列
 * @param {number[]} ys 样本纵坐标序列
 * @param {{ minVal?: number, maxVal?: number, gridSize?: number, span?: number }} [options]
 */
function computePublicationFit(
  xs,
  ys,
  { minVal = 0, maxVal = Infinity, gridSize = 64, span = 0.5 } = {}
) {
  const n = Math.min(Array.isArray(xs) ? xs.length : 0, Array.isArray(ys) ? ys.length : 0);
  if (n === 0) {
    return {
      method: 'OLS',
      mean: 0,
      sd: 0,
      slope: 0,
      intercept: 0,
      r: 0,
      r2: 0,
      sampleFits: [],
      sampleCiLow: [],
      sampleCiHigh: [],
      sampleCiHalf: [],
      grid: [],
    };
  }

  const ols = computeLinearFit(ys, { minVal, maxVal, xs });
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dy = ys[i] - ols.mean;
    syy += dy * dy;
  }
  const sd = n > 1 ? Math.sqrt(syy / (n - 1)) : 0;

  if (n === 1) {
    const val = clampValue(ys[0], minVal, maxVal);
    return {
      method: 'OLS',
      mean: val,
      sd: 0,
      slope: 0,
      intercept: val,
      r: 0,
      r2: 0,
      sampleFits: [val],
      sampleCiLow: [val],
      sampleCiHigh: [val],
      sampleCiHalf: [0],
      grid: [{ x: xs[0], fit: val, ciLow: val, ciHigh: val }],
    };
  }

  const xMin = xs[0];
  const xMax = xs[n - 1];
  const xSpan = Math.max(1e-9, xMax - xMin);
  const M = Math.max(2, gridSize);
  const gridXs = Array.from({ length: M }, (_, k) => xMin + (k / (M - 1)) * xSpan);

  // 小样本（n <= 5）：采用精确 OLS 线性回归与 Student-t 双曲 95% CI 置信带
  if (n <= 5) {
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    let sxx = 0;
    let sse = 0;
    for (let i = 0; i < n; i++) {
      const dx = xs[i] - meanX;
      sxx += dx * dx;
      const resid = ys[i] - (ols.intercept + ols.slope * xs[i]);
      sse += resid * resid;
    }
    const df = n - 2;
    const seResid = df >= 1 ? Math.sqrt(sse / df) : 0;
    const tCrit = df >= 1 ? tCritical95(df) : 0;

    const evalOlsAt = (x0) => {
      const rawFit = ols.intercept + ols.slope * x0;
      const sePred =
        seResid > 0
          ? seResid * Math.sqrt(1 / n + (sxx > 1e-12 ? ((x0 - meanX) * (x0 - meanX)) / sxx : 0))
          : 0;
      const half = tCrit * sePred;
      return {
        fit: clampValue(rawFit, minVal, maxVal),
        ciLow: clampValue(rawFit - half, minVal, maxVal),
        ciHigh: clampValue(rawFit + half, minVal, maxVal),
        half,
      };
    };

    const sampleEval = xs.map(evalOlsAt);
    const grid = gridXs.map((gx) => {
      const g = evalOlsAt(gx);
      return { x: gx, fit: g.fit, ciLow: g.ciLow, ciHigh: g.ciHigh };
    });

    return {
      method: 'OLS',
      mean: ols.mean,
      sd,
      slope: ols.slope,
      intercept: ols.intercept,
      r: ols.r,
      r2: ols.r2,
      sampleFits: sampleEval.map((e) => e.fit),
      sampleCiLow: sampleEval.map((e) => e.ciLow),
      sampleCiHigh: sampleEval.map((e) => e.ciHigh),
      sampleCiHalf: sampleEval.map((e) => e.half),
      grid,
    };
  }

  // n >= 6：Cleveland 高斯局部加权一阶线性回归（LOESS）+ 精确帽子矩阵杠杆度 95% CI 置信带
  const q = Math.max(5, Math.min(n, Math.ceil(span * n)));
  const distBuf = new Float64Array(n);
  const wBuf = new Float64Array(n);

  function evalLoessPoint(x0, diagIdx = -1) {
    for (let j = 0; j < n; j++) {
      distBuf[j] = Math.abs(xs[j] - x0);
    }
    const sortedDists = Array.from(distBuf).sort((a, b) => a - b);
    let h = sortedDists[q - 1];
    if (h <= 1e-9) {
      h = Math.max(sortedDists[n - 1], xSpan * 0.05, 1e-6);
    }
    const maxDist = h * 1.0001;

    let sw = 0;
    let swx = 0;
    for (let j = 0; j < n; j++) {
      const u = distBuf[j] / maxDist;
      const w = u >= 1 ? 0 : (1 - u * u * u) ** 3;
      wBuf[j] = w;
      sw += w;
      swx += w * xs[j];
    }

    if (sw <= 1e-12) {
      const fallbackVal = ols.intercept + ols.slope * x0;
      return { rawFit: fallbackVal, leverageNormSq: 1 / n, diagHat: 1 / n };
    }

    const mx = swx / sw;
    let sxxW = 0;
    for (let j = 0; j < n; j++) {
      const w = wBuf[j];
      if (w <= 0) continue;
      const dx = xs[j] - mx;
      sxxW += w * dx * dx;
    }

    const dx0 = x0 - mx;
    const useSlope = sxxW > 1e-12;
    let rawFit = 0;
    let leverageNormSq = 0;
    let diagHat = 0;

    for (let j = 0; j < n; j++) {
      const w = wBuf[j];
      if (w <= 0) continue;
      const lj = w / sw + (useSlope ? (w * (xs[j] - mx) * dx0) / sxxW : 0);
      rawFit += lj * ys[j];
      leverageNormSq += lj * lj;
      if (j === diagIdx) diagHat = lj;
    }

    return { rawFit, leverageNormSq, diagHat };
  }

  const rawSampleFits = new Float64Array(n);
  const sampleLevSq = new Float64Array(n);
  let sse = 0;
  let traceL = 0;

  for (let i = 0; i < n; i++) {
    const res = evalLoessPoint(xs[i], i);
    rawSampleFits[i] = res.rawFit;
    sampleLevSq[i] = res.leverageNormSq;
    traceL += res.diagHat;
    const diff = ys[i] - res.rawFit;
    sse += diff * diff;
  }

  const dfRes = Math.max(1, n - traceL);
  const sigmaHat = Math.sqrt(sse / dfRes);
  const tCrit = tCritical95(dfRes);

  const sampleFits = new Array(n);
  const sampleCiLow = new Array(n);
  const sampleCiHigh = new Array(n);
  const sampleCiHalf = new Array(n);
  let clampedSse = 0;

  for (let i = 0; i < n; i++) {
    const fitVal = clampValue(rawSampleFits[i], minVal, maxVal);
    const half = tCrit * sigmaHat * Math.sqrt(sampleLevSq[i]);
    sampleFits[i] = fitVal;
    sampleCiLow[i] = clampValue(rawSampleFits[i] - half, minVal, maxVal);
    sampleCiHigh[i] = clampValue(rawSampleFits[i] + half, minVal, maxVal);
    sampleCiHalf[i] = half;
    const d = ys[i] - fitVal;
    clampedSse += d * d;
  }

  const grid = gridXs.map((gx) => {
    const res = evalLoessPoint(gx, -1);
    const half = tCrit * sigmaHat * Math.sqrt(res.leverageNormSq);
    return {
      x: gx,
      fit: clampValue(res.rawFit, minVal, maxVal),
      ciLow: clampValue(res.rawFit - half, minVal, maxVal),
      ciHigh: clampValue(res.rawFit + half, minVal, maxVal),
    };
  });

  const r2Loess = syy > 1e-12 ? clampValue(1 - clampedSse / syy, 0, 1) : 1;

  return {
    method: 'LOESS',
    mean: ols.mean,
    sd,
    slope: ols.slope,
    intercept: ols.intercept,
    r: ols.r,
    r2: r2Loess,
    sampleFits,
    sampleCiLow,
    sampleCiHigh,
    sampleCiHalf,
    grid,
  };
}

/**
 * 计算样本点上的平滑回归拟合值序列（供单元测试与轻量调用直接读取）。
 *
 * @param {number[]} ys
 * @param {{ minVal?: number, maxVal?: number, xs?: number[] }} [bounds]
 * @returns {number[]}
 */
function computeLoessFit(ys, { minVal = 0, maxVal = Infinity, xs = null } = {}) {
  const n = Array.isArray(ys) ? ys.length : 0;
  if (n === 0) return [];
  const xArr =
    Array.isArray(xs) && xs.length === n ? xs : Array.from({ length: n }, (_, idx) => idx);
  return computePublicationFit(xArr, ys, { minVal, maxVal }).sampleFits;
}

/**
 * Heckbert 科学坐标轴刻度取整算法，生成科研图表风格的均匀整洁刻度。
 */
function niceStepNumber(range, round) {
  if (!Number.isFinite(range) || range <= 0) return 1;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;
  return niceFraction * 10 ** exponent;
}

function computeNiceYScale(dataMin, dataMax, { minBound = 0, maxBound = Infinity, tickCount = 4 } = {}) {
  let lo = Number.isFinite(dataMin) ? dataMin : 0;
  let hi = Number.isFinite(dataMax) ? dataMax : 1;
  if (minBound === 0 && lo >= 0 && hi > 0 && lo <= hi * 0.32) {
    lo = 0;
  }
  if (hi - lo <= 1e-9) {
    const pad = lo > 0 ? lo * 0.15 : 1;
    lo = Math.max(minBound, lo - pad);
    hi = Math.min(maxBound, hi + pad);
    if (hi - lo <= 1e-9) {
      lo = Math.max(minBound, hi - 1);
    }
  } else {
    const pad = (hi - lo) * 0.05;
    lo = Math.max(minBound, lo - (lo === 0 ? 0 : pad));
    hi = Math.min(maxBound, hi + pad);
  }

  const rawRange = niceStepNumber(hi - lo, false);
  const step = niceStepNumber(rawRange / Math.max(2, tickCount - 1), true);
  let graphMin = Math.max(minBound, Math.floor(lo / step) * step);
  let graphMax = Math.min(maxBound, Math.ceil(hi / step) * step);
  if (graphMax - graphMin <= 1e-9) {
    graphMax = graphMin + step;
  }

  const ticks = [];
  for (let v = graphMin; v <= graphMax + step * 0.25; v += step) {
    const clamped = clampValue(+v.toPrecision(10), minBound, maxBound);
    if (ticks.length === 0 || Math.abs(clamped - ticks[ticks.length - 1]) > step * 1e-4) {
      ticks.push(clamped);
    }
    if (ticks.length >= 8) break;
  }
  return {
    min: ticks[0] ?? graphMin,
    max: ticks[ticks.length - 1] ?? graphMax,
    step,
    ticks,
  };
}

function computeNiceXStepTicks(xs) {
  const n = xs.length;
  if (n === 0) return [];
  if (n <= 5) {
    return Array.from(new Set(xs.map((x) => Math.round(x))));
  }
  const xMin = xs[0];
  const xMax = xs[n - 1];
  const span = xMax - xMin;
  if (span <= 5) {
    return Array.from(new Set(xs.map((x) => Math.round(x))));
  }
  const step = Math.max(1, Math.round(niceStepNumber(span / 4.5, true)));
  const firstTick = Math.ceil(xMin / step) * step;
  const ticks = [];
  if (firstTick - xMin > step * 0.45) {
    ticks.push(Math.round(xMin));
  }
  for (let v = firstTick; v <= xMax + 1e-6; v += step) {
    ticks.push(Math.round(v));
    if (ticks.length >= 7) break;
  }
  if (ticks.length === 0) {
    return [Math.round(xMin), Math.round(xMax)];
  }
  return ticks;
}

function formatYAxisTick(metric, val, step) {
  if (!Number.isFinite(val)) return '';
  if (Math.abs(val) < 1e-9) {
    return metric === 'cost' ? '$0' : metric === 'cache' ? '0%' : metric === 'ttft' ? '0s' : '0';
  }
  if (metric === 'tps') {
    return step >= 1 ? `${Math.round(val)}` : val.toFixed(1);
  }
  if (metric === 'ttft') {
    return step >= 1 ? `${Math.round(val)}s` : `${val.toFixed(1)}s`;
  }
  if (metric === 'cache') {
    return step >= 1 ? `${Math.round(val)}%` : `${val.toFixed(1)}%`;
  }
  if (metric === 'cost') {
    if (step >= 1) return `$${Math.round(val)}`;
    if (step >= 0.1) return `$${val.toFixed(1)}`;
    if (step >= 0.01) return `$${val.toFixed(2)}`;
    return `$${val.toFixed(3)}`;
  }
  return String(val);
}

function buildPolylinePath(points) {
  if (!points.length) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }
  return d;
}

function buildSplinePath(points) {
  if (!points.length) return '';
  if (points.length === 1) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  }
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpx1 = p0.x + (p1.x - p0.x) * 0.38;
    const cpx2 = p1.x - (p1.x - p0.x) * 0.38;
    d += ` C ${cpx1.toFixed(1)} ${p0.y.toFixed(1)}, ${cpx2.toFixed(1)} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

function computeStepTickIndices(count) {
  if (count <= 0) return [];
  if (count <= 6) return Array.from({ length: count }, (_, i) => i);
  const maxTicks = 6;
  const set = new Set();
  for (let k = 0; k < maxTicks; k++) {
    set.add(Math.round((k / (maxTicks - 1)) * (count - 1)));
  }
  return Array.from(set).sort((a, b) => a - b);
}

function formatStepAxisTag(st, showAgentPrefix) {
  const num = `#${Number(st?.stepIndex ?? 0)}`;
  if (!showAgentPrefix) return num;
  const badge = st?.agentBadge || (st?.isSubagent ? '子' : '主');
  return `${badge}${num}`;
}

function formatChartMetricValue(metric, val) {
  if (!Number.isFinite(val)) return '—';
  switch (metric) {
    case 'totalTokens':
    case 'context':
      return `${formatTokensPrecise(val)} tok`;
    case 'tps':
      return `${val.toFixed(1)} tok/s`;
    case 'ttft':
      return `${val.toFixed(1)}s`;
    case 'cache':
      return `${val.toFixed(1)}%`;
    case 'cost':
      return formatUsd(val, { precise: true });
    default:
      return String(val);
  }
}

function formatChartMetricCompact(metric, val) {
  if (!Number.isFinite(val)) return '—';
  switch (metric) {
    case 'totalTokens':
    case 'context':
      return formatTokens(val);
    case 'tps':
      return `${val.toFixed(1)} tok/s`;
    case 'ttft':
      return `${val.toFixed(1)}s`;
    case 'cache':
      return `${val.toFixed(1)}%`;
    case 'cost':
      return formatUsd(val, { precise: true });
    default:
      return String(val);
  }
}

/**
 * 创建会话全模型线性走势图（支持 `totalTokens` | `context` | `tps` | `ttft` | `cost`，全宽 1:1 贴边对齐）。
 */
function createSessionLineChart() {
  const DEFAULT_VIEW_W = 460;
  const VIEW_H = 106;
  const TOP_Y = 18;
  const BOTTOM_Y = 94;
  const SPAN_Y = BOTTOM_Y - TOP_Y;

  let viewW = DEFAULT_VIEW_W;

  function resolvePlotBounds(w) {
    const leftX = 1;
    const rightX = Math.max(leftX + 20, w - 1);
    return { leftX, rightX, spanX: rightX - leftX };
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${viewW} ${VIEW_H}`);
  svg.setAttribute('class', 'sstep-svg');
  svg.setAttribute('aria-hidden', 'true');

  const gradId = `sstep-line-grad-${++sessionChartUid}`;
  const defs = document.createElementNS(SVG_NS, 'defs');
  const grad = document.createElementNS(SVG_NS, 'linearGradient');
  grad.setAttribute('id', gradId);
  grad.setAttribute('x1', '0');
  grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '0');
  grad.setAttribute('y2', '1');
  const stop1 = document.createElementNS(SVG_NS, 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', 'var(--ctx-cached)');
  stop1.setAttribute('stop-opacity', '0.28');
  const stop2 = document.createElementNS(SVG_NS, 'stop');
  stop2.setAttribute('offset', '100%');
  stop2.setAttribute('stop-color', 'var(--ctx-cached)');
  stop2.setAttribute('stop-opacity', '0.0');
  grad.appendChild(stop1);
  grad.appendChild(stop2);
  defs.appendChild(grad);
  svg.appendChild(defs);

  const gridGroup = document.createElementNS(SVG_NS, 'g');
  gridGroup.setAttribute('class', 'trend-grid');
  const gridLines = [];
  for (const y of [TOP_Y, Math.round((TOP_Y + BOTTOM_Y) / 2), BOTTOM_Y]) {
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', String(y));
    line.setAttribute('x2', String(viewW));
    line.setAttribute('y2', String(y));
    gridGroup.appendChild(line);
    gridLines.push(line);
  }
  svg.appendChild(gridGroup);

  const areaPath = document.createElementNS(SVG_NS, 'path');
  areaPath.setAttribute('fill', `url(#${gradId})`);
  svg.appendChild(areaPath);

  const multiAreaGroup = document.createElementNS(SVG_NS, 'g');
  multiAreaGroup.setAttribute('class', 'sstep-multi-area-group');
  svg.appendChild(multiAreaGroup);

  const linePath = document.createElementNS(SVG_NS, 'path');
  linePath.setAttribute('class', 'trend-line');
  linePath.setAttribute('fill', 'none');
  svg.appendChild(linePath);

  const multiLineGroup = document.createElementNS(SVG_NS, 'g');
  multiLineGroup.setAttribute('class', 'sstep-multi-line-group');
  svg.appendChild(multiLineGroup);

  const dotsGroup = document.createElementNS(SVG_NS, 'g');
  svg.appendChild(dotsGroup);

  const hoverLine = document.createElementNS(SVG_NS, 'line');
  hoverLine.setAttribute('class', 'trend-hover-line');
  hoverLine.setAttribute('y1', '10');
  hoverLine.setAttribute('y2', String(BOTTOM_Y));
  hoverLine.setAttribute('hidden', 'true');
  svg.appendChild(hoverLine);

  const hoverDot = document.createElementNS(SVG_NS, 'circle');
  hoverDot.setAttribute('r', '3.4');
  hoverDot.setAttribute('class', 'trend-hover-dot');
  hoverDot.setAttribute('hidden', 'true');
  svg.appendChild(hoverDot);

  const emptyHintEl = h('div', {
    className: 'sstep-empty-hint text-muted',
    text: '当前范围暂无可绘制的调用步骤',
    hidden: true,
  });

  const peakPill = h('span', { className: 'trend-peak-pill text-mono', hidden: true });

  const tipHeadLeft = h('span', { className: 'trend-tip-time text-mono' });
  const tipHeadRight = h('span', { className: 'trend-tip-calls text-mono' });
  const tipMainLeft = h('strong', { className: 'trend-tip-tokens text-mono' });
  const tipMainRight = h('span', { className: 'trend-tip-cost text-mono' });
  const tipSub = h('div', { className: 'trend-tip-sub text-mono', hidden: true });
  const tooltipEl = h('div', { className: 'trend-tooltip', hidden: true }, [
    h('div', { className: 'trend-tip-head' }, [tipHeadLeft, tipHeadRight]),
    h('div', { className: 'trend-tip-main' }, [tipMainLeft, tipMainRight]),
    tipSub,
  ]);

  const xAxisEl = h('div', { className: 'trend-x-axis' });
  const modelLegendEl = h('div', { className: 'sstep-model-legend', hidden: true });
  const plotStage = h('div', { className: 'sstep-plot-stage' }, [
    peakPill,
    emptyHintEl,
    tooltipEl,
    svg,
  ]);
  const rootEl = h('div', { className: 'sstep-chart-wrap' }, [
    plotStage,
    xAxisEl,
    modelLegendEl,
  ]);

  let currentPoints = [];
  let currentMetric = 'totalTokens';
  let hoveredIdx = -1;
  let tickElsByIdx = new Map();
  let lastSig = '';
  let lastUpdateParams = null;

  function syncViewWidth() {
    const measured = Math.round(
      plotStage.clientWidth ||
        svg.clientWidth ||
        plotStage.getBoundingClientRect?.()?.width ||
        0
    );
    if (measured >= 160 && measured !== viewW) {
      viewW = measured;
      svg.setAttribute('viewBox', `0 0 ${viewW} ${VIEW_H}`);
      for (const line of gridLines) {
        line.setAttribute('x1', '0');
        line.setAttribute('x2', String(viewW));
      }
      return true;
    }
    return false;
  }

  function showHoverAt(idx) {
    if (idx < 0 || idx >= currentPoints.length) {
      clearHover();
      return;
    }
    hoveredIdx = idx;
    const pt = currentPoints[idx];
    patchAttr(hoverLine, 'hidden', false);
    patchAttr(hoverLine, 'x1', pt.x.toFixed(1));
    patchAttr(hoverLine, 'x2', pt.x.toFixed(1));

    patchAttr(hoverDot, 'hidden', false);
    patchAttr(hoverDot, 'cx', pt.x.toFixed(1));
    patchAttr(hoverDot, 'cy', pt.y.toFixed(1));
    patchStyleVar(hoverDot, '--hover-dot-color', pt.hoverColor || 'var(--ctx-cached)');

    patchAttr(peakPill, 'hidden', true);
    patchAttr(tooltipEl, 'hidden', false);

    patchText(tipHeadLeft, pt.stepTag);
    patchText(tipHeadRight, pt.modelText);
    patchText(tipMainLeft, pt.valid ? formatChartMetricValue(currentMetric, pt.value) : '未纳入');
    patchText(tipMainRight, pt.secondaryRight || '');
    patchAttr(tipSub, 'hidden', !pt.subDetail);
    if (pt.subDetail) {
      patchText(tipSub, pt.subDetail);
    }

    const rawPct = (pt.x / viewW) * 100;
    const clampedPct = Math.max(1, Math.min(99, rawPct));
    patchStyleVar(tooltipEl, '--tip-x', `${clampedPct.toFixed(1)}%`);
    patchStyleVar(tooltipEl, '--tip-shift', `-${clampedPct.toFixed(1)}%`);

    for (const [tIdx, el] of tickElsByIdx.entries()) {
      patchClasses(el, { 'is-hovered': tIdx === idx });
    }
  }

  function clearHover() {
    hoveredIdx = -1;
    patchAttr(hoverLine, 'hidden', true);
    patchAttr(hoverDot, 'hidden', true);
    patchAttr(tooltipEl, 'hidden', true);
    if (currentPoints.some((p) => p.valid)) {
      patchAttr(peakPill, 'hidden', false);
    }
    for (const el of tickElsByIdx.values()) {
      patchClasses(el, { 'is-hovered': false });
    }
  }

  plotStage.addEventListener('mousemove', (e) => {
    if (!currentPoints.length) return;
    const rect = svg.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const relX = ((e.clientX - rect.left) / rect.width) * viewW;
    const { leftX, spanX } = resolvePlotBounds(viewW);
    const ratio = (relX - leftX) / Math.max(1, spanX);
    const idx = Math.max(
      0,
      Math.min(currentPoints.length - 1, Math.round(ratio * (currentPoints.length - 1)))
    );
    showHoverAt(idx);
  });
  plotStage.addEventListener('mouseleave', clearHover);

  let resizeObs = null;
  let onWinResize = null;
  if (typeof ResizeObserver === 'function') {
    resizeObs = new ResizeObserver(() => {
      if (syncViewWidth() && lastUpdateParams) {
        lastSig = '';
        update(lastUpdateParams);
      }
    });
    resizeObs.observe(plotStage);
  } else if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    onWinResize = () => {
      if (syncViewWidth() && lastUpdateParams) {
        lastSig = '';
        update(lastUpdateParams);
      }
    };
    window.addEventListener('resize', onWinResize);
  }

  function destroy() {
    resizeObs?.disconnect();
    resizeObs = null;
    if (onWinResize && typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', onWinResize);
      onWinResize = null;
    }
  }

  /**
   * @param {{
   *   steps: Array<object>,
   *   modelGroupKey?: string,
   *   modelGroupKeys?: string[]|null,
   *   modelColorByGroup?: Map<string, string>|null,
   *   metric: 'totalTokens'|'context'|'tps'|'ttft'|'cost',
   *   showAgentPrefix?: boolean,
   *   displaySettings?: object,
   * }} params
   * @returns {{ summaryBadge: string }}
   */
  function update({
    steps = [],
    modelGroupKey = '__all__',
    modelGroupKeys = null,
    modelColorByGroup = null,
    metric = 'totalTokens',
    showAgentPrefix = false,
    displaySettings = {},
  } = {}) {
    lastUpdateParams = {
      steps,
      modelGroupKey,
      modelGroupKeys,
      modelColorByGroup,
      metric,
      showAgentPrefix,
      displaySettings,
    };
    currentMetric = metric;
    syncViewWidth();

    const accentColor = 'var(--ctx-cached)';
    patchAttr(stop1, 'stop-color', accentColor);
    patchAttr(stop2, 'stop-color', accentColor);
    patchStyleVar(rootEl, '--sstep-accent', accentColor);

    const rawKeys =
      Array.isArray(modelGroupKeys) && modelGroupKeys.length > 0
        ? modelGroupKeys
        : [modelGroupKey || '__all__'];
    const isPooledAll = rawKeys.includes('__all__');
    const targetKeys = isPooledAll
      ? ['__all__']
      : Array.from(new Set(rawKeys.map((k) => String(k || '')).filter(Boolean)));
    const targetKeySet = new Set(targetKeys);
    const isMultiCompare = !isPooledAll && targetKeys.length >= 2;

    const matchedSteps = isPooledAll
      ? steps
      : steps.filter((st) => st && targetKeySet.has(getStepModelGroupKey(st)));

    if (!matchedSteps.length) {
      currentPoints = [];
      lastSig = 'empty';
      patchAttr(areaPath, 'd', '');
      patchAttr(linePath, 'd', '');
      while (multiAreaGroup.firstChild) multiAreaGroup.removeChild(multiAreaGroup.firstChild);
      while (multiLineGroup.firstChild) multiLineGroup.removeChild(multiLineGroup.firstChild);
      while (dotsGroup.firstChild) dotsGroup.removeChild(dotsGroup.firstChild);
      while (xAxisEl.firstChild) xAxisEl.removeChild(xAxisEl.firstChild);
      patchAttr(modelLegendEl, 'hidden', true);
      patchAttr(peakPill, 'hidden', true);
      patchAttr(emptyHintEl, 'hidden', false);
      clearHover();
      return { summaryBadge: '0 步' };
    }

    const modelColorMap = new Map();
    const modelLabelByGroup = new Map();
    if (isMultiCompare) {
      for (let i = 0; i < targetKeys.length; i++) {
        const gk = targetKeys[i];
        const colorVar =
          modelColorByGroup?.get(gk) || MODEL_COLOR_VARS[i % MODEL_COLOR_VARS.length];
        modelColorMap.set(gk, colorVar);
        const disp = resolveModelDisplayInfo({ modelLabel: gk, label: gk }, displaySettings, {
          fallback: gk,
        });
        modelLabelByGroup.set(gk, disp.text.replace(/·压缩\s*$/u, '').trim() || gk);
      }
    }
    for (const st of matchedSteps) {
      const gk = getStepModelGroupKey(st);
      if (!modelColorMap.has(gk)) {
        const colorVar =
          modelColorByGroup?.get(gk) ||
          MODEL_COLOR_VARS[modelColorMap.size % MODEL_COLOR_VARS.length];
        modelColorMap.set(gk, colorVar);
      }
      if (!modelLabelByGroup.has(gk)) {
        const disp = resolveModelDisplayInfo(st, displaySettings, { fallback: gk });
        modelLabelByGroup.set(gk, disp.text.replace(/·压缩\s*$/u, '').trim() || gk);
      }
    }

    let runningTokens = 0;
    let runningCost = 0;
    let validSum = 0;
    let validCount = 0;
    const perModelRunningTokens = new Map();
    const perModelRunningCost = new Map();
    const perModelPrevCtx = new Map();
    const perModelStats = new Map();

    const rawItems = matchedSteps.map((st, idx) => {
      const gk = getStepModelGroupKey(st);
      const inTok = Math.max(0, Number(st.inputTokens || 0));
      const cacheTok = Math.max(0, Number(st.cacheReadTokens || 0));
      const outTok = Math.max(0, Number(st.outputTokens || 0));
      const stepTotalTok = inTok + cacheTok + outTok;
      runningTokens += stepTotalTok;
      const modelCumTok = (perModelRunningTokens.get(gk) || 0) + stepTotalTok;
      perModelRunningTokens.set(gk, modelCumTok);

      const stepCost = Number.isFinite(Number(st.costUsd)) ? Math.max(0, Number(st.costUsd)) : null;
      if (stepCost !== null) {
        runningCost += stepCost;
        perModelRunningCost.set(gk, (perModelRunningCost.get(gk) || 0) + stepCost);
      }
      const modelCumCost = perModelRunningCost.get(gk) || 0;

      const ctxTok = Math.max(0, Number(st.contextTokens ?? stepTotalTok));
      const hasPrevModelCtx = perModelPrevCtx.has(gk);
      const prevSameModelCtx = hasPrevModelCtx ? perModelPrevCtx.get(gk) : ctxTok;
      perModelPrevCtx.set(gk, ctxTok);

      const prevGlobalCtx =
        idx > 0
          ? Math.max(
              0,
              Number(
                matchedSteps[idx - 1].contextTokens ??
                  Number(matchedSteps[idx - 1].inputTokens || 0) +
                    Number(matchedSteps[idx - 1].cacheReadTokens || 0) +
                    Number(matchedSteps[idx - 1].outputTokens || 0)
              )
            )
          : ctxTok;
      const hasPrevCtx = isMultiCompare ? hasPrevModelCtx : idx > 0;
      const ctxDelta = isMultiCompare ? ctxTok - prevSameModelCtx : idx > 0 ? ctxTok - prevGlobalCtx : 0;

      const disp = resolveModelDisplayInfo(st, displaySettings, { fallback: '—' });
      const stepTag = formatStepAxisTag(st, showAgentPrefix);

      let valid = true;
      let value = 0;
      let secondaryRight = '';
      let subDetail = '';

      if (metric === 'totalTokens') {
        value = isMultiCompare ? modelCumTok : runningTokens;
        secondaryRight = `本步 +${formatTokens(stepTotalTok)}`;
        subDetail = `入 ${formatTokens(inTok)} · 缓 ${formatTokens(cacheTok)} · 出 ${formatTokens(outTok)}`;
      } else if (metric === 'context') {
        value = ctxTok;
        if (hasPrevCtx) {
          const sign = ctxDelta >= 0 ? '+' : '-';
          secondaryRight = `${sign}${formatTokens(Math.abs(ctxDelta))}`;
        } else {
          secondaryRight = `缓存 ${Number(st.cacheHitPct ?? 0)}%`;
        }
        subDetail = st.isCompactionStep
          ? '上下文自动压缩检查点'
          : `缓存命中 ${Number(st.cacheHitPct ?? 0)}% · 输出 +${formatTokens(outTok)}`;
      } else if (metric === 'tps') {
        valid = !st.isCompactionStep && Number.isFinite(st.tokPerSec) && st.tokPerSec > 0;
        value = valid ? Number(st.tokPerSec) : 0;
        secondaryRight = Number.isFinite(st.ttftSec) ? `首字 ${st.ttftSec.toFixed(1)}s` : '';
        subDetail = valid
          ? `输出 ${formatTokens(outTok)} · 上下文 ${formatTokens(ctxTok)}`
          : speedReasonText(st.selectedSpeedReason) || (st.isCompactionStep ? '上下文压缩步' : '无测速样本');
      } else if (metric === 'ttft') {
        valid = !st.isCompactionStep && Number.isFinite(st.ttftSec) && st.ttftSec >= 0;
        value = valid ? Number(st.ttftSec) : 0;
        secondaryRight = Number.isFinite(st.tokPerSec) ? `${st.tokPerSec.toFixed(1)} tok/s` : '';
        subDetail = valid
          ? `上下文 ${formatTokens(ctxTok)} · 缓存 ${Number(st.cacheHitPct ?? 0)}%`
          : st.isCompactionStep
            ? '上下文压缩步'
            : '无首字计时样本';
      } else if (metric === 'cost') {
        valid = stepCost !== null;
        value = valid ? stepCost : 0;
        const shownCumCost = isMultiCompare ? modelCumCost : runningCost;
        secondaryRight = `累计 ${formatUsd(shownCumCost, { precise: shownCumCost > 0 && shownCumCost < 0.1 })}`;
        subDetail = `缓存 ${Number(st.cacheHitPct ?? 0)}% · 本步 ${formatTokens(stepTotalTok)}`;
      }

      if (valid) {
        validSum += value;
        validCount += 1;
        let stStat = perModelStats.get(gk);
        if (!stStat) {
          stStat = { count: 0, sum: 0, max: 0, last: 0, cumTok: 0, cumCost: 0 };
          perModelStats.set(gk, stStat);
        }
        stStat.count += 1;
        stStat.sum += value;
        if (value > stStat.max) stStat.max = value;
        stStat.last = value;
        stStat.cumTok = modelCumTok;
        stStat.cumCost = modelCumCost;
      }

      const dotColor = modelColorMap.get(gk) || accentColor;
      return {
        idx,
        st,
        stepTag,
        modelGroupKey: gk,
        modelText: disp.text,
        dotColor,
        hoverColor: isMultiCompare ? dotColor : accentColor,
        valid,
        value,
        secondaryRight,
        subDetail,
      };
    });

    let maxVal = 0;
    let peakIdx = -1;
    for (let i = 0; i < rawItems.length; i++) {
      if (rawItems[i].valid && rawItems[i].value >= maxVal) {
        maxVal = rawItems[i].value;
        peakIdx = i;
      }
    }

    const { leftX, rightX, spanX } = resolvePlotBounds(viewW);
    const denom = maxVal > 0 ? maxVal : 1;
    const isSingle = rawItems.length === 1;
    const points = rawItems.map((item, i) => {
      const x = isSingle
        ? (leftX + rightX) / 2
        : leftX + (i / Math.max(1, rawItems.length - 1)) * spanX;
      const ratio = item.valid && maxVal > 0 ? item.value / denom : 0;
      const y = item.valid ? BOTTOM_Y - ratio * SPAN_Y : BOTTOM_Y;
      return { ...item, x, y };
    });
    currentPoints = points;

    const validPoints = points.filter((p) => p.valid);
    patchAttr(emptyHintEl, 'hidden', validPoints.length > 0);

    const colorSig = Array.from(modelColorMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    const sig =
      `${viewW}|${metric}|${showAgentPrefix}|${isMultiCompare ? 'multi' : 'single'}:${targetKeys.join(',')}|${colorSig}|` +
      points
        .map((p) => `${p.stepTag}:${p.modelText}:${p.valid ? p.value.toFixed(4) : 'x'}`)
        .join('|');

    if (sig !== lastSig) {
      lastSig = sig;
      while (multiAreaGroup.firstChild) multiAreaGroup.removeChild(multiAreaGroup.firstChild);
      while (multiLineGroup.firstChild) multiLineGroup.removeChild(multiLineGroup.firstChild);
      while (dotsGroup.firstChild) dotsGroup.removeChild(dotsGroup.firstChild);

      if (isMultiCompare) {
        patchAttr(linePath, 'd', '');
        patchAttr(areaPath, 'd', '');

        for (const gk of targetKeys) {
          const seriesColor = modelColorMap.get(gk) || accentColor;
          const seriesPts = points.filter((p) => p.modelGroupKey === gk && p.valid);
          if (seriesPts.length === 0) continue;

          if (seriesPts.length === 1) {
            const singleDot = document.createElementNS(SVG_NS, 'circle');
            singleDot.setAttribute('cx', seriesPts[0].x.toFixed(1));
            singleDot.setAttribute('cy', seriesPts[0].y.toFixed(1));
            singleDot.setAttribute('r', '3.1');
            singleDot.setAttribute('class', 'sstep-series-single-dot');
            patchStyleVar(singleDot, '--sstep-series-color', seriesColor);
            multiLineGroup.appendChild(singleDot);
          } else {
            const seriesLineD = buildSplinePath(seriesPts);
            const firstX = seriesPts[0].x.toFixed(1);
            const lastX = seriesPts[seriesPts.length - 1].x.toFixed(1);

            const mArea = document.createElementNS(SVG_NS, 'path');
            mArea.setAttribute('class', 'sstep-multi-area');
            mArea.setAttribute(
              'd',
              `${seriesLineD} L ${lastX} ${BOTTOM_Y} L ${firstX} ${BOTTOM_Y} Z`
            );
            patchStyleVar(mArea, '--sstep-series-color', seriesColor);
            multiAreaGroup.appendChild(mArea);

            const mLine = document.createElementNS(SVG_NS, 'path');
            mLine.setAttribute('class', 'sstep-fit-line');
            mLine.setAttribute('fill', 'none');
            mLine.setAttribute('d', seriesLineD);
            patchStyleVar(mLine, '--sstep-fit-accent', seriesColor);
            multiLineGroup.appendChild(mLine);

            if (seriesPts.length <= 36) {
              for (const pt of seriesPts) {
                const dot = document.createElementNS(SVG_NS, 'circle');
                dot.setAttribute('cx', pt.x.toFixed(1));
                dot.setAttribute('cy', pt.y.toFixed(1));
                dot.setAttribute('r', seriesPts.length > 20 ? '1.7' : '2.1');
                dot.setAttribute('class', 'sstep-node-dot');
                patchStyleVar(dot, '--dot-stroke', seriesColor);
                dotsGroup.appendChild(dot);
              }
            }
          }
        }
      } else {
        if (validPoints.length === 0) {
          patchAttr(linePath, 'd', '');
          patchAttr(areaPath, 'd', '');
        } else if (validPoints.length === 1) {
          const yStr = validPoints[0].y.toFixed(1);
          const lineD = `M ${leftX.toFixed(1)} ${yStr} L ${rightX.toFixed(1)} ${yStr}`;
          patchAttr(linePath, 'd', lineD);
          patchAttr(
            areaPath,
            'd',
            `${lineD} L ${rightX.toFixed(1)} ${BOTTOM_Y} L ${leftX.toFixed(1)} ${BOTTOM_Y} Z`
          );
        } else {
          const lineD = buildSplinePath(validPoints);
          const firstX = validPoints[0].x.toFixed(1);
          const lastX = validPoints[validPoints.length - 1].x.toFixed(1);
          patchAttr(linePath, 'd', lineD);
          patchAttr(areaPath, 'd', `${lineD} L ${lastX} ${BOTTOM_Y} L ${firstX} ${BOTTOM_Y} Z`);
        }

        if (points.length <= 64) {
          for (const pt of points) {
            const dot = document.createElementNS(SVG_NS, 'circle');
            dot.setAttribute('cx', pt.x.toFixed(1));
            dot.setAttribute('cy', pt.y.toFixed(1));
            if (pt.valid) {
              dot.setAttribute('r', points.length > 36 ? '1.8' : '2.3');
              dot.setAttribute('class', 'sstep-node-dot');
              patchStyleVar(
                dot,
                '--dot-stroke',
                modelColorMap.size > 1 ? pt.dotColor : accentColor
              );
            } else {
              dot.setAttribute('r', '1.6');
              dot.setAttribute('class', 'sstep-node-dot is-skipped');
            }
            dotsGroup.appendChild(dot);
          }
        }
      }

      const tickIndices = computeStepTickIndices(points.length);
      while (xAxisEl.firstChild) xAxisEl.removeChild(xAxisEl.firstChild);
      tickElsByIdx = new Map();
      for (let i = 0; i < tickIndices.length; i++) {
        const tIdx = tickIndices[i];
        const pt = points[tIdx];
        if (!pt) continue;
        const isFirst = !isSingle && i === 0;
        const isLast = !isSingle && i === tickIndices.length - 1;
        const pct = isFirst ? 0 : isLast ? 100 : (pt.x / viewW) * 100;
        const tickEl = h('span', {
          className: `trend-x-tick text-mono${isFirst ? ' is-start' : isLast ? ' is-end' : ''}`,
          text: pt.stepTag,
          title: `${pt.stepTag} · ${pt.modelText}`,
        });
        patchStyleVar(tickEl, '--tick-x', `${pct.toFixed(2)}%`);
        tickEl.onclick = () => showHoverAt(tIdx);
        xAxisEl.appendChild(tickEl);
        tickElsByIdx.set(tIdx, tickEl);
      }

      while (modelLegendEl.firstChild) modelLegendEl.removeChild(modelLegendEl.firstChild);
      if (isMultiCompare) {
        patchAttr(modelLegendEl, 'hidden', false);
        for (const gk of targetKeys) {
          const colorVar = modelColorMap.get(gk) || accentColor;
          const swatch = h('span', { className: 'sstep-legend-line' });
          patchStyleVar(swatch, '--swatch-bg', colorVar);
          const stStat = perModelStats.get(gk);
          const baseLabel = modelLabelByGroup.get(gk) || gk;
          let summarySuffix = '无样本';
          if (stStat && stStat.count > 0) {
            if (metric === 'totalTokens') {
              summarySuffix = formatTokens(stStat.cumTok);
            } else if (metric === 'context') {
              summarySuffix = `峰 ${formatTokens(stStat.max)}`;
            } else if (metric === 'tps' || metric === 'ttft') {
              summarySuffix = formatChartMetricCompact(metric, stStat.sum / stStat.count);
            } else if (metric === 'cost') {
              summarySuffix = formatUsd(stStat.cumCost, {
                precise: stStat.cumCost > 0 && stStat.cumCost < 0.1,
              });
            }
          }
          modelLegendEl.appendChild(
            h('span', { className: 'sstep-legend-item' }, [
              swatch,
              h('span', { text: `${baseLabel} (${summarySuffix})` }),
            ])
          );
        }
      } else {
        const showPooledDotLegend = points.length <= 64 && modelColorMap.size > 1;
        patchAttr(modelLegendEl, 'hidden', !showPooledDotLegend);
        if (showPooledDotLegend) {
          for (const [gk, colorVar] of modelColorMap.entries()) {
            const swatch = h('span', { className: 'sstep-legend-dot' });
            patchStyleVar(swatch, '--swatch-bg', colorVar);
            modelLegendEl.appendChild(
              h('span', { className: 'sstep-legend-item' }, [
                swatch,
                h('span', { text: modelLabelByGroup.get(gk) || gk }),
              ])
            );
          }
        }
      }
    }

    if (peakIdx >= 0 && validPoints.length > 0) {
      const peakPt = points[peakIdx];
      patchText(
        peakPill,
        `峰值 ${peakPt.stepTag} · ${formatChartMetricCompact(metric, peakPt.value)}`
      );
      patchStyleVar(peakPill, '--sstep-accent', isMultiCompare ? peakPt.dotColor : accentColor);
      const pctLeft = Math.max(14, Math.min(86, (peakPt.x / viewW) * 100));
      patchStyleVar(peakPill, '--peak-x', `${pctLeft.toFixed(1)}%`);
      if (hoveredIdx < 0) patchAttr(peakPill, 'hidden', false);
    } else {
      patchAttr(peakPill, 'hidden', true);
    }

    if (hoveredIdx >= points.length) {
      clearHover();
    } else if (hoveredIdx >= 0) {
      showHoverAt(hoveredIdx);
    }

    let summaryBadge = `${matchedSteps.length}步`;
    const activeCompareCount = isMultiCompare ? targetKeys.length : 1;
    const multiPrefix = isMultiCompare ? `${activeCompareCount} 模型 · ` : '';
    if (metric === 'totalTokens') {
      summaryBadge = `${multiPrefix}累计 ${formatTokens(runningTokens)}`;
    } else if (metric === 'context') {
      const lastCtx = points[points.length - 1]?.value || 0;
      summaryBadge = isMultiCompare
        ? `${multiPrefix}峰值 ${formatTokens(maxVal)}`
        : `当前 ${formatTokens(lastCtx)}`;
    } else if (metric === 'tps') {
      summaryBadge =
        validCount > 0
          ? `${multiPrefix}均值 ${(validSum / validCount).toFixed(1)} tok/s`
          : '暂无有效样本';
    } else if (metric === 'ttft') {
      summaryBadge =
        validCount > 0
          ? `${multiPrefix}均值 ${(validSum / validCount).toFixed(1)}s`
          : '暂无有效样本';
    } else if (metric === 'cost') {
      summaryBadge = `${multiPrefix}累计 ${formatUsd(runningCost, { precise: runningCost > 0 && runningCost < 0.1 })}`;
    }

    return { summaryBadge };
  }

  return { el: rootEl, update, destroy };
}

/**
 * 创建学术论文风格散点回归与 95% 置信带拟合图（全宽 1:1 贴边对齐 + 项目统一冷蓝灰设计语言）：
 * - 全宽水平参考网格与底部线性步序刻度轴（内嵌左对齐 Y 轴刻度标签，零左右缩进留白）；
 * - 半透明冷蓝灰实心观测散点（自然呈现重叠密度）；
 * - 围绕回归曲线的 95% CI 置信区间阴影带（绝不向 y=0 做面积图填充）；
 * - 高斯局部线性回归曲线（LOESS, n >= 6）或精确线性回归（OLS, n <= 5），配相关系数 r 与拟合优度 R²。
 */
function createModelFitChart() {
  const DEFAULT_VIEW_W = 460;
  const VIEW_H = 136;
  const TOP_Y = 16;
  const BOTTOM_Y = 116;
  const SPAN_Y = BOTTOM_Y - TOP_Y;

  let viewW = DEFAULT_VIEW_W;

  function resolveFitBounds(w) {
    const plotLeft = 2;
    const plotRight = Math.max(plotLeft + 20, w - 2);
    return { plotLeft, plotRight, plotSpanX: plotRight - plotLeft };
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${viewW} ${VIEW_H}`);
  svg.setAttribute('class', 'sstep-svg sstep-fit-svg');
  svg.setAttribute('aria-hidden', 'true');

  const gridGroup = document.createElementNS(SVG_NS, 'g');
  gridGroup.setAttribute('class', 'sstep-sci-grid');
  svg.appendChild(gridGroup);

  const axesGroup = document.createElementNS(SVG_NS, 'g');
  axesGroup.setAttribute('class', 'sstep-sci-axes');
  svg.appendChild(axesGroup);

  const multiBandGroup = document.createElementNS(SVG_NS, 'g');
  multiBandGroup.setAttribute('class', 'sstep-multi-band-group');
  svg.appendChild(multiBandGroup);

  const scatterGroup = document.createElementNS(SVG_NS, 'g');
  scatterGroup.setAttribute('class', 'sstep-scatter-group');
  svg.appendChild(scatterGroup);

  const multiCurveGroup = document.createElementNS(SVG_NS, 'g');
  multiCurveGroup.setAttribute('class', 'sstep-multi-curve-group');
  svg.appendChild(multiCurveGroup);

  const ciBandPath = document.createElementNS(SVG_NS, 'path');
  ciBandPath.setAttribute('class', 'sstep-ci-band');
  svg.appendChild(ciBandPath);

  const olsLine = document.createElementNS(SVG_NS, 'line');
  olsLine.setAttribute('class', 'sstep-ols-line');
  olsLine.setAttribute('hidden', 'true');
  svg.appendChild(olsLine);

  const fitPath = document.createElementNS(SVG_NS, 'path');
  fitPath.setAttribute('class', 'sstep-fit-line');
  fitPath.setAttribute('fill', 'none');
  svg.appendChild(fitPath);

  const hoverLine = document.createElementNS(SVG_NS, 'line');
  hoverLine.setAttribute('class', 'trend-hover-line');
  hoverLine.setAttribute('y1', String(TOP_Y));
  hoverLine.setAttribute('y2', String(BOTTOM_Y));
  hoverLine.setAttribute('hidden', 'true');
  svg.appendChild(hoverLine);

  const hoverRawDot = document.createElementNS(SVG_NS, 'circle');
  hoverRawDot.setAttribute('r', '3.0');
  hoverRawDot.setAttribute('class', 'sstep-hover-raw-dot');
  hoverRawDot.setAttribute('hidden', 'true');
  svg.appendChild(hoverRawDot);

  const hoverFitDot = document.createElementNS(SVG_NS, 'circle');
  hoverFitDot.setAttribute('r', '3.1');
  hoverFitDot.setAttribute('class', 'trend-hover-dot');
  hoverFitDot.setAttribute('hidden', 'true');
  svg.appendChild(hoverFitDot);

  const emptyHintEl = h('div', {
    className: 'sstep-empty-hint text-muted',
    text: '该模型暂无有效拟合样本',
    hidden: true,
  });

  const tipHeadLeft = h('span', { className: 'trend-tip-time text-mono' });
  const tipHeadRight = h('span', { className: 'trend-tip-calls text-mono' });
  const tipMainLeft = h('strong', { className: 'trend-tip-tokens text-mono' });
  const tipMainRight = h('span', { className: 'trend-tip-cost text-mono' });
  const tipSub = h('div', { className: 'trend-tip-sub text-mono', hidden: true });
  const tooltipEl = h('div', { className: 'trend-tooltip', hidden: true }, [
    h('div', { className: 'trend-tip-head' }, [tipHeadLeft, tipHeadRight]),
    h('div', { className: 'trend-tip-main' }, [tipMainLeft, tipMainRight]),
    tipSub,
  ]);

  const fitMethodLabelEl = h('span', { text: 'LOESS 拟合' });
  const olsLegendWrapEl = h('span', { className: 'sstep-fit-legend-ols' }, [
    h('span', { className: 'sstep-fit-swatch is-ols' }),
    h('span', { text: 'OLS 线性' }),
  ]);
  const singleLegendEl = h('span', { className: 'sstep-fit-legend' }, [
    h('span', { className: 'sstep-fit-swatch is-scatter' }),
    h('span', { text: '观测值' }),
    h('span', { className: 'sstep-fit-swatch is-curve' }),
    fitMethodLabelEl,
    h('span', { className: 'sstep-fit-swatch is-ci' }),
    h('span', { text: '95% CI' }),
    olsLegendWrapEl,
  ]);
  const multiLegendEl = h('div', { className: 'sstep-model-legend', hidden: true });
  const fitStatsEl = h('span', { className: 'sstep-fit-delta text-mono text-muted' });

  const fitLegendFoot = h('div', { className: 'sstep-fit-foot' }, [
    singleLegendEl,
    multiLegendEl,
    fitStatsEl,
  ]);

  const plotStage = h('div', { className: 'sstep-plot-stage' }, [emptyHintEl, tooltipEl, svg]);
  const rootEl = h('div', { className: 'sstep-chart-wrap' }, [plotStage, fitLegendFoot]);

  let currentSamples = [];
  let currentMetric = 'tps';
  let hoveredIdx = -1;
  let lastSig = '';
  let lastUpdateParams = null;

  function syncViewWidth() {
    const measured = Math.round(
      plotStage.clientWidth ||
        svg.clientWidth ||
        plotStage.getBoundingClientRect?.()?.width ||
        0
    );
    if (measured >= 160 && measured !== viewW) {
      viewW = measured;
      svg.setAttribute('viewBox', `0 0 ${viewW} ${VIEW_H}`);
      return true;
    }
    return false;
  }

  function showHoverAt(idx) {
    if (idx < 0 || idx >= currentSamples.length) {
      clearHover();
      return;
    }
    hoveredIdx = idx;
    const sp = currentSamples[idx];
    patchAttr(hoverLine, 'hidden', false);
    patchAttr(hoverLine, 'x1', sp.x.toFixed(1));
    patchAttr(hoverLine, 'x2', sp.x.toFixed(1));

    patchAttr(hoverFitDot, 'hidden', false);
    patchAttr(hoverFitDot, 'cx', sp.x.toFixed(1));
    patchAttr(hoverFitDot, 'cy', sp.fitY.toFixed(1));
    patchStyleVar(hoverFitDot, '--hover-dot-color', sp.seriesColor || 'var(--accent-primary)');

    patchAttr(hoverRawDot, 'hidden', false);
    patchAttr(hoverRawDot, 'cx', sp.x.toFixed(1));
    patchAttr(hoverRawDot, 'cy', sp.rawY.toFixed(1));

    patchAttr(tooltipEl, 'hidden', false);
    patchText(tipHeadLeft, sp.stepTag);
    patchText(tipHeadRight, sp.modelText);
    patchText(tipMainLeft, `拟合 ${formatChartMetricValue(currentMetric, sp.fitVal)}`);
    patchText(tipMainRight, `观测 ${formatChartMetricValue(currentMetric, sp.rawVal)}`);

    patchAttr(tipSub, 'hidden', false);
    if (sp.compareHint) {
      patchText(tipSub, sp.compareHint);
    } else if (currentSamples.length >= 3 && sp.ciHalf > 0) {
      patchText(
        tipSub,
        `95% CI [${formatChartMetricCompact(currentMetric, sp.ciLow)}, ${formatChartMetricCompact(currentMetric, sp.ciHigh)}]`
      );
    } else {
      const ctxTok = Math.max(0, Number(sp.st?.contextTokens || 0));
      patchText(
        tipSub,
        `上下文 ${formatTokens(ctxTok)} · 缓存 ${Number(sp.st?.cacheHitPct ?? 0)}%`
      );
    }

    const rawPct = (sp.x / viewW) * 100;
    const clampedPct = Math.max(1, Math.min(99, rawPct));
    patchStyleVar(tooltipEl, '--tip-x', `${clampedPct.toFixed(1)}%`);
    patchStyleVar(tooltipEl, '--tip-shift', `-${clampedPct.toFixed(1)}%`);
  }

  function clearHover() {
    hoveredIdx = -1;
    patchAttr(hoverLine, 'hidden', true);
    patchAttr(hoverFitDot, 'hidden', true);
    patchAttr(hoverRawDot, 'hidden', true);
    patchAttr(tooltipEl, 'hidden', true);
  }

  plotStage.addEventListener('mousemove', (e) => {
    if (!currentSamples.length) return;
    const rect = svg.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const relX = ((e.clientX - rect.left) / rect.width) * viewW;
    let bestIdx = 0;
    let bestDist = Math.abs(currentSamples[0].x - relX);
    for (let i = 1; i < currentSamples.length; i++) {
      const d = Math.abs(currentSamples[i].x - relX);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    showHoverAt(bestIdx);
  });
  plotStage.addEventListener('mouseleave', clearHover);

  let resizeObs = null;
  let onWinResize = null;
  if (typeof ResizeObserver === 'function') {
    resizeObs = new ResizeObserver(() => {
      if (syncViewWidth() && lastUpdateParams) {
        lastSig = '';
        update(lastUpdateParams);
      }
    });
    resizeObs.observe(plotStage);
  } else if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    onWinResize = () => {
      if (syncViewWidth() && lastUpdateParams) {
        lastSig = '';
        update(lastUpdateParams);
      }
    };
    window.addEventListener('resize', onWinResize);
  }

  function destroy() {
    resizeObs?.disconnect();
    resizeObs = null;
    if (onWinResize && typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('resize', onWinResize);
      onWinResize = null;
    }
  }

  /**
   * 在给定横坐标 x0 处对某模型的回归网格做线性插值（仅当 x0 位于该模型观测区间内时返回拟合值）。
   */
  function interpolateSeriesGridFit(grid, x0) {
    if (!Array.isArray(grid) || grid.length === 0) return null;
    if (grid.length === 1) {
      return Math.abs(grid[0].x - x0) < 1e-6 ? grid[0].fit : null;
    }
    const gMin = grid[0].x;
    const gMax = grid[grid.length - 1].x;
    if (x0 < gMin - 1e-6 || x0 > gMax + 1e-6) return null;
    if (x0 <= gMin) return grid[0].fit;
    if (x0 >= gMax) return grid[grid.length - 1].fit;
    for (let i = 0; i < grid.length - 1; i++) {
      const a = grid[i];
      const b = grid[i + 1];
      if (x0 >= a.x && x0 <= b.x) {
        const span = b.x - a.x;
        const t = span > 1e-9 ? (x0 - a.x) / span : 0;
        return a.fit + t * (b.fit - a.fit);
      }
    }
    return grid[grid.length - 1].fit;
  }

  /**
   * 绘制共享的水平网格线、底部步序坐标轴及左对齐内联 Y 轴刻度标签。
   */
  function renderFitAxesAndGrid({ yScale, mapY, mapX, xs, isSingle, plotLeft, plotRight, metric, showAgentPrefix }) {
    while (gridGroup.firstChild) gridGroup.removeChild(gridGroup.firstChild);
    while (axesGroup.firstChild) axesGroup.removeChild(axesGroup.firstChild);

    const xMin = xs[0];
    const xMax = xs[xs.length - 1];

    const xSpine = document.createElementNS(SVG_NS, 'line');
    xSpine.setAttribute('x1', '0');
    xSpine.setAttribute('y1', String(BOTTOM_Y));
    xSpine.setAttribute('x2', String(viewW));
    xSpine.setAttribute('y2', String(BOTTOM_Y));
    xSpine.setAttribute('class', 'sstep-axis-spine');
    axesGroup.appendChild(xSpine);

    for (const tv of yScale.ticks) {
      const ty = mapY(tv);
      if (Math.abs(ty - BOTTOM_Y) > 1.5) {
        const gLine = document.createElementNS(SVG_NS, 'line');
        gLine.setAttribute('x1', '0');
        gLine.setAttribute('y1', ty.toFixed(1));
        gLine.setAttribute('x2', String(viewW));
        gLine.setAttribute('y2', ty.toFixed(1));
        gridGroup.appendChild(gLine);
      }

      const labelEl = document.createElementNS(SVG_NS, 'text');
      labelEl.setAttribute('x', '0');
      labelEl.setAttribute('y', (ty - 3.5).toFixed(1));
      labelEl.setAttribute('text-anchor', 'start');
      labelEl.setAttribute('class', 'sstep-axis-label is-y-inline');
      labelEl.textContent = formatYAxisTick(metric, tv, yScale.step);
      axesGroup.appendChild(labelEl);
    }

    const xTickEntries = [];
    if (isSingle) {
      xTickEntries.push({
        xv: Math.round(xMin),
        tickX: mapX(xMin),
        labelX: mapX(xMin),
        anchor: 'middle',
      });
    } else {
      xTickEntries.push({
        xv: Math.round(xMin),
        tickX: plotLeft,
        labelX: 0,
        anchor: 'start',
      });
      const interiorTicks = computeNiceXStepTicks(xs);
      for (const xv of interiorTicks) {
        if (xv <= xMin || xv >= xMax) continue;
        const tx = mapX(xv);
        if (tx < plotLeft + 38 || tx > plotRight - 38) continue;
        xTickEntries.push({
          xv,
          tickX: tx,
          labelX: tx,
          anchor: 'middle',
        });
      }
      xTickEntries.push({
        xv: Math.round(xMax),
        tickX: plotRight,
        labelX: viewW,
        anchor: 'end',
      });
    }

    for (const xt of xTickEntries) {
      const tickMark = document.createElementNS(SVG_NS, 'line');
      tickMark.setAttribute('x1', xt.tickX.toFixed(1));
      tickMark.setAttribute('y1', String(BOTTOM_Y));
      tickMark.setAttribute('x2', xt.tickX.toFixed(1));
      tickMark.setAttribute('y2', (BOTTOM_Y + 3.2).toFixed(1));
      tickMark.setAttribute('class', 'sstep-axis-tick');
      axesGroup.appendChild(tickMark);

      const labelEl = document.createElementNS(SVG_NS, 'text');
      labelEl.setAttribute('x', xt.labelX.toFixed(1));
      labelEl.setAttribute('y', (BOTTOM_Y + 13.5).toFixed(1));
      labelEl.setAttribute('text-anchor', xt.anchor);
      labelEl.setAttribute('class', 'sstep-axis-label');
      labelEl.textContent = showAgentPrefix ? `${xt.xv}` : `#${xt.xv}`;
      axesGroup.appendChild(labelEl);
    }
  }

  /**
   * @param {{
   *   steps: Array<object>,
   *   modelGroupKey?: string,
   *   modelGroupKeys?: string[]|null,
   *   modelColorByGroup?: Map<string, string>|null,
   *   metric: 'tps'|'ttft'|'cache'|'cost',
   *   showAgentPrefix?: boolean,
   *   displaySettings?: object,
   * }} params
   * @returns {{ sampleCount: number, summaryBadge: string }}
   */
  function update({
    steps = [],
    modelGroupKey = '__all__',
    modelGroupKeys = null,
    modelColorByGroup = null,
    metric = 'tps',
    showAgentPrefix = false,
    displaySettings = {},
  } = {}) {
    lastUpdateParams = {
      steps,
      modelGroupKey,
      modelGroupKeys,
      modelColorByGroup,
      metric,
      showAgentPrefix,
      displaySettings,
    };
    currentMetric = metric;
    syncViewWidth();

    patchStyleVar(rootEl, '--sstep-fit-accent', 'var(--ctx-cached)');

    const rawKeys =
      Array.isArray(modelGroupKeys) && modelGroupKeys.length > 0
        ? modelGroupKeys
        : [modelGroupKey || '__all__'];
    const isPooledAll = rawKeys.includes('__all__');
    const targetKeys = isPooledAll
      ? ['__all__']
      : Array.from(new Set(rawKeys.map((k) => String(k || '')).filter(Boolean)));
    const targetKeySet = new Set(targetKeys);
    const isMultiCompare = !isPooledAll && targetKeys.length >= 2;

    const matchedItems = [];
    let prevXVal = -Infinity;
    for (let idx = 0; idx < steps.length; idx++) {
      const st = steps[idx];
      if (!st || typeof st !== 'object') continue;
      let globalX = showAgentPrefix ? idx + 1 : Number(st.stepIndex ?? idx + 1);
      if (!Number.isFinite(globalX) || globalX <= prevXVal) {
        globalX = prevXVal === -Infinity ? idx + 1 : prevXVal + 1;
      }
      prevXVal = globalX;

      const gk = getStepModelGroupKey(st);
      if (!isPooledAll && !targetKeySet.has(gk)) {
        continue;
      }
      let valid = false;
      let rawVal = 0;
      if (metric === 'tps') {
        valid = !st.isCompactionStep && Number.isFinite(st.tokPerSec) && st.tokPerSec > 0;
        rawVal = valid ? Number(st.tokPerSec) : 0;
      } else if (metric === 'ttft') {
        valid = !st.isCompactionStep && Number.isFinite(st.ttftSec) && st.ttftSec >= 0;
        rawVal = valid ? Number(st.ttftSec) : 0;
      } else if (metric === 'cache') {
        valid = !st.isCompactionStep && Number.isFinite(st.cacheHitPct) && st.cacheHitPct >= 0;
        rawVal = valid ? Number(st.cacheHitPct) : 0;
      } else if (metric === 'cost') {
        valid = Number.isFinite(Number(st.costUsd)) && Number(st.costUsd) >= 0;
        rawVal = valid ? Number(st.costUsd) : 0;
      }
      if (valid) {
        const disp = resolveModelDisplayInfo(st, displaySettings, { fallback: '—' });
        matchedItems.push({
          st,
          gk,
          xVal: globalX,
          rawVal,
          stepTag: formatStepAxisTag(st, showAgentPrefix),
          modelText: disp.text.replace(/·压缩\s*$/u, '').trim() || disp.text,
        });
      }
    }

    if (matchedItems.length === 0) {
      currentSamples = [];
      lastSig = 'empty';
      patchAttr(ciBandPath, 'd', '');
      patchAttr(fitPath, 'd', '');
      patchAttr(olsLine, 'hidden', true);
      while (multiBandGroup.firstChild) multiBandGroup.removeChild(multiBandGroup.firstChild);
      while (multiCurveGroup.firstChild) multiCurveGroup.removeChild(multiCurveGroup.firstChild);
      while (gridGroup.firstChild) gridGroup.removeChild(gridGroup.firstChild);
      while (axesGroup.firstChild) axesGroup.removeChild(axesGroup.firstChild);
      while (scatterGroup.firstChild) scatterGroup.removeChild(scatterGroup.firstChild);
      patchAttr(singleLegendEl, 'hidden', false);
      patchAttr(multiLegendEl, 'hidden', true);
      patchAttr(emptyHintEl, 'hidden', false);
      patchText(fitStatsEl, 'n = 0');
      clearHover();
      return { sampleCount: 0, summaryBadge: '0 样本' };
    }

    patchAttr(emptyHintEl, 'hidden', true);
    const minBound = 0;
    const maxBound = metric === 'cache' ? 100 : Infinity;

    // 分支 A：多模型同图独立拟合曲线对比模式（勾选 >= 2 个模型）
    if (isMultiCompare) {
      const seriesList = [];
      for (let kIdx = 0; kIdx < targetKeys.length; kIdx++) {
        const key = targetKeys[kIdx];
        const items = matchedItems.filter((it) => it.gk === key);
        if (items.length === 0) continue;
        const xs = items.map((d) => d.xVal);
        const rawYs = items.map((d) => d.rawVal);
        const pubFit = computePublicationFit(xs, rawYs, {
          minVal: minBound,
          maxVal: maxBound,
          gridSize: 56,
          span: 0.5,
        });
        const colorVar =
          modelColorByGroup?.get(key) || MODEL_COLOR_VARS[kIdx % MODEL_COLOR_VARS.length];
        seriesList.push({
          key,
          label: items[0].modelText || key,
          colorVar,
          items,
          xs,
          rawYs,
          pubFit,
        });
      }

      patchAttr(singleLegendEl, 'hidden', true);
      patchAttr(multiLegendEl, 'hidden', false);
      patchAttr(ciBandPath, 'd', '');
      patchAttr(fitPath, 'd', '');
      patchAttr(olsLine, 'hidden', true);

      const allXs = matchedItems.map((d) => d.xVal);
      let dataMin = Infinity;
      let dataMax = -Infinity;
      for (const s of seriesList) {
        for (const v of s.rawYs) {
          if (v < dataMin) dataMin = v;
          if (v > dataMax) dataMax = v;
        }
        for (const g of s.pubFit.grid) {
          if (g.ciLow < dataMin) dataMin = g.ciLow;
          if (g.ciHigh > dataMax) dataMax = g.ciHigh;
        }
      }

      const yScale = computeNiceYScale(dataMin, dataMax, {
        minBound,
        maxBound,
        tickCount: 4,
      });
      const yRange = Math.max(1e-9, yScale.max - yScale.min);
      const mapY = (v) =>
        BOTTOM_Y - ((clampValue(v, yScale.min, yScale.max) - yScale.min) / yRange) * SPAN_Y;

      const { plotLeft, plotRight, plotSpanX } = resolveFitBounds(viewW);
      const xMin = allXs[0];
      const xMax = allXs[allXs.length - 1];
      const isSingle = matchedItems.length === 1 || xMax - xMin <= 1e-9;
      const mapX = (xv) =>
        isSingle
          ? (plotLeft + plotRight) / 2
          : plotLeft + ((xv - xMin) / (xMax - xMin)) * plotSpanX;

      const combinedSamples = [];
      for (const s of seriesList) {
        const sSamples = s.items.map((item, i) => {
          const x = mapX(item.xVal);
          const rawY = mapY(item.rawVal);
          const fitVal = s.pubFit.sampleFits[i];
          const fitY = mapY(fitVal);
          const peerParts = [];
          for (const other of seriesList) {
            if (other.key === s.key) continue;
            const interp = interpolateSeriesGridFit(other.pubFit.grid, item.xVal);
            if (interp !== null) {
              peerParts.push(`${other.label} ${formatChartMetricCompact(metric, interp)}`);
            } else {
              peerParts.push(`${other.label} 均 ${formatChartMetricCompact(metric, other.pubFit.mean)}`);
            }
          }
          return {
            ...item,
            x,
            rawY,
            fitVal,
            fitY,
            ciLow: s.pubFit.sampleCiLow[i],
            ciHigh: s.pubFit.sampleCiHigh[i],
            ciHalf: s.pubFit.sampleCiHalf[i],
            seriesColor: s.colorVar,
            compareHint: peerParts.length > 0 ? `同图对比：${peerParts.join(' · ')}` : '',
          };
        });
        s.samples = sSamples;
        combinedSamples.push(...sSamples);
      }
      combinedSamples.sort((a, b) => a.x - b.x || a.xVal - b.xVal);
      currentSamples = combinedSamples;

      const sig =
        `multi|${viewW}|${targetKeys.join(',')}|${metric}|${showAgentPrefix}|${yScale.min.toFixed(4)}|${yScale.max.toFixed(4)}|` +
        seriesList
          .map(
            (s) =>
              `${s.key}:${s.colorVar}:` +
              s.samples.map((p) => `${p.xVal}:${p.rawVal.toFixed(3)}:${p.fitVal.toFixed(3)}`).join(',')
          )
          .join('||');

      if (sig !== lastSig) {
        lastSig = sig;
        renderFitAxesAndGrid({
          yScale,
          mapY,
          mapX,
          xs: allXs,
          isSingle,
          plotLeft,
          plotRight,
          metric,
          showAgentPrefix,
        });

        while (multiBandGroup.firstChild) multiBandGroup.removeChild(multiBandGroup.firstChild);
        while (scatterGroup.firstChild) scatterGroup.removeChild(scatterGroup.firstChild);
        while (multiCurveGroup.firstChild) multiCurveGroup.removeChild(multiCurveGroup.firstChild);

        const dotRadius =
          combinedSamples.length > 80 ? '1.8' : combinedSamples.length > 36 ? '2.1' : '2.4';

        for (const s of seriesList) {
          for (const sp of s.samples) {
            const dot = document.createElementNS(SVG_NS, 'circle');
            dot.setAttribute('cx', sp.x.toFixed(1));
            dot.setAttribute('cy', sp.rawY.toFixed(1));
            dot.setAttribute('r', dotRadius);
            dot.setAttribute('class', 'sstep-scatter-dot is-multi');
            patchStyleVar(dot, '--sstep-fit-accent', s.colorVar);
            scatterGroup.appendChild(dot);
          }

          if (s.samples.length === 1) {
            const sp = s.samples[0];
            const segHalf = Math.min(12, plotSpanX * 0.04);
            const x1 = Math.max(plotLeft, sp.x - segHalf).toFixed(1);
            const x2 = Math.min(plotRight, sp.x + segHalf).toFixed(1);
            const yStr = sp.fitY.toFixed(1);
            const lineEl = document.createElementNS(SVG_NS, 'path');
            lineEl.setAttribute('class', 'sstep-fit-line');
            lineEl.setAttribute('fill', 'none');
            lineEl.setAttribute('d', `M ${x1} ${yStr} L ${x2} ${yStr}`);
            patchStyleVar(lineEl, '--sstep-fit-accent', s.colorVar);
            multiCurveGroup.appendChild(lineEl);
          } else {
            const gridPts = s.pubFit.grid.map((g) => ({
              x: mapX(g.x),
              fitY: mapY(g.fit),
              lowY: mapY(g.ciLow),
              highY: mapY(g.ciHigh),
            }));

            if (s.samples.length >= 3) {
              let bandD = `M ${gridPts[0].x.toFixed(1)} ${gridPts[0].highY.toFixed(1)}`;
              for (let i = 1; i < gridPts.length; i++) {
                bandD += ` L ${gridPts[i].x.toFixed(1)} ${gridPts[i].highY.toFixed(1)}`;
              }
              for (let i = gridPts.length - 1; i >= 0; i--) {
                bandD += ` L ${gridPts[i].x.toFixed(1)} ${gridPts[i].lowY.toFixed(1)}`;
              }
              bandD += ' Z';
              const bandEl = document.createElementNS(SVG_NS, 'path');
              bandEl.setAttribute('class', 'sstep-ci-band is-multi');
              bandEl.setAttribute('d', bandD);
              patchStyleVar(bandEl, '--sstep-fit-accent', s.colorVar);
              multiBandGroup.appendChild(bandEl);
            }

            const curveEl = document.createElementNS(SVG_NS, 'path');
            curveEl.setAttribute('class', 'sstep-fit-line');
            curveEl.setAttribute('fill', 'none');
            curveEl.setAttribute(
              'd',
              buildPolylinePath(gridPts.map((p) => ({ x: p.x, y: p.fitY })))
            );
            patchStyleVar(curveEl, '--sstep-fit-accent', s.colorVar);
            multiCurveGroup.appendChild(curveEl);
          }
        }

        while (multiLegendEl.firstChild) multiLegendEl.removeChild(multiLegendEl.firstChild);
        for (const s of seriesList) {
          const swatch = h('span', { className: 'sstep-legend-line' });
          patchStyleVar(swatch, '--swatch-bg', s.colorVar);
          multiLegendEl.appendChild(
            h('span', { className: 'sstep-legend-item' }, [
              swatch,
              h('span', {
                text: `${s.label} (${formatChartMetricCompact(metric, s.pubFit.mean)})`,
              }),
            ])
          );
        }
      }

      const r2SummaryTitle = seriesList
        .map((s) => {
          const rSign = s.pubFit.r >= 0 ? '+' : '';
          return `${s.label}: n=${s.samples.length}, r=${rSign}${s.pubFit.r.toFixed(2)}, R²=${s.pubFit.r2.toFixed(2)}`;
        })
        .join(' | ');
      patchText(
        fitStatsEl,
        seriesList.length <= 2
          ? seriesList.map((s) => `R²=${s.pubFit.r2.toFixed(2)}`).join(' · ')
          : `${seriesList.length} 条拟合线`
      );
      patchAttr(fitStatsEl, 'title', r2SummaryTitle);

      if (hoveredIdx >= currentSamples.length) {
        clearHover();
      } else if (hoveredIdx >= 0) {
        showHoverAt(hoveredIdx);
      }

      return {
        sampleCount: combinedSamples.length,
        summaryBadge: `${combinedSamples.length}步 · ${seriesList.length} 模型对比`,
      };
    }

    // 分支 B：单模型或整体合并单曲线模式
    while (multiBandGroup.firstChild) multiBandGroup.removeChild(multiBandGroup.firstChild);
    while (multiCurveGroup.firstChild) multiCurveGroup.removeChild(multiCurveGroup.firstChild);
    patchAttr(singleLegendEl, 'hidden', false);
    patchAttr(multiLegendEl, 'hidden', true);

    const filtered = matchedItems;
    const xs = filtered.map((d) => d.xVal);
    const rawYs = filtered.map((d) => d.rawVal);
    const pubFit = computePublicationFit(xs, rawYs, {
      minVal: minBound,
      maxVal: maxBound,
      gridSize: 64,
      span: 0.5,
    });

    patchText(fitMethodLabelEl, pubFit.method === 'LOESS' ? 'LOESS 拟合' : 'OLS 回归');
    patchAttr(olsLegendWrapEl, 'hidden', filtered.length < 6);

    let dataMin = Infinity;
    let dataMax = -Infinity;
    for (let i = 0; i < filtered.length; i++) {
      if (rawYs[i] < dataMin) dataMin = rawYs[i];
      if (rawYs[i] > dataMax) dataMax = rawYs[i];
    }
    for (const g of pubFit.grid) {
      if (g.ciLow < dataMin) dataMin = g.ciLow;
      if (g.ciHigh > dataMax) dataMax = g.ciHigh;
    }

    const yScale = computeNiceYScale(dataMin, dataMax, {
      minBound,
      maxBound,
      tickCount: 4,
    });
    const yRange = Math.max(1e-9, yScale.max - yScale.min);
    const mapY = (v) =>
      BOTTOM_Y - ((clampValue(v, yScale.min, yScale.max) - yScale.min) / yRange) * SPAN_Y;

    const { plotLeft, plotRight, plotSpanX } = resolveFitBounds(viewW);
    const xMin = xs[0];
    const xMax = xs[xs.length - 1];
    const isSingle = filtered.length === 1 || xMax - xMin <= 1e-9;
    const mapX = (xv) =>
      isSingle
        ? (plotLeft + plotRight) / 2
        : plotLeft + ((xv - xMin) / (xMax - xMin)) * plotSpanX;

    const samples = filtered.map((item, i) => {
      const x = mapX(item.xVal);
      const rawY = mapY(item.rawVal);
      const fitVal = pubFit.sampleFits[i];
      const fitY = mapY(fitVal);
      return {
        ...item,
        x,
        rawY,
        fitVal,
        fitY,
        ciLow: pubFit.sampleCiLow[i],
        ciHigh: pubFit.sampleCiHigh[i],
        ciHalf: pubFit.sampleCiHalf[i],
        seriesColor: 'var(--accent-primary)',
        compareHint: '',
      };
    });
    currentSamples = samples;

    const sig =
      `single|${viewW}|${targetKeys[0]}|${metric}|${showAgentPrefix}|${yScale.min.toFixed(4)}|${yScale.max.toFixed(4)}|` +
      samples.map((s) => `${s.xVal}:${s.rawVal.toFixed(4)}:${s.fitVal.toFixed(4)}`).join('|');

    if (sig !== lastSig) {
      lastSig = sig;
      renderFitAxesAndGrid({
        yScale,
        mapY,
        mapX,
        xs,
        isSingle,
        plotLeft,
        plotRight,
        metric,
        showAgentPrefix,
      });

      // 2. 绘制半透明冷蓝灰实心观测散点（自然呈现局部密度，不抢夺拟合曲线焦点）
      while (scatterGroup.firstChild) scatterGroup.removeChild(scatterGroup.firstChild);
      const dotRadius = samples.length > 80 ? '1.8' : samples.length > 36 ? '2.1' : '2.4';
      for (const s of samples) {
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('cx', s.x.toFixed(1));
        dot.setAttribute('cy', s.rawY.toFixed(1));
        dot.setAttribute('r', dotRadius);
        dot.setAttribute('class', 'sstep-scatter-dot');
        scatterGroup.appendChild(dot);
      }

      // 3. 绘制 95% CI 置信带闭合多边形与回归拟合曲线（绝不向底部 X 轴填充面积！）
      if (isSingle) {
        const yStr = samples[0].fitY.toFixed(1);
        patchAttr(fitPath, 'd', `M ${plotLeft.toFixed(1)} ${yStr} L ${plotRight.toFixed(1)} ${yStr}`);
        patchAttr(ciBandPath, 'd', '');
        patchAttr(olsLine, 'hidden', true);
      } else {
        const gridPts = pubFit.grid.map((g) => ({
          x: mapX(g.x),
          fitY: mapY(g.fit),
          lowY: mapY(g.ciLow),
          highY: mapY(g.ciHigh),
        }));

        patchAttr(
          fitPath,
          'd',
          buildPolylinePath(gridPts.map((p) => ({ x: p.x, y: p.fitY })))
        );

        if (samples.length >= 3) {
          let bandD = `M ${gridPts[0].x.toFixed(1)} ${gridPts[0].highY.toFixed(1)}`;
          for (let i = 1; i < gridPts.length; i++) {
            bandD += ` L ${gridPts[i].x.toFixed(1)} ${gridPts[i].highY.toFixed(1)}`;
          }
          for (let i = gridPts.length - 1; i >= 0; i--) {
            bandD += ` L ${gridPts[i].x.toFixed(1)} ${gridPts[i].lowY.toFixed(1)}`;
          }
          bandD += ' Z';
          patchAttr(ciBandPath, 'd', bandD);
        } else {
          patchAttr(ciBandPath, 'd', '');
        }

        const showOlsRef = samples.length >= 6;
        patchAttr(olsLine, 'hidden', !showOlsRef);
        if (showOlsRef) {
          const olsStartVal = clampValue(pubFit.intercept + pubFit.slope * xMin, minBound, maxBound);
          const olsEndVal = clampValue(pubFit.intercept + pubFit.slope * xMax, minBound, maxBound);
          patchAttr(olsLine, 'x1', plotLeft.toFixed(1));
          patchAttr(olsLine, 'y1', mapY(olsStartVal).toFixed(1));
          patchAttr(olsLine, 'x2', plotRight.toFixed(1));
          patchAttr(olsLine, 'y2', mapY(olsEndVal).toFixed(1));
        }
      }
    }

    const summaryBadge = `${samples.length}步 · 均 ${formatChartMetricCompact(metric, pubFit.mean)}`;
    if (samples.length >= 2) {
      const rSign = pubFit.r >= 0 ? '+' : '';
      const slopeSign = pubFit.slope >= 0 ? '+' : '';
      patchText(fitStatsEl, `r = ${rSign}${pubFit.r.toFixed(2)} · R² = ${pubFit.r2.toFixed(2)}`);
      patchAttr(
        fitStatsEl,
        'title',
        `OLS: y = ${slopeSign}${pubFit.slope.toFixed(3)}x + ${pubFit.intercept.toFixed(2)} · 样本标准差 SD = ±${pubFit.sd.toFixed(2)}`
      );
    } else {
      patchText(fitStatsEl, `n = ${samples.length}`);
      patchAttr(fitStatsEl, 'title', '');
    }

    if (hoveredIdx >= samples.length) {
      clearHover();
    } else if (hoveredIdx >= 0) {
      showHoverAt(hoveredIdx);
    }

    return { sampleCount: samples.length, summaryBadge };
  }

  return { el: rootEl, update, destroy };
}

// --- src/components/layout/TopSessionHeader.js ---
/**
 * @fileoverview Row 1 of the compact top bar:
 * Bespoke CustomSelect for session switching, SVG live status indicator,
 * and async force-refresh button.
 */


function formatConvOptionMeta(c) {
  if (!c) return '';
  const subs = Number(c.subagentCount || 0);
  if (subs > 0) {
    return `主${c.stepCount || 0} · ${subs}子 (共${c.totalStepCount || c.stepCount || 0}步)`;
  }
  return `${c.stepCount || 0}步`;
}

const TopSessionHeader = defineComponent({
  name: 'TopSessionHeader',
  setup({ onCleanup }) {
    const convSelect = CustomSelect({
      modelValue: telemetryStore.getState().selectedConversationId,
      placeholder: '跟随最新会话',
      options: [{ value: '', label: '跟随最新会话' }],
      onUpdateModelValue: (nextConvId) => {
        uiStore.setState({ selectedAgentScope: 'all', ctxInspectorAgentId: 'auto' });
        telemetryStore.setState({ selectedConversationId: nextConvId });
        fetchTelemetry({ force: false });
      },
    });

    const updateBtnIcon = createSvgIcon('arrow-down', { size: 11 });
    const updateBtnText = h('span', { text: '有新版本' });
    let isHeaderUpdating = false;
    const updateBtn = h(
      'button',
      {
        type: 'button',
        className: 'update-badge-btn',
        hidden: true,
        'aria-label': '发现新版本，点击升级',
        onClick: async () => {
          if (isHeaderUpdating) return;
          isHeaderUpdating = true;
          patchText(updateBtnText, '升级中…');
          patchAttr(updateBtn, 'disabled', true);
          try {
            const res = await triggerPluginUpdate();
            if (!res?.ok) {
              uiStore.setState({ activeView: 'settings' });
            }
          } catch {
            uiStore.setState({ activeView: 'settings' });
          } finally {
            isHeaderUpdating = false;
            patchAttr(updateBtn, 'disabled', false);
            const cs = telemetryStore.getState().telemetry?.cloudStatus;
            patchText(
              updateBtnText,
              cs?.latestPluginVersion ? `升级 v${cs.latestPluginVersion}` : '有新版本'
            );
          }
        },
      },
      [updateBtnIcon, updateBtnText]
    );

    const statusIcon = createSvgIcon('pulse', { size: 12 });
    const statusText = h('span', { text: '实时 2s' });
    const statusTag = h('span', { className: 'status-tag' }, [statusIcon, statusText]);

    const refreshBtn = h(
      'button',
      {
        type: 'button',
        className: 'icon-btn',
        'aria-label': '刷新数据',
        onClick: () => fetchTelemetry({ force: true }),
      },
      [createSvgIcon('refresh', { size: 13 })]
    );

    const headerRowEl = h('div', { className: 'session-header' }, [
      h('div', { className: 'session-left' }, [convSelect.el]),
      h('div', { className: 'session-right' }, [updateBtn, statusTag, refreshBtn]),
    ]);

    const headerEl = h('header', { className: 'top-session-stack' }, [headerRowEl]);

    let lastActiveCascadeId = '';

    function renderHeaderState() {
      const telSt = telemetryStore.getState();
      const uiSt = uiStore.getState();
      const telemetry = telSt.telemetry;
      const currentCascadeId = telemetry?.activeConversation?.cascadeId || '';
      if (currentCascadeId && lastActiveCascadeId && currentCascadeId !== lastActiveCascadeId) {
        lastActiveCascadeId = currentCascadeId;
        if (uiSt.selectedAgentScope !== 'all' || uiSt.ctxInspectorAgentId !== 'auto') {
          uiStore.setState({ selectedAgentScope: 'all', ctxInspectorAgentId: 'auto' });
          return;
        }
      } else if (currentCascadeId) {
        lastActiveCascadeId = currentCascadeId;
      }

      const actConv = telemetry?.activeConversation;
      const convs = telemetry?.conversations || [];
      const hostRouteId = telSt.hostRouteConversationId || '';
      const hostMatchedConv = hostRouteId
        ? convs.find((c) => c.cascadeId === hostRouteId) ||
          (actConv?.cascadeId === hostRouteId ? actConv : null)
        : null;
      const defaultOptLabel = hostRouteId
        ? hostMatchedConv?.title
          ? `当前窗口 (${hostMatchedConv.title})`
          : `当前窗口 (${hostRouteId.slice(0, 8)})`
        : convs[0]?.title
          ? `最新 (${convs[0].title})`
          : '跟随最新会话';
      const defaultOptMeta = hostRouteId
        ? hostMatchedConv
          ? formatConvOptionMeta({
              stepCount: hostMatchedConv.stepCount,
              subagentCount: hostMatchedConv.subagentCount,
              totalStepCount: hostMatchedConv.totalStepCount ?? hostMatchedConv.totalStepsAllAgents,
            })
          : ''
        : convs[0]
          ? formatConvOptionMeta(convs[0])
          : '';
      const options = [
        { value: '', label: defaultOptLabel, meta: defaultOptMeta },
        ...convs.map((c) => ({
          value: c.cascadeId,
          label: c.title || c.cascadeId.slice(0, 8),
          meta: formatConvOptionMeta(c),
        })),
      ];
      const lockedId = telSt.selectedConversationId;
      if (lockedId && !convs.some((c) => c.cascadeId === lockedId)) {
        const isLoadedLocked = actConv?.cascadeId === lockedId;
        const lockedTitle =
          isLoadedLocked && actConv?.title
            ? actConv.title
            : `已锁定会话 (${String(lockedId).slice(0, 8)})`;
        const lockedMeta = isLoadedLocked
          ? formatConvOptionMeta({
              stepCount: actConv.stepCount,
              subagentCount: actConv.subagentCount,
              totalStepCount: actConv.totalStepsAllAgents,
            })
          : '已锁定';
        options.splice(1, 0, {
          value: lockedId,
          label: lockedTitle,
          meta: lockedMeta,
        });
      }
      convSelect.setProps({
        modelValue: telSt.selectedConversationId,
        options,
      });

      const hasSubagents = Boolean(actConv?.hasSubagents || (actConv?.subagentCount || 0) > 0);
      const aggregated = actConv?.aggregated;

      const cloudStatus = telemetry?.cloudStatus;
      const updateMode = normalizeClientUpdateMode(
        telemetry?.settings?.pluginUpdateMode,
        telemetry?.settings?.autoUpdatePlugin
      );
      const showUpdate = Boolean(cloudStatus?.updateAvailable) && updateMode !== 'off';
      patchAttr(updateBtn, 'hidden', !showUpdate);
      if (showUpdate && !isHeaderUpdating) {
        patchText(
          updateBtnText,
          cloudStatus?.latestPluginVersion
            ? `升级 v${cloudStatus.latestPluginVersion}`
            : '有新版本'
        );
      }

      const isSyncing = telSt.syncState === 'syncing';
      const isSynced = telSt.syncState === 'synced';
      const isError = telSt.syncState === 'error';
      const isRunning = Boolean(aggregated?.isRunning || telemetry?.activeConversation?.isRunning);
      const quotaMeta = telemetry?.quotas?.meta;
      const quotaStale = Boolean(quotaMeta?.refreshFailed || quotaMeta?.isStale);

      patchClasses(refreshBtn, { 'is-spinning': isSyncing });
      patchAttr(refreshBtn, 'disabled', isSyncing);

      if (isSyncing) {
        patchSvgIcon(statusIcon, 'refresh');
        patchText(statusText, '同步中');
        patchClasses(statusTag, {
          'state-running': false,
          'state-synced': true,
          'state-warn': false,
        });
      } else if (isSynced) {
        patchSvgIcon(statusIcon, 'check');
        patchText(statusText, '已刷新');
        patchClasses(statusTag, {
          'state-running': false,
          'state-synced': true,
          'state-warn': false,
        });
      } else if (isError) {
        patchSvgIcon(statusIcon, 'warning');
        patchText(statusText, '重试中');
        patchClasses(statusTag, {
          'state-running': false,
          'state-synced': false,
          'state-warn': true,
        });
      } else if (isRunning) {
        const runningAgent = (telemetry?.activeConversation?.agents || []).find((a) => a.isRunning);
        const runSuffix =
          hasSubagents && runningAgent ? ` · ${runningAgent.badgeText || runningAgent.shortLabel}` : '';
        patchSvgIcon(statusIcon, 'bolt');
        patchText(statusText, `生成中${runSuffix}`);
        patchClasses(statusTag, {
          'state-running': true,
          'state-synced': false,
          'state-warn': false,
        });
      } else if (quotaStale) {
        patchSvgIcon(statusIcon, 'warning');
        patchText(statusText, quotaMeta?.hasOfficialData ? '额度缓存' : '额度离线');
        patchClasses(statusTag, {
          'state-running': false,
          'state-synced': false,
          'state-warn': true,
        });
      } else {
        patchSvgIcon(statusIcon, 'pulse');
        patchText(statusText, '实时 2s');
        patchClasses(statusTag, {
          'state-running': false,
          'state-synced': false,
          'state-warn': false,
        });
      }
    }

    const unsubTelemetry = telemetryStore.subscribe(
      (st) => ({
        selectedConversationId: st.selectedConversationId,
        hostRouteConversationId: st.hostRouteConversationId,
        syncState: st.syncState,
        telemetry: st.telemetry,
      }),
      () => renderHeaderState()
    );

    onCleanup(() => {
      unsubTelemetry();
      convSelect.destroy();
    });

    return {
      el: headerEl,
      refs: { convSelect, statusTag, refreshBtn },
    };
  },
});

// --- src/views/LiveOverviewView.js ---
/**
 * @fileoverview View 1: LiveOverviewView (实时监控视图).
 * 负责展示当前活跃会话的核心实时遥测指标：
 * 1. 4 格实时测速矩阵：实时吞吐 (TPS)、首 Token 延迟 (TTFT)、会话有效加权均速与本步费用/缓存命中率；
 * 2. 10 通道上下文窗口构成：自动锚定当前模型的上下文压缩基线 (`compactionLimitTokens`)，
 *    通过 10 段进度条与双列图例展示模型回复、工具结果、用户消息、子代理通知、压缩摘要及系统提示词/工具/MCP/Skill/规则的 Token 占用；
 * 3. 动态多配额池监控卡片：支持 Gemini、Pro 订阅专属独立 Argon/Carbon 周配额池、Claude & GPT 等动态配额池，
 *    自动适配 5h/每周双窗口或单窗口模式，并展示本机周累计消耗与 AI 积分脚标。
 */


const PILL_BASE_PAD_PX = 14;
const CJK_CHAR_PX = 11;
const ASCII_CHAR_PX = 6.1;
const PILL_GAP_PX = 4;
const DEFAULT_BAR_WIDTH_PX = 310;

function estPillWidth(text) {
  let w = PILL_BASE_PAD_PX;
  for (const ch of String(text || '')) {
    w += ch.charCodeAt(0) > 255 ? CJK_CHAR_PX : ASCII_CHAR_PX;
  }
  return Math.ceil(w);
}

/**
 * 10 通道上下文窗口构成定义（供实时监控主视图与主窗口顶栏悬停概览卡共享）。
 */
const CTX_CHANNEL_DEFS = [
  {
    key: 'assistant',
    label: '模型回复',
    segClass: 'seg-assistant',
    title: '模型推理思考、回复正文与工具调用入参',
    getValue: (c) => Number(c.assistantTokens || 0),
  },
  {
    key: 'toolResults',
    label: '工具结果',
    segClass: 'seg-tool-results',
    title: '文件读取、终端输出与工具执行返回内容',
    getValue: (c) => Number(c.toolResultsTokens || 0),
  },
  {
    key: 'userInput',
    label: '用户消息',
    segClass: 'seg-user-input',
    title: '用户提问文本与上传附件',
    getValue: (c) => Number(c.userInputTokens ?? c.messagesTokens ?? 0),
  },
  {
    key: 'subagent',
    label: '子代理通知',
    segClass: 'seg-subagent-msg',
    title: '子代理完成汇报与后台任务系统通知',
    getValue: (c) => Number(c.subagentTokens || 0),
  },
  {
    key: 'checkpoint',
    label: '压缩摘要',
    segClass: 'seg-checkpoint',
    title: '自动上下文压缩生成的历史摘要检查点',
    getValue: (c) => Number(c.checkpointTokens || 0),
  },
  {
    key: 'systemPrompt',
    label: '系统提示词',
    segClass: 'seg-system-prompt',
    title: '核心身份、终端沙箱、制品与环境提示词',
    getValue: (c) => Number(c.systemPromptTokens || 0),
  },
  {
    key: 'systemTools',
    label: '系统工具',
    segClass: 'seg-system-tools',
    title: '内置系统工具 Schema 定义',
    getValue: (c) => Number(c.systemToolsTokens || 0),
  },
  {
    key: 'mcpTools',
    label: 'MCP 工具',
    segClass: 'seg-mcp-tools',
    title: 'MCP 外部服务工具与资源定义',
    getValue: (c) => Number(c.mcpToolsTokens || 0),
  },
  {
    key: 'skills',
    label: 'Skill',
    segClass: 'seg-skills',
    title: '已挂载的 Skills 技能索引与说明',
    getValue: (c) => Number(c.skillsTokens || 0),
  },
  {
    key: 'userRules',
    label: '用户规则',
    segClass: 'seg-user-rules',
    title: '全局与工作区自定义规则 (user_rules)',
    getValue: (c) => Number(c.userRulesTokens || 0),
  },
];

/**
 * 归一化动态配额池列表；在官方配额尚未返回时回退预占 Gemini 与 Claude & GPT 两个标准池槽位。
 *
 * @param {object|null|undefined} quotas
 * @param {number} minuteTick
 * @param {{ isPending?: boolean }} [options]
 * @returns {Array<object>}
 */
function buildQuotaPoolItems(quotas, minuteTick = 0, { isPending = false } = {}) {
  const safeQuotas = quotas || {};
  const activePool = safeQuotas.activePool || {};
  const rawPools =
    Array.isArray(safeQuotas.pools) && safeQuotas.pools.length > 0
      ? safeQuotas.pools
      : [
          { poolKey: 'Gemini', poolLabel: 'Gemini', family: 'Gemini' },
          { poolKey: 'Claude & GPT', poolLabel: 'Claude & GPT', family: 'Claude & GPT' },
        ];
  const weekly = safeQuotas.weekly || {};
  const poolItems = rawPools.map((p) => {
    const key = p.poolKey || p.family || p.poolLabel || 'Other';
    const poolLabel = p.poolLabel || p.family || key;
    const isActivePool =
      Boolean(activePool.family) &&
      (activePool.poolKey === key ||
        activePool.family === p.family ||
        (key === 'Claude & GPT' && ['Claude', 'GPT'].includes(activePool.family)));
    return {
      key,
      poolLabel,
      poolData: p,
      fallbackWeekly: weekly,
      isActivePool,
      minuteTick,
      isPending,
    };
  });
  if (
    weekly?.isOfficial === false &&
    poolItems.length > 0 &&
    !poolItems.some((item) => item.isActivePool)
  ) {
    poolItems[0].isActivePool = true;
  }
  return poolItems;
}

/**
 * 创建单个配额池的 DOM 行结构，内含 5h 限额与每周限额两个可独立显隐的子窗口进度条，
 * 并在窗口标题右侧内联展示该配额池自身的周期消耗统计（零额外纵向行高）。
 */
function createPoolQuotaRow() {
  const title5h = h('span', { className: 'quota-win-title', text: '5h' });
  const usage5h = h('span', { className: 'quota-win-usage', hidden: true, text: '' });
  const left5h = h('span', { className: 'quota-win-left' }, [title5h, usage5h]);
  const meta5h = h('span', { className: 'panel-meta quota-win-meta text-mono', text: '--' });
  const fill5h = h('div', { className: 'progress-fill' });
  const row5h = h('div', { style: 'display: flex; flex-direction: column; gap: 4px;' }, [
    h('div', { className: 'panel-header quota-win-head' }, [left5h, meta5h]),
    h('div', { className: 'progress-track' }, [fill5h]),
  ]);

  const titleWk = h('span', { className: 'quota-win-title', text: '周限' });
  const usageWk = h('span', { className: 'quota-win-usage', hidden: true, text: '' });
  const leftWk = h('span', { className: 'quota-win-left' }, [titleWk, usageWk]);
  const metaWk = h('span', { className: 'panel-meta quota-win-meta text-mono', text: '--' });
  const fillWk = h('div', { className: 'progress-fill' });
  const rowWk = h('div', { style: 'display: flex; flex-direction: column; gap: 4px;' }, [
    h('div', { className: 'panel-header quota-win-head' }, [leftWk, metaWk]),
    h('div', { className: 'progress-track' }, [fillWk]),
  ]);

  const el = h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' }, [
    row5h,
    rowWk,
  ]);

  return {
    el,
    refs: {
      row5h,
      left5h,
      title5h,
      usage5h,
      meta5h,
      fill5h,
      rowWk,
      leftWk,
      titleWk,
      usageWk,
      metaWk,
      fillWk,
    },
  };
}

/**
 * 格式化可用额度面板底部的汇总行文案（官方配额模式下展示各池周期合计，自定义预算模式下展示自然周累计）。
 */
function formatQuotaSummaryFooter(quotas, account) {
  const weekly = quotas?.weekly || {};
  const isCustomLocal = weekly.isOfficial === false;
  const prefix = isCustomLocal ? '本周' : '周期';
  const leftText = `${prefix}累计: ${formatTokens(weekly.tokens || 0)} (${formatUsd(weekly.costUsd || 0)})`;
  const rightText =
    Number(account?.aiCredits) > 0
      ? `AI 积分: ${account.aiCredits}`
      : `${prefix}调用: ${weekly.calls || 0} 次`;
  const tooltip = isCustomLocal
    ? '按本机自然周（周一 00:00 起）统计'
    : '按各配额池独立周限重置周期分别统计并汇总';
  return { leftText, rightText, tooltip };
}

/**
 * 同步单个配额池行的 5h 与每周窗口状态：
 * - 对于仅有周限额的独立配额池（例如 Google AI Pro 账号下的 Argon 池或 Plus 档位）自动隐藏 5h 行；
 * - 对于仅有 5h 限额的配额池自动隐藏每周行；
 * - 若两个窗口均无数据（首次加载或拉取失败），同时保留两行以维持预占高度不跳动。
 */
function syncPoolQuotaRow(refs, item, idx, rowEl) {
  const { poolData, poolLabel, fallbackWeekly, isActivePool, isPending } = item;
  patchAttr(
    rowEl,
    'style',
    idx === 0
      ? 'display: flex; flex-direction: column; gap: 8px;'
      : 'display: flex; flex-direction: column; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-hairline);'
  );

  const has5h = poolData?.usedPct != null && poolData?.remainingPct != null;
  const used5hVal = has5h ? Number(poolData.usedPct) : 0;
  const rem5hVal = has5h ? Number(poolData.remainingPct) : 0;

  const useCustomWeekly = Boolean(isActivePool && fallbackWeekly?.isOfficial === false);
  const wkUsedRaw = useCustomWeekly
    ? fallbackWeekly?.usedPct
    : poolData?.weeklyUsedPct ?? (isActivePool ? fallbackWeekly?.usedPct : null);
  const wkRemRaw = useCustomWeekly
    ? fallbackWeekly?.remainingPct
    : poolData?.weeklyRemainingPct ?? (isActivePool ? fallbackWeekly?.remainingPct : null);
  const wkResetRaw = useCustomWeekly
    ? fallbackWeekly?.resetTime || poolData?.weeklyResetTime
    : poolData?.weeklyResetTime || (isActivePool ? fallbackWeekly?.resetTime : null);
  const hasWk = wkUsedRaw != null && wkRemRaw != null;
  const usedWkVal = hasWk ? Number(wkUsedRaw) : 0;
  const remWkVal = hasWk ? Number(wkRemRaw) : 0;

  // 在单窗口配额池（如 Pro 账号独立 Argon 周配额池或仅 5h 池）中隐藏不适用的另一窗口
  const hide5h = !has5h && hasWk;
  const hideWk = !hasWk && has5h;
  refs.row5h.hidden = hide5h;
  refs.row5h.style.display = hide5h ? 'none' : 'flex';
  refs.rowWk.hidden = hideWk;
  refs.rowWk.style.display = hideWk ? 'none' : 'flex';

  const fallbackMetaText = isPending ? '读取中...' : '获取失败 (--%)';

  patchText(refs.title5h, `5h (${poolLabel})`);
  const c5h = poolData?.cycle5h;
  if (!isPending && has5h && c5h && (c5h.tokens != null || c5h.costUsd != null)) {
    const tok5h = formatTokens(c5h.tokens || 0);
    const cost5h = formatUsd(c5h.costUsd || 0);
    const calls5h = Number(c5h.calls || 0);
    refs.usage5h.hidden = false;
    patchText(refs.usage5h, `· ${tok5h} (${cost5h})`);
    patchAttr(
      refs.left5h,
      'title',
      `当前 5h 周期累计 (${poolLabel})：${tok5h} Tokens · ${cost5h} · ${calls5h} 次调用`
    );
  } else {
    refs.usage5h.hidden = true;
    patchText(refs.usage5h, '');
    patchAttr(refs.left5h, 'title', null);
  }
  patchText(
    refs.meta5h,
    has5h
      ? `${formatCountdown(poolData.resetTime)} · 已用 ${used5hVal.toFixed(1)}% (余 ${rem5hVal.toFixed(1)}%)`
      : fallbackMetaText
  );
  patchStyleVar(refs.fill5h, '--fill-w', `${Math.min(100, used5hVal)}%`);
  patchClasses(refs.fill5h, {
    'tone-warn': used5hVal >= 60 && used5hVal < 85,
    'tone-danger': used5hVal >= 85,
  });

  const customTitle =
    useCustomWeekly && fallbackWeekly?.title ? fallbackWeekly.title : `周限 (${poolLabel})`;
  patchText(refs.titleWk, customTitle);
  const cWk = useCustomWeekly
    ? fallbackWeekly
    : poolData?.cycleWeekly || (isActivePool ? fallbackWeekly : null);
  if (!isPending && hasWk && cWk && (cWk.tokens != null || cWk.costUsd != null)) {
    const tokWk = formatTokens(cWk.tokens || 0);
    const costWk = formatUsd(cWk.costUsd || 0);
    const callsWk = Number(cWk.calls || 0);
    refs.usageWk.hidden = false;
    patchText(refs.usageWk, `· ${tokWk} (${costWk})`);
    patchAttr(
      refs.leftWk,
      'title',
      `${useCustomWeekly ? '本周自然周累计' : `当前周限周期累计 (${poolLabel})`}：${tokWk} Tokens · ${costWk} · ${callsWk} 次调用`
    );
  } else {
    refs.usageWk.hidden = true;
    patchText(refs.usageWk, '');
    patchAttr(refs.leftWk, 'title', null);
  }
  patchText(
    refs.metaWk,
    hasWk
      ? `${formatCountdown(wkResetRaw)} · 已用 ${usedWkVal.toFixed(1)}% (余 ${remWkVal.toFixed(1)}%)`
      : fallbackMetaText
  );
  patchStyleVar(refs.fillWk, '--fill-w', `${Math.min(100, usedWkVal)}%`);
  patchClasses(refs.fillWk, {
    'tone-warn': usedWkVal >= 60 && usedWkVal < 85,
    'tone-danger': usedWkVal >= 85,
  });
}

function quotaPoolRowSig(item, idx) {
  const c5h = item.poolData?.cycle5h;
  const cWk = item.poolData?.cycleWeekly;
  const fw = item.fallbackWeekly;
  return `${idx}:${item.poolLabel}:${item.isActivePool}:${Boolean(item.isPending)}:${item.minuteTick}:${item.poolData?.usedPct}:${item.poolData?.remainingPct}:${item.poolData?.resetTime}:${item.poolData?.weeklyUsedPct}:${item.poolData?.weeklyRemainingPct}:${item.poolData?.weeklyResetTime}:${c5h?.tokens}:${c5h?.costUsd}:${c5h?.calls}:${cWk?.tokens}:${cWk?.costUsd}:${cWk?.calls}:${fw?.isOfficial}:${fw?.usedPct}:${fw?.remainingPct}:${fw?.resetTime}:${fw?.title}:${fw?.tokens}:${fw?.costUsd}:${fw?.calls}`;
}

const LiveOverviewView = defineComponent({
  name: 'LiveOverviewView',
  setup({ onCleanup }) {
    // --- 0. 可用额度下方的多任务实时运行卡片列表 (展示所有正在运行的主进程 + 默认主代理缩略 + 可折叠子代理列表) ---
    const liveActivityBar = h('div', {
      className: 'live-activity-list',
      hidden: true,
      'aria-live': 'polite',
    });

    const expandedTaskConvIds = new Set();
    const activityTimersMap = new Map();
    let liveTickTimer = null;
    let countdownTickTimer = null;

    function bindLiveElapsedTimer(timerKey, sig, rawStartMs, targetEl) {
      const now = Date.now();
      const prev = activityTimersMap.get(timerKey);
      let startMs = prev?.startMs || 0;
      if (!prev || prev.sig !== sig) {
        const validRaw = Number(rawStartMs || 0);
        startMs = validRaw > 0 && validRaw <= now + 2000 ? validRaw : now;
      } else if (startMs <= 0 && Number(rawStartMs) > 0 && Number(rawStartMs) <= now + 2000) {
        startMs = Number(rawStartMs);
      }
      activityTimersMap.set(timerKey, { sig, startMs, el: targetEl });
      const elapsedSec = Math.max(0, (now - startMs) / 1000);
      patchText(targetEl, formatElapsedSec(elapsedSec));
    }

    function updateLiveElapsedDisplay() {
      const now = Date.now();
      for (const entry of activityTimersMap.values()) {
        if (!entry?.el) continue;
        const elapsedSec = entry.startMs > 0 ? Math.max(0, (now - entry.startMs) / 1000) : 0;
        patchText(entry.el, formatElapsedSec(elapsedSec));
      }
    }

    function pauseLiveTicker() {
      if (liveTickTimer) {
        clearInterval(liveTickTimer);
        liveTickTimer = null;
      }
    }

    function stopLiveTicker() {
      pauseLiveTicker();
      activityTimersMap.clear();
    }

    function ensureLiveTicker() {
      if (uiStore.getState().activeView !== 'overview' || activityTimersMap.size === 0) {
        pauseLiveTicker();
        return;
      }
      if (!liveTickTimer) {
        liveTickTimer = setInterval(updateLiveElapsedDisplay, 1000);
      }
    }

    function stopCountdownTicker() {
      if (countdownTickTimer) {
        clearInterval(countdownTickTimer);
        countdownTickTimer = null;
      }
    }

    function ensureCountdownTicker() {
      if (uiStore.getState().activeView !== 'overview') {
        stopCountdownTicker();
        return;
      }
      if (!countdownTickTimer) {
        countdownTickTimer = setInterval(() => {
          if (uiStore.getState().activeView === 'overview' && latestData) {
            renderData(latestData);
          }
        }, 30_000);
      }
    }

    function createLiveTaskCard() {
      const dotIcon = createSvgIcon('dot', { size: 11 });
      patchClasses(dotIcon, { 'is-pulsing': true });
      const dotWrap = h('span', { className: 'live-activity-dot' }, [dotIcon]);
      const titleEl = h('strong', { className: 'live-task-title', text: '当前会话' });
      const subToggleBtn = h('button', {
        type: 'button',
        className: 'live-sub-toggle',
        hidden: true,
        text: '子代理 (0) ▸',
      });
      const elapsedEl = h('span', {
        className: 'live-activity-elapsed text-mono',
        text: '0s',
      });

      const headerEl = h('div', { className: 'live-task-header' }, [
        h('div', { className: 'live-task-title-wrap' }, [dotWrap, titleEl]),
        h('div', { className: 'live-task-header-right' }, [subToggleBtn, elapsedEl]),
      ]);

      const mainBadge = h('span', {
        className: 'agent-badge badge-main',
        hidden: true,
        text: '主',
      });
      const mainPhase = h('strong', { className: 'live-activity-phase', text: '推理中' });
      const mainProgress = h('span', {
        className: 'live-activity-progress text-mono',
        hidden: true,
        text: '',
      });
      const mainSep = h('span', { className: 'live-activity-sep', hidden: true, text: '·' });
      const mainDetail = h('span', {
        className: 'live-activity-detail',
        hidden: true,
        text: '',
      });

      const mainRowEl = h('div', { className: 'live-task-main-row' }, [
        mainBadge,
        mainPhase,
        mainProgress,
        mainSep,
        mainDetail,
      ]);

      const subListEl = h('div', { className: 'live-sub-list', hidden: true });
      const cardEl = h('div', { className: 'live-task-card' }, [headerEl, mainRowEl, subListEl]);

      return {
        el: cardEl,
        refs: {
          cardEl,
          dotIcon,
          titleEl,
          subToggleBtn,
          elapsedEl,
          mainBadge,
          mainPhase,
          mainProgress,
          mainSep,
          mainDetail,
          subListEl,
        },
      };
    }

    function createLiveSubRow() {
      const subBadge = h('span', { className: 'agent-badge badge-sub-1', text: '子1' });
      const subRole = h('span', { className: 'live-sub-role', text: '子代理' });
      const subSummary = h('span', { className: 'live-sub-summary', text: '' });
      const subElapsed = h('span', { className: 'live-sub-elapsed text-mono', text: '0s' });

      const rowEl = h('div', { className: 'live-sub-row' }, [
        h('div', { className: 'live-sub-left' }, [
          subBadge,
          subRole,
          subSummary,
        ]),
        subElapsed,
      ]);

      return {
        el: rowEl,
        refs: {
          rowEl,
          subBadge,
          subRole,
          subSummary,
          subElapsed,
        },
      };
    }

    // --- 1. 4 格实时测速矩阵 (实时吞吐 / 首Token / 会话均速 / 本步消费) ---
    const tpsVal = h('strong', { className: 'cell-value accent-speed', text: '—' });
    const tpsSub = h('span', { className: 'cell-sub', text: '模型未知' });
    const pulseDot = createSvgIcon('dot', { size: 10 });

    const ttftVal = h('strong', { className: 'cell-value', text: '—' });
    const ttftSub = h('span', { className: 'cell-sub', text: '均值 —' });

    const avgVal = h('strong', { className: 'cell-value', text: '—' });
    const avgSub = h('span', { className: 'cell-sub', text: '有效样本 0/0 步' });

    const costVal = h('strong', { className: 'cell-value', text: '—' });
    const cacheSub = h('span', { className: 'cell-sub accent-ok', text: '缓存 0% · 累计 $0.00' });

    const matrixEl = h('section', { className: 'telemetry-matrix', 'aria-label': '实时指标' }, [
      h('div', { className: 'matrix-cell' }, [
        h('div', { className: 'cell-label' }, [h('span', { text: '输出速度' }), pulseDot]),
        tpsVal,
        tpsSub,
      ]),
      h('div', { className: 'matrix-cell' }, [
        h('div', { className: 'cell-label' }, [
          h('span', { text: '首字延迟' }),
          createSvgIcon('clock', { size: 11 }),
        ]),
        ttftVal,
        ttftSub,
      ]),
      h('div', { className: 'matrix-cell' }, [
        h('div', { className: 'cell-label' }, [
          h('span', { text: '平均速度' }),
          createSvgIcon('pulse', { size: 11 }),
        ]),
        avgVal,
        avgSub,
      ]),
      h('div', { className: 'matrix-cell' }, [
        h('div', { className: 'cell-label' }, [
          h('span', { text: '本次费用' }),
          createSvgIcon('bolt', { size: 11 }),
        ]),
        costVal,
        cacheSub,
      ]),
    ]);

    // --- 2. 6 段上下文窗口构成面板（自动锚定模型上下文压缩基线 + 方案 B 内嵌独立 256k 窗口检视条） ---
    const ctxAgentBadge = h('span', {
      className: 'agent-badge badge-main',
      hidden: true,
      text: '主代理',
    });
    const ctxSummaryText = h('span', { className: 'text-mono', text: '0 / 256.0k (0%)' });
    const ctxSegmentBar = ContextSegmentMeter({ context: {} });

    const ctxPillGroup = h('div', { className: 'ctx-pill-group' });
    const ctxInspectorBar = h(
      'div',
      { className: 'ctx-inspector-bar', hidden: true },
      [ctxPillGroup]
    );

    const ctxChannels = CTX_CHANNEL_DEFS.map((ch, idx) => {
      const valEl = h('strong', { className: 'text-mono', text: '0' });
      const itemEl = h('div', { className: 'legend-item', title: ch.title }, [
        h('span', { className: 'legend-left' }, [
          h('span', { className: `swatch ${ch.segClass}` }),
          h('span', { text: ch.label }),
        ]),
        valEl,
      ]);
      return { ...ch, defaultOrder: idx, valEl, itemEl };
    });

    const ctxLegendGrid = h(
      'div',
      { className: 'ctx-legend-grid' },
      ctxChannels.map((ch) => ch.itemEl)
    );
    let lastLegendOrderSig = ctxChannels.map((ch) => ch.key).join(',');

    const ctxPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title' }, [
          createSvgIcon('layers', { size: 13 }),
          h('span', { text: '上下文窗口' }),
          ctxAgentBadge,
        ]),
        h('span', { className: 'panel-meta' }, [ctxSummaryText]),
      ]),
      ctxInspectorBar,
      ctxSegmentBar.el,
      ctxLegendGrid,
    ]);

    // --- 3. 官方动态多配额池监控面板 (Gemini / Pro 独立 Argon 池 / Claude & GPT) ---
    const tierBadge = h('span', { className: 'panel-meta', text: 'Google AI · Pro' });
    const poolsListEl = h('div', { style: 'display: flex; flex-direction: column; gap: 0;' });

    const wkFootLeft = h('span', { className: 'text-muted', text: '周期累计: 0 ($0.00)' });
    const wkFootRight = h('span', { className: 'text-muted', text: '' });

    const quotaPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title' }, [
          createSvgIcon('pulse', { size: 13 }),
          h('span', { text: '可用额度' }),
        ]),
        tierBadge,
      ]),
      poolsListEl,
      h('div', { className: 'panel-header', style: 'font-size: 11px; padding-top: 2px;' }, [
        wkFootLeft,
        wkFootRight,
      ]),
    ]);

    const overviewInner = h(
      'div',
      {
        style: 'display: flex; flex-direction: column; gap: var(--space-3); padding-bottom: 2px;',
      },
      [matrixEl, ctxPanel, quotaPanel, liveActivityBar]
    );
    const viewScrollbar = CustomScrollbar({
      contentEl: overviewInner,
      className: 'view-pane',
    });

    let latestData = null;
    let isDirty = false;
    let ctxPillsExpanded = false;
    let lastCascadeId = '';
    let cachedBarWidth = 0;

    /**
     * 将最新遥测载荷渲染至 4 格测速矩阵、6 段上下文进度条（支持主/子代理切换检视）与动态配额池列表。
     */
    function renderData(data) {
      if (!data) return;
      // 在本帧任何 DOM 写入前先读取容器宽度，避免写后读触发浏览器强制同步重排 (Forced Reflow)
      const measuredWidth =
        ctxInspectorBar.clientWidth || (ctxPanel.clientWidth ? ctxPanel.clientWidth - 24 : 0);
      if (measuredWidth > 160) {
        cachedBarWidth = measuredWidth;
      }
      const availRowWidth = cachedBarWidth > 160 ? cachedBarWidth : DEFAULT_BAR_WIDTH_PX;

      const currentCascadeId = data.activeConversation?.cascadeId || '';
      if (currentCascadeId && currentCascadeId !== lastCascadeId) {
        if (lastCascadeId) {
          ctxPillsExpanded = false;
        }
        lastCascadeId = currentCascadeId;
      }

      const uiSt = uiStore.getState();
      const {
        hasSubagents,
        effectiveCtxScope,
        agents,
        aggregated,
        scopedConv,
        ctxAgent,
      } = resolveScopedConversation(data, 'all', uiSt.ctxInspectorAgentId);

      const active = scopedConv || data.activeConversation || {};
      const ctx = ctxAgent?.context || active.context || {};
      const quotas = data.quotas || {};

      // 0. 更新多任务实时运行列表（展示所有正在运行的主进程 + 默认主代理缩略 + 默认收起的子代理列表）
      const rawRunningList =
        Array.isArray(data.runningConversations) && data.runningConversations.length > 0
          ? data.runningConversations
          : data.activeConversation?.isRunning || aggregated?.isRunning
            ? [
                {
                  cascadeId: data.activeConversation?.cascadeId || 'current',
                  title: data.activeConversation?.title || '当前会话',
                  isCurrentSelected: true,
                  isMainRunning: Boolean(data.activeConversation?.isRunning),
                  isRunning: true,
                  mainActivity:
                    data.activeConversation?.liveActivity || aggregated?.liveActivity || null,
                  subagentCount: Math.max(0, agents.length - 1),
                  runningSubagentCount: agents.filter((a) => !a.isMain && a.isRunning).length,
                  subagents: agents
                    .filter((a) => !a.isMain)
                    .map((s, idx) => ({
                      cascadeId: s.cascadeId || s.agentId,
                      index: s.index || idx + 1,
                      badgeText: s.badgeText || `子${idx + 1}`,
                      shortLabel: s.shortLabel || `子代理 #${idx + 1}`,
                      role: s.role || `子代理 #${idx + 1}`,
                      isRunning: Boolean(s.isRunning),
                      stepCount: Number(s.stepCount || 0),
                      lastModifiedMs: s.lastModifiedMs || 0,
                      liveActivity: s.liveActivity || {
                        phase: s.isRunning ? 'thinking' : 'done',
                        label: s.isRunning ? '推理中' : '已完成',
                        detail: '',
                        stepProgress: '',
                        startedAtMs: s.lastModifiedMs || 0,
                        signature: `${s.agentId}:${s.stepCount || 0}`,
                      },
                    })),
                },
              ]
            : [];

      const hasRunningTasks = rawRunningList.length > 0;
      patchAttr(liveActivityBar, 'hidden', !hasRunningTasks);
      if (!hasRunningTasks) {
        stopLiveTicker();
      } else {
        // 先基于完整运行列表收集所有有效计时器 Key（防止 patchKeyedList 在 sig 未变化跳过 updateRow 时误删计时器）
        const activeTimerKeys = new Set();
        for (const item of rawRunningList) {
          activeTimerKeys.add(`main:${item.cascadeId}`);
          for (const sub of item.subagents || []) {
            if (sub?.isRunning) {
              activeTimerKeys.add(`sub:${sub.cascadeId}`);
            }
          }
        }
        // 清理已结束会话的展开状态
        const runningIdsSet = new Set(rawRunningList.map((item) => item.cascadeId));
        for (const id of [...expandedTaskConvIds]) {
          if (!runningIdsSet.has(id)) {
            expandedTaskConvIds.delete(id);
          }
        }

        patchKeyedList(liveActivityBar, rawRunningList, {
          keyFn: (item) => item.cascadeId,
          sigFn: (item) => {
            const isExp = expandedTaskConvIds.has(item.cascadeId);
            const subSig = (item.subagents || [])
              .map(
                (s) =>
                  `${s.cascadeId}:${s.isRunning}:${s.stepCount}:${s.liveActivity?.signature || ''}:${s.liveActivity?.startedAtMs || 0}`
              )
              .join('|');
            return `${item.cascadeId}:${item.title}:${item.isMainRunning}:${item.subagentCount}:${item.runningSubagentCount}:${isExp}:${item.mainActivity?.signature || ''}:${item.mainActivity?.startedAtMs || 0}:${subSig}`;
          },
          createRow: createLiveTaskCard,
          updateRow: (refs, item) => {
            const act = item.mainActivity || {
              phase: 'thinking',
              label: '推理中',
              detail: '',
              stepProgress: '',
              startedAtMs: item.lastModifiedMs || 0,
              signature: `fallback:${item.lastModifiedMs || 0}`,
            };

            const isWaiting = act.phase === 'waiting';
            const isCompacting = act.phase === 'compacting';
            patchClasses(refs.cardEl, {
              'is-waiting': isWaiting,
              'is-compacting': isCompacting,
            });
            patchClasses(refs.dotIcon, { 'is-pulsing': true });

            const convTitle = item.title || item.cascadeId?.slice(0, 8) || '当前会话';
            patchText(refs.titleEl, convTitle);
            patchAttr(refs.titleEl, 'title', `点击切换查看会话：${convTitle}`);
            refs.titleEl.onclick = () => {
              if (item.cascadeId && item.cascadeId !== 'current') {
                uiStore.setState({ selectedAgentScope: 'all', ctxInspectorAgentId: 'auto' });
                telemetryStore.setState({ selectedConversationId: item.cascadeId });
                fetchTelemetry({ force: false });
              }
            };

            const subCount = Number(item.subagentCount || item.subagents?.length || 0);
            const runSubCount = Number(item.runningSubagentCount || 0);
            const isExpanded = expandedTaskConvIds.has(item.cascadeId);
            patchAttr(refs.mainBadge, 'hidden', subCount === 0);
            patchAttr(refs.subToggleBtn, 'hidden', subCount === 0);
            if (subCount > 0) {
              const arrow = isExpanded ? '▾' : '▸';
              const toggleText =
                runSubCount > 0
                  ? `子代理 ${runSubCount}/${subCount} ${arrow}`
                  : `子代理 (${subCount}) ${arrow}`;
              patchText(refs.subToggleBtn, toggleText);
              patchClasses(refs.subToggleBtn, { 'is-expanded': isExpanded });
              patchAttr(
                refs.subToggleBtn,
                'title',
                isExpanded ? '点击收起子代理列表' : '点击展开查看子代理缩略状态'
              );
              refs.subToggleBtn.onclick = (e) => {
                e.stopPropagation();
                if (expandedTaskConvIds.has(item.cascadeId)) {
                  expandedTaskConvIds.delete(item.cascadeId);
                } else {
                  expandedTaskConvIds.add(item.cascadeId);
                }
                renderData(latestData);
              };
            }

            const mainTimerKey = `main:${item.cascadeId}`;
            activeTimerKeys.add(mainTimerKey);
            bindLiveElapsedTimer(
              mainTimerKey,
              `${item.cascadeId}:${act.signature || act.label}`,
              act.startedAtMs,
              refs.elapsedEl
            );

            patchText(refs.mainPhase, act.label || '推理中');
            const progText = act.stepProgress ? `[${act.stepProgress}]` : '';
            patchAttr(refs.mainProgress, 'hidden', !progText);
            if (progText) {
              patchText(refs.mainProgress, progText);
            }

            const detailStr = act.detail || '';
            patchAttr(refs.mainSep, 'hidden', !detailStr);
            patchAttr(refs.mainDetail, 'hidden', !detailStr);
            patchText(refs.mainDetail, detailStr);

            const fullTooltip = `[${convTitle}] 主代理 · ${act.label || ''}${progText ? ` ${progText}` : ''}${detailStr ? ` · ${detailStr}` : ''}`;
            patchAttr(refs.cardEl, 'title', fullTooltip);

            const showSubs = subCount > 0 && isExpanded;
            patchAttr(refs.subListEl, 'hidden', !showSubs);
            if (showSubs) {
              const subItems = item.subagents || [];
              patchKeyedList(refs.subListEl, subItems, {
                keyFn: (sub) => sub.cascadeId,
                sigFn: (sub) =>
                  `${sub.cascadeId}:${sub.role}:${sub.isRunning}:${sub.stepCount}:${sub.liveActivity?.signature || ''}:${sub.isRunning ? activityTimersMap.has(`sub:${sub.cascadeId}`) : true}`,
                createRow: createLiveSubRow,
                updateRow: (subRefs, sub) => {
                  const subAct = sub.liveActivity || {
                    phase: sub.isRunning ? 'thinking' : 'done',
                    label: sub.isRunning ? '推理中' : '已完成',
                    detail: '',
                    stepProgress: '',
                    startedAtMs: sub.lastModifiedMs || 0,
                  };
                  patchClasses(subRefs.rowEl, { 'is-done': !sub.isRunning });

                  const badgeCls = getAgentBadgeClass(sub.index || 1, false);
                  patchAttr(subRefs.subBadge, 'class', `agent-badge ${badgeCls}`);
                  patchText(subRefs.subBadge, sub.badgeText || `子${sub.index || 1}`);

                  const roleText = sub.role || sub.shortLabel || '子代理';
                  patchText(subRefs.subRole, roleText);

                  const rawSubLabel = sub.isRunning ? subAct.label || '' : subAct.label || '已完成';
                  const subProg = subAct.stepProgress ? ` [${subAct.stepProgress}]` : '';
                  const summaryStr = [
                    `${rawSubLabel}${subProg}`.trim(),
                    subAct.detail || '',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  patchAttr(subRefs.subSummary, 'hidden', !summaryStr);
                  patchText(subRefs.subSummary, summaryStr);

                  patchAttr(
                    subRefs.rowEl,
                    'title',
                    `[${sub.badgeText || '子'}] ${roleText}${summaryStr ? ` ${summaryStr}` : ''}`
                  );

                  if (sub.isRunning) {
                    const subTimerKey = `sub:${sub.cascadeId}`;
                    activeTimerKeys.add(subTimerKey);
                    bindLiveElapsedTimer(
                      subTimerKey,
                      `${sub.cascadeId}:${subAct.signature || subAct.label}`,
                      subAct.startedAtMs,
                      subRefs.subElapsed
                    );
                  } else {
                    patchText(subRefs.subElapsed, `${sub.stepCount || 0}步`);
                  }
                },
              });
            }
          },
        });

        for (const key of [...activityTimersMap.keys()]) {
          if (!activeTimerKeys.has(key)) {
            activityTimersMap.delete(key);
          }
        }
        updateLiveElapsedDisplay();
        ensureLiveTicker();
      }

      // 1. 更新 4 格实时测速矩阵（展示当前会话全局汇总指标，遵循模型名称格式与 Orchestrator ID 格式设置）
      const activeModelDisplay = resolveModelDisplayInfo(active, data.settings, {
        fallback: '模型未知',
      }).text;
      patchClasses(pulseDot, { 'is-pulsing': Boolean(active.isRunning) });
      patchText(tpsVal, formatMetric(active.latestTokPerSec, ' tok/s'));
      const reason = speedReasonText(active.latestSpeedReason);
      const modelAndAgent =
        hasSubagents && active.activeAgentBadge
          ? `[${active.activeAgentBadge}] ${activeModelDisplay}`
          : activeModelDisplay;
      patchText(tpsSub, reason ? `${modelAndAgent} · ${reason}` : modelAndAgent);

      patchText(ttftVal, formatMetric(active.latestTtftSec, 's'));
      patchText(ttftSub, `均值 ${formatMetric(active.ttftSummary?.avgSec, 's')}`);

      patchText(avgVal, formatMetric(active.avgTokPerSec, ' tok/s'));
      patchText(avgSub, `有效 ${sampleSummary(active.speedSummary)}`);

      const stepCost = active.latestStepCostUsd;
      const hasAnySteps = Number(active.stepCount || 0) > 0;
      patchText(
        costVal,
        !hasAnySteps && stepCost == null ? '—' : formatUsd(stepCost, { precise: true })
      );
      patchText(
        cacheSub,
        `缓存 ${active.latestCacheHitPct ?? 0}% · 累计 ${formatUsd(active.sessionCostUsd || 0)}`
      );

      // 2. 更新 10 段上下文窗口构成与内嵌上下文窗口检视胶囊条
      patchAttr(ctxAgentBadge, 'hidden', !hasSubagents);
      patchAttr(ctxInspectorBar, 'hidden', !hasSubagents);
      if (hasSubagents && ctxAgent) {
        const badgeCls = getAgentBadgeClass(ctxAgent.index || 0, Boolean(ctxAgent.isMain));
        patchAttr(ctxAgentBadge, 'class', `agent-badge ${badgeCls}`);
        const badgeFullText = formatAgentLabel(ctxAgent);
        patchText(ctxAgentBadge, badgeFullText);
        patchAttr(ctxAgentBadge, 'title', badgeFullText);

        const pillItems = [
          {
            key: 'auto',
            label: `跟随活跃 (${aggregated?.activeAgentBadge || '主'})`,
            title: '自动展示当前正在运行或最新活跃的代理上下文窗口',
            isActive: effectiveCtxScope === 'auto',
            mode: 'ctx-only',
          },
        ];

        const allAgentPills = agents.map((ag) => {
          const agPct = ag.context?.usedPct ?? 0;
          const agModelDisplay = resolveModelDisplayInfo(ag, data.settings, {
            fallback: '模型未知',
          }).text;
          return {
            key: ag.agentId,
            label: `${ag.badgeText || ag.shortLabel} ${agPct}%`,
            title: `${formatAgentLabel(ag)} (${agModelDisplay} · ${ag.stepCount || 0}步)`,
            isActive: effectiveCtxScope === ag.agentId,
            mode: 'ctx-only',
          };
        });

        // 根据当前卡片的实际像素宽度估算单行可容纳的胶囊数量，尽可能塞满整行右侧空间
        const firstPillWidth = pillItems.length > 0 ? estPillWidth(pillItems[0].label) : 0;
        const totalAllWidth = allAgentPills.reduce(
          (sum, p) => sum + PILL_GAP_PX + estPillWidth(p.label),
          firstPillWidth
        );
        const needsCollapse = totalAllWidth > availRowWidth && allAgentPills.length > 2;

        if (needsCollapse && !ctxPillsExpanded) {
          const toggleReservePx = PILL_GAP_PX + estPillWidth(`+${allAgentPills.length} 展开 ▾`);
          let usedW = firstPillWidth;
          let fitCount = 0;
          for (let i = 0; i < allAgentPills.length; i++) {
            const pw = PILL_GAP_PX + estPillWidth(allAgentPills[i].label);
            if (fitCount >= 1 && usedW + pw + toggleReservePx > availRowWidth) {
              break;
            }
            usedW += pw;
            fitCount++;
          }
          // 至少折叠 2 个胶囊（避免出现比胶囊本身还宽的 "+1 展开 ▾"）
          const maxKeep = Math.max(1, allAgentPills.length - 2);
          const maxCollapsedCount = Math.max(1, Math.min(maxKeep, fitCount));
          const visibleAgentPills = allAgentPills.slice(0, maxCollapsedCount);
          const activeHiddenPill = allAgentPills
            .slice(maxCollapsedCount)
            .find((p) => p.isActive);
          if (activeHiddenPill) {
            if (visibleAgentPills.length >= 2) {
              visibleAgentPills[visibleAgentPills.length - 1] = activeHiddenPill;
            } else {
              visibleAgentPills.push(activeHiddenPill);
            }
          }
          const hiddenCount = allAgentPills.length - visibleAgentPills.length;
          pillItems.push(...visibleAgentPills, {
            key: '__toggle_more__',
            label: `+${hiddenCount} 展开 ▾`,
            title: `展开全部 ${allAgentPills.length - 1} 个子代理的上下文窗口胶囊`,
            isActive: false,
            isMoreToggle: true,
            mode: 'toggle-expand',
          });
        } else {
          pillItems.push(...allAgentPills);
          if (needsCollapse) {
            pillItems.push({
              key: '__toggle_more__',
              label: '收起 ▴',
              title: '折叠多余子代理胶囊',
              isActive: false,
              isMoreToggle: true,
              mode: 'toggle-expand',
            });
          }
        }

        patchKeyedList(ctxPillGroup, pillItems, {
          keyFn: (item) => item.key,
          sigFn: (item) =>
            `${item.key}:${item.label}:${item.isActive}:${item.isMoreToggle}:${item.mode}:${item.title}`,
          createRow: () => {
            const btn = h('button', { type: 'button', className: 'ctx-agent-pill' });
            return { el: btn, refs: { btn } };
          },
          updateRow: (refs, item) => {
            patchText(refs.btn, item.label);
            patchAttr(refs.btn, 'title', item.title);
            patchClasses(refs.btn, {
              'is-active': item.isActive,
              'is-more-toggle': Boolean(item.isMoreToggle),
            });
            refs.btn.onclick = () => {
              if (item.mode === 'toggle-expand') {
                ctxPillsExpanded = !ctxPillsExpanded;
                renderData(latestData);
              } else {
                uiStore.setState({ ctxInspectorAgentId: item.key });
              }
            };
          },
        });
      }

      const limitTokens = Number(ctx.compactionLimitTokens || ctx.limitTokens || 256000);
      const totalTokens = Number(ctx.totalTokens || 0);
      const usedPct =
        limitTokens > 0 ? Math.min(100, +((totalTokens / limitTokens) * 100).toFixed(1)) : 0;
      patchText(
        ctxSummaryText,
        `${formatTokens(totalTokens)} / ${formatTokens(limitTokens)} (${usedPct}%)`
      );
      ctxSegmentBar.setProps({ context: { ...ctx, limitTokens, usedPct } });
      const scoredChannels = ctxChannels.map((ch) => {
        const val = ch.getValue(ctx);
        patchText(ch.valEl, formatTokens(val));
        return { ch, val };
      });
      scoredChannels.sort((a, b) => b.val - a.val || a.ch.defaultOrder - b.ch.defaultOrder);
      const nextLegendOrderSig = scoredChannels.map((x) => x.ch.key).join(',');
      if (nextLegendOrderSig !== lastLegendOrderSig) {
        lastLegendOrderSig = nextLegendOrderSig;
        for (const { ch } of scoredChannels) {
          ctxLegendGrid.appendChild(ch.itemEl);
        }
      }

      // 3. 更新动态配额池列表（支持 Gemini、Pro 独立 Argon 池、Claude & GPT 等）
      patchText(
        tierBadge,
        `${data.account?.tierName || 'Google AI'} · ${data.account?.planName || 'Pro'}`
      );
      const minuteTick = Math.floor(Date.now() / 30000);
      const poolItems = buildQuotaPoolItems(quotas, minuteTick);

      patchKeyedList(poolsListEl, poolItems, {
        keyFn: (item) => item.key,
        sigFn: quotaPoolRowSig,
        createRow: createPoolQuotaRow,
        updateRow: syncPoolQuotaRow,
      });

      const footSummary = formatQuotaSummaryFooter(quotas, data.account);
      patchText(wkFootLeft, footSummary.leftText);
      patchText(wkFootRight, footSummary.rightText);
      patchAttr(wkFootLeft, 'title', footSummary.tooltip);
      patchAttr(wkFootRight, 'title', footSummary.tooltip);

      ensureCountdownTicker();
      viewScrollbar.refresh();
    }

    const unsub = telemetryStore.subscribe(
      (st) => ({ telemetry: st.telemetry, minuteTick: st.minuteTick }),
      ({ telemetry: data }) => {
        latestData = data;
        if (uiStore.getState().activeView !== 'overview') {
          const stillRunning =
            (Array.isArray(data?.runningConversations) && data.runningConversations.length > 0) ||
            Boolean(
              data?.activeConversation?.isRunning ||
                data?.activeConversation?.aggregated?.isRunning
            );
          if (!stillRunning) {
            stopLiveTicker();
          }
          isDirty = true;
          return;
        }
        isDirty = false;
        renderData(data);
      }
    );

    let prevCtxTarget = uiStore.getState().ctxInspectorAgentId;

    const unsubView = uiStore.subscribe(
      (st) => ({
        activeView: st.activeView,
        ctxInspectorAgentId: st.ctxInspectorAgentId,
      }),
      (slice) => {
        const scopeChanged = slice.ctxInspectorAgentId !== prevCtxTarget;
        prevCtxTarget = slice.ctxInspectorAgentId;

        if (slice.activeView !== 'overview') {
          pauseLiveTicker();
          stopCountdownTicker();
          if (scopeChanged) isDirty = true;
          return;
        }
        ensureCountdownTicker();
        if ((isDirty || scopeChanged) && latestData) {
          isDirty = false;
          renderData(latestData);
        } else if (activityTimersMap.size > 0) {
          updateLiveElapsedDisplay();
          ensureLiveTicker();
        }
      }
    );

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        if (uiStore.getState().activeView !== 'overview') return;
        const nextW =
          ctxInspectorBar.clientWidth || (ctxPanel.clientWidth ? ctxPanel.clientWidth - 24 : 0);
        if (nextW > 160 && Math.abs(nextW - cachedBarWidth) >= 6) {
          cachedBarWidth = nextW;
          if (latestData?.activeConversation?.hasSubagents) {
            renderData(latestData);
          }
        }
      });
      ro.observe(ctxPanel);
    }

    onCleanup(() => {
      stopLiveTicker();
      stopCountdownTicker();
      unsub();
      unsubView();
      if (ro) ro.disconnect();
      ctxSegmentBar.destroy();
      viewScrollbar.destroy();
    });

    return {
      el: viewScrollbar.el,
      refs: { viewScrollbar },
    };
  },
});

// --- src/views/ConsumptionView.js ---
/**
 * @fileoverview View 2: ConsumptionView (全景消耗统计视图).
 * 采用 5 段式分析布局展示指定时间窗口内的全量 Token 与费用消耗：
 * 1. 用量概览：支持预设时间段与自定义区间筛选，通过 3+3 组合矩阵展示总 Token/调用次数、
 *    USD/CNY 预估费用、缓存命中率与命中量、新输入/缓存读取（含节省费用）/输出细分占比，以及底部 4 段比例条 (`FourSegmentBar`)。
 * 2. 历史趋势：基于 `TrendAreaChart` 渲染纯 SVG 三次贝塞尔平滑曲线面积图、峰值气泡、对齐多刻度时间轴与悬停详情浮层。
 * 3. 热门模型：按 Token 总量降序展示各模型的消耗占比徽章、4 段构成条及输入/缓存/输出/思考/调用明细。
 * 4. 数据来源：按调用来源聚合展示 Token 构成、占比与费用明细。
 * 5. 按月细分：12 个月垂直 4 段堆叠柱状图，直观对比全年各月费用、Token 总量与缓存/思考结构。
 */


/** 消耗统计顶栏支持的时间范围预设项 */
const TIME_RANGE_OPTIONS = [
  { value: 'today', label: '今天' },
  { value: '24h', label: '1天' },
  { value: '7d', label: '7天' },
  { value: '14d', label: '14天' },
  { value: '30d', label: '30天' },
  { value: 'all', label: '全部' },
  { value: 'custom', label: '自定义' },
];

const ConsumptionView = defineComponent({
  name: 'ConsumptionView',
  setup({ onCleanup }) {
    // --- 时间筛选栏：快速时间段分段控制器与自定义起止时间选择条 ---
    let draftStartMs = telemetryStore.getState().customStartMs;
    let draftEndMs = telemetryStore.getState().customEndMs;
    let hasUncommittedCustomDraft = false;

    const timeFilterSwitch = SegmentedControl({
      ariaLabel: '消耗统计时间范围',
      modelValue: telemetryStore.getState().selectedTimeRange,
      options: TIME_RANGE_OPTIONS,
      onUpdateModelValue: (nextRange) => {
        if (nextRange === 'custom') {
          const st = telemetryStore.getState();
          draftStartMs = st.customStartMs;
          draftEndMs = st.customEndMs;
          hasUncommittedCustomDraft = false;
          startPicker.setValue(draftStartMs);
          endPicker.setValue(draftEndMs);
        } else {
          hasUncommittedCustomDraft = false;
        }
        telemetryStore.setState({ selectedTimeRange: nextRange });
        fetchTelemetry({ force: false });
      },
    });

    const startPicker = CustomDateTimePicker({
      modelValue: draftStartMs,
      onUpdateModelValue: (ms) => {
        draftStartMs = ms;
        hasUncommittedCustomDraft = true;
        startPicker.setValue(ms);
      },
    });

    const endPicker = CustomDateTimePicker({
      modelValue: draftEndMs,
      onUpdateModelValue: (ms) => {
        draftEndMs = ms;
        hasUncommittedCustomDraft = true;
        endPicker.setValue(ms);
      },
    });

    const applyCustomBtn = h(
      'button',
      {
        type: 'button',
        className: 'btn-primary',
        style: 'height: 26px; padding: 0 10px;',
        onClick: () => {
          const sMs = Number(draftStartMs || 0);
          const eMs = Number(draftEndMs || 0);
          const minMs = sMs > 0 && eMs > 0 ? Math.min(sMs, eMs) : sMs;
          const maxMs = sMs > 0 && eMs > 0 ? Math.max(sMs, eMs) : eMs;
          draftStartMs = minMs;
          draftEndMs = maxMs;
          hasUncommittedCustomDraft = false;
          startPicker.setValue(minMs);
          endPicker.setValue(maxMs);
          telemetryStore.setState({
            selectedTimeRange: 'custom',
            customStartMs: minMs,
            customEndMs: maxMs,
          });
          fetchTelemetry({ force: true });
        },
      },
      [createSvgIcon('check', { size: 12 }), h('span', { text: '筛选' })]
    );

    const customRangeBar = h(
      'div',
      {
        style:
          'display: flex; align-items: center; flex-wrap: wrap; gap: 6px; padding: 6px 8px; background: var(--surface-subtle); border: 1px solid var(--border-hairline); border-radius: var(--radius-xs);',
        hidden: true,
      },
      [
        startPicker.el,
        h('span', { className: 'text-muted', text: '至' }),
        endPicker.el,
        applyCustomBtn,
      ]
    );

    // --- Section 1: 用量概览矩阵 (上层 3 列核心总量 + 下层 3 列新输入/缓存读取/输出拆分 + 底部 4 段比例条) ---
    const dateSpanBadge = h('span', { className: 'cons-badge text-mono', text: '-- ~ --' });
    const heroTotalTokens = h('strong', { className: 'cons-hero-num text-mono', text: '0' });
    const heroTotalCalls = h('span', { className: 'text-muted text-mono', style: 'font-size: 11px;', text: '0 次' });
    const heroCostUsd = h('strong', { className: 'cons-hero-cost text-mono', text: '$0.00' });
    const heroCostCny = h('span', { className: 'text-muted text-mono', style: 'font-size: 11px;', text: '≈ ¥0' });

    const cacheHitPctEl = h('strong', { className: 'cons-hero-cache text-mono', text: '0%' });
    const cacheTokensEl = h('span', { className: 'text-muted text-mono', style: 'font-size: 11px;', text: '命中 0' });

    const inputSharePct = h('span', { className: 'text-mono', style: 'color: var(--ctx-input); font-weight: 600; font-size: 11.5px;', text: '0%' });
    const inputMainTokens = h('strong', { className: 'cons-mid-num text-mono', text: '0' });
    const inputSubText = h('span', { className: 'text-muted text-mono', style: 'font-size: 11px;', text: '未命中缓存输入' });

    const cacheSharePct = h('span', { className: 'text-mono', style: 'color: var(--ctx-cached); font-weight: 600; font-size: 11.5px;', text: '0%' });
    const cacheMainTokens = h('strong', { className: 'cons-mid-num text-mono', text: '0' });
    const cacheSubText = h('span', { className: 'text-muted text-mono', style: 'font-size: 11px;', text: '节省 $0.00' });

    const outputSharePct = h('span', { className: 'text-mono', style: 'color: var(--ctx-output); font-weight: 600; font-size: 11.5px;', text: '0%' });
    const outputMainTokens = h('strong', { className: 'cons-mid-num text-mono', text: '0' });
    const outputSubText = h('span', { className: 'text-muted text-mono', style: 'font-size: 11px;', text: '回复 0 · 思考 0' });

    const overviewSegBar = createFourSegmentBar();

    const overviewPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header cons-overview-head' }, [
        h('span', { className: 'panel-title' }, [
          h('span', { text: '用量总览' }),
          dateSpanBadge,
        ]),
        timeFilterSwitch.el,
      ]),
      customRangeBar,
      h('div', { className: 'cons-box cons-unified-matrix' }, [
        h('div', { className: 'cons-split-3' }, [
          h('div', { className: 'cons-col' }, [
            h('span', { className: 'text-muted', style: 'font-size: 11px;', text: '总 Token' }),
            h('div', { className: 'cons-baseline' }, [heroTotalTokens, heroTotalCalls]),
          ]),
          h('div', { className: 'cons-col is-bordered-col' }, [
            h('span', { className: 'text-muted', style: 'font-size: 11px;', text: '预估费用' }),
            h('div', { className: 'cons-baseline' }, [heroCostUsd, heroCostCny]),
          ]),
          h('div', { className: 'cons-col is-bordered-col' }, [
            h('span', { className: 'legend-left', style: 'font-size: 11px;' }, [
              h('span', { className: 'dot-swatch seg-cached' }),
              h('span', { text: '缓存命中率' }),
            ]),
            h('div', { className: 'cons-baseline' }, [cacheHitPctEl, cacheTokensEl]),
          ]),
        ]),
        h('div', { className: 'cons-split-3 cons-matrix-bottom' }, [
          h('div', { className: 'cons-col' }, [
            h('div', { className: 'cons-sub-head' }, [
              h('span', { className: 'legend-left cons-sub-label' }, [
                h('span', { className: 'dot-swatch seg-input' }),
                h('span', { text: '新输入' }),
              ]),
              inputSharePct,
            ]),
            inputMainTokens,
            inputSubText,
          ]),
          h('div', { className: 'cons-col is-bordered-col' }, [
            h('div', { className: 'cons-sub-head' }, [
              h('span', { className: 'legend-left cons-sub-label' }, [
                h('span', { className: 'dot-swatch seg-cached' }),
                h('span', { text: '缓存读取' }),
              ]),
              cacheSharePct,
            ]),
            cacheMainTokens,
            cacheSubText,
          ]),
          h('div', { className: 'cons-col is-bordered-col' }, [
            h('div', { className: 'cons-sub-head' }, [
              h('span', { className: 'legend-left cons-sub-label' }, [
                h('span', { className: 'dot-swatch seg-output' }),
                h('span', { text: '输出用量' }),
              ]),
              outputSharePct,
            ]),
            outputMainTokens,
            outputSubText,
          ]),
        ]),
      ]),
      overviewSegBar.el,
    ]);

    // --- Section 2: 历史趋势 (交互式 SVG 平滑曲线图 + 悬停精确日期/小时浮层 + 多刻度时间轴) ---
    const trendRangeBadge = h('span', { className: 'cons-badge', text: '全部时间' });
    const trendGranularityHint = h('span', {
      className: 'text-muted text-mono',
      style: 'font-size: 10.5px;',
      text: '按小时 · 悬停查看明细',
    });
    const trendChart = createTrendAreaChart();

    const trendPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title' }, [
          h('span', { text: '用量趋势' }),
          trendRangeBadge,
        ]),
        trendGranularityHint,
      ]),
      trendChart.el,
    ]);

    // --- Section 3: 模型排行列表 ---
    const modelsListEl = h('div', { className: 'cons-item-list' });
    const modelsPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title', text: '模型排行' }),
      ]),
      modelsListEl,
    ]);

    // --- Section 4: 客户端来源列表 ---
    const sourcesListEl = h('div', { className: 'cons-item-list' });
    const sourcesPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title', text: '客户端来源' }),
      ]),
      sourcesListEl,
    ]);

    // --- Section 5: 按月细分 (12 个月垂直 4 段堆叠柱状图) ---
    const monthlyYearBadge = h('span', { className: 'cons-badge text-mono', text: '2026' });
    const monthlyCols = Array.from({ length: 12 }, (_, idx) => {
      const costText = h('span', { className: 'month-cost text-mono', text: '' });
      const barThink = h('div', { className: 'month-seg seg-thinking' });
      const barOut = h('div', { className: 'month-seg seg-output' });
      const barCache = h('div', { className: 'month-seg seg-cached' });
      const barIn = h('div', { className: 'month-seg seg-input' });
      const stackWrap = h('div', { className: 'month-stack' }, [
        barThink,
        barOut,
        barCache,
        barIn,
      ]);
      const zeroDot = h('span', { className: 'month-zero-dot' });
      const monthLabel = h('span', { className: 'month-label', text: `${idx + 1}月` });
      const tokText = h('span', { className: 'month-tok text-mono', text: '' });

      const colEl = h('div', { className: 'month-col' }, [
        costText,
        h('div', { className: 'month-bar-well' }, [stackWrap, zeroDot]),
        monthLabel,
        tokText,
      ]);
      return {
        el: colEl,
        costText,
        stackWrap,
        zeroDot,
        barThink,
        barOut,
        barCache,
        barIn,
        monthLabel,
        tokText,
      };
    });

    const monthlyPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title', text: '月度统计' }),
        monthlyYearBadge,
      ]),
      h(
        'div',
        { className: 'monthly-grid' },
        monthlyCols.map((c) => c.el)
      ),
      h('div', { className: 'monthly-legend' }, [
        h('span', { className: 'legend-left' }, [
          h('span', { className: 'dot-swatch seg-input' }),
          h('span', { text: '输入' }),
        ]),
        h('span', { className: 'legend-left' }, [
          h('span', { className: 'dot-swatch seg-cached' }),
          h('span', { text: '缓存' }),
        ]),
        h('span', { className: 'legend-left' }, [
          h('span', { className: 'dot-swatch seg-output' }),
          h('span', { text: '输出' }),
        ]),
        h('span', { className: 'legend-left' }, [
          h('span', { className: 'dot-swatch seg-thinking' }),
          h('span', { text: '思考' }),
        ]),
      ]),
    ]);

    const scrollInner = h(
      'div',
      {
        style: 'display: flex; flex-direction: column; gap: var(--space-3); padding-bottom: var(--space-3);',
      },
      [
        overviewPanel,
        trendPanel,
        modelsPanel,
        sourcesPanel,
        monthlyPanel,
      ]
    );

    const viewScrollbar = CustomScrollbar({
      contentEl: scrollInner,
      className: 'view-pane',
    });

    /**
     * 创建热门模型或数据来源的通用单行 DOM 结构（含标题、占比胶囊、总量、费用、4 段条与底部分项脚标）。
     */
    function createBreakdownItemRow() {
      const nameEl = h('strong', { className: 'cons-row-title' });
      const pctBadge = h('span', { className: 'cons-share-pill text-mono', text: '0%' });
      const totalTokEl = h('span', { className: 'cons-row-tok text-mono' });
      const costEl = h('strong', { className: 'cons-row-cost text-mono' });
      const segBar = createFourSegmentBar();

      const inVal = h('strong', { className: 'text-mono' });
      const cacheVal = h('strong', { className: 'text-mono' });
      const outVal = h('strong', { className: 'text-mono' });
      const thinkVal = h('strong', { className: 'text-mono' });
      const callsVal = h('strong', { className: 'text-mono' });

      const rowEl = h('div', { className: 'cons-item-row' }, [
        h('div', { className: 'panel-header' }, [
          nameEl,
          h('span', { className: 'cons-row-metrics' }, [
            pctBadge,
            totalTokEl,
            costEl,
          ]),
        ]),
        segBar.el,
        h('div', { className: 'cons-item-foot' }, [
          h('span', { className: 'legend-left' }, [
            h('span', { className: 'dot-swatch seg-input' }),
            h('span', { text: '输入 ' }),
            inVal,
          ]),
          h('span', { className: 'legend-left' }, [
            h('span', { className: 'dot-swatch seg-cached' }),
            h('span', { text: '缓存 ' }),
            cacheVal,
          ]),
          h('span', { className: 'legend-left' }, [
            h('span', { className: 'dot-swatch seg-output' }),
            h('span', { text: '输出 ' }),
            outVal,
          ]),
          h('span', { className: 'legend-left' }, [
            h('span', { className: 'dot-swatch seg-thinking' }),
            h('span', { text: '思考 ' }),
            thinkVal,
          ]),
          h('span', { className: 'legend-left' }, [
            h('span', { text: '调用 ' }),
            callsVal,
          ]),
        ]),
      ]);

      return {
        el: rowEl,
        refs: { nameEl, pctBadge, totalTokEl, costEl, segBar, inVal, cacheVal, outVal, thinkVal, callsVal },
      };
    }

    /**
     * 增量更新热门模型或数据来源单行的指标文本与 4 段比例条宽度。
     */
    function updateBreakdownItemRow(refs, item, grandTotalTokens, showTokensInHeader = true) {
      const displayLabel = item.label || item.name || item.shortName || '—';
      patchText(refs.nameEl, displayLabel);
      patchAttr(refs.nameEl, 'title', item.title || displayLabel);
      const total = Number(item.totalTokens || 0);
      const share = grandTotalTokens > 0 ? +((total / grandTotalTokens) * 100).toFixed(1) : 0;
      patchText(refs.pctBadge, `${share.toFixed(1)}%`);
      patchText(refs.totalTokEl, showTokensInHeader ? formatTokensPrecise(total) : '');
      patchAttr(refs.totalTokEl, 'hidden', !showTokensInHeader);
      const costVal = Number(item.costUsd || 0);
      const callsCount = Number(item.calls || 0);
      const isAllUnpriced =
        callsCount > 0 && Number(item.unpricedCalls || 0) >= callsCount && !(costVal > 0);
      patchText(
        refs.costEl,
        formatUsd(isAllUnpriced ? null : costVal, {
          precise: costVal > 0 && costVal < 0.1,
        })
      );

      const responseTok =
        item.responseTokens != null
          ? Number(item.responseTokens)
          : Math.max(0, Number(item.outputTokens || 0) - Number(item.thinkingTokens || 0));
      const thinkingTok = Number(item.thinkingTokens || 0);

      refs.segBar.update({
        inputTokens: Number(item.inputTokens || 0),
        cacheReadTokens: Number(item.cacheReadTokens || 0),
        responseTokens: responseTok,
        thinkingTokens: thinkingTok,
      });

      patchText(refs.inVal, formatTokensPrecise(item.inputTokens || 0));
      patchText(refs.cacheVal, formatTokensPrecise(item.cacheReadTokens || 0));
      patchText(refs.outVal, formatTokensPrecise(responseTok));
      patchText(refs.thinkVal, formatTokensPrecise(thinkingTok));
      patchText(refs.callsVal, String(Number(item.calls || 0)));
    }

    let latestSlice = null;
    let isDirty = false;

    /**
     * 将遥测状态切片同步渲染至消费统计视图的 5 个子面板。
     */
    function renderConsumptionData(slice) {
      if (!slice) return;
      timeFilterSwitch.setValue(slice.range);
      patchAttr(customRangeBar, 'hidden', slice.range !== 'custom');
      if (!hasUncommittedCustomDraft) {
        draftStartMs = slice.customStartMs;
        draftEndMs = slice.customEndMs;
        startPicker.setValue(draftStartMs);
        endPicker.setValue(draftEndMs);
      }

      const cons = slice.consumption || {};
      const preset =
        slice.range !== 'custom' && cons.presets?.[slice.range]
          ? cons.presets[slice.range]
          : null;
      const acct = preset?.account || cons.account || {};
      const rangeInfo = cons.selectedRange || {};

      // 1. 同步用量概览矩阵与顶部 4 段比例条
      patchText(dateSpanBadge, formatDateSpanBadge(rangeInfo.startMs, rangeInfo.endMs));
      const totalTokens = Number(acct.totalTokens || 0);
      const inputTokens = Number(acct.inputTokens || 0);
      const cacheTokens = Number(acct.cacheReadTokens || 0);
      const outputTokens = Number(acct.outputTokens || 0);
      const responseTokens = Number(acct.responseTokens || 0);
      const thinkingTokens = Number(acct.thinkingTokens || 0);
      const costUsd = Number(acct.costUsd || 0);
      const savedCostUsd = Number(acct.savedCostUsd || 0);

      patchText(heroTotalTokens, formatTokensPrecise(totalTokens));
      patchText(heroTotalCalls, `${acct.calls || 0} 次`);
      patchText(heroCostUsd, formatUsd(costUsd));
      patchText(heroCostCny, formatCnyApprox(costUsd));

      patchText(cacheHitPctEl, `${Number(acct.cacheHitPct ?? 0).toFixed(1)}%`);
      patchText(cacheTokensEl, `命中 ${formatTokensPrecise(cacheTokens)}`);

      let inPct = 0;
      let cachePct = 0;
      let outPct = 0;
      if (totalTokens > 0) {
        const rawTenths = [
          (inputTokens / totalTokens) * 1000,
          (cacheTokens / totalTokens) * 1000,
          (outputTokens / totalTokens) * 1000,
        ];
        const floored = rawTenths.map((v) => Math.max(0, Math.floor(v)));
        const rem = Math.max(0, 1000 - (floored[0] + floored[1] + floored[2]));
        const order = [0, 1, 2].sort(
          (a, b) => rawTenths[b] - floored[b] - (rawTenths[a] - floored[a])
        );
        for (let k = 0; k < rem && k < 3; k++) {
          floored[order[k]] += 1;
        }
        inPct = +(floored[0] / 10).toFixed(1);
        cachePct = +(floored[1] / 10).toFixed(1);
        outPct = +(floored[2] / 10).toFixed(1);
      }

      patchText(inputSharePct, `${inPct}%`);
      patchText(inputMainTokens, formatTokensPrecise(inputTokens));
      patchText(inputSubText, '未命中缓存输入');

      patchText(cacheSharePct, `${cachePct}%`);
      patchText(cacheMainTokens, formatTokensPrecise(cacheTokens));
      patchText(
        cacheSubText,
        `节省 ${formatUsd(savedCostUsd, { precise: savedCostUsd > 0 && savedCostUsd < 0.01 })}`
      );

      patchText(outputSharePct, `${outPct}%`);
      patchText(outputMainTokens, formatTokensPrecise(outputTokens));
      patchText(
        outputSubText,
        `回复 ${formatTokensPrecise(responseTokens)} · 思考 ${formatTokensPrecise(thinkingTokens)}`
      );

      overviewSegBar.update({
        inputTokens,
        cacheReadTokens: cacheTokens,
        responseTokens,
        thinkingTokens,
      });

      // 2. 同步历史趋势交互式 SVG 面积图 / 类 GitHub 每日热力图（>90天）与粒度提示
      patchText(trendRangeBadge, preset?.label || rangeInfo.label || '全部时间');
      const trendSeries = cons.trendSeries || [];
      const isHourlyTrend =
        trendSeries[0]?.granularity === 'hour' ||
        (trendSeries[0]?.label || '').includes(':');
      const isHeatmapTrend = !isHourlyTrend && trendSeries.length > HEATMAP_DAYS_THRESHOLD;
      patchText(
        trendGranularityHint,
        isHeatmapTrend
          ? `按日 (${trendSeries.length}天) · 悬停查看`
          : `${isHourlyTrend ? '按小时' : '按日'} (${trendSeries.length || 0}点) · 悬停查看`
      );
      trendChart.update(trendSeries);

      // 3. 同步热门模型列表（按最终展示名称去重归并后按总 Token 数降序排列并执行键值增量对账）
      const displaySettings = {
        showUpstreamModel: Boolean(slice.showUpstreamModel),
        orchestratorIdMode: slice.orchestratorIdMode,
      };
      const models = mergeModelsByDisplayName(slice.modelBreakdown || [], displaySettings, {
        preferLabelInShort: true,
      }).sort((a, b) => (b.totalTokens || 0) - (a.totalTokens || 0));
      const modelsTotalTok = models.reduce((s, m) => s + Number(m.totalTokens || 0), 0);

      patchKeyedList(modelsListEl, models, {
        keyFn: (m) => m.displayText || m.label || m.shortName,
        sigFn: (m) =>
          `${m.displayText}:${m.displayTitle}:${m.totalTokens}:${m.costUsd}:${m.unpricedCalls}:${m.calls}:${modelsTotalTok}`,
        createRow: createBreakdownItemRow,
        updateRow: (refs, m) =>
          updateBreakdownItemRow(
            refs,
            { ...m, label: m.displayText, title: m.displayTitle },
            modelsTotalTok,
            true
          ),
      });

      // 4. 同步数据来源列表
      const sources = cons.sourcesBreakdown || [];
      const sourcesTotalTok = sources.reduce((s, x) => s + Number(x.totalTokens || 0), 0);
      patchKeyedList(sourcesListEl, sources, {
        keyFn: (s) => s.name,
        sigFn: (s) => `${s.name}:${s.totalTokens}:${s.costUsd}:${s.unpricedCalls}:${s.calls}:${sourcesTotalTok}`,
        createRow: createBreakdownItemRow,
        updateRow: (refs, s) => updateBreakdownItemRow(refs, s, sourcesTotalTok, true),
      });

      // 5. 同步 12 个月垂直堆叠柱状图（相对于年度峰值月缩放柱高，最低保留 8% 可视高度）
      const monthlyYear = cons.monthlyYear || new Date().getFullYear();
      const currentMonthIdx = new Date().getMonth();
      patchText(monthlyYearBadge, String(monthlyYear));
      const monthlySeries = cons.monthlySeries || [];
      const maxMonthTokens = Math.max(
        1,
        ...monthlySeries.map((m) => Number(m.totalTokens || 0))
      );

      for (let i = 0; i < 12; i++) {
        const col = monthlyCols[i];
        const m = monthlySeries[i] || { totalTokens: 0, costUsd: 0 };
        const mTot = Number(m.totalTokens || 0);
        const hasData = mTot > 0;

        patchClasses(col.monthLabel, { 'is-current': i === currentMonthIdx });
        patchAttr(col.stackWrap, 'hidden', !hasData);
        patchAttr(col.zeroDot, 'hidden', hasData);

        if (!hasData) {
          patchText(col.costText, '');
          patchText(col.tokText, '');
        } else {
          const cVal = Number(m.costUsd || 0);
          patchText(
            col.costText,
            cVal >= 10 ? `$${Math.round(cVal)}` : `$${cVal.toFixed(2)}`
          );
          patchText(col.tokText, formatTokensPrecise(mTot));

          const totalHeightPct = Math.max(8, Math.min(100, (mTot / maxMonthTokens) * 100));
          patchStyleVar(col.stackWrap, '--bar-h', `${totalHeightPct.toFixed(1)}%`);

          const inPctM = (Number(m.inputTokens || 0) / mTot) * 100;
          const cachePctM = (Number(m.cacheReadTokens || 0) / mTot) * 100;
          const outPctM = (Number(m.responseTokens || 0) / mTot) * 100;
          const thinkPctM = (Number(m.thinkingTokens || 0) / mTot) * 100;

          patchStyleVar(col.barIn, '--seg-h', `${inPctM.toFixed(1)}%`);
          patchStyleVar(col.barCache, '--seg-h', `${cachePctM.toFixed(1)}%`);
          patchStyleVar(col.barOut, '--seg-h', `${outPctM.toFixed(1)}%`);
          patchStyleVar(col.barThink, '--seg-h', `${thinkPctM.toFixed(1)}%`);
        }
      }

      viewScrollbar.refresh();
    }

    const unsub = telemetryStore.subscribe(
      (st) => ({
        range: st.selectedTimeRange,
        customStartMs: st.customStartMs,
        customEndMs: st.customEndMs,
        consumption: st.telemetry?.consumption,
        modelBreakdown: st.telemetry?.modelBreakdown,
        showUpstreamModel: Boolean(st.telemetry?.settings?.showUpstreamModel),
        orchestratorIdMode: normalizeOrchestratorIdDisplayMode(
          st.telemetry?.settings?.orchestratorIdMode
        ),
      }),
      (slice) => {
        latestSlice = slice;
        if (uiStore.getState().activeView !== 'consumption') {
          isDirty = true;
          return;
        }
        isDirty = false;
        renderConsumptionData(slice);
      }
    );

    const unsubView = uiStore.subscribe(
      (st) => st.activeView,
      (activeView) => {
        if (activeView === 'consumption' && isDirty) {
          isDirty = false;
          if (latestSlice) {
            renderConsumptionData(latestSlice);
          }
        }
      }
    );

    onCleanup(() => {
      unsub();
      unsubView();
      trendChart.destroy?.();
      timeFilterSwitch.destroy();
      startPicker.destroy();
      endPicker.destroy();
      viewScrollbar.destroy();
    });

    return {
      el: viewScrollbar.el,
      refs: { timeFilterSwitch, startPicker, endPicker, viewScrollbar },
    };
  },
});

// --- src/views/StepsDetailView.js ---
/**
 * @fileoverview View 3: StepsDetailView (步骤明细与总汇总分析视图).
 * 提供“按步查看”与“总汇总”双子视图切换：
 * - 单步测速表采用 `patchKeyedList` 实现行级 DOM 增量对账与就地复用，支持多代理与多模型复选过滤；
 * - 总汇总视图在顶部提供当前会话线性走势图（总Token / 上下文 / TPS / 首字 / 费用）与趋势拟合曲线图（TPS / 首字 / 缓存 / 费用），
 *   单模型时自动隐藏模型下拉框，多模型时支持独立多选（趋势拟合勾选多模型时同图绘制多条独立颜色回归曲线对比）；
 * - 底部以极简高密度模型卡片表达各模型总数据，全链路支持主代理 / 子代理多选汇总筛选。
 */


/**
 * 当多选勾选了部分代理子集（>=2 个且非全选）时，动态合并所选代理的步骤列表与模型汇总。
 */
function mergeSelectedAgentUnits(units) {
  const combinedSteps = [];
  const modelMap = new Map();

  for (const ag of units) {
    if (!ag || typeof ag !== 'object') continue;
    if (Array.isArray(ag.recentSteps)) {
      combinedSteps.push(...ag.recentSteps);
    }
    const breakdown = Array.isArray(ag.modelBreakdown) ? ag.modelBreakdown : [];
    for (const m of breakdown) {
      if (!m || typeof m !== 'object') continue;
      const gk = getStepModelGroupKey(m);
      let acc = modelMap.get(gk);
      if (!acc) {
        acc = {
          label: m.label || gk,
          shortName: m.shortName || gk,
          rawModel: m.rawModel || '',
          upstreamName: m.upstreamName || m.upstreamModel || '',
          upstreamSet: new Set(Array.isArray(m.upstreamModels) ? m.upstreamModels.filter(Boolean) : []),
          calls: 0,
          inputTokens: 0,
          cacheReadTokens: 0,
          outputTokens: 0,
          thinkingTokens: 0,
          responseTokens: 0,
          totalTokens: 0,
          costUsd: 0,
          unpricedCalls: 0,
          _speedWeightedSum: 0,
          _speedWeight: 0,
          _ttftWeightedSum: 0,
          _ttftWeight: 0,
        };
        if (acc.upstreamName) acc.upstreamSet.add(acc.upstreamName);
        modelMap.set(gk, acc);
      }
      if (!acc.upstreamName && (m.upstreamName || m.upstreamModel)) {
        acc.upstreamName = m.upstreamName || m.upstreamModel;
      }
      if (m.upstreamName) acc.upstreamSet.add(m.upstreamName);
      if (Array.isArray(m.upstreamModels)) {
        for (const u of m.upstreamModels) {
          if (u) acc.upstreamSet.add(u);
        }
      }
      const calls = Math.max(0, Number(m.calls || 0));
      const inTok = Math.max(0, Number(m.inputTokens || 0));
      const cacheTok = Math.max(0, Number(m.cacheReadTokens || 0));
      const outTok = Math.max(0, Number(m.outputTokens || 0));
      const thinkTok = Math.max(0, Number(m.thinkingTokens || 0));
      const respTok =
        m.responseTokens != null
          ? Math.max(0, Number(m.responseTokens))
          : Math.max(0, outTok - thinkTok);
      const totTok = Math.max(0, Number(m.totalTokens ?? inTok + cacheTok + outTok));
      const costUsd = Number.isFinite(Number(m.costUsd)) ? Math.max(0, Number(m.costUsd)) : 0;
      const unpricedCalls = Math.max(0, Number(m.unpricedCalls || 0));

      acc.calls += calls;
      acc.inputTokens += inTok;
      acc.cacheReadTokens += cacheTok;
      acc.outputTokens += outTok;
      acc.thinkingTokens += thinkTok;
      acc.responseTokens += respTok;
      acc.totalTokens += totTok;
      acc.costUsd += costUsd;
      acc.unpricedCalls += unpricedCalls;

      if (Number.isFinite(Number(m.avgTokPerSec)) && Number(m.avgTokPerSec) > 0) {
        const w = Math.max(1, outTok || calls || 1);
        acc._speedWeightedSum += Number(m.avgTokPerSec) * w;
        acc._speedWeight += w;
      }
      if (m.avgTtftSec != null && Number.isFinite(Number(m.avgTtftSec)) && Number(m.avgTtftSec) >= 0) {
        const w = Math.max(1, calls || 1);
        acc._ttftWeightedSum += Number(m.avgTtftSec) * w;
        acc._ttftWeight += w;
      }
    }
  }

  combinedSteps.sort(
    (a, b) =>
      (Number(b?.createdAtMs) || 0) - (Number(a?.createdAtMs) || 0) ||
      (Number(b?.agentIndex) || 0) - (Number(a?.agentIndex) || 0) ||
      (Number(b?.stepIndex) || 0) - (Number(a?.stepIndex) || 0)
  );

  const mergedModels = Array.from(modelMap.values())
    .map((acc) => {
      const promptTok = acc.inputTokens + acc.cacheReadTokens;
      return {
        label: acc.label,
        shortName: acc.shortName,
        rawModel: acc.rawModel,
        upstreamName: acc.upstreamName,
        upstreamModels: Array.from(acc.upstreamSet),
        calls: acc.calls,
        inputTokens: acc.inputTokens,
        cacheReadTokens: acc.cacheReadTokens,
        outputTokens: acc.outputTokens,
        thinkingTokens: acc.thinkingTokens,
        responseTokens: acc.responseTokens,
        totalTokens: acc.totalTokens,
        costUsd: +acc.costUsd.toFixed(6),
        unpricedCalls: acc.unpricedCalls,
        avgTokPerSec:
          acc._speedWeight > 0 ? +(acc._speedWeightedSum / acc._speedWeight).toFixed(1) : null,
        avgTtftSec:
          acc._ttftWeight > 0 ? +(acc._ttftWeightedSum / acc._ttftWeight).toFixed(1) : null,
        cacheHitPct: promptTok > 0 ? +((acc.cacheReadTokens / promptTok) * 100).toFixed(1) : 0,
      };
    })
    .sort((a, b) => b.totalTokens - a.totalTokens || b.calls - a.calls);

  return { steps: combinedSteps, models: mergedModels };
}

const StepsDetailView = defineComponent({
  name: 'StepsDetailView',
  setup({ onCleanup }) {
    let selectedAgentScopes = [uiStore.getState().selectedAgentScope || 'all'];
    let lastSyncedUiScope = uiStore.getState().selectedAgentScope || 'all';
    let selectedTableModels = ['__all__'];
    let selectedLineModels = ['__all__'];

    function applyAgentScopesSelection(nextScopes) {
      selectedAgentScopes = nextScopes;
      const mappedSingle =
        nextScopes.length === 1 && nextScopes[0] !== 'all' ? nextScopes[0] : 'all';
      const prevUiScope = uiStore.getState().selectedAgentScope;
      lastSyncedUiScope = mappedSingle;
      if (prevUiScope !== mappedSingle) {
        uiStore.setState({
          selectedAgentScope: mappedSingle,
          ...(mappedSingle === 'all' ? { ctxInspectorAgentId: 'auto' } : {}),
        });
      } else if (latestSlice) {
        renderStepsData(latestSlice);
      }
    }

    // 明细面板标题栏内嵌代理多选筛选下拉框（单选时与顶栏代理切换条双向同步，支持多代理组合筛选）
    const inlineScopeSelect = CustomSelect({
      multiple: true,
      allValue: 'all',
      collapseAll: true,
      multiUnit: '代理',
      modelValue: selectedAgentScopes,
      icon: 'layers',
      placeholder: '全部汇总',
      className: 'steps-inline-scope-select',
      options: [{ value: 'all', label: '全部汇总' }],
      onUpdateModelValue: (nextScopes) => {
        if (!Array.isArray(nextScopes) || nextScopes.length === 0) return;
        applyAgentScopesSelection(nextScopes);
      },
    });
    inlineScopeSelect.el.setAttribute('hidden', '');

    // “按步查看”标题栏内嵌模型多选筛选下拉框（仅在多模型且处于“按步查看”时展示）
    const stepsModelSelect = CustomSelect({
      multiple: true,
      allValue: '__all__',
      collapseAll: false,
      multiUnit: '模型',
      modelValue: selectedTableModels,
      placeholder: '全部模型',
      className: 'steps-inline-model-select',
      options: [{ value: '__all__', label: '全部模型' }],
      onUpdateModelValue: (nextModels) => {
        if (!Array.isArray(nextModels) || nextModels.length === 0) return;
        selectedTableModels = nextModels;
        if (latestSlice) renderStepsData(latestSlice);
      },
    });
    stepsModelSelect.el.setAttribute('hidden', '');

    // 顶部子表分段切换器：在“按步查看”与“总汇总”之间切换
    const subTabSwitch = SegmentedControl({
      ariaLabel: '明细表视图切换',
      modelValue: uiStore.getState().stepsSubTab,
      options: [
        { value: 'steps', label: '按步查看 (0)' },
        { value: 'models', label: '总汇总' },
      ],
      onUpdateModelValue: (nextTab) => {
        uiStore.setState({ stepsSubTab: nextTab });
      },
    });

    // --- 子视图 1：单步明细表（步序、模型、吞吐速度、首字延迟、上下文/思考/正文、缓存命中率、单步费用） ---
    const stepsTbody = h('tbody');
    const stepsTablePane = h('div', { className: 'table-viewport' }, [
      h('table', { className: 'data-table' }, [
        h('thead', {}, [
          h('tr', {}, [
            h('th', { text: '步序' }),
            h('th', { text: '模型' }),
            h('th', { text: '速度' }),
            h('th', { text: '首字' }),
            h('th', { text: '上下文 / 思考 / 正文' }),
            h('th', { text: '缓存' }),
            h('th', { text: '费用' }),
          ]),
        ]),
        stepsTbody,
      ]),
    ]);
    const stepsScroll = CustomScrollbar({
      contentEl: stepsTablePane,
      className: 'table-scroll-host',
    });

    // --- 子视图 2：总汇总分析面板（顶部会话线性图 + 顶部趋势拟合图 + 底部极简模型总览） ---
    let selectedLineMetric = 'totalTokens';
    let selectedFitMetric = 'tps';

    // 拟合模型锁定状态机：进入“总汇总”时默认锚定当前调用模型，停留在视图内期间绝不随轮询跳变
    let fitLockedCascadeId = null;
    let fitLockedModelKeys = [];
    let fitPinnedWhileVisible = false;
    let fitUserPicked = false;

    const lineSummaryBadge = h('span', { className: 'cons-badge text-mono', text: '0 步' });
    const lineModelSelect = CustomSelect({
      multiple: true,
      allValue: '__all__',
      collapseAll: false,
      multiUnit: '模型',
      modelValue: selectedLineModels,
      placeholder: '全部模型',
      className: 'sstep-fit-model-select sstep-line-model-select',
      options: [{ value: '__all__', label: '全部模型' }],
      onUpdateModelValue: (nextModels) => {
        if (!Array.isArray(nextModels) || nextModels.length === 0) return;
        selectedLineModels = nextModels;
        if (latestSlice) renderStepsData(latestSlice);
      },
    });
    lineModelSelect.el.setAttribute('hidden', '');

    const lineMetricSwitch = SegmentedControl({
      ariaLabel: '会话线性图指标切换',
      modelValue: selectedLineMetric,
      options: [
        { value: 'totalTokens', label: '总Token' },
        { value: 'context', label: '上下文' },
        { value: 'tps', label: 'TPS' },
        { value: 'ttft', label: '首字' },
        { value: 'cost', label: '费用' },
      ],
      onUpdateModelValue: (nextMetric) => {
        selectedLineMetric = nextMetric;
        if (latestSlice) renderStepsData(latestSlice);
      },
    });
    const sessionLineChart = createSessionLineChart();
    const sessionLineCard = h('div', { className: 'sstep-card sstep-line-card' }, [
      h('div', { className: 'sstep-card-head' }, [
        h('div', { className: 'sstep-card-title-group' }, [
          h('span', { className: 'sstep-card-title', text: '会话走势' }),
          lineSummaryBadge,
        ]),
        h('div', { className: 'sstep-fit-controls' }, [
          lineModelSelect.el,
          lineMetricSwitch.el,
        ]),
      ]),
      sessionLineChart.el,
    ]);

    const fitSummaryBadge = h('span', { className: 'cons-badge text-mono', text: '0 样本' });
    const fitModelSelect = CustomSelect({
      multiple: true,
      allValue: '__all__',
      collapseAll: false,
      multiUnit: '模型',
      modelValue: ['__all__'],
      placeholder: '选择模型',
      className: 'sstep-fit-model-select',
      options: [{ value: '__all__', label: '全部模型' }],
      onUpdateModelValue: (nextModelKeys) => {
        if (!Array.isArray(nextModelKeys) || nextModelKeys.length === 0) return;
        fitLockedModelKeys = nextModelKeys;
        fitUserPicked = true;
        fitPinnedWhileVisible = true;
        if (latestSlice) renderStepsData(latestSlice);
      },
    });
    fitModelSelect.el.setAttribute('hidden', '');

    const fitMetricSwitch = SegmentedControl({
      ariaLabel: '趋势拟合指标切换',
      modelValue: selectedFitMetric,
      options: [
        { value: 'tps', label: 'TPS' },
        { value: 'ttft', label: '首字' },
        { value: 'cache', label: '缓存' },
        { value: 'cost', label: '费用' },
      ],
      onUpdateModelValue: (nextMetric) => {
        selectedFitMetric = nextMetric;
        if (latestSlice) renderStepsData(latestSlice);
      },
    });
    const modelFitChart = createModelFitChart();
    const modelFitCard = h('div', { className: 'sstep-card sstep-fit-card' }, [
      h('div', { className: 'sstep-card-head' }, [
        h('div', { className: 'sstep-card-title-group' }, [
          h('span', { className: 'sstep-card-title', text: '趋势拟合' }),
          fitSummaryBadge,
        ]),
        h('div', { className: 'sstep-fit-controls' }, [
          fitModelSelect.el,
          fitMetricSwitch.el,
        ]),
      ]),
      modelFitChart.el,
    ]);

    const modelsSummaryMeta = h('span', { className: 'cons-badge text-mono', text: '0 次' });
    const modelsEmptyEl = h('div', {
      className: 'smodel-empty text-muted',
      text: '当前范围暂无模型调用记录',
    });
    const modelsListEl = h('div', { className: 'smodel-list' });
    const modelsSummarySection = h('div', { className: 'smodel-section' }, [
      h('div', { className: 'smodel-section-head' }, [
        h('span', { className: 'sstep-card-title', text: '模型总览' }),
        modelsSummaryMeta,
      ]),
      modelsEmptyEl,
      modelsListEl,
    ]);

    const modelsAnalyticsPane = h('div', { className: 'table-viewport models-analytics-pane' }, [
      sessionLineCard,
      modelFitCard,
      modelsSummarySection,
    ]);
    const modelsScroll = CustomScrollbar({
      contentEl: modelsAnalyticsPane,
      className: 'table-scroll-host',
    });
    modelsScroll.el.setAttribute('hidden', '');

    const panelEl = h(
      'section',
      {
        className: 'panel',
        style: 'flex: 1; min-height: 0; display: flex; flex-direction: column;',
      },
      [
        h('div', { className: 'panel-header steps-panel-header' }, [
          h('span', { className: 'panel-title steps-panel-title' }, [
            createSvgIcon('table', { size: 13 }),
            h('span', { text: '调用记录' }),
          ]),
          h('div', { className: 'steps-header-controls' }, [
            inlineScopeSelect.el,
            stepsModelSelect.el,
            subTabSwitch.el,
          ]),
        ]),
        stepsScroll.el,
        modelsScroll.el,
      ]
    );

    const rootEl = h('div', { className: 'view-pane' }, [panelEl]);

    let latestSlice = null;
    let isDirty = false;

    /**
     * 解析当前会话/代理作用域下的默认活跃调用模型分组键。
     */
    function resolveDefaultActiveModelKey(scopedConv, chronoSteps, models, availableModelKeys) {
      const activeCand = getStepModelGroupKey({
        modelLabel: scopedConv?.activeModelLabel,
        modelShort: scopedConv?.activeModelShort,
      });
      if (activeCand && activeCand !== '模型未知' && availableModelKeys.has(activeCand)) {
        return activeCand;
      }
      for (let i = chronoSteps.length - 1; i >= 0; i--) {
        const st = chronoSteps[i];
        if (!st || st.isCompactionStep) continue;
        const gk = getStepModelGroupKey(st);
        if (gk && availableModelKeys.has(gk)) return gk;
      }
      if (chronoSteps.length > 0) {
        const gk = getStepModelGroupKey(chronoSteps[chronoSteps.length - 1]);
        if (gk && availableModelKeys.has(gk)) return gk;
      }
      if (models.length > 0) {
        const firstKey = getStepModelGroupKey(models[0]);
        if (firstKey && availableModelKeys.has(firstKey)) return firstKey;
      }
      return '__all__';
    }

    /**
     * 归一化模型多选列表（支持同时勾选 2..N 个具体模型以独立分色对比，仅在明确点击“全部模型”或无有效项时回到 `['__all__']`）。
     */
    function normalizeMultiModelSelection(rawSelection, availableModelKeys) {
      if (availableModelKeys.size <= 1) return ['__all__'];
      const arr = Array.isArray(rawSelection) ? rawSelection : [];
      if (arr.length === 0 || arr.includes('__all__')) return ['__all__'];
      const valid = Array.from(new Set(arr.filter((k) => availableModelKeys.has(k))));
      if (valid.length === 0) return ['__all__'];
      return valid;
    }

    /**
     * 对单步测速表、顶部会话走势图、顶部趋势拟合图及底部极简模型列表执行增量更新。
     */
    function renderStepsData(slice) {
      if (!slice) return;
      const uiSt = uiStore.getState();

      const currentCid = String(slice.cascadeId || slice.activeConversation?.cascadeId || '');
      if (currentCid !== fitLockedCascadeId) {
        if (fitLockedCascadeId !== null) {
          selectedAgentScopes = [uiSt.selectedAgentScope || 'all'];
          lastSyncedUiScope = uiSt.selectedAgentScope || 'all';
          selectedTableModels = ['__all__'];
          selectedLineModels = ['__all__'];
        }
        fitLockedCascadeId = currentCid;
        fitUserPicked = false;
        fitPinnedWhileVisible = false;
        fitLockedModelKeys = [];
      }

      const baseScope = resolveScopedConversation(
        { activeConversation: slice.activeConversation },
        'all',
        uiSt.ctxInspectorAgentId
      );
      const { hasSubagents, agents, subagents, mainAgent, aggregated } = baseScope;

      let effectiveScopes = ['main'];
      let isMergedMultiAgents = false;
      let steps = [];
      let models = [];
      let activeModelSource = baseScope.scopedConv;

      patchAttr(inlineScopeSelect.el, 'hidden', !hasSubagents);
      if (hasSubagents) {
        const validAgentIds = ['main', ...subagents.map((s) => s.agentId)];
        const validSet = new Set(validAgentIds);
        if (selectedAgentScopes.length === 0 || selectedAgentScopes.includes('all')) {
          effectiveScopes = ['all'];
        } else {
          const filtered = selectedAgentScopes.filter((id) => validSet.has(id));
          effectiveScopes =
            filtered.length === 0 || filtered.length >= validAgentIds.length
              ? ['all']
              : filtered;
        }
        selectedAgentScopes = effectiveScopes;

        const scopeOpts = [
          {
            value: 'all',
            label: '全部汇总',
            meta: `${aggregated?.stepCount ?? 0}步`,
          },
          {
            value: 'main',
            label: '主代理',
            meta: `${mainAgent?.stepCount ?? 0}步`,
          },
          ...subagents.map((s) => ({
            value: s.agentId,
            label: formatAgentLabel(s),
            meta: `${s.stepCount || 0}步`,
          })),
        ];
        inlineScopeSelect.setProps({
          modelValue: effectiveScopes,
          options: scopeOpts,
        });

        if (effectiveScopes[0] === 'all') {
          steps = aggregated?.recentSteps || [];
          models = aggregated?.modelBreakdown || [];
          isMergedMultiAgents = true;
          activeModelSource = aggregated;
        } else if (effectiveScopes.length === 1) {
          const targetId = effectiveScopes[0];
          const unit =
            targetId === 'main'
              ? mainAgent
              : agents.find((a) => a.agentId === targetId) || mainAgent;
          steps = unit?.recentSteps || [];
          models = unit?.modelBreakdown || [];
          isMergedMultiAgents = false;
          activeModelSource = unit;
        } else {
          const scopeSet = new Set(effectiveScopes);
          const selectedUnits = agents.filter((a) =>
            scopeSet.has(a.isMain ? 'main' : a.agentId)
          );
          const merged = mergeSelectedAgentUnits(selectedUnits);
          steps = merged.steps;
          models = merged.models;
          isMergedMultiAgents = true;
          activeModelSource =
            selectedUnits.find((a) => a.isRunning) || selectedUnits[0] || aggregated;
        }
      } else {
        inlineScopeSelect.close();
        steps = slice.recentSteps || [];
        models = slice.sessionModelBreakdown || [];
      }

      const displaySettings = {
        showUpstreamModel: Boolean(slice.showUpstreamModel),
        orchestratorIdMode: slice.orchestratorIdMode,
      };

      // 提取当前代理作用域下的时间升序步骤与全量可选模型列表
      const showAgentPrefix = isMergedMultiAgents;
      const chronoSteps = toChronologicalSteps(steps, isMergedMultiAgents);

      const stepTtftFallbackMap = new Map();
      const stepModelOptionMap = new Map();
      for (const st of chronoSteps) {
        const gk = getStepModelGroupKey(st);
        if (!stepModelOptionMap.has(gk)) {
          const disp = resolveModelDisplayInfo(st, displaySettings, { fallback: gk });
          stepModelOptionMap.set(gk, {
            label: disp.text.replace(/·压缩\s*$/u, '').trim() || gk,
            calls: 0,
          });
        }
        stepModelOptionMap.get(gk).calls += 1;

        if (!st.isCompactionStep && Number.isFinite(st.ttftSec) && st.ttftSec >= 0) {
          const prev = stepTtftFallbackMap.get(gk) || { sum: 0, count: 0 };
          prev.sum += Number(st.ttftSec);
          prev.count += 1;
          stepTtftFallbackMap.set(gk, prev);
        }
      }

      const availableModelKeys = new Set();
      const modelColorByGroup = new Map();
      const perModelOptions = [];
      for (const m of models) {
        const gk = getStepModelGroupKey(m);
        if (availableModelKeys.has(gk)) continue;
        availableModelKeys.add(gk);
        modelColorByGroup.set(
          gk,
          MODEL_COLOR_VARS[(availableModelKeys.size - 1) % MODEL_COLOR_VARS.length]
        );
        const disp = resolveModelDisplayInfo(m, displaySettings, {
          preferLabelInShort: false,
          fallback: gk,
        });
        perModelOptions.push({
          value: gk,
          label: disp.text.replace(/·压缩\s*$/u, '').trim() || gk,
          meta: `${Number(m.calls || 0)}步`,
        });
      }
      for (const [gk, info] of stepModelOptionMap.entries()) {
        if (!availableModelKeys.has(gk)) {
          availableModelKeys.add(gk);
          modelColorByGroup.set(
            gk,
            MODEL_COLOR_VARS[(availableModelKeys.size - 1) % MODEL_COLOR_VARS.length]
          );
          perModelOptions.push({
            value: gk,
            label: info.label,
            meta: `${info.calls}步`,
          });
        }
      }

      const hasMultipleModels = availableModelKeys.size > 1;
      const modelSelectOptions = [
        {
          value: '__all__',
          label: '全部模型',
          meta: `${chronoSteps.length}步`,
        },
        ...perModelOptions,
      ];

      // 1. “按步查看”模型多选过滤与表格增量对账
      selectedTableModels = normalizeMultiModelSelection(
        selectedTableModels,
        availableModelKeys
      );
      const showStepsModelFilter = uiSt.stepsSubTab === 'steps' && hasMultipleModels;
      patchAttr(stepsModelSelect.el, 'hidden', !showStepsModelFilter);
      if (hasMultipleModels) {
        stepsModelSelect.setProps({
          modelValue: selectedTableModels,
          options: modelSelectOptions,
        });
        if (!showStepsModelFilter) stepsModelSelect.close();
      } else {
        stepsModelSelect.close();
      }

      const tableModelFilterSet = selectedTableModels.includes('__all__')
        ? null
        : new Set(selectedTableModels);
      const tableSteps = tableModelFilterSet
        ? steps.filter((st) => tableModelFilterSet.has(getStepModelGroupKey(st)))
        : steps;

      const stepsTabLabel =
        tableSteps.length !== steps.length
          ? `按步查看 (${tableSteps.length}/${steps.length})`
          : `按步查看 (${steps.length})`;

      subTabSwitch.setProps({
        options: [
          { value: 'steps', label: stepsTabLabel },
          { value: 'models', label: '总汇总' },
        ],
      });

      const scopeSigKey = effectiveScopes.join(',');
      patchKeyedList(stepsTbody, tableSteps, {
        keyFn: (st) => `${st.agentCascadeId || slice.cascadeId || 'conv'}-${st.stepIndex}`,
        sigFn: (st) => {
          const disp = resolveModelDisplayInfo(st, displaySettings, { fallback: '—' });
          const outTok = Math.max(0, Number(st.outputTokens || 0));
          const thinkTok = Math.max(0, Number(st.thinkingTokens || 0));
          const respTok =
            st.responseTokens != null
              ? Math.max(0, Number(st.responseTokens))
              : Math.max(0, outTok - thinkTok);
          return `${hasSubagents}:${scopeSigKey}:${st.agentId || 'main'}:${st.stepIndex}:${disp.text}:${disp.title}:${st.tokPerSec}:${st.ttftSec}:${st.contextTokens}:${outTok}:${thinkTok}:${respTok}:${st.cacheHitPct}:${st.costUsd}:${st.selectedSpeedReason}`;
        },
        createRow: () => {
          const agentBadgeEl = h('span', {
            className: 'agent-badge is-clickable',
            hidden: true,
            style: 'margin-right: 4px;',
          });
          const stepNumText = h('span');
          const tdStep = h('td', {}, [agentBadgeEl, stepNumText]);

          const tdModel = h('td', {
            style: 'max-width: 120px; overflow: hidden; text-overflow: ellipsis;',
          });
          const speedMain = h('strong', {
            className: 'cell-value accent-speed',
            style: 'font-size: 11px;',
          });
          const speedReason = h('div', { className: 'text-muted', style: 'font-size: 9.5px;' });
          const tdSpeed = h('td', {}, [speedMain, speedReason]);

          const tdTtft = h('td');
          const tdCtx = h('td');
          const tdCache = h('td', {
            className: 'cell-value accent-ok',
            style: 'font-size: 11px;',
          });
          const tdCost = h('td', { style: 'font-weight: 600;' });

          const tr = h('tr', {}, [tdStep, tdModel, tdSpeed, tdTtft, tdCtx, tdCache, tdCost]);
          return {
            el: tr,
            refs: {
              agentBadgeEl,
              stepNumText,
              tdModel,
              speedMain,
              speedReason,
              tdTtft,
              tdCtx,
              tdCache,
              tdCost,
            },
          };
        },
        updateRow: (refs, st) => {
          patchAttr(refs.agentBadgeEl, 'hidden', !hasSubagents);
          if (hasSubagents) {
            const badgeCls = getAgentBadgeClass(st.agentIndex || 0, !st.isSubagent);
            patchAttr(refs.agentBadgeEl, 'class', `agent-badge is-clickable ${badgeCls}`);
            patchText(refs.agentBadgeEl, st.agentBadge || (st.isSubagent ? '子' : '主'));
            const targetScope = st.agentId || 'main';
            const isSoleTarget =
              effectiveScopes.length === 1 && effectiveScopes[0] === targetScope;
            patchAttr(
              refs.agentBadgeEl,
              'title',
              isSoleTarget
                ? '点击切回全部汇总'
                : `点击仅过滤查看 ${st.agentLabel || '该代理'}（按住 Ctrl/Shift 可加减多选）`
            );
            refs.agentBadgeEl.onclick = (e) => {
              if (e && (e.ctrlKey || e.metaKey || e.shiftKey) && effectiveScopes[0] !== 'all') {
                const next = effectiveScopes.includes(targetScope)
                  ? effectiveScopes.filter((id) => id !== targetScope)
                  : [...effectiveScopes, targetScope];
                applyAgentScopesSelection(next.length > 0 ? next : ['all']);
              } else {
                applyAgentScopesSelection(isSoleTarget ? ['all'] : [targetScope]);
              }
            };
          }
          patchText(refs.stepNumText, `#${Number(st.stepIndex)}`);
          const modelDisplay = resolveModelDisplayInfo(st, displaySettings, { fallback: '—' });
          patchText(refs.tdModel, modelDisplay.text);
          patchAttr(refs.tdModel, 'title', modelDisplay.title);

          patchText(refs.speedMain, formatMetric(st.tokPerSec, ' tok/s'));
          const reason = speedReasonText(st.selectedSpeedReason);
          patchText(refs.speedReason, reason);
          patchAttr(refs.speedReason, 'hidden', !reason);

          patchText(refs.tdTtft, formatMetric(st.ttftSec, 's'));
          const outTok = Math.max(0, Number(st.outputTokens || 0));
          const thinkTok = Math.max(0, Number(st.thinkingTokens || 0));
          const respTok =
            st.responseTokens != null
              ? Math.max(0, Number(st.responseTokens))
              : Math.max(0, outTok - thinkTok);
          patchText(
            refs.tdCtx,
            `${formatTokens(st.contextTokens)} / ${formatTokens(thinkTok)} / ${formatTokens(respTok)}`
          );
          patchAttr(
            refs.tdCtx,
            'title',
            `上下文 ${Math.round(Number(st.contextTokens || 0))} · 思考 ${Math.round(thinkTok)} · 正文 ${Math.round(respTok)}`
          );
          patchText(refs.tdCache, `${Number(st.cacheHitPct ?? 0)}%`);

          const costVal = st.costUsd;
          patchText(refs.tdCost, formatUsd(costVal, { precise: true }));
          patchClasses(refs.tdCost, { 'accent-speed': costVal >= 0.15 });
        },
      });

      // 2. 顶部“会话走势”多选模型对比与图表更新（单模型时隐藏下拉框）
      selectedLineModels = normalizeMultiModelSelection(
        selectedLineModels,
        availableModelKeys
      );
      patchAttr(lineModelSelect.el, 'hidden', !hasMultipleModels);
      if (hasMultipleModels) {
        lineModelSelect.setProps({
          modelValue: selectedLineModels,
          options: modelSelectOptions,
        });
      } else {
        lineModelSelect.close();
      }

      const lineRes = sessionLineChart.update({
        steps: chronoSteps,
        modelGroupKey: selectedLineModels[0] || '__all__',
        modelGroupKeys: selectedLineModels,
        modelColorByGroup,
        metric: selectedLineMetric,
        showAgentPrefix,
        displaySettings,
      });
      patchText(lineSummaryBadge, lineRes.summaryBadge);

      // 3. 顶部“趋势拟合”多选模型对比与锁定状态机更新（单模型时隐藏下拉框）
      const defaultActiveModelKey = resolveDefaultActiveModelKey(
        activeModelSource,
        chronoSteps,
        models,
        availableModelKeys
      );

      const sanitizeFitSelection = (keys) => {
        if (!Array.isArray(keys) || keys.length === 0) return [];
        if (keys.includes('__all__')) return ['__all__'];
        return Array.from(new Set(keys.filter((k) => availableModelKeys.has(k))));
      };

      const isModelsViewVisible =
        uiSt.activeView === 'steps' && uiSt.stepsSubTab === 'models';
      const sanitizedLocked = sanitizeFitSelection(fitLockedModelKeys);

      if (!isModelsViewVisible) {
        fitPinnedWhileVisible = false;
        if (!fitUserPicked || sanitizedLocked.length === 0) {
          fitLockedModelKeys = [defaultActiveModelKey];
        } else {
          fitLockedModelKeys = sanitizedLocked;
        }
      } else if (!fitPinnedWhileVisible) {
        if (!fitUserPicked || sanitizedLocked.length === 0) {
          fitLockedModelKeys = [defaultActiveModelKey];
        } else {
          fitLockedModelKeys = sanitizedLocked;
        }
        if (availableModelKeys.size > 0) {
          fitPinnedWhileVisible = true;
        }
      } else if (sanitizedLocked.length === 0) {
        fitLockedModelKeys = [defaultActiveModelKey];
      } else {
        fitLockedModelKeys = sanitizedLocked;
      }

      const effectiveFitModelKeys =
        availableModelKeys.size === 0
          ? ['__all__']
          : !hasMultipleModels
            ? [Array.from(availableModelKeys)[0]]
            : fitLockedModelKeys.length > 0
              ? fitLockedModelKeys
              : [defaultActiveModelKey];

      patchAttr(fitModelSelect.el, 'hidden', !hasMultipleModels);
      if (hasMultipleModels) {
        fitModelSelect.setProps({
          modelValue: effectiveFitModelKeys,
          options: modelSelectOptions,
        });
      } else {
        fitModelSelect.close();
      }

      const fitRes = modelFitChart.update({
        steps: chronoSteps,
        modelGroupKey: effectiveFitModelKeys[0] || '__all__',
        modelGroupKeys: effectiveFitModelKeys,
        modelColorByGroup,
        metric: selectedFitMetric,
        showAgentPrefix,
        displaySettings,
      });
      patchText(fitSummaryBadge, fitRes.summaryBadge);

      // 4. 极简模型总览列表增量对账（按最终展示名去重归并，一卡表达调用、Token 4 段占比、均速/首字/缓存与费用）
      const displayModels = mergeModelsByDisplayName(models, displaySettings, { fallback: '—' });
      let sumCalls = 0;
      let sumTokens = 0;
      let sumCost = 0;
      let sumUnpriced = 0;
      for (const m of displayModels) {
        sumCalls += Math.max(0, Number(m.calls || 0));
        sumTokens += Math.max(0, Number(m.totalTokens || 0));
        sumUnpriced += Math.max(0, Number(m.unpricedCalls || 0));
        if (Number.isFinite(Number(m.costUsd))) {
          sumCost += Math.max(0, Number(m.costUsd));
        }
      }

      if (displayModels.length === 0) {
        patchText(modelsSummaryMeta, '0 次');
      } else {
        const modelCountPart = displayModels.length > 1 ? `${displayModels.length} 模型 · ` : '';
        const isAllUnpricedSum = sumCalls > 0 && sumUnpriced >= sumCalls && !(sumCost > 0);
        patchText(
          modelsSummaryMeta,
          `${modelCountPart}${sumCalls} 次 · ${formatTokens(sumTokens)} · ${formatUsd(
            isAllUnpricedSum ? null : sumCost,
            {
              precise: sumCost > 0 && sumCost < 0.1,
            }
          )}`
        );
      }
      patchAttr(modelsEmptyEl, 'hidden', displayModels.length > 0);
      patchAttr(modelsListEl, 'hidden', displayModels.length === 0);

      const isFitPooledAll = effectiveFitModelKeys.includes('__all__');
      const fitActiveKeySet = new Set(isFitPooledAll ? [] : effectiveFitModelKeys);

      patchKeyedList(modelsListEl, displayModels, {
        keyFn: (m) => m.displayText || m.label || m.shortName,
        sigFn: (m) => {
          const gk = getStepModelGroupKey(m);
          const fbTtft = stepTtftFallbackMap.get(gk);
          const avgTtft =
            m.avgTtftSec != null
              ? m.avgTtftSec
              : fbTtft && fbTtft.count > 0
                ? +(fbTtft.sum / fbTtft.count).toFixed(1)
                : null;
          const cardGroupKeys =
            Array.isArray(m.sourceLabels) && m.sourceLabels.length > 0
              ? m.sourceLabels.map((lbl) => getStepModelGroupKey({ label: lbl }))
              : [gk];
          const isActiveFit =
            hasMultipleModels && cardGroupKeys.some((k) => fitActiveKeySet.has(k));
          return `${m.displayText}:${m.displayTitle}:${m.calls}:${sumCalls}:${displayModels.length}:${m.avgTokPerSec}:${avgTtft}:${m.cacheHitPct}:${m.inputTokens}:${m.cacheReadTokens}:${m.thinkingTokens}:${m.responseTokens}:${m.totalTokens}:${m.costUsd}:${m.unpricedCalls}:${isActiveFit}:${hasMultipleModels}`;
        },
        createRow: () => {
          const nameEl = h('strong', { className: 'smodel-name' });
          const callsPillEl = h('span', { className: 'smodel-calls-pill text-mono' });
          const tokEl = h('span', { className: 'smodel-tok text-mono' });
          const costEl = h('strong', { className: 'smodel-cost text-mono' });
          const segBar = createFourSegmentBar();
          segBar.el.classList.add('smodel-seg-bar');

          const perfEl = h('span', { className: 'smodel-perf text-mono' });
          const splitEl = h('span', { className: 'smodel-split text-mono' });

          const cardEl = h('div', { className: 'smodel-card' }, [
            h('div', { className: 'smodel-head' }, [
              h('div', { className: 'smodel-ident' }, [nameEl, callsPillEl]),
              h('div', { className: 'smodel-totals' }, [tokEl, costEl]),
            ]),
            segBar.el,
            h('div', { className: 'smodel-foot' }, [perfEl, splitEl]),
          ]);

          return {
            el: cardEl,
            refs: { nameEl, callsPillEl, tokEl, costEl, segBar, perfEl, splitEl },
          };
        },
        updateRow: (refs, m, _idx, cardEl) => {
          const gk = getStepModelGroupKey(m);
          const cardGroupKeys =
            Array.isArray(m.sourceLabels) && m.sourceLabels.length > 0
              ? Array.from(new Set(m.sourceLabels.map((lbl) => getStepModelGroupKey({ label: lbl }))))
              : [gk];
          const dispText = m.displayText || '—';
          const dispTitle = m.displayTitle || dispText;
          patchText(refs.nameEl, dispText);
          patchAttr(refs.nameEl, 'title', dispTitle);

          const calls = Math.max(0, Number(m.calls || 0));
          const callSharePct = sumCalls > 0 ? Math.round((calls / sumCalls) * 100) : 0;
          patchText(
            refs.callsPillEl,
            displayModels.length > 1 ? `${calls}次 · ${callSharePct}%` : `${calls}次`
          );

          const inTok = Math.max(0, Number(m.inputTokens || 0));
          const cacheTok = Math.max(0, Number(m.cacheReadTokens || 0));
          const outTok = Math.max(0, Number(m.outputTokens || 0));
          const thinkTok = Math.max(0, Number(m.thinkingTokens || 0));
          const respTok =
            m.responseTokens != null
              ? Math.max(0, Number(m.responseTokens))
              : Math.max(0, outTok - thinkTok);

          patchText(refs.tokEl, formatTokens(m.totalTokens || 0));
          const costNum = Number(m.costUsd || 0);
          const isAllUnpriced =
            calls > 0 && Number(m.unpricedCalls || 0) >= calls && !(costNum > 0);
          patchText(
            refs.costEl,
            formatUsd(isAllUnpriced ? null : costNum, { precise: costNum > 0 && costNum < 0.1 })
          );

          refs.segBar.update({
            inputTokens: inTok,
            cacheReadTokens: cacheTok,
            responseTokens: respTok,
            thinkingTokens: thinkTok,
          });

          const fbTtft = stepTtftFallbackMap.get(gk);
          const resolvedAvgTtft =
            m.avgTtftSec != null
              ? Number(m.avgTtftSec)
              : fbTtft && fbTtft.count > 0
                ? fbTtft.sum / fbTtft.count
                : null;
          const promptTok = inTok + cacheTok;
          const resolvedCachePct =
            m.cacheHitPct != null
              ? Number(m.cacheHitPct)
              : promptTok > 0
                ? +((cacheTok / promptTok) * 100).toFixed(1)
                : 0;

          patchText(
            refs.perfEl,
            `均速 ${formatMetric(m.avgTokPerSec, ' tok/s')} · 首字 ${formatMetric(resolvedAvgTtft, 's')} · 缓存 ${resolvedCachePct}%`
          );
          patchText(
            refs.splitEl,
            `入 ${formatTokens(inTok)} · 缓 ${formatTokens(cacheTok)} · 思 ${formatTokens(thinkTok)} · 正 ${formatTokens(respTok)}`
          );

          const isActiveFit =
            hasMultipleModels && cardGroupKeys.some((k) => fitActiveKeySet.has(k));
          patchClasses(cardEl, { 'is-fit-active': isActiveFit });
          patchAttr(
            cardEl,
            'title',
            !hasMultipleModels
              ? dispTitle
              : isActiveFit
                ? `${dispTitle}（已纳入上方趋势拟合，按住 Ctrl/Shift 点击可多选对比）`
                : `点击在上方拟合图查看 ${dispText}（按住 Ctrl/Shift 点击可多选同图对比）`
          );
          cardEl.onclick = (e) => {
            if (!hasMultipleModels) return;
            if (e && (e.ctrlKey || e.metaKey || e.shiftKey) && !isFitPooledAll) {
              const cardSet = new Set(cardGroupKeys);
              const next = isActiveFit
                ? effectiveFitModelKeys.filter((k) => !cardSet.has(k))
                : Array.from(new Set([...effectiveFitModelKeys, ...cardGroupKeys]));
              fitLockedModelKeys = next.length > 0 ? next : [...cardGroupKeys];
              fitUserPicked = true;
              fitPinnedWhileVisible = true;
              if (latestSlice) renderStepsData(latestSlice);
              return;
            }
            const isAlreadySole =
              !isFitPooledAll &&
              effectiveFitModelKeys.length === cardGroupKeys.length &&
              cardGroupKeys.every((k) => fitActiveKeySet.has(k));
            if (!isAlreadySole || !fitUserPicked) {
              fitLockedModelKeys = [...cardGroupKeys];
              fitUserPicked = true;
              fitPinnedWhileVisible = true;
              if (latestSlice) renderStepsData(latestSlice);
            }
          };
        },
      });

      if (uiSt.stepsSubTab === 'models') {
        modelsScroll.refresh();
      } else {
        stepsScroll.refresh();
      }
    }

    const unsubUi = uiStore.subscribe(
      (st) => st.stepsSubTab,
      (tab) => {
        subTabSwitch.setValue(tab);
        patchAttr(stepsScroll.el, 'hidden', tab !== 'steps');
        patchAttr(modelsScroll.el, 'hidden', tab !== 'models');
        if (uiStore.getState().activeView === 'steps' && latestSlice) {
          renderStepsData(latestSlice);
        } else if (tab === 'steps') {
          stepsScroll.refresh();
        } else {
          modelsScroll.refresh();
        }
      }
    );

    const unsubTelemetry = telemetryStore.subscribe(
      (st) => ({
        activeConversation: st.telemetry?.activeConversation,
        cascadeId: st.telemetry?.activeConversation?.cascadeId,
        recentSteps: st.telemetry?.activeConversation?.recentSteps,
        sessionModelBreakdown: st.telemetry?.activeConversation?.modelBreakdown,
        modelBreakdown: st.telemetry?.modelBreakdown,
        showUpstreamModel: Boolean(st.telemetry?.settings?.showUpstreamModel),
        orchestratorIdMode: normalizeOrchestratorIdDisplayMode(
          st.telemetry?.settings?.orchestratorIdMode
        ),
      }),
      (slice) => {
        latestSlice = slice;
        if (uiStore.getState().activeView !== 'steps') {
          if (!fitUserPicked) {
            fitPinnedWhileVisible = false;
          }
          isDirty = true;
          return;
        }
        isDirty = false;
        renderStepsData(slice);
      }
    );

    let prevScope = uiStore.getState().selectedAgentScope;
    let prevActiveView = uiStore.getState().activeView;

    const unsubView = uiStore.subscribe(
      (st) => ({
        activeView: st.activeView,
        selectedAgentScope: st.selectedAgentScope,
      }),
      (uiSlice) => {
        const scopeChanged = uiSlice.selectedAgentScope !== prevScope;
        if (uiSlice.selectedAgentScope !== lastSyncedUiScope) {
          lastSyncedUiScope = uiSlice.selectedAgentScope;
          selectedAgentScopes = [uiSlice.selectedAgentScope || 'all'];
        }
        const viewEntered = uiSlice.activeView === 'steps' && prevActiveView !== 'steps';
        prevScope = uiSlice.selectedAgentScope;
        prevActiveView = uiSlice.activeView;
        if (uiSlice.activeView !== 'steps') {
          fitPinnedWhileVisible = false;
          if (scopeChanged) isDirty = true;
          return;
        }
        if ((isDirty || scopeChanged || viewEntered) && latestSlice) {
          isDirty = false;
          renderStepsData(latestSlice);
        }
      }
    );

    onCleanup(() => {
      unsubUi();
      unsubTelemetry();
      unsubView();
      sessionLineChart.destroy?.();
      modelFitChart.destroy?.();
      inlineScopeSelect.destroy();
      stepsModelSelect.destroy();
      subTabSwitch.destroy();
      lineModelSelect.destroy();
      lineMetricSwitch.destroy();
      fitModelSelect.destroy();
      fitMetricSwitch.destroy();
      stepsScroll.destroy();
      modelsScroll.destroy();
    });

    return {
      el: rootEl,
      refs: {
        stepsTbody,
        modelsListEl,
        inlineScopeSelect,
        stepsModelSelect,
        subTabSwitch,
        lineModelSelect,
        lineMetricSwitch,
        fitModelSelect,
        fitMetricSwitch,
        stepsScroll,
        modelsScroll,
      },
    };
  },
});

// --- src/views/SettingsView.js ---
/**
 * @fileoverview View 4: SettingsView (系统设置视图).
 * 采用定制的 `CustomSelect` 与 `SegmentedControl` 替代所有原生表单控件，分为三个单层细线设置面板：
 * 1. 常规设置：配置面板挂载方式（双栖挂载 / 仅右侧辅助栏）、模型名称格式（精简代号 / 原始模型 ID）与 Orchestrator 系列 ID 格式；
 * 2. 顶部栏定制：控制左侧「实时运行会话」入口开关，以及自由定义右侧精简胶囊三个数值槽位的显示内容与左右顺序；
 * 3. 版本更新：配置插件自动更新策略、手动同步云端模型价格表，以及检查并执行 Git/ZIP 双模式插件升级。
 */


/** 步骤明细表中的模型名称显示方式可选项 */
const STEP_MODEL_DISPLAY_OPTIONS = [
  { value: 'short', label: '精简代号 (如 argon-4-high)' },
  { value: 'upstream', label: '原始模型 ID (如 gemini-3.8-flash-n)' },
];

/** Orchestrator 系列模型 ID 显示方式可选项（独立于普通模型名称格式） */
const ORCHESTRATOR_ID_DISPLAY_OPTIONS = [
  { value: 'compact', label: '精简代号 (如 orchestrator-argon)' },
  { value: 'full', label: '原始完整 ID (如 gemini-pro-orchestrator)' },
];

/** 面板挂载模式可选项（顶部栏 + 侧边栏 / 输入框 + 侧边栏 / 仅侧边栏） */
const WINDOW_MOUNT_OPTIONS = [
  { value: 'dual', label: '双栖挂载 (顶部栏 + 侧边栏)' },
  { value: 'composer', label: '输入框挂载 (输入框 + 侧边栏)' },
  { value: 'sidebar', label: '仅侧边栏' },
];

/** 顶栏左侧实时运行会话入口显隐选项 */
const TOPBAR_MULTI_TOGGLE_OPTIONS = [
  { value: 'show', label: '显示' },
  { value: 'hide', label: '隐藏' },
];

/** 顶栏右侧精简胶囊三槽位可选指标项 */
const TOPBAR_SLOT_OPTIONS = [
  { value: 'context', label: '上下文占用 (%)' },
  { value: 'tps', label: '输出速度 (TPS)' },
  { value: 'ttft', label: '首字延迟 (TTFT)' },
  { value: 'cost', label: '本次费用 ($)' },
  { value: 'quota_auto', label: '自动紧俏额度' },
  { value: 'gemini_5h', label: 'Gemini 5h 额度' },
  { value: 'gemini_weekly', label: 'Gemini 周额度' },
  { value: 'claude_5h', label: 'Claude 5h 额度' },
  { value: 'claude_weekly', label: 'Claude 周额度' },
  { value: 'none', label: '不显示' },
];

/** 插件版本更新策略可选项（默认仅提示新版本、手动更新） */
const AUTO_UPDATE_OPTIONS = [
  { value: 'manual', label: '仅提示新版本，手动更新' },
  { value: 'auto', label: '自动更新' },
  { value: 'off', label: '关闭更新' },
];

/**
 * 格式化云端价格目录的最近同步时间或版本日期文本。
 */
function formatSyncTimeText(tsMs, updatedAt) {
  if (Number(tsMs) > 0) {
    const d = new Date(Number(tsMs));
    const pad = (n) => String(n).padStart(2, '0');
    return `更新于 ${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  if (updatedAt) {
    return `发布于 ${String(updatedAt).slice(0, 10)}`;
  }
  return '默认价格';
}

const SettingsView = defineComponent({
  name: 'SettingsView',
  setup({ onCleanup }) {
    let draftShowUpstreamModel = false;
    let draftOrchestratorIdMode = 'compact';
    let draftPluginUpdateMode = 'manual';
    let draftWindowMountMode = 'dual';
    let draftEnableWindowOverlay = true;
    let draftShowTopbarMulti = true;
    let draftTopbarSlots = [...DEFAULT_CLIENT_TOPBAR_SLOTS];
    let statusTimer = null;
    let topbarTimer = null;
    let cloudTimer = null;

    const saveStatusText = h('span', { className: 'text-muted', style: 'font-size: 11px;', text: '' });
    const topbarStatusText = h('span', { className: 'text-muted', style: 'font-size: 11px;', text: '' });
    const cloudStatusMsg = h('span', { className: 'text-muted', style: 'font-size: 11px;', text: '' });

    /** 在常规设置面板右上角展示短暂的保存状态提示 */
    function showSaveFeedback(text) {
      if (statusTimer) {
        clearTimeout(statusTimer);
        statusTimer = null;
      }
      patchText(saveStatusText, text);
      if (text === '已保存' || text === '保存失败') {
        statusTimer = setTimeout(() => {
          statusTimer = null;
          patchText(saveStatusText, '');
        }, text === '保存失败' ? 2500 : 1500);
      }
    }

    /** 在顶部栏定制面板右上角展示短暂的状态提示 */
    function showTopbarFeedback(text, autoClearMs = 1500) {
      if (topbarTimer) {
        clearTimeout(topbarTimer);
        topbarTimer = null;
      }
      patchText(topbarStatusText, text);
      if (autoClearMs > 0) {
        topbarTimer = setTimeout(() => {
          topbarTimer = null;
          patchText(topbarStatusText, '');
        }, autoClearMs);
      }
    }

    /** 在云端同步面板右上角展示同步或更新进度提示 */
    function showCloudFeedback(text, autoClearMs = 3500) {
      if (cloudTimer) {
        clearTimeout(cloudTimer);
        cloudTimer = null;
      }
      patchText(cloudStatusMsg, text);
      if (autoClearMs > 0) {
        cloudTimer = setTimeout(() => {
          cloudTimer = null;
          patchText(cloudStatusMsg, '');
        }, autoClearMs);
      }
    }

    // --- 面板 1：常规设置 ---
    const windowMountSelect = CustomSelect({
      modelValue: 'dual',
      icon: 'dock',
      options: WINDOW_MOUNT_OPTIONS,
      onUpdateModelValue: async (val) => {
        const nextMode = normalizeClientWindowMountMode(val);
        const nextEnable = nextMode !== 'sidebar';
        draftWindowMountMode = nextMode;
        draftEnableWindowOverlay = nextEnable;
        windowMountSelect.setValue(nextMode);
        showSaveFeedback('保存中…');
        try {
          await saveSettingsPatch({
            windowMountMode: nextMode,
            enableWindowOverlay: nextEnable,
          });
          showSaveFeedback('已保存');
        } catch {
          if (latestSettings) {
            renderSettings(latestSettings);
          }
          showSaveFeedback('保存失败');
        }
      },
    });

    const stepModelSelect = CustomSelect({
      modelValue: 'short',
      icon: 'table',
      options: STEP_MODEL_DISPLAY_OPTIONS,
      onUpdateModelValue: async (val) => {
        const nextUpstream = val === 'upstream';
        draftShowUpstreamModel = nextUpstream;
        stepModelSelect.setValue(nextUpstream ? 'upstream' : 'short');
        showSaveFeedback('保存中…');
        try {
          await saveSettingsPatch({
            showUpstreamModel: nextUpstream,
          });
          showSaveFeedback('已保存');
        } catch {
          if (latestSettings) {
            renderSettings(latestSettings);
          }
          showSaveFeedback('保存失败');
        }
      },
    });

    const orchestratorIdSelect = CustomSelect({
      modelValue: 'compact',
      icon: 'layers',
      options: ORCHESTRATOR_ID_DISPLAY_OPTIONS,
      onUpdateModelValue: async (val) => {
        const nextMode = normalizeClientOrchestratorIdMode(val);
        draftOrchestratorIdMode = nextMode;
        orchestratorIdSelect.setValue(nextMode);
        showSaveFeedback('保存中…');
        try {
          await saveSettingsPatch({
            orchestratorIdMode: nextMode,
          });
          showSaveFeedback('已保存');
        } catch {
          if (latestSettings) {
            renderSettings(latestSettings);
          }
          showSaveFeedback('保存失败');
        }
      },
    });

    const generalPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title' }, [
          createSvgIcon('sliders', { size: 13 }),
          h('span', { text: '常规设置' }),
        ]),
        saveStatusText,
      ]),
      h('div', { className: 'form-row' }, [
        h('span', { className: 'form-label', text: '面板挂载方式' }),
        windowMountSelect.el,
      ]),
      h('div', { className: 'form-row' }, [
        h('span', { className: 'form-label', text: '模型名称格式' }),
        stepModelSelect.el,
      ]),
      h('div', { className: 'form-row' }, [
        h('span', { className: 'form-label', text: 'Orchestrator 系列 ID' }),
        orchestratorIdSelect.el,
      ]),
    ]);

    // --- 面板 2：顶部栏定制（实时运行会话开关 + 右侧三槽位指标与顺序自定义） ---
    const multiSessionToggle = SegmentedControl({
      ariaLabel: '实时运行会话开关',
      modelValue: 'show',
      options: TOPBAR_MULTI_TOGGLE_OPTIONS,
      onUpdateModelValue: async (val) => {
        const nextShow = val !== 'hide';
        draftShowTopbarMulti = nextShow;
        syncTopbarControls();
        showTopbarFeedback('保存中…', 0);
        try {
          await saveSettingsPatch({
            showTopbarMultiSession: nextShow,
          });
          showTopbarFeedback('已保存', 1500);
        } catch {
          if (latestSettings) {
            renderSettings(latestSettings);
          }
          showTopbarFeedback('保存失败', 2500);
        }
      },
    });

    async function persistTopbarSlots(nextRawSlots, noticeText = '') {
      const normalized = normalizeClientTopbarSlots(nextRawSlots);
      draftTopbarSlots = normalized;
      syncTopbarControls();
      showTopbarFeedback(noticeText || '保存中…', 0);
      try {
        await saveSettingsPatch({
          topbarCapsuleSlots: normalized,
        });
        showTopbarFeedback(noticeText || '已保存', noticeText ? 2000 : 1500);
      } catch {
        if (latestSettings) {
          renderSettings(latestSettings);
        }
        showTopbarFeedback('保存失败', 2500);
      }
    }

    function handleSlotMetricChange(slotIndex, nextVal) {
      const candidate = [...draftTopbarSlots];
      candidate[slotIndex] = nextVal;
      const wouldAllBeHidden = candidate.every((item) => item === 'none');
      void persistTopbarSlots(
        candidate,
        wouldAllBeHidden ? '至少保留 1 项显示' : ''
      );
    }

    function swapTopbarSlots(idxA, idxB) {
      if (idxA < 0 || idxA > 2 || idxB < 0 || idxB > 2 || idxA === idxB) return;
      const candidate = [...draftTopbarSlots];
      const temp = candidate[idxA];
      candidate[idxA] = candidate[idxB];
      candidate[idxB] = temp;
      void persistTopbarSlots(candidate);
    }

    const slotSelects = [0, 1, 2].map((idx) =>
      CustomSelect({
        modelValue: draftTopbarSlots[idx],
        options: TOPBAR_SLOT_OPTIONS,
        onUpdateModelValue: (val) => handleSlotMetricChange(idx, val),
      })
    );

    const slotRows = [0, 1, 2].map((idx) => {
      const upBtn = h(
        'button',
        {
          type: 'button',
          className: 'slot-move-btn',
          disabled: idx === 0,
          'aria-label': `槽位 ${idx + 1} 左移`,
          title: idx === 0 ? '已在最左' : '上移 (在顶栏靠左)',
          onClick: (e) => {
            e.stopPropagation();
            swapTopbarSlots(idx, idx - 1);
          },
        },
        [createSvgIcon('chevron-up', { size: 12 })]
      );

      const downBtn = h(
        'button',
        {
          type: 'button',
          className: 'slot-move-btn',
          disabled: idx === 2,
          'aria-label': `槽位 ${idx + 1} 右移`,
          title: idx === 2 ? '已在最右' : '下移 (在顶栏靠右)',
          onClick: (e) => {
            e.stopPropagation();
            swapTopbarSlots(idx, idx + 1);
          },
        },
        [createSvgIcon('chevron-down', { size: 12 })]
      );

      return h('div', { className: 'topbar-slot-row', 'data-slot-row': String(idx) }, [
        h('span', { className: 'slot-index-badge', text: String(idx + 1) }),
        slotSelects[idx].el,
        h('span', { className: 'slot-order-btns' }, [upBtn, downBtn]),
      ]);
    });

    const resetTopbarBtn = h(
      'button',
      {
        type: 'button',
        className: 'btn-ghost-sm',
        disabled: true,
        onClick: async () => {
          draftShowTopbarMulti = true;
          draftTopbarSlots = [...DEFAULT_CLIENT_TOPBAR_SLOTS];
          syncTopbarControls();
          showTopbarFeedback('保存中…', 0);
          try {
            await saveSettingsPatch({
              showTopbarMultiSession: true,
              topbarCapsuleSlots: [...DEFAULT_CLIENT_TOPBAR_SLOTS],
            });
            showTopbarFeedback('已恢复默认', 1600);
          } catch {
            if (latestSettings) {
              renderSettings(latestSettings);
            }
            showTopbarFeedback('保存失败', 2500);
          }
        },
      },
      [h('span', { text: '恢复默认' })]
    );

    function syncTopbarControls() {
      multiSessionToggle.setValue(draftShowTopbarMulti ? 'show' : 'hide');
      for (let i = 0; i < 3; i += 1) {
        slotSelects[i].setValue(draftTopbarSlots[i]);
      }
      const isDefault =
        draftShowTopbarMulti === true &&
        draftTopbarSlots[0] === DEFAULT_CLIENT_TOPBAR_SLOTS[0] &&
        draftTopbarSlots[1] === DEFAULT_CLIENT_TOPBAR_SLOTS[1] &&
        draftTopbarSlots[2] === DEFAULT_CLIENT_TOPBAR_SLOTS[2];
      patchAttr(resetTopbarBtn, 'disabled', isDefault);
    }

    const topbarPanel = h('section', { className: 'panel topbar-config-panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title' }, [
          createSvgIcon('dock', { size: 13 }),
          h('span', { text: '顶部栏定制' }),
        ]),
        h('span', { className: 'topbar-header-right' }, [topbarStatusText, resetTopbarBtn]),
      ]),
      h('div', { className: 'settings-inline-row' }, [
        h('span', { className: 'form-label', text: '实时运行会话' }),
        multiSessionToggle.el,
      ]),
      h('div', { className: 'form-row' }, [
        h('span', { className: 'form-label', text: '胶囊数值与顺序 (左 → 右)' }),
        h('div', { className: 'topbar-slot-list' }, slotRows),
      ]),
    ]);

    // --- 面板 3：版本更新面板 ---
    const autoUpdateSelect = CustomSelect({
      modelValue: 'manual',
      icon: 'refresh',
      options: AUTO_UPDATE_OPTIONS,
      onUpdateModelValue: async (val) => {
        const nextMode = normalizeClientUpdateMode(val);
        draftPluginUpdateMode = nextMode;
        autoUpdateSelect.setValue(nextMode);
        if (latestCloudStatus) {
          renderCloudStatus(latestCloudStatus);
        }
        showCloudFeedback('保存中…', 0);
        try {
          await saveSettingsPatch({
            pluginUpdateMode: nextMode,
            autoUpdatePlugin: nextMode === 'auto',
          });
          showCloudFeedback('已保存', 1800);
        } catch {
          if (latestSettings) {
            renderSettings(latestSettings);
          }
          if (latestCloudStatus) {
            renderCloudStatus(latestCloudStatus);
          }
          showCloudFeedback('保存失败', 2500);
        }
      },
    });

    const pricingCountVal = h('strong', { className: 'cell-value', text: '—' });
    const pricingSyncSub = h('span', { className: 'cell-sub', text: '读取中…' });
    const versionVal = h('strong', { className: 'cell-value', text: 'v1.4.4' });
    const versionSub = h('span', { className: 'cell-sub', text: '检查中…' });

    const syncPricingBtnText = h('span', { text: '更新价格表' });
    const syncPricingBtn = h(
      'button',
      {
        type: 'button',
        className: 'btn-secondary',
        onClick: async () => {
          patchAttr(syncPricingBtn, 'disabled', true);
          patchText(syncPricingBtnText, '更新中…');
          showCloudFeedback('正在同步价格表…', 0);
          try {
            const res = await triggerCloudSync();
            const cs = res?.cloudStatus;
            if (res?.ok && cs) {
              showCloudFeedback(`价格表已更新 (${cs.modelCount} 个模型)`, 3500);
            } else {
              showCloudFeedback(cs?.lastSyncError || '连接超时，使用本地价格表', 4500);
            }
          } catch (err) {
            showCloudFeedback(err?.message || '同步失败，使用本地价格表', 4500);
          } finally {
            patchAttr(syncPricingBtn, 'disabled', false);
            patchText(syncPricingBtnText, '更新价格表');
          }
        },
      },
      [createSvgIcon('refresh', { size: 12 }), syncPricingBtnText]
    );

    const updatePluginBtnText = h('span', { text: '检查更新' });
    const updatePluginBtn = h(
      'button',
      {
        type: 'button',
        className: 'btn-secondary',
        onClick: async () => {
          patchAttr(updatePluginBtn, 'disabled', true);
          try {
            if (!latestCloudStatus?.updateAvailable) {
              patchText(updatePluginBtnText, '检查中…');
              showCloudFeedback('正在检查新版本…', 0);
              const syncRes = await triggerCloudSync();
              const cs = syncRes?.cloudStatus || latestCloudStatus;
              if (cs) {
                latestCloudStatus = cs;
                renderCloudStatus(cs);
              }
              if (!syncRes?.ok && cs?.lastSyncError) {
                showCloudFeedback(`检查失败：${cs.lastSyncError}`, 5000);
                return;
              }
              if (!cs?.updateAvailable) {
                const curVer = cs?.currentPluginVersion || '1.4.4';
                showCloudFeedback(`当前已是最新版本 (v${curVer})`, 4500);
                return;
              }
            }
            patchText(updatePluginBtnText, '更新中…');
            showCloudFeedback('正在下载更新…', 0);
            const res = await triggerPluginUpdate();
            if (res?.cloudStatus) {
              latestCloudStatus = res.cloudStatus;
            }
            if (res?.ok) {
              showCloudFeedback(res.message || '更新完成，正在重启面板…', 5000);
            } else {
              showCloudFeedback(res?.message || '未执行更新', 5500);
            }
          } catch (err) {
            showCloudFeedback(err?.message || '更新失败', 5000);
          } finally {
            patchAttr(updatePluginBtn, 'disabled', false);
            renderCloudStatus(latestCloudStatus);
          }
        },
      },
      [createSvgIcon('arrow-down', { size: 12 }), updatePluginBtnText]
    );

    const cloudPanel = h('section', { className: 'panel' }, [
      h('div', { className: 'panel-header' }, [
        h('span', { className: 'panel-title' }, [
          createSvgIcon('bolt', { size: 13 }),
          h('span', { text: '版本更新' }),
        ]),
        cloudStatusMsg,
      ]),
      h('div', { className: 'form-row' }, [
        h('span', { className: 'form-label', text: '更新方式' }),
        autoUpdateSelect.el,
      ]),
      h('div', { className: 'dual-grid' }, [
        h('div', { className: 'matrix-cell' }, [
          h('span', { className: 'cell-label', text: '价格表' }),
          pricingCountVal,
          pricingSyncSub,
        ]),
        h('div', { className: 'matrix-cell' }, [
          h('span', { className: 'cell-label', text: '当前版本' }),
          versionVal,
          versionSub,
        ]),
      ]),
      h('div', { className: 'cloud-actions-row' }, [syncPricingBtn, updatePluginBtn]),
    ]);

    const settingsInner = h(
      'div',
      {
        style: 'display: flex; flex-direction: column; gap: var(--space-3); padding-bottom: 2px;',
      },
      [generalPanel, topbarPanel, cloudPanel]
    );
    const viewScrollbar = CustomScrollbar({
      contentEl: settingsInner,
      className: 'view-pane',
    });

    let latestSettings = null;
    let latestCloudStatus = null;

    /** 将后端返回的最新设置同步至表单控件 */
    function renderSettings(settings) {
      if (!settings) return;
      draftShowUpstreamModel = Boolean(settings.showUpstreamModel);
      draftOrchestratorIdMode = normalizeClientOrchestratorIdMode(settings.orchestratorIdMode);
      draftPluginUpdateMode = normalizeClientUpdateMode(
        settings.pluginUpdateMode,
        settings.autoUpdatePlugin
      );
      draftWindowMountMode = normalizeClientWindowMountMode(
        settings.windowMountMode,
        settings.enableWindowOverlay
      );
      draftEnableWindowOverlay = draftWindowMountMode !== 'sidebar';
      draftShowTopbarMulti = settings.showTopbarMultiSession !== false;
      draftTopbarSlots = normalizeClientTopbarSlots(settings.topbarCapsuleSlots);

      windowMountSelect.setValue(draftWindowMountMode);
      stepModelSelect.setValue(draftShowUpstreamModel ? 'upstream' : 'short');
      orchestratorIdSelect.setValue(draftOrchestratorIdMode);
      autoUpdateSelect.setValue(draftPluginUpdateMode);
      syncTopbarControls();
      viewScrollbar.refresh();
    }

    /** 将云端价格表统计与插件版本对比状态同步至云端面板 */
    function renderCloudStatus(cs) {
      if (!cs) return;
      const srcLabel =
        cs.source === 'remote'
          ? '云端同步'
          : cs.source === 'local'
            ? '本地文件'
            : '内置默认';
      patchText(pricingCountVal, `${cs.modelCount || 0} 个模型`);
      patchText(
        pricingSyncSub,
        `${srcLabel} · ${formatSyncTimeText(cs.lastSyncedAtMs, cs.catalogUpdatedAt)}`
      );

      const curVer = cs.currentPluginVersion || '1.4.4';
      const latVer = cs.latestPluginVersion || curVer;
      const modeTag = cs.installMode === 'git' ? 'Git' : 'ZIP';
      patchText(versionVal, `v${curVer}`);
      if (cs.updateAvailable && draftPluginUpdateMode !== 'off') {
        patchText(versionSub, `可升级至 v${latVer} (${modeTag})`);
        patchClasses(versionSub, { 'accent-ok': true });
        patchText(updatePluginBtnText, `升级至 v${latVer}`);
        patchClasses(updatePluginBtn, { 'btn-primary': true, 'btn-secondary': false });
      } else if (draftPluginUpdateMode === 'off') {
        patchText(versionSub, `已关闭更新提醒 (${modeTag})`);
        patchClasses(versionSub, { 'accent-ok': false });
        patchText(updatePluginBtnText, cs.updateAvailable ? `手动升级 v${latVer}` : '检查更新');
        patchClasses(updatePluginBtn, { 'btn-primary': false, 'btn-secondary': true });
      } else {
        patchText(versionSub, `已是最新 (${modeTag})`);
        patchClasses(versionSub, { 'accent-ok': false });
        patchText(updatePluginBtnText, '检查更新');
        patchClasses(updatePluginBtn, { 'btn-primary': false, 'btn-secondary': true });
      }

      if (!cloudTimer && (cs.lastUpdateError || (cs.lastUpdateResult?.ok === false && cs.lastUpdateResult?.message))) {
        showCloudFeedback(cs.lastUpdateError || cs.lastUpdateResult.message, 5500);
      }
      viewScrollbar.refresh();
    }

    const unsub = telemetryStore.subscribe(
      (st) => ({
        settings: st.telemetry?.settings,
        cloudStatus: st.telemetry?.cloudStatus,
      }),
      (slice) => {
        latestSettings = slice.settings;
        latestCloudStatus = slice.cloudStatus;
        renderSettings(slice.settings);
        if (uiStore.getState().activeView === 'settings') {
          renderCloudStatus(slice.cloudStatus);
        }
      }
    );

    const unsubView = uiStore.subscribe(
      (st) => st.activeView,
      (activeView) => {
        if (activeView === 'settings') {
          if (latestSettings) renderSettings(latestSettings);
          if (latestCloudStatus) renderCloudStatus(latestCloudStatus);
          viewScrollbar.refresh();
        }
      }
    );

    onCleanup(() => {
      if (statusTimer) clearTimeout(statusTimer);
      if (topbarTimer) clearTimeout(topbarTimer);
      if (cloudTimer) clearTimeout(cloudTimer);
      unsub();
      unsubView();
      windowMountSelect.destroy();
      stepModelSelect.destroy();
      orchestratorIdSelect.destroy();
      multiSessionToggle.destroy();
      for (const sel of slotSelects) {
        sel.destroy();
      }
      autoUpdateSelect.destroy();
      viewScrollbar.destroy();
    });

    return {
      el: viewScrollbar.el,
      refs: {
        windowMountSelect,
        stepModelSelect,
        orchestratorIdSelect,
        multiSessionToggle,
        slotSelects,
        resetTopbarBtn,
        autoUpdateSelect,
        viewScrollbar,
      },
    };
  },
});

// --- src/App.js ---
/**
 * @fileoverview Root Application Shell (App.js).
 * Combines the compact dual-layer header (TopSessionHeader + TopLongPillNav)
 * and single-viewport functional views.
 */


const App = defineComponent({
  name: 'App',
  setup({ onCleanup }) {
    const sessionHeader = TopSessionHeader();
    const topPillNav = TopLongPillNav({
      modelValue: uiStore.getState().activeView,
      items: VIEW_TABS,
      onUpdateModelValue: (nextView) => {
        uiStore.setState({ activeView: nextView });
      },
    });

    const overviewView = LiveOverviewView();
    const consumptionView = ConsumptionView();
    const stepsView = StepsDetailView();
    const settingsView = SettingsView();

    const viewMap = {
      overview: overviewView.el,
      consumption: consumptionView.el,
      steps: stepsView.el,
      settings: settingsView.el,
    };

    const stageEl = h('div', { className: 'viewport-stage' }, [
      overviewView.el,
      consumptionView.el,
      stepsView.el,
      settingsView.el,
    ]);

    const shellEl = h('main', { className: 'app-shell' }, [
      h('div', { className: 'top-deck' }, [sessionHeader.el, topPillNav.el]),
      stageEl,
    ]);

    function syncStepsBadge() {
      const uiSt = uiStore.getState();
      const scopeForBadge = uiSt.activeView === 'steps' ? uiSt.selectedAgentScope : 'all';
      const { scopedConv } = resolveScopedConversation(
        telemetryStore.getState().telemetry,
        scopeForBadge,
        uiSt.ctxInspectorAgentId
      );
      const stepCount = scopedConv?.stepCount ?? 0;
      topPillNav.setProps({
        items: VIEW_TABS.map((t) =>
          t.value === 'steps' ? { ...t, badge: stepCount > 0 ? stepCount : '' } : t
        ),
      });
    }

    const unsubUi = uiStore.subscribe(
      (st) => st.activeView,
      (activeView) => {
        topPillNav.setValue(activeView);
        for (const [key, paneEl] of Object.entries(viewMap)) {
          patchAttr(paneEl, 'hidden', key !== activeView);
        }
        if (activeView === 'overview') {
          overviewView.refs?.viewScrollbar?.refresh();
        } else if (activeView === 'consumption') {
          consumptionView.refs?.viewScrollbar?.refresh();
        } else if (activeView === 'steps') {
          stepsView.refs?.stepsScroll?.refresh();
          stepsView.refs?.modelsScroll?.refresh();
        } else if (activeView === 'settings') {
          settingsView.refs?.viewScrollbar?.refresh();
        }
        syncStepsBadge();
      }
    );

    const unsubStepCount = telemetryStore.subscribe(
      (st) => ({
        stepCount: st.telemetry?.activeConversation?.stepCount ?? 0,
        totalStepsAllAgents: st.telemetry?.activeConversation?.totalStepsAllAgents ?? 0,
        subagentCount: st.telemetry?.activeConversation?.subagentCount ?? 0,
      }),
      () => syncStepsBadge()
    );

    const unsubScopeBadge = uiStore.subscribe(
      (st) => st.selectedAgentScope,
      () => syncStepsBadge()
    );

    onCleanup(() => {
      unsubUi();
      unsubStepCount();
      unsubScopeBadge();
      sessionHeader.destroy();
      topPillNav.destroy();
      overviewView.destroy();
      consumptionView.destroy();
      stepsView.destroy();
      settingsView.destroy();
    });

    return {
      el: shellEl,
      refs: {
        sessionHeader,
        topPillNav,
        overviewView,
        consumptionView,
        stepsView,
        settingsView,
      },
    };
  },
});

// --- src/components/layout/WindowOverlayShell.js ---
/**
 * @fileoverview 主窗口双栖挂载外壳 (WindowOverlayShell.js).
 *
 * 采用「分离式双 Shadow Host」架构，彻底规避宿主顶栏层叠上下文 (`z-0` / `overflow: hidden`) 裁切与路由重绘卸载问题：
 * 1. `#ag-usage-monitor-capsule`：轻量顶栏胶囊，优先内嵌停靠至 `[class*="@container/titlebar"]` 右侧按钮组，
 *    支持四级迟滞宽度自适应折叠（`wide` -> `compact` -> `minimal` -> `ring-only`），找不到顶栏时自动回退至右上角固定定位；
 * 2. `#ag-usage-monitor-portal`：常驻 `document.body` 顶层的无遮挡浮层宿主，承载悬停速览卡与完整四标签 `App()` 监控面板，
 *    在宿主切换会话重建顶栏 DOM 时始终保持组件实例、滚动位置与动画状态不丢失。
 */


const CAPSULE_HOST_ID = 'ag-usage-monitor-capsule';
const PORTAL_HOST_ID = 'ag-usage-monitor-portal';
const FLOATING_CARD_WIDTH = 522;
const MULTI_PANEL_WIDTH = 464;
const RING_RADIUS = 5.2;
const RING_CIRCUMFERENCE = +(2 * Math.PI * RING_RADIUS).toFixed(2);

/**
 * 带迟滞区间（Hysteresis）的四阶段顶栏双胶囊响应式宽度计算，避免临界宽度反复跳动。
 * 当左侧多会话入口关闭（`showMulti === false`）时自动释放约 76px 预算给右侧指标胶囊。
 *
 * @param {number} availWidth
 * @param {'wide'|'compact'|'minimal'|'ring-only'} currentMode
 * @param {{ showMulti?: boolean }} [options]
 * @returns {'wide'|'compact'|'minimal'|'ring-only'}
 */
function computeCapsuleLayoutMode(availWidth, currentMode = 'wide', options = undefined) {
  if (availWidth == null || Number.isNaN(availWidth)) return 'wide';
  const showMulti = options?.showMulti !== false;
  const updateReserve = options?.hasUpdate ? 52 : 0;
  const baseEffWidth = showMulti ? availWidth : availWidth + 76;
  const effWidth = baseEffWidth - updateReserve;
  if (currentMode === 'wide') {
    if (baseEffWidth < 78) return 'ring-only';
    if (effWidth < 196) return 'minimal';
    if (effWidth < 256) return 'compact';
    return 'wide';
  }
  if (currentMode === 'compact') {
    if (effWidth >= 272) return 'wide';
    if (baseEffWidth < 78) return 'ring-only';
    if (effWidth < 196) return 'minimal';
    return 'compact';
  }
  if (currentMode === 'minimal') {
    if (effWidth >= 272) return 'wide';
    if (effWidth >= 212) return 'compact';
    if (baseEffWidth < 78) return 'ring-only';
    return 'minimal';
  }
  if (effWidth >= 272) return 'wide';
  if (effWidth >= 212) return 'compact';
  if (baseEffWidth >= 92) return 'minimal';
  return 'ring-only';
}

function findIdeWorkbenchTitlebar() {
  try {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') {
      return null;
    }
    const workbench = document.querySelector('.monaco-workbench');
    if (!workbench?.querySelector) return null;
    const partTitlebar = workbench.querySelector('.part.titlebar');
    if (!partTitlebar?.querySelector) return null;
    if (partTitlebar.getBoundingClientRect) {
      const pr = partTitlebar.getBoundingClientRect();
      if (pr.width <= 0 || pr.height <= 0) return null;
    }
    const container =
      partTitlebar.querySelector(':scope > .titlebar-container') ||
      partTitlebar.querySelector('.titlebar-container');
    const rightGroup =
      container?.querySelector?.(':scope > .titlebar-right') ||
      container?.querySelector?.('.titlebar-right');
    if (!container || !rightGroup) return null;
    const actionToolbar =
      rightGroup.querySelector?.(':scope > .action-toolbar-container') ||
      rightGroup.querySelector?.('.action-toolbar-container') ||
      null;
    return {
      kind: 'ide-titlebar',
      workbench,
      titlebar: container,
      targetContainer: rightGroup,
      actionToolbar,
    };
  } catch {
    return null;
  }
}

function findHostTitlebar() {
  try {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') {
      return null;
    }
    const tb = document.querySelector('[class*="@container/titlebar"]');
    if (tb?.getBoundingClientRect) {
      const r = tb.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return null;
    }
    return tb;
  } catch {
    return null;
  }
}

const COMPOSER_EXCLUDED_ANCESTOR_SELECTOR =
  '.part.titlebar, .part.statusbar, .quick-input-widget, .suggest-widget, .find-widget, .scm-editor, .search-view, [class*="@container/titlebar"]';
const COMPOSER_MODEL_LABEL_RE =
  /\b(?:gemini|claude|gpt|argon|carbon|hydrogen|helix|flash|sonnet|opus|haiku|orchestrator|llama|deepseek|qwen|mistral|model_placeholder|placeholder_m\d+|o[134](?:-\w+)?)\b/i;
const COMPOSER_MODEL_ATTR_RE =
  /\bmodel[-_\s]?(?:select|picker|switch|selector|menu|name)\b|选择模型|切换模型/i;
const COMPOSER_MODE_EXACT_RE = /^(?:auto|自动)$/i;
const COMPOSER_MODE_TEXT_RE =
  /^(?:auto|ask|manual|supervised|autonomous|always\s*allow|turbo|safe|yolo|plan|act|review|confirm|normal|fast|自动|询问|手动|始终允许|受控|规划)(?:\s*(?:mode|模式))?$/i;
const COMPOSER_MODE_ATTR_RE =
  /\b(?:auto(?:nomy|matic)?|execution[-_]?mode|agent[-_]?mode|permission|approval|hitl|policy|mode[-_]?selector|mode[-_]?picker)\b|自动|执行模式|权限模式|审批/i;
const COMPOSER_ICON_FONT_CLASS_RE =
  /\b(?:codicon|material-symbols(?:-\w+)?|material-icons(?:-\w+)?|lucide(?:-\w+)?)\b/i;

function querySimpleSelectorList(root, selectors) {
  if (!root || typeof root.querySelectorAll !== 'function') return [];
  const seen = new Set();
  const out = [];
  for (const sel of selectors) {
    let list = [];
    try {
      list = root.querySelectorAll(sel) || [];
    } catch {
      list = [];
    }
    for (const item of list) {
      if (item && !seen.has(item)) {
        seen.add(item);
        out.push(item);
      }
    }
  }
  return out;
}

function extractVisibleButtonText(node, isRoot = true) {
  if (!node) return '';
  const tag = String(node.tagName || node.nodeName || '').toLowerCase();
  if (tag === 'svg' || tag === 'style' || tag === 'script') return '';
  if (!isRoot) {
    if (node.getAttribute?.('aria-hidden') === 'true') return '';
    const cls = String(node.className || '');
    if (cls && COMPOSER_ICON_FONT_CLASS_RE.test(cls)) return '';
  }
  if (tag === '#text' || node.nodeType === 3) {
    return String(node.nodeValue ?? node.textContent ?? '');
  }
  const childNodes = node.childNodes || node.children;
  if (!childNodes || childNodes.length === 0) {
    return String(node.textContent || '');
  }
  let acc = '';
  for (const ch of childNodes) {
    acc += ` ${extractVisibleButtonText(ch, false)}`;
  }
  return acc;
}

function cleanComposerButtonText(btn) {
  const raw = extractVisibleButtonText(btn, true)
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return '';
  return raw.replace(/^[⌃⌄▾▴∨∧^<>›‹+\s]+|[⌃⌄▾▴∨∧^<>›‹\s]+$/g, '').trim();
}

function isComposerModelButtonItem(item) {
  if (!item) return false;
  if (item.cleanText && COMPOSER_MODEL_LABEL_RE.test(item.cleanText)) return true;
  if (item.attrText && COMPOSER_MODEL_ATTR_RE.test(item.attrText)) return true;
  return false;
}

function hasExcludedComposerAncestor(el) {
  if (!el) return false;
  if (typeof el.closest === 'function') {
    try {
      if (el.closest(COMPOSER_EXCLUDED_ANCESTOR_SELECTOR)) return true;
    } catch {
      // 忽略选择器异常并回退祖先链遍历
    }
  }
  let cur = el.parentElement || el.parentNode;
  while (cur) {
    const cls = String(cur.className || '');
    if (
      cls.includes('@container/titlebar') ||
      cls.includes('quick-input-widget') ||
      cls.includes('suggest-widget') ||
      cls.includes('find-widget') ||
      cls.includes('scm-editor') ||
      cls.includes('search-view') ||
      (cls.includes('part') && (cls.includes('titlebar') || cls.includes('statusbar')))
    ) {
      return true;
    }
    cur = cur.parentElement || cur.parentNode;
  }
  return false;
}

function isNodeHiddenByStyle(el) {
  if (!el) return true;
  if (el.hasAttribute?.('hidden') || el.getAttribute?.('aria-hidden') === 'true') return true;
  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    try {
      const cs = window.getComputedStyle(el);
      if (cs?.display === 'none' || cs?.visibility === 'hidden') return true;
    } catch {
      // 忽略样式读取异常
    }
  }
  return false;
}

function getInFlowHostChildren(container, capsuleNode, portalNode) {
  const rawChildren = container?.children || [];
  const out = [];
  for (const ch of rawChildren) {
    if (!ch || ch === capsuleNode || ch === portalNode) continue;
    if (ch.id === CAPSULE_HOST_ID || ch.id === PORTAL_HOST_ID) continue;
    if (ch.hasAttribute?.('hidden')) continue;
    if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
      try {
        const cs = window.getComputedStyle(ch);
        if (cs?.display === 'none') continue;
        if (cs?.position === 'absolute' || cs?.position === 'fixed') continue;
      } catch {
        // 忽略计算样式异常
      }
    }
    out.push(ch);
  }
  return out;
}

function isHorizontalFlexContainer(el) {
  if (!el) return false;
  const cls = String(el.className || '');
  if (/\b(?:inline-)?flex\b/.test(cls) && !/\bflex-col\b/.test(cls)) return true;
  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    try {
      const cs = window.getComputedStyle(el);
      const disp = String(cs?.display || '');
      const dir = String(cs?.flexDirection || 'row');
      if (disp.includes('flex') && !dir.startsWith('column')) return true;
    } catch {
      // 忽略计算样式异常
    }
  }
  return false;
}

function isSpaceDistributedFlexContainer(el) {
  if (!el) return false;
  const cls = String(el.className || '');
  if (/\bjustify-(?:between|around|evenly)\b/.test(cls)) return true;
  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    try {
      const jc = String(window.getComputedStyle(el)?.justifyContent || '');
      if (jc.includes('space-between') || jc.includes('space-around') || jc.includes('space-evenly')) {
        return true;
      }
    } catch {
      // 忽略计算样式异常
    }
  }
  return false;
}

function buildComposerDockDescriptor(autoBtn, composerCard, bottomRowBtns, capsuleNode, portalNode, patchedNode) {
  if (!autoBtn || !composerCard) return null;
  let item = autoBtn;
  while (
    (item.parentElement || item.parentNode) &&
    (item.parentElement || item.parentNode) !== composerCard &&
    (item.parentElement || item.parentNode) !== document.body
  ) {
    const parent = item.parentElement || item.parentNode;
    const hostSiblings = getInFlowHostChildren(parent, capsuleNode, portalNode);
    if (hostSiblings.length >= 2) break;
    const grandParent = parent.parentElement || parent.parentNode;
    const parentCls = String(parent.className || '');
    const parentInlineMl = String(parent.style?.marginLeft || '').trim();
    const isSingleClusterInSplitRow =
      !/\b(?:relative|ml-auto|ms-auto)\b/.test(parentCls) &&
      parentInlineMl !== 'auto' &&
      isHorizontalFlexContainer(parent) &&
      grandParent &&
      isSpaceDistributedFlexContainer(grandParent) &&
      getInFlowHostChildren(grandParent, capsuleNode, portalNode).length >= 2;
    if (isSingleClusterInSplitRow) {
      break;
    }
    item = parent;
  }

  const anchorNode = item;
  const targetContainer = anchorNode.parentElement || anchorNode.parentNode;
  if (!targetContainer) return null;

  const hostChildren = getInFlowHostChildren(targetContainer, capsuleNode, portalNode);
  const anchorIdx = hostChildren.indexOf(anchorNode);
  const isFirstHostChild = anchorIdx <= 0;

  let needsAutoMarginTransfer = false;
  let patchMarginNode = null;

  if (!isFirstHostChild) {
    const cls = String(anchorNode.className || '');
    const inlineMl = String(anchorNode.style?.marginLeft || '').trim();
    let computedLargeMl = false;
    if (
      patchedNode !== anchorNode &&
      typeof window !== 'undefined' &&
      typeof window.getComputedStyle === 'function'
    ) {
      try {
        const mlPx = parseFloat(window.getComputedStyle(anchorNode)?.marginLeft) || 0;
        const prevSib = hostChildren[anchorIdx - 1];
        const aRect = anchorNode.getBoundingClientRect?.();
        const pRect = prevSib?.getBoundingClientRect?.();
        if (mlPx > 24 && aRect && pRect && aRect.left - pRect.right >= mlPx - 6) {
          computedLargeMl = true;
        }
      } catch {
        // 忽略边距测量异常
      }
    }

    if (
      /\b(?:ml-auto|ms-auto)\b/.test(cls) ||
      inlineMl === 'auto' ||
      patchedNode === anchorNode ||
      computedLargeMl
    ) {
      needsAutoMarginTransfer = true;
      patchMarginNode = anchorNode;
    } else if (isSpaceDistributedFlexContainer(targetContainer)) {
      needsAutoMarginTransfer = true;
    }
  }

  const autoRect = anchorNode.getBoundingClientRect?.() || autoBtn.getBoundingClientRect?.();
  let leftClusterRightEdge = 0;
  if (autoRect && Array.isArray(bottomRowBtns)) {
    for (const entry of bottomRowBtns) {
      if (entry.btn === autoBtn || anchorNode.contains?.(entry.btn)) continue;
      if (entry.rect.left < autoRect.left - 2 && entry.rect.right <= autoRect.left + 4) {
        if (entry.rect.right > leftClusterRightEdge) {
          leftClusterRightEdge = entry.rect.right;
        }
      }
    }
  }

  return {
    kind: 'composer',
    workbench: null,
    titlebar: composerCard,
    targetContainer,
    actionToolbar: patchMarginNode,
    anchorNode,
    needsAutoMarginTransfer,
    leftClusterRightEdge,
  };
}

function buildComposerRightEndDockDescriptor(
  leftAnchorBtn,
  composerCard,
  bottomRowBtns,
  capsuleNode,
  portalNode
) {
  if (!leftAnchorBtn || !composerCard) return null;
  const cardRect = composerCard.getBoundingClientRect?.();
  const minRowWidth = cardRect && cardRect.width > 0 ? cardRect.width * 0.65 : 180;
  let toolbarRow = null;
  let cur = leftAnchorBtn.parentElement || leftAnchorBtn.parentNode;
  for (let d = 0; d < 8 && cur && cur !== composerCard && cur !== document.body; d += 1) {
    const r = cur.getBoundingClientRect?.();
    if (r && r.width >= minRowWidth && r.height > 0 && r.height <= 60 && isHorizontalFlexContainer(cur)) {
      toolbarRow = cur;
      break;
    }
    cur = cur.parentElement || cur.parentNode;
  }
  if (!toolbarRow) {
    const p = leftAnchorBtn.parentElement || leftAnchorBtn.parentNode;
    if (!p || !isHorizontalFlexContainer(p)) return null;
    toolbarRow = p;
  }

  let leftClusterRightEdge = 0;
  if (Array.isArray(bottomRowBtns)) {
    for (const entry of bottomRowBtns) {
      if (entry?.rect?.right > leftClusterRightEdge) {
        leftClusterRightEdge = entry.rect.right;
      }
    }
  }

  const rowChildren = getInFlowHostChildren(toolbarRow, capsuleNode, portalNode);
  const lastChild = rowChildren.length >= 2 ? rowChildren[rowChildren.length - 1] : null;
  if (
    lastChild &&
    !lastChild.contains?.(leftAnchorBtn) &&
    isHorizontalFlexContainer(lastChild) &&
    getInFlowHostChildren(lastChild, capsuleNode, portalNode).length === 0
  ) {
    return {
      kind: 'composer',
      workbench: null,
      titlebar: composerCard,
      targetContainer: lastChild,
      actionToolbar: null,
      anchorNode: null,
      needsAutoMarginTransfer: false,
      leftClusterRightEdge,
    };
  }

  return {
    kind: 'composer',
    workbench: null,
    titlebar: composerCard,
    targetContainer: toolbarRow,
    actionToolbar: null,
    anchorNode: null,
    needsAutoMarginTransfer: true,
    leftClusterRightEdge,
  };
}

function collectComposerBottomButtons(container, editorEl, editorRect, capsuleNode, portalNode) {
  const rawBtns = querySimpleSelectorList(container, ['button', '[role="button"]', '[aria-haspopup]']);
  const hostBtns = [];
  for (const btn of rawBtns) {
    if (!btn || btn === editorEl || editorEl?.contains?.(btn)) continue;
    if (editorEl && btn.contains?.(editorEl)) continue;
    if (
      btn.id === CAPSULE_HOST_ID ||
      btn.id === PORTAL_HOST_ID ||
      capsuleNode?.contains?.(btn) ||
      portalNode?.contains?.(btn)
    ) {
      continue;
    }
    if (isNodeHiddenByStyle(btn)) continue;
    // 仅排除嵌套在真实紧凑按钮内部的图标/子触发器，避免外层卡片级 role="button" 误杀工具栏按钮
    let nestedInBtn = false;
    let p = btn.parentElement || btn.parentNode;
    while (p && p !== container) {
      const pTag = String(p.tagName || '').toLowerCase();
      if (pTag === 'button') {
        nestedInBtn = true;
        break;
      }
      if (
        (p.getAttribute?.('role') === 'button' || p.hasAttribute?.('aria-haspopup')) &&
        !(editorEl && p.contains?.(editorEl))
      ) {
        const pr = p.getBoundingClientRect?.();
        if (pr && pr.height > 0 && pr.height <= 48 && pr.width > 0 && pr.width <= 360) {
          nestedInBtn = true;
          break;
        }
      }
      p = p.parentElement || p.parentNode;
    }
    if (nestedInBtn) continue;

    const br = btn.getBoundingClientRect?.();
    if (!br || br.width <= 0 || br.height <= 0 || br.height > 48) continue;
    const centerY = (br.top + br.bottom) / 2;
    if (editorRect && centerY < editorRect.top - 4) continue;
    hostBtns.push({
      btn,
      rect: br,
      centerY,
      centerX: (br.left + br.right) / 2,
      cleanText: cleanComposerButtonText(btn),
      attrText: `${btn.getAttribute?.('data-testid') || ''} ${btn.getAttribute?.('aria-label') || ''} ${btn.getAttribute?.('title') || ''}`.trim(),
    });
  }
  if (hostBtns.length === 0) return [];
  let maxCenterY = -Infinity;
  for (const item of hostBtns) {
    if (item.centerY > maxCenterY) maxCenterY = item.centerY;
  }
  const bottomBand = hostBtns.filter((item) => Math.abs(item.centerY - maxCenterY) <= 22);
  bottomBand.sort((a, b) => a.rect.left - b.rect.left);
  return bottomBand;
}

function pickAutoButtonFromRow(bottomRowBtns, containerRect, options = undefined) {
  if (!Array.isArray(bottomRowBtns) || bottomRowBtns.length === 0) return null;
  const requireModelForFallback = Boolean(options?.requireModelForFallback);
  const rightSplitX = containerRect ? containerRect.left + containerRect.width * 0.35 : 0;
  const rightFirst = [
    ...bottomRowBtns.filter((b) => b.centerX >= rightSplitX),
    ...bottomRowBtns.filter((b) => b.centerX < rightSplitX),
  ];

  // Tier 1: 精确文本 Auto / 自动 匹配
  for (const item of rightFirst) {
    if (COMPOSER_MODE_EXACT_RE.test(item.cleanText)) {
      return { btn: item.btn, tier: 1 };
    }
  }

  // Tier 2: 执行/权限模式文案或无障碍语义属性匹配（排除模型选择器按钮）
  for (const item of rightFirst) {
    if (isComposerModelButtonItem(item)) continue;
    if (
      (item.cleanText && COMPOSER_MODE_TEXT_RE.test(item.cleanText)) ||
      (item.attrText && COMPOSER_MODE_ATTR_RE.test(item.attrText))
    ) {
      return { btn: item.btn, tier: 2 };
    }
  }

  const hasModelBtn = bottomRowBtns.some(isComposerModelButtonItem);

  // Tier 3: 几何右簇首按钮兜底（适配 Antigravity IDE 无 Auto 按钮、右侧为发送/语音按钮的输入栏布局）
  if (bottomRowBtns.length >= 2 && (!requireModelForFallback || hasModelBtn)) {
    let maxGap = -Infinity;
    let splitIdx = -1;
    for (let i = 1; i < bottomRowBtns.length; i += 1) {
      const gap = bottomRowBtns[i].rect.left - bottomRowBtns[i - 1].rect.right;
      if (gap > maxGap) {
        maxGap = gap;
        splitIdx = i;
      }
    }
    if (splitIdx >= 1 && maxGap >= 16) {
      return { btn: bottomRowBtns[splitIdx].btn, tier: 3 };
    }
  }

  // Tier 4: 输入为空时若右侧发送按钮暂时隐藏、仅左侧存在模型选择器按钮，停靠至工具栏最右侧
  if (hasModelBtn && containerRect && containerRect.width >= 200) {
    const lastItem = bottomRowBtns[bottomRowBtns.length - 1];
    if (lastItem.rect.right <= containerRect.left + containerRect.width * 0.72) {
      return { btn: null, leftAnchorBtn: lastItem.btn, tier: 4 };
    }
  }

  return null;
}

function resolveComposerEditorRect(ed) {
  const er = ed?.getBoundingClientRect?.();
  if (er && er.width >= 80 && er.height >= 12) return er;
  let cur = ed;
  for (let d = 0; d < 6 && cur; d += 1) {
    if (String(cur.className || '').includes('monaco-editor')) {
      const mr = cur.getBoundingClientRect?.();
      if (mr && mr.width >= 80 && mr.height >= 12) return mr;
      break;
    }
    cur = cur.parentElement || cur.parentNode;
  }
  return er || null;
}

function findHostComposerAutoTarget(capsuleNode = null, portalNode = null, patchedNode = null) {
  try {
    if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') {
      return null;
    }
    const capEl = capsuleNode || document.getElementById?.(CAPSULE_HOST_ID) || null;
    const porEl = portalNode || document.getElementById?.(PORTAL_HOST_ID) || null;
    const activeRouteId = extractHostRouteCascadeId();

    // 1. 优先从活跃会话的输入框编辑器向上定位底部工具栏与 Auto / 右簇发送按钮
    const rawEditors = querySimpleSelectorList(document, [
      'textarea',
      '[contenteditable]',
      '[role="textbox"]',
      '[data-lexical-editor]',
      '.ProseMirror',
      '.monaco-editor',
    ]);
    const scoredEditors = [];
    for (const ed of rawEditors) {
      if (!ed || capEl?.contains?.(ed) || porEl?.contains?.(ed)) continue;
      if (ed.hasAttribute?.('contenteditable')) {
        const ce = String(ed.getAttribute('contenteditable') || '').trim().toLowerCase();
        if (ce === 'false' && ed.getAttribute?.('role') !== 'textbox') continue;
      }
      if (isNodeHiddenByStyle(ed) || hasExcludedComposerAncestor(ed)) continue;
      const er = resolveComposerEditorRect(ed);
      if (!er || er.width < 100 || er.height < 12 || er.height > 540) continue;

      let score = Math.min(1200, er.width) + Math.max(0, er.bottom) * 0.2;
      if (activeRouteId) {
        let anc = ed.parentElement || ed.parentNode;
        while (anc) {
          const cid = anc.getAttribute?.('data-cascade-id');
          if (cid) {
            score += cid === activeRouteId ? 4000 : -2000;
            break;
          }
          anc = anc.parentElement || anc.parentNode;
        }
      }
      if (
        document.activeElement &&
        (ed === document.activeElement || ed.contains?.(document.activeElement))
      ) {
        score += 1000;
      }
      scoredEditors.push({ ed, rect: er, score });
    }
    scoredEditors.sort((a, b) => b.score - a.score);

    for (const { ed, rect: er } of scoredEditors) {
      const isMonacoCandidate = String(ed.className || '').includes('monaco-editor') ||
        String(ed.className || '').includes('inputarea');
      let tier3Candidate = null;
      let tier4Candidate = null;
      let cur = ed.parentElement || ed.parentNode;
      for (let depth = 0; depth < 18 && cur; depth += 1) {
        if (cur === document.body || cur === document.documentElement) break;
        const tag = String(cur.tagName || '').toLowerCase();
        if (tag === 'main' || String(cur.className || '').includes('monaco-workbench')) break;
        const cr = cur.getBoundingClientRect?.();
        if (cr && cr.height > 680) break;
        if (cr && cr.width >= 180 && cr.height > 0) {
          const bottomRowBtns = collectComposerBottomButtons(cur, ed, er, capEl, porEl);
          const picked = pickAutoButtonFromRow(bottomRowBtns, cr, {
            requireModelForFallback: isMonacoCandidate,
          });
          if (picked) {
            if (picked.tier <= 2) {
              const desc = buildComposerDockDescriptor(
                picked.btn,
                cur,
                bottomRowBtns,
                capEl,
                porEl,
                patchedNode
              );
              if (desc) return desc;
            } else if (picked.tier === 3 && !tier3Candidate) {
              tier3Candidate = { btn: picked.btn, card: cur, bottomRowBtns };
            } else if (picked.tier === 4 && !tier4Candidate) {
              tier4Candidate = { leftAnchorBtn: picked.leftAnchorBtn, card: cur, bottomRowBtns };
            }
          }
        }
        cur = cur.parentElement || cur.parentNode;
      }
      if (tier3Candidate) {
        const desc = buildComposerDockDescriptor(
          tier3Candidate.btn,
          tier3Candidate.card,
          tier3Candidate.bottomRowBtns,
          capEl,
          porEl,
          patchedNode
        );
        if (desc) return desc;
      }
      if (tier4Candidate) {
        const desc = buildComposerRightEndDockDescriptor(
          tier4Candidate.leftAnchorBtn,
          tier4Candidate.card,
          tier4Candidate.bottomRowBtns,
          capEl,
          porEl
        );
        if (desc) return desc;
      }
    }

    // 2. 兜底路径：编辑器自定义封装或暂时只读时，直接扫描底部包含模型选择器或 Auto 按钮的输入工具栏
    const vh = Number(window.innerHeight || 800);
    const allBtns = querySimpleSelectorList(document, ['button', '[role="button"]', '[aria-haspopup]']);
    let modelToolbarFallback = null;
    for (const btn of allBtns) {
      if (!btn || capEl?.contains?.(btn) || porEl?.contains?.(btn)) continue;
      if (isNodeHiddenByStyle(btn) || hasExcludedComposerAncestor(btn)) continue;
      const br = btn.getBoundingClientRect?.();
      if (!br || br.width <= 0 || br.height <= 0 || br.height > 48 || br.top < vh * 0.2) continue;
      const clean = cleanComposerButtonText(btn);
      const attr = `${btn.getAttribute?.('data-testid') || ''} ${btn.getAttribute?.('aria-label') || ''} ${btn.getAttribute?.('title') || ''}`.trim();
      const itemProbe = { cleanText: clean, attrText: attr };
      const isModeBtn =
        COMPOSER_MODE_EXACT_RE.test(clean) ||
        (!isComposerModelButtonItem(itemProbe) &&
          ((clean && COMPOSER_MODE_TEXT_RE.test(clean)) || (attr && COMPOSER_MODE_ATTR_RE.test(attr))));
      const isModelBtn = isComposerModelButtonItem(itemProbe);
      if (!isModeBtn && !isModelBtn) continue;

      let cur = btn.parentElement || btn.parentNode;
      for (let depth = 0; depth < 12 && cur; depth += 1) {
        if (cur === document.body || cur === document.documentElement) break;
        if (String(cur.className || '').includes('monaco-workbench')) break;
        const cr = cur.getBoundingClientRect?.();
        if (!cr || cr.height > 560) break;
        if (cr.width >= 200) {
          const rowBtns = collectComposerBottomButtons(cur, null, null, capEl, porEl);
          if (isModeBtn) {
            const hasModelSibling = rowBtns.some((b) => b.btn !== btn && isComposerModelButtonItem(b));
            if (hasModelSibling) {
              const desc = buildComposerDockDescriptor(btn, cur, rowBtns, capEl, porEl, patchedNode);
              if (desc) return desc;
            }
          } else if (isModelBtn && !modelToolbarFallback) {
            const picked = pickAutoButtonFromRow(rowBtns, cr, { requireModelForFallback: true });
            if (picked) {
              const desc =
                picked.tier <= 3 && picked.btn
                  ? buildComposerDockDescriptor(picked.btn, cur, rowBtns, capEl, porEl, patchedNode)
                  : picked.tier === 4 && picked.leftAnchorBtn
                    ? buildComposerRightEndDockDescriptor(
                        picked.leftAnchorBtn,
                        cur,
                        rowBtns,
                        capEl,
                        porEl
                      )
                    : null;
              if (desc) {
                if (picked.tier <= 2) return desc;
                modelToolbarFallback = desc;
                break;
              }
            }
          }
        }
        cur = cur.parentElement || cur.parentNode;
      }
    }
    if (modelToolbarFallback) return modelToolbarFallback;
  } catch {
    // 忽略输入框探测异常
  }
  return null;
}

function isImmediatelyBeforeNode(node, refNode) {
  if (!node || !refNode) return false;
  if (node.nextElementSibling !== undefined) {
    return node.nextElementSibling === refNode;
  }
  if (node.nextSibling !== undefined) {
    return node.nextSibling === refNode;
  }
  const parent = node.parentElement || node.parentNode;
  if (!parent?.children) return false;
  const idx = Array.prototype.indexOf.call(parent.children, node);
  return idx >= 0 && parent.children[idx + 1] === refNode;
}

function isIdeExtensionChatFrame() {
  try {
    if (typeof window === 'undefined') return false;
    if (window.__AGUsageMonitorBridge?.isIdeChatFrame === true) return true;
    return /[?&]extension(?:View|Variant)=/i.test(String(window.location?.search || ''));
  } catch {
    return false;
  }
}

function resolveActiveDockTarget(options = undefined) {
  const settings = telemetryStore.getState().telemetry?.settings;
  const rawMode =
    settings?.windowMountMode ??
    (typeof window !== 'undefined' ? window.__AGUsageMonitorBridge?.mountMode : undefined);
  const mountMode =
    options?.mountMode ||
    normalizeClientWindowMountMode(rawMode, settings?.enableWindowOverlay);
  if (isIdeExtensionChatFrame()) {
    if (mountMode !== 'composer') return null;
    return findHostComposerAutoTarget(
      options?.capsuleNode || null,
      options?.portalNode || null,
      options?.patchedNode || null
    );
  }
  if (mountMode === 'composer') {
    const composerTarget = findHostComposerAutoTarget(
      options?.capsuleNode || null,
      options?.portalNode || null,
      options?.patchedNode || null
    );
    if (composerTarget) return composerTarget;
  }
  const ideTarget = findIdeWorkbenchTitlebar();
  if (ideTarget) return ideTarget;
  const titlebar = findHostTitlebar();
  if (!titlebar) return null;
  let targetContainer = titlebar;
  try {
    const rightGroup = titlebar.querySelector(':scope > div.shrink-0') || titlebar.lastElementChild;
    if (rightGroup && rightGroup !== titlebar.firstElementChild) {
      targetContainer = rightGroup;
    }
  } catch {
    // 忽略子选择器不兼容场景
  }
  return {
    kind: 'flow',
    workbench: null,
    titlebar,
    targetContainer,
    actionToolbar: null,
  };
}

function findNativeTopRightAnchor() {
  try {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') {
      return null;
    }
    const auxToggle = document.querySelector('[data-testid="toggle-aux-sidebar"]');
    if (auxToggle?.closest) {
      return auxToggle.closest('div.absolute.right-0.top-0') || auxToggle;
    }
    const candidates = document.querySelectorAll('button, a, [role="button"]');
    for (const btn of candidates) {
      const text = String(btn.textContent || '').trim();
      if (
        (text === 'Open IDE' || text === '打开 IDE' || text.includes('Open IDE') || text.includes('打开 IDE')) &&
        btn.getBoundingClientRect?.().top < 52
      ) {
        return btn.closest?.('div.flex.items-center, div.absolute.right-0') || btn;
      }
    }
    return document.querySelector('div.absolute.right-0.top-0');
  } catch {
    return null;
  }
}

function getLeftSidebarRightEdge(vw) {
  try {
    if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
      if (document.querySelector('.monaco-workbench')) {
        return 0;
      }
      const navEl = document.querySelector('div[role="navigation"]');
      if (navEl?.getBoundingClientRect) {
        const nr = navEl.getBoundingClientRect();
        if (nr.width > 0 && nr.left <= 8 && nr.right > 0 && nr.right < vw - 280) {
          return Math.ceil(nr.right);
        }
      }
    }
  } catch {
    // 忽略侧栏测量异常
  }
  return 0;
}

function resolveQuotaCapsuleSummary(quotas) {
  if (!quotas) return null;
  const activePool = quotas.activePool;
  const weekly = quotas.weekly;
  const candidates = [];
  if (activePool && Number.isFinite(Number(activePool.remainingPct))) {
    candidates.push({
      pct: Number(activePool.remainingPct),
      label: activePool.poolLabel || activePool.family || '当前池',
      windowTag: '5h',
    });
  }
  if (activePool && Number.isFinite(Number(activePool.weeklyRemainingPct))) {
    candidates.push({
      pct: Number(activePool.weeklyRemainingPct),
      label: activePool.poolLabel || activePool.family || '当前池',
      windowTag: '周',
    });
  }
  if (!candidates.length && weekly && Number.isFinite(Number(weekly.remainingPct))) {
    candidates.push({
      pct: Number(weekly.remainingPct),
      label: weekly.poolFamily || '周限额',
      windowTag: '周',
    });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.pct - b.pct);
  const tightest = candidates[0];
  const rounded = Math.max(0, Math.min(100, Math.round(tightest.pct)));
  return {
    roundedPct: rounded,
    shortText: `余 ${rounded}%`,
    detailText: candidates
      .map((c) => `${c.label} ${c.windowTag} 余 ${Math.max(0, Math.min(100, Math.round(c.pct)))}%`)
      .join(' · '),
  };
}

const THIRD_PARTY_FAMILY_RE = /claude|gpt|anthropic|openai|3p|sonnet|opus|haiku/i;

/**
 * 解析指定模型池（Gemini 或 Claude & GPT）与指定时间窗口（5h 或周额度）的剩余百分比摘要。
 *
 * @param {object|null|undefined} quotas
 * @param {'gemini_5h'|'gemini_weekly'|'claude_5h'|'claude_weekly'} slotKey
 * @returns {{ roundedPct: number, shortText: string } | null}
 */
function resolveSpecificQuotaSlotSummary(quotas, slotKey) {
  if (!quotas) return null;
  const pools = Array.isArray(quotas.pools) ? quotas.pools : [];
  const activePool = quotas.activePool || null;
  const isClaude = slotKey.startsWith('claude_');
  const isWeekly = slotKey.endsWith('_weekly');
  let rawPct = null;

  if (isClaude) {
    const claudePool =
      pools.find((p) => p?.poolKey === 'Claude & GPT') ||
      pools.find((p) => THIRD_PARTY_FAMILY_RE.test(String(p?.poolKey || p?.poolLabel || '')));
    const cand = isWeekly ? claudePool?.weeklyRemainingPct : claudePool?.remainingPct;
    if (cand != null && Number.isFinite(Number(cand))) {
      rawPct = Number(cand);
    } else if (
      activePool &&
      THIRD_PARTY_FAMILY_RE.test(String(activePool.family || activePool.poolLabel || ''))
    ) {
      const fb = isWeekly ? activePool.weeklyRemainingPct : activePool.remainingPct;
      if (fb != null && Number.isFinite(Number(fb))) {
        rawPct = Number(fb);
      }
    }
  } else {
    const stdGemini =
      pools.find((p) => p?.poolKey === 'Gemini') ||
      pools.find(
        (p) =>
          /gemini/i.test(String(p?.poolKey || p?.poolLabel || '')) &&
          !/carbon|argon/i.test(String(p?.poolKey || ''))
      );
    const geminiFamilyPools = pools.filter((p) =>
      /gemini|carbon|argon/i.test(String(p?.poolKey || p?.poolLabel || ''))
    );
    const primaryCand = isWeekly ? stdGemini?.weeklyRemainingPct : stdGemini?.remainingPct;
    if (primaryCand != null && Number.isFinite(Number(primaryCand))) {
      rawPct = Number(primaryCand);
    } else {
      const familyVals = geminiFamilyPools
        .map((p) => (isWeekly ? p?.weeklyRemainingPct : p?.remainingPct))
        .filter((v) => v != null && Number.isFinite(Number(v)))
        .map(Number);
      if (familyVals.length > 0) {
        rawPct = Math.min(...familyVals);
      } else if (
        activePool &&
        !THIRD_PARTY_FAMILY_RE.test(String(activePool.family || activePool.poolLabel || ''))
      ) {
        const fb = isWeekly ? activePool.weeklyRemainingPct : activePool.remainingPct;
        if (fb != null && Number.isFinite(Number(fb))) {
          rawPct = Number(fb);
        }
      }
      if (
        rawPct == null &&
        isWeekly &&
        quotas.weekly &&
        !THIRD_PARTY_FAMILY_RE.test(String(quotas.weekly.poolFamily || '')) &&
        quotas.weekly.remainingPct != null &&
        Number.isFinite(Number(quotas.weekly.remainingPct))
      ) {
        rawPct = Number(quotas.weekly.remainingPct);
      }
    }
  }

  if (rawPct == null || !Number.isFinite(rawPct)) return null;
  const rounded = Math.max(0, Math.min(100, Math.round(rawPct)));
  return {
    roundedPct: rounded,
    shortText: `余 ${rounded}%`,
  };
}

function formatCompactCapsuleCost(stepCost) {
  if (stepCost == null || !Number.isFinite(Number(stepCost))) return '--';
  const val = Math.max(0, Number(stepCost));
  if (val === 0) return '$0.00';
  if (val < 0.001) return '<$0.001';
  if (val < 1) return `$${val.toFixed(3)}`;
  if (val < 100) return `$${val.toFixed(2)}`;
  return `$${Math.round(val)}`;
}

function formatCompactCapsuleTtft(ttftSec) {
  if (ttftSec == null || !Number.isFinite(Number(ttftSec)) || Number(ttftSec) < 0) return '--s';
  const val = Number(ttftSec);
  if (val < 1) return `${val.toFixed(2)}s`;
  if (val < 100) return `${val.toFixed(1)}s`;
  return `${Math.round(val)}s`;
}

/**
 * 在主窗口挂载双栖顶栏胶囊与完整四标签悬浮面板，并注册 `window.__AGUsageMonitorOverlay` 生命周期句柄。
 */
function mountWindowOverlay() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;

  // 先读取旧实例缓存的遥测快照与展开态（热升级时无缝承接数据与悬停状态，杜绝闪烁或关开），再安全卸载旧实例
  let carryOverTelemetry = null;
  let carryOverTooltipOpen = false;
  let carryOverPopoverOpen = false;
  let carryOverMultiHoverOpen = false;
  let carryOverMultiPinnedOpen = false;
  let carryOverPointer = null;
  try {
    const prevOv = window.__AGUsageMonitorOverlay;
    carryOverTelemetry = prevOv?.getTelemetrySnapshot?.() || null;
    carryOverTooltipOpen = Boolean(prevOv?.isHoverOpen?.());
    carryOverPopoverOpen = Boolean(prevOv?.isOpen?.());
    carryOverMultiHoverOpen = Boolean(prevOv?.isMultiHoverOpen?.());
    carryOverMultiPinnedOpen = Boolean(prevOv?.isMultiPinnedOpen?.());
    carryOverPointer = prevOv?.getLastPointer?.() || null;
    prevOv?.dispose?.();
  } catch {
    // 忽略旧实例卸载异常
  }
  try {
    document.getElementById(CAPSULE_HOST_ID)?.remove?.();
    document.getElementById(PORTAL_HOST_ID)?.remove?.();
  } catch {
    // 忽略残留节点清理异常
  }

  const bridgeConfig = getWindowBridgeConfig();
  const bundleVersion = String(bridgeConfig?.bundleVersion || '');
  const stylesCss = String(bridgeConfig?.stylesCss || '');
  const seedTelemetry =
    (bridgeConfig?.initialTelemetry && typeof bridgeConfig.initialTelemetry === 'object'
      ? bridgeConfig.initialTelemetry
      : null) || carryOverTelemetry;
  if (bridgeConfig?.initialTelemetry) {
    delete bridgeConfig.initialTelemetry;
  }
  if (seedTelemetry) {
    telemetryStore.setState({
      telemetry: seedTelemetry,
      minuteTick: Math.floor(Date.now() / 30000),
      syncState: 'idle',
    });
  }

  let disposed = false;
  let popoverOpen = false;
  let tooltipOpen = false;
  let multiOpen = false;
  let multiPinned = false;
  let hoverLeaveTimer = null;
  let multiLeaveTimer = null;
  const manualSubExpandMap = new Map();
  const multiTimersMap = new Map();
  let multiLiveTickTimer = null;
  let hasPointerCoords = Boolean(
    carryOverPointer &&
      Number.isFinite(carryOverPointer.x) &&
      Number.isFinite(carryOverPointer.y)
  );
  let lastPointerX = hasPointerCoords ? carryOverPointer.x : -1;
  let lastPointerY = hasPointerCoords ? carryOverPointer.y : -1;
  let layoutMode = 'wide';
  let observedTitlebar = null;
  let dockRafId = 0;
  let lastObservedRouteId = extractHostRouteCascadeId();

  function recordPointerCoords(e) {
    if (e && Number.isFinite(e.clientX) && Number.isFinite(e.clientY)) {
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      hasPointerCoords = true;
    }
  }

  function isPointerStillInCapsule() {
    if (!hasPointerCoords || document.hidden || !capsuleBtn.getBoundingClientRect) {
      return false;
    }
    const r = capsuleBtn.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    let rightBound = r.right;
    if (!topbarUpdateBtn.hasAttribute('hidden') && topbarUpdateBtn.getBoundingClientRect) {
      const ur = topbarUpdateBtn.getBoundingClientRect();
      if (ur.width > 0 && ur.height > 0) {
        rightBound = Math.max(rightBound, ur.right);
      }
    }
    return (
      lastPointerX >= r.left - 1 &&
      lastPointerX <= rightBound + 1 &&
      lastPointerY >= r.top - 1 &&
      lastPointerY <= r.bottom + 1
    );
  }

  function isPointerInMultiZone() {
    if (!hasPointerCoords || document.hidden || multiBtn.hasAttribute('hidden')) {
      return false;
    }
    const bridgePad = multiOpen ? 12 : 1;
    if (multiBtn.getBoundingClientRect) {
      const mr = multiBtn.getBoundingClientRect();
      if (
        mr.width > 0 &&
        mr.height > 0 &&
        lastPointerX >= mr.left - 1 &&
        lastPointerX <= mr.right + 1 &&
        lastPointerY >= mr.top - bridgePad &&
        lastPointerY <= mr.bottom + bridgePad
      ) {
        return true;
      }
    }
    if (multiOpen && multiPanelEl.getBoundingClientRect) {
      const pr = multiPanelEl.getBoundingClientRect();
      if (
        pr.width > 0 &&
        pr.height > 0 &&
        lastPointerX >= pr.left - 1 &&
        lastPointerX <= pr.right + 1 &&
        lastPointerY >= pr.top - 8 &&
        lastPointerY <= pr.bottom + 12
      ) {
        return true;
      }
    }
    return false;
  }

  function scheduleMultiHoverClose() {
    if (multiLeaveTimer) {
      clearTimeout(multiLeaveTimer);
    }
    multiLeaveTimer = setTimeout(() => {
      multiLeaveTimer = null;
      if (disposed || multiPinned || !multiOpen) return;
      let nativeHover = false;
      try {
        nativeHover = Boolean(
          multiBtn.matches?.(':hover') || multiPanelEl.matches?.(':hover')
        );
      } catch {
        nativeHover = false;
      }
      if (nativeHover || isPointerInMultiZone()) {
        return;
      }
      setMultiOpen(false);
    }, 90);
  }

  function bindMultiElapsedTimer(timerKey, sig, rawStartMs, targetEl) {
    const now = Date.now();
    const prev = multiTimersMap.get(timerKey);
    let startMs = prev?.startMs || 0;
    if (!prev || prev.sig !== sig) {
      const validRaw = Number(rawStartMs || 0);
      startMs = validRaw > 0 && validRaw <= now + 2000 ? validRaw : now;
    } else if (startMs <= 0 && Number(rawStartMs) > 0 && Number(rawStartMs) <= now + 2000) {
      startMs = Number(rawStartMs);
    }
    multiTimersMap.set(timerKey, { sig, startMs, el: targetEl });
    const elapsedSec = Math.max(0, (now - startMs) / 1000);
    patchText(targetEl, formatElapsedSec(elapsedSec));
  }

  function tickMultiElapsedDisplay() {
    const now = Date.now();
    for (const entry of multiTimersMap.values()) {
      if (!entry?.el) continue;
      const elapsedSec = entry.startMs > 0 ? Math.max(0, (now - entry.startMs) / 1000) : 0;
      patchText(entry.el, formatElapsedSec(elapsedSec));
    }
  }

  function stopMultiLiveTicker() {
    if (multiLiveTickTimer) {
      clearInterval(multiLiveTickTimer);
      multiLiveTickTimer = null;
    }
    multiTimersMap.clear();
  }

  function ensureMultiLiveTicker() {
    if (multiTimersMap.size === 0) {
      stopMultiLiveTicker();
      return;
    }
    if (!multiLiveTickTimer) {
      multiLiveTickTimer = setInterval(tickMultiElapsedDisplay, 1000);
    }
  }

  function inspectSessionInMonitor(cascadeId) {
    if (!cascadeId || cascadeId === 'current') return;
    uiStore.setState({
      activeView: 'overview',
      selectedAgentScope: 'all',
      ctxInspectorAgentId: 'auto',
    });
    telemetryStore.setState({ selectedConversationId: cascadeId });
    void fetchTelemetry({ force: false });
    setMultiOpen(false);
    setPopoverOpen(true);
  }

  // --- 1. 创建顶栏/输入框双胶囊 Shadow Host（左：多会话实时信息；右：单会话指标胶囊） ---
  const capsuleHost = document.createElement('div');
  capsuleHost.id = CAPSULE_HOST_ID;
  capsuleHost.className = 'wm-capsule-host';
  capsuleHost.setAttribute('data-dock', 'fixed');
  capsuleHost.setAttribute('data-layout', layoutMode);
  // 隔离冒泡事件，防止嵌入输入框工具栏时点击或回车误触外层编辑框聚焦或表单提交
  capsuleHost.addEventListener?.('mousedown', (e) => e.stopPropagation?.());
  capsuleHost.addEventListener?.('click', (e) => e.stopPropagation?.());
  capsuleHost.addEventListener?.('keydown', (e) => {
    if (e?.key !== 'Escape') {
      e.stopPropagation?.();
    }
  });
  const capsuleShadow = capsuleHost.attachShadow({ mode: 'open' });

  const capsuleStyleEl = document.createElement('style');
  capsuleStyleEl.textContent = stylesCss;
  capsuleShadow.appendChild(capsuleStyleEl);

  // 左侧无边框多会话实时触发按钮（固定预占宽度，不随运行数跳动）
  const multiDot = h('span', { className: 'wm-multi-dot' });
  const multiLabel = h('span', { className: 'wm-multi-label', text: '0 运行中' });
  const multiBtn = h(
    'button',
    {
      type: 'button',
      className: 'wm-multi-btn',
      'aria-label': '多会话实时信息',
      'aria-expanded': 'false',
      onClick: (e) => {
        e.stopPropagation();
        if (multiOpen && multiPinned) {
          setMultiOpen(false);
        } else {
          setMultiOpen(true, { pinned: true });
        }
      },
      onContextmenu: (e) => {
        e.preventDefault();
        e.stopPropagation();
        void fetchTelemetry({ force: true });
      },
      onMouseenter: (e) => {
        recordPointerCoords(e);
        if (multiLeaveTimer) {
          clearTimeout(multiLeaveTimer);
          multiLeaveTimer = null;
        }
        if (!popoverOpen && !multiPinned) {
          setMultiOpen(true, { pinned: false });
        }
      },
      onMouseleave: (e) => {
        recordPointerCoords(e);
        if (!multiPinned) {
          scheduleMultiHoverClose();
        }
      },
    },
    [multiDot, multiLabel]
  );

  // 构建可复用的预占胶囊槽位节点（仅当槽位配置为 context 时挂载环形 SVG，运行期仅就地更新文本与属性）
  function createCapsuleSlot(slotIndex, initialMetric) {
    const ringSvg = document.createElementNS(SVG_NS, 'svg');
    ringSvg.setAttribute('viewBox', '0 0 14 14');
    ringSvg.setAttribute('class', 'wm-ring-svg');
    ringSvg.setAttribute('aria-hidden', 'true');

    const ringTrack = document.createElementNS(SVG_NS, 'circle');
    ringTrack.setAttribute('cx', '7');
    ringTrack.setAttribute('cy', '7');
    ringTrack.setAttribute('r', String(RING_RADIUS));
    ringTrack.setAttribute('class', 'wm-ring-track');

    const ringFill = document.createElementNS(SVG_NS, 'circle');
    ringFill.setAttribute('cx', '7');
    ringFill.setAttribute('cy', '7');
    ringFill.setAttribute('r', String(RING_RADIUS));
    ringFill.setAttribute('class', 'wm-ring-fill');
    ringFill.setAttribute('stroke-dasharray', String(RING_CIRCUMFERENCE));
    ringFill.setAttribute('stroke-dashoffset', String(RING_CIRCUMFERENCE));

    ringSvg.appendChild(ringTrack);
    ringSvg.appendChild(ringFill);

    const isCtx = initialMetric === 'context';
    const textSpan = h('span', {
      className: isCtx ? 'wm-slot-text wm-ctx-pct' : 'wm-slot-text',
      text: isCtx ? '--%' : initialMetric === 'tps' ? '-- t/s' : '余 --%',
    });
    const el = h(
      'span',
      {
        className: isCtx
          ? 'wm-cap-slot wm-ctx-seg'
          : initialMetric === 'tps'
            ? 'wm-cap-slot wm-seg-speed'
            : 'wm-cap-slot wm-seg-quota',
        'data-slot-idx': String(slotIndex),
        'data-metric': initialMetric,
        'data-vis-rank': String(slotIndex + 1),
      },
      isCtx ? [ringSvg, textSpan] : [textSpan]
    );

    return {
      el,
      ringSvg,
      ringFill,
      textSpan,
      ringMounted: isCtx,
    };
  }

  const capsuleSlots = [
    createCapsuleSlot(0, 'context'),
    createCapsuleSlot(1, 'tps'),
    createCapsuleSlot(2, 'quota_auto'),
  ];
  const sep0 = h('span', { className: 'wm-sep wm-sep-speed', 'data-sep-for-rank': '2' });
  const sep1 = h('span', { className: 'wm-sep wm-sep-quota', 'data-sep-for-rank': '3' });
  let lastShowMulti = true;
  let lastShowUpdate = false;
  let isTopbarUpdating = false;

  const updateDot = h('span', { className: 'wm-update-dot', hidden: true });
  const topbarUpdateIcon = createSvgIcon('arrow-down', { size: 10 });
  const topbarUpdateLabel = h('span', { className: 'wm-update-label', text: '新版本' });
  const topbarUpdateBtn = h(
    'button',
    {
      type: 'button',
      className: 'wm-update-btn',
      hidden: true,
      'aria-label': '发现新版本，点击更新',
      title: '发现新版本，点击立即更新',
      onClick: async (e) => {
        e.stopPropagation();
        if (isTopbarUpdating) return;
        isTopbarUpdating = true;
        patchClasses(topbarUpdateBtn, { 'is-updating': true });
        patchSvgIcon(topbarUpdateIcon, 'refresh');
        patchText(topbarUpdateLabel, '更新中…');
        patchAttr(topbarUpdateBtn, 'disabled', true);
        try {
          const res = await triggerPluginUpdate();
          if (!res?.ok) {
            uiStore.setState({ activeView: 'settings' });
            setPopoverOpen(true);
          }
        } catch {
          uiStore.setState({ activeView: 'settings' });
          setPopoverOpen(true);
        } finally {
          isTopbarUpdating = false;
          patchClasses(topbarUpdateBtn, { 'is-updating': false });
          patchSvgIcon(topbarUpdateIcon, 'arrow-down');
          patchAttr(topbarUpdateBtn, 'disabled', false);
          const cs = telemetryStore.getState().telemetry?.cloudStatus;
          patchText(
            topbarUpdateLabel,
            cs?.latestPluginVersion ? `v${cs.latestPluginVersion}` : '新版本'
          );
        }
      },
      onMouseenter: (e) => {
        recordPointerCoords(e);
        if (hoverLeaveTimer) {
          clearTimeout(hoverLeaveTimer);
          hoverLeaveTimer = null;
        }
        if (!popoverOpen && !multiPinned) {
          if (multiOpen) {
            setMultiOpen(false);
          }
          setTooltipOpen(true);
        }
      },
      onMouseleave: (e) => {
        recordPointerCoords(e);
        if (hoverLeaveTimer) {
          clearTimeout(hoverLeaveTimer);
        }
        hoverLeaveTimer = setTimeout(() => {
          hoverLeaveTimer = null;
          if (disposed || popoverOpen) return;
          let nativeHover = false;
          try {
            nativeHover = Boolean(
              capsuleBtn.matches?.(':hover') || topbarUpdateBtn.matches?.(':hover')
            );
          } catch {
            nativeHover = false;
          }
          if (nativeHover || isPointerStillInCapsule()) {
            return;
          }
          setTooltipOpen(false);
        }, 40);
      },
    },
    [topbarUpdateIcon, topbarUpdateLabel]
  );

  const capsuleBtn = h(
    'button',
    {
      type: 'button',
      className: 'wm-capsule-btn',
      'aria-label': '用量与速度监控',
      'aria-expanded': 'false',
      onClick: (e) => {
        e.stopPropagation();
        setPopoverOpen(!popoverOpen);
      },
      onContextmenu: (e) => {
        e.preventDefault();
        e.stopPropagation();
        void fetchTelemetry({ force: true });
      },
      onMouseenter: (e) => {
        recordPointerCoords(e);
        if (hoverLeaveTimer) {
          clearTimeout(hoverLeaveTimer);
          hoverLeaveTimer = null;
        }
        if (!popoverOpen && !multiPinned) {
          if (multiOpen) {
            setMultiOpen(false);
          }
          setTooltipOpen(true);
        }
      },
      onMouseleave: (e) => {
        recordPointerCoords(e);
        if (hoverLeaveTimer) {
          clearTimeout(hoverLeaveTimer);
        }
        hoverLeaveTimer = setTimeout(() => {
          hoverLeaveTimer = null;
          if (disposed || popoverOpen) return;
          let nativeHover = false;
          try {
            nativeHover = Boolean(
              capsuleBtn.matches?.(':hover') || topbarUpdateBtn.matches?.(':hover')
            );
          } catch {
            nativeHover = false;
          }
          if (nativeHover || isPointerStillInCapsule()) {
            return;
          }
          setTooltipOpen(false);
        }, 40);
      },
    },
    [capsuleSlots[0].el, sep0, capsuleSlots[1].el, sep1, capsuleSlots[2].el, updateDot]
  );
  capsuleShadow.appendChild(multiBtn);
  capsuleShadow.appendChild(capsuleBtn);
  capsuleShadow.appendChild(topbarUpdateBtn);

  // --- 2. 创建 Body 顶层浮层 Portal Shadow Host ---
  const portalHost = document.createElement('div');
  portalHost.id = PORTAL_HOST_ID;
  portalHost.className = 'wm-portal-host';
  const portalShadow = portalHost.attachShadow({ mode: 'open' });

  const portalStyleEl = document.createElement('style');
  portalStyleEl.textContent = stylesCss;
  portalShadow.appendChild(portalStyleEl);

  // 悬停全景概览浮层（复用实时概览三卡片架构：4格测速矩阵 + 10通道上下文窗口 + 动态配额池，全槽位预占）
  const hoverTpsVal = h('strong', { className: 'cell-value accent-speed', text: '—' });
  const hoverTpsSub = h('span', { className: 'cell-sub', text: '模型未知' });
  const hoverPulseDot = createSvgIcon('dot', { size: 10 });

  const hoverTtftVal = h('strong', { className: 'cell-value', text: '—' });
  const hoverTtftSub = h('span', { className: 'cell-sub', text: '均值 —' });

  const hoverAvgVal = h('strong', { className: 'cell-value', text: '—' });
  const hoverAvgSub = h('span', { className: 'cell-sub', text: '有效 0/0 步' });

  const hoverCostVal = h('strong', { className: 'cell-value', text: '—' });
  const hoverCacheSub = h('span', { className: 'cell-sub accent-ok', text: '缓存 0% · 累计 $0.00' });

  const hoverMatrixEl = h('section', { className: 'telemetry-matrix', 'aria-label': '实时指标' }, [
    h('div', { className: 'matrix-cell' }, [
      h('div', { className: 'cell-label' }, [h('span', { text: '输出速度' }), hoverPulseDot]),
      hoverTpsVal,
      hoverTpsSub,
    ]),
    h('div', { className: 'matrix-cell' }, [
      h('div', { className: 'cell-label' }, [
        h('span', { text: '首字延迟' }),
        createSvgIcon('clock', { size: 11 }),
      ]),
      hoverTtftVal,
      hoverTtftSub,
    ]),
    h('div', { className: 'matrix-cell' }, [
      h('div', { className: 'cell-label' }, [
        h('span', { text: '平均速度' }),
        createSvgIcon('pulse', { size: 11 }),
      ]),
      hoverAvgVal,
      hoverAvgSub,
    ]),
    h('div', { className: 'matrix-cell' }, [
      h('div', { className: 'cell-label' }, [
        h('span', { text: '本次费用' }),
        createSvgIcon('bolt', { size: 11 }),
      ]),
      hoverCostVal,
      hoverCacheSub,
    ]),
  ]);

  const hoverCtxAgentBadge = h('span', {
    className: 'agent-badge badge-main',
    hidden: true,
    text: '主代理',
  });
  const hoverCtxSummaryText = h('span', { className: 'text-mono', text: '0 / 256.0k (0%)' });
  const hoverCtxSegmentBar = ContextSegmentMeter({ context: {} });

  // 固定预占 10 个双列图例槽位，排序时仅就地替换色块类名与文本，不调用 appendChild 移动节点
  const hoverLegendSlots = CTX_CHANNEL_DEFS.map((ch) => {
    const swatchEl = h('span', { className: `swatch ${ch.segClass}` });
    const labelEl = h('span', { text: ch.label });
    const valEl = h('strong', { className: 'text-mono', text: '0' });
    const itemEl = h('div', { className: 'legend-item' }, [
      h('span', { className: 'legend-left' }, [swatchEl, labelEl]),
      valEl,
    ]);
    return { itemEl, swatchEl, labelEl, valEl };
  });

  const hoverCtxLegendGrid = h(
    'div',
    { className: 'ctx-legend-grid' },
    hoverLegendSlots.map((slot) => slot.itemEl)
  );

  const hoverCtxPanel = h('section', { className: 'panel' }, [
    h('div', { className: 'panel-header' }, [
      h('span', { className: 'panel-title' }, [
        createSvgIcon('layers', { size: 13 }),
        h('span', { text: '上下文窗口' }),
        hoverCtxAgentBadge,
      ]),
      h('span', { className: 'panel-meta' }, [hoverCtxSummaryText]),
    ]),
    hoverCtxSegmentBar.el,
    hoverCtxLegendGrid,
  ]);

  const hoverTierBadge = h('span', { className: 'panel-meta', text: 'Google AI · Pro' });
  const hoverPoolsListEl = h('div', { className: 'wm-hover-quota-pools' });
  patchKeyedList(
    hoverPoolsListEl,
    buildQuotaPoolItems(null, 0, { isPending: true }),
    {
      keyFn: (item) => item.key,
      sigFn: quotaPoolRowSig,
      createRow: createPoolQuotaRow,
      updateRow: syncPoolQuotaRow,
    }
  );
  const hoverWkFootLeft = h('span', { className: 'text-muted', text: '周期累计: 0 ($0.00)' });
  const hoverWkFootRight = h('span', { className: 'text-muted', text: '周期调用: 0 次' });

  const hoverQuotaPanel = h('section', { className: 'panel' }, [
    h('div', { className: 'panel-header' }, [
      h('span', { className: 'panel-title' }, [
        createSvgIcon('pulse', { size: 13 }),
        h('span', { text: '可用额度' }),
      ]),
      hoverTierBadge,
    ]),
    hoverPoolsListEl,
    h('div', { className: 'panel-header wm-hover-quota-foot' }, [
      hoverWkFootLeft,
      hoverWkFootRight,
    ]),
  ]);

  const hoverUpdateVerText = h('span', { text: '发现新版本' });
  const hoverUpdateHintText = h('span', {
    className: 'wm-hover-update-hint',
    text: '点击顶栏版本胶囊即可一键更新',
  });
  const hoverUpdateBar = h(
    'div',
    {
      className: 'wm-hover-update-bar',
      hidden: true,
    },
    [
      h('span', { className: 'wm-hover-update-left' }, [
        createSvgIcon('arrow-down', { size: 11 }),
        hoverUpdateVerText,
      ]),
      hoverUpdateHintText,
    ]
  );

  const hoverTipEl = h(
    'div',
    {
      className: 'wm-hover-tip',
      hidden: true,
    },
    [hoverUpdateBar, hoverMatrixEl, hoverCtxPanel, hoverQuotaPanel]
  );

  // 左侧多会话实时看板浮层（活跃运行会话卡片 + 近期多窗口会话速览，全槽位预占、就地补丁更新）
  function createMultiLiveSubRow() {
    const subBadge = h('span', { className: 'agent-badge badge-sub-1', text: '子1' });
    const subRole = h('span', { className: 'live-sub-role', text: '子代理' });
    const subSummary = h('span', { className: 'live-sub-summary', text: '' });
    const subElapsed = h('span', { className: 'live-sub-elapsed text-mono', text: '0s' });
    const rowEl = h('div', { className: 'live-sub-row' }, [
      h('div', { className: 'live-sub-left' }, [subBadge, subRole, subSummary]),
      subElapsed,
    ]);
    return {
      el: rowEl,
      refs: { rowEl, subBadge, subRole, subSummary, subElapsed },
    };
  }

  function createMultiLiveTaskCard() {
    const dotIcon = createSvgIcon('dot', { size: 11 });
    patchClasses(dotIcon, { 'is-pulsing': true });
    const dotWrap = h('span', { className: 'live-activity-dot' }, [dotIcon]);
    const titleEl = h('strong', { className: 'live-task-title', text: '当前会话' });
    const hereTagEl = h('span', {
      className: 'wm-session-tag is-here',
      hidden: true,
      text: '本窗',
    });
    const metricsEl = h('span', {
      className: 'wm-task-metrics text-mono',
      hidden: true,
      text: '',
    });
    const subToggleBtn = h('button', {
      type: 'button',
      className: 'live-sub-toggle',
      hidden: true,
      text: '子代理 (0) ▸',
    });
    const elapsedEl = h('span', {
      className: 'live-activity-elapsed text-mono',
      text: '0s',
    });

    const headerEl = h('div', { className: 'live-task-header' }, [
      h('div', { className: 'live-task-title-wrap' }, [dotWrap, titleEl, hereTagEl]),
      h('div', { className: 'live-task-header-right' }, [metricsEl, subToggleBtn, elapsedEl]),
    ]);

    const mainBadge = h('span', {
      className: 'agent-badge badge-main',
      hidden: true,
      text: '主',
    });
    const mainPhase = h('strong', { className: 'live-activity-phase', text: '推理中' });
    const mainProgress = h('span', {
      className: 'live-activity-progress text-mono',
      hidden: true,
      text: '',
    });
    const mainSep = h('span', { className: 'live-activity-sep', hidden: true, text: '·' });
    const mainDetail = h('span', {
      className: 'live-activity-detail',
      hidden: true,
      text: '',
    });

    const mainRowEl = h('div', { className: 'live-task-main-row' }, [
      mainBadge,
      mainPhase,
      mainProgress,
      mainSep,
      mainDetail,
    ]);

    const subListEl = h('div', { className: 'live-sub-list', hidden: true });
    const cardEl = h('div', { className: 'live-task-card' }, [headerEl, mainRowEl, subListEl]);

    return {
      el: cardEl,
      refs: {
        cardEl,
        dotIcon,
        titleEl,
        hereTagEl,
        metricsEl,
        subToggleBtn,
        elapsedEl,
        mainBadge,
        mainPhase,
        mainProgress,
        mainSep,
        mainDetail,
        subListEl,
      },
    };
  }

  const multiPinBadge = h('span', { className: 'wm-pin-badge', hidden: true, text: '已固定' });
  const multiRunningMetaEl = h('span', { className: 'panel-meta text-mono', text: '读取中...' });
  const multiEmptyEl = h('div', { className: 'wm-multi-empty' }, [
    h('span', { className: 'wm-multi-empty-left' }, [
      h('span', { className: 'wm-idle-dot' }),
      h('span', { text: '当前暂无在线运行的会话' }),
    ]),
  ]);
  const multiRunningListEl = h('div', {
    className: 'live-activity-list',
    hidden: true,
    'aria-live': 'polite',
  });

  const multiHeaderEl = h('div', { className: 'panel-header wm-multi-header' }, [
    h('span', { className: 'panel-title' }, [
      createSvgIcon('pulse', { size: 13 }),
      h('span', { text: '实时运行会话' }),
      multiPinBadge,
    ]),
    multiRunningMetaEl,
  ]);

  const multiPanelEl = h(
    'div',
    {
      className: 'wm-multi-panel',
      role: 'dialog',
      'aria-label': '多会话实时信息面板',
      hidden: true,
      onMouseenter: (e) => {
        recordPointerCoords(e);
        if (multiLeaveTimer) {
          clearTimeout(multiLeaveTimer);
          multiLeaveTimer = null;
        }
      },
      onMouseleave: (e) => {
        recordPointerCoords(e);
        if (!multiPinned) {
          scheduleMultiHoverClose();
        }
      },
    },
    [multiHeaderEl, multiEmptyEl, multiRunningListEl]
  );

  // 完整四标签悬浮容器
  const appInstance = App();
  const popoverEl = h(
    'div',
    {
      className: 'wm-popover-panel',
      role: 'dialog',
      'aria-label': '用量与速度监控面板',
      hidden: true,
    },
    [appInstance.el]
  );

  portalShadow.appendChild(multiPanelEl);
  portalShadow.appendChild(hoverTipEl);
  portalShadow.appendChild(popoverEl);
  (document.body || document.documentElement).appendChild(portalHost);

  // --- 3. 几何测量、IDE 主题桥接、顶栏停靠与防溢出定位 ---
  let patchedActionToolbar = null;
  let patchedActionToolbarPrevMargin = '';
  let observedWorkbench = null;
  let themeObserver = null;
  const mirroredThemeVars = new Map();

  function restorePatchedActionToolbar() {
    if (!patchedActionToolbar) return;
    try {
      if (patchedActionToolbar.style) {
        patchedActionToolbar.style.marginLeft = patchedActionToolbarPrevMargin;
      }
    } catch {
      // 忽略还原宿主工具栏边距异常
    }
    patchedActionToolbar = null;
    patchedActionToolbarPrevMargin = '';
  }

  function syncWorkbenchThemeVars() {
    if (disposed) return null;
    try {
      if (
        typeof document === 'undefined' ||
        typeof document.querySelector !== 'function' ||
        typeof window.getComputedStyle !== 'function'
      ) {
        return null;
      }
      const workbenchEl = document.querySelector('.monaco-workbench');
      const rootCs = document.documentElement
        ? window.getComputedStyle(document.documentElement)
        : null;
      const bodyCs = document.body ? window.getComputedStyle(document.body) : null;
      const nativeRootBg = String(
        rootCs?.getPropertyValue?.('--background') ||
          bodyCs?.getPropertyValue?.('--background') ||
          ''
      ).trim();
      if (nativeRootBg) {
        if (mirroredThemeVars.size > 0) {
          for (const k of mirroredThemeVars.keys()) {
            portalHost.style.removeProperty?.(k);
            capsuleHost.style.removeProperty?.(k);
          }
          mirroredThemeVars.clear();
        }
        return workbenchEl || document.documentElement || null;
      }

      const themeSourceEl = workbenchEl || document.documentElement || document.body;
      if (!themeSourceEl) return null;
      const wbCs = window.getComputedStyle(themeSourceEl);
      const pick = (...names) => {
        for (const name of names) {
          const val = String(wbCs?.getPropertyValue?.(name) || '').trim();
          if (val) return val;
        }
        return '';
      };

      const nextVars = [
        [
          '--background',
          pick('--vscode-sideBar-background', '--vscode-editor-background', '--vscode-panel-background'),
        ],
        [
          '--card',
          pick(
            '--vscode-editorWidget-background',
            '--vscode-sideBar-background',
            '--vscode-editor-background'
          ),
        ],
        ['--foreground', pick('--vscode-foreground', '--vscode-editor-foreground')],
        [
          '--muted-foreground',
          pick('--vscode-descriptionForeground', '--vscode-sideBarTitle-foreground'),
        ],
        [
          '--border',
          pick(
            '--vscode-widget-border',
            '--vscode-panel-border',
            '--vscode-commandCenter-border',
            '--vscode-contrastBorder'
          ),
        ],
        [
          '--primary',
          pick('--vscode-textLink-foreground', '--vscode-button-background', '--vscode-focusBorder'),
        ],
        ['--destructive', pick('--vscode-errorForeground', '--vscode-editorError-foreground')],
      ];

      for (const [cssVar, val] of nextVars) {
        const prevVal = mirroredThemeVars.get(cssVar) || '';
        if (val) {
          if (prevVal !== val) {
            portalHost.style.setProperty?.(cssVar, val);
            capsuleHost.style.setProperty?.(cssVar, val);
            mirroredThemeVars.set(cssVar, val);
          }
        } else if (prevVal) {
          if (typeof portalHost.style.removeProperty === 'function') {
            portalHost.style.removeProperty(cssVar);
          } else {
            portalHost.style.setProperty?.(cssVar, '');
          }
          if (typeof capsuleHost.style.removeProperty === 'function') {
            capsuleHost.style.removeProperty(cssVar);
          } else {
            capsuleHost.style.setProperty?.(cssVar, '');
          }
          mirroredThemeVars.delete(cssVar);
        }
      }
      return themeSourceEl;
    } catch {
      return null;
    }
  }

  function ensureWorkbenchThemeObserved() {
    const wb = syncWorkbenchThemeVars();
    if (wb && wb !== observedWorkbench && themeObserver) {
      observedWorkbench = wb;
      try {
        themeObserver.observe(wb, { attributes: true, attributeFilter: ['class', 'style'] });
      } catch {
        // 忽略工作台属性观察异常
      }
    }
  }

  function resolveRuntimeDockTarget() {
    return resolveActiveDockTarget({
      capsuleNode: capsuleHost,
      portalNode: portalHost,
      patchedNode: patchedActionToolbar,
    });
  }

  function isDockPlacementSynced(dock) {
    const curDockAttr = capsuleHost.getAttribute('data-dock');
    if (!capsuleHost.isConnected || !portalHost.isConnected) return false;
    if (!dock) {
      if (isIdeExtensionChatFrame()) {
        return curDockAttr === 'pending-composer' && capsuleHost.style.display === 'none';
      }
      return curDockAttr === 'fixed';
    }
    if (capsuleHost.style.display === 'none') return false;
    if (!dock.targetContainer?.contains?.(capsuleHost) || curDockAttr !== dock.kind) return false;
    if (dock.kind === 'composer') {
      if (dock.anchorNode) {
        if (!isImmediatelyBeforeNode(capsuleHost, dock.anchorNode)) return false;
      } else {
        const lastEl =
          dock.targetContainer.lastElementChild !== undefined
            ? dock.targetContainer.lastElementChild
            : dock.targetContainer.children?.[dock.targetContainer.children.length - 1] ||
              dock.targetContainer.lastChild;
        if (lastEl !== capsuleHost) return false;
      }
    }
    return true;
  }

  function updateFixedFallbackPosition() {
    const dockMode = capsuleHost.getAttribute('data-dock');
    if (dockMode === 'flow' || dockMode === 'ide-titlebar' || dockMode === 'composer') {
      capsuleHost.style.top = '';
      capsuleHost.style.right = '';
      return;
    }
    try {
      const vw = Number(window.innerWidth || 1280);
      let rightOffset = 144;
      const anchor = findNativeTopRightAnchor();
      if (anchor?.getBoundingClientRect) {
        const r = anchor.getBoundingClientRect();
        if (r.width > 0 && r.left > 0 && r.left < vw) {
          rightOffset = Math.max(144, Math.ceil(vw - r.left + 6));
        }
      }
      capsuleHost.style.top = '7px';
      capsuleHost.style.right = `${rightOffset}px`;
    } catch {
      // 忽略回退坐标计算异常
    }
  }

  function measureAvailableTitlebarWidth(dockTarget) {
    try {
      const titlebar = dockTarget?.titlebar || null;
      if (dockTarget?.kind === 'composer' && titlebar?.getBoundingClientRect) {
        const cRect = titlebar.getBoundingClientRect();
        const aRect = dockTarget.anchorNode?.getBoundingClientRect?.();
        if (cRect.width > 0) {
          const leftEdge =
            Number.isFinite(dockTarget.leftClusterRightEdge) &&
            dockTarget.leftClusterRightEdge > cRect.left + 12
              ? dockTarget.leftClusterRightEdge
              : cRect.left + 12;
          const leftOccupied = Math.max(12, leftEdge - cRect.left);
          if (aRect && aRect.width > 0) {
            const rightOccupied = Math.max(aRect.width + 8, cRect.right - aRect.left);
            return cRect.width - leftOccupied - rightOccupied - 16;
          }
          if (!dockTarget.anchorNode) {
            return cRect.width - leftOccupied - 28;
          }
        }
      }

      if (dockTarget?.kind === 'ide-titlebar' && titlebar?.getBoundingClientRect) {
        const tbRect = titlebar.getBoundingClientRect();
        if (tbRect.width > 0) {
          let leftContentWidth = 12;
          const leftGroup =
            titlebar.querySelector?.(':scope > .titlebar-left') ||
            titlebar.querySelector?.('.titlebar-left');
          if (leftGroup) {
            let leftSum = 0;
            if (typeof window.getComputedStyle === 'function') {
              leftSum += parseFloat(window.getComputedStyle(leftGroup).paddingLeft) || 0;
            }
            if (leftGroup.children) {
              for (const child of leftGroup.children) {
                if (child?.getBoundingClientRect) {
                  leftSum += Math.max(0, child.getBoundingClientRect().width);
                }
              }
            }
            leftContentWidth = Math.min(Math.round(tbRect.width * 0.45), Math.max(12, leftSum));
          }

          let minCenterWidth = 0;
          const centerGroup =
            titlebar.querySelector?.(':scope > .titlebar-center') ||
            titlebar.querySelector?.('.titlebar-center');
          if (centerGroup?.getBoundingClientRect) {
            const cr = centerGroup.getBoundingClientRect();
            if (cr.width > 0 && cr.height > 0) {
              minCenterWidth = Math.min(220, Math.ceil(cr.width));
            }
          }

          let rightSiblingsWidth = 0;
          let hasVisibleWindowControls = false;
          const rightGroup = dockTarget.targetContainer;
          if (rightGroup?.children) {
            for (const child of rightGroup.children) {
              if (child === capsuleHost || !child?.getBoundingClientRect) continue;
              const cw = Math.max(0, child.getBoundingClientRect().width);
              rightSiblingsWidth += cw;
              if (cw > 0 && child.classList?.contains?.('window-controls-container')) {
                hasVisibleWindowControls = true;
              }
            }
          }
          if (!hasVisibleWindowControls && navigator?.windowControlsOverlay?.visible) {
            const wcoRect = navigator.windowControlsOverlay.getTitlebarAreaRect?.();
            if (wcoRect && wcoRect.width > 0 && tbRect.right > wcoRect.right + 4) {
              rightSiblingsWidth += tbRect.right - wcoRect.right;
            }
          }

          return tbRect.width - leftContentWidth - minCenterWidth - rightSiblingsWidth - 28;
        }
      }

      if (titlebar?.getBoundingClientRect) {
        const tbRect = titlebar.getBoundingClientRect();
        if (tbRect.width > 0) {
          const titleEl = titlebar.firstElementChild;
          const titleInner = titleEl?.firstElementChild;
          const contentStart = titleInner?.getBoundingClientRect
            ? Math.max(8, titleInner.getBoundingClientRect().left - tbRect.left)
            : tbRect.left < 168
              ? 168 - tbRect.left
              : 12;
          const minTitleWidth = 180;
          let siblingButtonsWidth = 64;
          let rightPad = 8;
          const rightGroup = capsuleHost.parentElement;
          if (rightGroup && rightGroup !== titlebar) {
            const auxOpen =
              typeof document.querySelector === 'function' &&
              Boolean(document.querySelector('[data-testid="aux-pane-sash"]'));
            const root =
              typeof document.querySelector === 'function'
                ? document.querySelector('div.h-screen.w-screen')
                : null;
            const rightClusterVar =
              root?.style?.getPropertyValue?.('--right-cluster-width')?.trim() || '';
            if (auxOpen) {
              rightPad = 8;
            } else if (rightClusterVar) {
              rightPad = Math.max(8, (parseFloat(rightClusterVar) || 44) - 4);
            } else if (typeof window.getComputedStyle === 'function') {
              rightPad = parseFloat(window.getComputedStyle(rightGroup).paddingRight) || 0;
            }
            if (rightGroup.children) {
              let sum = 0;
              for (const child of rightGroup.children) {
                if (child !== capsuleHost && child.getBoundingClientRect) {
                  sum += child.getBoundingClientRect().width;
                }
              }
              if (sum > 0) siblingButtonsWidth = sum + 8;
            }
          }
          return tbRect.width - contentStart - minTitleWidth - rightPad - siblingButtonsWidth;
        }
      }
      if (window.innerWidth) {
        return window.innerWidth - 360;
      }
    } catch {
      // 忽略测量异常
    }
    return 320;
  }

  function positionFloatingElements() {
    if (disposed || !capsuleBtn.getBoundingClientRect) return;
    try {
      const bRect = capsuleBtn.getBoundingClientRect();
      if (bRect.width === 0 && bRect.height === 0) return;
      const vw = Number(window.innerWidth || 1280);
      const vh = Number(window.innerHeight || 800);
      const navRight = getLeftSidebarRightEdge(vw);
      const minLeft = navRight > 0 ? Math.max(12, navRight + 12) : 12;
      const defaultCardW = Math.min(FLOATING_CARD_WIDTH, Math.max(280, vw - 24));
      const defaultMultiW = Math.min(MULTI_PANEL_WIDTH, Math.max(280, vw - 24));
      const isDockComposer = capsuleHost.getAttribute('data-dock') === 'composer';

      if (multiOpen) {
        const mRect = multiBtn.getBoundingClientRect?.() || bRect;
        const anchorRect = mRect.width > 0 || mRect.height > 0 ? mRect : bRect;
        const rawW =
          Number(multiPanelEl.offsetWidth) ||
          Number(multiPanelEl.getBoundingClientRect?.().width) ||
          defaultMultiW;
        const panelW = Math.min(rawW, Math.max(280, vw - minLeft - 12));
        const panelH =
          Number(multiPanelEl.offsetHeight) ||
          Number(multiPanelEl.getBoundingClientRect?.().height) ||
          320;
        const spaceBelowMulti = vh - anchorRect.bottom - 12;
        const spaceAboveMulti = anchorRect.top - 16;
        const openMultiAbove =
          (isDockComposer && spaceAboveMulti > spaceBelowMulti) ||
          (anchorRect.bottom + 6 + panelH > vh - 8 && spaceAboveMulti > spaceBelowMulti);

        let top;
        let maxMultiH;
        if (openMultiAbove) {
          maxMultiH = Math.max(180, Math.floor(anchorRect.top - 20));
          multiPanelEl.style.maxHeight = `${maxMultiH}px`;
          const effMultiH = Math.min(Number(multiPanelEl.offsetHeight) || panelH, maxMultiH);
          top = Math.max(12, Math.round(anchorRect.top - effMultiH - 8));
        } else {
          top = Math.max(38, Math.round(anchorRect.bottom + 6));
          maxMultiH = Math.max(240, vh - top - 12);
          multiPanelEl.style.maxHeight = `${maxMultiH}px`;
        }
        patchClasses(multiPanelEl, { 'is-above': openMultiAbove });
        let left = Math.round(anchorRect.left);
        left = Math.min(left, vw - panelW - 12);
        left = Math.max(minLeft, left);
        multiPanelEl.style.top = `${top}px`;
        multiPanelEl.style.left = `${left}px`;
      }

      const rightAnchorEdge =
        !topbarUpdateBtn.hasAttribute('hidden') && topbarUpdateBtn.getBoundingClientRect
          ? Math.max(bRect.right, topbarUpdateBtn.getBoundingClientRect().right || 0)
          : bRect.right;

      if (popoverOpen) {
        const rawW =
          Number(popoverEl.offsetWidth) ||
          Number(popoverEl.getBoundingClientRect?.().width) ||
          defaultCardW;
        const panelW = Math.min(rawW, Math.max(280, vw - minLeft - 12));
        const spaceBelowPop = vh - bRect.bottom - 12;
        const spaceAbovePop = bRect.top - 16;
        const openPopAbove =
          (isDockComposer && spaceAbovePop > spaceBelowPop) ||
          (spaceBelowPop < 360 && spaceAbovePop > spaceBelowPop);

        let top;
        if (openPopAbove) {
          const maxPopH = Math.max(240, Math.floor(bRect.top - 20));
          const targetPopH = Math.min(588, maxPopH);
          popoverEl.style.height = `${targetPopH}px`;
          popoverEl.style.maxHeight = `${maxPopH}px`;
          const actualPopH = Math.min(Number(popoverEl.offsetHeight) || targetPopH, maxPopH);
          top = Math.max(12, Math.round(bRect.top - actualPopH - 8));
        } else {
          popoverEl.style.height = '';
          top = Math.max(38, Math.min(vh - 140, Math.round(bRect.bottom + 6)));
          popoverEl.style.maxHeight = `${Math.max(240, vh - top - 12)}px`;
        }
        patchClasses(popoverEl, { 'is-above': openPopAbove });
        let left = Math.round(rightAnchorEdge - panelW);
        left = Math.min(left, vw - panelW - 12);
        left = Math.max(minLeft, left);
        popoverEl.style.top = `${top}px`;
        popoverEl.style.left = `${left}px`;
      }

      if (tooltipOpen && !popoverOpen && !multiOpen) {
        const rawW =
          Number(hoverTipEl.offsetWidth) ||
          Number(hoverTipEl.getBoundingClientRect?.().width) ||
          defaultCardW;
        const tipW = Math.min(rawW, Math.max(280, vw - minLeft - 12));
        const tipH =
          Number(hoverTipEl.offsetHeight) ||
          Number(hoverTipEl.getBoundingClientRect?.().height) ||
          480;
        const spaceBelowTip = vh - bRect.bottom - 12;
        const spaceAboveTip = bRect.top - 16;
        const openTipAbove =
          (isDockComposer && spaceAboveTip > spaceBelowTip) ||
          (bRect.bottom + 6 + tipH > vh - 8 && spaceAboveTip > spaceBelowTip);

        let top;
        if (openTipAbove) {
          const maxTipH = Math.max(220, Math.floor(bRect.top - 20));
          hoverTipEl.style.maxHeight = `${maxTipH}px`;
          const effTipH = Math.min(Number(hoverTipEl.offsetHeight) || tipH, maxTipH);
          top = Math.max(12, Math.round(bRect.top - effTipH - 8));
        } else {
          top = Math.max(38, Math.round(bRect.bottom + 6));
          hoverTipEl.style.maxHeight = `${Math.max(240, vh - top - 12)}px`;
        }
        patchClasses(hoverTipEl, { 'is-above': openTipAbove });
        let left = Math.round(rightAnchorEdge - tipW);
        left = Math.min(left, vw - tipW - 12);
        left = Math.max(minLeft, left);
        hoverTipEl.style.top = `${top}px`;
        hoverTipEl.style.left = `${left}px`;
      }
    } catch {
      // 忽略定位异常
    }
  }

  function updateResponsiveLayout(dockOverride = undefined) {
    if (disposed) return;
    const dockTarget = dockOverride === undefined ? resolveRuntimeDockTarget() : dockOverride;
    const avail = measureAvailableTitlebarWidth(dockTarget);
    const curTel = telemetryStore.getState().telemetry;
    const showMulti = curTel?.settings?.showTopbarMultiSession !== false;
    const curUpdateMode = normalizeClientUpdateMode(
      curTel?.settings?.pluginUpdateMode,
      curTel?.settings?.autoUpdatePlugin
    );
    const hasUpdate = Boolean(curTel?.cloudStatus?.updateAvailable) && curUpdateMode !== 'off';
    const nextMode = computeCapsuleLayoutMode(avail, layoutMode, { showMulti, hasUpdate });
    if (nextMode !== layoutMode) {
      layoutMode = nextMode;
      capsuleHost.setAttribute('data-layout', layoutMode);
    }
    if (capsuleHost.getAttribute('data-dock') === 'fixed') {
      updateFixedFallbackPosition();
    }
    if (popoverOpen || tooltipOpen || multiOpen) {
      positionFloatingElements();
    }
  }

  let resizeObserver = null;

  function ensureCapsuleDocked() {
    if (disposed) return false;
    const bodyOrDoc = document.body || document.documentElement;
    if (bodyOrDoc && !portalHost.isConnected) {
      bodyOrDoc.appendChild(portalHost);
    }
    ensureWorkbenchThemeObserved();

    const dockTarget = resolveRuntimeDockTarget();
    if (dockTarget) {
      if (capsuleHost.style.display === 'none') {
        capsuleHost.style.display = '';
      }
      const { kind, titlebar, targetContainer, actionToolbar } = dockTarget;
      if (kind === 'composer') {
        if (patchedActionToolbar !== actionToolbar) {
          restorePatchedActionToolbar();
          if (actionToolbar?.style) {
            patchedActionToolbar = actionToolbar;
            patchedActionToolbarPrevMargin = actionToolbar.style.marginLeft || '';
            actionToolbar.style.marginLeft = '0px';
          }
        }
        if (dockTarget.anchorNode) {
          if (
            (capsuleHost.parentElement || capsuleHost.parentNode) !== targetContainer ||
            !isImmediatelyBeforeNode(capsuleHost, dockTarget.anchorNode)
          ) {
            targetContainer.insertBefore(capsuleHost, dockTarget.anchorNode);
          }
        } else {
          const lastEl =
            targetContainer.lastElementChild !== undefined
              ? targetContainer.lastElementChild
              : targetContainer.children?.[targetContainer.children.length - 1] ||
                targetContainer.lastChild;
          if (
            (capsuleHost.parentElement || capsuleHost.parentNode) !== targetContainer ||
            lastEl !== capsuleHost
          ) {
            targetContainer.appendChild(capsuleHost);
          }
        }
        patchAttr(capsuleHost, 'data-dock', 'composer');
        patchAttr(
          capsuleHost,
          'data-composer-push',
          dockTarget.needsAutoMarginTransfer ? '1' : null
        );
      } else if (kind === 'ide-titlebar') {
        if (patchedActionToolbar !== actionToolbar) {
          restorePatchedActionToolbar();
          if (actionToolbar?.style) {
            patchedActionToolbar = actionToolbar;
            patchedActionToolbarPrevMargin = actionToolbar.style.marginLeft || '';
            actionToolbar.style.marginLeft = '0px';
          }
        }
        if (capsuleHost.parentElement !== targetContainer || targetContainer.firstChild !== capsuleHost) {
          if (targetContainer.firstChild) {
            targetContainer.insertBefore(capsuleHost, targetContainer.firstChild);
          } else {
            targetContainer.appendChild(capsuleHost);
          }
        }
        patchAttr(capsuleHost, 'data-dock', 'ide-titlebar');
        patchAttr(capsuleHost, 'data-composer-push', null);
      } else {
        restorePatchedActionToolbar();
        if (capsuleHost.parentElement !== targetContainer) {
          if (targetContainer.firstChild && targetContainer !== titlebar) {
            targetContainer.insertBefore(capsuleHost, targetContainer.firstChild);
          } else {
            targetContainer.appendChild(capsuleHost);
          }
        }
        patchAttr(capsuleHost, 'data-dock', 'flow');
        patchAttr(capsuleHost, 'data-composer-push', null);
      }
      if (capsuleHost.style.top) capsuleHost.style.top = '';
      if (capsuleHost.style.right) capsuleHost.style.right = '';

      if (observedTitlebar !== titlebar) {
        observedTitlebar = titlebar;
        try {
          if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver.observe(titlebar);
            if (document.body) resizeObserver.observe(document.body);
          }
        } catch {
          // 忽略观察器异常
        }
      }
    } else if (isIdeExtensionChatFrame()) {
      restorePatchedActionToolbar();
      if (popoverOpen) setPopoverOpen(false);
      if (multiOpen) setMultiOpen(false);
      if (tooltipOpen) setTooltipOpen(false);
      if (bodyOrDoc && (capsuleHost.parentElement || capsuleHost.parentNode) !== bodyOrDoc) {
        bodyOrDoc.appendChild(capsuleHost);
      }
      capsuleHost.style.display = 'none';
      patchAttr(capsuleHost, 'data-dock', 'pending-composer');
      patchAttr(capsuleHost, 'data-composer-push', null);
    } else if (bodyOrDoc) {
      if (capsuleHost.style.display === 'none') {
        capsuleHost.style.display = '';
      }
      restorePatchedActionToolbar();
      if (capsuleHost.parentElement !== bodyOrDoc) {
        bodyOrDoc.appendChild(capsuleHost);
      }
      patchAttr(capsuleHost, 'data-dock', 'fixed');
      patchAttr(capsuleHost, 'data-composer-push', null);
      updateFixedFallbackPosition();
    }

    updateResponsiveLayout(dockTarget);
    return Boolean(capsuleHost.isConnected && portalHost.isConnected);
  }

  function scheduleDockSync() {
    if (disposed) return;
    if (typeof requestAnimationFrame === 'function') {
      if (dockRafId) return;
      dockRafId = requestAnimationFrame(() => {
        dockRafId = 0;
        ensureCapsuleDocked();
      });
    } else {
      ensureCapsuleDocked();
    }
  }

  function refreshActiveViewScrollbars() {
    const activeView = uiStore.getState().activeView;
    const refs = appInstance.refs;
    if (activeView === 'overview') {
      refs?.overviewView?.refs?.viewScrollbar?.refresh();
    } else if (activeView === 'consumption') {
      refs?.consumptionView?.refs?.viewScrollbar?.refresh();
    } else if (activeView === 'steps') {
      refs?.stepsView?.refs?.stepsScroll?.refresh();
      refs?.stepsView?.refs?.modelsScroll?.refresh();
    } else if (activeView === 'settings') {
      refs?.settingsView?.refs?.viewScrollbar?.refresh();
    }
  }

  function setMultiOpen(nextOpen, { pinned = false, instant = false } = {}) {
    const targetOpen = Boolean(nextOpen);
    if (targetOpen && multiLeaveTimer) {
      clearTimeout(multiLeaveTimer);
      multiLeaveTimer = null;
    }
    if (targetOpen) {
      setTooltipOpen(false);
      if (pinned && popoverOpen) {
        setPopoverOpen(false);
      }
    }
    const nextPinned = targetOpen ? Boolean(pinned) : false;
    const stateChanged = multiOpen !== targetOpen || multiPinned !== nextPinned;
    multiOpen = targetOpen;
    multiPinned = nextPinned;
    patchClasses(multiBtn, { 'is-open': multiOpen && multiPinned });
    patchAttr(multiBtn, 'aria-expanded', multiOpen ? 'true' : 'false');
    patchAttr(multiPinBadge, 'hidden', !multiPinned);
    if (!stateChanged) return;
    patchClasses(multiPanelEl, { 'is-instant': Boolean(instant && multiOpen) });
    patchAttr(multiPanelEl, 'hidden', !multiOpen);
    if (multiOpen) {
      positionFloatingElements();
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => positionFloatingElements());
      }
    }
  }

  function setTooltipOpen(nextOpen, { instant = false } = {}) {
    const targetOpen = Boolean(nextOpen && !popoverOpen && !(multiOpen && multiPinned));
    if (targetOpen && hoverLeaveTimer) {
      clearTimeout(hoverLeaveTimer);
      hoverLeaveTimer = null;
    }
    if (targetOpen && multiOpen && !multiPinned) {
      setMultiOpen(false);
    }
    if (tooltipOpen === targetOpen) return;
    tooltipOpen = targetOpen;
    patchClasses(hoverTipEl, { 'is-instant': Boolean(instant && targetOpen) });
    patchAttr(hoverTipEl, 'hidden', !tooltipOpen);
    if (tooltipOpen) {
      positionFloatingElements();
    }
  }

  function setPopoverOpen(nextOpen, { instant = false } = {}) {
    const targetOpen = Boolean(nextOpen);
    if (targetOpen) {
      setTooltipOpen(false);
      if (multiOpen) {
        setMultiOpen(false);
      }
    }
    if (popoverOpen === targetOpen) return;
    popoverOpen = targetOpen;
    patchClasses(capsuleBtn, { 'is-open': popoverOpen });
    patchClasses(popoverEl, { 'is-instant': Boolean(instant && popoverOpen) });
    patchAttr(capsuleBtn, 'aria-expanded', popoverOpen ? 'true' : 'false');
    patchAttr(popoverEl, 'hidden', !popoverOpen);
    if (popoverOpen) {
      positionFloatingElements();
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => {
          positionFloatingElements();
          refreshActiveViewScrollbars();
        });
      } else {
        refreshActiveViewScrollbars();
      }
    }
  }

  function resolveCapsuleSlotPresentation(metricKey, slotCtx) {
    if (metricKey === 'none') {
      return {
        hidden: true,
        metric: 'none',
        segClass: 'wm-cap-slot',
        textClass: 'wm-slot-text',
        showRing: false,
        dashOffset: RING_CIRCUMFERENCE,
        text: '',
        running: false,
        warn: false,
        danger: false,
      };
    }

    if (metricKey === 'context') {
      if (!slotCtx.hasTelemetry) {
        return {
          hidden: false,
          metric: 'context',
          segClass: 'wm-cap-slot wm-ctx-seg',
          textClass: 'wm-slot-text wm-ctx-pct',
          showRing: true,
          dashOffset: RING_CIRCUMFERENCE,
          text: '--%',
          running: false,
          warn: false,
          danger: false,
        };
      }
      const isDanger = slotCtx.usedPct >= 88;
      const isWarn = !isDanger && slotCtx.usedPct >= 70;
      return {
        hidden: false,
        metric: 'context',
        segClass: 'wm-cap-slot wm-ctx-seg',
        textClass: 'wm-slot-text wm-ctx-pct',
        showRing: true,
        dashOffset: slotCtx.dashOffset,
        text: `${Math.round(slotCtx.usedPct)}%`,
        running: false,
        warn: isWarn,
        danger: isDanger,
      };
    }

    if (metricKey === 'tps') {
      if (!slotCtx.hasTelemetry) {
        return {
          hidden: false,
          metric: 'tps',
          segClass: 'wm-cap-slot wm-seg-speed',
          textClass: 'wm-slot-text wm-speed-text',
          showRing: false,
          dashOffset: RING_CIRCUMFERENCE,
          text: '-- t/s',
          running: false,
          warn: false,
          danger: false,
        };
      }
      const hasValidTps = Number.isFinite(slotCtx.tps) && slotCtx.tps > 0;
      const tpsText = hasValidTps
        ? `${slotCtx.tps >= 100 ? Math.round(slotCtx.tps) : slotCtx.tps.toFixed(1)} t/s`
        : slotCtx.isRunning
          ? '生成中'
          : '待命';
      return {
        hidden: false,
        metric: 'tps',
        segClass: 'wm-cap-slot wm-seg-speed',
        textClass: 'wm-slot-text wm-speed-text',
        showRing: false,
        dashOffset: RING_CIRCUMFERENCE,
        text: tpsText,
        running: slotCtx.isRunning,
        warn: false,
        danger: false,
      };
    }

    if (metricKey === 'ttft') {
      const val = slotCtx.hasTelemetry ? slotCtx.ttft : null;
      const valid = val != null && Number.isFinite(Number(val)) && Number(val) >= 0;
      const numVal = valid ? Number(val) : 0;
      const isDanger = valid && numVal >= 30;
      const isWarn = valid && !isDanger && numVal >= 15;
      return {
        hidden: false,
        metric: 'ttft',
        segClass: 'wm-cap-slot wm-seg-ttft',
        textClass: 'wm-slot-text wm-ttft-text',
        showRing: false,
        dashOffset: RING_CIRCUMFERENCE,
        text: valid ? formatCompactCapsuleTtft(numVal) : '--s',
        running: false,
        warn: isWarn,
        danger: isDanger,
      };
    }

    if (metricKey === 'cost') {
      const costVal = slotCtx.hasTelemetry ? slotCtx.stepCost : null;
      return {
        hidden: false,
        metric: 'cost',
        segClass: 'wm-cap-slot wm-seg-cost',
        textClass: 'wm-slot-text wm-cost-text',
        showRing: false,
        dashOffset: RING_CIRCUMFERENCE,
        text: slotCtx.hasTelemetry ? formatCompactCapsuleCost(costVal) : '--',
        running: false,
        warn: false,
        danger: false,
      };
    }

    const quotaSum = !slotCtx.hasTelemetry
      ? null
      : metricKey === 'quota_auto'
        ? resolveQuotaCapsuleSummary(slotCtx.quotas)
        : resolveSpecificQuotaSlotSummary(slotCtx.quotas, metricKey);
    const isDanger = Boolean(quotaSum && quotaSum.roundedPct <= 15);
    const isWarn = Boolean(quotaSum && !isDanger && quotaSum.roundedPct <= 30);
    return {
      hidden: false,
      metric: metricKey,
      segClass: 'wm-cap-slot wm-seg-quota',
      textClass: 'wm-slot-text wm-quota-text',
      showRing: false,
      dashOffset: RING_CIRCUMFERENCE,
      text: quotaSum ? quotaSum.shortText : '余 --%',
      running: false,
      warn: isWarn,
      danger: isDanger,
    };
  }

  function applyCapsuleSlots(slotKeys, slotCtx) {
    const presList = slotKeys.map((key) => resolveCapsuleSlotPresentation(key, slotCtx));
    let visRank = 0;
    const visRanks = [0, 0, 0];
    for (let i = 0; i < 3; i += 1) {
      const slot = capsuleSlots[i];
      const pres = presList[i];
      if (pres.hidden) {
        patchAttr(slot.el, 'hidden', true);
        patchAttr(slot.el, 'data-metric', 'none');
        patchAttr(slot.el, 'data-vis-rank', '');
        continue;
      }
      visRank += 1;
      visRanks[i] = visRank;
      patchAttr(slot.el, 'hidden', false);
      patchAttr(slot.el, 'data-metric', pres.metric);
      patchAttr(slot.el, 'data-vis-rank', String(visRank));

      if (pres.showRing && !slot.ringMounted) {
        slot.el.insertBefore(slot.ringSvg, slot.textSpan);
        slot.ringMounted = true;
      } else if (!pres.showRing && slot.ringMounted) {
        slot.ringSvg.remove();
        slot.ringMounted = false;
      }

      const fullSegClass =
        `${pres.segClass}${pres.running ? ' state-running' : ''}${pres.warn ? ' tone-warn' : ''}${pres.danger ? ' tone-danger' : ''}`;
      patchAttr(slot.el, 'class', fullSegClass);
      const fullTextClass =
        `${pres.textClass}${pres.warn ? ' tone-warn' : ''}${pres.danger ? ' tone-danger' : ''}`;
      patchAttr(slot.textSpan, 'class', fullTextClass);
      patchText(slot.textSpan, pres.text);

      if (pres.showRing) {
        slot.ringFill.setAttribute('stroke-dashoffset', String(pres.dashOffset));
        patchClasses(slot.ringFill, { 'tone-warn': pres.warn, 'tone-danger': pres.danger });
      }
    }

    const showSep0 = visRanks[1] >= 2;
    patchAttr(sep0, 'hidden', !showSep0);
    patchAttr(sep0, 'data-sep-for-rank', showSep0 ? String(visRanks[1]) : '');

    const showSep1 = visRanks[2] >= 2;
    patchAttr(sep1, 'hidden', !showSep1);
    patchAttr(sep1, 'data-sep-for-rank', showSep1 ? String(visRanks[2]) : '');
  }

  // --- 4. 实时遥测状态绑定（双胶囊与多会话/全景概览浮层全部槽位预占，仅就地更新节点，零布局跳动） ---
  function renderCapsuleTelemetry() {
    if (disposed) return;
    const telSt = telemetryStore.getState();
    const uiSt = uiStore.getState();
    const telemetry = telSt.telemetry;

    const showMulti = telemetry?.settings?.showTopbarMultiSession !== false;
    patchAttr(multiBtn, 'hidden', !showMulti);
    patchAttr(capsuleHost, 'data-multi', showMulti ? 'on' : 'off');
    if (!showMulti && multiOpen) {
      setMultiOpen(false);
    }
    if (showMulti !== lastShowMulti) {
      lastShowMulti = showMulti;
      updateResponsiveLayout();
    }

    const slotKeys = normalizeClientTopbarSlots(telemetry?.settings?.topbarCapsuleSlots);

    if (!telemetry) {
      patchClasses(multiBtn, { 'is-running': false, 'is-waiting': false });
      patchText(multiLabel, '0 运行中');
      patchText(multiRunningMetaEl, '读取中...');
      stopMultiLiveTicker();

      applyCapsuleSlots(slotKeys, { hasTelemetry: false });
      return;
    }

    const { hasSubagents, agents, scopedConv: overviewScopedConv, ctxAgent, aggregated } =
      resolveScopedConversation(telemetry, 'all', uiSt.ctxInspectorAgentId);
    const { scopedConv: capsuleScopedConv } = resolveScopedConversation(
      telemetry,
      uiSt.selectedAgentScope,
      uiSt.ctxInspectorAgentId
    );
    const activeConv = telemetry.activeConversation || {};
    const overviewActive = overviewScopedConv || activeConv;
    const ctx = ctxAgent?.context || overviewActive.context || activeConv.context || {};
    const limitTokens = Number(ctx.compactionLimitTokens || ctx.limitTokens || 256000);
    const totalTokens = Number(ctx.totalTokens || 0);
    const usedPct =
      limitTokens > 0 ? Math.min(100, +((totalTokens / limitTokens) * 100).toFixed(1)) : 0;
    const dashOffset = +(
      RING_CIRCUMFERENCE *
      (1 - Math.max(0, Math.min(100, usedPct)) / 100)
    ).toFixed(2);

    // --- 4a. 同步左侧多会话实时状态胶囊与浮层看板 ---
    const rawRunningList =
      Array.isArray(telemetry.runningConversations) && telemetry.runningConversations.length > 0
        ? telemetry.runningConversations
        : activeConv.isRunning || aggregated?.isRunning
          ? [
              {
                cascadeId: activeConv.cascadeId || 'current',
                title: activeConv.title || '当前会话',
                isCurrentSelected: true,
                isMainRunning: Boolean(activeConv.isRunning),
                isRunning: true,
                mainActivity: activeConv.liveActivity || aggregated?.liveActivity || null,
                subagentCount: Math.max(0, (agents?.length || 1) - 1),
                runningSubagentCount: (agents || []).filter((a) => !a.isMain && a.isRunning).length,
                latestTokPerSec: overviewActive.latestTokPerSec ?? null,
                contextUsedPct: usedPct,
                subagents: (agents || [])
                  .filter((a) => !a.isMain)
                  .map((s, idx) => ({
                    cascadeId: s.cascadeId || s.agentId,
                    index: s.index || idx + 1,
                    badgeText: s.badgeText || `子${idx + 1}`,
                    shortLabel: s.shortLabel || `子代理 #${idx + 1}`,
                    role: s.role || `子代理 #${idx + 1}`,
                    isRunning: Boolean(s.isRunning),
                    stepCount: Number(s.stepCount || 0),
                    lastModifiedMs: s.lastModifiedMs || 0,
                    liveActivity: s.liveActivity || {
                      phase: s.isRunning ? 'thinking' : 'done',
                      label: s.isRunning ? '推理中' : '已完成',
                      detail: '',
                      stepProgress: '',
                      startedAtMs: s.lastModifiedMs || 0,
                      signature: `${s.agentId}:${s.stepCount || 0}`,
                    },
                  })),
              },
            ]
          : [];

    const runningCount = rawRunningList.length;
    const runningSubCount = rawRunningList.reduce(
      (acc, item) => acc + Number(item.runningSubagentCount || 0),
      0
    );
    const hasWaiting = rawRunningList.some((item) => item.mainActivity?.phase === 'waiting');

    patchClasses(multiBtn, {
      'is-running': runningCount > 0 && !hasWaiting,
      'is-waiting': runningCount > 0 && hasWaiting,
    });
    const multiBtnText =
      runningCount > 0
        ? runningSubCount > 0
          ? `${runningCount} 运行 · ${runningSubCount} 子`
          : `${runningCount} 运行中`
        : '0 运行中';
    patchText(multiLabel, multiBtnText);

    const hostRouteLower = String(
      telSt.hostRouteConversationId || extractHostRouteCascadeId() || ''
    ).toLowerCase();

    patchText(
      multiRunningMetaEl,
      runningCount > 0
        ? runningSubCount > 0
          ? `${runningCount} 主会话 · ${runningSubCount} 子代理运行中`
          : `${runningCount} 个会话运行中`
        : '全部待命'
    );
    patchAttr(multiEmptyEl, 'hidden', runningCount > 0);
    patchAttr(multiRunningListEl, 'hidden', runningCount === 0);

    const runningIdsLower = new Set(
      rawRunningList.map((item) => String(item.cascadeId || '').toLowerCase())
    );

    if (runningCount === 0) {
      stopMultiLiveTicker();
      manualSubExpandMap.clear();
    } else {
      for (const cid of [...manualSubExpandMap.keys()]) {
        if (!runningIdsLower.has(String(cid || '').toLowerCase())) {
          manualSubExpandMap.delete(cid);
        }
      }

      const activeTimerKeys = new Set();
      for (const item of rawRunningList) {
        activeTimerKeys.add(`main:${item.cascadeId}`);
        const subCount = Number(item.subagentCount || item.subagents?.length || 0);
        const runSubs = Number(item.runningSubagentCount || 0);
        const isExp = manualSubExpandMap.has(item.cascadeId)
          ? manualSubExpandMap.get(item.cascadeId)
          : runSubs > 0;
        if (subCount > 0 && isExp) {
          for (const sub of item.subagents || []) {
            if (sub?.isRunning) {
              activeTimerKeys.add(`sub:${sub.cascadeId}`);
            }
          }
        }
      }

      patchKeyedList(multiRunningListEl, rawRunningList, {
        keyFn: (item) => item.cascadeId,
        sigFn: (item) => {
          const runSubs = Number(item.runningSubagentCount || 0);
          const isExp = manualSubExpandMap.has(item.cascadeId)
            ? manualSubExpandMap.get(item.cascadeId)
            : runSubs > 0;
          const isHere =
            Boolean(hostRouteLower) &&
            String(item.cascadeId || '').toLowerCase() === hostRouteLower;
          const subSig = (item.subagents || [])
            .map(
              (s) =>
                `${s.cascadeId}:${s.isRunning}:${s.stepCount}:${s.liveActivity?.signature || ''}:${s.liveActivity?.startedAtMs || 0}`
            )
            .join('|');
          return `${item.cascadeId}:${item.title}:${isHere}:${item.isMainRunning}:${item.subagentCount}:${runSubs}:${isExp}:${item.latestTokPerSec ?? ''}:${item.contextUsedPct ?? ''}:${item.mainActivity?.signature || ''}:${item.mainActivity?.startedAtMs || 0}:${subSig}`;
        },
        createRow: createMultiLiveTaskCard,
        updateRow: (refs, item) => {
          const act = item.mainActivity || {
            phase: 'thinking',
            label: '推理中',
            detail: '',
            stepProgress: '',
            startedAtMs: item.lastModifiedMs || 0,
            signature: `fallback:${item.lastModifiedMs || 0}`,
          };
          const isWaiting = act.phase === 'waiting';
          const isCompacting = act.phase === 'compacting';
          patchClasses(refs.cardEl, {
            'is-waiting': isWaiting,
            'is-compacting': isCompacting,
          });
          patchClasses(refs.dotIcon, { 'is-pulsing': true });

          const convTitle = item.title || item.cascadeId?.slice(0, 8) || '当前会话';
          patchText(refs.titleEl, convTitle);
          patchAttr(refs.titleEl, 'title', `点击在监控面板中检视会话：${convTitle}`);
          refs.titleEl.onclick = (e) => {
            e.stopPropagation();
            inspectSessionInMonitor(item.cascadeId);
          };

          const isHere =
            Boolean(hostRouteLower) &&
            String(item.cascadeId || '').toLowerCase() === hostRouteLower;
          patchAttr(refs.hereTagEl, 'hidden', !isHere);

          const metricParts = [];
          if (Number.isFinite(item.latestTokPerSec) && item.latestTokPerSec > 0) {
            metricParts.push(
              `${item.latestTokPerSec >= 100 ? Math.round(item.latestTokPerSec) : item.latestTokPerSec.toFixed(1)} t/s`
            );
          }
          if (item.contextUsedPct != null && Number.isFinite(Number(item.contextUsedPct))) {
            metricParts.push(`${Math.round(Number(item.contextUsedPct))}%`);
          }
          const metricsStr = metricParts.join(' · ');
          patchAttr(refs.metricsEl, 'hidden', !metricsStr);
          if (metricsStr) {
            patchText(refs.metricsEl, metricsStr);
          }

          const subCount = Number(item.subagentCount || item.subagents?.length || 0);
          const runSubCount = Number(item.runningSubagentCount || 0);
          const isExpanded = manualSubExpandMap.has(item.cascadeId)
            ? manualSubExpandMap.get(item.cascadeId)
            : runSubCount > 0;
          patchAttr(refs.mainBadge, 'hidden', subCount === 0);
          patchAttr(refs.subToggleBtn, 'hidden', subCount === 0);
          if (subCount > 0) {
            const arrow = isExpanded ? '▾' : '▸';
            const toggleText =
              runSubCount > 0
                ? `子代理 ${runSubCount}/${subCount} ${arrow}`
                : `子代理 (${subCount}) ${arrow}`;
            patchText(refs.subToggleBtn, toggleText);
            patchClasses(refs.subToggleBtn, { 'is-expanded': isExpanded });
            refs.subToggleBtn.onclick = (e) => {
              e.stopPropagation();
              manualSubExpandMap.set(item.cascadeId, !isExpanded);
              renderCapsuleTelemetry();
              if (multiOpen) {
                positionFloatingElements();
              }
            };
          }

          const mainTimerKey = `main:${item.cascadeId}`;
          activeTimerKeys.add(mainTimerKey);
          bindMultiElapsedTimer(
            mainTimerKey,
            `${item.cascadeId}:${act.signature || act.label}`,
            act.startedAtMs,
            refs.elapsedEl
          );

          patchText(refs.mainPhase, act.label || '推理中');
          const progText = act.stepProgress ? `[${act.stepProgress}]` : '';
          patchAttr(refs.mainProgress, 'hidden', !progText);
          if (progText) {
            patchText(refs.mainProgress, progText);
          }

          const detailStr = act.detail || '';
          patchAttr(refs.mainSep, 'hidden', !detailStr);
          patchAttr(refs.mainDetail, 'hidden', !detailStr);
          patchText(refs.mainDetail, detailStr);

          const showSubs = subCount > 0 && isExpanded;
          patchAttr(refs.subListEl, 'hidden', !showSubs);
          if (showSubs) {
            const subItems = item.subagents || [];
            patchKeyedList(refs.subListEl, subItems, {
              keyFn: (sub) => sub.cascadeId,
              sigFn: (sub) =>
                `${sub.cascadeId}:${sub.role}:${sub.isRunning}:${sub.stepCount}:${sub.liveActivity?.signature || ''}:${sub.isRunning ? multiTimersMap.has(`sub:${sub.cascadeId}`) : true}`,
              createRow: createMultiLiveSubRow,
              updateRow: (subRefs, sub) => {
                const subAct = sub.liveActivity || {
                  phase: sub.isRunning ? 'thinking' : 'done',
                  label: sub.isRunning ? '推理中' : '已完成',
                  detail: '',
                  stepProgress: '',
                  startedAtMs: sub.lastModifiedMs || 0,
                };
                patchClasses(subRefs.rowEl, { 'is-done': !sub.isRunning });
                const subBadgeCls = getAgentBadgeClass(sub.index || 1, false);
                patchAttr(subRefs.subBadge, 'class', `agent-badge ${subBadgeCls}`);
                patchText(subRefs.subBadge, sub.badgeText || `子${sub.index || 1}`);
                patchText(subRefs.subRole, sub.role || sub.shortLabel || '子代理');

                const subProg = subAct.stepProgress ? ` [${subAct.stepProgress}]` : '';
                const summaryText = sub.isRunning
                  ? `${subAct.label || '运行中'}${subProg}${subAct.detail ? ` · ${subAct.detail}` : ''}`
                  : `已完成 (${sub.stepCount || 0} 步)`;
                patchText(subRefs.subSummary, summaryText);

                const subTimerKey = `sub:${sub.cascadeId}`;
                if (sub.isRunning) {
                  activeTimerKeys.add(subTimerKey);
                  bindMultiElapsedTimer(
                    subTimerKey,
                    `${sub.cascadeId}:${subAct.signature || subAct.label}`,
                    subAct.startedAtMs || sub.lastModifiedMs,
                    subRefs.subElapsed
                  );
                } else {
                  multiTimersMap.delete(subTimerKey);
                  patchText(subRefs.subElapsed, `${sub.stepCount || 0}步`);
                }
              },
            });
          }
        },
      });

      for (const k of [...multiTimersMap.keys()]) {
        if (!activeTimerKeys.has(k)) {
          multiTimersMap.delete(k);
        }
      }
      ensureMultiLiveTicker();
    }

    // --- 4b. 同步右侧指标胶囊与悬停全景三卡片 ---
    const isRunning = Boolean(aggregated?.isRunning || activeConv.isRunning);
    const tps =
      capsuleScopedConv?.latestTokPerSec ??
      aggregated?.latestTokPerSec ??
      activeConv.latestTokPerSec ??
      null;
    const ttft =
      capsuleScopedConv?.latestTtftSec ??
      aggregated?.latestTtftSec ??
      activeConv.latestTtftSec ??
      null;
    const capsuleStepCost =
      capsuleScopedConv?.latestStepCostUsd ??
      aggregated?.latestStepCostUsd ??
      activeConv.latestStepCostUsd ??
      null;

    patchClasses(capsuleBtn, { 'is-running': isRunning });
    applyCapsuleSlots(slotKeys, {
      hasTelemetry: true,
      usedPct,
      dashOffset,
      isRunning,
      tps,
      ttft,
      stepCost: capsuleStepCost,
      quotas: telemetry.quotas,
    });

    const updateMode = normalizeClientUpdateMode(
      telemetry.settings?.pluginUpdateMode,
      telemetry.settings?.autoUpdatePlugin
    );
    const showUpdatePrompt =
      Boolean(telemetry.cloudStatus?.updateAvailable) && updateMode !== 'off';
    const latestVer = telemetry.cloudStatus?.latestPluginVersion || '';
    patchAttr(updateDot, 'hidden', !showUpdatePrompt);
    patchAttr(topbarUpdateBtn, 'hidden', !showUpdatePrompt);
    patchAttr(hoverUpdateBar, 'hidden', !showUpdatePrompt);
    if (showUpdatePrompt) {
      if (!isTopbarUpdating) {
        patchText(topbarUpdateLabel, latestVer ? `v${latestVer}` : '新版本');
      }
      patchAttr(
        topbarUpdateBtn,
        'title',
        latestVer ? `发现新版本 v${latestVer}，左键立即更新` : '发现新版本，左键立即更新'
      );
      patchText(
        hoverUpdateVerText,
        latestVer ? `发现新版本 v${latestVer}` : '发现新版本可用'
      );
      const isComposerDock = capsuleHost.getAttribute('data-dock') === 'composer';
      const dockPlaceWord = isComposerDock ? '版本胶囊' : '顶栏';
      patchText(
        hoverUpdateHintText,
        latestVer
          ? `点击${dockPlaceWord} v${latestVer} 即可更新`
          : `点击${isComposerDock ? '版本胶囊' : '顶栏版本胶囊'}即可更新`
      );
    }
    if (showUpdatePrompt !== lastShowUpdate) {
      lastShowUpdate = showUpdatePrompt;
      updateResponsiveLayout();
    }

    // --- 同步悬停三卡片全景概览（与 LiveOverviewView 保持完全一致的数据口径与视觉呈现） ---
    const activeModelDisplay = resolveModelDisplayInfo(overviewActive, telemetry.settings, {
      fallback: '模型未知',
    }).text;

    patchClasses(hoverPulseDot, { 'is-pulsing': Boolean(overviewActive.isRunning || isRunning) });
    patchText(hoverTpsVal, formatMetric(overviewActive.latestTokPerSec, ' tok/s'));
    const reason = speedReasonText(overviewActive.latestSpeedReason);
    const modelAndAgent =
      hasSubagents && overviewActive.activeAgentBadge
        ? `[${overviewActive.activeAgentBadge}] ${activeModelDisplay}`
        : activeModelDisplay;
    patchText(hoverTpsSub, reason ? `${modelAndAgent} · ${reason}` : modelAndAgent);

    patchText(hoverTtftVal, formatMetric(overviewActive.latestTtftSec, 's'));
    patchText(hoverTtftSub, `均值 ${formatMetric(overviewActive.ttftSummary?.avgSec, 's')}`);

    patchText(hoverAvgVal, formatMetric(overviewActive.avgTokPerSec, ' tok/s'));
    patchText(hoverAvgSub, `有效 ${sampleSummary(overviewActive.speedSummary)}`);

    const stepCost = overviewActive.latestStepCostUsd;
    const hasAnySteps = Number(overviewActive.stepCount || 0) > 0;
    patchText(
      hoverCostVal,
      !hasAnySteps && stepCost == null ? '—' : formatUsd(stepCost, { precise: true })
    );
    patchText(
      hoverCacheSub,
      `缓存 ${overviewActive.latestCacheHitPct ?? 0}% · 累计 ${formatUsd(overviewActive.sessionCostUsd || 0)}`
    );

    patchAttr(hoverCtxAgentBadge, 'hidden', !(hasSubagents && ctxAgent));
    if (hasSubagents && ctxAgent) {
      const badgeCls = getAgentBadgeClass(ctxAgent.index || 0, Boolean(ctxAgent.isMain));
      patchAttr(hoverCtxAgentBadge, 'class', `agent-badge ${badgeCls}`);
      patchText(hoverCtxAgentBadge, formatAgentLabel(ctxAgent));
    }
    patchText(
      hoverCtxSummaryText,
      `${formatTokens(totalTokens)} / ${formatTokens(limitTokens)} (${usedPct}%)`
    );
    hoverCtxSegmentBar.setProps({ context: { ...ctx, limitTokens, usedPct } });

    const scoredChannels = CTX_CHANNEL_DEFS.map((ch, defaultOrder) => ({
      ch,
      defaultOrder,
      val: ch.getValue(ctx),
    }));
    scoredChannels.sort((a, b) => b.val - a.val || a.defaultOrder - b.defaultOrder);
    for (let i = 0; i < hoverLegendSlots.length; i += 1) {
      const slot = hoverLegendSlots[i];
      const entry = scoredChannels[i];
      if (!slot || !entry) continue;
      patchAttr(slot.swatchEl, 'class', `swatch ${entry.ch.segClass}`);
      patchText(slot.labelEl, entry.ch.label);
      patchText(slot.valEl, formatTokens(entry.val));
    }

    const quotas = telemetry.quotas || {};
    const minuteTick = Number(telSt.minuteTick || Math.floor(Date.now() / 30000));
    patchText(
      hoverTierBadge,
      `${telemetry.account?.tierName || 'Google AI'} · ${telemetry.account?.planName || 'Pro'}`
    );
    patchKeyedList(hoverPoolsListEl, buildQuotaPoolItems(quotas, minuteTick), {
      keyFn: (item) => item.key,
      sigFn: quotaPoolRowSig,
      createRow: createPoolQuotaRow,
      updateRow: syncPoolQuotaRow,
    });
    const footSummary = formatQuotaSummaryFooter(quotas, telemetry.account);
    patchText(hoverWkFootLeft, footSummary.leftText);
    patchText(hoverWkFootRight, footSummary.rightText);
    patchAttr(hoverWkFootLeft, 'title', footSummary.tooltip);
    patchAttr(hoverWkFootRight, 'title', footSummary.tooltip);
  }

  let lastAppliedMountMode = normalizeClientWindowMountMode(
    telemetryStore.getState().telemetry?.settings?.windowMountMode,
    telemetryStore.getState().telemetry?.settings?.enableWindowOverlay
  );

  const unsubStore = telemetryStore.subscribe(
    (st) => ({
      syncState: st.syncState,
      telemetry: st.telemetry,
      minuteTick: st.minuteTick,
      selectedConversationId: st.selectedConversationId,
    }),
    (slice) => {
      const nextMountMode = normalizeClientWindowMountMode(
        slice.telemetry?.settings?.windowMountMode,
        slice.telemetry?.settings?.enableWindowOverlay
      );
      if (slice.telemetry?.settings?.enableWindowOverlay === false || nextMountMode === 'sidebar') {
        if (popoverOpen) setPopoverOpen(false);
        if (multiOpen) setMultiOpen(false);
      } else if (nextMountMode !== lastAppliedMountMode) {
        lastAppliedMountMode = nextMountMode;
        ensureCapsuleDocked();
      }
      lastAppliedMountMode = nextMountMode;
      renderCapsuleTelemetry();
    }
  );

  const unsubUiScope = uiStore.subscribe(
    (st) => ({
      selectedAgentScope: st.selectedAgentScope,
      ctxInspectorAgentId: st.ctxInspectorAgentId,
    }),
    () => renderCapsuleTelemetry()
  );

  // --- 5. 宿主会话路由跟随与全局交互监听 ---
  function syncHostRouteIfChanged() {
    if (disposed) return;
    const currentRouteId = extractHostRouteCascadeId();
    if (currentRouteId === lastObservedRouteId) return;
    lastObservedRouteId = currentRouteId;
    const st = telemetryStore.getState();
    const patch = { hostRouteConversationId: currentRouteId };
    if (currentRouteId && st.selectedConversationId && st.selectedConversationId !== currentRouteId) {
      patch.selectedConversationId = '';
    }
    uiStore.setState({ selectedAgentScope: 'all', ctxInspectorAgentId: 'auto' });
    telemetryStore.setState(patch);
    void fetchTelemetry({ force: false });
  }

  const onDocMouseDown = (e) => {
    if (popoverOpen && !isEventInside(e, popoverEl) && !isEventInside(e, capsuleHost)) {
      setPopoverOpen(false);
    }
    if (multiOpen && !isEventInside(e, multiPanelEl) && !isEventInside(e, capsuleHost)) {
      setMultiOpen(false);
    }
  };

  const onDocKeyDown = (e) => {
    if (e.key === 'Escape' && !e.defaultPrevented) {
      if (popoverOpen) {
        setPopoverOpen(false);
      }
      if (multiOpen) {
        setMultiOpen(false);
      }
    }
  };

  const onWindowPointerMove = (e) => recordPointerCoords(e);
  const onWindowBlur = () => {
    hasPointerCoords = false;
    if (tooltipOpen) {
      setTooltipOpen(false);
    }
    if (multiOpen && !multiPinned) {
      setMultiOpen(false);
    }
  };
  const onWindowResize = () => updateResponsiveLayout();
  const onPopState = () => syncHostRouteIfChanged();
  const onDocFocusIn = () => syncHostRouteIfChanged();
  const onVisibilityChange = () => {
    if (document.hidden) {
      hasPointerCoords = false;
      if (tooltipOpen) {
        setTooltipOpen(false);
      }
      if (multiOpen && !multiPinned) {
        setMultiOpen(false);
      }
      return;
    }
    if (!document.hidden && !disposed) {
      syncHostRouteIfChanged();
      void fetchTelemetry({ force: false });
    }
  };

  let hostDomObserver = null;
  try {
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateResponsiveLayout());
      if (document.body) resizeObserver.observe(document.body);
    }
    if (typeof MutationObserver !== 'undefined') {
      themeObserver = new MutationObserver(() => {
        syncWorkbenchThemeVars();
      });
      if (document.head) {
        themeObserver.observe(document.head, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
      if (document.body) {
        hostDomObserver = new MutationObserver((records) => {
          if (
            Array.isArray(records) &&
            records.length > 0 &&
            records.every((r) => r?.target === capsuleHost || r?.target === portalHost)
          ) {
            return;
          }
          syncHostRouteIfChanged();
          if (!observedWorkbench) {
            ensureWorkbenchThemeObserved();
          }
          const dock = resolveRuntimeDockTarget();
          if (!isDockPlacementSynced(dock)) {
            scheduleDockSync();
          }
        });
        hostDomObserver.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['data-cascade-id', 'data-selected'],
        });
      }
    }
  } catch {
    // 忽略观察器初始化异常
  }

  document.addEventListener?.('mousedown', onDocMouseDown, true);
  document.addEventListener?.('keydown', onDocKeyDown);
  document.addEventListener?.('focusin', onDocFocusIn);
  document.addEventListener?.('visibilitychange', onVisibilityChange);
  window.addEventListener?.('pointermove', onWindowPointerMove, { passive: true });
  window.addEventListener?.('blur', onWindowBlur);
  window.addEventListener?.('resize', onWindowResize);
  window.addEventListener?.('popstate', onPopState);
  navigator?.windowControlsOverlay?.addEventListener?.('geometrychange', onWindowResize);

  const watchdogTimer = setInterval(() => {
    if (disposed) return;
    syncHostRouteIfChanged();
    ensureWorkbenchThemeObserved();
    const dock = resolveRuntimeDockTarget();
    if (!isDockPlacementSynced(dock)) {
      ensureCapsuleDocked();
    }
  }, 1200);

  ensureCapsuleDocked();
  renderCapsuleTelemetry();
  const allowMultiCarryOver =
    telemetryStore.getState().telemetry?.settings?.showTopbarMultiSession !== false;
  if (carryOverPopoverOpen) {
    setPopoverOpen(true, { instant: true });
  } else if (carryOverMultiPinnedOpen && allowMultiCarryOver) {
    setMultiOpen(true, { pinned: true, instant: true });
  } else if (carryOverMultiHoverOpen && allowMultiCarryOver) {
    setMultiOpen(true, { pinned: false, instant: true });
  } else if (carryOverTooltipOpen) {
    setTooltipOpen(true, { instant: true });
  }
  const stopPolling = startAsyncTelemetryLoop(2000);

  const handle = {
    bundleVersion,
    ensureAlive() {
      if (disposed) return false;
      return ensureCapsuleDocked();
    },
    syncHostRoute() {
      if (disposed) return false;
      syncHostRouteIfChanged();
      return true;
    },
    updateBridge(nextBridge) {
      if (disposed || !nextBridge || typeof nextBridge !== 'object') return false;
      const port = Number(nextBridge.port || 0);
      const token = String(nextBridge.token || '');
      if (!Number.isInteger(port) || port <= 0 || !token) return false;
      const cur = window.__AGUsageMonitorBridge || {};
      const portChanged = Number(cur.port || 0) !== port;
      cur.port = port;
      cur.token = token;
      if (portChanged && cur.transportMode !== 'cdp') {
        cur.transportMode = 'http';
      }
      window.__AGUsageMonitorBridge = cur;
      void fetchTelemetry({ force: false });
      return true;
    },
    getTelemetrySnapshot() {
      return telemetryStore.getState().telemetry;
    },
    getLastPointer() {
      return hasPointerCoords ? { x: lastPointerX, y: lastPointerY } : null;
    },
    deliverRpc(responses) {
      if (disposed) return 0;
      return deliverCdpBridgeResponses(responses);
    },
    open() {
      setPopoverOpen(true);
    },
    close() {
      setPopoverOpen(false);
    },
    toggle() {
      setPopoverOpen(!popoverOpen);
    },
    openMulti(pinned = true) {
      setMultiOpen(true, { pinned: Boolean(pinned) });
    },
    closeMulti() {
      setMultiOpen(false);
    },
    isOpen: () => popoverOpen,
    isHoverOpen: () => tooltipOpen,
    isMultiOpen: () => multiOpen,
    isMultiHoverOpen: () => Boolean(multiOpen && !multiPinned),
    isMultiPinnedOpen: () => Boolean(multiOpen && multiPinned),
    getLayoutMode: () => layoutMode,
    getDockKind: () => String(capsuleHost.getAttribute('data-dock') || ''),
    getMountMode: () => lastAppliedMountMode,
    applyMountMode(nextMode) {
      if (disposed) return false;
      const normalized = normalizeClientWindowMountMode(nextMode, nextMode !== 'sidebar');
      if (typeof window !== 'undefined' && window.__AGUsageMonitorBridge) {
        window.__AGUsageMonitorBridge.mountMode = normalized;
      }
      const curTel = telemetryStore.getState().telemetry;
      if (curTel?.settings) {
        telemetryStore.setState({
          telemetry: {
            ...curTel,
            settings: {
              ...curTel.settings,
              windowMountMode: normalized,
              enableWindowOverlay: normalized !== 'sidebar',
            },
          },
        });
      }
      lastAppliedMountMode = normalized;
      return ensureCapsuleDocked();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      clearInterval(watchdogTimer);
      if (hoverLeaveTimer) {
        clearTimeout(hoverLeaveTimer);
        hoverLeaveTimer = null;
      }
      if (multiLeaveTimer) {
        clearTimeout(multiLeaveTimer);
        multiLeaveTimer = null;
      }
      stopMultiLiveTicker();
      if (dockRafId && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(dockRafId);
        dockRafId = 0;
      }
      stopPolling();
      stopAsyncTelemetryLoop();
      unsubStore();
      unsubUiScope();
      try {
        resizeObserver?.disconnect();
      } catch {}
      try {
        hostDomObserver?.disconnect();
      } catch {}
      try {
        themeObserver?.disconnect();
      } catch {}
      document.removeEventListener?.('mousedown', onDocMouseDown, true);
      document.removeEventListener?.('keydown', onDocKeyDown);
      document.removeEventListener?.('focusin', onDocFocusIn);
      document.removeEventListener?.('visibilitychange', onVisibilityChange);
      window.removeEventListener?.('pointermove', onWindowPointerMove);
      window.removeEventListener?.('blur', onWindowBlur);
      window.removeEventListener?.('resize', onWindowResize);
      window.removeEventListener?.('popstate', onPopState);
      navigator?.windowControlsOverlay?.removeEventListener?.('geometrychange', onWindowResize);
      restorePatchedActionToolbar();
      try {
        hoverCtxSegmentBar.destroy();
      } catch {}
      try {
        appInstance.destroy();
      } catch {}
      try {
        capsuleHost.remove();
      } catch {}
      try {
        portalHost.remove();
      } catch {}
      if (window.__AGUsageMonitorOverlay === handle) {
        delete window.__AGUsageMonitorOverlay;
      }
    },
  };

  window.__AGUsageMonitorOverlay = handle;
  return handle;
}

// --- src/main.js ---
/**
 * @fileoverview Async entry point for Antigravity Usage & Speed Monitor.
 * Automatically branches between Auxiliary Sidebar Webview mode (`#app-root`)
 * and Main Window Dual-Mount Overlay mode (`window.__AGUsageMonitorBridge`).
 */


async function bootstrapApp(mountTarget = document.getElementById('app-root')) {
  if (!mountTarget) return null;
  const appInstance = App();
  mountTarget.appendChild(appInstance.el);
  const stopPolling = startAsyncTelemetryLoop(2000);
  return {
    appInstance,
    stopPolling,
  };
}

function startEntry() {
  if (isWindowOverlayMode()) {
    mountWindowOverlay();
    return;
  }
  bootstrapApp();
}

function init() {
  if (typeof document === 'undefined') return;
  if (document.readyState === 'loading' && typeof document.addEventListener === 'function') {
    document.addEventListener('DOMContentLoaded', () => {
      startEntry();
    });
  } else {
    startEntry();
  }
}

init();
})();
