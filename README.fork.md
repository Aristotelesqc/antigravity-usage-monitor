# Antigravity Usage & Speed Monitor — FR/EN Fork & Update Guide

[English (Main README)](README.md) | English (Fork Guide) | [Français](README.fr.md) | [简体中文](README.zh-CN.md)

This fork maintains a full bilingual **French (default) / English** localization of [yuhuan-dev/antigravity-usage-monitor](https://github.com/yuhuan-dev/antigravity-usage-monitor), with a live language switcher under **`Preferences -> General -> Langue / Language`** (`Français` / `English`).

---

## 1. Repository & Branch Layout

| Item | Role | Target |
| :--- | :--- | :--- |
| `origin` remote | Personal fork (backup, history, and localized branch) | `https://github.com/Aristotelesqc/antigravity-usage-monitor.git` |
| `upstream` remote | Official upstream repository | `https://github.com/yuhuan-dev/antigravity-usage-monitor.git` |
| `main` branch | Clean mirror of `upstream/main` (no local changes) | Tracked with `origin/main` |
| `i18n/fr-en` branch | **Active branch** containing the FR/EN localization, language switcher, rebuilt bundle, and `sync:upstream` | Tracked with `origin/i18n/fr-en` |

### Why staying on `i18n/fr-en` protects your installation

- The built-in updater ([sidecars/panel/backend/plugin-updater.mjs](sidecars/panel/backend/plugin-updater.mjs)) detects `.git` and refuses to overwrite any branch other than `main` or `release/*` (`reason: 'not_on_main_branch'`).
- At the same time, the default update policy is *Notify only, manual update* (`manual`), and [sidecars/panel/backend/config.mjs](sidecars/panel/backend/config.mjs) continues checking the pricing catalog and official releases from `yuhuan-dev/antigravity-usage-monitor` — so you still receive new-release notifications without risking an accidental overwrite.

---

## 2. Update & Development Commands

All `npm` commands below target `sidecars/panel`.

### Preview an upstream update without modifying anything

```powershell
npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run sync:upstream -- --dry-run
```

On macOS / Linux:

```bash
npm --prefix ~/.gemini/config/plugins/usage-monitor/sidecars/panel run sync:upstream -- --dry-run
```

Displays the active branch, `main` vs `upstream/main` SHAs, pending upstream commits, and runs the CJK audit across source files.

### Sync with `upstream/main`, rebuild, test, and push to the fork

```powershell
npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run sync:upstream -- --push
```

Supported CLI flags for [sidecars/panel/scripts/sync-upstream.mjs](sidecars/panel/scripts/sync-upstream.mjs):

- `--dry-run`: fetches `upstream/main`, lists pending upstream commits, and runs only the CJK audit.
- `--push`: pushes `main` and pushes `i18n/fr-en` with `--force-with-lease` to `origin`.
- `--skip-tests`: skips `node --test test/*.test.mjs` after rebuilding (useful for quick docs-only pushes or when tests just passed).
- `--help` / `-h`: prints CLI usage.

What `sync:upstream` automates:

1. Verifies a clean working tree (`git status --porcelain`) on a non-`main` branch.
2. Runs `git fetch upstream main --tags`.
3. Rebases `i18n/fr-en` onto `upstream/main` while automatically resolving expected conflicts in compiled bundle files ([sidecars/panel/app.js](sidecars/panel/app.js) and [sidecars/panel/styles.css](sidecars/panel/styles.css)), skipping empty commits (`git rebase --skip`) if needed. If a genuine conflict occurs in a source file (`src/`, `backend/`, `plugin.json`, etc.), it cleanly runs `git rebase --abort` without breaking the plugin and lists the conflicting files.
4. Rebuilds the Webview bundle via [sidecars/panel/scripts/build-bundle.mjs](sidecars/panel/scripts/build-bundle.mjs) and updates the commit on `i18n/fr-en`.
5. Fast-forwards local `main` to `upstream/main`.
6. Runs the CJK audit to warn if upstream introduced any new untranslated Chinese strings.
7. Runs the full test suite (`node --test test/*.test.mjs`), then pushes to `origin` if `--push` is set.

### Everyday development commands (build & tests)

```powershell
# Rebuild app.js and styles.css after any change under sidecars/panel/src/
npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run build

# Run the full unit and integration test suite
npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" test
```

### Reloading the plugin after an update

After a rebase or `npm run build`, close and reopen the **Usage Monitor** panel (or run **Developer: Reload Window** / restart Antigravity) so the Node sidecar (`main.mjs`), Webview, and CDP overlay load the newly built [app.js](sidecars/panel/app.js) and [styles.css](sidecars/panel/styles.css).

> **Note on local data:** user settings (`settings.json`), usage history (`trajectory_usage_cache.json`), and pricing cache (`remote_pricing_cache.json`) are stored outside Git tracking (`~/.gemini/antigravity/sidecar_data/usage-monitor` or `sidecars/panel/.data/`) and are preserved across updates.

---

## 3. Quick Reinstall on Another Machine

```powershell
git clone -b i18n/fr-en https://github.com/Aristotelesqc/antigravity-usage-monitor.git "$env:USERPROFILE\.gemini\config\plugins\usage-monitor"
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" remote add upstream https://github.com/yuhuan-dev/antigravity-usage-monitor.git
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" fetch upstream main --tags
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" branch -f main upstream/main
```

Then enable `usage-monitor` under **Customizations -> Installed**.

---

## 4. Troubleshooting Future Upstream Updates

### Case A: `sync:upstream` reports new CJK strings after an update

If an upstream release adds a new screen or Chinese label:

1. Add matching `fr` and `en` keys under `MESSAGES.fr` and `MESSAGES.en` in [sidecars/panel/src/core/i18n.js](sidecars/panel/src/core/i18n.js).
2. Replace raw strings in the component or backend with `t('...')` (frontend) or a helper checking `loadSettings().language` (backend).
3. Rebuild, verify, and commit:
   ```powershell
   npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run build
   npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" test
   git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" add -A
   git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" commit -m "chore(i18n): translate new upstream strings"
   npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run sync:upstream -- --push
   ```

### Case B: Real Git conflict on a source file (`src/` or `backend/`)

If `sync:upstream` stops with `Source merge conflicts detected`, your repository was cleanly restored via `git rebase --abort`. To merge manually:

```powershell
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" fetch upstream main --tags
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" rebase upstream/main
```

During the rebase:
- If `sidecars/panel/app.js` or `sidecars/panel/styles.css` conflicts, **never merge them by hand** — temporarily keep the upstream version (`--ours` during a rebase) before continuing:
  ```powershell
  git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" checkout --ours -- sidecars/panel/app.js sidecars/panel/styles.css
  git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" add -- sidecars/panel/app.js sidecars/panel/styles.css
  ```
- Resolve only conflicts in source files (`src/`, `backend/`, manifests, or tests), then run `git add <files>` and `git rebase --continue` (or `git rebase --skip` if the remaining commit is empty after resetting the bundle).
- Finally rebuild the bundle, run tests, and amend/commit the result:
  ```powershell
  npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run build
  npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" test
  ```

---

## 5. i18n Architecture & Technical Guardrails

### Live language flow

- Active language is persisted in `settings.language` (`'fr'` by default; accepts `'fr'` or `'en'`) via [sidecars/panel/backend/config.mjs](sidecars/panel/backend/config.mjs).
- On telemetry updates or **Preferences** changes, [sidecars/panel/src/store/telemetryStore.js](sidecars/panel/src/store/telemetryStore.js) and [sidecars/panel/src/store/uiStore.js](sidecars/panel/src/store/uiStore.js) sync `setLang()` in [sidecars/panel/src/core/i18n.js](sidecars/panel/src/core/i18n.js), immediately re-rendering all 4 panel tabs and the top-bar overlay ([WindowOverlayShell.js](sidecars/panel/src/components/layout/WindowOverlayShell.js)).

### Mandatory bundle build (`app.js` / `styles.css`)

- The Sidecar Webview and CDP injection into Antigravity's main window do **not** load modular ES files under `sidecars/panel/src/` directly: they load the compiled [sidecars/panel/app.js](sidecars/panel/app.js) and [sidecars/panel/styles.css](sidecars/panel/styles.css) produced by `npm run build`.
- Any edit under `src/` stays invisible in the UI until `npm run build` is executed.

### Intentionally preserved Chinese strings (do not remove)

1. **Host IDE button match (`'打开 IDE'`)** in [sidecars/panel/src/components/layout/WindowOverlayShell.js](sidecars/panel/src/components/layout/WindowOverlayShell.js): required so the topbar capsule can dock on both English and Chinese Antigravity IDE hosts.
2. **Backward-compatibility tables & regexes** in [sidecars/panel/src/core/i18n.js](sidecars/panel/src/core/i18n.js) (from `translateRangeLabel` onward, including `TOOL_CANONICAL_LABEL_MAP`, `translateQuotaPoolLabel`, `translateAgentBadge`, `translateAgentShortLabel`, `translateAgentRole`, `translateActivity`, and `localizeModelText`), as well as in `formatters.js`, `telemetryStore.js`, `LiveOverviewView.js`, and `StepsDetailView.js`: they translate legacy cached entries or events containing Chinese strings on the fly into FR/EN.
3. **Internal code comments** in [sidecars/panel/backend/config.mjs](sidecars/panel/backend/config.mjs) (ignored at runtime and by the CJK audit).
