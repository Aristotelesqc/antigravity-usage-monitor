/**
 * @fileoverview Preferences Tab 2: `SettingsStructureTab.js` ("结构").
 * Provides 4 collapsible customization sections with `+` / `-` / `↑` / `↓`:
 * 1. 挂载与胶囊栏 (`windowMountMode`, `showTopbarMultiSession`, `topbarCapsuleSlots` 1..5)
 * 2. 鼠标悬浮窗 (`hoverModules` 0..4)
 * 3. 实时监控布局 (`overviewModules` 1..4 + `overviewMetrics` 1..4)
 * 4. 调用明细字段 (`stepTableColumns` 2..12)
 */

import { defineComponent } from '../../core/component.js';
import { h, patchAttr, patchText } from '../../core/domPatch.js';
import { t } from '../../i18n/index.js';
import {
  getCapsuleMetricOptions,
  getOverviewMetricOptions,
} from '../../registries/metricRegistry.js';
import { getStepColumnOptions } from '../../registries/stepColumnRegistry.js';
import { getOverviewModuleOptions } from '../../registries/widgetRegistry.js';
import {
  DEFAULT_CLIENT_HOVER_MODULES,
  DEFAULT_CLIENT_OVERVIEW_METRICS,
  DEFAULT_CLIENT_OVERVIEW_MODULES,
  DEFAULT_CLIENT_STEP_COLUMNS,
  DEFAULT_CLIENT_TOPBAR_SLOTS,
  normalizeClientHoverModules,
  normalizeClientOverviewMetrics,
  normalizeClientOverviewModules,
  normalizeClientStepColumns,
  normalizeClientTopbarSlots,
  normalizeClientWindowMountMode,
  saveSettingsPatch,
} from '../../store/telemetryStore.js';
import { CollapsibleSection } from '../../components/settings/CollapsibleSection.js';
import { EditableSlotList } from '../../components/settings/EditableSlotList.js';
import { CustomSelect } from '../../components/ui/CustomSelect.js';
import { SegmentedControl } from '../../components/ui/SegmentedControl.js';

function getMountModeOptions() {
  return [
    { value: 'dual', label: t('settings.str.mountDual') },
    { value: 'composer', label: t('settings.str.mountComposer') },
    { value: 'sidebar', label: t('settings.str.mountSidebar') },
  ];
}

function getMultiToggleOptions() {
  return [
    { value: 'show', label: t('settings.str.show') },
    { value: 'hide', label: t('settings.str.hide') },
  ];
}

function isSameList(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export const SettingsStructureTab = defineComponent({
  name: 'SettingsStructureTab',
  setup({ props, onCleanup }) {
    let draftWindowMountMode = 'dual';
    let draftShowTopbarMulti = true;
    let draftTopbarSlots = [...DEFAULT_CLIENT_TOPBAR_SLOTS];
    let draftHoverModules = [...DEFAULT_CLIENT_HOVER_MODULES];
    let draftOverviewModules = [...DEFAULT_CLIENT_OVERVIEW_MODULES];
    let draftOverviewMetrics = [...DEFAULT_CLIENT_OVERVIEW_METRICS];
    let draftStepColumns = [...DEFAULT_CLIENT_STEP_COLUMNS];
    let latestSettings = null;

    async function persistStructurePatch(sectionComp, patchObj, successKey = 'settings.saved') {
      sectionComp.refs.showStatus(t('settings.saving'), 0);
      try {
        await saveSettingsPatch(patchObj);
        sectionComp.refs.showStatus(t(successKey), 1500);
      } catch {
        if (latestSettings) {
          renderSettings(latestSettings);
        }
        sectionComp.refs.showStatus(t('settings.saveFailed'), 2500);
      }
    }

    // --- Section 1: 挂载与胶囊栏 (defaultExpanded: true) ---
    const mountModeLabelEl = h('span', {
      className: 'form-label',
      text: t('settings.str.mountMode'),
    });
    const multiToggleLabelEl = h('span', {
      className: 'form-label',
      text: t('settings.str.multiToggle'),
    });
    const capsuleSlotsLabelEl = h('span', {
      className: 'form-label',
      text: t('settings.str.capsuleSlotsLabel'),
    });

    const windowMountSelect = CustomSelect({
      modelValue: draftWindowMountMode,
      icon: 'dock',
      options: getMountModeOptions(),
      onUpdateModelValue: (val) => {
        const nextMode = normalizeClientWindowMountMode(val);
        draftWindowMountMode = nextMode;
        syncMountSectionMeta();
        void persistStructurePatch(mountSection, {
          windowMountMode: nextMode,
          enableWindowOverlay: nextMode !== 'sidebar',
        });
      },
    });

    const multiSessionToggle = SegmentedControl({
      ariaLabel: t('settings.str.multiToggle'),
      modelValue: 'show',
      options: getMultiToggleOptions(),
      onUpdateModelValue: (val) => {
        draftShowTopbarMulti = val !== 'hide';
        syncMountSectionMeta();
        void persistStructurePatch(mountSection, {
          showTopbarMultiSession: draftShowTopbarMulti,
        });
      },
    });

    const topbarSlotsList = EditableSlotList({
      items: draftTopbarSlots,
      options: getCapsuleMetricOptions(),
      minItems: 1,
      maxItems: 5,
      addBtnTextFn: (count, max) => t('settings.str.addCapsuleSlot', { count, max }),
      onChange: (nextItems) => {
        draftTopbarSlots = normalizeClientTopbarSlots(nextItems);
        syncMountSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(mountSection, {
          topbarCapsuleSlots: draftTopbarSlots,
        });
      },
    });

    const mountSection = CollapsibleSection({
      icon: 'dock',
      title: t('settings.str.mountSection'),
      badgeText: t('settings.str.mountBadge', { count: draftTopbarSlots.length }),
      defaultExpanded: true,
      onToggle: () => props.onLayoutChange?.(),
      onReset: () => {
        draftWindowMountMode = 'dual';
        draftShowTopbarMulti = true;
        draftTopbarSlots = [...DEFAULT_CLIENT_TOPBAR_SLOTS];
        syncMountSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(
          mountSection,
          {
            windowMountMode: 'dual',
            enableWindowOverlay: true,
            showTopbarMultiSession: true,
            topbarCapsuleSlots: [...DEFAULT_CLIENT_TOPBAR_SLOTS],
          },
          'settings.resetDone'
        );
      },
      children: [
        h('div', { className: 'form-row' }, [mountModeLabelEl, windowMountSelect.el]),
        h('div', { className: 'settings-inline-row' }, [
          multiToggleLabelEl,
          multiSessionToggle.el,
        ]),
        h('div', { className: 'form-row' }, [capsuleSlotsLabelEl, topbarSlotsList.el]),
      ],
    });

    function syncMountSectionMeta() {
      windowMountSelect.setProps({
        modelValue: draftWindowMountMode,
        options: getMountModeOptions(),
      });
      multiSessionToggle.setProps({
        modelValue: draftShowTopbarMulti ? 'show' : 'hide',
        options: getMultiToggleOptions(),
      });
      topbarSlotsList.refs.setProps({
        items: draftTopbarSlots,
        options: getCapsuleMetricOptions(),
        addBtnTextFn: (count, max) => t('settings.str.addCapsuleSlot', { count, max }),
      });
      mountSection.refs.setBadge(
        t('settings.str.mountBadge', { count: draftTopbarSlots.length })
      );
      const isDefault =
        draftWindowMountMode === 'dual' &&
        draftShowTopbarMulti === true &&
        isSameList(draftTopbarSlots, DEFAULT_CLIENT_TOPBAR_SLOTS);
      mountSection.refs.setResetDisabled(isDefault);
    }

    // --- Section 2: 鼠标悬浮窗 (0..4 items) ---
    const hoverModulesLabelEl = h('span', {
      className: 'form-label',
      text: t('settings.str.hoverModulesLabel'),
    });

    const hoverModulesList = EditableSlotList({
      items: draftHoverModules,
      options: getOverviewModuleOptions(),
      minItems: 0,
      maxItems: 4,
      emptyHintText: t('settings.str.hoverEmptyHint'),
      addBtnTextFn: (count, max) => t('settings.str.addHoverModule', { count, max }),
      onChange: (nextItems) => {
        draftHoverModules = normalizeClientHoverModules(nextItems);
        syncHoverSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(hoverSection, {
          hoverModules: draftHoverModules,
        });
      },
    });

    const hoverSection = CollapsibleSection({
      icon: 'layers',
      title: t('settings.str.hoverSection'),
      badgeText: t('settings.str.hoverBadgeCount', { count: draftHoverModules.length }),
      defaultExpanded: false,
      onToggle: () => props.onLayoutChange?.(),
      onReset: () => {
        draftHoverModules = [...DEFAULT_CLIENT_HOVER_MODULES];
        syncHoverSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(
          hoverSection,
          { hoverModules: [...DEFAULT_CLIENT_HOVER_MODULES] },
          'settings.resetDone'
        );
      },
      children: [h('div', { className: 'form-row' }, [hoverModulesLabelEl, hoverModulesList.el])],
    });

    function syncHoverSectionMeta() {
      hoverModulesList.refs.setProps({
        items: draftHoverModules,
        options: getOverviewModuleOptions(),
        emptyHintText: t('settings.str.hoverEmptyHint'),
        addBtnTextFn: (count, max) => t('settings.str.addHoverModule', { count, max }),
      });
      hoverSection.refs.setBadge(
        draftHoverModules.length === 0
          ? t('settings.str.hoverBadgeOff')
          : t('settings.str.hoverBadgeCount', { count: draftHoverModules.length })
      );
      hoverSection.refs.setResetDisabled(isSameList(draftHoverModules, DEFAULT_CLIENT_HOVER_MODULES));
    }

    // --- Section 3: 实时监控布局 (Modules 1..4 + First-Row Metrics 1..4) ---
    const overviewModulesLabelEl = h('span', {
      className: 'form-label',
      text: t('settings.str.overviewModulesLabel'),
    });
    const overviewMetricsLabelEl = h('span', {
      className: 'form-label',
      text: t('settings.str.overviewMetricsLabel'),
    });
    const overviewMetricsHintEl = h('span', {
      className: 'settings-hint-text',
      hidden: true,
      text: t('settings.str.overviewMetricsInactiveHint'),
    });

    const overviewModulesList = EditableSlotList({
      items: draftOverviewModules,
      options: getOverviewModuleOptions(),
      minItems: 1,
      maxItems: 4,
      addBtnTextFn: (count, max) => t('settings.str.addOverviewModule', { count, max }),
      onChange: (nextItems) => {
        draftOverviewModules = normalizeClientOverviewModules(nextItems);
        syncOverviewSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(overviewSection, {
          overviewModules: draftOverviewModules,
        });
      },
    });

    const overviewMetricsList = EditableSlotList({
      items: draftOverviewMetrics,
      options: getOverviewMetricOptions(),
      minItems: 1,
      maxItems: 4,
      addBtnTextFn: (count, max) => t('settings.str.addOverviewMetric', { count, max }),
      onChange: (nextItems) => {
        draftOverviewMetrics = normalizeClientOverviewMetrics(nextItems);
        syncOverviewSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(overviewSection, {
          overviewMetrics: draftOverviewMetrics,
        });
      },
    });

    const overviewSection = CollapsibleSection({
      icon: 'pulse',
      title: t('settings.str.overviewSection'),
      badgeText: t('settings.str.overviewBadge', {
        modCount: draftOverviewModules.length,
        metCount: draftOverviewMetrics.length,
      }),
      defaultExpanded: false,
      onToggle: () => props.onLayoutChange?.(),
      onReset: () => {
        draftOverviewModules = [...DEFAULT_CLIENT_OVERVIEW_MODULES];
        draftOverviewMetrics = [...DEFAULT_CLIENT_OVERVIEW_METRICS];
        syncOverviewSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(
          overviewSection,
          {
            overviewModules: [...DEFAULT_CLIENT_OVERVIEW_MODULES],
            overviewMetrics: [...DEFAULT_CLIENT_OVERVIEW_METRICS],
          },
          'settings.resetDone'
        );
      },
      children: [
        h('div', { className: 'form-row' }, [overviewModulesLabelEl, overviewModulesList.el]),
        h('div', { className: 'settings-divider' }),
        h('div', { className: 'form-row' }, [
          overviewMetricsLabelEl,
          overviewMetricsHintEl,
          overviewMetricsList.el,
        ]),
      ],
    });

    function syncOverviewSectionMeta() {
      overviewModulesList.refs.setProps({
        items: draftOverviewModules,
        options: getOverviewModuleOptions(),
        addBtnTextFn: (count, max) => t('settings.str.addOverviewModule', { count, max }),
      });
      overviewMetricsList.refs.setProps({
        items: draftOverviewMetrics,
        options: getOverviewMetricOptions(),
        addBtnTextFn: (count, max) => t('settings.str.addOverviewMetric', { count, max }),
      });
      const metricsModuleActive = draftOverviewModules.includes('metrics');
      patchAttr(overviewMetricsHintEl, 'hidden', metricsModuleActive);
      overviewSection.refs.setBadge(
        t('settings.str.overviewBadge', {
          modCount: draftOverviewModules.length,
          metCount: draftOverviewMetrics.length,
        })
      );
      const isDefault =
        isSameList(draftOverviewModules, DEFAULT_CLIENT_OVERVIEW_MODULES) &&
        isSameList(draftOverviewMetrics, DEFAULT_CLIENT_OVERVIEW_METRICS);
      overviewSection.refs.setResetDisabled(isDefault);
    }

    // --- Section 4: 调用明细字段 (Step Table Columns 2..12) ---
    const stepColsLabelEl = h('span', {
      className: 'form-label',
      text: t('settings.str.stepsColsLabel'),
    });

    const stepColumnsList = EditableSlotList({
      items: draftStepColumns,
      options: getStepColumnOptions(),
      minItems: 2,
      maxItems: 12,
      addBtnTextFn: (count, max) => t('settings.str.addStepCol', { count, max }),
      onChange: (nextItems) => {
        draftStepColumns = normalizeClientStepColumns(nextItems);
        syncStepsSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(stepsSection, {
          stepTableColumns: draftStepColumns,
        });
      },
    });

    const stepsSection = CollapsibleSection({
      icon: 'table',
      title: t('settings.str.stepsSection'),
      badgeText: t('settings.str.stepsBadge', { count: draftStepColumns.length }),
      defaultExpanded: false,
      onToggle: () => props.onLayoutChange?.(),
      onReset: () => {
        draftStepColumns = [...DEFAULT_CLIENT_STEP_COLUMNS];
        syncStepsSectionMeta();
        props.onLayoutChange?.();
        void persistStructurePatch(
          stepsSection,
          { stepTableColumns: [...DEFAULT_CLIENT_STEP_COLUMNS] },
          'settings.resetDone'
        );
      },
      children: [h('div', { className: 'form-row' }, [stepColsLabelEl, stepColumnsList.el])],
    });

    function syncStepsSectionMeta() {
      stepColumnsList.refs.setProps({
        items: draftStepColumns,
        options: getStepColumnOptions(),
        addBtnTextFn: (count, max) => t('settings.str.addStepCol', { count, max }),
      });
      stepsSection.refs.setBadge(t('settings.str.stepsBadge', { count: draftStepColumns.length }));
      stepsSection.refs.setResetDisabled(isSameList(draftStepColumns, DEFAULT_CLIENT_STEP_COLUMNS));
    }

    const rootEl = h('div', { className: 'settings-tab-stack' }, [
      mountSection.el,
      hoverSection.el,
      overviewSection.el,
      stepsSection.el,
    ]);

    function renderSettings(settings) {
      if (!settings) return;
      latestSettings = settings;
      draftWindowMountMode = normalizeClientWindowMountMode(
        settings.windowMountMode,
        settings.enableWindowOverlay
      );
      draftShowTopbarMulti = settings.showTopbarMultiSession !== false;
      draftTopbarSlots = normalizeClientTopbarSlots(settings.topbarCapsuleSlots);
      draftHoverModules = normalizeClientHoverModules(settings.hoverModules);
      draftOverviewModules = normalizeClientOverviewModules(settings.overviewModules);
      draftOverviewMetrics = normalizeClientOverviewMetrics(settings.overviewMetrics);
      draftStepColumns = normalizeClientStepColumns(settings.stepTableColumns);

      syncMountSectionMeta();
      syncHoverSectionMeta();
      syncOverviewSectionMeta();
      syncStepsSectionMeta();
    }

    function refreshLabels() {
      mountSection.refs.setTitle(t('settings.str.mountSection'));
      mountSection.refs.setResetLabel(t('settings.resetBtn'));
      patchText(mountModeLabelEl, t('settings.str.mountMode'));
      patchText(multiToggleLabelEl, t('settings.str.multiToggle'));
      patchText(capsuleSlotsLabelEl, t('settings.str.capsuleSlotsLabel'));

      hoverSection.refs.setTitle(t('settings.str.hoverSection'));
      hoverSection.refs.setResetLabel(t('settings.resetBtn'));
      patchText(hoverModulesLabelEl, t('settings.str.hoverModulesLabel'));

      overviewSection.refs.setTitle(t('settings.str.overviewSection'));
      overviewSection.refs.setResetLabel(t('settings.resetBtn'));
      patchText(overviewModulesLabelEl, t('settings.str.overviewModulesLabel'));
      patchText(overviewMetricsLabelEl, t('settings.str.overviewMetricsLabel'));
      patchText(overviewMetricsHintEl, t('settings.str.overviewMetricsInactiveHint'));

      stepsSection.refs.setTitle(t('settings.str.stepsSection'));
      stepsSection.refs.setResetLabel(t('settings.resetBtn'));
      patchText(stepColsLabelEl, t('settings.str.stepsColsLabel'));

      syncMountSectionMeta();
      syncHoverSectionMeta();
      syncOverviewSectionMeta();
      syncStepsSectionMeta();
    }

    syncMountSectionMeta();
    syncHoverSectionMeta();
    syncOverviewSectionMeta();
    syncStepsSectionMeta();

    onCleanup(() => {
      windowMountSelect.destroy();
      multiSessionToggle.destroy();
      topbarSlotsList.destroy();
      hoverModulesList.destroy();
      overviewModulesList.destroy();
      overviewMetricsList.destroy();
      stepColumnsList.destroy();
      mountSection.destroy();
      hoverSection.destroy();
      overviewSection.destroy();
      stepsSection.destroy();
    });

    return {
      el: rootEl,
      refs: {
        windowMountSelect,
        multiSessionToggle,
        topbarSlotsList,
        hoverModulesList,
        overviewModulesList,
        overviewMetricsList,
        stepColumnsList,
        mountSection,
        hoverSection,
        overviewSection,
        stepsSection,
        renderSettings,
        refreshLabels,
      },
    };
  },
});
