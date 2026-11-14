/**
 * @fileoverview Decoupled Step Table Column Registry (`stepColumnRegistry.js`).
 * Defines all 12 customizable columns for `StepsDetailView` ("按步查看"),
 * preserving 100% of the 7 out-of-the-box default columns, clickable agent filter badges,
 * speed reason sub-lines, token combo tooltips, and high-cost highlights.
 */

import { h, patchAttr, patchClasses, patchText } from '../core/domPatch.js';
import {
  formatMetric,
  formatTokens,
  formatUsd,
  resolveModelDisplayInfo,
  speedReasonText,
} from '../core/formatters.js';
import { isEnglishLocale, t } from '../i18n/index.js';
import {
  formatAgentBadgeText,
  formatAgentLabel,
  getAgentBadgeClass,
} from '../store/telemetryStore.js';

export const STEP_COLUMN_KEYS = Object.freeze([
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

export const DEFAULT_STEP_COLUMN_KEYS = Object.freeze([
  'step',
  'model',
  'tps',
  'ttft',
  'tokens_combo',
  'cache',
  'cost',
]);

function formatStepClockTime(createdAtMs) {
  const ms = Number(createdAtMs || 0);
  if (!(ms > 0) || !Number.isFinite(ms)) {
    return { text: '—', title: '' };
  }
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  const hhmmss = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  const full = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${hhmmss}`;
  return { text: hhmmss, title: full };
}

export const STEP_COLUMN_REGISTRY = Object.freeze({
  step: {
    key: 'step',
    thLabel: () => t('stepCol.step.th'),
    optLabel: () => t('stepCol.step.opt'),
    sigPart: (st, ctx) =>
      `${ctx.hasSubagents}:${ctx.scopeSigKey}:${st.agentId || 'main'}:${st.stepIndex}:${st.agentBadge || ''}:${st.agentLabel || ''}`,
    createCell: () => {
      const agentBadgeEl = h('span', {
        className: 'agent-badge is-clickable',
        hidden: true,
        style: 'margin-right: 4px;',
      });
      const stepNumText = h('span');
      const td = h('td', {}, [agentBadgeEl, stepNumText]);
      return { td, refs: { agentBadgeEl, stepNumText } };
    },
    updateCell: (refs, st, ctx) => {
      const { hasSubagents, effectiveScopes, onSelectAgentScopes } = ctx;
      patchAttr(refs.agentBadgeEl, 'hidden', !hasSubagents);
      if (hasSubagents) {
        const badgeCls = getAgentBadgeClass(st.agentIndex || 0, !st.isSubagent);
        patchAttr(refs.agentBadgeEl, 'class', `agent-badge is-clickable ${badgeCls}`);
        const badgeText = isEnglishLocale()
          ? formatAgentBadgeText({
              isMain: !st.isSubagent,
              index: st.agentIndex || 0,
              badgeText: st.agentBadge,
            })
          : st.agentBadge || (st.isSubagent ? '子' : '主');
        patchText(refs.agentBadgeEl, badgeText);

        const targetScope = st.agentId || 'main';
        const isSoleTarget =
          effectiveScopes.length === 1 && effectiveScopes[0] === targetScope;
        const agentName = isEnglishLocale()
          ? formatAgentLabel({
              isMain: !st.isSubagent,
              index: st.agentIndex || 0,
              role: st.agentRole || '',
            })
          : st.agentLabel || t('steps.unitAgent');
        patchAttr(
          refs.agentBadgeEl,
          'title',
          isSoleTarget
            ? t('steps.badgeBackAll')
            : t('steps.badgeFilterAgent', { agent: agentName })
        );
        refs.agentBadgeEl.onclick = (e) => {
          if (typeof onSelectAgentScopes !== 'function') return;
          if (e && (e.ctrlKey || e.metaKey || e.shiftKey) && effectiveScopes[0] !== 'all') {
            const next = effectiveScopes.includes(targetScope)
              ? effectiveScopes.filter((id) => id !== targetScope)
              : [...effectiveScopes, targetScope];
            onSelectAgentScopes(next.length > 0 ? next : ['all']);
          } else {
            onSelectAgentScopes(isSoleTarget ? ['all'] : [targetScope]);
          }
        };
      }
      patchText(refs.stepNumText, `#${Number(st.stepIndex)}`);
    },
  },

  time: {
    key: 'time',
    thLabel: () => t('stepCol.time.th'),
    optLabel: () => t('stepCol.time.opt'),
    sigPart: (st) => `${st.createdAtMs || 0}`,
    createCell: () => {
      const td = h('td', { className: 'text-muted' });
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      const { text, title } = formatStepClockTime(st.createdAtMs);
      patchText(refs.td, text);
      patchAttr(refs.td, 'title', title || null);
    },
  },

  model: {
    key: 'model',
    thLabel: () => t('stepCol.model.th'),
    optLabel: () => t('stepCol.model.opt'),
    sigPart: (st, ctx) => {
      const disp = resolveModelDisplayInfo(st, ctx.displaySettings, { fallback: '—' });
      return `${disp.text}:${disp.title}`;
    },
    createCell: () => {
      const td = h('td', {
        style: 'max-width: 120px; overflow: hidden; text-overflow: ellipsis;',
      });
      return { td, refs: { td } };
    },
    updateCell: (refs, st, ctx) => {
      const modelDisplay = resolveModelDisplayInfo(st, ctx.displaySettings, { fallback: '—' });
      patchText(refs.td, modelDisplay.text);
      patchAttr(refs.td, 'title', modelDisplay.title);
    },
  },

  tps: {
    key: 'tps',
    thLabel: () => t('stepCol.tps.th'),
    optLabel: () => t('stepCol.tps.opt'),
    sigPart: (st) => `${st.tokPerSec}:${st.selectedSpeedReason || ''}`,
    createCell: () => {
      const speedMain = h('strong', {
        className: 'cell-value accent-speed',
        style: 'font-size: var(--fs-base-sm);',
      });
      const speedReason = h('div', {
        className: 'text-muted',
        style: 'font-size: var(--fs-2xs);',
      });
      const td = h('td', {}, [speedMain, speedReason]);
      return { td, refs: { speedMain, speedReason } };
    },
    updateCell: (refs, st) => {
      patchText(refs.speedMain, formatMetric(st.tokPerSec, ' tok/s'));
      const reason = speedReasonText(st.selectedSpeedReason);
      patchText(refs.speedReason, reason);
      patchAttr(refs.speedReason, 'hidden', !reason);
    },
  },

  ttft: {
    key: 'ttft',
    thLabel: () => t('stepCol.ttft.th'),
    optLabel: () => t('stepCol.ttft.opt'),
    sigPart: (st) => `${st.ttftSec}`,
    createCell: () => {
      const td = h('td');
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      patchText(refs.td, formatMetric(st.ttftSec, 's'));
    },
  },

  duration: {
    key: 'duration',
    thLabel: () => t('stepCol.duration.th'),
    optLabel: () => t('stepCol.duration.opt'),
    sigPart: (st) => `${st.totalDurationSec ?? st.streamDurationSec ?? ''}`,
    createCell: () => {
      const td = h('td');
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      const dur = st.totalDurationSec ?? st.streamDurationSec ?? null;
      patchText(refs.td, formatMetric(dur, 's'));
    },
  },

  tokens_combo: {
    key: 'tokens_combo',
    thLabel: () => t('stepCol.tokens_combo.th'),
    optLabel: () => t('stepCol.tokens_combo.opt'),
    sigPart: (st) =>
      `${st.contextTokens}:${st.outputTokens}:${st.thinkingTokens}:${st.responseTokens}`,
    createCell: () => {
      const td = h('td');
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      const outTok = Math.max(0, Number(st.outputTokens || 0));
      const thinkTok = Math.max(0, Number(st.thinkingTokens || 0));
      const respTok =
        st.responseTokens != null
          ? Math.max(0, Number(st.responseTokens))
          : Math.max(0, outTok - thinkTok);
      patchText(
        refs.td,
        `${formatTokens(st.contextTokens)} / ${formatTokens(thinkTok)} / ${formatTokens(respTok)}`
      );
      patchAttr(
        refs.td,
        'title',
        t('steps.ctxTitle', {
          ctx: Math.round(Number(st.contextTokens || 0)),
          think: Math.round(thinkTok),
          resp: Math.round(respTok),
        })
      );
    },
  },

  input_tokens: {
    key: 'input_tokens',
    thLabel: () => t('stepCol.input_tokens.th'),
    optLabel: () => t('stepCol.input_tokens.opt'),
    sigPart: (st) => `${st.inputTokens || 0}`,
    createCell: () => {
      const td = h('td');
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      patchText(refs.td, formatTokens(st.inputTokens || 0));
    },
  },

  cache_tokens: {
    key: 'cache_tokens',
    thLabel: () => t('stepCol.cache_tokens.th'),
    optLabel: () => t('stepCol.cache_tokens.opt'),
    sigPart: (st) => `${st.cacheReadTokens || 0}`,
    createCell: () => {
      const td = h('td');
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      patchText(refs.td, formatTokens(st.cacheReadTokens || 0));
    },
  },

  output_tokens: {
    key: 'output_tokens',
    thLabel: () => t('stepCol.output_tokens.th'),
    optLabel: () => t('stepCol.output_tokens.opt'),
    sigPart: (st) => `${st.outputTokens || 0}`,
    createCell: () => {
      const td = h('td');
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      patchText(refs.td, formatTokens(st.outputTokens || 0));
    },
  },

  cache: {
    key: 'cache',
    thLabel: () => t('stepCol.cache.th'),
    optLabel: () => t('stepCol.cache.opt'),
    sigPart: (st) => `${st.cacheHitPct ?? 0}`,
    createCell: () => {
      const td = h('td', {
        className: 'cell-value accent-ok',
        style: 'font-size: var(--fs-base-sm);',
      });
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      patchText(refs.td, `${Number(st.cacheHitPct ?? 0)}%`);
    },
  },

  cost: {
    key: 'cost',
    thLabel: () => t('stepCol.cost.th'),
    optLabel: () => t('stepCol.cost.opt'),
    sigPart: (st) => `${st.costUsd}`,
    createCell: () => {
      const td = h('td', { style: 'font-weight: 600;' });
      return { td, refs: { td } };
    },
    updateCell: (refs, st) => {
      const costVal = st.costUsd;
      patchText(refs.td, formatUsd(costVal, { precise: true }));
      patchClasses(refs.td, { 'accent-speed': costVal >= 0.15 });
    },
  },
});

export function getStepColumnOptions() {
  return STEP_COLUMN_KEYS.map((key) => ({
    value: key,
    label: STEP_COLUMN_REGISTRY[key].optLabel(),
  }));
}
