/**
 * @fileoverview Antigravity IDE / 2.0 独立后台双栖窗口桥接守护进程 (`bridge-daemon.mjs`)。
 *
 * 由 `mcp-entry.mjs` 托管拉起，负责：
 * 1. 动态探测本机运行中的 `agy --hub` / `language_server` 端点与 `DevToolsActivePort`；
 * 2. 启动本地回环桥接服务并通过 CDP 将顶栏/输入框监控胶囊热挂载至 Antigravity IDE 与 2.0 窗口；
 * 3. 收到父进程 `SHUTDOWN_DISPOSE` 指令或终止信号时，主动清理窗口浮层并平滑退出。
 */

import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootWindowBridgeRuntime } from './backend/api-actions.mjs';

export function startBridgeDaemon() {
  let shuttingDown = false;
  let sawShutdownDispose = false;
  let stdinBuf = '';

  const controller = bootWindowBridgeRuntime({
    allowDynamicLs: true,
    onRestart: () => {
      void shutdown({ disposeWindows: false, exitCode: 0 });
    },
  });

  async function shutdown({ disposeWindows = false, exitCode = 0 } = {}) {
    if (shuttingDown) return;
    shuttingDown = true;
    const forceTimer = setTimeout(() => {
      process.exit(exitCode);
    }, 1500);
    forceTimer.unref?.();
    try {
      await controller?.stop?.({ disposeWindows });
    } catch {
      // 忽略退出清理异常
    } finally {
      clearTimeout(forceTimer);
      process.exit(exitCode);
    }
  }

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    stdinBuf += String(chunk || '');
    if (stdinBuf.includes('SHUTDOWN_DISPOSE')) {
      sawShutdownDispose = true;
      void shutdown({ disposeWindows: true, exitCode: 0 });
    } else if (stdinBuf.length > 4096) {
      stdinBuf = stdinBuf.slice(-1024);
    }
  });

  process.stdin.on('end', () => {
    void shutdown({ disposeWindows: sawShutdownDispose, exitCode: 0 });
  });
  process.stdin.on('close', () => {
    void shutdown({ disposeWindows: sawShutdownDispose, exitCode: 0 });
  });
  process.on('SIGTERM', () => {
    void shutdown({ disposeWindows: true, exitCode: 0 });
  });
  process.on('SIGINT', () => {
    void shutdown({ disposeWindows: true, exitCode: 0 });
  });

  process.stdin.resume();
  return controller;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath && invokedPath === fileURLToPath(import.meta.url)) {
  startBridgeDaemon();
}
