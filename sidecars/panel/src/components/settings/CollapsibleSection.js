/**
 * @fileoverview Reusable Accordion / Collapsible Section (`CollapsibleSection.js`)
 * for `SettingsStructureTab`.
 */

import { defineComponent } from '../../core/component.js';
import { h, patchAttr, patchClasses, patchText } from '../../core/domPatch.js';
import { createSvgIcon } from '../../icons/SvgIcon.js';
import { t } from '../../i18n/index.js';

export const CollapsibleSection = defineComponent({
  name: 'CollapsibleSection',
  setup({ props, onCleanup }) {
    let expanded = Boolean(props.defaultExpanded);
    let statusTimer = null;

    const chevronIcon = createSvgIcon('chevron-right', {
      size: 12,
      className: 'collapsible-chevron',
    });
    const sectionIcon = props.icon ? createSvgIcon(props.icon, { size: 13 }) : null;
    const titleTextEl = h('span', {
      className: 'collapsible-title-text',
      text: props.title || '',
    });

    const triggerChildren = [chevronIcon];
    if (sectionIcon) triggerChildren.push(sectionIcon);
    triggerChildren.push(titleTextEl);

    const triggerBtn = h(
      'button',
      {
        type: 'button',
        className: 'collapsible-trigger',
        'aria-expanded': expanded ? 'true' : 'false',
        onClick: () => {
          setExpanded(!expanded);
          if (typeof props.onToggle === 'function') {
            props.onToggle(expanded);
          }
        },
      },
      triggerChildren
    );

    const statusTextEl = h('span', { className: 'collapsible-status', text: '' });
    const badgeEl = h('span', {
      className: 'collapsible-badge text-mono',
      hidden: !props.badgeText,
      text: props.badgeText || '',
    });

    const resetBtnText = h('span', { text: props.resetLabel || t('settings.resetBtn') });
    const resetBtn =
      typeof props.onReset === 'function'
        ? h(
            'button',
            {
              type: 'button',
              className: 'btn-ghost-sm',
              disabled: props.resetDisabled !== false,
              onClick: (e) => {
                e.stopPropagation();
                props.onReset();
              },
            },
            [resetBtnText]
          )
        : null;

    const rightChildren = [statusTextEl, badgeEl];
    if (resetBtn) rightChildren.push(resetBtn);

    const headerRow = h('div', { className: 'collapsible-header-row' }, [
      triggerBtn,
      h('span', { className: 'collapsible-right' }, rightChildren),
    ]);

    const bodyEl = h(
      'div',
      {
        className: 'collapsible-body',
        hidden: !expanded,
      },
      Array.isArray(props.children) ? props.children : []
    );

    const sectionEl = h(
      'section',
      {
        className: `panel collapsible-section${expanded ? ' is-expanded' : ''}`,
      },
      [headerRow, bodyEl]
    );

    function setExpanded(next) {
      expanded = Boolean(next);
      patchClasses(sectionEl, { 'is-expanded': expanded });
      patchAttr(triggerBtn, 'aria-expanded', expanded ? 'true' : 'false');
      patchAttr(bodyEl, 'hidden', !expanded);
    }

    function setTitle(text) {
      patchText(titleTextEl, text || '');
    }

    function setBadge(text) {
      patchAttr(badgeEl, 'hidden', !text);
      patchText(badgeEl, text || '');
    }

    function setResetLabel(text) {
      if (resetBtn) {
        patchText(resetBtnText, text || t('settings.resetBtn'));
      }
    }

    function setResetDisabled(disabled) {
      if (resetBtn) {
        patchAttr(resetBtn, 'disabled', Boolean(disabled));
      }
    }

    function showStatus(text, autoClearMs = 1500) {
      if (statusTimer) {
        clearTimeout(statusTimer);
        statusTimer = null;
      }
      patchText(statusTextEl, text || '');
      if (text && autoClearMs > 0) {
        statusTimer = setTimeout(() => {
          statusTimer = null;
          patchText(statusTextEl, '');
        }, autoClearMs);
      }
    }

    onCleanup(() => {
      if (statusTimer) {
        clearTimeout(statusTimer);
        statusTimer = null;
      }
    });

    return {
      el: sectionEl,
      refs: {
        triggerBtn,
        bodyEl,
        resetBtn,
        setExpanded,
        isExpanded: () => expanded,
        setTitle,
        setBadge,
        setResetLabel,
        setResetDisabled,
        showStatus,
      },
    };
  },
});
