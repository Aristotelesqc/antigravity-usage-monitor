/**
 * @fileoverview Antigravity Hub / Language Server 本地进程自动发现器。
 *
 * 当插件通过 `mcp_config.json` 在 Antigravity IDE 中以后台守护方式启动时，
 * 宿主可能未在环境变量中直接注入 `ANTIGRAVITY_LS_ADDRESS` 与 `ANTIGRAVITY_CSRF_TOKEN`。
 * 本模块跨平台（Windows / macOS / Linux）枚举当前用户的 `agy --hub` 或 `language_server` 进程，
 * 优先匹配父进程 `process.ppid`，并经 `GetUserStatus` 实测握手验证后写入 `lsRuntimeEndpoint`。
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { lsRuntimeEndpoint, setLsRuntimeEndpoint } from './config.mjs';

const LS_DISC_COOLDOWN_MS = 4000;

const lsDiscoveryState = {
  inFlight: null,
  lastAttemptMs: 0,
};

/**
 * 从 `agy --hub` 或 `language_server` 命令行字符串中提取端口号与 CSRF 令牌。
 *
 * @param {string} commandLine
 * @returns {{ hubPort: number|null, csrfToken: string, isHub: boolean, isLanguageServer: boolean }}
 */
export function parseLsArgsFromCommandLine(commandLine) {
  const cmd = String(commandLine || '').trim();
  if (!cmd) {
    return { hubPort: null, csrfToken: '', isHub: false, isLanguageServer: false };
  }
  const isHub = /(?:^|[\s/\\"'])agy(?:\.exe)?(?:["'\s]|$)/i.test(cmd) && /--hub\b/i.test(cmd);
  const isLanguageServer = /language_server/i.test(cmd);

  let hubPort = null;
  const portMatch = cmd.match(/--hub[-_]port(?:=|\s+)["']?(\d{1,5})["']?(?=\s|$)/i);
  if (portMatch) {
    const num = Number(portMatch[1]);
    if (Number.isInteger(num) && num > 0 && num <= 65535) {
      hubPort = num;
    }
  }

  let csrfToken = '';
  const csrfMatch = cmd.match(/--csrf[-_]token(?:=|\s+)(?:"([^"]+)"|'([^']+)'|([^\s"']+))/i);
  if (csrfMatch) {
    csrfToken = String(csrfMatch[1] || csrfMatch[2] || csrfMatch[3] || '').trim();
  }

  return {
    hubPort,
    csrfToken,
    isHub,
    isLanguageServer,
  };
}

async function execLsDiscoveryCmd(file, args, timeoutMs = 5000) {
  const cpMod = await import('node:child_process');
  const execFileFn = cpMod.execFile || cpMod.default?.execFile;
  if (typeof execFileFn !== 'function') {
    throw new Error('child_process.execFile unavailable');
  }
  return new Promise((resolve, reject) => {
    execFileFn(
      file,
      args,
      { windowsHide: true, timeout: timeoutMs, maxBuffer: 2 * 1024 * 1024 },
      (err, stdout) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(String(stdout || ''));
      }
    );
  });
}

function readLinuxProcCandidates() {
  if (!existsSync('/proc')) return [];
  const results = [];
  try {
    for (const entry of readdirSync('/proc')) {
      if (!/^\d+$/.test(entry)) continue;
      const pid = Number(entry);
      try {
        const rawCmd = readFileSync(`/proc/${pid}/cmdline`, 'utf8');
        if (!rawCmd) continue;
        const commandLine = rawCmd.replace(/\0+/g, ' ').trim();
        if (!/agy|language_server/i.test(commandLine)) continue;
        let ppid = 0;
        try {
          const statRaw = readFileSync(`/proc/${pid}/stat`, 'utf8');
          const afterComm = statRaw.slice(statRaw.lastIndexOf(')') + 1).trim();
          const parts = afterComm.split(/\s+/);
          ppid = Number(parts[1]) || 0;
        } catch {
          // 忽略单进程 stat 读取失败
        }
        results.push({ pid, ppid, commandLine });
      } catch {
        // 忽略退出中的瞬态进程
      }
    }
  } catch {
    return [];
  }
  return results;
}

async function listCandidateOsProcesses(platform, execCmdFn) {
  if (platform === 'win32') {
    const psScript =
      "Get-CimInstance Win32_Process -Filter \"Name LIKE 'agy%' OR Name LIKE 'language_server%'\" | Select-Object ProcessId,ParentProcessId,CommandLine | ConvertTo-Json -Compress";
    const out = await execCmdFn('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      psScript,
    ]);
    const trimmed = out.trim();
    if (!trimmed) return [];
    const parsed = JSON.parse(trimmed);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items
      .filter((it) => it && typeof it === 'object')
      .map((it) => ({
        pid: Number(it.ProcessId) || 0,
        ppid: Number(it.ParentProcessId) || 0,
        commandLine: String(it.CommandLine || ''),
      }));
  }

  if (platform === 'linux') {
    const procList = readLinuxProcCandidates();
    if (procList.length > 0) return procList;
  }

  const psArgs =
    platform === 'darwin' ? ['-ax', '-o', 'pid=,ppid=,command='] : ['-ax', '-o', 'pid=,ppid=,args='];
  const out = await execCmdFn('ps', psArgs);
  const results = [];
  for (const line of out.split(/\r?\n/)) {
    const m = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if (!m) continue;
    const cmdLine = m[3];
    if (!/agy|language_server/i.test(cmdLine)) continue;
    results.push({
      pid: Number(m[1]) || 0,
      ppid: Number(m[2]) || 0,
      commandLine: cmdLine,
    });
  }
  return results;
}

async function findListeningPortsForPid(pid, platform, execCmdFn) {
  if (!Number.isInteger(pid) || pid <= 0) return [];
  try {
    if (platform === 'win32') {
      const out = await execCmdFn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `Get-NetTCPConnection -OwningProcess ${pid} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort | ConvertTo-Json -Compress`,
      ]);
      const trimmed = out.trim();
      if (!trimmed) return [];
      const parsed = JSON.parse(trimmed);
      const rawPorts = Array.isArray(parsed) ? parsed : [parsed];
      return Array.from(
        new Set(
          rawPorts
            .map(Number)
            .filter((p) => Number.isInteger(p) && p > 0 && p <= 65535)
        )
      );
    }
    const out = await execCmdFn('lsof', ['-Pan', '-p', String(pid), '-iTCP', '-sTCP:LISTEN']);
    const ports = new Set();
    for (const line of out.split(/\r?\n/)) {
      const m = line.match(/:(\d{1,5})\s+\(LISTEN\)/i);
      if (m) {
        const p = Number(m[1]);
        if (p > 0 && p <= 65535) ports.add(p);
      }
    }
    return Array.from(ports);
  } catch {
    return [];
  }
}

async function probeLsCandidate(port, csrfToken, fetchFn) {
  for (const proto of ['http', 'https']) {
    try {
      const addr = `127.0.0.1:${port}`;
      const baseUrl = `${proto}://${addr}`;
      const res = await fetchFn(
        `${baseUrl}/exa.language_server_pb.LanguageServerService/GetUserStatus`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-codeium-csrf-token': csrfToken,
          },
          body: '{}',
          signal: AbortSignal.timeout(1500),
        }
      );
      if (res?.ok) {
        return { addr: proto === 'https' ? `https://${addr}` : addr, baseUrl, csrfToken };
      }
    } catch {
      // 继续尝试下一候选协议或端口
    }
  }
  return null;
}

/**
 * 自动探测并握手验证本机正在运行的 Antigravity Hub / Language Server RPC 端点。
 *
 * @param {{
 *   ppid?: number,
 *   ancestorPids?: number[],
 *   platform?: string,
 *   execCmdFn?: (file: string, args: string[]) => Promise<string>,
 *   fetchFn?: typeof fetch
 * }} [options]
 * @returns {Promise<{ addr: string, baseUrl: string, csrfToken: string, pid: number } | null>}
 */
export async function discoverAntigravityLsEndpoint(options = {}) {
  const {
    ppid = Number(process?.ppid || 0),
    ancestorPids = [],
    platform = process?.platform || 'win32',
    execCmdFn = execLsDiscoveryCmd,
    fetchFn = typeof fetch === 'function' ? fetch : null,
  } = options;

  if (typeof fetchFn !== 'function') return null;

  const preferredPids = new Set(
    [ppid, ...(Array.isArray(ancestorPids) ? ancestorPids : [])]
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0)
  );

  let rawProcs = [];
  try {
    rawProcs = await listCandidateOsProcesses(platform, execCmdFn);
  } catch {
    return null;
  }
  if (!rawProcs.length) return null;

  const parsedCandidates = [];
  for (const proc of rawProcs) {
    const info = parseLsArgsFromCommandLine(proc.commandLine);
    if (!info.csrfToken || (!info.isHub && !info.isLanguageServer)) continue;
    let priority = 50;
    if (preferredPids.has(proc.pid)) {
      priority = 100;
    } else if (preferredPids.has(proc.ppid)) {
      priority = 90;
    } else if (info.isHub && info.hubPort) {
      priority = 80;
    }
    parsedCandidates.push({
      pid: proc.pid,
      priority,
      hubPort: info.hubPort,
      csrfToken: info.csrfToken,
    });
  }

  parsedCandidates.sort((a, b) => b.priority - a.priority || b.pid - a.pid);

  for (const cand of parsedCandidates) {
    const ports = cand.hubPort
      ? [cand.hubPort]
      : await findListeningPortsForPid(cand.pid, platform, execCmdFn);
    for (const port of ports) {
      const verified = await probeLsCandidate(port, cand.csrfToken, fetchFn);
      if (verified) {
        return { ...verified, pid: cand.pid };
      }
    }
  }
  return null;
}

/**
 * 确保 `lsRuntimeEndpoint` 已就绪（具备并发去重与失败冷却保护）。
 *
 * @param {{ force?: boolean, ancestorPids?: number[] }} [options]
 * @returns {Promise<boolean>}
 */
export async function ensureLsEndpointDiscovered({ force = false, ancestorPids = [] } = {}) {
  if (lsRuntimeEndpoint.addr === 'test.invalid') {
    return false;
  }
  if (!force && lsRuntimeEndpoint.baseUrl && lsRuntimeEndpoint.csrfToken) {
    return true;
  }
  if (lsDiscoveryState.inFlight) {
    return lsDiscoveryState.inFlight;
  }
  const now = Date.now();
  if (
    !force &&
    lsDiscoveryState.lastAttemptMs > 0 &&
    now - lsDiscoveryState.lastAttemptMs < LS_DISC_COOLDOWN_MS
  ) {
    return Boolean(lsRuntimeEndpoint.baseUrl);
  }

  const envHintPids = String(process?.env?.USAGE_MONITOR_HOST_PPID || '')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);

  lsDiscoveryState.lastAttemptMs = now;
  lsDiscoveryState.inFlight = (async () => {
    try {
      const found = await discoverAntigravityLsEndpoint({
        ancestorPids: [...envHintPids, ...ancestorPids],
      });
      if (found && found.addr && found.csrfToken) {
        setLsRuntimeEndpoint(found.addr, found.csrfToken);
        return true;
      }
      return Boolean(lsRuntimeEndpoint.baseUrl);
    } finally {
      lsDiscoveryState.inFlight = null;
    }
  })();

  return lsDiscoveryState.inFlight;
}

