/**
 * @fileoverview Shared CDP / Window Bridge diagnostic notice card (`BridgeStatusNotice.js`).
 * Surfaces actionable restart or `--remote-debugging-port=0` guidance when Antigravity 2.33.0+
 * runs without an active `DevToolsActivePort` (`no_devtools_port` / `cdp_unreachable`).
 */

import { defineComponent } from '../../core/component.js';
import { h, patchAttr, patchClasses, patchText } from '../../core/domPatch.js';
import { isWindowOverlayMode } from '../../core/httpClient.js';
import { createSvgIcon, patchSvgIcon } from '../../icons/SvgIcon.js';
import { t } from '../../i18n/index.js';

const LAUNCH_FLAG_TEXT = '--remote-debugging-port=0';

async function copyTextToClipboard(text) {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback to temporary textarea inside restricted webview contexts
  }
  try {
    if (typeof document === 'undefined' || !document.body) return false;
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'true');
    area.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
    document.body.appendChild(area);
    area.select?.();
    const ok = Boolean(document.execCommand?.('copy'));
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export const BridgeStatusNotice = defineComponent({
  name: 'BridgeStatusNotice',
  setup({ props, onCleanup }) {
    const contextMode = Boolean(props?.contextMode);
    let lastPayload = {
      visible: false,
      windowBridge: null,
      hostPlatform: 'win32',
    };
    let copied = false;
    let copiedTimer = null;
    let destroyed = false;

    const headIconEl = createSvgIcon('warning', { size: 13, className: 'settings-bridge-icon' });
    const titleEl = h('strong', { className: 'settings-bridge-title', text: '' });
    const bodyEl = h('p', { className: 'settings-bridge-desc', text: '' });

    const copyBtnIconEl = createSvgIcon('copy', { size: 11 });
    const copyBtnTextEl = h('span', {
      className: 'settings-bridge-copy-text',
      text: t('settings.bridge.copyFlagBtn', { cmd: LAUNCH_FLAG_TEXT }),
    });
    const copyBtnEl = h(
      'button',
      {
        type: 'button',
        className: 'btn-ghost-sm settings-bridge-copy-btn',
        onClick: async () => {
          await copyTextToClipboard(LAUNCH_FLAG_TEXT);
          if (destroyed) return;
          copied = true;
          if (copiedTimer) clearTimeout(copiedTimer);
          syncCopyBtn();
          copiedTimer = setTimeout(() => {
            copiedTimer = null;
            if (destroyed) return;
            copied = false;
            syncCopyBtn();
          }, 1800);
          copiedTimer?.unref?.();
        },
      },
      [copyBtnIconEl, copyBtnTextEl]
    );

    const rootEl = h(
      'div',
      {
        className: 'settings-bridge-notice',
        role: 'status',
        hidden: true,
      },
      [
        h('div', { className: 'settings-bridge-head' }, [headIconEl, titleEl]),
        bodyEl,
        copyBtnEl,
      ]
    );

    function syncCopyBtn() {
      patchSvgIcon(copyBtnIconEl, copied ? 'check' : 'copy');
      patchText(
        copyBtnTextEl,
        copied
          ? t('settings.bridge.copiedBtn')
          : t('settings.bridge.copyFlagBtn', { cmd: LAUNCH_FLAG_TEXT })
      );
    }

    function render() {
      const wb = lastPayload.windowBridge;
      const state = String(wb?.state || '').trim();
      const shouldShow =
        Boolean(lastPayload.visible) &&
        !isWindowOverlayMode() &&
        (state === 'no_devtools_port' || state === 'cdp_unreachable');

      patchAttr(rootEl, 'hidden', !shouldShow);
      if (!shouldShow) return;

      const isRestartPending = state === 'no_devtools_port' && Boolean(wb?.argvUpdatedThisBoot);
      patchClasses(rootEl, {
        'is-restart': isRestartPending,
        'is-warn': !isRestartPending,
      });
      patchSvgIcon(headIconEl, isRestartPending ? 'refresh' : 'warning');

      let titleText = '';
      if (isRestartPending) {
        titleText = t('settings.bridge.restartTitle');
      } else if (contextMode) {
        titleText = t('settings.bridge.ctxTitle');
      } else if (state === 'cdp_unreachable') {
        titleText = t('settings.bridge.unreachableTitle');
      } else {
        titleText = t('settings.bridge.noPortTitle');
      }

      const plat = String(lastPayload.hostPlatform || '').trim().toLowerCase();
      let bodyText = '';
      if (isRestartPending) {
        bodyText = t('settings.bridge.restartBody');
      } else if (plat === 'darwin') {
        bodyText = t('settings.bridge.guideMac');
      } else if (plat === 'linux') {
        bodyText = t('settings.bridge.guideLinux');
      } else {
        bodyText = t('settings.bridge.guideWin');
      }

      patchText(titleEl, titleText);
      patchText(bodyEl, bodyText);
      syncCopyBtn();
    }

    function update(next = {}) {
      lastPayload = {
        ...lastPayload,
        ...next,
      };
      render();
    }

    onCleanup(() => {
      destroyed = true;
      if (copiedTimer) {
        clearTimeout(copiedTimer);
        copiedTimer = null;
      }
    });

    return {
      el: rootEl,
      refs: {
        update,
        refreshLabels: render,
        copyBtnEl,
      },
    };
  },
});
