const MULTI_TLDS = new Set([
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
  "webflow.io",
]);

export function parseUrl(raw: string): URL | null {
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

export function hostnameOf(url: string): string {
  return parseUrl(url)?.hostname.replace(/^www\./, "") ?? "";
}

export function registrableDomain(host: string): string {
  const clean = host.replace(/^www\./, "").toLowerCase();
  const parts = clean.split(".").filter(Boolean);
  if (parts.length <= 2) return clean;
  const lastTwo = parts.slice(-2).join(".");
  const lastThree = parts.slice(-3).join(".");
  if (MULTI_TLDS.has(lastTwo)) return lastThree;
  return lastTwo;
}

export function humanizeSlug(slug: string): string {
  const cleaned = decodeURIComponent(slug)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return slug;
  return cleaned.replace(/\b([a-z])/g, (char) => char.toUpperCase());
}

export function titleFromUrl(url: string): string {
  const parsed = parseUrl(url);
  if (!parsed) return url;
  const parts = parsed.pathname.split("/").filter(Boolean);
  const last = parts.at(-1);
  if (last && !/^[0-9a-f]{20,}$/i.test(last)) {
    return humanizeSlug(last);
  }
  return parsed.hostname.replace(/^www\./, "");
}

export function isHttpUrl(url: string): boolean {
  const parsed = parseUrl(url);
  return Boolean(parsed && (parsed.protocol === "http:" || parsed.protocol === "https:"));
}
