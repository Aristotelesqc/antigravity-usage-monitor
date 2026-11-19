/**
 * @fileoverview Synchronizes the local FR/EN localization branch with upstream
 * `yuhuan-dev/antigravity-usage-monitor` without getting stuck on compiled
 * bundle conflicts (`app.js` / `styles.css`), audits FR/EN dictionary key parity,
 * rebuilds the bundle, runs tests, and optionally pushes to `origin`.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PANEL_DIR = dirname(SCRIPT_DIR);
const PLUGIN_ROOT = dirname(dirname(PANEL_DIR));

const BUNDLE_REL_PATHS = new Set([
  'sidecars/panel/app.js',
  'sidecars/panel/styles.css',
]);

function printUsage() {
  console.log(`Usage: npm run sync:upstream [-- <options>]

Options:
  --dry-run     Fetch upstream, inspect pending commits, and check i18n key parity only
  --push        Push updated main and active branch to origin (uses --force-with-lease on rebase branch)
  --skip-tests  Skip running the unit/integration test suite after rebuilding
  --help, -h    Show this help text
`);
}

function parseArgs(argv) {
  const opts = { dryRun: false, push: false, skipTests: false, help: false };
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--push') opts.push = true;
    else if (arg === '--skip-tests') opts.skipTests = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return opts;
}

function runGit(args, { allowFailure = false, inheritStdio = false } = {}) {
  const res = spawnSync('git', ['-C', PLUGIN_ROOT, ...args], {
    encoding: 'utf8',
    stdio: inheritStdio ? 'inherit' : 'pipe',
    windowsHide: true,
    env: {
      ...process.env,
      GIT_EDITOR: 'true',
      GIT_SEQUENCE_EDITOR: 'true',
      GIT_TERMINAL_PROMPT: '0',
    },
  });
  if (res.error) throw res.error;
  if (!allowFailure && res.status !== 0) {
    const detail = String(res.stderr || res.stdout || '').trim();
    throw new Error(`git ${args.join(' ')} failed (${res.status}): ${detail}`);
  }
  return {
    status: res.status ?? 1,
    stdout: String(res.stdout || ''),
    stderr: String(res.stderr || ''),
  };
}

function readUpstreamManifestVersion(ref = 'upstream/main') {
  try {
    const { stdout } = runGit(['show', `${ref}:plugin.json`]);
    const parsed = JSON.parse(stdout);
    return parsed?.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

async function runI18nParityAudit() {
  const enPath = join(PANEL_DIR, 'src', 'i18n', 'en-US.js');
  const frPath = join(PANEL_DIR, 'src', 'i18n', 'fr-FR.js');
  if (!existsSync(enPath) || !existsSync(frPath)) {
    return ['Missing src/i18n/en-US.js or src/i18n/fr-FR.js'];
  }
  const enMod = await import(`${pathToFileURL(enPath).href}?t=${Date.now()}`);
  const frMod = await import(`${pathToFileURL(frPath).href}?t=${Date.now()}`);
  const enDict = enMod.I18N_MESSAGES_EN_US || {};
  const frDict = frMod.I18N_MESSAGES_FR_FR || {};
  const missing = [];
  for (const key of Object.keys(enDict)) {
    if (!Object.prototype.hasOwnProperty.call(frDict, key)) {
      missing.push(key);
    }
  }
  return missing;
}

function isRebaseInProgress() {
  const gitDir = runGit(['rev-parse', '--git-dir']).stdout.trim();
  const resolvedGitDir = gitDir.startsWith('/') || /^[A-Za-z]:/.test(gitDir)
    ? gitDir
    : join(PLUGIN_ROOT, gitDir);
  return existsSync(join(resolvedGitDir, 'rebase-merge')) || existsSync(join(resolvedGitDir, 'rebase-apply'));
}

function rebaseOntoUpstream(targetRef) {
  let res = runGit(['rebase', targetRef], { allowFailure: true });
  while (isRebaseInProgress()) {
    const unmergedRaw = runGit(['diff', '--name-only', '--diff-filter=U']).stdout.trim();
    const unmerged = unmergedRaw ? unmergedRaw.split(/\r?\n/).filter(Boolean) : [];
    const sourceConflicts = unmerged.filter((f) => !BUNDLE_REL_PATHS.has(f));

    if (sourceConflicts.length > 0) {
      runGit(['rebase', '--abort'], { allowFailure: true });
      throw new Error(
        `Source merge conflicts detected during rebase onto ${targetRef}:\n  - ${sourceConflicts.join('\n  - ')}`
      );
    }

    if (unmerged.length > 0) {
      runGit(['checkout', '--ours', '--', ...unmerged]);
      runGit(['add', '--', ...unmerged]);
    }

    const stagedEmpty = runGit(['diff', '--cached', '--quiet'], { allowFailure: true }).status === 0;
    if (stagedEmpty) {
      res = runGit(['rebase', '--skip'], { allowFailure: true });
    } else {
      res = runGit(['rebase', '--continue'], { allowFailure: true });
    }
  }

  if (res.status !== 0) {
    const detail = String(res.stderr || res.stdout || '').trim();
    throw new Error(`Rebase did not finish cleanly: ${detail}`);
  }
}

function runBundleBuild() {
  console.log('[sync] Building panel bundle (app.js / styles.css)...');
  execFileSync(process.execPath, [join(PANEL_DIR, 'scripts', 'build-bundle.mjs')], {
    cwd: PANEL_DIR,
    stdio: 'inherit',
    windowsHide: true,
  });
}

function runTestSuite() {
  console.log('[sync] Running test suite...');
  const testDir = join(PANEL_DIR, 'test');
  const testFiles = readdirSync(testDir)
    .filter((f) => f.endsWith('.test.mjs'))
    .sort()
    .map((f) => join('test', f));
  execFileSync(process.execPath, ['--test', ...testFiles], {
    cwd: PANEL_DIR,
    stdio: 'inherit',
    windowsHide: true,
  });
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    printUsage();
    return;
  }

  if (!existsSync(join(PLUGIN_ROOT, '.git'))) {
    throw new Error(`Plugin root is not a Git repository: ${PLUGIN_ROOT}`);
  }

  const branch = runGit(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  if (!branch || branch === 'HEAD') {
    throw new Error('Detached HEAD is not supported; checkout i18n/fr-en first.');
  }

  const remotes = runGit(['remote']).stdout.split(/\r?\n/).filter(Boolean);
  if (!remotes.includes('upstream')) {
    throw new Error('Missing "upstream" git remote (expected yuhuan-dev/antigravity-usage-monitor).');
  }
  if (opts.push && !remotes.includes('origin')) {
    throw new Error('Missing "origin" git remote for --push.');
  }

  const dirty = runGit(['status', '--porcelain']).stdout.trim();
  if (dirty) {
    throw new Error(`Working tree is not clean. Commit or stash changes first:\n${dirty}`);
  }

  console.log('[sync] Fetching upstream/main and tags...');
  runGit(['fetch', 'upstream', 'main', '--tags']);

  const headSha = runGit(['rev-parse', '--short', 'HEAD']).stdout.trim();
  const hasMain = runGit(['rev-parse', '--verify', 'main'], { allowFailure: true }).status === 0;
  const baseRef = hasMain ? 'main' : runGit(['merge-base', 'HEAD', 'upstream/main']).stdout.trim();
  const baseSha = runGit(['rev-parse', '--short', baseRef]).stdout.trim();
  const upstreamSha = runGit(['rev-parse', '--short', 'upstream/main']).stdout.trim();
  const upstreamVer = readUpstreamManifestVersion('upstream/main');
  const pendingCount = Number(runGit(['rev-list', '--count', `${baseRef}..upstream/main`]).stdout.trim() || 0);
  const alreadyRebased = runGit(['merge-base', '--is-ancestor', 'upstream/main', 'HEAD'], { allowFailure: true }).status === 0;

  console.log(`[sync] Branch       : ${branch} (${headSha})`);
  console.log(`[sync] Local main   : ${baseSha}`);
  console.log(`[sync] Upstream/main: ${upstreamSha} (manifest v${upstreamVer})`);
  console.log(`[sync] Pending commits from upstream: ${pendingCount}`);

  if (pendingCount > 0) {
    const logLines = runGit(['log', '--oneline', `${baseRef}..upstream/main`]).stdout.trim();
    if (logLines) console.log(logLines);
  }

  if (opts.dryRun) {
    const missingKeys = await runI18nParityAudit();
    console.log(`[sync] Missing FR keys vs en-US: ${missingKeys.length}`);
    for (const key of missingKeys) console.log(`  - ${key}`);
    console.log('[sync] Dry run complete.');
    return;
  }

  if (branch === 'main') {
    throw new Error('Refusing to run localization sync on "main". Switch to "i18n/fr-en" first.');
  }

  if (!alreadyRebased) {
    console.log(`[sync] Rebasing ${branch} onto upstream/main (${upstreamSha})...`);
    rebaseOntoUpstream('upstream/main');
    runBundleBuild();

    const bundleDirty = runGit(['status', '--porcelain', '--', 'sidecars/panel/app.js', 'sidecars/panel/styles.css']).stdout.trim();
    if (bundleDirty) {
      runGit(['add', '--', 'sidecars/panel/app.js', 'sidecars/panel/styles.css']);
      const headSubject = runGit(['log', '-1', '--format=%s']).stdout.trim();
      if (headSubject.startsWith('chore(i18n): rebuild bundle')) {
        runGit(['commit', '--amend', '--no-edit']);
      } else {
        runGit(['commit', '-m', `chore(i18n): rebuild bundle for upstream v${upstreamVer} (${upstreamSha})`]);
      }
    }
  } else {
    console.log('[sync] Localization branch is already rebased onto upstream/main.');
  }

  runGit(['branch', '-f', 'main', 'upstream/main']);

  const missingKeys = await runI18nParityAudit();
  if (missingKeys.length > 0) {
    console.warn(`[sync] WARNING: ${missingKeys.length} key(s) missing in src/i18n/fr-FR.js — add French translations and re-run build:`);
    for (const key of missingKeys) console.warn(`  - ${key}`);
  } else {
    console.log('[sync] i18n parity clean: 0 missing French keys.');
  }

  if (!opts.skipTests) {
    runTestSuite();
  }

  if (opts.push) {
    console.log(`[sync] Pushing main and ${branch} to origin...`);
    runGit(['push', 'origin', 'main'], { inheritStdio: true });
    runGit(['push', '--force-with-lease', '-u', 'origin', branch], { inheritStdio: true });
  }

  console.log('[sync] Done.');
}

main().catch((err) => {
  console.error(`[sync] Error: ${err.message}`);
  process.exit(1);
});
