/**
 * @fileoverview Antigravity Desktop 2.33.0+ 跨平台启动入口自动补齐与一键带参重拉控制器。
 *
 * 背景：
 * Antigravity Desktop (`Antigravity.exe` / `Antigravity.app` / `antigravity`) 自 `2.33.0` 起
 * 默认不再于启动时开启 `--remote-debugging-port=0`，且独立 Electron 桌面端不读取 VS Code 系的 `argv.json`。
 *
 * 本模块在不触碰任何宿主二进制与 `app.asar` 的前提下，提供两层恢复闭环：
 * 1. 日常全自动层 (`ensureDesktopLaunchEntriesConfigured`，后台零弹窗)：
 *    - Windows：自动为个人桌面（含子文件夹及并存的 OneDrive 桌面）、开始菜单、任务栏固定图标、启动文件夹中的
 *      `Antigravity.lnk`、`HKCU\...\Run` 自启项以及 `HKCU\Software\Classes` 下的 `antigravity://` 协议与文件关联
 *      补齐 `--remote-debugging-port=0`；若检测到 All-Users 公共桌面/开始菜单存在只读未修补快捷方式，如实上报
 *      `readOnlyPaths` 供用户点击重启按钮时按需触发 UAC 一次性修补（不在桌面制造双份重影图标）；
 *    - Linux：自动在 `~/.local/share/applications/antigravity.desktop` 与 `~/.config/autostart/antigravity.desktop`
 *      的 `Exec=`（兼容 `env` 前缀与 `.AppImage`）中补齐 `--remote-debugging-port=0`；
 *    - 当用户切回「仅侧边栏」且无上下文窗口覆写时，干净剥离本插件托管的 `--remote-debugging-port=0`，保留用户自定义端口；
 * 2. 当下裸启动会话一键重拉层 (`triggerDesktopHostRelaunch`)：
 *    - Windows 自适应当前权限层级（已提权走 WMI `Win32_Process.Create` 保权脱离 Job Object；普通权限走 `Shell.Application`
 *      并回退 WMI；若存在公共只读快捷方式或已提权的旧宿主进程驻留，则在用户点击重启后请求一次 `-Verb RunAs` UAC 授权完成修补与关闭，
 *      随后按宿主原有权限层级重拉以避免破坏资源管理器文件拖拽）；
 *    - macOS / Linux 通过独立后台会话关闭旧实例、清理陈旧 `DevToolsActivePort` 并追加 `--remote-debugging-port=0` 重开。
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  readlinkSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, win32 as pathWin32 } from 'node:path';
import { DATA_DIR, lsRuntimeEndpoint } from './config.mjs';

export const REMOTE_DEBUG_LAUNCH_FLAG = '--remote-debugging-port=0';

const REMOTE_DEBUG_ANY_RE = /(?:^|\s)--remote-debugging-port(?:=|\s|$)/i;
const REMOTE_DEBUG_MANAGED_ZERO_RE = /(?:^|\s+)--remote-debugging-port=(?:"0"|'0'|0)(?=\s|$)/gi;

/**
 * 解析 Windows PowerShell 5.1 可执行文件绝对路径（防止用户精简系统或异常 `PATH` 丢失裸 `powershell.exe`）。
 *
 * @param {Record<string, string|undefined>} [env=process.env]
 * @param {(p: string) => boolean} [existsFn=existsSync]
 * @returns {string}
 */
export function resolveWindowsPowerShellExecutable(env = process.env, existsFn = existsSync) {
  const sysRoot = String(env?.SystemRoot || env?.WINDIR || 'C:\\Windows').trim();
  if (sysRoot) {
    const candidate = pathWin32.join(
      sysRoot,
      'System32',
      'WindowsPowerShell',
      'v1.0',
      'powershell.exe'
    );
    try {
      if (existsFn(candidate)) return candidate;
    } catch {
      // 忽略文件系统探测异常，回退命令名
    }
  }
  return 'powershell.exe';
}

/**
 * 在命令行参数字符串中幂等补齐或移除托管的 `--remote-debugging-port=0`，保留用户自定义的其它参数或自定义端口。
 *
 * @param {unknown} rawArgs
 * @param {{ enabled?: boolean }} [options]
 * @returns {{ changed: boolean, configured: boolean, alreadyConfigured?: boolean, removed?: boolean, args: string }}
 */
export function ensureRemoteDebugFlagInArgs(rawArgs, { enabled = true } = {}) {
  const current = String(rawArgs ?? '').trim();
  if (enabled) {
    if (REMOTE_DEBUG_ANY_RE.test(current)) {
      return {
        changed: false,
        configured: true,
        alreadyConfigured: true,
        args: current,
      };
    }
    const nextArgs = current
      ? `${current} ${REMOTE_DEBUG_LAUNCH_FLAG}`
      : REMOTE_DEBUG_LAUNCH_FLAG;
    return {
      changed: true,
      configured: true,
      args: nextArgs,
    };
  }

  if (!REMOTE_DEBUG_MANAGED_ZERO_RE.test(current)) {
    REMOTE_DEBUG_MANAGED_ZERO_RE.lastIndex = 0;
    return {
      changed: false,
      configured: REMOTE_DEBUG_ANY_RE.test(current),
      args: current,
    };
  }
  REMOTE_DEBUG_MANAGED_ZERO_RE.lastIndex = 0;
  const stripped = current.replace(REMOTE_DEBUG_MANAGED_ZERO_RE, ' ').replace(/\s{2,}/g, ' ').trim();
  return {
    changed: stripped !== current,
    configured: REMOTE_DEBUG_ANY_RE.test(stripped),
    removed: stripped !== current,
    args: stripped,
  };
}

/**
 * 解析并无损修补 Windows `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` 自启命令行字符串。
 * 严格仅匹配目标可执行文件名为 `Antigravity.exe` 的项（排除 `Antigravity IDE.exe` 及无关程序）。
 *
 * @param {unknown} rawValue
 * @param {{ enabled?: boolean }} [options]
 * @returns {{ matched: boolean, changed: boolean, configured: boolean, value: string }}
 */
export function patchWindowsRunRegistryCommand(rawValue, { enabled = true } = {}) {
  const raw = String(rawValue ?? '').trim();
  if (!raw) {
    return { matched: false, changed: false, configured: false, value: raw };
  }
  const m = raw.match(/^\s*(?:"([^"]+)"|([^\s"]+))([\s\S]*)$/);
  if (!m) {
    return { matched: false, changed: false, configured: false, value: raw };
  }
  const exePath = String(m[1] || m[2] || '').trim();
  const exeLeaf = exePath.split(/[\\/]/).pop() || '';
  if (exeLeaf.toLowerCase() !== 'antigravity.exe') {
    return { matched: false, changed: false, configured: false, value: raw };
  }
  const quotedExe = m[1] ? `"${exePath}"` : /\s/.test(exePath) ? `"${exePath}"` : exePath;
  const patchedArgs = ensureRemoteDebugFlagInArgs(m[3] || '', { enabled });
  const nextValue = patchedArgs.args ? `${quotedExe} ${patchedArgs.args}` : quotedExe;
  return {
    matched: true,
    changed: nextValue !== raw,
    configured: patchedArgs.configured,
    value: nextValue,
  };
}

/**
 * 解析并无损修补 Windows `HKCU\Software\Classes\...\shell\open\command` 协议与文件关联命令行。
 * 将 `--remote-debugging-port=0` 置于主程序路径之后、原有 `--` 或 `"%1"` 占位符之前，确保 Chromium 将其识别为开关而非文件路径。
 *
 * @param {unknown} rawValue
 * @param {{ enabled?: boolean }} [options]
 * @returns {{ matched: boolean, changed: boolean, configured: boolean, value: string }}
 */
export function patchWindowsShellOpenCommand(rawValue, { enabled = true } = {}) {
  const raw = String(rawValue ?? '').trim();
  if (!raw) {
    return { matched: false, changed: false, configured: false, value: raw };
  }
  const m = raw.match(/^\s*(?:"([^"]+)"|([^\s"]+))([\s\S]*)$/);
  if (!m) {
    return { matched: false, changed: false, configured: false, value: raw };
  }
  const exePath = String(m[1] || m[2] || '').trim();
  const exeLeaf = exePath.split(/[\\/]/).pop() || '';
  if (exeLeaf.toLowerCase() !== 'antigravity.exe') {
    return { matched: false, changed: false, configured: false, value: raw };
  }
  const quotedExe = m[1] ? `"${exePath}"` : /\s/.test(exePath) ? `"${exePath}"` : exePath;
  const rest = String(m[3] || '').trim();

  if (enabled) {
    if (REMOTE_DEBUG_ANY_RE.test(rest)) {
      return { matched: true, changed: false, configured: true, value: raw };
    }
    const nextValue = rest
      ? `${quotedExe} ${REMOTE_DEBUG_LAUNCH_FLAG} ${rest}`
      : `${quotedExe} ${REMOTE_DEBUG_LAUNCH_FLAG}`;
    return {
      matched: true,
      changed: nextValue !== raw,
      configured: true,
      value: nextValue,
    };
  }

  const stripped = ensureRemoteDebugFlagInArgs(rest, { enabled: false });
  const nextValue = stripped.args ? `${quotedExe} ${stripped.args}` : quotedExe;
  return {
    matched: true,
    changed: nextValue !== raw,
    configured: stripped.configured,
    value: nextValue,
  };
}

function isLinuxAntigravityDesktopLeaf(leaf) {
  const lower = String(leaf || '').trim().toLowerCase();
  if (!lower || lower.includes('ide')) return false;
  return /^antigravity(?:$|[-_.\d]|(?:\.appimage$))/i.test(lower);
}

function splitLinuxExecTokens(cmdBody) {
  const tokens = [];
  const re = /(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^\s"']+)+/g;
  let m;
  while ((m = re.exec(cmdBody)) !== null) {
    tokens.push({ raw: m[0], start: m.index, end: m.index + m[0].length });
  }
  return tokens;
}

function stripOuterQuotes(tok) {
  if (
    (tok.startsWith('"') && tok.endsWith('"')) ||
    (tok.startsWith("'") && tok.endsWith("'"))
  ) {
    return tok.slice(1, -1);
  }
  return tok;
}

/**
 * 修补 Linux XDG `.desktop` 文件文本中的 `Exec=` 启动行。
 * 兼容 `Exec=env VAR=1 ...` 前缀与 `Antigravity-*.AppImage` 可执行文件，严格排除 `antigravity-ide`。
 *
 * @param {string} rawText
 * @param {{ enabled?: boolean }} [options]
 * @returns {{ matched: boolean, changed: boolean, configured: boolean, text: string }}
 */
export function patchLinuxDesktopEntryText(rawText, { enabled = true } = {}) {
  if (typeof rawText !== 'string' || !rawText.trim()) {
    return { matched: false, changed: false, configured: false, text: String(rawText || '') };
  }
  const eol = rawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = rawText.split(/\r?\n/);
  let matched = false;
  let changed = false;
  let configured = false;

  const nextLines = lines.map((line) => {
    const execMatch = line.match(/^(\s*Exec\s*=\s*)(.+)$/);
    if (!execMatch) return line;
    const prefix = execMatch[1];
    const cmdBody = execMatch[2].trim();
    const tokens = splitLinuxExecTokens(cmdBody);
    if (!tokens.length) return line;

    let binIdx = 0;
    const firstLeaf = (stripOuterQuotes(tokens[0].raw).split('/').pop() || '').toLowerCase();
    if (firstLeaf === 'env') {
      binIdx = 1;
      while (binIdx < tokens.length) {
        const unquoted = stripOuterQuotes(tokens[binIdx].raw);
        if (unquoted === '-S' || /^[A-Za-z_][A-Za-z0-9_]*=/.test(unquoted)) {
          binIdx += 1;
          continue;
        }
        break;
      }
    }
    if (binIdx >= tokens.length) return line;

    const exeTok = tokens[binIdx];
    const exeLeaf = stripOuterQuotes(exeTok.raw).split('/').pop() || '';
    if (!isLinuxAntigravityDesktopLeaf(exeLeaf)) {
      return line;
    }

    matched = true;
    const headThroughExe = cmdBody.slice(0, exeTok.end).trim();
    const rest = cmdBody.slice(exeTok.end).trim();

    if (enabled) {
      if (REMOTE_DEBUG_ANY_RE.test(rest)) {
        configured = true;
        return line;
      }
      configured = true;
      changed = true;
      const fieldCodeMatch = rest.match(/^(.*?)\s*(%[fFuUdDnNickvm](?:\s+%[fFuUdDnNickvm])*)\s*$/);
      if (fieldCodeMatch) {
        const beforeCodes = fieldCodeMatch[1].trim();
        const codes = fieldCodeMatch[2].trim();
        const mid = beforeCodes
          ? `${beforeCodes} ${REMOTE_DEBUG_LAUNCH_FLAG}`
          : REMOTE_DEBUG_LAUNCH_FLAG;
        return `${prefix}${headThroughExe} ${mid} ${codes}`;
      }
      return rest
        ? `${prefix}${headThroughExe} ${rest} ${REMOTE_DEBUG_LAUNCH_FLAG}`
        : `${prefix}${headThroughExe} ${REMOTE_DEBUG_LAUNCH_FLAG}`;
    }

    const stripped = ensureRemoteDebugFlagInArgs(rest, { enabled: false });
    configured = configured || stripped.configured;
    if (!stripped.changed) return line;
    changed = true;
    return stripped.args ? `${prefix}${headThroughExe} ${stripped.args}` : `${prefix}${headThroughExe}`;
  });

  return {
    matched,
    changed,
    configured,
    text: changed ? nextLines.join(eol) : rawText,
  };
}

/**
 * 清理 Sidecar / MCP 子进程继承的宿主会话私有环境变量，确保重拉后的客户端运行于纯净桌面上下文。
 *
 * @param {Record<string, string|undefined>} [baseEnv=process.env]
 * @returns {Record<string, string>}
 */
export function buildSanitizedDesktopRelaunchEnv(baseEnv = process.env) {
  const clean = {};
  for (const [key, val] of Object.entries(baseEnv || {})) {
    if (val === undefined || val === null) continue;
    if (
      /^(?:ANTIGRAVITY_|CHROME_DEVTOOLS_MCP_|USAGE_MONITOR_|ELECTRON_RUN_AS_NODE$|NODE_OPTIONS$)/i.test(
        key
      )
    ) {
      continue;
    }
    clean[key] = String(val);
  }
  return clean;
}

/**
 * 自动定位本机 Antigravity Desktop（或 IDE）主程序路径（优先从 `USAGE_MONITOR_HOST_EXE` / `APPIMAGE` / `ANTIGRAVITY_AGENTAPI_EXE` 反推，回退标准安装目录）。
 *
 * @param {{
 *   env?: Record<string, string|undefined>,
 *   platform?: string,
 *   homeDir?: string,
 *   existsFn?: (p: string) => boolean,
 * }} [options]
 * @returns {{ found: boolean, kind: 'desktop'|'ide'|'', executablePath: string, appBundlePath: string }}
 */
export function resolveDesktopHostExecutable({
  env = process.env,
  platform = process.platform,
  homeDir = homedir(),
  existsFn = existsSync,
} = {}) {
  const safeExists = (p) => {
    try {
      return Boolean(p && existsFn(p));
    } catch {
      return false;
    }
  };

  if (platform === 'linux') {
    const appImagePath = String(env?.APPIMAGE || '').trim();
    if (appImagePath && safeExists(appImagePath)) {
      const leaf = basename(appImagePath);
      if (isLinuxAntigravityDesktopLeaf(leaf)) {
        return { found: true, kind: 'desktop', executablePath: appImagePath, appBundlePath: '' };
      }
    }
  }

  const hintPaths = [
    String(env?.USAGE_MONITOR_HOST_EXE || '').trim(),
    String(env?.ANTIGRAVITY_AGENTAPI_EXE || '').trim(),
    String(env?.CHROME_DEVTOOLS_MCP_JS || '').trim(),
  ].filter(Boolean);

  for (const rawHint of hintPaths) {
    if (platform === 'darwin') {
      const appIdx = rawHint.toLowerCase().indexOf('.app/');
      const bundleCand =
        appIdx >= 0
          ? rawHint.slice(0, appIdx + 4)
          : rawHint.toLowerCase().endsWith('.app')
            ? rawHint
            : '';
      if (bundleCand && safeExists(bundleCand)) {
        const isIde = /antigravity\s*ide\.app$/i.test(bundleCand);
        const macBin = join(
          bundleCand,
          'Contents',
          'MacOS',
          isIde ? 'Antigravity IDE' : 'Antigravity'
        );
        return {
          found: true,
          kind: isIde ? 'ide' : 'desktop',
          executablePath: safeExists(macBin) ? macBin : bundleCand,
          appBundlePath: bundleCand,
        };
      }
    }

    if (platform === 'win32' && /\.exe$/i.test(rawHint) && !/language_server/i.test(rawHint)) {
      if (safeExists(rawHint)) {
        const isIde = /antigravity\s*ide\.exe$/i.test(rawHint);
        return {
          found: true,
          kind: isIde ? 'ide' : 'desktop',
          executablePath: rawHint,
          appBundlePath: '',
        };
      }
    }

    let cur = rawHint;
    for (let depth = 0; depth < 8 && cur && dirname(cur) !== cur; depth += 1) {
      const base = basename(cur).toLowerCase();
      if (base === 'resources') {
        const installRoot = dirname(cur);
        if (platform === 'win32') {
          const desktopExe = join(installRoot, 'Antigravity.exe');
          if (safeExists(desktopExe)) {
            return { found: true, kind: 'desktop', executablePath: desktopExe, appBundlePath: '' };
          }
          const ideExe = join(installRoot, 'Antigravity IDE.exe');
          if (safeExists(ideExe)) {
            return { found: true, kind: 'ide', executablePath: ideExe, appBundlePath: '' };
          }
        } else if (platform === 'linux') {
          for (const binName of ['antigravity', 'Antigravity']) {
            const linuxExe = join(installRoot, binName);
            if (safeExists(linuxExe) && !installRoot.startsWith('/tmp/.mount_')) {
              return { found: true, kind: 'desktop', executablePath: linuxExe, appBundlePath: '' };
            }
          }
        }
      }
      cur = dirname(cur);
    }
  }

  if (platform === 'win32') {
    const localAppData = env?.LOCALAPPDATA || join(homeDir, 'AppData', 'Local');
    const programFiles = env?.ProgramFiles || 'C:\\Program Files';
    const winCandidates = [
      join(localAppData, 'Programs', 'Antigravity', 'Antigravity.exe'),
      join(programFiles, 'Antigravity', 'Antigravity.exe'),
      join(localAppData, 'Antigravity', 'Antigravity.exe'),
    ];
    for (const cand of winCandidates) {
      if (safeExists(cand)) {
        return { found: true, kind: 'desktop', executablePath: cand, appBundlePath: '' };
      }
    }
  } else if (platform === 'darwin') {
    const macBundles = [
      join(homeDir, 'Applications', 'Antigravity.app'),
      '/Applications/Antigravity.app',
    ];
    for (const bundlePath of macBundles) {
      if (safeExists(bundlePath)) {
        const macBin = join(bundlePath, 'Contents', 'MacOS', 'Antigravity');
        return {
          found: true,
          kind: 'desktop',
          executablePath: safeExists(macBin) ? macBin : bundlePath,
          appBundlePath: bundlePath,
        };
      }
    }
  } else {
    const linuxCandidates = [
      '/opt/Antigravity/antigravity',
      '/opt/antigravity/antigravity',
      '/usr/share/antigravity/antigravity',
      '/usr/bin/antigravity',
      join(homeDir, '.local', 'bin', 'antigravity'),
    ];
    for (const cand of linuxCandidates) {
      if (safeExists(cand)) {
        return { found: true, kind: 'desktop', executablePath: cand, appBundlePath: '' };
      }
    }
  }

  return { found: false, kind: '', executablePath: '', appBundlePath: '' };
}

async function runLauncherExecFile(file, args, options = {}) {
  const cpMod = await import('node:child_process');
  const execFileFn = cpMod.execFile || cpMod.default?.execFile;
  if (typeof execFileFn !== 'function') {
    throw new Error('child_process.execFile unavailable');
  }
  return new Promise((resolve, reject) => {
    execFileFn(
      file,
      args,
      {
        windowsHide: true,
        timeout: options.timeoutMs || 9000,
        maxBuffer: 1024 * 1024,
        env: options.env || process.env,
      },
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

async function spawnDetachedProcess(file, args, options = {}) {
  const cpMod = await import('node:child_process');
  const spawnFn = cpMod.spawn || cpMod.default?.spawn;
  if (typeof spawnFn !== 'function') {
    throw new Error('child_process.spawn unavailable');
  }
  const child = spawnFn(file, args, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    cwd: options.cwd || undefined,
    env: options.env || process.env,
  });
  child.unref?.();
  return { pid: Number(child?.pid || 0) };
}

function writeTextFileAtomically(filePath, content, fsOps) {
  const { mkdirFn, writeFn, renameFn, unlinkFn } = fsOps;
  mkdirFn(dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp-${process.pid}`;
  try {
    writeFn(tmpPath, content, 'utf8');
    renameFn(tmpPath, filePath);
  } catch {
    try {
      unlinkFn(tmpPath);
    } catch {
      // 忽略临时文件清理异常
    }
    writeFn(filePath, content, 'utf8');
  }
}

/**
 * 检查单个 Windows `.lnk` 二进制 Buffer 是否指向 `Antigravity.exe`（排除 `Antigravity IDE.exe`）及是否已包含调试端口参数。
 * 基于 `[MS-SHLLINK]` 原始字节扫描，纯内存耗时 `< 0.1ms`，无需拉起任何外部子进程或 COM 组件。
 *
 * @param {Buffer} buf
 * @returns {{ matched: boolean, hasDebugPort: boolean }}
 */
export function inspectWindowsLnkBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 32 || buf.length > 65536) {
    return { matched: false, hasDebugPort: false };
  }
  const ascii = buf.toString('latin1').toLowerCase();
  const utf16 = buf.toString('utf16le').toLowerCase();
  const hasIde = ascii.includes('antigravity ide.exe') || utf16.includes('antigravity ide.exe');
  if (hasIde) {
    return { matched: false, hasDebugPort: false };
  }
  const hasDesktopExe =
    ascii.includes('\\antigravity.exe') ||
    utf16.includes('\\antigravity.exe') ||
    ascii.includes('/antigravity.exe') ||
    utf16.includes('/antigravity.exe');
  if (!hasDesktopExe) {
    return { matched: false, hasDebugPort: false };
  }
  const hasDebugPort =
    ascii.includes('--remote-debugging-port') || utf16.includes('--remote-debugging-port');
  return { matched: true, hasDebugPort };
}

/**
 * 纯 Node.js 零子进程快速扫描当前机器上的 `Antigravity.exe` 快捷方式配置状态（耗时通常 `< 2ms`）。
 * 桌面与任务栏严格仅扫描顶层 `.lnk`（绝不进入用户项目文件夹或 `node_modules`），开始菜单仅检查顶层及 `Antigravity*` 一级子目录。
 *
 * @param {{
 *   env?: Record<string, string|undefined>,
 *   homeDir?: string,
 *   fsOps?: {
 *     readdirFn?: typeof readdirSync,
 *     statFn?: typeof statSync,
 *     readFn?: typeof readFileSync,
 *   }|null,
 * }} [options]
 */
export function probeWindowsShortcutsFast({
  env = process.env,
  homeDir = homedir(),
  fsOps = null,
} = {}) {
  const readdirFn = fsOps?.readdirFn || readdirSync;
  const statFn = fsOps?.statFn || statSync;
  const readFn = fsOps?.readFn || readFileSync;

  const zhDesktop = '\u684C\u9762';
  const userProfile = String(env?.USERPROFILE || homeDir || '').trim();
  const appData = String(env?.APPDATA || (homeDir ? pathWin32.join(homeDir, 'AppData', 'Roaming') : '')).trim();
  const publicRoot = String(env?.PUBLIC || 'C:\\Users\\Public').trim();
  const programData = String(env?.ProgramData || 'C:\\ProgramData').trim();

  const flatDirs = [];
  if (userProfile) {
    flatDirs.push(pathWin32.join(userProfile, 'Desktop'), pathWin32.join(userProfile, zhDesktop));
  }
  for (const od of [env?.OneDrive, env?.OneDriveConsumer, env?.OneDriveCommercial]) {
    const cleanOd = String(od || '').trim();
    if (cleanOd) {
      flatDirs.push(pathWin32.join(cleanOd, 'Desktop'), pathWin32.join(cleanOd, zhDesktop));
    }
  }
  if (appData) {
    flatDirs.push(
      pathWin32.join(appData, 'Microsoft', 'Windows', 'Start Menu'),
      pathWin32.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup'),
      pathWin32.join(appData, 'Microsoft', 'Internet Explorer', 'Quick Launch', 'User Pinned', 'TaskBar')
    );
  }
  if (publicRoot) {
    flatDirs.push(pathWin32.join(publicRoot, 'Desktop'), pathWin32.join(publicRoot, zhDesktop));
  }

  const programRoots = [];
  if (appData) {
    programRoots.push(pathWin32.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
  }
  if (programData) {
    programRoots.push(pathWin32.join(programData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'));
  }

  const seenDirs = new Set();
  const candidateLnks = [];
  const seenLnks = new Set();

  const collectTopLevelLnks = (dirPath, expandAntigravitySubdirs = false) => {
    if (!dirPath) return;
    const normDir = dirPath.toLowerCase();
    if (seenDirs.has(normDir)) return;
    seenDirs.add(normDir);
    let entries = [];
    try {
      entries = readdirFn(dirPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const name = String(ent?.name || '');
      if (!name) continue;
      if (ent.isFile?.() && name.toLowerCase().endsWith('.lnk')) {
        const full = pathWin32.join(dirPath, name);
        const key = full.toLowerCase();
        if (!seenLnks.has(key)) {
          seenLnks.add(key);
          candidateLnks.push(full);
        }
      } else if (
        expandAntigravitySubdirs &&
        ent.isDirectory?.() &&
        name.toLowerCase().startsWith('antigravity')
      ) {
        collectTopLevelLnks(pathWin32.join(dirPath, name), false);
      }
    }
  };

  for (const d of flatDirs) collectTopLevelLnks(d, false);
  for (const p of programRoots) collectTopLevelLnks(p, true);

  const matchedPaths = [];
  const configuredPaths = [];
  const unconfiguredPaths = [];

  for (const lnkPath of candidateLnks) {
    try {
      const st = statFn(lnkPath);
      if (!st || st.size < 32 || st.size > 65536) continue;
      const buf = readFn(lnkPath);
      const res = inspectWindowsLnkBuffer(buf);
      if (!res.matched) continue;
      matchedPaths.push(lnkPath);
      if (res.hasDebugPort) {
        configuredPaths.push(lnkPath);
      } else {
        unconfiguredPaths.push(lnkPath);
      }
    } catch {
      // 忽略单个无权限或损坏的快捷方式文件
    }
  }

  return {
    matchedPaths,
    configuredPaths,
    unconfiguredPaths,
    allConfigured: matchedPaths.length > 0 && unconfiguredPaths.length === 0,
  };
}

const WIN_SHORTCUT_PROVISION_PS = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'SilentlyContinue'
$enableFlag = $env:AGY_LAUNCH_ENABLED -eq '1'
$updated = New-Object System.Collections.Generic.List[string]
$configured = New-Object System.Collections.Generic.List[string]
$readOnly = New-Object System.Collections.Generic.List[string]
$ws = $null
$userProgramsDir = [Environment]::GetFolderPath('Programs')
$zhDesktop = ([string][char]0x684C + [string][char]0x9762)

$flatSpecs = New-Object System.Collections.Generic.List[object]
$seenScanDir = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)

function Add-ScanDir([string]$dirPath, [bool]$isCommon, [string]$kind, [bool]$expandVendorSubdir) {
  if (-not $dirPath) { return }
  if (-not $seenScanDir.Add($dirPath)) { return }
  $exists = $false
  try { $exists = [bool](Test-Path -LiteralPath $dirPath -ErrorAction SilentlyContinue) } catch { $exists = $false }
  if (-not $exists) { return }
  $flatSpecs.Add(@{ Dir = $dirPath; IsCommon = $isCommon; Kind = $kind })
  if ($expandVendorSubdir) {
    try {
      foreach ($sub in @(Get-ChildItem -LiteralPath $dirPath -Directory -Filter 'Antigravity*' -ErrorAction SilentlyContinue)) {
        if ($sub -and $sub.FullName -and $seenScanDir.Add([string]$sub.FullName)) {
          $flatSpecs.Add(@{ Dir = [string]$sub.FullName; IsCommon = $isCommon; Kind = $kind })
        }
      }
    } catch {}
  }
}

foreach ($d in @(
  [Environment]::GetFolderPath('Desktop'),
  $(if ($env:USERPROFILE) { Join-Path $env:USERPROFILE 'Desktop' } else { '' }),
  $(if ($env:USERPROFILE) { Join-Path $env:USERPROFILE $zhDesktop } else { '' })
)) {
  Add-ScanDir $d $false 'desktop' $false
}
foreach ($od in @($env:OneDrive, $env:OneDriveConsumer, $env:OneDriveCommercial)) {
  if ($od) {
    Add-ScanDir (Join-Path $od 'Desktop') $false 'desktop' $false
    Add-ScanDir (Join-Path $od $zhDesktop) $false 'desktop' $false
  }
}
Add-ScanDir $userProgramsDir $false 'programs' $true
Add-ScanDir ([Environment]::GetFolderPath('StartMenu')) $false 'startmenu' $false
Add-ScanDir ([Environment]::GetFolderPath('Startup')) $false 'startup' $false
if ($env:APPDATA) {
  Add-ScanDir (Join-Path $env:APPDATA 'Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar') $false 'taskbar' $false
}
Add-ScanDir ([Environment]::GetFolderPath('CommonDesktopDirectory')) $true 'desktop' $false
Add-ScanDir ([Environment]::GetFolderPath('CommonPrograms')) $true 'programs' $true

$seen = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
foreach ($spec in $flatSpecs) {
  $dir = [string]$spec.Dir
  $items = @()
  try {
    $items = @(Get-ChildItem -LiteralPath $dir -Filter '*.lnk' -File -ErrorAction SilentlyContinue)
  } catch { continue }

  foreach ($item in $items) {
    if ($item.Length -lt 32 -or $item.Length -gt 65536) { continue }
    $lnkPath = [string]$item.FullName
    if (-not $seen.Add($lnkPath)) { continue }
    try {
      $rawBytes = [System.IO.File]::ReadAllBytes($lnkPath)
      $u16 = [System.Text.Encoding]::Unicode.GetString($rawBytes)
      $lat = [System.Text.Encoding]::GetEncoding(28591).GetString($rawBytes)
      if ($u16.IndexOf('antigravity.exe', [System.StringComparison]::OrdinalIgnoreCase) -lt 0 -and
          $lat.IndexOf('antigravity.exe', [System.StringComparison]::OrdinalIgnoreCase) -lt 0) {
        continue
      }
      if (-not $ws) { $ws = New-Object -ComObject WScript.Shell }
      $sc = $ws.CreateShortcut($lnkPath)
      $target = [string]$sc.TargetPath
      if ([System.IO.Path]::GetFileName($target) -ine 'Antigravity.exe') { continue }
      $curArgs = [string]$sc.Arguments
      if ($enableFlag) {
        if ($curArgs -match '(?:^|\\s)--remote-debugging-port(?:=|\\s|$)') {
          $configured.Add($lnkPath)
          continue
        }
        $nextArgs = ($curArgs.Trim() + ' --remote-debugging-port=0').Trim()
        try {
          $sc.Arguments = $nextArgs
          $sc.Save()
          $updated.Add($lnkPath)
          $configured.Add($lnkPath)
        } catch {
          $readOnly.Add($lnkPath)
          if ($spec.IsCommon -and $spec.Kind -eq 'programs' -and $userProgramsDir -and (Test-Path -LiteralPath $userProgramsDir -ErrorAction SilentlyContinue)) {
            $fallbackLnk = Join-Path $userProgramsDir ([System.IO.Path]::GetFileName($lnkPath))
            if (-not (Test-Path -LiteralPath $fallbackLnk -ErrorAction SilentlyContinue)) {
              try {
                $uSc = $ws.CreateShortcut($fallbackLnk)
                $uSc.TargetPath = $target
                $uSc.Arguments = $nextArgs
                if ($sc.WorkingDirectory) { $uSc.WorkingDirectory = $sc.WorkingDirectory }
                if ($sc.IconLocation) { $uSc.IconLocation = $sc.IconLocation }
                if ($sc.Description) { $uSc.Description = $sc.Description }
                $uSc.Save()
                $updated.Add($fallbackLnk)
                $configured.Add($fallbackLnk)
              } catch {}
            }
          }
        }
      } else {
        $stripped = ([regex]::Replace($curArgs, '(?:^|\\s+)--remote-debugging-port=(?:"0"|''0''|0)(?=\\s|$)', ' ')).Trim()
        if ($stripped -ne $curArgs.Trim()) {
          try {
            $sc.Arguments = $stripped
            $sc.Save()
            $updated.Add($lnkPath)
          } catch {
            $readOnly.Add($lnkPath)
          }
        }
        if ($stripped -match '(?:^|\\s)--remote-debugging-port(?:=|\\s|$)') {
          $configured.Add($lnkPath)
        }
      }
    } catch {}
  }
}

$runSubPath = 'Software\\Microsoft\\Windows\\CurrentVersion\\Run'
try {
  $runReadKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($runSubPath, $false)
  if ($runReadKey) {
    $runNames = @($runReadKey.GetValueNames())
    $runReadKey.Close()
    foreach ($valName in $runNames) {
      $rk = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($runSubPath, $false)
      if (-not $rk) { continue }
      $rawCmd = [string]$rk.GetValue($valName, '', [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
      $rk.Close()
      if (-not $rawCmd) { continue }
      if ($rawCmd -notmatch '^\\s*(?:"([^"]+)"|([^\\s"]+))(.*)$') { continue }
      $exeCandidate = if ($Matches[1]) { $Matches[1] } else { $Matches[2] }
      $restPart = [string]$Matches[3]
      if ([System.IO.Path]::GetFileName($exeCandidate) -ine 'Antigravity.exe') { continue }
      $quotedExe = if ($Matches[1] -or $exeCandidate -match '\\s') { '"' + $exeCandidate + '"' } else { $exeCandidate }
      if ($enableFlag) {
        if ($restPart -match '(?:^|\\s)--remote-debugging-port(?:=|\\s|$)') {
          $configured.Add("HKCU:Run:$valName")
          continue
        }
        $nextRest = ($restPart.Trim() + ' --remote-debugging-port=0').Trim()
        $nextVal = "$quotedExe $nextRest"
        try {
          $wk = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($runSubPath, $true)
          if ($wk) {
            $wk.SetValue($valName, $nextVal, [Microsoft.Win32.RegistryValueKind]::String)
            $wk.Close()
            $updated.Add("HKCU:Run:$valName")
            $configured.Add("HKCU:Run:$valName")
          }
        } catch {}
      } else {
        $strippedRest = ([regex]::Replace($restPart, '(?:^|\\s+)--remote-debugging-port=(?:"0"|''0''|0)(?=\\s|$)', ' ')).Trim()
        $nextVal = if ($strippedRest) { "$quotedExe $strippedRest" } else { $quotedExe }
        if ($nextVal -ne $rawCmd.Trim()) {
          try {
            $wk = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($runSubPath, $true)
            if ($wk) {
              $wk.SetValue($valName, $nextVal, [Microsoft.Win32.RegistryValueKind]::String)
              $wk.Close()
              $updated.Add("HKCU:Run:$valName")
            }
          } catch {}
        }
        if ($strippedRest -match '(?:^|\\s)--remote-debugging-port(?:=|\\s|$)') {
          $configured.Add("HKCU:Run:$valName")
        }
      }
    }
  }
} catch {}

$exactClassSubKeys = @(
  'Software\\Classes\\antigravity\\shell\\open\\command',
  'Software\\Classes\\Applications\\Antigravity.exe\\shell\\open\\command',
  'Software\\Classes\\AntigravitySourceFile\\shell\\open\\command'
)
foreach ($relSubKey in $exactClassSubKeys) {
  try {
    $rOpen = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($relSubKey, $false)
    if (-not $rOpen) { continue }
    $rawOpen = [string]$rOpen.GetValue('', '', [Microsoft.Win32.RegistryValueOptions]::DoNotExpandEnvironmentNames)
    $rOpen.Close()
    if (-not $rawOpen) { continue }
    if ($rawOpen -notmatch '^\\s*(?:"([^"]+)"|([^\\s"]+))(.*)$') { continue }
    $exeCand = if ($Matches[1]) { $Matches[1] } else { $Matches[2] }
    $restOpen = ([string]$Matches[3]).Trim()
    if ([System.IO.Path]::GetFileName($exeCand) -ine 'Antigravity.exe') { continue }
    $quotedOpenExe = if ($Matches[1] -or $exeCand -match '\\s') { '"' + $exeCand + '"' } else { $exeCand }
    $fullKeyName = "HKEY_CURRENT_USER\\$relSubKey"
    if ($enableFlag) {
      if ($restOpen -match '(?:^|\\s)--remote-debugging-port(?:=|\\s|$)') {
        $configured.Add($fullKeyName)
        continue
      }
      $nextOpen = if ($restOpen) { "$quotedOpenExe --remote-debugging-port=0 $restOpen" } else { "$quotedOpenExe --remote-debugging-port=0" }
      try {
        $wOpen = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($relSubKey, $true)
        if ($wOpen) {
          $wOpen.SetValue('', $nextOpen, [Microsoft.Win32.RegistryValueKind]::String)
          $wOpen.Close()
          $updated.Add($fullKeyName)
          $configured.Add($fullKeyName)
        }
      } catch {}
    } else {
      $strippedOpen = ([regex]::Replace($restOpen, '(?:^|\\s+)--remote-debugging-port=(?:"0"|''0''|0)(?=\\s|$)', ' ')).Trim()
      $nextOpen = if ($strippedOpen) { "$quotedOpenExe $strippedOpen" } else { $quotedOpenExe }
      if ($nextOpen -ne $rawOpen.Trim()) {
        try {
          $wOpen = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($relSubKey, $true)
          if ($wOpen) {
            $wOpen.SetValue('', $nextOpen, [Microsoft.Win32.RegistryValueKind]::String)
            $wOpen.Close()
            $updated.Add($fullKeyName)
          }
        } catch {}
      }
      if ($strippedOpen -match '(?:^|\\s)--remote-debugging-port(?:=|\\s|$)') {
        $configured.Add($fullKeyName)
      }
    }
  } catch {}
}

[pscustomobject]@{
  ok = $true
  updatedPaths = @($updated)
  configuredPaths = @($configured)
  readOnlyPaths = @($readOnly)
} | ConvertTo-Json -Compress
`.trim();

/**
 * 自动同步当前系统下用户空间启动入口（Windows `.lnk` / `HKCU:Run` / `HKCU:Classes`、Linux `.desktop`）中的 `--remote-debugging-port=0`。
 *
 * @param {{
 *   enabled?: boolean,
 *   fastCheckIfActive?: boolean,
 *   env?: Record<string, string|undefined>,
 *   platform?: string,
 *   homeDir?: string,
 *   execFileFn?: ((file: string, args: string[], opts?: object) => Promise<string>)|null,
 *   fsOps?: {
 *     existsFn?: typeof existsSync,
 *     readFn?: typeof readFileSync,
 *     writeFn?: typeof writeFileSync,
 *     mkdirFn?: typeof mkdirSync,
 *     renameFn?: typeof renameSync,
 *     unlinkFn?: typeof unlinkSync,
 *     readdirFn?: typeof readdirSync,
 *     statFn?: typeof statSync,
 *   }|null,
 *   allowInTest?: boolean,
 * }} [options]
 */
export async function ensureDesktopLaunchEntriesConfigured({
  enabled = true,
  fastCheckIfActive = false,
  env = process.env,
  platform = process.platform,
  homeDir = homedir(),
  execFileFn = null,
  fsOps = null,
  allowInTest = false,
} = {}) {
  if (lsRuntimeEndpoint.addr === 'test.invalid' && !allowInTest) {
    return {
      checked: false,
      updated: false,
      alreadyConfigured: false,
      configured: false,
      hasReadOnlyShortcuts: false,
      updatedPaths: [],
      configuredPaths: [],
      readOnlyPaths: [],
      reason: 'test_sandbox_skipped',
    };
  }

  const ops = {
    existsFn: fsOps?.existsFn || existsSync,
    readFn: fsOps?.readFn || readFileSync,
    writeFn: fsOps?.writeFn || writeFileSync,
    mkdirFn: fsOps?.mkdirFn || mkdirSync,
    renameFn: fsOps?.renameFn || renameSync,
    unlinkFn: fsOps?.unlinkFn || unlinkSync,
    readdirFn: fsOps?.readdirFn || readdirSync,
    statFn: fsOps?.statFn || statSync,
  };

  if (platform === 'win32') {
    // 稳态零子进程快检：当调试端口已活跃或处于周期复检且所有 `.lnk` 字节内均已含参数时，直接返回（<2ms，不拉起 PowerShell）
    if (!execFileFn && fastCheckIfActive) {
      const fast = probeWindowsShortcutsFast({ env, homeDir, fsOps: ops });
      if (enabled && fast.allConfigured) {
        return {
          checked: true,
          fastPath: true,
          updated: false,
          alreadyConfigured: true,
          configured: true,
          hasReadOnlyShortcuts: false,
          updatedPaths: [],
          configuredPaths: fast.configuredPaths,
          readOnlyPaths: [],
        };
      }
      if (!enabled && fast.configuredPaths.length === 0) {
        return {
          checked: true,
          fastPath: true,
          updated: false,
          alreadyConfigured: false,
          configured: false,
          hasReadOnlyShortcuts: false,
          updatedPaths: [],
          configuredPaths: [],
          readOnlyPaths: [],
        };
      }
    }

    try {
      const runner = execFileFn || runLauncherExecFile;
      const psExe = execFileFn ? 'powershell.exe' : resolveWindowsPowerShellExecutable(env, ops.existsFn);
      const out = await runner(
        psExe,
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', WIN_SHORTCUT_PROVISION_PS],
        {
          timeoutMs: 10000,
          env: {
            ...env,
            AGY_LAUNCH_ENABLED: enabled ? '1' : '0',
          },
        }
      );
      const trimmed = String(out || '').trim();
      const jsonLine = trimmed.split(/\r?\n/).reverse().find((l) => l.trim().startsWith('{')) || '';
      const parsed = jsonLine ? JSON.parse(jsonLine) : null;
      const updatedPaths = Array.isArray(parsed?.updatedPaths)
        ? parsed.updatedPaths.map(String).filter(Boolean)
        : [];
      const configuredPaths = Array.isArray(parsed?.configuredPaths)
        ? parsed.configuredPaths.map(String).filter(Boolean)
        : [];
      const readOnlyPaths = Array.isArray(parsed?.readOnlyPaths)
        ? parsed.readOnlyPaths.map(String).filter(Boolean)
        : [];
      const hasReadOnlyShortcuts = enabled && readOnlyPaths.length > 0;
      return {
        checked: true,
        updated: updatedPaths.length > 0,
        alreadyConfigured: updatedPaths.length === 0 && configuredPaths.length > 0,
        configured: configuredPaths.length > 0,
        hasReadOnlyShortcuts,
        updatedPaths,
        configuredPaths,
        readOnlyPaths,
      };
    } catch (err) {
      return {
        checked: true,
        updated: false,
        alreadyConfigured: false,
        configured: false,
        hasReadOnlyShortcuts: false,
        updatedPaths: [],
        configuredPaths: [],
        readOnlyPaths: [],
        reason: 'win_shortcut_error',
        error: err?.message || String(err),
      };
    }
  }

  if (platform === 'linux') {
    const dataHome = env?.XDG_DATA_HOME || join(homeDir, '.local', 'share');
    const configHome = env?.XDG_CONFIG_HOME || join(homeDir, '.config');
    const userDesktopFile = join(dataHome, 'applications', 'antigravity.desktop');
    const systemDesktopFiles = [
      '/usr/share/applications/antigravity.desktop',
      '/usr/local/share/applications/antigravity.desktop',
    ];
    const autostartDesktopFile = join(configHome, 'autostart', 'antigravity.desktop');

    const updatedPaths = [];
    const configuredPaths = [];

    try {
      let baseUserText = '';
      if (ops.existsFn(userDesktopFile)) {
        baseUserText = String(ops.readFn(userDesktopFile, 'utf8') || '');
      } else if (enabled) {
        const sysSource = systemDesktopFiles.find((p) => ops.existsFn(p));
        if (sysSource) {
          baseUserText = String(ops.readFn(sysSource, 'utf8') || '');
        }
      }
      if (baseUserText) {
        const patched = patchLinuxDesktopEntryText(baseUserText, { enabled });
        if (patched.changed) {
          writeTextFileAtomically(userDesktopFile, patched.text, ops);
          updatedPaths.push(userDesktopFile);
        }
        if (patched.configured) {
          configuredPaths.push(userDesktopFile);
        }
      }

      if (ops.existsFn(autostartDesktopFile)) {
        const autoRaw = String(ops.readFn(autostartDesktopFile, 'utf8') || '');
        const patchedAuto = patchLinuxDesktopEntryText(autoRaw, { enabled });
        if (patchedAuto.changed) {
          writeTextFileAtomically(autostartDesktopFile, patchedAuto.text, ops);
          updatedPaths.push(autostartDesktopFile);
        }
        if (patchedAuto.configured) {
          configuredPaths.push(autostartDesktopFile);
        }
      }

      return {
        checked: true,
        updated: updatedPaths.length > 0,
        alreadyConfigured: updatedPaths.length === 0 && configuredPaths.length > 0,
        configured: configuredPaths.length > 0,
        hasReadOnlyShortcuts: false,
        updatedPaths,
        configuredPaths,
        readOnlyPaths: [],
      };
    } catch (err) {
      return {
        checked: true,
        updated: false,
        alreadyConfigured: false,
        configured: false,
        hasReadOnlyShortcuts: false,
        updatedPaths,
        configuredPaths,
        readOnlyPaths: [],
        reason: 'linux_desktop_error',
        error: err?.message || String(err),
      };
    }
  }

  // macOS `.app` 包具有 Apple 代码签名，不修改签名目录，交由一键重拉 (`open -a ... --args`) 处理
  return {
    checked: true,
    updated: false,
    alreadyConfigured: false,
    configured: false,
    hasReadOnlyShortcuts: false,
    updatedPaths: [],
    configuredPaths: [],
    readOnlyPaths: [],
    reason: 'macos_app_bundle_signed',
  };
}

/**
 * 当静态环境变量与默认安装目录均未命中（如用户自定义安装至 D:/E: 盘、Linux 自定义目录或 AppImage）时，
 * 直接从当前正在运行的宿主进程动态反查主程序绝对路径。
 */
async function discoverRunningHostExecutable({
  platform = process.platform,
  env = process.env,
  execFileFn = null,
} = {}) {
  const runner = execFileFn || runLauncherExecFile;
  if (platform === 'win32') {
    try {
      const psExe = execFileFn ? 'powershell.exe' : resolveWindowsPowerShellExecutable(env);
      const ps =
        "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; @(Get-Process -Name 'Antigravity','Antigravity IDE' -ErrorAction SilentlyContinue | Where-Object { $_.Path } | Select-Object -First 1) | ForEach-Object { [pscustomobject]@{ path = [string]$_.Path; name = [string]$_.ProcessName } } | ConvertTo-Json -Compress";
      const out = await runner(
        psExe,
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps],
        { timeoutMs: 4000 }
      );
      const trimmed = String(out || '').trim();
      if (trimmed && trimmed.startsWith('{')) {
        const parsed = JSON.parse(trimmed);
        const exePath = String(parsed?.path || '').trim();
        if (exePath) {
          const isIde = /ide/i.test(String(parsed?.name || '')) || /antigravity\s*ide\.exe$/i.test(exePath);
          return {
            found: true,
            kind: isIde ? 'ide' : 'desktop',
            executablePath: exePath,
            appBundlePath: '',
          };
        }
      }
    } catch {
      // 忽略动态进程探测异常
    }
  } else if (platform === 'darwin') {
    try {
      const out = await runner(
        'osascript',
        ['-e', 'POSIX path of (path to application "Antigravity")'],
        { timeoutMs: 3000 }
      );
      const bundlePath = String(out || '').trim().replace(/\/+$/, '');
      if (bundlePath && /\.app$/i.test(bundlePath)) {
        return {
          found: true,
          kind: 'desktop',
          executablePath: bundlePath,
          appBundlePath: bundlePath,
        };
      }
    } catch {
      // 忽略 AppleScript 探测异常
    }
  } else if (platform === 'linux') {
    if (!execFileFn && typeof process.getuid === 'function') {
      try {
        const myUid = process.getuid();
        for (const name of readdirSync('/proc')) {
          if (!/^\d+$/.test(name)) continue;
          const procDir = `/proc/${name}`;
          try {
            const st = statSync(procDir);
            if (st.uid !== myUid) continue;
            const exeTarget = String(readlinkSync(`${procDir}/exe`) || '').trim();
            if (!exeTarget) continue;
            const leaf = basename(exeTarget);
            if (!isLinuxAntigravityDesktopLeaf(leaf)) continue;
            try {
              const envRaw = readFileSync(`${procDir}/environ`, 'utf8');
              for (const entry of envRaw.split('\0')) {
                if (entry.startsWith('APPIMAGE=')) {
                  const appImg = entry.slice('APPIMAGE='.length).trim();
                  if (appImg && existsSync(appImg)) {
                    return { found: true, kind: 'desktop', executablePath: appImg, appBundlePath: '' };
                  }
                }
              }
            } catch {
              // 忽略 environ 读取异常
            }
            if (exeTarget.startsWith('/tmp/.mount_')) continue;
            return { found: true, kind: 'desktop', executablePath: exeTarget, appBundlePath: '' };
          } catch {
            // 忽略单个瞬态退出的进程目录
          }
        }
      } catch {
        // 忽略 /proc 原生扫描异常，回退外部命令探测
      }
    }
    if (execFileFn) {
      try {
        const out = await runner('/bin/sh', ['-c', 'true'], { timeoutMs: 2000 });
        const foundLinuxExe = String(out || '').trim().split(/\r?\n/)[0]?.trim() || '';
        if (foundLinuxExe) {
          return {
            found: true,
            kind: 'desktop',
            executablePath: foundLinuxExe,
            appBundlePath: '',
          };
        }
      } catch {
        // 忽略模拟探测异常
      }
    }
  }
  return { found: false, kind: '', executablePath: '', appBundlePath: '' };
}

function psSingleQuote(val) {
  return `'${String(val ?? '').replace(/'/g, "''")}'`;
}

/**
 * 构建 Windows 脱离宿主 Job Object 的隐藏重拉内层脚本（写入临时 UTF-8 BOM `.ps1` 文件后拉起）。
 *
 * 权限自适应策略：
 * 1. 若存在 All-Users 只读公共快捷方式（`$readOnlyShortcuts.Count -gt 0`）且当前未提权，先通过 `-Verb RunAs`
 *    请求用户 UAC 授权一次性修补公共 `.lnk`（用户若点取消仍继续执行当次重拉，不阻塞会话恢复）；
 * 2. 先尝试常规温和关闭（`CloseMainWindow` + `Stop-Process`）；
 * 3. 若等待后仍有旧宿主进程存活（例如旧宿主是以管理员身份运行的，普通权限无法关闭），再请求一次 `-Verb RunAs`
 *    关闭旧管理员宿主并以管理员身份带参重开；
 * 4. 若当前脚本自身因提权运行但原宿主并非管理员（`$wasHostElevated -eq $false`），通过 `Shell.Application`
 *    委托桌面 `explorer.exe` 以普通权限启动新客户端，确保资源管理器文件拖拽进窗口不被 UIPI 阻断。
 *
 * @param {string} executablePath
 * @param {string[]} stalePortFiles
 * @param {'desktop'|'ide'|''} kind
 * @param {{ readOnlyShortcutPaths?: string[], psExePath?: string }} [extra]
 * @returns {string}
 */
export function buildWindowsRelaunchInnerScript(
  executablePath,
  stalePortFiles = [],
  kind = 'desktop',
  extra = {}
) {
  const procName = kind === 'ide' ? 'Antigravity IDE' : 'Antigravity';
  const psExe = String(extra?.psExePath || 'powershell.exe').trim() || 'powershell.exe';
  const portLiterals = (Array.isArray(stalePortFiles) ? stalePortFiles : [])
    .map((p) => String(p || '').trim())
    .filter(Boolean)
    .map(psSingleQuote)
    .join(', ');
  const roLiterals = (Array.isArray(extra?.readOnlyShortcutPaths) ? extra.readOnlyShortcutPaths : [])
    .map((p) => String(p || '').trim())
    .filter(Boolean)
    .map(psSingleQuote)
    .join(', ');

  return `
Start-Sleep -Milliseconds 480
$exe = ${psSingleQuote(executablePath)}
$procName = ${psSingleQuote(procName)}
$psExe = ${psSingleQuote(psExe)}
$staleList = @(${portLiterals})
$readOnlyShortcuts = @(${roLiterals})
$wasHostElevated = $env:AGY_HOST_WAS_ELEVATED -eq '1'
$isSelfElevated = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$mySid = (Get-Process -Id $PID).SessionId

if (-not $exe -or -not (Test-Path -LiteralPath $exe)) {
  $livePath = Get-Process -Name $procName -ErrorAction SilentlyContinue | Where-Object { $_.SessionId -eq $mySid -and $_.Path } | Select-Object -First 1 -ExpandProperty Path
  if ($livePath) { $exe = [string]$livePath }
}

function Patch-ShortcutList($paths) {
  if (-not $paths -or $paths.Count -eq 0) { return }
  try {
    $ws = New-Object -ComObject WScript.Shell
    foreach ($lnk in $paths) {
      if (-not $lnk -or -not (Test-Path -LiteralPath $lnk)) { continue }
      try {
        $sc = $ws.CreateShortcut($lnk)
        $cur = [string]$sc.Arguments
        if ($cur -notmatch '(?:^|\\s)--remote-debugging-port(?:=|\\s|$)') {
          $sc.Arguments = ($cur.Trim() + ' --remote-debugging-port=0').Trim()
          $sc.Save()
        }
      } catch {}
    }
  } catch {}
}

if ($readOnlyShortcuts.Count -gt 0) {
  if ($isSelfElevated) {
    Patch-ShortcutList $readOnlyShortcuts
  } else {
    $elevPatchPs1 = Join-Path ([System.IO.Path]::GetTempPath()) ("agy-monitor-uac-lnk-" + $PID + ".ps1")
    $roJoined = ($readOnlyShortcuts | ForEach-Object { "'" + ($_.Replace("'", "''")) + "'" }) -join ', '
    $elevBody = @(
      "\$ws = New-Object -ComObject WScript.Shell",
      "foreach (\$lnk in @($roJoined)) {",
      "  if (\$lnk -and (Test-Path -LiteralPath \$lnk)) {",
      "    try {",
      "      \$sc = \$ws.CreateShortcut(\$lnk)",
      "      \$cur = [string]\$sc.Arguments",
      "      if (\$cur -notmatch '(?:^|\\s)--remote-debugging-port(?:=|\\s|$)') {",
      "        \$sc.Arguments = (\$cur.Trim() + ' --remote-debugging-port=0').Trim()",
      "        \$sc.Save()",
      "      }",
      "    } catch {}",
      "  }",
      "}",
      "Remove-Item -LiteralPath \$PSCommandPath -Force -ErrorAction SilentlyContinue"
    ) -join "\`r\`n"
    try {
      [System.IO.File]::WriteAllText($elevPatchPs1, $elevBody, (New-Object System.Text.UTF8Encoding($true)))
      Start-Process -FilePath $psExe -Verb RunAs -WindowStyle Hidden -Wait -ArgumentList @('-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', $elevPatchPs1) -ErrorAction Stop
    } catch {
      if (Test-Path -LiteralPath $elevPatchPs1) { Remove-Item -LiteralPath $elevPatchPs1 -Force -ErrorAction SilentlyContinue }
    }
  }
}

$findTargets = {
  @(Get-Process -Name $procName -ErrorAction SilentlyContinue | Where-Object {
    $_.SessionId -eq $mySid -and (-not $_.Path -or -not $exe -or [string]::Equals($_.Path, $exe, [System.StringComparison]::OrdinalIgnoreCase))
  })
}

$initial = & $findTargets
foreach ($p in $initial) {
  try {
    if ($p.MainWindowHandle -ne 0) { [void]$p.CloseMainWindow() }
  } catch {}
}
Start-Sleep -Milliseconds 850

$remaining = & $findTargets
foreach ($p in $remaining) {
  try { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } catch {}
}

for ($i = 0; $i -lt 25; $i++) {
  if ((& $findTargets).Count -eq 0) { break }
  Start-Sleep -Milliseconds 200
}

if ((& $findTargets).Count -gt 0 -and -not $isSelfElevated -and $exe -and (Test-Path -LiteralPath $exe)) {
  $elevRelaunchPs1 = Join-Path ([System.IO.Path]::GetTempPath()) ("agy-monitor-uac-relaunch-" + $PID + ".ps1")
  $staleJoined = ($staleList | ForEach-Object { "'" + ($_.Replace("'", "''")) + "'" }) -join ', '
  $exeLit = "'" + $exe.Replace("'", "''") + "'"
  $procLit = "'" + $procName.Replace("'", "''") + "'"
  $elevKillBody = @(
    "\$mySid = (Get-Process -Id \$PID).SessionId",
    "Get-Process -Name $procLit -ErrorAction SilentlyContinue | Where-Object { \$_.SessionId -eq \$mySid } | Stop-Process -Force -ErrorAction SilentlyContinue",
    "Start-Sleep -Milliseconds 600",
    "foreach (\$fp in @($staleJoined)) { if (\$fp -and (Test-Path -LiteralPath \$fp)) { Remove-Item -LiteralPath \$fp -Force -ErrorAction SilentlyContinue } }",
    "\$wd = Split-Path -Parent $exeLit",
    "Start-Process -FilePath $exeLit -ArgumentList '--remote-debugging-port=0' -WorkingDirectory \$wd",
    "Remove-Item -LiteralPath \$PSCommandPath -Force -ErrorAction SilentlyContinue"
  ) -join "\`r\`n"
  try {
    [System.IO.File]::WriteAllText($elevRelaunchPs1, $elevKillBody, (New-Object System.Text.UTF8Encoding($true)))
    Start-Process -FilePath $psExe -Verb RunAs -WindowStyle Hidden -ArgumentList @('-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', $elevRelaunchPs1) -ErrorAction Stop
    if ($PSCommandPath -and (Test-Path -LiteralPath $PSCommandPath)) {
      Remove-Item -LiteralPath $PSCommandPath -Force -ErrorAction SilentlyContinue
    }
    exit 0
  } catch {
    if (Test-Path -LiteralPath $elevRelaunchPs1) { Remove-Item -LiteralPath $elevRelaunchPs1 -Force -ErrorAction SilentlyContinue }
  }
}

foreach ($fp in $staleList) {
  if ($fp -and (Test-Path -LiteralPath $fp)) {
    try { Remove-Item -LiteralPath $fp -Force -ErrorAction SilentlyContinue } catch {}
  }
}

if ($exe -and (Test-Path -LiteralPath $exe)) {
  $workDir = Split-Path -Parent $exe
  if ($isSelfElevated -and -not $wasHostElevated) {
    try {
      $shellApp = New-Object -ComObject Shell.Application
      $shellApp.ShellExecute($exe, '--remote-debugging-port=0', $workDir, 'open', 1)
    } catch {
      Start-Process -FilePath $exe -ArgumentList '--remote-debugging-port=0' -WorkingDirectory $workDir
    }
  } else {
    Start-Process -FilePath $exe -ArgumentList '--remote-debugging-port=0' -WorkingDirectory $workDir
  }
}

if ($PSCommandPath -and (Test-Path -LiteralPath $PSCommandPath)) {
  Remove-Item -LiteralPath $PSCommandPath -Force -ErrorAction SilentlyContinue
}
`.trim();
}

const WIN_OUT_OF_JOB_DISPATCH_PS = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Stop'
$psBin = if ($env:AGY_PS_EXE) { $env:AGY_PS_EXE } else { 'powershell.exe' }
$isElev = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$env:AGY_HOST_WAS_ELEVATED = if ($isElev) { '1' } else { '0' }
$innerArgs = '-NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $env:AGY_RELAUNCH_PS1 + '"'
$fullCmd = '"' + $psBin + '" ' + $innerArgs

if ($isElev) {
  try {
    $wmiRes = ([wmiclass]'Win32_Process').Create($fullCmd)
    if ($wmiRes -and $wmiRes.ReturnValue -eq 0) {
      Write-Output '{"ok":true,"method":"wmi_elevated"}'
      exit 0
    }
  } catch {}
  Start-Process -FilePath $psBin -ArgumentList $innerArgs -WindowStyle Hidden
  Write-Output '{"ok":true,"method":"start_process_elevated"}'
  exit 0
}

try {
  $shellApp = New-Object -ComObject Shell.Application
  $shellApp.ShellExecute($psBin, $innerArgs, '', 'open', 0)
  Write-Output '{"ok":true,"method":"shell_application"}'
  exit 0
} catch {}

try {
  $wmiRes = ([wmiclass]'Win32_Process').Create($fullCmd)
  if ($wmiRes -and $wmiRes.ReturnValue -eq 0) {
    Write-Output '{"ok":true,"method":"wmi_fallback"}'
    exit 0
  }
} catch {}

Start-Process -FilePath $psBin -ArgumentList $innerArgs -WindowStyle Hidden
Write-Output '{"ok":true,"method":"start_process"}'
`.trim();

/**
 * 触发跨平台一键退出系统托盘后台并追加 `--remote-debugging-port=0` 重新拉起宿主客户端。
 *
 * @param {{
 *   env?: Record<string, string|undefined>,
 *   platform?: string,
 *   homeDir?: string,
 *   stalePortFiles?: string[],
 *   readOnlyShortcutPaths?: string[],
 *   execFileFn?: ((file: string, args: string[], opts?: object) => Promise<string>)|null,
 *   spawnFn?: ((file: string, args: string[], opts?: object) => Promise<{ pid: number }>)|null,
 *   existsFn?: typeof existsSync,
 *   writeFileFn?: typeof writeFileSync,
 *   mkdirFn?: typeof mkdirSync,
 *   allowInTest?: boolean,
 * }} [options]
 */
export async function triggerDesktopHostRelaunch({
  env = process.env,
  platform = process.platform,
  homeDir = homedir(),
  stalePortFiles = [],
  readOnlyShortcutPaths = [],
  execFileFn = null,
  spawnFn = null,
  existsFn = existsSync,
  writeFileFn = writeFileSync,
  mkdirFn = mkdirSync,
  allowInTest = false,
} = {}) {
  if (lsRuntimeEndpoint.addr === 'test.invalid' && !allowInTest) {
    return { ok: false, status: 403, error: 'Disabled in test sandbox' };
  }

  let hostInfo = resolveDesktopHostExecutable({ env, platform, homeDir, existsFn });
  if (!hostInfo.found) {
    hostInfo = await discoverRunningHostExecutable({ platform, env, execFileFn });
  }
  if (!hostInfo.found) {
    return {
      ok: false,
      status: 404,
      error: 'Unable to locate Antigravity executable on this machine',
    };
  }

  const cleanEnv = buildSanitizedDesktopRelaunchEnv(env);
  const cleanStaleFiles = (Array.isArray(stalePortFiles) ? stalePortFiles : [])
    .map((p) => String(p || '').trim())
    .filter(Boolean);
  const cleanReadOnlyPaths = (Array.isArray(readOnlyShortcutPaths) ? readOnlyShortcutPaths : [])
    .map((p) => String(p || '').trim())
    .filter(Boolean);

  if (platform === 'win32') {
    const psExe = execFileFn ? 'powershell.exe' : resolveWindowsPowerShellExecutable(env, existsFn);
    const innerScript = buildWindowsRelaunchInnerScript(
      hostInfo.executablePath,
      cleanStaleFiles,
      hostInfo.kind,
      {
        readOnlyShortcutPaths: cleanReadOnlyPaths,
        psExePath: psExe,
      }
    );
    const tempDir = String(env?.TEMP || env?.TMP || DATA_DIR || homeDir).trim();
    mkdirFn(tempDir, { recursive: true });
    const relaunchPs1Path = join(tempDir, `agy-monitor-relaunch-${process.pid}.ps1`);
    // UTF-8 with BOM ensures Windows PowerShell 5.1 parses non-ASCII paths accurately across all system locales
    writeFileFn(relaunchPs1Path, `\uFEFF${innerScript}\r\n`, 'utf8');

    const runner = execFileFn || runLauncherExecFile;
    await runner(
      psExe,
      [
        '-Sta',
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        WIN_OUT_OF_JOB_DISPATCH_PS,
      ],
      {
        timeoutMs: 6000,
        env: {
          ...cleanEnv,
          AGY_PS_EXE: psExe,
          AGY_RELAUNCH_PS1: relaunchPs1Path,
        },
      }
    );
    return {
      ok: true,
      relaunching: true,
      platform,
      executablePath: hostInfo.executablePath,
    };
  }

  const spawner = spawnFn || spawnDetachedProcess;

  if (platform === 'darwin') {
    const appTarget = hostInfo.appBundlePath || hostInfo.executablePath;
    const appName = hostInfo.kind === 'ide' ? 'Antigravity IDE' : 'Antigravity';
    const shScript = [
      'sleep 0.45',
      `osascript -e 'tell application "${appName}" to quit' >/dev/null 2>&1 || true`,
      `i=0; while [ $i -lt 25 ] && pgrep -x "${appName}" >/dev/null 2>&1; do sleep 0.2; i=$((i+1)); done`,
      `if pgrep -x "${appName}" >/dev/null 2>&1; then killall "${appName}" >/dev/null 2>&1 || true; sleep 0.4; fi`,
      'IFS=":"; for f in $AGY_STALE_PORT_FILES; do [ -n "$f" ] && rm -f "$f"; done',
      'open -a "$AGY_RELAUNCH_APP" --args --remote-debugging-port=0 >/dev/null 2>&1',
    ].join('; ');
    await spawner('/bin/sh', ['-c', shScript], {
      env: {
        ...cleanEnv,
        AGY_RELAUNCH_APP: appTarget,
        AGY_STALE_PORT_FILES: cleanStaleFiles.join(':'),
      },
    });
    return {
      ok: true,
      relaunching: true,
      platform,
      executablePath: appTarget,
    };
  }

  const procLeaf = basename(hostInfo.executablePath) || 'antigravity';
  const linuxScript = [
    'sleep 0.45',
    'uid="$(id -u)"',
    'for pn in "$AGY_PROC_NAME" antigravity Antigravity; do [ -n "$pn" ] && pkill -u "$uid" -x "$pn" >/dev/null 2>&1 || true; done',
    'i=0; while [ $i -lt 25 ] && (pgrep -u "$uid" -x "$AGY_PROC_NAME" >/dev/null 2>&1 || pgrep -u "$uid" -x antigravity >/dev/null 2>&1 || pgrep -u "$uid" -x Antigravity >/dev/null 2>&1); do sleep 0.2; i=$((i+1)); done',
    'IFS=":"; for f in $AGY_STALE_PORT_FILES; do [ -n "$f" ] && rm -f "$f"; done',
    'nohup "$AGY_RELAUNCH_EXE" --remote-debugging-port=0 >/dev/null 2>&1 &',
  ].join('; ');
  await spawner('/bin/sh', ['-c', linuxScript], {
    env: {
      ...cleanEnv,
      AGY_RELAUNCH_EXE: hostInfo.executablePath,
      AGY_PROC_NAME: procLeaf,
      AGY_STALE_PORT_FILES: cleanStaleFiles.join(':'),
    },
  });
  return {
    ok: true,
    relaunching: true,
    platform,
    executablePath: hostInfo.executablePath,
  };
}
