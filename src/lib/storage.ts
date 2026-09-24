import type { SessionState } from "@/lib/types";
import { cloneDemoTabs } from "@/lib/demo-session";

export const STORAGE_KEY = "tab-sense.session.v1";

export function defaultSession(): SessionState {
  return {
    version: 1,
    tabs: cloneDemoTabs(),
    mode: "auto",
    assignments: {},
    customGroups: [],
    collapsed: [],
    focusedGroupId: null,
  };
}

export function loadSession(): SessionState {
  if (typeof window === "undefined") return defaultSession();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSession();
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    if (parsed.version !== 1 || !Array.isArray(parsed.tabs)) {
      return defaultSession();
    }
    return {
      ...defaultSession(),
      ...parsed,
      version: 1,
      tabs: parsed.tabs,
      mode: parsed.mode ?? "auto",
      assignments: parsed.assignments ?? {},
      customGroups: parsed.customGroups ?? [],
      collapsed: parsed.collapsed ?? [],
      focusedGroupId: parsed.focusedGroupId ?? null,
    };
  } catch {
    return defaultSession();
  }
}

export function saveSession(state: SessionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
