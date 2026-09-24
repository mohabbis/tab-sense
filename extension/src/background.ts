/// <reference types="chrome" />
import { groupWindow, previewWindow, ungroupWindow } from "./apply-groups";
import { getSettings } from "./settings";

const debounce = new Map<number, ReturnType<typeof setTimeout>>();
let applying = false;

async function focusedWindowId(): Promise<number | undefined> {
  const focused = await chrome.windows.getLastFocused({ populate: false });
  if (focused.id == null || focused.id === chrome.windows.WINDOW_ID_NONE) return undefined;
  return focused.id;
}

async function applyToWindow(windowId: number, force = false) {
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

function schedule(windowId?: number, force = false) {
  if (windowId == null || windowId === chrome.windows.WINDOW_ID_NONE) return;
  const prior = debounce.get(windowId);
  if (prior) clearTimeout(prior);
  debounce.set(
    windowId,
    setTimeout(() => {
      debounce.delete(windowId);
      void applyToWindow(windowId, force);
    }, 400),
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

  void run()
    .then(sendResponse)
    .catch((error: unknown) => {
      sendResponse({ error: error instanceof Error ? error.message : "failed" });
    });
  return true;
});
