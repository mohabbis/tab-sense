// src/lib/url.ts
var MULTI_TLDS = /* @__PURE__ */ new Set([
  "co.uk",
  "com.au",
  "co.jp",
  "com.br",
  "github.io",
  "vercel.app",
  "netlify.app",
  "pages.dev",
  "web.app",
  "herokuapp.com",
  "notion.site",
  "webflow.io"
]);
function parseUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
}
function registrableDomain(host) {
  const clean = host.replace(/^www\./, "").toLowerCase();
  const parts = clean.split(".").filter(Boolean);
  if (parts.length <= 2) return clean;
  const lastTwo = parts.slice(-2).join(".");
  const lastThree = parts.slice(-3).join(".");
  if (MULTI_TLDS.has(lastTwo)) return lastThree;
  return lastTwo;
}
function humanizeSlug(slug) {
  const cleaned = decodeURIComponent(slug).replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  if (!cleaned) return slug;
  return cleaned.replace(/\b([a-z])/g, (char) => char.toUpperCase());
}
function isHttpUrl(url) {
  const parsed = parseUrl(url);
  return Boolean(parsed && (parsed.protocol === "http:" || parsed.protocol === "https:"));
}

// src/lib/chrome-groups.ts
var CHROME_TITLE_MAX = 13;
var CHROME_COLOR_BY_GROUP = {
  coral: "red",
  amber: "orange",
  teal: "cyan",
  violet: "purple",
  sky: "blue",
  lime: "green",
  rose: "pink",
  indigo: "blue",
  stone: "grey"
};
function isGroupableTab(tab) {
  if (tab.id == null || tab.pinned || tab.discarded) return false;
  if (!tab.url) return false;
  const url = tab.url;
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("edge://") || url.startsWith("about:") || url.startsWith("devtools://")) {
    return false;
  }
  return isHttpUrl(url);
}
function toEngineTabs(tabs) {
  return tabs.filter(isGroupableTab).map((tab) => ({
    id: String(tab.id),
    url: tab.url,
    title: tab.title?.trim() || tab.url,
    pinned: tab.pinned
  }));
}
function groupsToApply(groups) {
  return groups.filter((group) => group.kind !== "loose" && group.tabIds.length >= 2);
}
function chromeGroupTitle(name) {
  const parts = name.split("\xB7").map((part) => part.trim()).filter(Boolean);
  const preferred = parts.at(-1) || name.trim();
  if (preferred.length <= CHROME_TITLE_MAX) return preferred;
  return preferred.slice(0, CHROME_TITLE_MAX);
}

// src/lib/grouping.ts
var STOP_WORDS = /* @__PURE__ */ new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "your",
  "our",
  "are",
  "was",
  "were",
  "you",
  "how",
  "what",
  "when",
  "why",
  "who",
  "new",
  "page",
  "home",
  "docs",
  "doc",
  "guide",
  "login",
  "sign",
  "into",
  "dash",
  "app",
  "www",
  "http",
  "https",
  "com",
  "org",
  "html",
  "index",
  "issue",
  "issues",
  "pull",
  "request",
  "requests",
  "github",
  "gitlab",
  "bitbucket",
  "figma",
  "linear",
  "notion",
  "vercel",
  "google",
  "stack",
  "overflow",
  "youtube",
  "watch",
  "inbox",
  "mail",
  "calendar",
  "preview",
  "localhost",
  "local",
  "article",
  "articles",
  "reference",
  "learn",
  "blog"
]);
var SHORT_KEEP = /* @__PURE__ */ new Set([
  "css",
  "js",
  "ts",
  "ui",
  "ux",
  "eu",
  "vat",
  "pr",
  "ci",
  "ai",
  "ml",
  "go",
  "k8s",
  "inp",
  "seo",
  "api"
]);
var GITHUB_RESERVED = /* @__PURE__ */ new Set([
  "settings",
  "notifications",
  "explore",
  "marketplace",
  "topics",
  "login",
  "organizations",
  "features",
  "about",
  "pricing",
  "enterprise",
  "security",
  "team",
  "pulls",
  "issues",
  "codespaces",
  "copilot",
  "sponsors",
  "collections",
  "events",
  "new",
  "stars",
  "search",
  "orgs"
]);
var GENERIC_DOMAINS = /* @__PURE__ */ new Set([
  "google.com",
  "youtube.com",
  "youtu.be",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "reddit.com",
  "medium.com",
  "news.ycombinator.com",
  "wikipedia.org",
  "stackoverflow.com",
  "stackexchange.com",
  "npmjs.com",
  "chatgpt.com",
  "openai.com",
  "claude.ai",
  "gemini.google.com"
]);
var TITLE_TOPICS = /* @__PURE__ */ new Set([
  "react",
  "vue",
  "angular",
  "nextjs",
  "css",
  "html",
  "performance",
  "kubernetes",
  "python",
  "rust",
  "golang"
]);
var HOST_TOPICS = {
  "react.dev": ["react"],
  "vuejs.org": ["vue"],
  "angular.dev": ["angular"],
  "nextjs.org": ["nextjs", "react"],
  "web.dev": ["performance", "web"],
  "developer.chrome.com": ["chrome", "performance"],
  "developer.mozilla.org": ["mdn"],
  "css-tricks.com": ["css"],
  "smashingmagazine.com": ["frontend"]
};
var LIFE_HOSTS = {
  "mail.google.com": "google",
  "calendar.google.com": "google",
  "drive.google.com": "google",
  "docs.google.com": "google",
  "meet.google.com": "google",
  "outlook.office.com": "microsoft",
  "outlook.live.com": "microsoft"
};
var COLORS = [
  "coral",
  "amber",
  "teal",
  "violet",
  "sky",
  "lime",
  "rose",
  "indigo"
];
var UnionFind = class {
  constructor() {
    this.parent = /* @__PURE__ */ new Map();
  }
  add(id) {
    if (!this.parent.has(id)) this.parent.set(id, id);
  }
  find(id) {
    this.add(id);
    const parent = this.parent.get(id);
    if (parent !== id) {
      const root = this.find(parent);
      this.parent.set(id, root);
      return root;
    }
    return id;
  }
  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(rb, ra);
  }
  clusters() {
    const buckets = /* @__PURE__ */ new Map();
    for (const id of this.parent.keys()) {
      const root = this.find(id);
      const list = buckets.get(root) ?? [];
      list.push(id);
      buckets.set(root, list);
    }
    return [...buckets.values()];
  }
};
function tokenize(value) {
  return value.toLowerCase().split(/[^a-z0-9]+/g).map((part) => part.trim()).filter((part) => {
    if (!part) return false;
    if (STOP_WORDS.has(part)) return false;
    if (part.length <= 2) return SHORT_KEEP.has(part);
    return part.length > 2;
  });
}
function looksLikeId(value) {
  return /^[0-9a-f]{20,}$/i.test(value) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f-]{16}$/i.test(value);
}
function extractSignals(tab) {
  const parsed = parseUrl(tab.url);
  const host = parsed?.hostname.replace(/^www\./, "").toLowerCase() ?? "";
  const registrable = host ? registrableDomain(host) : "";
  const pathParts = parsed ? parsed.pathname.split("/").filter(Boolean).map((part) => decodeURIComponent(part)) : [];
  const tokens = /* @__PURE__ */ new Set([
    ...tokenize(tab.title),
    ...pathParts.flatMap((part) => tokenize(part))
  ]);
  const keys = [];
  const topics = [...HOST_TOPICS[host] ?? HOST_TOPICS[registrable] ?? []];
  if (host === "github.com" || host === "gitlab.com" || host === "bitbucket.org") {
    const org = pathParts[0];
    const repo = pathParts[1];
    if (org && !GITHUB_RESERVED.has(org.toLowerCase())) {
      keys.push({ key: `org:${org.toLowerCase()}`, weight: 4, label: org });
      tokens.add(org.toLowerCase());
      if (repo && !GITHUB_RESERVED.has(repo.toLowerCase())) {
        const repoKey = `${org}/${repo}`.toLowerCase();
        keys.push({
          key: `repo:${repoKey}`,
          weight: 10,
          label: `${org}/${repo}`
        });
        for (const token of tokenize(repo)) tokens.add(token);
      }
    }
  }
  if (host === "linear.app" && pathParts[0]) {
    const workspace = pathParts[0].toLowerCase();
    keys.push({ key: `org:${workspace}`, weight: 4, label: pathParts[0] });
    tokens.add(workspace);
    const issue = pathParts.find((part) => /^[a-z]{2,6}-\d+/i.test(part));
    if (issue) {
      const prefix = issue.split("-")[0].toLowerCase();
      keys.push({ key: `ticket:${prefix}`, weight: 3, label: prefix.toUpperCase() });
      tokens.add(prefix);
    }
    const project = pathParts[1] === "project" ? pathParts[2] : void 0;
    if (project) {
      keys.push({
        key: `linear:${workspace}/${project.toLowerCase()}`,
        weight: 8,
        label: humanizeSlug(project)
      });
      for (const token of tokenize(project)) tokens.add(token);
    }
  }
  if (host === "vercel.com" && pathParts[0] && pathParts[1]) {
    const skip = /* @__PURE__ */ new Set(["docs", "login", "signup", "blog", "pricing", "dashboard"]);
    if (!skip.has(pathParts[0].toLowerCase())) {
      const team = pathParts[0];
      const project = pathParts[1];
      keys.push({ key: `org:${team.toLowerCase()}`, weight: 4, label: team });
      keys.push({
        key: `vercel:${team}/${project}`.toLowerCase(),
        weight: 8,
        label: `${team}/${project}`
      });
      for (const token of tokenize(project)) tokens.add(token);
    }
  }
  if (host.endsWith(".vercel.app") || host.endsWith(".netlify.app")) {
    const project = host.split(".")[0];
    keys.push({
      key: `preview:${project}`,
      weight: 7,
      label: humanizeSlug(project)
    });
    for (const token of tokenize(project)) tokens.add(token);
  }
  if (host === "figma.com" || host === "www.figma.com") {
    const name = pathParts[0] === "design" || pathParts[0] === "file" ? pathParts[2] : void 0;
    if (name && !looksLikeId(name)) {
      keys.push({
        key: `figma:${name.toLowerCase()}`,
        weight: 6,
        label: humanizeSlug(name)
      });
      for (const token of tokenize(name)) tokens.add(token);
    }
  }
  if (host === "notion.so" || host === "www.notion.so" || host.endsWith("notion.site")) {
    const workspace = pathParts[0];
    if (workspace && !looksLikeId(workspace)) {
      keys.push({
        key: `org:${workspace.toLowerCase()}`,
        weight: 4,
        label: workspace
      });
      tokens.add(workspace.toLowerCase());
    }
    for (const part of pathParts) {
      if (!looksLikeId(part)) {
        for (const token of tokenize(part)) tokens.add(token);
      }
    }
  }
  if (host === "localhost" || host === "127.0.0.1") {
    const port = parsed?.port || "80";
    keys.push({ key: `local:${port}`, weight: 7, label: `Local :${port}` });
    if (pathParts[0]) {
      keys.push({
        key: `localpath:${pathParts[0].toLowerCase()}`,
        weight: 6,
        label: pathParts[0]
      });
      for (const token of tokenize(pathParts[0])) tokens.add(token);
    }
  }
  const life = LIFE_HOSTS[host];
  if (life) {
    keys.push({ key: `life:${life}`, weight: 8, label: humanizeSlug(life) });
  }
  for (const token of tokens) {
    if (TITLE_TOPICS.has(token) && !topics.includes(token)) topics.push(token);
  }
  if (topics.length > 0) {
    for (const topic of topics) {
      keys.push({ key: `topic:${topic}`, weight: 5, label: humanizeSlug(topic) });
      tokens.add(topic);
    }
  }
  if (keys.length === 0 && registrable && !GENERIC_DOMAINS.has(registrable)) {
    keys.push({
      key: `domain:${registrable}`,
      weight: 5,
      label: registrable
    });
  }
  return { tabId: tab.id, host, registrable, tokens, keys, topics };
}
function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const token of a) {
    if (b.has(token)) inter += 1;
  }
  return inter / (a.size + b.size - inter);
}
function unionTokens(sets) {
  const result = /* @__PURE__ */ new Set();
  for (const set of sets) {
    for (const token of set) result.add(token);
  }
  return result;
}
var GENERIC_SLUGS = /* @__PURE__ */ new Set([
  "docs",
  "app",
  "web",
  "site",
  "api",
  "admin",
  "dashboard",
  "preview",
  "local",
  "cart",
  "www"
]);
function orgTokensOf(signals) {
  const orgs = /* @__PURE__ */ new Set();
  for (const signal of signals) {
    for (const key of signal.keys) {
      if (key.key.startsWith("org:")) {
        for (const token of tokenize(key.label)) orgs.add(token);
      }
    }
  }
  return orgs;
}
function contentTokens(tokens, orgs) {
  const result = /* @__PURE__ */ new Set();
  for (const token of tokens) {
    if (!orgs.has(token) && !GENERIC_SLUGS.has(token)) result.add(token);
  }
  return result;
}
function distinctiveSlugs(signals) {
  const orgs = orgTokensOf(signals);
  const slugs = /* @__PURE__ */ new Set();
  for (const signal of signals) {
    for (const key of signal.keys) {
      if (key.weight < 6) continue;
      for (const token of tokenize(key.label)) {
        if (!orgs.has(token) && !GENERIC_SLUGS.has(token)) slugs.add(token);
      }
    }
  }
  return slugs;
}
function sharesSlug(a, b) {
  const slugsA = distinctiveSlugs(a);
  const slugsB = distinctiveSlugs(b);
  for (const slug of slugsA) {
    if (slugsB.has(slug)) return true;
  }
  return false;
}
function colorFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = hash * 31 + id.charCodeAt(i) >>> 0;
  }
  return COLORS[hash % COLORS.length];
}
function strongestKey(signals) {
  return signals.flatMap((signal) => signal.keys).sort((a, b) => b.weight - a.weight)[0];
}
function nameFromSignals(signals, kind) {
  if (kind === "topic") {
    const topics = [...new Set(signals.flatMap((signal) => signal.topics))];
    const preferred = topics.find((topic) => topic !== "mdn" && topic !== "web") ?? topics[0];
    if (preferred) return humanizeSlug(preferred);
  }
  const strong = strongestKey(signals);
  if (strong && strong.weight >= 6) {
    if (strong.key.startsWith("repo:")) {
      const [org, repo] = strong.label.split("/");
      return repo ? `${humanizeSlug(org)} \xB7 ${humanizeSlug(repo)}` : humanizeSlug(strong.label);
    }
    if (strong.key.startsWith("vercel:")) {
      const [team, project] = strong.label.split("/");
      return project ? `${humanizeSlug(team)} \xB7 ${humanizeSlug(project)}` : humanizeSlug(strong.label);
    }
    return humanizeSlug(strong.label);
  }
  const counts = /* @__PURE__ */ new Map();
  for (const signal of signals) {
    for (const token of signal.tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  const ranked = [...counts.entries()].filter(([token]) => token.length > 3).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (ranked[0] && ranked[0][1] >= Math.max(2, Math.ceil(signals.length * 0.5))) {
    return humanizeSlug(ranked[0][0]);
  }
  if (kind === "tool" && strong) return humanizeSlug(strong.label);
  if (signals[0]?.registrable) return signals[0].registrable;
  return "Loose tabs";
}
function reasonFor(kind, signals) {
  const strong = strongestKey(signals);
  if (kind === "project" && strong?.key.startsWith("repo:")) {
    return `Same repository (${strong.label}) and related project tools`;
  }
  if (kind === "project") {
    return "Shared project name, org, or preview URL";
  }
  if (kind === "topic") {
    const topics = [...new Set(signals.flatMap((signal) => signal.topics))];
    if (topics.length) return `Topic cluster: ${topics.map(humanizeSlug).join(", ")}`;
    return "Overlapping titles and documentation topics";
  }
  if (kind === "tool") return "Same personal or workspace tools";
  if (strong?.key.startsWith("domain:")) return `Same site (${strong.label})`;
  return "Did not match a shared project or topic";
}
function kindFor(signals, mode) {
  const strong = strongestKey(signals);
  if (strong?.key.startsWith("life:")) return "tool";
  if (strong && strong.weight >= 7) return "project";
  if (signals.some((signal) => signal.topics.length > 0) || mode === "topic") {
    return "topic";
  }
  if (mode === "domain") return "project";
  return "project";
}
function sortGroups(groups) {
  const rank = {
    project: 0,
    topic: 1,
    tool: 2,
    loose: 3
  };
  return [...groups].sort((a, b) => {
    if (rank[a.kind] !== rank[b.kind]) return rank[a.kind] - rank[b.kind];
    return b.tabIds.length - a.tabIds.length || a.name.localeCompare(b.name);
  });
}
function groupTabs(tabs, options = {}) {
  const mode = options.mode ?? "auto";
  const assignments = options.assignments ?? {};
  const customGroups = options.customGroups ?? [];
  const tabById = new Map(tabs.map((tab) => [tab.id, tab]));
  const signals = new Map(tabs.map((tab) => [tab.id, extractSignals(tab)]));
  const groups = /* @__PURE__ */ new Map();
  const placed = /* @__PURE__ */ new Set();
  function ensureGroup(group) {
    if (!groups.has(group.id)) groups.set(group.id, { ...group, tabIds: [...group.tabIds] });
    return groups.get(group.id);
  }
  for (const custom of customGroups) {
    ensureGroup({
      id: custom.id,
      name: custom.name,
      color: custom.color,
      kind: "project",
      reason: "Pinned by you",
      tabIds: []
    });
  }
  for (const tab of tabs) {
    const groupId = assignments[tab.id];
    if (!groupId) continue;
    const existing = groups.get(groupId) ?? ensureGroup({
      id: groupId,
      name: humanizeSlug(groupId.replace(/^auto:/, "")),
      color: colorFor(groupId),
      kind: "project",
      reason: "Pinned by you",
      tabIds: []
    });
    existing.tabIds.push(tab.id);
    placed.add(tab.id);
  }
  const free = tabs.filter((tab) => !placed.has(tab.id));
  const uf = new UnionFind();
  for (const tab of free) uf.add(tab.id);
  const keyIndex = /* @__PURE__ */ new Map();
  for (const tab of free) {
    const signal = signals.get(tab.id);
    for (const key of signal.keys) {
      const entry = keyIndex.get(key.key) ?? { weight: key.weight, tabIds: [] };
      entry.weight = Math.max(entry.weight, key.weight);
      entry.tabIds.push(tab.id);
      keyIndex.set(key.key, entry);
    }
  }
  const shouldUseProjects = mode === "auto" || mode === "project";
  const shouldUseTopics = mode === "auto" || mode === "topic";
  const shouldUseDomains = mode === "auto" || mode === "domain";
  if (shouldUseProjects) {
    for (const entry of keyIndex.values()) {
      if (entry.weight >= 7 && entry.tabIds.length >= 1) {
        for (const id of entry.tabIds) uf.union(entry.tabIds[0], id);
      }
    }
    const clusters = uf.clusters();
    for (let i = 0; i < clusters.length; i += 1) {
      for (let j = i + 1; j < clusters.length; j += 1) {
        const a = clusters[i].map((id) => signals.get(id));
        const b = clusters[j].map((id) => signals.get(id));
        if (sharesSlug(a, b)) {
          uf.union(clusters[i][0], clusters[j][0]);
        }
      }
    }
  }
  if (mode === "domain") {
    const byDomain = /* @__PURE__ */ new Map();
    for (const tab of free) {
      const domain = signals.get(tab.id)?.registrable;
      if (!domain) continue;
      const list = byDomain.get(domain) ?? [];
      list.push(tab.id);
      byDomain.set(domain, list);
    }
    for (const ids of byDomain.values()) {
      for (const id of ids) uf.union(ids[0], id);
    }
  }
  if (mode === "topic") {
    for (const entry of keyIndex.values()) {
      if (entry.weight >= 5 && entry.tabIds.length >= 2) {
        for (const id of entry.tabIds) uf.union(entry.tabIds[0], id);
      }
    }
  }
  const takeCluster = (ids, kind, prefix) => {
    const clusterSignals = ids.map((id2) => signals.get(id2));
    const strong = strongestKey(clusterSignals);
    const id = `auto:${prefix}:${strong?.key ?? ids.slice().sort().join(",")}`;
    const name = nameFromSignals(clusterSignals, kind);
    ensureGroup({
      id,
      name,
      color: kind === "loose" ? "stone" : colorFor(id),
      kind,
      reason: reasonFor(kind, clusterSignals),
      tabIds: [...ids]
    });
    for (const tabId of ids) placed.add(tabId);
  };
  const projectClusters = [];
  const leftovers = [];
  if (shouldUseProjects || mode === "domain") {
    for (const cluster of uf.clusters()) {
      const clusterSignals = cluster.map((id) => signals.get(id));
      const strong = strongestKey(clusterSignals);
      const isProject = mode === "domain" ? cluster.length >= 1 : Boolean(strong && strong.weight >= 7);
      if (isProject) {
        projectClusters.push(cluster);
      } else {
        leftovers.push(...cluster);
      }
    }
    for (const cluster of projectClusters) {
      takeCluster(cluster, kindFor(cluster.map((id) => signals.get(id)), mode), "project");
    }
  } else {
    leftovers.push(...free.map((tab) => tab.id));
  }
  const attachable = [...groups.values()].filter(
    (group) => group.tabIds.length > 0 && group.reason !== "Pinned by you"
  );
  const stillLoose = [];
  for (const tabId of leftovers) {
    if (placed.has(tabId)) continue;
    const signal = signals.get(tabId);
    let bestId = null;
    let bestScore = 0;
    for (const group of attachable) {
      const groupSignals = group.tabIds.map((id) => signals.get(id));
      const orgs = /* @__PURE__ */ new Set([...orgTokensOf([signal]), ...orgTokensOf(groupSignals)]);
      const groupTokens = contentTokens(
        unionTokens(groupSignals.map((item) => item.tokens)),
        orgs
      );
      const tabTokens = contentTokens(signal.tokens, orgs);
      const orgMatch = signal.keys.some(
        (key) => groupSignals.some((item) => item.keys.some((other) => other.key === key.key && key.key.startsWith("org:")))
      );
      const score = jaccard(tabTokens, groupTokens);
      const slugHit = [...distinctiveSlugs(groupSignals)].some((slug) => tabTokens.has(slug));
      const qualifies = slugHit || score >= (mode === "project" ? 0.28 : 0.18) || orgMatch && score >= 0.12;
      if (qualifies && (slugHit ? score + 1 : score) > bestScore) {
        bestScore = slugHit ? score + 1 : score;
        bestId = group.id;
      }
    }
    if (bestId && bestScore > 0) {
      groups.get(bestId).tabIds.push(tabId);
      placed.add(tabId);
    } else {
      stillLoose.push(tabId);
    }
  }
  if (shouldUseTopics) {
    const topicUf = new UnionFind();
    for (const id of stillLoose) topicUf.add(id);
    for (let i = 0; i < stillLoose.length; i += 1) {
      for (let j = i + 1; j < stillLoose.length; j += 1) {
        const a = signals.get(stillLoose[i]);
        const b = signals.get(stillLoose[j]);
        const sharedTopic = a.topics.some((topic) => b.topics.includes(topic));
        const score = jaccard(a.tokens, b.tokens);
        if (sharedTopic || score >= 0.22) {
          topicUf.union(a.tabId, b.tabId);
        }
      }
    }
    const nextLoose = [];
    for (const cluster of topicUf.clusters()) {
      const clusterSignals = cluster.map((id) => signals.get(id));
      const hasTopic = clusterSignals.some((signal) => signal.topics.length > 0);
      if (cluster.length >= 2 || hasTopic) {
        takeCluster(cluster, "topic", "topic");
      } else {
        nextLoose.push(...cluster);
      }
    }
    stillLoose.length = 0;
    stillLoose.push(...nextLoose);
  }
  if (shouldUseDomains && mode !== "domain") {
    const byDomain = /* @__PURE__ */ new Map();
    for (const id of stillLoose) {
      const domain = signals.get(id)?.registrable;
      if (!domain || GENERIC_DOMAINS.has(domain)) continue;
      const list = byDomain.get(domain) ?? [];
      list.push(id);
      byDomain.set(domain, list);
    }
    const consumed = /* @__PURE__ */ new Set();
    for (const [domain, ids] of byDomain) {
      if (ids.length < 2) continue;
      takeCluster(ids, "project", `domain:${domain}`);
      for (const id of ids) consumed.add(id);
    }
    const remaining = stillLoose.filter((id) => !consumed.has(id) && !placed.has(id));
    stillLoose.length = 0;
    stillLoose.push(...remaining);
  }
  if (stillLoose.length > 0) {
    ensureGroup({
      id: "auto:loose",
      name: "Loose tabs",
      color: "stone",
      kind: "loose",
      reason: "No shared project, topic, or site",
      tabIds: stillLoose.filter((id) => !placed.has(id))
    });
  }
  const result = [...groups.values()].map((group) => ({
    ...group,
    tabIds: group.tabIds.filter((id) => tabById.has(id))
  })).filter((group) => group.tabIds.length > 0 || customGroups.some((custom) => custom.id === group.id)).map((group) => ({
    ...group,
    tabIds: [...group.tabIds].sort((a, b) => {
      const tabA = tabById.get(a);
      const tabB = tabById.get(b);
      if (Boolean(tabA.pinned) !== Boolean(tabB.pinned)) {
        return tabA.pinned ? -1 : 1;
      }
      return tabA.title.localeCompare(tabB.title);
    })
  }));
  return sortGroups(result);
}

// extension/src/apply-groups.ts
async function previewWindow(windowId, mode) {
  const chromeTabs = await chrome.tabs.query({ windowId });
  const engineTabs = toEngineTabs(chromeTabs);
  const groups = groupsToApply(groupTabs(engineTabs, { mode })).map((group) => ({
    name: group.name,
    chromeTitle: chromeGroupTitle(group.name),
    color: group.color,
    kind: group.kind,
    reason: group.reason,
    tabCount: group.tabIds.length,
    titles: group.tabIds.map((id) => engineTabs.find((tab) => tab.id === id)?.title ?? id)
  }));
  return {
    tabCount: engineTabs.length,
    groups,
    skipped: chromeTabs.length - engineTabs.length
  };
}
async function groupWindow(windowId, mode) {
  const chromeTabs = await chrome.tabs.query({ windowId });
  const groupable = chromeTabs.filter(isGroupableTab);
  const engineTabs = toEngineTabs(groupable);
  const planned = groupsToApply(groupTabs(engineTabs, { mode }));
  const existing = await chrome.tabGroups.query({ windowId });
  const existingByTitle = /* @__PURE__ */ new Map();
  for (const group of existing) {
    if (group.title) existingByTitle.set(group.title, group);
  }
  const claimed = /* @__PURE__ */ new Set();
  for (const group of planned) {
    const tabIds = group.tabIds.map((id) => Number(id)).filter((id) => groupable.some((tab) => tab.id === id));
    if (tabIds.length < 2) continue;
    const title = chromeGroupTitle(group.name);
    const reuse = existingByTitle.get(title);
    try {
      if (reuse && !claimed.has(reuse.id)) {
        await chrome.tabs.group({ groupId: reuse.id, tabIds });
        await chrome.tabGroups.update(reuse.id, {
          title,
          color: CHROME_COLOR_BY_GROUP[group.color]
        });
        claimed.add(reuse.id);
      } else {
        const groupId = await chrome.tabs.group({
          tabIds,
          createProperties: { windowId }
        });
        await chrome.tabGroups.update(groupId, {
          title,
          color: CHROME_COLOR_BY_GROUP[group.color]
        });
        claimed.add(groupId);
      }
    } catch (error) {
      console.warn("Tab-Sense could not apply group", title, error);
    }
  }
  const desiredIds = new Set(planned.flatMap((group) => group.tabIds.map(Number)));
  const leftover = chromeTabs.filter(
    (tab) => tab.id != null && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE && !desiredIds.has(tab.id)
  ).map((tab) => tab.id);
  if (leftover.length > 0) {
    try {
      await chrome.tabs.ungroup(leftover);
    } catch (error) {
      console.warn("Tab-Sense could not ungroup leftovers", error);
    }
  }
  const badge = planned.length > 0 ? String(planned.length) : "";
  await chrome.action.setBadgeBackgroundColor({ color: "#3A2F1C" });
  await chrome.action.setBadgeText({ text: badge });
  return { groupCount: planned.length, tabCount: engineTabs.length };
}
async function ungroupWindow(windowId) {
  const tabs = await chrome.tabs.query({ windowId });
  const ids = tabs.filter((tab) => tab.id != null && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE).map((tab) => tab.id);
  if (ids.length > 0) {
    await chrome.tabs.ungroup(ids);
  }
  await chrome.action.setBadgeText({ text: "" });
}

// extension/src/settings.ts
var DEFAULTS = {
  autoGroup: true,
  mode: "auto"
};
async function getSettings() {
  const stored = await chrome.storage.local.get(["autoGroup", "mode"]);
  return {
    autoGroup: typeof stored.autoGroup === "boolean" ? stored.autoGroup : DEFAULTS.autoGroup,
    mode: stored.mode === "auto" || stored.mode === "project" || stored.mode === "topic" || stored.mode === "domain" ? stored.mode : DEFAULTS.mode
  };
}

// extension/src/background.ts
var debounce = /* @__PURE__ */ new Map();
var applying = false;
async function focusedWindowId() {
  const focused = await chrome.windows.getLastFocused({ populate: false });
  if (focused.id == null || focused.id === chrome.windows.WINDOW_ID_NONE) return void 0;
  return focused.id;
}
async function applyToWindow(windowId, force = false) {
  const settings = await getSettings();
  if (!force && !settings.autoGroup) return;
  if (applying) return;
  applying = true;
  try {
    await groupWindow(windowId, settings.mode);
  } catch (error) {
    console.warn("Tab-Sense grouping failed", error);
  } finally {
    applying = false;
  }
}
function schedule(windowId, force = false) {
  if (windowId == null || windowId === chrome.windows.WINDOW_ID_NONE) return;
  const prior = debounce.get(windowId);
  if (prior) clearTimeout(prior);
  debounce.set(
    windowId,
    setTimeout(() => {
      debounce.delete(windowId);
      void applyToWindow(windowId, force);
    }, 400)
  );
}
chrome.runtime.onInstalled.addListener(() => {
  void focusedWindowId().then((id) => schedule(id, true));
});
chrome.runtime.onStartup.addListener(() => {
  void focusedWindowId().then((id) => schedule(id, true));
});
chrome.tabs.onCreated.addListener((tab) => {
  if (!applying) schedule(tab.windowId);
});
chrome.tabs.onRemoved.addListener((_tabId, info) => {
  if (!applying && !info.isWindowClosing) schedule(info.windowId);
});
chrome.tabs.onAttached.addListener((_tabId, info) => {
  if (!applying) schedule(info.newWindowId);
});
chrome.tabs.onUpdated.addListener((_tabId, change, tab) => {
  if (applying) return;
  if (change.url || change.title || change.status === "complete") {
    schedule(tab.windowId);
  }
});
chrome.commands.onCommand.addListener(async (command) => {
  const windowId = await focusedWindowId();
  if (windowId == null) return;
  if (command === "group-now") {
    await applyToWindow(windowId, true);
  }
  if (command === "ungroup-now") {
    applying = true;
    try {
      await ungroupWindow(windowId);
    } finally {
      applying = false;
    }
  }
});
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const run = async () => {
    const windowId = (await chrome.windows.getCurrent()).id;
    if (windowId == null) throw new Error("No current window");
    if (message?.type === "GROUP_NOW") {
      const settings = await getSettings();
      return groupWindow(windowId, settings.mode);
    }
    if (message?.type === "UNGROUP_NOW") {
      await ungroupWindow(windowId);
      return { ok: true };
    }
    if (message?.type === "PREVIEW") {
      const settings = await getSettings();
      return previewWindow(windowId, settings.mode);
    }
    return { error: "unknown" };
  };
  void run().then(sendResponse).catch((error) => {
    sendResponse({ error: error instanceof Error ? error.message : "failed" });
  });
  return true;
});
//# sourceMappingURL=background.js.map
