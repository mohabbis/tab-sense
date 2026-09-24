import type { ParsedImport } from "@/lib/types";
import { isHttpUrl, parseUrl, titleFromUrl } from "@/lib/url";

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function uniqueImports(items: ParsedImport[]): ParsedImport[] {
  const seen = new Set<string>();
  const result: ParsedImport[] = [];
  for (const item of items) {
    const parsed = parseUrl(item.url);
    if (!parsed || !isHttpUrl(parsed.href)) continue;
    const key = parsed.href;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      url: parsed.href,
      title: item.title.trim() || titleFromUrl(parsed.href),
    });
  }
  return result;
}

export function parseImportedTabs(text: string): ParsedImport[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (/<a\s+[^>]*href=/i.test(trimmed)) {
    const found: ParsedImport[] = [];
    const bookmarkRe = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let match: RegExpExecArray | null;
    while ((match = bookmarkRe.exec(trimmed))) {
      found.push({
        url: match[1],
        title: decodeEntities(match[2].replace(/<[^>]+>/g, "")),
      });
    }
    return uniqueImports(found);
  }

  const lines = trimmed.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const found: ParsedImport[] = [];

  for (const line of lines) {
    const markdown = line.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/i);
    if (markdown) {
      found.push({ url: markdown[2], title: markdown[1] });
      continue;
    }

    const labeled = line.match(/^(.*?)(?:\s+\|\s+|\s+[—–]\s+)(https?:\/\/\S+)$/i);
    if (labeled && labeled[1] && !/^https?:/i.test(labeled[1])) {
      found.push({ url: labeled[2], title: labeled[1].trim() });
      continue;
    }

    const embedded = line.match(/https?:\/\/[^\s<>"']+/i);
    if (embedded) {
      found.push({ url: embedded[0], title: "" });
    }
  }

  return uniqueImports(found);
}
