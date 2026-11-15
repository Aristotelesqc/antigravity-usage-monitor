/**
 * @fileoverview Decoupled Step Table Column Registry (`stepColumnRegistry.js`).
 * Defines all 12 customizable columns for `StepsDetailView` ("按步查看"),
 * preserving 100% of the 7 out-of-the-box default columns, clickable agent filter badges,
 * speed reason sub-lines, token combo tooltips, and high-cost highlights.
 */

import { h, patchAttr, patchText } from '../core/domPatch.js';
import {
  formatCachePct,
  formatMetric,
  formatTokens,
  formatUsd,
  getCacheToneClass,
  getSpeedToneClass,
  getStepCostToneClass,
  getTtftToneClass,
  resolveModelDisplayInfo,
  speedReasonText,
} from '../core/formatters.js';
import { t } from '../i18n/index.js';

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
    sigPart: (st) => `${st.stepIndex}`,
    createCell: () => {
      const valEl = h('span');
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      patchText(refs.valEl, `#${Number(st.stepIndex)}`);
    },
  },

  time: {
    key: 'time',
    thLabel: () => t('stepCol.time.th'),
    optLabel: () => t('stepCol.time.opt'),
    sigPart: (st) => `${st.createdAtMs || 0}`,
    createCell: () => {
      const valEl = h('span');
      const td = h('td', { className: 'text-muted' }, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      const { text, title } = formatStepClockTime(st.createdAtMs);
      patchText(refs.valEl, text);
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
      const valEl = h('span', {
        style:
          'display: inline-block; max-width: 120px; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom;',
      });
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st, ctx) => {
      const modelDisplay = resolveModelDisplayInfo(st, ctx.displaySettings, { fallback: '—' });
      patchText(refs.valEl, modelDisplay.text);
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
        className: 'cell-value tone-muted',
        style: 'font-size: var(--fs-base-sm);',
      });
      const wrapEl = h(
        'span',
        { style: 'display: inline-block; vertical-align: middle;' },
        [speedMain]
      );
      const td = h('td', {}, [wrapEl]);
      return { td, refs: { wrapEl, speedMain, speedReason: null } };
    },
    updateCell: (refs, st) => {
      patchText(refs.speedMain, formatMetric(st.tokPerSec, ' tok/s'));
      patchAttr(refs.speedMain, 'class', `cell-value ${getSpeedToneClass(st.tokPerSec)}`);
      const reason = speedReasonText(st.selectedSpeedReason);
      if (reason && !refs.speedReason) {
        refs.speedReason = h('div', {
          className: 'text-muted',
          style: 'font-size: var(--fs-2xs);',
        });
        refs.wrapEl.appendChild(refs.speedReason);
      }
      if (refs.speedReason) {
        patchText(refs.speedReason, reason);
        patchAttr(refs.speedReason, 'hidden', !reason);
      }
    },
  },

  ttft: {
    key: 'ttft',
    thLabel: () => t('stepCol.ttft.th'),
    optLabel: () => t('stepCol.ttft.opt'),
    sigPart: (st) => `${st.ttftSec}`,
    createCell: () => {
      const valEl = h('span');
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      patchText(refs.valEl, formatMetric(st.ttftSec, 's'));
      const tone = getTtftToneClass(st.ttftSec);
      patchAttr(refs.valEl, 'class', tone || null);
    },
  },

  duration: {
    key: 'duration',
    thLabel: () => t('stepCol.duration.th'),
    optLabel: () => t('stepCol.duration.opt'),
    sigPart: (st) => `${st.totalDurationSec ?? st.streamDurationSec ?? ''}`,
    createCell: () => {
      const valEl = h('span');
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      const dur = st.totalDurationSec ?? st.streamDurationSec ?? null;
      patchText(refs.valEl, formatMetric(dur, 's'));
    },
  },

  tokens_combo: {
    key: 'tokens_combo',
    thLabel: () => t('stepCol.tokens_combo.th'),
    optLabel: () => t('stepCol.tokens_combo.opt'),
    sigPart: (st) =>
      `${st.contextTokens}:${st.outputTokens}:${st.thinkingTokens}:${st.responseTokens}`,
    createCell: () => {
      const valEl = h('span');
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      const outTok = Math.max(0, Number(st.outputTokens || 0));
      const thinkTok = Math.max(0, Number(st.thinkingTokens || 0));
      const respTok =
        st.responseTokens != null
          ? Math.max(0, Number(st.responseTokens))
          : Math.max(0, outTok - thinkTok);
      patchText(
        refs.valEl,
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
      const valEl = h('span');
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      patchText(refs.valEl, formatTokens(st.inputTokens || 0));
    },
  },

  cache_tokens: {
    key: 'cache_tokens',
    thLabel: () => t('stepCol.cache_tokens.th'),
    optLabel: () => t('stepCol.cache_tokens.opt'),
    sigPart: (st) => `${st.cacheReadTokens || 0}`,
    createCell: () => {
      const valEl = h('span');
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      patchText(refs.valEl, formatTokens(st.cacheReadTokens || 0));
    },
  },

  output_tokens: {
    key: 'output_tokens',
    thLabel: () => t('stepCol.output_tokens.th'),
    optLabel: () => t('stepCol.output_tokens.opt'),
    sigPart: (st) => `${st.outputTokens || 0}`,
    createCell: () => {
      const valEl = h('span');
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      patchText(refs.valEl, formatTokens(st.outputTokens || 0));
    },
  },

  cache: {
    key: 'cache',
    thLabel: () => t('stepCol.cache.th'),
    optLabel: () => t('stepCol.cache.opt'),
    sigPart: (st) =>
      `${st.cacheHitPct ?? 0}:${(st.inputTokens || 0) + (st.cacheReadTokens || 0) > 0 ? 1 : 0}`,
    createCell: () => {
      const valEl = h('span', {
        className: 'cell-value tone-muted',
        style: 'font-size: var(--fs-base-sm);',
      });
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      const promptTokens = Number(st.inputTokens || 0) + Number(st.cacheReadTokens || 0);
      patchText(refs.valEl, formatCachePct(st.cacheHitPct ?? 0));
      patchAttr(
        refs.valEl,
        'class',
        `cell-value ${getCacheToneClass(st.cacheHitPct ?? 0, promptTokens)}`
      );
    },
  },

  cost: {
    key: 'cost',
    thLabel: () => t('stepCol.cost.th'),
    optLabel: () => t('stepCol.cost.opt'),
    sigPart: (st) => `${st.costUsd}`,
    createCell: () => {
      const valEl = h('span', { style: 'font-weight: 600;' });
      const td = h('td', {}, [valEl]);
      return { td, refs: { td, valEl } };
    },
    updateCell: (refs, st) => {
      const costVal = st.costUsd;
      patchText(refs.valEl, formatUsd(costVal, { precise: true }));
      const tone = getStepCostToneClass(costVal);
      patchAttr(refs.valEl, 'class', tone || null);
    },
  },
});

export function getStepColumnOptions() {
  return STEP_COLUMN_KEYS.map((key) => ({
    value: key,
    label: STEP_COLUMN_REGISTRY[key].optLabel(),
  }));
}
