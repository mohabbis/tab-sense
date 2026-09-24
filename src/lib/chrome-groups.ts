import type { GroupColor, Tab, TabGroup } from "@/lib/types";
import { isHttpUrl } from "@/lib/url";

export const CHROME_TITLE_MAX = 13;

export const CHROME_COLOR_BY_GROUP: Record<
  GroupColor,
  "grey" | "blue" | "red" | "yellow" | "green" | "pink" | "purple" | "cyan" | "orange"
> = {
  coral: "red",
  amber: "orange",
  teal: "cyan",
  violet: "purple",
  sky: "blue",
  lime: "green",
  rose: "pink",
  indigo: "blue",
  stone: "grey",
};

export type BrowserTabLike = {
  id?: number;
  url?: string;
  title?: string;
  pinned?: boolean;
  discarded?: boolean;
};

export function isGroupableTab(tab: BrowserTabLike): tab is BrowserTabLike & {
  id: number;
  url: string;
} {
  if (tab.id == null || tab.pinned || tab.discarded) return false;
  if (!tab.url) return false;
  const url = tab.url;
  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("devtools://")
  ) {
    return false;
  }
  return isHttpUrl(url);
}

export function toEngineTabs(tabs: BrowserTabLike[]): Tab[] {
  return tabs.filter(isGroupableTab).map((tab) => ({
    id: String(tab.id),
    url: tab.url,
    title: tab.title?.trim() || tab.url,
    pinned: tab.pinned,
  }));
}

export function groupsToApply(groups: TabGroup[]): TabGroup[] {
  return groups.filter((group) => group.kind !== "loose" && group.tabIds.length >= 2);
}

export function chromeGroupTitle(name: string): string {
  const parts = name.split("·").map((part) => part.trim()).filter(Boolean);
  const preferred = parts.at(-1) || name.trim();
  if (preferred.length <= CHROME_TITLE_MAX) return preferred;
  return preferred.slice(0, CHROME_TITLE_MAX);
}
