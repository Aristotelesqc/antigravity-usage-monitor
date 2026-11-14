/**
 * @fileoverview Decoupled Metric Registry (`metricRegistry.js`).
 * Centralizes presentation & option metadata for:
 * 1. Topbar / Composer Capsule Slots (1..5 items out of 13 metrics)
 * 2. Live Overview / Hover First-Row Metric Matrix (1..4 items out of 9 metrics)
 */

import {
  formatMetric,
  formatTokens,
  formatUsd,
  resolveModelDisplayInfo,
  sampleSummary,
  speedReasonText,
} from '../core/formatters.js';
import { isEnglishLocale, t } from '../i18n/index.js';

export const CAPSULE_METRIC_KEYS = Object.freeze([
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

const THIRD_PARTY_FAMILY_RE = /claude|gpt|anthropic|openai|3p|sonnet|opus|haiku/i;

export function getCapsuleMetricOptions() {
  return CAPSULE_METRIC_KEYS.map((key) => ({
    value: key,
    label: t(`capMetric.${key}`),
  }));
}

export function getOverviewMetricOptions() {
  return OVERVIEW_METRIC_KEYS.map((key) => ({
    value: key,
    label: t(`ovMetric.${key}`),
  }));
}

export function resolveQuotaCapsuleSummary(quotas) {
  if (!quotas) return null;
  const activePool = quotas.activePool;
  const weekly = quotas.weekly;
  const candidates = [];
  const defaultPoolName = isEnglishLocale() ? 'Active Pool' : '当前池';
  const wkTag = isEnglishLocale() ? 'Wk' : '周';

  if (activePool && Number.isFinite(Number(activePool.remainingPct))) {
    candidates.push({
      pct: Number(activePool.remainingPct),
      label: activePool.poolLabel || activePool.family || defaultPoolName,
      windowTag: '5h',
    });
  }
  if (activePool && Number.isFinite(Number(activePool.weeklyRemainingPct))) {
    candidates.push({
      pct: Number(activePool.weeklyRemainingPct),
      label: activePool.poolLabel || activePool.family || defaultPoolName,
      windowTag: wkTag,
    });
  }
  if (!candidates.length && weekly && Number.isFinite(Number(weekly.remainingPct))) {
    candidates.push({
      pct: Number(weekly.remainingPct),
      label: weekly.poolFamily || (isEnglishLocale() ? 'Weekly' : '周限额'),
      windowTag: wkTag,
    });
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.pct - b.pct);
  const tightest = candidates[0];
  const rounded = Math.max(0, Math.min(100, Math.round(tightest.pct)));
  return {
    roundedPct: rounded,
    shortText: t('capsule.quotaLeft', { pct: rounded }),
    detailText: candidates
      .map((c) => {
        const cPct = Math.max(0, Math.min(100, Math.round(c.pct)));
        return `${c.label} ${c.windowTag} ${t('capsule.quotaLeft', { pct: cPct })}`;
      })
      .join(' · '),
  };
}

/**
 * 解析指定模型池（Gemini 或 Claude & GPT）与指定时间窗口（5h 或周额度）的剩余百分比摘要。
 *
 * @param {object|null|undefined} quotas
 * @param {'gemini_5h'|'gemini_weekly'|'claude_5h'|'claude_weekly'} slotKey
 * @returns {{ roundedPct: number, shortText: string } | null}
 */
export function resolveSpecificQuotaSlotSummary(quotas, slotKey) {
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
    shortText: t('capsule.quotaLeft', { pct: rounded }),
  };
}

export function formatCompactCapsuleCost(costUsd) {
  if (costUsd == null || !Number.isFinite(Number(costUsd))) return '--';
  const val = Math.max(0, Number(costUsd));
  if (val === 0) return '$0.00';
  if (val < 0.001) return '<$0.001';
  if (val < 1) return `$${val.toFixed(3)}`;
  if (val < 100) return `$${val.toFixed(2)}`;
  return `$${Math.round(val)}`;
}

export function formatCompactCapsuleTtft(ttftSec) {
  if (ttftSec == null || !Number.isFinite(Number(ttftSec)) || Number(ttftSec) < 0) return '--s';
  const val = Number(ttftSec);
  if (val < 1) return `${val.toFixed(2)}s`;
  if (val < 100) return `${val.toFixed(1)}s`;
  return `${Math.round(val)}s`;
}

/**
 * 解析顶栏/输入框精简胶囊单槽位展示结构。
 *
 * @param {string} metricKey
 * @param {object} slotCtx
 * @param {number} ringCircumference
 */
export function resolveCapsuleMetricPresentation(metricKey, slotCtx, ringCircumference) {
  if (!metricKey || metricKey === 'none') {
    return {
      hidden: true,
      metric: 'none',
      segClass: 'wm-cap-slot',
      textClass: 'wm-slot-text',
      showRing: false,
      dashOffset: ringCircumference,
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
        dashOffset: ringCircumference,
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
        dashOffset: ringCircumference,
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
        ? t('capsule.tpsRunning')
        : t('capsule.tpsIdle');
    return {
      hidden: false,
      metric: 'tps',
      segClass: 'wm-cap-slot wm-seg-speed',
      textClass: 'wm-slot-text wm-speed-text',
      showRing: false,
      dashOffset: ringCircumference,
      text: tpsText,
      running: Boolean(slotCtx.isRunning),
      warn: false,
      danger: false,
    };
  }

  if (metricKey === 'avg_tps') {
    const avgVal = slotCtx.hasTelemetry ? slotCtx.avgTps : null;
    const valid = Number.isFinite(avgVal) && avgVal > 0;
    return {
      hidden: false,
      metric: 'avg_tps',
      segClass: 'wm-cap-slot wm-seg-speed',
      textClass: 'wm-slot-text wm-speed-text',
      showRing: false,
      dashOffset: ringCircumference,
      text: valid ? `${avgVal >= 100 ? Math.round(avgVal) : avgVal.toFixed(1)} t/s` : '-- t/s',
      running: false,
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
      dashOffset: ringCircumference,
      text: valid ? formatCompactCapsuleTtft(numVal) : '--s',
      running: false,
      warn: isWarn,
      danger: isDanger,
    };
  }

  if (metricKey === 'cost' || metricKey === 'session_cost') {
    const costVal = !slotCtx.hasTelemetry
      ? null
      : metricKey === 'session_cost'
        ? slotCtx.sessionCost
        : slotCtx.stepCost;
    return {
      hidden: false,
      metric: metricKey,
      segClass: 'wm-cap-slot wm-seg-cost',
      textClass: 'wm-slot-text wm-cost-text',
      showRing: false,
      dashOffset: ringCircumference,
      text: slotCtx.hasTelemetry ? formatCompactCapsuleCost(costVal) : '--',
      running: false,
      warn: false,
      danger: false,
    };
  }

  if (metricKey === 'cache_hit') {
    const cachePct = slotCtx.hasTelemetry ? slotCtx.cacheHitPct : null;
    const valid = cachePct != null && Number.isFinite(Number(cachePct));
    return {
      hidden: false,
      metric: 'cache_hit',
      segClass: 'wm-cap-slot wm-seg-cache',
      textClass: 'wm-slot-text wm-cache-text',
      showRing: false,
      dashOffset: ringCircumference,
      text: valid ? `${Math.round(Number(cachePct))}%` : '--%',
      running: false,
      warn: false,
      danger: false,
    };
  }

  if (metricKey === 'session_tokens') {
    const tokVal = slotCtx.hasTelemetry ? slotCtx.sessionTokens : null;
    const valid = tokVal != null && Number.isFinite(Number(tokVal)) && Number(tokVal) >= 0;
    return {
      hidden: false,
      metric: 'session_tokens',
      segClass: 'wm-cap-slot wm-seg-tokens',
      textClass: 'wm-slot-text wm-tokens-text',
      showRing: false,
      dashOffset: ringCircumference,
      text: valid ? formatTokens(Number(tokVal)) : '--',
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
    dashOffset: ringCircumference,
    text: quotaSum ? quotaSum.shortText : t('capsule.quotaUnknown'),
    running: false,
    warn: isWarn,
    danger: isDanger,
  };
}

function translateRawAgentBadge(rawBadge) {
  if (!rawBadge) return '';
  if (!isEnglishLocale()) return String(rawBadge);
  const str = String(rawBadge).trim();
  if (str === '主') return t('fmt.mainBadge');
  const m = str.match(/^子(\d+)$/);
  if (m) return t('fmt.subBadge', { index: m[1] });
  if (str === '子') return t('fmt.subBadgeShort');
  return str;
}

/**
 * 解析实时监控第一行矩阵单个单元格的展示数据。
 *
 * @param {string} metricKey
 * @param {{ active?: object, ctx?: object, quotas?: object, settings?: object, hasSubagents?: boolean }} cellCtx
 */
export function resolveOverviewMetricCell(metricKey, cellCtx = {}) {
  const active = cellCtx.active || {};
  const ctx = cellCtx.ctx || active.context || {};
  const quotas = cellCtx.quotas || {};
  const settings = cellCtx.settings || {};
  const hasSubagents = Boolean(cellCtx.hasSubagents);
  const hasAnySteps = Number(active.stepCount || 0) > 0;

  if (metricKey === 'tps') {
    const activeModelDisplay = resolveModelDisplayInfo(active, settings, {
      fallback: t('fmt.unknownModel'),
    }).text;
    const reason = speedReasonText(active.latestSpeedReason);
    const badgeStr = translateRawAgentBadge(active.activeAgentBadge);
    const modelAndAgent =
      hasSubagents && badgeStr ? `[${badgeStr}] ${activeModelDisplay}` : activeModelDisplay;
    return {
      key: 'tps',
      label: t('ovMetric.tps'),
      icon: 'dot',
      iconSize: 10,
      isPulsing: Boolean(active.isRunning),
      valueText: formatMetric(active.latestTokPerSec, ' tok/s'),
      valueClass: 'cell-value accent-speed',
      subText: reason ? `${modelAndAgent} · ${reason}` : modelAndAgent,
      subClass: 'cell-sub',
    };
  }

  if (metricKey === 'ttft') {
    return {
      key: 'ttft',
      label: t('ovMetric.ttft'),
      icon: 'clock',
      iconSize: 11,
      isPulsing: false,
      valueText: formatMetric(active.latestTtftSec, 's'),
      valueClass: 'cell-value',
      subText: t('ovMetric.subAvgTtft', {
        val: formatMetric(active.ttftSummary?.avgSec, 's'),
      }),
      subClass: 'cell-sub',
    };
  }

  if (metricKey === 'avg_tps') {
    return {
      key: 'avg_tps',
      label: t('ovMetric.avg_tps'),
      icon: 'pulse',
      iconSize: 11,
      isPulsing: false,
      valueText: formatMetric(active.avgTokPerSec, ' tok/s'),
      valueClass: 'cell-value',
      subText: t('ovMetric.subValidSamples', {
        samples: sampleSummary(active.speedSummary),
      }),
      subClass: 'cell-sub',
    };
  }

  if (metricKey === 'step_cost') {
    const stepCost = active.latestStepCostUsd;
    return {
      key: 'step_cost',
      label: t('ovMetric.step_cost'),
      icon: 'bolt',
      iconSize: 11,
      isPulsing: false,
      valueText: !hasAnySteps && stepCost == null ? '—' : formatUsd(stepCost, { precise: true }),
      valueClass: 'cell-value',
      subText: t('ovMetric.subCacheAndTotal', {
        cache: active.latestCacheHitPct ?? 0,
        cost: formatUsd(active.sessionCostUsd || 0),
      }),
      subClass: 'cell-sub accent-ok',
    };
  }

  if (metricKey === 'session_cost') {
    const sessCost = Number(active.sessionCostUsd || 0);
    const stepCnt = Number(active.stepCount || 0);
    const isAllUnpriced =
      stepCnt > 0 && Number(active.sessionUnpricedCalls || 0) >= stepCnt && !(sessCost > 0);
    return {
      key: 'session_cost',
      label: t('ovMetric.session_cost'),
      icon: 'bolt',
      iconSize: 11,
      isPulsing: false,
      valueText:
        !hasAnySteps && active.sessionCostUsd == null
          ? '—'
          : formatUsd(isAllUnpriced ? null : sessCost, {
              precise: sessCost > 0 && sessCost < 0.1,
            }),
      valueClass: 'cell-value',
      subText: t('ovMetric.subStepsAndCache', {
        steps: stepCnt,
        cache: Math.round(Number(active.sessionCacheHitPct ?? active.latestCacheHitPct ?? 0)),
      }),
      subClass: 'cell-sub accent-ok',
    };
  }

  if (metricKey === 'cache_hit') {
    const avgCache = Number(active.sessionCacheHitPct ?? active.latestCacheHitPct ?? 0);
    const latestCache = Number(active.latestCacheHitPct ?? 0);
    return {
      key: 'cache_hit',
      label: t('ovMetric.cache_hit'),
      icon: 'layers',
      iconSize: 11,
      isPulsing: false,
      valueText: !hasAnySteps ? '—' : `${Math.round(avgCache)}%`,
      valueClass: 'cell-value accent-ok',
      subText: t('ovMetric.subPromptHit', {
        latest: Math.round(latestCache),
        avg: Math.round(avgCache),
      }),
      subClass: 'cell-sub',
    };
  }

  if (metricKey === 'session_tokens') {
    const inTok = Math.max(0, Number(active.inputTokens || 0));
    const cacheTok = Math.max(0, Number(active.cacheReadTokens || 0));
    const outTok = Math.max(0, Number(active.outputTokens || 0));
    const totalTok = Math.max(0, Number(active.totalTokens ?? inTok + cacheTok + outTok));
    return {
      key: 'session_tokens',
      label: t('ovMetric.session_tokens'),
      icon: 'chart-bar',
      iconSize: 11,
      isPulsing: false,
      valueText: !hasAnySteps && !totalTok ? '—' : formatTokens(totalTok),
      valueClass: 'cell-value',
      subText: t('ovMetric.subInOutTokens', {
        inTok: formatTokens(inTok + cacheTok),
        outTok: formatTokens(outTok),
      }),
      subClass: 'cell-sub',
    };
  }

  if (metricKey === 'context_usage') {
    const limitTokens = Number(ctx.compactionLimitTokens || ctx.limitTokens || 256000);
    const totalTokens = Number(ctx.totalTokens || 0);
    const usedPct =
      limitTokens > 0 ? Math.min(100, +((totalTokens / limitTokens) * 100).toFixed(1)) : 0;
    const toneCls =
      usedPct >= 88
        ? 'cell-value tone-danger'
        : usedPct >= 70
          ? 'cell-value tone-warn'
          : 'cell-value';
    return {
      key: 'context_usage',
      label: t('ovMetric.context_usage'),
      icon: 'layers',
      iconSize: 11,
      isPulsing: false,
      valueText: `${usedPct}%`,
      valueClass: toneCls,
      subText: t('ovMetric.subCtxRatio', {
        used: formatTokens(totalTokens),
        limit: formatTokens(limitTokens),
      }),
      subClass: 'cell-sub',
    };
  }

  const quotaSum = resolveQuotaCapsuleSummary(quotas);
  const quotaToneCls =
    quotaSum && quotaSum.roundedPct <= 15
      ? 'cell-value tone-danger'
      : quotaSum && quotaSum.roundedPct <= 30
        ? 'cell-value tone-warn'
        : 'cell-value';
  return {
    key: 'quota_tightest',
    label: t('ovMetric.quota_tightest'),
    icon: 'pulse',
    iconSize: 11,
    isPulsing: false,
    valueText: quotaSum ? quotaSum.shortText : '—',
    valueClass: quotaToneCls,
    subText: quotaSum
      ? t('ovMetric.subQuotaPool', { label: quotaSum.detailText })
      : t('ovMetric.subQuotaPending'),
    subClass: 'cell-sub',
  };
}
