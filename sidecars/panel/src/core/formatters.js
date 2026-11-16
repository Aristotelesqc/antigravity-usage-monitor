/**
 * @fileoverview Pure formatting utilities for speed metrics, token counts,
 * USD estimates, countdown timers, and custom datetime displays.
 */

import { isEnglishLocale, t } from '../i18n/index.js';

const EN_MONTH_SHORT = Object.freeze([
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]);

export function formatMetric(value, unit = '') {
  return Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : '—';
}

export function formatCachePct(value) {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  const num = Math.max(0, Math.min(100, +Number(value).toFixed(1)));
  return `${num}%`;
}

export function getSpeedToneClass(tokPerSec) {
  if (tokPerSec == null || !Number.isFinite(Number(tokPerSec)) || Number(tokPerSec) <= 0) {
    return 'tone-muted';
  }
  const v = Number(tokPerSec);
  if (v >= 60) return 'tone-good';
  if (v >= 35) return 'tone-info';
  if (v >= 20) return 'tone-warn';
  return 'tone-danger';
}

export function getCacheToneClass(cacheHitPct, promptTokens = null) {
  if (cacheHitPct == null || !Number.isFinite(Number(cacheHitPct))) {
    return 'tone-muted';
  }
  const v = Number(cacheHitPct);
  if (promptTokens != null && Number(promptTokens) <= 0 && v <= 0) {
    return 'tone-muted';
  }
  if (v >= 85) return 'tone-good';
  if (v >= 65) return 'tone-info';
  if (v >= 30) return 'tone-warn';
  return 'tone-danger';
}

export function getStepCostToneClass(costUsd) {
  if (costUsd == null || !Number.isFinite(Number(costUsd))) return '';
  const v = Number(costUsd);
  if (v >= 0.3) return 'tone-danger';
  if (v >= 0.15) return 'tone-warn';
  return '';
}

export function getTtftToneClass(ttftSec) {
  if (ttftSec == null || !Number.isFinite(Number(ttftSec)) || Number(ttftSec) < 0) return '';
  const v = Number(ttftSec);
  if (v >= 30) return 'tone-danger';
  if (v >= 18) return 'tone-warn';
  return '';
}

export function formatTokens(num) {
  const n = Number(num || 0);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

export function formatTokensPrecise(num) {
  const n = Number(num || 0);
  if (n <= 0) return '0';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(Math.round(n));
}

export function formatCnyApprox(usdAmount, rate = 7.2) {
  const rmb = Number(usdAmount || 0) * rate;
  if (rmb <= 0) return '≈ ¥0';
  if (rmb >= 10) return `≈ ¥${Math.round(rmb)}`;
  return `≈ ¥${rmb.toFixed(1)}`;
}

export function formatDateSpanBadge(startMs, endMs) {
  const s = startMs && Number.isFinite(startMs) ? new Date(startMs) : new Date();
  const e = endMs && Number.isFinite(endMs) ? new Date(endMs) : new Date();
  if (isEnglishLocale()) {
    const sMon = EN_MONTH_SHORT[s.getMonth()] || '';
    const eMon = EN_MONTH_SHORT[e.getMonth()] || '';
    if (s.getFullYear() !== e.getFullYear()) {
      return `${sMon} ${s.getDate()}, ${s.getFullYear()} ~ ${eMon} ${e.getDate()}, ${e.getFullYear()}`;
    }
    return `${sMon} ${s.getDate()} ~ ${eMon} ${e.getDate()}`;
  }
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 ~ ${e.getFullYear()}年${e.getMonth() + 1}月${e.getDate()}日`;
  }
  return `${s.getMonth() + 1}月${s.getDate()}日 ~ ${e.getMonth() + 1}月${e.getDate()}日`;
}

export function formatUsd(amount, { precise = false } = {}) {
  if (amount == null || !Number.isFinite(Number(amount))) return t('fmt.pending');
  const val = Number(amount || 0);
  if (precise) {
    if (val > 0 && val < 0.001) return '<$0.001';
    return val >= 1 ? `$${val.toFixed(2)}` : `$${val.toFixed(3)}`;
  }
  return `$${val.toFixed(2)}`;
}

const SPEED_REASON_LABELS = {
  __proto__: null,
  incomplete_or_invalid_timing: 'fmt.speedIncomplete',
  canceled: 'fmt.speedCanceled',
  compaction_timing_unavailable: 'fmt.speedCompactionTimingUnavailable',
  invalid_output_tokens: 'fmt.speedInvalidOutput',
  inconsistent_timing: 'fmt.speedInconsistent',
  short_timing: 'fmt.speedShort',
  legacy_cache: 'fmt.speedLegacy',
};

export function speedReasonText(reason) {
  const label = SPEED_REASON_LABELS[reason];
  return label ? t(label) : '';
}

export function sampleSummary(summary) {
  const valid = summary?.sampleCount || 0;
  const excluded = summary?.excludedCount || 0;
  return t('fmt.sampleSteps', { valid, total: valid + excluded });
}

export function formatCountdown(isoTime, nowMs = Date.now()) {
  if (!isoTime) return t('fmt.resetUnknown');
  const targetMs = Date.parse(isoTime);
  if (!Number.isFinite(targetMs) || targetMs <= 0) return t('fmt.resetUnknown');
  const diffMs = targetMs - nowMs;
  if (diffMs <= 0) return t('fmt.resetSoon');
  if (diffMs < 60_000) return t('fmt.resetUnder1m');

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return t('fmt.resetDaysHours', { d: days, h: hours });
  if (hours > 0) return t('fmt.resetHoursMins', { h: hours, m: minutes });
  return t('fmt.resetMins', { m: minutes });
}

export function formatCompactDateTime(ms) {
  if (!ms || !Number.isFinite(ms)) return t('fmt.selectTime');
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatElapsedSec(seconds) {
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
 * 归一化普通模型显示模式（`'short'` 精简代号 | `'upstream_compact'` 去厂商前缀原始 ID | `'upstream'` 完整原始 ID）。
 *
 * @param {unknown} mode
 * @param {unknown} [legacyShowUpstream]
 * @returns {'short'|'upstream_compact'|'upstream'}
 */
export function normalizeModelDisplayMode(mode, legacyShowUpstream) {
  const m = String(mode ?? '').trim().toLowerCase();
  if (m === 'upstream' || m === 'raw' || m === 'full') return 'upstream';
  if (m === 'upstream_compact' || m === 'compact_upstream' || m === 'trimmed') {
    return 'upstream_compact';
  }
  if (m === 'short') return 'short';
  if (legacyShowUpstream === true) return 'upstream';
  return 'short';
}

/**
 * 隐藏原始模型 ID 开头的 `gemini-`、`claude-`、`gpt-` 厂商前缀以节省单行表格空间（确保剥离后非空）。
 *
 * @param {string} rawText
 * @returns {string}
 */
export function stripVendorModelPrefix(rawText) {
  return String(rawText || '')
    .trim()
    .replace(/^(?:gemini|claude|gpt)-(?=.+)/i, '');
}

function stripCompactionMarker(rawText) {
  return String(rawText || '')
    .replace(/(?:·(?:压缩|compact)|\[自动压缩\]|\[auto[- ]?compact\])\s*$/iu, '')
    .trim();
}

/**
 * 归一化 Orchestrator 系列 ID 显示格式枚举（`'compact'` 精简代号 vs `'full'` 原始完整 ID，默认 `'compact'`）。
 *
 * @param {unknown} mode
 * @returns {'compact'|'full'}
 */
export function normalizeOrchestratorIdDisplayMode(mode) {
  return String(mode ?? '').trim().toLowerCase() === 'full' ? 'full' : 'compact';
}

/**
 * 统一解析步骤、会话摘要或模型汇总行面向用户的模型显示文本与悬停提示。
 *
 * 规则：
 * - Orchestrator 系列（`Orchestrator (Carbon)`、`Orchestrator (Argon)`、`gemini-flash-worker-agy` / `M669`）
 *   独立遵循 `orchestratorIdMode`（`'compact'` 显示 `orchestrator-carbon` / `orchestrator-argon` / `worker-agy-hydrogen`；
 *   `'full'` 显示带括号标注的完整上游 ID），不受普通模型显示模式影响；
 * - 其余普通模型遵循 `modelDisplayMode`（`'short'` | `'upstream_compact'` | `'upstream'`，兼容旧版布尔 `showUpstreamModel`）；
 * - 独立拆分 `baseText` 与 `compactionSuffix`（`·压缩`），供步骤表单独保护压缩尾标永不截断。
 *
 * @param {object|null|undefined} target
 * @param {{ modelDisplayMode?: string, showUpstreamModel?: boolean, orchestratorIdMode?: string }|boolean} [settings]
 * @param {{ preferLabelInShort?: boolean, fallback?: string }} [options]
 * @returns {{ text: string, baseText: string, compactionSuffix: string, isCompaction: boolean, title: string, isOrchestratorSeries: boolean }}
 */
export function resolveModelDisplayInfo(target, settings = {}, options = {}) {
  const modelDisplayMode =
    typeof settings === 'boolean'
      ? settings
        ? 'upstream'
        : 'short'
      : normalizeModelDisplayMode(settings?.modelDisplayMode, settings?.showUpstreamModel);
  const showUpstream = modelDisplayMode !== 'short';
  const orchestratorMode = normalizeOrchestratorIdDisplayMode(
    typeof settings === 'object' && settings ? settings.orchestratorIdMode : 'compact'
  );
  const preferLabelInShort = Boolean(options?.preferLabelInShort);
  const fallback = options?.fallback ?? t('fmt.unknownModel');

  if (!target || typeof target !== 'object') {
    return {
      text: fallback,
      baseText: fallback,
      compactionSuffix: '',
      isCompaction: false,
      title: fallback,
      isOrchestratorSeries: false,
    };
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
    /·(?:压缩|compact)\s*$/iu.test(shortText) ||
    /·(?:压缩|compact)\s*$/iu.test(upstreamText) ||
    /·(?:压缩|compact)\s*$/iu.test(labelText) ||
    /\[自动压缩\]\s*$/u.test(labelText);

  const compactionSuffix = isCompaction ? t('fmt.compactionSuffix') : '';

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
    const baseText = orchestratorMode === 'full' ? fullId : compactId;
    const text = `${baseText}${compactionSuffix}`;
    const multiUpstream =
      Array.isArray(target.upstreamModels) && target.upstreamModels.length > 1
        ? target.upstreamModels.join(' / ')
        : '';
    const title = multiUpstream || `${fullId}${compactionSuffix}`;
    return {
      text,
      baseText,
      compactionSuffix,
      isCompaction,
      title,
      isOrchestratorSeries: true,
    };
  }

  const rawSelected =
    (showUpstream
      ? upstreamText || responseText || shortText || labelText
      : preferLabelInShort
        ? labelText || shortText
        : shortText || labelText) || fallback;
  const cleanRawBase = stripCompactionMarker(rawSelected) || fallback;
  const baseText =
    modelDisplayMode === 'upstream_compact'
      ? stripVendorModelPrefix(cleanRawBase) || cleanRawBase
      : cleanRawBase;
  const text = `${baseText}${compactionSuffix}`;
  const fullUpstreamWithSuffix = `${cleanRawBase}${compactionSuffix}`;
  const standardTitle =
    showUpstream && Array.isArray(target.upstreamModels) && target.upstreamModels.length > 1
      ? target.upstreamModels.join(' / ')
      : showUpstream
        ? fullUpstreamWithSuffix
        : text;
  return {
    text,
    baseText,
    compactionSuffix,
    isCompaction,
    title: standardTitle,
    isOrchestratorSeries: false,
  };
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
export function mergeModelsByDisplayName(models = [], settings = {}, options = {}) {
  if (!Array.isArray(models) || models.length === 0) return [];
  const showUpstream =
    typeof settings === 'boolean'
      ? settings
      : normalizeModelDisplayMode(settings?.modelDisplayMode, settings?.showUpstreamModel) !== 'short';
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
