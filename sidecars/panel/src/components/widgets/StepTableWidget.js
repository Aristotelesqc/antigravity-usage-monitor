/**
 * @fileoverview Reusable Decoupled Step Table Widget (`StepTableWidget.js`).
 * Powers both `StepsDetailView` ("按步查看") and `SettingsStructureTab` live preview,
 * dynamically rendering 2..12 columns via `stepColumnRegistry.js`, turn rail + prompt
 * preview tooltips, and independent Main/Sub agent badges.
 */

import { defineComponent } from '../../core/component.js';
import {
  h,
  patchAttr,
  patchClasses,
  patchKeyedList,
  patchText,
} from '../../core/domPatch.js';
import { getEffectiveLocale, isEnglishLocale, t } from '../../i18n/index.js';
import {
  DEFAULT_STEP_COLUMN_KEYS,
  STEP_COLUMN_REGISTRY,
} from '../../registries/stepColumnRegistry.js';
import {
  formatAgentBadgeText,
  formatAgentLabel,
  getAgentBadgeClass,
} from '../../store/telemetryStore.js';

export function formatTurnPromptText(rawPrompt) {
  const text = String(rawPrompt || '').trim();
  if (!text || !isEnglishLocale()) return text;
  if (text === '[图片/附件提问]') return t('steps.turnMediaOnly');
  if (text.endsWith(' [附图]')) {
    return `${text.slice(0, -5)} ${t('steps.turnMediaSuffix')}`;
  }
  return text;
}

export const StepTableWidget = defineComponent({
  name: 'StepTableWidget',
  setup({ props, onCleanup }) {
    const standalone = Boolean(props.standalone);
    const interactiveBadges = props.interactiveBadges !== false;
    const onSelectAgentScopes =
      typeof props.onSelectAgentScopes === 'function' ? props.onSelectAgentScopes : null;

    const stepsTheadRow = h('tr');
    const stepsTbody = h('tbody');

    function syncTableHeaderColumns(colKeys) {
      const locale = getEffectiveLocale();
      patchKeyedList(stepsTheadRow, colKeys, {
        keyFn: (colKey) => colKey,
        sigFn: (colKey) => `${locale}:${colKey}:${STEP_COLUMN_REGISTRY[colKey].thLabel()}`,
        createRow: (colKey) => {
          const th = h('th', { text: STEP_COLUMN_REGISTRY[colKey].thLabel() });
          return { el: th, refs: { th } };
        },
        updateRow: (refs, colKey) => {
          patchText(refs.th, STEP_COLUMN_REGISTRY[colKey].thLabel());
        },
      });
    }

    syncTableHeaderColumns(DEFAULT_STEP_COLUMN_KEYS);

    const stepsTableEl = h('table', { className: 'data-table steps-data-table' }, [
      h('thead', {}, [stepsTheadRow]),
      stepsTbody,
    ]);
    const stepsTablePane = h('div', { className: 'table-viewport is-step-table' }, [stepsTableEl]);

    const turnTipEl = h('div', {
      className: 'turn-prompt-tip',
      role: 'tooltip',
      hidden: true,
    });
    const hideTurnTip = () => patchAttr(turnTipEl, 'hidden', true);

    const standaloneHostEl = standalone
      ? h('div', { className: 'step-table-preview-host' }, [stepsTablePane, turnTipEl])
      : null;

    let boundsContainerGetter =
      typeof props.getBoundsEl === 'function'
        ? props.getBoundsEl
        : () => standaloneHostEl || stepsTablePane;

    function setBoundsElGetter(fn) {
      if (typeof fn === 'function') {
        boundsContainerGetter = fn;
      }
    }

    function showTurnTip(anchorCell, promptText) {
      const text = String(promptText || '').trim();
      const boundsEl = boundsContainerGetter?.();
      if (!anchorCell || !text) {
        hideTurnTip();
        return;
      }
      patchText(turnTipEl, text);
      patchAttr(turnTipEl, 'hidden', false);
      if (
        boundsEl &&
        typeof boundsEl.getBoundingClientRect === 'function' &&
        typeof anchorCell.getBoundingClientRect === 'function'
      ) {
        const panelRect = boundsEl.getBoundingClientRect();
        const cellRect = anchorCell.getBoundingClientRect();
        if (panelRect.width > 0 && panelRect.height > 0) {
          const tipH = turnTipEl.offsetHeight || 36;
          const tipW = turnTipEl.offsetWidth || 180;
          const placeAbove =
            panelRect.bottom - cellRect.bottom < tipH + 10 &&
            cellRect.top - panelRect.top > tipH + 6;
          const topPx = placeAbove
            ? Math.max(4, Math.round(cellRect.top - panelRect.top - tipH - 4))
            : Math.round(cellRect.bottom - panelRect.top + 4);
          const maxLeft = Math.max(6, Math.round(panelRect.width - tipW - 8));
          const leftPx = Math.min(
            maxLeft,
            Math.max(6, Math.round(cellRect.left - panelRect.left + 4))
          );
          turnTipEl.style.top = `${topPx}px`;
          turnTipEl.style.left = `${leftPx}px`;
        }
      }
    }

    stepsTablePane.addEventListener('scroll', hideTurnTip);
    stepsTbody.addEventListener('mouseleave', hideTurnTip);

    function renderStepTable(
      tableSteps,
      cascadeId,
      colKeys,
      locale,
      {
        effectiveScopes = ['all'],
        hasSubagents = false,
        isMergedMultiAgents = false,
        showStepTurnRail = true,
        showStepAgentBadge = true,
        displaySettings = {},
      } = {}
    ) {
      const colOrderSig = colKeys.join(',');
      const wantedSet = new Set(colKeys);
      syncTableHeaderColumns(colKeys);

      const showAgentBadge = Boolean(hasSubagents && showStepAgentBadge);
      const cellCtx = {
        hasSubagents,
        showAgentBadge,
        effectiveScopes,
        scopeSigKey: effectiveScopes.join(','),
        displaySettings,
        onSelectAgentScopes,
      };

      const useRootTurn = Boolean(hasSubagents && isMergedMultiAgents);
      const getStepTurnIdx = (st) =>
        useRootTurn ? (st?.rootTurnIndex ?? st?.turnIndex) : st?.turnIndex;
      const getStepIsStart = (st) =>
        Boolean(useRootTurn ? (st?.isRootTurnStart ?? st?.isTurnStart) : st?.isTurnStart);
      const getStepIsLatest = (st) =>
        Boolean(useRootTurn ? (st?.isRootLatestTurn ?? st?.isLatestTurn) : st?.isLatestTurn);
      const getStepPrompt = (st) =>
        (useRootTurn ? (st?.rootTurnPrompt ?? st?.turnPrompt) : st?.turnPrompt) || '';
      const turnKeyOf = (st) => {
        if (!showStepTurnRail) return '';
        const tIdx = getStepTurnIdx(st);
        if (!Number.isInteger(tIdx) || tIdx <= 0) return '';
        return useRootTurn ? `root:${tIdx}` : `${st?.agentId || 'main'}:${tIdx}`;
      };

      const decoratedSteps = tableSteps.map((st, idx) => {
        const tKey = turnKeyOf(st);
        const hasTurn = Boolean(tKey);
        const hasUp = Boolean(hasTurn && idx > 0 && turnKeyOf(tableSteps[idx - 1]) === tKey);
        const hasDown = Boolean(
          hasTurn && idx + 1 < tableSteps.length && turnKeyOf(tableSteps[idx + 1]) === tKey
        );
        return {
          st,
          rowKey: `${st.agentCascadeId || cascadeId || 'conv'}-${st.stepIndex}`,
          hasTurn,
          hasUp,
          hasDown,
          isStart: Boolean(hasTurn && (getStepIsStart(st) || !hasDown)),
          isLatest: hasTurn && getStepIsLatest(st),
          prompt: hasTurn ? formatTurnPromptText(getStepPrompt(st)) : '',
        };
      });

      const railActive = Boolean(showStepTurnRail && decoratedSteps.some((d) => d.hasTurn));
      if (!railActive) {
        hideTurnTip();
      }
      patchClasses(stepsTableEl, { 'has-turn-rail': railActive });

      patchKeyedList(stepsTbody, decoratedSteps, {
        keyFn: (item) => item.rowKey,
        sigFn: (item) => {
          const { st } = item;
          const parts = colKeys
            .map((colKey) => STEP_COLUMN_REGISTRY[colKey].sigPart(st, cellCtx))
            .join('|');
          const badgeSig = `${showAgentBadge}:${interactiveBadges}:${cellCtx.scopeSigKey}:${st.agentId || 'main'}:${st.agentBadge || ''}:${st.agentLabel || ''}`;
          return `${locale}:${colOrderSig}:${badgeSig}:${railActive}:${item.hasTurn}:${item.hasUp}:${item.hasDown}:${item.isStart}:${item.isLatest}:${item.prompt}:${parts}`;
        },
        createRow: () => {
          const tr = h('tr');
          const railLineEl = h('span', { className: 'turn-rail-line', hidden: true });
          const railDotEl = h('span', { className: 'turn-rail-dot', hidden: true });
          const railEl = h(
            'span',
            { className: 'turn-rail', 'aria-hidden': 'true', hidden: true },
            [railLineEl, railDotEl]
          );
          const agentBadgeEl = h('span', {
            className: 'agent-badge',
            hidden: true,
            style: 'margin-right: 4px;',
          });
          return {
            el: tr,
            refs: {
              cellMap: new Map(),
              colOrderSig: '',
              railEl,
              railLineEl,
              railDotEl,
              agentBadgeEl,
              hoverTd: null,
            },
          };
        },
        updateRow: (refs, item, _idx, tr) => {
          const { st, hasTurn, hasUp, hasDown, isStart, isLatest, prompt } = item;

          if (refs.colOrderSig !== colOrderSig) {
            if (refs.hoverTd) {
              refs.hoverTd.onmouseenter = null;
              refs.hoverTd.onmousemove = null;
              refs.hoverTd.onmouseleave = null;
              refs.hoverTd = null;
            }
            for (const [oldColKey, entry] of refs.cellMap) {
              if (!wantedSet.has(oldColKey)) {
                if (refs.railEl.parentNode === entry.td) {
                  entry.td.removeChild(refs.railEl);
                }
                if (refs.agentBadgeEl.parentNode === entry.td) {
                  entry.td.removeChild(refs.agentBadgeEl);
                }
                tr.removeChild(entry.td);
                refs.cellMap.delete(oldColKey);
              }
            }

            for (const [i, colKey] of colKeys.entries()) {
              if (!refs.cellMap.has(colKey)) {
                refs.cellMap.set(colKey, STEP_COLUMN_REGISTRY[colKey].createCell());
              }
              const targetTd = refs.cellMap.get(colKey).td;
              const currentTd = tr.children[i] || null;
              if (currentTd !== targetTd) {
                tr.insertBefore(targetTd, currentTd);
              }
            }
            refs.colOrderSig = colOrderSig;
          }

          for (const colKey of colKeys) {
            const cellEntry = refs.cellMap.get(colKey);
            STEP_COLUMN_REGISTRY[colKey].updateCell(cellEntry.refs, st, cellCtx);
          }

          const firstColKey = colKeys[0];
          const firstTd = firstColKey ? refs.cellMap.get(firstColKey)?.td || null : null;
          if (firstTd) {
            if (refs.railEl.parentNode !== firstTd || firstTd.firstChild !== refs.railEl) {
              firstTd.insertBefore(refs.railEl, firstTd.firstChild);
            }
            const afterRail = refs.railEl.nextSibling ?? firstTd.children[1] ?? null;
            if (refs.agentBadgeEl.parentNode !== firstTd || afterRail !== refs.agentBadgeEl) {
              firstTd.insertBefore(refs.agentBadgeEl, afterRail);
            }
          }

          patchAttr(refs.agentBadgeEl, 'hidden', !showAgentBadge || !firstTd);
          if (showAgentBadge && firstTd) {
            const badgeCls = getAgentBadgeClass(st.agentIndex || 0, !st.isSubagent);
            const clickableCls = interactiveBadges && onSelectAgentScopes ? ' is-clickable' : '';
            patchAttr(refs.agentBadgeEl, 'class', `agent-badge${clickableCls} ${badgeCls}`);
            const badgeText = isEnglishLocale()
              ? formatAgentBadgeText({
                  isMain: !st.isSubagent,
                  index: st.agentIndex || 0,
                  badgeText: st.agentBadge,
                })
              : st.agentBadge || (st.isSubagent ? '子' : '主');
            patchText(refs.agentBadgeEl, badgeText);

            if (interactiveBadges && onSelectAgentScopes) {
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
                if (e && (e.ctrlKey || e.metaKey || e.shiftKey) && effectiveScopes[0] !== 'all') {
                  const next = effectiveScopes.includes(targetScope)
                    ? effectiveScopes.filter((id) => id !== targetScope)
                    : [...effectiveScopes, targetScope];
                  onSelectAgentScopes(next.length > 0 ? next : ['all']);
                } else {
                  onSelectAgentScopes(isSoleTarget ? ['all'] : [targetScope]);
                }
              };
            } else {
              patchAttr(refs.agentBadgeEl, 'title', null);
              refs.agentBadgeEl.onclick = null;
            }
          } else {
            refs.agentBadgeEl.onclick = null;
          }

          const showRowRail = Boolean(railActive && hasTurn && firstTd);
          patchAttr(refs.railEl, 'hidden', !showRowRail);
          if (showRowRail) {
            patchClasses(refs.railEl, {
              'is-latest': isLatest,
              'has-up': hasUp,
              'has-down': hasDown,
            });
            patchAttr(refs.railLineEl, 'hidden', !hasUp && !hasDown);
            const showOrigin = isStart;
            const showCap = !showOrigin && !hasUp && hasDown;
            patchAttr(refs.railDotEl, 'hidden', !showOrigin && !showCap);
            patchClasses(refs.railDotEl, {
              'is-origin': showOrigin,
              'is-cap': showCap,
            });
          }

          const targetHoverTd = firstTd;
          if (refs.hoverTd && refs.hoverTd !== targetHoverTd) {
            refs.hoverTd.onmouseenter = null;
            refs.hoverTd.onmousemove = null;
            refs.hoverTd.onmouseleave = null;
          }
          refs.hoverTd = targetHoverTd;

          if (targetHoverTd) {
            const badgeEl = refs.agentBadgeEl;
            if (firstColKey === 'step') {
              targetHoverTd.onmouseenter = (ev) => {
                if (!showRowRail || !prompt || ev?.target === badgeEl) {
                  hideTurnTip();
                  return;
                }
                showTurnTip(targetHoverTd, prompt);
              };
              targetHoverTd.onmousemove = (ev) => {
                if (!showRowRail || !prompt || ev?.target === badgeEl) {
                  hideTurnTip();
                }
              };
              targetHoverTd.onmouseleave = hideTurnTip;
            } else {
              targetHoverTd.onmouseenter = null;
              targetHoverTd.onmousemove = (ev) => {
                if (!showRowRail || !prompt || ev?.target === badgeEl) {
                  hideTurnTip();
                  return;
                }
                const rect = targetHoverTd.getBoundingClientRect?.();
                const relX = rect ? (ev?.clientX ?? 0) - rect.left : 0;
                if (relX <= 18) {
                  showTurnTip(targetHoverTd, prompt);
                } else {
                  hideTurnTip();
                }
              };
              targetHoverTd.onmouseleave = hideTurnTip;
            }
          }
        },
      });
    }

    onCleanup(() => {
      stepsTablePane.removeEventListener('scroll', hideTurnTip);
      stepsTbody.removeEventListener('mouseleave', hideTurnTip);
    });

    return {
      el: standaloneHostEl || stepsTablePane,
      refs: {
        stepsTablePane,
        stepsTableEl,
        stepsTheadRow,
        stepsTbody,
        turnTipEl,
        syncTableHeaderColumns,
        renderStepTable,
        hideTurnTip,
        setBoundsElGetter,
      },
    };
  },
});
