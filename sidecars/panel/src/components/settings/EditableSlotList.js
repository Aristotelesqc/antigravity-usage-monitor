/**
 * @fileoverview Reusable `+` / `-` / `↑` / `↓` Dynamic Slot List (`EditableSlotList.js`).
 * Powers Topbar Capsule Slots (1..5), Hover Popup Modules (0..4),
 * Live Overview Modules (1..4), First-Row Metrics (1..4), and Step Table Columns (2..12).
 */

import { defineComponent } from '../../core/component.js';
import { h, patchAttr, patchText } from '../../core/domPatch.js';
import { createSvgIcon } from '../../icons/SvgIcon.js';
import { t } from '../../i18n/index.js';
import { CustomSelect } from '../ui/CustomSelect.js';

export const EditableSlotList = defineComponent({
  name: 'EditableSlotList',
  setup({ props, onCleanup }) {
    const minItems = Math.max(0, Number(props.minItems ?? 1));
    const maxItems = Math.max(minItems, Number(props.maxItems ?? 5));
    let currentItems = Array.isArray(props.items) ? [...props.items] : [];
    let currentOptions = Array.isArray(props.options) ? [...props.options] : [];
    let emptyHintText = String(props.emptyHintText || '');
    let addBtnTextFn = typeof props.addBtnTextFn === 'function' ? props.addBtnTextFn : null;

    const listEl = h('div', { className: 'editable-slot-list' });
    const emptyEl = h('div', {
      className: 'editable-slot-empty',
      hidden: true,
      text: emptyHintText,
    });

    const addBtnLabel = h('span', { text: '' });
    const addBtn = h(
      'button',
      {
        type: 'button',
        className: 'slot-add-btn',
        onClick: () => {
          if (currentItems.length >= maxItems) return;
          const usedSet = new Set(currentItems);
          const nextOpt = currentOptions.find((opt) => !usedSet.has(opt.value));
          if (!nextOpt) return;
          emitChange([...currentItems, nextOpt.value]);
        },
      },
      [createSvgIcon('plus', { size: 11 }), addBtnLabel]
    );

    const footerEl = h('div', { className: 'editable-slot-footer' }, [addBtn]);
    const rootEl = h('div', { className: 'editable-slot-wrap' }, [emptyEl, listEl, footerEl]);

    const rowPool = [];

    function emitChange(nextItems) {
      currentItems = [...nextItems];
      syncRows();
      if (typeof props.onChange === 'function') {
        props.onChange([...currentItems]);
      }
    }

    function createSlotRow() {
      let rowIndex = 0;
      const indexBadge = h('span', { className: 'slot-index-badge text-mono', text: '1' });
      const selectComp = CustomSelect({
        modelValue: '',
        options: [],
        onUpdateModelValue: (nextVal) => {
          if (!nextVal || currentItems[rowIndex] === nextVal) return;
          if (currentItems.some((v, idx) => idx !== rowIndex && v === nextVal)) return;
          const next = [...currentItems];
          next[rowIndex] = nextVal;
          emitChange(next);
        },
      });

      const upBtn = h(
        'button',
        {
          type: 'button',
          className: 'slot-move-btn',
          onClick: (e) => {
            e.stopPropagation();
            if (rowIndex <= 0) return;
            const next = [...currentItems];
            const tmp = next[rowIndex - 1];
            next[rowIndex - 1] = next[rowIndex];
            next[rowIndex] = tmp;
            emitChange(next);
          },
        },
        [createSvgIcon('chevron-up', { size: 12 })]
      );

      const downBtn = h(
        'button',
        {
          type: 'button',
          className: 'slot-move-btn',
          onClick: (e) => {
            e.stopPropagation();
            if (rowIndex >= currentItems.length - 1) return;
            const next = [...currentItems];
            const tmp = next[rowIndex + 1];
            next[rowIndex + 1] = next[rowIndex];
            next[rowIndex] = tmp;
            emitChange(next);
          },
        },
        [createSvgIcon('chevron-down', { size: 12 })]
      );

      const removeBtn = h(
        'button',
        {
          type: 'button',
          className: 'slot-move-btn slot-remove-btn',
          onClick: (e) => {
            e.stopPropagation();
            if (currentItems.length <= minItems) return;
            const next = currentItems.filter((_, idx) => idx !== rowIndex);
            emitChange(next);
          },
        },
        [createSvgIcon('minus', { size: 12 })]
      );

      const rowEl = h('div', { className: 'editable-slot-row' }, [
        indexBadge,
        selectComp.el,
        h('span', { className: 'slot-order-btns' }, [upBtn, downBtn, removeBtn]),
      ]);

      return {
        rowEl,
        indexBadge,
        selectComp,
        upBtn,
        downBtn,
        removeBtn,
        setIndex(idx) {
          rowIndex = idx;
        },
      };
    }

    function syncRows() {
      const count = currentItems.length;
      patchAttr(emptyEl, 'hidden', count > 0 || !emptyHintText);
      if (emptyHintText) {
        patchText(emptyEl, emptyHintText);
      }
      patchAttr(listEl, 'hidden', count === 0);

      while (rowPool.length < count) {
        rowPool.push(createSlotRow());
      }

      while (listEl.children && listEl.children.length > count) {
        const tailIdx = listEl.children.length - 1;
        const tailChild = listEl.children[tailIdx];
        tailChild?.remove?.();
      }

      const canRemove = count > minItems;
      const removeTitle = canRemove
        ? t('settings.slot.remove')
        : t('settings.slot.minReached', { min: minItems });

      for (let i = 0; i < count; i += 1) {
        const entry = rowPool[i];
        const itemVal = currentItems[i];
        entry.setIndex(i);
        patchAttr(entry.rowEl, 'data-slot-row', String(i));
        patchText(entry.indexBadge, String(i + 1));

        const otherUsed = new Set(currentItems.filter((_, idx) => idx !== i));
        const rowOpts = currentOptions.map((opt) => {
          const isTaken = otherUsed.has(opt.value);
          return isTaken
            ? {
                ...opt,
                disabled: true,
                meta: t('settings.slot.alreadyAdded'),
              }
            : opt;
        });

        entry.selectComp.setProps({
          modelValue: itemVal,
          options: rowOpts,
        });

        patchAttr(entry.upBtn, 'disabled', i === 0);
        patchAttr(entry.upBtn, 'title', t('settings.slot.moveUp'));
        patchAttr(entry.upBtn, 'aria-label', t('settings.slot.moveUp'));

        patchAttr(entry.downBtn, 'disabled', i === count - 1);
        patchAttr(entry.downBtn, 'title', t('settings.slot.moveDown'));
        patchAttr(entry.downBtn, 'aria-label', t('settings.slot.moveDown'));

        patchAttr(entry.removeBtn, 'disabled', !canRemove);
        patchAttr(entry.removeBtn, 'title', removeTitle);
        patchAttr(entry.removeBtn, 'aria-label', removeTitle);

        if (!listEl.children || listEl.children[i] !== entry.rowEl) {
          listEl.appendChild(entry.rowEl);
        }
      }

      // Close any hidden pooled selects
      for (let j = count; j < rowPool.length; j += 1) {
        rowPool[j].selectComp.close();
      }

      const usedAll = new Set(currentItems);
      const hasAvailableOption = currentOptions.some((opt) => !usedAll.has(opt.value));
      const disableAdd = count >= maxItems || !hasAvailableOption;
      patchAttr(addBtn, 'disabled', disableAdd);
      const addLabel = addBtnTextFn
        ? addBtnTextFn(count, maxItems)
        : `+ (${count}/${maxItems})`;
      patchText(addBtnLabel, addLabel);
    }

    function setProps(next = {}) {
      if (Array.isArray(next.items)) {
        currentItems = [...next.items];
      }
      if (Array.isArray(next.options)) {
        currentOptions = [...next.options];
      }
      if (next.emptyHintText !== undefined) {
        emptyHintText = String(next.emptyHintText || '');
      }
      if (typeof next.addBtnTextFn === 'function') {
        addBtnTextFn = next.addBtnTextFn;
      }
      syncRows();
    }

    syncRows();

    onCleanup(() => {
      for (const entry of rowPool) {
        entry.selectComp.destroy();
      }
      rowPool.length = 0;
    });

    return {
      el: rootEl,
      refs: {
        listEl,
        addBtn,
        emptyEl,
        setProps,
        getItems: () => [...currentItems],
        getSelects: () => rowPool.slice(0, currentItems.length).map((r) => r.selectComp),
      },
    };
  },
});
