# Tab-Sense

Chrome extension that automatically groups the tabs open in this window by project or topic.

## Install in Chrome

Do **not** load the repo root, and do **not** load the `extension` folder. Chrome needs the **built** pack.

### 1. Get the built pack

If you just cloned the repo, it already includes `extension/dist`. If you changed the TypeScript sources, rebuild:

```bash
git clone https://github.com/mohabbis/tab-sense.git
cd tab-sense
npm install
npm run build:extension
```

### 2. Load it unpacked

1. Open **chrome://extensions**
2. Turn on **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder only: **`tab-sense/extension/dist`**
5. Confirm you see `manifest.json`, `background.js`, and `popup.html` in that folder

If Chrome says it cannot find `background.js` or the manifest is missing, you selected the wrong folder.

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
| Could not load `background.js` | You picked `extension/` instead of `extension/dist` |
| Service worker failed to start | Rebuild with `npm run build:extension`, then click **Reload** on the extension card |
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
