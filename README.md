# Flock

A tab manager that automatically groups open tabs by **project** or **topic**.

Flock is a session board for the tabs you already have open. Add URLs one at a time or import a list. The grouping engine reads hosts, paths, and titles — GitHub repos, Linear workspaces, Vercel previews, Figma files, localhost, and overlapping topics — then stacks related tabs together.

It ships with a sample work session so you can see grouping immediately. Your session is stored in this browser only.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:43187](http://localhost:43187).

```bash
npm test    # grouping engine
npm run lint
npm run build
```

## What you can do

- Browse auto-grouped stacks from the sample session
- Switch grouping modes: Auto, Project, Topic, or Domain
- Add a tab or import URLs, markdown links, `Title | URL` lines, or a Chrome bookmarks HTML export
- Search across titles, URLs, and group names
- Focus, collapse, rename (custom), move, or close groups
- Restore the sample session or start empty

## Publish to GitHub

This project is ready to commit. Create a GitHub repository from the Cursor project view (**Create repo**), then push this branch. After the repo exists:

```bash
git remote -v
git push -u origin main
```

If you already have an empty GitHub repo, add it as `origin` and push `main`.
