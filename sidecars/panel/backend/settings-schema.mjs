/**
 * @fileoverview 用户偏好设置 Schema、枚举常量、默认值与无状态纯函数归一化器。
 *
 * 独立于文件系统与运行时状态，统一约束「常规 / 结构 / 其他」三栏偏好结构，
 * 并无缝兼容旧版 `settings.json`（如 3 槽固定数组中的 `'none'`、`enableWindowOverlay`、`autoUpdatePlugin` 等）。
 */

import { isContextWindowSettingId, isContextWindowOption } from './context-windows.mjs';

export const SUPPORTED_LANGUAGES = Object.freeze(['auto', 'zh-CN', 'en-US']);

export const THEME_ACCENT_KEYS = Object.freeze([
  'host',
  'blue',
  'emerald',
  'amber',
  'violet',
  'cyan',
  'rose',
]);

export const FONT_SCALE_KEYS = Object.freeze(['sm', 'md', 'lg', 'xl']);

export const TOPBAR_SLOT_KEYS = Object.freeze([
  'context',
  'tps',
  'ttft',
  'avg_tps',
  'cost',
  'session_cost',
  'cache_hit',
  'session_tokens',
  'quota_auto',
  'gemini_5h',
  'gemini_weekly',
  'claude_5h',
  'claude_weekly',
]);

export const DEFAULT_TOPBAR_SLOTS = Object.freeze(['context', 'tps', 'quota_auto']);
export const MIN_TOPBAR_SLOTS = 1;
export const MAX_TOPBAR_SLOTS = 5;

export const OVERVIEW_MODULE_KEYS = Object.freeze([
  'metrics',
  'context',
  'quotas',
  'live_tasks',
]);

export const DEFAULT_OVERVIEW_MODULES = Object.freeze([
  'metrics',
  'context',
  'quotas',
  'live_tasks',
]);

export const DEFAULT_HOVER_MODULES = Object.freeze(['metrics', 'context', 'quotas']);

export const OVERVIEW_METRIC_KEYS = Object.freeze([
  'tps',
  'ttft',
  'avg_tps',
  'step_cost',
  'session_cost',
  'cache_hit',
  'session_tokens',
  'context_usage',
  'quota_tightest',
]);

export const DEFAULT_OVERVIEW_METRICS = Object.freeze([
  'tps',
  'ttft',
  'avg_tps',
  'step_cost',
]);

export const STEP_TABLE_COLUMN_KEYS = Object.freeze([
  'step',
  'time',
  'model',
  'tps',
  'ttft',
  'duration',
  'tokens_combo',
  'input_tokens',
  'cache_tokens',
  'output_tokens',
  'cache',
  'cost',
]);

export const DEFAULT_STEP_TABLE_COLUMNS = Object.freeze([
  'step',
  'model',
  'tps',
  'ttft',
  'tokens_combo',
  'cache',
  'cost',
]);

export const PLUGIN_UPDATE_MODES = Object.freeze(['off', 'manual', 'auto']);

export const ORCHESTRATOR_ID_MODES = Object.freeze(['compact', 'full']);

export const WINDOW_MOUNT_MODES = Object.freeze(['dual', 'composer', 'sidebar']);

function isSchemaPlainObject(v) {
  return Boolean(v) && typeof v === 'object' && !Array.isArray(v);
}

function schemaSanitizePositiveNum(val, fallback) {
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

/**
 * 归一化界面语言枚举（默认 `'zh-CN'`，保持与现有界面一致；同时支持 `'auto'` 与 `'en-US'`）。
 *
 * @param {unknown} lang
 * @returns {'auto'|'zh-CN'|'en-US'}
 */
export function normalizeLanguageSetting(lang) {
  const raw = String(lang ?? '').trim();
  if (!raw) return 'zh-CN';
  const lower = raw.toLowerCase();
  if (lower === 'auto' || lower === 'system') return 'auto';
  if (lower === 'en' || lower === 'en-us' || lower.startsWith('en-')) return 'en-US';
  if (lower === 'zh' || lower === 'zh-cn' || lower.startsWith('zh')) return 'zh-CN';
  return 'zh-CN';
}

/**
 * 归一化主题强调色预设键（默认 `'host'` 跟随宿主原生主题）。
 *
 * @param {unknown} accent
 * @returns {'host'|'blue'|'emerald'|'amber'|'violet'|'cyan'|'rose'}
 */
export function normalizeThemeAccent(accent) {
  const clean = String(accent ?? '').trim().toLowerCase();
  return THEME_ACCENT_KEYS.includes(clean) ? /** @type {any} */ (clean) : 'host';
}

/**
 * 归一化面板字号档位（默认 `'md'` 标准 100%）。
 *
 * @param {unknown} scale
 * @returns {'sm'|'md'|'lg'|'xl'}
 */
export function normalizeFontScale(scale) {
  const clean = String(scale ?? '').trim().toLowerCase();
  return FONT_SCALE_KEYS.includes(clean) ? /** @type {any} */ (clean) : 'md';
}

/**
 * 归一化面板挂载方式枚举（`'dual'` 顶部栏+侧边栏 | `'composer'` 输入框+侧边栏 | `'sidebar'` 仅侧边栏），
 * 兼容历史 `enableWindowOverlay` 布尔开关，默认 `'dual'`。
 *
 * @param {unknown} mode
 * @param {unknown} [legacyEnableOverlay]
 * @returns {'dual'|'composer'|'sidebar'}
 */
export function normalizeWindowMountMode(mode, legacyEnableOverlay) {
  const m = String(mode ?? '').trim().toLowerCase();
  if (m === 'composer' || m === 'input') return 'composer';
  if (m === 'sidebar' || m === 'sidebar_only' || m === 'off') return 'sidebar';
  if (m === 'dual' || m === 'topbar') return 'dual';
  if (legacyEnableOverlay === false) return 'sidebar';
  return 'dual';
}

/**
 * 归一化 Orchestrator 系列模型 ID 显示风格（`'compact'` 精简代号 vs `'full'` 完整模型 ID，默认 `'compact'`）。
 *
 * @param {unknown} mode
 * @returns {'compact'|'full'}
 */
export function normalizeOrchestratorIdMode(mode) {
  const m = String(mode ?? '').trim().toLowerCase();
  return m === 'full' ? 'full' : 'compact';
}

/**
 * 归一化插件更新策略枚举（兼容历史 `autoUpdatePlugin` 布尔开关，默认 `'manual'`）。
 *
 * @param {unknown} mode
 * @param {unknown} [legacyAutoUpdate]
 * @returns {'off'|'manual'|'auto'}
 */
export function normalizePluginUpdateMode(mode, legacyAutoUpdate) {
  const m = String(mode ?? '').trim().toLowerCase();
  if (m === 'off' || m === 'manual' || m === 'auto') return m;
  if (legacyAutoUpdate === true) return 'auto';
  return 'manual';
}

/**
 * 归一化每周额度统计模式枚举（兼容历史简写 `'tokens'` / `'cost'` 与标准枚举 `'custom_tokens'` / `'custom_cost'`）。
 *
 * @param {unknown} mode
 * @returns {'official'|'custom_tokens'|'custom_cost'}
 */
export function normalizeWeeklyLimitMode(mode) {
  const m = String(mode || '').trim().toLowerCase();
  if (m === 'custom_tokens' || m === 'tokens') return 'custom_tokens';
  if (m === 'custom_cost' || m === 'cost') return 'custom_cost';
  return 'official';
}

/**
 * 归一化顶栏/输入框胶囊槽位数组（1~5 项动态自添加，默认 3 项，自动清洗历史 `'none'` 与重复项）。
 *
 * @param {unknown} raw
 * @returns {string[]}
 */
export function normalizeTopbarCapsuleSlots(raw) {
  if (!Array.isArray(raw)) {
    return [...DEFAULT_TOPBAR_SLOTS];
  }
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const val = String(item ?? '').trim();
    if (!val || val === 'none') continue;
    const mapped = val === 'step_cost' ? 'cost' : val;
    if (!TOPBAR_SLOT_KEYS.includes(mapped) || seen.has(mapped)) continue;
    seen.add(mapped);
    out.push(mapped);
    if (out.length >= MAX_TOPBAR_SLOTS) break;
  }
  if (out.length < MIN_TOPBAR_SLOTS) {
    return ['context'];
  }
  return out;
}

/**
 * 归一化实时监控视图展示的模块及上下顺序（1~4 项，默认 4 项全开）。
 *
 * @param {unknown} raw
 * @returns {string[]}
 */
export function normalizeOverviewModules(raw) {
  if (!Array.isArray(raw)) {
    return [...DEFAULT_OVERVIEW_MODULES];
  }
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const val = String(item ?? '').trim();
    if (!OVERVIEW_MODULE_KEYS.includes(val) || seen.has(val)) continue;
    seen.add(val);
    out.push(val);
    if (out.length >= OVERVIEW_MODULE_KEYS.length) break;
  }
  return out.length > 0 ? out : ['metrics'];
}

/**
 * 归一化鼠标悬停速览窗展示的模块及上下顺序（0~4 项，默认 3 项；显式空数组 `[]` 表示禁用悬停弹窗）。
 *
 * @param {unknown} raw
 * @returns {string[]}
 */
export function normalizeHoverModules(raw) {
  if (!Array.isArray(raw)) {
    return [...DEFAULT_HOVER_MODULES];
  }
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const val = String(item ?? '').trim();
    if (!OVERVIEW_MODULE_KEYS.includes(val) || seen.has(val)) continue;
    seen.add(val);
    out.push(val);
    if (out.length >= OVERVIEW_MODULE_KEYS.length) break;
  }
  return out;
}

/**
 * 归一化实时监控第一行指标矩阵的槽位与顺序（1~4 项，默认 4 项）。
 *
 * @param {unknown} raw
 * @returns {string[]}
 */
export function normalizeOverviewMetrics(raw) {
  if (!Array.isArray(raw)) {
    return [...DEFAULT_OVERVIEW_METRICS];
  }
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const rawVal = String(item ?? '').trim();
    const val = rawVal === 'cost' ? 'step_cost' : rawVal;
    if (!OVERVIEW_METRIC_KEYS.includes(val) || seen.has(val)) continue;
    seen.add(val);
    out.push(val);
    if (out.length >= 4) break;
  }
  return out.length > 0 ? out : ['tps'];
}

/**
 * 归一化调用明细「按步查看」表格列配置与左右顺序（2~12 列，默认保留现有 7 列）。
 *
 * @param {unknown} raw
 * @returns {string[]}
 */
export function normalizeStepTableColumns(raw) {
  if (!Array.isArray(raw)) {
    return [...DEFAULT_STEP_TABLE_COLUMNS];
  }
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const val = String(item ?? '').trim();
    if (!STEP_TABLE_COLUMN_KEYS.includes(val) || seen.has(val)) continue;
    seen.add(val);
    out.push(val);
    if (out.length >= STEP_TABLE_COLUMN_KEYS.length) break;
  }
  if (out.length < 2) {
    for (const fallbackCol of ['step', 'model', 'tps']) {
      if (!seen.has(fallbackCol)) {
        seen.add(fallbackCol);
        out.push(fallbackCol);
      }
      if (out.length >= 2) break;
    }
  }
  return out;
}

export function normalizeModelContextWindows(value) {
  return Object.fromEntries(
    Object.entries(isSchemaPlainObject(value) ? value : {}).filter(
      ([id, option]) => isContextWindowSettingId(id) && isContextWindowOption(option)
    )
  );
}

/**
 * 归一化独立 Web 服务自动托管端口（`0` 表示关闭自动拉起，合法监听端口范围 `1024..65535`）。
 *
 * @param {unknown} port
 * @returns {number}
 */
export function normalizeStandalonePort(port) {
  const num = Number(port);
  if (!Number.isInteger(num) || num <= 0) return 0;
  if (num >= 1024 && num <= 65535) return num;
  return 0;
}

export const DEFAULT_SETTINGS_SCHEMA = Object.freeze({
  language: 'zh-CN',
  themeAccent: 'host',
  fontScale: 'md',
  weeklyTokenBudget: 150000000,
  weeklyCostBudget: 100,
  weeklyLimitMode: 'official',
  showUpstreamModel: false,
  orchestratorIdMode: 'compact',
  pluginUpdateMode: 'manual',
  autoUpdatePlugin: false,
  windowMountMode: 'dual',
  enableWindowOverlay: true,
  standalonePort: 0,
  showTopbarMultiSession: true,
  topbarCapsuleSlots: DEFAULT_TOPBAR_SLOTS,
  hoverModules: DEFAULT_HOVER_MODULES,
  overviewModules: DEFAULT_OVERVIEW_MODULES,
  overviewMetrics: DEFAULT_OVERVIEW_METRICS,
  showStepTurnRail: true,
  showStepAgentBadge: true,
  stepTableColumns: DEFAULT_STEP_TABLE_COLUMNS,
  modelContextWindows: Object.freeze({}),
});

/**
 * 创建一份深拷贝的全新默认偏好设置对象。
 */
export function createDefaultSettingsObject() {
  return {
    language: DEFAULT_SETTINGS_SCHEMA.language,
    themeAccent: DEFAULT_SETTINGS_SCHEMA.themeAccent,
    fontScale: DEFAULT_SETTINGS_SCHEMA.fontScale,
    weeklyTokenBudget: DEFAULT_SETTINGS_SCHEMA.weeklyTokenBudget,
    weeklyCostBudget: DEFAULT_SETTINGS_SCHEMA.weeklyCostBudget,
    weeklyLimitMode: DEFAULT_SETTINGS_SCHEMA.weeklyLimitMode,
    showUpstreamModel: DEFAULT_SETTINGS_SCHEMA.showUpstreamModel,
    orchestratorIdMode: DEFAULT_SETTINGS_SCHEMA.orchestratorIdMode,
    pluginUpdateMode: DEFAULT_SETTINGS_SCHEMA.pluginUpdateMode,
    autoUpdatePlugin: DEFAULT_SETTINGS_SCHEMA.autoUpdatePlugin,
    windowMountMode: DEFAULT_SETTINGS_SCHEMA.windowMountMode,
    enableWindowOverlay: DEFAULT_SETTINGS_SCHEMA.enableWindowOverlay,
    standalonePort: DEFAULT_SETTINGS_SCHEMA.standalonePort,
    showTopbarMultiSession: DEFAULT_SETTINGS_SCHEMA.showTopbarMultiSession,
    topbarCapsuleSlots: [...DEFAULT_TOPBAR_SLOTS],
    hoverModules: [...DEFAULT_HOVER_MODULES],
    overviewModules: [...DEFAULT_OVERVIEW_MODULES],
    overviewMetrics: [...DEFAULT_OVERVIEW_METRICS],
    showStepTurnRail: DEFAULT_SETTINGS_SCHEMA.showStepTurnRail,
    showStepAgentBadge: DEFAULT_SETTINGS_SCHEMA.showStepAgentBadge,
    stepTableColumns: [...DEFAULT_STEP_TABLE_COLUMNS],
    modelContextWindows: {},
  };
}

/**
 * 将原始持久化对象或增量合并结果完整归一化为合法偏好对象。
 *
 * @param {unknown} rawInput
 */
export function normalizeFullSettings(rawInput) {
  const safeRaw = isSchemaPlainObject(rawInput) ? rawInput : {};
  const pluginUpdateMode = normalizePluginUpdateMode(
    safeRaw.pluginUpdateMode,
    safeRaw.autoUpdatePlugin
  );
  const windowMountMode = normalizeWindowMountMode(
    safeRaw.windowMountMode,
    safeRaw.enableWindowOverlay
  );
  return {
    language: normalizeLanguageSetting(safeRaw.language),
    themeAccent: normalizeThemeAccent(safeRaw.themeAccent),
    fontScale: normalizeFontScale(safeRaw.fontScale),
    weeklyTokenBudget: schemaSanitizePositiveNum(
      safeRaw.weeklyTokenBudget ?? safeRaw.weeklyTokenLimit,
      DEFAULT_SETTINGS_SCHEMA.weeklyTokenBudget
    ),
    weeklyCostBudget: schemaSanitizePositiveNum(
      safeRaw.weeklyCostBudget,
      DEFAULT_SETTINGS_SCHEMA.weeklyCostBudget
    ),
    weeklyLimitMode: normalizeWeeklyLimitMode(safeRaw.weeklyLimitMode),
    showUpstreamModel: safeRaw.showUpstreamModel === true,
    orchestratorIdMode: normalizeOrchestratorIdMode(safeRaw.orchestratorIdMode),
    pluginUpdateMode,
    autoUpdatePlugin: pluginUpdateMode === 'auto',
    windowMountMode,
    enableWindowOverlay: windowMountMode !== 'sidebar',
    standalonePort: normalizeStandalonePort(safeRaw.standalonePort),
    showTopbarMultiSession: safeRaw.showTopbarMultiSession !== false,
    topbarCapsuleSlots: normalizeTopbarCapsuleSlots(safeRaw.topbarCapsuleSlots),
    hoverModules: normalizeHoverModules(safeRaw.hoverModules),
    overviewModules: normalizeOverviewModules(safeRaw.overviewModules),
    overviewMetrics: normalizeOverviewMetrics(safeRaw.overviewMetrics),
    showStepTurnRail: safeRaw.showStepTurnRail !== false,
    showStepAgentBadge: safeRaw.showStepAgentBadge !== false,
    stepTableColumns: normalizeStepTableColumns(safeRaw.stepTableColumns),
    modelContextWindows: normalizeModelContextWindows(safeRaw.modelContextWindows),
  };
}

