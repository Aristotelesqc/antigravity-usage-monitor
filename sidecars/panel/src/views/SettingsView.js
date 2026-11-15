/**
 * @fileoverview View 4: Modular preferences ("常规" / "结构" / "账号" / "其他").
 * Orchestrates the four preference tabs
 * with top sub-navigation and a shared `CustomScrollbar` viewport.
 */

import { defineComponent } from '../core/component.js';
import { h, patchAttr } from '../core/domPatch.js';
import { i18nStore, t } from '../i18n/index.js';
import { telemetryStore } from '../store/telemetryStore.js';
import { uiStore } from '../store/uiStore.js';
import { CustomScrollbar } from '../components/ui/CustomScrollbar.js';
import { SegmentedControl } from '../components/ui/SegmentedControl.js';
import { SettingsAccountTab } from './settings/SettingsAccountTab.js';
import { SettingsGeneralTab } from './settings/SettingsGeneralTab.js';
import { SettingsOtherTab } from './settings/SettingsOtherTab.js';
import { SettingsStructureTab } from './settings/SettingsStructureTab.js';

export const SHOW_ACCOUNT_TAB = false;

function getSettingsSubTabOptions() {
  return [
    { value: 'general', label: t('settings.subTab.general') },
    { value: 'structure', label: t('settings.subTab.structure') },
    ...(SHOW_ACCOUNT_TAB ? [{ value: 'account', label: t('settings.subTab.account') }] : []),
    { value: 'other', label: t('settings.subTab.other') },
  ];
}

export const SettingsView = defineComponent({
  name: 'SettingsView',
  setup({ onCleanup }) {
    const initialSubTab = uiStore.getState().settingsSubTab || 'general';

    const subNavSwitch = SegmentedControl({
      ariaLabel: t('settings.subTab.aria'),
      modelValue: initialSubTab,
      options: getSettingsSubTabOptions(),
      onUpdateModelValue: (nextSubTab) => {
        uiStore.setState({ settingsSubTab: nextSubTab });
      },
    });

    const subNavBar = h('div', { className: 'settings-subnav-bar' }, [subNavSwitch.el]);

    let viewScrollbar = null;
    const refreshScroll = () => {
      if (viewScrollbar) {
        viewScrollbar.refresh();
      }
    };

    const generalTab = SettingsGeneralTab({ onLayoutChange: refreshScroll });
    const structureTab = SettingsStructureTab({ onLayoutChange: refreshScroll });
    const accountTab = SettingsAccountTab({ onLayoutChange: refreshScroll });
    const otherTab = SettingsOtherTab({ onLayoutChange: refreshScroll });

    let showingAccount = false;
    function applyActiveSubTab(subTab, activeView) {
      const target =
        subTab === 'structure' ||
        subTab === 'other' ||
        (SHOW_ACCOUNT_TAB && subTab === 'account')
          ? subTab
          : 'general';
      subNavSwitch.setValue(target);
      patchAttr(generalTab.el, 'hidden', target !== 'general');
      patchAttr(structureTab.el, 'hidden', target !== 'structure');
      patchAttr(accountTab.el, 'hidden', !SHOW_ACCOUNT_TAB || target !== 'account');
      patchAttr(otherTab.el, 'hidden', target !== 'other');
      const nextShowingAccount = SHOW_ACCOUNT_TAB && target === 'account' && activeView === 'settings';
      if (nextShowingAccount && !showingAccount) void accountTab.refs.load();
      showingAccount = nextShowingAccount;
      refreshScroll();
    }

    const contentContainer = h(
      'div',
      {},
      SHOW_ACCOUNT_TAB
        ? [generalTab.el, structureTab.el, accountTab.el, otherTab.el]
        : [generalTab.el, structureTab.el, otherTab.el]
    );
    viewScrollbar = CustomScrollbar({
      contentEl: contentContainer,
      className: 'view-pane',
    });

    applyActiveSubTab(initialSubTab, uiStore.getState().activeView);

    const rootEl = h('div', { className: 'settings-view-root' }, [
      subNavBar,
      viewScrollbar.el,
    ]);

    let latestSettings = null;
    let latestCloudStatus = null;
    let latestContextWindowModels = [];
    const initialTelemetry = telemetryStore.getState().telemetry;
    accountTab.refs.renderAccount(initialTelemetry?.account, initialTelemetry?.quotas);

    function syncAllTabs(settings, cloudStatus) {
      if (settings) {
        generalTab.refs.renderSettings(settings);
        structureTab.refs.renderSettings(settings);
        otherTab.refs.renderSettings(settings, latestContextWindowModels);
      }
      if (cloudStatus) {
        generalTab.refs.renderCloudStatus(cloudStatus);
      }
      refreshScroll();
    }

    const unsubTelemetry = telemetryStore.subscribe(
      (st) => ({
        settings: st.telemetry?.settings,
        cloudStatus: st.telemetry?.cloudStatus,
        contextWindowModels: st.telemetry?.contextWindowModels,
        account: st.telemetry?.account,
        quotas: st.telemetry?.quotas,
      }),
      (slice) => {
        latestSettings = slice.settings;
        latestCloudStatus = slice.cloudStatus;
        latestContextWindowModels = slice.contextWindowModels || [];
        accountTab.refs.renderAccount(slice.account, slice.quotas);
        if (slice.settings) {
          generalTab.refs.renderSettings(slice.settings);
          structureTab.refs.renderSettings(slice.settings);
          otherTab.refs.renderSettings(slice.settings, latestContextWindowModels);
        }
        if (uiStore.getState().activeView === 'settings' && slice.cloudStatus) {
          generalTab.refs.renderCloudStatus(slice.cloudStatus);
        }
        refreshScroll();
      }
    );

    const unsubUi = uiStore.subscribe(
      (st) => ({
        activeView: st.activeView,
        settingsSubTab: st.settingsSubTab,
      }),
      (slice) => {
        applyActiveSubTab(slice.settingsSubTab, slice.activeView);
        if (slice.activeView === 'settings') {
          syncAllTabs(latestSettings, latestCloudStatus);
        }
      }
    );

    const unsubI18n = i18nStore.subscribe(
      (st) => st.locale,
      () => {
        subNavSwitch.setProps({
          modelValue: uiStore.getState().settingsSubTab || 'general',
          options: getSettingsSubTabOptions(),
        });
        generalTab.refs.refreshLabels();
        structureTab.refs.refreshLabels();
        accountTab.refs.refreshLabels();
        otherTab.refs.refreshLabels();
        refreshScroll();
      }
    );

    onCleanup(() => {
      unsubTelemetry();
      unsubUi();
      unsubI18n();
      subNavSwitch.destroy();
      generalTab.destroy();
      structureTab.destroy();
      accountTab.destroy();
      otherTab.destroy();
      viewScrollbar.destroy();
    });

    return {
      el: rootEl,
      refs: {
        subNavSwitch,
        generalTab,
        structureTab,
        accountTab,
        otherTab,
        viewScrollbar,
        // Convenience aliases for external callers / tests
        windowMountSelect: structureTab.refs.windowMountSelect,
        multiSessionToggle: structureTab.refs.multiSessionToggle,
        topbarSlotsList: structureTab.refs.topbarSlotsList,
        stepModelSelect: otherTab.refs.stepModelSelect,
        orchestratorIdSelect: otherTab.refs.orchestratorIdSelect,
        autoUpdateSelect: generalTab.refs.autoUpdateSelect,
      },
    };
  },
});
