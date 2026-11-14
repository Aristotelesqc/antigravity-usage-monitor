/**
 * @fileoverview Antigravity Usage Monitor 面板 Sidecar HTTP 服务入口。
 *
 * 职责边界：
 * - 提供前端静态资产路由（`/`、`/app.js`、`/styles.css`）；
 * - 提供严格同端口 Loopback 受保护的 JSON API 路由：
 *   - `GET /api/telemetry`：获取实时配额、当前会话指标与历史聚合遥测数据；
 *   - `POST /api/settings`：保存用户偏好设置（写入失败时返回 HTTP 500）；
 *   - `POST /api/cloud-sync`：立即从 GitHub 同步最新云端价格目录与版本信息；
 *   - `POST /api/plugin-update`：一键执行插件自更新（Git / Release ZIP 双通道）；
 * - 所有核心业务逻辑与双栖桥接引导均委托至 `./backend/api-actions.mjs`。
 */

import { Response, SidecarApp } from 'sidecar_sdk';
import {
  bootWindowBridgeRuntime,
  executeCloudSyncAction,
  executePluginUpdateAction,
  executeSettingsAction,
  executeTelemetryAction,
  isLocalHostRequest,
  readLocalAsync,
} from './backend/api-actions.mjs';

const app = new SidecarApp();

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

// ---------------------------------------------------------------------------
// 静态页面与前端资产路由
// ---------------------------------------------------------------------------

app.page(
  '/',
  async () =>
    new Response(await readLocalAsync('index.html'), {
      contentType: 'text/html; charset=utf-8',
      headers: NO_STORE_HEADERS,
    })
);

app.page(
  '/app.js',
  async () =>
    new Response(await readLocalAsync('app.js'), {
      contentType: 'application/javascript; charset=utf-8',
      headers: NO_STORE_HEADERS,
    })
);

app.page(
  '/styles.css',
  async () =>
    new Response(await readLocalAsync('styles.css'), {
      contentType: 'text/css; charset=utf-8',
      headers: NO_STORE_HEADERS,
    })
);

// ---------------------------------------------------------------------------
// 业务数据与控制 API 路由
// ---------------------------------------------------------------------------

app.api(
  '/api/telemetry',
  async (data, req) => {
    if (!isLocalHostRequest(req)) {
      return new Response(JSON.stringify({ error: 'Forbidden host or origin' }), {
        status: 403,
        contentType: 'application/json',
      });
    }
    const out = await executeTelemetryAction(data);
    return new Response(out.body, {
      status: out.status,
      contentType: out.contentType,
      headers: out.headers,
    });
  },
  'GET'
);

app.api('/api/settings', (data, req) => {
  if (!isLocalHostRequest(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden host or origin' }), {
      status: 403,
      contentType: 'application/json',
    });
  }
  const out = executeSettingsAction(data);
  if (!out.ok) {
    return new Response(out.body, {
      status: out.status,
      contentType: out.contentType,
      headers: out.headers,
    });
  }
  return out.updated;
});

app.api('/api/cloud-sync', async (_data, req) => {
  if (!isLocalHostRequest(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden host or origin' }), {
      status: 403,
      contentType: 'application/json',
    });
  }
  const out = await executeCloudSyncAction();
  return new Response(out.body, {
    status: out.status,
    contentType: out.contentType,
    headers: out.headers,
  });
});

app.api('/api/plugin-update', async (_data, req) => {
  if (!isLocalHostRequest(req)) {
    return new Response(JSON.stringify({ error: 'Forbidden host or origin' }), {
      status: 403,
      contentType: 'application/json',
    });
  }
  const out = await executePluginUpdateAction();
  return new Response(out.body, {
    status: out.status,
    contentType: out.contentType,
    headers: out.headers,
  });
});

app.run();
bootWindowBridgeRuntime({ allowDynamicLs: false });
