/**
 * @fileoverview Sidecar Webview 与主窗口双栖桥接共享的 API 路由分发与运行时引导层。
 *
 * 与 `sidecar_sdk` 完全解耦，使同一套遥测聚合、偏好持久化、云端目录同步与自更新逻辑可同时服务于：
 * 1. Antigravity 2.0 客户端右侧辅助栏 (`main.mjs` -> `SidecarApp`)；
 * 2. Antigravity IDE / 2.0 后台守护桥接进程 (`mcp-entry.mjs` -> `bridge-daemon.mjs`)。
 */

import { readFileSync, promises as fsPromises } from 'node:fs';
import { join } from 'node:path';
import {
  HERE,
  SETTINGS_FILE,
  cloudSyncState,
  computeRuntimeCodeVersion,
  isPlainObject,
  loadSettings,
  lsRuntimeEndpoint,
  normalizeOrchestratorIdMode,
  normalizePluginUpdateMode,
  normalizeTopbarCapsuleSlots,
  normalizeWeeklyLimitMode,
  normalizeWindowMountMode,
  saveJson,
} from './config.mjs';
import { ensureLsEndpointDiscovered } from './ls-discovery.mjs';
import {
  performPluginUpdate,
  scheduleSidecarRestart,
  syncCloudCatalog,
} from './plugin-updater.mjs';
import { getCloudStatus } from './pricing-catalog.mjs';
import { buildTelemetryPayload } from './telemetry-builder.mjs';
import {
  notifyWindowOverlaySetting,
  startDefaultWindowBridge,
} from './window-bridge.mjs';

export const bootBundleVersion = computeRuntimeCodeVersion();

/**
 * 异步读取 `sidecars/panel` 目录下的静态资源文件（兼容单元测试同步沙箱）。
 *
 * @param {string} relPath 相对路径
 * @returns {Promise<string>}
 */
export const readLocalAsync = async (relPath) => {
  const fullPath = join(HERE, relPath);
  if (typeof fsPromises !== 'undefined' && fsPromises?.readFile) {
    return fsPromises.readFile(fullPath, 'utf8');
  }
  return readFileSync(fullPath, 'utf8');
};

/**
 * 校验请求是否来自本机回环同端口地址 (`127.0.0.1` / `localhost` / `[::1]`) 或受信 Webview Origin，
 * 阻止跨端口本地服务（如本地其他端口的开发服务器）或跨站 DNS Rebinding 访问 API。
 *
 * @param {object} req
 * @returns {boolean}
 */
export function isLocalHostRequest(req) {
  if (!req?.headers) return true;
  const host = String(req.headers.host || '').trim().toLowerCase();
  const hostMatch = host.match(/^(127\.0\.0\.1|localhost|\[::1\])(?::(\d+))?$/);
  if (host && !hostMatch) {
    return false;
  }
  const origin = String(req.headers.origin || '').trim().toLowerCase();
  if (origin && /^vscode-webview:\/\/[a-z0-9._-]+$/.test(origin)) {
    return true;
  }
  const secFetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();
  if (secFetchSite === 'cross-site') {
    return false;
  }
  if (origin) {
    const originMatch = origin.match(
      /^(https?):\/\/(127\.0\.0\.1|localhost|\[::1\])(?::(\d+))?$/
    );
    if (!originMatch) {
      return false;
    }
    if (hostMatch) {
      const defaultPort = originMatch[1] === 'https' ? '443' : '80';
      const originPort = originMatch[3] || defaultPort;
      const hostPort = hostMatch[2] || defaultPort;
      if (originPort !== hostPort) {
        return false;
      }
    }
  }
  return true;
}

const MAX_SAFE_DATE_MS = 8_640_000_000_000_000;

function sanitizePositiveFiniteMs(val) {
  const num = Number(val);
  return Number.isFinite(num) && num > 0 && num <= MAX_SAFE_DATE_MS ? Math.floor(num) : 0;
}

export async function executeTelemetryAction(data, { onRestart = null } = {}) {
  const rawConvId = String(
    data?.conversationId || process.env.ANTIGRAVITY_CONVERSATION_ID || ''
  ).trim();
  const convId = rawConvId && !/[\\/]|\.\./.test(rawConvId) ? rawConvId : '';
  const force = data?.force === '1' || data?.force === true;
  if (lsRuntimeEndpoint.addr !== 'test.invalid') {
    if (!lsRuntimeEndpoint.baseUrl) {
      await ensureLsEndpointDiscovered({ force: false });
    }
    if (lsRuntimeEndpoint.baseUrl) {
      if (force && Date.now() - cloudSyncState.lastAttemptMs > 15_000) {
        await Promise.race([
          syncCloudCatalog({ force: true }).catch(() => {}),
          new Promise((r) => setTimeout(r, 1200)),
        ]);
      } else {
        syncCloudCatalog({ force: false }).catch(() => {});
      }
    }
  }
  const filterOpts = {
    range: data?.range || 'all',
    startMs: sanitizePositiveFiniteMs(data?.startMs),
    endMs: sanitizePositiveFiniteMs(data?.endMs),
  };
  const payload = await buildTelemetryPayload(convId, force, filterOpts);
  if (
    bootBundleVersion &&
    payload.uiBundleVersion &&
    String(payload.uiBundleVersion) !== String(bootBundleVersion)
  ) {
    if (typeof onRestart === 'function') {
      onRestart();
    } else {
      scheduleSidecarRestart(150);
    }
  }
  return {
    status: 200,
    contentType: 'application/json',
    headers: { 'Cache-Control': 'no-store' },
    body: JSON.stringify(payload),
  };
}

function sanitizePositiveSettingNumber(val, fallback) {
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? num : fallback;
}

export function executeSettingsAction(data) {
  const current = loadSettings();
  const payload = isPlainObject(data) ? data : {};
  const nextPluginUpdateMode =
    payload.pluginUpdateMode !== undefined
      ? normalizePluginUpdateMode(payload.pluginUpdateMode)
      : typeof payload.autoUpdatePlugin === 'boolean'
        ? payload.autoUpdatePlugin
          ? 'auto'
          : 'manual'
        : normalizePluginUpdateMode(current.pluginUpdateMode, current.autoUpdatePlugin);
  const nextWindowMountMode =
    payload.windowMountMode !== undefined
      ? normalizeWindowMountMode(payload.windowMountMode)
      : typeof payload.enableWindowOverlay === 'boolean'
        ? payload.enableWindowOverlay
          ? current.windowMountMode === 'composer'
            ? 'composer'
            : 'dual'
          : 'sidebar'
        : normalizeWindowMountMode(current.windowMountMode, current.enableWindowOverlay);
  const updated = {
    weeklyTokenBudget: sanitizePositiveSettingNumber(
      payload.weeklyTokenBudget ?? payload.weeklyTokenLimit,
      current.weeklyTokenBudget
    ),
    weeklyCostBudget: sanitizePositiveSettingNumber(
      payload.weeklyCostBudget,
      current.weeklyCostBudget
    ),
    weeklyLimitMode:
      payload.weeklyLimitMode !== undefined
        ? normalizeWeeklyLimitMode(payload.weeklyLimitMode)
        : current.weeklyLimitMode,
    showUpstreamModel:
      typeof payload.showUpstreamModel === 'boolean'
        ? payload.showUpstreamModel
        : Boolean(current.showUpstreamModel),
    orchestratorIdMode:
      payload.orchestratorIdMode !== undefined
        ? normalizeOrchestratorIdMode(payload.orchestratorIdMode)
        : normalizeOrchestratorIdMode(current.orchestratorIdMode),
    pluginUpdateMode: nextPluginUpdateMode,
    autoUpdatePlugin: nextPluginUpdateMode === 'auto',
    windowMountMode: nextWindowMountMode,
    enableWindowOverlay: nextWindowMountMode !== 'sidebar',
    showTopbarMultiSession:
      typeof payload.showTopbarMultiSession === 'boolean'
        ? payload.showTopbarMultiSession
        : current.showTopbarMultiSession !== false,
    topbarCapsuleSlots:
      payload.topbarCapsuleSlots !== undefined
        ? normalizeTopbarCapsuleSlots(payload.topbarCapsuleSlots)
        : normalizeTopbarCapsuleSlots(current.topbarCapsuleSlots),
  };
  if (!saveJson(SETTINGS_FILE, updated)) {
    return {
      ok: false,
      status: 500,
      contentType: 'application/json',
      headers: { 'Cache-Control': 'no-store' },
      body: JSON.stringify({ ok: false, error: 'Failed to persist settings' }),
    };
  }
  const prevMountMode = normalizeWindowMountMode(
    current.windowMountMode,
    current.enableWindowOverlay
  );
  if (
    updated.enableWindowOverlay !== (current.enableWindowOverlay !== false) ||
    updated.windowMountMode !== prevMountMode
  ) {
    void notifyWindowOverlaySetting(updated.enableWindowOverlay);
  }
  return {
    ok: true,
    status: 200,
    contentType: 'application/json',
    headers: { 'Cache-Control': 'no-store' },
    updated,
    body: JSON.stringify(updated),
  };
}

export async function executeCloudSyncAction() {
  const cloudStatus = await syncCloudCatalog({ force: true });
  return {
    status: 200,
    contentType: 'application/json',
    headers: { 'Cache-Control': 'no-store' },
    body: JSON.stringify({ ok: !cloudStatus.lastSyncError, cloudStatus }),
  };
}

export async function executePluginUpdateAction() {
  const result = await performPluginUpdate({ isAuto: false });
  return {
    status: 200,
    contentType: 'application/json',
    headers: { 'Cache-Control': 'no-store' },
    body: JSON.stringify({ ...result, cloudStatus: getCloudStatus() }),
  };
}

export async function dispatchBridgeApiRequest(pathname, method, data, opts = undefined) {
  if (pathname === '/api/telemetry' && method === 'GET') {
    return executeTelemetryAction(data, opts);
  }
  if (pathname === '/api/settings' && method === 'POST') {
    return executeSettingsAction(data);
  }
  if (pathname === '/api/cloud-sync' && method === 'POST') {
    return executeCloudSyncAction();
  }
  if (pathname === '/api/plugin-update' && method === 'POST') {
    return executePluginUpdateAction();
  }
  return {
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Not found' }),
  };
}

/**
 * 启动进程级双栖窗口桥接器（兼容 Sidecar 环境与独立后台守护进程环境）。
 *
 * @param {{ allowDynamicLs?: boolean, onRestart?: () => void }} [options]
 */
export function bootWindowBridgeRuntime({ allowDynamicLs = false, onRestart = null } = {}) {
  if (lsRuntimeEndpoint.addr === 'test.invalid') return null;
  if (!allowDynamicLs && !lsRuntimeEndpoint.addr) return null;

  const triggerRestart =
    typeof onRestart === 'function' ? onRestart : () => scheduleSidecarRestart(150);

  if (lsRuntimeEndpoint.baseUrl) {
    syncCloudCatalog({ force: false }).catch(() => {});
  } else {
    ensureLsEndpointDiscovered({ force: false })
      .then((ok) => {
        if (ok) {
          syncCloudCatalog({ force: false }).catch(() => {});
        }
      })
      .catch(() => {});
  }

  return startDefaultWindowBridge({
    handleApiRequest: (pathname, method, data) =>
      dispatchBridgeApiRequest(pathname, method, data, { onRestart: triggerRestart }),
    readAssetFn: readLocalAsync,
    bootBundleVersion,
    onVersionDrift: triggerRestart,
  });
}

