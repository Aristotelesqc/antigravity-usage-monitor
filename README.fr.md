# Antigravity Usage & Speed Monitor — Guide FR/EN & Mises à jour

[English](README.md) | Français | [简体中文](README.zh-CN.md)

Ce fork maintient une localisation bilingue complète **français (par défaut) / anglais** du plugin [yuhuan-dev/antigravity-usage-monitor](https://github.com/yuhuan-dev/antigravity-usage-monitor), avec un changement de langue à chaud dans **`Réglages -> Paramètres généraux -> Langue / Language`** (`Français` / `English`).

---

## 1. Organisation du dépôt et des branches

| Élément | Rôle | Cible |
| :--- | :--- | :--- |
| Remote `origin` | Fork personnel (sauvegarde, historique et branche traduite) | `https://github.com/Aristotelesqc/antigravity-usage-monitor.git` |
| Remote `upstream` | Dépôt officiel amont | `https://github.com/yuhuan-dev/antigravity-usage-monitor.git` |
| Branche `main` | Miroir propre de `upstream/main` (aucune modification locale) | Suivie avec `origin/main` |
| Branche `i18n/fr-en` | **Branche active** contenant la traduction FR/EN, le sélecteur de langue, le bundle compilé et `sync:upstream` | Suivie avec `origin/i18n/fr-en` |

### Pourquoi rester sur `i18n/fr-en` protège l'installation

- L'updater intégré ([sidecars/panel/backend/plugin-updater.mjs](sidecars/panel/backend/plugin-updater.mjs)) détecte la présence de `.git` et refuse automatiquement d'écraser une branche autre que `main` ou `release/*` (`reason: 'not_on_main_branch'`).
- En parallèle, la politique de mise à jour par défaut est `Notifier seulement, MàJ manuelle` (`manual`), et [sidecars/panel/backend/config.mjs](sidecars/panel/backend/config.mjs) continue de vérifier le catalogue de prix et les releases officielles sur `yuhuan-dev/antigravity-usage-monitor` : tu reçois donc toujours les notifications de nouvelle version sans risque d'écrasement silencieux.

---

## 2. Commandes de mise à jour et de développement

Toutes les commandes `npm` ci-dessous ciblent le répertoire `sidecars/panel`.

### Prévisualiser une mise à jour amont sans rien modifier

```powershell
npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run sync:upstream -- --dry-run
```

Sur macOS / Linux :

```bash
npm --prefix ~/.gemini/config/plugins/usage-monitor/sidecars/panel run sync:upstream -- --dry-run
```

Affiche la branche active, le SHA de `main` vs `upstream/main`, la liste des commits en attente côté amont et exécute l'audit CJK sur les sources.

### Synchroniser avec `upstream/main`, recompiler, tester et pousser sur le fork

```powershell
npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run sync:upstream -- --push
```

Options disponibles sur [sidecars/panel/scripts/sync-upstream.mjs](sidecars/panel/scripts/sync-upstream.mjs) :

- `--dry-run` : récupère `upstream/main`, liste les commits amont en attente et lance uniquement l'audit CJK.
- `--push` : pousse `main` et pousse `i18n/fr-en` avec `--force-with-lease` vers `origin`.
- `--skip-tests` : saute `node --test test/*.test.mjs` après la recompilation (utile pour un push rapide de documentation ou si les tests viennent déjà de tourner).
- `--help` / `-h` : affiche l'aide de la CLI.

Ce que fait `sync:upstream` automatiquement :

1. Vérifie que le dépôt est propre (`git status --porcelain`) et sur une branche autre que `main`.
2. Exécute `git fetch upstream main --tags`.
3. Rebase `i18n/fr-en` sur `upstream/main` en résolvant automatiquement les conflits attendus sur les fichiers compilés ([sidecars/panel/app.js](sidecars/panel/app.js) et [sidecars/panel/styles.css](sidecars/panel/styles.css)), puis passe un commit devenu vide si besoin (`git rebase --skip`). Si un vrai conflit touche un fichier source (`src/`, `backend/`, `plugin.json`, etc.), le script annule proprement le rebase (`git rebase --abort`) sans casser le plugin et affiche les fichiers concernés.
4. Recompile le bundle Webview via [sidecars/panel/scripts/build-bundle.mjs](sidecars/panel/scripts/build-bundle.mjs) et met à jour le commit sur `i18n/fr-en`.
5. Met à jour la branche locale `main` sur `upstream/main`.
6. Lance l'audit CJK pour signaler d'éventuelles nouvelles chaînes chinoises ajoutées par la mise à jour amont.
7. Exécute toute la suite de tests (`node --test test/*.test.mjs`), puis pousse vers `origin` si `--push` est passé.

### Commandes de développement courant (build & tests)

```powershell
# Recompiler app.js et styles.css après toute modification dans sidecars/panel/src/
npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run build

# Lancer toute la suite de tests unitaires et d'intégration
npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" test
```

### Recharger le plugin après une mise à jour

Après un rebase ou un `npm run build`, ferme puis rouvre le panneau **Usage Monitor** (ou exécute **Developer: Reload Window** / redémarre Antigravity) afin que le Sidecar Node (`main.mjs`), le Webview et la superposition CDP chargent les nouveaux [app.js](sidecars/panel/app.js) et [styles.css](sidecars/panel/styles.css).

> **Note sur les données locales :** les réglages (`settings.json`), l'historique d'utilisation (`trajectory_usage_cache.json`) et le cache de prix (`remote_pricing_cache.json`) sont stockés en dehors du suivi Git (`~/.gemini/antigravity/sidecar_data/usage-monitor` ou `sidecars/panel/.data/`) et sont conservés lors des mises à jour.

---

## 3. Réinstaller rapidement sur une autre machine

```powershell
git clone -b i18n/fr-en https://github.com/Aristotelesqc/antigravity-usage-monitor.git "$env:USERPROFILE\.gemini\config\plugins\usage-monitor"
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" remote add upstream https://github.com/yuhuan-dev/antigravity-usage-monitor.git
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" fetch upstream main --tags
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" branch -f main upstream/main
```

Il suffit ensuite d'activer `usage-monitor` dans **Customizations -> Installed**.

---

## 4. Dépannage lors d'une mise à jour amont

### Cas A : `sync:upstream` signale de nouvelles chaînes CJK après mise à jour

Si la version amont ajoute un nouvel écran ou libellé en chinois :

1. Ajoute les clés FR et EN correspondantes dans `MESSAGES.fr` et `MESSAGES.en` dans [sidecars/panel/src/core/i18n.js](sidecars/panel/src/core/i18n.js).
2. Remplace le texte brut dans le composant ou le backend par `t('...')` (côté frontend) ou par un helper sensible à `loadSettings().language` (côté backend).
3. Recompile, vérifie et commite :
   ```powershell
   npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run build
   npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" test
   git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" add -A
   git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" commit -m "chore(i18n): translate new upstream strings"
   npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run sync:upstream -- --push
   ```

### Cas B : conflit Git réel sur un fichier source (`src/` ou `backend/`)

Si `sync:upstream` interrompt l'opération avec `Source merge conflicts detected`, le dépôt a été remis dans son état propre précédent (`git rebase --abort`). Pour fusionner manuellement :

```powershell
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" fetch upstream main --tags
git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" rebase upstream/main
```

Pendant le rebase :
- Si `sidecars/panel/app.js` ou `sidecars/panel/styles.css` est en conflit, **ne les fusionne jamais à la main** — garde temporairement la version amont (`--ours` pendant un rebase) avant de continuer :
  ```powershell
  git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" checkout --ours -- sidecars/panel/app.js sidecars/panel/styles.css
  git -C "$env:USERPROFILE\.gemini\config\plugins\usage-monitor" add -- sidecars/panel/app.js sidecars/panel/styles.css
  ```
- Résous uniquement les conflits dans les fichiers sources (`src/`, `backend/`, manifestes ou tests), puis `git add <fichiers>` et `git rebase --continue` (ou `git rebase --skip` si le commit restant est vide après réinitialisation du bundle).
- Recompile ensuite le bundle, valide les tests et amende/commite le résultat :
  ```powershell
  npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" run build
  npm --prefix "$env:USERPROFILE\.gemini\config\plugins\usage-monitor\sidecars\panel" test
  ```

---

## 5. Architecture i18n et garde-fous techniques

### Flux de langue à chaud

- La langue active est persistée dans `settings.language` (`'fr'` par défaut, acceptant `'fr'` ou `'en'`) via [sidecars/panel/backend/config.mjs](sidecars/panel/backend/config.mjs).
- À chaque mise à jour de télémétrie ou changement dans **Réglages**, [sidecars/panel/src/store/telemetryStore.js](sidecars/panel/src/store/telemetryStore.js) et [sidecars/panel/src/store/uiStore.js](sidecars/panel/src/store/uiStore.js) synchronisent `setLang()` dans [sidecars/panel/src/core/i18n.js](sidecars/panel/src/core/i18n.js), ce qui met à jour immédiatement les 4 onglets et l'overlay topbar ([WindowOverlayShell.js](sidecars/panel/src/components/layout/WindowOverlayShell.js)).

### Rôle obligatoire du build (`app.js` / `styles.css`)

- Le Sidecar Webview et l'injection CDP dans la fenêtre principale d'Antigravity ne chargent **pas** les fichiers ES modulaires sous `sidecars/panel/src/` directement : ils chargent les scripts compilés [sidecars/panel/app.js](sidecars/panel/app.js) et [sidecars/panel/styles.css](sidecars/panel/styles.css) produits par `npm run build`.
- Toute modification dans `src/` reste donc invisible dans l'interface tant que `npm run build` n'a pas été exécuté.

### Chaînes chinoises conservées volontairement (ne pas supprimer)

1. **Détection du bouton hôte IDE (`'打开 IDE'`)** dans [sidecars/panel/src/components/layout/WindowOverlayShell.js](sidecars/panel/src/components/layout/WindowOverlayShell.js) : nécessaire pour que la capsule topbar puisse s'ancrer aussi bien sur une interface Antigravity en chinois qu'en anglais.
2. **Tables et expressions régulières de rétrocompatibilité** dans [sidecars/panel/src/core/i18n.js](sidecars/panel/src/core/i18n.js) (à partir de `translateRangeLabel`, dont `TOOL_CANONICAL_LABEL_MAP`, `translateQuotaPoolLabel`, `translateAgentBadge`, `translateAgentShortLabel`, `translateAgentRole`, `translateActivity` et `localizeModelText`), ainsi que dans `formatters.js`, `telemetryStore.js`, `LiveOverviewView.js` et `StepsDetailView.js` : elles traduisent à la volée d'anciens caches ou événements contenant encore des libellés chinois.
3. **Commentaires internes** dans [sidecars/panel/backend/config.mjs](sidecars/panel/backend/config.mjs) (ignorés à l'exécution et par l'audit CJK).
