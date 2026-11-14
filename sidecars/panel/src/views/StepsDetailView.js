/**
 * @fileoverview View 3: StepsDetailView (步骤明细与总汇总分析视图).
 * 提供“按步查看”与“总汇总”双子视图切换：
 * - 单步测速表采用 `patchKeyedList` 实现行级 DOM 增量对账与就地复用，支持多代理与多模型复选过滤；
 * - 总汇总视图在顶部提供当前会话线性走势图（总Token / 上下文 / TPS / 首字 / 费用）与趋势拟合曲线图（TPS / 首字 / 缓存 / 费用），
 *   单模型时自动隐藏模型下拉框，多模型时支持独立多选（趋势拟合勾选多模型时同图绘制多条独立颜色回归曲线对比）；
 * - 底部以极简高密度模型卡片表达各模型总数据，全链路支持主代理 / 子代理多选汇总筛选。
 */

import { defineComponent } from '../core/component.js';
import {
  h,
  patchAttr,
  patchClasses,
  patchKeyedList,
  patchText,
} from '../core/domPatch.js';
import {
  formatMetric,
  formatTokens,
  formatUsd,
  mergeModelsByDisplayName,
  normalizeOrchestratorIdDisplayMode,
  resolveModelDisplayInfo,
  speedReasonText,
} from '../core/formatters.js';
import { createSvgIcon } from '../icons/SvgIcon.js';
import {
  formatAgentLabel,
  getAgentBadgeClass,
  resolveScopedConversation,
  telemetryStore,
} from '../store/telemetryStore.js';
import { uiStore } from '../store/uiStore.js';
import {
  MODEL_COLOR_VARS,
  createModelFitChart,
  createSessionLineChart,
  getStepModelGroupKey,
  toChronologicalSteps,
} from '../components/charts/SessionStepCharts.js';
import { CustomScrollbar } from '../components/ui/CustomScrollbar.js';
import { CustomSelect } from '../components/ui/CustomSelect.js';
import { createFourSegmentBar } from '../components/ui/FourSegmentBar.js';
import { SegmentedControl } from '../components/ui/SegmentedControl.js';

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

export const StepsDetailView = defineComponent({
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
