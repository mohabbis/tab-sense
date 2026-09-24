"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { groupTabs, nextGroupColor } from "@/lib/grouping";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
  writeSession,
} from "@/lib/session-store";
import { defaultSession } from "@/lib/storage";
import type { CustomGroup, GroupingMode, Tab } from "@/lib/types";
import { isHttpUrl, parseUrl, titleFromUrl } from "@/lib/url";

function uid(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useTabSession() {
  const state = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const setState = writeSession;

  const groups = useMemo(
    () =>
      groupTabs(state.tabs, {
        mode: state.mode,
        assignments: state.assignments,
        customGroups: state.customGroups,
      }),
    [state.tabs, state.mode, state.assignments, state.customGroups],
  );

  const tabById = useMemo(() => new Map(state.tabs.map((tab) => [tab.id, tab])), [state.tabs]);

  const dismissNotice = useCallback(() => setNotice(null), []);

  function flash(message: string) {
    setNotice(message);
  }

  function addTab(input: { url: string; title?: string }) {
    const parsed = parseUrl(input.url);
    if (!parsed || !isHttpUrl(parsed.href)) {
      return { ok: false as const, error: "Enter a full http(s) URL." };
    }
    if (state.tabs.some((tab) => tab.url === parsed.href)) {
      return { ok: false as const, error: "That tab is already in this session." };
    }
    const tab: Tab = {
      id: uid("tab"),
      url: parsed.href,
      title: input.title?.trim() || titleFromUrl(parsed.href),
    };
    setState((current) => ({ ...current, tabs: [tab, ...current.tabs] }));
    flash(`Added ${tab.title}`);
    return { ok: true as const };
  }

  function addMany(items: { url: string; title?: string }[]) {
    const existing = new Set(state.tabs.map((tab) => tab.url));
    const next: Tab[] = [];
    for (const item of items) {
      const parsed = parseUrl(item.url);
      if (!parsed || !isHttpUrl(parsed.href) || existing.has(parsed.href)) continue;
      existing.add(parsed.href);
      next.push({
        id: uid("tab"),
        url: parsed.href,
        title: item.title?.trim() || titleFromUrl(parsed.href),
      });
    }
    if (next.length === 0) {
      return { ok: false as const, error: "No new valid URLs to import." };
    }
    setState((current) => ({ ...current, tabs: [...next, ...current.tabs] }));
    flash(`Imported ${next.length} tab${next.length === 1 ? "" : "s"}`);
    return { ok: true as const, count: next.length };
  }

  function closeTab(tabId: string) {
    setState((current) => {
      const assignments = { ...current.assignments };
      delete assignments[tabId];
      return {
        ...current,
        tabs: current.tabs.filter((tab) => tab.id !== tabId),
        assignments,
      };
    });
  }

  function closeGroup(groupId: string) {
    const group = groups.find((item) => item.id === groupId);
    if (!group) return;
    const remove = new Set(group.tabIds);
    setState((current) => {
      const assignments = { ...current.assignments };
      for (const tabId of remove) delete assignments[tabId];
      return {
        ...current,
        tabs: current.tabs.filter((tab) => !remove.has(tab.id)),
        assignments,
        customGroups: current.customGroups.filter((item) => item.id !== groupId),
        focusedGroupId: current.focusedGroupId === groupId ? null : current.focusedGroupId,
        collapsed: current.collapsed.filter((id) => id !== groupId),
      };
    });
  }

  function moveTab(tabId: string, groupId: string) {
    setState((current) => ({
      ...current,
      assignments: { ...current.assignments, [tabId]: groupId },
    }));
  }

  function createGroup(name: string, tabId?: string): CustomGroup {
    const group: CustomGroup = {
      id: uid("group"),
      name: name.trim() || "Untitled group",
      color: nextGroupColor(state.customGroups.map((item) => item.color)),
    };
    setState((current) => ({
      ...current,
      customGroups: [...current.customGroups, group],
      assignments: tabId
        ? { ...current.assignments, [tabId]: group.id }
        : current.assignments,
    }));
    return group;
  }

  function renameGroup(groupId: string, name: string) {
    setState((current) => ({
      ...current,
      customGroups: current.customGroups.map((group) =>
        group.id === groupId ? { ...group, name } : group,
      ),
    }));
  }

  function setMode(mode: GroupingMode) {
    setState((current) => ({ ...current, mode, focusedGroupId: null }));
  }

  function toggleCollapsed(groupId: string) {
    setState((current) => ({
      ...current,
      collapsed: current.collapsed.includes(groupId)
        ? current.collapsed.filter((id) => id !== groupId)
        : [...current.collapsed, groupId],
    }));
  }

  function setFocusedGroup(groupId: string | null) {
    setState((current) => ({
      ...current,
      focusedGroupId: current.focusedGroupId === groupId ? null : groupId,
    }));
  }

  function restoreDemo() {
    setState(defaultSession());
    flash("Restored the sample session");
  }

  function clearSession() {
    setState({
      ...defaultSession(),
      tabs: [],
    });
  }

  function regroup() {
    setState((current) => ({
      ...current,
      assignments: Object.fromEntries(
        Object.entries(current.assignments).filter(([, groupId]) =>
          current.customGroups.some((group) => group.id === groupId),
        ),
      ),
      focusedGroupId: null,
    }));
    flash("Re-ran automatic grouping");
  }

  return {
    ready: true,
    state,
    groups,
    tabById,
    notice,
    dismissNotice,
    addTab,
    addMany,
    closeTab,
    closeGroup,
    moveTab,
    createGroup,
    renameGroup,
    setMode,
    toggleCollapsed,
    setFocusedGroup,
    restoreDemo,
    clearSession,
    regroup,
  };
}
