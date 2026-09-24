# Tab-Sense

A Chrome extension that automatically groups the tabs that are **actually open right now** by project or topic.

Tab-Sense reads each tab’s URL and title — GitHub repos, Linear workspaces, Vercel previews, Figma files, localhost, and overlapping topics — then creates native Chrome tab groups in the current window.

## Install (unpacked)

```bash
git clone https://github.com/mohabbis/tab-sense.git
cd tab-sense
npm install
npm run build:extension
```

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/dist` folder

Auto-group is on by default. Open a few related tabs (for example two GitHub pages from the same repo plus Linear) and they stack themselves. Click the toolbar icon to change mode, group once, or ungroup.

Keyboard shortcut: `Alt+Shift+G` groups the current window.

## What it does

- Watches the current Chrome window as tabs open, navigate, and close
- Groups **http(s)** tabs with 2+ related pages
- Leaves pinned tabs, new-tab pages, and `chrome://` URLs alone
- Reuses an existing group when the short title still matches
- Badge shows how many groups Tab-Sense applied

Modes: **Auto** (project, then topic), **Project**, **Topic**, **Domain**.

## Engine playground

The Next.js page is only a playground for the grouping engine. It cannot see Chrome’s real tab list.

```bash
npm run dev
```

Open [http://localhost:43187](http://localhost:43187).

```bash
npm test
npm run lint
```

## Repository

https://github.com/mohabbis/tab-sense
