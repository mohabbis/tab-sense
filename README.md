# Tab-Sense

Chrome extension that automatically groups the tabs open in this window by project or topic.

## Install in Chrome

Chrome must load the **`extension`** folder (the one that contains both `manifest.json` and `background.js`). Do not pick the repo root.

### 1. Update and build

```bash
cd ~/clipstack/tab-sense
git pull
npm install
npm run build:extension
ls extension/manifest.json extension/background.js
```

You should see both files. If `background.js` is missing, the build did not run.

### 2. Load it unpacked

1. Open **chrome://extensions**
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select **`tab-sense/extension`** — not the repo root, not `extension/src`

If Chrome says it could not load the background script or the manifest, you picked the wrong folder.

### 3. Pin the icon

Click the puzzle-piece **Extensions** menu → pin **Tab-Sense**. The popup will not stay in the toolbar until you pin it.

### 4. Use it

Auto-group is on. Open a few related tabs (two pages from the same GitHub repo, plus Linear or a preview) and Chrome tab groups should appear.

- Toolbar popup: Auto on/off, mode, **Group this window**, **Ungroup**
- Shortcut: `Alt+Shift+G`

Pinned tabs, `chrome://` pages, and the new-tab page are left alone. A group is created only when at least two tabs match.

## If it still fails

| Chrome error | Cause |
| --- | --- |
| Manifest file is missing or unreadable | You picked the repo root |
| Could not load background script | You picked `extension` before building, or `extension/src` |
| Service worker failed to start | Run `npm run build:extension`, then click **Reload** on the extension card |
| Nothing groups | Need 2+ http(s) tabs that share a project or topic; pin the icon and click **Group this window** |

## Engine playground (optional)

This Next.js page cannot see Chrome’s real tabs. It only demos the grouping engine.

```bash
npm install
npm run dev
```

Open [http://localhost:43187](http://localhost:43187).

## Repository

https://github.com/mohabbis/tab-sense
