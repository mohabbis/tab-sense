/// <reference types="chrome" />
import {
  CHROME_COLOR_BY_GROUP,
  chromeGroupTitle,
  groupsToApply,
  isGroupableTab,
  toEngineTabs,
} from "@/lib/chrome-groups";
import { groupTabs } from "@/lib/grouping";
import type { GroupingMode } from "@/lib/types";

export type GroupPreview = {
  name: string;
  chromeTitle: string;
  color: string;
  kind: string;
  reason: string;
  tabCount: number;
  titles: string[];
};

export async function previewWindow(
  windowId: number,
  mode: GroupingMode,
): Promise<{ tabCount: number; groups: GroupPreview[]; skipped: number }> {
  const chromeTabs = await chrome.tabs.query({ windowId });
  const engineTabs = toEngineTabs(chromeTabs);
  const groups = groupsToApply(groupTabs(engineTabs, { mode })).map((group) => ({
    name: group.name,
    chromeTitle: chromeGroupTitle(group.name),
    color: group.color,
    kind: group.kind,
    reason: group.reason,
    tabCount: group.tabIds.length,
    titles: group.tabIds.map((id) => engineTabs.find((tab) => tab.id === id)?.title ?? id),
  }));
  return {
    tabCount: engineTabs.length,
    groups,
    skipped: chromeTabs.length - engineTabs.length,
  };
}

export async function groupWindow(
  windowId: number,
  mode: GroupingMode,
): Promise<{ groupCount: number; tabCount: number }> {
  const chromeTabs = await chrome.tabs.query({ windowId });
  const groupable = chromeTabs.filter(isGroupableTab);
  const engineTabs = toEngineTabs(groupable);
  const planned = groupsToApply(groupTabs(engineTabs, { mode }));
  const existing = await chrome.tabGroups.query({ windowId });
  const existingByTitle = new Map<string, chrome.tabGroups.TabGroup>();
  for (const group of existing) {
    if (group.title) existingByTitle.set(group.title, group);
  }

  const claimed = new Set<number>();

  for (const group of planned) {
    const tabIds = group.tabIds
      .map((id) => Number(id))
      .filter((id) => groupable.some((tab) => tab.id === id));
    if (tabIds.length < 2) continue;
    const title = chromeGroupTitle(group.name);
    const reuse = existingByTitle.get(title);
    try {
      if (reuse && !claimed.has(reuse.id)) {
        await chrome.tabs.group({ groupId: reuse.id, tabIds });
        await chrome.tabGroups.update(reuse.id, {
          title,
          color: CHROME_COLOR_BY_GROUP[group.color],
        });
        claimed.add(reuse.id);
      } else {
        const groupId = await chrome.tabs.group({
          tabIds,
          createProperties: { windowId },
        });
        await chrome.tabGroups.update(groupId, {
          title,
          color: CHROME_COLOR_BY_GROUP[group.color],
        });
        claimed.add(groupId);
      }
    } catch (error) {
      console.warn("Tab-Sense could not apply group", title, error);
    }
  }

  const desiredIds = new Set(planned.flatMap((group) => group.tabIds.map(Number)));
  const leftover = chromeTabs
    .filter(
      (tab) =>
        tab.id != null &&
        tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE &&
        !desiredIds.has(tab.id),
    )
    .map((tab) => tab.id!);

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

export async function ungroupWindow(windowId: number) {
  const tabs = await chrome.tabs.query({ windowId });
  const ids = tabs
    .filter((tab) => tab.id != null && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE)
    .map((tab) => tab.id!);
  if (ids.length > 0) {
    await chrome.tabs.ungroup(ids);
  }
  await chrome.action.setBadgeText({ text: "" });
}
